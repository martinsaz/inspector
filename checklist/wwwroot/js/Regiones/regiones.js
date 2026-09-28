(function (window, document, $) {
    "use strict";

    function applyCatalogPresentation() {
        $("#accordionFiltrosRegiones h3").text("Encuentra regiones por nombre o descripción.");
        $("#txFiltroRegionesBusqueda").attr("placeholder", "Región o descripción");
        $("#grData thead th").filter(function () {
            return $(this).text().trim() === "Notas";
        }).text("Descripción");
        $("#txNombre").closest("label").children("span").first().text("Región *").addClass("visually-hidden");
        $("#txNotas").closest("label").children("span").first().text("Descripción").addClass("visually-hidden");
        $("#txNotas").attr("placeholder", "Descripción");
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (!window.CheckAppAdminCatalog) {
            return;
        }

        applyCatalogPresentation();

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
            bajaUrl: "/Regiones/BajaZona",
            reactivarUrl: "/Regiones/ReactivarZona",
            statusEnabled: true,
            exportSheetName: "Regiones",
            exportFilePrefix: "Regiones",
            createTitle: "Nueva región",
            editTitle: "Editar región",
            createSuccessText: "Región guardada correctamente.",
            editSuccessText: "Región actualizada correctamente.",
            emptyText: "No hay regiones para los filtros aplicados.",
            idKey: "id",
            order: [[1, "asc"]],
            columns: [
                { key: "acciones", title: "Acciones" },
                { key: "nombre", title: "Región" },
                { key: "notas", title: "Descripción", type: "htmlText" },
                { key: "activo", title: "Estatus", type: "status" }
            ],
            filters: [
                {
                    selector: "#txFiltroRegionesBusqueda",
                    label: "Búsqueda",
                    keys: ["nombre", "notas"]
                },
                {
                    selector: "#cbFiltroRegionesEstatus",
                    label: "Estatus",
                    defaultValue: "activo",
                    serverSide: true,
                    keys: ["activo"]
                }
            ],
            fields: [
                { key: "nombre", source: "nombre", selector: "#txNombre", required: true },
                { key: "notas", source: "notas", selector: "#txNotas", richText: true, placeholder: "Descripción" }
            ],
            detailParams: function (id) {
                return { lla: id, cua: id };
            },
            listParams: function () {
                return { estatus: $("#cbFiltroRegionesEstatus").val() };
            },
            statusParams: function (id) {
                return { id: id };
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
