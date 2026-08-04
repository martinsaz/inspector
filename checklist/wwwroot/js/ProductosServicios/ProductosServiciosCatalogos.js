(function (window, document, $) {
    "use strict";

    const pageNode = document.querySelector("[data-ps-catalog-page]");
    if (!pageNode) {
        return;
    }

    const pageKey = String(pageNode.getAttribute("data-ps-catalog-page") || "").trim().toLowerCase();
    const configs = {
        categorias: {
            gridId: "productos-servicios-categorias-grid",
            title: "categoría",
            titlePlural: "categorías",
            exportSheetName: "CategoriasProductosServicios",
            filePrefix: "CategoriasProductosServicios",
            detailUrl: function (id) { return "/ProductosServicios/ObtenerCategoriaProductoServicio?idCategoria=" + encodeURIComponent(id); },
            listUrl: function (query) { return "/ProductosServicios/ObtenerCategoriasProductosServicios?" + query.toString(); },
            saveUrl: "/ProductosServicios/GuardarCategoriaProductoServicio",
            bajaUrl: function (id) { return "/ProductosServicios/BajaCategoriaProductoServicio?idCategoria=" + encodeURIComponent(id); },
            activarUrl: function (id) { return "/ProductosServicios/ActivarCategoriaProductoServicio?idCategoria=" + encodeURIComponent(id); },
            codeMax: 50,
            nameMax: 150,
            descriptionMax: 500,
            columns: function () {
                return [
                    actionColumn(),
                    { key: "codigo", title: "Código" },
                    {
                        key: "nombre",
                        title: "Nombre",
                        render: function (value, row) {
                            return "<div class='ps-catalog-title'><strong>" + escapeHtml(value || "") + "</strong><small>" + escapeHtml(row.descripcion || "") + "</small></div>";
                        }
                    },
                    { key: "descripcion", title: "Descripción" },
                    {
                        key: "aplicaANombre",
                        title: "Aplica a",
                        render: function (value) {
                            return "<span class='ps-catalog-chip'>" + escapeHtml(normalizeAplicaAText(value)) + "</span>";
                        }
                    },
                    statusColumn(),
                    updatedColumn()
                ];
            },
            buildPayload: function () {
                return {
                    id: normalizeGuid($("#hdCatalogoId").val()),
                    idEmpresa: resolveEmpresaId(),
                    codigo: ($("#txCodigoCatalogo").val() || "").trim(),
                    nombre: ($("#txNombreCatalogo").val() || "").trim(),
                    descripcion: ($("#txDescripcionCatalogo").val() || "").trim(),
                    aplicaA: Number($("#cbAplicaACatalogo").val() || 0)
                };
            },
            fillForm: function (data) {
                $("#txDescripcionCatalogo").val(data.descripcion || "");
                $("#cbAplicaACatalogo").val(String(data.aplicaA == null ? 0 : data.aplicaA));
            },
            validate: function () {
                return validateBasic(50, 150, true, false);
            }
        },
        marcas: {
            gridId: "productos-servicios-marcas-grid",
            title: "marca",
            titlePlural: "marcas",
            exportSheetName: "MarcasProductosServicios",
            filePrefix: "MarcasProductosServicios",
            detailUrl: function (id) { return "/ProductosServicios/ObtenerMarcaProductoServicio?idMarca=" + encodeURIComponent(id); },
            listUrl: function (query) { return "/ProductosServicios/ObtenerMarcasProductosServicios?" + query.toString(); },
            saveUrl: "/ProductosServicios/GuardarMarcaProductoServicio",
            bajaUrl: function (id) { return "/ProductosServicios/BajaMarcaProductoServicio?idMarca=" + encodeURIComponent(id); },
            activarUrl: function (id) { return "/ProductosServicios/ActivarMarcaProductoServicio?idMarca=" + encodeURIComponent(id); },
            codeMax: 50,
            nameMax: 150,
            descriptionMax: 500,
            columns: function () {
                return [
                    actionColumn(),
                    { key: "codigo", title: "Código" },
                    {
                        key: "nombre",
                        title: "Nombre",
                        render: function (value, row) {
                            return "<div class='ps-catalog-title'><strong>" + escapeHtml(value || "") + "</strong><small>" + escapeHtml(row.descripcion || "") + "</small></div>";
                        }
                    },
                    { key: "descripcion", title: "Descripción" },
                    statusColumn(),
                    updatedColumn()
                ];
            },
            buildPayload: function () {
                return {
                    id: normalizeGuid($("#hdCatalogoId").val()),
                    idEmpresa: resolveEmpresaId(),
                    codigo: ($("#txCodigoCatalogo").val() || "").trim(),
                    nombre: ($("#txNombreCatalogo").val() || "").trim(),
                    descripcion: ($("#txDescripcionCatalogo").val() || "").trim()
                };
            },
            fillForm: function (data) {
                $("#txDescripcionCatalogo").val(data.descripcion || "");
            },
            validate: function () {
                return validateBasic(50, 150, true, false);
            }
        },
        unidades: {
            gridId: "productos-servicios-unidades-grid",
            title: "unidad de medida",
            titlePlural: "unidades de medida",
            exportSheetName: "UnidadesMedidaProductosServicios",
            filePrefix: "UnidadesMedidaProductosServicios",
            detailUrl: function (id) { return "/ProductosServicios/ObtenerUnidadMedidaProductoServicio?idUnidadMedida=" + encodeURIComponent(id); },
            listUrl: function (query) { return "/ProductosServicios/ObtenerUnidadesMedidaProductosServicios?" + query.toString(); },
            saveUrl: "/ProductosServicios/GuardarUnidadMedidaProductoServicio",
            bajaUrl: function (id) { return "/ProductosServicios/BajaUnidadMedidaProductoServicio?idUnidadMedida=" + encodeURIComponent(id); },
            activarUrl: function (id) { return "/ProductosServicios/ActivarUnidadMedidaProductoServicio?idUnidadMedida=" + encodeURIComponent(id); },
            codeMax: 30,
            nameMax: 100,
            descriptionMax: 0,
            abreviaturaMax: 20,
            columns: function () {
                return [
                    actionColumn(),
                    { key: "codigo", title: "Código" },
                    { key: "nombre", title: "Nombre" },
                    { key: "abreviatura", title: "Abreviatura" },
                    {
                        key: "permiteDecimales",
                        title: "Permite decimales",
                        exportValue: function (value) {
                            return value ? "Sí" : "No";
                        },
                        render: function (value) {
                            return "<span class='ps-catalog-chip ps-catalog-chip--bool'>" + (value ? "Sí" : "No") + "</span>";
                        }
                    },
                    statusColumn(),
                    updatedColumn()
                ];
            },
            buildPayload: function () {
                return {
                    id: normalizeGuid($("#hdCatalogoId").val()),
                    idEmpresa: resolveEmpresaId(),
                    codigo: ($("#txCodigoCatalogo").val() || "").trim(),
                    nombre: ($("#txNombreCatalogo").val() || "").trim(),
                    descripcion: "",
                    abreviatura: ($("#txAbreviaturaCatalogo").val() || "").trim(),
                    permiteDecimales: $("#chkPermiteDecimalesCatalogo").is(":checked")
                };
            },
            fillForm: function (data) {
                $("#txAbreviaturaCatalogo").val(data.abreviatura || "");
                $("#chkPermiteDecimalesCatalogo").prop("checked", !!data.permiteDecimales);
            },
            validate: function () {
                return validateBasic(30, 100, false, true);
            }
        }
    };

    const config = configs[pageKey];
    if (!config) {
        return;
    }

    const state = {
        modal: null,
        isSaving: false
    };

    document.addEventListener("DOMContentLoaded", function () {
        state.modal = resolveModalApi("#modalCatalogoProductosServicios");
        syncFieldLimits();
        buildTableHead();
        initAccordion();
        initEvents();
        initGrid();
        resetModal();
        CheckAppUI.reloadGrid(config.gridId);
    });

    function initAccordion() {
        CheckAppUI.createFilterAccordion({
            id: "ps-catalog-filtros",
            selector: "#accordionFiltrosCatalogoProductosServicios",
            open: true,
            emptySummaryText: "Sin filtros activos"
        });
    }

    function initEvents() {
        $("#btBuscarCatalogo").on("click", function () {
            updateFilterSummary();
            CheckAppUI.reloadGrid(config.gridId);
        });

        $("#btLimpiarCatalogo").on("click", clearFilters);
        $("#btNuevoCatalogo").on("click", openCreateModal);
        $("#btGuardarCatalogo").on("click", saveCatalogo);

        $("#txBusquedaCatalogo").on("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                $("#btBuscarCatalogo").trigger("click");
            }
        });

        $("#frmCatalogoProductosServicios input, #frmCatalogoProductosServicios textarea").on("input", function () {
            clearFieldError("#" + this.id);
        });
        $("#frmCatalogoProductosServicios select").on("change", function () {
            clearFieldError("#" + this.id);
        });

        $("#modalCatalogoProductosServicios").on("hidden.bs.modal", function () {
            resetModal();
        });
    }

    function initGrid() {
        CheckAppUI.createDynamicGrid({
            id: config.gridId,
            hostSelector: "#gridCatalogoHost",
            tableSelector: "#grCatalogoProductosServicios",
            searchInputSelector: "#txBusquedaGridCatalogo",
            exportButtonSelector: "#btExportarCatalogo",
            columnToggleButtonSelector: "#btColumnasCatalogo",
            columnTogglePanelSelector: "#panelColumnasCatalogo",
            resultCountSelector: "#txGridCatalogoCount",
            footerRangeSelector: "#txGridCatalogoRange",
            footerPageIndicatorSelector: "#txGridCatalogoPageIndicator",
            footerPrevButtonSelector: "#btGridCatalogoPrev",
            footerNextButtonSelector: "#btGridCatalogoNext",
            footerPageSizeSelector: "#txGridCatalogoPageSize",
            pageLength: 25,
            lengthMenu: [[25, 50, 100], [25, 50, 100]],
            order: [[1, "asc"]],
            exportSheetName: config.exportSheetName,
            exportFileName: function () {
                return config.filePrefix + "_" + formatDateForFile(new Date()) + ".xlsx";
            },
            loadData: function () {
                const query = new URLSearchParams();
                appendQuery(query, "busqueda", $("#txBusquedaCatalogo").val());
                appendQuery(query, "estatus", $("#cbFiltroEstatusCatalogo").val());
                return fetchJson(config.listUrl(query));
            },
            columns: config.columns(),
            onLoaded: function (rows) {
                $("#txGridCatalogoVisibleCount").text((rows || []).length + " visibles");
            },
            emptyText: "No hay " + config.titlePlural + " para los filtros aplicados."
        });
    }

    function buildTableHead() {
        const head = document.getElementById("trCatalogoHead");
        if (!head) {
            return;
        }

        head.innerHTML = config.columns().map(function (column) {
            return "<th>" + escapeHtml(column.title || "") + "</th>";
        }).join("");
    }

    function syncFieldLimits() {
        $("#txCodigoCatalogo").attr("maxlength", config.codeMax);
        $("#txNombreCatalogo").attr("maxlength", config.nameMax);
        $("#txDescripcionCatalogo").attr("maxlength", config.descriptionMax || 0);
        $("#txAbreviaturaCatalogo").attr("maxlength", config.abreviaturaMax || 0);
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
                    buildActionLink("Editar", "fa fa-edit", "psCatalogoEditar('" + escapeJs(row.id) + "')")
                ];

                if (row.activo) {
                    actions.push(buildActionLink("Baja lógica", "fa fa-ban", "psCatalogoCambiarEstatus('" + escapeJs(row.id) + "', false)", true));
                } else {
                    actions.push(buildActionLink("Reactivar", "fa fa-check", "psCatalogoCambiarEstatus('" + escapeJs(row.id) + "', true)"));
                }

                return "<div class='ps-catalog-actions'>" + actions.join("") + "</div>";
            }
        };
    }

    function statusColumn() {
        return {
            key: "activo",
            title: "Estatus",
            exportValue: function (value) {
                return value ? "Activo" : "Baja lógica";
            },
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
            exportValue: function (value) {
                return formatDisplayDate(value);
            },
            render: function (value) {
                return formatDisplayDate(value);
            }
        };
    }

    function buildActionLink(label, iconClass, onclick, danger) {
        return "<a href='javascript:void(0)' class='" + (danger ? "is-danger" : "") + "' onclick=\"" + onclick + "\" title='" + escapeHtml(label) + "' aria-label='" + escapeHtml(label) + "'><i class='" + iconClass + "'></i></a>";
    }

    function openCreateModal() {
        if (state.isSaving) {
            return;
        }

        resetModal();
        $("#txCatalogoModalKicker").text("Registro");
        $("#txCatalogoModalTitulo").text("Nueva " + config.title);
        $("#btGuardarCatalogo span").text("Guardar");
        state.modal.show();
    }

    window.psCatalogoEditar = function (id) {
        if (state.isSaving) {
            return;
        }

        setStatus("#txInfoCatalogo", "", "");
        fetchJson(config.detailUrl(id))
            .then(function (data) {
                resetModal();
                $("#hdCatalogoId").val(data.id || "");
                $("#txCatalogoModalKicker").text("Edición");
                $("#txCatalogoModalTitulo").text("Editar " + config.title);
                $("#btGuardarCatalogo span").text("Guardar cambios");
                $("#txCodigoCatalogo").val(data.codigo || "");
                $("#txNombreCatalogo").val(data.nombre || "");
                config.fillForm(data || {});
                state.modal.show();
            })
            .catch(function (error) {
                showError(resolveErrorMessage(error));
            });
    };

    window.psCatalogoCambiarEstatus = function (id, activar) {
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

            fetchJson(activar ? config.activarUrl(id) : config.bajaUrl(id), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "{}"
            }).then(function (data) {
                showSuccess(resolveServerMessage(data) || "La acción fue completada.");
                CheckAppUI.reloadGrid(config.gridId);
            }).catch(function (error) {
                showError(resolveErrorMessage(error));
            });
        });
    };

    function saveCatalogo() {
        if (state.isSaving) {
            return;
        }

        const validation = config.validate();
        if (validation) {
            setStatus("#txInfoCatalogo", "danger", validation.message);
            markFieldError(validation.selector);
            return;
        }

        const payload = config.buildPayload();
        beginSaveUi();
        setStatus("#txInfoCatalogo", "info", "Guardando " + config.title + "...");

        fetchJson(config.saveUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).then(function (data) {
            finishSaveUi();
            showSuccess(resolveServerMessage(data) || "El registro fue guardado correctamente.");
            state.modal.hide();
            CheckAppUI.reloadGrid(config.gridId);
        }).catch(function (error) {
            finishSaveUi();
            setStatus("#txInfoCatalogo", "danger", resolveErrorMessage(error));
        });
    }

    function validateBasic(codeMax, nameMax, allowDescription, requiresAbbreviation) {
        const codigo = ($("#txCodigoCatalogo").val() || "").trim();
        const nombre = ($("#txNombreCatalogo").val() || "").trim();
        const descripcion = ($("#txDescripcionCatalogo").val() || "").trim();
        const abreviatura = ($("#txAbreviaturaCatalogo").val() || "").trim();

        if (!codigo) {
            return { selector: "#txCodigoCatalogo", message: "Captura un código." };
        }
        if (codigo.length > codeMax) {
            return { selector: "#txCodigoCatalogo", message: "El código no puede exceder " + codeMax + " caracteres." };
        }
        if (!nombre) {
            return { selector: "#txNombreCatalogo", message: "Captura un nombre." };
        }
        if (nombre.length > nameMax) {
            return { selector: "#txNombreCatalogo", message: "El nombre no puede exceder " + nameMax + " caracteres." };
        }
        if (allowDescription && descripcion.length > 500) {
            return { selector: "#txDescripcionCatalogo", message: "La descripción no puede exceder 500 caracteres." };
        }
        if ($("#fieldAplicaACatalogo").is(":visible") && !$("#cbAplicaACatalogo").val()) {
            return { selector: "#cbAplicaACatalogo", message: "Selecciona a qué aplica el registro." };
        }
        if (requiresAbbreviation) {
            if (!abreviatura) {
                return { selector: "#txAbreviaturaCatalogo", message: "Captura una abreviatura." };
            }
            if (abreviatura.length > 20) {
                return { selector: "#txAbreviaturaCatalogo", message: "La abreviatura no puede exceder 20 caracteres." };
            }
        }

        return null;
    }

    function updateFilterSummary() {
        const parts = [];
        const busqueda = ($("#txBusquedaCatalogo").val() || "").trim();
        const estatus = $("#cbFiltroEstatusCatalogo").find("option:selected").text();

        if (busqueda) {
            parts.push("<span class='ca-chip ca-chip--secondary'>Búsqueda: " + escapeHtml(busqueda) + "</span>");
        }
        if ($("#cbFiltroEstatusCatalogo").val()) {
            parts.push("<span class='ca-chip ca-chip--secondary'>Estatus: " + escapeHtml(estatus) + "</span>");
        }

        const accordion = CheckAppUI.getAccordion("ps-catalog-filtros");
        if (accordion) {
            accordion.setSummaryHtml(parts.length ? "<span class='checkapp-summary-inline'>" + parts.join("") + "</span>" : "Sin filtros activos");
        }
    }

    function clearFilters() {
        $("#txBusquedaCatalogo").val("");
        $("#cbFiltroEstatusCatalogo").val("");
        updateFilterSummary();
        CheckAppUI.reloadGrid(config.gridId);
    }

    function resetModal() {
        const form = document.getElementById("frmCatalogoProductosServicios");
        if (form) {
            form.reset();
        }

        $("#hdCatalogoId").val("");
        $("#cbAplicaACatalogo").val("0");
        $("#chkPermiteDecimalesCatalogo").prop("checked", false);
        $("#txCatalogoModalKicker").text("Registro");
        $("#txCatalogoModalTitulo").text("Nueva " + config.title);
        $("#btGuardarCatalogo span").text("Guardar");
        setStatus("#txInfoCatalogo", "", "");
        clearAllFieldErrors();
        finishSaveUi();
    }

    function beginSaveUi() {
        state.isSaving = true;
        syncModalBusyUi(true, "Guardando " + config.title + "...", "Validando información y enviando una sola solicitud.");
    }

    function finishSaveUi() {
        state.isSaving = false;
        syncModalBusyUi(false, "Guardando registro...", "Preparando información del catálogo...");
    }

    function syncModalBusyUi(isBusy, title, status) {
        $("#frmCatalogoProductosServicios").toggleClass("is-saving", !!isBusy);
        $("#catalogoSaveOverlay").attr("aria-hidden", isBusy ? "false" : "true");
        $("#txCatalogoSaveTitle").text(title || "Guardando registro...");
        $("#txCatalogoSaveStatus").text(status || "Preparando información del catálogo...");
        $("#frmCatalogoProductosServicios").find("input, textarea, select, button").prop("disabled", !!isBusy);
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

    function markFieldError(selector) {
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
        document.querySelectorAll("#frmCatalogoProductosServicios .is-invalid").forEach(function (node) {
            node.classList.remove("is-invalid");
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

    function normalizeAplicaAText(value) {
        const text = String(value || "").trim().toLowerCase();
        if (text === "productos") {
            return "Producto";
        }
        if (text === "servicios") {
            return "Servicio";
        }
        return value || "Todos";
    }

    function appendQuery(params, key, value) {
        if (value == null || value === "") {
            return;
        }

        params.append(key, String(value));
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
