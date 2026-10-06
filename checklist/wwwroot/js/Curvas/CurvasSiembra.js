(function (window, document, $) {
    "use strict";

    if (!document.querySelector("[data-curvas-siembra-page]")) return;

    const state = { details: [], saving: false, canWrite: document.querySelector("[data-curvas-siembra-page]").dataset.canWrite === "true" };
    const columns = [
        { key: "sucursal", title: "Sucursal" },
        { key: "curva", title: "Curva" },
        { key: "producto", title: "Producto" },
        { key: "variante", title: "Variante" },
        { key: "cantidadBaseObjetivo", title: "Objetivo", render: formatDecimal },
        { key: "unidadBase", title: "Unidad base" },
        { key: "fechaVigenciaInicio", title: "Vigente desde", render: formatDate },
        {
            key: "acciones", title: "Acciones", sortable: false, hideable: false, exportable: false,
            render: function (_value, row) {
                if (!state.canWrite) return "—";
                return "<div class='ps-catalog-actions'><button type='button' class='is-danger' data-curvas-siembra-action='close' data-id='" + escapeHtml(read(row, "idSiembra", "IdSiembra")) + "' title='Quitar siembra' aria-label='Quitar siembra'><i class='fa fa-ban'></i></button></div>";
            }
        }
    ];

    document.addEventListener("DOMContentLoaded", function () {
        $("#trSiembrasHead").html(columns.map(function (column) { return "<th>" + escapeHtml(column.title) + "</th>"; }).join(""));
        initGrid();
        bindEvents();
        if (!state.canWrite) $("#txSiembraInfo").html("<div class='alert alert-info mb-0'>Puedes consultar las siembras, pero tu rol no tiene permiso de escritura.</div>");
        Promise.all([loadSelect("Sucursales", "#cbSiembraSucursal", "Selecciona una sucursal"), loadSelect("CurvasActivas", "#cbSiembraCurva", "Selecciona una curva", curveLabel)])
            .then(function () { CheckAppUI.reloadGrid("curvas-siembra-grid"); })
            .catch(showError);
    });

    function initGrid() {
        CheckAppUI.createDynamicGrid({
            id: "curvas-siembra-grid",
            hostSelector: "#gridSiembrasHost",
            tableSelector: "#grSiembras",
            searchInputSelector: "#txBusquedaSiembras",
            exportButtonSelector: "#btExportarSiembras",
            resultCountSelector: "#txSiembrasCount",
            footerRangeSelector: "#txSiembrasRange",
            footerPageIndicatorSelector: "#txSiembrasPage",
            footerPrevButtonSelector: "#btSiembrasPrev",
            footerNextButtonSelector: "#btSiembrasNext",
            footerPageSizeSelector: "#txSiembrasPageSize",
            pageLength: 25,
            lengthMenu: [[25, 50], [25, 50]],
            order: [[0, "asc"], [2, "asc"]],
            exportSheetName: "SiembrasVigentes",
            exportFileName: function () { return "SiembrasVigentes.xlsx"; },
            loadData: function () {
                const branch = $("#cbSiembraSucursal").val();
                return fetchJson("/Proveeduria/Curvas/Siembra/Vigentes" + (branch ? "?idSucursal=" + encodeURIComponent(branch) : ""), { cache: "no-store" });
            },
            columns: columns,
            emptyText: "No hay siembras vigentes para la selección."
        });
    }

    function bindEvents() {
        $("#cbSiembraCurva").on("change", loadCurveDetails);
        $("#cbSiembraSucursal").on("change", function () { CheckAppUI.reloadGrid("curvas-siembra-grid"); updateButton(); });
        $("#btSembrarCurva").on("click", confirmSeed);
        $("#gridSiembrasHost").on("click", "[data-curvas-siembra-action='close']", function () { confirmClose($(this).data("id")); });
    }

    function loadSelect(action, selector, placeholder, labelFactory) {
        return fetchJson("/Proveeduria/Curvas/Siembra/" + action, { cache: "no-store" }).then(function (rows) {
            const options = ["<option value=''>" + escapeHtml(placeholder) + "</option>"];
            (rows || []).forEach(function (row) {
                options.push("<option value='" + escapeHtml(read(row, "id", "Id")) + "'>" + escapeHtml(labelFactory ? labelFactory(row) : read(row, "nombre", "Nombre")) + "</option>");
            });
            $(selector).html(options.join(""));
        });
    }

    function curveLabel(row) {
        return read(row, "nombre", "Nombre") + " · " + Number(read(row, "renglones", "Renglones") || 0) + " objetivos";
    }

    function loadCurveDetails() {
        const id = $("#cbSiembraCurva").val();
        state.details = [];
        if (!id) { renderDetails(); return; }
        fetchJson("/Proveeduria/Curvas/Siembra/DetalleCurva?idCurva=" + encodeURIComponent(id), { cache: "no-store" })
            .then(function (curve) {
                state.details = read(curve, "detalles", "Detalles") || [];
                $("#txSiembraCurvaNombre").text(read(curve, "nombre", "Nombre") || "Curva");
                renderDetails();
            }).catch(showError);
    }

    function renderDetails() {
        if (!state.details.length) {
            $("#txSiembraCurvaNombre").text("Selecciona una curva");
            $("#txSiembraResumen").text("0 objetivos");
            $("#tbSiembraObjetivos").html("<tr><td colspan='4'>Selecciona una curva para consultar sus objetivos.</td></tr>");
            updateButton();
            return;
        }
        const total = state.details.reduce(function (sum, row) { return sum + Number(read(row, "cantidadBaseObjetivo", "CantidadBaseObjetivo") || 0); }, 0);
        $("#txSiembraResumen").text(state.details.length + " objetivos · " + formatDecimal(total) + " unidades");
        $("#tbSiembraObjetivos").html(state.details.map(function (row) {
            return "<tr><td>" + escapeHtml(read(row, "producto", "Producto")) + "</td><td>" + escapeHtml(read(row, "variante", "Variante") || "Base") + "</td><td>" + escapeHtml(read(row, "unidadBase", "UnidadBase")) + "</td><td>" + formatDecimal(read(row, "cantidadBaseObjetivo", "CantidadBaseObjetivo")) + "</td></tr>";
        }).join(""));
        updateButton();
    }

    function confirmSeed() {
        if (state.saving || !$("#cbSiembraSucursal").val() || !$("#cbSiembraCurva").val() || !state.details.length) return;
        const branch = $("#cbSiembraSucursal option:selected").text();
        const curve = $("#cbSiembraCurva option:selected").text().split(" · ")[0];
        Swal.fire({ icon: "question", title: "¿Sembrar esta curva?", text: curve + " quedará vigente en " + branch + " para los productos y variantes mostrados.", showCancelButton: true, confirmButtonText: "Sembrar", cancelButtonText: "Cancelar" })
            .then(function (result) { if (result.isConfirmed) seed(); });
    }

    function seed() {
        state.saving = true;
        updateButton();
        fetchJson("/Proveeduria/Curvas/Siembra/Sembrar", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idSucursal: $("#cbSiembraSucursal").val(), idCurva: $("#cbSiembraCurva").val() })
        }).then(function (data) {
            Swal.fire({ icon: "success", title: "Siembra actualizada", text: read(data, "mensaje", "Mensaje") || "La curva quedó vigente.", timer: 1800, showConfirmButton: false });
            CheckAppUI.reloadGrid("curvas-siembra-grid");
        }).catch(showError).finally(function () { state.saving = false; updateButton(); });
    }

    function confirmClose(id) {
        if (!state.canWrite || state.saving || !id) return;
        Swal.fire({
            icon: "warning",
            title: "¿Quitar siembra?",
            text: "La siembra dejará de estar vigente, conservando su histórico.",
            showCancelButton: true,
            confirmButtonText: "Quitar siembra",
            cancelButtonText: "Cancelar"
        }).then(function (result) { if (result.isConfirmed) closeSeed(id); });
    }

    function closeSeed(id) {
        state.saving = true;
        updateButton();
        fetchJson("/Proveeduria/Curvas/Siembra/Cerrar", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idSiembra: id })
        }).then(function (data) {
            Swal.fire({ icon: read(data, "cerrada", "Cerrada") ? "success" : "info", title: read(data, "cerrada", "Cerrada") ? "Siembra retirada" : "Sin cambios", text: read(data, "mensaje", "Mensaje") || "La acción fue completada.", timer: 2200, showConfirmButton: false });
            CheckAppUI.reloadGrid("curvas-siembra-grid");
        }).catch(showError).finally(function () { state.saving = false; updateButton(); });
    }

    function updateButton() { $("#btSembrarCurva").prop("disabled", !state.canWrite || state.saving || !$("#cbSiembraSucursal").val() || !$("#cbSiembraCurva").val() || !state.details.length); }
    function fetchJson(url, options) { return fetch(url, options || {}).then(async function (response) { const text = await response.text(); let data = {}; try { data = text ? JSON.parse(text) : {}; } catch (_) { throw new Error("La respuesta del servidor no pudo interpretarse."); } if (!response.ok) throw new Error(read(data, "mensaje", "Mensaje") || "No fue posible completar la operación."); return data; }); }
    function showError(error) { Swal.fire({ icon: "error", title: "No se pudo completar", text: error && error.message ? error.message : String(error || "Intenta nuevamente.") }); }
    function read(object, camel, pascal) { return object && object[camel] !== undefined ? object[camel] : object ? object[pascal] : null; }
    function formatDecimal(value) { return Number(value || 0).toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 4 }); }
    function formatDate(value) { if (!value) return "—"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("es-MX"); }
    function escapeHtml(value) { return String(value == null ? "" : value).replace(/[&<>'"]/g, function (char) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]; }); }
})(window, document, window.jQuery);
