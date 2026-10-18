(function (window, document, $) {
    "use strict";

    const page = document.querySelector("[data-curvas-catalogo-page]");
    if (!page) {
        return;
    }

    const state = {
        modal: null,
        consultaModal: null,
        selectedProduct: null,
        variantRows: [],
        originalForm: null,
        editingId: null,
        saving: false,
        productSearchSequence: 0,
        variantLoadSequence: 0
    };

    const columns = [
        actionColumn(),
        { key: "codigo", title: "Código" },
        {
            key: "nombre",
            title: "Nombre",
            render: function (value, row) {
                return "<div class='ps-catalog-title'><strong>" + escapeHtml(value || "") + "</strong><small>" + pluralize(Number(row.productosAsignados || 0), "producto", "productos") + " · " + pluralize(Number(row.sucursalesSembradas || 0), "sucursal", "sucursales") + "</small></div>";
            }
        },
        {
            key: "productosAsignados",
            title: "Productos relacionados",
            render: function (value, row) {
                const count = Number(value || 0);
                const extra = Math.max(count - 1, 0);
                return "<div class='curvas-grid-summary'><strong>" + escapeHtml(row.productoResumen || "Sin productos") + "</strong>" + (extra ? "<small>+" + extra + " producto(s)</small>" : "") + "</div>";
            }
        },
        {
            key: "renglones",
            title: "Identidades",
            render: function (value, row) {
                const parts = [];
                if (Number(row.variantesConfiguradas || 0)) parts.push(pluralize(Number(row.variantesConfiguradas), "variante", "variantes"));
                if (Number(row.productosBaseConfigurados || 0)) parts.push(pluralize(Number(row.productosBaseConfigurados), "producto base", "productos base"));
                return "<div class='curvas-grid-metric'><strong>" + Number(value || 0) + "</strong><small>" + escapeHtml(parts.join(" · ") || "Sin identidades") + "</small></div>";
            }
        },
        {
            key: "piezasObjetivo",
            title: "Cantidad objetivo",
            render: function (value) { return formatDecimal(value); }
        },
        {
            key: "sucursalesSembradas",
            title: "Sucursales sembradas",
            render: function (value) { return "<span class='curvas-grid-number'>" + Number(value || 0) + "</span>"; }
        },
        statusColumn(),
        updatedColumn()
    ];

    document.addEventListener("DOMContentLoaded", function () {
        state.modal = resolveModal("#modalCurva");
        state.consultaModal = resolveModal("#modalCurvaConsulta");
        buildHead();
        initAccordion();
        initGrid();
        bindEvents();
        CheckAppUI.reloadGrid("curvas-catalogo-grid");
    });

    function initAccordion() {
        CheckAppUI.createFilterAccordion({
            id: "curvas-filtros",
            selector: "#accordionFiltrosCurvas",
            open: true,
            emptySummaryText: "Estatus: Activos"
        });
    }

    function initGrid() {
        CheckAppUI.createDynamicGrid({
            id: "curvas-catalogo-grid",
            hostSelector: "#gridCurvasHost",
            tableSelector: "#grCurvasCatalogo",
            searchInputSelector: "#txBusquedaGridCurvas",
            exportButtonSelector: "#btExportarCurvas",
            columnToggleButtonSelector: "#btColumnasCurvas",
            columnTogglePanelSelector: "#panelColumnasCurvas",
            resultCountSelector: "#txGridCurvasCount",
            footerRangeSelector: "#txGridCurvasRange",
            footerPageIndicatorSelector: "#txGridCurvasPageIndicator",
            footerPrevButtonSelector: "#btGridCurvasPrev",
            footerNextButtonSelector: "#btGridCurvasNext",
            footerPageSizeSelector: "#txGridCurvasPageSize",
            pageLength: 25,
            lengthMenu: [[25, 50, 100], [25, 50, 100]],
            order: [[1, "asc"]],
            exportSheetName: "CatalogoCurvas",
            exportFileName: function () { return "CatalogoCurvas_" + formatDateForFile(new Date()) + ".xlsx"; },
            loadData: function () {
                const query = buildFiltersQuery();
                return Promise.all([
                    fetchJson("/Proveeduria/Curvas/Listar?" + query, { cache: "no-store" }),
                    fetchJson("/Proveeduria/Curvas/Resumen?" + query, { cache: "no-store" })
                ]).then(function (result) {
                    renderKpis(result[1] || {});
                    return result[0] || [];
                });
            },
            columns: columns,
            onLoaded: function (rows) {
                $("#txCurvasVisibleCount").text((rows || []).length + " visibles");
            },
            emptyText: "No hay curvas para los filtros aplicados."
        });
    }

    function bindEvents() {
        $("#btBuscarCurvas").on("click", function () {
            updateSummary();
            CheckAppUI.reloadGrid("curvas-catalogo-grid");
        });
        $("#btLimpiarCurvas").on("click", function () {
            $("#txBusquedaCurvas").val("");
            $("#cbFiltroEstatusCurvas").val("activos");
            updateSummary();
            CheckAppUI.reloadGrid("curvas-catalogo-grid");
        });
        $("#txBusquedaCurvas").on("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                $("#btBuscarCurvas").trigger("click");
            }
        });
        $("#btNuevaCurva").on("click", openCreate);
        $("#btGuardarCurva").on("click", save);
        $("#btAplicarCantidadTodasCurva").on("click", applyQuantityToIncluded);
        $("#txBuscarProductoCurva").on("input", debounce(searchProducts, 250));
        $("#tbObjetivosCurva").on("change", ".curvas-include-input", updateVariantFromDom);
        $("#tbObjetivosCurva").on("input", ".curvas-quantity-input", updateVariantFromDom);
        $("#tbObjetivosCurva").on("click", ".curvas-qty-step", stepVariantQuantity);
        $("#ckCurvaActiva").on("change", renderActiveSwitch);
        $("#bdCurvaConsulta").on("input", ".curvas-assignment-search", filterAssignments);
        $("#modalCurva").on("hidden.bs.modal", resetForm);
    }

    function buildHead() {
        $("#trCurvasHead").html(columns.map(function (column) {
            return "<th>" + escapeHtml(column.title || "") + "</th>";
        }).join(""));
    }

    function actionColumn() {
        return {
            key: "acciones",
            title: "Acciones",
            sortable: false,
            hideable: false,
            exportable: false,
            render: function (_value, row) {
                const eliminated = readProp(row, "eliminada", "Eliminada") === true;
                const id = escapeJs(readProp(row, "id", "Id"));
                const actions = [
                    actionLink("Ver variantes y presentaciones", "fa fa-list-alt", "curvasCatalogoIdentidades('" + id + "')"),
                    actionLink("Productos asignados", "fa fa-cubes", "curvasCatalogoProductos('" + id + "')")
                ];
                if (!eliminated) {
                    actions.unshift(actionLink("Editar", "fa fa-edit", "curvasCatalogoEditar('" + id + "')"));
                    actions.push(readProp(row, "activo", "Activo")
                        ? actionLink("Desactivar", "fa fa-toggle-on", "curvasCatalogoEstatus('" + id + "', false)", "is-warning")
                        : actionLink("Reactivar", "fa fa-toggle-off", "curvasCatalogoEstatus('" + id + "', true)", "is-success"));
                    actions.push(actionLink("Eliminar", "fa fa-trash", "curvasCatalogoEliminar('" + id + "')", "is-danger"));
                }
                return "<div class='ps-catalog-actions'>" + actions.join("") + "</div>";
            }
        };
    }

    function statusColumn() {
        return {
            key: "activo",
            title: "Estatus",
            exportValue: function (value, row) { return readProp(row, "eliminada", "Eliminada") ? "Eliminada" : (value ? "Activo" : "Inactiva"); },
            render: function (value, row) {
                if (readProp(row, "eliminada", "Eliminada")) {
                    return "<span class='checkapp-badge checkapp-badge-danger'>Eliminada</span>";
                }
                return value
                    ? "<span class='checkapp-badge checkapp-badge-success'>Activo</span>"
                    : "<span class='checkapp-badge checkapp-badge-muted'>Inactiva</span>";
            }
        };
    }

    function updatedColumn() {
        return {
            key: "fechaActualizacion",
            title: "Actualización",
            exportValue: formatDisplayDate,
            render: formatDisplayDate
        };
    }

    window.curvasCatalogoEditar = function (id) {
        state.editingId = id || null;
        $("#hdCurvaId").val(id || "");
        fetchJson("/Proveeduria/Curvas/Detalle?id=" + encodeURIComponent(id), { cache: "no-store" })
            .then(function (data) {
                resetForm();
                state.editingId = readProp(data, "id", "Id") || id || null;
                $("#hdCurvaId").val(state.editingId || "");
                $("#txCurvaNombre").val(readProp(data, "nombre", "Nombre") || "");
                $("#ckCurvaActiva").prop("checked", readProp(data, "activo", "Activo") !== false);
                renderActiveSwitch();
                $("#txCurvaModalKicker").text("Edición");
                $("#txCurvaModalTitulo").text("Editar curva");
                const details = (readProp(data, "detalles", "Detalles") || []).map(mapDetail);
                const productIds = Array.from(new Set(details.map(function (item) {
                    return String(item.idProductoServicio || "").toLowerCase();
                }).filter(Boolean)));
                if (productIds.length > 1) {
                    resetForm();
                    showError("STOP_PO: la curva contiene más de un producto y no puede editarse con el contrato CAT03.");
                    return;
                }
                if (details.length === 0) {
                    state.originalForm = snapshotForm();
                    state.modal.show();
                    return;
                }

                const first = details[0];
                state.selectedProduct = {
                    id: first.idProductoServicio,
                    nombre: first.producto,
                    codigo: first.codigoProducto,
                    unidadBase: first.unidadBase
                };
                $("#txBuscarProductoCurva").val(productLabel(state.selectedProduct));
                renderProductEditor(true);
                state.modal.show();
                loadVariants(first.idProductoServicio, details).then(function () {
                    state.originalForm = snapshotForm();
                });
            })
            .catch(function (error) { showError(resolveErrorMessage(error)); });
    };

    window.curvasCatalogoEstatus = function (id, activar) {
        Swal.fire({
            icon: "warning",
            title: activar ? "¿Reactivar curva?" : "¿Aplicar baja lógica?",
            text: activar ? "La curva volverá al catálogo activo." : "La curva quedará inactiva y conservará su historial.",
            showCancelButton: true,
            confirmButtonText: activar ? "Reactivar" : "Dar de baja",
            cancelButtonText: "Cancelar"
        }).then(function (result) {
            if (!result.isConfirmed) {
                return;
            }

            fetchJson((activar ? "/Proveeduria/Curvas/Reactivar" : "/Proveeduria/Curvas/Baja") + "?id=" + encodeURIComponent(id), { method: "POST" })
                .then(function (data) {
                    showSuccess(resolveServerMessage(data));
                    CheckAppUI.reloadGrid("curvas-catalogo-grid");
                })
                .catch(function (error) { showError(resolveErrorMessage(error)); });
        });
    };

    window.curvasCatalogoEliminar = function (id) {
        Swal.fire({
            icon: "warning",
            title: "¿Eliminar curva?",
            text: "Se archivarán sus objetivos y saldrá del catálogo operativo. El historial se conserva y esta acción no permite reactivación.",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#dc2626"
        }).then(function (result) {
            if (!result.isConfirmed) return;
            fetchJson("/Proveeduria/Curvas/Eliminar?id=" + encodeURIComponent(id), { method: "POST" })
                .then(function (data) {
                    showSuccess(resolveServerMessage(data));
                    CheckAppUI.reloadGrid("curvas-catalogo-grid");
                })
                .catch(function (error) { showError(resolveErrorMessage(error)); });
        });
    };

    window.curvasCatalogoIdentidades = function (id) {
        openReadOnlyDetail(id, "Identidades configuradas", "Variantes y producto base", renderIdentityDetail);
    };

    window.curvasCatalogoProductos = function (id) {
        openReadOnlyDetail(id, "Productos asignados", "Productos y sucursales", renderProductAssignments);
    };

    function openReadOnlyDetail(id, title, kicker, renderer) {
        $("#txCurvaConsultaKicker").text(kicker);
        $("#txCurvaConsultaTitulo").text(title);
        $("#bdCurvaConsulta").html("<div class='curvas-consulta-loading'><i class='fa fa-spinner fa-spin'></i><span>Cargando información…</span></div>");
        state.consultaModal.show();
        fetchJson("/Proveeduria/Curvas/Detalle?id=" + encodeURIComponent(id), { cache: "no-store" })
            .then(function (data) { $("#bdCurvaConsulta").html(renderer(data)); })
            .catch(function (error) { $("#bdCurvaConsulta").html("<div class='alert alert-danger'>" + escapeHtml(resolveErrorMessage(error)) + "</div>"); });
    }

    function renderIdentityDetail(data) {
        const details = readProp(data, "detalles", "Detalles") || [];
        const rows = details.map(function (item) {
            const variantId = readProp(item, "idVariante", "IdVariante");
            const active = readProp(item, "fuenteActiva", "FuenteActiva") !== false;
            return "<tr><td>" + escapeHtml([readProp(item, "codigoProducto", "CodigoProducto"), readProp(item, "producto", "Producto")].filter(Boolean).join(" · ")) + "</td>" +
                "<td>" + escapeHtml(variantId ? readProp(item, "variante", "Variante") : "Producto base") + "</td>" +
                "<td>" + escapeHtml(readProp(item, "unidadBase", "UnidadBase") || "") + "</td>" +
                "<td>" + formatDecimal(readProp(item, "cantidadBaseObjetivo", "CantidadBaseObjetivo")) + "</td>" +
                "<td>" + (active ? "<span class='checkapp-badge checkapp-badge-success'>Fuente activa</span>" : "<span class='checkapp-badge checkapp-badge-muted'>Fuente inactiva</span>") + "</td></tr>";
        }).join("");
        const total = details.reduce(function (sum, item) { return sum + Number(readProp(item, "cantidadBaseObjetivo", "CantidadBaseObjetivo") || 0); }, 0);
        return buildReadOnlyHeader(data, [pluralize(details.length, "identidad", "identidades"), pluralize(total, "pieza", "piezas")]) + "<div class='checkapp-grid-scroll'><table class='table table-row-bordered align-middle checkapp-grid-table'><thead><tr><th>Producto / código</th><th>Variante / presentación</th><th>Unidad base</th><th>Cantidad objetivo</th><th>Fuente</th></tr></thead><tbody>" + (rows || "<tr><td colspan='5'>Sin variantes o presentaciones configuradas.</td></tr>") + "</tbody></table></div>";
    }

    function renderProductAssignments(data) {
        const assignments = readProp(data, "asignaciones", "Asignaciones") || [];
        if (!assignments.length) {
            return buildReadOnlyHeader(data, ["0 asignaciones", "0 piezas", "0 variantes"]) + "<div class='curvas-assignment-empty'><i class='fa fa-archive' aria-hidden='true'></i><div><strong>Sin productos asignados</strong><p>Esta curva todavía no tiene productos sembrados en sucursales para mostrar en el catálogo.</p></div></div>";
        }
        const total = assignments.reduce(function (sum, item) { return sum + Number(readProp(item, "cantidadBaseObjetivo", "CantidadBaseObjetivo") || 0); }, 0);
        const cards = assignments.map(function (item) {
            const product = [readProp(item, "codigoProducto", "CodigoProducto"), readProp(item, "producto", "Producto")].filter(Boolean).join(" · ");
            const variant = readProp(item, "variante", "Variante") || "Producto base";
            const branch = readProp(item, "sucursal", "Sucursal") || "Sucursal";
            const quantity = Number(readProp(item, "cantidadBaseObjetivo", "CantidadBaseObjetivo") || 0);
            const search = [branch, product, variant, readProp(item, "estado", "Estado")].join(" ").toLowerCase();
            return "<article class='curvas-assignment-card' data-assignment-search='" + escapeHtml(search) + "'><div class='curvas-assignment-card-head'><div><span>Sucursal</span><strong>" + escapeHtml(branch) + "</strong></div><span class='checkapp-badge checkapp-badge-success'>" + escapeHtml(readProp(item, "estado", "Estado") || "Activa") + "</span></div><h4>" + escapeHtml(product) + "</h4><code>" + escapeHtml(readProp(item, "codigoProducto", "CodigoProducto") || "Sin código") + "</code><div class='curvas-assignment-distribution'><span>" + escapeHtml(variant) + " ×" + formatDecimal(quantity) + "</span></div><div class='curvas-assignment-meta'><span>" + pluralize(quantity, "pieza", "piezas") + "</span><span>1 variante</span><span>" + escapeHtml(readProp(item, "unidadBase", "UnidadBase") || "unidad base") + "</span></div></article>";
        }).join("");
        return buildReadOnlyHeader(data, [pluralize(assignments.length, "asignación", "asignaciones"), pluralize(total, "pieza", "piezas"), pluralize(assignments.length, "variante", "variantes")]) + "<div class='curvas-assignment-toolbar'><label class='checkapp-grid-search'><i class='fa fa-search'></i><input class='curvas-assignment-search' type='search' placeholder='Buscar sucursal, producto o código' /></label><span class='curvas-assignment-visible'>Mostrando " + assignments.length + " de " + assignments.length + " asignaciones</span></div><div class='curvas-assignment-grid' data-total='" + assignments.length + "'>" + cards + "</div><p class='curvas-consulta-note'>Consulta informativa; las asignaciones no se modifican desde Catálogo.</p>";
    }

    function buildReadOnlyHeader(data, metrics) {
        const chips = (metrics || [formatDecimal(readProp(data, "piezasObjetivo", "PiezasObjetivo")) + " unidades objetivo"]).map(function (metric) { return "<span class='ca-chip ca-chip--secondary'>" + escapeHtml(metric) + "</span>"; }).join("");
        return "<div class='curvas-consulta-header'><div><span class='checkapp-panel-eyebrow'>Curva</span><h3>" + escapeHtml(readProp(data, "nombre", "Nombre") || "") + "</h3><p>" + escapeHtml(readProp(data, "codigo", "Codigo") || "") + "</p></div><div class='curvas-consulta-metrics'>" + chips + "</div></div>";
    }

    function filterAssignments() {
        const term = String(this.value || "").trim().toLowerCase();
        const cards = $("#bdCurvaConsulta [data-assignment-search]");
        let visible = 0;
        cards.each(function () {
            const show = !term || String(this.getAttribute("data-assignment-search") || "").includes(term);
            this.hidden = !show;
            if (show) visible += 1;
        });
        $("#bdCurvaConsulta .curvas-assignment-visible").text("Mostrando " + visible + " de " + cards.length + " asignaciones");
    }

    function openCreate() {
        resetForm();
        state.originalForm = snapshotForm();
        state.modal.show();
    }

    function resetForm() {
        state.selectedProduct = null;
        state.variantRows = [];
        state.originalForm = null;
        state.editingId = null;
        $("#hdCurvaId,#txCurvaNombre,#txBuscarProductoCurva,#txCantidadTodasCurva").val("");
        $("#ckCurvaActiva").prop("checked", true);
        renderActiveSwitch();
        $("#lsProductosCurva,#txCurvaInfo").empty();
        $("#txCurvaModalKicker").text("Alta");
        $("#txCurvaModalTitulo").text("Nueva curva");
        renderProductEditor();
    }

    function renderActiveSwitch() {
        const active = $("#ckCurvaActiva").prop("checked");
        $("#ckCurvaActiva").attr("aria-checked", active ? "true" : "false");
        $("#txCurvaActivaEstado").text(active ? "Activa" : "Inactiva").toggleClass("is-inactive", !active);
    }

    function searchProducts() {
        const query = ($("#txBuscarProductoCurva").val() || "").trim();
        const sequence = ++state.productSearchSequence;
        if (query.length < 2) {
            $("#lsProductosCurva").empty();
            return;
        }

        fetchJson("/Proveeduria/Curvas/ProductosElegibles?busqueda=" + encodeURIComponent(query), { cache: "no-store" })
            .then(function (items) {
                if (sequence !== state.productSearchSequence) {
                    return;
                }
                $("#lsProductosCurva").html((items || []).map(function (item) {
                    const label = [item.codigo, item.nombre].filter(Boolean).join(" · ");
                    const meta = item.variantes > 0 ? item.variantes + " variante(s)" : "Sin variantes";
                    return "<button type='button' class='list-group-item list-group-item-action' data-id='" + escapeHtml(item.id) + "' data-name='" + escapeHtml(item.nombre || "") + "' data-code='" + escapeHtml(item.codigo || "") + "' data-unit='" + escapeHtml(item.unidadBase || "") + "'>" +
                        "<strong>" + escapeHtml(label) + "</strong><br><small>" + escapeHtml((item.unidadBase || "") + " · " + meta) + "</small></button>";
                }).join(""));
                $("#lsProductosCurva button").on("click", selectProduct);
            })
            .catch(function (error) {
                if (sequence === state.productSearchSequence) {
                    showError(resolveErrorMessage(error));
                }
            });
    }

    function selectProduct() {
        const nextProduct = {
            id: this.getAttribute("data-id"),
            nombre: this.getAttribute("data-name"),
            codigo: this.getAttribute("data-code"),
            unidadBase: this.getAttribute("data-unit")
        };
        $("#lsProductosCurva").empty();
        if (state.selectedProduct && String(state.selectedProduct.id).toLowerCase() === String(nextProduct.id).toLowerCase()) {
            $("#txBuscarProductoCurva").val(productLabel(state.selectedProduct));
            return;
        }
        if (state.selectedProduct && String(state.selectedProduct.id).toLowerCase() !== String(nextProduct.id).toLowerCase() && state.variantRows.some(function (row) { return row.included; })) {
            Swal.fire({
                icon: "warning",
                title: "¿Cambiar producto?",
                text: "Las cantidades capturadas del producto actual se reemplazarán.",
                showCancelButton: true,
                confirmButtonText: "Cambiar producto",
                cancelButtonText: "Conservar actual"
            }).then(function (result) {
                if (result.isConfirmed) {
                    applySelectedProduct(nextProduct);
                } else {
                    $("#txBuscarProductoCurva").val(productLabel(state.selectedProduct));
                }
            });
            return;
        }
        applySelectedProduct(nextProduct);
    }

    function applySelectedProduct(product) {
        state.selectedProduct = product;
        $("#txBuscarProductoCurva").val(productLabel(product));
        $("#txCantidadTodasCurva").val("");
        loadVariants(product.id, []);
    }

    function loadVariants(idProducto, existingDetails) {
        const sequence = ++state.variantLoadSequence;
        const saved = existingDetails || [];
        state.variantRows = [];
        renderProductEditor(true);
        return fetchJson("/Proveeduria/Curvas/Variantes?idProductoServicio=" + encodeURIComponent(idProducto), { cache: "no-store" })
            .then(function (items) {
                if (sequence !== state.variantLoadSequence || !state.selectedProduct || String(state.selectedProduct.id).toLowerCase() !== String(idProducto).toLowerCase()) return;
                const variants = items || [];
                state.variantRows = variants.length > 0
                    ? variants.map(function (item) {
                        const existing = findDetail(saved, state.selectedProduct.id, item.id);
                        const row = buildVariantRow(item.id, item.nombre || item.codigo || "Variante", existing ? true : saved.length === 0);
                        row.cantidadBaseObjetivo = existing ? Number(existing.cantidadBaseObjetivo || 0) : 0;
                        return row;
                    })
                    : [function () {
                        const existing = findDetail(saved, state.selectedProduct.id, null);
                        const row = buildVariantRow(null, "Base", existing ? true : saved.length === 0);
                        row.cantidadBaseObjetivo = existing ? Number(existing.cantidadBaseObjetivo || 0) : 0;
                        return row;
                    }()];
                saved.forEach(function (existing) {
                    const represented = state.variantRows.some(function (row) {
                        return sameKey(row.idProductoServicio, row.idVariante, existing.idProductoServicio, existing.idVariante);
                    });
                    if (!represented) {
                        const row = buildVariantRow(existing.idVariante, existing.variante || "Variante", true);
                        row.cantidadBaseObjetivo = Number(existing.cantidadBaseObjetivo || 0);
                        row.fuenteActiva = existing.fuenteActiva;
                        state.variantRows.push(row);
                    }
                });
                renderProductEditor();
            })
            .catch(function (error) {
                if (sequence === state.variantLoadSequence) {
                    clearProductEditor();
                    showError(resolveErrorMessage(error));
                }
            });
    }

    function buildVariantRow(idVariante, variante, included) {
        return {
            idProductoServicio: state.selectedProduct.id,
            idVariante: idVariante || null,
            producto: state.selectedProduct.nombre,
            codigoProducto: state.selectedProduct.codigo,
            variante: variante || "Base",
            unidadBase: state.selectedProduct.unidadBase,
            included: included,
            cantidadBaseObjetivo: 0
        };
    }

    function renderProductEditor(loading) {
        const hasProduct = !!state.selectedProduct;
        $("#panelObjetivosCurva").toggleClass("is-empty", !hasProduct || !!loading);
        $(".curvas-product-empty span").text(loading ? "Cargando variantes activas…" : "Selecciona un producto para cargar sus objetivos.");
        if (!hasProduct || loading) {
            $("#tbObjetivosCurva").empty();
            updateVariantSummary();
            return;
        }

        $("#tbObjetivosCurva").html(state.variantRows.map(function (row, index) {
            return "<tr data-index='" + index + "'>" +
                "<td data-label='Usar'><input class='curvas-include-input' type='checkbox' " + (row.included ? "checked" : "") + " aria-label='Incluir variante' /></td>" +
                "<td data-label='Variante'><strong>" + escapeHtml(row.idVariante ? row.variante : "Producto base") + "</strong></td>" +
                "<td data-label='Unidad base'>" + escapeHtml(row.unidadBase || "") + "</td>" +
                "<td data-label='Cantidad objetivo'><input class='curvas-quantity-input' type='number' min='0' step='0.0001' value='" + escapeHtml(row.cantidadBaseObjetivo) + "' aria-label='Cantidad objetivo' /></td>" +
                "<td data-label='Acciones'><div class='curvas-quantity-stepper'><button type='button' class='curvas-qty-step' data-delta='-1' aria-label='Disminuir cantidad'>−</button><button type='button' class='curvas-qty-step' data-delta='1' aria-label='Aumentar cantidad'>+</button></div></td>" +
                "</tr>";
        }).join(""));
        updateVariantSummary();
    }

    function stepVariantQuantity() {
        const row = $(this).closest("tr");
        const input = row.find(".curvas-quantity-input");
        const delta = Number(this.getAttribute("data-delta") || 0);
        const next = Math.max(0, Number(input.val() || 0) + delta);
        input.val(formatDecimalInput(next)).trigger("input");
    }

    function updateVariantFromDom() {
        const row = $(this).closest("tr");
        const index = Number(row.attr("data-index"));
        if (!Number.isInteger(index) || !state.variantRows[index]) {
            return;
        }

        state.variantRows[index].included = row.find(".curvas-include-input").prop("checked");
        state.variantRows[index].cantidadBaseObjetivo = Number(row.find(".curvas-quantity-input").val() || 0);
        updateVariantSummary();
    }

    function applyQuantityToIncluded() {
        const quantity = Number($("#txCantidadTodasCurva").val());
        if (!Number.isFinite(quantity) || quantity < 0) {
            setInfo("danger", "Captura una cantidad válida para aplicar.");
            return;
        }

        state.variantRows.forEach(function (row) {
            if (row.included) {
                row.cantidadBaseObjetivo = quantity;
            }
        });
        renderProductEditor();
        setInfo("success", "Cantidad aplicada a las variantes incluidas.");
    }

    function syncVariantRowsFromDom() {
        $("#tbObjetivosCurva tr").each(function () {
            const index = Number(this.getAttribute("data-index"));
            if (Number.isInteger(index) && state.variantRows[index]) {
                state.variantRows[index].included = $(this).find(".curvas-include-input").prop("checked");
                state.variantRows[index].cantidadBaseObjetivo = Number($(this).find(".curvas-quantity-input").val() || 0);
            }
        });
        updateVariantSummary();
    }

    function findDetail(details, productId, variantId) {
        return details.find(function (item) { return sameKey(item.idProductoServicio, item.idVariante, productId, variantId); }) || null;
    }

    function clearProductEditor() {
        state.productSearchSequence += 1;
        state.variantLoadSequence += 1;
        state.selectedProduct = null;
        state.variantRows = [];
        $("#txBuscarProductoCurva,#txCantidadTodasCurva").val("");
        $("#lsProductosCurva").empty();
        renderProductEditor();
    }

    function save() {
        if (state.saving) {
            return;
        }

        const nombre = ($("#txCurvaNombre").val() || "").trim();
        syncVariantRowsFromDom();
        const details = state.variantRows.filter(function (row) { return row.included; });
        if (!nombre) {
            setInfo("danger", "Captura el nombre.");
            return;
        }
        if (state.selectedProduct && ($("#txBuscarProductoCurva").val() || "").trim() !== productLabel(state.selectedProduct)) {
            setInfo("danger", "Selecciona un producto de la lista antes de guardar.");
            return;
        }
        if (!state.selectedProduct || details.length === 0) {
            setInfo("danger", "Agrega al menos un objetivo.");
            return;
        }

        state.saving = true;
        $("#btGuardarCurva").prop("disabled", true);
        fetchJson("/Proveeduria/Curvas/Guardar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: normalizeGuid($("#hdCurvaId").val() || state.editingId),
                nombre: nombre,
                activo: $("#ckCurvaActiva").prop("checked"),
                detalles: details.map(function (item) {
                    return {
                        idProductoServicio: item.idProductoServicio,
                        idVariante: item.idVariante,
                        cantidadBaseObjetivo: Number(item.cantidadBaseObjetivo)
                    };
                })
            })
        }).then(function (data) {
            showSuccess(resolveServerMessage(data));
            state.modal.hide();
            CheckAppUI.reloadGrid("curvas-catalogo-grid");
        }).catch(function (error) {
            setInfo("danger", resolveErrorMessage(error));
        }).finally(function () {
            state.saving = false;
            $("#btGuardarCurva").prop("disabled", false);
        });
    }

    function snapshotForm() {
        return {
            id: $("#hdCurvaId").val(),
            nombre: $("#txCurvaNombre").val(),
            activo: $("#ckCurvaActiva").prop("checked"),
            product: state.selectedProduct ? String(state.selectedProduct.id) : null,
            details: state.variantRows.filter(function (row) { return row.included; }).map(cloneDetail)
        };
    }

    function mapDetail(item) {
        return {
            idProductoServicio: readProp(item, "idProductoServicio", "IdProductoServicio"),
            idVariante: readProp(item, "idVariante", "IdVariante") || null,
            producto: readProp(item, "producto", "Producto"),
            codigoProducto: readProp(item, "codigoProducto", "CodigoProducto"),
            variante: readProp(item, "variante", "Variante") || "Base",
            unidadBase: readProp(item, "unidadBase", "UnidadBase"),
            cantidadBaseObjetivo: Number(readProp(item, "cantidadBaseObjetivo", "CantidadBaseObjetivo") || 0),
            fuenteActiva: readProp(item, "fuenteActiva", "FuenteActiva") !== false
        };
    }

    function cloneDetail(item) {
        return {
            idProductoServicio: item.idProductoServicio,
            idVariante: item.idVariante || null,
            producto: item.producto,
            codigoProducto: item.codigoProducto,
            variante: item.variante,
            unidadBase: item.unidadBase,
            cantidadBaseObjetivo: Number(item.cantidadBaseObjetivo || 0)
        };
    }

    function updateVariantSummary() {
        const included = state.variantRows.filter(function (row) { return row.included; });
        const total = included.reduce(function (sum, row) { return sum + Number(row.cantidadBaseObjetivo || 0); }, 0);
        const identityLabel = state.variantRows.length === 1 && !state.variantRows[0].idVariante
            ? "1 producto base"
            : pluralize(included.length, "variante", "variantes");
        $("#txResumenObjetivosCurva").text(pluralize(total, "pieza", "piezas") + " · " + identityLabel);
    }

    function productLabel(product) {
        return [product && product.codigo, product && product.nombre].filter(Boolean).join(" · ");
    }

    function updateSummary() {
        const status = $("#cbFiltroEstatusCurvas option:selected").text() || "Activos";
        const term = ($("#txBusquedaCurvas").val() || "").trim();
        $("#accordionFiltrosCurvas .checkapp-accordion-summary").text(term ? "Estatus: " + status + " · Búsqueda: " + term : "Estatus: " + status);
    }

    function buildFiltersQuery() {
        const query = new URLSearchParams();
        appendQuery(query, "busqueda", $("#txBusquedaCurvas").val());
        appendQuery(query, "estatus", $("#cbFiltroEstatusCurvas").val());
        return query.toString();
    }

    function renderKpis(data) {
        $("#txKpiCurvasActivas").text(formatDecimal(readProp(data, "curvasActivas", "CurvasActivas")));
        $("#txKpiCurvasInactivas").text(formatDecimal(readProp(data, "curvasInactivas", "CurvasInactivas")));
        $("#txKpiCantidadObjetivo").text(formatDecimal(readProp(data, "cantidadObjetivo", "CantidadObjetivo")));
        $("#txKpiIdentidades").text(formatDecimal(readProp(data, "identidadesConfiguradas", "IdentidadesConfiguradas")));
        $("#txKpiProductos").text(formatDecimal(readProp(data, "productosAsignados", "ProductosAsignados")));
        $("#txKpiSucursales").text(formatDecimal(readProp(data, "sucursalesSembradas", "SucursalesSembradas")));
    }

    function sameKey(productA, variantA, productB, variantB) {
        return String(productA).toLowerCase() === String(productB).toLowerCase() &&
            String(variantA || "").toLowerCase() === String(variantB || "").toLowerCase();
    }

    function setInfo(type, message) {
        $("#txCurvaInfo").html(message ? "<div class='alert alert-" + (type === "danger" ? "danger" : "success") + "'>" + escapeHtml(message) + "</div>" : "");
    }

    function actionLink(label, iconClass, onclick, actionClass) {
        return "<a href='javascript:void(0)' role='button' class='" + escapeHtml(actionClass || "") + "' onclick=\"" + onclick + "\" title='" + escapeHtml(label) + "' aria-label='" + escapeHtml(label) + "'><i class='" + iconClass + "'></i></a>";
    }

    function appendQuery(query, key, value) {
        const text = String(value == null ? "" : value).trim();
        if (text) query.append(key, text);
    }

    function fetchJson(url, options) {
        return fetch(url, options || {}).then(function (response) {
            return response.text().then(function (text) {
                const data = text ? JSON.parse(text) : {};
                if (!response.ok) {
                    const error = new Error(resolveServerMessage(data) || response.statusText);
                    error.payload = data;
                    throw error;
                }
                return data;
            });
        });
    }

    function resolveServerMessage(data) {
        return data && (data.mensaje || data.Mensaje || data.message || data.Message) || "Acción completada.";
    }

    function resolveErrorMessage(error) {
        return error && error.message ? error.message : "No fue posible completar la acción.";
    }

    function showSuccess(message) {
        Swal.fire({ icon: "success", title: "Listo", text: message || "Acción completada.", timer: 1600, showConfirmButton: false });
    }

    function showError(message) {
        Swal.fire({ icon: "error", title: "No se pudo completar", text: message || "Intenta nuevamente." });
    }

    function formatDisplayDate(value) {
        if (!value) return "";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("es-MX");
    }

    function formatDecimal(value) {
        const number = Number(value || 0);
        return number.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 4 });
    }

    function formatDecimalInput(value) {
        const number = Number(value || 0);
        return Number.isFinite(number) ? String(Math.round(number * 10000) / 10000) : "0";
    }

    function pluralize(value, singular, plural) {
        const count = Number(value || 0);
        return count + " " + (count === 1 ? singular : plural);
    }

    function formatDateForFile(date) {
        return date.getFullYear().toString() + String(date.getMonth() + 1).padStart(2, "0") + String(date.getDate()).padStart(2, "0");
    }

    function normalizeGuid(value) {
        const text = String(value || "").trim();
        return text ? text : null;
    }

    function readProp(source) {
        if (!source) {
            return undefined;
        }

        for (let index = 1; index < arguments.length; index += 1) {
            const key = arguments[index];
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                return source[key];
            }
        }

        return undefined;
    }

    function debounce(fn, delay) {
        let handle = null;
        return function () {
            clearTimeout(handle);
            handle = setTimeout(fn, delay);
        };
    }

    function resolveModal(selector) {
        const element = document.querySelector(selector);
        if (window.bootstrap && window.bootstrap.Modal) {
            return window.bootstrap.Modal.getOrCreateInstance(element);
        }
        return {
            show: function () { $(element).modal("show"); },
            hide: function () { $(element).modal("hide"); }
        };
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function escapeJs(value) {
        return String(value == null ? "" : value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    }
})(window, document, window.jQuery);
