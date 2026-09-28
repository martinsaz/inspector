(function (window, document, $) {
    "use strict";

    const selectLoadState = {
        razones: null,
        regiones: null
    };

    function placeholderOption(label) {
        return "<option value=''>" + window.CheckAppAdminCatalog.escapeHtml(label) + "</option>";
    }

    function normalizeOptions(data, placeholder) {
        if (typeof data === "string") {
            return placeholderOption(placeholder) + data;
        }

        if (data && typeof data.d === "string") {
            return placeholderOption(placeholder) + data.d;
        }

        const rows = Array.isArray(data) ? data : Array.isArray(data && data.data) ? data.data : [];
        return placeholderOption(placeholder) + rows.map(function (item) {
            const source = item && typeof item === "object" ? item : {};
            const value = source.id || source.Id || source.value || source.Value || "";
            const text = source.nombre || source.Nombre || source.name || source.Name || source.text || source.Text || value;
            return "<option value='" + window.CheckAppAdminCatalog.escapeHtml(value) + "'>" +
                window.CheckAppAdminCatalog.escapeHtml(text) +
                "</option>";
        }).join("");
    }

    function loadSelect(url, targets) {
        if (!window.CheckAppAdminCatalog) {
            return $.Deferred().resolve().promise();
        }

        return window.CheckAppAdminCatalog.ajaxJson({
            url: url,
            type: "GET",
            data: window.CheckAppAdminCatalog.baseParams()
        }).then(function (data) {
            targets.forEach(function (target) {
                $(target.selector).html(normalizeOptions(data, target.placeholder));
                if (!$(target.selector).val()) {
                    $(target.selector).val("").trigger("change");
                }
            });
        });
    }

    function ensureCatalogsLoaded() {
        if (!selectLoadState.razones) {
            selectLoadState.razones = loadSelect("/Sucursales/GetRazonesSociales", [
                { selector: "#cbRazon", placeholder: "Razón social" },
                { selector: "#cbFiltroSucursalesRazon", placeholder: "Todas" }
            ]);
        }

        if (!selectLoadState.regiones) {
            selectLoadState.regiones = loadSelect("/Sucursales/GetZonas", [
                { selector: "#cbZonas", placeholder: "Región" },
                { selector: "#cbFiltroSucursalesRegion", placeholder: "Todas" }
            ]);
        }

        return $.when(selectLoadState.razones, selectLoadState.regiones);
    }

    function applyCatalogPresentation() {
        [
            ["#txNombre", "Nombre *"],
            ["#txCalle", "Dirección *"],
            ["#txCiudad", "Ciudad *"],
            ["#txTelefono", "Teléfono *"],
            ["#txCorreo", "Correo *"],
            ["#txPais", "País *"],
            ["#cbRazon", "Razón social *"],
            ["#cbZonas", "Región *"],
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
            bajaUrl: "/Sucursales/BajaSucursal",
            reactivarUrl: "/Sucursales/ReactivarSucursal",
            statusEnabled: true,
            saveMethod: "POST",
            saveContentType: "application/json; charset=utf-8",
            saveBody: JSON.stringify,
            exportSheetName: "Sucursales",
            exportFilePrefix: "Sucursales",
            createTitle: "Nueva sucursal",
            editTitle: "Editar sucursal",
            createSuccessText: "Sucursal guardada correctamente.",
            editSuccessText: "Sucursal actualizada correctamente.",
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
                { key: "region", title: "Región" },
                { key: "activo", title: "Estatus", type: "status" }
            ],
            listColumns: [
                { key: "acciones" },
                { key: "nombre" },
                { key: "direccion" },
                { key: "ciudad" },
                { key: "telefono" },
                { key: "correo" },
                { key: "pais" },
                { key: "idRazonSocial" },
                { key: "razonSocial" },
                { key: "idZona" },
                { key: "region" },
                { key: "activo" }
            ],
            filters: [
                {
                    selector: "#txFiltroSucursalesBusqueda",
                    label: "Búsqueda",
                    keys: ["nombre", "direccion", "ciudad", "telefono", "correo", "pais"]
                },
                {
                    selector: "#cbFiltroSucursalesRazon",
                    label: "Razón Social",
                    keys: ["idRazonSocial"],
                    matchMode: "equals"
                },
                {
                    selector: "#cbFiltroSucursalesRegion",
                    label: "Región",
                    keys: ["idZona"],
                    matchMode: "equals"
                },
                {
                    selector: "#cbFiltroSucursalesEstatus",
                    label: "Estatus",
                    defaultValue: "activo",
                    serverSide: true,
                    keys: ["activo"]
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
                { key: "notas", source: "notas", selector: "#txNotas", richText: true, placeholder: "Descripción" }
            ],
            detailParams: function (id) {
                return { lla: id, cua: id };
            },
            listParams: function () {
                return { estatus: $("#cbFiltroSucursalesEstatus").val() };
            },
            statusParams: function (id) {
                return { id: id };
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
                ensureCatalogsLoaded();
            },
            beforeOpenCreate: function () {
                return ensureCatalogsLoaded();
            },
            beforeSetFieldValues: function () {
                return ensureCatalogsLoaded();
            }
        });
    });
})(window, document, window.jQuery);
