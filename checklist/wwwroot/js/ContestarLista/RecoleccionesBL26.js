(function () {
    var root = document.getElementById("recolecciones-bl26-app");
    var contextNode = document.getElementById("recolecciones-bl26-context");

    if (!root || !contextNode) {
        return;
    }

    var EXIT_WARNING = "Las respuestas todavía no se han guardado. Si sales, perderás la información capturada.";
    var SECTION_FALLBACK = "Sin categoría";
    var SUBCATEGORY_FALLBACK = "Sin subcategoría";
    var QUESTION_TYPES = {
        "0": {
            key: "0",
            name: "Texto legacy",
            control: "Texto",
            emptyMessage: "Escribe una respuesta para esta pregunta."
        },
        "1": {
            key: "1",
            name: "Calificación",
            control: "Escala de 1 a 5",
            emptyMessage: "Selecciona una calificación para esta pregunta."
        },
        "2": {
            key: "2",
            name: "Opción simple",
            control: "Selección única",
            emptyMessage: "Selecciona una opción para esta pregunta."
        },
        "3": {
            key: "3",
            name: "Opción múltiple",
            control: "Selección múltiple",
            emptyMessage: "Selecciona al menos una opción para esta pregunta."
        },
        "4": {
            key: "4",
            name: "Texto libre",
            control: "Texto",
            emptyMessage: "Escribe una respuesta para esta pregunta."
        },
        "5": {
            key: "5",
            name: "Numérico",
            control: "Número",
            emptyMessage: "Captura un valor numérico válido."
        },
        "6": {
            key: "6",
            name: "Fecha",
            control: "Fecha",
            emptyMessage: "Selecciona una fecha válida."
        },
        "7": {
            key: "7",
            name: "Fecha y hora",
            control: "Fecha y hora",
            emptyMessage: "Selecciona una fecha y hora válidas."
        },
        "8": {
            key: "8",
            name: "Hora",
            control: "Hora",
            emptyMessage: "Selecciona una hora válida."
        }
    };

    var context = {
        idEmpresa: normalizeValue(contextNode.dataset.idEmpresa),
        cadena: normalizeValue(contextNode.dataset.cadena),
        empresa: normalizeValue(contextNode.dataset.empresa),
        correo: normalizeValue(contextNode.dataset.correo)
    };

    var state = {
        canWrite: true,
        bootstrapping: true,
        sessionExpired: false,
        listState: "idle",
        listError: "",
        branchState: "idle",
        branchError: "",
        responsibleState: "idle",
        responsibleError: "",
        questionnaireState: "idle",
        questionnaireError: "",
        statusKey: "loading-list",
        statusTone: "info",
        statusTitle: "Preparando inspección",
        statusMessage: "Estamos validando tu sesión y cargando el contexto de trabajo.",
        lists: [],
        branches: [],
        responsables: [],
        questions: [],
        selectedListId: "",
        selectedListName: "",
        selectedListUsesAssets: false,
        selectedListAssetTypeId: "",
        selectedListAssetTypeName: "",
        selectedBranchId: "",
        selectedBranchName: "",
        selectedResponsibleId: "",
        selectedResponsibleName: "",
        assetState: "idle",
        assetError: "",
        assetSearchTerm: "",
        assets: [],
        assetDrawerOpen: false,
        selectedAssetId: "",
        selectedAssetDetail: null,
        location: null,
        searchTerm: "",
        inspection: null,
        prepExpanded: true,
        progressExpanded: true,
        quickNavExpanded: false,
        optionalPanelsById: {},
        mediaCapture: {
            mode: "",
            questionId: "",
            status: "idle",
            previewUrl: "",
            file: null,
            error: "",
            seconds: 0,
            stream: null,
            recorder: null,
            intervalId: 0,
            timeoutId: 0,
            chunks: []
        },
        pendingFocusState: null,
        historyGuardEnabled: false,
        leavingPage: false,
        isFinalizing: false
    };

    var searchTimer = null;
    hydrateUiChrome();

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.onbeforeunload = handleBeforeUnload;
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleDocumentNavigation, true);

    render();
    bootstrap();

    function bootstrap() {
        updateStatus("loading-list", "info", "Preparando inspección", "Estamos validando tu sesión y cargando el contexto de trabajo.");

        request("/ContestarLista/InicializaRecoleccionesBL26", {
            idEmpresa: context.idEmpresa,
            cadena: context.cadena,
            empresa: context.empresa
        })
            .then(function (payload) {
                if (!payload || payload.sessionExpired) {
                    handleSessionExpired();
                    return;
                }

                if (payload.accessDenied) {
                    handleAccessDenied(payload);
                    return;
                }

                state.bootstrapping = false;
                state.canWrite = payload.perm !== false;

                if (payload.session) {
                    context.idEmpresa = normalizeValue(payload.session.idEmpresa || context.idEmpresa);
                    context.cadena = normalizeValue(payload.session.cadena || context.cadena);
                    context.empresa = normalizeValue(payload.session.empresa || context.empresa);
                    context.correo = normalizeValue(payload.session.correo || context.correo);
                }

                if (!context.idEmpresa || !context.cadena || !context.empresa || !context.correo) {
                    handleSessionExpired();
                    return;
                }

                render();
                loadInitialData();
            })
            .catch(function () {
                state.bootstrapping = false;
                state.listState = "error";
                state.listError = "No fue posible validar la sesión actual.";
                updateStatus("list-error", "danger", "No pudimos iniciar la experiencia", "Revisa tu sesión actual o vuelve a entrar desde el menú del sistema.");
                render();
            });
    }

    function loadInitialData() {
        loadLists("");
        loadBranches();
    }

    function loadLists(searchTerm) {
        state.listState = "loading";
        state.listError = "";
        state.selectedListId = "";
        state.selectedListName = "";
        resetQuestionnaireState();
        updateStatus("loading-list", "info", "Cargando listas", "Estamos consultando las listas asignadas al usuario.");
        render();

        request("/ContestarLista/GetListasEjecutablesRecoleccionesBL26", {
            searchTerm: searchTerm || "",
            idEmpresa: context.idEmpresa,
            cadena: context.cadena,
            empresa: context.empresa,
            correo: context.correo
        })
            .then(function (payload) {
                if (!payload || payload.sessionExpired) {
                    handleSessionExpired();
                    return;
                }

                if (payload.accessDenied) {
                    handleAccessDenied(payload);
                    return;
                }

                state.lists = Array.isArray(payload.d) ? payload.d : [];
                state.listState = state.lists.length ? "loaded" : "empty";

                if (!state.lists.length) {
                    updateStatus("list-empty", "warning", "No hay listas disponibles", "No hay listas disponibles para iniciar una inspección.");
                } else {
                    updateStatus("branch-loading", "info", "Listas disponibles", "Selecciona una lista, una sucursal y un responsable para iniciar la inspección.");
                }

                render();
            })
            .catch(function () {
                state.listState = "error";
                state.listError = "No fue posible cargar las listas disponibles.";
                updateStatus("list-error", "danger", "No fue posible cargar las listas disponibles", "Intenta nuevamente.");
                render();
            });
    }

    function requiresAssetSelection() {
        return !!state.selectedListUsesAssets;
    }

    function resetAssetSelectionState() {
        state.assetState = "idle";
        state.assetError = "";
        state.assetSearchTerm = "";
        state.assets = [];
        state.assetDrawerOpen = false;
        state.selectedAssetId = "";
        state.selectedAssetDetail = null;
    }

    function applySelectedListMetadata() {
        var selected = (state.lists || []).find(function (item) {
            return String(item.id) === String(state.selectedListId);
        }) || null;

        state.selectedListUsesAssets = !!(selected && selected.usaActivos);
        state.selectedListAssetTypeId = selected ? normalizeValue(selected.idTipoActivo) : "";
        state.selectedListAssetTypeName = selected ? normalizeValue(selected.tipoActivo) : "";
    }

    function loadAssets(searchTerm) {
        state.assetState = "loading";
        state.assetError = "";
        render();

        return request("/ContestarLista/GetActivosRecoleccionesBL26", {
            busqueda: searchTerm || "",
            idTipoActivo: state.selectedListAssetTypeId,
            idEmpresa: context.idEmpresa,
            cadena: context.cadena,
            empresa: context.empresa,
            correo: context.correo
        })
            .then(function (payload) {
                if (!payload || payload.sessionExpired) {
                    handleSessionExpired();
                    return;
                }

                if (payload.accessDenied) {
                    handleAccessDenied(payload);
                    return;
                }

                state.assets = Array.isArray(payload.d) ? payload.d : [];
                state.assetState = state.assets.length ? "loaded" : "empty";
                render();
            })
            .catch(function () {
                state.assetState = "error";
                state.assetError = "No fue posible cargar los activos disponibles.";
                render();
            });
    }

    function openAssetDrawer() {
        state.assetDrawerOpen = true;
        if (state.assetState === "idle") {
            loadAssets("");
            return;
        }

        render();
    }

    function closeAssetDrawer() {
        state.assetDrawerOpen = false;
        render();
    }

    function selectAsset(assetId) {
        if (!assetId) {
            return;
        }

        state.assetState = "loading-detail";
        state.assetError = "";
        state.selectedAssetId = assetId;
        render();

        request("/ContestarLista/GetActivoRecoleccionesBL26", {
            idActivo: assetId,
            idEmpresa: context.idEmpresa,
            cadena: context.cadena,
            empresa: context.empresa,
            correo: context.correo
        })
            .then(function (payload) {
                if (!payload || payload.sessionExpired) {
                    handleSessionExpired();
                    return;
                }

                if (payload.accessDenied) {
                    handleAccessDenied(payload);
                    return;
                }

                state.selectedAssetDetail = payload.d || null;
                state.assetState = "detail";
                render();
            })
            .catch(function () {
                state.assetState = "error";
                state.assetError = "No fue posible consultar el activo seleccionado.";
                render();
            });
    }

    function beginInspectionAfterAssetSelection() {
        if (requiresAssetSelection() && !state.selectedAssetId) {
            state.assetError = "Selecciona un activo antes de continuar.";
            render();
            return;
        }

        state.assetDrawerOpen = false;
        requestLocationAndLoadQuestionnaire();
    }

    function loadBranches() {
        state.branchState = "loading";
        state.branchError = "";
        state.selectedBranchId = "";
        state.selectedBranchName = "";
        state.responsables = [];
        state.selectedResponsibleId = "";
        state.selectedResponsibleName = "";
        state.responsibleState = "idle";
        updateStatus("branch-loading", "info", "Cargando sucursales", "Estamos consultando las sucursales disponibles para el usuario actual.");
        render();

        request("/ContestarLista/GetSucursalesRecoleccionesBL26", {
            idEmpresa: context.idEmpresa,
            cadena: context.cadena,
            empresa: context.empresa,
            correo: context.correo
        })
            .then(function (payload) {
                if (!payload || payload.sessionExpired) {
                    handleSessionExpired();
                    return;
                }

                if (payload.accessDenied) {
                    handleAccessDenied(payload);
                    return;
                }

                state.branches = Array.isArray(payload.d) ? payload.d : [];
                state.branchState = state.branches.length ? "loaded" : "empty";

                if (!state.branches.length) {
                    updateStatus("branch-empty", "warning", "No hay sucursales disponibles", "No encontramos sucursales para el usuario actual.");
                } else if (state.listState === "loaded") {
                    updateStatus("ready-to-select", "info", "Contexto listo", "Ya puedes seleccionar lista, sucursal y responsable antes de solicitar ubicación.");
                }

                render();
            })
            .catch(function () {
                state.branchState = "error";
                state.branchError = "No fue posible cargar las sucursales.";
                updateStatus("branch-error", "danger", "Falló la carga de sucursales", "No pudimos obtener las sucursales del usuario.");
                render();
            });
    }

    function loadResponsables(branchId) {
        state.responsibleState = "loading";
        state.responsibleError = "";
        state.responsables = [];
        state.selectedResponsibleId = "";
        state.selectedResponsibleName = "";
        updateStatus("responsible-loading", "info", "Cargando responsables", "Estamos consultando los responsables de la sucursal seleccionada.");
        render();

        request("/ContestarLista/GetResponsablesRecoleccionesBL26", {
            idSucursal: branchId,
            idEmpresa: context.idEmpresa,
            cadena: context.cadena,
            empresa: context.empresa,
            correo: context.correo
        })
            .then(function (payload) {
                if (!payload || payload.sessionExpired) {
                    handleSessionExpired();
                    return;
                }

                if (payload.accessDenied) {
                    handleAccessDenied(payload);
                    return;
                }

                state.responsables = Array.isArray(payload.d) ? payload.d : [];
                state.responsibleState = state.responsables.length ? "loaded" : "empty";

                if (!state.responsables.length) {
                    updateStatus("responsible-empty", "warning", "No hay responsables disponibles", "No encontramos responsables para la sucursal elegida.");
                } else {
                    updateStatus("ready-to-start", "info", "Falta iniciar la inspección", "Selecciona al responsable y luego usa el botón para solicitar ubicación y cargar las preguntas.");
                }

                render();
            })
            .catch(function () {
                state.responsibleState = "error";
                state.responsibleError = "No fue posible cargar los responsables.";
                updateStatus("responsible-error", "danger", "Falló la carga de responsables", "No pudimos obtener los responsables para la sucursal seleccionada.");
                render();
            });
    }

    function startInspection() {
        if (!state.selectedListId || !state.selectedBranchId || !state.selectedResponsibleId) {
            updateStatus("selection-missing", "warning", "Falta información para iniciar", "Selecciona lista, sucursal y responsable antes de solicitar ubicación.");
            render();
            return;
        }

        if (requiresAssetSelection() && !state.selectedAssetId) {
            updateStatus("asset-required", "info", "Selecciona un activo", "La lista seleccionada requiere elegir un activo antes de iniciar la inspección.");
            openAssetDrawer();
            return;
        }

        requestLocationAndLoadQuestionnaire();
    }

    function requestLocationAndLoadQuestionnaire() {
        if (!state.selectedListId || !state.selectedBranchId || !state.selectedResponsibleId) {
            updateStatus("selection-missing", "warning", "Falta información para iniciar", "Selecciona lista, sucursal y responsable antes de solicitar ubicación.");
            render();
            return;
        }

        if (!navigator.geolocation) {
            updateStatus("location-denied", "danger", "Este navegador no soporta ubicación", "No podemos iniciar la inspección porque la geolocalización no está disponible.");
            render();
            return;
        }

        resetQuestionnaireState();
        state.location = null;
        updateStatus("location-requesting", "info", "Solicitando ubicación", "Estamos solicitando tu ubicación para iniciar la inspección.");
        render();

        navigator.geolocation.getCurrentPosition(function (position) {
            state.location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };

            updateStatus("location-granted", "success", "Ubicación confirmada", "La ubicación fue autorizada. Ahora estamos cargando el cuestionario.");
            render();
            loadQuestionnaire();
        }, function () {
            state.location = null;
            updateStatus("location-denied", "danger", "Ubicación requerida", "No se puede iniciar la inspección sin autorización de ubicación.");
            render();
        }, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        });
    }

    function loadQuestionnaire() {
        state.questionnaireState = "loading";
        state.questionnaireError = "";
        updateStatus("questions-loading", "info", "Cargando preguntas", "Estamos consultando el cuestionario de la lista elegida.");
        render();

        request("/ContestarLista/GetCuestionarioRecoleccionesBL26", {
            idPrograma: state.selectedListId,
            idLista: state.selectedListId,
            idSucursal: state.selectedBranchId,
            idResponsable: state.selectedResponsibleId,
            idActivo: state.selectedAssetId,
            idEmpresa: context.idEmpresa,
            cadena: context.cadena,
            empresa: context.empresa,
            correo: context.correo
        })
            .then(function (payload) {
                if (!payload || payload.sessionExpired) {
                    handleSessionExpired();
                    return;
                }

                if (payload.accessDenied) {
                    handleAccessDenied(payload);
                    return;
                }

                state.questions = Array.isArray(payload.d) ? payload.d : [];
                state.questionnaireState = state.questions.length ? "loaded" : "empty";

                if (!state.questions.length) {
                    state.inspection = null;
                    updateStatus("questions-empty", "warning", "La lista no tiene preguntas disponibles", "La lista seleccionada no devolvió preguntas para esta inspección.");
                } else {
                    state.inspection = createInspectionState(state.questions);
                    state.prepExpanded = false;
                    state.progressExpanded = false;
                    state.quickNavExpanded = false;
                    persistUiChrome();
                    updateStatus("questions-loaded", "success", "Cuestionario listo", "El avance se conserva mientras permanezcas en esta pantalla.");
                }

                render();
            })
            .catch(function () {
                state.questionnaireState = "error";
                state.questionnaireError = "No fue posible cargar las preguntas.";
                state.inspection = null;
                updateStatus("questions-error", "danger", "Falló la carga del cuestionario", "No pudimos obtener las preguntas de la lista seleccionada.");
                render();
            });
    }

    function createInspectionState(questions) {
        var entries = buildQuestionEntries(questions);
        return {
            entries: entries,
            sections: buildSections(entries),
            activeQuestionId: entries.length ? entries[0].id : "",
            answersById: {},
            commentsById: {},
            findingsById: {},
            mediaById: {},
            touchedById: {},
            optionalPanelsById: {}
        };
    }

    function buildQuestionEntries(questions) {
        return (questions || []).map(function (question, index) {
            var typeKey = resolveQuestionType(question);
            var typeMeta = QUESTION_TYPES[typeKey] || null;
            var category = normalizeValue(question.categoria) || SECTION_FALLBACK;
            var subcategory = normalizeValue(question.subcategoria) || SUBCATEGORY_FALLBACK;
            var prompt = normalizeValue(question.pregunta) || "Pregunta sin título";
            var instructions = normalizeValue(question.explicacion);
            var note = normalizeValue(question.notas);
            var options = normalizeOptions(question.opciones);

            return {
                id: normalizeValue(question.id) || ("pregunta-" + (index + 1)),
                order: index,
                number: index + 1,
                category: category,
                subcategory: subcategory,
                prompt: prompt,
                instructions: isMeaningfulSupplementalCopy(instructions, [prompt, note]) ? instructions : "",
                note: note,
                required: toBoolean(question.obligatorio),
                typeKey: typeKey,
                typeMeta: typeMeta,
                options: options,
                rawValue: normalizeValue(question.valor),
                correctAnswer: normalizeValue(question.respuestaCorrecta),
                supportsComment: !!typeMeta,
                hasOptionsIssue: (typeKey === "2" || typeKey === "3") && !options.length
            };
        });
    }

    function buildSections(entries) {
        var sectionsByKey = {};
        var sections = [];

        (entries || []).forEach(function (entry) {
            if (!sectionsByKey[entry.category]) {
                sectionsByKey[entry.category] = {
                    key: entry.category,
                    title: entry.category,
                    questionIds: []
                };
                sections.push(sectionsByKey[entry.category]);
            }

            sectionsByKey[entry.category].questionIds.push(entry.id);
        });

        return sections;
    }

    function resetQuestionnaireState() {
        state.questions = [];
        state.questionnaireState = "idle";
        state.questionnaireError = "";
        state.inspection = null;
    }

    function handleSearchInput(value) {
        state.searchTerm = value || "";
        render();

        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(function () {
            loadLists(state.searchTerm);
        }, 260);
    }

    function handleSessionExpired() {
        state.bootstrapping = false;
        state.sessionExpired = true;
        updateStatus("session-expired", "danger", "Sesión no disponible", "No encontramos el contexto necesario para continuar. Vuelve a entrar desde el sistema.");
        render();
    }

    function handleAccessDenied(payload) {
        state.bootstrapping = false;
        state.sessionExpired = false;
        state.lists = [];
        state.branches = [];
        state.responsables = [];
        state.questions = [];
        state.inspection = null;

        if (payload && payload.redirectToAdministration) {
            window.location.href = "/Home/CambiarModo?modo=Administracion&reason=" + encodeURIComponent(payload.redirectReason || "");
            return;
        }

        updateStatus("access-denied", "warning", "Acceso no disponible", "Tu perfil actual no tiene permiso para entrar a Inspección en campo.");
        render();
    }

    function updateStatus(key, tone, title, message) {
        state.statusKey = key;
        state.statusTone = tone;
        state.statusTitle = title;
        state.statusMessage = message;
    }

    function request(url, params) {
        var query = new URLSearchParams();

        Object.keys(params || {}).forEach(function (key) {
            var value = params[key];
            if (value !== undefined && value !== null) {
                query.append(key, value);
            }
        });

        return fetch(url + "?" + query.toString(), {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        }).then(function (response) {
            if (!response.ok) {
                throw new Error("Request failed");
            }

            return response.json();
        });
    }

    function postJson(url, payload) {
        return fetch(url, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify(payload)
        }).then(function (response) {
            if (!response.ok) {
                throw new Error("Request failed");
            }

            return response.json();
        });
    }

    function render() {
        var focusState = captureEditableFocusState();
        var stats = getInspectionStats();
        var started = hasStartedInspection();
        var hasModalDrawerOpen = state.assetDrawerOpen || state.quickNavExpanded || (state.mediaCapture && state.mediaCapture.status && state.mediaCapture.status !== "idle");

        root.className = "bl26-reco-shell " + (started ? "is-capture" : "is-prep") + (hasModalDrawerOpen ? " has-modal-drawer-open" : "");
        document.body.classList.toggle("bl26-reco-scroll-locked", !!hasModalDrawerOpen);
        root.innerHTML = [
            '<div class="bl26-reco-page">',
            renderHeader(stats),
            started ? renderCaptureLayout(stats) : renderPreparationLayout(stats),
            renderAssetDrawer(),
            renderMediaCaptureOverlay(),
            '</div>'
        ].join("");

        bindEvents();
        hydrateMediaCaptureNode();
        restoreEditableFocusState(focusState);
    }

    function renderHeader(stats) {
        var started = hasStartedInspection();
        if (!started) {
            return [
                '<section class="bl26-reco-header bl26-reco-header-prep">',
                '<div class="bl26-reco-header-main">',
                '<div class="bl26-reco-header-copy compact">',
                '<p class="bl26-reco-kicker">Nueva inspección</p>',
                '<h1>Nueva inspección</h1>',
                '<p class="bl26-reco-copy">Selecciona la lista y confirma los datos antes de comenzar.</p>',
                '</div>',
                '</div>',
                '</section>'
            ].join("");
        }

        var currentLabel = started && stats.total ? ("Pregunta " + stats.currentNumber + " de " + stats.total) : "Preparación";
        var statusLine = started
            ? (stats.answered + " respondidas · " + stats.pendingRequired + " obligatorias pendientes")
            : state.statusTitle;

        return [
            '<section class="bl26-reco-header is-started bl26-reco-header-compact">',
            '<div class="bl26-reco-header-main bl26-reco-header-main-compact">',
            '<div class="bl26-reco-header-copy compact">',
            '<h1>Captura de inspecciones</h1>',
            '</div>',
            '</div>',
            '<button id="bl26-exit-button" class="bl26-reco-secondary bl26-reco-exit-button" type="button">Salir</button>',
            '</section>'
        ].join("");
    }

    function renderPreparationLayout(stats) {
        return [
            '<div class="bl26-reco-stage bl26-reco-stage-prep">',
            '<div class="bl26-reco-prep-main">',
            renderPreparationPanel(),
            '</div>',
            '</div>'
        ].join("");
    }

    function renderCaptureLayout(stats) {
        return [
            '<div class="bl26-reco-stage bl26-reco-stage-capture">',
            renderQuestionPanel(stats),
            renderProgressPanel(stats),
            renderRightRail(stats),
            '</div>',
        ].join("");
    }

    function renderMediaCaptureOverlay() {
        var capture = state.mediaCapture || {};
        if (!capture.mode || capture.status === "idle") {
            return "";
        }

        var titleMap = {
            photo: "Tomar foto",
            video: "Grabar video",
            audio: "Grabar audio"
        };

        var isPhoto = capture.mode === "photo";
        var isVideo = capture.mode === "video";
        var isAudio = capture.mode === "audio";
        var showLivePreview = (isPhoto || isVideo) && (capture.status === "ready" || capture.status === "recording");
        var showPhotoPreview = isPhoto && capture.status === "preview" && capture.previewUrl;
        var showVideoPreview = isVideo && capture.status === "preview" && capture.previewUrl;
        var showAudioPreview = isAudio && capture.status === "preview" && capture.previewUrl;
        var isRecordingAudio = isAudio && capture.status === "recording";
        var isRecordingVideo = isVideo && capture.status === "recording";

        return [
            '<section class="bl26-reco-drawer-shell bl26-reco-media-capture-shell is-open">',
            '<button type="button" class="bl26-reco-drawer-backdrop" data-action="close-media-capture" aria-label="Cerrar captura"></button>',
            '<div class="bl26-reco-drawer bl26-reco-media-capture-panel">',
            '<div class="bl26-reco-drawer-handle" aria-hidden="true"></div>',
            '<div class="bl26-reco-drawer-head">',
            '<div>',
            '<p class="bl26-reco-eyebrow">Evidencia</p>',
            '<h2>', escapeHtml(titleMap[capture.mode] || "Captura"), '</h2>',
            '</div>',
            '<button type="button" class="bl26-reco-ghost bl26-reco-drawer-close" data-action="close-media-capture">Cerrar</button>',
            '</div>',
            '<div class="bl26-reco-media-capture-body">',
            showLivePreview ? '<video id="bl26-media-live-preview" class="bl26-reco-media-live" autoplay playsinline muted></video>' : '',
            showPhotoPreview ? '<img class="bl26-reco-media-preview-image" src="' + escapeAttribute(capture.previewUrl) + '" alt="Vista previa de foto" />' : '',
            showVideoPreview ? '<video class="bl26-reco-media-preview-video" src="' + escapeAttribute(capture.previewUrl) + '" controls playsinline preload="metadata"></video>' : '',
            showAudioPreview ? '<audio class="bl26-reco-media-preview-audio" src="' + escapeAttribute(capture.previewUrl) + '" controls preload="metadata"></audio>' : '',
            renderMediaCaptureStatus(capture),
            renderMediaCaptureActions(capture, {
                isPhoto: isPhoto,
                isVideo: isVideo,
                isAudio: isAudio,
                isRecordingAudio: isRecordingAudio,
                isRecordingVideo: isRecordingVideo,
                showLivePreview: showLivePreview,
                showPhotoPreview: showPhotoPreview,
                showVideoPreview: showVideoPreview,
                showAudioPreview: showAudioPreview
            }),
            '</div>',
            '</div>',
            '</section>'
        ].join("");
    }

    function renderAssetDrawer() {
        if (!state.assetDrawerOpen) {
            return "";
        }

        var canConfirm = !!state.selectedAssetId && !!state.selectedAssetDetail && !hasStartedInspection();
        var selectedAsset = state.selectedAssetDetail;
        var detail = selectedAsset ? normalizeAssetDetail(selectedAsset) : null;
        var headerSummary = detail
            ? '<p class="bl26-reco-drawer-summary">' + escapeHtml([detail.codigo || detail.nombre, detail.tipoActivo, detail.sucursal].filter(Boolean).join(' · ')) + '</p>'
            : '<p class="bl26-reco-drawer-summary">Consulta su información, multimedia y documentos en solo lectura.</p>';

        return [
            '<section class="bl26-reco-drawer-shell bl26-reco-asset-drawer-shell is-open">',
            '<button type="button" class="bl26-reco-drawer-backdrop" data-action="close-asset-drawer" aria-label="Cerrar activo"></button>',
            '<div class="bl26-reco-drawer bl26-reco-asset-drawer is-open">',
            '<div class="bl26-reco-drawer-handle" aria-hidden="true"></div>',
            '<div class="bl26-reco-drawer-head bl26-reco-asset-drawer-head">',
            '<div class="bl26-reco-drawer-head-copy">',
            '<p class="bl26-reco-eyebrow">Activo</p>',
            '<h2>', hasStartedInspection() ? 'Activo consultado' : 'Seleccionar activo', '</h2>',
            headerSummary,
            '</div>',
            '<button type="button" class="bl26-reco-ghost bl26-reco-drawer-close" data-action="close-asset-drawer">Cerrar</button>',
            '</div>',
            '<div class="bl26-reco-asset-drawer-body', hasStartedInspection() ? ' is-detail-only' : '', '">',
            hasStartedInspection() ? '' : renderAssetSearchPanel(),
            renderAssetDetailPanel(detail),
            '</div>',
            '<div class="bl26-reco-drawer-actions bl26-reco-asset-drawer-actions">',
            hasStartedInspection() ? '' : '<button type="button" class="bl26-reco-secondary" data-action="close-asset-drawer">Cancelar</button>',
            hasStartedInspection() ? '' : '<button type="button" class="bl26-reco-primary" data-action="confirm-asset-selection" ' + (canConfirm ? '' : 'disabled') + '>Comenzar inspección</button>',
            '</div>',
            '</div>',
            '</section>'
        ].join("");
    }

    function renderAssetSearchPanel() {
        var body = '';
        if (state.assetState === "loading") {
            body = '<div class="bl26-reco-empty compact"><strong>Cargando activos</strong><p>Estamos consultando los activos disponibles.</p></div>';
        } else if (state.assetState === "error") {
            body = '<div class="bl26-reco-empty compact"><strong>No fue posible cargar los activos</strong><p>' + escapeHtml(state.assetError || "Intenta nuevamente.") + '</p></div>';
        } else if (state.assetState === "empty") {
            body = '<div class="bl26-reco-empty compact"><strong>Sin activos disponibles</strong><p>No encontramos activos compatibles con esta lista.</p></div>';
        } else {
            body = [
                '<div class="bl26-reco-asset-list">',
                (state.assets || []).map(function (item) {
                    var selected = String(item.id) === String(state.selectedAssetId);
                    return [
                        '<button type="button" class="bl26-reco-asset-option', selected ? ' is-selected' : '', '" data-action="select-asset" data-asset-id="', escapeAttribute(item.id), '">',
                        '<strong>', escapeHtml(item.codigo || item.nombre || "Activo"), '</strong>',
                        '<span>', escapeHtml(item.nombre || ""), '</span>',
                        '<small>', escapeHtml([item.tag, item.numeroSerie, item.tipoActivo].filter(Boolean).join(' · ')), '</small>',
                        '</button>'
                    ].join("");
                }).join(""),
                '</div>'
            ].join("");
        }

        return [
            '<div class="bl26-reco-asset-search-panel">',
            '<div class="bl26-reco-asset-search-sticky">',
                '<label class="bl26-reco-field">',
                '<span>Buscar activo</span>',
                '<input id="bl26-asset-search" type="search" value="', escapeAttribute(state.assetSearchTerm || ""), '" placeholder="Código, nombre, tag o número de serie" />',
                '</label>',
            '</div>',
            '<div class="bl26-reco-asset-search-results">',
                body,
            '</div>',
            '</div>'
        ].join("");
    }

    function renderAssetDetailPanel(detail) {
        if (!detail) {
            return '<div class="bl26-reco-empty compact"><strong>Selecciona un activo</strong><p>Aquí mostraremos su información, fotos, video y documentos en solo lectura.</p></div>';
        }

        return [
            '<div class="bl26-reco-asset-detail">',
            '<article class="bl26-reco-asset-identity">',
            '<strong>', escapeHtml(detail.codigo || detail.nombre || "Activo"), '</strong>',
            '<span>', escapeHtml(detail.nombre || "Sin nombre"), '</span>',
            '<small>', escapeHtml([detail.tag, detail.numeroSerie, detail.tipoActivo].filter(Boolean).join(" · ") || "Sin referencia adicional"), '</small>',
            '</article>',
            '<div class="bl26-reco-asset-summary-grid">',
            renderMiniCard("Código", detail.codigo || "N/A"),
            renderMiniCard("Nombre", detail.nombre || "N/A"),
            renderMiniCard("Tipo", detail.tipoActivo || "N/A"),
            renderMiniCard("Marca", detail.marca || "N/A"),
            renderMiniCard("Proveedor", detail.proveedor || "N/A"),
            renderMiniCard("Sucursal", detail.sucursal || "N/A"),
            renderMiniCard("Estado operativo", detail.estadoOperativo || "N/A"),
            renderMiniCard("Tag", detail.tag || "N/A"),
            renderMiniCard("Número de serie", detail.numeroSerie || "N/A"),
            '</div>',
            '<div class="bl26-reco-asset-description"><strong>Descripción</strong><p>', escapeHtml(detail.descripcion || "Sin descripción"), '</p></div>',
            renderAssetMediaSection("Fotos", detail.fotos, "photo"),
            renderAssetMediaSection("Videos", detail.videos, "video"),
            renderAssetMediaSection("Documentos", detail.documentos, "document"),
            '</div>'
        ].join("");
    }

    function renderAssetMediaSection(title, items, kind) {
        if (!items || !items.length) {
            return [
                '<section class="bl26-reco-asset-media-section">',
                '<h3>', escapeHtml(title), '</h3>',
                '<div class="bl26-reco-empty compact"><strong>Sin ', escapeHtml(title.toLowerCase()), '</strong><p>No hay ', escapeHtml(title.toLowerCase()), ' disponibles para este activo.</p></div>',
                '</section>'
            ].join("");
        }

        return [
            '<section class="bl26-reco-asset-media-section">',
            '<h3>', escapeHtml(title), '</h3>',
            '<div class="bl26-reco-asset-media-grid kind-', escapeHtml(kind), '">',
            items.map(function (item, index) {
                if (kind === "photo") {
                    return '<img src="' + escapeAttribute(item.url) + '" alt="' + escapeAttribute(item.nombre || (title + " " + (index + 1))) + '" />';
                }

                if (kind === "video") {
                    return '<video src="' + escapeAttribute(item.url) + '" controls playsinline preload="metadata"></video>';
                }

                var rawName = item.nombre || ("Documento " + (index + 1));
                var extension = rawName.indexOf(".") >= 0 ? rawName.split(".").pop().toUpperCase() : "Archivo";
                return [
                    '<a class="bl26-reco-asset-doc" href="', escapeAttribute(item.url), '" target="_blank" rel="noopener noreferrer" title="', escapeAttribute(rawName), '">',
                    '<span class="bl26-reco-asset-doc-type">', escapeHtml(extension), '</span>',
                    '<span class="bl26-reco-asset-doc-copy">',
                    '<strong>', escapeHtml(rawName), '</strong>',
                    '<small>Ver documento</small>',
                    '</span>',
                    '</a>'
                ].join("");
            }).join(""),
            '</div>',
            '</section>'
        ].join("");
    }

    function normalizeAssetDetail(raw) {
        var multimedia = raw.Multimedia || raw.multimedia || [];
        var photos = [];
        var videos = [];
        var documents = [];

        (Array.isArray(multimedia) ? multimedia : []).forEach(function (item) {
            var url = item.UrlFirebase || item.urlFirebase || "";
            var nombre = item.NombreOriginal || item.nombreOriginal || "";
            if (!url) {
                return;
            }

            if (item.Foto || item.foto) {
                photos.push({ url: url, nombre: nombre });
                return;
            }

            if (item.Video || item.video) {
                videos.push({ url: url, nombre: nombre });
                return;
            }

            if (item.Documento || item.documento) {
                documents.push({ url: url, nombre: nombre });
            }
        });

        return {
            id: raw.Id || raw.id || "",
            codigo: raw.Codigo || raw.codigo || "",
            nombre: raw.Nombre || raw.nombre || "",
            tipoActivo: raw.TipoActivo || raw.tipoActivo || "",
            estadoOperativo: raw.EstadoOperativo || raw.estadoOperativo || "",
            sucursal: raw.Sucursal || raw.sucursal || "",
            marca: raw.Marca || raw.marca || "",
            proveedor: raw.Proveedor || raw.proveedor || "",
            tag: raw.Tag || raw.tag || "",
            numeroSerie: raw.NumeroSerie || raw.numeroSerie || "",
            descripcion: raw.Descripcion || raw.descripcion || "",
            fotos: photos,
            videos: videos,
            documentos: documents
        };
    }

    function renderMediaCaptureStatus(capture) {
        var messages = [];

        if (capture.error) {
            messages.push('<p class="bl26-reco-media-capture-copy error">' + escapeHtml(capture.error) + '</p>');
        } else if (capture.status === "recording") {
            messages.push('<p class="bl26-reco-media-capture-copy recording">Grabando · ' + escapeHtml(formatCaptureSeconds(capture.seconds)) + '</p>');
        } else if (capture.status === "preview") {
            messages.push('<p class="bl26-reco-media-capture-copy">La evidencia está lista para guardarse en esta pregunta.</p>');
        } else if (capture.mode === "photo") {
            messages.push('<p class="bl26-reco-media-capture-copy">Encuadra la toma y captura la fotografía cuando estés listo.</p>');
        } else if (capture.mode === "video") {
            messages.push('<p class="bl26-reco-media-capture-copy">Inicia la grabación y deténla al terminar para revisar el video.</p>');
        } else if (capture.mode === "audio") {
            messages.push('<p class="bl26-reco-media-capture-copy">El audio se captura en esta misma pantalla con permiso del micrófono.</p>');
        }

        return messages.join("");
    }

    function renderMediaCaptureActions(capture, flags) {
        var actions = ['<div class="bl26-reco-media-capture-actions">'];
        actions.push('<button type="button" class="bl26-reco-secondary" data-action="close-media-capture">Cancelar</button>');

        if (flags.isPhoto && flags.showLivePreview) {
            actions.push('<button type="button" class="bl26-reco-primary" data-action="capture-photo-frame">Capturar</button>');
        }

        if (flags.isVideo && capture.status === "ready") {
            actions.push('<button type="button" class="bl26-reco-primary" data-action="start-video-recording">Iniciar grabación</button>');
        }

        if ((flags.isVideo && flags.isRecordingVideo) || (flags.isAudio && flags.isRecordingAudio)) {
            actions.push('<button type="button" class="bl26-reco-primary" data-action="stop-media-recording">Detener</button>');
        }

        if (capture.status === "preview") {
            actions.push('<button type="button" class="bl26-reco-secondary" data-action="restart-media-capture">Repetir</button>');
            actions.push('<button type="button" class="bl26-reco-primary" data-action="save-media-capture">Guardar</button>');
        }

        actions.push('</div>');
        return actions.join("");
    }

    function renderPreparationPanel() {
        return [
            '<section class="bl26-reco-panel bl26-reco-setup-card is-primary bl26-reco-prep-screen">',
            '<div class="bl26-reco-prep-head">',
            '<p class="bl26-reco-eyebrow">Preparación</p>',
            '<h2>Confirma los datos antes de comenzar.</h2>',
            '</div>',
            '<div id="bl26-prep-body" class="bl26-reco-setup-body is-open bl26-reco-prep-body-simple">',
            renderContextFields(),
            '</div>',
            '</section>'
        ].join("");
    }

    function renderStatusCard() {
        return [
            '<section class="bl26-reco-status ', escapeHtml(state.statusTone), '">',
            '<strong>', escapeHtml(state.statusTitle), '</strong>',
            '<p>', escapeHtml(state.statusMessage), '</p>',
            '</section>'
        ].join("");
    }

    function renderProgressPanel(stats) {
        var expanded = shouldShowProgressExpanded();

        return [
            '<section class="bl26-reco-drawer-shell bl26-reco-progress-drawer', expanded ? ' is-open' : '', '">',
            '<button type="button" class="bl26-reco-drawer-backdrop" data-action="toggle-progress" aria-label="Cerrar progreso"></button>',
            '<div class="bl26-reco-drawer bl26-reco-drawer-bottom">',
            '<div class="bl26-reco-drawer-handle" aria-hidden="true"></div>',
            '<div class="bl26-reco-drawer-head">',
            '<div>',
            '<p class="bl26-reco-eyebrow">Progreso</p>',
            '<h2>Avance de la inspección</h2>',
            '</div>',
            '<button type="button" class="bl26-reco-ghost bl26-reco-drawer-close" data-action="toggle-progress">Cerrar</button>',
            '</div>',
            '<div id="bl26-progress-body" class="bl26-reco-progress-body is-open">',
            '<span class="bl26-reco-progress-number">', escapeHtml(String(stats.percentage)), '%</span>',
            '<div class="bl26-reco-progress-bar" aria-hidden="true"><span style="width:', escapeAttribute(String(stats.percentage)), '%;"></span></div>',
            '<p class="bl26-reco-progress-copy">', escapeHtml(stats.answered + " respondidas · " + stats.pendingRequired + " obligatorias pendientes"), '</p>',
            '<div class="bl26-reco-progress-meta">',
            renderProgressRow("Pregunta actual", (stats.currentNumber || 0) + " de " + (stats.total || 0)),
            renderProgressRow("Secciones", String(stats.sections)),
            renderProgressRow("Comentarios", String(stats.comments)),
            '</div>',
            '</div>',
            '</div>',
            '</section>'
        ].join("");
    }

    function renderProgressRow(label, value) {
        return [
            '<div class="bl26-reco-progress-row">',
            '<span>', escapeHtml(label), '</span>',
            '<strong>', escapeHtml(value), '</strong>',
            '</div>'
        ].join("");
    }

    function renderContextFields() {
        var selectedAsset = state.selectedAssetDetail ? normalizeAssetDetail(state.selectedAssetDetail) : null;
        var assetSummary = requiresAssetSelection()
            ? '<div class="bl26-reco-field"><span>Activo</span><article class="bl26-reco-mini-card compact bl26-reco-gps-card"><strong>' + escapeHtml(selectedAsset ? selectedAsset.nombre : "Activo pendiente") + '</strong><span>' + escapeHtml(selectedAsset ? [selectedAsset.codigo, selectedAsset.tipoActivo, selectedAsset.estadoOperativo, selectedAsset.sucursal].filter(Boolean).join(" · ") : "Se solicitará antes de iniciar la inspección") + '</span></article></div>'
            : '';

        return [
            '<section class="bl26-reco-stack bl26-reco-prep-form">',
            '<label class="bl26-reco-field">',
            '<span>Lista</span>',
            '<select id="bl26-list-select" ', isSelectDisabled("list"), '>',
            '<option value="">Selecciona una lista</option>',
            renderOptions(state.lists, state.selectedListId),
            '</select>',
            state.listError ? '<small>' + escapeHtml(state.listError) + '</small>' : '',
            '</label>',
            '<label class="bl26-reco-field">',
            '<span>Sucursal</span>',
            '<select id="bl26-branch-select" ', isSelectDisabled("branch"), '>',
            '<option value="">Selecciona una sucursal</option>',
            renderOptions(state.branches, state.selectedBranchId),
            '</select>',
            state.branchError ? '<small>' + escapeHtml(state.branchError) + '</small>' : '',
            '</label>',
            '<label class="bl26-reco-field">',
            '<span>Responsable</span>',
            '<select id="bl26-responsible-select" ', isSelectDisabled("responsible"), '>',
            '<option value="">Selecciona un responsable</option>',
            renderOptions(state.responsables, state.selectedResponsibleId),
            '</select>',
            state.responsibleError ? '<small>' + escapeHtml(state.responsibleError) + '</small>' : '',
            '</label>',
            '<div class="bl26-reco-field">',
            '<span>Ubicación GPS</span>',
            '<article class="bl26-reco-mini-card compact bl26-reco-gps-card"><strong>' + escapeHtml(state.location ? "GPS confirmado" : "GPS pendiente") + '</strong></article>',
            '</div>',
            assetSummary,
            '<button id="bl26-start-button" class="bl26-reco-primary bl26-reco-start-button" type="button" ', canStart() ? "" : "disabled", '>Iniciar inspección</button>',
            '</section>'
        ].join("");
    }

    function renderQuestionPanel(stats) {
        return [
            '<main class="bl26-reco-question-panel">',
            renderQuestionTopBar(stats),
            '<section class="bl26-reco-panel bl26-reco-question-stage">',
            renderQuestionState(stats),
            '</section>',
            '</main>'
        ].join("");
    }

    function renderQuestionTopBar(stats) {
        var activeEntry = getActiveEntry();
        var hasQuestions = !!(state.inspection && state.inspection.entries.length);

        return [
            '<section class="bl26-reco-capture-toolbar">',
            '<div class="bl26-reco-capture-meta">',
            '<span class="bl26-reco-progress-chip">', escapeHtml(String(stats.currentNumber || 0)), ' / ', escapeHtml(String(stats.total || 0)), '</span>',
            activeEntry && activeEntry.required ? '<span class="bl26-reco-required">Obligatoria</span>' : '<span class="bl26-reco-optional">Opcional</span>',
            '</div>',
            '<div class="bl26-reco-capture-actions">',
            state.selectedAssetDetail ? '<button type="button" class="bl26-reco-ghost bl26-reco-inline-progress-button" data-action="open-asset-drawer">Ver información del activo</button>' : '',
            '<button type="button" class="bl26-reco-ghost bl26-reco-inline-index-button" data-action="toggle-quick-nav" aria-expanded="', state.quickNavExpanded ? 'true' : 'false', '" ', hasQuestions ? '' : 'disabled', '>Índice</button>',
            '<button type="button" class="bl26-reco-ghost bl26-reco-inline-progress-button" data-action="toggle-progress" aria-expanded="', shouldShowProgressExpanded() ? 'true' : 'false', '">Ver progreso</button>',
            '</div>',
            '</section>'
        ].join("");
    }

    function renderQuestionState(stats) {
        if (state.sessionExpired) {
            return renderEmpty("Sesión vencida", "Necesitas volver a entrar al sistema antes de continuar.");
        }

        if (state.questionnaireState === "loading") {
            return renderEmpty("Cargando cuestionario", "Estamos cargando las preguntas de la lista seleccionada.");
        }

        if (state.questionnaireState === "error") {
            return renderEmpty("No pudimos mostrar el cuestionario", state.questionnaireError || "Ocurrió un problema al recuperar las preguntas.");
        }

        if (state.questionnaireState === "empty") {
            return renderEmpty("Sin preguntas disponibles", "La lista seleccionada no devolvió preguntas para esta inspección.");
        }

        if (state.questionnaireState !== "loaded" || !state.inspection) {
            return renderEmpty("Completa la preparación para comenzar.", "Cuando completes lista, sucursal, responsable y ubicación mostraremos aquí la pregunta activa.");
        }

        var activeEntry = getActiveEntry();

        if (!activeEntry) {
            return renderEmpty("No pudimos mostrar esta pregunta", "Intenta volver a seleccionar la lista para reconstruir el cuestionario.");
        }

        var section = getSectionForQuestion(activeEntry.id);
        var validation = getValidation(activeEntry);

        return [
            '<div class="bl26-reco-question-shell">',
            '<section class="bl26-reco-active-card">',
            '<div class="bl26-reco-active-head">',
            '<div class="bl26-reco-active-heading">',
            renderQuestionHierarchy(activeEntry, section),
            '<h3>', escapeHtml(activeEntry.prompt), '</h3>',
            activeEntry.instructions ? '<p class="bl26-reco-copy">' + escapeHtml(activeEntry.instructions) + '</p>' : '',
            '</div>',
            '<div class="bl26-reco-active-meta">',
            '<span class="bl26-reco-question-index">Pregunta ' + escapeHtml(String(activeEntry.number)) + ' de ' + escapeHtml(String(stats.total)) + '</span>',
            '</div>',
            '</div>',
            '<div class="bl26-reco-question-copy">',
            activeEntry.note ? '<div class="bl26-reco-reference"><strong>Referencia</strong><span>' + escapeHtml(activeEntry.note) + '</span></div>' : '',
            '</div>',
            '<div class="bl26-reco-control-zone">',
            renderQuestionControl(activeEntry),
            '</div>',
            renderOptionalPanels(activeEntry),
            renderValidationState(validation),
            renderNavigation(activeEntry),
            '</section>',
            '</div>'
        ].join("");
    }

    function renderQuestionControl(entry) {
        if (!entry.typeMeta) {
            console.warn("[RecoleccionesBL26] Tipo de pregunta no soportado", {
                questionId: entry && entry.id,
                prompt: entry && entry.prompt,
                typeKey: entry && entry.typeKey
            });
            return '<div class="bl26-reco-unknown">Esta pregunta no se puede capturar en esta pantalla.</div>';
        }

        if (entry.hasOptionsIssue) {
            return '<div class="bl26-reco-unknown">Esta pregunta no tiene opciones disponibles para capturarse.</div>';
        }

        var answer = getAnswer(entry.id);
        var disabled = !state.canWrite ? 'disabled' : '';

        if (entry.typeKey === "0") {
            return '<input type="text" data-question-id="' + escapeAttribute(entry.id) + '" data-control="text" placeholder="Escribe tu respuesta aquí" value="' + escapeAttribute(answer || "") + '" ' + disabled + ' />';
        }

        if (entry.typeKey === "1") {
            return [
                '<div class="bl26-reco-rating-group stars">',
                [1, 2, 3, 4, 5].map(function (score) {
                    return '<button type="button" class="bl26-reco-rating star' + (Number(answer || 0) >= score ? ' is-active' : '') + '" aria-label="Calificar con ' + score + ' estrellas" data-action="set-rating" data-question-id="' + escapeAttribute(entry.id) + '" data-rating="' + score + '" ' + disabled + '>★</button>';
                }).join(""),
                '</div>'
            ].join("");
        }

        if (entry.typeKey === "2") {
            return [
                '<div class="bl26-reco-answer-list">',
                entry.options.map(function (option, index) {
                    var checked = answer === option.value ? 'checked' : '';
                    var inputId = "bl26-radio-" + sanitizeId(entry.id + "-" + index);
                    return [
                        '<label class="bl26-reco-choice', checked ? ' is-selected' : '', '">',
                        '<input id="', inputId, '" type="radio" name="bl26-radio-', escapeAttribute(entry.id), '" value="', escapeAttribute(option.value), '" data-question-id="', escapeAttribute(entry.id), '" data-control="radio" ', checked, ' ', disabled, ' />',
                        '<span>', escapeHtml(option.label), '</span>',
                        '</label>'
                    ].join("");
                }).join(""),
                '</div>'
            ].join("");
        }

        if (entry.typeKey === "3") {
            var selectedValues = Array.isArray(answer) ? answer : [];
            return [
                '<div class="bl26-reco-answer-list">',
                entry.options.map(function (option, index) {
                    var checked = selectedValues.indexOf(option.value) >= 0 ? 'checked' : '';
                    var inputId = "bl26-check-" + sanitizeId(entry.id + "-" + index);
                    return [
                        '<label class="bl26-reco-choice', checked ? ' is-selected' : '', '">',
                        '<input id="', inputId, '" type="checkbox" value="', escapeAttribute(option.value), '" data-question-id="', escapeAttribute(entry.id), '" data-control="checkbox" ', checked, ' ', disabled, ' />',
                        '<span>', escapeHtml(option.label), '</span>',
                        '</label>'
                    ].join("");
                }).join(""),
                '</div>'
            ].join("");
        }

        if (entry.typeKey === "4") {
            return '<textarea rows="4" data-question-id="' + escapeAttribute(entry.id) + '" data-control="text" placeholder="Escribe tu respuesta aquí" ' + disabled + '>' + escapeHtml(answer || "") + '</textarea>';
        }

        if (entry.typeKey === "5") {
            return '<input type="number" data-question-id="' + escapeAttribute(entry.id) + '" data-control="number" placeholder="Captura un valor numérico" value="' + escapeAttribute(answer || "") + '" ' + disabled + ' />';
        }

        if (entry.typeKey === "6") {
            return '<input type="date" data-question-id="' + escapeAttribute(entry.id) + '" data-control="date" value="' + escapeAttribute(answer || "") + '" ' + disabled + ' />';
        }

        if (entry.typeKey === "7") {
            return '<input type="datetime-local" data-question-id="' + escapeAttribute(entry.id) + '" data-control="datetime" value="' + escapeAttribute(answer || "") + '" ' + disabled + ' />';
        }

        if (entry.typeKey === "8") {
            return '<input type="time" data-question-id="' + escapeAttribute(entry.id) + '" data-control="time" value="' + escapeAttribute(answer || "") + '" ' + disabled + ' />';
        }

        return '<div class="bl26-reco-unknown">Esta pregunta no se puede capturar en esta pantalla.</div>';
    }

    function renderCommentField(entry) {
        return [
            '<label class="bl26-reco-field bl26-reco-comment-field">',
            '<span>Comentario</span>',
            '<textarea rows="3" data-question-id="', escapeAttribute(entry.id), '" data-control="comment" placeholder="Agrega un comentario si aplica" ', state.canWrite ? '' : 'disabled', '>', escapeHtml(getComment(entry.id) || ""), '</textarea>',
            '</label>'
        ].join("");
    }

    function renderOptionalPanels(entry) {
        var answer = getAnswer(entry.id);
        var hasAnswer = isQuestionAnswered(entry, answer);
        var hasComment = !!normalizeValue(getComment(entry.id));
        var hasFinding = !!normalizeValue(getFinding(entry.id));
        var media = getMediaBucket(entry.id);
        var hasMedia = media.photos.length || media.videos.length || media.audios.length;
        var shouldShow = hasAnswer || hasComment || hasFinding || hasMedia || isOptionalPanelExpanded(entry.id, "comment") || isOptionalPanelExpanded(entry.id, "evidence") || isOptionalPanelExpanded(entry.id, "finding");

        if (!shouldShow) {
            return '';
        }

        return [
            '<section class="bl26-reco-optional-stack">',
            '<div class="bl26-reco-optional-actions">',
            renderOptionalAction(entry, "comment", "Agregar comentario"),
            renderOptionalAction(entry, "evidence", "Agregar evidencia"),
            renderOptionalAction(entry, "finding", "Registrar hallazgo"),
            '</div>',
            renderOptionalBody(entry),
            '</section>'
        ].join("");
    }

    function renderOptionalAction(entry, panelKey, label) {
        var expanded = isOptionalPanelExpanded(entry.id, panelKey);
        return [
            '<button type="button" class="bl26-reco-optional-trigger" data-action="toggle-optional-panel" data-question-id="', escapeAttribute(entry.id), '" data-panel="', escapeAttribute(panelKey), '" aria-expanded="', expanded ? 'true' : 'false', '">',
            '<span>', escapeHtml(label), '</span>',
            '<span class="bl26-reco-optional-icon" aria-hidden="true">', expanded ? '▴' : '▾', '</span>',
            '</button>'
        ].join("");
    }

    function renderOptionalBody(entry) {
        var blocks = [];

        if (isOptionalPanelExpanded(entry.id, "evidence")) {
            blocks.push(renderMediaModule(entry));
        }

        if (isOptionalPanelExpanded(entry.id, "comment")) {
            blocks.push([
                '<div class="bl26-reco-optional-body is-open">',
                renderCommentField(entry),
                '</div>'
            ].join(""));
        }

        if (isOptionalPanelExpanded(entry.id, "finding")) {
            blocks.push([
                '<div class="bl26-reco-optional-body is-open">',
                '<label class="bl26-reco-field bl26-reco-comment-field">',
                '<span>Hallazgo</span>',
                '<textarea rows="3" data-question-id="', escapeAttribute(entry.id), '" data-control="finding" placeholder="Describe el hallazgo detectado" ', state.canWrite ? '' : 'disabled', '>', escapeHtml(getFinding(entry.id) || ""), '</textarea>',
                '</label>',
                '</div>'
            ].join(""));
        }

        return blocks.join("");
    }

    function renderMediaModule(entry) {
        var media = getMediaBucket(entry.id);

        return [
            '<div class="bl26-reco-optional-body is-open bl26-reco-media-module">',
            '<div class="bl26-reco-media-actions">',
            renderMediaButton(entry.id, "photo", "fa-camera", "Tomar foto", media.photos.length),
            renderMediaButton(entry.id, "video", "fa-video-camera", "Grabar video", media.videos.length),
            renderMediaButton(entry.id, "audio", "fa-microphone", "Grabar audio", media.audios.length),
            '</div>',
            renderMediaHint(entry.id),
            renderMediaList("Fotos", media.photos, entry.id, "photo"),
            renderMediaList("Videos", media.videos, entry.id, "video"),
            renderMediaList("Audios", media.audios, entry.id, "audio"),
            '<input id="bl26-media-photo-', escapeAttribute(sanitizeId(entry.id)), '" type="file" accept="image/*" capture="environment" multiple data-question-id="', escapeAttribute(entry.id), '" data-media-type="photo" data-control="media-upload" hidden />',
            '<input id="bl26-media-video-', escapeAttribute(sanitizeId(entry.id)), '" type="file" accept="video/*" capture="environment" multiple data-question-id="', escapeAttribute(entry.id), '" data-media-type="video" data-control="media-upload" hidden />',
            '</div>'
        ].join("");
    }

    function renderMediaButton(questionId, mediaType, icon, label, count) {
        return [
            '<button type="button" class="bl26-reco-media-trigger" data-action="open-media-input" data-question-id="', escapeAttribute(questionId), '" data-media-type="', escapeAttribute(mediaType), '">',
            '<span class="bl26-reco-media-trigger-copy"><i class="fa ', escapeAttribute(icon), '" aria-hidden="true"></i><span>', escapeHtml(label), '</span></span>',
            '<span class="bl26-reco-media-trigger-meta"><strong class="bl26-reco-media-count">', escapeHtml(String(count)), '</strong><span class="bl26-reco-media-trigger-chevron" aria-hidden="true">▾</span></span>',
            '</button>'
        ].join("");
    }

    function renderMediaHint(questionId) {
        var capture = state.mediaCapture || {};
        if (capture.questionId !== questionId || !capture.status || capture.status === "idle") {
            return '';
        }

        if (capture.error) {
            return '<p class="bl26-reco-media-inline-status error">' + escapeHtml(capture.error) + '</p>';
        }

        if (capture.status === "recording") {
            return '<p class="bl26-reco-media-inline-status recording">Grabando ' + escapeHtml(formatCaptureSeconds(capture.seconds)) + '</p>';
        }

        if (capture.status === "preview") {
            return '<p class="bl26-reco-media-inline-status">Vista previa lista para guardarse.</p>';
        }

        return '<p class="bl26-reco-media-inline-status">La captura está abierta y lista para continuar.</p>';
    }

    function renderMediaList(label, items, questionId, mediaType) {
        if (!items.length) {
            return '';
        }

        return [
            '<div class="bl26-reco-media-list">',
            '<span class="bl26-reco-media-label">', escapeHtml(label), '</span>',
            '<div class="bl26-reco-media-grid">',
            items.map(function (item, index) {
                return [
                    '<article class="bl26-reco-media-card">',
                    mediaType === "photo" && item.previewUrl ? '<img src="' + escapeAttribute(item.previewUrl) + '" alt="' + escapeAttribute(item.name || ("Foto " + (index + 1))) + '" />' : '',
                    mediaType === "video" && item.previewUrl ? '<video src="' + escapeAttribute(item.previewUrl) + '" controls playsinline preload="metadata"></video>' : '',
                    mediaType === "audio" && item.previewUrl ? '<audio src="' + escapeAttribute(item.previewUrl) + '" controls preload="metadata"></audio>' : '',
                    '<div class="bl26-reco-media-card-meta">',
                    '<strong>', escapeHtml(item.name || (label + " " + (index + 1))), '</strong>',
                    item.status ? '<span>' + escapeHtml(resolveMediaStatusCopy(item.status)) + '</span>' : '',
                    '</div>',
                    '<button type="button" class="bl26-reco-media-remove" data-action="remove-media-item" data-question-id="', escapeAttribute(questionId), '" data-media-type="', escapeAttribute(mediaType), '" data-media-index="', escapeAttribute(String(index)), '">Eliminar</button>',
                    '</article>'
                ].join("");
            }).join(""),
            '</div>',
            '</div>'
        ].join("");
    }

    function renderValidationState(validation) {
        if (validation && validation.hidden) {
            return '';
        }

        if (!validation.message) {
            return '<div class="bl26-reco-validation success">Lista para continuar</div>';
        }

        var tone = validation.severity === "warning" ? "warning" : "danger";
        return '<div class="bl26-reco-validation ' + tone + '">' + escapeHtml(validation.message) + '</div>';
    }

    function renderNavigation(entry) {
        var stats = getInspectionStats();
        var hasAnswer = isQuestionAnswered(entry, getAnswer(entry.id));
        var hasComment = !!normalizeValue(getComment(entry.id));
        var clearDisabled = (!hasAnswer && !hasComment) || !state.canWrite;
        var isLastQuestion = stats.currentNumber >= stats.total;
        var primaryLabel = isLastQuestion ? "Finalizar inspección" : "Siguiente";
        var validation = getValidation(entry);
        var primaryDisabled = !state.canWrite || state.isFinalizing || (isLastQuestion && !!validation.message);

        return [
            '<div class="bl26-reco-navigation">',
            '<div class="bl26-reco-navigation-main">',
            '<button type="button" class="bl26-reco-secondary" data-action="prev-question" ', stats.currentNumber <= 1 ? 'disabled' : '', '>Anterior</button>',
            '<button type="button" class="bl26-reco-primary" data-action="next-question" ', primaryDisabled ? 'disabled' : '', '>', primaryLabel, '</button>',
            '</div>',
            '<button type="button" class="bl26-reco-ghost bl26-reco-clear-button" data-action="clear-question" data-question-id="', escapeAttribute(entry.id), '" ', clearDisabled ? 'disabled' : '', '>Limpiar respuesta</button>',
            '</div>'
        ].join("");
    }

    function renderRightRail(stats) {
        var canExpand = !!(state.inspection && state.inspection.entries.length);
        var mobilePanelState = state.quickNavExpanded ? "is-open" : "";

        return [
            '<aside class="bl26-reco-drawer-shell bl26-reco-index-drawer ', mobilePanelState, '">',
            '<button type="button" class="bl26-reco-drawer-backdrop" data-action="toggle-quick-nav" aria-label="Cerrar índice"></button>',
            '<div class="bl26-reco-drawer bl26-reco-index-panel ', mobilePanelState, '">',
            '<div class="bl26-reco-drawer-handle" aria-hidden="true"></div>',
            '<div class="bl26-reco-drawer-head">',
            '<div>',
            '<p class="bl26-reco-eyebrow">Navegación</p>',
            '<h2>Índice</h2>',
            '</div>',
            '<button type="button" class="bl26-reco-ghost bl26-reco-drawer-close" data-action="toggle-quick-nav" aria-expanded="', state.quickNavExpanded ? 'true' : 'false', '" ', canExpand ? '' : 'disabled', '>Cerrar</button>',
            '</div>',
            '<div class="bl26-reco-index-body">',
            renderQuickNavLegend(),
            renderQuickNav(),
            '</div>',
            '</div>',
            '</aside>'
        ].join("");
    }

    function renderQuickNavLegend() {
        return [
            '<section class="bl26-reco-legend">',
            '<span><i class="current"></i>Actual</span>',
            '<span><i class="answered"></i>Respondida</span>',
            '<span><i class="required"></i>Obligatoria pendiente</span>',
            '<span><i class="pending"></i>Pendiente</span>',
            '</section>'
        ].join("");
    }

    function renderQuickNav() {
        if (!state.inspection || !state.inspection.entries.length) {
            return '<div class="bl26-reco-inline-note">El índice estará disponible al cargar las preguntas.</div>';
        }

        return [
            '<section class="bl26-reco-quick-nav">',
            state.inspection.entries.map(function (entry) {
                var status = getQuestionStatus(entry);
                return [
                    '<button type="button" class="bl26-reco-nav-item ', escapeHtml(status), '" data-action="go-question" data-question-id="', escapeAttribute(entry.id), '">',
                    '<strong>', escapeHtml(String(entry.number)), '</strong>',
                    '<span>', escapeHtml(entry.subcategory || SUBCATEGORY_FALLBACK), '</span>',
                    '</button>'
                ].join("");
            }).join(""),
            '</section>'
        ].join("");
    }

    function renderMiniCard(label, value) {
        return [
            '<article class="bl26-reco-mini-card compact">',
            '<span>', escapeHtml(label), '</span>',
            '<strong>', escapeHtml(value), '</strong>',
            '</article>'
        ].join("");
    }

    function renderContextChip(label, value) {
        return [
            '<article class="bl26-reco-chip">',
            '<span>', escapeHtml(label), '</span>',
            '<strong>', escapeHtml(value), '</strong>',
            '</article>'
        ].join("");
    }

    function renderEmpty(title, message) {
        return [
            '<section class="bl26-reco-empty">',
            '<strong>', escapeHtml(title), '</strong>',
            '<p>', escapeHtml(message), '</p>',
            '</section>'
        ].join("");
    }

    function bindEvents() {
        var listSelect = document.getElementById("bl26-list-select");
        var branchSelect = document.getElementById("bl26-branch-select");
        var responsibleSelect = document.getElementById("bl26-responsible-select");
        var startButton = document.getElementById("bl26-start-button");
        var exitButton = document.getElementById("bl26-exit-button");

        if (listSelect) {
            listSelect.addEventListener("change", function (event) {
                state.selectedListId = event.target.value;
                state.selectedListName = lookupText(state.lists, state.selectedListId);
                applySelectedListMetadata();
                resetAssetSelectionState();
                state.location = null;
                state.prepExpanded = true;
                resetQuestionnaireState();
                updateStatus("ready-to-select", "info", "Lista seleccionada", "Completa sucursal y responsable para continuar.");
                persistUiChrome();
                render();
            });
        }

        if (branchSelect) {
            branchSelect.addEventListener("change", function (event) {
                state.selectedBranchId = event.target.value;
                state.selectedBranchName = lookupText(state.branches, state.selectedBranchId);
                state.selectedResponsibleId = "";
                state.selectedResponsibleName = "";
                state.location = null;
                state.prepExpanded = true;
                resetQuestionnaireState();
                persistUiChrome();
                render();

                if (state.selectedBranchId) {
                    loadResponsables(state.selectedBranchId);
                } else {
                    state.responsables = [];
                    state.responsibleState = "idle";
                    updateStatus("ready-to-select", "info", "Sucursal removida", "Selecciona una sucursal para cargar sus responsables.");
                    render();
                }
            });
        }

        if (responsibleSelect) {
            responsibleSelect.addEventListener("change", function (event) {
                state.selectedResponsibleId = event.target.value;
                state.selectedResponsibleName = lookupText(state.responsables, state.selectedResponsibleId);
                state.location = null;
                state.prepExpanded = !isPreparationComplete();
                resetQuestionnaireState();
                updateStatus("ready-to-start", "info", "Contexto completo", requiresAssetSelection() ? "Ya puedes iniciar la inspección para seleccionar el activo." : "Ya puedes iniciar la inspección y solicitar ubicación.");
                persistUiChrome();
                render();
            });
        }

        if (startButton) {
            startButton.addEventListener("click", function () {
                startInspection();
            });
        }

        if (exitButton) {
            exitButton.addEventListener("click", function () {
                if (!confirmExitIfNeeded()) {
                    return;
                }

                state.leavingPage = true;
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = "/Home/Index";
                }
            });
        }

        root.querySelectorAll("[data-action='prev-question']").forEach(function (button) {
            button.addEventListener("click", function () {
                moveQuestion(-1);
            });
        });

        root.querySelectorAll("[data-action='next-question']").forEach(function (button) {
            button.addEventListener("click", function () {
                moveQuestion(1);
            });
        });

        root.querySelectorAll("[data-action='clear-question']").forEach(function (button) {
            button.addEventListener("click", function () {
                clearQuestion(button.dataset.questionId);
            });
        });

        root.querySelectorAll("[data-action='go-question']").forEach(function (button) {
            button.addEventListener("click", function () {
                setActiveQuestion(button.dataset.questionId);
            });
        });

        root.querySelectorAll("[data-action='go-section']").forEach(function (button) {
            button.addEventListener("click", function () {
                var sectionIndex = Number(button.dataset.sectionIndex || 0);
                goToSection(sectionIndex);
            });
        });

        root.querySelectorAll("[data-action='toggle-prep']").forEach(function (button) {
            button.addEventListener("click", function () {
                state.prepExpanded = !shouldShowPreparationExpanded();
                persistUiChrome();
                render();
            });
        });

        root.querySelectorAll("[data-action='toggle-progress']").forEach(function (button) {
            button.addEventListener("click", function () {
                toggleProgressPanel();
            });
        });

        root.querySelectorAll("[data-action='toggle-quick-nav']").forEach(function (button) {
            button.addEventListener("click", function () {
                toggleQuickNavPanel();
            });
        });

        root.querySelectorAll("[data-action='open-asset-drawer']").forEach(function (button) {
            button.addEventListener("click", function () {
                openAssetDrawer();
            });
        });

        root.querySelectorAll("[data-action='close-asset-drawer']").forEach(function (button) {
            button.addEventListener("click", function () {
                closeAssetDrawer();
            });
        });

        root.querySelectorAll("[data-action='select-asset']").forEach(function (button) {
            button.addEventListener("click", function () {
                selectAsset(button.dataset.assetId);
            });
        });

        root.querySelectorAll("[data-action='confirm-asset-selection']").forEach(function (button) {
            button.addEventListener("click", function () {
                beginInspectionAfterAssetSelection();
            });
        });

        var assetSearchInput = document.getElementById("bl26-asset-search");
        if (assetSearchInput) {
            assetSearchInput.addEventListener("input", function (event) {
                state.assetSearchTerm = event.target.value || "";
                render();
                window.clearTimeout(searchTimer);
                searchTimer = window.setTimeout(function () {
                    loadAssets(state.assetSearchTerm);
                }, 260);
            });
        }

        root.querySelectorAll("[data-action='set-rating']").forEach(function (button) {
            button.addEventListener("click", function () {
                if (!state.canWrite) {
                    return;
                }

                setAnswerValue(button.dataset.questionId, button.dataset.rating);
            });
        });

        root.querySelectorAll("[data-control='radio']").forEach(function (input) {
            input.addEventListener("change", function () {
                if (!state.canWrite) {
                    return;
                }

                setAnswerValue(input.dataset.questionId, input.value);
            });
        });

        root.querySelectorAll("[data-control='checkbox']").forEach(function (input) {
            input.addEventListener("change", function () {
                if (!state.canWrite) {
                    return;
                }

                toggleCheckboxValue(input.dataset.questionId, input.value, input.checked);
            });
        });

        root.querySelectorAll("[data-control='text'], [data-control='number'], [data-control='date'], [data-control='datetime'], [data-control='time']").forEach(function (input) {
            input.addEventListener("input", function () {
                if (!state.canWrite) {
                    return;
                }

                setAnswerValue(input.dataset.questionId, input.value, {
                    preserveFocus: true
                });
            });
        });

        root.querySelectorAll("[data-control='comment']").forEach(function (input) {
            input.addEventListener("input", function () {
                if (!state.canWrite) {
                    return;
                }

                setCommentValue(input.dataset.questionId, input.value, {
                    preserveFocus: true
                });
            });
        });

        root.querySelectorAll("[data-control='finding']").forEach(function (input) {
            input.addEventListener("input", function () {
                if (!state.canWrite) {
                    return;
                }

                setFindingValue(input.dataset.questionId, input.value, {
                    preserveFocus: true
                });
            });
        });

        root.querySelectorAll("[data-action='toggle-optional-panel']").forEach(function (button) {
            button.addEventListener("click", function () {
                toggleOptionalPanel(button.dataset.questionId, button.dataset.panel);
            });
        });

        root.querySelectorAll("[data-action='open-media-input']").forEach(function (button) {
            button.addEventListener("click", function () {
                if (!state.canWrite) {
                    return;
                }

                if (startMediaCapture(button.dataset.questionId, button.dataset.mediaType)) {
                    return;
                }

                if (button.dataset.mediaType === "audio") {
                    window.alert("Este dispositivo no permite grabar audio desde el navegador.");
                    return;
                }

                var input = document.getElementById("bl26-media-" + button.dataset.mediaType + "-" + sanitizeId(button.dataset.questionId));
                if (input) {
                    input.click();
                }
            });
        });

        root.querySelectorAll("[data-control='media-upload']").forEach(function (input) {
            input.addEventListener("change", function (event) {
                queueMediaFiles(input.dataset.questionId, input.dataset.mediaType, event.target.files);
                event.target.value = "";
            });
        });

        root.querySelectorAll("[data-action='remove-media-item']").forEach(function (button) {
            button.addEventListener("click", function () {
                removeMediaItem(button.dataset.questionId, button.dataset.mediaType, Number(button.dataset.mediaIndex));
            });
        });

        root.querySelectorAll("[data-action='close-media-capture']").forEach(function (button) {
            button.addEventListener("click", function () {
                closeMediaCapture();
            });
        });

        root.querySelectorAll("[data-action='capture-photo-frame']").forEach(function (button) {
            button.addEventListener("click", function () {
                capturePhotoFrame();
            });
        });

        root.querySelectorAll("[data-action='start-video-recording']").forEach(function (button) {
            button.addEventListener("click", function () {
                startVideoRecording();
            });
        });

        root.querySelectorAll("[data-action='stop-media-recording']").forEach(function (button) {
            button.addEventListener("click", function () {
                stopActiveMediaRecording();
            });
        });

        root.querySelectorAll("[data-action='restart-media-capture']").forEach(function (button) {
            button.addEventListener("click", function () {
                restartMediaCapture();
            });
        });

        root.querySelectorAll("[data-action='save-media-capture']").forEach(function (button) {
            button.addEventListener("click", function () {
                saveMediaCapture();
            });
        });
    }

    function moveQuestion(delta) {
        if (!state.inspection || !state.inspection.entries.length) {
            return;
        }

        var currentIndex = getActiveIndex();
        var nextIndex = currentIndex + delta;

        if (delta > 0 && currentIndex === state.inspection.entries.length - 1) {
            finalizeInspection();
            return;
        }

        if (nextIndex < 0 || nextIndex >= state.inspection.entries.length) {
            return;
        }

        setActiveQuestion(state.inspection.entries[nextIndex].id);
    }

    function goToSection(sectionIndex) {
        if (!state.inspection || !state.inspection.sections[sectionIndex]) {
            return;
        }

        var questionId = state.inspection.sections[sectionIndex].questionIds[0];
        setActiveQuestion(questionId);
    }

    function setActiveQuestion(questionId) {
        if (!state.inspection) {
            return;
        }

        var entry = getEntryById(questionId);
        if (!entry) {
            return;
        }

        state.inspection.activeQuestionId = entry.id;
        state.inspection.touchedById[entry.id] = true;
        closeSecondaryPanels();
        render();
    }

    function clearQuestion(questionId) {
        if (!state.inspection || !state.canWrite) {
            return;
        }

        delete state.inspection.answersById[questionId];
        delete state.inspection.commentsById[questionId];
        delete state.inspection.findingsById[questionId];
        state.inspection.touchedById[questionId] = true;
        syncExitProtection();
        render();
    }

    function finalizeInspection() {
        if (!state.inspection || state.isFinalizing) {
            return;
        }

        var completion = validateInspectionCompletion();
        if (!completion.isComplete) {
            state.isFinalizing = false;
            closeSecondaryPanels();

            if (completion.firstPending) {
                setActiveQuestion(completion.firstPending.id);
            }

            showUserMessage("warning", "Completa las preguntas obligatorias antes de finalizar.", function () {
                focusPrimaryInputForActiveQuestion();
            });
            return;
        }

        var payload = buildFinalResponsesPayload();
        if (!payload.length) {
            showUserMessage("warning", "Responde al menos una pregunta antes de finalizar la inspección.");
            return;
        }

        showConfirmationMessage("¿Deseas finalizar la inspección?", function () {
            state.isFinalizing = true;
            render();

            postJson("/ContestarLista/GuardarRespuestaBL26", payload)
                .then(function (response) {
                    state.isFinalizing = false;

                    if (!response || response.d !== "Ok") {
                        showUserMessage("error", response && response.d ? response.d : "No fue posible finalizar la inspección.");
                        render();
                        return;
                    }

                    state.leavingPage = true;
                    showUserMessage("success", "La inspección se guardó correctamente.", function () {
                        window.location.href = "/ContestarLista/RecoleccionesBL26";
                    });
                })
                .catch(function () {
                    state.isFinalizing = false;
                    showUserMessage("error", "No fue posible finalizar la inspección en este momento.");
                    render();
                });
        });
    }

    function buildFinalResponsesPayload() {
        if (!state.inspection || !state.inspection.entries.length) {
            return [];
        }

        var eventId = buildInspectionEventId();
        var payload = [];

        state.inspection.entries.forEach(function (entry) {
            var answer = getAnswer(entry.id);
            if (!isQuestionAnswered(entry, answer)) {
                return;
            }

            if (entry.typeKey === "3" && Array.isArray(answer)) {
                answer.forEach(function (selectedValue) {
                    payload.push(buildResponseItem(entry, selectedValue, eventId));
                });
                return;
            }

            payload.push(buildResponseItem(entry, answer, eventId));
        });

        return payload;
    }

    function buildResponseItem(entry, rawAnswer, eventId) {
        var resolvedOption = resolveOption(entry, rawAnswer);
        var responseValue = entry.typeKey === "2" || entry.typeKey === "3"
            ? (resolvedOption ? resolvedOption.label : normalizeValue(rawAnswer))
            : normalizeValue(rawAnswer);
        var answerValue = resolvedOption ? resolvedOption.value : normalizeValue(rawAnswer);
        var comment = normalizeValue(getComment(entry.id));
        var media = getMediaBucket(entry.id);

        return {
            llav: "",
            idLista: state.selectedListId,
            idPregunta: entry.id,
            respuestaValor: responseValue,
            notas: comment || "N/A",
            idPrograma: state.selectedListId,
            idTipoPregunta: Number(entry.typeKey) || 0,
            explicacion: "0",
            valor: resolveAnswerNumericValue(entry, answerValue),
            calificacion: resolveAnswerScore(entry, answerValue),
            obligatoria: !!entry.required,
            evento: eventId,
            urlVideos: collectUploadedMediaUrls(media.videos),
            urlFotos: collectUploadedMediaUrls(media.photos),
            RespuestaCorrecta: entry.correctAnswer || "",
            idSucursal: state.selectedBranchId,
            idUsuario: state.selectedResponsibleId,
            idActivo: state.selectedAssetId,
            latitud: state.location && state.location.latitude !== undefined ? String(state.location.latitude) : "",
            longitud: state.location && state.location.longitude !== undefined ? String(state.location.longitude) : "",
            idEmpresa: context.idEmpresa,
            cadena: context.cadena,
            empresa: context.empresa,
            correo: context.correo
        };
    }

    function buildInspectionEventId() {
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return window.crypto.randomUUID();
        }

        return "bl26-" + Date.now();
    }

    function resolveOption(entry, rawAnswer) {
        if (!entry || !entry.options || !entry.options.length) {
            return null;
        }

        var normalizedAnswer = normalizeValue(rawAnswer);
        return entry.options.find(function (option) {
            return option.value === normalizedAnswer;
        }) || null;
    }

    function resolveAnswerNumericValue(entry, rawAnswer) {
        if (entry && (entry.typeKey === "1" || entry.typeKey === "5")) {
            return Number(rawAnswer) || 0;
        }

        var numericValue = Number(rawAnswer);
        return Number.isFinite(numericValue) ? numericValue : 0;
    }

    function resolveAnswerScore(entry, rawAnswer) {
        if (!entry || !entry.correctAnswer) {
            return 0;
        }

        return normalizeValue(rawAnswer) === entry.correctAnswer ? resolveAnswerNumericValue(entry, rawAnswer) : 0;
    }

    function collectUploadedMediaUrls(items) {
        return (Array.isArray(items) ? items : [])
            .map(function (item) {
                return normalizeValue(item && item.uploadedUrl);
            })
            .filter(function (value) {
                return !!value;
            });
    }

    function showUserMessage(kind, message, onClose) {
        if (window.Swal && typeof window.Swal.fire === "function") {
            window.Swal.fire({
                text: message,
                icon: kind === "success" ? "success" : kind === "warning" ? "warning" : "error",
                buttonsStyling: false,
                confirmButtonText: "Ok, entendido",
                customClass: {
                    confirmButton: "btn font-weight-bold btn-light-primary"
                }
            }).then(function () {
                if (typeof onClose === "function") {
                    onClose();
                }
            });
            return;
        }

        window.alert(message);
        if (typeof onClose === "function") {
            onClose();
        }
    }

    function showConfirmationMessage(message, onConfirm) {
        if (window.Swal && typeof window.Swal.fire === "function") {
            window.Swal.fire({
                text: message,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sí, finalizar",
                cancelButtonText: "Seguir capturando",
                buttonsStyling: false,
                customClass: {
                    confirmButton: "btn font-weight-bold btn-light-primary",
                    cancelButton: "btn font-weight-bold btn-light"
                }
            }).then(function (result) {
                if (result && result.isConfirmed && typeof onConfirm === "function") {
                    onConfirm();
                }
            });
            return;
        }

        if (window.confirm(message) && typeof onConfirm === "function") {
            onConfirm();
        }
    }

    function setAnswerValue(questionId, value, options) {
        if (!state.inspection) {
            return;
        }

        setPendingFocusState(options);
        state.inspection.answersById[questionId] = value;
        state.inspection.touchedById[questionId] = true;
        syncExitProtection();
        render();
    }

    function toggleCheckboxValue(questionId, value, checked) {
        if (!state.inspection) {
            return;
        }

        var current = Array.isArray(state.inspection.answersById[questionId]) ? state.inspection.answersById[questionId].slice() : [];
        var currentIndex = current.indexOf(value);

        if (checked && currentIndex < 0) {
            current.push(value);
        }

        if (!checked && currentIndex >= 0) {
            current.splice(currentIndex, 1);
        }

        state.inspection.answersById[questionId] = current;
        state.inspection.touchedById[questionId] = true;
        syncExitProtection();
        render();
    }

    function setCommentValue(questionId, value, options) {
        if (!state.inspection) {
            return;
        }

        setPendingFocusState(options);
        state.inspection.commentsById[questionId] = value;
        state.inspection.touchedById[questionId] = true;
        syncExitProtection();
        render();
    }

    function setFindingValue(questionId, value, options) {
        if (!state.inspection) {
            return;
        }

        setPendingFocusState(options);
        state.inspection.findingsById[questionId] = value;
        state.inspection.touchedById[questionId] = true;
        syncExitProtection();
        render();
    }

    function queueMediaFiles(questionId, mediaType, files) {
        if (!state.inspection || !questionId || !mediaType || !files || !files.length) {
            return;
        }

        var bucket = getMediaBucket(questionId);
        var target = mediaType === "photo" ? bucket.photos : mediaType === "video" ? bucket.videos : bucket.audios;

        Array.prototype.forEach.call(files, function (file) {
            var item = {
                name: file.name,
                type: file.type,
                size: file.size,
                file: file,
                previewUrl: createObjectUrl(file),
                status: "uploading",
                uploadedUrl: ""
            };

            target.push(item);
            uploadEvidenceFile(questionId, mediaType, item);
        });

        state.inspection.mediaById[questionId] = bucket;
        state.inspection.touchedById[questionId] = true;
        syncExitProtection();
        render();
    }

    function startMediaCapture(questionId, mediaType) {
        if (!questionId || !mediaType) {
            return false;
        }

        if (mediaType === "audio") {
            if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function" || typeof window.MediaRecorder !== "function") {
                return false;
            }

            resetMediaCaptureState();
            state.mediaCapture.mode = "audio";
            state.mediaCapture.questionId = questionId;
            state.mediaCapture.status = "requesting";
            render();

            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(function (stream) {
                    var recorder = new MediaRecorder(stream);

                    state.mediaCapture.stream = stream;
                    state.mediaCapture.recorder = recorder;
                    state.mediaCapture.chunks = [];
                    state.mediaCapture.seconds = 0;
                    state.mediaCapture.error = "";
                    state.mediaCapture.status = "recording";

                    recorder.addEventListener("dataavailable", function (event) {
                        if (event.data && event.data.size > 0) {
                            state.mediaCapture.chunks.push(event.data);
                        }
                    });

                    recorder.addEventListener("stop", function () {
                        finalizeRecordedMedia("audio", recorder.mimeType || "audio/webm");
                    });

                    recorder.start();
                    startMediaCaptureTimer();
                    render();
                })
                .catch(function () {
                    setMediaCaptureError(questionId, mediaType, "No fue posible acceder al micrófono en este dispositivo.");
                });

            return true;
        }

        if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
            return false;
        }

        if (mediaType === "video" && typeof window.MediaRecorder !== "function") {
            return false;
        }

        resetMediaCaptureState();
        state.mediaCapture.mode = mediaType;
        state.mediaCapture.questionId = questionId;
        state.mediaCapture.status = "requesting";
        render();

        var constraints = mediaType === "photo"
            ? { video: { facingMode: { ideal: "environment" } }, audio: false }
            : { video: { facingMode: { ideal: "environment" } }, audio: true };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                state.mediaCapture.stream = stream;
                state.mediaCapture.status = "ready";
                state.mediaCapture.error = "";

                if (mediaType === "video" && typeof window.MediaRecorder === "function") {
                    var recorder = new MediaRecorder(stream);
                    state.mediaCapture.recorder = recorder;
                    state.mediaCapture.chunks = [];

                    recorder.addEventListener("dataavailable", function (event) {
                        if (event.data && event.data.size > 0) {
                            state.mediaCapture.chunks.push(event.data);
                        }
                    });

                    recorder.addEventListener("stop", function () {
                        finalizeRecordedMedia("video", recorder.mimeType || "video/webm");
                    });
                }

                render();
            })
            .catch(function () {
                setMediaCaptureError(questionId, mediaType, mediaType === "photo"
                    ? "No fue posible acceder a la cámara en este dispositivo."
                    : "No fue posible acceder a la cámara y al micrófono en este dispositivo.");
            });

        return true;
    }

    function hydrateMediaCaptureNode() {
        var capture = state.mediaCapture || {};
        if (!capture.stream) {
            return;
        }

        var videoNode = document.getElementById("bl26-media-live-preview");
        if (videoNode && videoNode.srcObject !== capture.stream) {
            videoNode.srcObject = capture.stream;
            var playPromise = videoNode.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                });
            }
        }
    }

    function capturePhotoFrame() {
        var capture = state.mediaCapture || {};
        if (capture.mode !== "photo" || !capture.stream) {
            return;
        }

        var videoNode = document.getElementById("bl26-media-live-preview");
        if (!videoNode) {
            return;
        }

        var width = videoNode.videoWidth || 1280;
        var height = videoNode.videoHeight || 720;
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        var context2d = canvas.getContext("2d");
        if (!context2d) {
            return;
        }

        context2d.drawImage(videoNode, 0, 0, width, height);
        var dataUrl = canvas.toDataURL("image/png");
        var blob = dataUrlToBlob(dataUrl);
        if (!blob) {
            return;
        }

        cleanupMediaCaptureStream();
        state.mediaCapture.file = new File([blob], "foto-" + Date.now() + ".png", { type: "image/png" });
        state.mediaCapture.previewUrl = dataUrl;
        state.mediaCapture.status = "preview";
        render();
    }

    function startVideoRecording() {
        var capture = state.mediaCapture || {};
        if (capture.mode !== "video" || !capture.recorder || capture.status === "recording") {
            return;
        }

        capture.chunks = [];
        capture.seconds = 0;
        capture.status = "recording";
        capture.recorder.start();
        startMediaCaptureTimer();
        render();
    }

    function stopActiveMediaRecording() {
        var capture = state.mediaCapture || {};
        if (!capture.recorder || capture.recorder.state !== "recording") {
            return;
        }

        stopMediaCaptureTimer();
        capture.recorder.stop();
        capture.status = "processing";
        render();
    }

    function finalizeRecordedMedia(mediaType, mimeType) {
        var capture = state.mediaCapture || {};
        cleanupMediaCaptureStream();
        stopMediaCaptureTimer();

        if (!capture.chunks || !capture.chunks.length) {
            closeMediaCapture();
            return;
        }

        var blob = new Blob(capture.chunks, { type: mimeType });
        var extension = mediaType === "audio" ? resolveAudioExtension(blob.type) : resolveVideoExtension(blob.type);
        capture.file = new File([blob], mediaType + "-" + Date.now() + extension, { type: blob.type || mimeType });
        capture.previewUrl = createObjectUrl(capture.file);
        capture.status = "preview";
        capture.error = "";
        capture.recorder = null;
        capture.chunks = [];
        render();
    }

    function restartMediaCapture() {
        var capture = state.mediaCapture || {};
        if (!capture.mode || !capture.questionId) {
            closeMediaCapture();
            return;
        }

        var questionId = capture.questionId;
        var mode = capture.mode;
        closeMediaCapture(false);
        startMediaCapture(questionId, mode);
    }

    function saveMediaCapture() {
        var capture = state.mediaCapture || {};
        if (!capture.mode || !capture.questionId || !capture.file) {
            return;
        }

        queueMediaFiles(capture.questionId, capture.mode, [capture.file]);
        closeMediaCapture();
    }

    function closeMediaCapture(shouldRender) {
        if (shouldRender === undefined) {
            shouldRender = true;
        }

        revokeObjectUrl(state.mediaCapture.previewUrl);
        cleanupMediaCaptureStream();
        stopMediaCaptureTimer();
        resetMediaCaptureState();

        if (shouldRender) {
            render();
        }
    }

    function cleanupMediaCaptureStream() {
        var capture = state.mediaCapture || {};
        if (capture.stream) {
            capture.stream.getTracks().forEach(function (track) {
                track.stop();
            });
        }

        capture.stream = null;
        capture.recorder = null;
    }

    function resetMediaCaptureState() {
        state.mediaCapture = {
            mode: "",
            questionId: "",
            status: "idle",
            previewUrl: "",
            file: null,
            error: "",
            seconds: 0,
            stream: null,
            recorder: null,
            intervalId: 0,
            timeoutId: 0,
            chunks: []
        };
    }

    function setMediaCaptureError(questionId, mediaType, message) {
        cleanupMediaCaptureStream();
        stopMediaCaptureTimer();
        state.mediaCapture.mode = mediaType || "";
        state.mediaCapture.questionId = questionId || "";
        state.mediaCapture.status = "error";
        state.mediaCapture.error = message || "No fue posible completar la captura.";
        render();
    }

    function startMediaCaptureTimer() {
        stopMediaCaptureTimer();
        state.mediaCapture.seconds = 0;
        state.mediaCapture.intervalId = window.setInterval(function () {
            state.mediaCapture.seconds += 1;
            render();
        }, 1000);
    }

    function stopMediaCaptureTimer() {
        if (state.mediaCapture.intervalId) {
            window.clearInterval(state.mediaCapture.intervalId);
            state.mediaCapture.intervalId = 0;
        }

        if (state.mediaCapture.timeoutId) {
            window.clearTimeout(state.mediaCapture.timeoutId);
            state.mediaCapture.timeoutId = 0;
        }
    }

    function uploadEvidenceFile(questionId, mediaType, mediaItem) {
        ensureFirebaseToken()
            .then(function (tokenFirebase) {
                var formData = new FormData();
                formData.append("file", mediaItem.file);
                formData.append("idPregunta", questionId);
                formData.append("tokenFirebase", tokenFirebase);

                return fetch(resolveUploadEndpoint(mediaType), {
                    method: "POST",
                    body: formData,
                    credentials: "same-origin",
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    }
                });
            })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("upload-failed");
                }

                return response.json();
            })
            .then(function (payload) {
                mediaItem.status = "ready";
                mediaItem.uploadedUrl = payload && payload.d ? payload.d : "";
                render();
            })
            .catch(function () {
                mediaItem.status = "error";
                render();
            });
    }

    function removeMediaItem(questionId, mediaType, mediaIndex) {
        if (!state.inspection) {
            return;
        }

        var bucket = getMediaBucket(questionId);
        var target = mediaType === "photo" ? bucket.photos : mediaType === "video" ? bucket.videos : bucket.audios;
        if (mediaIndex >= 0 && mediaIndex < target.length) {
            revokeObjectUrl(target[mediaIndex] && target[mediaIndex].previewUrl);
            target.splice(mediaIndex, 1);
        }

        state.inspection.mediaById[questionId] = bucket;
        render();
    }

    function toggleOptionalPanel(questionId, panelKey) {
        if (!state.inspection || !questionId || !panelKey) {
            return;
        }

        var questionPanels = state.inspection.optionalPanelsById[questionId] || {};
        questionPanels[panelKey] = !questionPanels[panelKey];
        state.inspection.optionalPanelsById[questionId] = questionPanels;
        render();
    }

    function getInspectionStats() {
        if (!state.inspection || !state.inspection.entries.length) {
            return {
                total: 0,
                answered: 0,
                pendingRequired: 0,
                percentage: 0,
                sections: 0,
                comments: 0,
                currentNumber: 0
            };
        }

        var answered = 0;
        var pendingRequired = 0;
        var comments = 0;

        state.inspection.entries.forEach(function (entry) {
            var answer = getAnswer(entry.id);
            if (isQuestionAnswered(entry, answer)) {
                answered += 1;
            } else if (entry.required) {
                pendingRequired += 1;
            }

            if (normalizeValue(getComment(entry.id))) {
                comments += 1;
            }
        });

        var currentEntry = getActiveEntry();
        var total = state.inspection.entries.length;

        return {
            total: total,
            answered: answered,
            pendingRequired: pendingRequired,
            percentage: total ? Math.round((answered / total) * 100) : 0,
            sections: state.inspection.sections.length,
            comments: comments,
            currentNumber: currentEntry ? currentEntry.number : 0
        };
    }

    function getSectionStats(section) {
        var total = section.questionIds.length;
        var answered = 0;
        var pendingRequired = 0;

        section.questionIds.forEach(function (questionId) {
            var entry = getEntryById(questionId);
            if (!entry) {
                return;
            }

            if (isQuestionAnswered(entry, getAnswer(entry.id))) {
                answered += 1;
            } else if (entry.required) {
                pendingRequired += 1;
            }
        });

        return {
            total: total,
            answered: answered,
            pendingRequired: pendingRequired,
            percentage: total ? Math.round((answered / total) * 100) : 0
        };
    }

    function getValidation(entry) {
        if (!entry) {
            return {
                severity: "danger",
                message: "No pudimos mostrar esta pregunta."
            };
        }

        if (!entry.typeMeta) {
            return {
                severity: "danger",
                message: "",
                hidden: true
            };
        }

        if (entry.hasOptionsIssue) {
            return {
                severity: "danger",
                message: "Esta pregunta no tiene opciones disponibles para capturarse."
            };
        }

        var answer = getAnswer(entry.id);
        var hasAnswer = isQuestionAnswered(entry, answer);

        if (entry.required && !hasAnswer) {
            return {
                severity: "warning",
                message: entry.typeMeta.emptyMessage
            };
        }

        if (!isAnswerShapeValid(entry, answer)) {
            return {
                severity: "danger",
                message: entry.typeMeta.emptyMessage
            };
        }

        return {
            severity: "success",
            message: ""
        };
    }

    function validateInspectionCompletion() {
        if (!state.inspection || !state.inspection.entries.length) {
            return {
                isComplete: false,
                firstPending: null
            };
        }

        var pendingRequired = state.inspection.entries.filter(function (entry) {
            return entry.required && !isQuestionAnswered(entry, getAnswer(entry.id));
        });

        return {
            isComplete: pendingRequired.length === 0,
            firstPending: pendingRequired.length ? pendingRequired[0] : null,
            pendingRequired: pendingRequired
        };
    }

    function getQuestionStatus(entry) {
        if (!state.inspection || !entry) {
            return "pending";
        }

        if (state.inspection.activeQuestionId === entry.id) {
            return "current";
        }

        if (isQuestionAnswered(entry, getAnswer(entry.id))) {
            return "answered";
        }

        if (entry.required) {
            return "required";
        }

        return "pending";
    }

    function renderQuestionHierarchy(entry, section) {
        var categoryValue = normalizeValue(entry && entry.category) || (section ? section.title : SECTION_FALLBACK);
        var subcategoryValue = normalizeValue(entry && entry.subcategory);
        var hasSubcategory = subcategoryValue && subcategoryValue !== SUBCATEGORY_FALLBACK;
        var compactValues = [categoryValue];

        if (hasSubcategory) {
            compactValues.push(subcategoryValue);
        }

        return [
            '<div class="bl26-reco-hierarchy compact">',
            compactValues.length ? '<span class="bl26-reco-hierarchy-inline">' + escapeHtml(compactValues.join(' · ')) + '</span>' : '',
            '</div>'
        ].join("");
    }

    function toggleProgressPanel() {
        var willOpen = !shouldShowProgressExpanded();
        state.progressExpanded = willOpen;

        if (willOpen) {
            state.quickNavExpanded = false;
        }

        persistUiChrome();
        render();
    }

    function toggleQuickNavPanel() {
        var willOpen = !state.quickNavExpanded;
        state.quickNavExpanded = willOpen;

        if (willOpen) {
            state.progressExpanded = false;
        }

        persistUiChrome();
        render();
    }

    function closeSecondaryPanels() {
        state.quickNavExpanded = false;
        state.progressExpanded = false;
        persistUiChrome();
    }

    function setPendingFocusState(options) {
        if (options && options.preserveFocus) {
            state.pendingFocusState = captureEditableFocusState();
        } else {
            state.pendingFocusState = null;
        }
    }

    function captureEditableFocusState() {
        if (!document || !document.activeElement) {
            return null;
        }

        var activeElement = document.activeElement;
        if (!activeElement.dataset || !activeElement.dataset.control) {
            return null;
        }

        var control = normalizeValue(activeElement.dataset.control);
        if (["text", "number", "date", "datetime", "time", "comment", "finding"].indexOf(control) < 0) {
            return null;
        }

        return {
            questionId: normalizeValue(activeElement.dataset.questionId),
            control: control,
            selectionStart: typeof activeElement.selectionStart === "number" ? activeElement.selectionStart : null,
            selectionEnd: typeof activeElement.selectionEnd === "number" ? activeElement.selectionEnd : null
        };
    }

    function restoreEditableFocusState(focusState) {
        var stateToRestore = focusState || state.pendingFocusState;
        state.pendingFocusState = null;

        if (!stateToRestore || !stateToRestore.control) {
            return;
        }

        window.requestAnimationFrame(function () {
            var selector = '[data-control="' + stateToRestore.control + '"][data-question-id="' + stateToRestore.questionId + '"]';
            var field = root.querySelector(selector);
            if (!field || field.disabled || field.readOnly) {
                return;
            }

            field.focus();

            if (typeof stateToRestore.selectionStart === "number" && typeof field.setSelectionRange === "function") {
                field.setSelectionRange(stateToRestore.selectionStart, stateToRestore.selectionEnd === null ? stateToRestore.selectionStart : stateToRestore.selectionEnd);
            }
        });
    }

    function focusPrimaryInputForActiveQuestion() {
        if (!state.inspection || !state.inspection.activeQuestionId) {
            return;
        }

        window.requestAnimationFrame(function () {
            var questionId = state.inspection.activeQuestionId;
            var selector = [
                '[data-control="text"][data-question-id="' + questionId + '"]',
                '[data-control="number"][data-question-id="' + questionId + '"]',
                '[data-control="date"][data-question-id="' + questionId + '"]',
                '[data-control="datetime"][data-question-id="' + questionId + '"]',
                '[data-control="time"][data-question-id="' + questionId + '"]',
                '[data-control="radio"][data-question-id="' + questionId + '"]',
                '[data-control="checkbox"][data-question-id="' + questionId + '"]',
                '[data-action="set-rating"][data-question-id="' + questionId + '"]'
            ].join(', ');
            var field = root.querySelector(selector);
            if (field && typeof field.focus === "function") {
                field.focus();
            }
        });
    }

    function isMeaningfulSupplementalCopy(candidate, comparisonValues) {
        var normalizedCandidate = normalizeValue(candidate);
        if (!normalizedCandidate) {
            return false;
        }

        return !(comparisonValues || []).some(function (value) {
            return normalizeValue(value).toLowerCase() === normalizedCandidate.toLowerCase();
        });
    }

    function getStatusCopy(entry) {
        var status = getQuestionStatus(entry);
        if (status === "current") {
            return "Pregunta actual";
        }

        if (status === "answered") {
            return "Respondida";
        }

        if (status === "required") {
            return "Obligatoria pendiente";
        }

        return "Pendiente";
    }

    function isQuestionAnswered(entry, answer) {
        if (!entry || !entry.typeMeta) {
            return false;
        }

        if (!isAnswerShapeValid(entry, answer)) {
            return false;
        }

        if (entry.typeKey === "0") {
            return !!normalizeValue(answer);
        }

        if (entry.typeKey === "1") {
            return answer !== "";
        }

        if (entry.typeKey === "2") {
            return !!normalizeValue(answer);
        }

        if (entry.typeKey === "3") {
            return Array.isArray(answer) && answer.length > 0;
        }

        if (entry.typeKey === "4") {
            return !!normalizeValue(answer);
        }

        if (entry.typeKey === "5") {
            return normalizeValue(answer) !== "";
        }

        if (entry.typeKey === "6") {
            return !!normalizeValue(answer);
        }

        if (entry.typeKey === "7") {
            return !!normalizeValue(answer);
        }

        if (entry.typeKey === "8") {
            return !!normalizeValue(answer);
        }

        return false;
    }

    function isAnswerShapeValid(entry, answer) {
        if (!entry || !entry.typeMeta) {
            return false;
        }

        if (answer === undefined || answer === null || answer === "") {
            return true;
        }

        if (entry.typeKey === "0") {
            return true;
        }

        if (entry.typeKey === "1") {
            var rating = Number(answer);
            return Number.isFinite(rating) && rating >= 1 && rating <= 5;
        }

        if (entry.typeKey === "2") {
            return entry.options.some(function (option) {
                return option.value === answer;
            });
        }

        if (entry.typeKey === "3") {
            if (!Array.isArray(answer)) {
                return false;
            }

            return answer.every(function (selectedValue) {
                return entry.options.some(function (option) {
                    return option.value === selectedValue;
                });
            });
        }

        if (entry.typeKey === "4") {
            return true;
        }

        if (entry.typeKey === "5") {
            return normalizeValue(answer) === "" || !Number.isNaN(Number(answer));
        }

        if (entry.typeKey === "6") {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(String(answer))) {
                return false;
            }

            return !Number.isNaN(Date.parse(String(answer) + "T00:00:00"));
        }

        if (entry.typeKey === "7") {
            return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(String(answer));
        }

        if (entry.typeKey === "8") {
            return /^\d{2}:\d{2}$/.test(String(answer));
        }

        return false;
    }

    function getEntryById(questionId) {
        if (!state.inspection) {
            return null;
        }

        return state.inspection.entries.find(function (entry) {
            return entry.id === questionId;
        }) || null;
    }

    function getSectionForQuestion(questionId) {
        if (!state.inspection) {
            return null;
        }

        return state.inspection.sections.find(function (section) {
            return section.questionIds.indexOf(questionId) >= 0;
        }) || null;
    }

    function getActiveEntry() {
        if (!state.inspection) {
            return null;
        }

        return getEntryById(state.inspection.activeQuestionId);
    }

    function getActiveIndex() {
        var activeEntry = getActiveEntry();
        return activeEntry ? activeEntry.order : -1;
    }

    function getAnswer(questionId) {
        if (!state.inspection) {
            return "";
        }

        return state.inspection.answersById[questionId];
    }

    function getComment(questionId) {
        if (!state.inspection) {
            return "";
        }

        return state.inspection.commentsById[questionId];
    }

    function getFinding(questionId) {
        if (!state.inspection) {
            return "";
        }

        return state.inspection.findingsById[questionId];
    }

    function getMediaBucket(questionId) {
        if (!state.inspection) {
            return {
                photos: [],
                videos: [],
                audios: []
            };
        }

        if (!state.inspection.mediaById[questionId]) {
            state.inspection.mediaById[questionId] = {
                photos: [],
                videos: [],
                audios: []
            };
        }

        return state.inspection.mediaById[questionId];
    }

    function isOptionalPanelExpanded(questionId, panelKey) {
        if (!state.inspection || !state.inspection.optionalPanelsById[questionId]) {
            return false;
        }

        return !!state.inspection.optionalPanelsById[questionId][panelKey];
    }

    function isActiveSection(section) {
        var activeEntry = getActiveEntry();
        return !!activeEntry && activeEntry.category === section.title;
    }

    function lookupText(items, id) {
        var match = (items || []).find(function (item) {
            return String(item.id) === String(id);
        });

        return match ? normalizeValue(match.text) : "";
    }

    function renderOptions(items, selectedId) {
        return (items || []).map(function (item) {
            var isSelected = String(item.id) === String(selectedId);
            return '<option value="' + escapeAttribute(String(item.id || "")) + '"' + (isSelected ? " selected" : "") + '>' + escapeHtml(item.text || "") + '</option>';
        }).join("");
    }

    function isSelectDisabled(kind) {
        if (state.sessionExpired || state.bootstrapping) {
            return "disabled";
        }

        if (kind === "list") {
            return state.listState === "loading" ? "disabled" : "";
        }

        if (kind === "branch") {
            return state.branchState === "loading" ? "disabled" : "";
        }

        if (kind === "responsible") {
            if (!state.selectedBranchId) {
                return "disabled";
            }

            return state.responsibleState === "loading" ? "disabled" : "";
        }

        return "";
    }

    function canStart() {
        return !state.sessionExpired
            && !state.bootstrapping
            && !!state.selectedListId
            && !!state.selectedBranchId
            && !!state.selectedResponsibleId
            && state.canWrite;
    }

    function renderGpsSummary() {
        if (!state.location) {
            return "GPS pendiente";
        }

        return "GPS confirmado";
    }

    function hydrateUiChrome() {
        try {
            state.prepExpanded = window.sessionStorage.getItem("bl26.prepExpanded") !== "false";
            state.progressExpanded = window.sessionStorage.getItem("bl26.progressExpanded") !== "false";
            state.quickNavExpanded = window.sessionStorage.getItem("bl26.quickNavExpanded") === "true";
        } catch (error) {
            state.prepExpanded = true;
            state.progressExpanded = true;
            state.quickNavExpanded = false;
        }
    }

    function persistUiChrome() {
        try {
            window.sessionStorage.setItem("bl26.prepExpanded", shouldShowPreparationExpanded() ? "true" : "false");
            window.sessionStorage.setItem("bl26.progressExpanded", shouldShowProgressExpanded() ? "true" : "false");
            window.sessionStorage.setItem("bl26.quickNavExpanded", state.quickNavExpanded ? "true" : "false");
        } catch (error) {
        }
    }

    function isPreparationComplete() {
        return !!state.selectedListId
            && !!state.selectedBranchId
            && !!state.selectedResponsibleId;
    }

    function shouldShowPreparationExpanded() {
        return state.prepExpanded || !isPreparationComplete() || state.questionnaireState === "error";
    }

    function shouldShowProgressExpanded() {
        return state.progressExpanded || !hasStartedInspection();
    }

    function renderPreparationSummary() {
        if (!isPreparationComplete()) {
            return "Completa lista, sucursal, responsable y ubicación para iniciar.";
        }

        return [
            state.selectedListName || "Lista",
            state.selectedBranchName || "Sucursal",
            state.selectedResponsibleName || "Responsable",
            requiresAssetSelection() ? (state.selectedAssetDetail ? normalizeAssetDetail(state.selectedAssetDetail).nombre : "Activo pendiente") : null,
            renderGpsSummary()
        ].filter(Boolean).join(" · ");
    }

    function getCurrentSectionLabel() {
        var activeEntry = getActiveEntry();
        if (!activeEntry) {
            return hasStartedInspection() ? "Sin sección" : (state.statusTitle || "Preparar inspección");
        }

        var section = getSectionForQuestion(activeEntry.id);
        return section ? ("Sección: " + section.title) : "Cuestionario listo";
    }

    function statusLabel() {
        var map = {
            "loading-list": "Cargando listas",
            "list-empty": "Sin listas",
            "list-error": "Error en listas",
            "branch-loading": "Cargando sucursales",
            "branch-empty": "Sin sucursales",
            "branch-error": "Error en sucursales",
            "responsible-loading": "Cargando responsables",
            "responsible-empty": "Sin responsables",
            "responsible-error": "Error en responsables",
            "ready-to-select": "Selección requerida",
            "ready-to-start": "Listo para iniciar",
            "selection-missing": "Falta contexto",
            "asset-required": "Activo requerido",
            "location-requesting": "Solicitando ubicación",
            "location-granted": "Ubicación lista",
            "location-denied": "Ubicación requerida",
            "questions-loading": "Cargando preguntas",
            "questions-empty": "Sin preguntas",
            "questions-error": "Error en cuestionario",
            "questions-loaded": "Cuestionario listo",
            "session-expired": "Sesión vencida"
        };

        return map[state.statusKey] || "Estado";
    }

    function hasStartedInspection() {
        return state.questionnaireState === "loaded"
            || state.questionnaireState === "empty"
            || state.questionnaireState === "error";
    }

    function resolveQuestionType(question) {
        var candidates = [
            normalizeValue(question.tipo),
            normalizeValue(question.valor)
        ];

        for (var index = 0; index < candidates.length; index += 1) {
            if (QUESTION_TYPES[candidates[index]]) {
                return candidates[index];
            }
        }

        return normalizeValue(question.tipo || question.valor);
    }

    function normalizeOptions(options) {
        return (Array.isArray(options) ? options : []).map(function (option, index) {
            var label = normalizeValue(option.opcion) || ("Opción " + (index + 1));
            return {
                value: label,
                label: label
            };
        });
    }

    function confirmExitIfNeeded() {
        if (!hasTemporaryResponses()) {
            return true;
        }

        return window.confirm(EXIT_WARNING);
    }

    function hasTemporaryResponses() {
        if (!state.inspection) {
            return false;
        }

        return state.inspection.entries.some(function (entry) {
            var answer = getAnswer(entry.id);
            var comment = getComment(entry.id);

            if (entry.typeKey === "3" && Array.isArray(answer) && answer.length) {
                return true;
            }

            if (normalizeValue(comment)) {
                return true;
            }

            return normalizeValue(answer) !== "";
        });
    }

    function syncExitProtection() {
        if (!hasTemporaryResponses() || state.historyGuardEnabled) {
            return;
        }

        try {
            window.history.pushState({ guardedInspection: true }, document.title, window.location.href);
            state.historyGuardEnabled = true;
        } catch (error) {
            state.historyGuardEnabled = true;
        }
    }

    function handleBeforeUnload(event) {
        if (state.leavingPage || !hasTemporaryResponses()) {
            return;
        }

        event.preventDefault();
        event.returnValue = EXIT_WARNING;
        return EXIT_WARNING;
    }

    function handlePopState() {
        if (state.leavingPage || !state.historyGuardEnabled || !hasTemporaryResponses()) {
            return;
        }

        if (window.confirm(EXIT_WARNING)) {
            state.leavingPage = true;
            window.history.back();
            return;
        }

        try {
            window.history.pushState({ guardedInspection: true }, document.title, window.location.href);
        } catch (error) {
            state.historyGuardEnabled = true;
        }
    }

    function handleDocumentNavigation(event) {
        var anchor = event.target && event.target.closest ? event.target.closest("a[href]") : null;

        if (!anchor || state.leavingPage || !hasTemporaryResponses()) {
            return;
        }

        var href = anchor.getAttribute("href");

        if (!href || href.charAt(0) === "#" || href.indexOf("javascript:") === 0 || anchor.target === "_blank" || anchor.hasAttribute("download")) {
            return;
        }

        var targetUrl = new URL(href, window.location.origin);

        if (targetUrl.href === window.location.href) {
            return;
        }

        if (!window.confirm(EXIT_WARNING)) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        state.leavingPage = true;
    }

    function toBoolean(value) {
        return value === true || value === "true" || value === 1 || value === "1";
    }

    function normalizeValue(value) {
        return String(value || "").replace(/^"+|"+$/g, "").trim();
    }

    function sanitizeId(value) {
        return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "-");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }

    function createObjectUrl(file) {
        if (!file || typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
            return "";
        }

        return URL.createObjectURL(file);
    }

    function revokeObjectUrl(url) {
        if (!url || typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function" || url.indexOf("blob:") !== 0) {
            return;
        }

        URL.revokeObjectURL(url);
    }

    function dataUrlToBlob(dataUrl) {
        if (!dataUrl || dataUrl.indexOf(",") < 0) {
            return null;
        }

        var segments = dataUrl.split(",");
        var mimeMatch = segments[0].match(/:(.*?);/);
        var mimeType = mimeMatch && mimeMatch[1] ? mimeMatch[1] : "application/octet-stream";
        var binary = window.atob(segments[1]);
        var length = binary.length;
        var array = new Uint8Array(length);

        while (length--) {
            array[length] = binary.charCodeAt(length);
        }

        return new Blob([array], { type: mimeType });
    }

    function formatCaptureSeconds(totalSeconds) {
        var safeSeconds = Number(totalSeconds || 0);
        var minutes = Math.floor(safeSeconds / 60);
        var seconds = safeSeconds % 60;
        return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    }

    function ensureFirebaseToken() {
        var cachedToken = "";
        try {
            cachedToken = window.sessionStorage.getItem("tokenFirebase") || "";
        } catch (error) {
            cachedToken = "";
        }

        if (cachedToken) {
            return Promise.resolve(cachedToken);
        }

        return fetch("/ContestarListaHibrida/ObtenerTokenFirebase", {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("token-failed");
                }

                return response.json();
            })
            .then(function (payload) {
                var token = payload && payload.d ? payload.d : "";
                if (token) {
                    try {
                        window.sessionStorage.setItem("tokenFirebase", token);
                    } catch (error) {
                    }
                }

                return token;
            });
    }

    function resolveUploadEndpoint(mediaType) {
        if (mediaType === "photo") {
            return "/ContestarLista/UploadImageToFirebaseStorage";
        }

        if (mediaType === "video") {
            return "/ContestarLista/UploadVideoToFirebaseStorage";
        }

        return "/ContestarLista/UploadAudioToFirebaseStorage";
    }

    function resolveMediaStatusCopy(status) {
        if (status === "uploading") {
            return "Subiendo";
        }

        if (status === "error") {
            return "Pendiente";
        }

        return "Guardado";
    }

    function resolveAudioExtension(mimeType) {
        if (mimeType === "audio/mp4") {
            return ".mp4";
        }

        if (mimeType === "audio/mpeg") {
            return ".mp3";
        }

        if (mimeType === "audio/wav") {
            return ".wav";
        }

        return ".webm";
    }

    function resolveVideoExtension(mimeType) {
        if (mimeType === "video/mp4") {
            return ".mp4";
        }

        if (mimeType === "video/quicktime") {
            return ".mov";
        }

        return ".webm";
    }
})();
