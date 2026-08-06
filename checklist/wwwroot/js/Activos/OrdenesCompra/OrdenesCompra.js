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
    const reportGridId = "ordenesCompraReporteGrid";

    const stepLabels = {
        1: "Configuración",
        2: "Productos y servicios",
        3: "Partidas",
        4: "Revisar y guardar"
    };

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
            selectedEstado: "",
            accordion: null,
            grid: null,
            rows: [],
            lastQuery: "",
            summary: {
                total: 0,
                borradores: 0,
                generadas: 0,
                canceladas: 0,
                importe: 0
            },
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
            partidas: [],
            searchResults: [],
            partidasFilter: "",
            readOnly: false,
            maxUnlockedStep: 1,
            searchDebounceId: 0,
            searchAbortController: null,
            searchSequence: 0,
            activeSearchSequence: 0,
            lastSearchKey: "",
            lastAddedProductId: null,
            lastAddedProductTimerId: 0
        },
        ui: {
            cancelModal: null
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        if (state.pageType === "editor") {
            state.ui.cancelModal = resolveModalApi("#modalOcCancelar");
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
        setInitialDateValidationWindow();
        showEditorOverlay(false);
        setStatus("#txOcFormStatus", "", "");
        setStatus("#txOcBusquedaEstado", "", "");
        setStatus("#txOcCancelarStatus", "", "");
        renderSearchResults([]);
        renderPartidas();
        renderReview();
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
        $("#btOcPaso3Buscar").on("click", function () {
            goToStep(2, false);
        });
        $("#btOcPaso3Siguiente").on("click", function () {
            goToStep(4, true);
        });
        $("#btOcPaso4Anterior").on("click", function () {
            goToStep(3, false);
        });

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

        $("#cbOcRazonSocial").on("change", function () {
            syncSucursalesByRazonSocial();
            clearFieldError(this);
            refreshWizardState();
        });

        $("#cbOcSucursal, #cbOcProveedor, #cbOcBuscarTipo").on("change", function () {
            clearFieldError(this);
            refreshWizardState();
        });

        $("#txOcFechaOrden, #txOcFechaLlegada, #txOcFechaMinima, #txOcFechaMaxima, #txOcObservaciones").on("input change", function () {
            clearFieldError(this);
            syncDateValidationWindow(this.id);
            refreshWizardState();
        });

        $("#txOcCancelarMotivo").on("input", function () {
            clearFieldError(this);
            setStatus("#txOcCancelarStatus", "", "");
        });

        $("#grOcResultadosBusqueda").on("click", "[data-oc-add-item]", function () {
            const id = $(this).data("ocAddItem");
            const item = state.editor.searchResults.find(function (entry) {
                return String(entry.id) === String(id);
            });

            if (!item || state.editor.readOnly || state.editor.addingProductId) {
                return;
            }

            addPartidaFromSearch(item);
        });

        $("#grOcPartidas").on("input", "[data-oc-qty]", function () {
            updatePartidaField($(this).data("ocQty"), "cantidad", $(this).val());
        });

        $("#grOcPartidas").on("input", "[data-oc-cost]", function () {
            updatePartidaField($(this).data("ocCost"), "costoUnitario", $(this).val());
        });

        $("#grOcPartidas").on("click", "[data-oc-remove-item]", function () {
            removePartida($(this).data("ocRemoveItem"));
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
        syncSucursalesByRazonSocial();
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
        renderSearchResults([]);
        setStatus("#txOcBusquedaEstado", "", "");
        state.editor.lastSearchKey = "";
        syncActionButtons();
        refreshWizardState();
    }

    function renderSearchResults(items) {
        const tbody = document.querySelector("#grOcResultadosBusqueda tbody");
        if (!tbody) {
            return;
        }

        tbody.innerHTML = "";
        $("#txOcBusquedaResultadosCount").text((Array.isArray(items) ? items.length : 0) + " resultados");

        if (!Array.isArray(items) || !items.length) {
            const row = document.createElement("tr");
            row.innerHTML = "<td colspan='6'><div class='oc-empty-state'>No hay resultados para mostrar.</div></td>";
            tbody.appendChild(row);
            return;
        }

        items.forEach(function (item) {
            const isAdding = String(state.editor.addingProductId || "") === String(item.id || "");
            const wasAdded = String(state.editor.lastAddedProductId || "") === String(item.id || "");
            const tr = document.createElement("tr");
            tr.innerHTML = [
                "<td><button type='button' class='checkapp-btn " + (wasAdded ? "checkapp-btn-primary" : "checkapp-btn-secondary") + " checkapp-btn-sm' data-oc-add-item='" + escapeHtml(item.id) + "'" + (state.editor.readOnly || state.editor.addingProductId ? " disabled" : "") + "><i class='fa " + (wasAdded ? "fa-check" : "fa-plus") + "'></i><span>" + (isAdding ? "Agregando..." : (wasAdded ? "✔ Producto agregado" : "Agregar")) + "</span></button></td>",
                "<td>" + escapeHtml(item.tipoNombre || "") + "</td>",
                "<td>" + escapeHtml(item.codigo || "") + "</td>",
                "<td><div class='oc-line-title'><strong>" + escapeHtml(item.nombre || "") + "</strong><small>" + escapeHtml(item.descripcion || "") + "</small></div></td>",
                "<td>" + escapeHtml(resolveUnidadDisplay(item.unidad, item.abreviatura)) + "</td>",
                "<td>" + formatCurrency(item.costoActual || 0) + "</td>"
            ].join("");
            tbody.appendChild(tr);
        });
    }

    function addPartidaFromSearch(item) {
        state.editor.addingProductId = item.id;
        renderSearchResults(state.editor.searchResults);

        window.setTimeout(function () {
            const existing = state.editor.partidas.find(function (partida) {
                return String(partida.idProductoServicio) === String(item.id);
            });

            if (existing) {
                existing.cantidad = roundQuantity(existing.cantidad + 1);
                recalcPartida(existing);
                state.editor.addingProductId = null;
                markRecentlyAddedProduct(item.id);
                renderSearchResults(state.editor.searchResults);
                renderPartidas(existing.idProductoServicio);
                setStatus("#txOcFormStatus", "success", "✔ Producto agregado");
                return;
            }

            const partida = {
                idProductoServicio: item.id,
                tipoProductoServicio: Number(item.tipo || 0),
                tipoProductoServicioNombre: item.tipoNombre || "",
                codigo: item.codigo || "",
                nombre: item.nombre || "",
                descripcion: item.descripcion || "",
                unidadMedida: item.unidad || "",
                unidadAbreviatura: item.abreviatura || "",
                cantidad: 1,
                costoUnitario: Number(item.costoActual || 0),
                subtotal: 0,
                total: 0
            };

            recalcPartida(partida);
            state.editor.partidas.push(partida);
            state.editor.addingProductId = null;
            markRecentlyAddedProduct(item.id);
            renderSearchResults(state.editor.searchResults);
            renderPartidas(partida.idProductoServicio);
            setStatus("#txOcFormStatus", "success", "✔ Producto agregado");
        }, 120);
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

    function updatePartidaField(idProductoServicio, field, rawValue) {
        const partida = state.editor.partidas.find(function (item) {
            return String(item.idProductoServicio) === String(idProductoServicio);
        });

        if (!partida) {
            return;
        }

        const parsed = toNumber(rawValue);
        partida[field] = field === "cantidad" ? roundQuantity(parsed) : roundMoney(parsed);
        recalcPartida(partida);
        renderPartidas(partida.idProductoServicio);
    }

    function removePartida(idProductoServicio) {
        if (state.editor.readOnly) {
            return;
        }

        state.editor.partidas = state.editor.partidas.filter(function (item) {
            return String(item.idProductoServicio) !== String(idProductoServicio);
        });
        renderPartidas();
    }

    function recalcPartida(partida) {
        partida.cantidad = Math.max(0, roundQuantity(partida.cantidad));
        partida.costoUnitario = Math.max(0, roundMoney(partida.costoUnitario));
        partida.subtotal = roundMoney(partida.cantidad * partida.costoUnitario);
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
            if (highlightId && String(partida.idProductoServicio) === String(highlightId)) {
                tr.classList.add("oc-row-flash");
            }

            const isInvalidQuantity = !(Number(partida.cantidad) > 0);
            const isInvalidCostForGenerate = !(Number(partida.costoUnitario) > 0);

            tr.innerHTML = [
                "<td>" + (index + 1) + "</td>",
                "<td>" + escapeHtml(partida.tipoProductoServicioNombre || "") + "</td>",
                "<td>" + escapeHtml(partida.codigo || "") + "</td>",
                "<td><div class='oc-line-title'><strong>" + escapeHtml(partida.nombre || "") + "</strong><small>" + escapeHtml(partida.descripcion || "") + "</small></div></td>",
                "<td>" + escapeHtml(resolveUnidadDisplay(partida.unidadMedida, partida.unidadAbreviatura)) + "</td>",
                "<td><input class='form-control oc-inline-input" + (isInvalidQuantity ? " is-invalid" : "") + "' type='number' min='0' step='0.0001' data-oc-qty='" + escapeHtml(partida.idProductoServicio) + "' value='" + escapeHtml(formatDecimalInput(partida.cantidad)) + "'" + (state.editor.readOnly ? " disabled" : "") + " /></td>",
                "<td><input class='form-control oc-inline-input" + (isInvalidCostForGenerate ? " is-invalid" : "") + "' type='number' min='0' step='0.01' data-oc-cost='" + escapeHtml(partida.idProductoServicio) + "' value='" + escapeHtml(formatDecimalInput(partida.costoUnitario)) + "'" + (state.editor.readOnly ? " disabled" : "") + " /></td>",
                "<td>" + formatCurrency(partida.subtotal) + "</td>",
                "<td><button type='button' class='checkapp-btn checkapp-btn-ghost checkapp-btn-sm' data-oc-remove-item='" + escapeHtml(partida.idProductoServicio) + "'" + (state.editor.readOnly ? " disabled" : "") + "><i class='fa fa-trash'></i><span>Eliminar</span></button></td>"
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
        $("#txOcSidebarPartidasCount").text(state.editor.partidas.length);
        $("#txOcReviewPartidasCount").text(state.editor.partidas.length + " partidas");
        $("#txOcPartidasEstadoVacio").prop("hidden", state.editor.partidas.length > 0);

        if (state.editor.partidas.length > 0 && partidasFiltradas.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = "<td colspan='9'><div class='oc-empty-state'>No hay partidas que coincidan con la búsqueda actual.</div></td>";
            tbody.appendChild(row);
        }

        renderReview();
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
                partida.unidadAbreviatura
            ].join(" ");

            return normalizeSearchText(searchable).indexOf(filter) >= 0;
        });
    }

    function updateSummaryTotals(total) {
        $("#txOcSubtotal").text(formatCurrency(total));
        $("#txOcTotal").text(formatCurrency(total));
        $("#txOcResumenSidebarTotal").text(formatCurrency(total));
    }

    function buildSavePayload() {
        return {
            id: state.detailId,
            idEmpresa: state.empresaId,
            idRazonSocial: normalizeGuid($("#cbOcRazonSocial").val()),
            idSucursal: normalizeGuid($("#cbOcSucursal").val()),
            idProveedor: normalizeGuid($("#cbOcProveedor").val()),
            fechaOrden: $("#txOcFechaOrden").val() || "",
            fechaLlegada: $("#txOcFechaLlegada").val() || null,
            observaciones: String($("#txOcObservaciones").val() || "").trim(),
            partidas: state.editor.partidas.map(function (partida) {
                return {
                    idProductoServicio: partida.idProductoServicio,
                    cantidad: roundQuantity(partida.cantidad),
                    costoUnitario: roundMoney(partida.costoUnitario)
                };
            })
        };
    }

    function validateConfiguration(markFields) {
        const errors = [];
        const shouldMark = markFields === true;

        if (!normalizeGuid($("#cbOcRazonSocial").val())) {
            if (shouldMark) { markFieldError("#cbOcRazonSocial"); }
            errors.push("Selecciona una razón social.");
        }

        if (!normalizeGuid($("#cbOcSucursal").val())) {
            if (shouldMark) { markFieldError("#cbOcSucursal"); }
            errors.push("Selecciona una sucursal.");
        }

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
            if (!(Number(partida.cantidad) > 0)) {
                errors.push("La cantidad de la partida " + (index + 1) + " debe ser mayor a cero.");
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
        showEditorOverlay(true, "Guardando orden...", "Estamos registrando los cambios de tu orden.");
        setStatus("#txOcFormStatus", "info", "Guardando orden...");

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

                showSuccess(resolveServerMessage(response) || "La orden se guardó correctamente.");
                setStatus("#txOcFormStatus", "success", resolveServerMessage(response) || "La orden se guardó correctamente.");
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
        const razonSocial = String($("#cbOcRazonSocial option:selected").text() || "").trim() || "Sin asignar";
        const sucursal = String($("#cbOcSucursal option:selected").text() || "").trim() || "Sin asignar";
        const proveedor = String($("#cbOcProveedor option:selected").text() || "").trim() || "Sin asignar";
        const hasPendientes = pendientes && pendientes.tienePendientes;
        const html = [
            "<div class='oc-confirm-dialog'>",
            "<div class='oc-confirm-summary'>",
            "<p><strong>Proveedor</strong><br>" + escapeHtml(proveedor) + "</p>",
            "<p><strong>Razón social</strong><br>" + escapeHtml(razonSocial) + "</p>",
            "<p><strong>Sucursal</strong><br>" + escapeHtml(sucursal) + "</p>",
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
        syncSucursalesByRazonSocial();
        $("#cbOcSucursal").val(detail.idSucursal || "");
        $("#cbOcProveedor").val(detail.idProveedor || "");
        $("#txOcFechaOrden").val(formatInputDate(detail.fechaOrden));
        $("#txOcFechaLlegada").val(formatInputDate(detail.fechaLlegada));
        $("#txOcFechaMinima").val(formatInputDate(detail.fechaOrden));
        $("#txOcFechaMaxima").val(detail.fechaLlegada ? formatInputDate(detail.fechaLlegada) : "");
        $("#txOcObservaciones").val(detail.observaciones || "");

            updateHeaderSummary(detail.folio || "Pendiente", resolveUserFacingOrderState(detail.estado, detail.estadoNombre));

            state.editor.partidas = (Array.isArray(detail.partidas) ? detail.partidas : []).map(function (partida) {
                return {
                    idProductoServicio: partida.idProductoServicio,
                    tipoProductoServicio: Number(partida.tipoProductoServicio || 0),
                    tipoProductoServicioNombre: partida.tipoProductoServicioNombre || "",
                    codigo: partida.codigo || "",
                    nombre: partida.nombre || "",
                    descripcion: partida.descripcion || "",
                    unidadMedida: partida.unidadMedida || "",
                    unidadAbreviatura: partida.unidadAbreviatura || "",
                    cantidad: roundQuantity(partida.cantidad || 0),
                    costoUnitario: roundMoney(partida.costoUnitario || 0),
                    subtotal: roundMoney(partida.subtotal || 0),
                    total: roundMoney(partida.total || 0)
                };
            });

            state.editor.readOnly = Number(detail.estado || 0) !== estadoBorrador;
            $("#panelOcCancelacion").prop("hidden", Number(detail.estado || 0) !== estadoCancelada);
            $("#txOcFechaCancelacion").val(formatDisplayDate(detail.fechaCancelacion));
            $("#txOcMotivoCancelacion").val(detail.motivoCancelacion || "");

            const detailStep = state.editor.partidas.length > 0 ? 4 : 2;
            state.editor.maxUnlockedStep = detailStep;
            state.currentStep = detailStep;
        } else {
            $("#txOcHeroTitle").text("Orden de compra");
            $("#txOcHeroDescription").text("Captura la orden paso a paso, valida sus partidas y decide si quieres guardarla o generarla.");
            updateHeaderSummary("Pendiente", "En captura");
            $("#panelOcCancelacion").prop("hidden", true);
            state.editor.readOnly = false;
            state.editor.maxUnlockedStep = 1;
            state.currentStep = 1;
        }

        syncDateValidationWindow();
        renderPartidas();
        toggleEditorReadOnly(state.editor.readOnly);
        renderWizard();
        syncActionButtons();
    }

    function toggleEditorReadOnly(isReadOnly) {
        $("#cbOcRazonSocial, #cbOcSucursal, #cbOcProveedor, #txOcFechaOrden, #txOcFechaLlegada, #txOcFechaMinima, #txOcFechaMaxima, #txOcObservaciones, #txOcBuscarProductoServicio, #cbOcBuscarTipo")
            .prop("disabled", !!isReadOnly);
        $("#btOcLimpiarBusquedaProductoServicio, #btOcPaso1Siguiente, #btOcPaso2Siguiente, #btOcPaso3Siguiente")
            .prop("disabled", !!isReadOnly);
        renderSearchResults(state.editor.searchResults);
        renderPartidas();
    }

    function goToStep(step, validateCurrent) {
        const nextStep = Number(step || 0);
        if (nextStep < 1 || nextStep > 4) {
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
        renderWizard();
    }

    function validateStepTransition(nextStep) {
        if (nextStep === 2) {
            return validateConfiguration(true);
        }
        if (nextStep === 3) {
            return validateConfiguration(true).concat(state.editor.partidas.length ? [] : ["Agrega al menos una partida para continuar a Partidas."]);
        }
        if (nextStep === 4) {
            return validateConfiguration(true).concat(validatePartidas());
        }
        return [];
    }

    function canAccessStep(step) {
        if (step === 1) {
            return true;
        }
        if (step === 2) {
            return validateConfiguration(false).length === 0;
        }
        if (step === 3) {
            return validateConfiguration(false).length === 0 && state.editor.partidas.length > 0;
        }
        if (step === 4) {
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
            const step = Number(panel.getAttribute("data-step-panel") || 0);
            panel.hidden = step !== state.currentStep;
        });

        document.querySelectorAll("[data-step-target]").forEach(function (button) {
            const step = Number(button.getAttribute("data-step-target") || 0);
            const accessible = isStepUnlocked(step);
            const isActive = state.currentStep === step;
            const isCompleted = step < state.currentStep && accessible;

            button.disabled = !accessible && !isActive;
            button.classList.toggle("is-active", isActive);
            button.classList.toggle("is-completed", isCompleted);
            button.classList.toggle("is-blocked", !accessible && !isActive);
            button.classList.toggle("is-pending", accessible && !isActive && !isCompleted);
        });

        updateStepStateCopy(1, canAccessStep(2), state.currentStep === 1);
        updateStepStateCopy(2, canAccessStep(3), state.currentStep === 2);
        updateStepStateCopy(3, canAccessStep(4), state.currentStep === 3);
        updateStepStateCopy(4, false, state.currentStep === 4);

        renderProgress();
        renderReview();
        syncActionButtons();
    }

    function updateStepStateCopy(step, completed, active) {
        const node = document.querySelector("#txOcStepState" + step);
        if (!node) {
            return;
        }

        let text = "Pendiente";
        if (active) {
            text = "Activo";
        } else if (completed) {
            text = "Completado";
        } else if (step > 1 && !isStepUnlocked(step)) {
            text = "Bloqueado";
        }
        node.textContent = text;
    }

    function renderReview() {
        $("#txOcReviewRazonSocial").text(getSelectedText("#cbOcRazonSocial") || "—");
        $("#txOcReviewSucursal").text(getSelectedText("#cbOcSucursal") || "—");
        $("#txOcReviewProveedor").text(getSelectedText("#cbOcProveedor") || "—");
        $("#txOcReviewFechaOrden").text(formatDateOnly($("#txOcFechaOrden").val()) || "—");
        $("#txOcReviewFechaLlegada").text(formatDateOnly($("#txOcFechaLlegada").val()) || "—");

        const observaciones = String($("#txOcObservaciones").val() || "").trim();
        $("#txOcReviewObservaciones").text(observaciones || "Sin observaciones.");

        const tbody = document.querySelector("#grOcRevisionPartidas tbody");
        if (!tbody) {
            return;
        }

        tbody.innerHTML = "";

        if (!state.editor.partidas.length) {
            const row = document.createElement("tr");
            row.innerHTML = "<td colspan='7'><div class='oc-empty-state'>Todavía no hay partidas para revisar.</div></td>";
            tbody.appendChild(row);
            return;
        }

        state.editor.partidas.forEach(function (partida) {
            const tr = document.createElement("tr");
            tr.innerHTML = [
                "<td>" + escapeHtml(partida.tipoProductoServicioNombre || "") + "</td>",
                "<td>" + escapeHtml(partida.codigo || "") + "</td>",
                "<td><div class='oc-line-title'><strong>" + escapeHtml(partida.nombre || "") + "</strong><small>" + escapeHtml(partida.descripcion || "") + "</small></div></td>",
                "<td>" + escapeHtml(resolveUnidadDisplay(partida.unidadMedida, partida.unidadAbreviatura)) + "</td>",
                "<td>" + escapeHtml(formatDecimalInput(partida.cantidad)) + "</td>",
                "<td>" + formatCurrency(partida.costoUnitario) + "</td>",
                "<td>" + formatCurrency(partida.subtotal) + "</td>"
            ].join("");
            tbody.appendChild(tr);
        });
    }

    function renderProgress() {
        const progress = Math.max(25, Math.min(100, state.currentStep * 25));
        $("#txOcProgressMeta").text("Paso " + state.currentStep + " de 4");
        $("#txOcSidebarProgress").text(progress + "%");
        const bar = document.querySelector("#txOcProgressBar");
        if (bar) {
            bar.style.width = progress + "%";
        }
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
        const canMoveToStep2 = validateConfiguration(false).length === 0 && !state.editor.readOnly;
        const canMoveToStep3 = canAccessStep(3) && !state.editor.readOnly;
        const canMoveToStep4 = canAccessStep(4);

        $("#btOcPaso1Siguiente").prop("disabled", !canMoveToStep2).find("span").text("Continuar a productos y servicios");
        $("#btOcPaso2Siguiente").prop("disabled", !canMoveToStep3).find("span").text("Continuar a partidas");
        $("#btOcPaso3Siguiente").prop("disabled", !canMoveToStep4).find("span").text("Continuar a revisión");
        $("#btOcPaso3Buscar").prop("disabled", state.editor.readOnly);

        $("#btOcLimpiarBusquedaProductoServicio").prop("disabled", state.editor.readOnly || state.editor.searching);
        $("#txOcBusquedaSpinner").prop("hidden", !state.editor.searching);

        $("#btOcGuardar").prop("hidden", !isDraft)
            .prop("disabled", !canSave || state.currentStep !== 4)
            .find("span").text(state.editor.saving ? "Guardando..." : "Guardar orden");
        $("#btOcGenerar").prop("hidden", !(hasPersistedOrder && estado === estadoBorrador))
            .prop("disabled", !canGenerate || state.currentStep !== 4)
            .find("span").text(state.editor.generating ? "Generando..." : "Generar orden");
        $("#btOcCancelar").prop("hidden", !(hasPersistedOrder && (estado === estadoBorrador || estado === estadoGenerada)))
            .prop("disabled", !canCancel || state.currentStep !== 4)
            .find("span").text(state.editor.cancelling ? "Cancelando..." : "Cancelar orden");
        $("#panelOcExportaciones").prop("hidden", !canExport);
        $("#btOcExportarPdf").prop("disabled", state.editor.exportingPdf || state.editor.exportingExcel)
            .find("span").text(state.editor.exportingPdf ? "Exportando..." : "Exportar PDF");
        $("#btOcExportarExcel").prop("disabled", state.editor.exportingPdf || state.editor.exportingExcel)
            .find("span").text(state.editor.exportingExcel ? "Exportando..." : "Exportar Excel");

        if (hasPersistedOrder && estado === estadoBorrador && state.currentStep === 4 && total <= 0 && !state.editor.generating && !state.editor.saving && !state.editor.cancelling) {
            setStatus("#txOcFormStatus", "warning", "Ajusta cantidades o costos antes de generar la orden.");
        }
    }

    function canExportCurrentOrder() {
        const detail = state.editor.detail;
        return !!(state.detailId && detail && Number(detail.estado || 0) === estadoGenerada);
    }

    function resolveMaxUnlockedStep() {
        if (state.editor.readOnly) {
            return state.editor.partidas.length > 0 ? 4 : 2;
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
        return Number(step || 0) <= Number(state.editor.maxUnlockedStep || 1);
    }

    function updateHeaderSummary(folio, estadoNombre) {
        $("#txOcResumenSidebarFolio").text(folio);
        $("#txOcResumenSidebarEstado").text(estadoNombre);
    }

    function resolveUserFacingOrderState(estado, estadoNombre) {
        const normalized = String(estadoNombre || "").trim().toLowerCase();
        const numeric = Number(estado || 0);

        if (numeric === estadoBorrador || normalized === "borrador") {
            return "En captura";
        }

        if (numeric === estadoGenerada || normalized === "generada") {
            return "Confirmada";
        }

        if (numeric === estadoCancelada || normalized === "cancelada") {
            return "Detenida";
        }

        if (!normalized || normalized === "nueva") {
            return "En captura";
        }

        return "Lista";
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
        updateReportKpis(state.report.summary);
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
            if (this.id === "cbOcFiltroEstado") {
                syncKpiSelectionWithEstado(this.value);
            }

            if (this.id === "cbOcFiltroRazonSocial") {
                syncReportSucursales();
            }

            updateReportFilterSummary();
        });

        $("#ocKpiStrip").on("click", "[data-oc-kpi]", function () {
            const nextEstado = String($(this).attr("data-oc-kpi") || "").trim();
            state.report.selectedEstado = nextEstado;
            $("#cbOcFiltroEstado").val(nextEstado);
            syncKpiSelectionWithEstado(nextEstado);
            updateReportFilterSummary();
            runReportSearch();
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

                populateSelect("#cbOcFiltroEstado", [
                    { id: estadoBorrador, nombre: "En captura" },
                    { id: estadoGenerada, nombre: "Confirmada" },
                    { id: estadoCancelada, nombre: "Detenida" }
                ], {
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
                    "<div class='oc-mobile-card-row'><span>Fecha de orden</span><strong>" + escapeHtml(formatDateOnly(row.fechaOrden)) + "</strong></div>",
                    "<div class='oc-mobile-card-row'><span>Fecha de llegada</span><strong>" + escapeHtml(formatDateOnly(row.fechaLlegada)) + "</strong></div>",
                    "<div class='oc-mobile-card-row'><span>Total</span><strong>" + escapeHtml(formatCurrency(row.total)) + "</strong></div>",
                    "</div>",
                    "<div class='oc-mobile-card-actions'>",
                    "<button type='button' class='checkapp-btn checkapp-btn-secondary' data-oc-open-detail='" + escapeHtml(row.id || "") + "'>Ver detalle</button>",
                    "</div>"
                ].join("");
            },
            pageLength: 25,
            lengthMenu: [[25, 50, 100], [25, 50, 100]],
            order: [[6, "desc"], [9, "desc"]],
            emptyText: "Usa los filtros para consultar órdenes de compra.",
            loadData: function () {
                if (!state.report.hasSearched) {
                    state.report.rows = [];
                    state.report.summary = buildReportSummary([]);
                    updateReportKpis(state.report.summary);
                    return Promise.resolve([]);
                }

                const query = buildReportQuery();
                state.report.lastQuery = query.toString();
                return fetchJson("/Activos/OrdenesCompra/ObtenerOrdenesCompra?" + query.toString())
                    .then(function (rows) {
                        state.report.rows = Array.isArray(rows) ? rows : [];
                        state.report.summary = buildReportSummary(state.report.rows);
                        updateReportKpis(state.report.summary);
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
                        return "<div class='oc-grid-actions-cell'><button type='button' class='checkapp-btn checkapp-btn-secondary checkapp-btn-inline oc-grid-detail-btn' data-oc-open-detail='" + escapeHtml(row.id || "") + "'>Ver detalle</button></div>";
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
                state.report.summary = buildReportSummary([]);
                updateReportKpis(state.report.summary);
                setStatus("#txOcListadoStatus", "danger", resolveErrorMessage(error));
            },
            onDraw: function () {
                syncReportSummaryFromGrid();
            }
        }).then(function (grid) {
            state.report.grid = grid;
            syncKpiSelectionWithEstado($("#cbOcFiltroEstado").val());
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

    function updateReportKpis(summary) {
        $("#txOcKpiTotal").text(Number(summary.total || 0));
        $("#txOcKpiBorradores").text(Number(summary.borradores || 0));
        $("#txOcKpiGeneradas").text(Number(summary.generadas || 0));
        $("#txOcKpiCanceladas").text(Number(summary.canceladas || 0));
        $("#txOcKpiImporte").text(formatCurrency(summary.importe || 0));
    }

    function syncKpiSelectionWithEstado(estado) {
        const normalized = String(estado || "").trim();
        state.report.selectedEstado = normalized;
        $("#ocKpiStrip [data-oc-kpi]").removeClass("is-selected")
            .filter("[data-oc-kpi='" + normalized + "']")
            .addClass("is-selected");

        if (!normalized) {
            $("#ocKpiStrip [data-oc-kpi='']").addClass("is-selected");
        }
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
        syncKpiSelectionWithEstado("");
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

    function buildReportSummary(rows) {
        const normalizedRows = Array.isArray(rows) ? rows : [];
        return normalizedRows.reduce(function (summary, row) {
            const estado = Number(row.estado || 0);
            summary.total += 1;
            summary.importe = roundMoney(summary.importe + Number(row.total || 0));

            if (estado === estadoBorrador) {
                summary.borradores += 1;
            }
            else if (estado === estadoGenerada) {
                summary.generadas += 1;
            }
            else if (estado === estadoCancelada) {
                summary.canceladas += 1;
            }

            return summary;
        }, {
            total: 0,
            borradores: 0,
            generadas: 0,
            canceladas: 0,
            importe: 0
        });
    }

    function syncReportSummaryFromGrid() {
        if (!state.report.grid || !state.report.grid.instance) {
            return;
        }

        const filteredRows = state.report.grid.instance.rows({ search: "applied" }).indexes().toArray().map(function (index) {
            return state.report.rows[index];
        });

        state.report.summary = buildReportSummary(filteredRows);
        updateReportKpis(state.report.summary);
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
        $("#txOcDetalleObservaciones").text(detail.observaciones || "Sin observaciones");
        $("#txOcDetalleSubtotal").text(formatCurrency(detail.subtotal || 0));
        $("#txOcDetalleTotal").text(formatCurrency(detail.total || 0));
        $("#txOcDetallePartidasCount").text(partidas.length + " partida" + (partidas.length === 1 ? "" : "s"));
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
            row.innerHTML = "<td colspan='8'><div class='oc-empty-state'>La orden no tiene partidas disponibles.</div></td>";
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
                "<td><div class='oc-line-title'><strong>" + escapeHtml(partida.nombre || "—") + "</strong><small>" + escapeHtml(descripcion || "Sin descripción") + "</small></div></td>",
                "<td>" + escapeHtml(resolveUnidadDisplay(partida.unidadMedida, partida.unidadAbreviatura) || "—") + "</td>",
                "<td>" + escapeHtml(String(roundQuantity(partida.cantidad || 0))) + "</td>",
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

    function setInitialDateValidationWindow() {
        const fechaOrden = document.querySelector("#txOcFechaOrden");
        const fechaMinima = document.querySelector("#txOcFechaMinima");
        if (fechaOrden && fechaMinima && !fechaMinima.value) {
            fechaMinima.value = fechaOrden.value || formatInputDate(new Date());
        }
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

        if (state.editor.searchDebounceId) {
            window.clearTimeout(state.editor.searchDebounceId);
        }

        state.editor.searchDebounceId = window.setTimeout(function () {
            state.editor.searchDebounceId = 0;
            searchProductosServicios();
        }, 280);
    }

    function runImmediateSearch() {
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
        appendQuery(params, "limite", 50);
        return {
            params: params,
            key: params.toString(),
            forceable: !!String($("#txOcBuscarProductoServicio").val() || "").trim()
        };
    }

    function sortSearchResults(items) {
        const proveedorSeleccionado = normalizeGuid($("#cbOcProveedor").val());
        const normalized = Array.isArray(items) ? items.slice() : [];
        if (!proveedorSeleccionado) {
            return normalized;
        }

        return normalized.sort(function (left, right) {
            const leftScore = Number(left.costoActual || 0) > 0 ? 0 : 1;
            const rightScore = Number(right.costoActual || 0) > 0 ? 0 : 1;
            if (leftScore !== rightScore) {
                return leftScore - rightScore;
            }

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
        const raw = String(message || "").trim();
        if (!raw) {
            return "";
        }

        return raw
            .replace(/guardad[oa] como borrador/gi, "guardada para continuar")
            .replace(/en borrador/gi, "en captura")
            .replace(/\bborrador\b/gi, "captura")
            .replace(/\bgenerad[ao]s?\b/gi, "confirmadas")
            .replace(/\bcancelad[ao]s?\b/gi, "detenidas");
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
