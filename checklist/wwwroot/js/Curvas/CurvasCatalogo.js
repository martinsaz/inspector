(function (window, document, $) {
    "use strict";

    const page = document.querySelector("[data-curvas-catalogo-page]");
    if (!page) {
        return;
    }

    const state = {
        modal: null,
        selectedProduct: null,
        variantRows: [],
        details: [],
        originalForm: null,
        editingId: null,
        saving: false
    };

    const columns = [
        actionColumn(),
        { key: "codigo", title: "Código" },
        {
            key: "nombre",
            title: "Nombre",
            render: function (value, row) {
                return "<div class='ps-catalog-title'><strong>" + escapeHtml(value || "") + "</strong><small>" + Number(row.renglones || 0) + " renglón(es)</small></div>";
            }
        },
        {
            key: "piezasObjetivo",
            title: "Cantidad objetivo",
            render: function (value) { return formatDecimal(value); }
        },
        statusColumn(),
        updatedColumn()
    ];

    document.addEventListener("DOMContentLoaded", function () {
        state.modal = resolveModal("#modalCurva");
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
            emptySummaryText: "Activos"
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
                const query = new URLSearchParams();
                appendQuery(query, "busqueda", $("#txBusquedaCurvas").val());
                appendQuery(query, "estatus", $("#cbFiltroEstatusCurvas").val());
                return fetchJson("/Proveeduria/Curvas/Listar?" + query.toString(), { cache: "no-store" });
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
        $("#btAgregarProductoCurva").on("click", addProductObjectives);
        $("#btAplicarCantidadTodasCurva").on("click", applyQuantityToIncluded);
        $("#btLimpiarProductoCurva").on("click", clearProductEditor);
        $("#txBuscarProductoCurva").on("input", debounce(searchProducts, 250));
        $("#tbObjetivosCurva").on("change", ".curvas-include-input", updateVariantFromDom);
        $("#tbObjetivosCurva").on("input", ".curvas-quantity-input", updateVariantFromDom);
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
                const actions = [
                    actionLink("Editar", "fa fa-edit", "curvasCatalogoEditar('" + escapeJs(readProp(row, "id", "Id")) + "')")
                ];
                actions.push(row.activo
                    ? actionLink("Dar de baja", "fa fa-ban", "curvasCatalogoEstatus('" + escapeJs(readProp(row, "id", "Id")) + "', false)", "is-danger")
                    : actionLink("Reactivar", "fa fa-check", "curvasCatalogoEstatus('" + escapeJs(readProp(row, "id", "Id")) + "', true)", "is-success"));
                return "<div class='ps-catalog-actions'>" + actions.join("") + "</div>";
            }
        };
    }

    function statusColumn() {
        return {
            key: "activo",
            title: "Estatus",
            exportValue: function (value) { return value ? "Activo" : "Baja lógica"; },
            render: function (value) {
                return value
                    ? "<span class='checkapp-badge checkapp-badge-success'>Activo</span>"
                    : "<span class='checkapp-badge checkapp-badge-muted'>Baja lógica</span>";
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
                $("#txCurvaModalKicker").text("Edición");
                $("#txCurvaModalTitulo").text("Editar curva");
                state.details = (readProp(data, "detalles", "Detalles") || []).map(mapDetail);
                state.originalForm = snapshotForm();
                renderDetails();
                state.modal.show();
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

    function openCreate() {
        resetForm();
        state.originalForm = snapshotForm();
        state.modal.show();
    }

    function resetForm() {
        state.selectedProduct = null;
        state.variantRows = [];
        state.details = [];
        state.originalForm = null;
        state.editingId = null;
        $("#hdCurvaId,#txCurvaNombre,#txBuscarProductoCurva,#txCantidadTodasCurva").val("");
        $("#ckCurvaActiva").prop("checked", true);
        $("#lsProductosCurva,#txCurvaInfo").empty();
        $("#txCurvaModalKicker").text("Alta");
        $("#txCurvaModalTitulo").text("Nueva curva");
        renderProductEditor();
        renderDetails();
    }

    function searchProducts() {
        const query = ($("#txBuscarProductoCurva").val() || "").trim();
        if (query.length < 2) {
            $("#lsProductosCurva").empty();
            return;
        }

        fetchJson("/Proveeduria/Curvas/ProductosElegibles?busqueda=" + encodeURIComponent(query), { cache: "no-store" })
            .then(function (items) {
                $("#lsProductosCurva").html((items || []).map(function (item) {
                    const label = [item.codigo, item.nombre].filter(Boolean).join(" · ");
                    const meta = item.variantes > 0 ? item.variantes + " variante(s)" : "Sin variantes";
                    return "<button type='button' class='list-group-item list-group-item-action' data-id='" + escapeHtml(item.id) + "' data-name='" + escapeHtml(item.nombre || "") + "' data-code='" + escapeHtml(item.codigo || "") + "' data-unit='" + escapeHtml(item.unidadBase || "") + "'>" +
                        "<strong>" + escapeHtml(label) + "</strong><br><small>" + escapeHtml((item.unidadBase || "") + " · " + meta) + "</small></button>";
                }).join(""));
                $("#lsProductosCurva button").on("click", selectProduct);
            })
            .catch(function (error) { showError(resolveErrorMessage(error)); });
    }

    function selectProduct() {
        state.selectedProduct = {
            id: this.getAttribute("data-id"),
            nombre: this.getAttribute("data-name"),
            codigo: this.getAttribute("data-code"),
            unidadBase: this.getAttribute("data-unit")
        };
        $("#txBuscarProductoCurva").val([state.selectedProduct.codigo, state.selectedProduct.nombre].filter(Boolean).join(" · "));
        $("#lsProductosCurva").empty();
        loadVariants(state.selectedProduct.id);
    }

    function loadVariants(idProducto) {
        state.variantRows = [];
        renderProductEditor(true);
        fetchJson("/Proveeduria/Curvas/Variantes?idProductoServicio=" + encodeURIComponent(idProducto), { cache: "no-store" })
            .then(function (items) {
                const variants = items || [];
                state.variantRows = variants.length > 0
                    ? variants.map(function (item) {
                        return buildVariantRow(item.id, item.nombre || item.codigo || "Variante", true);
                    })
                    : [buildVariantRow(null, "Base", true)];
                renderProductEditor();
            })
            .catch(function (error) {
                clearProductEditor();
                showError(resolveErrorMessage(error));
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
        $("#panelObjetivosCurva").toggleClass("is-empty", !hasProduct);
        $(".curvas-product-empty").text(loading ? "Cargando variantes activas..." : "Selecciona un producto para cargar sus objetivos.");
        if (!hasProduct) {
            $("#tbObjetivosCurva").empty();
            $("#txProductoObjetivoCurva").text("Producto");
            $("#txProductoUnidadCurva").text("Unidad base");
            updateVariantSummary();
            return;
        }

        $("#txProductoObjetivoCurva").text([state.selectedProduct.codigo, state.selectedProduct.nombre].filter(Boolean).join(" · "));
        $("#txProductoUnidadCurva").text("Unidad base: " + (state.selectedProduct.unidadBase || ""));
        $("#tbObjetivosCurva").html(state.variantRows.map(function (row, index) {
            return "<tr data-index='" + index + "'>" +
                "<td><input class='curvas-include-input' type='checkbox' " + (row.included ? "checked" : "") + " aria-label='Incluir variante' /></td>" +
                "<td>" + escapeHtml(row.variante || "Base") + "</td>" +
                "<td>" + escapeHtml(row.unidadBase || "") + "</td>" +
                "<td><input class='curvas-quantity-input' type='number' min='0' step='0.0001' value='" + escapeHtml(row.cantidadBaseObjetivo) + "' /></td>" +
                "</tr>";
        }).join(""));
        updateVariantSummary();
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

    function addProductObjectives() {
        if (!state.selectedProduct) {
            setInfo("danger", "Selecciona un producto.");
            return;
        }

        syncVariantRowsFromDom();
        const selected = state.variantRows.filter(function (row) { return row.included; });
        if (selected.length === 0) {
            setInfo("danger", "Incluye al menos una variante o la fila Base.");
            return;
        }

        const invalid = selected.some(function (row) {
            return !Number.isFinite(Number(row.cantidadBaseObjetivo)) || Number(row.cantidadBaseObjetivo) < 0;
        });
        if (invalid) {
            setInfo("danger", "Revisa las cantidades objetivo.");
            return;
        }

        const duplicate = selected.find(function (row) {
            return state.details.some(function (item) {
                return sameKey(item.idProductoServicio, item.idVariante, row.idProductoServicio, row.idVariante);
            });
        });
        if (duplicate) {
            setInfo("danger", "Ese producto y variante ya están en la curva.");
            return;
        }

        selected.forEach(function (row) {
            state.details.push({
                idProductoServicio: row.idProductoServicio,
                idVariante: row.idVariante,
                producto: row.producto,
                codigoProducto: row.codigoProducto,
                variante: row.variante,
                unidadBase: row.unidadBase,
                cantidadBaseObjetivo: Number(row.cantidadBaseObjetivo)
            });
        });
        setInfo("success", selected.length + " objetivo(s) agregado(s).");
        clearProductEditor();
        renderDetails();
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

    function clearProductEditor() {
        state.selectedProduct = null;
        state.variantRows = [];
        $("#txBuscarProductoCurva,#txCantidadTodasCurva").val("");
        $("#lsProductosCurva").empty();
        renderProductEditor();
    }

    function renderDetails() {
        $("#tbDetalleCurva").html(state.details.map(function (item, index) {
            const producto = [item.codigoProducto, item.producto].filter(Boolean).join(" · ");
            return "<tr><td>" + escapeHtml(producto) + "</td><td>" + escapeHtml(item.idVariante ? item.variante : "Base") + "</td><td>" + escapeHtml(item.unidadBase || "") + "</td><td>" + formatDecimal(item.cantidadBaseObjetivo) + "</td><td><div class='ps-catalog-actions'><a href='javascript:void(0)' class='is-danger' title='Quitar' onclick='curvasQuitarDetalle(" + index + ")'><i class='fa fa-trash'></i></a></div></td></tr>";
        }).join("") || "<tr><td colspan='5'>Sin renglones capturados.</td></tr>");
        updateDetailsSummary();
    }

    window.curvasQuitarDetalle = function (index) {
        state.details.splice(index, 1);
        renderDetails();
    };

    function save() {
        if (state.saving) {
            return;
        }

        const nombre = ($("#txCurvaNombre").val() || "").trim();
        if (!nombre) {
            setInfo("danger", "Captura el nombre.");
            return;
        }
        if (state.details.length === 0) {
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
                detalles: state.details.map(function (item) {
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
            details: state.details.map(cloneDetail)
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
            cantidadBaseObjetivo: Number(readProp(item, "cantidadBaseObjetivo", "CantidadBaseObjetivo") || 0)
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
        const label = state.variantRows.length === 1 && !state.variantRows[0].idVariante ? "1 producto" : included.length + " variantes incluidas";
        $("#txResumenObjetivosCurva").text(label + " · " + formatDecimal(total) + " unidades objetivo");
    }

    function updateDetailsSummary() {
        const total = state.details.reduce(function (sum, row) { return sum + Number(row.cantidadBaseObjetivo || 0); }, 0);
        $("#txResumenDetalleCurva").text(state.details.length + " renglones · " + formatDecimal(total) + " unidades objetivo");
    }

    function updateSummary() {
        const status = $("#cbFiltroEstatusCurvas option:selected").text() || "Activos";
        const term = ($("#txBusquedaCurvas").val() || "").trim();
        $("#accordionFiltrosCurvas .checkapp-accordion-summary").text(term ? status + " · " + term : status);
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
