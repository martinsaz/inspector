(function (window, document, $) {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        if (!window.CheckAppAdminCatalog) {
            return;
        }

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
            exportSheetName: "RazonesSociales",
            exportFilePrefix: "RazonesSociales",
            createTitle: "Nueva razón social",
            editTitle: "Editar razón social",
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
                { key: "regimenFiscal", title: "Régimen Fiscal" },
                { key: "notas", title: "Notas" }
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
                { key: "regimenFiscal", source: "regimen1", selector: "#txRegimenFiscal", required: true },
                { key: "notas", source: "notas", selector: "#txNotas" }
            ],
            detailParams: function (id) {
                return { lla: id };
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
            }
        });
    });
})(window, document, window.jQuery);
