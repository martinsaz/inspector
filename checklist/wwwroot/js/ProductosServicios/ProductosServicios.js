(function (window, document, $) {
    "use strict";

    const gridId = "productos-servicios-grid";
    const state = {
        combos: {
            categorias: [],
            marcas: [],
            unidadesMedida: [],
            tipos: [],
            estatus: []
        },
        summaryType: "",
        detailCache: new Map(),
        activeRows: [],
        imageDraft: null,
        existingImage: null,
        removeExistingImage: false,
        savedModalImage: false,
        modal: null,
        quickCatalogModal: null,
        isSaving: false,
        isUploadingImage: false,
        saveProgressTimerId: 0,
        quickCatalogSaving: false,
        quickCatalogKey: ""
    };

    const quickCatalogConfigs = {
        categoria: {
            key: "categoria",
            title: "Nueva categoría",
            singular: "categoría",
            saveUrl: "/ProductosServicios/GuardarCategoriaProductoServicio",
            listUrl: "/ProductosServicios/ObtenerCategoriasProductosServicios",
            selectSelector: "#cbCategoriaProductoServicio",
            comboCollectionKey: "categorias",
            codeMax: 50,
            nameMax: 150,
            descriptionMax: 500,
            showDescription: true,
            showAplicaA: true,
            showAbreviatura: false,
            showPermiteDecimales: false
        },
        marca: {
            key: "marca",
            title: "Nueva marca",
            singular: "marca",
            saveUrl: "/ProductosServicios/GuardarMarcaProductoServicio",
            listUrl: "/ProductosServicios/ObtenerMarcasProductosServicios",
            selectSelector: "#cbMarcaProductoServicio",
            comboCollectionKey: "marcas",
            codeMax: 50,
            nameMax: 150,
            descriptionMax: 500,
            showDescription: true,
            showAplicaA: false,
            showAbreviatura: false,
            showPermiteDecimales: false
        },
        unidad: {
            key: "unidad",
            title: "Nueva unidad de medida",
            singular: "unidad de medida",
            saveUrl: "/ProductosServicios/GuardarUnidadMedidaProductoServicio",
            listUrl: "/ProductosServicios/ObtenerUnidadesMedidaProductosServicios",
            selectSelector: "#cbUnidadProductoServicio",
            comboCollectionKey: "unidadesMedida",
            codeMax: 30,
            nameMax: 100,
            descriptionMax: 0,
            abreviaturaMax: 20,
            showDescription: false,
            showAplicaA: false,
            showAbreviatura: true,
            showPermiteDecimales: true
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        state.modal = resolveModalApi("#modalProductoServicio");
        state.quickCatalogModal = resolveModalApi("#modalQuickCatalogoProductoServicio");
        initAccordion();
        initEvents();
        initGrid();
        resetSaveUi();

        loadCombos()
            .then(function () {
                syncTypeVisibility();
                return Promise.all([
                    loadSummary(),
                    CheckAppUI.reloadGrid(gridId)
                ]);
            })
            .catch(function (error) {
                setStatus("#txInfoProductoServicio", "danger", resolveErrorMessage(error));
            });
    });

    function initAccordion() {
        CheckAppUI.createFilterAccordion({
            id: "productos-servicios-filtros",
            selector: "#accordionFiltrosProductosServicios",
            open: true,
            emptySummaryText: "Sin filtros activos"
        });
    }

    function initEvents() {
        $("#btBuscarProductosServicios").on("click", function () {
            updateFilterSummary();
            loadSummary();
            CheckAppUI.reloadGrid(gridId);
        });

        $("#btLimpiarProductosServicios").on("click", clearFilters);
        $("#btNuevoProductoServicio").on("click", openCreateModal);
        $("#btGuardarProductoServicio").on("click", saveProductoServicio);
        $("#btGuardarQuickCatalogoProductoServicio").on("click", saveQuickCatalog);
        $("#btQuickAddCategoriaProductoServicio").on("click", function () { openQuickCatalogModal("categoria"); });
        $("#btQuickAddMarcaProductoServicio").on("click", function () { openQuickCatalogModal("marca"); });
        $("#btQuickAddUnidadProductoServicio").on("click", function () { openQuickCatalogModal("unidad"); });

        $("#txBusquedaProductosServicios").on("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                $("#btBuscarProductosServicios").trigger("click");
            }
        });

        $(document).on("click", "[data-summary-type]", function () {
            state.summaryType = String($(this).data("summaryType") || "");
            $("#cbFiltroTipoProductoServicio").val(state.summaryType).trigger("change");
            syncSummarySelection();
            updateFilterSummary();
            loadSummary();
            CheckAppUI.reloadGrid(gridId);
        });

        $("#cbTipoProductoServicio").on("change", function () {
            syncCategoryOptions();
            syncTypeVisibility();
            clearFieldError("#cbTipoProductoServicio");
        });

        $("#chkCausaInventarioProductoServicio").on("change", syncTypeVisibility);
        $("#frmProductoServicio input, #frmProductoServicio textarea").on("input", function () {
            clearFieldError("#" + this.id);
        });
        $("#frmProductoServicio select").on("change", function () {
            clearFieldError("#" + this.id);
        });
        $("#frmQuickCatalogoProductoServicio input, #frmQuickCatalogoProductoServicio textarea").on("input", function () {
            clearQuickCatalogFieldError("#" + this.id);
        });
        $("#frmQuickCatalogoProductoServicio select").on("change", function () {
            clearQuickCatalogFieldError("#" + this.id);
        });

        $("#btCambiarImagenProductoServicio").on("click", function () {
            $("#flImagenProductoServicio").trigger("click");
        });

        $("#btEliminarImagenProductoServicio").on("click", removeCurrentImage);
        $("#flImagenProductoServicio").on("change", handleImageSelection);

        $("#modalProductoServicio").on("hidden.bs.modal", function () {
            cleanupDraftImageOnClose();
            resetSaveUi();
            resetModal();
        });

        $("#modalQuickCatalogoProductoServicio").on("hidden.bs.modal", function () {
            resetQuickCatalogModal();
        });
    }

    function initGrid() {
        CheckAppUI.createDynamicGrid({
            id: gridId,
            hostSelector: "#gridProductosServiciosHost",
            tableSelector: "#grProductosServicios",
            searchInputSelector: "#txBusquedaGridProductosServicios",
            exportButtonSelector: "#btExportarProductosServicios",
            columnToggleButtonSelector: "#btColumnasProductosServicios",
            columnTogglePanelSelector: "#panelColumnasProductosServicios",
            resultCountSelector: "#txGridProductosServiciosCount",
            footerRangeSelector: "#txGridProductosServiciosRange",
            footerPageIndicatorSelector: "#txGridProductosServiciosPageIndicator",
            footerPrevButtonSelector: "#btGridProductosServiciosPrev",
            footerNextButtonSelector: "#btGridProductosServiciosNext",
            footerPageSizeSelector: "#txGridProductosServiciosPageSize",
            pageLength: 25,
            lengthMenu: [[25, 50, 100], [25, 50, 100]],
            order: [[4, "asc"]],
            exportSheetName: "ProductosServicios",
            exportFileName: function () {
                return "ProductosServicios_" + formatDateForFile(new Date()) + ".xlsx";
            },
            loadData: function () {
                const query = new URLSearchParams();
                appendQuery(query, "busqueda", $("#txBusquedaProductosServicios").val());
                appendQuery(query, "tipo", $("#cbFiltroTipoProductoServicio").val());
                appendQuery(query, "idCategoria", $("#cbFiltroCategoriaProductoServicio").val());
                appendQuery(query, "idMarca", $("#cbFiltroMarcaProductoServicio").val());
                appendQuery(query, "idUnidadMedida", $("#cbFiltroUnidadProductoServicio").val());
                appendQuery(query, "causaInventario", $("#cbFiltroCausaInventario").val());
                appendQuery(query, "estatus", $("#cbFiltroEstatusProductosServicios").val());

                return fetchJson("/ProductosServicios/ObtenerProductosServicios?" + query.toString())
                    .then(function (items) {
                        state.activeRows = Array.isArray(items) ? items : [];
                        state.detailCache = new Map(state.activeRows.map(function (item) { return [item.id, item]; }));
                        return state.activeRows;
                    });
            },
            columns: [
                {
                    key: "acciones",
                    title: "Acciones",
                    sortable: false,
                    hideable: false,
                    exportable: false,
                    render: function (_value, row) {
                        return buildActions(row);
                    }
                },
                {
                    key: "imagenUrl",
                    title: "Imagen",
                    exportValue: function (_value, row) {
                        return row.imagenNombre || "";
                    },
                    render: function (value, row) {
                        if (value) {
                            return "<img class='ps-grid-image' src='" + escapeHtml(value) + "' alt='" + escapeHtml(row.nombre || "Imagen") + "' />";
                        }

                        return "<span class='ps-grid-image-empty'><i class='fa fa-picture-o'></i></span>";
                    }
                },
                { key: "codigo", title: "Código" },
                { key: "tag", title: "Tag" },
                {
                    key: "nombre",
                    title: "Nombre",
                    render: function (value, row) {
                        return "<div class='ps-grid-title'><strong>" + escapeHtml(value || "") + "</strong><small>" + escapeHtml(row.descripcion || "") + "</small></div>";
                    }
                },
                { key: "tipoNombre", title: "Tipo" },
                { key: "categoria", title: "Categoría" },
                {
                    key: "marca",
                    title: "Marca",
                    render: function (value) {
                        return escapeHtml(value || "Sin marca");
                    }
                },
                {
                    key: "unidadMedida",
                    title: "Unidad",
                    exportValue: function (_value, row) {
                        return [row.unidadMedida || "", row.unidadAbreviatura || ""].filter(Boolean).join(" ");
                    },
                    render: function (_value, row) {
                        const parts = [row.unidadMedida || "", row.unidadAbreviatura ? "(" + row.unidadAbreviatura + ")" : ""].filter(Boolean);
                        return escapeHtml(parts.join(" "));
                    }
                },
                {
                    key: "costo",
                    title: "Costo",
                    exportValue: function (value) {
                        return value == null ? "" : Number(value);
                    },
                    render: function (value) {
                        return value == null ? "—" : formatCurrency(value);
                    }
                },
                {
                    key: "precioPublico",
                    title: "Precio Público",
                    exportValue: function (value) {
                        return value == null ? "" : Number(value);
                    },
                    render: function (value) {
                        return formatCurrency(value);
                    }
                },
                {
                    key: "causaInventario",
                    title: "Inventario",
                    exportValue: function (_value, row) {
                        if (row.tipo === 2) {
                            return "Servicio";
                        }

                        return row.causaInventario ? "Inventariable" : "Sin inventario";
                    },
                    render: function (_value, row) {
                        if (row.tipo === 2) {
                            return "<span class='ps-inventory-chip ps-inventory-chip--service'>Servicio</span>";
                        }

                        if (row.causaInventario) {
                            return "<span class='ps-inventory-chip ps-inventory-chip--inventory'>Existencia " + escapeHtml(formatDecimal(row.existenciaActual)) + "</span>";
                        }

                        return "<span class='ps-inventory-chip ps-inventory-chip--disabled'>Sin inventario</span>";
                    }
                },
                {
                    key: "activo",
                    title: "Estatus",
                    exportValue: function (value) {
                        return value ? "Activo" : "Inactivo";
                    },
                    render: function (value) {
                        return value
                            ? "<span class='checkapp-badge checkapp-badge-success'>Activo</span>"
                            : "<span class='checkapp-badge checkapp-badge-muted'>Baja lógica</span>";
                    }
                },
                {
                    key: "fechaActualizacion",
                    title: "Actualización",
                    exportValue: function (value) {
                        return formatDisplayDate(value);
                    },
                    render: function (value) {
                        return formatDisplayDate(value);
                    }
                }
            ],
            onLoaded: function (rows) {
                $("#txGridPsVisibleCount").text(rows.length + " visibles");
            },
            emptyText: "No hay productos o servicios para los filtros aplicados."
        });
    }

    function loadCombos() {
        return fetchJson("/ProductosServicios/ObtenerCombosProductosServicios")
            .then(function (data) {
                state.combos = Object.assign({}, state.combos, data || {});
                populateFilterCombos();
                populateModalCombos();
                syncSummarySelection();
                updateFilterSummary();
            });
    }

    function loadSummary() {
        return fetchJson("/ProductosServicios/ObtenerResumenProductosServicios")
            .then(function (data) {
                $("#txResumenPsTotal").text(data.totalRegistros || 0);
                $("#txResumenPsProductos").text(data.totalProductos || 0);
                $("#txResumenPsServicios").text(data.totalServicios || 0);
            })
            .catch(function () {
                $("#txResumenPsTotal").text("0");
                $("#txResumenPsProductos").text("0");
                $("#txResumenPsServicios").text("0");
            });
    }

    function populateFilterCombos() {
        fillSelect("#cbFiltroTipoProductoServicio", state.combos.tipos, {
            includeBlank: true,
            blankText: "Todos",
            valueKey: "clave",
            textKey: "nombre",
            selectedValue: state.summaryType
        });
        fillSelect("#cbFiltroCategoriaProductoServicio", state.combos.categorias, {
            includeBlank: true,
            blankText: "Todas",
            valueKey: "id",
            textKey: "nombre"
        });
        fillSelect("#cbFiltroMarcaProductoServicio", state.combos.marcas, {
            includeBlank: true,
            blankText: "Todas",
            valueKey: "id",
            textKey: "nombre"
        });
        fillSelect("#cbFiltroUnidadProductoServicio", state.combos.unidadesMedida, {
            includeBlank: true,
            blankText: "Todas",
            valueKey: "id",
            textKey: "nombre"
        });
        fillSelect("#cbFiltroEstatusProductosServicios", state.combos.estatus, {
            includeBlank: true,
            blankText: "Todos",
            valueKey: "clave",
            textKey: "nombre"
        });

        initSelect2("#cbFiltroTipoProductoServicio", "Todos");
        initSelect2("#cbFiltroCategoriaProductoServicio", "Todas");
        initSelect2("#cbFiltroMarcaProductoServicio", "Todas");
        initSelect2("#cbFiltroUnidadProductoServicio", "Todas");
        initSelect2("#cbFiltroEstatusProductosServicios", "Todos");
    }

    function populateModalCombos() {
        fillSelect("#cbTipoProductoServicio", state.combos.tipos, {
            includeBlank: false,
            valueKey: "clave",
            textKey: "nombre"
        });
        syncCategoryOptions();
        fillSelect("#cbMarcaProductoServicio", state.combos.marcas, {
            includeBlank: true,
            blankText: "Sin marca",
            valueKey: "id",
            textKey: "nombre"
        });
        fillSelect("#cbUnidadProductoServicio", state.combos.unidadesMedida, {
            includeBlank: false,
            valueKey: "id",
            textKey: "nombre"
        });

        initSelect2("#cbTipoProductoServicio", "Selecciona un tipo", $("#modalProductoServicio"));
        initSelect2("#cbCategoriaProductoServicio", "Selecciona una categoría", $("#modalProductoServicio"));
        initSelect2("#cbMarcaProductoServicio", "Sin marca", $("#modalProductoServicio"));
        initSelect2("#cbUnidadProductoServicio", "Selecciona una unidad", $("#modalProductoServicio"));
    }

    function syncCategoryOptions(selectedValue) {
        const tipo = Number($("#cbTipoProductoServicio").val() || 1);
        const categorias = (state.combos.categorias || []).filter(function (item) {
            return item.aplicaA === 0 || item.aplicaA === tipo;
        });

        fillSelect("#cbCategoriaProductoServicio", categorias, {
            includeBlank: false,
            valueKey: "id",
            textKey: "nombre",
            selectedValue: selectedValue || $("#cbCategoriaProductoServicio").val()
        });
    }

    function fillSelect(selector, items, config) {
        const options = Object.assign({
            includeBlank: false,
            blankText: "",
            valueKey: "id",
            textKey: "text",
            selectedValue: ""
        }, config || {});

        const node = document.querySelector(selector);
        if (!node) {
            return;
        }

        const currentValue = options.selectedValue || "";
        node.innerHTML = "";

        if (options.includeBlank) {
            const blank = document.createElement("option");
            blank.value = "";
            blank.textContent = options.blankText;
            node.appendChild(blank);
        }

        (items || []).forEach(function (item) {
            const option = document.createElement("option");
            option.value = item[options.valueKey] != null ? String(item[options.valueKey]) : "";
            option.textContent = item[options.textKey] != null ? String(item[options.textKey]) : "";
            node.appendChild(option);
        });

        if (currentValue) {
            node.value = currentValue;
        } else if (!options.includeBlank && node.options.length > 0) {
            node.selectedIndex = 0;
        }
    }

    function initSelect2(selector, placeholder, dropdownParent) {
        if (!window.$ || !$.fn || !$.fn.select2) {
            return;
        }

        const node = $(selector);
        if (!node.length) {
            return;
        }

        if (node.hasClass("select2-hidden-accessible")) {
            node.select2("destroy");
        }

        const config = {
            placeholder: placeholder,
            width: "100%",
            allowClear: true,
            minimumResultsForSearch: 8
        };

        if (dropdownParent) {
            config.dropdownParent = dropdownParent;
        }

        node.select2(config);
    }

    function updateFilterSummary() {
        const parts = [];
        const busqueda = ($("#txBusquedaProductosServicios").val() || "").trim();

        pushFilterChip(parts, busqueda, "Búsqueda");
        pushFilterChip(parts, $("#cbFiltroTipoProductoServicio").val(), "Tipo", $("#cbFiltroTipoProductoServicio").find("option:selected").text());
        pushFilterChip(parts, $("#cbFiltroCategoriaProductoServicio").val(), "Categoría", $("#cbFiltroCategoriaProductoServicio").find("option:selected").text());
        pushFilterChip(parts, $("#cbFiltroMarcaProductoServicio").val(), "Marca", $("#cbFiltroMarcaProductoServicio").find("option:selected").text());
        pushFilterChip(parts, $("#cbFiltroUnidadProductoServicio").val(), "Unidad", $("#cbFiltroUnidadProductoServicio").find("option:selected").text());
        pushFilterChip(parts, $("#cbFiltroCausaInventario").val(), "Inventario", $("#cbFiltroCausaInventario").find("option:selected").text());
        pushFilterChip(parts, $("#cbFiltroEstatusProductosServicios").val(), "Estatus", $("#cbFiltroEstatusProductosServicios").find("option:selected").text());

        const accordion = CheckAppUI.getAccordion("productos-servicios-filtros");
        if (accordion) {
            accordion.setSummaryHtml(parts.length ? "<span class='checkapp-summary-inline'>" + parts.join("") + "</span>" : "Sin filtros activos");
        }
    }

    function pushFilterChip(parts, value, label, displayValue) {
        if (!value) {
            return;
        }

        parts.push("<span class='ca-chip ca-chip--secondary'>" + escapeHtml(label) + ": " + escapeHtml(displayValue || value) + "</span>");
    }

    function clearFilters() {
        state.summaryType = "";
        $("#txBusquedaProductosServicios").val("");
        $("#cbFiltroTipoProductoServicio").val("").trigger("change");
        $("#cbFiltroCategoriaProductoServicio").val("").trigger("change");
        $("#cbFiltroMarcaProductoServicio").val("").trigger("change");
        $("#cbFiltroUnidadProductoServicio").val("").trigger("change");
        $("#cbFiltroCausaInventario").val("");
        $("#cbFiltroEstatusProductosServicios").val("").trigger("change");
        syncSummarySelection();
        updateFilterSummary();
        loadSummary();
        CheckAppUI.reloadGrid(gridId);
    }

    function syncSummarySelection() {
        document.querySelectorAll("[data-summary-type]").forEach(function (button) {
            const isSelected = String(button.getAttribute("data-summary-type") || "") === String(state.summaryType || "");
            button.classList.toggle("is-selected", isSelected);
            button.setAttribute("aria-pressed", isSelected ? "true" : "false");
        });
    }

    function buildActions(row) {
        const actions = [
            buildInlineAction("Editar", "fa fa-edit", "editarProductoServicio('" + escapeJs(row.id) + "')")
        ];

        if (row.activo) {
            actions.push(buildInlineAction("Baja lógica", "fa fa-ban", "cambiarEstatusProductoServicio('" + escapeJs(row.id) + "', false)", true));
        } else {
            actions.push(buildInlineAction("Reactivar", "fa fa-check", "cambiarEstatusProductoServicio('" + escapeJs(row.id) + "', true)"));
        }

        return "<div class='ps-action-list'>" + actions.join("") + "</div>";
    }

    function buildInlineAction(label, iconClass, onclick, danger) {
        return "<a href='javascript:void(0)' class='" + (danger ? "is-danger" : "") + "' onclick=\"" + onclick + "\" title='" + escapeHtml(label) + "' aria-label='" + escapeHtml(label) + "'><i class='" + iconClass + "'></i></a>";
    }

    function openCreateModal() {
        if (isModalBusy()) {
            return;
        }

        resetModal();
        $("#txModalProductoServicioKicker").text("Registro");
        $("#txModalProductoServicioTitulo").text("Nuevo producto / servicio");
        $("#btGuardarProductoServicio span").text("Guardar");
        if (!$("#cbTipoProductoServicio").val()) {
            $("#cbTipoProductoServicio").val("1").trigger("change");
        }
        syncTypeVisibility();
        renderImagePreview();
        state.modal.show();
    }

    window.editarProductoServicio = function (id) {
        if (isModalBusy()) {
            return;
        }

        setStatus("#txInfoProductoServicio", "", "");
        fetchJson("/ProductosServicios/ObtenerProductoServicio?idProductoServicio=" + encodeURIComponent(id))
            .then(function (data) {
                resetModal();
                $("#hdProductoServicioId").val(data.id || "");
                $("#txModalProductoServicioKicker").text("Edición");
                $("#txModalProductoServicioTitulo").text("Editar producto / servicio");
                $("#btGuardarProductoServicio span").text("Guardar cambios");

                $("#cbTipoProductoServicio").val(String(data.tipo || "1")).trigger("change");
                $("#txCodigoProductoServicio").val(data.codigo || "");
                $("#txTagProductoServicio").val(data.tag || "");
                $("#txNombreProductoServicio").val(data.nombre || "");
                $("#txDescripcionProductoServicio").val(data.descripcion || "");
                syncCategoryOptions(data.idCategoria || "");
                $("#cbCategoriaProductoServicio").val(data.idCategoria || "").trigger("change");
                $("#cbMarcaProductoServicio").val(data.idMarca || "").trigger("change");
                $("#cbUnidadProductoServicio").val(data.idUnidadMedida || "").trigger("change");
                $("#txCostoProductoServicio").val(data.costo == null ? "" : data.costo);
                $("#txPrecioPublicoProductoServicio").val(data.precioPublico == null ? "" : data.precioPublico);
                $("#chkCausaInventarioProductoServicio").prop("checked", !!data.causaInventario);
                $("#chkPermiteVentaSinExistencia").prop("checked", !!data.permiteVentaSinExistencia);
                $("#txExistenciaInicialProductoServicio").val(data.existenciaActual == null ? "" : data.existenciaActual);
                $("#txExistenciaMinimaProductoServicio").val(data.existenciaMinima == null ? "" : data.existenciaMinima);

                if (data.imagenUrl) {
                    state.existingImage = {
                        url: data.imagenUrl,
                        nombre: data.imagenNombre || ""
                    };
                }

                syncTypeVisibility();
                renderImagePreview();
                state.modal.show();
            })
            .catch(function (error) {
                showError(resolveErrorMessage(error));
            });
    };

    window.cambiarEstatusProductoServicio = function (id, activar) {
        const title = activar ? "¿Reactivar registro?" : "¿Aplicar baja lógica?";
        const text = activar
            ? "El registro volverá a mostrarse como activo."
            : "El registro dejará de mostrarse como activo, conservando su historial.";

        Swal.fire({
            icon: "warning",
            title: title,
            text: text,
            showCancelButton: true,
            confirmButtonText: activar ? "Reactivar" : "Dar de baja",
            cancelButtonText: "Cancelar"
        }).then(function (result) {
            if (!result.isConfirmed) {
                return;
            }

            const url = activar
                ? "/ProductosServicios/ActivarProductoServicio?idProductoServicio=" + encodeURIComponent(id)
                : "/ProductosServicios/BajaProductoServicio?idProductoServicio=" + encodeURIComponent(id);

            fetchJson(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "{}"
            }).then(function (data) {
                showSuccess(resolveServerMessage(data) || "La acción fue completada.");
                loadSummary();
                CheckAppUI.reloadGrid(gridId);
            }).catch(function (error) {
                showError(resolveErrorMessage(error));
            });
        });
    };

    function saveProductoServicio() {
        if (state.isSaving || state.isUploadingImage) {
            return;
        }

        const validation = validateForm();
        if (validation) {
            setStatus("#txInfoProductoServicio", "danger", validation.message);
            markFieldError(validation.selector);
            return;
        }

        const payload = buildPayload();
        beginSaveProgress(buildSaveMessages(payload));
        setStatus("#txInfoProductoServicio", "info", "Guardando producto / servicio...");

        fetchJson("/ProductosServicios/GuardarProductoServicio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).then(function (data) {
            finishSaveProgress();
            state.savedModalImage = true;
            state.imageDraft = null;
            showSuccess(resolveServerMessage(data) || "El registro fue guardado correctamente.");
            state.modal.hide();
            loadCombos();
            loadSummary();
            CheckAppUI.reloadGrid(gridId);
        }).catch(function (error) {
            failSaveProgress();
            setStatus("#txInfoProductoServicio", "danger", resolveErrorMessage(error));
        });
    }

    function validateForm() {
        if (!$("#cbTipoProductoServicio").val()) {
            return { selector: "#cbTipoProductoServicio", message: "Selecciona un tipo." };
        }
        if (!($("#txCodigoProductoServicio").val() || "").trim()) {
            return { selector: "#txCodigoProductoServicio", message: "Captura un código." };
        }
        if (!($("#txNombreProductoServicio").val() || "").trim()) {
            return { selector: "#txNombreProductoServicio", message: "Captura un nombre." };
        }
        if (!$("#cbCategoriaProductoServicio").val()) {
            return { selector: "#cbCategoriaProductoServicio", message: "Selecciona una categoría." };
        }
        if (!$("#cbUnidadProductoServicio").val()) {
            return { selector: "#cbUnidadProductoServicio", message: "Selecciona una unidad." };
        }
        if (($("#txPrecioPublicoProductoServicio").val() || "").trim() === "") {
            return { selector: "#txPrecioPublicoProductoServicio", message: "Captura el precio público." };
        }
        return null;
    }

    function buildPayload() {
        const tipo = Number($("#cbTipoProductoServicio").val() || 1);
        const causaInventario = tipo === 1 && $("#chkCausaInventarioProductoServicio").is(":checked");
        const payload = {
            id: normalizeGuid($("#hdProductoServicioId").val()),
            idEmpresa: sessionStorage.getItem("idEmpresa") || "",
            tipo: tipo,
            codigo: ($("#txCodigoProductoServicio").val() || "").trim(),
            tag: ($("#txTagProductoServicio").val() || "").trim(),
            nombre: ($("#txNombreProductoServicio").val() || "").trim(),
            descripcion: ($("#txDescripcionProductoServicio").val() || "").trim(),
            idCategoria: $("#cbCategoriaProductoServicio").val() || "",
            idMarca: tipo === 2 ? null : normalizeGuid($("#cbMarcaProductoServicio").val()),
            idUnidadMedida: $("#cbUnidadProductoServicio").val() || "",
            costo: toNullableNumber($("#txCostoProductoServicio").val()),
            precioPublico: toNumber($("#txPrecioPublicoProductoServicio").val()),
            causaInventario: causaInventario,
            permiteVentaSinExistencia: causaInventario && $("#chkPermiteVentaSinExistencia").is(":checked"),
            existenciaInicial: causaInventario ? toNullableNumber($("#txExistenciaInicialProductoServicio").val()) : null,
            existenciaMinima: causaInventario ? toNullableNumber($("#txExistenciaMinimaProductoServicio").val()) : null,
            eliminarImagenPrincipal: state.removeExistingImage
        };

        if (!payload.id) {
            delete payload.id;
        }

        if (state.imageDraft && state.imageDraft.archivo) {
            payload.imagenPrincipal = state.imageDraft.archivo;
            payload.eliminarImagenPrincipal = false;
        }

        return payload;
    }

    function syncTypeVisibility() {
        const tipo = Number($("#cbTipoProductoServicio").val() || 1);
        const causaInventario = $("#chkCausaInventarioProductoServicio").is(":checked");
        const isService = tipo === 2;
        const modalNode = document.querySelector("#modalProductoServicio");

        toggleField("#fieldMarcaProductoServicio", !isService);
        toggleField("#panelInventarioProductoServicio", !isService);
        toggleField("#fieldPermiteVentaSinExistencia", !isService && causaInventario);
        toggleField("#fieldExistenciaInicial", !isService && causaInventario);
        toggleField("#fieldExistenciaMinima", !isService && causaInventario);

        if (modalNode) {
            modalNode.classList.toggle("ps-type-service", isService);
            modalNode.classList.toggle("ps-type-product", !isService);
        }

        const inventoryPanel = document.querySelector("#panelInventarioProductoServicio");
        if (inventoryPanel) {
            inventoryPanel.classList.toggle("is-compact", !isService && !causaInventario);
        }

        if (isService) {
            $("#cbMarcaProductoServicio").val("").trigger("change");
            $("#chkCausaInventarioProductoServicio").prop("checked", false);
            $("#chkPermiteVentaSinExistencia").prop("checked", false);
            $("#txExistenciaInicialProductoServicio").val("");
            $("#txExistenciaMinimaProductoServicio").val("");
        }

        if (!isService && !causaInventario) {
            $("#chkPermiteVentaSinExistencia").prop("checked", false);
            $("#txExistenciaInicialProductoServicio").val("");
            $("#txExistenciaMinimaProductoServicio").val("");
        }
    }

    function toggleField(selector, show) {
        const node = document.querySelector(selector);
        if (!node) {
            return;
        }

        node.hidden = !show;
    }

    function handleImageSelection(event) {
        if (state.isSaving || state.isUploadingImage) {
            event.target.value = "";
            return;
        }

        const file = event.target.files && event.target.files[0];
        event.target.value = "";
        if (!file) {
            return;
        }

        if (!isValidImageFile(file)) {
            setStatus("#txInfoImagenProductoServicio", "danger", "Selecciona una imagen JPG, PNG o WEBP de hasta 10 MB.");
            return;
        }

        if (state.imageDraft && state.imageDraft.archivo && state.imageDraft.archivo.temporalToken) {
            cleanupTempTokens([state.imageDraft.archivo.temporalToken]);
        }

        setStatus("#txInfoImagenProductoServicio", "info", "Subiendo imagen...");
        beginImageUpload();

        const formData = new FormData();
        formData.append("archivo", file);

        fetch("/ProductosServicios/SubirImagenTemporal", {
            method: "POST",
            body: formData
        }).then(function (response) {
            return response.text().then(function (text) {
                const data = text ? JSON.parse(text) : {};
                if (!response.ok) {
                    throw new Error(resolveServerMessage(data) || "No fue posible subir la imagen.");
                }

                return data;
            });
        }).then(function (data) {
            state.imageDraft = {
                archivo: data.archivo || null
            };
            state.existingImage = null;
            state.removeExistingImage = false;
            renderImagePreview();
            setStatus("#txInfoImagenProductoServicio", "success", "La imagen quedó lista para guardarse.");
        }).catch(function (error) {
            setStatus("#txInfoImagenProductoServicio", "danger", resolveErrorMessage(error));
        }).finally(function () {
            finishImageUpload();
        });
    }

    function removeCurrentImage() {
        if (state.isSaving || state.isUploadingImage) {
            return;
        }

        if (state.imageDraft && state.imageDraft.archivo && state.imageDraft.archivo.temporalToken) {
            cleanupTempTokens([state.imageDraft.archivo.temporalToken]);
            state.imageDraft = null;
        } else if (state.existingImage) {
            state.existingImage = null;
            state.removeExistingImage = true;
        }

        renderImagePreview();
        setStatus("#txInfoImagenProductoServicio", "", "");
    }

    function renderImagePreview() {
        const host = document.getElementById("psImagePreview");
        if (!host) {
            return;
        }

        host.innerHTML = "";

        let imageUrl = "";
        let imageName = "";

        if (state.imageDraft && state.imageDraft.archivo) {
            imageUrl = state.imageDraft.archivo.urlFirebase || "";
            imageName = state.imageDraft.archivo.nombreOriginal || "Imagen temporal";
        } else if (state.existingImage) {
            imageUrl = state.existingImage.url || "";
            imageName = state.existingImage.nombre || "Imagen actual";
        }

        if (!imageUrl) {
            host.innerHTML = "<div class='ps-image-empty'><i class='fa fa-picture-o'></i><strong>Sin imagen</strong><span>Carga una imagen principal para este registro.</span></div>";
            return;
        }

        host.innerHTML = "<img src='" + escapeHtml(imageUrl) + "' alt='" + escapeHtml(imageName) + "' />";
    }

    function cleanupDraftImageOnClose() {
        if (state.savedModalImage) {
            state.savedModalImage = false;
            return;
        }

        if (state.imageDraft && state.imageDraft.archivo && state.imageDraft.archivo.temporalToken) {
            cleanupTempTokens([state.imageDraft.archivo.temporalToken]);
        }
    }

    function cleanupTempTokens(tokens) {
        if (!tokens || !tokens.length) {
            return Promise.resolve();
        }

        return fetchJson("/ProductosServicios/LimpiarImagenTemporal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tokens: tokens })
        }).catch(function () {
            return null;
        });
    }

    function resetModal() {
        const form = document.getElementById("frmProductoServicio");
        if (form) {
            form.reset();
        }

        $("#hdProductoServicioId").val("");
        $("#cbTipoProductoServicio").val("1").trigger("change");
        syncCategoryOptions();
        $("#cbCategoriaProductoServicio").val($("#cbCategoriaProductoServicio option:first").val()).trigger("change");
        $("#cbMarcaProductoServicio").val("").trigger("change");
        $("#cbUnidadProductoServicio").val($("#cbUnidadProductoServicio option:first").val()).trigger("change");

        state.imageDraft = null;
        state.existingImage = null;
        state.removeExistingImage = false;
        state.savedModalImage = false;
        resetSaveUi();

        setStatus("#txInfoProductoServicio", "", "");
        setStatus("#txInfoImagenProductoServicio", "", "");
        renderImagePreview();
        syncTypeVisibility();
        clearAllFieldErrors();
    }

    function setStatus(selector, level, message) {
        const node = document.querySelector(selector);
        if (!node) {
            return;
        }

        node.className = "checkapp-status-inline";
        if (level) {
            node.classList.add("is-" + level);
        }

        node.textContent = message || "";
    }

    function openQuickCatalogModal(key) {
        const config = quickCatalogConfigs[key];
        if (!config || state.quickCatalogSaving || state.isSaving || state.isUploadingImage) {
            return;
        }

        state.quickCatalogKey = key;
        resetQuickCatalogModal();
        $("#hdQuickCatalogoTipo").val(key);
        $("#txQuickCatalogoTitulo").text(config.title);
        $("#frmQuickCatalogoProductoServicio").attr("data-quick-catalog-layout", key);
        applyQuickCatalogFieldVisibility(config);
        if (config.showAplicaA) {
            $("#cbQuickCatalogoAplicaA").val("0");
        }
        state.quickCatalogModal && state.quickCatalogModal.show();
    }

    function applyQuickCatalogFieldVisibility(config) {
        toggleField("#fieldQuickCatalogoDescripcion", !!config.showDescription);
        toggleField("#fieldQuickCatalogoAplicaA", !!config.showAplicaA);
        toggleField("#fieldQuickCatalogoAbreviatura", !!config.showAbreviatura);
        toggleField("#fieldQuickCatalogoPermiteDecimales", !!config.showPermiteDecimales);
    }

    function resetQuickCatalogModal() {
        state.quickCatalogSaving = false;
        state.quickCatalogKey = "";

        const form = document.querySelector("#frmQuickCatalogoProductoServicio");
        if (form) {
            form.reset();
            form.classList.remove("is-saving");
            form.removeAttribute("data-quick-catalog-layout");
        }

        $("#hdQuickCatalogoTipo").val("");
        $("#txQuickCatalogoTitulo").text("Nuevo catálogo");
        $("#cbQuickCatalogoAplicaA").val("0");
        $("#chkQuickCatalogoPermiteDecimales").prop("checked", false);
        setStatus("#txInfoQuickCatalogo", "", "");
        clearQuickCatalogFieldErrors();
        toggleField("#fieldQuickCatalogoDescripcion", true);
        toggleField("#fieldQuickCatalogoAplicaA", false);
        toggleField("#fieldQuickCatalogoAbreviatura", false);
        toggleField("#fieldQuickCatalogoPermiteDecimales", false);
    }

    function clearQuickCatalogFieldError(selector) {
        const node = document.querySelector(selector);
        if (node) {
            node.classList.remove("is-invalid");
        }
    }

    function clearQuickCatalogFieldErrors() {
        document.querySelectorAll("#frmQuickCatalogoProductoServicio .is-invalid").forEach(function (node) {
            node.classList.remove("is-invalid");
        });
    }

    function saveQuickCatalog() {
        const config = quickCatalogConfigs[state.quickCatalogKey || $("#hdQuickCatalogoTipo").val()];
        if (!config || state.quickCatalogSaving) {
            return;
        }

        const payload = buildQuickCatalogPayload(config);
        const validation = validateQuickCatalogPayload(config, payload);
        if (validation) {
            markFieldError(validation.selector);
            setStatus("#txInfoQuickCatalogo", "danger", validation.message);
            return;
        }

        state.quickCatalogSaving = true;
        $("#frmQuickCatalogoProductoServicio").addClass("is-saving");
        setStatus("#txInfoQuickCatalogo", "info", "Guardando " + config.singular + "...");

        fetchJson(config.saveUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload)
        })
            .then(function (data) {
                const message = resolveServerMessage(data);
                if (!/^El /.test(message || "")) {
                    throw new Error(message || "No fue posible guardar la " + config.singular + ".");
                }

                return resolveQuickCatalogCreatedItem(config, payload)
                    .then(function (item) {
                        if (!item || !item.id) {
                            throw new Error("El catálogo fue creado, pero no fue posible seleccionarlo automáticamente.");
                        }

                        syncQuickCatalogCombo(config, item);
                        state.quickCatalogModal && state.quickCatalogModal.hide();
                        setStatus("#txInfoProductoServicio", "success", "Se agregó la " + config.singular + " y quedó seleccionada.");
                    });
            })
            .catch(function (error) {
                setStatus("#txInfoQuickCatalogo", "danger", resolveErrorMessage(error));
            })
            .finally(function () {
                state.quickCatalogSaving = false;
                $("#frmQuickCatalogoProductoServicio").removeClass("is-saving");
            });
    }

    function buildQuickCatalogPayload(config) {
        const payload = {
            id: "",
            idEmpresa: resolveEmpresaId(),
            codigo: ($("#txQuickCatalogoCodigo").val() || "").trim(),
            nombre: ($("#txQuickCatalogoNombre").val() || "").trim(),
            descripcion: config.showDescription ? ($("#txQuickCatalogoDescripcion").val() || "").trim() : ""
        };

        if (config.showAplicaA) {
            payload.aplicaA = Number($("#cbQuickCatalogoAplicaA").val() || 0);
        }

        if (config.showAbreviatura) {
            payload.abreviatura = ($("#txQuickCatalogoAbreviatura").val() || "").trim();
        }

        if (config.showPermiteDecimales) {
            payload.permiteDecimales = $("#chkQuickCatalogoPermiteDecimales").is(":checked");
        }

        return payload;
    }

    function validateQuickCatalogPayload(config, payload) {
        if (!payload.codigo || payload.codigo.length > config.codeMax) {
            return {
                selector: "#txQuickCatalogoCodigo",
                message: "Captura un código válido de hasta " + config.codeMax + " caracteres."
            };
        }

        if (!payload.nombre || payload.nombre.length > config.nameMax) {
            return {
                selector: "#txQuickCatalogoNombre",
                message: "Captura un nombre válido de hasta " + config.nameMax + " caracteres."
            };
        }

        if (config.showDescription && payload.descripcion.length > config.descriptionMax) {
            return {
                selector: "#txQuickCatalogoDescripcion",
                message: "La descripción no puede exceder " + config.descriptionMax + " caracteres."
            };
        }

        if (config.showAbreviatura) {
            if (!payload.abreviatura || payload.abreviatura.length > config.abreviaturaMax) {
                return {
                    selector: "#txQuickCatalogoAbreviatura",
                    message: "Captura una abreviatura válida de hasta " + config.abreviaturaMax + " caracteres."
                };
            }
        }

        return null;
    }

    function resolveQuickCatalogCreatedItem(config, payload) {
        const query = new URLSearchParams({
            busqueda: payload.codigo || payload.nombre || "",
            estatus: "activos"
        });

        return fetchJson(config.listUrl + "?" + query.toString())
            .then(function (data) {
                const items = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
                return findQuickCatalogCreatedItem(items, payload);
            });
    }

    function findQuickCatalogCreatedItem(items, payload) {
        const normalizedCodigo = normalizeCatalogCompareValue(payload.codigo);
        const normalizedNombre = normalizeCatalogCompareValue(payload.nombre);

        return (items || []).find(function (item) {
            if (!item || !item.id || item.activo === false) {
                return false;
            }

            return normalizeCatalogCompareValue(item.codigo) === normalizedCodigo
                && normalizeCatalogCompareValue(item.nombre) === normalizedNombre;
        }) || null;
    }

    function syncQuickCatalogCombo(config, item) {
        const collectionKey = config.comboCollectionKey;
        const currentItems = Array.isArray(state.combos[collectionKey]) ? state.combos[collectionKey].slice() : [];
        const nextItem = normalizeQuickCatalogComboItem(config, item);
        const modalSelections = {
            tipo: $("#cbTipoProductoServicio").val() || "",
            categoria: $("#cbCategoriaProductoServicio").val() || "",
            marca: $("#cbMarcaProductoServicio").val() || "",
            unidad: $("#cbUnidadProductoServicio").val() || ""
        };
        const filteredItems = currentItems.filter(function (entry) {
            return String(entry.id || "") !== String(nextItem.id || "");
        });

        filteredItems.push(nextItem);
        filteredItems.sort(function (a, b) {
            return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", { sensitivity: "base" });
        });
        state.combos[collectionKey] = filteredItems;

        populateModalCombos();
        $("#cbTipoProductoServicio").val(modalSelections.tipo).trigger("change");
        syncCategoryOptions(modalSelections.categoria);
        $("#cbCategoriaProductoServicio").val(modalSelections.categoria).trigger("change");
        $("#cbMarcaProductoServicio").val(modalSelections.marca).trigger("change");
        $("#cbUnidadProductoServicio").val(modalSelections.unidad).trigger("change");
        if (config.key === "categoria") {
            syncCategoryOptions(nextItem.id);
            $("#cbCategoriaProductoServicio").val(nextItem.id).trigger("change");
        } else {
            $(config.selectSelector).val(nextItem.id).trigger("change");
        }
    }

    function normalizeQuickCatalogComboItem(config, item) {
        const normalized = {
            id: item.id,
            codigo: item.codigo || "",
            nombre: item.nombre || ""
        };

        if (config.key === "categoria") {
            normalized.aplicaA = item.aplicaA == null ? 0 : Number(item.aplicaA);
        }

        if (config.key === "unidad") {
            normalized.abreviatura = item.abreviatura || "";
            normalized.permiteDecimales = !!item.permiteDecimales;
        }

        return normalized;
    }

    function normalizeCatalogCompareValue(value) {
        return String(value || "")
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    function markFieldError(selector) {
        if (!selector) {
            return;
        }

        const node = document.querySelector(selector);
        if (node) {
            node.classList.add("is-invalid");
        }
    }

    function clearFieldError(selector) {
        const node = document.querySelector(selector);
        if (node) {
            node.classList.remove("is-invalid");
        }
    }

    function clearAllFieldErrors() {
        document.querySelectorAll("#frmProductoServicio .is-invalid").forEach(function (node) {
            node.classList.remove("is-invalid");
        });
    }

    function beginSaveProgress(messages) {
        stopSaveProgressTimer();
        state.isSaving = true;
        const progressMessages = messages && messages.length ? messages.slice() : ["Guardando producto / servicio..."];
        let messageIndex = 0;

        syncModalBusyUi(true, "Guardando producto / servicio...", progressMessages[0]);
        state.saveProgressTimerId = window.setInterval(function () {
            if (!state.isSaving || messageIndex >= progressMessages.length - 1) {
                return;
            }

            messageIndex += 1;
            syncModalBusyUi(true, "Guardando producto / servicio...", progressMessages[messageIndex]);
        }, 1200);
    }

    function finishSaveProgress() {
        stopSaveProgressTimer();
        state.isSaving = false;
        syncModalBusyUi(state.isUploadingImage, "Subiendo imagen...", "Procesando imagen...");
        if (!state.isUploadingImage) {
            syncModalBusyUi(false, "Guardando producto / servicio...", "Preparando información del registro...");
        }
    }

    function failSaveProgress() {
        stopSaveProgressTimer();
        state.isSaving = false;
        syncModalBusyUi(state.isUploadingImage, "Subiendo imagen...", "Procesando imagen...");
        if (!state.isUploadingImage) {
            syncModalBusyUi(false, "Guardando producto / servicio...", "Preparando información del registro...");
        }
    }

    function stopSaveProgressTimer() {
        if (state.saveProgressTimerId) {
            window.clearInterval(state.saveProgressTimerId);
            state.saveProgressTimerId = 0;
        }
    }

    function beginImageUpload() {
        state.isUploadingImage = true;
        syncModalBusyUi(true, "Subiendo imagen...", "Preparando imagen...");
    }

    function finishImageUpload() {
        state.isUploadingImage = false;
        if (state.isSaving) {
            syncModalBusyUi(true, "Guardando producto / servicio...", "Finalizando registro...");
            return;
        }

        syncModalBusyUi(false, "Guardando producto / servicio...", "Preparando información del registro...");
    }

    function resetSaveUi() {
        stopSaveProgressTimer();
        state.isSaving = false;
        state.isUploadingImage = false;
        syncModalBusyUi(false, "Guardando producto / servicio...", "Preparando información del registro...");
    }

    function syncModalBusyUi(isBusy, title, status) {
        $("#modalProductoServicio").toggleClass("is-saving", !!isBusy);
        $("#productosServiciosSaveOverlay").attr("aria-hidden", isBusy ? "false" : "true");
        $("#txProductosServiciosSaveTitle").text(title || "Guardando producto / servicio...");
        $("#txProductosServiciosSaveStatus").text(status || "Preparando información del registro...");
        $("#frmProductoServicio").find("input, textarea, select, button").prop("disabled", !!isBusy);
        $("#flImagenProductoServicio").prop("disabled", !!isBusy);
    }

    function buildSaveMessages(payload) {
        const messages = ["Validando información del registro..."];

        if (payload.imagenPrincipal) {
            messages.push("Confirmando imagen principal...");
        }

        messages.push("Guardando producto / servicio...");
        messages.push("Actualizando listado...");
        return messages;
    }

    function isModalBusy() {
        return state.isSaving || state.isUploadingImage;
    }

    function fetchJson(url, options) {
        return fetch(url, options).then(function (response) {
            return response.text().then(function (text) {
                const data = text ? JSON.parse(text) : {};
                if (!response.ok) {
                    throw new Error(resolveServerMessage(data) || "No fue posible completar la acción.");
                }

                return data;
            });
        });
    }

    function appendQuery(params, key, value) {
        if (value == null || value === "") {
            return;
        }

        params.append(key, String(value));
    }

    function resolveServerMessage(data) {
        if (!data) {
            return "";
        }

        if (typeof data.d === "string") {
            return data.d;
        }

        if (typeof data.mensaje === "string") {
            return data.mensaje;
        }

        return "";
    }

    function resolveErrorMessage(error) {
        return error && error.message ? error.message : "No fue posible completar la acción.";
    }

    function resolveModalApi(selector) {
        const modalNode = document.querySelector(selector);
        if (!modalNode) {
            return null;
        }

        if (window.bootstrap && window.bootstrap.Modal) {
            return window.bootstrap.Modal.getOrCreateInstance(modalNode);
        }

        return {
            show: function () { $(selector).modal("show"); },
            hide: function () { $(selector).modal("hide"); }
        };
    }

    function resolveEmpresaId() {
        return String(window.sessionStorage ? window.sessionStorage.getItem("idEmpresa") || "" : "").trim();
    }

    function normalizeGuid(value) {
        const text = String(value || "").trim();
        return text ? text : null;
    }

    function toNullableNumber(value) {
        const text = String(value == null ? "" : value).trim();
        if (!text) {
            return null;
        }

        const parsed = Number(text);
        return Number.isFinite(parsed) ? parsed : null;
    }

    function toNumber(value) {
        const parsed = Number(String(value == null ? "" : value).trim());
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function formatCurrency(value) {
        const number = Number(value || 0);
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    }

    function formatDecimal(value) {
        if (value == null || value === "") {
            return "0";
        }

        return new Intl.NumberFormat("es-MX", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 4
        }).format(Number(value || 0));
    }

    function formatDisplayDate(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return new Intl.DateTimeFormat("es-MX", {
            dateStyle: "short",
            timeStyle: "short"
        }).format(date);
    }

    function formatDateForFile(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return year + month + day + "_" + hours + minutes;
    }

    function isValidImageFile(file) {
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        return validTypes.indexOf(file.type) >= 0 && Number(file.size || 0) <= (10 * 1024 * 1024);
    }

    function escapeHtml(value) {
        const text = String(value == null ? "" : value);
        if (window.CheckAppUI && typeof window.CheckAppUI.escapeHtml === "function") {
            return window.CheckAppUI.escapeHtml(text);
        }

        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function escapeJs(value) {
        return String(value == null ? "" : value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    }

    function showSuccess(message) {
        Swal.fire({
            icon: "success",
            title: "Listo",
            text: message,
            confirmButtonText: "Aceptar"
        });
    }

    function showError(message) {
        Swal.fire({
            icon: "error",
            title: "No fue posible completar la acción",
            text: message,
            confirmButtonText: "Aceptar"
        });
    }
})(window, document, window.jQuery);
