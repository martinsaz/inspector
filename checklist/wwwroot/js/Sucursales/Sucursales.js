(function (window, document, $) {
    "use strict";

    function loadSelect(url, selector) {
        if (!window.CheckAppAdminCatalog) {
            return;
        }

        return window.CheckAppAdminCatalog.ajaxJson({
            url: url,
            type: "GET",
            data: window.CheckAppAdminCatalog.baseParams()
        }).then(function (data) {
            $(selector).html(data && data.d ? data.d : "");
            $(selector).val(null).trigger("change");
        });
    }

    function initSelect2() {
        if ($.fn.select2) {
            $("#cbRazon, #cbZonas").select2({
                width: "100%",
                dropdownParent: $("#modalNuevo")
            });
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (!window.CheckAppAdminCatalog) {
            return;
        }

        window.CheckAppAdminCatalog.init({
            gridId: "sucursales-grid",
            filterAccordionId: "sucursales-filtros",
            filterAccordionSelector: "#accordionFiltrosSucursales",
            gridHostSelector: "#gridSucursalesHost",
            tableSelector: "#grData",
            gridSearchSelector: "#txBusquedaGridSucursales",
            exportButtonSelector: "#btExportarSucursales",
            columnToggleButtonSelector: "#btColumnasSucursales",
            columnTogglePanelSelector: "#panelColumnasSucursales",
            resultCountSelector: "#txGridSucursalesCount",
            visibleCountSelector: "#txSucursalesVisibleCount",
            footerRangeSelector: "#txGridSucursalesRange",
            footerPageIndicatorSelector: "#txGridSucursalesPageIndicator",
            footerPrevButtonSelector: "#btGridSucursalesPrev",
            footerNextButtonSelector: "#btGridSucursalesNext",
            footerPageSizeSelector: "#txGridSucursalesPageSize",
            newButtonSelector: "#btNuevo",
            saveButtonSelector: "#btGuardar",
            searchButtonSelector: "#btBuscarSucursales",
            clearButtonSelector: "#btLimpiarSucursales",
            modalSelector: "#modalNuevo",
            modalTitleSelector: "#modalTitle",
            modalKickerSelector: "#txSucursalesModalKicker",
            permissionUrl: "/Sucursales/Inicializa",
            listUrl: "/Sucursales/GetDataSucursales",
            detailUrl: "/Sucursales/GetSucursal",
            saveUrl: "/Sucursales/GuardaSucursal",
            saveMethod: "POST",
            saveContentType: "application/json; charset=utf-8",
            saveBody: JSON.stringify,
            exportSheetName: "Sucursales",
            exportFilePrefix: "Sucursales",
            createTitle: "Nueva sucursal",
            editTitle: "Editar sucursal",
            emptyText: "No hay sucursales para los filtros aplicados.",
            idKey: "id",
            order: [[1, "asc"]],
            columns: [
                { key: "acciones", title: "Acciones" },
                { key: "nombre", title: "Nombre" },
                { key: "direccion", title: "Dirección" },
                { key: "ciudad", title: "Ciudad" },
                { key: "telefono", title: "Teléfono" },
                { key: "correo", title: "Correo" },
                { key: "pais", title: "País" },
                { key: "razonSocial", title: "Razón Social" },
                { key: "region", title: "Región" }
            ],
            filters: [
                {
                    selector: "#txFiltroSucursalesBusqueda",
                    label: "Búsqueda",
                    keys: ["nombre", "direccion", "ciudad", "telefono", "correo", "pais"]
                },
                {
                    selector: "#txFiltroSucursalesRazon",
                    label: "Razón Social",
                    keys: ["razonSocial"]
                },
                {
                    selector: "#txFiltroSucursalesRegion",
                    label: "Región",
                    keys: ["region"]
                }
            ],
            fields: [
                { key: "nombre", source: "nombre", selector: "#txNombre", required: true },
                { key: "direccion", source: "direccion", selector: "#txCalle", required: true },
                { key: "ciudad", source: "ciudad", selector: "#txCiudad", required: true },
                { key: "telefono", source: "telefono", selector: "#txTelefono", required: true },
                { key: "correo", source: "correo", selector: "#txCorreo", required: true },
                { key: "pais", source: "pais", selector: "#txPais", required: true },
                { key: "idRazonSocial", source: "idRazonSocial", selector: "#cbRazon", required: true },
                { key: "idZona", source: "idZona", selector: "#cbZonas", required: true },
                { key: "notas", source: "notas", selector: "#txNotas" }
            ],
            detailParams: function (id) {
                return { lla: id, cua: id };
            },
            saveParams: function (id, values) {
                return {
                    llav: id,
                    nomb: values.nombre,
                    call: values.direccion,
                    ciud: values.ciudad,
                    tele: values.telefono,
                    emai: values.correo,
                    pais: values.pais,
                    razo: values.idRazonSocial,
                    zona: values.idZona,
                    nota: values.notas
                };
            },
            afterInit: function () {
                initSelect2();
                loadSelect("/Sucursales/GetRazonesSociales", "#cbRazon");
                loadSelect("/Sucursales/GetZonas", "#cbZonas");
            }
        });
    });
})(window, document, window.jQuery);
