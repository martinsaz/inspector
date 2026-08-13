(function (window, document, $) {
    "use strict";

    if (!window.fetch || !$ || !window.CheckAppUI) {
        return;
    }

    const root = document.querySelector("[data-cot-page]");
    if (!root) {
        return;
    }

    const estadoBorrador = 1;
    const estadoCancelada = 2;
    const estadoAutorizada = 3;
    const gridId = "cotizaciones-grid";
    const pageType = String(root.getAttribute("data-cot-page") || "").trim().toLowerCase();
    const productImagePlaceholder = "/assets/media/svg/files/blank-image.svg";

    const state = {
        pageType: pageType,
        report: {
            accordion: null,
            grid: null,
            rows: [],
            hasSearched: false,
            selectedEstado: "",
            detailId: "",
            detail: null,
            cancellingId: ""
        },
        action: {
            detailId: "",
            detail: null
        },
        editor: {
            mode: String(root.getAttribute("data-cot-mode") || "new").trim().toLowerCase(),
            sourceId: normalizeGuid(root.getAttribute("data-cot-id")),
            cotizacionId: "",
            detail: null,
            readOnly: false,
            cliente: null,
            clientes: [],
            productos: [],
            sucursales: [],
            partidas: [],
            searchClienteTimer: 0,
            searchProductoTimer: 0,
            quoteDataTouched: false,
            pdfViewerReturnToReport: false,
            activePdfUrl: "",
            sections: {
                cliente: false,
                datos: false,
                productos: false
            }
        }
    };

    window.CotizacionesPage = window.CotizacionesPage || {};
    window.CotizacionesPage.selectCliente = function (button) {
        const $button = $(button);
        selectCliente({
            id: String($button.attr("data-cot-select-client") || ""),
            nombre: String($button.attr("data-cot-client-name") || ""),
            telefono: String($button.attr("data-cot-client-phone") || ""),
            correo: String($button.attr("data-cot-client-email") || ""),
            empresa: String($button.attr("data-cot-client-company") || ""),
            descuento: Number($button.attr("data-cot-client-discount") || 0)
        });
    };
    window.CotizacionesPage.addProducto = function (button) {
        const $button = $(button);
        addProducto({
            id: String($button.attr("data-cot-add-product") || ""),
            codigo: String($button.attr("data-cot-product-code") || ""),
            imagenUrl: String($button.attr("data-cot-product-image-url") || ""),
            imagenNombre: String($button.attr("data-cot-product-image-name") || ""),
            nombre: String($button.attr("data-cot-product-name") || ""),
            descripcion: String($button.attr("data-cot-product-description") || ""),
            unidadMedida: String($button.attr("data-cot-product-unit") || ""),
            unidadAbreviatura: String($button.attr("data-cot-product-unit-short") || ""),
            unidadPermiteDecimales: String($button.attr("data-cot-product-unit-decimals") || "").toLowerCase() === "true",
            permiteVentaSinExistencia: String($button.attr("data-cot-product-sell-without-stock") || "").toLowerCase() === "true",
            existenciaActual: toNullableNumber($button.attr("data-cot-product-stock")),
            precioPublico: Number($button.attr("data-cot-product-price") || 0)
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        if (pageType === "report") {
            initReportPage();
            return;
        }

        initEditorPage();
    });

    function initReportPage() {
        state.report.accordion = CheckAppUI.createFilterAccordion({
            id: "cotizacionesFiltros",
            selector: "#accordionFiltrosCotizaciones",
            open: true,
            emptySummaryText: "Sin filtros activos"
        });

        setDefaultTodayRange("#txCotFiltroFechaDesde", "#txCotFiltroFechaHasta");
        bindReportEvents();
        initReportGrid()
            .then(function () {
                updateReportSummary();
                return runReportSearch();
            })
            .catch(function (error) {
                setStatus("#txCotListadoStatus", "danger", resolveErrorMessage(error));
            });
    }

    function bindReportEvents() {
        $("#btCotBuscarListado").on("click", runReportSearch);
        $("#btCotLimpiarListado").on("click", function () {
            $("#txCotFiltroBusqueda").val("");
            $("#cbCotFiltroEstado").val("");
            setDefaultTodayRange("#txCotFiltroFechaDesde", "#txCotFiltroFechaHasta");
            state.report.selectedEstado = "";
            syncReportKpiSelection("");
            updateReportFilterSummary();
            runReportSearch();
        });

        $("#txCotFiltroBusqueda, #txCotFiltroFechaDesde, #txCotFiltroFechaHasta").on("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                runReportSearch();
            }
        });

        $("#txCotFiltroBusqueda, #txCotFiltroFechaDesde, #txCotFiltroFechaHasta, #cbCotFiltroEstado").on("input change", updateReportFilterSummary);

        $("#cbCotFiltroEstado").on("change", function () {
            const next = String($(this).val() || "").trim();
            state.report.selectedEstado = next;
            syncReportKpiSelection(next);
        });

        $(".cot-summary-strip").on("click", "[data-cot-kpi]", function () {
            const next = String($(this).attr("data-cot-kpi") || "").trim();
            state.report.selectedEstado = next;
            $("#cbCotFiltroEstado").val(next);
            syncReportKpiSelection(next);
            updateReportFilterSummary();
            runReportSearch();
        });

        $("#gridCotizacionesHost").on("click", "[data-cot-detail]", function () {
            openReportDetail(String($(this).attr("data-cot-detail") || ""));
        });

        $("#gridCotizacionesHost").on("click", "[data-cot-cancel]", function () {
            openReportCancelModal(String($(this).attr("data-cot-cancel") || ""), String($(this).attr("data-cot-folio") || ""));
        });

        $("#gridCotizacionesHost").on("click", "[data-cot-share]", function () {
            shareCotizacion(String($(this).attr("data-cot-share") || ""));
        });

        $("#gridCotizacionesHost").on("click", "[data-cot-whatsapp]", function () {
            openWhatsAppModal(String($(this).attr("data-cot-whatsapp") || ""));
        });

        $("#gridCotizacionesHost").on("click", "[data-cot-email]", function () {
            openCorreoModal(String($(this).attr("data-cot-email") || ""));
        });

        $("#gridCotizacionesHost").on("click", "[data-cot-authorize]", function () {
            openAutorizarModal(String($(this).attr("data-cot-authorize") || ""), String($(this).attr("data-cot-folio") || ""));
        });

        $("#btCotConfirmarCancelar").on("click", cancelReportCotizacion);
        $("#btCotDetallePdf").on("click", function () {
            if (state.report.detailId) {
                window.open("/Cotizaciones/ExportarCotizacionPdf?idCotizacion=" + encodeURIComponent(state.report.detailId), "_blank");
            }
        });
        $("#btCotDetalleCompartir").on("click", function () {
            shareCotizacion(state.report.detailId);
        });
        $("#btCotDetalleWhatsApp").on("click", function () {
            openWhatsAppModal(state.report.detailId);
        });
        $("#btCotDetalleCorreo").on("click", function () {
            openCorreoModal(state.report.detailId);
        });
        $("#btCotDetalleAutorizar").on("click", function () {
            openAutorizarModal(state.report.detailId, state.report.detail && state.report.detail.folio);
        });
        $("#btCotFallbackPdf").on("click", openFallbackPdf);
        $("#btCotFallbackWhatsApp").on("click", function () {
            resolveModalApi("#modalCotCompartirFallback").hide();
            openWhatsAppModal(state.action.detailId);
        });
        $("#btCotFallbackCorreo").on("click", function () {
            resolveModalApi("#modalCotCompartirFallback").hide();
            openCorreoModal(state.action.detailId);
        });
        $("#btCotFallbackCopiar").on("click", copyFallbackLink);
        $("#btCotConfirmarWhatsApp").on("click", sendCotizacionWhatsApp);
        $("#btCotConfirmarCorreo").on("click", sendCotizacionCorreo);
        $("#btCotConfirmarAutorizar").on("click", confirmAutorizarCotizacion);
    }

    function initReportGrid() {
        return CheckAppUI.createDynamicGrid({
            id: gridId,
            hostSelector: "#gridCotizacionesHost",
            tableSelector: "#grCotizaciones",
            searchInputSelector: "#txCotBusquedaGrid",
            columnToggleButtonSelector: "#btCotColumnas",
            columnTogglePanelSelector: "#panelCotColumnas",
            resultCountSelector: "#txCotGridCount",
            footerRangeSelector: "#txCotGridRange",
            footerPageIndicatorSelector: "#txCotGridPageIndicator",
            footerPrevButtonSelector: "#btCotGridPrev",
            footerNextButtonSelector: "#btCotGridNext",
            footerPageSizeSelector: "#txCotGridPageSize",
            pageLength: 25,
            lengthMenu: [[25, 50, 100], [25, 50, 100]],
            order: [[6, "desc"]],
            emptyText: "Usa los filtros para consultar cotizaciones.",
            mobileCardTitleKey: "folio",
            mobileCardMeta: function (row) {
                return "<span class='ca-chip ca-chip--secondary'>" + escapeHtml(row.estadoNombre || "Sin estado") + "</span>";
            },
            mobileCardTemplate: function (row) {
                const actions = [
                    "<button type='button' class='checkapp-btn checkapp-btn-secondary' data-cot-detail='" + escapeHtml(row.id || "") + "' title='Ver detalle de la cotizacion' aria-label='Ver detalle de la cotizacion'><i class='fa fa-eye'></i><span>Ver detalle</span></button>",
                    "<button type='button' class='checkapp-btn checkapp-btn-ghost' data-cot-share='" + escapeHtml(row.id || "") + "' title='Compartir cotizacion " + escapeHtml(row.folio || "") + "' aria-label='Compartir cotizacion " + escapeHtml(row.folio || "") + "'><i class='fa fa-share-alt'></i><span>Compartir</span></button>",
                    "<button type='button' class='checkapp-btn checkapp-btn-ghost' data-cot-whatsapp='" + escapeHtml(row.id || "") + "' title='Enviar cotizacion por WhatsApp " + escapeHtml(row.folio || "") + "' aria-label='Enviar cotizacion por WhatsApp " + escapeHtml(row.folio || "") + "'><i class='fa fa-whatsapp'></i><span>WhatsApp</span></button>",
                    "<button type='button' class='checkapp-btn checkapp-btn-ghost' data-cot-email='" + escapeHtml(row.id || "") + "' title='Enviar cotizacion por correo " + escapeHtml(row.folio || "") + "' aria-label='Enviar cotizacion por correo " + escapeHtml(row.folio || "") + "'><i class='fa fa-envelope'></i><span>Correo</span></button>",
                    row.puedeAutorizar ? "<button type='button' class='checkapp-btn checkapp-btn-primary' data-cot-authorize='" + escapeHtml(row.id || "") + "' data-cot-folio='" + escapeHtml(row.folio || "") + "' title='Autorizar cotizacion " + escapeHtml(row.folio || "") + "' aria-label='Autorizar cotizacion " + escapeHtml(row.folio || "") + "'><i class='fa fa-check-circle'></i><span>Autorizar</span></button>" : "",
                    row.puedeCancelar ? "<button type='button' class='checkapp-btn checkapp-btn-ghost' data-cot-cancel='" + escapeHtml(row.id || "") + "' data-cot-folio='" + escapeHtml(row.folio || "") + "' title='Cancelar cotizacion " + escapeHtml(row.folio || "") + "' aria-label='Cancelar cotizacion " + escapeHtml(row.folio || "") + "'><i class='fa fa-ban'></i><span>Cancelar</span></button>" : ""
                ].filter(Boolean).join("");

                return [
                    "<div class='cot-mobile-card-body'>",
                    "<div class='cot-mobile-card-row'><span>Cliente</span><strong>" + escapeHtml(row.cliente || "—") + "</strong></div>",
                    "<div class='cot-mobile-card-row'><span>Sucursal</span><strong>" + escapeHtml(row.sucursal || "—") + "</strong></div>",
                    "<div class='cot-mobile-card-row'><span>Vendedor</span><strong>" + escapeHtml(row.vendedor || "—") + "</strong></div>",
                    "<div class='cot-mobile-card-row'><span>Fecha</span><strong>" + escapeHtml(formatDateOnly(row.fechaCotizacion)) + "</strong></div>",
                    "<div class='cot-mobile-card-row'><span>Total</span><strong>" + escapeHtml(formatCurrency(row.total)) + "</strong></div>",
                    "</div>",
                    "<div class='cot-grid-actions'>" + actions + "</div>"
                ].join("");
            },
            loadData: function () {
                if (!state.report.hasSearched) {
                    return Promise.resolve([]);
                }

                return fetchJson("/Cotizaciones/ObtenerCotizaciones?" + buildReportQuery().toString())
                    .then(function (rows) {
                        state.report.rows = Array.isArray(rows) ? rows : [];
                        return state.report.rows;
                    });
            },
            columns: [
                {
                    key: "acciones",
                    title: "Acciones",
                    sortable: false,
                    hideable: false,
                    exportable: false,
                    render: function (_value, row) {
                        const actions = [
                            "<button type='button' class='checkapp-btn checkapp-btn-secondary checkapp-btn-inline' data-cot-detail='" + escapeHtml(row.id || "") + "' title='Ver detalle de la cotizacion " + escapeHtml(row.folio || "") + "' aria-label='Ver detalle de la cotizacion " + escapeHtml(row.folio || "") + "'><i class='fa fa-eye'></i></button>"
                        ];

                        if (row.puedeEditar) {
                            actions.push("<a class='checkapp-btn checkapp-btn-ghost checkapp-btn-inline' href='/Cotizaciones/Editar/" + escapeHtml(row.id || "") + "' title='Editar cotizacion " + escapeHtml(row.folio || "") + "' aria-label='Editar cotizacion " + escapeHtml(row.folio || "") + "'><i class='fa fa-pen'></i></a>");
                        }

                        if (row.puedeClonar) {
                            actions.push("<a class='checkapp-btn checkapp-btn-ghost checkapp-btn-inline' href='/Cotizaciones/Clonar/" + escapeHtml(row.id || "") + "' title='Clonar cotizacion " + escapeHtml(row.folio || "") + "' aria-label='Clonar cotizacion " + escapeHtml(row.folio || "") + "'><i class='fa fa-clone'></i></a>");
                        }

                        if (row.puedeExportarPdf) {
                            actions.push("<a class='checkapp-btn checkapp-btn-ghost checkapp-btn-inline' target='_blank' href='/Cotizaciones/ExportarCotizacionPdf?idCotizacion=" + encodeURIComponent(row.id || "") + "' title='Descargar PDF de la cotizacion " + escapeHtml(row.folio || "") + "' aria-label='Descargar PDF de la cotizacion " + escapeHtml(row.folio || "") + "'><i class='fa fa-download'></i></a>");
                        }

                        actions.push("<button type='button' class='checkapp-btn checkapp-btn-ghost checkapp-btn-inline' data-cot-share='" + escapeHtml(row.id || "") + "' title='Compartir cotizacion " + escapeHtml(row.folio || "") + "' aria-label='Compartir cotizacion " + escapeHtml(row.folio || "") + "'><i class='fa fa-share-alt'></i></button>");
                        actions.push("<button type='button' class='checkapp-btn checkapp-btn-ghost checkapp-btn-inline' data-cot-whatsapp='" + escapeHtml(row.id || "") + "' title='Enviar cotizacion por WhatsApp " + escapeHtml(row.folio || "") + "' aria-label='Enviar cotizacion por WhatsApp " + escapeHtml(row.folio || "") + "'><i class='fa fa-whatsapp'></i></button>");
                        actions.push("<button type='button' class='checkapp-btn checkapp-btn-ghost checkapp-btn-inline' data-cot-email='" + escapeHtml(row.id || "") + "' title='Enviar cotizacion por correo " + escapeHtml(row.folio || "") + "' aria-label='Enviar cotizacion por correo " + escapeHtml(row.folio || "") + "'><i class='fa fa-envelope'></i></button>");

                        if (row.puedeAutorizar) {
                            actions.push("<button type='button' class='checkapp-btn checkapp-btn-primary checkapp-btn-inline' data-cot-authorize='" + escapeHtml(row.id || "") + "' data-cot-folio='" + escapeHtml(row.folio || "") + "' title='Autorizar cotizacion " + escapeHtml(row.folio || "") + "' aria-label='Autorizar cotizacion " + escapeHtml(row.folio || "") + "'><i class='fa fa-check-circle'></i></button>");
                        }

                        if (row.puedeCancelar) {
                            actions.push("<button type='button' class='checkapp-btn checkapp-btn-ghost checkapp-btn-inline' data-cot-cancel='" + escapeHtml(row.id || "") + "' data-cot-folio='" + escapeHtml(row.folio || "") + "' title='Cancelar cotizacion " + escapeHtml(row.folio || "") + "' aria-label='Cancelar cotizacion " + escapeHtml(row.folio || "") + "'><i class='fa fa-ban'></i></button>");
                        }

                        return "<div class='cot-grid-actions'>" + actions.join("") + "</div>";
                    }
                },
                { key: "folio", title: "Folio" },
                { key: "cliente", title: "Cliente" },
                { key: "sucursal", title: "Sucursal" },
                { key: "vendedor", title: "Vendedor" },
                {
                    key: "estadoNombre",
                    title: "Estado",
                    render: function (value) {
                        return "<span class='ca-chip ca-chip--secondary'>" + escapeHtml(value || "Sin estado") + "</span>";
                    }
                },
                { key: "fechaCotizacion", title: "Fecha", type: "date" },
                { key: "fechaVigencia", title: "Vigencia", type: "date" },
                { key: "totalPiezas", title: "Piezas", type: "number" },
                { key: "total", title: "Total", type: "currency" }
            ],
            onLoaded: function (rows) {
                $("#txCotGridVisibleCount").text((rows || []).length + " visibles");
                setStatus("#txCotListadoStatus", "", "");
            },
            onError: function (error) {
                $("#txCotGridVisibleCount").text("0 visibles");
                setStatus("#txCotListadoStatus", "danger", resolveErrorMessage(error));
            }
        }).then(function (grid) {
            state.report.grid = grid;
            return grid;
        });
    }

    function runReportSearch() {
        state.report.hasSearched = true;
        updateReportFilterSummary();
        return Promise.all([
            CheckAppUI.reloadGrid(gridId, false),
            updateReportSummary()
        ]);
    }

    function updateReportSummary() {
        return fetchJson("/Cotizaciones/ObtenerResumenCotizaciones?" + buildReportSummaryQuery().toString())
            .then(function (data) {
                $("#txCotKpiTotal").text(data.total || 0);
                $("#txCotKpiBorradores").text(data.borradores || 0);
                $("#txCotKpiCanceladas").text(data.canceladas || 0);
                $("#txCotKpiImporte").text(formatCurrency(data.importeTotal || 0));
            })
            .catch(function () {
                $("#txCotKpiTotal, #txCotKpiBorradores, #txCotKpiCanceladas").text("0");
                $("#txCotKpiImporte").text(formatCurrency(0));
            });
    }

    function buildReportQuery() {
        const query = new URLSearchParams();
        appendQueryValue(query, "busqueda", $("#txCotFiltroBusqueda").val());
        appendQueryValue(query, "estado", $("#cbCotFiltroEstado").val());
        appendQueryValue(query, "fechaDesde", $("#txCotFiltroFechaDesde").val());
        appendQueryValue(query, "fechaHasta", $("#txCotFiltroFechaHasta").val());
        return query;
    }

    function buildReportSummaryQuery() {
        const query = new URLSearchParams();
        appendQueryValue(query, "fechaDesde", $("#txCotFiltroFechaDesde").val());
        appendQueryValue(query, "fechaHasta", $("#txCotFiltroFechaHasta").val());
        return query;
    }

    function updateReportFilterSummary() {
        const parts = [];
        const busqueda = String($("#txCotFiltroBusqueda").val() || "").trim();
        const estado = $("#cbCotFiltroEstado option:selected").text();
        const fechaDesde = String($("#txCotFiltroFechaDesde").val() || "").trim();
        const fechaHasta = String($("#txCotFiltroFechaHasta").val() || "").trim();

        if (busqueda) {
            parts.push("Búsqueda: " + busqueda);
        }

        if ($("#cbCotFiltroEstado").val()) {
            parts.push("Estado: " + estado);
        }

        if (fechaDesde || fechaHasta) {
            parts.push("Rango: " + (fechaDesde || "—") + " a " + (fechaHasta || "—"));
        }

        $(".checkapp-accordion-summary").first().text(parts.length ? parts.join(" · ") : "Sin filtros activos");
    }

    function syncReportKpiSelection(value) {
        $(".cot-summary-strip [data-cot-kpi]").removeClass("is-selected");
        $(".cot-summary-strip [data-cot-kpi='" + cssEscape(value) + "']").addClass("is-selected");
        if (!value) {
            $(".cot-summary-strip [data-cot-kpi='']").addClass("is-selected");
        }
    }

    function openReportDetail(id) {
        const cotizacionId = normalizeGuid(id);
        if (!cotizacionId) {
            return;
        }

        state.report.detailId = cotizacionId;
        setStatus("#txCotDetalleStatus", "", "");
        $("#cotDetalleLoading").prop("hidden", false);
        $("#cotDetalleContent").prop("hidden", true);
        resolveModalApi("#modalCotDetalle").show();

        fetchJson("/Cotizaciones/ObtenerCotizacion?idCotizacion=" + encodeURIComponent(cotizacionId))
            .then(function (detail) {
                state.report.detail = detail || null;
                fillReportDetail(detail || {});
            })
            .catch(function (error) {
                setStatus("#txCotDetalleStatus", "danger", resolveErrorMessage(error));
            })
            .finally(function () {
                $("#cotDetalleLoading").prop("hidden", true);
            });
    }

    function fillReportDetail(detail) {
        $("#cotDetalleContent").prop("hidden", false);
        $("#txCotDetalleTitulo").text("Cotización " + (detail.folio || "—"));
        $("#txCotDetalleSubtitulo").text((detail.cliente || "Sin cliente") + " · " + (detail.estadoNombre || "Sin estado"));
        $("#txCotDetalleFolio").text(detail.folio || "—");
        $("#txCotDetalleEstado").text(detail.estadoNombre || "—");
        $("#txCotDetalleCliente").text(detail.cliente || "—");
        $("#txCotDetalleSucursal").text(detail.sucursal || "—");
        $("#txCotDetalleVendedor").text(detail.vendedor || "—");
        $("#txCotDetalleTotal").text(formatCurrency(detail.total || 0));
        $("#txCotDetalleFecha").text(formatDateOnly(detail.fechaCotizacion));
        $("#txCotDetalleVigencia").text(formatDateOnly(detail.fechaVigencia));
        $("#txCotDetalleCaja").text(detail.caja || "—");
        $("#txCotDetalleObservaciones").text(detail.observaciones || "Sin observaciones");

        const partidas = Array.isArray(detail.partidas) ? detail.partidas : [];
        const html = partidas.map(function (partida) {
            const unidad = partida.unidadAbreviatura ? (partida.unidadMedida + " (" + partida.unidadAbreviatura + ")") : (partida.unidadMedida || "—");
            return [
                "<tr>",
                "<td data-label='Partida'>", escapeHtml(partida.numeroPartida || ""), "</td>",
                "<td data-label='Código'>", escapeHtml(partida.codigo || ""), "</td>",
                "<td data-label='Producto'><strong>", escapeHtml(partida.nombre || ""), "</strong><div class='cot-row-muted'>", escapeHtml(partida.descripcion || ""), "</div></td>",
                "<td data-label='Unidad'>", escapeHtml(unidad), "</td>",
                "<td data-label='Cantidad'>", escapeHtml(formatNumber(partida.cantidad || 0)), "</td>",
                "<td data-label='Precio'>", escapeHtml(formatCurrency(partida.precioUnitario || 0)), "</td>",
                "<td data-label='Desc.'>", escapeHtml(formatNumber(partida.descuentoPct || 0)), "%</td>",
                "<td data-label='Total'>", escapeHtml(formatCurrency(partida.total || 0)), "</td>",
                "</tr>"
            ].join("");
        }).join("");

        $("#tbCotDetallePartidas").html(html || "<tr><td colspan='8'>Sin partidas.</td></tr>");
        $("#btCotDetalleEditar").attr("href", "/Cotizaciones/Editar/" + encodeURIComponent(detail.id || ""));
        $("#btCotDetalleClonar").attr("href", "/Cotizaciones/Clonar/" + encodeURIComponent(detail.id || ""));
        const canAuthorize = Number(detail.estado || 0) === estadoBorrador;
        $("#btCotDetalleEditar").prop("hidden", !canAuthorize);
        $("#btCotDetalleAutorizar").prop("hidden", !canAuthorize);
    }

    function openReportCancelModal(id, folio) {
        state.report.cancellingId = normalizeGuid(id);
        if (!state.report.cancellingId) {
            return;
        }

        $("#txCotCancelarPrompt").text("Captura el motivo de cancelación para " + (folio || "la cotización") + ".");
        $("#txCotCancelarMotivo").val("");
        setStatus("#txCotCancelarStatus", "", "");
        resolveModalApi("#modalCotCancelar").show();
    }

    function cancelReportCotizacion() {
        const motivo = String($("#txCotCancelarMotivo").val() || "").trim();
        if (!state.report.cancellingId || !motivo) {
            setStatus("#txCotCancelarStatus", "danger", "Captura el motivo de cancelación.");
            return;
        }

        setStatus("#txCotCancelarStatus", "", "");
        postJson("/Cotizaciones/CancelarCotizacion", {
            idCotizacion: state.report.cancellingId,
            motivoCancelacion: motivo
        }).then(function () {
            resolveModalApi("#modalCotCancelar").hide();
            return runReportSearch();
        }).catch(function (error) {
            setStatus("#txCotCancelarStatus", "danger", resolveErrorMessage(error));
        });
    }

    function initEditorPage() {
        bindEditorEvents();
        populateSucursales([]);
        syncEditorPanels();
        syncEditorState();

        loadSucursales()
            .then(function () {
                if (state.editor.sourceId) {
                    return loadEditorDetail(state.editor.sourceId);
                }

                setEditorTitles();
                return null;
            })
            .catch(function (error) {
                setStatus("#txCotFormStatus", "danger", resolveErrorMessage(error));
            });
    }

    function bindEditorEvents() {
        $("#txCotBuscarCliente").on("input", scheduleClienteSearch);
        $("#txCotBuscarProducto").on("input", scheduleProductoSearch);
        $("#cbCotSucursal, #txCotVigenciaDias, #txCotObservaciones").on("input change", function () {
            state.editor.quoteDataTouched = true;
        });
        $("[data-cot-toggle-section]").on("click", function () {
            const section = String($(this).attr("data-cot-toggle-section") || "");
            if (!section) {
                return;
            }

            setSectionCollapsed(section, !state.editor.sections[section]);
        });

        $("#tbCotClientesResultados").on("click", "[data-cot-select-client]", function () {
            const id = String($(this).attr("data-cot-select-client") || "");
            const cliente = state.editor.clientes.find(function (item) { return String(item.id) === id; });
            if (cliente) {
                selectCliente(cliente);
            }
        });

        $("#cardsCotClientesResultados").on("click", "[data-cot-select-client]", function () {
            const id = String($(this).attr("data-cot-select-client") || "");
            const cliente = state.editor.clientes.find(function (item) { return String(item.id) === id; });
            if (cliente) {
                selectCliente(cliente);
            }
        });

        $("#tbCotProductosResultados").on("click", "[data-cot-add-product]", function () {
            const id = String($(this).attr("data-cot-add-product") || "");
            const producto = state.editor.productos.find(function (item) { return String(item.id) === id; });
            if (producto) {
                addProducto(producto);
            }
        });

        $("#cardsCotProductosResultados").on("click", "[data-cot-add-product]", function () {
            const id = String($(this).attr("data-cot-add-product") || "");
            const producto = state.editor.productos.find(function (item) { return String(item.id) === id; });
            if (producto) {
                addProducto(producto);
            }
        });

        $("#tbCotPartidas").on("input", "[data-cot-qty], [data-cot-price], [data-cot-discount]", function () {
            const index = Number($(this).attr("data-cot-index"));
            const field = String($(this).attr("data-cot-field") || "");
            updatePartida(index, field, $(this).val());
        });

        $("#cardsCotPartidas").on("input", "[data-cot-qty], [data-cot-price], [data-cot-discount]", function () {
            const index = Number($(this).attr("data-cot-index"));
            const field = String($(this).attr("data-cot-field") || "");
            updatePartida(index, field, $(this).val());
        });

        $("#tbCotPartidas").on("click", "[data-cot-remove]", function () {
            removePartida(Number($(this).attr("data-cot-remove")));
        });

        $("#cardsCotPartidas").on("click", "[data-cot-remove]", function () {
            removePartida(Number($(this).attr("data-cot-remove")));
        });

        $("#btCotGuardar").on("click", saveCotizacion);
        $("#btCotExportarPdf").on("click", function () {
            if (!state.editor.cotizacionId) {
                setStatus("#txCotFormStatus", "danger", "Guarda la cotización antes de exportar el PDF.");
                return;
            }

            openCotizacionPdfViewer(state.editor.cotizacionId, {
                returnToReport: false,
                title: state.editor.detail && state.editor.detail.folio ? state.editor.detail.folio : ""
            });
        });

        $("#btCotCancelar").on("click", function () {
            if (!state.editor.cotizacionId || state.editor.readOnly) {
                return;
            }

            $("#txCotCancelarEditorMotivo").val("");
            setStatus("#txCotCancelarEditorStatus", "", "");
            resolveModalApi("#modalCotCancelarEditor").show();
        });

        $("#btCotConfirmarCancelarEditor").on("click", cancelEditorCotizacion);
        $("#btCotCompartir").on("click", function () {
            shareCotizacion(state.editor.cotizacionId);
        });
        $("#btCotEnviarWhatsApp").on("click", function () {
            openWhatsAppModal(state.editor.cotizacionId);
        });
        $("#btCotEnviarCorreo").on("click", function () {
            openCorreoModal(state.editor.cotizacionId);
        });
        $("#btCotAutorizar").on("click", function () {
            openAutorizarModal(state.editor.cotizacionId, state.editor.detail && state.editor.detail.folio);
        });
        $("#btCotCerrarPdfViewer").on("click", function () {
            resolveModalApi("#modalCotPdfViewer").hide();
        });
        $("#modalCotPdfViewer").on("hidden.bs.modal", handleCotPdfViewerHidden);
    }

    function loadSucursales() {
        return fetchJson("/Cotizaciones/ObtenerSucursalesCotizacion")
            .then(function (data) {
                state.editor.sucursales = Array.isArray(data) ? data : [];
                populateSucursales(state.editor.sucursales);
            });
    }

    function populateSucursales(items) {
        const $select = $("#cbCotSucursal");
        $select.empty();
        $select.append($("<option></option>").val("").text("Sin sucursal"));

        (items || []).forEach(function (item) {
            $select.append($("<option></option>").val(item.id || item.Id || "").text(item.nombre || item.Nombre || "Sucursal"));
        });
    }

    function loadEditorDetail(id) {
        return fetchJson("/Cotizaciones/ObtenerCotizacion?idCotizacion=" + encodeURIComponent(id))
            .then(function (detail) {
                applyDetailToEditor(detail || {});
                setEditorTitles();
            });
    }

    function applyDetailToEditor(detail) {
        state.editor.detail = detail || {};
        const isClone = state.editor.mode === "clone";
        const isBorrador = Number(detail.estado || 0) === estadoBorrador;

        state.editor.cotizacionId = isClone ? "" : (detail.id || "");
        state.editor.readOnly = state.editor.mode === "detail" && !isBorrador;
        state.editor.cliente = {
            id: detail.idCliente || "",
            nombre: detail.cliente || "",
            telefono: detail.clienteTelefono || "",
            correo: detail.clienteCorreo || "",
            descuento: Number(detail.clienteDescuento || 0)
        };

        $("#cbCotSucursal").val(detail.idSucursal || "");
        $("#txCotVigenciaDias").val(detail.vigenciaDias == null ? "" : detail.vigenciaDias);
        $("#txCotCaja").val(detail.caja || "");
        $("#txCotObservaciones").val(detail.observaciones || "");
        state.editor.quoteDataTouched = !!(detail.idSucursal || detail.vigenciaDias != null || String(detail.observaciones || "").trim());

        state.editor.partidas = (Array.isArray(detail.partidas) ? detail.partidas : []).map(function (partida) {
            return {
                idProductoServicio: partida.idProductoServicio,
                codigo: partida.codigo || "",
                imagenUrl: partida.imagenUrl || partida.ImagenUrl || "",
                imagenNombre: partida.imagenNombre || partida.ImagenNombre || "",
                nombre: partida.nombre || "",
                descripcion: partida.descripcion || "",
                unidadMedida: partida.unidadMedida || "",
                unidadAbreviatura: partida.unidadAbreviatura || "",
                unidadPermiteDecimales: !!partida.unidadPermiteDecimales,
                permiteVentaSinExistencia: !!partida.permiteVentaSinExistencia,
                existenciaActual: partida.existenciaActual,
                cantidad: Number(partida.cantidad || 0),
                precioUnitario: Number(partida.precioUnitario || 0),
                descuentoBasePct: Number(partida.descuentoPct || 0),
                descuentoPct: Number(partida.descuentoPct || 0),
                descuentoManual: false
            };
        });

        if (isClone) {
            state.editor.readOnly = false;
        }

        selectCliente(state.editor.cliente, true);
        renderPartidas();
        syncEditorState(detail.folio || "");
    }

    function syncEditorUrl() {
        if (!state.editor.cotizacionId || !window.history || typeof window.history.replaceState !== "function") {
            return;
        }

        const nextUrl = "/Cotizaciones/Editar/" + encodeURIComponent(state.editor.cotizacionId);
        if (window.location.pathname !== nextUrl) {
            window.history.replaceState(window.history.state, document.title, nextUrl);
        }
    }

    function setEditorTitles() {
        const map = {
            new: {
                title: "Nueva cotización",
                description: "Captura una cotización desde cero usando clientes y productos reutilizados."
            },
            detail: {
                title: state.editor.readOnly ? "Detalle de cotización" : "Editar cotización",
                description: state.editor.readOnly
                    ? "La cotización no está en borrador, así que se muestra en modo consulta."
                    : "La cotización sigue en borrador y puede ajustarse."
            },
            clone: {
                title: "Clonar cotización",
                description: "Se cargó la cotización origen para generar una nueva versión editable."
            }
        };

        const config = map[state.editor.mode] || map.new;
        $("#txCotHeroTitle").text(config.title);
        $("#txCotHeroDescription").text(config.description);
    }

    function scheduleClienteSearch() {
        window.clearTimeout(state.editor.searchClienteTimer);
        state.editor.searchClienteTimer = window.setTimeout(runClienteSearch, 250);
    }

    function scheduleProductoSearch() {
        window.clearTimeout(state.editor.searchProductoTimer);
        state.editor.searchProductoTimer = window.setTimeout(runProductoSearch, 250);
    }

    function runClienteSearch() {
        const term = String($("#txCotBuscarCliente").val() || "").trim();
        if (term.length < 2) {
            state.editor.clientes = [];
            renderClientes([]);
            setStatus("#txCotClientesBusquedaStatus", "", "");
            return;
        }

        const query = new URLSearchParams({ busqueda: term, take: "12" });
        fetchJson("/Clientes/ObtenerClientes?" + query.toString())
            .then(function (data) {
                const items = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : Array.isArray(data.Items) ? data.Items : [];
                state.editor.clientes = items.map(normalizeClienteItem);
                renderClientes(state.editor.clientes);
                setStatus("#txCotClientesBusquedaStatus", "", "");
            })
            .catch(function (error) {
                setStatus("#txCotClientesBusquedaStatus", "danger", resolveErrorMessage(error));
            });
    }

    function runProductoSearch() {
        if (!state.editor.cliente) {
            setStatus("#txCotProductosBusquedaStatus", "danger", "Selecciona un cliente antes de buscar productos.");
            return;
        }

        const term = String($("#txCotBuscarProducto").val() || "").trim();
        if (term.length < 2) {
            state.editor.productos = [];
            renderProductos([]);
            setStatus("#txCotProductosBusquedaStatus", "", "");
            return;
        }

        if (state.editor.quoteDataTouched) {
            setSectionCollapsed("datos", true);
        }

        const query = new URLSearchParams({ busqueda: term, estatus: "activos", take: "20" });
        fetchJson("/ProductosServicios/ObtenerProductosServicios?" + query.toString())
            .then(function (data) {
                const items = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
                state.editor.productos = items;
                renderProductos(items);
                setStatus("#txCotProductosBusquedaStatus", "", "");
            })
            .catch(function (error) {
                setStatus("#txCotProductosBusquedaStatus", "danger", resolveErrorMessage(error));
            });
    }

    function renderClientes(items) {
        const html = (items || []).map(function (cliente) {
            return [
                "<tr>",
                "<td data-label='Seleccionar'><button type='button' class='checkapp-btn checkapp-btn-secondary cot-action-btn cot-action-btn--select' data-cot-select-client='", escapeHtml(cliente.id || ""),
                "' data-cot-client-name='", escapeHtml(cliente.nombre || ""),
                "' data-cot-client-phone='", escapeHtml(cliente.telefono || ""),
                "' data-cot-client-email='", escapeHtml(cliente.correo || ""),
                "' data-cot-client-company='", escapeHtml(cliente.empresa || ""),
                "' data-cot-client-discount='", escapeHtml(cliente.descuento || 0),
                "' title='Usar cliente' aria-label='Usar cliente'><i class='fa fa-check'></i><span>Usar</span></button></td>",
                "<td data-label='Cliente'>", escapeHtml(cliente.nombre || "—"), "</td>",
                "<td data-label='Teléfono'>", escapeHtml(cliente.telefono || "—"), "</td>",
                "<td data-label='Correo'>", escapeHtml(cliente.correo || "—"), "</td>",
                "<td data-label='Empresa'>", escapeHtml(cliente.empresa || "—"), "</td>",
                "</tr>"
            ].join("");
        }).join("");

        $("#tbCotClientesResultados").html(html || "<tr><td colspan='5'>Sin resultados.</td></tr>");
        renderClienteCards(items);
    }

    function renderProductos(items) {
        const html = (items || []).map(function (producto) {
            const unidad = producto.unidadAbreviatura ? (producto.unidadMedida + " (" + producto.unidadAbreviatura + ")") : (producto.unidadMedida || "—");
            const thumb = renderProductThumb(producto, producto.nombre || "Producto");
            return [
                "<tr>",
                "<td data-label='Código'>", escapeHtml(producto.codigo || "—"), "</td>",
                "<td data-label='Imagen' class='cot-grid-thumb-cell'>", thumb, "</td>",
                "<td data-label='Producto o servicio'><strong>", escapeHtml(producto.nombre || "—"), "</strong><div class='cot-row-muted'>", escapeHtml(producto.descripcion || ""), "</div></td>",
                "<td data-label='Unidad'>", escapeHtml(unidad), "</td>",
                "<td data-label='Existencia'>", escapeHtml(producto.existenciaActual == null ? "—" : formatNumber(producto.existenciaActual)), "</td>",
                "<td data-label='Precio público'>", escapeHtml(formatCurrency(producto.precioPublico || 0)), "</td>",
                "<td data-label='Agregar'><button type='button' class='checkapp-btn checkapp-btn-secondary cot-action-btn cot-action-btn--add' data-cot-add-product='", escapeHtml(producto.id || ""),
                "' data-cot-product-code='", escapeHtml(producto.codigo || ""),
                "' data-cot-product-image-url='", escapeHtml(resolveProductImageUrl(producto)),
                "' data-cot-product-image-name='", escapeHtml(resolveProductImageName(producto)),
                "' data-cot-product-name='", escapeHtml(producto.nombre || ""),
                "' data-cot-product-description='", escapeHtml(producto.descripcion || ""),
                "' data-cot-product-unit='", escapeHtml(producto.unidadMedida || ""),
                "' data-cot-product-unit-short='", escapeHtml(producto.unidadAbreviatura || ""),
                "' data-cot-product-unit-decimals='", escapeHtml(!!producto.unidadPermiteDecimales),
                "' data-cot-product-sell-without-stock='", escapeHtml(!!producto.permiteVentaSinExistencia),
                "' data-cot-product-stock='", escapeHtml(producto.existenciaActual == null ? "" : producto.existenciaActual),
                "' data-cot-product-price='", escapeHtml(producto.precioPublico || 0),
                "' title='Agregar partida' aria-label='Agregar partida'",
                "'><i class='fa fa-plus'></i><span>Agregar</span></button></td>",
                "</tr>"
            ].join("");
        }).join("");

        $("#tbCotProductosResultados").html(html || "<tr><td colspan='7'>Sin resultados.</td></tr>");
        renderProductoCards(items);
    }

    function selectCliente(cliente, silent) {
        state.editor.cliente = cliente ? normalizeClienteItem(cliente) : null;
        if (!state.editor.cliente) {
            $("#panelCotClienteSeleccionado").prop("hidden", true);
            return;
        }

        $("#panelCotClienteSeleccionado").prop("hidden", false);
        $("#txCotClienteSeleccionadoNombre").text(state.editor.cliente.nombre || "—");
        $("#txCotClienteSeleccionadoMeta").text([
            state.editor.cliente.telefono || "Sin teléfono",
            state.editor.cliente.correo || "Sin correo"
        ].join(" · "));
        $("#txCotClienteSeleccionadoDescuento").text("Descuento " + formatNumber(state.editor.cliente.descuento || 0) + "%");
        applyClientDiscountToPartidas();
        setSectionCollapsed("cliente", true);
        setSectionCollapsed("datos", false);

        if (!silent) {
            setStatus("#txCotFormStatus", "", "");
        }
    }

    function addProducto(producto) {
        if (state.editor.readOnly) {
            return;
        }

        state.editor.partidas.push({
            idProductoServicio: producto.id,
            codigo: producto.codigo || "",
            imagenUrl: producto.imagenUrl || "",
            imagenNombre: producto.imagenNombre || "",
            nombre: producto.nombre || "",
            descripcion: producto.descripcion || "",
            unidadMedida: producto.unidadMedida || "",
            unidadAbreviatura: producto.unidadAbreviatura || "",
            unidadPermiteDecimales: !!producto.unidadPermiteDecimales,
            permiteVentaSinExistencia: !!producto.permiteVentaSinExistencia,
            existenciaActual: producto.existenciaActual,
            cantidad: 1,
            precioUnitario: Number(producto.precioPublico || 0),
            descuentoBasePct: Number(producto.descuentoPct || 0),
            descuentoPct: calculateClientDiscount(Number(producto.descuentoPct || 0)),
            descuentoManual: false
        });

        state.editor.quoteDataTouched = true;
        renderPartidas();
        setSectionCollapsed("datos", true);
        setSectionCollapsed("productos", true);
        setStatus("#txCotProductosBusquedaStatus", "", "");
    }

    function updatePartida(index, field, rawValue) {
        if (state.editor.readOnly || !state.editor.partidas[index]) {
            return;
        }

        const partida = state.editor.partidas[index];
        const numeric = toNumber(rawValue);

        if (field === "cantidad") {
            partida.cantidad = partida.unidadPermiteDecimales ? numeric : Math.max(1, Math.round(numeric));
        }

        if (field === "precioUnitario") {
            partida.precioUnitario = numeric;
        }

        if (field === "descuentoPct") {
            partida.descuentoPct = Math.max(0, Math.min(100, numeric));
            partida.descuentoManual = true;
        }

        refreshPartidaComputedUi(index);
        refreshPartidasTotalsUi();
    }

    function removePartida(index) {
        if (state.editor.readOnly) {
            return;
        }

        state.editor.partidas.splice(index, 1);
        renderPartidas();
    }

    function renderPartidas() {
        const totals = computeTotals();
        const html = state.editor.partidas.map(function (partida, index) {
            const total = computePartidaTotal(partida);
            const unidad = partida.unidadAbreviatura ? (partida.unidadMedida + " (" + partida.unidadAbreviatura + ")") : (partida.unidadMedida || "—");
            const disabled = state.editor.readOnly ? " disabled" : "";
            const thumb = renderProductThumb(partida, partida.nombre || "Partida");

            return [
                "<tr>",
                "<td data-label='#'>", escapeHtml(index + 1), "</td>",
                "<td data-label='Código'>", escapeHtml(partida.codigo || "—"), "</td>",
                "<td data-label='Imagen' class='cot-grid-thumb-cell'>", thumb, "</td>",
                "<td data-label='Producto o servicio'><strong>", escapeHtml(partida.nombre || "—"), "</strong><div class='cot-row-muted'>", escapeHtml(partida.descripcion || ""), "</div></td>",
                "<td data-label='Unidad'>", escapeHtml(unidad), "</td>",
                "<td data-label='Cantidad'><input class='form-control cot-partida-input' data-cot-index='", index, "' data-cot-field='cantidad' data-cot-qty='1' type='number' min='0' step='0.01' value='", escapeHtml(partida.cantidad), "'", disabled, " /></td>",
                "<td data-label='Precio'><input class='form-control cot-partida-input' data-cot-index='", index, "' data-cot-field='precioUnitario' data-cot-price='1' type='number' min='0' step='0.01' value='", escapeHtml(partida.precioUnitario), "'", disabled, " /></td>",
                "<td data-label='Desc. %'><input class='form-control cot-partida-input' data-cot-index='", index, "' data-cot-field='descuentoPct' data-cot-discount='1' type='number' min='0' max='100' step='0.01' value='", escapeHtml(partida.descuentoPct), "'", disabled, " /></td>",
                "<td data-label='Total'>", escapeHtml(formatCurrency(total.total)), "</td>",
                "<td data-label='Acción'>", state.editor.readOnly ? "—" : "<button type='button' class='checkapp-btn checkapp-btn-ghost cot-action-btn cot-action-btn--remove' data-cot-remove='" + index + "' title='Quitar partida' aria-label='Quitar partida'><i class='fa fa-trash'></i><span>Quitar</span></button>", "</td>",
                "</tr>"
            ].join("");
        }).join("");

        $("#tbCotPartidas").html(html || "<tr><td colspan='10'>Agrega al menos un producto para comenzar.</td></tr>");
        $("#txCotResumenPiezas").text(formatNumber(totals.totalPiezas));
        $("#txCotResumenSubtotal").text(formatCurrency(totals.subtotal));
        $("#txCotResumenDescuento").text(formatCurrency(totals.descuentoTotal));
        $("#txCotResumenTotal").text(formatCurrency(totals.total));
        $("#txCotPartidasStatus").text(state.editor.partidas.length ? "" : "Agrega al menos una partida para guardar.");
        renderPartidaCards();
        syncEditorState();
    }

    function refreshPartidaComputedUi(index) {
        const partida = state.editor.partidas[index];
        if (!partida) {
            return;
        }

        const total = computePartidaTotal(partida);
        const safeIndex = String(index);
        const totalText = formatCurrency(total.total);

        $("#tbCotPartidas [data-cot-index='" + safeIndex + "']")
            .first()
            .closest("tr")
            .find("td[data-label='Total']")
            .text(totalText);

        $("#cardsCotPartidas [data-cot-index='" + safeIndex + "']")
            .first()
            .closest(".cot-mobile-card")
            .find(".cot-mobile-card__total strong")
            .text(totalText);
    }

    function refreshPartidasTotalsUi() {
        const totals = computeTotals();

        $("#txCotResumenPiezas").text(formatNumber(totals.totalPiezas));
        $("#txCotResumenSubtotal").text(formatCurrency(totals.subtotal));
        $("#txCotResumenDescuento").text(formatCurrency(totals.descuentoTotal));
        $("#txCotResumenTotal").text(formatCurrency(totals.total));
        $("#txCotPartidasStatus").text(state.editor.partidas.length ? "" : "Agrega al menos una partida para guardar.");
        syncEditorState();
    }

    function computeTotals() {
        return state.editor.partidas.reduce(function (acc, partida) {
            const computed = computePartidaTotal(partida);
            acc.subtotal += computed.importeBruto;
            acc.descuentoTotal += computed.descuentoImporte;
            acc.total += computed.total;
            acc.totalPiezas += Number(partida.cantidad || 0);
            return acc;
        }, { subtotal: 0, descuentoTotal: 0, total: 0, totalPiezas: 0 });
    }

    function computePartidaTotal(partida) {
        const cantidad = Number(partida.cantidad || 0);
        const precio = Number(partida.precioUnitario || 0);
        const descuentoPct = Number(partida.descuentoPct || 0);
        const importeBruto = roundMoney(cantidad * precio);
        const descuentoImporte = roundMoney(importeBruto * (descuentoPct / 100));
        const total = roundMoney(importeBruto - descuentoImporte);
        return {
            importeBruto: importeBruto,
            descuentoImporte: descuentoImporte,
            total: total
        };
    }

    function syncEditorState(folio) {
        const detail = state.editor.detail || {};
        const totals = computeTotals();
        const hasPersistedCotizacion = !!state.editor.cotizacionId;
        const isDraft = Number(detail.estado || 0) === estadoBorrador || !hasPersistedCotizacion;
        const estadoNombre = state.editor.readOnly ? (detail.estadoNombre || "Consulta") : (detail.estadoNombre || "Borrador");
        $("#txCotResumenFolio").text(folio || detail.folio || (state.editor.mode === "clone" ? "Clon nueva" : "Nuevo"));
        $("#txCotResumenEstado").text(estadoNombre);
        $("#btCotGuardar").prop("disabled", state.editor.readOnly);
        $("#btCotCancelar").prop("disabled", state.editor.readOnly || !state.editor.cotizacionId);
        $("#btCotExportarPdf").prop("disabled", !state.editor.cotizacionId);
        $("#btCotCompartir, #btCotEnviarWhatsApp, #btCotEnviarCorreo").prop("disabled", !hasPersistedCotizacion);
        $("#btCotAutorizar").prop("disabled", !hasPersistedCotizacion || !isDraft || state.editor.readOnly);
        $("#btCotGuardar, #btCotCancelar").prop("hidden", state.editor.readOnly);
        $("#btCotAutorizar").prop("hidden", !hasPersistedCotizacion || !isDraft || state.editor.readOnly);

        if (state.editor.partidas.length && !state.editor.readOnly) {
            $("#txCotPartidasStatus").text("");
        }

        $("#txCotResumenSubtotal").text(formatCurrency(totals.subtotal));
        $("#txCotResumenDescuento").text(formatCurrency(totals.descuentoTotal));
        $("#txCotResumenTotal").text(formatCurrency(totals.total));
    }

    function saveCotizacion() {
        if (state.editor.readOnly) {
            return;
        }

        if (state.editor.isSaving) {
            return;
        }

        const validation = validateEditor();
        if (validation) {
            setStatus("#txCotFormStatus", "danger", validation);
            return;
        }

        const payload = {
            id: state.editor.cotizacionId || null,
            idCliente: state.editor.cliente.id,
            idSucursal: normalizeGuid($("#cbCotSucursal").val()) || null,
            vigenciaDias: toNullableNumber($("#txCotVigenciaDias").val()),
            caja: String($("#txCotCaja").val() || "").trim(),
            observaciones: String($("#txCotObservaciones").val() || "").trim(),
            partidas: state.editor.partidas.map(function (partida) {
                return {
                    idProductoServicio: partida.idProductoServicio,
                    cantidad: Number(partida.cantidad || 0),
                    precioUnitario: Number(partida.precioUnitario || 0),
                    descuentoPct: Number(partida.descuentoPct || 0)
                };
            })
        };
        state.editor.isSaving = true;
        const $saveButton = $("#btCotGuardar");
        const $cancelButton = $("#btCotCancelar");
        const saveButtonHtml = $saveButton.html();
        $saveButton.prop("disabled", true).html("<i class='fa fa-spinner fa-spin'></i><span>Guardando...</span>");
        $cancelButton.prop("disabled", true);
        setStatus("#txCotFormStatus", "", "");
        postJson("/Cotizaciones/GuardarCotizacion", payload)
            .then(function (response) {
                state.editor.cotizacionId = response.idCotizacion || state.editor.cotizacionId;
                state.editor.sourceId = state.editor.cotizacionId;
                state.editor.mode = "detail";
                setStatus("#txCotFormStatus", "success", response.mensaje || "La cotización se guardó correctamente.");
                $("#txCotResumenFolio").text(response.folio || "Borrador");
                $("#txCotResumenEstado").text(response.estadoNombre || "Borrador");
                if (state.editor.cotizacionId) {
                    return loadEditorDetail(state.editor.cotizacionId)
                        .then(function () {
                            syncEditorUrl();
                            return openCotizacionPdfViewer(state.editor.cotizacionId, {
                                returnToReport: true,
                                title: response.folio || (state.editor.detail && state.editor.detail.folio) || ""
                            });
                        });
                }

                return null;
            })
            .catch(function (error) {
                setStatus("#txCotFormStatus", "danger", resolveErrorMessage(error));
            })
            .finally(function () {
                state.editor.isSaving = false;
                $saveButton.html(saveButtonHtml);
                syncEditorState();
            });
    }

    function cancelEditorCotizacion() {
        const motivo = String($("#txCotCancelarEditorMotivo").val() || "").trim();
        if (!state.editor.cotizacionId || !motivo) {
            setStatus("#txCotCancelarEditorStatus", "danger", "Captura el motivo de cancelación.");
            return;
        }

        postJson("/Cotizaciones/CancelarCotizacion", {
            idCotizacion: state.editor.cotizacionId,
            motivoCancelacion: motivo
        }).then(function () {
            resolveModalApi("#modalCotCancelarEditor").hide();
            return loadEditorDetail(state.editor.cotizacionId);
        }).then(function () {
            setStatus("#txCotFormStatus", "success", "La cotización se canceló correctamente.");
        }).catch(function (error) {
            setStatus("#txCotCancelarEditorStatus", "danger", resolveErrorMessage(error));
        });
    }

    function buildPdfUrl(id) {
        return "/Cotizaciones/ExportarCotizacionPdf?idCotizacion=" + encodeURIComponent(id || "");
    }

    function buildPdfAbsoluteUrl(id) {
        return window.location.origin + buildPdfUrl(id);
    }

    function buildPdfFileName(folio) {
        const clean = String(folio || "").replace(/[^A-Za-z0-9_-]+/g, "");
        return "cotizacion_" + (clean || "archivo") + ".pdf";
    }

    function openCotizacionPdfViewer(id, options) {
        const cotizacionId = normalizeGuid(id);
        if (!cotizacionId) {
            setStatus("#txCotFormStatus", "danger", "La cotización no está disponible.");
            return Promise.resolve();
        }

        const config = Object.assign({
            returnToReport: false,
            title: ""
        }, options || {});

        state.editor.pdfViewerReturnToReport = !!config.returnToReport;
        $("#txCotPdfViewerTitulo").text(config.title ? ("Vista previa " + config.title) : "Vista previa de la cotización");
        $("#txCotPdfViewerPrompt").text(config.returnToReport
            ? "Revisa el PDF dentro de CheckApp y cierra para volver automáticamente al reporte."
            : "Revisa el PDF dentro de CheckApp antes de cerrar.");
        setStatus("#txCotPdfViewerStatus", "info", "Preparando vista previa...");
        $("#frCotPdfViewer").attr("src", "about:blank");
        resolveModalApi("#modalCotPdfViewer").show();

        return fetchPdfBlob(cotizacionId)
            .then(function (blob) {
                if (state.editor.activePdfUrl) {
                    window.URL.revokeObjectURL(state.editor.activePdfUrl);
                }

                state.editor.activePdfUrl = window.URL.createObjectURL(blob);
                $("#frCotPdfViewer").attr("src", state.editor.activePdfUrl + "#toolbar=1&navpanes=0");
                setStatus("#txCotPdfViewerStatus", "", "");
            })
            .catch(function (error) {
                setStatus("#txCotPdfViewerStatus", "danger", resolveErrorMessage(error));
            });
    }

    function handleCotPdfViewerHidden() {
        const shouldReturn = !!state.editor.pdfViewerReturnToReport;
        state.editor.pdfViewerReturnToReport = false;
        $("#frCotPdfViewer").attr("src", "about:blank");
        if (state.editor.activePdfUrl) {
            window.URL.revokeObjectURL(state.editor.activePdfUrl);
            state.editor.activePdfUrl = "";
        }

        setStatus("#txCotPdfViewerStatus", "", "");
        if (shouldReturn) {
            window.location.assign("/Cotizaciones/Reporte");
        }
    }

    function resolveCotizacionDetail(id) {
        const normalizedId = normalizeGuid(id);
        if (!normalizedId) {
            return Promise.reject(new Error("La cotización no está disponible."));
        }

        if (state.editor.detail && String(state.editor.detail.id || "") === normalizedId) {
            return Promise.resolve(state.editor.detail);
        }

        if (state.report.detail && String(state.report.detail.id || "") === normalizedId) {
            return Promise.resolve(state.report.detail);
        }

        return fetchJson("/Cotizaciones/ObtenerCotizacion?idCotizacion=" + encodeURIComponent(normalizedId));
    }

    function setActionDetail(detail) {
        state.action.detail = detail || null;
        state.action.detailId = detail && detail.id ? detail.id : "";
    }

    function buildCotizacionShareMessage(detail) {
        return [
            "Te comparto la cotización " + (detail.folio || "sin folio"),
            "Cliente: " + (detail.cliente || "Sin cliente"),
            "Total: " + formatCurrency(detail.total || 0)
        ].join(" · ");
    }

    function fetchPdfBlob(id) {
        return window.fetch(buildPdfUrl(id), {
            method: "GET",
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        }).then(function (response) {
            if (!response.ok) {
                throw new Error("No fue posible obtener el PDF.");
            }

            return response.blob();
        });
    }

    function shareCotizacion(id) {
        resolveCotizacionDetail(id)
            .then(function (detail) {
                if (!detail || !detail.id) {
                    throw new Error("La cotización no está disponible.");
                }

                setActionDetail(detail);
                return shareCotizacionDetail(detail);
            })
            .catch(function (error) {
                if (error && error.name === "AbortError") {
                    return;
                }

                setStatus("#txCotFormStatus", "danger", resolveErrorMessage(error));
            });
    }

    function shareCotizacionDetail(detail) {
        const shareData = {
            title: "Cotización " + (detail.folio || ""),
            text: buildCotizacionShareMessage(detail)
        };

        if (!navigator.share) {
            openShareFallback(detail);
            return Promise.resolve();
        }

        return fetchPdfBlob(detail.id)
            .then(function (blob) {
                const file = new window.File([blob], buildPdfFileName(detail.folio), { type: "application/pdf" });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    return navigator.share({
                        title: shareData.title,
                        text: shareData.text,
                        files: [file]
                    });
                }

                return navigator.share(Object.assign({}, shareData, {
                    url: buildPdfAbsoluteUrl(detail.id)
                }));
            })
            .catch(function (error) {
                if (error && error.name === "AbortError") {
                    throw error;
                }

                openShareFallback(detail);
                return null;
            });
    }

    function openShareFallback(detail) {
        setActionDetail(detail);
        setStatus("#txCotCompartirFallbackStatus", "", "");
        $("#txCotCompartirFallbackPrompt").text("Continúa con PDF, WhatsApp, correo o copia el enlace de la cotización " + (detail.folio || "seleccionada") + ".");
        resolveModalApi("#modalCotCompartirFallback").show();
    }

    function openFallbackPdf() {
        if (!state.action.detailId) {
            return;
        }

        window.open(buildPdfUrl(state.action.detailId), "_blank");
    }

    function copyFallbackLink() {
        if (!state.action.detailId) {
            setStatus("#txCotCompartirFallbackStatus", "danger", "La cotización no está disponible.");
            return;
        }

        const link = buildPdfAbsoluteUrl(state.action.detailId);
        if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
            setStatus("#txCotCompartirFallbackStatus", "danger", "Tu navegador no permite copiar el enlace automáticamente.");
            return;
        }

        navigator.clipboard.writeText(link)
            .then(function () {
                setStatus("#txCotCompartirFallbackStatus", "success", "Enlace copiado correctamente.");
            })
            .catch(function () {
                setStatus("#txCotCompartirFallbackStatus", "danger", "No fue posible copiar el enlace.");
            });
    }

    function openWhatsAppModal(id) {
        resolveCotizacionDetail(id)
            .then(function (detail) {
                setActionDetail(detail);
                const digits = normalizePhoneDigits(detail.clienteTelefono || "").slice(-10);
                $("#txCotWhatsAppTelefono").val(digits);
                $("#txCotWhatsAppPrompt").text("Captura el teléfono a 10 dígitos para enviar la cotización " + (detail.folio || "") + ".");
                setStatus("#txCotWhatsAppStatus", "", "");
                resolveModalApi("#modalCotWhatsApp").show();
            })
            .catch(function (error) {
                setStatus("#txCotFormStatus", "danger", resolveErrorMessage(error));
            });
    }

    function sendCotizacionWhatsApp() {
        const detail = state.action.detail || {};
        const digits = normalizePhoneDigits($("#txCotWhatsAppTelefono").val()).slice(-10);
        if (digits.length !== 10) {
            setStatus("#txCotWhatsAppStatus", "danger", "Captura un teléfono válido de 10 dígitos.");
            return;
        }

        if (!detail.id) {
            setStatus("#txCotWhatsAppStatus", "danger", "La cotización no está disponible.");
            return;
        }

        const message = buildCotizacionShareMessage(detail) + " · PDF: " + buildPdfAbsoluteUrl(detail.id);
        const whatsappWindow = tryOpenPendingWindow();
        triggerPdfDownload(detail.id, buildPdfFileName(detail.folio))
            .finally(function () {
                openPendingWindow(whatsappWindow, "https://wa.me/52" + digits + "?text=" + encodeURIComponent(message));
                resolveModalApi("#modalCotWhatsApp").hide();
            });
    }

    function openCorreoModal(id) {
        resolveCotizacionDetail(id)
            .then(function (detail) {
                setActionDetail(detail);
                $("#txCotCorreoDestino").val(String(detail.clienteCorreo || "").trim());
                $("#txCotCorreoAsunto").val("Cotización " + (detail.folio || ""));
                $("#txCotCorreoMensaje").val("Hola,\n\nTe comparto la cotización " + (detail.folio || "") + " por un total de " + formatCurrency(detail.total || 0) + ".\n");
                setStatus("#txCotCorreoStatus", "", "");
                resolveModalApi("#modalCotCorreo").show();
            })
            .catch(function (error) {
                setStatus("#txCotFormStatus", "danger", resolveErrorMessage(error));
            });
    }

    function sendCotizacionCorreo() {
        const detail = state.action.detail || {};
        const correo = String($("#txCotCorreoDestino").val() || "").trim();
        const asunto = String($("#txCotCorreoAsunto").val() || "").trim();
        const mensaje = String($("#txCotCorreoMensaje").val() || "").trim();

        if (!detail.id) {
            setStatus("#txCotCorreoStatus", "danger", "La cotización no está disponible.");
            return;
        }

        if (!isValidEmail(correo) || !asunto || !mensaje) {
            setStatus("#txCotCorreoStatus", "danger", "Captura correo, asunto y mensaje válidos.");
            return;
        }

        setStatus("#txCotCorreoStatus", "", "");
        postJson("/Cotizaciones/EnviarCotizacionCorreo", {
            idCotizacion: detail.id,
            correo: correo,
            asunto: asunto,
            mensaje: mensaje,
            folio: detail.folio || "",
            clienteNombre: detail.cliente || ""
        }).then(function (response) {
            resolveModalApi("#modalCotCorreo").hide();
            setStatus("#txCotFormStatus", "success", response.mensaje || "La cotización se envió por correo correctamente.");
        }).catch(function (error) {
            setStatus("#txCotCorreoStatus", "danger", resolveErrorMessage(error));
        });
    }

    function openAutorizarModal(id, folio) {
        const normalizedId = normalizeGuid(id);
        if (!normalizedId) {
            setStatus("#txCotFormStatus", "danger", "La cotización no está disponible.");
            return;
        }

        state.action.detailId = normalizedId;
        $("#txCotAutorizarPrompt").text("Confirma si deseas autorizar la cotización " + (folio || "seleccionada") + ".");
        setStatus("#txCotAutorizarStatus", "", "");
        resolveModalApi("#modalCotAutorizar").show();
    }

    function confirmAutorizarCotizacion() {
        if (!state.action.detailId) {
            setStatus("#txCotAutorizarStatus", "danger", "La cotización no está disponible.");
            return;
        }

        postJson("/Cotizaciones/AutorizarCotizacion", {
            idCotizacion: state.action.detailId
        }).then(function (response) {
            resolveModalApi("#modalCotAutorizar").hide();
            if (pageType === "report") {
                if (state.report.detailId === state.action.detailId) {
                    return fetchJson("/Cotizaciones/ObtenerCotizacion?idCotizacion=" + encodeURIComponent(state.action.detailId))
                        .then(function (detail) {
                            state.report.detail = detail || null;
                            fillReportDetail(detail || {});
                            return runReportSearch();
                        }).then(function () {
                            setStatus("#txCotListadoStatus", "success", response.mensaje || "La cotización se autorizó correctamente.");
                        });
                }

                return runReportSearch().then(function () {
                    setStatus("#txCotListadoStatus", "success", response.mensaje || "La cotización se autorizó correctamente.");
                });
            }

            return loadEditorDetail(state.action.detailId).then(function () {
                setStatus("#txCotFormStatus", "success", response.mensaje || "La cotización se autorizó correctamente.");
            });
        }).catch(function (error) {
            setStatus("#txCotAutorizarStatus", "danger", resolveErrorMessage(error));
        });
    }

    function triggerPdfDownload(id, fileName) {
        return fetchPdfBlob(id)
            .then(function (blob) {
                const objectUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = objectUrl;
                link.download = fileName || "cotizacion.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.setTimeout(function () {
                    window.URL.revokeObjectURL(objectUrl);
                }, 1000);
            });
    }

    function calculateClientDiscount(baseDiscount) {
        const base = Math.max(0, Number(baseDiscount || 0));
        if (!state.editor.cliente || !state.editor.cliente.id) {
            return base;
        }

        const clientDiscount = Math.max(0, Number(state.editor.cliente.descuento || 0));
        return Math.min(10, Math.max(base, clientDiscount));
    }

    function applyClientDiscountToPartidas() {
        if (!state.editor.partidas.length) {
            return;
        }

        let changed = false;
        state.editor.partidas.forEach(function (partida) {
            if (partida.descuentoManual) {
                return;
            }

            const nextDiscount = calculateClientDiscount(partida.descuentoBasePct);
            if (Math.abs(Number(partida.descuentoPct || 0) - nextDiscount) > 0.0001) {
                partida.descuentoPct = nextDiscount;
                changed = true;
            }
        });

        if (changed) {
            renderPartidas();
        }
    }

    function setSectionCollapsed(section, collapsed) {
        if (!Object.prototype.hasOwnProperty.call(state.editor.sections, section)) {
            return;
        }

        state.editor.sections[section] = !!collapsed;
        syncEditorPanels();
    }

    function syncEditorPanels() {
        Object.keys(state.editor.sections).forEach(function (section) {
            const collapsed = !!state.editor.sections[section];
            const $panel = $("[data-cot-section='" + escapeSelectorValue(section) + "']");
            const $button = $panel.find("[data-cot-toggle-section='" + escapeSelectorValue(section) + "']");
            $panel.toggleClass("is-collapsed", collapsed);
            $button.attr("aria-expanded", collapsed ? "false" : "true");
            $button.find("span").text(collapsed ? "Expandir" : "Contraer");
        });
    }

    function tryOpenPendingWindow() {
        try {
            return window.open("about:blank", "_blank");
        } catch (_error) {
            return null;
        }
    }

    function openPendingWindow(targetWindow, url) {
        if (targetWindow && !targetWindow.closed) {
            targetWindow.location.replace(url);
            return;
        }

        window.open(url, "_blank");
    }

    function closePendingWindow(targetWindow) {
        if (!targetWindow || targetWindow.closed) {
            return;
        }

        try {
            targetWindow.close();
        } catch (_error) {
            // Ignore close errors for user-managed tabs.
        }
    }

    function escapeSelectorValue(value) {
        if (window.CSS && typeof window.CSS.escape === "function") {
            return window.CSS.escape(String(value || ""));
        }

        return String(value || "").replace(/['"\\]/g, "\\$&");
    }

    function validateEditor() {
        if (!state.editor.cliente || !state.editor.cliente.id) {
            return "Selecciona un cliente para continuar.";
        }

        if (!state.editor.partidas.length) {
            return "Agrega al menos una partida a la cotización.";
        }

        const invalid = state.editor.partidas.find(function (partida) {
            return Number(partida.cantidad || 0) <= 0 || Number(partida.precioUnitario || 0) <= 0;
        });

        if (invalid) {
            return "Todas las partidas deben tener cantidad y precio mayores a cero.";
        }

        return "";
    }

    function renderClienteCards(items) {
        const html = (items || []).map(function (cliente) {
            const hasEmpresa = !!String(cliente.empresa || "").trim();
            return [
                "<article class='cot-mobile-card'>",
                "<div class='cot-mobile-card__head'>",
                "<div class='cot-mobile-card__title'>", escapeHtml(cliente.nombre || "Cliente"), "</div>",
                hasEmpresa ? "<div class='cot-mobile-card__subtitle'>" + escapeHtml(cliente.empresa) + "</div>" : "",
                "</div>",
                "<div class='cot-mobile-card__meta'>",
                "<div class='cot-mobile-card__row'><span>Teléfono</span><strong>", escapeHtml(cliente.telefono || "—"), "</strong></div>",
                "<div class='cot-mobile-card__row'><span>Correo</span><strong>", escapeHtml(cliente.correo || "—"), "</strong></div>",
                "</div>",
                "<div class='cot-mobile-card__actions'>",
                "<button type='button' class='checkapp-btn checkapp-btn-secondary' data-cot-select-client='", escapeHtml(cliente.id || ""),
                "' data-cot-client-name='", escapeHtml(cliente.nombre || ""),
                "' data-cot-client-phone='", escapeHtml(cliente.telefono || ""),
                "' data-cot-client-email='", escapeHtml(cliente.correo || ""),
                "' data-cot-client-company='", escapeHtml(cliente.empresa || ""),
                "' data-cot-client-discount='", escapeHtml(cliente.descuento || 0),
                "' title='Usar cliente' aria-label='Usar cliente'><i class='fa fa-check'></i><span>Usar</span></button>",
                "</div>",
                "</article>"
            ].join("");
        }).join("");

        $("#cardsCotClientesResultados")
            .prop("hidden", !(items || []).length)
            .html(html);
    }

    function renderProductoCards(items) {
        const html = (items || []).map(function (producto) {
            const unidad = producto.unidadAbreviatura ? (producto.unidadMedida + " (" + producto.unidadAbreviatura + ")") : (producto.unidadMedida || "—");
            const existencia = producto.existenciaActual == null ? "—" : formatNumber(producto.existenciaActual);
            const thumb = renderProductThumb(producto, producto.nombre || "Producto");
            return [
                "<article class='cot-mobile-card'>",
                "<div class='cot-mobile-card__media'>", thumb, "</div>",
                "<div class='cot-mobile-card__head'>",
                "<div class='cot-mobile-card__title'>", escapeHtml(producto.nombre || "Producto o servicio"), "</div>",
                "<div class='cot-mobile-card__subtitle'>Código: ", escapeHtml(producto.codigo || "—"), "</div>",
                "<div class='cot-mobile-card__subtitle'>", escapeHtml(producto.descripcion || ""), "</div>",
                "</div>",
                "<div class='cot-mobile-card__meta'>",
                "<div class='cot-mobile-card__row'><span>Unidad</span><strong>", escapeHtml(unidad), "</strong></div>",
                "<div class='cot-mobile-card__row'><span>Existencia</span><strong>", escapeHtml(existencia), "</strong></div>",
                "<div class='cot-mobile-card__row'><span>Precio</span><strong>", escapeHtml(formatCurrency(producto.precioPublico || 0)), "</strong></div>",
                "</div>",
                "<div class='cot-mobile-card__actions'>",
                "<button type='button' class='checkapp-btn checkapp-btn-secondary' data-cot-add-product='", escapeHtml(producto.id || ""),
                "' data-cot-product-code='", escapeHtml(producto.codigo || ""),
                "' data-cot-product-image-url='", escapeHtml(resolveProductImageUrl(producto)),
                "' data-cot-product-image-name='", escapeHtml(resolveProductImageName(producto)),
                "' data-cot-product-name='", escapeHtml(producto.nombre || ""),
                "' data-cot-product-description='", escapeHtml(producto.descripcion || ""),
                "' data-cot-product-unit='", escapeHtml(producto.unidadMedida || ""),
                "' data-cot-product-unit-short='", escapeHtml(producto.unidadAbreviatura || ""),
                "' data-cot-product-unit-decimals='", escapeHtml(!!producto.unidadPermiteDecimales),
                "' data-cot-product-sell-without-stock='", escapeHtml(!!producto.permiteVentaSinExistencia),
                "' data-cot-product-stock='", escapeHtml(producto.existenciaActual == null ? "" : producto.existenciaActual),
                "' data-cot-product-price='", escapeHtml(producto.precioPublico || 0),
                "' title='Agregar partida' aria-label='Agregar partida'><i class='fa fa-plus'></i><span>Agregar</span></button>",
                "</div>",
                "</article>"
            ].join("");
        }).join("");

        $("#cardsCotProductosResultados")
            .prop("hidden", !(items || []).length)
            .html(html);
    }

    function renderPartidaCards() {
        const html = state.editor.partidas.map(function (partida, index) {
            const total = computePartidaTotal(partida);
            const unidad = partida.unidadAbreviatura ? (partida.unidadMedida + " (" + partida.unidadAbreviatura + ")") : (partida.unidadMedida || "—");
            const disabled = state.editor.readOnly ? " disabled" : "";
            const thumb = renderProductThumb(partida, partida.nombre || "Partida");

            return [
                "<article class='cot-mobile-card'>",
                "<div class='cot-mobile-card__media'>", thumb, "</div>",
                "<div class='cot-mobile-card__head'>",
                "<div class='cot-mobile-card__eyebrow'>#", escapeHtml(index + 1), "</div>",
                "<div class='cot-mobile-card__title'>", escapeHtml(partida.nombre || "Partida"), "</div>",
                "<div class='cot-mobile-card__subtitle'>Código: ", escapeHtml(partida.codigo || "—"), "</div>",
                "<div class='cot-mobile-card__subtitle'>Unidad: ", escapeHtml(unidad), "</div>",
                "<div class='cot-mobile-card__subtitle'>", escapeHtml(partida.descripcion || ""), "</div>",
                "</div>",
                "<div class='cot-mobile-card__field'>",
                "<label for='txCotPartidaCantidadMobile", index, "'>Cantidad</label>",
                "<input id='txCotPartidaCantidadMobile", index, "' class='form-control cot-partida-input' data-cot-index='", index, "' data-cot-field='cantidad' data-cot-qty='1' type='number' min='0' step='0.01' value='", escapeHtml(partida.cantidad), "'", disabled, " />",
                "</div>",
                "<div class='cot-mobile-card__field'>",
                "<label for='txCotPartidaPrecioMobile", index, "'>Precio</label>",
                "<input id='txCotPartidaPrecioMobile", index, "' class='form-control cot-partida-input' data-cot-index='", index, "' data-cot-field='precioUnitario' data-cot-price='1' type='number' min='0' step='0.01' value='", escapeHtml(partida.precioUnitario), "'", disabled, " />",
                "</div>",
                "<div class='cot-mobile-card__field'>",
                "<label for='txCotPartidaDescuentoMobile", index, "'>Descuento %</label>",
                "<input id='txCotPartidaDescuentoMobile", index, "' class='form-control cot-partida-input' data-cot-index='", index, "' data-cot-field='descuentoPct' data-cot-discount='1' type='number' min='0' max='100' step='0.01' value='", escapeHtml(partida.descuentoPct), "'", disabled, " />",
                "</div>",
                "<div class='cot-mobile-card__total'><span>Total</span><strong>", escapeHtml(formatCurrency(total.total)), "</strong></div>",
                state.editor.readOnly ? "" : "<div class='cot-mobile-card__actions'><button type='button' class='checkapp-btn checkapp-btn-ghost' data-cot-remove='" + index + "' title='Quitar partida' aria-label='Quitar partida'><i class='fa fa-trash'></i><span>Quitar</span></button></div>",
                "</article>"
            ].join("");
        }).join("");

        $("#cardsCotPartidas")
            .prop("hidden", !state.editor.partidas.length)
            .html(html);
    }

    function normalizeClienteItem(item) {
        return {
            id: item.id || item.Id || "",
            nombre: item.nombre || item.Nombre || "",
            telefono: item.telefono || item.Telefono || "",
            correo: item.correo || item.Correo || "",
            empresa: item.empresa || item.Empresa || "",
            descuento: Number(item.descuento || item.Descuento || 0)
        };
    }

    function resolveProductImageUrl(item) {
        const imageUrl = String((item && (item.imagenUrl || item.ImagenUrl || "")) || "").trim();
        return imageUrl || productImagePlaceholder;
    }

    function resolveProductImageName(item) {
        return String((item && (item.imagenNombre || item.ImagenNombre || item.nombre || item.Nombre || "Producto")) || "Producto").trim();
    }

    function renderProductThumb(item, altLabel) {
        const imageUrl = resolveProductImageUrl(item);
        const fallback = escapeHtml(productImagePlaceholder);
        const alt = escapeHtml(altLabel || resolveProductImageName(item));
        return "<span class='cot-grid-thumb'><img src='" + escapeHtml(imageUrl) + "' alt='" + alt + "' loading='lazy' decoding='async' onerror=\"this.onerror=null;this.src='" + fallback + "';\" /></span>";
    }

    function resolveModalApi(selector) {
        const element = document.querySelector(selector);
        if (!element || !window.bootstrap || !window.bootstrap.Modal) {
            return {
                show: function () { },
                hide: function () { }
            };
        }

        return window.bootstrap.Modal.getOrCreateInstance(element);
    }

    function fetchJson(url, options) {
        return window.fetch(url, Object.assign({
            method: "GET",
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        }, options || {})).then(function (response) {
            if (!response.ok) {
                return response.text().then(function (text) {
                    throw new Error(extractErrorMessage(text, response.statusText));
                });
            }

            return response.json();
        });
    }

    function postJson(url, payload) {
        return fetchJson(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify(payload || {})
        });
    }

    function setStatus(selector, tone, message) {
        const $node = $(selector);
        $node.removeClass("is-success is-danger is-info");
        if (!message) {
            $node.text("");
            return;
        }

        if (tone === "success") {
            $node.addClass("is-success");
        } else if (tone === "danger") {
            $node.addClass("is-danger");
        } else {
            $node.addClass("is-info");
        }

        $node.text(message);
    }

    function appendQueryValue(query, key, value) {
        const normalized = String(value == null ? "" : value).trim();
        if (normalized) {
            query.append(key, normalized);
        }
    }

    function setDefaultTodayRange(fromSelector, toSelector) {
        const now = new Date();
        const today = formatDateInput(now);
        $(fromSelector).val(today);
        $(toSelector).val(today);
    }

    function formatDateInput(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return yyyy + "-" + mm + "-" + dd;
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(value || 0));
    }

    function formatNumber(value) {
        return new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(Number(value || 0));
    }

    function formatDateOnly(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("es-MX");
    }

    function toNumber(value) {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
    }

    function toNullableNumber(value) {
        const raw = String(value == null ? "" : value).trim();
        return raw ? toNumber(raw) : null;
    }

    function normalizePhoneDigits(value) {
        return String(value || "").replace(/\D+/g, "");
    }

    function isValidEmail(value) {
        const email = String(value || "").trim();
        return !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function normalizeGuid(value) {
        const normalized = String(value || "").trim();
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)
            ? normalized
            : "";
    }

    function resolveErrorMessage(error) {
        if (!error) {
            return "Ocurrió un error inesperado.";
        }

        return error.message || String(error);
    }

    function extractErrorMessage(text, fallback) {
        if (!text) {
            return fallback || "Ocurrió un error inesperado.";
        }

        try {
            const parsed = JSON.parse(text);
            return parsed.mensaje || parsed.Mensaje || parsed.message || fallback || text;
        } catch (_error) {
            return text;
        }
    }

    function roundMoney(value) {
        return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function cssEscape(value) {
        if (window.CSS && typeof window.CSS.escape === "function") {
            return window.CSS.escape(String(value || ""));
        }

        return String(value || "").replace(/'/g, "\\'");
    }
})(window, document, window.jQuery);
