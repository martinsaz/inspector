(function (window, document, $) {
    "use strict";

    if (!window.fetch || !$ || !window.CheckAppUI) {
        return;
    }

    const GRID_ID = "clientes-reporte-grid";
    const REPORTS = {
        "ranking-frecuencia": { groups: ["single-range", "top"], defaultTop: 100 },
        "antiguedad-recencia": { groups: ["cutoff", "top"], defaultTop: 100 },
        "nuevos-periodo": { groups: ["single-range", "top"], defaultTop: 100 },
        "comparativo-periodos": { groups: ["period-1", "period-2", "top"], defaultTop: 100 }
    };

    const state = {
        accordion: null,
        grid: null,
        config: null,
        currentReport: "",
        rows: [],
        currentResponse: null
    };

    document.addEventListener("DOMContentLoaded", function () {
        state.accordion = CheckAppUI.createFilterAccordion({
            id: "clientes-reporte-filtros",
            selector: "#accordionFiltrosClientesReporte",
            open: true,
            emptySummaryText: "Sin filtros activos"
        });

        applyDefaultDates();
        bindEvents();
        initGrid()
            .then(loadConfig)
            .catch(function (error) {
                showStatus("danger", resolveErrorMessage(error));
            });
    });

    function bindEvents() {
        $("#cbReporteClientes").on("change", function () {
            state.currentReport = String($(this).val() || "").trim();
            applyReportVisibility();
            updateFilterSummary();
            resetResultPresentation();
        });

        $("#btGenerarReporteClientes").on("click", function () {
            generateReport();
        });

        $("#btLimpiarReporteClientes").on("click", function () {
            resetFilters();
            resetResultPresentation();
        });

        $("#btExportarReporteClientes").on("click", function () {
            exportReport();
        });

        $("#txBusquedaClientesReporte").on("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                generateReport();
            }
        });

        $("#accordionFiltrosClientesReporte input, #accordionFiltrosClientesReporte select").on("input change", function () {
            updateFilterSummary();
        });
    }

    function initGrid() {
        return CheckAppUI.createDynamicGrid({
            id: GRID_ID,
            hostSelector: "#gridClientesReporteHost",
            tableSelector: "#grClientesReporte",
            searchInputSelector: "#txBusquedaGridClientesReporte",
            resultCountSelector: "#txClientesReporteCount",
            footerRangeSelector: "#txClientesReporteRange",
            footerPageIndicatorSelector: "#txClientesReportePageIndicator",
            footerPrevButtonSelector: "#btClientesReportePrev",
            footerNextButtonSelector: "#btClientesReporteNext",
            footerPageSizeSelector: "#txClientesReportePageSize",
            pageLength: 25,
            lengthMenu: [[25, 50, 100], [25, 50, 100]],
            order: [],
            emptyText: "Selecciona un reporte y genera un resultado para comenzar.",
            mobileCardTitleKey: "principal",
            mobileCardMeta: function (row) {
                return "<span class='ca-chip ca-chip--secondary'>" + escapeHtml(row.secundario || "Sin detalle adicional") + "</span>";
            },
            mobileCardTemplate: function (row) {
                const cells = [row.c1, row.c2, row.c3, row.c4, row.c5, row.c6, row.c7, row.c8].filter(Boolean);
                return [
                    "<div class='clientes-reportes-mobile-card'>",
                    "<div class='clientes-reportes-mobile-summary'>" + cells.map(function (value) {
                        return "<div class='clientes-reportes-mobile-item'><strong>" + escapeHtml(value) + "</strong></div>";
                    }).join(""),
                    "</div>",
                    row.actionUrl ? "<div class='clientes-reportes-mobile-actions'><a class='checkapp-btn checkapp-btn-secondary' href='" + escapeHtml(row.actionUrl) + "'>" + escapeHtml(row.actionText || "Abrir cliente") + "</a></div>" : "",
                    "</div>"
                ].join("");
            },
            loadData: function () {
                return Promise.resolve(state.rows);
            },
            columns: [
                {
                    key: "actionText",
                    title: "Acción",
                    sortable: false,
                    hideable: false,
                    exportable: false,
                    render: function (_value, row) {
                        if (!row.actionUrl) {
                            return "<span class='ca-chip ca-chip--secondary'>Sin acción</span>";
                        }

                        return "<a class='checkapp-btn checkapp-btn-secondary checkapp-btn-inline' href='" + escapeHtml(row.actionUrl) + "'>" + escapeHtml(row.actionText || "Abrir cliente") + "</a>";
                    }
                },
                { key: "c1", title: "Columna 1" },
                { key: "c2", title: "Columna 2" },
                { key: "c3", title: "Columna 3" },
                { key: "c4", title: "Columna 4" },
                { key: "c5", title: "Columna 5" },
                { key: "c6", title: "Columna 6" },
                { key: "c7", title: "Columna 7" },
                { key: "c8", title: "Columna 8" }
            ],
            onLoaded: function (rows) {
                $("#txClientesReporteVisibleCount").text((rows || []).length + " visibles");
            },
            onError: function (error) {
                $("#txClientesReporteVisibleCount").text("0 visibles");
                showStatus("danger", resolveErrorMessage(error));
            }
        }).then(function (grid) {
            state.grid = grid;
            return grid;
        });
    }

    function loadConfig() {
        return apiRequest("/Clientes/ObtenerConfiguracionReporte", { method: "GET" })
            .then(function (response) {
                state.config = response.data || {};
                populateReports(state.config.reportes || []);
                populateClassifications(state.config.clasificaciones || []);
                state.currentReport = String($("#cbReporteClientes").val() || "").trim();
                applyReportVisibility();
                updateFilterSummary();
            });
    }

    function populateReports(items) {
        const $select = $("#cbReporteClientes");
        $select.empty();

        let visibleIndex = 0;

        (items || []).forEach(function (item) {
            if (String(item.estado || "").toLowerCase() !== "ready") {
                return;
            }

            const option = $("<option></option>")
                .val(item.id || "")
                .text(item.nombre || "Reporte");

            if (visibleIndex === 0) {
                option.prop("selected", true);
            }

            $select.append(option);
            visibleIndex += 1;
        });
    }

    function populateClassifications(items) {
        const $select = $("#cbClasificacionClientesReporte");
        $select.empty();

        (items || []).forEach(function (item) {
            $select.append($("<option></option>").val(item.id || "").text(item.nombre || "Todas"));
        });
    }

    function applyDefaultDates() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const start = yyyy + "-" + mm + "-01";
        const end = yyyy + "-" + mm + "-" + dd;

        $("#txFechaInicialClientesReporte, #txPeriodo1InicialClientesReporte").val(start);
        $("#txFechaFinalClientesReporte, #txPeriodo1FinalClientesReporte, #txFechaCorteClientesReporte").val(end);

        const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        $("#txPeriodo2InicialClientesReporte").val(formatDateForInput(previousMonth));
        $("#txPeriodo2FinalClientesReporte").val(formatDateForInput(previousMonthEnd));
    }

    function applyReportVisibility() {
        const config = REPORTS[state.currentReport] || { groups: ["single-range"], defaultTop: 100 };
        const visible = config.groups || [];

        $("[data-filter-group]").attr("hidden", true);
        visible.forEach(function (group) {
            $("[data-filter-group='" + group + "']").attr("hidden", false);
        });

        $("#txTopClientesReporte").val(config.defaultTop || 100);
    }

    function generateReport() {
        const selectedOption = $("#cbReporteClientes option:selected");
        const estado = String(selectedOption.attr("data-estado") || "ready").toLowerCase();

        if (estado !== "ready") {
            const motivo = selectedOption.attr("data-motivo") || "El reporte seleccionado no tiene una base de datos real suficiente dentro del vertical.";
            renderGapState({
                titulo: selectedOption.text(),
                descripcion: motivo
            });
            return Promise.resolve();
        }

        showStatus("", "");
        $("#btGenerarReporteClientes").prop("disabled", true);

        return apiRequest("/Clientes/GenerarReporte?" + buildQuery().toString(), { method: "GET" })
            .then(function (response) {
                applyReportResponse(response.data || {});
            })
            .catch(function (error) {
                state.rows = [];
                state.currentResponse = null;
                $("#btExportarReporteClientes").prop("disabled", true);
                CheckAppUI.reloadGrid(GRID_ID, false);
                showStatus("danger", resolveErrorMessage(error));
            })
            .finally(function () {
                $("#btGenerarReporteClientes").prop("disabled", false);
            });
    }

    function applyReportResponse(payload) {
        state.currentResponse = payload || {};

        if (String(payload.estado || "").toLowerCase() !== "ready") {
            renderGapState(payload);
            return;
        }

        $("#txClientesReporteTitulo").text(payload.titulo || "Reporte generado");
        $("#txClientesReporteDescripcion").text(payload.descripcion || "Reporte generado con datos reales del vertical.");
        $("#txClientesReporteRango").text(payload.rango || "Sin rango");
        renderIndicators(payload.indicadores || []);
        renderHeaders(payload.columnas || []);

        state.rows = normalizeRows(payload.filas || []);
        $("#btExportarReporteClientes").prop("disabled", !state.rows.length);

        CheckAppUI.reloadGrid(GRID_ID, false);
        showStatus(state.rows.length ? "success" : "warning", state.rows.length ? "Reporte generado correctamente." : "El reporte no encontró registros con los filtros actuales.");
    }

    function renderGapState(payload) {
        state.rows = [];
        state.currentResponse = payload || {};
        renderIndicators(payload.indicadores || []);
        $("#txClientesReporteTitulo").text(payload.titulo || "Reporte no disponible");
        $("#txClientesReporteDescripcion").text(payload.descripcion || "No existe base real suficiente para este reporte.");
        $("#txClientesReporteRango").text("Brecha real");
        $("#btExportarReporteClientes").prop("disabled", true);
        renderHeaders([]);
        CheckAppUI.reloadGrid(GRID_ID, false);
        showStatus("warning", payload.mensaje || payload.descripcion || "Este reporte no puede implementarse sin inventar datos.");
    }

    function renderIndicators(items) {
        const $host = $("#clientesReporteIndicadores");
        $host.empty();

        (items || []).forEach(function (item) {
            const article = $("<article class='clientes-reportes-indicator'></article>");
            article.append($("<small></small>").text(item.etiqueta || ""));
            article.append($("<strong></strong>").text(item.valor || ""));
            $host.append(article);
        });
    }

    function renderHeaders(columns) {
        for (let index = 1; index <= 8; index += 1) {
            const title = columns[index - 1] && columns[index - 1].titulo ? columns[index - 1].titulo : "—";
            $("#grClientesReporte thead th[data-grid-col='" + index + "']").text(title);
        }
    }

    function normalizeRows(rows) {
        return (rows || []).map(function (item) {
            const celdas = Array.isArray(item.celdas) ? item.celdas : [];
            return {
                idCliente: item.idCliente || "",
                principal: item.principal || "",
                secundario: item.secundario || "",
                actionText: item.accionTexto || "Abrir cliente",
                actionUrl: item.accionUrl || "",
                c1: celdas[0] || "",
                c2: celdas[1] || "",
                c3: celdas[2] || "",
                c4: celdas[3] || "",
                c5: celdas[4] || "",
                c6: celdas[5] || "",
                c7: celdas[6] || "",
                c8: celdas[7] || ""
            };
        });
    }

    function resetFilters() {
        $("#txBusquedaClientesReporte").val("");
        $("#cbClasificacionClientesReporte").val("");
        applyDefaultDates();
        state.currentReport = String($("#cbReporteClientes").val() || "").trim();
        applyReportVisibility();
        updateFilterSummary();
    }

    function resetResultPresentation() {
        state.rows = [];
        state.currentResponse = null;
        renderIndicators([]);
        $("#txClientesReporteTitulo").text("Selecciona un reporte");
        $("#txClientesReporteDescripcion").text("Ajusta filtros y genera un reporte sustentado por datos reales del vertical Clientes.");
        $("#txClientesReporteRango").text("Sin rango");
        $("#txClientesReporteVisibleCount").text("0 visibles");
        $("#btExportarReporteClientes").prop("disabled", true);
        renderHeaders([]);
        CheckAppUI.reloadGrid(GRID_ID, false);
        showStatus("", "");
    }

    function buildQuery() {
        const params = new URLSearchParams();
        appendQuery(params, "reporte", $("#cbReporteClientes").val());
        appendQuery(params, "busqueda", $("#txBusquedaClientesReporte").val());
        appendQuery(params, "clasificacion", $("#cbClasificacionClientesReporte").val());
        appendQuery(params, "top", $("#txTopClientesReporte").val());
        appendQuery(params, "fechaInicial", $("#txFechaInicialClientesReporte").val());
        appendQuery(params, "fechaFinal", $("#txFechaFinalClientesReporte").val());
        appendQuery(params, "fechaCorte", $("#txFechaCorteClientesReporte").val());
        appendQuery(params, "periodo1Inicial", $("#txPeriodo1InicialClientesReporte").val());
        appendQuery(params, "periodo1Final", $("#txPeriodo1FinalClientesReporte").val());
        appendQuery(params, "periodo2Inicial", $("#txPeriodo2InicialClientesReporte").val());
        appendQuery(params, "periodo2Final", $("#txPeriodo2FinalClientesReporte").val());
        return params;
    }

    function updateFilterSummary() {
        if (!state.accordion) {
            return;
        }

        const items = [];
        const reporte = $("#cbReporteClientes option:selected").text();
        const busqueda = String($("#txBusquedaClientesReporte").val() || "").trim();
        const clasificacion = $("#cbClasificacionClientesReporte option:selected").text();

        if (reporte) {
            items.push("Reporte: " + reporte);
        }
        if (busqueda) {
            items.push("Búsqueda: " + busqueda);
        }
        if ($("#cbClasificacionClientesReporte").val()) {
            items.push("Clasificación: " + clasificacion);
        }

        const visibleGroups = REPORTS[state.currentReport] ? REPORTS[state.currentReport].groups : [];
        if (visibleGroups.indexOf("single-range") >= 0) {
            items.push("Rango: " + ($("#txFechaInicialClientesReporte").val() || "—") + " a " + ($("#txFechaFinalClientesReporte").val() || "—"));
        }
        if (visibleGroups.indexOf("cutoff") >= 0) {
            items.push("Corte: " + ($("#txFechaCorteClientesReporte").val() || "—"));
        }
        if (visibleGroups.indexOf("period-1") >= 0 || visibleGroups.indexOf("period-2") >= 0) {
            items.push("P1: " + ($("#txPeriodo1InicialClientesReporte").val() || "—") + " a " + ($("#txPeriodo1FinalClientesReporte").val() || "—"));
            items.push("P2: " + ($("#txPeriodo2InicialClientesReporte").val() || "—") + " a " + ($("#txPeriodo2FinalClientesReporte").val() || "—"));
        }
        if (visibleGroups.indexOf("top") >= 0) {
            items.push("Top: " + ($("#txTopClientesReporte").val() || "100"));
        }

        state.accordion.setSummary(items.length ? items.join(" · ") : "Sin filtros activos");
    }

    function exportReport() {
        if (!state.currentResponse || !state.rows.length) {
            return Promise.resolve();
        }

        const url = "/Clientes/ExportarReporteExcel?" + buildQuery().toString();
        $("#btExportarReporteClientes").prop("disabled", true);

        return downloadFile(url, "GET")
            .then(function () {
                showStatus("success", "El archivo se exportó correctamente.");
            })
            .catch(function (error) {
                showStatus("danger", resolveErrorMessage(error));
            })
            .finally(function () {
                $("#btExportarReporteClientes").prop("disabled", !state.rows.length);
            });
    }

    function apiRequest(url, options) {
        return fetch(url, {
            method: options && options.method ? options.method : "GET",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "Accept": "application/json"
            }
        }).then(function (response) {
            return response.text().then(function (text) {
                let data = {};
                try {
                    data = text ? JSON.parse(text) : {};
                } catch (_error) {
                    data = {};
                }

                if (!response.ok) {
                    const message = data && data.mensaje ? data.mensaje : "No fue posible completar la solicitud.";
                    throw new Error(message);
                }

                return { data: data };
            });
        });
    }

    function downloadFile(url, method) {
        return fetch(url, {
            method: method || "GET",
            headers: { "X-Requested-With": "XMLHttpRequest" }
        }).then(function (response) {
            if (!response.ok) {
                return response.text().then(function (text) {
                    try {
                        const data = JSON.parse(text);
                        throw new Error(data.mensaje || "No fue posible exportar el archivo.");
                    } catch (_error) {
                        throw new Error("No fue posible exportar el archivo.");
                    }
                });
            }

            return Promise.all([Promise.resolve(response), response.blob()]);
        }).then(function (result) {
            const response = result[0];
            const blob = result[1];
            const href = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            const disposition = response.headers.get("Content-Disposition") || "";
            const match = disposition.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i);
            link.href = href;
            link.download = match && match[1] ? decodeURIComponent(match[1]) : "reporte-clientes.xlsx";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(href);
        });
    }

    function showStatus(type, message) {
        const $node = $("#txInfoClientesReporte");
        $node.removeClass("is-success is-warning is-danger");

        if (!type || !message) {
            $node.text("");
            return;
        }

        $node.addClass("is-" + type).text(message);
    }

    function appendQuery(params, key, value) {
        const normalized = value == null ? "" : String(value).trim();
        if (normalized) {
            params.append(key, normalized);
        }
    }

    function resolveErrorMessage(error) {
        if (!error) {
            return "No fue posible completar la solicitud.";
        }

        if (typeof error === "string") {
            return error;
        }

        return error.message || "No fue posible completar la solicitud.";
    }

    function formatDateForInput(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return yyyy + "-" + mm + "-" + dd;
    }

    function escapeHtml(value) {
        return window.CheckAppUI && typeof window.CheckAppUI.escapeHtml === "function"
            ? window.CheckAppUI.escapeHtml(value == null ? "" : String(value))
            : String(value == null ? "" : value);
    }
})(window, document, window.jQuery);
