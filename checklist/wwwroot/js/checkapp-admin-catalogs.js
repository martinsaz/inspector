(function (window, document, $) {
    "use strict";

    if (!$ || !window.CheckAppUI) {
        return;
    }

    const escapeHtml = window.CheckAppUI.escapeHtml;

    function sessionValue(key) {
        return window.sessionStorage ? window.sessionStorage.getItem(key) : "";
    }

    function baseParams() {
        return {
            idEmpresa: sessionValue("idEmpresa"),
            cadena: sessionValue("cadenaBase64"),
            empresa: sessionValue("empresa"),
            correo: sessionValue("correo")
        };
    }

    function formatDateForFile(date) {
        return date.toISOString().slice(0, 10).replace(/-/g, "");
    }

    function parseLegacyRows(payload) {
        const raw = payload && typeof payload.d === "string" ? payload.d : payload;
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        return parsed && Array.isArray(parsed.aaData) ? parsed.aaData : [];
    }

    function normalizeLegacyRows(rows, columns) {
        return rows.map(function (row) {
            const item = {};
            columns.forEach(function (column, index) {
                item[column.key] = Array.isArray(row) ? row[index] : row[String(index)];
            });
            if (!item.id && item.acciones) {
                const match = String(item.acciones).match(/Editar[A-Za-z]*\(\\"([^"]+)\\"\)/)
                    || String(item.acciones).match(/Editar[A-Za-z]*\("([^"]+)"\)/);
                if (match && match[1]) {
                    item.id = match[1];
                }
            }
            return item;
        });
    }

    function ajaxJson(options) {
        return $.ajax(Object.assign({ dataType: "json" }, options));
    }

    function showBusy(text) {
        if (!window.swal || !window.swal.fire) {
            return;
        }

        window.swal.fire({
            title: "<div>" + escapeHtml(text || "Procesando la petición, por favor espere...") + "</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
            allowEscapeKey: false,
            allowOutsideClick: false,
            showConfirmButton: false
        });
    }

    function closeBusy() {
        if (window.swal && window.swal.close) {
            window.swal.close();
        }
    }

    function notify(icon, text) {
        if (window.swal && window.swal.fire) {
            return window.swal.fire({
                text: text,
                icon: icon,
                buttonsStyling: false,
                confirmButtonText: "Ok, entendido",
                customClass: {
                    confirmButton: "btn font-weight-bold btn-light-primary"
                }
            });
        }

        window.alert(text);
        return $.Deferred().resolve().promise();
    }

    function getFieldValues(fields) {
        const values = {};
        fields.forEach(function (field) {
            values[field.key] = $(field.selector).val();
        });
        return values;
    }

    function setFieldValues(fields, data) {
        fields.forEach(function (field) {
            const value = data && Object.prototype.hasOwnProperty.call(data, field.source || field.key)
                ? data[field.source || field.key]
                : "";
            $(field.selector).val(value == null ? "" : value);
            if ($(field.selector).hasClass("select2")) {
                $(field.selector).trigger("change");
            }
        });
    }

    function resetFields(config) {
        $("#valorId").val("");
        setFieldValues(config.fields, {});
        if (typeof config.afterReset === "function") {
            config.afterReset();
        }
    }

    function updateFilterSummary(config) {
        const active = [];
        (config.filters || []).forEach(function (filter) {
            const value = String($(filter.selector).val() || "").trim();
            if (value) {
                active.push(filter.label);
            }
        });

        const accordion = window.CheckAppUI.getAccordion(config.filterAccordionId);
        if (accordion) {
            accordion.setSummary(active.length ? active.join(", ") : "Sin filtros activos");
        }
    }

    function filterRows(rows, config) {
        return rows.filter(function (row) {
            return (config.filters || []).every(function (filter) {
                const value = String($(filter.selector).val() || "").trim().toLowerCase();
                if (!value) {
                    return true;
                }

                const keys = filter.keys || [];
                return keys.some(function (key) {
                    return String(row[key] || "").toLowerCase().indexOf(value) !== -1;
                });
            });
        });
    }

    function buildGridColumns(config) {
        return config.columns.map(function (column) {
            if (column.key === "acciones") {
                return {
                    key: "acciones",
                    title: "Acciones",
                    sortable: false,
                    hideable: false,
                    exportable: false,
                    render: function (_value, row) {
                        const id = row[config.idKey || "id"];
                        if (!config.canWrite || !id) {
                            return "";
                        }

                        return "<div class='ca-admin-actions'><button type='button' class='ca-admin-icon-btn' data-ca-edit='" + escapeHtml(id) + "' title='Editar' aria-label='Editar'><i class='fa fa-edit'></i></button></div>";
                    }
                };
            }

            return {
                key: column.key,
                title: column.title,
                exportable: column.exportable,
                render: column.render || function (value) {
                    return escapeHtml(value == null ? "" : String(value));
                }
            };
        });
    }

    function initGrid(config) {
        window.CheckAppUI.createDynamicGrid({
            id: config.gridId,
            hostSelector: config.gridHostSelector,
            tableSelector: config.tableSelector,
            searchInputSelector: config.gridSearchSelector,
            exportButtonSelector: config.exportButtonSelector,
            columnToggleButtonSelector: config.columnToggleButtonSelector,
            columnTogglePanelSelector: config.columnTogglePanelSelector,
            resultCountSelector: config.resultCountSelector,
            footerRangeSelector: config.footerRangeSelector,
            footerPageIndicatorSelector: config.footerPageIndicatorSelector,
            footerPrevButtonSelector: config.footerPrevButtonSelector,
            footerNextButtonSelector: config.footerNextButtonSelector,
            footerPageSizeSelector: config.footerPageSizeSelector,
            pageLength: 25,
            lengthMenu: [[25, 50, 100], [25, 50, 100]],
            order: config.order || [[1, "asc"]],
            exportSheetName: config.exportSheetName,
            exportFileName: function () {
                return config.exportFilePrefix + "_" + formatDateForFile(new Date()) + ".xlsx";
            },
            loadData: function () {
                if (config.canAccess === false) {
                    config.rows = [];
                    return [];
                }

                return ajaxJson({
                    url: config.listUrl,
                    type: "GET",
                    data: baseParams()
                }).then(function (payload) {
                    const rows = normalizeLegacyRows(parseLegacyRows(payload), config.columns);
                    config.rows = rows;
                    return filterRows(rows, config);
                });
            },
            columns: buildGridColumns(config),
            onLoaded: function (rows) {
                $(config.visibleCountSelector).text(rows.length + " visibles");
            },
            emptyText: config.emptyText
        });
    }

    function loadPermission(config) {
        return ajaxJson({
            url: config.permissionUrl,
            type: "GET",
            data: baseParams()
        }).then(function (data) {
            config.canAccess = data && data.access != null ? String(data.access) === "1" : true;
            config.canWrite = config.canAccess && String(data && data.perm) === "1";
            $(config.newButtonSelector).toggle(config.canWrite);
        }).catch(function () {
            config.canAccess = false;
            config.canWrite = false;
            $(config.newButtonSelector).hide();
        });
    }

    function openCreate(config) {
        resetFields(config);
        $(config.modalTitleSelector).text(config.createTitle);
        $(config.modalKickerSelector).text("Registro");
        $(config.modalSelector).modal("show");
    }

    function openEdit(config, id) {
        showBusy("Cargando el registro, por favor espere...");
        ajaxJson({
            url: config.detailUrl,
            type: "GET",
            data: Object.assign(baseParams(), config.detailParams(id))
        }).then(function (data) {
            const detail = data && data.d ? data.d : {};
            $("#valorId").val(id);
            setFieldValues(config.fields, detail);
            if (typeof config.afterLoadDetail === "function") {
                config.afterLoadDetail(detail);
            }
            $(config.modalTitleSelector).text(config.editTitle);
            $(config.modalKickerSelector).text("Edición");
            $(config.modalSelector).modal("show");
        }).catch(function (xhr) {
            notify("error", "No fue posible cargar el registro. " + (xhr && xhr.responseText ? xhr.responseText : ""));
        }).always(closeBusy);
    }

    function save(config) {
        const values = getFieldValues(config.fields);
        const missing = config.fields.filter(function (field) {
            return field.required && !String(values[field.key] || "").trim();
        });

        if (missing.length) {
            notify("error", "Completa los campos obligatorios antes de guardar.");
            return;
        }

        showBusy("Procesando la petición, por favor espere...");
        const id = $("#valorId").val();
        const request = Object.assign(baseParams(), config.saveParams(id, values));

        ajaxJson({
            url: config.saveUrl,
            type: config.saveMethod || "GET",
            contentType: config.saveContentType,
            data: config.saveBody ? config.saveBody(request) : request
        }).then(function (data) {
            const result = data && data.d != null ? data.d : "";
            if (result === "Ok" || /guardad|insertad|actualizad/i.test(String(result))) {
                $(config.modalSelector).modal("hide");
                window.CheckAppUI.reloadGrid(config.gridId);
                notify("success", "Los datos se han guardado.");
                return;
            }

            notify("error", result || "Ocurrió un error inesperado. Por favor, intenta de nuevo.");
        }).catch(function (xhr) {
            notify("error", "No fue posible guardar. " + (xhr && xhr.responseText ? xhr.responseText : ""));
        }).always(closeBusy);
    }

    function init(config) {
        config.canWrite = false;
        config.canAccess = true;
        config.rows = [];
        window.CheckAppUI.createFilterAccordion({
            id: config.filterAccordionId,
            selector: config.filterAccordionSelector,
            open: true,
            emptySummaryText: "Sin filtros activos"
        });

        $(document).on("click", config.newButtonSelector, function () {
            openCreate(config);
        });
        $(document).on("click", config.saveButtonSelector, function (event) {
            event.preventDefault();
            save(config);
        });
        $(document).on("click", "[data-ca-edit]", function () {
            openEdit(config, $(this).attr("data-ca-edit"));
        });
        $(document).on("click", config.searchButtonSelector, function () {
            updateFilterSummary(config);
            window.CheckAppUI.reloadGrid(config.gridId);
        });
        $(document).on("click", config.clearButtonSelector, function () {
            (config.filters || []).forEach(function (filter) {
                $(filter.selector).val("");
            });
            updateFilterSummary(config);
            window.CheckAppUI.reloadGrid(config.gridId);
        });

        loadPermission(config).always(function () {
            initGrid(config);
        });

        if (typeof config.afterInit === "function") {
            config.afterInit();
        }
    }

    window.CheckAppAdminCatalog = {
        init: init,
        ajaxJson: ajaxJson,
        baseParams: baseParams,
        escapeHtml: escapeHtml
    };
})(window, document, window.jQuery);
