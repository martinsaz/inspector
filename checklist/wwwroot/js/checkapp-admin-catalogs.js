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

    function editorId(field) {
        return String(field.selector || "").replace(/^#/, "");
    }

    function normalizeRichTextHtml(value) {
        const html = String(value || "").replace(/\u0000/g, "").trim();
        if (!html) {
            return "";
        }

        const text = $("<div>").html(html).text().replace(/\u00a0/g, " ").trim();
        return text ? html : "";
    }

    function richTextToPlainText(value) {
        return $("<div>")
            .html(String(value || ""))
            .text()
            .replace(/\u00a0/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function richTextEditor(field) {
        return window.tinymce && typeof window.tinymce.get === "function"
            ? window.tinymce.get(editorId(field))
            : null;
    }

    function loadCheckAppTinyMce(onLoaded) {
        if (window.tinymce && typeof window.tinymce.init === "function") {
            if (typeof onLoaded === "function") {
                onLoaded();
            }
            return;
        }

        const existingScript = document.querySelector("script[data-checkapp-tinymce-loader]");
        if (existingScript) {
            if (typeof onLoaded === "function") {
                existingScript.addEventListener("load", onLoaded, { once: true });
            }
            return;
        }

        const script = document.createElement("script");
        script.src = "/assets/plugins/custom/tinymce/tinymce.bundle.js";
        script.async = true;
        script.setAttribute("data-checkapp-tinymce-loader", "true");
        if (typeof onLoaded === "function") {
            script.addEventListener("load", onLoaded, { once: true });
        }
        document.head.appendChild(script);
    }

    function getRichTextValue(field) {
        const editor = richTextEditor(field);
        if (editor) {
            return normalizeRichTextHtml(editor.getContent({ format: "html" }));
        }

        return normalizeRichTextHtml($(field.selector).val());
    }

    function setRichTextValue(field, value) {
        const normalized = normalizeRichTextHtml(value);
        $(field.selector).val(normalized);
        const editor = richTextEditor(field);
        if (editor) {
            editor.setContent(normalized);
        }
    }

    function initRichTextFields(fields) {
        if (!fields.some(function (field) { return field.richText; })) {
            return;
        }

        if (!window.tinymce || typeof window.tinymce.init !== "function") {
            loadCheckAppTinyMce(function () {
                initRichTextFields(fields);
            });
            return;
        }

        fields.filter(function (field) { return field.richText; }).forEach(function (field) {
            const id = editorId(field);
            if (!id || richTextEditor(field)) {
                return;
            }

            window.tinymce.init({
                selector: field.selector,
                menubar: false,
                statusbar: false,
                branding: false,
                height: field.height || 128,
                plugins: "lists link code",
                toolbar: "blocks | bold italic underline | bullist numlist | alignleft aligncenter alignright | link unlink | code removeformat",
                block_formats: "Párrafo=p; Encabezado 2=h2; Encabezado 3=h3; Cita=blockquote",
                placeholder: field.placeholder || "Notas",
                browser_spellcheck: true,
                content_style: "body{font-family:Inter,Arial,sans-serif;font-size:14px;color:#1f2937;} p{margin:0 0 8px;} ul,ol{padding-left:20px;margin:0 0 8px;}",
                setup: function (editor) {
                    editor.on("change keyup blur", function () {
                        editor.save();
                    });
                }
            });
        });
    }

    function getFieldValues(fields) {
        const values = {};
        fields.forEach(function (field) {
            values[field.key] = field.richText ? getRichTextValue(field) : $(field.selector).val();
        });
        return values;
    }

    function setFieldValues(fields, data) {
        fields.forEach(function (field) {
            const value = data && Object.prototype.hasOwnProperty.call(data, field.source || field.key)
                ? data[field.source || field.key]
                : "";
            if (field.richText) {
                setRichTextValue(field, value);
                return;
            }

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
            if (value && value !== String(filter.defaultValue || "")) {
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
                if (filter.serverSide) {
                    return true;
                }

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

    function isActiveRow(row) {
        const value = row && row.activo != null ? row.activo : row && row.borrado != null ? !row.borrado : true;
        if (typeof value === "boolean") {
            return value;
        }

        const normalized = String(value == null ? "" : value).trim().toLowerCase();
        return normalized !== "false" && normalized !== "0" && normalized !== "inactivo" && normalized !== "baja lógica" && normalized !== "baja logica";
    }

    function statusText(row) {
        return isActiveRow(row) ? "Activo" : "Baja lógica";
    }

    function renderStatus(row) {
        const active = isActiveRow(row);
        const css = active ? "checkapp-badge checkapp-badge-success" : "checkapp-badge checkapp-badge-muted";
        return "<span class='" + css + "'>" + statusText(row) + "</span>";
    }

    function statusActionButton(id, active) {
        if (active) {
            return "<a href='javascript:void(0);' role='button' class='is-danger' data-ca-status='false' data-ca-id='" + escapeHtml(id) + "' title='Dar de baja' aria-label='Dar de baja'><i class='fa fa-ban'></i></a>";
        }

        return "<a href='javascript:void(0);' role='button' class='is-success' data-ca-status='true' data-ca-id='" + escapeHtml(id) + "' title='Reactivar' aria-label='Reactivar'><i class='fa fa-check'></i></a>";
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

                        const buttons = [
                            "<a href='javascript:void(0);' role='button' data-ca-edit='" + escapeHtml(id) + "' title='Editar' aria-label='Editar'><i class='fa fa-edit'></i></a>"
                        ];

                        if (config.statusEnabled && config.bajaUrl && config.reactivarUrl) {
                            buttons.push(statusActionButton(id, isActiveRow(row)));
                        }

                        return "<div class='ps-catalog-actions'>" + buttons.join("") + "</div>";
                    }
                };
            }

            return {
                key: column.key,
                title: column.title,
                exportable: column.exportable,
                exportValue: column.type === "status" ? function (_value, row) {
                    return statusText(row || { activo: _value });
                } : column.type === "htmlText" ? function (value) {
                    return richTextToPlainText(value);
                } : column.exportValue,
                render: column.render || function (value) {
                    if (column.type === "status") {
                        const row = arguments.length > 1 && arguments[1] ? arguments[1] : { activo: value };
                        return renderStatus(row);
                    }
                    if (column.type === "htmlText") {
                        return escapeHtml(richTextToPlainText(value));
                    }
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
                    data: Object.assign(baseParams(), typeof config.listParams === "function" ? config.listParams() : {})
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
        initRichTextFields(config.fields || []);
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
            initRichTextFields(config.fields || []);
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

    function changeStatus(config, id, activate) {
        const text = activate ? "¿Deseas reactivar este registro?" : "¿Deseas aplicar baja lógica a este registro?";
        const confirmText = activate ? "Sí, reactivar" : "Sí, dar de baja";
        const successText = activate ? "El registro fue reactivado." : "El registro quedó en baja lógica.";
        const url = activate ? config.reactivarUrl : config.bajaUrl;
        const run = function () {
            showBusy("Procesando la petición, por favor espere...");
            return ajaxJson({
                url: url,
                type: "POST",
                data: Object.assign(baseParams(), typeof config.statusParams === "function" ? config.statusParams(id, activate) : { id: id })
            }).then(function (data) {
                const result = data && data.d != null ? data.d : "Ok";
                if (result === "Ok" || /reactivad|baja|actualizad/i.test(String(result))) {
                    window.CheckAppUI.reloadGrid(config.gridId);
                    notify("success", successText);
                    return;
                }

                notify("error", result || "No fue posible actualizar el estatus.");
            }).catch(function (xhr) {
                notify("error", "No fue posible actualizar el estatus. " + (xhr && xhr.responseText ? xhr.responseText : ""));
            }).always(closeBusy);
        };

        if (window.swal && window.swal.fire) {
            window.swal.fire({
                text: text,
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                confirmButtonText: confirmText,
                cancelButtonText: "Cancelar",
                customClass: {
                    confirmButton: "btn font-weight-bold btn-danger",
                    cancelButton: "btn font-weight-bold btn-light"
                }
            }).then(function (result) {
                if (result && result.isConfirmed) {
                    run();
                }
            });
            return;
        }

        if (window.confirm(text)) {
            run();
        }
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
        $(document).on("click", "[data-ca-status]", function () {
            changeStatus(config, $(this).attr("data-ca-id"), $(this).attr("data-ca-status") === "true");
        });
        $(document).on("click", config.searchButtonSelector, function () {
            updateFilterSummary(config);
            window.CheckAppUI.reloadGrid(config.gridId);
        });
        $(document).on("click", config.clearButtonSelector, function () {
            (config.filters || []).forEach(function (filter) {
                $(filter.selector).val("");
                if (filter.defaultValue != null) {
                    $(filter.selector).val(filter.defaultValue);
                }
                if ($(filter.selector).hasClass("select2")) {
                    $(filter.selector).trigger("change");
                }
            });
            updateFilterSummary(config);
            window.CheckAppUI.reloadGrid(config.gridId);
        });

        loadPermission(config).always(function () {
            initGrid(config);
        });

        initRichTextFields(config.fields || []);

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
