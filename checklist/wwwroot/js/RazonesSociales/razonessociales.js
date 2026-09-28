(function (window, document, $) {
    "use strict";

    let regimenesPromise = null;
    const regimenesMap = {};

    function escapeHtml(value) {
        return window.CheckAppAdminCatalog.escapeHtml(value == null ? "" : String(value));
    }

    function normalizeCatalogItems(payload) {
        const rows = Array.isArray(payload)
            ? payload
            : Array.isArray(payload && payload.data)
                ? payload.data
                : Array.isArray(payload && payload.d)
                    ? payload.d
                    : [];

        return rows.map(function (item) {
            const source = item && typeof item === "object" ? item : {};
            const clave = source.clave || source.Clave || source.value || source.Value || "";
            const nombre = source.nombre || source.Nombre || source.text || source.Text || clave;
            return {
                value: String(clave || ""),
                text: String(nombre || clave || "")
            };
        }).filter(function (item, index, collection) {
            return index === collection.findIndex(function (candidate) {
                return candidate.value === item.value;
            });
        });
    }

    function renderRegimenes(items) {
        const node = document.querySelector("#cbRegimenFiscal");
        if (!node) {
            return;
        }

        Object.keys(regimenesMap).forEach(function (key) {
            delete regimenesMap[key];
        });

        node.innerHTML = items.map(function (item) {
            regimenesMap[item.value] = item.text;
            return "<option value='" + escapeHtml(item.value) + "'>" + escapeHtml(item.text) + "</option>";
        }).join("");
    }

    function ensureRegimenValue(value, text) {
        const normalized = String(value || "");
        const exists = $("#cbRegimenFiscal option").filter(function () {
            return $(this).val() === normalized;
        }).length > 0;
        if (!normalized || exists) {
            return;
        }

        const label = text || normalized;
        regimenesMap[normalized] = label;
        $("#cbRegimenFiscal").append("<option value='" + escapeHtml(normalized) + "'>" + escapeHtml(label) + "</option>");
    }

    function loadRegimenes() {
        if (regimenesPromise) {
            return regimenesPromise;
        }

        regimenesPromise = window.CheckAppAdminCatalog.ajaxJson({
            url: "/Clientes/ObtenerRegimenesFiscalesCliente",
            type: "GET",
            data: window.CheckAppAdminCatalog.baseParams()
        }).then(function (payload) {
            renderRegimenes(normalizeCatalogItems(payload));
        });

        return regimenesPromise;
    }

    function ensureRegimenesReady() {
        return loadRegimenes();
    }

    function ensureRegimenSelectExists() {
        if ($("#cbRegimenFiscal").length) {
            return;
        }

        const input = $("#txRegimenFiscal");
        if (!input.length) {
            return;
        }

        input.replaceWith("<select id='cbRegimenFiscal' name='cbRegimenFiscal' class='form-select' aria-label='Régimen fiscal'></select>");
    }

    function applyCatalogPresentation() {
        ensureRegimenSelectExists();
        $("#grData thead th").filter(function () {
            return $(this).text().trim() === "Notas";
        }).text("Descripción");
        [
            ["#txRazon", "Razón social *"],
            ["#txRepresentante", "Representante *"],
            ["#txRfc", "RFC *"],
            ["#txDireccion", "Dirección *"],
            ["#txColonia", "Colonia *"],
            ["#txCP", "C.P. *"],
            ["#txCiudad", "Ciudad *"],
            ["#txEstado", "Estado *"],
            ["#txPais", "País *"],
            ["#txTelefono", "Teléfono *"],
            ["#cbRegimenFiscal", "Régimen fiscal *"],
            ["#txNotas", "Descripción"]
        ].forEach(function (item) {
            const label = $(item[0]).closest("label").children("span").first();
            label.text(item[1]).addClass("visually-hidden");
        });
        $("#txNotas").attr("placeholder", "Descripción");
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (!window.CheckAppAdminCatalog) {
            return;
        }

        applyCatalogPresentation();

        window.CheckAppAdminCatalog.init({
            gridId: "razones-sociales-grid",
            filterAccordionId: "razones-sociales-filtros",
            filterAccordionSelector: "#accordionFiltrosRazones",
            gridHostSelector: "#gridRazonesHost",
            tableSelector: "#grData",
            gridSearchSelector: "#txBusquedaGridRazones",
            exportButtonSelector: "#btExportarRazones",
            columnToggleButtonSelector: "#btColumnasRazones",
            columnTogglePanelSelector: "#panelColumnasRazones",
            resultCountSelector: "#txGridRazonesCount",
            visibleCountSelector: "#txRazonesVisibleCount",
            footerRangeSelector: "#txGridRazonesRange",
            footerPageIndicatorSelector: "#txGridRazonesPageIndicator",
            footerPrevButtonSelector: "#btGridRazonesPrev",
            footerNextButtonSelector: "#btGridRazonesNext",
            footerPageSizeSelector: "#txGridRazonesPageSize",
            newButtonSelector: "#btNuevo",
            saveButtonSelector: "#btGuardar",
            searchButtonSelector: "#btBuscarRazones",
            clearButtonSelector: "#btLimpiarRazones",
            modalSelector: "#modalNuevo",
            modalTitleSelector: "#modalTitle",
            modalKickerSelector: "#txRazonesModalKicker",
            permissionUrl: "/RazonesSociales/Inicializa",
            listUrl: "/RazonesSociales/GetData",
            detailUrl: "/RazonesSociales/GetRazon",
            saveUrl: "/RazonesSociales/Guardar",
            bajaUrl: "/RazonesSociales/BajaRazon",
            reactivarUrl: "/RazonesSociales/ReactivarRazon",
            statusEnabled: true,
            exportSheetName: "RazonesSociales",
            exportFilePrefix: "RazonesSociales",
            createTitle: "Nueva razón social",
            editTitle: "Editar razón social",
            createSuccessText: "Razón social guardada correctamente.",
            editSuccessText: "Razón social actualizada correctamente.",
            emptyText: "No hay razones sociales para los filtros aplicados.",
            idKey: "id",
            order: [[1, "asc"]],
            columns: [
                { key: "acciones", title: "Acciones" },
                { key: "nombre", title: "Razón Social" },
                { key: "representante", title: "Representante" },
                { key: "rfc", title: "R.F.C" },
                { key: "direccion", title: "Dirección" },
                { key: "colonia", title: "Colonia" },
                { key: "codigoPostal", title: "C.P." },
                { key: "ciudad", title: "Ciudad" },
                { key: "estado", title: "Estado" },
                { key: "pais", title: "País" },
                { key: "telefono", title: "Teléfono" },
                {
                    key: "regimenFiscal",
                    title: "Régimen Fiscal",
                    render: function (value) {
                        return escapeHtml(regimenesMap[String(value || "")] || value || "");
                    },
                    exportValue: function (value) {
                        return regimenesMap[String(value || "")] || value || "";
                    }
                },
                { key: "notas", title: "Descripción", type: "htmlText" },
                { key: "activo", title: "Estatus", type: "status" }
            ],
            filters: [
                {
                    selector: "#txFiltroRazonesBusqueda",
                    label: "Búsqueda",
                    keys: ["nombre", "representante", "rfc", "direccion", "colonia", "telefono", "regimenFiscal", "notas"]
                },
                {
                    selector: "#txFiltroRazonesCiudad",
                    label: "Ciudad",
                    keys: ["ciudad"]
                },
                {
                    selector: "#txFiltroRazonesEstado",
                    label: "Estado",
                    keys: ["estado"]
                },
                {
                    selector: "#cbFiltroRazonesEstatus",
                    label: "Estatus",
                    defaultValue: "activo",
                    serverSide: true,
                    keys: ["activo"]
                }
            ],
            fields: [
                { key: "nombre", source: "nombre", selector: "#txRazon", required: true },
                { key: "representante", source: "representante", selector: "#txRepresentante", required: true },
                { key: "rfc", source: "rfc", selector: "#txRfc", required: true },
                { key: "direccion", source: "direccion", selector: "#txDireccion", required: true },
                { key: "colonia", source: "colonia", selector: "#txColonia", required: true },
                { key: "codigoPostal", source: "codigoPostal", selector: "#txCP", required: true },
                { key: "ciudad", source: "ciudad", selector: "#txCiudad", required: true },
                { key: "estado", source: "estado", selector: "#txEstado", required: true },
                { key: "pais", source: "pais", selector: "#txPais", required: true },
                { key: "telefono", source: "telefono", selector: "#txTelefono", required: true },
                { key: "regimenFiscal", source: "regimen1", selector: "#cbRegimenFiscal", required: true },
                { key: "notas", source: "notas", selector: "#txNotas", richText: true, placeholder: "Descripción" }
            ],
            detailParams: function (id) {
                return { lla: id };
            },
            listParams: function () {
                return { estatus: $("#cbFiltroRazonesEstatus").val() };
            },
            statusParams: function (id) {
                return { id: id };
            },
            saveParams: function (id, values) {
                return {
                    llav: id,
                    razo: values.nombre,
                    repr: values.representante,
                    rfc: values.rfc,
                    dire: values.direccion,
                    colo: values.colonia,
                    cp_: values.codigoPostal,
                    ciud: values.ciudad,
                    esta: values.estado,
                    pais: values.pais,
                    tele: values.telefono,
                    im64: null,
                    imca: "0",
                    nota: values.notas,
                    regi: values.regimenFiscal
                };
            },
            afterInit: function () {
                ensureRegimenesReady().then(function () {
                    window.CheckAppUI.reloadGrid("razones-sociales-grid");
                });
            },
            beforeOpenCreate: function () {
                return ensureRegimenesReady();
            },
            beforeSetFieldValues: function (detail) {
                return ensureRegimenesReady().then(function () {
                    ensureRegimenValue(detail && detail.regimen1, detail && detail.nombreRegimen1);
                });
            }
        });
    });
})(window, document, window.jQuery);
