(function (window, document, $) {
    "use strict";

    if (!document.querySelector("[data-curvas-analisis-page]")) return;

    const state = { page: 1, pageSize: 25, total: 0, duration: 0, searchTimer: null };
    const columns = [
        { key: "sucursal", title: "Sucursal" },
        { key: "codigo", title: "Código" },
        { key: "producto", title: "Producto" },
        { key: "variante", title: "Variante", render: valueOrBase },
        { key: "curva", title: "Curva aplicada", render: valueOrDash },
        { key: "objetivo", title: "Objetivo", render: formatNumber, className: "curvas-analisis-number" },
        { key: "existencia", title: "Existencia", render: formatNumber, className: "curvas-analisis-number" },
        { key: "transito", title: "Tránsito", render: formatNumber, className: "curvas-analisis-number" },
        { key: "cobertura", title: "Cobertura", render: formatNumber, className: "curvas-analisis-number" },
        { key: "hueco", title: "Hueco", render: formatNumber, className: "curvas-analisis-number" },
        { key: "copete", title: "Copete", render: formatNumber, className: "curvas-analisis-number" },
        { key: "estado", title: "Estado", render: renderStatus }
    ];

    document.addEventListener("DOMContentLoaded", function () {
        $("#trAnalisisCurvasHead").html(columns.map(function (column) { return "<th>" + escapeHtml(column.title) + "</th>"; }).join(""));
        bindEvents();
        loadBranches()
            .then(initGrid)
            .catch(showError);
    });

    function initGrid() {
        return CheckAppUI.createDynamicGrid({
            id: "curvas-analisis-grid",
            hostSelector: "#gridAnalisisCurvasHost",
            tableSelector: "#grAnalisisCurvas",
            paging: false,
            ordering: false,
            columns: columns,
            loadData: loadAnalysis,
            mobileCardTitleKey: "producto",
            mobileCardMeta: function (row) { return renderStatus(read(row, "estado", "Estado")); },
            mobileCardTemplate: renderMobileCard,
            emptyText: "No hay identidades para los filtros seleccionados.",
            onLoaded: updatePager,
            onError: function () { state.total = 0; updatePager(); }
        });
    }

    function bindEvents() {
        $("#btAnalizarCurvas").on("click", applyFilters);
        $("#cbAnalisisSucursal, #cbAnalisisEstado").on("change", applyFilters);
        $("#txAnalisisProducto").on("input", function () {
            window.clearTimeout(state.searchTimer);
            state.searchTimer = window.setTimeout(applyFilters, 350);
        });
        $("#btAnalisisPrev").on("click", function () { if (state.page > 1) { state.page -= 1; reload(); } });
        $("#btAnalisisNext").on("click", function () {
            if (state.page < pageCount()) { state.page += 1; reload(); }
        });
        $("#txAnalisisPageSize").on("click", "[data-server-page-size]", function () {
            const size = Number($(this).data("server-page-size"));
            if ([25, 50, 100].indexOf(size) < 0 || size === state.pageSize) return;
            state.pageSize = size;
            state.page = 1;
            reload();
        });
    }

    function applyFilters() {
        state.page = 1;
        reload();
    }

    function reload() {
        return CheckAppUI.reloadGrid("curvas-analisis-grid");
    }

    function loadBranches() {
        return fetchJson("/Activos/Curvas/HuecosCopetes/Sucursales", { cache: "no-store" }).then(function (rows) {
            const options = ["<option value=''>Todas las sucursales</option>"];
            (rows || []).forEach(function (row) {
                options.push("<option value='" + escapeHtml(read(row, "id", "Id")) + "'>" + escapeHtml(read(row, "nombre", "Nombre")) + "</option>");
            });
            $("#cbAnalisisSucursal").html(options.join(""));
        });
    }

    function loadAnalysis() {
        return fetchJson("/Activos/Curvas/HuecosCopetes/Analizar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idSucursal: $("#cbAnalisisSucursal").val() || null,
                producto: $("#txAnalisisProducto").val().trim(),
                estado: $("#cbAnalisisEstado").val() || "TODOS",
                pagina: state.page,
                tamanoPagina: state.pageSize
            })
        }).then(function (response) {
            state.total = Number(read(response, "totalRegistros", "TotalRegistros") || 0);
            state.duration = Number(read(response, "duracionMilisegundos", "DuracionMilisegundos") || 0);
            return read(response, "items", "Items") || [];
        });
    }

    function updatePager() {
        const pages = pageCount();
        const start = state.total ? ((state.page - 1) * state.pageSize) + 1 : 0;
        const end = Math.min(state.page * state.pageSize, state.total);
        $("#txAnalisisCount").text(state.total + (state.total === 1 ? " registro" : " registros"));
        $("#txAnalisisRange").text(state.total ? ("Mostrando " + start + "-" + end + " de " + state.total) : "Sin resultados");
        $("#txAnalisisPage").text(state.total ? ("Página " + state.page + " de " + pages) : "Página 0 de 0");
        $("#txAnalisisTiempo").text("Consulta read-only completada en " + state.duration + " ms. Unidad base.");
        $("#btAnalisisPrev").prop("disabled", !state.total || state.page <= 1);
        $("#btAnalisisNext").prop("disabled", !state.total || state.page >= pages);
        $("[data-server-page-size]").each(function () {
            $(this).toggleClass("is-active", Number($(this).data("server-page-size")) === state.pageSize);
        });
    }

    function pageCount() { return Math.max(1, Math.ceil(state.total / state.pageSize)); }

    function renderStatus(value) {
        const status = String(value || "SIN_CURVA").toUpperCase();
        const map = {
            HUECO: ["ca-badge-danger", "Hueco"],
            COPETE: ["ca-badge-warning", "Copete"],
            EN_OBJETIVO: ["ca-badge-success", "En objetivo"],
            SIN_CURVA: ["ca-badge-muted", "Sin curva"]
        };
        const item = map[status] || map.SIN_CURVA;
        return "<span class='ca-badge " + item[0] + "'>" + item[1] + "</span>";
    }

    function renderMobileCard(row) {
        return [
            "<div class='ca-grid-card-row'><span class='ca-grid-card-label'>Sucursal</span><span class='ca-grid-card-value'>", escapeHtml(read(row, "sucursal", "Sucursal")), "</span></div>",
            "<div class='ca-grid-card-row'><span class='ca-grid-card-label'>Código · Variante</span><span class='ca-grid-card-value'>", escapeHtml(read(row, "codigo", "Codigo") || "—"), " · ", escapeHtml(read(row, "variante", "Variante") || "Base"), "</span></div>",
            "<div class='curvas-analisis-mobile-metrics'>",
            mobileMetric("Objetivo", read(row, "objetivo", "Objetivo")),
            mobileMetric("Existencia", read(row, "existencia", "Existencia")),
            mobileMetric("Tránsito", read(row, "transito", "Transito")),
            mobileMetric(Number(read(row, "hueco", "Hueco")) > 0 ? "Hueco" : "Copete", Number(read(row, "hueco", "Hueco")) > 0 ? read(row, "hueco", "Hueco") : read(row, "copete", "Copete")),
            "</div>",
            "<div class='ca-grid-card-row'><span class='ca-grid-card-label'>Curva aplicada</span><span class='ca-grid-card-value'>", escapeHtml(read(row, "curva", "Curva") || "—"), "</span></div>"
        ].join("");
    }

    function mobileMetric(label, value) {
        return "<div class='curvas-analisis-mobile-metric'><span>" + escapeHtml(label) + "</span><strong>" + formatNumber(value) + "</strong></div>";
    }

    function formatNumber(value) {
        const number = Number(value || 0);
        return Number.isFinite(number) ? number.toLocaleString("es-MX", { maximumFractionDigits: 2 }) : "0";
    }

    function valueOrBase(value) { return escapeHtml(value || "Base"); }
    function valueOrDash(value) { return escapeHtml(value || "—"); }
    function read(object, camel, pascal) { return object && object[camel] != null ? object[camel] : (object ? object[pascal] : null); }
    function escapeHtml(value) { return CheckAppUI.escapeHtml(value == null ? "" : value); }

    function fetchJson(url, options) {
        return window.fetch(url, options || {}).then(function (response) {
            return response.text().then(function (text) {
                let data = {};
                try { data = text ? JSON.parse(text) : {}; } catch (_error) { data = {}; }
                if (!response.ok) throw new Error(read(data, "mensaje", "Mensaje") || "No fue posible completar la consulta.");
                return data;
            });
        });
    }

    function showError(error) {
        const message = error && error.message ? error.message : "No fue posible cargar el análisis.";
        if (window.Swal) Swal.fire({ icon: "error", title: "No fue posible consultar", text: message });
    }
})(window, document, window.jQuery);
