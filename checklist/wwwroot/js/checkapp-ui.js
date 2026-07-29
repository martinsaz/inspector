(function (window, document, $) {
    "use strict";

    if (!$ || !$.fn || !$.fn.DataTable) {
        return;
    }

    const grids = new Map();
    const accordions = new Map();
    const formatters = {
        number: new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }),
        currency: new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }),
        percent: new Intl.NumberFormat("es-MX", { style: "percent", maximumFractionDigits: 2 })
    };

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function stripHtml(value) {
        return String(value == null ? "" : value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    }

    function getValue(row, key) {
        if (!key) {
            return "";
        }

        return key.split(".").reduce(function (current, part) {
            return current && current[part] != null ? current[part] : "";
        }, row);
    }

    function formatValue(value, type) {
        if (value == null || value === "") {
            return "";
        }

        if (type === "date" || type === "datetime") {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) {
                return "";
            }

            return type === "datetime"
                ? date.toLocaleString("es-MX")
                : date.toLocaleDateString("es-MX");
        }

        if (type === "number") {
            const numericValue = Number(value);
            return Number.isFinite(numericValue) ? formatters.number.format(numericValue) : "";
        }

        if (type === "currency") {
            const numericValue = Number(value);
            return Number.isFinite(numericValue) ? formatters.currency.format(numericValue) : "";
        }

        if (type === "percent") {
            const numericValue = Number(value);
            return Number.isFinite(numericValue) ? formatters.percent.format(numericValue) : "";
        }

        return escapeHtml(value);
    }

    function renderCell(column, row) {
        if (typeof column.render === "function") {
            return column.render(getValue(row, column.key), row, column);
        }

        return formatValue(getValue(row, column.key), column.type);
    }

    function getExportValue(column, row) {
        if (typeof column.exportValue === "function") {
            return column.exportValue(getValue(row, column.key), row, column);
        }

        const value = getValue(row, column.key);
        if (value == null) {
            return "";
        }

        if (column.type === "number" || column.type === "currency" || column.type === "percent") {
            const numericValue = Number(value);
            return Number.isFinite(numericValue) ? numericValue : "";
        }

        if (column.type === "date" || column.type === "datetime") {
            return formatValue(value, column.type);
        }

        return typeof value === "string" ? stripHtml(value) : value;
    }

    function showExportMessage(type, text) {
        if (window.Swal && typeof window.Swal.fire === "function") {
            window.Swal.fire({
                icon: type,
                title: type === "error" ? "No fue posible exportar" : "Exportación Excel",
                text: text
            });
            return;
        }

        if (type === "error") {
            window.console.error(text);
        }
    }

    function buildExportRows(grid, visibleColumns) {
        const filteredRows = grid.instance.rows({ search: "applied" }).indexes().toArray().map(function (index) {
            return grid.rows[index];
        });

        return {
            headers: visibleColumns.map(function (column) { return column.title; }),
            rows: filteredRows.map(function (row) {
                return visibleColumns.map(function (column) {
                    return getExportValue(column, row);
                });
            }),
            filteredCount: filteredRows.length
        };
    }

    function applyWorksheetWidths(worksheet, headers, rows) {
        worksheet["!cols"] = headers.map(function (header, index) {
            const maxLength = rows.reduce(function (max, row) {
                return Math.max(max, String(row[index] == null ? "" : row[index]).length);
            }, header.length);

            return { wch: Math.min(Math.max(maxLength, 12), 40) };
        });
    }

    function getVisibleColumns(grid) {
        return grid.config.columns.filter(function (_column, index) {
            return grid.instance ? grid.instance.column(index).visible() : grid.config.columns[index].visible !== false;
        });
    }

    function updateCountLabel(grid) {
        if (!grid.resultCountNode || !grid.instance) {
            return;
        }

        const filtered = grid.instance.rows({ search: "applied" }).count();
        grid.resultCountNode.textContent = filtered + " registro" + (filtered === 1 ? "" : "s");
    }

    function syncExternalFooter(grid) {
        if (!grid.instance || !grid.usesExternalFooter) {
            return;
        }

        const info = grid.instance.page.info();
        const total = info.recordsDisplay || 0;
        const start = total ? info.start + 1 : 0;
        const end = total ? info.end : 0;

        if (grid.footerRangeNode) {
            grid.footerRangeNode.textContent = total ? ("Mostrando " + start + "-" + end + " de " + total) : "Sin resultados";
        }

        if (grid.footerPageIndicatorNode) {
            grid.footerPageIndicatorNode.textContent = total
                ? ("Página " + (info.page + 1) + " de " + Math.max(info.pages, 1))
                : "Página 0 de 0";
        }

        if (grid.footerPrevButton) {
            grid.footerPrevButton.disabled = !total || info.page <= 0;
        }

        if (grid.footerNextButton) {
            grid.footerNextButton.disabled = !total || info.page >= info.pages - 1;
        }

        if (grid.footerPageSizeNode) {
            grid.footerPageSizeNode.querySelectorAll("[data-page-size]").forEach(function (button) {
                const isActive = Number(button.getAttribute("data-page-size")) === info.length;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-pressed", isActive ? "true" : "false");
            });
        }
    }

    function refreshDataLabels(table) {
        const headers = Array.from(table.querySelectorAll("thead th")).map(function (node) {
            return node.textContent.trim();
        });

        table.querySelectorAll("tbody tr").forEach(function (row) {
            row.querySelectorAll("td").forEach(function (cell, index) {
                cell.setAttribute("data-label", headers[index] || "");
            });
        });
    }

    function renderMobileCards(grid) {
        if (!grid.cardsNode) {
            return;
        }

        const rows = grid.instance
            ? grid.instance.rows({ search: "applied" }).indexes().toArray().map(function (index) { return grid.rows[index]; })
            : grid.rows.slice();
        const visibleColumns = getVisibleColumns(grid);
        const titleKey = grid.config.mobileCardTitleKey || (visibleColumns[0] && visibleColumns[0].key) || "";

        grid.cardsNode.innerHTML = "";

        rows.forEach(function (row) {
            const card = document.createElement("article");
            card.className = "ca-grid-card";

            const cardHead = document.createElement("div");
            cardHead.className = "ca-grid-card-head";

            const titleWrapper = document.createElement("div");
            const title = document.createElement("h4");
            title.className = "ca-grid-card-title";
            title.innerHTML = escapeHtml(getValue(row, titleKey) || "Registro");
            titleWrapper.appendChild(title);

            if (typeof grid.config.mobileCardMeta === "function") {
                const meta = document.createElement("div");
                meta.className = "ca-inline-status";
                meta.innerHTML = grid.config.mobileCardMeta(row);
                titleWrapper.appendChild(meta);
            }

            cardHead.appendChild(titleWrapper);
            card.appendChild(cardHead);

            if (typeof grid.config.mobileCardTemplate === "function") {
                const templateWrapper = document.createElement("div");
                templateWrapper.innerHTML = grid.config.mobileCardTemplate(row, visibleColumns);
                while (templateWrapper.firstChild) {
                    card.appendChild(templateWrapper.firstChild);
                }
            } else {
                visibleColumns.forEach(function (column) {
                    const rowNode = document.createElement("div");
                    rowNode.className = "ca-grid-card-row";

                    const label = document.createElement("span");
                    label.className = "ca-grid-card-label";
                    label.textContent = column.title;

                    const value = document.createElement("span");
                    value.className = "ca-grid-card-value";
                    value.innerHTML = renderCell(column, row);

                    rowNode.appendChild(label);
                    rowNode.appendChild(value);
                    card.appendChild(rowNode);
                });
            }

            grid.cardsNode.appendChild(card);
        });
    }

    function buildColumns(config) {
        return config.columns.map(function (column) {
            return {
                title: column.title,
                data: null,
                visible: column.visible !== false,
                orderable: column.sortable !== false,
                className: column.className || "",
                render: function (_data, _type, row) {
                    return renderCell(column, row);
                }
            };
        });
    }

    function setState(grid, type, title, message) {
        if (!grid.stateNode) {
            return;
        }

        if (!type) {
            grid.stateNode.classList.remove("is-visible");
            grid.stateNode.innerHTML = "";
            grid.host.classList.remove("is-loading", "is-empty", "is-error");
            return;
        }

        grid.stateNode.innerHTML = "<strong>" + escapeHtml(title || "") + "</strong><span>" + escapeHtml(message || "") + "</span>";
        grid.stateNode.classList.add("is-visible");
        grid.host.classList.remove("is-loading", "is-empty", "is-error");
        grid.host.classList.add("is-" + type);
    }

    function ensureGridShell(config) {
        const host = document.querySelector(config.hostSelector);
        if (!host) {
            throw new Error("No se encontró el host del grid.");
        }

        const table = host.querySelector(config.tableSelector || "table");
        if (!table) {
            throw new Error("No se encontró la tabla del grid.");
        }

        host.classList.add("checkapp-grid", "ca-grid-shell");

        let stateNode = host.querySelector(".checkapp-grid-state, .ca-grid-state");
        if (!stateNode) {
            stateNode = document.createElement("div");
            stateNode.className = "checkapp-grid-state ca-grid-state";
            host.appendChild(stateNode);
        }

        let cardsNode = host.querySelector(".ca-grid-cards");
        if (!cardsNode) {
            cardsNode = document.createElement("div");
            cardsNode.className = "ca-grid-cards";
            host.appendChild(cardsNode);
        }

        const resultCountNode = config.resultCountSelector ? document.querySelector(config.resultCountSelector) : null;
        return { host: host, table: table, stateNode: stateNode, cardsNode: cardsNode, resultCountNode: resultCountNode };
    }

    async function loadData(config) {
        if (typeof config.loadData === "function") {
            return await config.loadData();
        }

        return Array.isArray(config.data) ? config.data.slice() : [];
    }

    function exportGrid(gridId) {
        const grid = grids.get(gridId);
        if (!grid || !grid.instance || grid.exportLock) {
            return;
        }

        if (typeof window.XLSX === "undefined") {
            showExportMessage("error", "No fue posible generar el archivo de Excel. Intenta nuevamente.");
            return;
        }

        const visibleColumns = grid.config.columns.filter(function (column, index) {
            return column.exportable !== false && grid.instance.column(index).visible();
        });

        if (!visibleColumns.length) {
            showExportMessage("info", "Selecciona al menos una columna visible para exportar.");
            return;
        }

        grid.exportLock = true;

        try {
            const exportData = buildExportRows(grid, visibleColumns);
            const worksheet = window.XLSX.utils.aoa_to_sheet([exportData.headers].concat(exportData.rows));
            const workbook = window.XLSX.utils.book_new();
            const sheetName = grid.config.exportSheetName || "Datos";
            const fileName = typeof grid.config.exportFileName === "function"
                ? grid.config.exportFileName()
                : (grid.config.exportFileName || "checkapp-grid.xlsx");

            worksheet["!autofilter"] = {
                ref: "A1:" + window.XLSX.utils.encode_cell({ c: exportData.headers.length - 1, r: 0 })
            };
            applyWorksheetWidths(worksheet, exportData.headers, exportData.rows);
            window.XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            window.XLSX.writeFile(workbook, fileName);

            if (exportData.filteredCount === 0) {
                showExportMessage("info", "Se generó un archivo sin registros porque no hay resultados para los filtros aplicados.");
            }
        } catch (_error) {
            showExportMessage("error", "No fue posible generar el archivo de Excel. Intenta nuevamente.");
        } finally {
            window.setTimeout(function () {
                grid.exportLock = false;
            }, 800);
        }
    }

    function renderColumnSelector(grid) {
        if (!grid.columnTogglePanel) {
            return;
        }

        const visibleCount = getVisibleColumns(grid).length;
        grid.columnTogglePanel.innerHTML = "";

        const header = document.createElement("div");
        header.className = "checkapp-grid-columns-header";

        const title = document.createElement("strong");
        title.textContent = "Columnas visibles";

        const meta = document.createElement("span");
        meta.textContent = visibleCount + " activas";

        header.appendChild(title);
        header.appendChild(meta);
        grid.columnTogglePanel.appendChild(header);

        grid.config.columns.forEach(function (column, index) {
            if (column.hideable === false) {
                return;
            }

            const wrapper = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = grid.instance.column(index).visible();
            checkbox.disabled = checkbox.checked && visibleCount <= 1;
            checkbox.addEventListener("change", function () {
                const nextVisibleCount = checkbox.checked ? visibleCount + 1 : visibleCount - 1;
                if (!checkbox.checked && nextVisibleCount < 1) {
                    checkbox.checked = true;
                    return;
                }

                grid.instance.column(index).visible(checkbox.checked);
                refreshDataLabels(grid.table);
                renderColumnSelector(grid);
                renderMobileCards(grid);
                updateCountLabel(grid);
            });

            wrapper.appendChild(checkbox);
            wrapper.appendChild(document.createTextNode(column.title));
            grid.columnTogglePanel.appendChild(wrapper);
        });
    }

    function attachColumnSelector(grid) {
        if (!grid.columnToggleButton || !grid.columnTogglePanel) {
            return;
        }

        grid.columnToggleButton.addEventListener("click", function (event) {
            event.preventDefault();
            grid.columnTogglePanel.classList.toggle("is-open");
            renderColumnSelector(grid);
        });

        document.addEventListener("click", function (event) {
            if (!grid.columnTogglePanel.contains(event.target) && !grid.columnToggleButton.contains(event.target)) {
                grid.columnTogglePanel.classList.remove("is-open");
            }
        });
    }

    async function createDynamicGrid(config) {
        if (!config || !config.id) {
            throw new Error("El grid requiere un id.");
        }

        const existing = grids.get(config.id);
        if (existing) {
            return existing;
        }

        const shell = ensureGridShell(config);
        const grid = {
            id: config.id,
            config: config,
            host: shell.host,
            table: shell.table,
            stateNode: shell.stateNode,
            cardsNode: shell.cardsNode,
            resultCountNode: shell.resultCountNode,
            footerRangeNode: config.footerRangeSelector ? document.querySelector(config.footerRangeSelector) : null,
            footerPageIndicatorNode: config.footerPageIndicatorSelector ? document.querySelector(config.footerPageIndicatorSelector) : null,
            footerPrevButton: config.footerPrevButtonSelector ? document.querySelector(config.footerPrevButtonSelector) : null,
            footerNextButton: config.footerNextButtonSelector ? document.querySelector(config.footerNextButtonSelector) : null,
            footerPageSizeNode: config.footerPageSizeSelector ? document.querySelector(config.footerPageSizeSelector) : null,
            rows: [],
            instance: null,
            exportLock: false,
            searchInput: config.searchInputSelector ? document.querySelector(config.searchInputSelector) : null,
            exportButton: config.exportButtonSelector ? document.querySelector(config.exportButtonSelector) : null,
            columnToggleButton: config.columnToggleButtonSelector ? document.querySelector(config.columnToggleButtonSelector) : null,
            columnTogglePanel: config.columnTogglePanelSelector ? document.querySelector(config.columnTogglePanelSelector) : null,
            usesExternalFooter: !!(config.footerRangeSelector || config.footerPageIndicatorSelector || config.footerPrevButtonSelector || config.footerNextButtonSelector || config.footerPageSizeSelector)
        };

        grids.set(config.id, grid);

        if (grid.exportButton) {
            grid.exportButton.addEventListener("click", function () {
                exportGrid(config.id);
            });
        }

        if (grid.searchInput) {
            grid.searchInput.addEventListener("input", function () {
                if (grid.instance) {
                    grid.instance.search(grid.searchInput.value || "").draw();
                }
            });
        }

        if (grid.footerPrevButton) {
            grid.footerPrevButton.addEventListener("click", function () {
                if (grid.instance) {
                    grid.instance.page("previous").draw("page");
                }
            });
        }

        if (grid.footerNextButton) {
            grid.footerNextButton.addEventListener("click", function () {
                if (grid.instance) {
                    grid.instance.page("next").draw("page");
                }
            });
        }

        if (grid.footerPageSizeNode) {
            grid.footerPageSizeNode.querySelectorAll("[data-page-size]").forEach(function (button) {
                button.addEventListener("click", function () {
                    if (!grid.instance) {
                        return;
                    }

                    const nextSize = Number(button.getAttribute("data-page-size")) || grid.instance.page.len();
                    grid.instance.page.len(nextSize).draw();
                });
            });
        }

        attachColumnSelector(grid);
        await reloadGrid(config.id, true);
        return grid;
    }

    async function reloadGrid(gridId, firstLoad) {
        const grid = grids.get(gridId);
        if (!grid) {
            return;
        }

        setState(grid, "loading", "Cargando información", "Espera un momento mientras preparamos el listado.");

        try {
            const rows = await loadData(grid.config);
            grid.rows = Array.isArray(rows) ? rows : [];

            if (grid.instance) {
                grid.instance.clear();
                grid.instance.rows.add(grid.rows);
                grid.instance.draw();
            } else {
                grid.instance = $(grid.table).DataTable({
                    data: grid.rows,
                    columns: buildColumns(grid.config),
                    order: grid.config.order || [],
                    language: {
                        emptyTable: "Sin registros disponibles",
                        zeroRecords: "No se encontraron coincidencias",
                        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                        infoEmpty: "Mostrando 0 a 0 de 0 registros",
                        lengthMenu: "Mostrar _MENU_ registros",
                        paginate: {
                            previous: "Anterior",
                            next: "Siguiente"
                        }
                    },
                    searching: true,
                    paging: grid.config.paging !== false,
                    pageLength: grid.config.pageLength || 10,
                    lengthMenu: grid.config.lengthMenu || [[10, 25, 50, 100], [10, 25, 50, 100]],
                    ordering: grid.config.ordering !== false,
                    autoWidth: false,
                    responsive: false,
                    destroy: true,
                    dom: grid.usesExternalFooter
                        ? "<'row'<'col-sm-12'tr>>"
                        : "<'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 dataTables_pager'lp>>",
                    drawCallback: function () {
                        refreshDataLabels(grid.table);
                        renderMobileCards(grid);
                        updateCountLabel(grid);
                        syncExternalFooter(grid);
                        if (typeof grid.config.onDraw === "function") {
                            grid.config.onDraw(grid.instance);
                        }
                    }
                });
            }

            if (grid.searchInput) {
                grid.instance.search(grid.searchInput.value || "").draw();
            }

            if (!grid.rows.length) {
                setState(grid, "empty", "Sin resultados", grid.config.emptyText || "No hay información para mostrar con los filtros actuales.");
            } else {
                setState(grid, null);
            }

            refreshDataLabels(grid.table);
            renderMobileCards(grid);
            updateCountLabel(grid);
            syncExternalFooter(grid);

            if (typeof grid.config.onLoaded === "function") {
                grid.config.onLoaded(grid.rows, firstLoad === true);
            }
        } catch (error) {
            setState(grid, "error", "No fue posible cargar la información", grid.config.errorText || "Intenta nuevamente.");
            if (grid.cardsNode) {
                grid.cardsNode.innerHTML = "";
            }
            if (typeof grid.config.onError === "function") {
                grid.config.onError(error);
            }
        }
    }

    function createFilterAccordion(config) {
        if (!config || !config.id) {
            return null;
        }

        if (accordions.has(config.id)) {
            return accordions.get(config.id);
        }

        const root = document.querySelector(config.selector);
        if (!root) {
            return null;
        }

        const toggle = root.querySelector(config.toggleSelector || ".checkapp-accordion-toggle");
        const summary = root.querySelector(config.summarySelector || ".checkapp-accordion-summary");

        const accordion = {
            id: config.id,
            root: root,
            toggle: toggle,
            summary: summary,
            setSummary: function (text) {
                if (summary) {
                    summary.textContent = text || config.emptySummaryText || "Sin filtros activos";
                }
            },
            setSummaryHtml: function (html) {
                if (summary) {
                    summary.innerHTML = html || escapeHtml(config.emptySummaryText || "Sin filtros activos");
                }
            },
            setOpen: function (open) {
                root.classList.toggle("is-open", !!open);
                if (toggle) {
                    toggle.setAttribute("aria-expanded", open ? "true" : "false");
                }
            }
        };

        if (toggle) {
            toggle.addEventListener("click", function () {
                const next = !root.classList.contains("is-open");
                accordion.setOpen(next);
            });
        }

        accordion.setOpen(config.open !== false);
        accordion.setSummary(config.emptySummaryText || "Sin filtros activos");
        accordions.set(config.id, accordion);
        return accordion;
    }

    window.CheckAppUI = {
        createDynamicGrid: createDynamicGrid,
        reloadGrid: reloadGrid,
        createFilterAccordion: createFilterAccordion,
        exportGrid: exportGrid,
        getGrid: function (id) { return grids.get(id); },
        getAccordion: function (id) { return accordions.get(id); },
        escapeHtml: escapeHtml,
        renderCell: renderCell,
        formatValue: formatValue
    };
})(window, document, window.jQuery);
