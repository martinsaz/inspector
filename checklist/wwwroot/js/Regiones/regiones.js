(function (window, document, $) {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        if (!window.CheckAppAdminCatalog) {
            return;
        }

        window.CheckAppAdminCatalog.init({
            gridId: "regiones-grid",
            filterAccordionId: "regiones-filtros",
            filterAccordionSelector: "#accordionFiltrosRegiones",
            gridHostSelector: "#gridRegionesHost",
            tableSelector: "#grData",
            gridSearchSelector: "#txBusquedaGridRegiones",
            exportButtonSelector: "#btExportarRegiones",
            columnToggleButtonSelector: "#btColumnasRegiones",
            columnTogglePanelSelector: "#panelColumnasRegiones",
            resultCountSelector: "#txGridRegionesCount",
            visibleCountSelector: "#txRegionesVisibleCount",
            footerRangeSelector: "#txGridRegionesRange",
            footerPageIndicatorSelector: "#txGridRegionesPageIndicator",
            footerPrevButtonSelector: "#btGridRegionesPrev",
            footerNextButtonSelector: "#btGridRegionesNext",
            footerPageSizeSelector: "#txGridRegionesPageSize",
            newButtonSelector: "#btNuevo",
            saveButtonSelector: "#btGuardar",
            searchButtonSelector: "#btBuscarRegiones",
            clearButtonSelector: "#btLimpiarRegiones",
            modalSelector: "#modalNuevo",
            modalTitleSelector: "#modalTitle",
            modalKickerSelector: "#txRegionesModalKicker",
            permissionUrl: "/Regiones/Inicializa",
            listUrl: "/Regiones/GetData",
            detailUrl: "/Regiones/GetZona",
            saveUrl: "/Regiones/Guardar",
            exportSheetName: "Regiones",
            exportFilePrefix: "Regiones",
            createTitle: "Nueva región",
            editTitle: "Editar región",
            emptyText: "No hay regiones para los filtros aplicados.",
            idKey: "id",
            order: [[1, "asc"]],
            columns: [
                { key: "acciones", title: "Acciones" },
                { key: "nombre", title: "Región" },
                { key: "notas", title: "Notas" }
            ],
            filters: [
                {
                    selector: "#txFiltroRegionesBusqueda",
                    label: "Búsqueda",
                    keys: ["nombre", "notas"]
                }
            ],
            fields: [
                { key: "nombre", source: "nombre", selector: "#txNombre", required: true },
                { key: "notas", source: "notas", selector: "#txNotas" }
            ],
            detailParams: function (id) {
                return { lla: id, cua: id };
            },
            saveParams: function (id, values) {
                return {
                    llave: id,
                    nombre: values.nombre,
                    notas: values.notas
                };
            }
        });
    });
})(window, document, window.jQuery);
