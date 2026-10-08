(function (window, document, $) {
    "use strict";

    const pageRoot = document.querySelector("[data-oc-page]");
    if (!pageRoot) {
        return;
    }

    const pageType = String(pageRoot.getAttribute("data-oc-page") || "").trim().toLowerCase();
    const estadoBorrador = 1;
    const estadoGenerada = 2;
    const estadoCancelada = 3;
    const estadoParcialmenteRecibida = 4;
    const estadoRecibida = 5;
    const reportGridId = "ordenesCompraReporteGrid";

    const state = {
        pageType: pageType,
        mode: pageType === "editor"
            ? String(pageRoot.getAttribute("data-oc-mode") || "new").trim().toLowerCase()
            : "index",
        detailId: pageType === "editor"
            ? normalizeGuid(pageRoot.getAttribute("data-oc-id"))
            : "",
        empresaId: resolveEmpresaId(),
        currentStep: 1,
        combos: {
            razonesSociales: [],
            sucursales: [],
            proveedores: []
        },
        report: {
            loading: false,
            hasSearched: false,
            accordion: null,
            grid: null,
            rows: [],
            lastQuery: "",
            detail: {
                modal: null,
                loading: false,
                currentId: "",
                data: null,
                error: "",
                requestSequence: 0
            }
        },
        editor: {
            loading: false,
            saving: false,
            generating: false,
            cancelling: false,
            exportingPdf: false,
            exportingExcel: false,
            searching: false,
            addingProductId: null,
            detail: null,
            selectedSucursalIds: [],
            partidas: [],
            searchResults: [],
            selectedProduct: null,
            partidasFilter: "",
            readOnly: false,
            maxUnlockedStep: 1,
            searchDebounceId: 0,
            searchAbortController: null,
            searchSequence: 0,
            activeSearchSequence: 0,
            lastSearchKey: "",
            lastAddedProductId: null,
            lastAddedProductTimerId: 0,
            searchSelections: {},
            preparationCollapsed: false,
            captureRows: [],
            captureStoreSettings: {},
            curvasAplicables: [],
            capturePreviewSequence: 0
        },
        ui: {
            cancelModal: null,
            captureModal: null
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        if (state.pageType === "editor") {
            state.ui.cancelModal = resolveModalApi("#modalOcCancelar");
            state.ui.captureModal = resolveModalApi("#modalOcCaptura");
            initEditorPage();
            return;
        }

        if (state.pageType === "index") {
            state.report.detail.modal = resolveModalApi("#modalOcDetalleReporte");
            initReportPage();
        }
    });

    function initEditorPage() {
        bindEvents();
        setTodayIfEmpty("#txOcFechaOrden");
        setInitialLegacyDates();
        showEditorOverlay(false);
        setStatus("#txOcFormStatus", "", "");
        setStatus("#txOcBusquedaEstado", "", "");
        setStatus("#txOcCancelarStatus", "", "");
        renderSearchResults([]);
        renderPartidas();
        renderWizard();

        Promise.resolve()
            .then(loadCombos)
            .then(function () {
                if (state.mode === "detail" && state.detailId) {
                    return loadOrderDetail(state.detailId);
                }

                applyDetailToEditor(null);
                return null;
            })
            .catch(function (error) {
                setStatus("#txOcFormStatus", "danger", resolveErrorMessage(error));
                showError(resolveErrorMessage(error));
            });
    }

    function bindEvents() {
        $("[data-step-target]").on("click", function () {
            goToStep(Number($(this).data("stepTarget") || 0), false);
        });

        $("#btOcPaso1Siguiente").on("click", function () {
            goToStep(2, true);
        });
        $("#btOcPaso2Anterior").on("click", function () {
            goToStep(1, false);
        });
        $("#btOcPaso2Siguiente").on("click", function () {
            goToStep(3, true);
        });
        $("#btOcPaso3Anterior").on("click", function () {
            goToStep(2, false);
        });
        $("#btOcPaso4Anterior").on("click", function () {
            goToStep(3, false);
        });
        $("#btOcPaso5Anterior").on("click", function () {
            goToStep(4, false);
        });
        $("#btOcPaso5Buscar").on("click", function () {
            state.editor.selectedProduct = null;
            renderCapture();
            goToStep(3, false);
        });
        $("#btOcEditarPreparacion").on("click", function () {
            state.editor.preparationCollapsed = false;
            renderPreparation();
            scrollToStep(1);
        });
        $("#btOcAbrirCaptura").on("click", openCaptureModal);
        $("#btOcAgregarPartida").on("click", addPartidaFromCapture);

        $("#btOcLimpiarBusquedaProductoServicio").on("click", clearSearchProductosServicios);
        $("#btOcGuardar").on("click", saveDraft);
        $("#btOcGenerar").on("click", generateOrder);
        $("#btOcCancelar").on("click", openCancelEditorModal);
        $("#btOcConfirmarCancelar").on("click", cancelCurrentOrder);
        $("#btOcExportarPdf").on("click", exportOrderPdf);
        $("#btOcExportarExcel").on("click", exportOrderExcel);

        $("#txOcBuscarProductoServicio").on("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                runImmediateSearch();
            }
        });

        $("#txOcBuscarProductoServicio").on("input", scheduleAutoSearch);

        $("#txOcBuscarPartidas").on("input", function () {
            state.editor.partidasFilter = String($(this).val() || "").trim();
            renderPartidas();
        });

        $("#cbOcSucursal").on("change", function () {
            const selected = String($(this).val() || "");
            if (selected === "all") {
                state.editor.selectedSucursalIds = state.combos.sucursales.map(function (item) { return normalizeGuid(item.id); }).filter(Boolean);
            } else {
                const id = normalizeGuid(selected);
                if (id && state.editor.selectedSucursalIds.indexOf(id) < 0) state.editor.selectedSucursalIds.push(id);
            }
            renderSucursalSelector();
            syncRazonSocialFromSucursales();
            renderCaptureDestinationOptions();
            state.editor.selectedProduct = null;
            state.editor.selectedVariantId = null;
            state.editor.captureRows = [];
            renderCapture();
            clearFieldError(this);
            refreshWizardState();
        });

        $("#cbOcProveedor, #cbOcBuscarTipo, #ckOcSoloProveedor").on("change", function () {
            clearFieldError(this);
            state.editor.selectedProduct = null;
            state.editor.selectedVariantId = null;
            state.editor.captureRows = [];
            state.editor.searchSelections = {};
            state.editor.lastSearchKey = "";
            renderCapture();
            refreshWizardState();
            if (String($("#txOcBuscarProductoServicio").val() || "").trim()) {
                runImmediateSearch();
            }
        });

        $("#txOcFechaOrden, #txOcFechaLlegada, #txOcFechaMinima, #txOcFechaMaxima, #txOcFolioReferencia, #txOcObservaciones").on("input change", function () {
            clearFieldError(this);
            syncDateValidationWindow(this.id);
            refreshWizardState();
        });

        $("#txOcCancelarMotivo").on("input", function () {
            clearFieldError(this);
            setStatus("#txOcCancelarStatus", "", "");
        });

        $("#grOcResultadosBusqueda").on("click", "[data-oc-card-item]", function () {
            const productId = $(this).data("ocCardItem");
            const item = state.editor.searchResults.find(function (entry) {
                return String(entry.id) === String(productId);
            });

            if (!item || state.editor.readOnly || state.editor.addingProductId) {
                return;
            }

            addPartidaFromSearch(item, null);
        }).on("keydown", "[data-oc-card-item]", function (event) {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            $(this).trigger("click");
        });

        $("#panelOcCaptureRows").on("change input", "[data-capture-qty], [data-capture-presentation]", function () {
            const key = String($(this).data("captureQty") || $(this).data("capturePresentation") || "");
            scheduleCapturePreview(key);
        }).on("change", "[data-capture-select]", function () {
            const row = findCaptureRow($(this).data("captureSelect"));
            if (row) row.selected = $(this).prop("checked");
        }).on("click", "[data-capture-store-mode]", function () {
            applyCaptureModeToStore($(this).data("captureStore"), Number($(this).data("captureStoreMode")));
        }).on("input change", "[data-capture-base]", function () {
            const idSucursal = normalizeGuid($(this).data("captureBase"));
            const settings = getCaptureStoreSettings(idSucursal);
            settings.baseQuantity = Math.max(0, roundQuantity(toNumber($(this).val())));
        }).on("change", "[data-capture-curve]", function () {
            getCaptureStoreSettings($(this).data("captureCurve")).selectedCurveId = normalizeGuid($(this).val());
        }).on("click", "[data-capture-store-action]", function () {
            applyCaptureStoreAction($(this).data("captureStoreAction"), $(this).data("captureStore"));
        }).on("click", "[data-capture-equal]", function () {
            applyEqualQuantityToStore($(this).data("captureEqual"));
        }).on("click", "[data-capture-step]", function () {
            stepCaptureQuantity($(this).data("captureKey"), Number($(this).data("captureStep")));
        });

        $("#panelOcCaptureGlobal").on("click", "[data-capture-global-mode]", function () {
            confirmAndApplyCaptureMode(Number($(this).data("captureGlobalMode")));
        });

        $("#cbOcCapturaVariante").on("change", renderCapturePresentationOptions);
        $("#cbOcCapturaSucursal").on("change", function () { clearFieldError(this); });
        $("#cbOcCapturaPresentacion").on("change", syncCaptureValues);
        $("#txOcCapturaCantidad, #txOcCapturaCosto").on("input", function () { clearFieldError(this); });

        $("#grOcPartidas").on("input", "[data-oc-qty]", function () {
            updatePartidaField($(this).data("ocQty"), "cantidadCompra", $(this).val());
        });

        $("#grOcPartidas").on("input", "[data-oc-cost]", function () {
            updatePartidaField($(this).data("ocCost"), "costoUnitario", $(this).val());
        });

        $("#grOcPartidas").on("click", "[data-oc-remove-item]", function () {
            removePartida($(this).data("ocRemoveItem"));
        });

        $("#grOcPartidas").on("click", "[data-oc-edit-item]", function () {
            const uid = String($(this).data("ocEditItem") || "");
            const input = document.querySelector("[data-oc-qty='" + cssEscape(uid) + "']");
            if (input) { input.focus(); input.select(); }
        });

        $("#panelOcSucursalChips").on("click", "[data-oc-remove-branch]", function () {
            if (state.editor.readOnly) return;
            const id = normalizeGuid($(this).data("ocRemoveBranch"));
            if (state.editor.partidas.some(function (partida) { return normalizeGuid(partida.idSucursal) === id; })) {
                showError("Quita primero las partidas de esta sucursal.");
                return;
            }
            state.editor.selectedSucursalIds = state.editor.selectedSucursalIds.filter(function (value) { return value !== id; });
            renderSucursalSelector();
            syncRazonSocialFromSucursales();
            renderCaptureDestinationOptions();
            state.editor.selectedProduct = null;
            state.editor.selectedVariantId = null;
            state.editor.captureRows = [];
            renderCapture();
            refreshWizardState();
        });

        $("#modalOcCancelar").on("hidden.bs.modal", function () {
            $("#txOcCancelarMotivo").val("");
            clearFieldError("#txOcCancelarMotivo");
            setStatus("#txOcCancelarStatus", "", "");
            syncActionButtons();
        });
    }

    function loadCombos() {
        return fetchJson("/Activos/OrdenesCompra/ObtenerCombosOrdenCompra")
            .then(function (data) {
                state.combos.razonesSociales = Array.isArray(data.razonesSociales) ? data.razonesSociales : [];
                state.combos.sucursales = Array.isArray(data.sucursales) ? data.sucursales : [];
                state.combos.proveedores = Array.isArray(data.proveedores) ? data.proveedores : [];
                populateEditorCombos();
            });
    }

    function loadOrderDetail(id) {
        state.editor.loading = true;
        showEditorOverlay(true, "Cargando orden...", "Consultando el detalle guardado.");
        return fetchJson("/Activos/OrdenesCompra/ObtenerOrdenCompra?idOrdenCompra=" + encodeURIComponent(id))
            .then(function (detail) {
                applyDetailToEditor(detail);
                return detail;
            })
            .finally(function () {
                state.editor.loading = false;
                showEditorOverlay(false);
                syncActionButtons();
            });
    }

    function populateEditorCombos() {
        populateSelect("#cbOcRazonSocial", state.combos.razonesSociales, {
            emptyText: "Selecciona una razón social"
        });
        populateSelect("#cbOcProveedor", state.combos.proveedores, {
            emptyText: "Selecciona un proveedor"
        });
        renderSucursalSelector();
    }

    function syncSucursalesByRazonSocial() {
        const selectedRazonSocial = normalizeGuid($("#cbOcRazonSocial").val());
        const filtered = !selectedRazonSocial
            ? state.combos.sucursales
            : state.combos.sucursales.filter(function (item) {
                return !item.idPadre || String(item.idPadre) === String(selectedRazonSocial) || String(item.idRazonSocial) === String(selectedRazonSocial);
            });

        const currentValue = normalizeGuid($("#cbOcSucursal").val());
        populateSelect("#cbOcSucursal", filtered, {
            emptyText: "Selecciona una sucursal"
        });

        if (currentValue && filtered.some(function (item) { return String(item.id) === String(currentValue); })) {
            $("#cbOcSucursal").val(currentValue);
        }
    }

    function syncRazonSocialFromSucursales() {
        const idSucursal = getSelectedSucursalIds()[0] || "";
        const sucursal = state.combos.sucursales.find(function (item) {
            return String(item.id) === String(idSucursal);
        });
        const idRazonSocial = normalizeGuid(sucursal && (sucursal.idRazonSocial || sucursal.idPadre));
        $("#cbOcRazonSocial").val(idRazonSocial || "");
    }

    function getSelectedSucursalIds() {
        return state.editor.selectedSucursalIds.slice();
    }

    function getSucursalById(id) {
        return state.combos.sucursales.find(function (item) { return String(item.id) === String(id); }) || null;
    }

    function getSelectedSucursalNames() {
        return getSelectedSucursalIds().map(function (id) {
            const item = getSucursalById(id);
            return item ? ([item.codigo, item.nombre].filter(Boolean).join(" · ") || "Sucursal") : "Sucursal";
        });
    }

    function renderSucursalSelector() {
        const select = document.querySelector("#cbOcSucursal");
        if (!select) return;
        const selected = new Set(state.editor.selectedSucursalIds);
        const available = state.combos.sucursales.filter(function (item) { return !selected.has(normalizeGuid(item.id)); });
        select.innerHTML = "";
        appendOption(select, "", available.length ? "Agrega una sucursal" : "Todas las sucursales seleccionadas");
        if (available.length > 1) appendOption(select, "all", "Seleccionar todas");
        available.forEach(function (item) {
            appendOption(select, item.id, [item.codigo, item.nombre].filter(Boolean).join(" · "));
        });
        select.value = "";
        select.disabled = state.editor.readOnly || available.length === 0;

        const chips = document.querySelector("#panelOcSucursalChips");
        if (!chips) return;
        chips.innerHTML = state.editor.selectedSucursalIds.map(function (id) {
            const item = getSucursalById(id);
            const label = item ? ([item.codigo, item.nombre].filter(Boolean).join(" · ")) : "Sucursal";
            return "<span class='oc-destination-chip'>" + escapeHtml(label) +
                "<button type='button' data-oc-remove-branch='" + escapeHtml(id) + "' aria-label='Quitar " + escapeHtml(label) + "'" +
                (state.editor.readOnly ? " disabled" : "") + "><i class='fa fa-times'></i></button></span>";
        }).join("");
    }

    function renderCaptureDestinationOptions() {
        const select = document.querySelector("#cbOcCapturaSucursal");
        if (!select) { return; }
        const previous = String(select.value || "");
        const ids = getSelectedSucursalIds();
        select.innerHTML = "";
        if (ids.length > 1) appendOption(select, "all", "Todas las tiendas");
        ids.forEach(function (id) {
            const item = getSucursalById(id);
            appendOption(select, id, item ? ([item.codigo, item.nombre].filter(Boolean).join(" · ")) : "Sucursal");
        });
        if (Array.from(select.options).some(function (o) { return o.value === previous; })) select.value = previous;
        select.disabled = state.editor.readOnly || ids.length === 0;
    }

    function searchProductosServicios() {
        if (state.editor.readOnly || state.editor.searching) {
            return;
        }

        const descriptor = buildSearchDescriptor();
        if (!descriptor.forceable && descriptor.key === state.editor.lastSearchKey) {
            return;
        }

        if (state.editor.searchAbortController) {
            state.editor.searchAbortController.abort();
        }

        const requestSequence = ++state.editor.searchSequence;
        state.editor.activeSearchSequence = requestSequence;
        state.editor.searchAbortController = new AbortController();

        state.editor.searching = true;
        syncActionButtons();
        setStatus("#txOcBusquedaEstado", "info", "Buscando productos y servicios...");

        fetchJson("/Activos/OrdenesCompra/BuscarProductosServiciosOrdenCompra?" + descriptor.params.toString(), {
            signal: state.editor.searchAbortController.signal
        })
            .then(function (items) {
                if (requestSequence !== state.editor.activeSearchSequence) {
                    return;
                }

                state.editor.lastSearchKey = descriptor.key;
                state.editor.searchResults = Array.isArray(items) ? items : [];
                state.editor.searchResults = sortSearchResults(state.editor.searchResults);
                renderSearchResults(state.editor.searchResults);
                const count = state.editor.searchResults.length;
                setStatus(
                    "#txOcBusquedaEstado",
                    count ? "success" : "warning",
                    count ? "Selecciona un producto o servicio para agregarlo." : "No encontramos coincidencias con esa búsqueda."
                );
            })
            .catch(function (error) {
                if (error && error.name === "AbortError") {
                    return;
                }

                state.editor.searchResults = [];
                renderSearchResults([]);
                setStatus("#txOcBusquedaEstado", "danger", resolveErrorMessage(error));
            })
            .finally(function () {
                if (requestSequence !== state.editor.activeSearchSequence) {
                    return;
                }

                state.editor.searching = false;
                state.editor.searchAbortController = null;
                syncActionButtons();
            });
    }

    function clearSearchProductosServicios() {
        $("#txOcBuscarProductoServicio").val("");
        $("#cbOcBuscarTipo").val("");
        if (state.editor.searchAbortController) {
            state.editor.searchAbortController.abort();
            state.editor.searchAbortController = null;
        }
        state.editor.searching = false;
        state.editor.searchResults = [];
        state.editor.searchSelections = {};
        renderSearchResults([]);
        setStatus("#txOcBusquedaEstado", "", "");
        state.editor.lastSearchKey = "";
        syncActionButtons();
        refreshWizardState();
    }

    function renderSearchResults(items) {
        const container = document.querySelector("#grOcResultadosBusqueda");
        if (!container) {
            return;
        }

        container.innerHTML = "";
        $("#txOcBusquedaResultadosCount").text((Array.isArray(items) ? items.length : 0) + " resultados");

        if (!Array.isArray(items) || !items.length) {
            container.innerHTML = "<div class='oc-empty-state'>No hay resultados para mostrar.</div>";
            return;
        }

        items.forEach(function (item) {
            const card = document.createElement("article");
            card.className = "oc-product-card";
            card.tabIndex = state.editor.readOnly ? -1 : 0;
            card.setAttribute("role", "button");
            card.setAttribute("data-oc-card-item", item.id);
            card.setAttribute("aria-label", "Seleccionar " + (item.nombre || item.codigo || "concepto"));
            const variants = Array.isArray(item.variantes) ? item.variantes : [];
            const presentations = Array.isArray(item.presentacionesCompra) ? item.presentacionesCompra : [];
            const isProduct = Number(item.tipo || 0) === 1;
            const variantNames = variants.map(function (variant) { return variant.nombre || variant.sku || variant.claveCombinacion || "Variante"; });
            const presentationNames = presentations.map(function (presentation) { return presentation.nombre || "Presentación"; });
            card.innerHTML = [
                "<div class='oc-product-card-head'><div><strong>" + escapeHtml(item.nombre || "Sin nombre") + "</strong><span class='oc-type-badge'>" + escapeHtml(item.tipoNombre || "Concepto") + "</span></div><code>" + escapeHtml(item.codigo || "Sin código") + "</code></div>",
                item.descripcion ? "<p>" + escapeHtml(toPlainText(item.descripcion)) + "</p>" : "",
                "<div class='oc-product-facts'>" + (item.categoria ? "<span><b>Categoría:</b> " + escapeHtml(item.categoria) + "</span>" : "") + (item.marca ? "<span><b>Marca:</b> " + escapeHtml(item.marca) + "</span>" : "") + (isProduct ? "<span><b>Unidad:</b> " + escapeHtml(resolveUnidadDisplay(item.unidad, item.abreviatura)) + "</span>" : "") + "</div>",
                isProduct && variantNames.length ? "<div class='oc-product-variants'><b>Variantes:</b><span>" + escapeHtml(variantNames.join(", ")) + "</span></div>" : "",
                isProduct && presentationNames.length ? "<div class='oc-product-variants'><b>Presentaciones de compra:</b><span>" + escapeHtml(presentationNames.join(", ")) + "</span></div>" : "",
                isProduct ? "<strong class='oc-product-card-instruction'>SELECCIONA EL PRODUCTO PARA CARGAR VARIANTES Y PRESENTACIONES</strong>" : "<strong class='oc-product-card-instruction'>SELECCIONA EL SERVICIO PARA CAPTURARLO</strong>"
            ].join("");
            container.appendChild(card);
        });
    }

    function rememberSearchSelection(productId) {
        const normalizedProductId = normalizeGuid(productId);
        if (!normalizedProductId) {
            return;
        }

        const variant = normalizeGuid($("[data-oc-variant-for='" + cssEscape(normalizedProductId) + "']").val());
        const presentation = normalizeGuid($("[data-oc-presentation-for='" + cssEscape(normalizedProductId) + "']").val());
        state.editor.searchSelections[normalizedProductId] = {
            idVariante: variant,
            idPresentacionCompra: presentation
        };
    }

    function resolveSearchSelection(item) {
        const productId = normalizeGuid(item && item.id);
        const stored = state.editor.searchSelections[productId] || {};
        const variant = findSelectedVariant(item, stored.idVariante)
            ? normalizeGuid(stored.idVariante)
            : "";
        const presentation = findSelectedPresentation(item, stored.idPresentacionCompra)
            ? normalizeGuid(stored.idPresentacionCompra)
            : "";

        return {
            idVariante: variant,
            idPresentacionCompra: presentation
        };
    }

    function buildVariantSelectHtml(item, selectedId) {
        const variants = Array.isArray(item.variantes) ? item.variantes : [];
        if (Number(item.tipo || 0) !== 1) {
            return "<span class='oc-muted'>No aplica</span>";
        }

        if (!variants.length) {
            return "<span class='oc-muted'>Base</span>";
        }

        const options = ["<option value=''>Selecciona variante</option>"].concat(variants.map(function (variant) {
            const text = [variant.nombre, variant.sku].filter(Boolean).join(" · ");
            return "<option value='" + escapeHtml(variant.id) + "'" + (String(selectedId || "") === String(variant.id || "") ? " selected" : "") + ">" + escapeHtml(text || variant.claveCombinacion || "Variante") + "</option>";
        }));

        return "<select class='form-select oc-inline-select' data-oc-variant-for='" + escapeHtml(item.id) + "'>" + options.join("") + "</select>";
    }

    function buildPresentationSelectHtml(item, selectedVariantId, selectedPresentationId, unidadCompra) {
        if (Number(item.tipo || 0) !== 1) {
            return "<span class='oc-muted'>No aplica</span>";
        }

        const presentations = getPresentationsForVariant(item, selectedVariantId);
        const options = ["<option value=''>Base directa (" + escapeHtml(unidadCompra || "unidad") + ")</option>"].concat(presentations.map(function (presentation) {
            const label = presentation.nombre + " · " + formatFactor(presentation.factorConversionBase || 1) + " " + resolveUnidadDisplay(item.unidad, item.abreviatura);
            return "<option value='" + escapeHtml(presentation.id) + "'" + (String(selectedPresentationId || "") === String(presentation.id || "") ? " selected" : "") + ">" + escapeHtml(label) + "</option>";
        }));

        return "<select class='form-select oc-inline-select' data-oc-presentation-for='" + escapeHtml(item.id) + "'>" + options.join("") + "</select>";
    }

    function findSelectedVariant(item, idVariante) {
        const id = normalizeGuid(idVariante);
        if (!id) {
            return null;
        }

        return (Array.isArray(item.variantes) ? item.variantes : []).find(function (variant) {
            return String(variant.id) === String(id);
        }) || null;
    }

    function findSelectedPresentation(item, idPresentacionCompra) {
        const id = normalizeGuid(idPresentacionCompra);
        if (!id) {
            return null;
        }

        return (Array.isArray(item.presentacionesCompra) ? item.presentacionesCompra : []).find(function (presentation) {
            return String(presentation.id) === String(id);
        }) || null;
    }

    function getPresentationsForVariant(item, idVariante) {
        const selectedVariantId = normalizeGuid(idVariante);
        return (Array.isArray(item.presentacionesCompra) ? item.presentacionesCompra : []).filter(function (presentation) {
            const presentationVariantId = normalizeGuid(presentation.idVariante);
            return selectedVariantId
                ? presentationVariantId === selectedVariantId
                : !presentationVariantId;
        });
    }

    function resolveManualCaptureBaseQuantity(item, row) {
        const presentation = findSelectedPresentation(item, row.idPresentacionCompra);
        const factor = presentation ? Math.max(toNumber(presentation.factorConversionBase), 1) : 1;
        return roundQuantity(toNumber(row.cantidad) * factor);
    }

    function buildPartidaKey(idSucursal, idProductoServicio, idVariante, idPresentacionCompra) {
        return [
            normalizeGuid(idSucursal),
            normalizeGuid(idProductoServicio),
            normalizeGuid(idVariante) || "base",
            normalizeGuid(idPresentacionCompra) || "base"
        ].join(":");
    }

    function addPartidaFromSearch(item, variantId) {
        state.editor.selectedProduct = item;
        state.editor.selectedVariantId = normalizeGuid(variantId);
        renderCapture();
        setStatus("#txOcBusquedaEstado", "success", "Concepto seleccionado. Completa sucursales, cantidades y costo.");
        state.editor.maxUnlockedStep = Math.max(state.editor.maxUnlockedStep || 1, 4);
        goToStep(4, false);
        openCaptureModal();
    }

    function renderCapture() {
        const item = state.editor.selectedProduct;
        $("#txOcCapturaTipo").text(item ? (item.tipoNombre || "Producto / servicio") : "Producto / servicio");
        $("#txOcCapturaNombre").text(item ? (item.nombre || "Sin nombre") : "Selecciona un concepto en el paso anterior.");
        $("#txOcCapturaCodigo").text(item ? (item.codigo || "Sin código") : "—");

        renderCaptureDestinationOptions();
        $("#btOcAbrirCaptura").prop("disabled", !item || state.editor.readOnly);
    }

    function appendOption(select, value, text) {
        const option = document.createElement("option");
        option.value = value || "";
        option.textContent = text || "";
        select.appendChild(option);
    }

    function renderCapturePresentationOptions() {
        const item = state.editor.selectedProduct;
        const presentationSelect = document.querySelector("#cbOcCapturaPresentacion");
        if (!presentationSelect) { return; }
        presentationSelect.innerHTML = "";
        if (!item || Number(item.tipo || 0) !== 1) {
            appendOption(presentationSelect, "", item ? "No aplica" : "Selecciona un concepto");
            presentationSelect.disabled = true;
            syncCaptureValues();
            return;
        }

        const idVariante = normalizeGuid($("#cbOcCapturaVariante").val());
        const presentations = getPresentationsForVariant(item, idVariante);
        appendOption(presentationSelect, "", "Base directa");
        presentations.forEach(function (presentation) {
            appendOption(presentationSelect, presentation.id, presentation.nombre + " · " + formatFactor(presentation.factorConversionBase || 1));
        });
        presentationSelect.disabled = state.editor.readOnly || !presentations.length;

        const variant = findSelectedVariant(item, idVariante);
        if (variant && variant.costoActual !== null && variant.costoActual !== undefined) {
            $("#txOcCapturaCosto").val(formatDecimalInput(variant.costoActual));
        } else {
            $("#txOcCapturaCosto").val(formatDecimalInput(item.costoActual || 0));
        }
        syncCaptureValues();
    }

    function syncCaptureValues() {
        const item = state.editor.selectedProduct;
        const presentation = item ? findSelectedPresentation(item, $("#cbOcCapturaPresentacion").val()) : null;
        const factor = presentation ? Number(presentation.factorConversionBase || 1) : 1;
        const unit = presentation
            ? resolveUnidadDisplay(presentation.unidadCompra, presentation.unidadCompraAbreviatura)
            : (item ? resolveUnidadDisplay(item.unidad, item.abreviatura) : "—");
        $("#txOcCapturaUnidad").val(unit);
        $("#txOcCapturaFactor").val(formatFactor(factor));
    }

    function openCaptureModal() {
        const item = state.editor.selectedProduct;
        if (!item || state.editor.readOnly || !getSelectedSucursalIds().length) { return; }
        const isProduct = Number(item.tipo || 0) === 1;
        const variants = isProduct && Array.isArray(item.variantes) && item.variantes.length
            ? item.variantes.filter(function (variant) { return !state.editor.selectedVariantId || normalizeGuid(variant.id) === state.editor.selectedVariantId; })
            : [null];
        state.editor.captureRows = [];
        state.editor.captureStoreSettings = {};
        state.editor.curvasAplicables = [];
        setStatus("#txOcCaptureStatus", "", "");
        getSelectedSucursalIds().forEach(function (idSucursal) {
            variants.forEach(function (variant) {
                const key = [idSucursal, variant ? variant.id : "base"].join(":");
                state.editor.captureRows.push({
                    key: key,
                    idSucursal: idSucursal,
                    idVariante: variant ? variant.id : null,
                    selected: true,
                    modo: 1,
                    cantidad: isProduct ? 0 : 1,
                    costo: Number(variant && variant.costoActual != null ? variant.costoActual : item.costoActual || 0),
                    idPresentacionCompra: null,
                    idCurvaTemporal: null,
                    preview: null,
                    inicializando: isProduct
                });
            });
        });
        state.editor.capturePreviewSequence += 1;
        renderCaptureRows();
        if (state.ui.captureModal) state.ui.captureModal.show();
        if (isProduct) {
            loadCurvasAplicables(item.id).finally(refreshCapturePreviews);
        }
    }

    function loadCurvasAplicables(idProductoServicio) {
        return fetchJson("/Activos/OrdenesCompra/ObtenerCurvasAplicablesOrdenCompra?idProductoServicio=" + encodeURIComponent(idProductoServicio))
            .then(function (items) {
                state.editor.curvasAplicables = Array.isArray(items) ? items : [];
                renderCaptureRows();
            })
            .catch(function (error) {
                state.editor.curvasAplicables = [];
                setStatus("#txOcCaptureStatus", "warning", "No fue posible cargar las curvas lógicas: " + resolveErrorMessage(error));
            });
    }

    function renderCaptureRows() {
        const item = state.editor.selectedProduct;
        const container = document.querySelector("#panelOcCaptureRows");
        if (!item || !container) return;
        $("#panelOcCaptureConcept").html("<strong>" + escapeHtml(item.nombre || "") + "</strong><span>" + escapeHtml(item.codigo || "") + " · " + escapeHtml(item.tipoNombre || "") + "</span>");
        const isProduct = Number(item.tipo || 0) === 1;
        $("#panelOcCaptureLegend, #panelOcCaptureGlobal").prop("hidden", !isProduct);
        const stores = getSelectedSucursalIds().map(function (idSucursal) {
            return { idSucursal: idSucursal, rows: state.editor.captureRows.filter(function (row) { return normalizeGuid(row.idSucursal) === normalizeGuid(idSucursal); }) };
        });
        container.innerHTML = stores.map(function (store) {
            return isProduct ? renderProductCaptureStore(item, store.idSucursal, store.rows) : renderServiceCaptureStore(item, store.idSucursal, store.rows[0]);
        }).join("");
    }

    function renderProductCaptureStore(item, idSucursal, rows) {
        const branch = getSucursalById(idSucursal);
        const settings = getCaptureStoreSettings(idSucursal);
        const metrics = sumCaptureMetrics(rows);
        const previewsReady = rows.length > 0 && rows.every(function (row) { return !!row.preview; });
        const curves = rows.filter(function (row) { return row.preview && normalizeGuid(row.preview.idCurva); }).length;
        const curveNames = Array.from(new Set(rows.map(function (row) { return row.preview && row.preview.curvaNombre; }).filter(Boolean)));
        const curveLabel = !previewsReady ? "Calculando…" : curves === rows.length ? "Curva configurada" : curves > 0 ? "Curva parcial" : "Sin curva configurada";
        const hasConfiguredCurve = previewsReady && curves === rows.length;
        const curveClass = hasConfiguredCurve ? "is-curve" : "is-pending";
        const activeModes = Array.from(new Set(rows.map(function (row) { return Number(row.modo || 1); })));
        const mode = activeModes.length === 1 ? activeModes[0] : 0;
        const finalPieces = rows.reduce(function (sum, row) {
            if (row.modo === 4) return sum;
            return sum + Number(row.preview ? row.preview.cantidadFinalBase : row.cantidad || 0);
        }, 0);
        return [
            "<article class='oc-capture-store " + curveClass + "' data-capture-store='" + escapeHtml(idSucursal) + "'>",
            "<header class='oc-capture-store-head'><div><strong>" + escapeHtml(branch ? branch.nombre : "Sucursal") + "</strong><span>" + escapeHtml(hasConfiguredCurve ? "Curva configurada" : "Captura manual pendiente") + "</span></div><div class='oc-capture-badges'><span class='" + (hasConfiguredCurve ? "is-curve" : "is-pending") + "'>" + escapeHtml(curveLabel) + "</span><span class='is-manual'>" + escapeHtml(captureModeName(mode)) + "</span><b>" + escapeHtml(formatDecimalInput(finalPieces)) + " pzas finales</b></div></header>",
            "<div class='oc-capture-store-summary'><span><b>Curva:</b> " + escapeHtml(curveNames.join(", ") || "—") + "</span><span><b>Variantes activas:</b> " + rows.filter(function (row) { return row.selected && row.modo !== 4; }).length + "</span><span><b>Piezas propuestas:</b> " + escapeHtml(formatDecimalInput(metrics.propuesta)) + "</span></div>",
            curves === rows.length
                ? "<div class='oc-capture-guidance'><span>La curva automática ya quedó resuelta para esta sucursal. Puedes ajustar cantidades sin afectar otras sucursales.</span><button type='button' data-capture-store-action='no-order' data-capture-store='" + escapeHtml(idSucursal) + "'><i class='fa fa-minus-circle'></i>No pedir</button></div>"
                : renderCaptureCurveConfiguration(idSucursal, settings),
            "<div class='oc-capture-store-modes' role='group' aria-label='Modo de captura para " + escapeHtml(branch ? branch.nombre : "sucursal") + "'>",
            renderCaptureModeButton(idSucursal, 1, mode), renderCaptureModeButton(idSucursal, 2, mode), renderCaptureModeButton(idSucursal, 3, mode), renderCaptureModeButton(idSucursal, 4, mode),
            "<label class='oc-capture-base'><span>Cantidad base</span><input type='number' min='0' step='1' data-capture-base='" + escapeHtml(idSucursal) + "' value='" + escapeHtml(formatDecimalInput(settings.baseQuantity)) + "'></label>",
            "</div>",
            "<div class='oc-capture-quick-actions'><button type='button' data-capture-equal='" + escapeHtml(idSucursal) + "'><i class='fa fa-columns'></i>IGUALES EN ESTA SUCURSAL</button><button type='button' data-capture-store-action='reset' data-capture-store='" + escapeHtml(idSucursal) + "'><i class='fa fa-undo'></i>RESTABLECER SUGERENCIA</button></div>",
            renderCaptureMetrics(metrics),
            "<div class='oc-capture-table-wrap'><table class='oc-capture-table'><thead><tr><th>Variante / presentación</th><th>Curva</th><th>Existencia</th><th>Tránsito</th><th>Hueco</th><th>Copete</th><th>Pedido</th><th>Estado</th></tr></thead><tbody>",
            rows.map(function (row) { return renderProductCaptureRow(item, row); }).join(""),
            "</tbody></table></div></article>"
        ].join("");
    }

    function renderCaptureCurveConfiguration(idSucursal, settings) {
        const options = ["<option value=''>Selecciona una curva</option>"].concat(state.editor.curvasAplicables.map(function (curve) {
            const label = [curve.codigo, curve.nombre].filter(Boolean).join(" · ");
            return "<option value='" + escapeHtml(curve.id) + "'" + (normalizeGuid(settings.selectedCurveId) === normalizeGuid(curve.id) ? " selected" : "") + ">" + escapeHtml(label || "Curva") + "</option>";
        }));
        return [
            "<div class='oc-capture-curve-config'>",
            "<label><span>Curva lógica</span><select data-capture-curve='" + escapeHtml(idSucursal) + "'>" + options.join("") + "</select></label>",
            "<div class='oc-capture-curve-actions'>",
            "<button type='button' class='is-primary' data-capture-store-action='apply-curve' data-capture-store='" + escapeHtml(idSucursal) + "'><i class='fa fa-magic'></i>APLICAR CURVA</button>",
            "<button type='button' data-capture-store-action='manual' data-capture-store='" + escapeHtml(idSucursal) + "'><i class='fa fa-pencil'></i>CAPTURA MANUAL</button>",
            "<button type='button' data-capture-store-action='manual-clear' data-capture-store='" + escapeHtml(idSucursal) + "'><i class='fa fa-times-rectangle'></i>CAPTURA MANUAL Y LIMPIAR</button>",
            "<button type='button' data-capture-store-action='no-order' data-capture-store='" + escapeHtml(idSucursal) + "'><i class='fa fa-minus-circle'></i>NO PEDIR</button>",
            "</div></div>"
        ].join("");
    }

    function renderServiceCaptureStore(item, idSucursal, row) {
        if (!row) return "";
        const branch = getSucursalById(idSucursal);
        return [
            "<article class='oc-capture-service' data-capture-store='" + escapeHtml(idSucursal) + "'>",
            "<header><label class='oc-capture-select'><input type='checkbox' data-capture-select='" + escapeHtml(row.key) + "'" + (row.selected ? " checked" : "") + "><span>" + escapeHtml(branch ? branch.nombre : "Sucursal") + "</span></label><strong>Servicio</strong></header>",
            "<div class='oc-capture-service-fields'>",
            captureNumberField("Cantidad", "data-capture-qty", row.key, row.cantidad, "0.0001", false),
            "<div class='oc-capture-cost-info'><span>Costo asociado</span><strong>" + escapeHtml(formatCurrency(row.costo)) + "</strong></div>",
            "</div></article>"
        ].join("");
    }

    function renderProductCaptureRow(item, row) {
        const variant = findSelectedVariant(item, row.idVariante);
        const presentations = getPresentationsForVariant(item, row.idVariante);
        const preview = row.preview || {};
        const disabled = row.modo === 4;
        const options = presentations.map(function (presentation) {
            return "<option value='" + escapeHtml(presentation.id) + "'" + (normalizeGuid(row.idPresentacionCompra) === normalizeGuid(presentation.id) ? " selected" : "") + ">" + escapeHtml(presentation.nombre) + " · x" + escapeHtml(formatFactor(presentation.factorConversionBase || 1)) + "</option>";
        }).join("");
        const presentationControl = presentations.length
            ? "<select aria-label='Presentación de compra' data-capture-presentation='" + escapeHtml(row.key) + "'" + (disabled ? " disabled" : "") + "><option value=''>Selecciona presentación</option>" + options + "</select>"
            : "<span class='oc-capture-direct'>Base directa</span>";
        const stateLabel = capturePreviewState(row);
        return [
            "<tr class='" + (disabled ? "is-no-order" : "") + "' data-capture-row='" + escapeHtml(row.key) + "'>",
            "<td><div class='oc-capture-variant'><label class='oc-capture-select'><input type='checkbox' data-capture-select='" + escapeHtml(row.key) + "'" + (row.selected ? " checked" : "") + (disabled ? " disabled" : "") + "><span>" + escapeHtml(variant ? (variant.nombre || variant.sku || "Variante") : "Producto base") + "</span></label><small>Costo asociado: " + escapeHtml(formatCurrency(row.costo)) + "</small>" + presentationControl + "</div></td>",
            metricCell(preview.curvaObjetivoBase), metricCell(preview.existenciaBase), metricCell(preview.transitoBase), metricCell(preview.huecoBase), metricCell(preview.copeteBase),
            "<td>" + captureNumberField("Pedido", "data-capture-qty", row.key, row.cantidad, "0.0001", disabled) + "</td>",
            "<td><span class='oc-capture-state " + escapeHtml(stateLabel.className) + "'>" + escapeHtml(stateLabel.text) + "</span></td></tr>"
        ].join("");
    }

    function renderCaptureModeButton(idSucursal, mode, activeMode) {
        return "<button type='button' class='oc-capture-mode" + (mode === activeMode ? " is-active" : "") + "' data-capture-store='" + escapeHtml(idSucursal) + "' data-capture-store-mode='" + mode + "'><span class='oc-radio'></span>" + escapeHtml(captureModeName(mode)) + "</button>";
    }

    function renderCaptureMetrics(metrics) {
        return "<div class='oc-capture-metrics'><span>Curva objetivo <b>" + formatDecimalInput(metrics.curva) + "</b></span><span>Existencia <b>" + formatDecimalInput(metrics.existencia) + "</b></span><span>Tránsito <b>" + formatDecimalInput(metrics.transito) + "</b></span><span>Hueco <b>" + formatDecimalInput(metrics.hueco) + "</b></span><span>Copete <b>" + formatDecimalInput(metrics.copete) + "</b></span><span>Piezas propuestas <b>" + formatDecimalInput(metrics.propuesta) + "</b></span><span>Piezas finales <b>" + formatDecimalInput(metrics.final) + "</b></span></div>";
    }

    function sumCaptureMetrics(rows) {
        return rows.reduce(function (result, row) {
            const preview = row.preview || {};
            result.curva += Number(preview.curvaObjetivoBase || 0);
            result.existencia += Number(preview.existenciaBase || 0);
            result.transito += Number(preview.transitoBase || 0);
            result.hueco += Number(preview.huecoBase || 0);
            result.copete += Number(preview.copeteBase || 0);
            result.propuesta += Number(preview.cantidadPropuestaBase || 0);
            result.final += Number(preview.cantidadFinalBase || 0);
            return result;
        }, { curva: 0, existencia: 0, transito: 0, hueco: 0, copete: 0, propuesta: 0, final: 0 });
    }

    function captureNumberField(label, attribute, key, value, step, disabled) {
        return "<label class='oc-capture-number'><span>" + escapeHtml(label) + "</span><span class='oc-capture-stepper'><button type='button' data-capture-step='-1' data-capture-key='" + escapeHtml(key) + "'" + (disabled ? " disabled" : "") + ">−</button><input type='number' min='0' step='" + escapeHtml(step) + "' " + attribute + "='" + escapeHtml(key) + "' value='" + escapeHtml(formatDecimalInput(value)) + "'" + (disabled ? " disabled" : "") + "><button type='button' data-capture-step='1' data-capture-key='" + escapeHtml(key) + "'" + (disabled ? " disabled" : "") + ">+</button></span></label>";
    }

    function metricCell(value) {
        return "<td>" + escapeHtml(value === null || value === undefined ? "—" : formatDecimalInput(value)) + "</td>";
    }

    function captureModeName(mode) {
        return ({ 1: "Manual", 2: "Pedido inicial", 3: "Rellenar curva", 4: "No pedir" })[Number(mode || 0)] || "Mixto";
    }

    function capturePreviewState(row) {
        if (row.modo === 4) return { text: "No pedir", className: "is-none" };
        if (!row.preview) return { text: "Calculando", className: "is-pending" };
        if (!normalizeGuid(row.preview.idCurva)) return { text: "Sin curva", className: "is-pending" };
        if (Number(row.preview.huecoBase || 0) > 0) return { text: "Hueco", className: "is-gap" };
        if (Number(row.preview.copeteBase || 0) > 0) return { text: "Copete", className: "is-over" };
        return { text: "Curva configurada", className: "is-ok" };
    }

    function findCaptureRow(key) {
        const normalizedKey = String(key || "");
        return state.editor.captureRows.find(function (row) { return row.key === normalizedKey; });
    }

    function getCaptureStoreSettings(idSucursal) {
        const id = normalizeGuid(idSucursal);
        if (!state.editor.captureStoreSettings[id]) {
            state.editor.captureStoreSettings[id] = { baseQuantity: 1, selectedCurveId: "" };
        }
        return state.editor.captureStoreSettings[id];
    }

    function applyCaptureStoreAction(action, idSucursal) {
        const branchId = normalizeGuid(idSucursal);
        const rows = state.editor.captureRows.filter(function (row) { return normalizeGuid(row.idSucursal) === branchId; });
        if (!rows.length) return;
        if (action === "apply-curve") {
            const curveId = normalizeGuid(getCaptureStoreSettings(branchId).selectedCurveId);
            if (!curveId) {
                setStatus("#txOcCaptureStatus", "warning", "Selecciona una curva lógica antes de aplicarla.");
                return;
            }
            rows.forEach(function (row) { row.idCurvaTemporal = curveId; row.modo = 3; row.inicializando = false; });
        } else if (action === "manual" || action === "manual-clear") {
            rows.forEach(function (row) {
                row.modo = 1;
                row.idCurvaTemporal = null;
                row.inicializando = false;
                if (action === "manual-clear") row.cantidad = 0;
            });
        } else if (action === "no-order") {
            rows.forEach(function (row) { row.modo = 4; row.cantidad = 0; row.inicializando = false; });
        } else if (action === "reset") {
            rows.forEach(function (row) { row.modo = normalizeGuid(row.preview && row.preview.idCurva) ? 3 : 1; row.inicializando = false; });
        }
        renderCaptureRows();
        refreshCapturePreviews();
    }

    function applyEqualQuantityToStore(idSucursal) {
        const settings = getCaptureStoreSettings(idSucursal);
        state.editor.captureRows.forEach(function (row) {
            if (normalizeGuid(row.idSucursal) !== normalizeGuid(idSucursal) || row.modo === 4) return;
            row.modo = 1;
            row.cantidad = settings.baseQuantity;
            row.inicializando = false;
        });
        renderCaptureRows();
        refreshCapturePreviews();
    }

    function stepCaptureQuantity(key, direction) {
        const row = findCaptureRow(key);
        if (!row || row.modo === 4) return;
        row.modo = 1;
        row.cantidad = Math.max(0, roundQuantity(toNumber(row.cantidad) + (direction < 0 ? -1 : 1)));
        row.inicializando = false;
        renderCaptureRows();
        refreshCapturePreviews();
    }

    function applyCaptureModeToStore(idSucursal, mode) {
        const normalizedBranchId = normalizeGuid(idSucursal);
        state.editor.captureRows.forEach(function (row) {
            if (normalizeGuid(row.idSucursal) !== normalizedBranchId) return;
            row.modo = mode;
            row.inicializando = false;
            if (mode === 4) row.cantidad = 0;
        });
        renderCaptureRows();
        refreshCapturePreviews();
    }

    function confirmAndApplyCaptureMode(mode) {
        const modeName = captureModeName(mode);
        Swal.fire({
            icon: "question",
            title: "Aplicar modo a todas las sucursales",
            text: "Se aplicará «" + modeName + "» a todas las sucursales preparadas para esta captura.",
            showCancelButton: true,
            confirmButtonText: "Aplicar",
            cancelButtonText: "Cancelar"
        }).then(function (result) {
            if (!result.isConfirmed) return;
            state.editor.captureRows.forEach(function (row) {
                row.modo = mode;
                row.inicializando = false;
                if (mode === 4) row.cantidad = 0;
            });
            renderCaptureRows();
            refreshCapturePreviews();
        });
    }

    function scheduleCapturePreview(key) {
        const row = findCaptureRow(key);
        if (!row) return;
        row.cantidad = roundQuantity(toNumber($("[data-capture-qty='" + cssEscape(key) + "']").val()));
        row.idPresentacionCompra = normalizeGuid($("[data-capture-presentation='" + cssEscape(key) + "']").val());
        row.inicializando = false;
        refreshCapturePreviews();
    }

    function refreshCapturePreviews() {
        const item = state.editor.selectedProduct;
        if (!item || Number(item.tipo || 0) !== 1 || !state.editor.captureRows.length) return;
        const requestSequence = ++state.editor.capturePreviewSequence;
        const payload = {
            idEmpresa: state.empresaId,
            items: state.editor.captureRows.map(function (row) {
                return { idSucursal: row.idSucursal, idProductoServicio: item.id, idVariante: row.idVariante, idPresentacionCompra: row.idPresentacionCompra, idCurvaTemporal: row.idCurvaTemporal, modo: row.modo, cantidadManualBase: row.modo === 1 ? resolveManualCaptureBaseQuantity(item, row) : null };
            })
        };
        setStatus("#txOcCaptureStatus", "info", "Calculando curva, existencia y tránsito…");
        fetchJson("/Activos/OrdenesCompra/PreviewCurvasOrdenCompra", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
            .then(function (response) {
                if (requestSequence !== state.editor.capturePreviewSequence) return;
                let needsInitialSuggestionRefresh = false;
                (response.items || []).forEach(function (preview, index) {
                    const row = state.editor.captureRows[index];
                    if (!row) return;
                    row.preview = preview;
                    if (row.inicializando) {
                        row.inicializando = false;
                        if (normalizeGuid(preview.idCurva)) {
                            row.cantidad = roundQuantity(preview.curvaObjetivoBase || 0);
                            needsInitialSuggestionRefresh = true;
                        }
                    } else if (row.modo !== 1) {
                        row.cantidad = roundQuantity(preview.cantidadCompraSugerida || preview.cantidadFinalBase || 0);
                    }
                });
                if (needsInitialSuggestionRefresh) {
                    renderCaptureRows();
                    refreshCapturePreviews();
                    return;
                }
                setStatus("#txOcCaptureStatus", "success", "Datos operativos calculados sin modificar inventario.");
                renderCaptureRows();
            })
            .catch(function (error) {
                if (requestSequence !== state.editor.capturePreviewSequence) return;
                setStatus("#txOcCaptureStatus", "warning", resolveErrorMessage(error));
            });
    }

    function addPartidaFromCapture() {
        const item = state.editor.selectedProduct;
        if (!item || state.editor.readOnly) return;
        const rows = state.editor.captureRows.filter(function (row) {
            row.selected = $("[data-capture-select='" + cssEscape(row.key) + "']").prop("checked");
            row.cantidad = roundQuantity(toNumber($("[data-capture-qty='" + cssEscape(row.key) + "']").val()));
            const presentationNode = document.querySelector("[data-capture-presentation='" + cssEscape(row.key) + "']");
            row.idPresentacionCompra = presentationNode ? normalizeGuid(presentationNode.value) : null;
            return row.selected && row.modo !== 4 && row.cantidad > 0;
        });
        if (!rows.length) { setStatus("#txOcCaptureStatus", "warning", "Selecciona al menos un renglón con cantidad mayor a cero."); return; }
        let lastUid = "";
        rows.forEach(function (row) {
            const variant = findSelectedVariant(item, row.idVariante);
            const presentation = findSelectedPresentation(item, row.idPresentacionCompra);
            const branch = getSucursalById(row.idSucursal);
            const factor = presentation ? Number(presentation.factorConversionBase || 1) : 1;
            const uid = buildPartidaKey(row.idSucursal, item.id, row.idVariante, row.idPresentacionCompra);
            lastUid = uid;
            const partida = state.editor.partidas.find(function (entry) { return entry.uid === uid; }) || { uid: uid };
            Object.assign(partida, {
                idSucursal: row.idSucursal, sucursal: branch ? [branch.codigo, branch.nombre].filter(Boolean).join(" · ") : "Sucursal",
                idProductoServicio: item.id, tipoProductoServicio: Number(item.tipo || 0), tipoProductoServicioNombre: item.tipoNombre || "",
                idVariante: variant ? variant.id : null, varianteSnapshot: variant ? (variant.nombre || variant.sku) : "",
                idPresentacionCompra: presentation ? presentation.id : null, presentacionCompraSnapshot: presentation ? presentation.nombre : "",
                codigo: item.codigo || "", nombre: item.nombre || "", descripcion: item.descripcion || "",
                unidadMedida: item.unidad || "", unidadAbreviatura: item.abreviatura || "",
                unidadCompraSnapshot: presentation ? presentation.unidadCompra : item.unidad || "", unidadCompraAbreviaturaSnapshot: presentation ? presentation.unidadCompraAbreviatura : item.abreviatura || "",
                cantidadCompra: row.cantidad, factorConversionSnapshot: factor, costoUnitario: row.costo,
                cantidadBaseOrdenada: 0, cantidad: 0, subtotal: 0, total: 0
            });
            recalcPartida(partida);
            if (!state.editor.partidas.some(function (entry) { return entry.uid === uid; })) state.editor.partidas.push(partida);
        });
        if (state.ui.captureModal) state.ui.captureModal.hide();
        renderPartidas(lastUid);
        setStatus("#txOcFormStatus", "success", rows.length + " partida(s) agregada(s).");
        state.editor.maxUnlockedStep = 5;
        goToStep(5, false);
    }

    function markRecentlyAddedProduct(productId) {
        state.editor.lastAddedProductId = productId;
        if (state.editor.lastAddedProductTimerId) {
            window.clearTimeout(state.editor.lastAddedProductTimerId);
        }

        state.editor.lastAddedProductTimerId = window.setTimeout(function () {
            state.editor.lastAddedProductId = null;
            state.editor.lastAddedProductTimerId = 0;
            renderSearchResults(state.editor.searchResults);
        }, 1600);
    }

    function updatePartidaField(uid, field, rawValue) {
        const partida = state.editor.partidas.find(function (item) {
            return String(item.uid) === String(uid);
        });

        if (!partida) {
            return;
        }

        const parsed = toNumber(rawValue);
        partida[field] = field === "cantidadCompra" ? roundQuantity(parsed) : roundMoney(parsed);
        recalcPartida(partida);
        renderPartidas(partida.uid);
    }

    function removePartida(uid) {
        if (state.editor.readOnly) {
            return;
        }

        state.editor.partidas = state.editor.partidas.filter(function (item) {
            return String(item.uid) !== String(uid);
        });
        renderPartidas();
    }

    function recalcPartida(partida) {
        partida.cantidadCompra = Math.max(0, roundQuantity(partida.cantidadCompra));
        partida.factorConversionSnapshot = Math.max(0, roundQuantity(partida.factorConversionSnapshot || 1));
        partida.cantidadBaseOrdenada = roundQuantity(partida.cantidadCompra * partida.factorConversionSnapshot);
        partida.cantidad = partida.cantidadBaseOrdenada;
        partida.costoUnitario = Math.max(0, roundMoney(partida.costoUnitario));
        partida.subtotal = roundMoney(partida.cantidadCompra * partida.costoUnitario);
        partida.total = partida.subtotal;
    }

    function renderPartidas(highlightId) {
        const tbody = document.querySelector("#grOcPartidas tbody");
        if (!tbody) {
            return;
        }

        tbody.innerHTML = "";
        let subtotal = 0;
        const partidasFiltradas = getFilteredPartidas();

        partidasFiltradas.forEach(function (partida, index) {
            subtotal += Number(partida.subtotal || 0);
            const tr = document.createElement("tr");
            if (highlightId && String(partida.uid) === String(highlightId)) {
                tr.classList.add("oc-row-flash");
            }

            const isInvalidQuantity = !(Number(partida.cantidadCompra) > 0);
            const isInvalidCostForGenerate = !(Number(partida.costoUnitario) > 0);

            tr.innerHTML = [
                "<td><strong>" + escapeHtml(partida.sucursal || "—") + "</strong></td>",
                "<td><div class='oc-line-title oc-line-title--partida'><span class='oc-row-number'>#" + (index + 1) + " · " + escapeHtml(partida.tipoProductoServicioNombre || "") + " · " + escapeHtml(partida.codigo || "") + "</span><strong>" + escapeHtml(partida.nombre || "") + "</strong><small title='" + escapeHtml(toPlainText(partida.descripcion || "")) + "'>" + escapeHtml(toPlainText(partida.descripcion || "")) + "</small></div></td>",
                "<td>" + escapeHtml(partida.varianteSnapshot || "Base") + "</td>",
                "<td>" + escapeHtml(partida.presentacionCompraSnapshot || "Base directa") + "</td>",
                "<td><input class='form-control oc-inline-input" + (isInvalidQuantity ? " is-invalid" : "") + "' type='number' min='0' step='0.0001' data-oc-qty='" + escapeHtml(partida.uid) + "' value='" + escapeHtml(formatDecimalInput(partida.cantidadCompra)) + "'" + (state.editor.readOnly ? " disabled" : "") + " /></td>",
                "<td><input class='form-control oc-inline-input" + (isInvalidCostForGenerate ? " is-invalid" : "") + "' type='number' min='0' step='0.01' data-oc-cost='" + escapeHtml(partida.uid) + "' value='" + escapeHtml(formatDecimalInput(partida.costoUnitario)) + "'" + (state.editor.readOnly ? " disabled" : "") + " /></td>",
                "<td>" + formatCurrency(partida.subtotal) + "</td>",
                "<td><button type='button' class='checkapp-btn checkapp-btn-ghost checkapp-btn-sm' data-oc-edit-item='" + escapeHtml(partida.uid) + "'" + (state.editor.readOnly ? " disabled" : "") + "><i class='fa fa-pencil'></i><span>Editar</span></button><button type='button' class='checkapp-btn checkapp-btn-ghost checkapp-btn-sm' data-oc-remove-item='" + escapeHtml(partida.uid) + "'" + (state.editor.readOnly ? " disabled" : "") + "><i class='fa fa-trash'></i><span>Eliminar</span></button></td>"
            ].join("");
            tbody.appendChild(tr);
        });

        const total = roundMoney(state.editor.partidas.reduce(function (accumulator, partida) {
            return accumulator + Number(partida.subtotal || 0);
        }, 0));
        updateSummaryTotals(total);
        $("#txOcPartidasCount").text(partidasFiltradas.length === state.editor.partidas.length
            ? state.editor.partidas.length + " partidas"
            : partidasFiltradas.length + " de " + state.editor.partidas.length + " partidas");
        $("#txOcPartidasEstadoVacio").prop("hidden", state.editor.partidas.length > 0);

        if (state.editor.partidas.length > 0 && partidasFiltradas.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = "<td colspan='8'><div class='oc-empty-state'>No hay partidas que coincidan con la búsqueda actual.</div></td>";
            tbody.appendChild(row);
        }

        refreshWizardState();
    }

    function getFilteredPartidas() {
        const filter = normalizeSearchText(state.editor.partidasFilter);
        if (!filter) {
            return state.editor.partidas.slice();
        }

        return state.editor.partidas.filter(function (partida) {
            const searchable = [
                partida.codigo,
                partida.nombre,
                partida.descripcion,
                partida.tipoProductoServicioNombre,
                partida.unidadMedida,
                partida.unidadAbreviatura,
                partida.varianteSnapshot,
                partida.presentacionCompraSnapshot,
                partida.sucursal,
                partida.unidadCompraSnapshot,
                partida.unidadCompraAbreviaturaSnapshot
            ].join(" ");

            return normalizeSearchText(searchable).indexOf(filter) >= 0;
        });
    }

    function updateSummaryTotals(total) {
        $("#txOcSubtotal").text(formatCurrency(total));
        $("#txOcTotal").text(formatCurrency(total));
        const pieces = roundQuantity(state.editor.partidas.reduce(function (accumulator, partida) {
            return accumulator + Number(partida.cantidadBaseOrdenada || 0);
        }, 0));
        $("#txOcPiezas").text(formatDecimalInput(pieces));
        $("#txOcRenglones").text(state.editor.partidas.length);
    }

    function buildSavePayload() {
        return {
            id: state.detailId,
            idEmpresa: state.empresaId,
            idRazonSocial: normalizeGuid($("#cbOcRazonSocial").val()),
            idSucursales: getSelectedSucursalIds(),
            idProveedor: normalizeGuid($("#cbOcProveedor").val()),
            folioReferencia: String($("#txOcFolioReferencia").val() || "").trim(),
            fechaOrden: $("#txOcFechaOrden").val() || "",
            fechaLlegada: $("#txOcFechaLlegada").val() || null,
            fechaMinima: $("#txOcFechaMinima").val() || null,
            fechaMaxima: $("#txOcFechaMaxima").val() || null,
            observaciones: String($("#txOcObservaciones").val() || "").trim(),
            partidas: state.editor.partidas.map(function (partida) {
                return {
                    idSucursal: normalizeGuid(partida.idSucursal),
                    idProductoServicio: partida.idProductoServicio,
                    idVariante: normalizeGuid(partida.idVariante),
                    idPresentacionCompra: normalizeGuid(partida.idPresentacionCompra),
                    cantidad: roundQuantity(partida.cantidadBaseOrdenada),
                    cantidadCompra: roundQuantity(partida.cantidadCompra),
                    factorConversionSnapshot: roundQuantity(partida.factorConversionSnapshot || 1),
                    costoUnitario: roundMoney(partida.costoUnitario)
                };
            })
        };
    }

    function validateConfiguration(markFields) {
        return validateConfigurationStep1(markFields).concat(validateDestination(markFields));
    }

    function validateDestination(markFields) {
        const errors = [];
        const shouldMark = markFields === true;

        if (!getSelectedSucursalIds().length) {
            if (shouldMark) { markFieldError("#cbOcSucursal"); }
            errors.push("Selecciona al menos una sucursal destino.");
        }

        return errors;
    }

    function validateConfigurationStep1(markFields) {
        const errors = [];
        const shouldMark = markFields === true;

        if (!normalizeGuid($("#cbOcProveedor").val())) {
            if (shouldMark) { markFieldError("#cbOcProveedor"); }
            errors.push("Selecciona un proveedor.");
        }

        const fechaOrden = String($("#txOcFechaOrden").val() || "").trim();
        const fechaLlegada = String($("#txOcFechaLlegada").val() || "").trim();
        const fechaMinima = String($("#txOcFechaMinima").val() || "").trim();
        const fechaMaxima = String($("#txOcFechaMaxima").val() || "").trim();

        if (!fechaOrden) {
            if (shouldMark) { markFieldError("#txOcFechaOrden"); }
            errors.push("Captura la fecha de orden.");
        }

        if (fechaMinima && fechaMaxima) {
            const minDate = new Date(fechaMinima + "T00:00:00");
            const maxDate = new Date(fechaMaxima + "T00:00:00");
            if (!Number.isNaN(minDate.getTime()) && !Number.isNaN(maxDate.getTime()) && minDate > maxDate) {
                if (shouldMark) {
                    markFieldError("#txOcFechaMinima");
                    markFieldError("#txOcFechaMaxima");
                }
                errors.push("La fecha mínima no puede ser posterior a la fecha máxima.");
            }
        }

        if (fechaOrden && fechaLlegada) {
            const orderDate = new Date(fechaOrden + "T00:00:00");
            const arrivalDate = new Date(fechaLlegada + "T00:00:00");
            if (!Number.isNaN(orderDate.getTime()) && !Number.isNaN(arrivalDate.getTime()) && arrivalDate < orderDate) {
                if (shouldMark) { markFieldError("#txOcFechaLlegada"); }
                errors.push("La fecha de llegada no puede ser anterior a la fecha de orden.");
            }
        }

        if (fechaLlegada && fechaMinima) {
            const arrivalDate = new Date(fechaLlegada + "T00:00:00");
            const minDate = new Date(fechaMinima + "T00:00:00");
            if (!Number.isNaN(arrivalDate.getTime()) && !Number.isNaN(minDate.getTime()) && arrivalDate < minDate) {
                if (shouldMark) { markFieldError("#txOcFechaLlegada"); }
                errors.push("La fecha de llegada no puede ser anterior a la fecha mínima.");
            }
        }

        if (fechaLlegada && fechaMaxima) {
            const arrivalDate = new Date(fechaLlegada + "T00:00:00");
            const maxDate = new Date(fechaMaxima + "T00:00:00");
            if (!Number.isNaN(arrivalDate.getTime()) && !Number.isNaN(maxDate.getTime()) && arrivalDate > maxDate) {
                if (shouldMark) { markFieldError("#txOcFechaLlegada"); }
                errors.push("La fecha de llegada no puede ser posterior a la fecha máxima.");
            }
        }

        return errors;
    }

    function validatePartidas() {
        const errors = [];

        if (!state.editor.partidas.length) {
            errors.push("Agrega al menos una partida.");
            return errors;
        }

        state.editor.partidas.forEach(function (partida, index) {
            if (!normalizeGuid(partida.idSucursal) || getSelectedSucursalIds().indexOf(normalizeGuid(partida.idSucursal)) < 0) {
                errors.push("La sucursal de la partida " + (index + 1) + " no es válida.");
            }
            if (!(Number(partida.cantidadCompra) > 0)) {
                errors.push("La cantidad de la partida " + (index + 1) + " debe ser mayor a cero.");
            }
            if (!(Number(partida.factorConversionSnapshot || 1) > 0)) {
                errors.push("El factor de la partida " + (index + 1) + " debe ser mayor a cero.");
            }
            if (Number(partida.tipoProductoServicio || 0) === 1 && partida.varianteSnapshot && !normalizeGuid(partida.idVariante)) {
                errors.push("Selecciona una variante válida en la partida " + (index + 1) + ".");
            }
            if (Number(partida.costoUnitario) < 0) {
                errors.push("El costo unitario de la partida " + (index + 1) + " no puede ser negativo.");
            }
        });

        return errors;
    }

    function validatePartidasForGenerate() {
        const errors = validatePartidas();
        if (errors.length) {
            return errors;
        }

        state.editor.partidas.forEach(function (partida, index) {
            if (!(Number(partida.costoUnitario) > 0)) {
                errors.push("El costo unitario de la partida " + (index + 1) + " debe ser mayor a cero para generar.");
            }

            if (!(Number(partida.subtotal || 0) > 0)) {
                errors.push("La partida " + (index + 1) + " debe tener subtotal mayor a cero para generar.");
            }
        });

        return errors;
    }

    function validateSavePayload(payload) {
        return validateConfiguration(true).concat(validatePartidas());
    }

    function saveDraft() {
        if (state.editor.saving || state.editor.generating || state.editor.cancelling || state.editor.readOnly) {
            return;
        }

        const payload = buildSavePayload();
        const errors = validateSavePayload(payload);
        if (errors.length) {
            setStatus("#txOcFormStatus", "danger", errors[0]);
            showError(errors[0]);
            return;
        }

        state.editor.saving = true;
        syncActionButtons();
        showEditorOverlay(true, "Guardando borrador...", "Estamos registrando los cambios de tu orden.");
        setStatus("#txOcFormStatus", "info", "Guardando borrador...");

        fetchJson("/Activos/OrdenesCompra/GuardarBorradorOrdenCompra", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(function (response) {
                const nextId = normalizeGuid(response.idOrdenCompra);
                if (nextId) {
                    state.detailId = nextId;
                    state.mode = "detail";
                    if (window.history && window.history.replaceState) {
                        window.history.replaceState({}, "", "/Activos/OrdenesCompra/Detalle/" + encodeURIComponent(nextId));
                    }
                }

                showSuccess(resolveServerMessage(response) || "El borrador se guardó correctamente.");
                setStatus("#txOcFormStatus", "success", resolveServerMessage(response) || "El borrador se guardó correctamente.");
                return loadOrderDetail(nextId || state.detailId);
            })
            .catch(function (error) {
                setStatus("#txOcFormStatus", "danger", resolveErrorMessage(error));
                showError(resolveErrorMessage(error));
            })
            .finally(function () {
                state.editor.saving = false;
                showEditorOverlay(false);
                syncActionButtons();
            });
    }

    function generateOrder() {
        if (!state.detailId || state.editor.generating || state.editor.saving || state.editor.cancelling || state.editor.readOnly) {
            return;
        }

        const errors = validatePartidasForGenerate();
        if (errors.length) {
            setStatus("#txOcFormStatus", "danger", errors[0]);
            showError(errors[0]);
            return;
        }

        const total = state.editor.partidas.reduce(function (accumulator, partida) {
            return accumulator + Number(partida.subtotal || 0);
        }, 0);

        if (!(roundMoney(total) > 0)) {
            setStatus("#txOcFormStatus", "danger", "La orden no puede generarse con total cero.");
            showError("La orden no puede generarse con total cero.");
            return;
        }

        showEditorOverlay(true, "Validando orden...", "Estamos revisando la información antes de generarla.");
        setStatus("#txOcFormStatus", "info", "Validando la orden...");

        fetchJson("/Activos/OrdenesCompra/ValidarPendientesOrdenCompra", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idEmpresa: state.empresaId,
                idOrdenCompra: state.detailId
            })
        })
            .then(function (pendientes) {
                showEditorOverlay(false);
                return showGenerateConfirmation(pendientes);
            })
            .then(function (confirmed) {
                if (!confirmed) {
                    setStatus("#txOcFormStatus", "warning", "La generación se canceló antes de continuar.");
                    return null;
                }

                state.editor.generating = true;
                syncActionButtons();
                showEditorOverlay(true, "Generando orden...", "Estamos cerrando la captura y preparando tu orden.");
                setStatus("#txOcFormStatus", "info", "Generando orden...");

                return fetchJson("/Activos/OrdenesCompra/GenerarOrdenCompra", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        idEmpresa: state.empresaId,
                        idOrdenCompra: state.detailId
                    })
                })
                    .then(function (response) {
                        showSuccess(resolveServerMessage(response) || "La orden fue generada correctamente.");
                        setStatus("#txOcFormStatus", "success", resolveServerMessage(response) || "La orden fue generada correctamente.");
                        return loadOrderDetail(state.detailId);
                    })
                    .finally(function () {
                        state.editor.generating = false;
                        showEditorOverlay(false);
                        syncActionButtons();
                    });
            })
            .catch(function (error) {
                state.editor.generating = false;
                showEditorOverlay(false);
                setStatus("#txOcFormStatus", "danger", resolveErrorMessage(error));
                showError(resolveErrorMessage(error));
                syncActionButtons();
            });
    }

    function showGenerateConfirmation(pendientes) {
        const totalPartidas = state.editor.partidas.length;
        const total = roundMoney(state.editor.partidas.reduce(function (accumulator, partida) {
            return accumulator + Number(partida.subtotal || 0);
        }, 0));
        const sucursal = getSelectedSucursalNames().join(", ") || "Sin asignar";
        const proveedor = String($("#cbOcProveedor option:selected").text() || "").trim() || "Sin asignar";
        const hasPendientes = pendientes && pendientes.tienePendientes;
        const html = [
            "<div class='oc-confirm-dialog'>",
            "<div class='oc-confirm-summary'>",
            "<p><strong>Proveedor</strong><br>" + escapeHtml(proveedor) + "</p>",
            "<p><strong>Sucursales</strong><br>" + escapeHtml(sucursal) + "</p>",
            "<p><strong>Partidas</strong><br>" + escapeHtml(String(totalPartidas)) + "</p>",
            "<p><strong>Total</strong><br>" + escapeHtml(formatCurrency(total)) + "</p>",
            "</div>",
            hasPendientes
                ? "<div class='oc-confirm-warning'><strong>Ya existen pedidos pendientes relacionados con esta captura.</strong><p>Si continúas, esta orden se generará por separado y no cambiará ninguna orden existente.</p></div>"
                : "<p>Revisa el resumen y confirma cuando quieras generar la orden.</p>",
            "</div>"
        ].join("");

        return Swal.fire({
            icon: hasPendientes ? "warning" : "question",
            title: "Confirmar generación",
            html: html,
            showCancelButton: true,
            confirmButtonText: hasPendientes ? "Continuar y generar" : "Generar orden",
            cancelButtonText: "Cancelar"
        }).then(function (result) {
            return !!result.isConfirmed;
        });
    }

    function openCancelEditorModal() {
        if (!state.detailId || state.editor.saving || state.editor.generating || state.editor.cancelling) {
            return;
        }

        $("#txOcCancelarMotivo").val("");
        setStatus("#txOcCancelarStatus", "", "");
        clearFieldError("#txOcCancelarMotivo");
        if (state.ui.cancelModal) {
            state.ui.cancelModal.show();
        }
    }

    function cancelCurrentOrder() {
        if (!state.detailId || state.editor.cancelling) {
            return;
        }

        const motivo = String($("#txOcCancelarMotivo").val() || "").trim();
        if (!motivo) {
            markFieldError("#txOcCancelarMotivo");
            setStatus("#txOcCancelarStatus", "danger", "Captura un motivo de cancelación.");
            return;
        }

        state.editor.cancelling = true;
        syncActionButtons();
        $("#btOcConfirmarCancelar").prop("disabled", true);
        showEditorOverlay(true, "Cancelando orden...", "Estamos registrando la cancelación de la orden.");

        fetchJson("/Activos/OrdenesCompra/CancelarOrdenCompra", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idEmpresa: state.empresaId,
                idOrdenCompra: state.detailId,
                motivoCancelacion: motivo
            })
        })
            .then(function (response) {
                if (state.ui.cancelModal) {
                    state.ui.cancelModal.hide();
                }
                showSuccess(resolveServerMessage(response) || "La orden fue cancelada correctamente.");
                setStatus("#txOcFormStatus", "success", resolveServerMessage(response) || "La orden fue cancelada correctamente.");
                return loadOrderDetail(state.detailId);
            })
            .catch(function (error) {
                setStatus("#txOcCancelarStatus", "danger", resolveErrorMessage(error));
                showError(resolveErrorMessage(error));
            })
            .finally(function () {
                state.editor.cancelling = false;
                $("#btOcConfirmarCancelar").prop("disabled", false);
                showEditorOverlay(false);
                syncActionButtons();
            });
    }

    function exportOrderPdf() {
        if (!state.detailId || state.editor.exportingPdf || !canExportCurrentOrder()) {
            return;
        }

        state.editor.exportingPdf = true;
        syncActionButtons();
        showEditorOverlay(true, "Exportando PDF...", "Estamos preparando la orden en PDF.");
        setStatus("#txOcFormStatus", "info", "Exportando PDF...");

        downloadFile("/Activos/OrdenesCompra/ExportarOrdenCompraPdf?idOrdenCompra=" + encodeURIComponent(state.detailId), "GET")
            .then(function () {
                setStatus("#txOcFormStatus", "success", "El PDF de la orden se descargó correctamente.");
            })
            .catch(function (error) {
                setStatus("#txOcFormStatus", "danger", resolveErrorMessage(error));
                showError(resolveErrorMessage(error));
            })
            .finally(function () {
                state.editor.exportingPdf = false;
                showEditorOverlay(false);
                syncActionButtons();
            });
    }

    function exportOrderExcel() {
        if (!state.detailId || state.editor.exportingExcel || !canExportCurrentOrder()) {
            return;
        }

        state.editor.exportingExcel = true;
        syncActionButtons();
        showEditorOverlay(true, "Exportando Excel...", "Estamos preparando la orden en Excel.");
        setStatus("#txOcFormStatus", "info", "Exportando Excel...");

        downloadFile("/Activos/OrdenesCompra/ExportarOrdenCompraExcel?idOrdenCompra=" + encodeURIComponent(state.detailId), "GET")
            .then(function () {
                setStatus("#txOcFormStatus", "success", "El Excel de la orden se descargó correctamente.");
            })
            .catch(function (error) {
                setStatus("#txOcFormStatus", "danger", resolveErrorMessage(error));
                showError(resolveErrorMessage(error));
            })
            .finally(function () {
                state.editor.exportingExcel = false;
                showEditorOverlay(false);
                syncActionButtons();
            });
    }

    function applyDetailToEditor(detail) {
        state.editor.detail = detail || null;
        state.editor.partidas = [];

        if (detail) {
            const estadoDetalle = Number(detail.estado || 0);
            $("#txOcHeroTitle").text(estadoDetalle === estadoBorrador ? "Orden de compra" : "Orden de compra");
            $("#txOcHeroDescription").text(estadoDetalle === estadoBorrador
                ? "Sigue el flujo del wizard para actualizar la orden, guardarla o generarla."
                : "Consulta la orden con el mismo flujo de captura, respetando el estado certificado.");

        $("#cbOcRazonSocial").val(detail.idRazonSocial || "");
        const detailSucursalIds = (Array.isArray(detail.sucursales) ? detail.sucursales : [])
            .map(function (item) { return normalizeGuid(item.id); }).filter(Boolean);
        state.editor.selectedSucursalIds = detailSucursalIds.length ? detailSucursalIds : (detail.idSucursal ? [normalizeGuid(detail.idSucursal)] : []);
        renderSucursalSelector();
        syncRazonSocialFromSucursales();
        renderCaptureDestinationOptions();
        $("#cbOcProveedor").val(detail.idProveedor || "");
        $("#txOcFolioReferencia").val(detail.folioReferencia || "");
        $("#txOcFechaOrden").val(formatInputDate(detail.fechaOrden));
        $("#txOcFechaLlegada").val(formatInputDate(detail.fechaLlegada));
        $("#txOcFechaMinima").val(formatInputDate(detail.fechaMinima));
        $("#txOcFechaMaxima").val(formatInputDate(detail.fechaMaxima));
        $("#txOcObservaciones").val(detail.observaciones || "");

            state.editor.partidas = (Array.isArray(detail.partidas) ? detail.partidas : []).map(function (partida) {
                const idVariante = normalizeGuid(partida.idVariante);
                const idPresentacionCompra = normalizeGuid(partida.idPresentacionCompra);
                const idSucursal = normalizeGuid(partida.idSucursal);
                const uid = buildPartidaKey(idSucursal, partida.idProductoServicio, idVariante, idPresentacionCompra);
                return {
                    uid: uid,
                    idSucursal: idSucursal,
                    sucursal: partida.sucursal || ((getSucursalById(idSucursal) || {}).nombre) || "Sucursal",
                    idProductoServicio: partida.idProductoServicio,
                    tipoProductoServicio: Number(partida.tipoProductoServicio || 0),
                    tipoProductoServicioNombre: partida.tipoProductoServicioNombre || "",
                    idVariante: idVariante,
                    varianteSnapshot: partida.varianteSnapshot || "",
                    idPresentacionCompra: idPresentacionCompra,
                    presentacionCompraSnapshot: partida.presentacionCompraSnapshot || "",
                    codigo: partida.codigo || "",
                    nombre: partida.nombre || "",
                    descripcion: partida.descripcion || "",
                    unidadMedida: partida.unidadMedida || "",
                    unidadAbreviatura: partida.unidadAbreviatura || "",
                    unidadCompraSnapshot: partida.unidadCompraSnapshot || partida.unidadMedida || "",
                    unidadCompraAbreviaturaSnapshot: partida.unidadCompraAbreviaturaSnapshot || partida.unidadAbreviatura || "",
                    cantidadCompra: roundQuantity(partida.cantidadCompra || partida.cantidad || 0),
                    factorConversionSnapshot: roundQuantity(partida.factorConversionSnapshot || 1),
                    cantidadBaseOrdenada: roundQuantity(partida.cantidadBaseOrdenada || partida.cantidad || 0),
                    cantidad: roundQuantity(partida.cantidad || partida.cantidadBaseOrdenada || 0),
                    costoUnitario: roundMoney(partida.costoUnitario || 0),
                    subtotal: roundMoney(partida.subtotal || 0),
                    total: roundMoney(partida.total || 0)
                };
            });

            state.editor.readOnly = Number(detail.estado || 0) !== estadoBorrador;
            $("#panelOcCancelacion").prop("hidden", Number(detail.estado || 0) !== estadoCancelada);
            $("#txOcFechaCancelacion").val(formatDisplayDate(detail.fechaCancelacion));
            $("#txOcMotivoCancelacion").val(detail.motivoCancelacion || "");

            state.editor.selectedProduct = null;
            const detailStep = state.editor.partidas.length > 0 ? 5 : 3;
            state.editor.maxUnlockedStep = detailStep;
            state.currentStep = detailStep;
            state.editor.preparationCollapsed = false;
        } else {
            $("#txOcHeroTitle").text("Orden de compra");
            $("#txOcHeroDescription").text("Captura la orden paso a paso, valida sus partidas y decide si quieres guardarla o generarla.");
            $("#panelOcCancelacion").prop("hidden", true);
            state.editor.readOnly = false;
            state.editor.selectedProduct = null;
            state.editor.selectedSucursalIds = [];
            renderSucursalSelector();
            state.editor.maxUnlockedStep = 1;
            state.currentStep = 1;
            state.editor.preparationCollapsed = false;
        }

        syncDateValidationWindow();
        renderPartidas();
        renderCapture();
        toggleEditorReadOnly(state.editor.readOnly);
        renderWizard();
        syncActionButtons();
    }

    function toggleEditorReadOnly(isReadOnly) {
        $("#cbOcRazonSocial, #cbOcSucursal, #cbOcProveedor, #txOcFechaOrden, #txOcFechaLlegada, #txOcFechaMinima, #txOcFechaMaxima, #txOcFolioReferencia, #txOcObservaciones, #ckOcSoloProveedor, #txOcBuscarProductoServicio, #cbOcBuscarTipo, #cbOcCapturaSucursal, #cbOcCapturaVariante, #cbOcCapturaPresentacion, #txOcCapturaCantidad, #txOcCapturaCosto")
            .prop("disabled", !!isReadOnly);
        $("#btOcLimpiarBusquedaProductoServicio, #btOcPaso1Siguiente, #btOcPaso2Siguiente, #btOcAgregarPartida")
            .prop("disabled", !!isReadOnly);
        renderSearchResults(state.editor.searchResults);
        renderPartidas();
    }

    function goToStep(step, validateCurrent) {
        const nextStep = Number(step || 0);
        if (nextStep < 1 || nextStep > 5) {
            return;
        }

        if (!isStepUnlocked(nextStep)) {
            return;
        }

        if (validateCurrent) {
            const errors = validateStepTransition(nextStep);
            if (errors.length) {
                setStatus("#txOcFormStatus", "danger", errors[0]);
                showError(errors[0]);
                return;
            }
        }

        state.currentStep = nextStep;
        state.editor.maxUnlockedStep = Math.max(state.editor.maxUnlockedStep || 1, nextStep);
        if (nextStep >= 3 && validateConfiguration(false).length === 0) {
            state.editor.preparationCollapsed = true;
        } else if (!normalizeGuid($("#cbOcProveedor").val()) || !getSelectedSucursalIds().length) {
            state.editor.preparationCollapsed = false;
        }
        renderWizard();
        scrollToStep(nextStep);
    }

    function validateStepTransition(nextStep) {
        if (nextStep === 2) {
            return validateConfigurationStep1(true);
        }
        if (nextStep === 3) {
            return validateConfigurationStep1(true).concat(validateDestination(true));
        }
        if (nextStep === 4) {
            return state.editor.selectedProduct ? [] : ["Selecciona un producto o servicio para continuar."];
        }
        if (nextStep === 5) {
            return validateConfiguration(true).concat(validatePartidas());
        }
        return [];
    }

    function canAccessStep(step) {
        if (step === 1) {
            return true;
        }
        if (step === 2) {
            return validateConfigurationStep1(false).length === 0;
        }
        if (step === 3) {
            return validateConfiguration(false).length === 0;
        }
        if (step === 4) {
            return validateConfiguration(false).length === 0 && !!state.editor.selectedProduct;
        }
        if (step === 5) {
            return validateConfiguration(false).length === 0 && validatePartidas().length === 0;
        }
        return false;
    }

    function refreshWizardState() {
        state.editor.maxUnlockedStep = resolveMaxUnlockedStep();

        if (!isStepUnlocked(state.currentStep)) {
            state.currentStep = state.editor.maxUnlockedStep;
        }

        renderWizard();
    }

    function renderWizard() {
        document.querySelectorAll("[data-step-panel]").forEach(function (panel) {
            panel.hidden = false;
        });

        document.querySelectorAll("[data-step-target]").forEach(function (button) {
            const step = Number(button.getAttribute("data-step-target") || 0);
            const accessible = isStepUnlocked(step);
            const isActive = state.currentStep === step;
            const completionByStep = {
                1: !!normalizeGuid($("#cbOcProveedor").val()),
                2: getSelectedSucursalIds().length > 0,
                3: !!state.editor.selectedProduct || state.editor.partidas.length > 0,
                4: state.editor.partidas.length > 0,
                5: !!state.detailId
            };
            const isCompleted = !!completionByStep[step];

            button.disabled = !accessible && !isActive;
            button.classList.toggle("is-active", isActive);
            button.classList.toggle("is-completed", isCompleted);
            button.classList.toggle("is-blocked", !accessible && !isActive);
            button.classList.toggle("is-pending", accessible && !isActive && !isCompleted);
        });

        updateStepStateCopy(1, !!normalizeGuid($("#cbOcProveedor").val()), state.currentStep === 1);
        updateStepStateCopy(2, getSelectedSucursalIds().length > 0, state.currentStep === 2);
        updateStepStateCopy(3, !!state.editor.selectedProduct || state.editor.partidas.length > 0, state.currentStep === 3);
        updateStepStateCopy(4, state.editor.partidas.length > 0, state.currentStep === 4);
        updateStepStateCopy(5, false, state.currentStep === 5);
        renderPreparation();
        renderContinuousGates();
        syncActionButtons();
    }

    function scrollToStep(step) {
        const target = document.querySelector(step <= 2 ? "#panelOcPreparacion" : "#panelOcPaso" + step);
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    function renderPreparation() {
        const hasProvider = !!normalizeGuid($("#cbOcProveedor").val());
        const hasSucursal = getSelectedSucursalIds().length > 0;
        const canCollapse = hasProvider && hasSucursal;
        const isCollapsed = canCollapse && state.editor.preparationCollapsed;
        const provider = state.combos.proveedores.find(function (item) { return normalizeGuid(item.id) === normalizeGuid($("#cbOcProveedor").val()); });
        const branchNames = getSelectedSucursalNames();
        $("#panelOcPreparationEditor").prop("hidden", isCollapsed);
        $("#panelOcPreparationSummary, #btOcEditarPreparacion").prop("hidden", !isCollapsed);
        $("#txOcSummaryProveedor").text(provider ? provider.nombre : "—");
        $("#txOcSummarySucursales").text(branchNames.length === 1 ? branchNames[0] : branchNames.length + " sucursales");
        $("#txOcSummaryFechaLlegada").text(formatDateOnly($("#txOcFechaLlegada").val()));
        $("#txOcSummaryFechaMinima").text(formatDateOnly($("#txOcFechaMinima").val()));
        $("#txOcSummaryFechaMaxima").text(formatDateOnly($("#txOcFechaMaxima").val()));
        const folio = String($("#txOcFolioReferencia").val() || "").trim();
        $("#panelOcSummaryFolio").prop("hidden", !folio);
        $("#txOcSummaryFolio").text(folio || "—");
        $("#panelOcSummarySucursalChips").html(branchNames.map(function (name) { return "<span>" + escapeHtml(name) + "</span>"; }).join(""));
        $("#txOcBlockState1").text(hasProvider ? "Completo" : "Pendiente").toggleClass("is-complete", hasProvider);
        $("#txOcBlockState2").text(hasSucursal ? "Completo" : (hasProvider ? "Pendiente" : "Bloqueado")).toggleClass("is-complete", hasSucursal);
        $("#panelOcDestinationHelp").prop("hidden", hasSucursal);
        $("#panelOcDestinationSelected").prop("hidden", !hasSucursal);
        $("#txOcDestinationSelected").text(getSelectedSucursalNames().join(", ") || "—");
    }

    function renderContinuousGates() {
        const prepComplete = validateConfiguration(false).length === 0;
        const hasSelection = !!state.editor.selectedProduct;
        const captureDisabled = state.editor.readOnly || !hasSelection;
        $("#panelOcPaso3").toggleClass("is-blocked", !prepComplete);
        $("#txOcProductGate").prop("hidden", prepComplete);
        $("#txOcBuscarProductoServicio, #cbOcBuscarTipo").prop("disabled", state.editor.readOnly || !prepComplete);
        $("#panelOcPaso4").toggleClass("is-blocked", !hasSelection);
        $("#txOcCaptureGate").prop("hidden", hasSelection);
        $("#cbOcCapturaSucursal, #cbOcCapturaVariante, #cbOcCapturaPresentacion, #txOcCapturaCantidad, #txOcCapturaCosto")
            .prop("disabled", captureDisabled);
        $("#btOcAbrirCaptura").prop("hidden", !hasSelection).prop("disabled", captureDisabled);
        $("#txOcBuscarPartidas").prop("disabled", state.editor.readOnly || state.editor.partidas.length === 0);
        const saveErrors = validateConfiguration(false).concat(validatePartidas());
        $("#txOcSaveGate").prop("hidden", saveErrors.length === 0 || state.editor.readOnly);
        $("#txOcSaveGate span").text(saveErrors[0] || "");
    }

    function updateStepStateCopy(step, completed, active) {
        const node = document.querySelector("#txOcStepState" + step);
        if (!node) {
            return;
        }

        let text = "Pendiente";
        if (completed) {
            text = "Completo";
        } else if (active) {
            text = "Activo";
        } else if (step > 1 && !isStepUnlocked(step)) {
            text = "Bloqueado";
        }
        node.textContent = text;
    }

    function syncActionButtons() {
        const detail = state.editor.detail;
        const estado = Number(detail && detail.estado || 0);
        const hasPersistedOrder = !!state.detailId;
        const isDraft = estado === estadoBorrador || !hasPersistedOrder;
        const total = roundMoney(state.editor.partidas.reduce(function (accumulator, partida) {
            return accumulator + Number(partida.subtotal || 0);
        }, 0));
        const canSave = !state.editor.readOnly && !state.editor.loading && !state.editor.saving && !state.editor.generating && !state.editor.cancelling;
        const canGenerate = hasPersistedOrder && estado === estadoBorrador && !state.editor.readOnly && !state.editor.saving && !state.editor.generating && !state.editor.cancelling;
        const canCancel = hasPersistedOrder && (estado === estadoBorrador || estado === estadoGenerada) && !state.editor.saving && !state.editor.generating && !state.editor.cancelling;
        const canExport = canExportCurrentOrder();
        const canMoveToStep2 = validateConfigurationStep1(false).length === 0 && !state.editor.readOnly;
        const canMoveToStep3 = canAccessStep(3) && !state.editor.readOnly;

        $("#btOcPaso1Siguiente").prop("disabled", !canMoveToStep2);
        $("#btOcPaso2Siguiente").prop("disabled", !canMoveToStep3);
        $("#btOcAgregarPartida").prop("disabled", state.editor.readOnly || !state.editor.selectedProduct);
        $("#btOcPaso5Buscar").prop("disabled", state.editor.readOnly || !canAccessStep(3));

        $("#btOcLimpiarBusquedaProductoServicio").prop("disabled", state.editor.readOnly || state.editor.searching || !canAccessStep(3));
        $("#txOcBusquedaSpinner").prop("hidden", !state.editor.searching);

        $("#btOcGuardar").prop("hidden", !isDraft)
            .prop("disabled", !canSave || validateConfiguration(false).length > 0 || validatePartidas().length > 0)
            .find("span").text(state.editor.saving ? "Guardando..." : "Guardar borrador");
        $("#btOcGenerar").prop("hidden", !(hasPersistedOrder && estado === estadoBorrador))
            .prop("disabled", !canGenerate || validatePartidasForGenerate().length > 0)
            .find("span").text(state.editor.generating ? "Generando..." : "Generar orden");
        $("#btOcCancelar").prop("hidden", !(hasPersistedOrder && (estado === estadoBorrador || estado === estadoGenerada)))
            .prop("disabled", !canCancel)
            .find("span").text(state.editor.cancelling ? "Cancelando..." : "Cancelar orden");
        $("#panelOcExportaciones").prop("hidden", !canExport);
        $("#btOcExportarPdf").prop("disabled", state.editor.exportingPdf || state.editor.exportingExcel)
            .find("span").text(state.editor.exportingPdf ? "Exportando..." : "Exportar PDF");
        $("#btOcExportarExcel").prop("disabled", state.editor.exportingPdf || state.editor.exportingExcel)
            .find("span").text(state.editor.exportingExcel ? "Exportando..." : "Exportar Excel");

        if (hasPersistedOrder && estado === estadoBorrador && state.currentStep === 5 && total <= 0 && !state.editor.generating && !state.editor.saving && !state.editor.cancelling) {
            setStatus("#txOcFormStatus", "warning", "Ajusta cantidades o costos antes de generar la orden.");
        }
    }

    function canExportCurrentOrder() {
        const detail = state.editor.detail;
        return !!(state.detailId && detail && Number(detail.estado || 0) === estadoGenerada);
    }

    function resolveMaxUnlockedStep() {
        if (state.editor.readOnly) {
            return state.editor.partidas.length > 0 ? 5 : 3;
        }
        if (canAccessStep(5)) {
            return 5;
        }
        if (canAccessStep(4)) {
            return 4;
        }
        if (canAccessStep(3)) {
            return 3;
        }
        if (canAccessStep(2)) {
            return 2;
        }
        return 1;
    }

    function isStepUnlocked(step) {
        if (Number(step || 0) === 4 && !state.editor.selectedProduct) {
            return state.currentStep === 4;
        }
        return Number(step || 0) <= Number(state.editor.maxUnlockedStep || 1);
    }

    function resolveUserFacingOrderState(estado, estadoNombre) {
        const normalized = String(estadoNombre || "").trim().toLowerCase();
        const numeric = Number(estado || 0);

        if (numeric === estadoBorrador || normalized === "borrador") {
            return "Borrador";
        }

        if (numeric === estadoGenerada || normalized === "generada") {
            return "Generada";
        }

        if (numeric === estadoCancelada || normalized === "cancelada") {
            return "Cancelada";
        }

        if (numeric === estadoParcialmenteRecibida || normalized === "parcialmente recibida") {
            return "Parcialmente recibida";
        }

        if (numeric === estadoRecibida || normalized === "recibida") {
            return "Recibida";
        }

        if (!normalized || normalized === "nueva") {
            return "Borrador";
        }

        return estadoNombre || "Desconocido";
    }

    function initReportPage() {
        state.report.accordion = CheckAppUI.createFilterAccordion({
            id: "ordenesCompraFiltros",
            selector: "#accordionFiltrosOrdenesCompra",
            open: true,
            emptySummaryText: "Sin filtros activos"
        });

        bindReportEvents();
        applyDefaultReportDateRange();
        setStatus("#txOcListadoStatus", "", "");
        updateReportFilterSummary();
        renderReportDetailState();

        Promise.resolve()
            .then(loadReportCombos)
            .then(initReportGrid)
            .catch(function (error) {
                const message = resolveErrorMessage(error);
                setStatus("#txOcListadoStatus", "danger", message);
                showError(message);
            });
    }

    function bindReportEvents() {
        $("#btOcBuscarListado").on("click", function () {
            runReportSearch();
        });

        $("#btOcLimpiarListado").on("click", function () {
            resetReportFilters();
            runReportSearch();
        });

        $("#btOcExportar").on("click", function () {
            exportReportExcel();
        });

        $("#txOcFiltroBusqueda, #txOcFiltroFechaDesde, #txOcFiltroFechaHasta").on("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                runReportSearch();
            }
        });

        $("#txOcFiltroBusqueda, #txOcFiltroFechaDesde, #txOcFiltroFechaHasta").on("input change", function () {
            updateReportFilterSummary();
        });

        $("#cbOcFiltroEstado, #cbOcFiltroProveedor, #cbOcFiltroRazonSocial, #cbOcFiltroSucursal").on("change", function () {
            if (this.id === "cbOcFiltroRazonSocial") {
                syncReportSucursales();
            }

            updateReportFilterSummary();
        });

        $("#gridOrdenesCompraHost").on("click", "[data-oc-open-detail]", function () {
            const id = normalizeGuid($(this).attr("data-oc-open-detail"));
            if (!id) {
                return;
            }

            openReportDetailModal(id);
        });

        $("#btOcDetalleReintentar").on("click", function () {
            if (state.report.detail.currentId) {
                loadReportDetail(state.report.detail.currentId);
            }
        });

        $("#btOcDetallePdf").on("click", function () {
            exportReportDetailPdf();
        });

        $("#btOcDetalleExcel").on("click", function () {
            exportReportDetailExcel();
        });

        $("#modalOcDetalleReporte").on("hidden.bs.modal", function () {
            setStatus("#txOcDetalleInlineStatus", "", "");
        });
    }

    function loadReportCombos() {
        return fetchJson("/Activos/OrdenesCompra/ObtenerCombosOrdenCompra")
            .then(function (data) {
                state.combos.razonesSociales = Array.isArray(data.razonesSociales) ? data.razonesSociales : [];
                state.combos.sucursales = Array.isArray(data.sucursales) ? data.sucursales : [];
                state.combos.proveedores = Array.isArray(data.proveedores) ? data.proveedores : [];

                populateSelect("#cbOcFiltroProveedor", state.combos.proveedores, {
                    emptyText: "Todos los proveedores"
                });
                populateSelect("#cbOcFiltroRazonSocial", state.combos.razonesSociales, {
                    emptyText: "Todas las razones sociales"
                });

                populateSelect("#cbOcFiltroEstado", Array.isArray(data.estados) ? data.estados : [], {
                    emptyText: "Todos los estados"
                });

                syncReportSucursales();
            });
    }

    function syncReportSucursales() {
        const selectedRazonSocial = normalizeGuid($("#cbOcFiltroRazonSocial").val());
        const filtered = !selectedRazonSocial
            ? state.combos.sucursales
            : state.combos.sucursales.filter(function (item) {
                return !item.idPadre || String(item.idPadre) === String(selectedRazonSocial) || String(item.idRazonSocial) === String(selectedRazonSocial);
            });

        populateSelect("#cbOcFiltroSucursal", filtered, {
            emptyText: "Todas las sucursales"
        });
    }

    function initReportGrid() {
        return CheckAppUI.createDynamicGrid({
            id: reportGridId,
            hostSelector: "#gridOrdenesCompraHost",
            tableSelector: "#grOrdenesCompra",
            searchInputSelector: "#txOcBusquedaGrid",
            columnToggleButtonSelector: "#btOcColumnas",
            columnTogglePanelSelector: "#panelOcColumnas",
            resultCountSelector: "#txOcGridCount",
            footerRangeSelector: "#txOcGridRange",
            footerPageIndicatorSelector: "#txOcGridPageIndicator",
            footerPrevButtonSelector: "#btOcGridPrev",
            footerNextButtonSelector: "#btOcGridNext",
            footerPageSizeSelector: "#txOcGridPageSize",
            mobileCardTitleKey: "folio",
            mobileCardMeta: function (row) {
                return "<span class='ca-chip ca-chip--secondary'>" + escapeHtml(resolveUserFacingOrderState(row.estado, row.estadoNombre)) + "</span>";
            },
            mobileCardTemplate: function (row) {
                return [
                    "<div class='oc-mobile-card-body'>",
                    "<div class='oc-mobile-card-row'><span>Proveedor</span><strong>" + escapeHtml(row.proveedor || "—") + "</strong></div>",
                    "<div class='oc-mobile-card-row'><span>Razón social</span><strong>" + escapeHtml(row.razonSocial || "—") + "</strong></div>",
                    "<div class='oc-mobile-card-row'><span>Sucursal</span><strong>" + escapeHtml(row.sucursal || "—") + "</strong></div>",
                    "<div class='oc-mobile-card-row'><span>Ordenado</span><strong>" + escapeHtml(String(roundQuantity(row.cantidadOrdenada || 0))) + "</strong></div>",
                    "<div class='oc-mobile-card-row'><span>Recibido</span><strong>" + escapeHtml(String(roundQuantity(row.cantidadRecibida || 0))) + "</strong></div>",
                    "<div class='oc-mobile-card-row'><span>Pendiente</span><strong>" + escapeHtml(String(roundQuantity(row.cantidadPendiente || 0))) + "</strong></div>",
                    "<div class='oc-mobile-card-row'><span>Fecha de orden</span><strong>" + escapeHtml(formatDateOnly(row.fechaOrden)) + "</strong></div>",
                    "<div class='oc-mobile-card-row'><span>Fecha de llegada</span><strong>" + escapeHtml(formatDateOnly(row.fechaLlegada)) + "</strong></div>",
                    "<div class='oc-mobile-card-row'><span>Total</span><strong>" + escapeHtml(formatCurrency(row.total)) + "</strong></div>",
                    "</div>",
                    "<div class='oc-mobile-card-actions'>",
                    "<button type='button' class='checkapp-btn checkapp-btn-secondary' data-oc-open-detail='" + escapeHtml(row.id || "") + "'>Ver detalle</button>",
                    row.puedeEditar ? "<a class='checkapp-btn checkapp-btn-ghost' href='/Activos/OrdenesCompra/Editar/" + encodeURIComponent(row.id || "") + "'>Editar</a>" : "",
                    "</div>"
                ].join("");
            },
            pageLength: 25,
            lengthMenu: [[25, 50, 100], [25, 50, 100]],
            order: [[9, "desc"], [12, "desc"]],
            emptyText: "Usa los filtros para consultar órdenes de compra.",
            loadData: function () {
                if (!state.report.hasSearched) {
                    state.report.rows = [];
                    return Promise.resolve([]);
                }

                const query = buildReportQuery();
                state.report.lastQuery = query.toString();
                return fetchJson("/Activos/OrdenesCompra/ObtenerOrdenesCompra?" + query.toString())
                    .then(function (rows) {
                        state.report.rows = Array.isArray(rows) ? rows : [];
                        return state.report.rows;
                    });
            },
            columns: [
                {
                    key: "acciones",
                    title: "Acciones",
                    sortable: false,
                    hideable: false,
                    exportable: false,
                    className: "oc-grid-col-actions-cell",
                    render: function (_value, row) {
                        const edit = row.puedeEditar
                            ? "<a class='checkapp-btn checkapp-btn-ghost checkapp-btn-inline' href='/Activos/OrdenesCompra/Editar/" + encodeURIComponent(row.id || "") + "'>Editar</a>"
                            : "";
                        return "<div class='oc-grid-actions-cell'><button type='button' class='checkapp-btn checkapp-btn-secondary checkapp-btn-inline oc-grid-detail-btn' data-oc-open-detail='" + escapeHtml(row.id || "") + "'>Ver detalle</button>" + edit + "</div>";
                    }
                },
                { key: "folio", title: "Folio" },
                { key: "proveedor", title: "Proveedor" },
                { key: "razonSocial", title: "Razón social" },
                { key: "sucursal", title: "Sucursal" },
                {
                    key: "estadoNombre",
                    title: "Estado",
                    render: function (_value, row) {
                        return "<span class='ca-chip ca-chip--secondary'>" + escapeHtml(resolveUserFacingOrderState(row.estado, row.estadoNombre)) + "</span>";
                    },
                    exportValue: function (_value, row) {
                        return resolveUserFacingOrderState(row.estado, row.estadoNombre);
                    }
                },
                { key: "cantidadOrdenada", title: "Ordenado", render: function (value) { return roundQuantity(value || 0); } },
                { key: "cantidadRecibida", title: "Recibido", render: function (value) { return roundQuantity(value || 0); } },
                { key: "cantidadPendiente", title: "Pendiente", render: function (value) { return roundQuantity(value || 0); } },
                {
                    key: "fechaOrden",
                    title: "Fecha de orden",
                    exportValue: function (value) {
                        return formatDateOnly(value);
                    },
                    render: function (value) {
                        return formatDateOnly(value);
                    }
                },
                {
                    key: "fechaLlegada",
                    title: "Fecha de llegada",
                    exportValue: function (value) {
                        return formatDateOnly(value);
                    },
                    render: function (value) {
                        return formatDateOnly(value);
                    }
                },
                {
                    key: "total",
                    title: "Total",
                    exportValue: function (value) {
                        return value == null ? "" : Number(value);
                    },
                    render: function (value) {
                        return formatCurrency(value);
                    }
                },
                {
                    key: "fechaCreacion",
                    title: "Fecha de creación",
                    exportValue: function (value) {
                        return formatDisplayDate(value);
                    },
                    render: function (value) {
                        return formatDisplayDate(value);
                    }
                }
            ],
            onLoaded: function (rows) {
                const total = Array.isArray(rows) ? rows.length : 0;
                syncReportSummaryFromGrid();
                $("#txOcGridVisibleCount").text(total + " visibles");
                if (!state.report.hasSearched) {
                    setStatus("#txOcListadoStatus", "", "");
                    return;
                }

                setStatus("#txOcListadoStatus", total ? "success" : "warning", total ? "Consulta actualizada." : "No encontramos órdenes con los filtros actuales.");
            },
            onError: function (error) {
                $("#txOcGridVisibleCount").text("0 visibles");
                setStatus("#txOcListadoStatus", "danger", resolveErrorMessage(error));
            },
            onDraw: function () {
                syncReportSummaryFromGrid();
            }
        }).then(function (grid) {
            state.report.grid = grid;
            return grid;
        });
    }

    function reloadReportGrid() {
        updateReportFilterSummary();
        setStatus("#txOcListadoStatus", "", "");
        if (!state.report.grid) {
            return initReportGrid();
        }
        return CheckAppUI.reloadGrid(reportGridId, false);
    }

    function runReportSearch() {
        state.report.hasSearched = true;
        return reloadReportGrid().catch(function (error) {
            const message = resolveErrorMessage(error);
            setStatus("#txOcListadoStatus", "danger", message);
            showError(message);
        });
    }

    function buildReportQuery() {
        const params = new URLSearchParams();
        appendQuery(params, "busqueda", $("#txOcFiltroBusqueda").val());
        appendQuery(params, "estado", $("#cbOcFiltroEstado").val());
        appendQuery(params, "idProveedor", $("#cbOcFiltroProveedor").val());
        appendQuery(params, "idRazonSocial", $("#cbOcFiltroRazonSocial").val());
        appendQuery(params, "idSucursal", $("#cbOcFiltroSucursal").val());
        appendQuery(params, "fechaDesde", $("#txOcFiltroFechaDesde").val());
        appendQuery(params, "fechaHasta", $("#txOcFiltroFechaHasta").val());
        return params;
    }

    function exportReportExcel() {
        const query = buildReportQuery();
        const url = "/Activos/OrdenesCompra/ExportarOrdenesCompra" + (query.toString() ? "?" + query.toString() : "");

        $("#btOcExportar").prop("disabled", true).find("span").text("Exportando...");

        return downloadFile(url, "GET")
            .then(function () {
                setStatus("#txOcListadoStatus", "success", "El listado se exportó correctamente.");
            })
            .catch(function (error) {
                const message = resolveErrorMessage(error);
                setStatus("#txOcListadoStatus", "danger", message);
                showError(message);
            })
            .finally(function () {
                $("#btOcExportar").prop("disabled", false).find("span").text("Exportar Excel");
            });
    }

    function updateReportFilterSummary() {
        if (!state.report.accordion) {
            return;
        }

        const summary = [];
        const busqueda = String($("#txOcFiltroBusqueda").val() || "").trim();
        const estado = getSelectedText("#cbOcFiltroEstado");
        const proveedor = getSelectedText("#cbOcFiltroProveedor");
        const razonSocial = getSelectedText("#cbOcFiltroRazonSocial");
        const sucursal = getSelectedText("#cbOcFiltroSucursal");
        const fechaDesde = String($("#txOcFiltroFechaDesde").val() || "").trim();
        const fechaHasta = String($("#txOcFiltroFechaHasta").val() || "").trim();

        if (busqueda) {
            summary.push("Búsqueda: " + busqueda);
        }
        if ($("#cbOcFiltroEstado").val()) {
            summary.push("Estado: " + estado);
        }
        if ($("#cbOcFiltroProveedor").val()) {
            summary.push("Proveedor: " + proveedor);
        }
        if ($("#cbOcFiltroRazonSocial").val()) {
            summary.push("Razón social: " + razonSocial);
        }
        if ($("#cbOcFiltroSucursal").val()) {
            summary.push("Sucursal: " + sucursal);
        }
        if (fechaDesde || fechaHasta) {
            summary.push("Fechas: " + formatDateOnly(fechaDesde) + " a " + formatDateOnly(fechaHasta));
        }

        state.report.accordion.setSummary(summary.length ? summary.join(" · ") : "Sin filtros activos");
    }

    function resetReportFilters() {
        const defaultRange = getCurrentMonthRange();
        $("#txOcFiltroBusqueda").val("");
        $("#cbOcFiltroEstado").val("");
        $("#cbOcFiltroProveedor").val("");
        $("#cbOcFiltroRazonSocial").val("");
        syncReportSucursales();
        $("#cbOcFiltroSucursal").val("");
        $("#txOcFiltroFechaDesde").val(defaultRange.start);
        $("#txOcFiltroFechaHasta").val(defaultRange.end);
        $("#txOcBusquedaGrid").val("");
        updateReportFilterSummary();
    }

    function applyDefaultReportDateRange() {
        const range = getCurrentMonthRange();
        const fechaDesde = document.querySelector("#txOcFiltroFechaDesde");
        const fechaHasta = document.querySelector("#txOcFiltroFechaHasta");

        if (fechaDesde && !fechaDesde.value) {
            fechaDesde.value = range.start;
        }

        if (fechaHasta && !fechaHasta.value) {
            fechaHasta.value = range.end;
        }
    }

    function getCurrentMonthRange() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
            start: formatInputDate(start),
            end: formatInputDate(end)
        };
    }

    function syncReportSummaryFromGrid() {
        if (!state.report.grid || !state.report.grid.instance) {
            return;
        }

        const filteredRows = state.report.grid.instance.rows({ search: "applied" }).indexes().toArray().map(function (index) {
            return state.report.rows[index];
        });

        $("#txOcGridVisibleCount").text(filteredRows.length + " visibles");
    }

    function openReportDetailModal(id) {
        state.report.detail.currentId = id;
        if (state.report.detail.modal) {
            state.report.detail.modal.show();
        }

        loadReportDetail(id);
    }

    function loadReportDetail(id) {
        const requestSequence = ++state.report.detail.requestSequence;
        state.report.detail.loading = true;
        state.report.detail.data = null;
        state.report.detail.error = "";
        setStatus("#txOcDetalleInlineStatus", "", "");
        renderReportDetailState();

        return fetchJson("/Activos/OrdenesCompra/ObtenerOrdenCompra?idOrdenCompra=" + encodeURIComponent(id))
            .then(function (detail) {
                if (requestSequence !== state.report.detail.requestSequence) {
                    return;
                }

                state.report.detail.data = detail || null;
                state.report.detail.error = "";
                populateReportDetail(detail || {});
                renderReportDetailState();
            })
            .catch(function (error) {
                if (requestSequence !== state.report.detail.requestSequence) {
                    return;
                }

                state.report.detail.data = null;
                state.report.detail.error = resolveErrorMessage(error);
                renderReportDetailState();
            })
            .finally(function () {
                if (requestSequence !== state.report.detail.requestSequence) {
                    return;
                }

                state.report.detail.loading = false;
                renderReportDetailState();
            });
    }

    function renderReportDetailState() {
        const loadingNode = document.querySelector("#ocDetalleLoadingState");
        const errorNode = document.querySelector("#ocDetalleErrorState");
        const contentNode = document.querySelector("#ocDetalleContent");
        const errorTextNode = document.querySelector("#txOcDetalleErrorMensaje");
        const hasData = !!state.report.detail.data;
        const isLoading = state.report.detail.loading;
        const hasError = !!state.report.detail.error && !isLoading;

        if (loadingNode) {
            loadingNode.hidden = !isLoading;
        }

        if (errorNode) {
            errorNode.hidden = !hasError;
        }

        if (errorTextNode && hasError) {
            errorTextNode.textContent = state.report.detail.error;
        }

        if (contentNode) {
            contentNode.hidden = !hasData || isLoading || hasError;
        }

        $("#btOcDetallePdf, #btOcDetalleExcel").prop("disabled", !hasData || isLoading || hasError);
        if (!hasData || isLoading || hasError) {
            $("#btOcDetalleEditar").prop("hidden", true);
        }
    }

    function populateReportDetail(detail) {
        const partidas = Array.isArray(detail.partidas) ? detail.partidas : [];
        $("#txOcDetalleTitulo").text(detail.folio ? "Orden " + detail.folio : "Orden de compra");
        $("#txOcDetalleSubtitulo").text("Consulta la orden sin perder los filtros del reporte.");
        $("#txOcDetalleFolio").text(detail.folio || "—");
        $("#txOcDetalleEstado").text(resolveUserFacingOrderState(detail.estado, detail.estadoNombre));
        $("#txOcDetalleRazonSocial").text(detail.razonSocial || "—");
        $("#txOcDetalleSucursal").text(detail.sucursal || "—");
        $("#txOcDetalleProveedor").text(detail.proveedor || "—");
        $("#txOcDetalleFechaOrden").text(formatDateOnly(detail.fechaOrden));
        $("#txOcDetalleFechaLlegada").text(formatDateOnly(detail.fechaLlegada));
        $("#txOcDetalleFechaMinima").text(formatDateOnly(detail.fechaMinima));
        $("#txOcDetalleFechaMaxima").text(formatDateOnly(detail.fechaMaxima));
        $("#txOcDetalleObservaciones").text(detail.observaciones || "Sin observaciones");
        $("#txOcDetalleSubtotal").text(formatCurrency(detail.subtotal || 0));
        $("#txOcDetalleTotal").text(formatCurrency(detail.total || 0));
        $("#txOcDetallePartidasCount").text(partidas.length + " partida" + (partidas.length === 1 ? "" : "s"));
        const puedeEditar = Number(detail.estado || 0) === estadoBorrador;
        $("#btOcDetalleEditar")
            .attr("href", puedeEditar ? "/Activos/OrdenesCompra/Editar/" + encodeURIComponent(detail.id || "") : "#")
            .prop("hidden", !puedeEditar);
        renderReportDetailPartidas(partidas);
    }

    function renderReportDetailPartidas(partidas) {
        const tbody = document.querySelector("#tbOcDetallePartidas");
        if (!tbody) {
            return;
        }

        tbody.innerHTML = "";
        if (!Array.isArray(partidas) || !partidas.length) {
            const row = document.createElement("tr");
            row.innerHTML = "<td colspan='15'><div class='oc-empty-state'>La orden no tiene partidas disponibles.</div></td>";
            tbody.appendChild(row);
            return;
        }

        partidas.forEach(function (partida) {
            const tr = document.createElement("tr");
            const descripcion = [partida.nombre || "", partida.descripcion || ""].filter(Boolean).join(" · ");
            tr.innerHTML = [
                "<td>" + escapeHtml(partida.numeroPartida || "—") + "</td>",
                "<td>" + escapeHtml(partida.tipoProductoServicioNombre || "—") + "</td>",
                "<td>" + escapeHtml(partida.codigo || "—") + "</td>",
                "<td><div class='oc-line-title'><strong>" + escapeHtml(partida.nombre || "—") + "</strong><small title='" + escapeHtml(toPlainText(descripcion || "")) + "'>" + escapeHtml(toPlainText(descripcion || "Sin descripción")) + "</small></div></td>",
                "<td>" + escapeHtml(partida.categoria || "—") + "</td>",
                "<td>" + escapeHtml(partida.marca || "—") + "</td>",
                "<td>" + escapeHtml(partida.varianteSnapshot || "—") + "</td>",
                "<td>" + escapeHtml(partida.presentacionCompraSnapshot || "—") + "</td>",
                "<td>" + escapeHtml(resolveUnidadDisplay(partida.unidadMedida, partida.unidadAbreviatura) || "—") + "</td>",
                "<td>" + escapeHtml(String(roundQuantity(partida.cantidadBaseOrdenada || 0))) + "</td>",
                "<td>" + escapeHtml(String(roundQuantity(partida.cantidadBaseRecibidaAcumulada || 0))) + "</td>",
                "<td>" + escapeHtml(String(roundQuantity(partida.cantidadBasePendiente || 0))) + "</td>",
                "<td>" + escapeHtml(partida.estadoPartidaNombre || "—") + "</td>",
                "<td>" + escapeHtml(formatCurrency(partida.costoUnitario || 0)) + "</td>",
                "<td>" + escapeHtml(formatCurrency(partida.subtotal || 0)) + "</td>"
            ].join("");
            tbody.appendChild(tr);
        });
    }

    function exportReportDetailPdf() {
        if (!state.report.detail.currentId || state.report.detail.loading) {
            return;
        }

        $("#btOcDetallePdf").prop("disabled", true).find("span").text("Exportando...");
        return downloadFile("/Activos/OrdenesCompra/ExportarOrdenCompraPdf?idOrdenCompra=" + encodeURIComponent(state.report.detail.currentId), "GET")
            .catch(function (error) {
                setStatus("#txOcDetalleInlineStatus", "danger", resolveErrorMessage(error));
            })
            .finally(function () {
                $("#btOcDetallePdf").prop("disabled", false).find("span").text("Exportar PDF");
            });
    }

    function exportReportDetailExcel() {
        if (!state.report.detail.currentId || state.report.detail.loading) {
            return;
        }

        $("#btOcDetalleExcel").prop("disabled", true).find("span").text("Exportando...");
        return downloadFile("/Activos/OrdenesCompra/ExportarOrdenCompraExcel?idOrdenCompra=" + encodeURIComponent(state.report.detail.currentId), "GET")
            .catch(function (error) {
                setStatus("#txOcDetalleInlineStatus", "danger", resolveErrorMessage(error));
            })
            .finally(function () {
                $("#btOcDetalleExcel").prop("disabled", false).find("span").text("Exportar Excel");
            });
    }

    function showEditorOverlay(show, title, text) {
        toggleOverlay("#ocEditorOverlay", show, "#txOcOverlayTitle", title, "#txOcOverlayText", text);
    }

    function toggleOverlay(selector, show, titleSelector, title, textSelector, text) {
        const overlay = document.querySelector(selector);
        if (!overlay) {
            return;
        }

        overlay.hidden = !show;
        overlay.setAttribute("aria-hidden", show ? "false" : "true");

        if (titleSelector) {
            const titleNode = document.querySelector(titleSelector);
            if (titleNode && title) {
                titleNode.textContent = title;
            }
        }

        if (textSelector) {
            const textNode = document.querySelector(textSelector);
            if (textNode && text) {
                textNode.textContent = text;
            }
        }
    }

    function populateSelect(selector, items, options) {
        const node = document.querySelector(selector);
        if (!node) {
            return;
        }

        const settings = options || {};
        const currentValue = String(node.value || "").trim();
        const emptyText = settings.emptyText || "Selecciona una opción";

        node.innerHTML = "";
        const emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.textContent = emptyText;
        node.appendChild(emptyOption);

        (Array.isArray(items) ? items : []).forEach(function (item) {
            const option = document.createElement("option");
            option.value = String(item.id || "");
            option.textContent = item.nombre || item.descripcion || item.codigo || "";
            node.appendChild(option);
        });

        if (currentValue && Array.from(node.options).some(function (option) { return option.value === currentValue; })) {
            node.value = currentValue;
        }
    }

    function getSelectedText(selector) {
        const node = document.querySelector(selector);
        if (!node || node.selectedIndex < 0) {
            return "";
        }
        return String(node.options[node.selectedIndex].text || "").trim();
    }

    function resolveUnidadDisplay(unidad, abreviatura) {
        if (unidad && abreviatura) {
            return unidad + " (" + abreviatura + ")";
        }
        return unidad || abreviatura || "";
    }

    function setTodayIfEmpty(selector) {
        const node = document.querySelector(selector);
        if (!node || node.value) {
            return;
        }

        node.value = formatInputDate(new Date());
    }

    function setInitialLegacyDates() {
        const today = new Date();
        const maximum = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
        setTodayIfEmpty("#txOcFechaOrden");
        setTodayIfEmpty("#txOcFechaLlegada");
        setTodayIfEmpty("#txOcFechaMinima");
        if (!$("#txOcFechaMaxima").val()) {
            $("#txOcFechaMaxima").val(formatInputDate(maximum));
        }
        syncDateValidationWindow();
    }

    function syncDateValidationWindow(sourceId) {
        const fechaOrden = String($("#txOcFechaOrden").val() || "").trim();
        const fechaLlegada = String($("#txOcFechaLlegada").val() || "").trim();
        const fechaMinima = $("#txOcFechaMinima");
        const fechaMaxima = $("#txOcFechaMaxima");

        if (fechaOrden && (!fechaMinima.val() || sourceId === "txOcFechaOrden")) {
            fechaMinima.val(fechaOrden);
        }

        if (fechaLlegada && !fechaMaxima.val()) {
            fechaMaxima.val(fechaLlegada);
        }

        if (fechaOrden) {
            fechaMinima.attr("min", fechaOrden);
            $("#txOcFechaLlegada").attr("min", fechaOrden);
        }

        const minValue = String(fechaMinima.val() || "").trim();
        const maxValue = String(fechaMaxima.val() || "").trim();

        if (minValue) {
            $("#txOcFechaLlegada").attr("min", minValue);
            fechaMaxima.attr("min", minValue);
        }

        if (maxValue) {
            $("#txOcFechaLlegada").attr("max", maxValue);
            fechaMinima.attr("max", maxValue);
        } else {
            $("#txOcFechaLlegada").removeAttr("max");
        }
    }

    function formatInputDate(value) {
        const date = parseDateValue(value);
        if (!date) {
            return "";
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return year + "-" + month + "-" + day;
    }

    function formatDateOnly(value) {
        if (!value) {
            return "—";
        }

        const date = parseDateValue(value);
        if (!date) {
            return "—";
        }

        return new Intl.DateTimeFormat("es-MX", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(date);
    }

    function formatDisplayDate(value) {
        if (!value) {
            return "—";
        }

        const date = parseDateValue(value);
        if (!date) {
            return "—";
        }

        return new Intl.DateTimeFormat("es-MX", {
            dateStyle: "short",
            timeStyle: "short"
        }).format(date);
    }

    function roundMoney(value) {
        return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
    }

    function parseDateValue(value) {
        if (!value) {
            return null;
        }

        if (value instanceof Date) {
            return Number.isNaN(value.getTime()) ? null : value;
        }

        const text = String(value).trim();
        const localDateMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (localDateMatch) {
            const year = Number(localDateMatch[1]);
            const month = Number(localDateMatch[2]) - 1;
            const day = Number(localDateMatch[3]);
            const localDate = new Date(year, month, day);
            return Number.isNaN(localDate.getTime()) ? null : localDate;
        }

        const parsed = new Date(text);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    function roundQuantity(value) {
        return Math.round((Number(value || 0) + Number.EPSILON) * 10000) / 10000;
    }

    function formatDecimalInput(value) {
        const number = Number(value || 0);
        if (!Number.isFinite(number)) {
            return "0";
        }
        return String(number);
    }

    function formatFactor(value) {
        const number = Number(value || 0);
        if (!Number.isFinite(number) || number <= 0) {
            return "1";
        }

        return String(Math.round((number + Number.EPSILON) * 1000000) / 1000000);
    }

    function normalizeSearchText(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function scheduleAutoSearch() {
        if (state.editor.readOnly) {
            return;
        }

        if (String($("#txOcBuscarProductoServicio").val() || "").trim() && validateConfiguration(false).length === 0) {
            state.editor.preparationCollapsed = true;
            renderPreparation();
        }

        if (state.editor.searchDebounceId) {
            window.clearTimeout(state.editor.searchDebounceId);
        }

        state.editor.searchDebounceId = window.setTimeout(function () {
            state.editor.searchDebounceId = 0;
            searchProductosServicios();
        }, 280);
    }

    function runImmediateSearch() {
        if (String($("#txOcBuscarProductoServicio").val() || "").trim() && validateConfiguration(false).length === 0) {
            state.editor.preparationCollapsed = true;
            renderPreparation();
        }
        if (state.editor.searchDebounceId) {
            window.clearTimeout(state.editor.searchDebounceId);
            state.editor.searchDebounceId = 0;
        }

        searchProductosServicios();
    }

    function buildSearchDescriptor() {
        const params = new URLSearchParams();
        appendQuery(params, "texto", $("#txOcBuscarProductoServicio").val());
        appendQuery(params, "tipo", $("#cbOcBuscarTipo").val());
        if ($("#ckOcSoloProveedor").prop("checked")) {
            appendQuery(params, "idProveedor", $("#cbOcProveedor").val());
        }
        appendQuery(params, "limite", 50);
        return {
            params: params,
            key: params.toString(),
            forceable: !!String($("#txOcBuscarProductoServicio").val() || "").trim()
        };
    }

    function sortSearchResults(items) {
        const normalized = Array.isArray(items) ? items.slice() : [];
        return normalized.sort(function (left, right) {
            return normalizeSearchText((left.nombre || "") + " " + (left.codigo || ""))
                .localeCompare(normalizeSearchText((right.nombre || "") + " " + (right.codigo || "")), "es");
        });
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

    function downloadFile(url, method) {
        return fetch(url, {
            method: method || "GET"
        }).then(function (response) {
            if (!response.ok) {
                return response.text().then(function (text) {
                    let message = "No fue posible completar la acción.";
                    if (text) {
                        try {
                            const data = JSON.parse(text);
                            message = resolveServerMessage(data) || message;
                        } catch (error) {
                            message = text;
                        }
                    }
                    throw new Error(message);
                });
            }

            return Promise.all([
                response.blob(),
                Promise.resolve(response.headers.get("content-disposition") || "")
            ]).then(function (result) {
                const blob = result[0];
                const contentDisposition = result[1];
                const fileName = resolveDownloadFileName(contentDisposition);
                const objectUrl = window.URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = objectUrl;
                anchor.download = fileName;
                document.body.appendChild(anchor);
                anchor.click();
                anchor.remove();
                window.setTimeout(function () {
                    window.URL.revokeObjectURL(objectUrl);
                }, 1000);
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
        let message = "";
        if (typeof data.d === "string") {
            message = data.d;
        }
        else if (typeof data.mensaje === "string") {
            message = data.mensaje;
        }
        return sanitizeUserMessage(message);
    }

    function sanitizeUserMessage(message) {
        return String(message || "").trim();
    }

    function resolveDownloadFileName(contentDisposition) {
        const raw = String(contentDisposition || "");
        const fileNameStarMatch = raw.match(/filename\*=UTF-8''([^;]+)/i);
        if (fileNameStarMatch && fileNameStarMatch[1]) {
            return decodeURIComponent(fileNameStarMatch[1]);
        }

        const fileNameMatch = raw.match(/filename="?([^";]+)"?/i);
        if (fileNameMatch && fileNameMatch[1]) {
            return fileNameMatch[1];
        }

        return "archivo";
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

    function cssEscape(value) {
        const text = String(value || "");
        if (window.CSS && typeof window.CSS.escape === "function") {
            return window.CSS.escape(text);
        }

        return text.replace(/'/g, "\\'");
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

    function setStatus(selector, tone, message) {
        const node = document.querySelector(selector);
        if (!node) {
            return;
        }

        node.className = "checkapp-status-inline";
        node.textContent = message || "";
        node.hidden = !message;

        if (message && tone) {
            node.classList.add("is-" + tone);
        }
    }

    function markFieldError(selectorOrNode) {
        const node = typeof selectorOrNode === "string" ? document.querySelector(selectorOrNode) : selectorOrNode;
        if (node) {
            node.classList.add("is-invalid");
        }
    }

    function clearFieldError(selectorOrNode) {
        const node = typeof selectorOrNode === "string" ? document.querySelector(selectorOrNode) : selectorOrNode;
        if (node) {
            node.classList.remove("is-invalid");
        }
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

    function toPlainText(value) {
        const raw = String(value || "");
        if (!raw) {
            return "";
        }

        const textarea = document.createElement("textarea");
        textarea.innerHTML = raw;
        const decoded = textarea.value;
        const container = document.createElement("div");
        container.innerHTML = decoded;
        return String(container.textContent || container.innerText || decoded)
            .replace(/\s+/g, " ")
            .trim();
    }

    function showSuccess(message) {
        Swal.fire({
            icon: "success",
            title: "Orden actualizada",
            text: message,
            confirmButtonText: "Aceptar"
        });
    }

    function showError(message) {
        Swal.fire({
            icon: "error",
            title: "No fue posible continuar",
            text: message,
            confirmButtonText: "Aceptar"
        });
    }
})(window, document, window.jQuery);
