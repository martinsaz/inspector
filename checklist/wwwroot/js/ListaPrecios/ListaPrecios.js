(function () {
    "use strict";

    const gridId = "listaPreciosGrid";
    const state = {
        grid: null,
        rows: [],
        combosLoaded: false,
        requestVersion: 0,
        canWrite: false,
        currentRow: null,
        currentResolution: null,
        modal: null,
        inventoryModal: null,
        bulkModal: null,
        bulkPreview: null,
        copyModal: null,
        copyPreview: null,
        brandDiscountModal: null,
        brandDiscountPreview: null,
        suggestionsModal: null,
        columnsModal: null,
        suggestions: [],
        suggestionTab: "all",
        auditModal: null,
        auditItems: [],
        auditPage: 1,
        auditTotalPages: 0,
        filterAccordion: null,
        collapseFiltersAfterLoad: false,
        editorFocusLevel: 1,
        editorDetails: [],
        editorCommercial: null,
        editorCommercialInitial: "",
        attributeValues: [],
        selectedAttributeValues: new Set(),
        selectedBranches: new Set(),
        selected: new Map()
    };

    $(init);

    function init() {
        if (!$("[data-lista-precios-page='index']").length) {
            return;
        }

        state.canWrite = String($("[data-lista-precios-page='index']").data("canWrite")) === "true";
        initEditorModal();
        initGrid();
        bindDynamicGridActions();
        bindEvents();
        loadCombos().then(reloadGrid).catch(handleInitialError);
    }

    function bindDynamicGridActions() {
        const root = document.documentElement;
        if (root.dataset.lpGridActionsBound === "true") {
            return;
        }

        root.dataset.lpGridActionsBound = "true";
        document.addEventListener("click", handleDynamicGridAction, true);
    }

    function handleDynamicGridAction(event) {
        const origin = event.target instanceof Element ? event.target : null;
        const action = origin ? origin.closest("[data-lp-edit-row],[data-lp-inventory-row]") : null;
        if (!action || !action.closest("#gridListaPreciosHost")) {
            return;
        }

        if (action.hasAttribute("data-lp-edit-row")) {
            const index = Number(action.dataset.lpEditRow);
            const row = state.rows[index];
            if (row) {
                openEditor(row, Number(action.dataset.lpLevel || row.lista || 1));
            }
            return;
        }

        const index = Number(action.dataset.lpInventoryRow);
        const row = state.rows[index];
        if (row) {
            openInventory(row);
        }
    }

    function bindEvents() {
        state.filterAccordion = CheckAppUI.createFilterAccordion({
            id: "accordionFiltrosListaPrecios",
            selector: "#accordionFiltrosListaPrecios",
            summarySelector: ".checkapp-accordion-summary",
            emptySummaryText: buildFilterSummary()
        });

        bindButtonClick("btBuscarListaPrecios", searchAndCollapse);
        bindButtonClick("btLimpiarListaPrecios", clearFilters);
        $("#txBusquedaListaPrecios").on("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                searchAndCollapse();
            }
        });

        $("#cbFiltroListaPrecio,#cbFiltroCategoriaListaPrecios,#cbFiltroMarcaListaPrecios,#cbFiltroColeccionListaPrecios,#cbFiltroEtiquetaListaPrecios,#cbFiltroVarianteListaPrecios,#cbFiltroPresentacionListaPrecios,#cbFiltroExistenciaListaPrecios,#cbFiltroEstatusListaPrecios,#txFiltroDescuentoListaPrecios")
            .on("change", reloadGrid);
        $("#cbFiltroAtributoListaPrecios").on("change", function () {
            state.selectedAttributeValues.clear();
            renderAttributeValueOptions();
            reloadGrid();
        });
        $("#cbFiltroTipoListaPrecios").on("change", function () {
            updateTypeDependentFilters();
            reloadGrid();
        });
        $("#txFiltroPrecioMinimoListaPrecios,#txFiltroPrecioMaximoListaPrecios,#txFiltroCantidadListaPrecios").on("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                searchAndCollapse();
            }
        }).on("change", reloadGrid);

        $("#ckTodasSucursalesListaPrecios").on("change", function () {
            const all = this.checked;
            if (all) state.selectedBranches.clear();
            setDropdownDisabled("#lpSucursalesDropdown", "#btFiltroSucursalListaPrecios", all);
            updateBranchDropdownLabel();
            reloadGrid();
        });
        bindCheckDropdown("#btFiltroSucursalListaPrecios", "#panelFiltroSucursalListaPrecios");
        bindCheckDropdown("#btFiltroValoresAtributoListaPrecios", "#panelFiltroValoresAtributoListaPrecios");
        $("#panelFiltroSucursalListaPrecios").on("change", "input[type='checkbox']", function () {
            updateSetFromCheckbox(state.selectedBranches, this);
            if (state.selectedBranches.size === 0) {
                $("#ckTodasSucursalesListaPrecios").prop("checked", true);
                setDropdownDisabled("#lpSucursalesDropdown", "#btFiltroSucursalListaPrecios", true);
            }
            updateBranchDropdownLabel();
            reloadGrid();
        });
        $("#panelFiltroValoresAtributoListaPrecios").on("change", "input[type='checkbox']", function () {
            updateSetFromCheckbox(state.selectedAttributeValues, this);
            updateAttributeValueDropdownLabel();
            reloadGrid();
        });
        $("#ckMostrarFotografiasListaPrecios").on("change", function () {
            togglePhotoColumn(this.checked);
        });

        $("[data-lp-summary-type]").on("click", function () {
            const type = String($(this).data("lpSummaryType") || "");
            $("#cbFiltroTipoListaPrecios").val(type === "1" || type === "2" ? type : "");
            $(".lp-summary-strip .checkapp-summary-card").removeClass("is-selected").attr("aria-pressed", "false");
            $(this).addClass("is-selected").attr("aria-pressed", "true");
            reloadGrid();
        });

        $("#lpEditorMatrizRows").on("change", "[data-lp-matrix-price],[data-lp-matrix-discount-input],[data-lp-matrix-final-input]", function () {
            recalculateMatrixRow($(this).closest("tr"), $(this).is("[data-lp-matrix-final-input]") ? "final" : ($(this).is("[data-lp-matrix-discount-input]") ? "discount" : "price"));
            refreshMatrixRowDirty($(this).closest("tr"));
            updateEditorSaveState();
        }).on("focusin", "input", function () {
            state.editorFocusLevel = Number($(this).closest("tr").data("lpMatrixLevel") || 1);
            $("#lpEditorMatrizRows tr").removeClass("is-focused");
            $(this).closest("tr").addClass("is-focused");
            syncFocusedEditorOptions();
        }).on("click", "[data-lp-archive-id]", function () {
            archiveMatrixPrice(String($(this).data("lpArchiveId")));
        });
        $("[data-lp-commercial]").on("input change", updateEditorSaveState);
        $("input[name='lpEditorRedondeo']").on("change", applyEditorRounding);
        $("input[name='lpEditorRedondeoAlcance']").on("change", function () {
            if ($(this).val() === "all" && Number($("input[name='lpEditorRedondeo']:checked").val() || 0) !== 0) {
                applyEditorRounding();
            }
            updateRoundingControls();
        });
        $("#btLpAplicarRedondeo").on("click", applyEditorRoundingToAll);
        $("#btLpGuardar").on("click", saveEditor);
        $("#btAjusteMasivoListaPrecios").on("click", openBulkEditor);
        $("#btCopiarListaPrecios").on("click", openCopyEditor);
        $("#btDescuentoMarcaListaPrecios").on("click", openBrandDiscountEditor);
        $("#btSugerirAccionesListaPrecios").on("click", openSuggestions);
        $("#btColumnasListaPrecios").on("click", openColumnsEditor);
        $("#btLpColumnsApply").on("click", applyVisibleColumns);
        $("#btLpAuditBuscar").on("click", function () { loadAuditHistory(1); });
        $("#btLpAuditLimpiar").on("click", clearAuditFilters);
        $("#btLpAuditPrev").on("click", function () { if (state.auditPage > 1) loadAuditHistory(state.auditPage - 1); });
        $("#btLpAuditNext").on("click", function () { if (state.auditPage < state.auditTotalPages) loadAuditHistory(state.auditPage + 1); });
        $("#lpAuditPageSize").on("change", function () { loadAuditHistory(1); });
        $("#lpAuditBusqueda,#lpAuditCorrelation,#lpAuditUsuario").on("keydown", function (event) {
            if (event.key === "Enter") { event.preventDefault(); loadAuditHistory(1); }
        });
        $("#lpAuditRows").on("click", "[data-lp-audit-detail]", function () {
            showAuditDetail(state.auditItems[Number($(this).data("lpAuditDetail"))]);
        }).on("click", "[data-lp-audit-correlation]", function () {
            $("#lpAuditCorrelation").val(String($(this).data("lpAuditCorrelation")));
            loadAuditHistory(1);
        });
        $("#btLpClearSelection").on("click", clearSelection);
        $("#lpBulkTipo").on("change", updateBulkOperations);
        $("#lpBulkTarget").on("change", syncBulkTarget);
        $("#lpBulkNivel,#lpBulkCampo,#lpBulkTipo,#lpBulkOperacion,#lpBulkValor").on("change input", invalidateBulkPreview);
        $("#btLpBulkPreview").on("click", previewBulkAdjustment);
        $("#lpBulkConfirm").on("change", updateBulkExecuteState);
        $("#btLpBulkExecute").on("click", executeBulkAdjustment);
        $("#lpCopyOrigen,#lpCopyDestino,#lpCopyDiscount").on("change input", invalidateCopyPreview);
        $("#btLpCopyPreview").on("click", previewCopy);
        $("#lpCopyConfirm").on("change", updateCopyExecuteState);
        $("#btLpCopyExecute").on("click", executeCopy);
        $("#lpBrandDiscountMarca,#lpBrandDiscountNivel,#lpBrandDiscountPct").on("change input", invalidateBrandDiscountPreview);
        $("#btLpBrandDiscountPreview").on("click", previewBrandDiscount);
        $("#lpBrandDiscountConfirm").on("change", updateBrandDiscountExecuteState);
        $("#btLpBrandDiscountExecute").on("click", executeBrandDiscount);
        $("#lpSuggestionTabs").on("click", "[data-lp-suggestion-tab]", function () { state.suggestionTab = String($(this).data("lpSuggestionTab") || "all"); renderSuggestions(); });
        $("#lpSuggestionsRows").on("click", "[data-lp-suggestion-row]", function () { const row = state.rows[Number($(this).data("lpSuggestionRow"))]; if (row) openInventory(row); });
        $("#gridListaPreciosHost").on("change", "[data-lp-select-row]", function () {
            const index = Number($(this).data("lpSelectRow"));
            const row = state.rows[index];
            if (!row) return;
            const key = identityKey(row);
            if (this.checked) state.selected.set(key, row);
            else state.selected.delete(key);
            updateSelectionState();
        });
    }

    function bindButtonClick(id, handler) {
        const button = document.getElementById(id);
        if (!button) {
            return;
        }

        let lastInvocation = 0;
        const invoke = function (event) {
            event.preventDefault();
            const now = Date.now();
            if (now - lastInvocation < 250) {
                return;
            }

            lastInvocation = now;
            handler();
        };

        button.addEventListener("click", invoke);
        button.addEventListener("mouseup", invoke);
        button.addEventListener("pointerup", invoke);
        button.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                invoke(event);
            }
        });
    }

    function buildMatrixColumns() {
        const columns = [];
        for (let level = 1; level <= 10; level += 1) {
            columns.push({
                key: "p" + level,
                title: "P" + level,
                type: "currency",
                hideable: false,
                render: function (value, row) {
                    const formatted = formatMatrixPrice(value) || formatMoney(0);
                    const discount = matrixNumericValue(row["d" + level]) || 0;
                    const finalValue = matrixNumericValue(row["f" + level]);
                    const content = discount > 0 && finalValue !== null
                        ? "<span class='lp-matrix-price-original'>" + formatted + "</span><span class='lp-matrix-price-final'>" + formatMoney(finalValue) + "</span>"
                        : formatted;
                    return "<button type='button' class='lp-matrix-price" + (discount > 0 ? " has-discount" : "") + "' data-lp-edit-row='" + row.__lpIndex + "' data-lp-level='" + level + "' title='Abrir Lista " + level + "'>" + content + "</button>";
                },
                exportValue: matrixExportValue
            });
            columns.push({
                key: "d" + level,
                title: "D" + level + "%",
                type: "number",
                hideable: false,
                render: function (value, row) {
                    const formatted = formatMatrixDiscount(value) || "0.00";
                    const highlighted = (matrixNumericValue(value) || 0) > 0;
                    return "<button type='button' class='lp-matrix-discount" + (highlighted ? " has-discount" : "") + "' data-lp-edit-row='" + row.__lpIndex + "' data-lp-level='" + level + "' title='Abrir Lista " + level + "'>" + escapeHtml(formatted) + "</button>";
                },
                exportValue: matrixExportValue
            });
        }
        return columns;
    }

    function isMatrixValueAbsent(value) {
        return value === null
            || value === undefined
            || (typeof value === "string" && value.trim() === "");
    }

    function matrixNumericValue(value) {
        if (isMatrixValueAbsent(value)) {
            return null;
        }

        const number = Number(value);
        return Number.isFinite(number) ? number : null;
    }

    function formatMatrixPrice(value) {
        const number = matrixNumericValue(value);
        return number === null ? null : formatMoney(number);
    }

    function formatMatrixDiscount(value) {
        const number = matrixNumericValue(value);
        return number === null ? null : formatNumberInput(number);
    }

    function matrixExportValue(value) {
        const number = matrixNumericValue(value);
        return number === null ? "" : number;
    }

    function initGrid() {
        state.grid = CheckAppUI.createDynamicGrid({
            id: gridId,
            hostSelector: "#gridListaPreciosHost",
            tableSelector: "#grListaPrecios",
            searchInputSelector: "#txBusquedaGridListaPrecios",
            exportButtonSelector: "#btExportarListaPrecios",
            columnToggleButtonSelector: "#btColumnasListaPrecios",
            columnTogglePanelSelector: "#panelColumnasListaPrecios",
            resultCountSelector: "#txGridListaPreciosCount",
            footerRangeSelector: "#txGridListaPreciosRange",
            footerPageIndicatorSelector: "#txGridListaPreciosPageIndicator",
            footerPrevButtonSelector: "#btGridListaPreciosPrev",
            footerNextButtonSelector: "#btGridListaPreciosNext",
            footerPageSizeSelector: "#txGridListaPreciosPageSize",
            pageLength: 25,
            lengthMenu: [[25, 50, 100], [25, 50, 100]],
            order: [[2, "asc"]],
            mobileCardTitleKey: "nombre",
            exportSheetName: "ListaPrecios",
            exportFileName: function () {
                return "ListaPrecios_" + formatDateForFile(new Date()) + ".xlsx";
            },
            loadData: function () {
                const validation = validateAdvancedFilters();
                if (!validation.ok) {
                    showFilterFeedback(validation.message);
                    return Promise.resolve(state.rows);
                }

                clearFilterFeedback();
                clearSelection();
                const requestVersion = ++state.requestVersion;
                const query = new URLSearchParams();
                appendQuery(query, "nivel", $("#cbFiltroListaPrecio").val() || "1");
                appendQuery(query, "busqueda", $("#txBusquedaListaPrecios").val());
                appendQuery(query, "tipo", $("#cbFiltroTipoListaPrecios").val());
                appendQuery(query, "idCategoria", $("#cbFiltroCategoriaListaPrecios").val());
                appendQuery(query, "idMarca", $("#cbFiltroMarcaListaPrecios").val());
                appendQuery(query, "idColeccion", $("#cbFiltroColeccionListaPrecios").val());
                appendQuery(query, "idEtiqueta", $("#cbFiltroEtiquetaListaPrecios").val());
                appendQuery(query, "idAtributo", $("#cbFiltroAtributoListaPrecios").val());
                appendQuery(query, "valoresAtributo", Array.from(state.selectedAttributeValues).join(","));
                appendQuery(query, "idVariante", $("#cbFiltroVarianteListaPrecios").val());
                appendQuery(query, "idPresentacionVenta", $("#cbFiltroPresentacionListaPrecios").val());
                appendQuery(query, "precioMinimo", $("#txFiltroPrecioMinimoListaPrecios").val());
                appendQuery(query, "precioMaximo", $("#txFiltroPrecioMaximoListaPrecios").val());
                appendQuery(query, "descuento", $("#txFiltroDescuentoListaPrecios").val());
                if (!$("#ckTodasSucursalesListaPrecios").prop("checked")) {
                    appendQuery(query, "sucursales", Array.from(state.selectedBranches).join(","));
                }
                appendQuery(query, "existencia", $("#cbFiltroExistenciaListaPrecios").val());
                appendQuery(query, "cantidadMenorA", $("#txFiltroCantidadListaPrecios").val());
                appendQuery(query, "estatus", $("#cbFiltroEstatusListaPrecios").val() || "activos");

                return fetchJson("/ListaPrecios/Consultar?" + query.toString()).then(function (rows) {
                    const nextRows = Array.isArray(rows) ? rows : [];
                    if (requestVersion !== state.requestVersion) {
                        return state.rows.length ? state.rows : nextRows;
                    }

                    state.rows = nextRows;
                    state.rows.forEach(function (row, index) {
                        row.__lpIndex = index;
                    });
                    if (state.collapseFiltersAfterLoad && state.filterAccordion && typeof state.filterAccordion.setOpen === "function") {
                        state.filterAccordion.setOpen(false);
                    }
                    state.collapseFiltersAfterLoad = false;
                    return state.rows;
                });
            },
            columns: [
                {
                    key: "seleccion",
                    title: "Seleccionar",
                    sortable: false,
                    hideable: false,
                    exportable: false,
                    render: function (_value, row) {
                        const checked = state.selected.has(identityKey(row)) ? " checked" : "";
                        return "<input type='checkbox' class='lp-row-select' data-lp-select-row='" + row.__lpIndex + "' aria-label='Seleccionar " + escapeHtml(row.nombre || "identidad") + "'" + checked + ">";
                    }
                },
                {
                    key: "imagenUrl",
                    title: "Foto",
                    sortable: false,
                    visible: false,
                    exportable: false,
                    render: function (_value, row) {
                        return buildPhotoCell(row, "lp-grid-photo", false);
                    }
                },
                {
                    key: "nombre",
                    title: "Identidad",
                    hideable: false,
                    render: function (value, row) {
                        const helper = row.productoPadre && row.productoPadre !== value
                            ? row.productoPadre + " · " + row.tipoIdentidadNombre
                            : row.tipoIdentidadNombre;
                        return "<div class='ps-grid-title lp-grid-title'><strong>" + escapeHtml(value || "") + "</strong><small>" + escapeHtml(helper || "") + "</small></div>";
                    }
                },
                { key: "codigo", title: "Código" },
                { key: "tipoNombre", title: "Tipo", visible: false },
                { key: "categoria", title: "Categoría" },
                {
                    key: "marca",
                    title: "Marca",
                    render: function (value) {
                        return escapeHtml(value || "Sin marca");
                    }
                },
                { key: "identidadVendible", title: "Presentación / variante" },
                {
                    key: "existencia",
                    title: "Existencia",
                    type: "number",
                    render: function (value, row) {
                        if (!row.inventarioAplicable) return "<span class='lp-muted'>N/A</span>";
                        return "<button type='button' class='lp-stock-link' data-lp-inventory-row='" + row.__lpIndex + "' title='Ver existencias y movimientos'>" + escapeHtml(formatQuantity(value)) + "</button>";
                    },
                    exportValue: function (value, row) {
                        return row.inventarioAplicable ? (value !== null && value !== undefined ? value : 0) : "N/A";
                    }
                },
                ...buildMatrixColumns(),
                {
                    key: "lista",
                    title: "Lista seleccionada",
                    visible: false,
                    render: function (value) {
                        return "Lista " + escapeHtml(value || "1");
                    }
                },
                {
                    key: "precioBase",
                    title: "Precio Base",
                    type: "currency",
                    visible: false,
                    render: function (value) {
                        return "<span class='lp-money'>" + formatMoney(value) + "</span>";
                    },
                    exportValue: function (value) {
                        return value !== null && value !== undefined ? value : "";
                    }
                },
                {
                    key: "precioLista",
                    title: "Precio Lista",
                    type: "currency",
                    hideable: false,
                    visible: false,
                    render: function (value, row) {
                        if (row.codigoResolucion === "PRECIO_LISTA") {
                            return "<span class='lp-money lp-money--configured'>" + formatMoney(value) + "</span>";
                        }

                        return "<span class='lp-muted'>Sin precio lista</span>";
                    },
                    exportValue: function (value, row) {
                        return row.codigoResolucion === "PRECIO_LISTA" ? value : "";
                    }
                },
                {
                    key: "descuentoPct",
                    title: "Descuento",
                    type: "number",
                    visible: false,
                    render: function (value) {
                        return value !== null && value !== undefined
                            ? "<span class='lp-discount'>" + escapeHtml(formatNumberInput(value)) + "%</span>"
                            : "<span class='lp-muted'>Sin descuento</span>";
                    },
                    exportValue: function (value) {
                        return value !== null && value !== undefined ? value : "";
                    }
                },
                {
                    key: "precioFinal",
                    title: "Precio final",
                    type: "currency",
                    hideable: false,
                    visible: false,
                    render: function (value, row) {
                        const finalValue = value !== null && value !== undefined ? value : row.precioEfectivo;
                        return row.resuelto ? "<span class='lp-money'>" + formatMoney(finalValue) + "</span>" : "<span class='lp-muted'>No resoluble</span>";
                    },
                    exportValue: function (value, row) {
                        return value !== null && value !== undefined ? value : row.precioEfectivo;
                    }
                },
                {
                    key: "origenNombre",
                    title: "Origen",
                    hideable: false,
                    visible: false,
                    render: function (value, row) {
                        const configured = row.codigoResolucion === "PRECIO_LISTA";
                        const css = configured ? "ca-chip ca-chip--success lp-origin-chip" : "ca-chip ca-chip--secondary lp-origin-chip";
                        return "<span class='" + css + "'>" + escapeHtml(value || row.origen || "") + "</span>";
                    }
                },
                {
                    key: "estatus",
                    title: "Estatus",
                    render: function (value, row) {
                        const active = row.activo && row.productoActivo;
                        return "<span class='ca-chip " + (active ? "ca-chip--success" : "ca-chip--danger") + "'>" + escapeHtml(value || (active ? "Activo" : "Inactivo")) + "</span>";
                    }
                }
            ],
            onLoaded: function (rows) {
                updateSummary(rows || []);
                updateFilterSummary();
                $("#txGridLpVisibleCount").text((rows || []).length + " visibles");
                $("#btAjusteMasivoListaPrecios").prop("disabled", !state.canWrite || !(rows || []).length);
            },
            emptyText: "No se encontraron productos o servicios para los filtros seleccionados.",
            errorText: "No fue posible cargar la Lista de Precios."
        });
    }

    function initEditorModal() {
        const modalElement = document.getElementById("modalListaPreciosEditor");
        if (modalElement && window.bootstrap && window.bootstrap.Modal) {
            state.modal = new window.bootstrap.Modal(modalElement);
        }

        const inventoryModalElement = document.getElementById("modalListaPreciosInventario");
        if (inventoryModalElement && window.bootstrap && window.bootstrap.Modal) {
            state.inventoryModal = new window.bootstrap.Modal(inventoryModalElement);
        }

        const bulkModalElement = document.getElementById("modalListaPreciosMasivo");
        if (bulkModalElement && window.bootstrap && window.bootstrap.Modal) {
            state.bulkModal = new window.bootstrap.Modal(bulkModalElement);
        }

        const copyModalElement = document.getElementById("modalListaPreciosCopia");
        if (copyModalElement && window.bootstrap && window.bootstrap.Modal) {
            state.copyModal = new window.bootstrap.Modal(copyModalElement);
        }

        const brandDiscountModalElement = document.getElementById("modalListaPreciosDescuentoMarca");
        if (brandDiscountModalElement && window.bootstrap && window.bootstrap.Modal) {
            state.brandDiscountModal = new window.bootstrap.Modal(brandDiscountModalElement);
        }

        const suggestionsModalElement = document.getElementById("modalListaPreciosSugerencias");
        if (suggestionsModalElement && window.bootstrap && window.bootstrap.Modal) {
            state.suggestionsModal = new window.bootstrap.Modal(suggestionsModalElement);
        }

        const columnsModalElement = document.getElementById("modalListaPreciosColumnas");
        if (columnsModalElement && window.bootstrap && window.bootstrap.Modal) {
            state.columnsModal = new window.bootstrap.Modal(columnsModalElement);
        }

        const auditModalElement = document.getElementById("modalListaPreciosHistorial");
        if (auditModalElement && window.bootstrap && window.bootstrap.Modal) {
            state.auditModal = new window.bootstrap.Modal(auditModalElement);
        }
    }

    function loadCombos() {
        return fetchJson("/ListaPrecios/ObtenerCombos").then(function (combos) {
            fillSelect("#cbFiltroListaPrecio", combos.listas || [], false);
            fillSelect("#lpBulkNivel", combos.listas || [], false);
            fillSelect("#lpCopyOrigen", combos.listas || [], false);
            fillSelect("#lpCopyDestino", combos.listas || [], false);
            fillSelect("#lpBrandDiscountNivel", combos.listas || [], false);
            fillSelect("#lpAuditNivel", combos.listas || [], true, "Todas");
            fillSelect("#lpBrandDiscountMarca", combos.marcas || [], true, "Selecciona una marca");
            fillSelect("#cbFiltroTipoListaPrecios", combos.tipos || [], false);
            fillSelect("#cbFiltroCategoriaListaPrecios", combos.categorias || [], true, "Todas");
            fillSelect("#cbFiltroMarcaListaPrecios", combos.marcas || [], true, "Todas");
            const $bulkTarget = $("#lpBulkTarget").empty();
            for (let level = 1; level <= 10; level += 1) $bulkTarget.append($("<option>").val("PRECIO|" + level).text("Precio " + level));
            for (let level = 1; level <= 10; level += 1) $bulkTarget.append($("<option>").val("DESCUENTO|" + level).text("Descuento " + level));
            fillSelect("#cbFiltroColeccionListaPrecios", combos.colecciones || [], true, "Todas");
            fillSelect("#cbFiltroEtiquetaListaPrecios", combos.etiquetas || [], true, "Todas");
            fillSelect("#cbFiltroAtributoListaPrecios", combos.atributos || [], true, "Todos");
            state.attributeValues = combos.valoresAtributos || [];
            renderAttributeValueOptions();
            fillSelect("#cbFiltroVarianteListaPrecios", combos.variantes || [], true, "Todas");
            fillSelect("#cbFiltroPresentacionListaPrecios", combos.presentacionesVenta || [], true, "Todas");
            renderBranchOptions(combos.sucursales || []);
            fillSelect("#cbFiltroEstatusListaPrecios", combos.estatus || [], false);
            $("#cbFiltroListaPrecio").val("1");
            $("#lpCopyOrigen").val("1");
            $("#lpCopyDestino").val("2");
            $("#cbFiltroEstatusListaPrecios").val("activos");
            state.combosLoaded = true;
            updateTypeDependentFilters();
            updateFilterSummary();
        });
    }

    function fillSelect(selector, items, includeEmpty, emptyText) {
        const $select = $(selector);
        $select.empty();
        if (includeEmpty) {
            $select.append($("<option>").val("").text(emptyText || "Todos"));
        }

        (items || []).forEach(function (item) {
            const value = item.clave || item.id || "";
            $select.append($("<option>").val(value).text(item.nombre || value));
        });
    }

    function renderBranchOptions(items) {
        const $panel = $("#panelFiltroSucursalListaPrecios").empty();
        (items || []).forEach(function (item) {
            const value = String(item.clave || item.id || "");
            $panel.append("<label class='lp-check-option'><input type='checkbox' value='" + escapeHtml(value) + "'><span>" + escapeHtml(item.nombre || value) + "</span></label>");
        });
        updateBranchDropdownLabel();
    }

    function renderAttributeValueOptions() {
        const attributeId = String($("#cbFiltroAtributoListaPrecios").val() || "");
        const items = state.attributeValues.filter(function (item) { return String(item.parentId || "") === attributeId; });
        const $panel = $("#panelFiltroValoresAtributoListaPrecios").empty();
        items.forEach(function (item) {
            const value = String(item.clave || item.id || "");
            $panel.append("<label class='lp-check-option'><input type='checkbox' value='" + escapeHtml(value) + "'><span>" + escapeHtml(item.nombre || value) + "</span></label>");
        });
        const disabled = !attributeId || !items.length;
        setDropdownDisabled("#lpAtributoValoresDropdown", "#btFiltroValoresAtributoListaPrecios", disabled);
        updateAttributeValueDropdownLabel();
    }

    function bindCheckDropdown(triggerSelector, panelSelector) {
        $(triggerSelector).on("click", function (event) {
            event.stopPropagation();
            if (this.disabled) return;
            const open = $(panelSelector).is("[hidden]");
            $(".lp-check-dropdown-panel").attr("hidden", true);
            $(".lp-check-dropdown-trigger").attr("aria-expanded", "false");
            if (open) {
                $(panelSelector).removeAttr("hidden");
                $(this).attr("aria-expanded", "true");
            }
        });
        $(panelSelector).on("click", function (event) { event.stopPropagation(); });
        $(document).on("click", function () {
            $(panelSelector).attr("hidden", true);
            $(triggerSelector).attr("aria-expanded", "false");
        });
    }

    function setDropdownDisabled(hostSelector, triggerSelector, disabled) {
        $(hostSelector).toggleClass("is-disabled", !!disabled);
        $(triggerSelector).prop("disabled", !!disabled);
        if (disabled) $(hostSelector).find(".lp-check-dropdown-panel").attr("hidden", true);
    }

    function updateSetFromCheckbox(set, checkbox) {
        const value = String(checkbox.value || "");
        if (checkbox.checked) set.add(value); else set.delete(value);
    }

    function updateBranchDropdownLabel() {
        const labels = $("#panelFiltroSucursalListaPrecios input:checked").map(function () { return $(this).siblings("span").text(); }).get();
        const text = labels.length === 0 ? "Seleccionar sucursales" : labels.length <= 2 ? labels.join(", ") : labels.length + " sucursales";
        $("#btFiltroSucursalListaPrecios > span").text(text);
    }

    function updateAttributeValueDropdownLabel() {
        const labels = $("#panelFiltroValoresAtributoListaPrecios input:checked").map(function () { return $(this).siblings("span").text(); }).get();
        const attributeSelected = !!String($("#cbFiltroAtributoListaPrecios").val() || "");
        const text = !attributeSelected ? "Selecciona un atributo" : labels.length === 0 ? "Todos" : labels.length <= 2 ? labels.join(", ") : labels.length + " valores";
        $("#btFiltroValoresAtributoListaPrecios > span").text(text);
    }

    function reloadGrid() {
        CheckAppUI.reloadGrid(gridId);
    }

    function searchAndCollapse() {
        state.collapseFiltersAfterLoad = true;
        reloadGrid();
    }

    function togglePhotoColumn(show) {
        $(".lista-precios-page").toggleClass("lp-photos-enabled", !!show);
        const grid = window.CheckAppUI && typeof window.CheckAppUI.getGrid === "function" ? window.CheckAppUI.getGrid(gridId) : null;
        if (grid && grid.instance) {
            grid.instance.column(1).visible(!!show);
        }
    }

    function identityKey(row) {
        return [row.tipoIdentidad || 0, row.idProductoServicio || "", row.idVariante || "", row.idPresentacionVenta || ""].join("|");
    }

    function clearSelection() {
        state.selected.clear();
        $("[data-lp-select-row]").prop("checked", false);
        updateSelectionState();
    }

    function updateSelectionState() {
        const count = state.selected.size;
        $("#txLpSelectedCount").text(count + (count === 1 ? " seleccionado" : " seleccionados"));
        $("#btLpClearSelection").prop("disabled", count === 0);
        $("#btAjusteMasivoListaPrecios").prop("disabled", !state.canWrite || state.rows.length === 0);
        invalidateBulkPreview();
    }

    function openBulkEditor() {
        if (!state.canWrite || state.rows.length === 0) return;
        $("#lpBulkTarget").val("PRECIO|" + String($("#cbFiltroListaPrecio").val() || "1"));
        syncBulkTarget();
        $("#lpBulkTipo").val("MONTO");
        $("#lpBulkValor").val("0");
        updateBulkOperations();
        clearBulkAlert();
        invalidateBulkPreview();
        if (state.bulkModal) state.bulkModal.show();
        else $("#modalListaPreciosMasivo").addClass("show").show();
    }

    function updateBulkOperations() {
        const exact = $("#lpBulkTipo").val() === "VALOR";
        const $operation = $("#lpBulkOperacion").empty();
        if (exact) $operation.append($("<option>").val("ASIGNAR").text("Asignar"));
        else {
            $operation.append($("<option>").val("SUMAR").text("Sumar"));
            $operation.append($("<option>").val("RESTAR").text("Restar"));
        }
        invalidateBulkPreview();
    }

    function syncBulkTarget() {
        const parts = String($("#lpBulkTarget").val() || "PRECIO|1").split("|");
        $("#lpBulkCampo").val(parts[0]);
        $("#lpBulkNivel").val(parts[1]);
        invalidateBulkPreview();
    }

    function buildBulkPayload() {
        return {
            nivel: Number($("#lpBulkNivel").val() || 0),
            campo: $("#lpBulkCampo").val(),
            tipoAjuste: $("#lpBulkTipo").val(),
            operacion: $("#lpBulkOperacion").val(),
            valor: Number($("#lpBulkValor").val()),
            motivo: "Ajuste masivo",
            correlationId: state.bulkPreview ? state.bulkPreview.correlationId : null,
            identidades: state.rows.map(function (row) {
                return {
                    tipoIdentidad: row.tipoIdentidad,
                    idProductoServicio: row.idProductoServicio,
                    idVariante: row.idVariante || null,
                    idPresentacionVenta: row.idPresentacionVenta || null
                };
            })
        };
    }

    function validateBulkPayload(payload) {
        if (!payload.identidades.length) return "No hay productos en los filtros actuales.";
        if (!payload.nivel || payload.nivel < 1 || payload.nivel > 10) return "Selecciona una lista destino válida.";
        if (!Number.isFinite(payload.valor) || payload.valor < 0) return "Captura un valor válido mayor o igual a cero.";
        return "";
    }

    function previewBulkAdjustment() {
        const payload = buildBulkPayload();
        const error = validateBulkPayload(payload);
        if (error) return showBulkAlert(error, "error");
        setBusy("#btLpBulkPreview", true);
        postJson("/ListaPrecios/PreviewAjusteMasivo", payload).then(function (result) {
            state.bulkPreview = result;
            renderBulkPreview(result);
            if ((result.rechazados || 0) > 0 || (result.aceptados || 0) === 0) {
                showBulkAlert("No hay productos aplicables o existen resultados rechazados.", "error");
            }
        }).catch(function (requestError) {
            showBulkAlert("No se aplicó ningún cambio. " + requestError.message, "error");
        }).finally(function () {
            setBusy("#btLpBulkPreview", false);
        });
    }

    function renderBulkPreview(result) {
        const names = new Map(Array.from(state.selected.entries()).map(function (entry) { return [entry[0], entry[1].nombre || entry[1].identidadVendible || "Identidad"]; }));
        const rows = (result.items || []).map(function (item) {
            const key = identityKey(item);
            const status = item.aceptado ? "<span class='ca-chip ca-chip--success'>Aceptado</span>" : "<span class='ca-chip ca-chip--danger'>" + escapeHtml(item.codigo || "Rechazado") + "</span>";
            return "<tr><td>" + escapeHtml(names.get(key) || key) + "</td><td>" + formatBulkValue(item.valorActual) + "</td><td>" + formatBulkValue(item.valorPropuesto) + "</td><td>" + formatBulkValue(item.diferencia) + "</td><td>" + formatBulkValue(item.descuentoPct) + "%</td><td>" + escapeHtml(redondeoLabel(item.redondeoModo)) + "</td><td>" + formatMoney(item.precioFinal) + "</td><td>" + status + "</td></tr>";
        }).join("");
        $("#lpBulkPreviewRows").html(rows);
        $("#lpBulkSummary").text((result.aceptados || 0) + " aceptados · " + (result.rechazados || 0) + " rechazados");
        $("#lpBulkPreviewPanel").removeAttr("hidden");
        $("#lpBulkConfirm").prop("checked", false).prop("disabled", (result.rechazados || 0) > 0);
        updateBulkExecuteState();
    }

    function executeBulkAdjustment() {
        if (!state.bulkPreview || !$("#lpBulkConfirm").prop("checked")) return;
        const payload = buildBulkPayload();
        payload.correlationId = state.bulkPreview.correlationId;
        setBusy("#btLpBulkExecute", true);
        postJson("/ListaPrecios/EjecutarAjusteMasivo", payload).then(function (result) {
            showBulkAlert((result.aceptados || 0) + " identidades actualizadas en una sola operación.", "success");
            clearSelection();
            setTimeout(function () {
                if (state.bulkModal) state.bulkModal.hide();
                reloadGrid();
            }, 500);
        }).catch(function (error) {
            showBulkAlert("No se aplicó ningún cambio. " + error.message, "error");
        }).finally(function () {
            setBusy("#btLpBulkExecute", false);
        });
    }

    function invalidateBulkPreview() {
        state.bulkPreview = null;
        $("#lpBulkPreviewPanel").attr("hidden", "hidden");
        $("#lpBulkConfirm").prop("checked", false);
        updateBulkExecuteState();
    }

    function updateBulkExecuteState() {
        const canExecute = state.canWrite && state.bulkPreview && !state.bulkPreview.rechazados && $("#lpBulkConfirm").prop("checked");
        $("#btLpBulkExecute").prop("disabled", !canExecute);
    }

    function showBulkAlert(message, type) {
        $("#lpBulkAlert").removeAttr("hidden").removeClass("is-error is-success is-info").addClass("is-" + type).text(message);
    }

    function clearBulkAlert() {
        $("#lpBulkAlert").attr("hidden", "hidden").text("");
    }

    function formatBulkValue(value) {
        return value === null || value === undefined ? "-" : escapeHtml(formatNumberInput(value));
    }

    function redondeoLabel(value) {
        if (Number(value) === 1) return "A 4/9";
        if (Number(value) === 2) return "Solo a 9";
        return "Sin redondeo";
    }

    function openCopyEditor() {
        if (!state.canWrite) return;
        $("#lpCopyOrigen").val(String($("#cbFiltroListaPrecio").val() || "1"));
        const source = Number($("#lpCopyOrigen").val() || 1);
        $("#lpCopyDestino").val(String(source === 10 ? 1 : source + 1));
        $("#lpCopyModo").val("SOBRESCRIBIR");
        $("#lpCopyDiscount").prop("checked", false);
        clearCopyAlert();
        invalidateCopyPreview();
        if (state.copyModal) state.copyModal.show();
        else $("#modalListaPreciosCopia").addClass("show").show();
    }

    function buildCopyPayload() {
        return {
            nivelOrigen: Number($("#lpCopyOrigen").val() || 0),
            nivelDestino: Number($("#lpCopyDestino").val() || 0),
            modo: String($("#lpCopyModo").val() || ""),
            copiarDescuentos: $("#lpCopyDiscount").prop("checked"),
            motivo: "Copia de lista",
            correlationId: state.copyPreview ? state.copyPreview.correlationId : null
        };
    }

    function validateCopyPayload(payload) {
        if (payload.nivelOrigen < 1 || payload.nivelOrigen > 10 || payload.nivelDestino < 1 || payload.nivelDestino > 10) return "Selecciona listas válidas.";
        if (payload.nivelOrigen === payload.nivelDestino) return "La lista origen y destino deben ser diferentes.";
        return "";
    }

    function previewCopy() {
        const payload = buildCopyPayload();
        const error = validateCopyPayload(payload);
        if (error) return showCopyAlert(error, "error");
        setBusy("#btLpCopyPreview", true);
        postJson("/ListaPrecios/PreviewCopiarLista", payload).then(function (result) {
            state.copyPreview = result;
            if ((result.rechazados || 0) > 0 || (result.totalOrigenActivo || 0) === 0) throw new Error("La lista origen no tiene configuraciones aplicables o existen resultados rechazados.");
            return confirmCheckApp("Se copiará la Lista " + payload.nivelOrigen + " a la Lista " + payload.nivelDestino + ". ¿Deseas continuar?", "Copiar").then(function (confirmed) {
                if (!confirmed) return null;
                payload.correlationId = result.correlationId;
                return postJson("/ListaPrecios/EjecutarCopiarLista", payload);
            });
        }).then(function (result) {
            if (!result) return;
            if (state.copyModal) state.copyModal.hide();
            $("#cbFiltroListaPrecio").val(String(result.nivelDestino));
            showCheckAppSuccess("Lista copiada correctamente.");
            return reloadGrid();
        }).catch(function (requestError) {
            showCopyAlert("No se aplicó ningún cambio. " + requestError.message, "error");
        }).finally(function () {
            setBusy("#btLpCopyPreview", false);
        });
    }

    function renderCopyPreview(result) {
        const names = new Map(state.rows.map(function (row) { return [identityKey(row), row.nombre || row.identidadVendible || "Identidad"]; }));
        const rows = (result.items || []).map(function (item) {
            const key = identityKey(item);
            const status = item.aceptado ? "<span class='ca-chip ca-chip--success'>" + escapeHtml(item.codigo || "OK") + "</span>" : "<span class='ca-chip ca-chip--danger'>" + escapeHtml(item.codigo || "Rechazado") + "</span>";
            const vigencia = formatCopyDate(item.vigenciaInicioAfter) + " / " + formatCopyDate(item.vigenciaFinAfter);
            return "<tr><td>" + escapeHtml(names.get(key) || key) + "</td><td>" + escapeHtml(item.estadoDestino || "-") + "</td><td>" + escapeHtml(item.accion || "-") + "</td><td>" + formatCopyMoney(item.precioDestinoBefore) + "</td><td>" + formatCopyMoney(item.precioAfter) + "</td><td>" + formatBulkValue(item.descuentoDestinoBefore) + " → " + formatBulkValue(item.descuentoAfter) + "</td><td>" + escapeHtml(redondeoLabel(item.redondeoAfter)) + "</td><td>" + escapeHtml(vigencia) + "</td><td>" + status + "</td></tr>";
        }).join("");
        $("#lpCopyPreviewRows").html(rows);
        $("#lpCopySummary").text("Origen " + (result.totalOrigenActivo || 0) + " · Nuevos " + (result.nuevos || 0) + " · Reactivados " + (result.reactivados || 0) + " · Sobrescritos " + (result.sobrescritos || 0) + " · Omitidos " + (result.omitidos || 0) + " · Rechazados " + (result.rechazados || 0));
        $("#lpCopyPreviewPanel").removeAttr("hidden");
        $("#lpCopyConfirm").prop("checked", false).prop("disabled", (result.rechazados || 0) > 0);
        updateCopyExecuteState();
    }

    function executeCopy() {
        if (!state.copyPreview || !$("#lpCopyConfirm").prop("checked")) return;
        const payload = buildCopyPayload();
        payload.correlationId = state.copyPreview.correlationId;
        setBusy("#btLpCopyExecute", true);
        postJson("/ListaPrecios/EjecutarCopiarLista", payload).then(function (result) {
            showCopyAlert("Copia aplicada: " + (result.nuevos || 0) + " nuevos, " + (result.reactivados || 0) + " reactivados, " + (result.sobrescritos || 0) + " sobrescritos y " + (result.omitidos || 0) + " omitidos.", "success");
            $("#cbFiltroListaPrecio").val(String(result.nivelDestino));
            setTimeout(function () {
                if (state.copyModal) state.copyModal.hide();
                reloadGrid();
            }, 500);
        }).catch(function (error) {
            showCopyAlert("No se aplicó ningún cambio. " + error.message, "error");
        }).finally(function () {
            setBusy("#btLpCopyExecute", false);
        });
    }

    function invalidateCopyPreview() {
        state.copyPreview = null;
        $("#lpCopyPreviewPanel").attr("hidden", "hidden");
        $("#lpCopyConfirm").prop("checked", false);
        updateCopyExecuteState();
    }

    function updateCopyExecuteState() {
        const canExecute = state.canWrite && state.copyPreview && !state.copyPreview.rechazados && $("#lpCopyConfirm").prop("checked");
        $("#btLpCopyExecute").prop("disabled", !canExecute);
    }

    function showCopyAlert(message, type) {
        $("#lpCopyAlert").removeAttr("hidden").removeClass("is-error is-success is-info").addClass("is-" + type).text(message);
    }

    function clearCopyAlert() {
        $("#lpCopyAlert").attr("hidden", "hidden").text("");
    }

    function formatCopyMoney(value) {
        return value === null || value === undefined ? "-" : formatMoney(value);
    }

    function formatCopyDate(value) {
        if (!value) return "Sin límite";
        return String(value).slice(0, 10);
    }

    function openBrandDiscountEditor() {
        if (!state.canWrite) return;
        $("#lpBrandDiscountMarca").val(String($("#cbFiltroMarcaListaPrecios").val() || ""));
        $("#lpBrandDiscountNivel").val(String($("#cbFiltroListaPrecio").val() || "1"));
        $("#lpBrandDiscountPct").val("0");
        clearBrandDiscountAlert();
        invalidateBrandDiscountPreview();
        if (state.brandDiscountModal) state.brandDiscountModal.show();
        else $("#modalListaPreciosDescuentoMarca").addClass("show").show();
    }

    function buildBrandDiscountPayload() {
        return {
            idMarca: String($("#lpBrandDiscountMarca").val() || ""),
            nivel: Number($("#lpBrandDiscountNivel").val() || 0),
            descuentoPct: Number($("#lpBrandDiscountPct").val()),
            motivo: "Descuento por marca",
            correlationId: state.brandDiscountPreview ? state.brandDiscountPreview.correlationId : null
        };
    }

    function validateBrandDiscountPayload(payload) {
        if (!payload.idMarca) return "Selecciona una marca.";
        if (payload.nivel < 1 || payload.nivel > 10) return "Selecciona una lista destino válida.";
        if (!Number.isFinite(payload.descuentoPct) || payload.descuentoPct < 0 || payload.descuentoPct > 100) return "El descuento debe estar entre 0 y 100.";
        return "";
    }

    function previewBrandDiscount() {
        const payload = buildBrandDiscountPayload();
        const error = validateBrandDiscountPayload(payload);
        if (error) return showBrandDiscountAlert(error, "error");
        setBusy("#btLpBrandDiscountPreview", true);
        postJson("/ListaPrecios/PreviewDescuentoMarca", payload).then(function (result) {
            state.brandDiscountPreview = result;
            if ((result.rechazados || 0) > 0 || (result.evaluados || 0) === 0) throw new Error("La marca no tiene productos o servicios activos aplicables.");
            return confirmCheckApp("Se aplicará " + payload.descuentoPct + "% a " + result.evaluados + " productos. ¿Deseas continuar?", "Aplicar").then(function (confirmed) {
                if (!confirmed) return null;
                payload.correlationId = result.correlationId;
                return postJson("/ListaPrecios/EjecutarDescuentoMarca", payload);
            });
        }).then(function (result) {
            if (!result) return;
            if (state.brandDiscountModal) state.brandDiscountModal.hide();
            showCheckAppSuccess("Descuento aplicado a " + (result.afectados || 0) + " productos.");
            return reloadGrid();
        }).catch(function (requestError) {
            showBrandDiscountAlert("No se aplicó ningún cambio. " + requestError.message, "error");
        }).finally(function () {
            setBusy("#btLpBrandDiscountPreview", false);
        });
    }

    function renderBrandDiscountPreview(result) {
        const rows = (result.items || []).map(function (item) {
            const status = item.aceptado
                ? "<span class='ca-chip ca-chip--success'>" + escapeHtml(item.codigo || "OK") + "</span>"
                : "<span class='ca-chip ca-chip--danger'>" + escapeHtml(item.codigo || "Rechazado") + "</span>";
            return "<tr><td>" + escapeHtml(item.identidad || identityKey(item)) + "</td><td>" + formatCopyMoney(item.precioListaBefore) + "</td><td>" + formatBulkValue(item.descuentoBefore) + "%</td><td>" + formatBulkValue(item.descuentoAfter) + "%</td><td>" + formatCopyMoney(item.precioFinalBefore) + "</td><td>" + formatCopyMoney(item.precioFinalAfter) + "</td><td>" + escapeHtml(item.accion || "-") + "</td><td>" + status + "</td></tr>";
        }).join("");
        $("#lpBrandDiscountPreviewRows").html(rows);
        $("#lpBrandDiscountSummary").text((result.marca || "Marca") + " · Evaluados " + (result.evaluados || 0) + " · Afectados " + (result.afectados || 0) + " · Omitidos " + (result.omitidos || 0) + " · Rechazados " + (result.rechazados || 0));
        $("#lpBrandDiscountPreviewPanel").removeAttr("hidden");
        const blocked = (result.rechazados || 0) > 0 || (result.evaluados || 0) === 0;
        $("#lpBrandDiscountConfirm").prop("checked", false).prop("disabled", blocked);
        updateBrandDiscountExecuteState();
    }

    function executeBrandDiscount() {
        if (!state.brandDiscountPreview || !$("#lpBrandDiscountConfirm").prop("checked")) return;
        const payload = buildBrandDiscountPayload();
        payload.correlationId = state.brandDiscountPreview.correlationId;
        setBusy("#btLpBrandDiscountExecute", true);
        postJson("/ListaPrecios/EjecutarDescuentoMarca", payload).then(function (result) {
            showBrandDiscountAlert("Descuento aplicado: " + (result.afectados || 0) + " afectados y " + (result.omitidos || 0) + " omitidos.", "success");
            setTimeout(function () {
                if (state.brandDiscountModal) state.brandDiscountModal.hide();
                reloadGrid();
            }, 500);
        }).catch(function (error) {
            showBrandDiscountAlert("No se aplicó ningún cambio. " + error.message, "error");
        }).finally(function () {
            setBusy("#btLpBrandDiscountExecute", false);
        });
    }

    function invalidateBrandDiscountPreview() {
        state.brandDiscountPreview = null;
        $("#lpBrandDiscountPreviewPanel").attr("hidden", "hidden");
        $("#lpBrandDiscountConfirm").prop("checked", false);
        updateBrandDiscountExecuteState();
    }

    function updateBrandDiscountExecuteState() {
        const preview = state.brandDiscountPreview;
        const canExecute = state.canWrite && preview && !preview.rechazados && preview.evaluados > 0 && $("#lpBrandDiscountConfirm").prop("checked");
        $("#btLpBrandDiscountExecute").prop("disabled", !canExecute);
    }

    function showBrandDiscountAlert(message, type) {
        $("#lpBrandDiscountAlert").removeAttr("hidden").removeClass("is-error is-success is-info").addClass("is-" + type).text(message);
    }

    function clearBrandDiscountAlert() {
        $("#lpBrandDiscountAlert").attr("hidden", "hidden").text("");
    }

    function openSuggestions() {
        state.suggestionTab = "all";
        state.suggestions = state.rows.map(function (row, index) {
            const stockKnown = !!row.inventarioAplicable && row.existencia !== null && row.existencia !== undefined;
            const stock = stockKnown ? Number(row.existencia || 0) : null;
            const discount = row.descuentoPct === null || row.descuentoPct === undefined ? 0 : Number(row.descuentoPct);
            let action = "watch";
            let score = 0;
            const reasons = [];
            if (stockKnown && stock >= 20) { score += 25; reasons.push("existencia alta"); }
            if (discount < 5) { score += 15; reasons.push("sin descuento aplicado"); }
            if (stockKnown && stock > 0 && score >= 40) action = "offer";
            else if (!stockKnown) reasons.push("existencia no disponible");
            else if (stock <= 0) reasons.push("sin existencia; ventas no disponibles para recomendar resurtido");
            else reasons.push("revisar comportamiento");
            return { row: row, index: index, action: action, score: score, reason: reasons.join(", ") };
        });
        const brand = $("#cbFiltroMarcaListaPrecios option:selected").text();
        $("#lpSuggestionsContext").text((String($("#cbFiltroMarcaListaPrecios").val() || "") ? brand + " · " : "") + "Análisis preliminar · datos en pantalla");
        renderSuggestions();
        if (state.suggestionsModal) state.suggestionsModal.show(); else $("#modalListaPreciosSugerencias").addClass("show").show();
    }

    function withGrid(callback) {
        return Promise.resolve(state.grid).then(function (grid) {
            if (grid && grid.instance) callback(grid);
        });
    }

    function openColumnsEditor() {
        withGrid(function (grid) {
            $("#lpVisibleColumns [data-lp-column-index]").each(function () {
                const index = Number($(this).data("lpColumnIndex"));
                this.checked = grid.instance.column(index).visible();
            });
            if (state.columnsModal) state.columnsModal.show();
        });
    }

    function applyVisibleColumns() {
        withGrid(function (grid) {
            $("#lpVisibleColumns [data-lp-column-index]").each(function () {
                grid.instance.column(Number($(this).data("lpColumnIndex"))).visible(this.checked, false);
            });
            grid.instance.columns.adjust().draw(false);
            if (state.columnsModal) state.columnsModal.hide();
        });
    }

    function renderSuggestions() {
        const counts = { all: state.suggestions.length, offer: 0, restock: 0, watch: 0 };
        state.suggestions.forEach(function (item) { counts[item.action] += 1; });
        $("#lpSuggestionTabs [data-lp-suggestion-tab]").each(function () {
            const tab = String($(this).data("lpSuggestionTab"));
            $(this).toggleClass("is-active", tab === state.suggestionTab).find("span").text(counts[tab] || 0);
        });
        const visible = state.suggestions.filter(function (item) { return state.suggestionTab === "all" || item.action === state.suggestionTab; });
        const labels = { offer: "Ofertar", restock: "Resurtir", watch: "Vigilar" };
        $("#lpSuggestionsRows").html(visible.map(function (item) {
            const row = item.row;
            const stock = row.inventarioAplicable ? formatQuantity(row.existencia) : "N/A";
            const discount = row.descuentoPct === null || row.descuentoPct === undefined ? "—" : formatNumberInput(row.descuentoPct);
            const price = row.precioFinal === null || row.precioFinal === undefined ? "N/A" : formatMoney(row.precioFinal);
            const cost = row.costo === null || row.costo === undefined ? "N/A" : formatMoney(row.costo);
            const margin = row.margenPct === null || row.margenPct === undefined ? "N/A" : escapeHtml(formatNumberInput(row.margenPct)) + "%";
            return "<tr><td><span class='lp-suggestion-badge is-" + item.action + "'>" + labels[item.action] + "</span></td><td><strong>" + item.score + "</strong></td><td>" + escapeHtml(row.nombre || row.identidadVendible || "Identidad") + "</td><td>" + escapeHtml(stock) + "</td><td>N/A</td><td>" + escapeHtml(discount) + "</td><td>" + price + "</td><td>" + cost + "</td><td>" + margin + "</td><td>" + escapeHtml(item.reason) + "</td><td>" + (row.inventarioAplicable ? "<button type='button' class='checkapp-btn checkapp-btn-ghost' data-lp-suggestion-row='" + item.index + "'>Ver movs.</button>" : "") + "</td></tr>";
        }).join("") || "<tr><td colspan='11' class='lp-muted'>Sin sugerencias para esta categoría.</td></tr>");
        $("#lpSuggestionsSummary").text(state.rows.length + " productos en pantalla · " + state.suggestions.length + " evaluados");
    }

    function openEditor(row, focusLevel) {
        state.currentRow = row;
        state.editorFocusLevel = Math.max(1, Math.min(10, Number(focusLevel || row.lista || 1)));
        state.editorDetails = [];

        clearEditorAlert();
        $("#modalListaPreciosEditorTitle").text(row.nombre || "Precio comercial");
        $("#lpEditorSubtitle").text((row.identidadVendible || row.tipoIdentidadNombre || "Producto o servicio") + " · " + (row.codigo || "Sin código"));
        $("#lpEditorContext").html(buildEditorContext(row));
        renderEditorDescription(row.descripcion);
        state.editorCommercial = null;
        state.editorCommercialInitial = "";
        setEditorWriteState();
        $("#lpEditorMatrizRows").html("<tr><td colspan='4' class='lp-muted'>Cargando las diez listas…</td></tr>");

        if (state.modal) {
            state.modal.show();
        } else {
            $("#modalListaPreciosEditor").addClass("show").show();
        }

        const editorQuery = new URLSearchParams();
        appendQuery(editorQuery, "idProductoServicio", row.idProductoServicio); appendQuery(editorQuery, "tipoIdentidad", row.tipoIdentidad);
        appendQuery(editorQuery, "idVariante", row.idVariante); appendQuery(editorQuery, "idPresentacionVenta", row.idPresentacionVenta);
        fetchJson("/ListaPrecios/Editor?" + editorQuery.toString()).then(function (editor) {
            const items = Array.isArray(editor && editor.listas) ? editor.listas : [];
            state.editorDetails = items.filter(function (item) {
                return Number(item.tipoIdentidad) === Number(row.tipoIdentidad) &&
                    String(item.idVariante || "") === String(row.idVariante || "") &&
                    String(item.idPresentacionVenta || "") === String(row.idPresentacionVenta || "");
            });
            renderCommercialEditor((editor && editor.comercial) || {});
            renderEditorMatrix();
        }).catch(function (error) {
            showEditorAlert("No fue posible cargar la matriz de precios. " + error.message, "error");
            renderEditorMatrix();
        });
    }

    function renderEditorMatrix() {
        const row = state.currentRow || {};
        const $body = $("#lpEditorMatrizRows").empty();
        for (let level = 1; level <= 10; level += 1) {
            const detail = state.editorDetails.find(function (item) { return Number(item.nivel) === level && item.activo; });
            const matrixPrice = row["p" + level];
            const matrixDiscount = row["d" + level];
            const price = detail ? detail.precio : (matrixNumericValue(matrixPrice) ?? 0);
            const discount = detail ? detail.descuentoPct : (matrixNumericValue(matrixDiscount) ?? 0);
            const mode = detail ? Number(detail.redondeoModo || 0) : 0;
            const finalPrice = calculateRoundedFinal(price, discount, mode);
            const focused = level === state.editorFocusLevel ? " is-focused" : "";
            const disabled = state.canWrite ? "" : " disabled";
            $body.append("<tr class='" + focused.trim() + "' data-lp-matrix-level='" + level + "' data-dirty='false' data-has-config='" + (detail ? "true" : "false") + "' data-round='" + mode + "' data-initial-round='" + mode + "' data-initial-price='" + escapeHtml(formatNumberInput(price)) + "' data-initial-discount='" + escapeHtml(formatNumberInput(discount)) + "' data-start='" + escapeHtml(formatDateInput(detail && detail.vigenciaInicio)) + "' data-end='" + escapeHtml(formatDateInput(detail && detail.vigenciaFin)) + "'>" +
                "<td><strong>Lista " + level + "</strong></td>" +
                "<td><input class='form-control' data-lp-matrix-price type='number' min='0' step='0.01' value='" + escapeHtml(formatNumberInput(price)) + "'" + disabled + "></td>" +
                "<td><input class='form-control' data-lp-matrix-discount-input type='number' min='0' max='100' step='0.01' value='" + escapeHtml(formatNumberInput(discount)) + "'" + disabled + "></td>" +
                "<td><input class='form-control' data-lp-matrix-final-input type='number' min='0' step='0.01' value='" + escapeHtml(formatNumberInput(finalPrice)) + "'" + disabled + "></td></tr>");
        }
        syncFocusedEditorOptions();
        updateEditorSaveState();
        const focusedRow = document.querySelector("[data-lp-matrix-level='" + state.editorFocusLevel + "']");
        if (focusedRow) focusedRow.scrollIntoView({ block: "nearest" });
    }

    function syncFocusedEditorOptions() {
        const $row = $("#lpEditorMatrizRows tr[data-lp-matrix-level='" + state.editorFocusLevel + "']");
        if (!$row.length) return;
        $("input[name='lpEditorRedondeo'][value='" + Number($row.attr("data-round") || 0) + "']").prop("checked", true);
        updateRoundingControls();
    }

    function applyEditorRounding() {
        const mode = Number($("input[name='lpEditorRedondeo']:checked").val() || 0);
        const all = $("input[name='lpEditorRedondeoAlcance']:checked").val() === "all";
        const $rows = all ? $("#lpEditorMatrizRows tr[data-lp-matrix-level]") : $("#lpEditorMatrizRows tr[data-lp-matrix-level='" + state.editorFocusLevel + "']");
        $rows.each(function () {
            const $row = $(this).attr("data-round", String(mode));
            if (all) applyRoundingToCurrentFinal($row, mode);
            refreshMatrixRowDirty($row);
        });
        updateRoundingControls();
        updateEditorSaveState();
    }

    function applyEditorRoundingToAll() {
        const mode = Number($("input[name='lpEditorRedondeo']:checked").val() || 0);
        $("#lpEditorMatrizRows tr[data-lp-matrix-level]").each(function () {
            const $row = $(this).attr("data-round", String(mode));
            applyRoundingToCurrentFinal($row, mode);
            refreshMatrixRowDirty($row);
        });
        updateEditorSaveState();
    }

    function applyRoundingToCurrentFinal($row, mode) {
        const price = Math.max(0, toDecimal($row.find("[data-lp-matrix-price]").val()));
        const currentFinal = clampNumber(toDecimal($row.find("[data-lp-matrix-final-input]").val()), 0, price);
        const finalPrice = applyCommercialRounding(currentFinal, price, mode);
        const discount = calculateDiscount(price, finalPrice);
        $row.find("[data-lp-matrix-discount-input]").val(formatNumberInput(discount));
        $row.find("[data-lp-matrix-final-input]").val(formatNumberInput(finalPrice));
    }

    function updateRoundingControls() {
        const disabled = !state.canWrite || Number($("input[name='lpEditorRedondeo']:checked").val() || 0) === 0;
        $("input[name='lpEditorRedondeoAlcance'],#btLpAplicarRedondeo").prop("disabled", disabled);
    }

    function recalculateMatrixRow($row, changedField) {
        const price = Math.max(0, toDecimal($row.find("[data-lp-matrix-price]").val()));
        let discount = clampNumber(optionalDecimal($row.find("[data-lp-matrix-discount-input]").val()) ?? 0, 0, 100);
        const mode = Number($row.attr("data-round") || 0);
        let finalPrice;

        if (changedField === "final") {
            finalPrice = clampNumber(toDecimal($row.find("[data-lp-matrix-final-input]").val()), 0, price);
            finalPrice = applyCommercialRounding(finalPrice, price, mode);
            discount = calculateDiscount(price, finalPrice);
        } else {
            finalPrice = calculateRoundedFinal(price, discount, mode);
            discount = calculateDiscount(price, finalPrice);
        }

        $row.find("[data-lp-matrix-price]").val(formatNumberInput(price));
        $row.find("[data-lp-matrix-discount-input]").val(formatNumberInput(discount));
        $row.find("[data-lp-matrix-final-input]").val(formatNumberInput(finalPrice));
    }

    function calculateRoundedFinal(price, discount, mode) {
        const normalizedPrice = roundMoney(Math.max(0, Number(price || 0)));
        const subtotal = roundMoney(normalizedPrice * (1 - clampNumber(Number(discount || 0), 0, 100) / 100));
        return applyCommercialRounding(subtotal, normalizedPrice, mode);
    }

    function calculateDiscount(price, finalPrice) {
        const normalizedPrice = roundMoney(Math.max(0, Number(price || 0)));
        if (normalizedPrice === 0) return 0;
        return roundMoney(clampNumber((normalizedPrice - Number(finalPrice || 0)) / normalizedPrice * 100, 0, 100));
    }

    function applyCommercialRounding(value, price, mode) {
        const normalized = roundMoney(Math.max(0, Number(value || 0)));
        const reference = roundMoney(Math.max(0, Number(price || 0)));
        let result = normalized;
        if (Number(mode) === 1 && normalized > 0) {
            const integer = Math.ceil(normalized);
            const last = integer % 10;
            result = last <= 4 ? integer + (4 - last) : integer + (9 - last);
        } else if (Number(mode) === 2 && normalized > 0) {
            const integer = Math.ceil(normalized);
            const last = integer % 10;
            result = integer + (9 - last + 10) % 10;
        }
        return roundMoney(Math.min(result, reference));
    }

    function refreshMatrixRowDirty($row) {
        const changed = formatNumberInput($row.find("[data-lp-matrix-price]").val()) !== String($row.attr("data-initial-price")) ||
            formatNumberInput($row.find("[data-lp-matrix-discount-input]").val()) !== String($row.attr("data-initial-discount")) ||
            Number($row.attr("data-round") || 0) !== Number($row.attr("data-initial-round") || 0);
        $row.attr("data-dirty", changed ? "true" : "false");
    }

    function roundMoney(value) {
        return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
    }

    function clampNumber(value, min, max) {
        return Math.min(max, Math.max(min, Number(value || 0)));
    }

    function openInventory(row) {
        $("#modalListaPreciosInventarioTitle").text(row.nombre || "Existencias y movimientos");
        $("#lpInventarioSubtitle").text((row.identidadVendible || row.tipoIdentidadNombre || "Identidad") + " · " + (row.codigo || "Sin código"));
        $("#lpInventarioAlert").removeAttr("hidden").removeClass("is-error is-success").addClass("is-info").text("Cargando inventario...");
        $("#lpInventarioTotal").text("-");
        $("#lpInventarioSaldos,#lpInventarioMovimientos").empty();
        $("#lpInventarioMovimientosCount").text("0 movimientos");
        $("#lpInventarioEntradas,#lpInventarioSalidas").text("0");

        if (state.inventoryModal) {
            state.inventoryModal.show();
        } else {
            $("#modalListaPreciosInventario").addClass("show").show();
        }

        const query = new URLSearchParams();
        appendQuery(query, "idProductoServicio", row.idProductoServicio);
        appendQuery(query, "tipoIdentidad", row.tipoIdentidad);
        appendQuery(query, "idVariante", row.idVariante);
        appendQuery(query, "idPresentacionVenta", row.idPresentacionVenta);
        fetchJson("/ListaPrecios/Inventario?" + query.toString()).then(renderInventory).catch(function (error) {
            $("#lpInventarioAlert").removeClass("is-info is-success").addClass("is-error").text("No fue posible cargar el inventario. " + error.message);
        });
    }

    function renderInventory(detail) {
        const saldos = Array.isArray(detail && detail.saldos) ? detail.saldos : [];
        const movimientos = Array.isArray(detail && detail.movimientos) ? detail.movimientos : [];
        $("#lpInventarioAlert").attr("hidden", true).removeClass("is-info is-error is-success").text("");
        $("#lpInventarioTotal").text(detail && detail.aplicable ? formatQuantity(detail.existenciaTotal) : "N/A");

        const $saldos = $("#lpInventarioSaldos").empty();
        if (!saldos.length) {
            $saldos.append("<p class='lp-muted'>" + escapeHtml((detail && detail.mensaje) || "Sin existencias registradas.") + "</p>");
        } else {
            saldos.forEach(function (saldo) {
                $saldos.append("<article class='lp-history-item'><strong>" + escapeHtml(saldo.sucursal || "Sucursal") + "</strong><span>" + escapeHtml(formatQuantity(saldo.existencia)) + " unidades base</span></article>");
            });
        }

        $("#lpInventarioMovimientosCount").text(movimientos.length + (movimientos.length === 1 ? " movimiento" : " movimientos"));
        $("#lpInventarioEntradas").text(formatQuantity(movimientos.filter(function (item) { return [1, 3].includes(Number(item.tipoMovimiento)); }).reduce(function (sum, item) { return sum + Math.abs(Number(item.cantidad || 0)); }, 0)));
        $("#lpInventarioSalidas").text(formatQuantity(movimientos.filter(function (item) { return [2, 4].includes(Number(item.tipoMovimiento)); }).reduce(function (sum, item) { return sum + Math.abs(Number(item.cantidad || 0)); }, 0)));
        const $movimientos = $("#lpInventarioMovimientos").empty();
        if (!movimientos.length) {
            $movimientos.append("<p class='lp-muted'>Sin movimientos registrados para esta identidad.</p>");
            return;
        }

        movimientos.forEach(function (item) {
            $movimientos.append(
                "<article class='lp-history-item'>" +
                "<strong>" + escapeHtml(item.tipoMovimientoNombre || "Movimiento") + " · " + escapeHtml(item.sucursal || "Sucursal") + "</strong>" +
                "<span>" + escapeHtml(formatQuantity(item.cantidad)) + " · " + escapeHtml(formatQuantity(item.saldoAnterior)) + " → " + escapeHtml(formatQuantity(item.saldoPosterior)) + "</span>" +
                "<small>" + escapeHtml(formatDateTime(item.fechaMovimiento) + " · " + (item.referencia || "Sin referencia")) + "</small>" +
                (item.observaciones ? "<small>" + escapeHtml(item.observaciones) + "</small>" : "") +
                "</article>"
            );
        });
    }

    function buildEditorContext(row) {
        const characteristics = [
            row.codigo,
            row.identidadVendible || row.tipoIdentidadNombre || row.tipoNombre,
            row.productoPadre && row.productoPadre !== row.nombre ? row.productoPadre : "",
            row.categoria,
            row.marca,
            row.coleccion,
            row.estatus
        ];
        const seen = new Set();
        const chips = characteristics
            .map(function (value) { return String(value || "").trim(); })
            .filter(function (value) {
                if (!value || seen.has(value.toLocaleLowerCase("es-MX"))) return false;
                seen.add(value.toLocaleLowerCase("es-MX"));
                return true;
            })
            .map(function (value) { return "<span class='lp-editor-chip'>" + escapeHtml(value) + "</span>"; })
            .join("");

        return "<div class='lp-editor-photo'>" + buildPhotoCell(row, "lp-editor-photo-frame", false) + "</div>" +
            "<div class='lp-editor-chips'>" + chips + "</div>";
    }

    function renderEditorDescription(value) {
        const source = String(value || "").trim();
        const parser = document.createElement("div");
        parser.innerHTML = source.replace(/<br\s*\/?>/gi, "\n");
        const description = String(parser.textContent || "")
            .replace(/\u00a0/g, " ")
            .replace(/[ \t]+\n/g, "\n")
            .replace(/\n[ \t]+/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
        $("#lpEditorDescription").val(description);
    }

    function renderCommercialEditor(value) {
        state.editorCommercial = value || {};
        renderEditorDescription(value.descripcion);
        $("#lpEditorWeb").val(value.web || ""); $("#lpEditorLiverpool").val(value.liverpool || "");
        $("#lpEditorMercadoLibre").val(value.mercadoLibre || ""); $("#lpEditorObservaciones").val(value.observaciones || "");
        $("#lpEditorDosPorUno").prop("checked", !!value.dosPorUno); $("#lpEditorTresPorDos").prop("checked", !!value.tresPorDos);
        $("#lpEditorDescuentoSegundo").prop("checked", !!value.descuentoSegundo); $("#lpEditorMonedero").prop("checked", !!value.monedero);
        $("#lpEditorDescription").prop("readonly", !!value.descripcionReadOnly);
        state.editorCommercialInitial = JSON.stringify(readCommercialEditor());
        setEditorWriteState();
    }

    function readCommercialEditor() {
        const inheritedDescription = !!(state.editorCommercial && state.editorCommercial.descripcionReadOnly);
        return { descripcion: inheritedDescription ? (state.editorCommercial.descripcion || "") : ($("#lpEditorDescription").val() || ""), web: $("#lpEditorWeb").val() || "", liverpool: $("#lpEditorLiverpool").val() || "", mercadoLibre: $("#lpEditorMercadoLibre").val() || "", observaciones: $("#lpEditorObservaciones").val() || "", dosPorUno: $("#lpEditorDosPorUno").prop("checked"), tresPorDos: $("#lpEditorTresPorDos").prop("checked"), descuentoSegundo: $("#lpEditorDescuentoSegundo").prop("checked"), monedero: $("#lpEditorMonedero").prop("checked") };
    }

    function buildPhotoCell(row, cssClass, includeCaption) {
        const imageUrl = String(row && row.imagenUrl ? row.imagenUrl : "").trim();
        const label = String(row && row.nombre ? row.nombre : "Fotografía").trim();
        if (imageUrl) {
            return "<figure class='" + cssClass + " has-image'>" +
                "<img src='" + escapeHtml(imageUrl) + "' alt='" + escapeHtml(label) + "' loading='lazy' />" +
                (includeCaption ? "<figcaption>" + escapeHtml(label) + "</figcaption>" : "") +
                "</figure>";
        }

        return "<figure class='" + cssClass + " is-empty'>" +
            "<span><i class='fa fa-picture-o'></i></span>" +
          (includeCaption ? "<figcaption>Sin imagen</figcaption>" : "") +
            "</figure>";
    }

    function setEditorWriteState() {
        const disabled = !state.canWrite;
        $("#lpEditorMatrizRows input,#lpEditorMatrizRows select,[data-lp-commercial],#btLpGuardar,#btLpAplicarRedondeo,input[name='lpEditorRedondeo'],input[name='lpEditorRedondeoAlcance']")
            .prop("disabled", disabled);
        $("#lpEditorDescription").prop("readonly", !!(state.editorCommercial && state.editorCommercial.descripcionReadOnly));
        if (disabled) {
            showEditorAlert("Modo consulta: tu sesión no tiene permiso 05001009 para guardar o dar de baja precios.", "info");
        }
        updateRoundingControls();
        updateEditorSaveState();
    }

    function updateEditorSaveState() {
        const hasDirtyRows = $("#lpEditorMatrizRows tr[data-dirty='true']").length > 0;
        const commercialDirty = !!state.editorCommercialInitial && JSON.stringify(readCommercialEditor()) !== state.editorCommercialInitial;
        $("#btLpGuardar").prop("disabled", !state.canWrite || (!hasDirtyRows && !commercialDirty));
    }

    function previewEditor(silent) {
        if (!state.currentRow) {
            return;
        }

        setBusy("#btLpPreview", true);
        if (silent !== true) clearEditorAlert();
        let payload;
        try { payload = buildMatrixPayload(false); }
        catch (error) { showEditorAlert(error.message, "error"); setBusy("#btLpPreview", false); return; }
        postJson("/ListaPrecios/PreviewMatriz", payload).then(function (result) {
            state.currentResolution = result || state.currentResolution;
            renderMatrixPreview(result);
            if (silent !== true) showEditorAlert("Preview calculado por motor LP-08 sin persistencia. Confirma con Guardar cambios.", "success");
        }).catch(function (error) {
            if (silent !== true) showEditorAlert(error.message, "error");
        }).finally(function () {
            setBusy("#btLpPreview", false);
        });
    }

    function saveEditor() {
        if (!state.canWrite || !state.currentRow) {
            return;
        }

        setBusy("#btLpGuardar", true);
        clearEditorAlert();
        let payload;
        try { payload = buildMatrixPayload(true); } catch (error) { showEditorAlert(error.message, "error"); setBusy("#btLpGuardar", false); return; }
        confirmCheckApp("¿Guardar los cambios?", "Guardar").then(function (confirmed) {
            if (!confirmed) return;
            return postJson("/ListaPrecios/GuardarMatriz", payload).then(function (result) {
            renderMatrixPreview(result);
            $("#lpEditorMatrizRows tr[data-lp-matrix-level]").each(function () {
                const $row = $(this);
                $row.attr("data-initial-price", formatNumberInput($row.find("[data-lp-matrix-price]").val()))
                    .attr("data-initial-discount", formatNumberInput($row.find("[data-lp-matrix-discount-input]").val()))
                    .attr("data-initial-round", String($row.attr("data-round") || 0))
                    .attr("data-dirty", "false");
            });
            state.editorCommercialInitial = JSON.stringify(readCommercialEditor());
            updateEditorSaveState();
            closeEditorModal();
            reloadGrid();
            showCheckAppSuccess("Los cambios se guardaron correctamente.");
        }).catch(function (error) {
            showEditorAlert(error.message, "error");
            showCheckAppError(error.message);
        });
        }).catch(function (error) {
            showEditorAlert(error.message, "error");
            showCheckAppError(error.message);
        }).finally(function () {
            setBusy("#btLpGuardar", false);
        });
    }

    function closeEditorModal() {
        if (state.modal) {
            state.modal.hide();
            return;
        }
        $("#modalListaPreciosEditor").removeClass("show").hide().attr("aria-hidden", "true");
    }

    function confirmCheckApp(text, confirmText) {
        if (!window.Swal || typeof window.Swal.fire !== "function") {
            return Promise.reject(new Error("No está disponible el componente de confirmación CheckApp."));
        }
        return window.Swal.fire({
            icon: "warning",
            text: text,
            showCancelButton: true,
            buttonsStyling: false,
            confirmButtonText: confirmText,
            cancelButtonText: "Cancelar",
            customClass: {
                confirmButton: "btn font-weight-bold btn-danger",
                cancelButton: "btn font-weight-bold btn-light"
            }
        }).then(function (result) { return !!(result && result.isConfirmed); });
    }

    function showCheckAppSuccess(message) {
        if (!window.Swal || typeof window.Swal.fire !== "function") return;
        window.Swal.fire({ icon: "success", title: "Listo", text: message, timer: 1600, showConfirmButton: false });
    }

    function showCheckAppError(message) {
        if (!window.Swal || typeof window.Swal.fire !== "function") return;
        window.Swal.fire({ icon: "error", title: "No se pudo completar", text: message || "Intenta nuevamente." });
    }

    function buildMatrixPayload(onlyDirty) {
        const row = state.currentRow || {};
        let $rows = $("#lpEditorMatrizRows tr[data-lp-matrix-level]");
        if (onlyDirty) $rows = $rows.filter("[data-dirty='true']");
        if (!$rows.length && !onlyDirty) $rows = $("#lpEditorMatrizRows tr[data-lp-matrix-level='" + state.editorFocusLevel + "']");
        const commercial = readCommercialEditor();
        const commercialSnapshot = JSON.stringify(commercial);
        commercial.modificado = !!state.editorCommercialInitial && commercialSnapshot !== state.editorCommercialInitial;
        if (!$rows.length && !commercial.modificado) throw new Error("Modifica al menos un valor antes de guardar.");
        const items = [];
        $rows.each(function () {
            const $current = $(this);
            items.push({
                nivel: Number($current.data("lpMatrixLevel")),
                precio: toDecimal($current.find("[data-lp-matrix-price]").val()),
                descuentoPct: optionalDecimal($current.find("[data-lp-matrix-discount-input]").val()),
                redondeoModo: toInt($current.attr("data-round")),
                vigenciaInicio: optionalDate($current.attr("data-start")),
                vigenciaFin: optionalDate($current.attr("data-end"))
            });
        });
        return {
            tipoIdentidad: toInt(row.tipoIdentidad), idProductoServicio: row.idProductoServicio,
            idVariante: row.idVariante || null, idPresentacionVenta: row.idPresentacionVenta || null,
            listas: items, comercial: commercial, motivo: "Edición individual"
        };
    }

    function renderMatrixPreview(result) {
        const items = Array.isArray(result && result.listas) ? result.listas : [];
        items.forEach(function (item) {
            $("#lpEditorMatrizRows tr[data-lp-matrix-level='" + Number(item.listaEfectiva || item.listaSolicitada) + "'] [data-lp-matrix-final-input]").val(formatNumberInput(item.precioFinal ?? item.precioEfectivo));
        });
    }

    function archiveMatrixPrice(id) {
        if (!state.canWrite || !id) return;
        confirmCheckApp("¿Dar de baja esta configuración?", "Dar de baja").then(function (confirmed) {
            if (!confirmed) return;
            return postJson("/ListaPrecios/BajaPrecio/" + encodeURIComponent(id), {}).then(function () {
            showEditorAlert("Configuración dada de baja. Se aplicará el precio disponible correspondiente.", "success");
            openEditor(state.currentRow, state.editorFocusLevel);
            reloadGrid();
            }).catch(function (error) { showEditorAlert(error.message, "error"); showCheckAppError(error.message); });
        }).catch(function (error) { showEditorAlert(error.message, "error"); showCheckAppError(error.message); });
    }

    function loadHistory() {
        if (!state.currentRow) {
            return Promise.resolve();
        }

        return postJson("/ListaPrecios/Historial", buildIdentityPayload()).then(renderHistory).catch(function () {
            renderHistory([]);
        });
    }

    function buildIdentityPayload() {
        const row = state.currentRow || {};
        return {
            nivel: state.editorFocusLevel || toInt(row.lista || 1),
            tipoIdentidad: toInt(row.tipoIdentidad),
            idProductoServicio: row.idProductoServicio,
            idVariante: row.idVariante || null,
            idPresentacionVenta: row.idPresentacionVenta || null,
            requiereActivo: true
        };
    }

    function renderPreview(result) {
        const $status = $("#lpPreviewEstado");
        const $list = $("#lpPreviewSnapshot");
        $list.empty();

        if (!result) {
            $status.text("Sin preview");
            $list.attr("hidden", "hidden");
            return;
        }

        $list.removeAttr("hidden");
        $status.text(result.resuelto ? "Resuelto" : (result.codigoResolucion || "No resuelto"));
        const rows = [
            ["Precio base", formatMoney(result.precioBase)],
            ["Precio lista", result.precioLista !== null && result.precioLista !== undefined ? formatMoney(result.precioLista) : "Sin precio lista"],
            ["Origen", result.origenPrecio || result.origen || result.codigoResolucion],
            ["Descuento", result.descuentoPct !== null && result.descuentoPct !== undefined ? result.descuentoPct + "%" : "Sin descuento"],
            ["Subtotal", formatMoney(result.subtotalAntesRedondeo)],
            ["Redondeo", redondeoName(result.redondeoModo)],
            ["Precio final", formatMoney(result.precioFinal || result.precioEfectivo)],
            ["Vigencia", formatVigencia(result.vigenciaInicio, result.vigenciaFin)],
            ["Regla", result.reglaVersion || "LP-08-V2"],
            ["CorrelationId", result.correlationId || ""]
        ];

        rows.forEach(function (row) {
            $list.append("<div><dt>" + escapeHtml(row[0]) + "</dt><dd>" + escapeHtml(row[1] || "-") + "</dd></div>");
        });
    }

    function renderHistory(items) {
        const events = Array.isArray(items) ? items : [];
        $("#lpHistoryCount").text(events.length + (events.length === 1 ? " evento" : " eventos"));
        const $list = $("#lpHistoryList").empty();
        if (!events.length) {
            $list.append("<p class='lp-muted'>Sin historial para esta identidad/lista.</p>");
            return;
        }

        events.slice(0, 20).forEach(function (item) {
            $list.append(
                "<article class='lp-history-item'>" +
                "<strong>" + escapeHtml(item.campo || item.operacion || "Cambio") + "</strong>" +
                "<span>" + escapeHtml((item.valorAnterior || "NULL") + " → " + (item.valorNuevo || "NULL")) + "</span>" +
                "<small>" + escapeHtml(formatDateTime(item.fechaUtc) + " · " + (item.origen || "INDIVIDUAL")) + "</small>" +
                "</article>"
            );
        });
    }

    function openAuditHistory() {
        $("#lpAuditDetail").attr("hidden", true).empty();
        if (state.auditModal) state.auditModal.show();
        loadAuditHistory(1);
    }

    function buildAuditQuery(page) {
        const query = new URLSearchParams();
        appendQuery(query, "fechaDesde", $("#lpAuditDesde").val());
        appendQuery(query, "fechaHasta", $("#lpAuditHasta").val());
        appendQuery(query, "nivel", $("#lpAuditNivel").val());
        appendQuery(query, "tipoIdentidad", $("#lpAuditTipo").val());
        appendQuery(query, "busqueda", $("#lpAuditBusqueda").val());
        appendQuery(query, "origen", $("#lpAuditOrigen").val());
        appendQuery(query, "operacion", $("#lpAuditOperacion").val());
        appendQuery(query, "correlationId", $("#lpAuditCorrelation").val());
        appendQuery(query, "usuario", $("#lpAuditUsuario").val());
        query.set("pagina", String(page || 1));
        query.set("tamanoPagina", String($("#lpAuditPageSize").val() || 25));
        return query;
    }

    function loadAuditHistory(page) {
        const from = String($("#lpAuditDesde").val() || "");
        const to = String($("#lpAuditHasta").val() || "");
        const correlation = String($("#lpAuditCorrelation").val() || "").trim();
        if (from && to && from > to) return showAuditAlert("La fecha inicial no puede ser posterior a la final.");
        if (correlation && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(correlation)) return showAuditAlert("CorrelationId inválido.");

        $("#lpAuditAlert").attr("hidden", true).text("");
        setBusy("#btLpAuditBuscar", true);
        return fetchJson("/ListaPrecios/HistorialConsulta?" + buildAuditQuery(page).toString()).then(renderAuditHistory).catch(function (error) {
            state.auditItems = [];
            renderAuditRows([]);
            showAuditAlert("No fue posible consultar el histórico. " + error.message);
        }).finally(function () {
            setBusy("#btLpAuditBuscar", false);
        });
    }

    function renderAuditHistory(result) {
        state.auditItems = Array.isArray(result.items) ? result.items : [];
        state.auditPage = Number(result.pagina || 1);
        state.auditTotalPages = Number(result.totalPaginas || 0);
        renderAuditRows(state.auditItems);
        const total = Number(result.total || 0);
        const size = Number(result.tamanoPagina || 25);
        const start = total ? ((state.auditPage - 1) * size) + 1 : 0;
        const end = Math.min(state.auditPage * size, total);
        $("#lpAuditRange").text(total ? start + "-" + end + " de " + total + " eventos" : "Sin resultados");
        $("#lpAuditPageIndicator").text("Página " + state.auditPage + " de " + Math.max(1, state.auditTotalPages));
        $("#btLpAuditPrev").prop("disabled", state.auditPage <= 1);
        $("#btLpAuditNext").prop("disabled", state.auditPage >= state.auditTotalPages);
    }

    function renderAuditRows(items) {
        const $rows = $("#lpAuditRows").empty();
        if (!items.length) {
            $rows.append("<tr><td colspan='9' class='lp-audit-empty'>No hay eventos para los filtros seleccionados.</td></tr>");
            return;
        }

        items.forEach(function (item, index) {
            const correlation = item.correlationId || "";
            $rows.append("<tr>" +
                "<td>" + escapeHtml(formatDateTime(item.fechaUtc)) + "</td>" +
                "<td><strong>" + escapeHtml(item.identidad || "Identidad no disponible") + "</strong><small>" + escapeHtml([item.codigo, item.tipoIdentidadNombre].filter(Boolean).join(" · ")) + "</small></td>" +
                "<td>" + escapeHtml(item.lista || "-") + "</td><td>" + escapeHtml(item.origen || "-") + "</td><td>" + escapeHtml(item.operacion || "-") + "</td><td>" + escapeHtml(item.campo || "-") + "</td>" +
                "<td>" + escapeHtml(item.usuario || "No registrado") + "</td>" +
                "<td><button type='button' class='lp-correlation-link' data-lp-audit-correlation='" + escapeHtml(correlation) + "' title='Filtrar lote'>" + escapeHtml(correlation) + "</button></td>" +
                "<td><button type='button' class='checkapp-icon-btn' data-lp-audit-detail='" + index + "' title='Ver detalle' aria-label='Ver detalle'><i class='fa fa-eye'></i></button></td></tr>");
        });
    }

    function showAuditDetail(item) {
        if (!item) return;
        const fields = [
            ["Fecha", formatDateTime(item.fechaUtc)], ["Identidad", item.identidad], ["Código", item.codigo], ["Tipo", item.tipoIdentidadNombre],
            ["Lista", item.lista], ["Origen", item.origen], ["Operación", item.operacion], ["Campo", item.campo],
            ["Valor anterior", item.valorAnterior || "NULL"], ["Valor nuevo", item.valorNuevo || "NULL"], ["Actor", item.usuario || "No registrado"],
            ["CorrelationId", item.correlationId], ["Motivo", item.motivo || "Sin motivo registrado"]
        ];
        $("#lpAuditDetail").html("<div class='lp-side-title'><span class='checkapp-panel-eyebrow'>Detalle del evento</span><button type='button' class='checkapp-icon-btn' id='btLpAuditDetailClose' aria-label='Cerrar detalle'><i class='fa fa-times'></i></button></div><dl>" + fields.map(function (field) {
            return "<div><dt>" + escapeHtml(field[0]) + "</dt><dd>" + escapeHtml(field[1] || "-") + "</dd></div>";
        }).join("") + "</dl>").removeAttr("hidden");
        $("#btLpAuditDetailClose").one("click", function () { $("#lpAuditDetail").attr("hidden", true).empty(); });
    }

    function clearAuditFilters() {
        $("#lpAuditDesde,#lpAuditHasta,#lpAuditBusqueda,#lpAuditCorrelation,#lpAuditUsuario").val("");
        $("#lpAuditNivel,#lpAuditTipo,#lpAuditOrigen,#lpAuditOperacion").val("");
        $("#lpAuditPageSize").val("25");
        $("#lpAuditDetail").attr("hidden", true).empty();
        loadAuditHistory(1);
    }

    function showAuditAlert(message) {
        $("#lpAuditAlert").removeAttr("hidden").addClass("is-error").text(message || "Revisa los filtros.");
    }

    function clearFilters() {
        $("#txBusquedaListaPrecios").val("");
        resetGridSearch();
        $("#cbFiltroListaPrecio").val("1");
        $("#cbFiltroTipoListaPrecios").val("");
        $("#cbFiltroCategoriaListaPrecios").val("");
        $("#cbFiltroMarcaListaPrecios").val("");
        $("#cbFiltroColeccionListaPrecios").val("");
        $("#cbFiltroEtiquetaListaPrecios").val("");
        $("#cbFiltroAtributoListaPrecios").val("");
        state.selectedAttributeValues.clear();
        renderAttributeValueOptions();
        $("#cbFiltroVarianteListaPrecios").val("");
        $("#cbFiltroPresentacionListaPrecios").val("");
        $("#txFiltroPrecioMinimoListaPrecios").val("");
        $("#txFiltroPrecioMaximoListaPrecios").val("");
        $("#txFiltroDescuentoListaPrecios").val("");
        $("#ckTodasSucursalesListaPrecios").prop("checked", true);
        state.selectedBranches.clear();
        $("#panelFiltroSucursalListaPrecios input").prop("checked", false);
        setDropdownDisabled("#lpSucursalesDropdown", "#btFiltroSucursalListaPrecios", true);
        updateBranchDropdownLabel();
        $("#cbFiltroExistenciaListaPrecios").val("");
        $("#txFiltroCantidadListaPrecios").val("");
        $("#cbFiltroEstatusListaPrecios").val("activos");
        clearFilterFeedback();
        updateTypeDependentFilters();
        updateFilterSummary();
        $(".lp-summary-strip .checkapp-summary-card").removeClass("is-selected").attr("aria-pressed", "false");
        $(".lp-summary-strip [data-lp-summary-type='']").addClass("is-selected").attr("aria-pressed", "true");
        reloadGrid();
    }

    function resetGridSearch() {
        $("#txBusquedaGridListaPrecios").val("");

        if (!window.CheckAppUI || typeof window.CheckAppUI.getGrid !== "function") {
            return;
        }

        const grid = window.CheckAppUI.getGrid(gridId);
        if (grid && grid.instance) {
            grid.instance.search("").draw();
        }
    }

    function buildFilterSummary() {
        const parts = [];
        const listText = $("#cbFiltroListaPrecio option:selected").text();
        if (listText) {
            parts.push(listText);
        }

        const search = String($("#txBusquedaListaPrecios").val() || "").trim();
        if (search) {
            parts.push("Búsqueda: " + search);
        }

        addSelectedText(parts, "#cbFiltroTipoListaPrecios", "Tipo", "Todos");
        addSelectedText(parts, "#cbFiltroCategoriaListaPrecios", "Categoría", "Todas");
        addSelectedText(parts, "#cbFiltroMarcaListaPrecios", "Marca", "Todas");
        addSelectedText(parts, "#cbFiltroColeccionListaPrecios", "Colección", "Todas");
        addSelectedText(parts, "#cbFiltroEtiquetaListaPrecios", "Etiqueta", "Todas");
        addSelectedText(parts, "#cbFiltroAtributoListaPrecios", "Atributo", "Todos");
        const attributeValues = $("#panelFiltroValoresAtributoListaPrecios input:checked").map(function () { return $(this).siblings("span").text(); }).get();
        if (attributeValues.length) parts.push("Valores: " + attributeValues.join(", "));
        addSelectedText(parts, "#cbFiltroVarianteListaPrecios", "Variante", "Todas");
        addSelectedText(parts, "#cbFiltroPresentacionListaPrecios", "Presentación", "Todas");
        addInputText(parts, "#txFiltroPrecioMinimoListaPrecios", "Mín");
        addInputText(parts, "#txFiltroPrecioMaximoListaPrecios", "Máx");
        addSelectedText(parts, "#txFiltroDescuentoListaPrecios", "Descuento", "Todos");
        if (!$("#ckTodasSucursalesListaPrecios").prop("checked")) {
            const branches = $("#panelFiltroSucursalListaPrecios input:checked").map(function () { return $(this).siblings("span").text(); }).get();
            if (branches.length) parts.push("Sucursales: " + branches.join(", "));
        }
        addSelectedText(parts, "#cbFiltroExistenciaListaPrecios", "Existencia", "Todas");
        addInputText(parts, "#txFiltroCantidadListaPrecios", "Cantidad <");
        addSelectedText(parts, "#cbFiltroEstatusListaPrecios", "Estatus", "Activos");
        return parts.length ? parts.join(" · ") : "Sin filtros activos";
    }

    function updateFilterSummary() {
        const summary = buildFilterSummary();
        const $host = $("#accordionFiltrosListaPrecios .checkapp-accordion-summary").empty();
        summary.split(" · ").forEach(function (part) {
            $host.append("<span class='ca-chip ca-chip--secondary lp-filter-chip'>" + escapeHtml(part) + "</span>");
        });
    }

    function addSelectedText(parts, selector, label, defaultText) {
        const value = $(selector).val();
        const text = $(selector + " option:selected").text();
        if (value && text && text !== defaultText) {
            parts.push(label + ": " + text);
        }
    }

    function addInputText(parts, selector, label) {
        const value = String($(selector).val() || "").trim();
        if (value) {
            parts.push(label + ": " + value);
        }
    }

    function updateTypeDependentFilters() {
        const isService = String($("#cbFiltroTipoListaPrecios").val() || "") === "2";
        if (isService) {
            $("#cbFiltroVarianteListaPrecios,#cbFiltroPresentacionListaPrecios,#cbFiltroExistenciaListaPrecios,#txFiltroCantidadListaPrecios").val("");
            $("#ckTodasSucursalesListaPrecios").prop("checked", true);
            state.selectedBranches.clear();
            $("#panelFiltroSucursalListaPrecios input").prop("checked", false);
            updateBranchDropdownLabel();
        }

        $("#cbFiltroVarianteListaPrecios,#cbFiltroPresentacionListaPrecios,#cbFiltroExistenciaListaPrecios,#txFiltroCantidadListaPrecios")
            .prop("disabled", isService)
            .closest(".checkapp-field")
            .toggleClass("is-disabled", isService);
        setDropdownDisabled("#lpSucursalesDropdown", "#btFiltroSucursalListaPrecios", isService || $("#ckTodasSucursalesListaPrecios").prop("checked"));
        $("#ckTodasSucursalesListaPrecios").prop("disabled", isService);
    }

    function validateAdvancedFilters() {
        const min = optionalDecimal($("#txFiltroPrecioMinimoListaPrecios").val());
        const max = optionalDecimal($("#txFiltroPrecioMaximoListaPrecios").val());
        const inventoryQuantity = optionalDecimal($("#txFiltroCantidadListaPrecios").val());

        if (min !== null && min < 0) {
            return { ok: false, message: "Precio mínimo inválido." };
        }

        if (max !== null && max < 0) {
            return { ok: false, message: "Precio máximo inválido." };
        }

        if (min !== null && max !== null && min > max) {
            return { ok: false, message: "El precio mínimo no puede ser mayor al precio máximo." };
        }

        if (inventoryQuantity !== null && inventoryQuantity < 0) {
            return { ok: false, message: "La cantidad de inventario no puede ser negativa." };
        }

        return { ok: true, message: "" };
    }

    function showFilterFeedback(message) {
        $("#lpFilterFeedback").removeAttr("hidden").text(message || "Revisa los filtros capturados.");
        updateFilterSummary();
    }

    function clearFilterFeedback() {
        $("#lpFilterFeedback").attr("hidden", true).text("");
    }

    function updateSummary(rows) {
        const total = rows.length;
        const productos = rows.filter(function (row) { return String(row.tipo) === "1"; }).length;
        const servicios = rows.filter(function (row) { return String(row.tipo) === "2"; }).length;
        const configurados = rows.filter(function (row) { return row.codigoResolucion === "PRECIO_LISTA"; }).length;

        $("#txResumenLpTotal").text(total);
        $("#txResumenLpProductos").text(productos);
        $("#txResumenLpServicios").text(servicios);
        $("#txResumenLpConfigurados").text(configurados);
    }

    function fetchJson(url) {
        return fetch(url, { credentials: "same-origin" }).then(function (response) {
            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            return response.json();
        });
    }

    function postJson(url, payload) {
        return fetch(url, {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload || {})
        }).then(function (response) {
            return response.text().then(function (text) {
                const data = text ? JSON.parse(text) : {};
                if (!response.ok) {
                    const code = data.code || data.Code || response.status;
                    const message = data.mensaje || data.message || data.Mensaje || "HTTP " + response.status;
                    throw new Error(code + ": " + message);
                }

                return data;
            });
        });
    }

    function handleInitialError() {
        updateSummary([]);
        $("#txGridLpVisibleCount").text("0 visibles");
    }

    function appendQuery(query, key, value) {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
            query.append(key, String(value).trim());
        }
    }

    function formatMoney(value) {
        const number = Number(value);
        if (!Number.isFinite(number)) {
            return "-";
        }

        return number.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
    }

    function formatNumberInput(value) {
        const number = Number(value);
        return Number.isFinite(number) ? number.toFixed(2) : "";
    }

    function formatQuantity(value) {
        const number = Number(value);
        return Number.isFinite(number) ? number.toLocaleString("es-MX", { maximumFractionDigits: 6 }) : "0";
    }

    function formatDateInput(value) {
        if (!value) {
            return "";
        }

        return String(value).slice(0, 10);
    }

    function formatDateTime(value) {
        if (!value) {
            return "";
        }

        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("es-MX");
    }

    function formatVigencia(inicio, fin) {
        const from = formatDateInput(inicio);
        const to = formatDateInput(fin);
        if (!from && !to) {
            return "Sin restricción";
        }

        return (from || "Sin inicio") + " - " + (to || "Sin fin");
    }

    function redondeoName(value) {
        switch (Number(value || 0)) {
            case 1:
                return "A 4/9";
            case 2:
                return "Solo a 9";
            default:
                return "Sin redondeo";
        }
    }

    function toInt(value) {
        const number = Number(value);
        return Number.isFinite(number) ? Math.trunc(number) : null;
    }

    function toDecimal(value) {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
    }

    function optionalDecimal(value) {
        const text = String(value || "").trim();
        if (!text) {
            return null;
        }

        const number = Number(text);
        return Number.isFinite(number) ? number : null;
    }

    function optionalDate(value) {
        const text = String(value || "").trim();
        return text ? text : null;
    }

    function showEditorAlert(message, type) {
        $("#lpEditorAlert")
            .removeAttr("hidden")
            .removeClass("is-error is-success is-info")
            .addClass("is-" + (type || "info"))
            .text(message || "");
    }

    function clearEditorAlert() {
        $("#lpEditorAlert").attr("hidden", true).text("").removeClass("is-error is-success is-info");
    }

    function setBusy(selector, busy) {
        $(selector).prop("disabled", !!busy).toggleClass("is-busy", !!busy);
    }

    function formatDateForFile(value) {
        const yyyy = value.getFullYear();
        const mm = String(value.getMonth() + 1).padStart(2, "0");
        const dd = String(value.getDate()).padStart(2, "0");
        return yyyy + mm + dd;
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
})();
