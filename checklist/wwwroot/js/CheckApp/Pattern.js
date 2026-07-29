(function (window, document) {
    "use strict";

    if (!window.CheckAppUI) {
        return;
    }

    const host = document.getElementById("checkapp-pattern-page");
    if (!host) {
        return;
    }

    const seedRows = [
        { folio: "ACT-001", nombre: "Montacargas eléctrico", categoria: "Equipo", estado: "Disponible", sitio: "CEDIS Norte", responsable: "Alma Torres", valor: 285000, utilizacion: 0.91, actualizado: "2026-07-22T10:20:00", estatus: "Activo" },
        { folio: "ACT-002", nombre: "Terminal handheld Zebra", categoria: "Dispositivo", estado: "Asignado", sitio: "Tienda Centro", responsable: "Luis Prado", valor: 18250, utilizacion: 0.73, actualizado: "2026-07-24T08:05:00", estatus: "Activo" },
        { folio: "ACT-003", nombre: "Impresora térmica", categoria: "Periférico", estado: "Mantenimiento", sitio: "Tienda Sur", responsable: "Marta Díaz", valor: 8450, utilizacion: 0.42, actualizado: "2026-07-18T12:50:00", estatus: "Inactivo" },
        { folio: "ACT-004", nombre: "Laptop de auditoría", categoria: "Cómputo", estado: "Disponible", sitio: "Corporativo", responsable: "Carlos León", valor: 23990, utilizacion: 0.58, actualizado: "2026-07-23T14:10:00", estatus: "Activo" },
        { folio: "ACT-005", nombre: "Escáner industrial", categoria: "Dispositivo", estado: "Asignado", sitio: "CEDIS Norte", responsable: "Rebeca Soto", valor: 31990, utilizacion: 0.87, actualizado: "2026-07-21T09:45:00", estatus: "Activo" },
        { folio: "ACT-006", nombre: "Cámara térmica", categoria: "Seguridad", estado: "Disponible", sitio: "Tienda Centro", responsable: "Diego Mora", valor: 15990, utilizacion: 0.28, actualizado: "2026-07-19T16:15:00", estatus: "Activo" },
        { folio: "ACT-007", nombre: "Tablet de almacén", categoria: "Cómputo", estado: "Disponible", sitio: "Tienda Sur", responsable: "Nadia Peña", valor: 14200, utilizacion: 0.64, actualizado: "2026-07-20T11:30:00", estatus: "Activo" },
        { folio: "ACT-008", nombre: "Control biométrico", categoria: "Seguridad", estado: "Mantenimiento", sitio: "Corporativo", responsable: "Ernesto Vega", valor: 27600, utilizacion: 0.31, actualizado: "2026-07-17T17:05:00", estatus: "Inactivo" }
    ];

    const sampleRows = Array.from({ length: 4 }).flatMap(function (_item, index) {
        return seedRows.map(function (row, rowIndex) {
            const id = index * seedRows.length + rowIndex + 1;
            return {
                id: id,
                folio: row.folio + "-" + String(index + 1).padStart(2, "0"),
                nombre: row.nombre,
                categoria: row.categoria,
                estado: row.estado,
                sitio: row.sitio,
                responsable: row.responsable,
                valor: row.valor + (index * 350),
                utilizacion: Math.max(0.05, Math.min(0.99, row.utilizacion - (index * 0.03))),
                actualizado: row.actualizado,
                estatus: index % 3 === 2 && rowIndex % 2 === 0 ? "Inactivo" : row.estatus
            };
        });
    });

    let mode = "data";

    function byId(id) {
        return document.getElementById(id);
    }

    function escapeHtml(value) {
        return window.CheckAppUI.escapeHtml(value == null ? "" : value);
    }

    function getFilterValues() {
        return {
            search: (byId("caFilterSearch").value || "").trim().toLowerCase(),
            categoria: byId("caFilterCategoria").value || "",
            estado: byId("caFilterEstado").value || "",
            sitio: byId("caFilterSitio").value || ""
        };
    }

    function buildSummary(filters) {
        const parts = [];
        if (filters.search) {
            parts.push("<span class=\"ca-chip ca-chip--primary\">Búsqueda: " + escapeHtml(filters.search) + "</span>");
        }
        if (filters.categoria) {
            parts.push("<span class=\"ca-chip ca-chip--secondary\">Categoría: " + escapeHtml(filters.categoria) + "</span>");
        }
        if (filters.estado) {
            parts.push("<span class=\"ca-chip ca-chip--secondary\">Estado: " + escapeHtml(filters.estado) + "</span>");
        }
        if (filters.sitio) {
            parts.push("<span class=\"ca-chip ca-chip--secondary\">Sitio: " + escapeHtml(filters.sitio) + "</span>");
        }

        return parts.length
            ? "<span class=\"checkapp-summary-inline\">" + parts.join("") + "</span>"
            : "Sin filtros activos";
    }

    function applyFilters(rows) {
        const filters = getFilterValues();
        return rows.filter(function (row) {
            const hayTexto = !filters.search || [
                row.folio,
                row.nombre,
                row.categoria,
                row.estado,
                row.sitio,
                row.responsable,
                row.estatus
            ].join(" ").toLowerCase().includes(filters.search);

            return hayTexto
                && (!filters.categoria || row.categoria === filters.categoria)
                && (!filters.estado || row.estado === filters.estado)
                && (!filters.sitio || row.sitio === filters.sitio);
        });
    }

    function updateCounters(rows) {
        byId("caStatCertificados").textContent = "16";
        byId("caStatEstados").textContent = "3";
        byId("caStatTotal").textContent = rows.length;
    }

    function setMode(nextMode) {
        mode = nextMode;
        const rows = nextMode === "data" ? applyFilters(sampleRows) : [];
        updateCounters(rows);
        window.CheckAppUI.reloadGrid("checkapp-pattern-grid");
    }

    const accordion = window.CheckAppUI.createFilterAccordion({
        id: "checkapp-pattern-filters",
        selector: "#caFiltersAccordion",
        toggleSelector: ".checkapp-accordion-toggle",
        summarySelector: ".checkapp-accordion-summary",
        open: true,
        emptySummaryText: "Sin filtros activos"
    });

    window.CheckAppUI.createDynamicGrid({
        id: "checkapp-pattern-grid",
        hostSelector: "#caGridHost",
        tableSelector: "#caPatternGrid",
        searchInputSelector: "#caGridSearch",
        exportButtonSelector: "#caExportButton",
        columnToggleButtonSelector: "#caColumnsButton",
        columnTogglePanelSelector: "#caColumnsPanel",
        resultCountSelector: "#caGridCount",
        footerRangeSelector: "#caGridRange",
        footerPageIndicatorSelector: "#caGridPageIndicator",
        footerPrevButtonSelector: "#caGridPrev",
        footerNextButtonSelector: "#caGridNext",
        footerPageSizeSelector: "#caGridPageSize",
        pageLength: 25,
        lengthMenu: [[25, 50, 100], [25, 50, 100]],
        exportFileName: function () {
            return "CheckAppPattern_" + new Date().toISOString().slice(0, 10) + ".xlsx";
        },
        emptyText: "No hay datos para los filtros aplicados en la pantalla laboratorio.",
        errorText: "Se simuló un error de carga para validar el estado visual oficial del patrón.",
        mobileCardTitleKey: "nombre",
        mobileCardMeta: function (row) {
            return "<span class=\"ca-chip ca-chip--secondary\">" + escapeHtml(row.folio) + "</span>";
        },
        mobileCardTemplate: function (row, visibleColumns) {
            const body = visibleColumns
                .filter(function (column) { return column.key !== "acciones" && column.key !== "nombre"; })
                .map(function (column) {
                    const label = escapeHtml(column.title);
                    const value = window.CheckAppUI.renderCell(column, row);
                    return "<div class=\"ca-grid-card-row\"><span class=\"ca-grid-card-label\">" + label + "</span><span class=\"ca-grid-card-value\">" + value + "</span></div>";
                })
                .join("");

            return "<div class=\"ca-grid-card-actions\">"
                + "<button type=\"button\" class=\"ca-btn checkapp-btn checkapp-btn-ghost ca-btn-sm\" data-ca-row-action=\"edit\" data-id=\"" + row.id + "\">Editar</button>"
                + "<button type=\"button\" class=\"ca-btn checkapp-btn checkapp-btn-primary ca-btn-sm\" data-ca-row-action=\"detail\" data-id=\"" + row.id + "\">Detalle</button>"
                + "</div>"
                + body;
        },
        columns: [
            {
                key: "acciones",
                title: "Acciones",
                sortable: false,
                hideable: false,
                exportable: false,
                className: "text-nowrap",
                render: function (_value, row) {
                    return "<div class=\"checkapp-action-list\">"
                        + "<button type=\"button\" data-ca-row-action=\"edit\" data-id=\"" + row.id + "\">Editar</button>"
                        + "<button type=\"button\" data-ca-row-action=\"detail\" data-id=\"" + row.id + "\">Detalle</button>"
                        + "</div>";
                }
            },
            { key: "folio", title: "Folio" },
            { key: "nombre", title: "Nombre" },
            { key: "categoria", title: "Categoría" },
            {
                key: "estado",
                title: "Estado",
                render: function (value) {
                    const badgeClass = value === "Mantenimiento" ? "ca-badge-warning" : value === "Asignado" ? "ca-badge-info" : "ca-badge-success";
                    return "<span class=\"ca-badge " + badgeClass + "\">" + escapeHtml(value) + "</span>";
                }
            },
            { key: "sitio", title: "Sitio" },
            { key: "responsable", title: "Responsable" },
            { key: "valor", title: "Valor", type: "currency" },
            { key: "utilizacion", title: "Uso", type: "percent" },
            { key: "actualizado", title: "Actualización", type: "datetime" },
            {
                key: "estatus",
                title: "Estatus",
                render: function (value) {
                    const badgeClass = value === "Activo" ? "ca-badge-success" : "ca-badge-muted";
                    return "<span class=\"ca-badge " + badgeClass + "\">" + escapeHtml(value) + "</span>";
                }
            }
        ],
        loadData: function () {
            return new Promise(function (resolve, reject) {
                const filters = getFilterValues();
                if (accordion) {
                    accordion.setSummaryHtml(buildSummary(filters));
                }

                window.setTimeout(function () {
                    if (mode === "error") {
                        reject(new Error("Simulación de error"));
                        return;
                    }

                    if (mode === "empty") {
                        resolve([]);
                        return;
                    }

                    resolve(applyFilters(sampleRows));
                }, mode === "loading" ? 900 : 200);
            });
        },
        onLoaded: function (rows) {
            updateCounters(rows);
            byId("caGridVisibleCount").textContent = rows.length + " visibles";
        }
    });

    document.addEventListener("click", function (event) {
        const actionTrigger = event.target.closest("[data-ca-row-action]");
        if (actionTrigger) {
            byId("caModalItemName").value = actionTrigger.getAttribute("data-id");
            const modalInstance = window.bootstrap ? window.bootstrap.Modal.getOrCreateInstance(byId("caPatternModal")) : null;
            if (modalInstance) {
                modalInstance.show();
            }
        }
    });

    byId("caApplyFilters").addEventListener("click", function () {
        setMode("data");
    });

    byId("caClearFilters").addEventListener("click", function () {
        byId("caFilterSearch").value = "";
        byId("caFilterCategoria").value = "";
        byId("caFilterEstado").value = "";
        byId("caFilterSitio").value = "";
        setMode("data");
    });

    byId("caStateData").addEventListener("click", function () {
        setMode("data");
    });

    byId("caStateLoading").addEventListener("click", function () {
        setMode("loading");
    });

    byId("caStateEmpty").addEventListener("click", function () {
        setMode("empty");
    });

    byId("caStateError").addEventListener("click", function () {
        setMode("error");
    });

    byId("caOpenModal").addEventListener("click", function () {
        const modalInstance = window.bootstrap ? window.bootstrap.Modal.getOrCreateInstance(byId("caPatternModal")) : null;
        if (modalInstance) {
            byId("caModalItemName").value = "CHECKAPP-PATTERN";
            modalInstance.show();
        }
    });

    updateCounters(sampleRows);
    byId("caGridVisibleCount").textContent = sampleRows.length + " visibles";
})(window, document);
