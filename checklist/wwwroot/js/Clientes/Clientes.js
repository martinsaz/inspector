(function (window, document, $) {
    "use strict";

    if (!window.fetch || !$ || !window.CheckAppUI) {
        return;
    }

    const INDEX_STATE_KEY = "checkapp.clientes.indexState";
    const state = {
        pageMode: "index",
        searchExecuted: false,
        searchDebounceId: 0,
        gridSearchDebounceId: 0,
        selectedClientId: "",
        selectedClient: null,
        selectedTab: "datos",
        clientRequestNonce: 0,
        clientModalSaving: false,
        detailSaving: false,
        noteSaving: false,
        notesLoading: false,
        resultRows: [],
        visibleResultRows: [],
        pageSize: 25,
        currentPage: 1,
        advancedSearchExecuted: false,
        advancedSearching: false,
        advancedSaving: false,
        advancedLoading: false,
        advancedResults: [],
        advancedSelectedClientId: "",
        advancedSelectedClient: null,
        advancedCatalogsLoaded: false,
        advancedReturnUrl: "/Clientes/Index",
        advancedInitialClienteId: ""
    };

    document.addEventListener("DOMContentLoaded", function () {
        const pageNode = document.querySelector("[data-clientes-page]");
        state.pageMode = pageNode && pageNode.dataset && pageNode.dataset.clientesPage
            ? String(pageNode.dataset.clientesPage).toLowerCase()
            : "index";

        if (state.pageMode === "advanced") {
            bindAdvancedEvents();
            initAdvancedPage();
            return;
        }

        initClientesAccordion();
        bindClientesEvents();
        initClientesResults();
        updateFilterSummary();
        restoreIndexState();
    });

    function initClientesAccordion() {
        CheckAppUI.createFilterAccordion({
            id: "clientes-filtros",
            selector: "#accordionFiltrosClientes",
            open: true,
            emptySummaryText: "Sin filtros activos"
        });
    }

    function bindClientesEvents() {
        $("#btNuevoCliente").on("click", openCreateClientModal);
        $("#btBuscarClientes").on("click", function () {
            state.searchExecuted = true;
            updateFilterSummary();
            reloadClientesResults();
        });
        $("#btLimpiarClientes").on("click", clearClientesFilters);
        $("#cbFiltroTipoCliente").on("change", function () {
            state.searchExecuted = true;
            updateFilterSummary();
            reloadClientesResults();
        });
        $("#txBusquedaGridClientes").on("input", debounceGridSearch);
        $("#btGuardarClienteModal").on("click", saveCreateClient);
        $("#btGuardarClienteDetalle").on("click", saveDetailClient);
        $("#btNuevaNotaCliente").on("click", openNoteModal);
        $("#btCerrarFichaCliente").on("click", clearSelectedClient);
        $("#btDatosAvanzadosCliente").on("click", openAdvancedClient);
        $("#lkWhatsAppCliente, #lkCorreoCliente").on("click", function (event) {
            if ($(this).hasClass("is-disabled")) {
                event.preventDefault();
            }
        });
        $("#chkEsTareaCliente").on("change", toggleTaskFields);
        $("#btGuardarNotaCliente").on("click", saveClientNote);
        $("#cbDetalleTipoCliente").on("change", onDetailTypeChange);
        $(document).on("click", ".js-cliente-open", function (event) {
            event.preventDefault();
            const id = ($(this).data("id") || "").toString();
            if (id) {
                loadClient(id, true);
            }
        });
        $(document).on("change", ".js-cliente-task-toggle", function () {
            const id = ($(this).data("id") || "").toString();
            if (id) {
                toggleTaskCompleted(id, $(this).is(":checked"));
            }
        });
        $("input[name='rbTipoClienteModal']").on("change", onModalTypeChange);
        $("#modalCliente").on("hidden.bs.modal", resetClientModal);
        $("#modalNotaCliente").on("hidden.bs.modal", resetNoteModal);
        $("#frmClienteModal input").on("input change", function () {
            clearFieldError("#" + this.id, "#txInfoClienteModal");
        });
        $("#panelTabDatosCliente input, #panelTabDatosCliente select").on("input change", function () {
            clearFieldError("#" + this.id, "#txInfoClienteDetalle");
            updateFichaHeaderFromForm();
        });
        $("#frmNotaCliente input, #frmNotaCliente textarea").on("input change", function () {
            clearFieldError("#" + this.id, "#txInfoNotaCliente");
        });
        $(document).on("click", "[data-tab]", function () {
            activateTab(($(this).data("tab") || "").toString());
        });
        $("#txGridClientesPageSize").on("click", "[data-page-size]", function () {
            const nextSize = Number($(this).data("page-size") || state.pageSize);
            if (!nextSize || nextSize === state.pageSize) {
                return;
            }

            state.pageSize = nextSize;
            state.currentPage = 1;
            updatePageSizeChips();
            renderResultsList(state.visibleResultRows);
        });
        $("#btGridClientesPrev").on("click", function () {
            if (state.currentPage > 1) {
                state.currentPage -= 1;
                renderResultsList(state.visibleResultRows);
            }
        });
        $("#btGridClientesNext").on("click", function () {
            const totalPages = getTotalPages(state.visibleResultRows.length);
            if (state.currentPage < totalPages) {
                state.currentPage += 1;
                renderResultsList(state.visibleResultRows);
            }
        });
    }

    function bindAdvancedEvents() {
        $("#btVolverClientesAvanzados").on("click", navigateBackFromAdvanced);
        $("#btBuscarClientesAvanzados").on("click", searchAdvancedClients);
        $("#btLimpiarClientesAvanzados").on("click", clearAdvancedSearch);
        $("#btGuardarClienteAvanzado").on("click", saveAdvancedClient);
        $("#txBusquedaClientesAvanzados").on("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                searchAdvancedClients();
            }
        });
        $(document).on("click", ".js-cliente-avanzado-open", function (event) {
            event.preventDefault();
            const id = ($(this).data("id") || "").toString();
            if (id) {
                loadAdvancedClient(id);
            }
        });
    }

    function initClientesResults() {
        updatePageSizeChips();
        renderResultsList([]);
    }

    function debounceGridSearch() {
        window.clearTimeout(state.gridSearchDebounceId);
        state.gridSearchDebounceId = window.setTimeout(function () {
            state.currentPage = 1;
            applyResultsSearch();
        }, 180);
    }

    function reloadClientesResults() {
        if (!state.searchExecuted) {
            state.resultRows = [];
            state.visibleResultRows = [];
            state.currentPage = 1;
            clearSelectedClient();
            updateSummaryCards(null);
            $("#txGridClientesVisibleCount").text("0 visibles");
            $("#txGridClientesCount").text("0 registros");
            renderResultsList([]);
            return Promise.resolve([]);
        }

        clearSelectedClient();
        updateSummaryCards(null);

        const query = new URLSearchParams({
            busqueda: ($("#txBusquedaClientes").val() || "").toString().trim(),
            tipoCliente: ($("#cbFiltroTipoCliente").val() || "").toString()
        });

        return apiRequest("/Clientes/ObtenerClientes?" + query.toString(), { method: "GET" })
            .then(function (response) {
                const payload = normalizeListadoResponse(response.data);
                state.resultRows = normalizeResultRows(payload.items);
                state.currentPage = 1;
                applyResultsSearch();
                return state.resultRows;
            })
            .catch(function (error) {
                state.resultRows = [];
                state.visibleResultRows = [];
                updateSummaryCards(null);
                $("#txGridClientesVisibleCount").text("0 visibles");
                $("#txGridClientesCount").text("0 registros");
                renderResultsList([]);
                throw error;
            });
    }

    function clearClientesFilters() {
        $("#txBusquedaClientes").val("");
        $("#cbFiltroTipoCliente").val("");
        $("#txBusquedaGridClientes").val("");
        state.searchExecuted = false;
        state.resultRows = [];
        state.visibleResultRows = [];
        state.currentPage = 1;
        clearSelectedClient();
        updateFilterSummary();
        updateSummaryCards(null);
        $("#txGridClientesVisibleCount").text("0 visibles");
        $("#txGridClientesCount").text("0 registros");
        renderResultsList([]);
    }

    function updateFilterSummary() {
        const parts = [];
        const busqueda = ($("#txBusquedaClientes").val() || "").toString().trim();
        const tipoText = $("#cbFiltroTipoCliente option:selected").text();
        const tipoValue = ($("#cbFiltroTipoCliente").val() || "").toString();

        if (busqueda) {
            parts.push("Búsqueda: " + busqueda);
        }

        if (tipoValue) {
            parts.push("Clasificación: " + tipoText);
        }

        $("#txResumenFiltrosClientes").text(parts.length ? parts.join(" · ") : "Sin filtros activos");
    }

    function updateSummaryCards(resumen) {
        const safe = resumen || {
            total: 0,
            particulares: 0,
            empresas: 0,
            conTelefono: 0,
            conCorreo: 0
        };

        $("#txResumenClientesTotal").text(safe.total || 0);
        $("#txResumenClientesParticulares").text(safe.particulares || 0);
        $("#txResumenClientesEmpresas").text(safe.empresas || 0);
        $("#txResumenClientesTelefono").text(safe.conTelefono || 0);
        $("#txResumenClientesCorreo").text(safe.conCorreo || 0);
    }

    function openCreateClientModal() {
        resetClientModal();
        $("#modalCliente").modal("show");
    }

    function resetClientModal() {
        state.clientModalSaving = false;
        $("#frmClienteModal")[0].reset();
        $("input[name='rbTipoClienteModal'][value='1']").prop("checked", true);
        toggleCompanyField("#fieldEmpresaClienteModal", "#txEmpresaClienteModal", false);
        renderStatus("#txInfoClienteModal", "", "");
        clearAllFieldErrors("#frmClienteModal");
        setButtonBusy("#btGuardarClienteModal", false, "Guardar cliente");
    }

    function onModalTypeChange() {
        const tipo = getModalType();
        const companyValue = ($("#txEmpresaClienteModal").val() || "").toString().trim();
        if (tipo === 1 && companyValue) {
            askToClearCompanyField(function () {
                toggleCompanyField("#fieldEmpresaClienteModal", "#txEmpresaClienteModal", false);
            }, function () {
                $("input[name='rbTipoClienteModal'][value='2']").prop("checked", true);
            });
            return;
        }

        toggleCompanyField("#fieldEmpresaClienteModal", "#txEmpresaClienteModal", tipo === 2);
    }

    function onDetailTypeChange() {
        const tipo = Number($("#cbDetalleTipoCliente").val() || 1);
        const companyValue = ($("#txDetalleEmpresaCliente").val() || "").toString().trim();
        if (tipo === 1 && companyValue) {
            askToClearCompanyField(function () {
                toggleCompanyField("#fieldDetalleEmpresaCliente", "#txDetalleEmpresaCliente", false);
                updateFichaHeaderFromForm();
            }, function () {
                $("#cbDetalleTipoCliente").val("2");
            });
            return;
        }

        toggleCompanyField("#fieldDetalleEmpresaCliente", "#txDetalleEmpresaCliente", tipo === 2);
        updateFichaHeaderFromForm();
    }

    function askToClearCompanyField(onConfirm, onCancel) {
        if (window.Swal && typeof window.Swal.fire === "function") {
            window.Swal.fire({
                icon: "warning",
                title: "Cambiar a Particular",
                text: "Al cambiar a Particular ya no se conservará el campo Empresa. ¿Deseas continuar?",
                showCancelButton: true,
                confirmButtonText: "Continuar",
                cancelButtonText: "Cancelar"
            }).then(function (result) {
                if (result.isConfirmed) {
                    onConfirm();
                } else if (typeof onCancel === "function") {
                    onCancel();
                }
            });
            return;
        }

        if (window.confirm("Al cambiar a Particular ya no se conservará el campo Empresa. ¿Deseas continuar?")) {
            onConfirm();
        } else if (typeof onCancel === "function") {
            onCancel();
        }
    }

    function saveCreateClient() {
        if (state.clientModalSaving) {
            return;
        }

        const payload = collectClientModalPayload();
        if (!validateClientPayload(payload, "#txInfoClienteModal", true)) {
            return;
        }

        validateDuplicatesAndPersist(payload, true);
    }

    function saveDetailClient() {
        if (!state.selectedClientId || state.detailSaving) {
            return;
        }

        const payload = collectClientDetailPayload();
        if (!validateClientPayload(payload, "#txInfoClienteDetalle", false)) {
            return;
        }

        validateDuplicatesAndPersist(payload, false);
    }

    function validateDuplicatesAndPersist(payload, fromModal) {
        setClientSavingState(fromModal, true);
        apiRequest("/Clientes/ValidarDuplicadosCliente", {
            method: "POST",
            body: JSON.stringify({
                idCliente: payload.id || null,
                nombre: payload.nombre,
                telefono: payload.telefono,
                correo: payload.correo,
                empresa: payload.empresa
            })
        }).then(function (response) {
            const data = normalizeOperacionResponse(response.data);
            if (data.hayCoincidencias && Array.isArray(data.coincidencias) && data.coincidencias.length) {
                setClientSavingState(fromModal, false);
                confirmDuplicateSave(payload, fromModal, data.coincidencias);
                return;
            }

            persistClient(payload, fromModal);
        }).catch(function (error) {
            setClientSavingState(fromModal, false);
            handleApiError(error, fromModal ? "#txInfoClienteModal" : "#txInfoClienteDetalle", "No fue posible validar coincidencias.");
        });
    }

    function confirmDuplicateSave(payload, fromModal, coincidencias) {
        const message = buildDuplicateHtml(coincidencias);
        if (window.Swal && typeof window.Swal.fire === "function") {
            window.Swal.fire({
                icon: "warning",
                title: "Posibles coincidencias",
                html: message,
                showCancelButton: true,
                confirmButtonText: "Continuar y guardar",
                cancelButtonText: "Cancelar"
            }).then(function (result) {
                if (result.isConfirmed) {
                    payload.omitirAdvertenciaDuplicados = true;
                    persistClient(payload, fromModal);
                }
            });
            return;
        }

        if (window.confirm("Encontramos clientes que podrían coincidir con este registro. ¿Deseas continuar y guardar?")) {
            payload.omitirAdvertenciaDuplicados = true;
            persistClient(payload, fromModal);
        }
    }

    function persistClient(payload, fromModal) {
        setClientSavingState(fromModal, true);
        apiRequest("/Clientes/GuardarCliente", {
            method: "POST",
            body: JSON.stringify(payload)
        }).then(function (response) {
            const data = normalizeOperacionResponse(response.data);
            renderStatus(fromModal ? "#txInfoClienteModal" : "#txInfoClienteDetalle", "success", data.mensaje || "El cliente fue guardado.");
            if (fromModal) {
                $("#modalCliente").modal("hide");
            }

            if (fromModal && data.idCliente) {
                return syncCreatedClientContext(payload, data.idCliente);
            }

            state.searchExecuted = true;
            return reloadClientesResults().then(function () {
                if (data.idCliente) {
                    return loadClient(data.idCliente, false);
                }
                return null;
            });
        }).catch(function (error) {
            if (error && error.status === 409 && error.data && error.data.requiereConfirmacionDuplicados) {
                setClientSavingState(fromModal, false);
                confirmDuplicateSave(Object.assign({}, payload, { omitirAdvertenciaDuplicados: true }), fromModal, error.data.coincidencias || []);
                return;
            }

            handleApiError(error, fromModal ? "#txInfoClienteModal" : "#txInfoClienteDetalle", "No fue posible guardar el cliente.");
        }).finally(function () {
            setClientSavingState(fromModal, false);
        });
    }

    function loadClient(id, scrollIntoView) {
        const requestNonce = ++state.clientRequestNonce;
        renderStatus("#txInfoClienteDetalle", "info", "Cargando ficha...");
        return apiRequest("/Clientes/ObtenerCliente?idCliente=" + encodeURIComponent(id), { method: "GET" })
            .then(function (response) {
                if (requestNonce !== state.clientRequestNonce) {
                    return null;
                }

                state.selectedClient = normalizeCliente(response.data);
                state.selectedClientId = state.selectedClient && state.selectedClient.id ? state.selectedClient.id : "";
                fillClientDetail(state.selectedClient);
                $("#panelClienteFicha").prop("hidden", false);
                renderResultsList(state.visibleResultRows);
                activateTab(state.selectedTab || "datos");
                renderStatus("#txInfoClienteDetalle", "", "");
                if (scrollIntoView) {
                    document.getElementById("panelClienteFicha").scrollIntoView({ behavior: "smooth", block: "start" });
                }
                return loadClientNotes();
            })
            .catch(function (error) {
                handleApiError(error, "#txInfoClienteDetalle", "No fue posible cargar la ficha del cliente.");
            });
    }

    function syncCreatedClientContext(payload, clientId) {
        const seedQuery = (payload.nombre || payload.telefono || payload.correo || "").toString().trim();
        $("#txBusquedaClientes").val(seedQuery);
        $("#cbFiltroTipoCliente").val(String(payload.tipoCliente || ""));
        $("#txBusquedaGridClientes").val("");
        state.searchExecuted = true;
        updateFilterSummary();

        return reloadClientesResults().then(function (rows) {
            const found = (Array.isArray(rows) ? rows : []).some(function (row) {
                return String(row && row.id || "") === String(clientId || "");
            });

            if (found) {
                return loadClient(clientId, false);
            }

            return loadClient(clientId, false).then(function () {
                if (!state.selectedClient) {
                    return null;
                }

                state.resultRows = [createSyntheticResultRow(state.selectedClient)];
                state.currentPage = 1;
                applyResultsSearch();
                return null;
            });
        });
    }

    function fillClientDetail(cliente) {
        if (!cliente) {
            return;
        }

        $("#cbDetalleTipoCliente").val(String(cliente.tipoCliente || 1));
        $("#txDetalleNombreCliente").val(cliente.nombre || "");
        $("#txDetalleTelefonoCliente").val(cliente.telefono || "");
        $("#txDetalleCorreoCliente").val(cliente.correo || "");
        $("#txDetalleEmpresaCliente").val(cliente.empresa || "");
        toggleCompanyField("#fieldDetalleEmpresaCliente", "#txDetalleEmpresaCliente", Number(cliente.tipoCliente || 1) === 2);
        updateFichaHeaderFromForm();
        clearAllFieldErrors("#panelTabDatosCliente");
    }

    function updateFichaHeaderFromForm() {
        const current = collectClientDetailPayload();
        $("#txClienteFichaNombre").text(current.nombre || "Cliente");
        $("#txClienteFichaResumen").text(buildClientSummary({
            tipoCliente: current.tipoCliente,
            telefono: current.telefono,
            correo: current.correo,
            empresa: current.empresa
        }));
        $("#txClienteFichaTipo").text(current.tipoCliente === 2 ? "Empresa" : "Particular");
        updateClientActionLinks();
    }

    function activateTab(tab) {
        state.selectedTab = tab === "notas" ? "notas" : "datos";
        $(".clientes-tab").removeClass("is-active");
        $(".clientes-tab-panel").prop("hidden", true);
        $("[data-tab='" + tab + "']").addClass("is-active");
        if (tab === "notas") {
            $("#panelTabNotasCliente").prop("hidden", false);
            if (state.selectedClientId) {
                loadClientNotes();
            }
            return;
        }

        $("#panelTabDatosCliente").prop("hidden", false);
    }

    function loadClientNotes() {
        if (!state.selectedClientId || state.notesLoading) {
            return Promise.resolve();
        }

        state.notesLoading = true;
        renderStatus("#txInfoNotasCliente", "info", "Cargando notas...");
        return apiRequest("/Clientes/ObtenerNotasCliente?idCliente=" + encodeURIComponent(state.selectedClientId), { method: "GET" })
            .then(function (response) {
                renderNotes(normalizeNotas(response.data));
                renderStatus("#txInfoNotasCliente", "", "");
            })
            .catch(function (error) {
                renderStatus("#txInfoNotasCliente", "error", resolveFriendlyMessage(error, "No fue posible cargar las notas del cliente."));
            })
            .finally(function () {
                state.notesLoading = false;
            });
    }

    function renderNotes(notas) {
        const host = document.getElementById("clientesNotasList");
        if (!host) {
            return;
        }

        const rows = Array.isArray(notas) ? notas : [];
        $("#txClienteNotasCountBadge").text(String(rows.length));
        if (!rows.length) {
            host.innerHTML = "<div class='clientes-notes-empty'>Aún no hay notas registradas para este cliente.</div>";
            return;
        }

        host.innerHTML = rows.map(function (nota) {
            const isTask = !!nota.esTarea;
            const isCompleted = !!nota.completada;
            const taskMeta = isTask
                ? "<div class='clientes-note-meta'><span>Programada: " + escapeHtml(formatDateOnly(nota.fechaTarea)) + "</span><span>Hora: " + escapeHtml(formatTimeOnly(nota.horaTarea || "")) + "</span>" +
                    (isCompleted ? "<span>Completada: " + escapeHtml(formatDateTime(nota.fechaCompletada)) + "</span>" : "<span>Seguimiento pendiente</span>") +
                  "</div>"
                : "";
            const taskToggle = isTask
                ? "<label class='checkapp-btn " + (isCompleted ? "checkapp-btn-secondary" : "checkapp-btn-ghost") + " clientes-task-toggle" + (isCompleted ? " is-completed" : "") + "'><input type='checkbox' class='js-cliente-task-toggle' data-id='" + escapeHtml(nota.id) + "'" + (isCompleted ? " checked" : "") + " /><i class='fa " + (isCompleted ? "fa-check-circle" : "fa-check-square-o") + "' aria-hidden='true'></i><span>" + (isCompleted ? "Completada" : "Marcar como completada") + "</span></label>"
                : "";
            const statusLabel = isTask ? (isCompleted ? "Completada" : "Pendiente") : "Registro";
            const marker = isTask ? (isCompleted ? "<i class='fa fa-check'></i>" : "<i class='fa fa-clock-o'></i>") : "<i class='fa fa-comment'></i>";

            return "<article class='clientes-note-item" + (isTask ? " is-task" : "") + (isCompleted ? " is-completed" : "") + "'>" +
                "<div class='clientes-note-rail'>" +
                    "<span class='clientes-note-marker'>" + marker + "</span>" +
                    "<span class='clientes-note-stem' aria-hidden='true'></span>" +
                "</div>" +
                "<div class='clientes-note-content'>" +
                    "<div class='clientes-note-top'>" +
                        "<div class='clientes-note-badges'>" +
                            "<span class='clientes-note-kind'>" + (isTask ? "Tarea" : "Nota") + "</span>" +
                            "<span class='clientes-note-status'>" + statusLabel + "</span>" +
                        "</div>" +
                        "<span class='clientes-note-date'>" + escapeHtml(formatDateTime(nota.fechaCreacion)) + "</span>" +
                    "</div>" +
                    "<div class='clientes-note-body'>" + escapeHtml(nota.texto || "") + "</div>" +
                    taskMeta +
                    (taskToggle ? "<div class='clientes-note-actions'>" + taskToggle + "</div>" : "") +
                "</div>" +
            "</article>";
        }).join("");
    }

    function openNoteModal() {
        if (!state.selectedClientId) {
            renderStatus("#txInfoNotasCliente", "error", "Selecciona un cliente antes de registrar una nota.");
            return;
        }

        resetNoteModal();
        $("#txNotaClienteContexto").text((state.selectedClient && state.selectedClient.nombre) ? "Cliente seleccionado: " + state.selectedClient.nombre : "Cliente seleccionado");
        $("#modalNotaCliente").modal("show");
    }

    function resetNoteModal() {
        state.noteSaving = false;
        $("#frmNotaCliente")[0].reset();
        $("#panelCamposTareaCliente").prop("hidden", true);
        renderStatus("#txInfoNotaCliente", "", "");
        $("#txNotaClienteContexto").text("Cliente seleccionado");
        clearAllFieldErrors("#frmNotaCliente");
        setButtonBusy("#btGuardarNotaCliente", false, "Guardar nota");
    }

    function toggleTaskFields() {
        const visible = $("#chkEsTareaCliente").is(":checked");
        $("#panelCamposTareaCliente").prop("hidden", !visible);
    }

    function saveClientNote() {
        if (!state.selectedClientId || state.noteSaving) {
            return;
        }

        const payload = {
            idCliente: state.selectedClientId,
            texto: ($("#txTextoNotaCliente").val() || "").toString().trim(),
            esTarea: $("#chkEsTareaCliente").is(":checked"),
            fechaTarea: ($("#txFechaTareaCliente").val() || "").toString(),
            horaTarea: ($("#txHoraTareaCliente").val() || "").toString()
        };

        if (!validateNotePayload(payload)) {
            return;
        }

        state.noteSaving = true;
        setButtonBusy("#btGuardarNotaCliente", true, "Guardando...");
        apiRequest("/Clientes/GuardarNotaCliente", {
            method: "POST",
            body: JSON.stringify(payload)
        }).then(function (response) {
            const data = normalizeOperacionResponse(response.data);
            renderStatus("#txInfoNotasCliente", "success", data.mensaje || "La nota fue guardada.");
            $("#modalNotaCliente").modal("hide");
            return loadClientNotes();
        }).catch(function (error) {
            handleApiError(error, "#txInfoNotaCliente", "No fue posible guardar la nota del cliente.");
        }).finally(function () {
            state.noteSaving = false;
            setButtonBusy("#btGuardarNotaCliente", false, "Guardar nota");
        });
    }

    function toggleTaskCompleted(id, completed) {
        apiRequest("/Clientes/CompletarTareaCliente", {
            method: "POST",
            body: JSON.stringify({
                idNota: id,
                completada: completed
            })
        }).then(function (response) {
            const data = normalizeOperacionResponse(response.data);
            renderStatus("#txInfoNotasCliente", "success", data.mensaje || "La tarea fue actualizada.");
            return loadClientNotes();
        }).catch(function (error) {
            handleApiError(error, "#txInfoNotasCliente", "No fue posible actualizar la tarea.");
            loadClientNotes();
        });
    }

    function collectClientModalPayload() {
        return {
            id: null,
            tipoCliente: getModalType(),
            nombre: ($("#txNombreClienteModal").val() || "").toString().trim(),
            telefono: ($("#txTelefonoClienteModal").val() || "").toString().trim(),
            correo: ($("#txCorreoClienteModal").val() || "").toString().trim(),
            empresa: ($("#txEmpresaClienteModal").val() || "").toString().trim(),
            omitirAdvertenciaDuplicados: false
        };
    }

    function collectClientDetailPayload() {
        return {
            id: state.selectedClientId || null,
            tipoCliente: Number($("#cbDetalleTipoCliente").val() || 1),
            nombre: ($("#txDetalleNombreCliente").val() || "").toString().trim(),
            telefono: ($("#txDetalleTelefonoCliente").val() || "").toString().trim(),
            correo: ($("#txDetalleCorreoCliente").val() || "").toString().trim(),
            empresa: ($("#txDetalleEmpresaCliente").val() || "").toString().trim(),
            omitirAdvertenciaDuplicados: false
        };
    }

    function validateClientPayload(payload, statusSelector, isModal) {
        clearAllFieldErrors(isModal ? "#frmClienteModal" : "#panelTabDatosCliente");
        renderStatus(statusSelector, "", "");

        if (!payload.nombre) {
            renderStatus(statusSelector, "error", "Captura el nombre del cliente.");
            markFieldError(isModal ? "#txNombreClienteModal" : "#txDetalleNombreCliente");
            return false;
        }

        if (!payload.telefono && !payload.correo) {
            renderStatus(statusSelector, "error", "Captura al menos un teléfono o un correo.");
            markFieldError(isModal ? "#txTelefonoClienteModal" : "#txDetalleTelefonoCliente");
            markFieldError(isModal ? "#txCorreoClienteModal" : "#txDetalleCorreoCliente");
            return false;
        }

        if (payload.correo && !isValidEmail(payload.correo)) {
            renderStatus(statusSelector, "error", "Captura un correo con formato válido.");
            markFieldError(isModal ? "#txCorreoClienteModal" : "#txDetalleCorreoCliente");
            return false;
        }

        if (payload.tipoCliente === 2 && !payload.empresa) {
            renderStatus(statusSelector, "error", "Captura la empresa del cliente.");
            markFieldError(isModal ? "#txEmpresaClienteModal" : "#txDetalleEmpresaCliente");
            return false;
        }

        return true;
    }

    function validateNotePayload(payload) {
        clearAllFieldErrors("#frmNotaCliente");
        renderStatus("#txInfoNotaCliente", "", "");

        if (!payload.texto) {
            renderStatus("#txInfoNotaCliente", "error", "Captura el texto de la nota.");
            markFieldError("#txTextoNotaCliente");
            return false;
        }

        if (payload.esTarea && !payload.fechaTarea) {
            renderStatus("#txInfoNotaCliente", "error", "Captura la fecha de la tarea.");
            markFieldError("#txFechaTareaCliente");
            return false;
        }

        if (payload.esTarea && !payload.horaTarea) {
            renderStatus("#txInfoNotaCliente", "error", "Captura la hora de la tarea.");
            markFieldError("#txHoraTareaCliente");
            return false;
        }

        return true;
    }

    function setClientSavingState(fromModal, busy) {
        if (fromModal) {
            state.clientModalSaving = busy;
            setButtonBusy("#btGuardarClienteModal", busy, busy ? "Guardando..." : "Guardar cliente");
            return;
        }

        state.detailSaving = busy;
        setButtonBusy("#btGuardarClienteDetalle", busy, busy ? "Guardando..." : "Guardar cliente");
    }

    function setButtonBusy(selector, busy, label) {
        const button = document.querySelector(selector);
        if (!button) {
            return;
        }

        button.disabled = !!busy;
        const span = button.querySelector("span");
        if (span && label) {
            span.textContent = label;
        }
    }

    function toggleCompanyField(wrapperSelector, inputSelector, visible) {
        $(wrapperSelector).prop("hidden", !visible);
        if (!visible) {
            $(inputSelector).val("");
            clearFieldError(inputSelector);
        }
    }

    function getModalType() {
        return Number($("input[name='rbTipoClienteModal']:checked").val() || 1);
    }

    function buildClientSummary(cliente) {
        const parts = [];
        if (cliente.telefono) {
            parts.push("Teléfono " + cliente.telefono);
        }
        if (cliente.correo) {
            parts.push("Correo " + cliente.correo);
        }
        if (Number(cliente.tipoCliente || 1) === 2 && cliente.empresa) {
            parts.push("Empresa " + cliente.empresa);
        }
        return parts.length ? parts.join(" · ") : "Sin datos complementarios.";
    }

    function computeResumen(rows) {
        const list = Array.isArray(rows) ? rows : [];
        return {
            total: list.length,
            particulares: list.filter(function (item) {
                return Number(item && item.tipoCliente || 1) === 1;
            }).length,
            empresas: list.filter(function (item) {
                return Number(item && item.tipoCliente || 1) === 2;
            }).length,
            conTelefono: list.filter(function (item) {
                return !!String(item && item.telefono || "").trim();
            }).length,
            conCorreo: list.filter(function (item) {
                return !!String(item && item.correo || "").trim();
            }).length
        };
    }

    function normalizePhoneDigits(value) {
        return String(value || "").replace(/\D+/g, "");
    }

    function buildWhatsAppHref(phone) {
        const digits = normalizePhoneDigits(phone);
        return digits.length >= 10 ? "https://wa.me/" + digits : "";
    }

    function buildMailToHref(email) {
        const value = String(email || "").trim();
        return isValidEmail(value) ? "mailto:" + value : "";
    }

    function setActionLinkState(selector, href) {
        const node = document.querySelector(selector);
        if (!node) {
            return;
        }

        const enabled = !!href;
        node.setAttribute("href", enabled ? href : "#");
        node.classList.toggle("is-disabled", !enabled);
        node.setAttribute("aria-disabled", enabled ? "false" : "true");
        node.setAttribute("tabindex", enabled ? "0" : "-1");
    }

    function updateClientActionLinks() {
        const whatsappHref = buildWhatsAppHref($("#txDetalleTelefonoCliente").val());
        const mailHref = buildMailToHref($("#txDetalleCorreoCliente").val());
        setActionLinkState("#lkWhatsAppCliente", whatsappHref);
        setActionLinkState("#lkCorreoCliente", mailHref);
    }

    function persistIndexState() {
        if (!window.sessionStorage) {
            return;
        }

        const snapshot = {
            searchExecuted: !!state.searchExecuted,
            busqueda: ($("#txBusquedaClientes").val() || "").toString(),
            tipoCliente: ($("#cbFiltroTipoCliente").val() || "").toString(),
            gridBusqueda: ($("#txBusquedaGridClientes").val() || "").toString(),
            selectedClientId: state.selectedClientId || "",
            selectedTab: state.selectedTab || "datos"
        };

        window.sessionStorage.setItem(INDEX_STATE_KEY, JSON.stringify(snapshot));
    }

    function restoreIndexState() {
        clearSelectedClient();

        if (!window.sessionStorage) {
            return;
        }

        const raw = window.sessionStorage.getItem(INDEX_STATE_KEY);
        if (!raw) {
            updateClientActionLinks();
            return;
        }

        window.sessionStorage.removeItem(INDEX_STATE_KEY);

        let snapshot = null;
        try {
            snapshot = JSON.parse(raw);
        } catch (_error) {
            snapshot = null;
        }

        if (!snapshot || !snapshot.searchExecuted) {
            updateClientActionLinks();
            return;
        }

        $("#txBusquedaClientes").val(snapshot.busqueda || "");
        $("#cbFiltroTipoCliente").val(snapshot.tipoCliente || "");
        $("#txBusquedaGridClientes").val(snapshot.gridBusqueda || "");
        state.selectedTab = snapshot.selectedTab === "notas" ? "notas" : "datos";
        state.searchExecuted = true;
        updateFilterSummary();

        reloadClientesResults().then(function (rows) {
            const restoredId = (snapshot.selectedClientId || "").toString();
            const existsInResults = Array.isArray(rows) && rows.some(function (item) {
                return String(item && item.id || "") === restoredId;
            });

            if (restoredId && existsInResults) {
                return loadClient(snapshot.selectedClientId, false);
            }
            return null;
        }).catch(function (_error) {
            updateClientActionLinks();
        });
    }

    function openAdvancedClient() {
        if (!state.selectedClientId) {
            renderStatus("#txInfoClienteDetalle", "error", "Selecciona un cliente antes de abrir datos avanzados.");
            return;
        }

        persistIndexState();
        const target = "/Clientes/EdicionAvanzada?idCliente=" + encodeURIComponent(state.selectedClientId) +
            "&returnUrl=" + encodeURIComponent("/Clientes/Index");
        window.location.href = target;
    }

    function initAdvancedPage() {
        const context = document.getElementById("clientesAdvancedContext");
        state.advancedInitialClienteId = context && context.dataset ? (context.dataset.clienteId || "") : "";
        state.advancedReturnUrl = context && context.dataset && context.dataset.returnUrl
            ? context.dataset.returnUrl
            : "/Clientes/Index";

        loadAdvancedCatalogs().then(function () {
            if (state.advancedInitialClienteId) {
                return loadAdvancedClient(state.advancedInitialClienteId);
            }
            return null;
        }).catch(function (error) {
            renderStatus("#txInfoClienteAvanzado", "error", resolveFriendlyMessage(error, "No fue posible cargar los catálogos de edición avanzada."));
        });
    }

    function navigateBackFromAdvanced() {
        window.location.href = state.advancedReturnUrl || "/Clientes/Index";
    }

    function loadAdvancedCatalogs() {
        if (state.advancedCatalogsLoaded) {
            return Promise.resolve();
        }

        return Promise.all([
            apiRequest("/Clientes/ObtenerListasPrecioCliente", { method: "GET" }),
            apiRequest("/Clientes/ObtenerRegimenesFiscalesCliente", { method: "GET" })
        ]).then(function (responses) {
            renderAdvancedCatalogOptions("#cbAvanzadoListaPrecio", normalizeCatalogItems(responses[0].data), true);
            renderAdvancedCatalogOptions("#cbAvanzadoRegimenFiscal", normalizeCatalogItems(responses[1].data), false);
            state.advancedCatalogsLoaded = true;
        });
    }

    function searchAdvancedClients() {
        const queryValue = ($("#txBusquedaClientesAvanzados").val() || "").toString().trim();
        if (!queryValue) {
            renderStatus("#txInfoClientesAvanzadosBusqueda", "error", "Captura nombre, correo o teléfono para buscar.");
            return;
        }

        renderStatus("#txInfoClientesAvanzadosBusqueda", "", "");
        state.advancedSearchExecuted = false;
        state.advancedSearching = true;
        $("#txEstadoClientesAvanzados").text("Buscando clientes...");

        const query = new URLSearchParams({ busqueda: queryValue });
        apiRequest("/Clientes/ObtenerClientes?" + query.toString(), { method: "GET" })
            .then(function (response) {
                const payload = normalizeListadoResponse(response.data);
                state.advancedResults = normalizeResultRows(payload.items);
                state.advancedSearchExecuted = true;
                renderAdvancedResults();
                $("#txEstadoClientesAvanzados").text(state.advancedResults.length
                    ? ("Resultados encontrados: " + state.advancedResults.length + ". Selecciona un cliente.")
                    : "No se encontraron clientes con ese criterio.");
            })
            .catch(function (error) {
                state.advancedResults = [];
                state.advancedSearchExecuted = false;
                renderAdvancedResults();
                renderStatus("#txInfoClientesAvanzadosBusqueda", "error", resolveFriendlyMessage(error, "No se pudo completar la búsqueda avanzada."));
                $("#txEstadoClientesAvanzados").text("No se pudo completar la búsqueda avanzada.");
            })
            .finally(function () {
                state.advancedSearching = false;
            });
    }

    function clearAdvancedSearch() {
        $("#txBusquedaClientesAvanzados").val("");
        state.advancedSearchExecuted = false;
        state.advancedResults = [];
        clearAdvancedSelection();
        renderStatus("#txInfoClientesAvanzadosBusqueda", "", "");
        $("#txEstadoClientesAvanzados").text("Busca un cliente existente para editar crédito, descuento y lista por cliente.");
        renderAdvancedResults();
    }

    function renderAdvancedResults() {
        const host = document.getElementById("clientesAdvancedResults");
        if (!host) {
            return;
        }

        const rows = Array.isArray(state.advancedResults) ? state.advancedResults : [];
        if (!state.advancedSearchExecuted) {
            if (state.advancedSelectedClientId) {
                host.hidden = true;
                host.innerHTML = "";
                return;
            }

            host.hidden = false;
            host.innerHTML = "<div class='clientes-advanced-empty'>Aún no hay resultados para edición avanzada.</div>";
            return;
        }

        host.hidden = false;
        if (!rows.length) {
            host.innerHTML = "<div class='clientes-advanced-empty'>No se encontraron clientes con ese criterio.</div>";
            return;
        }

        host.innerHTML = rows.map(function (row) {
            const selected = String(row.id || "") === String(state.advancedSelectedClientId || "");
            const phone = row.telefono ? escapeHtml(row.telefono) : "<span class='clientes-results-muted'>Sin teléfono</span>";
            const email = row.correo ? escapeHtml(row.correo) : "<span class='clientes-results-muted'>Sin correo</span>";
            return "<article class='clientes-advanced-result" + (selected ? " is-selected" : "") + "'>" +
                "<div class='clientes-advanced-result-copy'>" +
                    "<strong>" + escapeHtml(row.nombre || "Cliente") + "</strong>" +
                    "<span>" + phone + " · " + email + "</span>" +
                "</div>" +
                "<button type='button' class='checkapp-btn checkapp-btn-secondary clientes-grid-action js-cliente-avanzado-open' data-id='" + escapeHtml(row.id) + "'>" +
                    "<i class='fa fa-eye'></i><span>Cargar cliente</span>" +
                "</button>" +
            "</article>";
        }).join("");
    }

    function loadAdvancedClient(id) {
        renderStatus("#txInfoClienteAvanzado", "info", "Cargando cliente...");
        state.advancedLoading = true;
        return apiRequest("/Clientes/ObtenerClienteAvanzado?idCliente=" + encodeURIComponent(id), { method: "GET" })
            .then(function (response) {
                state.advancedSelectedClient = normalizeAdvancedClient(response.data);
                state.advancedSelectedClientId = state.advancedSelectedClient.id || "";
                fillAdvancedForm(state.advancedSelectedClient);
                renderAdvancedResults();
                renderStatus("#txInfoClienteAvanzado", "", "");
                $("#txEstadoClientesAvanzados").text("Cliente listo para edición avanzada.");
            })
            .catch(function (error) {
                renderStatus("#txInfoClienteAvanzado", "error", resolveFriendlyMessage(error, "No se pudo cargar el cliente seleccionado."));
                throw error;
            })
            .finally(function () {
                state.advancedLoading = false;
            });
    }

    function clearAdvancedSelection() {
        state.advancedSelectedClient = null;
        state.advancedSelectedClientId = "";
        $("#txClienteAvanzadoSeleccionado").text("Busca y carga un cliente existente.");
        $("#btGuardarClienteAvanzado").prop("disabled", true);
        $("#clientesAdvancedFormBody").removeClass("is-hidden").addClass("is-empty").html(
            "<div class='clientes-advanced-empty'>Carga un cliente para revisar identidad, datos fiscales y condiciones comerciales autorizadas.</div>"
        );
        $("#clientesAdvancedFormLayout").prop("hidden", true);
        clearAllFieldErrors("#clientesAdvancedFormLayout");
        renderStatus("#txInfoClienteAvanzado", "", "");
    }

    function fillAdvancedForm(cliente) {
        if (!cliente) {
            clearAdvancedSelection();
            return;
        }

        $("#txClienteAvanzadoSeleccionado").text(buildAdvancedClientLabel(cliente));
        $("#clientesAdvancedFormBody").addClass("is-hidden").removeClass("is-empty").empty();
        $("#clientesAdvancedFormLayout").prop("hidden", false);
        $("#btGuardarClienteAvanzado").prop("disabled", false);

        $("#txAvanzadoNombre").val(cliente.nombre || "");
        $("#txAvanzadoTelefono").val(cliente.telefono || "");
        $("#txAvanzadoCelular").val(cliente.celular || "");
        $("#txAvanzadoTelefonoFijo").val(cliente.telefonoFijo || "");
        $("#txAvanzadoFechaNacimiento").val(cliente.fechaNacimiento || "");
        $("#txAvanzadoCorreo").val(cliente.correo || "");
        $("#txAvanzadoCbarras").val(cliente.cbarras || "");
        $("#txAvanzadoCalle").val(cliente.calle || "");
        $("#txAvanzadoNumeroExt").val(cliente.numeroExt || "");
        $("#txAvanzadoNumeroInt").val(cliente.numeroInt || "");
        $("#txAvanzadoColonia").val(cliente.colonia || "");
        $("#txAvanzadoCiudad").val(cliente.ciudad || "");
        $("#txAvanzadoMunicipio").val(cliente.municipio || "");
        $("#txAvanzadoEstado").val(cliente.estado || "");
        $("#txAvanzadoCodigoPostal").val(cliente.codigoPostal || "");
        $("#cbAvanzadoRegimenFiscal").val(cliente.regimenFiscal || "");
        $("#txAvanzadoRfc").val(cliente.rfc || "");
        $("#txAvanzadoEntreCalles").val(cliente.entreCalles || "");
        $("#txAvanzadoReferencia").val(cliente.referencia || "");
        $("#txAvanzadoNombreAval").val(cliente.nombreAval || "");
        $("#txAvanzadoDireccionAval").val(cliente.direccionAval || "");
        $("#cbAvanzadoListaPrecio").val(String(cliente.idNivel || 1));
        $("#txAvanzadoLimiteCredito").val(cliente.limiteCredito || 0);
        $("#txAvanzadoPlazoDias").val(cliente.plazoDias || 0);
        $("#txAvanzadoDescuento").val(cliente.descuento || 0);
        $("#txAvanzadoPagos").val(cliente.pagos || 0);
        $("#txAvanzadoClasificacion").val(resolveClientClassificationLabel(cliente));
        $("#txAvanzadoInteres").val(cliente.interes || 0);
        $("#txAvanzadoObservaciones").val(cliente.observaciones || "");
    }

    function saveAdvancedClient() {
        if (!state.advancedSelectedClientId || state.advancedSaving) {
            return;
        }

        const payload = collectAdvancedPayload();
        const validationMessage = validateAdvancedPayload(payload);
        if (validationMessage) {
            renderStatus("#txInfoClienteAvanzado", "error", validationMessage);
            return;
        }

        state.advancedSaving = true;
        setButtonBusy("#btGuardarClienteAvanzado", true, "Guardando...");
        apiRequest("/Clientes/GuardarClienteAvanzado", {
            method: "POST",
            body: JSON.stringify(payload)
        }).then(function (response) {
            const data = normalizeOperacionResponse(response.data);
            renderStatus("#txInfoClienteAvanzado", "success", data.mensaje || "Los datos avanzados fueron guardados.");
            return loadAdvancedClient(state.advancedSelectedClientId);
        }).catch(function (error) {
            renderStatus("#txInfoClienteAvanzado", "error", resolveFriendlyMessage(error, "No fue posible guardar la edición avanzada."));
        }).finally(function () {
            state.advancedSaving = false;
            setButtonBusy("#btGuardarClienteAvanzado", false, "Guardar");
        });
    }

    function collectAdvancedPayload() {
        return {
            id: state.advancedSelectedClientId,
            nombre: ($("#txAvanzadoNombre").val() || "").toString().trim(),
            telefono: ($("#txAvanzadoTelefono").val() || "").toString().trim(),
            correo: ($("#txAvanzadoCorreo").val() || "").toString().trim(),
            celular: ($("#txAvanzadoCelular").val() || "").toString().trim(),
            telefonoFijo: ($("#txAvanzadoTelefonoFijo").val() || "").toString().trim(),
            fechaNacimiento: ($("#txAvanzadoFechaNacimiento").val() || "").toString(),
            cbarras: ($("#txAvanzadoCbarras").val() || "").toString().trim(),
            calle: ($("#txAvanzadoCalle").val() || "").toString().trim(),
            numeroExt: ($("#txAvanzadoNumeroExt").val() || "").toString().trim(),
            numeroInt: ($("#txAvanzadoNumeroInt").val() || "").toString().trim(),
            colonia: ($("#txAvanzadoColonia").val() || "").toString().trim(),
            ciudad: ($("#txAvanzadoCiudad").val() || "").toString().trim(),
            municipio: ($("#txAvanzadoMunicipio").val() || "").toString().trim(),
            estado: ($("#txAvanzadoEstado").val() || "").toString().trim(),
            codigoPostal: ($("#txAvanzadoCodigoPostal").val() || "").toString().trim(),
            rfc: ($("#txAvanzadoRfc").val() || "").toString().trim().toUpperCase(),
            regimenFiscal: ($("#cbAvanzadoRegimenFiscal").val() || "").toString().trim(),
            entreCalles: ($("#txAvanzadoEntreCalles").val() || "").toString().trim(),
            referencia: ($("#txAvanzadoReferencia").val() || "").toString().trim(),
            nombreAval: ($("#txAvanzadoNombreAval").val() || "").toString().trim(),
            direccionAval: ($("#txAvanzadoDireccionAval").val() || "").toString().trim(),
            limiteCredito: Number($("#txAvanzadoLimiteCredito").val() || 0),
            plazoDias: Number($("#txAvanzadoPlazoDias").val() || 0),
            descuento: Number($("#txAvanzadoDescuento").val() || 0),
            pagos: Number($("#txAvanzadoPagos").val() || 0),
            interes: Number($("#txAvanzadoInteres").val() || 0),
            observaciones: ($("#txAvanzadoObservaciones").val() || "").toString().trim(),
            idNivel: Number($("#cbAvanzadoListaPrecio").val() || 1)
        };
    }

    function validateAdvancedPayload(payload) {
        if (!payload.id) {
            return "Selecciona un cliente válido antes de guardar.";
        }

        if (!payload.nombre) {
            return "Captura el nombre del cliente.";
        }

        if (!payload.telefono && !payload.correo) {
            return "Captura al menos un teléfono o un correo.";
        }

        if (payload.correo && !isValidEmail(payload.correo)) {
            return "Captura un correo con formato válido.";
        }

        if (payload.limiteCredito < 0 || payload.plazoDias < 0 || payload.descuento < 0 || payload.pagos < 0 || payload.interes < 0) {
            return "Los valores comerciales no pueden ser negativos.";
        }

        return "";
    }

    function buildAdvancedClientLabel(cliente) {
        if (!cliente) {
            return "Busca y carga un cliente existente.";
        }

        const extra = cliente.telefono || cliente.correo || "";
        return extra
            ? String(cliente.nombre || "Cliente") + " · " + String(extra)
            : String(cliente.nombre || "Cliente");
    }

    function resolveClientClassificationLabel(cliente) {
        return Number(cliente && cliente.tipoCliente || 1) === 2 ? "Empresa" : "Particular";
    }

    function createSyntheticResultRow(cliente) {
        if (!cliente) {
            return null;
        }

        return {
            id: cliente.id || "",
            idEmpresa: cliente.idEmpresa || "",
            identityKey: cliente.identityKey || "",
            tipoCliente: Number(cliente.tipoCliente || 1),
            tipoClienteNombre: cliente.tipoClienteNombre || resolveClientClassificationLabel(cliente),
            nombre: cliente.nombre || "",
            telefono: cliente.telefono || "",
            correo: cliente.correo || "",
            empresa: cliente.empresa || "",
            activo: true,
            fechaCreacion: cliente.fechaCreacion || "",
            fechaActualizacion: cliente.fechaActualizacion || "",
            fechaArchivado: cliente.fechaArchivado || ""
        };
    }

    function normalizeCatalogItems(items) {
        return (Array.isArray(items) ? items : []).map(function (item) {
            const source = item && typeof item === "object" ? item : {};
            return {
                id: Number(readProperty(source, "id", "Id") || 0),
                clave: readProperty(source, "clave", "Clave") || "",
                nombre: readProperty(source, "nombre", "Nombre") || ""
            };
        });
    }

    function renderAdvancedCatalogOptions(selector, items, useNumericValue) {
        const node = document.querySelector(selector);
        if (!node) {
            return;
        }

        const rows = Array.isArray(items) ? items : [];
        node.innerHTML = rows.map(function (item) {
            const value = useNumericValue ? String(item.id || 0) : String(item.clave || "");
            return "<option value='" + escapeHtml(value) + "'>" + escapeHtml(item.nombre || value) + "</option>";
        }).join("");
    }

    function applyResultsSearch() {
        const query = ($("#txBusquedaGridClientes").val() || "").toString().trim().toLowerCase();
        const filtered = !query
            ? state.resultRows.slice()
            : state.resultRows.filter(function (row) {
                return [
                    row.nombre,
                    row.tipoClienteNombre,
                    row.telefono,
                    row.correo,
                    row.empresa
                ].some(function (value) {
                    return String(value || "").toLowerCase().includes(query);
                });
            });

        if (state.selectedClientId) {
            const selectionVisible = filtered.some(function (row) {
                return String(row && row.id || "") === String(state.selectedClientId || "");
            });

            if (!selectionVisible) {
                clearSelectedClient();
            }
        }

        state.visibleResultRows = filtered;
        updateSummaryCards(computeResumen(filtered));
        $("#txGridClientesVisibleCount").text(filtered.length + " visibles");
        $("#txGridClientesCount").text(filtered.length + " registros");
        renderResultsList(filtered);
    }

    function renderResultsList(rows) {
        const host = document.getElementById("clientesResultsList");
        const emptyState = document.getElementById("clientesResultsEmpty");
        if (!host) {
            return;
        }

        const list = Array.isArray(rows) ? rows : [];
        const total = list.length;
        const totalPages = getTotalPages(total);
        if (state.currentPage > totalPages) {
            state.currentPage = totalPages;
        }

        updateGridFooter(total);

        if (!state.searchExecuted) {
            host.innerHTML = "<tr class='clientes-results-placeholder-row'><td colspan='6'>Sin registros disponibles</td></tr>";
            toggleResultsEmptyState(emptyState, true, "Sin resultados", "Busca clientes para ver el panel operativo.");
            return;
        }

        if (!total) {
            host.innerHTML = "<tr class='clientes-results-placeholder-row'><td colspan='6'>Sin registros disponibles</td></tr>";
            toggleResultsEmptyState(emptyState, true, "Sin resultados", "Busca clientes para ver el panel operativo.");
            return;
        }

        const start = (state.currentPage - 1) * state.pageSize;
        const end = start + state.pageSize;
        const pageRows = list.slice(start, end);

        host.innerHTML = pageRows.map(function (row, index) {
            const isSelected = String(row.id || "") === String(state.selectedClientId || "");
            const company = row.empresa ? escapeHtml(row.empresa) : "-";
            const telefono = row.telefono ? escapeHtml(row.telefono) : "<span class='clientes-results-muted'>-</span>";
            const correo = row.correo ? escapeHtml(row.correo) : "<span class='clientes-results-muted'>-</span>";
            const tipo = row.tipoClienteNombre ? escapeHtml(row.tipoClienteNombre) : "Cliente";
            const rowNumber = start + index + 1;

            return "<tr class='clientes-results-row" + (isSelected ? " is-selected" : "") + "' data-row='" + escapeHtml(String(rowNumber)) + "'>" +
                "<td>" +
                    "<button type='button' class='checkapp-btn checkapp-btn-secondary clientes-grid-action js-cliente-open' data-id='" + escapeHtml(row.id) + "'>" +
                        "<i class='fa fa-eye'></i><span>Abrir ficha</span>" +
                    "</button>" +
                "</td>" +
                "<td><span class='clientes-results-name'>" + escapeHtml(row.nombre || "Cliente") + "</span></td>" +
                "<td>" + tipo + "</td>" +
                "<td>" + telefono + "</td>" +
                "<td>" + correo + "</td>" +
                "<td>" + company + "</td>" +
            "</tr>";
        }).join("");

        toggleResultsEmptyState(emptyState, false);
    }

    function updateGridFooter(total) {
        const safeTotal = Number(total || 0);
        const totalPages = safeTotal ? getTotalPages(safeTotal) : 0;
        const start = safeTotal ? ((state.currentPage - 1) * state.pageSize) + 1 : 0;
        const end = safeTotal ? Math.min(state.currentPage * state.pageSize, safeTotal) : 0;
        $("#txGridClientesRange").text(safeTotal ? ("Mostrando " + start + "-" + end + " de " + safeTotal) : "Sin resultados");
        $("#txGridClientesPageIndicator").text(safeTotal ? ("Página " + state.currentPage + " de " + totalPages) : "Página 0 de 0");
        $("#btGridClientesPrev").prop("disabled", state.currentPage <= 1);
        $("#btGridClientesNext").prop("disabled", !safeTotal || state.currentPage >= totalPages);
    }

    function updatePageSizeChips() {
        $("#txGridClientesPageSize").find("[data-page-size]").each(function () {
            const chip = $(this);
            const active = Number(chip.data("page-size")) === state.pageSize;
            chip.toggleClass("is-active", active);
            chip.attr("aria-pressed", active ? "true" : "false");
        });
    }

    function getTotalPages(totalRows) {
        return Math.max(1, Math.ceil(Number(totalRows || 0) / state.pageSize));
    }

    function normalizeResultRows(items) {
        return (Array.isArray(items) ? items : [])
            .map(normalizeCliente)
            .slice()
            .sort(function (a, b) {
                return String(a && a.nombre || "").localeCompare(String(b && b.nombre || ""), "es-MX", { sensitivity: "base" });
            });
    }

    function normalizeListadoResponse(payload) {
        const source = payload && typeof payload === "object" ? payload : {};
        return {
            resumen: normalizeResumen(readProperty(source, "resumen", "Resumen")),
            items: normalizeResultRows(readProperty(source, "items", "Items"))
        };
    }

    function normalizeResumen(resumen) {
        const source = resumen && typeof resumen === "object" ? resumen : {};
        return {
            total: Number(readProperty(source, "total", "Total") || 0),
            particulares: Number(readProperty(source, "particulares", "Particulares") || 0),
            empresas: Number(readProperty(source, "empresas", "Empresas") || 0),
            conTelefono: Number(readProperty(source, "conTelefono", "ConTelefono") || 0),
            conCorreo: Number(readProperty(source, "conCorreo", "ConCorreo") || 0)
        };
    }

    function normalizeCliente(cliente) {
        const source = cliente && typeof cliente === "object" ? cliente : {};
        const tipoCliente = Number(readProperty(source, "tipoCliente", "TipoCliente") || 1);
        return {
            id: readProperty(source, "id", "Id") || "",
            idEmpresa: readProperty(source, "idEmpresa", "IdEmpresa") || "",
            identityKey: readProperty(source, "identityKey", "IdentityKey") || "",
            tipoCliente: tipoCliente,
            tipoClienteNombre: readProperty(source, "tipoClienteNombre", "TipoClienteNombre") || (tipoCliente === 2 ? "Empresa" : "Particular"),
            nombre: readProperty(source, "nombre", "Nombre") || "",
            telefono: readProperty(source, "telefono", "Telefono") || "",
            correo: readProperty(source, "correo", "Correo") || "",
            empresa: readProperty(source, "empresa", "Empresa") || "",
            activo: Boolean(readProperty(source, "activo", "Activo")),
            fechaCreacion: readProperty(source, "fechaCreacion", "FechaCreacion") || "",
            fechaActualizacion: readProperty(source, "fechaActualizacion", "FechaActualizacion") || "",
            fechaArchivado: readProperty(source, "fechaArchivado", "FechaArchivado") || ""
        };
    }

    function normalizeAdvancedClient(cliente) {
        const base = normalizeCliente(cliente);
        const source = cliente && typeof cliente === "object" ? cliente : {};
        return Object.assign(base, {
            celular: readProperty(source, "celular", "Celular") || "",
            telefonoFijo: readProperty(source, "telefonoFijo", "TelefonoFijo") || "",
            fechaNacimiento: readProperty(source, "fechaNacimiento", "FechaNacimiento") || "",
            cbarras: readProperty(source, "cbarras", "Cbarras") || "",
            calle: readProperty(source, "calle", "Calle") || "",
            numeroExt: readProperty(source, "numeroExt", "NumeroExt") || "",
            numeroInt: readProperty(source, "numeroInt", "NumeroInt") || "",
            colonia: readProperty(source, "colonia", "Colonia") || "",
            ciudad: readProperty(source, "ciudad", "Ciudad") || "",
            municipio: readProperty(source, "municipio", "Municipio") || "",
            estado: readProperty(source, "estado", "Estado") || "",
            codigoPostal: readProperty(source, "codigoPostal", "CodigoPostal") || "",
            rfc: readProperty(source, "rfc", "Rfc") || "",
            regimenFiscal: readProperty(source, "regimenFiscal", "RegimenFiscal") || "",
            entreCalles: readProperty(source, "entreCalles", "EntreCalles") || "",
            referencia: readProperty(source, "referencia", "Referencia") || "",
            nombreAval: readProperty(source, "nombreAval", "NombreAval") || "",
            direccionAval: readProperty(source, "direccionAval", "DireccionAval") || "",
            limiteCredito: Number(readProperty(source, "limiteCredito", "LimiteCredito") || 0),
            plazoDias: Number(readProperty(source, "plazoDias", "PlazoDias") || 0),
            descuento: Number(readProperty(source, "descuento", "Descuento") || 0),
            pagos: Number(readProperty(source, "pagos", "Pagos") || 0),
            interes: Number(readProperty(source, "interes", "Interes") || 0),
            observaciones: readProperty(source, "observaciones", "Observaciones") || "",
            idNivel: Number(readProperty(source, "idNivel", "IdNivel") || 1)
        });
    }

    function normalizeNotas(notas) {
        return (Array.isArray(notas) ? notas : []).map(function (nota) {
            const source = nota && typeof nota === "object" ? nota : {};
            return {
                id: readProperty(source, "id", "Id") || "",
                idCliente: readProperty(source, "idCliente", "IdCliente") || "",
                texto: readProperty(source, "texto", "Texto") || "",
                esTarea: Boolean(readProperty(source, "esTarea", "EsTarea")),
                fechaTarea: readProperty(source, "fechaTarea", "FechaTarea") || "",
                horaTarea: readProperty(source, "horaTarea", "HoraTarea") || "",
                completada: Boolean(readProperty(source, "completada", "Completada")),
                fechaCompletada: readProperty(source, "fechaCompletada", "FechaCompletada") || "",
                fechaCreacion: readProperty(source, "fechaCreacion", "FechaCreacion") || "",
                activo: Boolean(readProperty(source, "activo", "Activo"))
            };
        });
    }

    function normalizeOperacionResponse(payload) {
        const source = payload && typeof payload === "object" ? payload : {};
        return {
            mensaje: readProperty(source, "mensaje", "Mensaje") || "",
            idCliente: readProperty(source, "idCliente", "IdCliente") || "",
            requiereConfirmacionDuplicados: Boolean(readProperty(source, "requiereConfirmacionDuplicados", "RequiereConfirmacionDuplicados")),
            hayCoincidencias: Boolean(readProperty(source, "hayCoincidencias", "HayCoincidencias")),
            coincidencias: normalizeCoincidencias(readProperty(source, "coincidencias", "Coincidencias"))
        };
    }

    function normalizeCoincidencias(items) {
        return (Array.isArray(items) ? items : []).map(function (item) {
            const source = item && typeof item === "object" ? item : {};
            return {
                id: readProperty(source, "id", "Id") || "",
                nombre: readProperty(source, "nombre", "Nombre") || "",
                telefono: readProperty(source, "telefono", "Telefono") || "",
                correo: readProperty(source, "correo", "Correo") || "",
                empresa: readProperty(source, "empresa", "Empresa") || "",
                tipoClienteNombre: readProperty(source, "tipoClienteNombre", "TipoClienteNombre") || "",
                coincidenciaEn: readProperty(source, "coincidenciaEn", "CoincidenciaEn") || ""
            };
        });
    }

    function readProperty(source) {
        for (let index = 1; index < arguments.length; index += 1) {
            const key = arguments[index];
            if (source && Object.prototype.hasOwnProperty.call(source, key) && source[key] != null) {
                return source[key];
            }
        }

        return null;
    }

    function clearSelectedClient() {
        state.clientRequestNonce += 1;
        state.selectedClientId = "";
        state.selectedClient = null;
        state.selectedTab = "datos";
        if (window.sessionStorage) {
            window.sessionStorage.removeItem(INDEX_STATE_KEY);
        }
        $("#panelClienteFicha").prop("hidden", true);
        $("#txClienteFichaNombre").text("Cliente");
        $("#txClienteFichaResumen").text("Selecciona un cliente para ver su información.");
        $("#txClienteFichaTipo").text("Particular");
        $("#cbDetalleTipoCliente").val("1");
        $("#txDetalleNombreCliente").val("");
        $("#txDetalleTelefonoCliente").val("");
        $("#txDetalleCorreoCliente").val("");
        $("#txDetalleEmpresaCliente").val("");
        toggleCompanyField("#fieldDetalleEmpresaCliente", "#txDetalleEmpresaCliente", false);
        $("#txClienteNotasCountBadge").text("0");
        $("#clientesNotasList").html("<div class='clientes-notes-empty'>Selecciona un cliente para comenzar su seguimiento.</div>");
        updateClientActionLinks();
        renderStatus("#txInfoClienteDetalle", "", "");
        renderStatus("#txInfoNotasCliente", "", "");
        renderResultsList(state.visibleResultRows);
    }

    function toggleResultsEmptyState(node, visible, title, message) {
        if (!node) {
            return;
        }

        node.hidden = !visible;
        if (!visible) {
            return;
        }

        node.innerHTML = "<strong>" + escapeHtml(title || "Sin resultados") + "</strong>" +
            "<span>" + escapeHtml(message || "Busca clientes para ver el panel operativo.") + "</span>";
    }

    function buildDuplicateHtml(coincidencias) {
        const rows = (coincidencias || []).map(function (item) {
            const company = item.empresa ? " · " + escapeHtml(item.empresa) : "";
            const reason = item.coincidenciaEn ? " (" + escapeHtml(item.coincidenciaEn) + ")" : "";
            return "<li><strong>" + escapeHtml(item.nombre || "Cliente") + "</strong> · " +
                escapeHtml(item.tipoClienteNombre || "") + company +
                (item.telefono ? " · " + escapeHtml(item.telefono) : "") +
                (item.correo ? " · " + escapeHtml(item.correo) : "") +
                reason + "</li>";
        }).join("");

        return "<p>Encontramos clientes que podrían coincidir con este registro.</p><ul style='text-align:left;'>" + rows + "</ul>";
    }

    function renderStatus(selector, type, text) {
        const node = document.querySelector(selector);
        if (!node) {
            return;
        }

        node.classList.remove("is-error", "is-success", "is-info");
        if (!type) {
            node.textContent = "";
            return;
        }

        node.classList.add("is-" + type);
        node.textContent = text || "";
    }

    function markFieldError(selector) {
        const node = document.querySelector(selector);
        if (node) {
            node.classList.add("clientes-input-error");
        }
    }

    function clearFieldError(selector, statusSelector) {
        const node = document.querySelector(selector);
        if (node) {
            node.classList.remove("clientes-input-error");
        }

        if (statusSelector) {
            const status = document.querySelector(statusSelector);
            if (status && status.classList.contains("is-error")) {
                renderStatus(statusSelector, "", "");
            }
        }
    }

    function clearAllFieldErrors(rootSelector) {
        const root = document.querySelector(rootSelector);
        if (!root) {
            return;
        }

        root.querySelectorAll(".clientes-input-error").forEach(function (node) {
            node.classList.remove("clientes-input-error");
        });
    }

    function apiRequest(url, options) {
        const config = Object.assign({
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            }
        }, options || {});

        if (config.method === "GET") {
            delete config.body;
        }

        return fetch(url, config).then(async function (response) {
            const text = await response.text();
            let data = null;
            if (text) {
                try {
                    data = JSON.parse(text);
                } catch (_error) {
                    data = null;
                }
            }

            if (!response.ok) {
                throw {
                    status: response.status,
                    data: data
                };
            }

            return {
                status: response.status,
                data: data
            };
        });
    }

    function handleApiError(error, statusSelector, fallbackMessage) {
        renderStatus(statusSelector, "error", resolveFriendlyMessage(error, fallbackMessage));
    }

    function resolveFriendlyMessage(error, fallbackMessage) {
        const data = normalizeOperacionResponse(error && error.data);
        if (typeof data.mensaje === "string" && data.mensaje.trim()) {
            return data.mensaje.trim();
        }

        return fallbackMessage;
    }

    function isValidEmail(email) {
        const value = String(email || "").trim();
        const at = value.indexOf("@");
        const dot = value.lastIndexOf(".");
        return at > 0 && dot > at + 1 && dot < value.length - 1;
    }

    function formatDateTime(value) {
        if (!value) {
            return "";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }).format(date);
    }

    function formatDateOnly(value) {
        if (!value) {
            return "";
        }

        const date = new Date(value + "T00:00:00");
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).format(date);
    }

    function formatTimeOnly(value) {
        if (!value) {
            return "-";
        }

        const date = new Date("1970-01-01T" + value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat("es-MX", {
            hour: "numeric",
            minute: "2-digit"
        }).format(date);
    }

    function escapeHtml(value) {
        if (window.CheckAppUI && typeof window.CheckAppUI.escapeHtml === "function") {
            return window.CheckAppUI.escapeHtml(value);
        }

        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    window.ClientesPage = {
        reload: function () {
            state.searchExecuted = true;
            reloadClientesResults();
        }
    };
})(window, document, window.jQuery);
