let permisosActivos = {
    consulta: false,
    crear: false,
    editar: false,
    baja: false,
    exportar: false,
    catalogos: false
};

let activosDetalleCache = new Map();
let tiposDetalleCache = new Map();
let marcasDetalleCache = new Map();
let proveedoresDetalleCache = new Map();
let estadosDetalleCache = new Map();

let activoFormReadOnly = false;
let activosActionMenuOpenId = "";
let activosPageMode = "index";
let activoMultimediaState = {
    fotos: [],
    video: [],
    documentos: []
};
let activoMediaCaptureState = createEmptyActivoMediaCaptureState();
let activoSaveState = createEmptyActivoSaveState();
let activoUploadState = createEmptyActivoUploadState();

const activosValidationLimits = {
    codigo: 64,
    nombre: 200,
    tag: 80,
    numeroSerie: 120,
    descripcion: 500,
    catalogoCodigo: 64,
    catalogoNombre: 160,
    catalogoDescripcion: 400,
    estadoCodigo: 64,
    estadoNombre: 160,
    estadoDescripcion: 400
};

const activosMultimediaLimits = {
    foto: { min: 1, max: 3, maxBytes: 10 * 1024 * 1024, uploadConcurrency: 2 },
    video: { min: 0, max: 1, maxBytes: 200 * 1024 * 1024, uploadConcurrency: 1 },
    documento: { min: 1, max: 3, maxBytes: 25 * 1024 * 1024, uploadConcurrency: 2 }
};

const activosCatalogConfigs = {
    tipo: {
        key: "tipo",
        label: "tipo de activo",
        labelPlural: "tipos de activo",
        gridId: "tipos-grid",
        modalSelector: "#modalTiposActivos",
        infoSelector: "#txInfoTipoActivo",
        idSelector: "#hdTipoActivoId",
        titleSelector: "#txTituloTipoActivo",
        searchSelector: "#txBusquedaTipos",
        statusSelector: "#cbFiltroEstatusTipos",
        loadUrl: "/Activos/GetTiposActivos",
        detailUrl: "/Activos/GetTipoActivo?idTipoActivo=",
        saveUrl: "/Activos/GuardarTipoActivo",
        bajaUrl: "/Activos/BajaTipoActivo",
        activarUrl: "/Activos/ActivarTipoActivo",
        idPayloadKey: "idTipoActivo",
        visibleCountSelector: "#txGridTiposVisibleCount",
        exportButtonSelector: "#btExportarTiposActivos",
        exportSheetName: "TiposActivos",
        exportFilePrefix: "TiposActivos",
        fieldSelectors: {
            codigo: "#txCodigoTipoActivo",
            nombre: "#txNombreTipoActivo",
            descripcion: "#txDescripcionTipoActivo"
        },
        resetCombos: resetCatalogoTipoActivo
    },
    marca: {
        key: "marca",
        label: "marca",
        labelPlural: "marcas",
        gridId: "marcas-grid",
        modalSelector: "#modalMarcasActivos",
        infoSelector: "#txInfoMarcaActivo",
        idSelector: "#hdMarcaActivoId",
        titleSelector: "#txTituloMarcaActivo",
        searchSelector: "#txBusquedaMarcas",
        statusSelector: "#cbFiltroEstatusMarcas",
        loadUrl: "/Activos/GetMarcasActivos",
        detailUrl: "/Activos/GetMarcaActivo?idMarca=",
        saveUrl: "/Activos/GuardarMarcaActivo",
        bajaUrl: "/Activos/BajaMarcaActivo",
        activarUrl: "/Activos/ActivarMarcaActivo",
        idPayloadKey: "idMarca",
        visibleCountSelector: "#txGridMarcasVisibleCount",
        exportButtonSelector: "#btExportarMarcasActivos",
        exportSheetName: "MarcasActivos",
        exportFilePrefix: "MarcasActivos",
        fieldSelectors: {
            codigo: "#txCodigoMarcaActivo",
            nombre: "#txNombreMarcaActivo",
            descripcion: "#txDescripcionMarcaActivo"
        },
        resetCombos: resetCatalogoMarcaActivo
    },
    proveedor: {
        key: "proveedor",
        label: "proveedor",
        labelPlural: "proveedores",
        gridId: "proveedores-grid",
        modalSelector: "#modalProveedoresActivos",
        infoSelector: "#txInfoProveedorActivo",
        idSelector: "#hdProveedorActivoId",
        titleSelector: "#txTituloProveedorActivo",
        searchSelector: "#txBusquedaProveedores",
        statusSelector: "#cbFiltroEstatusProveedores",
        loadUrl: "/Activos/GetProveedoresActivos",
        detailUrl: "/Activos/GetProveedorActivo?idProveedor=",
        saveUrl: "/Activos/GuardarProveedorActivo",
        bajaUrl: "/Activos/BajaProveedorActivo",
        activarUrl: "/Activos/ActivarProveedorActivo",
        idPayloadKey: "idProveedor",
        visibleCountSelector: "#txGridProveedoresVisibleCount",
        exportButtonSelector: "#btExportarProveedoresActivos",
        exportSheetName: "ProveedoresActivos",
        exportFilePrefix: "ProveedoresActivos",
        fieldSelectors: {
            codigo: "#txCodigoProveedorActivo",
            nombre: "#txNombreProveedorActivo",
            descripcion: "#txDescripcionProveedorActivo"
        },
        resetCombos: resetCatalogoProveedorActivo
    }
};

const activosQuickAddConfigs = {
    tipo: {
        key: "tipo",
        modalSelector: "#modalQuickTipoActivo",
        formSelector: "#frmQuickTipoActivo",
        infoSelector: "#txInfoQuickTipoActivo",
        selectSelector: "#cbTipoActivo",
        loadUrl: "/Activos/GetTiposActivos",
        saveUrl: "/Activos/GuardarTipoActivo",
        successMessage: "El tipo de activo fue registrado correctamente.",
        fieldSelectors: {
            codigo: "#txQuickCodigoTipoActivo",
            nombre: "#txQuickNombreTipoActivo",
            descripcion: "#txQuickDescripcionTipoActivo"
        }
    },
    marca: {
        key: "marca",
        modalSelector: "#modalQuickMarcaActivo",
        formSelector: "#frmQuickMarcaActivo",
        infoSelector: "#txInfoQuickMarcaActivo",
        selectSelector: "#cbMarcaActivo",
        loadUrl: "/Activos/GetMarcasActivos",
        saveUrl: "/Activos/GuardarMarcaActivo",
        successMessage: "La marca fue registrada correctamente.",
        fieldSelectors: {
            codigo: "#txQuickCodigoMarcaActivo",
            nombre: "#txQuickNombreMarcaActivo",
            descripcion: "#txQuickDescripcionMarcaActivo"
        }
    },
    proveedor: {
        key: "proveedor",
        modalSelector: "#modalQuickProveedorActivo",
        formSelector: "#frmQuickProveedorActivo",
        infoSelector: "#txInfoQuickProveedorActivo",
        selectSelector: "#cbProveedorActivo",
        loadUrl: "/Activos/GetProveedoresActivos",
        saveUrl: "/Activos/GuardarProveedorActivo",
        successMessage: "El proveedor fue registrado correctamente.",
        fieldSelectors: {
            codigo: "#txQuickCodigoProveedorActivo",
            nombre: "#txQuickNombreProveedorActivo",
            descripcion: "#txQuickDescripcionProveedorActivo"
        }
    },
    estado: {
        key: "estado",
        modalSelector: "#modalQuickEstadoOperativo",
        formSelector: "#frmQuickEstadoOperativo",
        infoSelector: "#txInfoQuickEstadoOperativo",
        selectSelector: "#cbEstadoOperativo",
        loadUrl: "/Activos/GetEstadosOperativos",
        saveUrl: "/Activos/GuardarEstadoOperativo",
        successMessage: "El estado operativo fue registrado correctamente.",
        fieldSelectors: {
            codigo: "#txQuickCodigoEstadoOperativo",
            nombre: "#txQuickNombreEstadoOperativo",
            descripcion: "#txQuickDescripcionEstadoOperativo",
            orden: "#txQuickOrdenEstadoOperativo",
            permiteOperacion: "#chkQuickPermiteOperacionEstado"
        }
    }
};

const activosCatalogGridSelectors = {
    tipo: {
        hostSelector: "#gridTiposHost",
        tableSelector: "#grTiposActivos",
        searchInputSelector: "#txBusquedaGridTipos",
        resultCountSelector: "#txGridTiposCount",
        footerRangeSelector: "#txGridTiposRange",
        footerPageIndicatorSelector: "#txGridTiposPageIndicator",
        footerPrevButtonSelector: "#btGridTiposPrev",
        footerNextButtonSelector: "#btGridTiposNext",
        footerPageSizeSelector: "#txGridTiposPageSize"
    },
    marca: {
        hostSelector: "#gridMarcasHost",
        tableSelector: "#grMarcasActivos",
        searchInputSelector: "#txBusquedaGridMarcas",
        resultCountSelector: "#txGridMarcasCount",
        footerRangeSelector: "#txGridMarcasRange",
        footerPageIndicatorSelector: "#txGridMarcasPageIndicator",
        footerPrevButtonSelector: "#btGridMarcasPrev",
        footerNextButtonSelector: "#btGridMarcasNext",
        footerPageSizeSelector: "#txGridMarcasPageSize"
    },
    proveedor: {
        hostSelector: "#gridProveedoresHost",
        tableSelector: "#grProveedoresActivos",
        searchInputSelector: "#txBusquedaGridProveedores",
        resultCountSelector: "#txGridProveedoresCount",
        footerRangeSelector: "#txGridProveedoresRange",
        footerPageIndicatorSelector: "#txGridProveedoresPageIndicator",
        footerPrevButtonSelector: "#btGridProveedoresPrev",
        footerNextButtonSelector: "#btGridProveedoresNext",
        footerPageSizeSelector: "#txGridProveedoresPageSize"
    }
};

document.addEventListener("DOMContentLoaded", function () {
    activosPageMode = resolveActivosPageMode();
    window.addEventListener("resize", syncOpenActionMenuPosition);
    window.addEventListener("scroll", syncOpenActionMenuPosition, true);

    inicializaPermisosActivos().then(function () {
        configuraEventosActivos();

        if (activosPageMode === "index") {
            inicializaAccordion();
            configuraCombosActivos();
            inicializaGridActivos();
            inicializaCatalogosActivos();
            inicializaGridEstados();
            actualizaResumenFiltros();
            renderActivoMultimediaEditor();
            return;
        }

        inicializaCatalogoStandalone(activosPageMode);
    });
});

function inicializaPermisosActivos() {
    return fetchJson("/Activos/Inicializa")
        .then(function (data) {
            permisosActivos = Object.assign(permisosActivos, data.permisos || {});

            if (!permisosActivos.crear) {
                $("#btNuevoActivo").hide();
            }

            if (!permisosActivos.catalogos) {
                $("#btAbrirTiposActivos").hide();
                $("#btAbrirMarcasActivos").hide();
                $("#btAbrirProveedoresActivos").hide();
                $("#btAbrirEstadosOperativos").hide();
                $(".activos-inline-add").hide();
                $(".activos-catalog-create").hide();
            }

            if (!permisosActivos.exportar) {
                $("#btExportarActivos").hide();
                $("[data-activos-export-button]").hide();
            }
        })
        .catch(function () {
            permisosActivos = {
                consulta: false,
                crear: false,
                editar: false,
                baja: false,
                exportar: false,
                catalogos: false
            };
        });
}

function inicializaAccordion() {
    CheckAppUI.createFilterAccordion({
        id: "activos-filtros",
        selector: "#accordionFiltrosActivos",
        open: true,
        emptySummaryText: "Sin filtros activos"
    });
}

function configuraEventosActivos() {
    $("#btAplicarFiltrosActivos").on("click", function () {
        actualizaResumenFiltros();
        CheckAppUI.reloadGrid("activos-grid");
    });

    $("#btLimpiarFiltrosActivos").on("click", limpiarFiltrosActivos);
    $("#cbFiltroEstatus").on("change", function () {
        actualizaResumenFiltros();
        CheckAppUI.reloadGrid("activos-grid");
    });
    $("#btNuevoActivo").on("click", abrirNuevoActivo);
    $("#btGuardarActivo").on("click", guardarActivo);
    $(document).on("click", "[data-summary-status]", function () {
        $("#cbFiltroEstatus").val($(this).data("summaryStatus") || "");
        actualizaResumenFiltros();
        CheckAppUI.reloadGrid("activos-grid");
    });

    $("#btAbrirTiposActivos").on("click", function () {
        abrirModalCatalogo(activosCatalogConfigs.tipo);
    });

    $("#btAbrirMarcasActivos").on("click", function () {
        abrirModalCatalogo(activosCatalogConfigs.marca);
    });

    $("#btAbrirProveedoresActivos").on("click", function () {
        abrirModalCatalogo(activosCatalogConfigs.proveedor);
    });

    $("#btAbrirEstadosOperativos").on("click", function () {
        if (!permisosActivos.catalogos) {
            return;
        }

        limpiarFormularioEstadoOperativo();
        $("#modalEstadosOperativos").modal("show");
        CheckAppUI.reloadGrid("estados-grid");
    });
    $(document).on("click", "#btQuickAddTipoActivo", function () {
        if (!permisosActivos.catalogos) {
            return;
        }

        abrirModalAltaRapida(activosQuickAddConfigs.tipo);
    });
    $(document).on("click", "#btQuickAddMarcaActivo", function () {
        if (!permisosActivos.catalogos) {
            return;
        }

        abrirModalAltaRapida(activosQuickAddConfigs.marca);
    });
    $(document).on("click", "#btQuickAddProveedorActivo", function () {
        if (!permisosActivos.catalogos) {
            return;
        }

        abrirModalAltaRapida(activosQuickAddConfigs.proveedor);
    });
    $(document).on("click", "#btQuickAddEstadoOperativo", function () {
        if (!permisosActivos.catalogos) {
            return;
        }

        abrirModalAltaRapida(activosQuickAddConfigs.estado);
    });

    $("#btGuardarQuickTipoActivo").on("click", function () { guardarAltaRapidaCatalogo(activosQuickAddConfigs.tipo); });
    $("#btGuardarQuickMarcaActivo").on("click", function () { guardarAltaRapidaCatalogo(activosQuickAddConfigs.marca); });
    $("#btGuardarQuickProveedorActivo").on("click", function () { guardarAltaRapidaCatalogo(activosQuickAddConfigs.proveedor); });
    $("#btGuardarQuickEstadoOperativo").on("click", function () { guardarAltaRapidaCatalogo(activosQuickAddConfigs.estado); });

    $("#btNuevoTipoActivo").on("click", function () { handleCatalogCreateAction(activosCatalogConfigs.tipo); });
    $("#btGuardarTipoActivo").on("click", function () { guardarCatalogo(activosCatalogConfigs.tipo); });
    $("#btCancelarTipoActivo").on("click", function () { handleCatalogCancelAction(activosCatalogConfigs.tipo); });

    $("#btNuevoMarcaActivo").on("click", function () { handleCatalogCreateAction(activosCatalogConfigs.marca); });
    $("#btGuardarMarcaActivo").on("click", function () { guardarCatalogo(activosCatalogConfigs.marca); });
    $("#btCancelarMarcaActivo").on("click", function () { handleCatalogCancelAction(activosCatalogConfigs.marca); });

    $("#btNuevoProveedorActivo").on("click", function () { handleCatalogCreateAction(activosCatalogConfigs.proveedor); });
    $("#btGuardarProveedorActivo").on("click", function () { guardarCatalogo(activosCatalogConfigs.proveedor); });
    $("#btCancelarProveedorActivo").on("click", function () { handleCatalogCancelAction(activosCatalogConfigs.proveedor); });

    $("#btNuevoEstadoOperativo").on("click", handleEstadoOperativoCreateAction);
    $("#btGuardarEstadoOperativo").on("click", guardarEstadoOperativo);
    $("#btCancelarEstadoOperativo").on("click", handleEstadoOperativoCancelAction);

    $("#btTomarFotoActivo").on("click", function () { if (!activoFormReadOnly) { startActivoMediaCapture("foto"); } });
    $("#btElegirFotoActivo").on("click", function () { if (!activoFormReadOnly) { $("#flFotosActivo").trigger("click"); } });
    $("#btGrabarVideoActivo").on("click", function () { if (!activoFormReadOnly) { startActivoMediaCapture("video"); } });
    $("#btElegirVideoActivo").on("click", function () { if (!activoFormReadOnly) { $("#flVideoActivo").trigger("click"); } });
    $("#btAgregarDocumentosActivo").on("click", function () { if (!activoFormReadOnly) { $("#flDocumentosActivo").trigger("click"); } });

    $("#flFotosActivo").on("change", function (event) {
        agregarArchivosActivos("foto", event.target.files);
        event.target.value = "";
    });

    $("#flVideoActivo").on("change", function (event) {
        agregarArchivosActivos("video", event.target.files);
        event.target.value = "";
    });

    $("#flDocumentosActivo").on("change", function (event) {
        agregarArchivosActivos("documento", event.target.files);
        event.target.value = "";
    });

    $("#txBusquedaTipos, #cbFiltroEstatusTipos").on("change keyup", function () {
        CheckAppUI.reloadGrid(activosCatalogConfigs.tipo.gridId);
    });

    $("#txBusquedaMarcas, #cbFiltroEstatusMarcas").on("change keyup", function () {
        CheckAppUI.reloadGrid(activosCatalogConfigs.marca.gridId);
    });

    $("#txBusquedaProveedores, #cbFiltroEstatusProveedores").on("change keyup", function () {
        CheckAppUI.reloadGrid(activosCatalogConfigs.proveedor.gridId);
    });

    $("#txBusquedaEstados, #cbFiltroEstatusEstados").on("change keyup", function () {
        CheckAppUI.reloadGrid("estados-grid");
    });

    $(document).on("click", "[data-catalog-filter-apply]", function () {
        const gridId = ($(this).data("catalogFilterApply") || "").toString();
        if (!gridId) {
            return;
        }

        CheckAppUI.reloadGrid(gridId);
    });

    $(document).on("click", "[data-catalog-filter-clear]", function () {
        clearCatalogPageFilters(($(this).data("catalogFilterClear") || "").toString());
    });

    $(document).on("click", ".js-activos-menu-toggle", function (event) {
        event.preventDefault();
        event.stopPropagation();
        const menuId = $(this).closest(".activos-action-menu").data("menuId") || "";
        activosActionMenuOpenId = activosActionMenuOpenId === menuId ? "" : menuId;
        renderAccionMenus();
    });

    $(document).on("click", function () {
        if (!activosActionMenuOpenId) {
            return;
        }

        activosActionMenuOpenId = "";
        renderAccionMenus();
    });

    $(document).on("keydown", function (event) {
        if (event.key === "Escape") {
            closeOpenStandaloneCatalogModal();
        }
    });

    $(document).on("click", "[data-activos-capture-action='close']", function () {
        closeActivoMediaCapture();
    });

    $(document).on("click", "[data-activos-capture-action='capture-photo']", function () {
        captureActivoPhotoFrame();
    });

    $(document).on("click", "[data-activos-capture-action='start-video']", function () {
        startActivoVideoRecording();
    });

    $(document).on("click", "[data-activos-capture-action='stop-video']", function () {
        stopActivoMediaRecording();
    });

    $(document).on("click", "[data-activos-capture-action='restart']", function () {
        restartActivoMediaCapture();
    });

    $(document).on("click", "[data-activos-capture-action='save']", function () {
        saveActivoMediaCapture();
    });

    $("#modalActivo").on("hide.bs.modal", function (event) {
        if (activoSaveState.isSaving) {
            event.preventDefault();
        }
    });

    $("#modalActivo").on("hidden.bs.modal", function () {
        resetActivoSaveState();
        releaseAllActivoTemporaryUploads();
        cleanupActivoModalResources();
        syncActivoModalCaptureState(false);
    });

    $("#modalMultimediaActivo").on("hidden.bs.modal", function () {
        cleanupActivoViewerResources();
    });

    $(activosCatalogConfigs.tipo.modalSelector).on("hidden.bs.modal", function () {
        if (isStandaloneCatalogPage("tipo")) {
            limpiarFormularioCatalogo(activosCatalogConfigs.tipo);
        }
    });

    $(activosCatalogConfigs.marca.modalSelector).on("hidden.bs.modal", function () {
        if (isStandaloneCatalogPage("marca")) {
            limpiarFormularioCatalogo(activosCatalogConfigs.marca);
        }
    });

    $(activosCatalogConfigs.proveedor.modalSelector).on("hidden.bs.modal", function () {
        if (isStandaloneCatalogPage("proveedor")) {
            limpiarFormularioCatalogo(activosCatalogConfigs.proveedor);
        }
    });

    $("#modalEstadosOperativos").on("hidden.bs.modal", function () {
        if (isStandaloneCatalogPage("estado")) {
            limpiarFormularioEstadoOperativo();
        }
    });

    bindActivosValidationEvents();
}

function bindActivosValidationEvents() {
    $("#frmActivo input, #frmActivo textarea").on("input", function () {
        clearGenericFieldError("#" + this.id, "#txInfoActivo");
    });

    $("#frmActivo select").on("change", function () {
        clearGenericFieldError("#" + this.id, "#txInfoActivo");
    });

    $("#frmTipoActivo input, #frmTipoActivo textarea").on("input", function () {
        clearGenericFieldError("#" + this.id, activosCatalogConfigs.tipo.infoSelector);
    });

    $("#frmMarcaActivo input, #frmMarcaActivo textarea").on("input", function () {
        clearGenericFieldError("#" + this.id, activosCatalogConfigs.marca.infoSelector);
    });

    $("#frmProveedorActivo input, #frmProveedorActivo textarea").on("input", function () {
        clearGenericFieldError("#" + this.id, activosCatalogConfigs.proveedor.infoSelector);
    });

    $("#frmEstadoOperativo input, #frmEstadoOperativo textarea").on("input change", function () {
        clearGenericFieldError("#" + this.id, "#txInfoEstadoOperativo");
    });

    $("#frmQuickTipoActivo input, #frmQuickTipoActivo textarea").on("input", function () {
        clearGenericFieldError("#" + this.id, "#txInfoQuickTipoActivo");
    });

    $("#frmQuickMarcaActivo input, #frmQuickMarcaActivo textarea").on("input", function () {
        clearGenericFieldError("#" + this.id, "#txInfoQuickMarcaActivo");
    });

    $("#frmQuickProveedorActivo input, #frmQuickProveedorActivo textarea").on("input", function () {
        clearGenericFieldError("#" + this.id, "#txInfoQuickProveedorActivo");
    });

    $("#frmQuickEstadoOperativo input, #frmQuickEstadoOperativo textarea").on("input change", function () {
        clearGenericFieldError("#" + this.id, "#txInfoQuickEstadoOperativo");
    });
}

function configuraCombosActivos() {
    $("#cbFiltroTipoActivo").select2(buildSelect2Config("/Activos/GetCatalogoTipos", "Todos"));
    $("#cbFiltroMarcaActivo").select2(buildSelect2Config("/Activos/GetCatalogoMarcas", "Todas"));
    $("#cbFiltroProveedorActivo").select2(buildSelect2Config("/Activos/GetCatalogoProveedores", "Todos"));
    $("#cbFiltroEstadoOperativo").select2(buildSelect2Config("/Activos/GetCatalogoEstados", "Todos"));
    $("#cbFiltroSucursal").select2(buildSelect2Config("/Activos/GetCatalogoSucursales", "Todas"));

    $("#cbTipoActivo").select2(buildSelect2Config("/Activos/GetCatalogoTipos", "Selecciona un tipo", $("#modalActivo")));
    $("#cbMarcaActivo").select2(buildSelect2Config("/Activos/GetCatalogoMarcas", "Selecciona una marca", $("#modalActivo")));
    $("#cbProveedorActivo").select2(buildSelect2Config("/Activos/GetCatalogoProveedores", "Selecciona un proveedor", $("#modalActivo")));
    $("#cbEstadoOperativo").select2(buildSelect2Config("/Activos/GetCatalogoEstados", "Selecciona un estado", $("#modalActivo")));
    $("#cbSucursal").select2(buildSelect2Config("/Activos/GetCatalogoSucursales", "Selecciona una sucursal", $("#modalActivo")));
}

function buildSelect2Config(url, placeholder, dropdownParent) {
    const config = {
        placeholder: placeholder,
        allowClear: true,
        width: "100%",
        minimumInputLength: 0,
        ajax: {
            url: url,
            dataType: "json",
            delay: 150,
            data: function (params) {
                return {
                    searchTerm: params.term || ""
                };
            },
            processResults: function (data) {
                return {
                    results: data.d || []
                };
            }
        }
    };

    if (dropdownParent) {
        config.dropdownParent = dropdownParent;
    }

    return config;
}

function inicializaGridActivos() {
    CheckAppUI.createDynamicGrid({
        id: "activos-grid",
        hostSelector: "#gridActivosHost",
        tableSelector: "#grActivos",
        searchInputSelector: "#txBusquedaGridActivos",
        exportButtonSelector: "#btExportarActivos",
        columnToggleButtonSelector: "#btColumnasActivos",
        columnTogglePanelSelector: "#panelColumnasActivos",
        resultCountSelector: "#txGridActivosCount",
        footerRangeSelector: "#txGridActivosRange",
        footerPageIndicatorSelector: "#txGridActivosPageIndicator",
        footerPrevButtonSelector: "#btGridActivosPrev",
        footerNextButtonSelector: "#btGridActivosNext",
        footerPageSizeSelector: "#txGridActivosPageSize",
        pageLength: 25,
        lengthMenu: [[25, 50, 100], [25, 50, 100]],
        order: [[2, "asc"]],
        exportSheetName: "Activos",
        exportFileName: function () {
            return "Activos_" + formatDateForFile(new Date()) + ".xlsx";
        },
        loadData: function () {
            const query = new URLSearchParams({
                busqueda: $("#txBusquedaActivos").val() || "",
                idTipoActivo: $("#cbFiltroTipoActivo").val() || "",
                idMarca: $("#cbFiltroMarcaActivo").val() || "",
                idProveedor: $("#cbFiltroProveedorActivo").val() || "",
                idEstadoOperativo: $("#cbFiltroEstadoOperativo").val() || "",
                idSucursal: $("#cbFiltroSucursal").val() || "",
                estatus: $("#cbFiltroEstatus").val() || ""
            });

            return fetchJson("/Activos/GetListado?" + query.toString())
                .then(function (data) {
                    const items = data.items || [];
                    activosDetalleCache = new Map(items.map(function (item) { return [item.id, item]; }));
                    return items;
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
                    return buildAccionesActivo(row);
                }
            },
            { key: "codigo", title: "Código" },
            { key: "nombre", title: "Nombre" },
            { key: "tipoActivo", title: "Tipo" },
            { key: "marca", title: "Marca" },
            { key: "proveedor", title: "Proveedor" },
            { key: "estadoOperativo", title: "Estado" },
            { key: "sucursal", title: "Sucursal" },
            {
                key: "cantidadFotos",
                title: "Fotos",
                exportValue: function (value) {
                    return value || 0;
                },
                render: function (value) {
                    return renderIndicadorConteo(value || 0, "Fotos");
                }
            },
            {
                key: "cantidadVideos",
                title: "Video",
                exportValue: function (value) {
                    return value || 0;
                },
                render: function (value) {
                    return renderIndicadorConteo(value || 0, "Video");
                }
            },
            {
                key: "cantidadDocumentos",
                title: "Documentos",
                exportValue: function (value) {
                    return value || 0;
                },
                render: function (value) {
                    return renderIndicadorConteo(value || 0, "Documentos");
                }
            },
            { key: "tag", title: "Tag" },
            { key: "numeroSerie", title: "Número de serie" },
            {
                key: "activo",
                title: "Estatus",
                exportValue: function (value, row) {
                    if (value) {
                        return "Activo";
                    }

                    return row.fechaArchivado
                        ? "Baja lógica " + formatDisplayDate(row.fechaArchivado)
                        : "Baja lógica";
                },
                render: function (value, row) {
                    if (value) {
                        return "<span class='checkapp-badge checkapp-badge-success'>Activo</span>";
                    }

                    const fecha = row.fechaArchivado ? "<small>" + escapeHtmlActivos(formatDisplayDate(row.fechaArchivado)) + "</small>" : "";
                    return "<span class='checkapp-badge checkapp-badge-muted'>Baja lógica</span>" + fecha;
                }
            },
            {
                key: "fechaActualizacion",
                title: "Actualización",
                exportValue: function (value) {
                    return formatDisplayDate(value);
                },
                render: function (value) {
                    return formatDisplayDate(value);
                }
            }
        ],
        onLoaded: function (rows) {
            actualizaResumenActivos(rows);
            $("#txGridActivosVisibleCount").text(rows.length + " visibles");
            renderAccionMenus();
        },
        emptyText: "No hay activos para los filtros aplicados."
    });
}

function inicializaCatalogosActivos() {
    inicializaGridCatalogo(activosCatalogConfigs.tipo, activosCatalogGridSelectors.tipo);
    inicializaGridCatalogo(activosCatalogConfigs.marca, activosCatalogGridSelectors.marca);
    inicializaGridCatalogo(activosCatalogConfigs.proveedor, activosCatalogGridSelectors.proveedor);
}

function inicializaGridCatalogo(config, selectors) {
    CheckAppUI.createDynamicGrid({
        id: config.gridId,
        hostSelector: selectors.hostSelector,
        tableSelector: selectors.tableSelector,
        searchInputSelector: selectors.searchInputSelector,
        exportButtonSelector: config.exportButtonSelector,
        resultCountSelector: selectors.resultCountSelector,
        footerRangeSelector: selectors.footerRangeSelector,
        footerPageIndicatorSelector: selectors.footerPageIndicatorSelector,
        footerPrevButtonSelector: selectors.footerPrevButtonSelector,
        footerNextButtonSelector: selectors.footerNextButtonSelector,
        footerPageSizeSelector: selectors.footerPageSizeSelector,
        pageLength: 25,
        lengthMenu: [[25, 50, 100], [25, 50, 100]],
        order: [[2, "asc"]],
        exportSheetName: config.exportSheetName,
        exportFileName: function () {
            return config.exportFilePrefix + "_" + formatDateForFile(new Date()) + ".xlsx";
        },
        loadData: function () {
            const query = new URLSearchParams({
                busqueda: $(config.searchSelector).val() || "",
                estatus: $(config.statusSelector).val() || ""
            });

            return fetchJson(config.loadUrl + "?" + query.toString())
                .then(function (data) {
                    const items = data.items || [];
                    setCatalogCache(config.key, items);
                    return items;
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
                    return buildAccionesCatalogo(config, row);
                }
            },
            { key: "codigo", title: "Código" },
            { key: "nombre", title: "Nombre" },
            { key: "descripcion", title: "Descripción" },
            {
                key: "activo",
                title: "Estatus",
                exportValue: function (value) {
                    return value ? "Activo" : "Inactivo";
                },
                render: function (value) {
                    return value
                        ? "<span class='checkapp-badge checkapp-badge-success'>Activo</span>"
                        : "<span class='checkapp-badge checkapp-badge-muted'>Inactivo</span>";
                }
            },
            {
                key: "fechaActualizacion",
                title: "Actualización",
                exportValue: function (value) {
                    return formatDisplayDate(value);
                },
                render: function (value) {
                    return formatDisplayDate(value);
                }
            }
        ],
        onLoaded: function (rows) {
            $(config.visibleCountSelector).text(rows.length + " visibles");
        },
        emptyText: "No hay " + config.labelPlural + " disponibles."
    });
}

function inicializaGridEstados() {
    CheckAppUI.createDynamicGrid({
        id: "estados-grid",
        hostSelector: "#gridEstadosHost",
        tableSelector: "#grEstadosOperativos",
        searchInputSelector: "#txBusquedaGridEstados",
        exportButtonSelector: "#btExportarEstadosOperativos",
        resultCountSelector: "#txGridEstadosCount",
        footerRangeSelector: "#txGridEstadosRange",
        footerPageIndicatorSelector: "#txGridEstadosPageIndicator",
        footerPrevButtonSelector: "#btGridEstadosPrev",
        footerNextButtonSelector: "#btGridEstadosNext",
        footerPageSizeSelector: "#txGridEstadosPageSize",
        pageLength: 25,
        lengthMenu: [[25, 50, 100], [25, 50, 100]],
        order: [[5, "asc"], [2, "asc"]],
        exportSheetName: "EstadosOperativos",
        exportFileName: function () {
            return "EstadosOperativos_" + formatDateForFile(new Date()) + ".xlsx";
        },
        loadData: function () {
            const query = new URLSearchParams({
                busqueda: $("#txBusquedaEstados").val() || "",
                estatus: $("#cbFiltroEstatusEstados").val() || ""
            });

            return fetchJson("/Activos/GetEstadosOperativos?" + query.toString())
                .then(function (data) {
                    const items = data.items || [];
                    estadosDetalleCache = new Map(items.map(function (item) { return [item.id, item]; }));
                    return items;
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
                    return buildAccionesEstado(row);
                }
            },
            { key: "codigo", title: "Código" },
            { key: "nombre", title: "Nombre" },
            { key: "descripcion", title: "Descripción" },
            {
                key: "permiteOperacion",
                title: "Permite operación",
                exportValue: function (value) {
                    return value ? "Sí" : "No";
                },
                render: function (value) {
                    return value
                        ? "<span class='checkapp-badge checkapp-badge-success'>Sí</span>"
                        : "<span class='checkapp-badge checkapp-badge-muted'>No</span>";
                }
            },
            { key: "orden", title: "Orden" },
            {
                key: "activo",
                title: "Estatus",
                exportValue: function (value) {
                    return value ? "Activo" : "Inactivo";
                },
                render: function (value) {
                    return value
                        ? "<span class='checkapp-badge checkapp-badge-success'>Activo</span>"
                        : "<span class='checkapp-badge checkapp-badge-muted'>Inactivo</span>";
                }
            },
            {
                key: "fechaActualizacion",
                title: "Actualización",
                exportValue: function (value) {
                    return formatDisplayDate(value);
                },
                render: function (value) {
                    return formatDisplayDate(value);
                }
            }
        ],
        onLoaded: function (rows) {
            $("#txGridEstadosVisibleCount").text(rows.length + " visibles");
        },
        emptyText: "No hay estados operativos disponibles."
    });
}

function resolveActivosPageMode() {
    const pageNode = document.querySelector("[data-activos-page]");
    const pageMode = pageNode ? String(pageNode.getAttribute("data-activos-page") || "").trim().toLowerCase() : "";
    if (pageMode) {
        return pageMode;
    }

    const pathname = (window.location && window.location.pathname ? window.location.pathname : "").toLowerCase();
    switch (pathname) {
        case "/activos/tipos":
            return "tipos";
        case "/activos/marcas":
            return "marcas";
        case "/activos/proveedores":
            return "proveedores";
        case "/activos/estadosoperativos":
            return "estadosoperativos";
        default:
            return "index";
    }
}

function inicializaCatalogoStandalone(pageMode) {
    switch (pageMode) {
        case "tipos":
            inicializaGridCatalogo(activosCatalogConfigs.tipo, activosCatalogGridSelectors.tipo);
            break;
        case "marcas":
            inicializaGridCatalogo(activosCatalogConfigs.marca, activosCatalogGridSelectors.marca);
            break;
        case "proveedores":
            inicializaGridCatalogo(activosCatalogConfigs.proveedor, activosCatalogGridSelectors.proveedor);
            break;
        case "estadosoperativos":
            inicializaGridEstados();
            break;
        default:
            break;
    }
}

function isStandaloneCatalogPage(catalogKey) {
    const normalizedKey = (catalogKey || "").toString().trim().toLowerCase();
    switch (normalizedKey) {
        case "tipo":
            return activosPageMode === "tipos";
        case "marca":
            return activosPageMode === "marcas";
        case "proveedor":
            return activosPageMode === "proveedores";
        case "estado":
            return activosPageMode === "estadosoperativos";
        default:
            return false;
    }
}

function openStandaloneCatalogModal(selector) {
    const modalApi = resolveModalApi(selector);
    if (!modalApi) {
        return;
    }

    modalApi.show();
}

function closeStandaloneCatalogModal(selector) {
    const modalApi = resolveModalApi(selector);
    if (!modalApi) {
        return;
    }

    modalApi.hide();
}

function resolveModalApi(selector) {
    if (!selector) {
        return null;
    }

    const modalNode = document.querySelector(selector);
    if (!modalNode) {
        return null;
    }

    if (isStandaloneCatalogModalSelector(selector)) {
        return createStandaloneCatalogModalApi(modalNode);
    }

    if (window.bootstrap && window.bootstrap.Modal) {
        return window.bootstrap.Modal.getOrCreateInstance(modalNode);
    }

    if (typeof window.$ === "function" && window.$.fn && typeof window.$.fn.modal === "function") {
        return {
            show: function () { window.$(selector).modal("show"); },
            hide: function () { window.$(selector).modal("hide"); }
        };
    }

    return createStandaloneCatalogModalApi(modalNode);
}

function isStandaloneCatalogModalSelector(selector) {
    return [
        "#modalTiposActivos",
        "#modalMarcasActivos",
        "#modalProveedoresActivos",
        "#modalEstadosOperativos"
    ].indexOf(selector) >= 0;
}

function createStandaloneCatalogModalApi(modalNode) {
    return {
        show: function () {
            modalNode.style.display = "block";
            modalNode.classList.add("show");
            modalNode.removeAttribute("aria-hidden");
            modalNode.setAttribute("aria-modal", "true");
            document.body.classList.add("modal-open");

            let backdrop = document.querySelector(".modal-backdrop.activos-standalone-backdrop");
            if (!backdrop) {
                backdrop = document.createElement("div");
                backdrop.className = "modal-backdrop fade show activos-standalone-backdrop";
                backdrop.addEventListener("click", function () {
                    closeOpenStandaloneCatalogModal();
                });
                document.body.appendChild(backdrop);
            }
        },
        hide: function () {
            modalNode.style.display = "none";
            modalNode.classList.remove("show");
            modalNode.setAttribute("aria-hidden", "true");
            modalNode.removeAttribute("aria-modal");
            document.body.classList.remove("modal-open");
            document.querySelectorAll(".modal-backdrop.activos-standalone-backdrop").forEach(function (backdrop) {
                backdrop.remove();
            });
            modalNode.dispatchEvent(new Event("hidden.bs.modal"));
        }
    };
}

function closeOpenStandaloneCatalogModal() {
    const openModal = document.querySelector(".activos-standalone-catalog-modal.show");
    if (!openModal || !openModal.id) {
        return;
    }

    closeStandaloneCatalogModal("#" + openModal.id);
}

function abrirCatalogoStandalone(tipo) {
    const config = activosCatalogConfigs[(tipo || "").toString().trim().toLowerCase()];
    if (!config) {
        return;
    }

    handleCatalogCreateAction(config);
}

function cerrarCatalogoStandalone(tipo) {
    const normalizedKey = (tipo || "").toString().trim().toLowerCase();
    if (normalizedKey === "estado") {
        handleEstadoOperativoCancelAction();
        return;
    }

    const config = activosCatalogConfigs[normalizedKey];
    if (!config) {
        return;
    }

    handleCatalogCancelAction(config);
}

function handleCatalogCreateAction(config) {
    limpiarFormularioCatalogo(config);
    if (isStandaloneCatalogPage(config.key)) {
        openStandaloneCatalogModal(config.modalSelector);
    }
}

function handleCatalogCancelAction(config) {
    if (isStandaloneCatalogPage(config.key)) {
        closeStandaloneCatalogModal(config.modalSelector);
        return;
    }

    limpiarFormularioCatalogo(config);
}

function handleEstadoOperativoCreateAction() {
    limpiarFormularioEstadoOperativo();
    if (isStandaloneCatalogPage("estado")) {
        openStandaloneCatalogModal("#modalEstadosOperativos");
    }
}

function handleEstadoOperativoCancelAction() {
    if (isStandaloneCatalogPage("estado")) {
        closeStandaloneCatalogModal("#modalEstadosOperativos");
        return;
    }

    limpiarFormularioEstadoOperativo();
}

function clearCatalogPageFilters(catalogKey) {
    const normalizedKey = (catalogKey || "").toString().trim().toLowerCase();
    if (!normalizedKey) {
        return;
    }

    if (normalizedKey === "estado") {
        $("#txBusquedaEstados").val("");
        $("#cbFiltroEstatusEstados").val("");
        CheckAppUI.reloadGrid("estados-grid");
        return;
    }

    const config = activosCatalogConfigs[normalizedKey];
    if (!config) {
        return;
    }

    $(config.searchSelector).val("");
    $(config.statusSelector).val("");
    CheckAppUI.reloadGrid(config.gridId);
}

window.abrirCatalogoStandalone = abrirCatalogoStandalone;
window.cerrarCatalogoStandalone = cerrarCatalogoStandalone;
window.abrirEstadoOperativoStandalone = handleEstadoOperativoCreateAction;
window.cerrarEstadoOperativoStandalone = handleEstadoOperativoCancelAction;

function actualizaResumenActivos(rows) {
    const activos = rows.filter(function (item) { return item.activo; }).length;
    const inactivos = rows.length - activos;
    $("#txResumenTotal").text(rows.length);
    $("#txResumenActivos").text(activos);
    $("#txResumenInactivos").text(inactivos);
}

function actualizaResumenFiltros() {
    const partes = [];
    const busqueda = ($("#txBusquedaActivos").val() || "").trim();
    const tipo = $("#cbFiltroTipoActivo").find("option:selected").text();
    const marca = $("#cbFiltroMarcaActivo").find("option:selected").text();
    const proveedor = $("#cbFiltroProveedorActivo").find("option:selected").text();
    const estado = $("#cbFiltroEstadoOperativo").find("option:selected").text();
    const sucursal = $("#cbFiltroSucursal").find("option:selected").text();
    const estatus = $("#cbFiltroEstatus").find("option:selected").text();

    if (busqueda) partes.push("<span class='ca-chip ca-chip--primary'>Búsqueda: " + escapeHtmlActivos(busqueda) + "</span>");
    if ($("#cbFiltroTipoActivo").val()) partes.push("<span class='ca-chip ca-chip--secondary'>Tipo: " + escapeHtmlActivos(tipo) + "</span>");
    if ($("#cbFiltroMarcaActivo").val()) partes.push("<span class='ca-chip ca-chip--secondary'>Marca: " + escapeHtmlActivos(marca) + "</span>");
    if ($("#cbFiltroProveedorActivo").val()) partes.push("<span class='ca-chip ca-chip--secondary'>Proveedor: " + escapeHtmlActivos(proveedor) + "</span>");
    if ($("#cbFiltroEstadoOperativo").val()) partes.push("<span class='ca-chip ca-chip--secondary'>Estado: " + escapeHtmlActivos(estado) + "</span>");
    if ($("#cbFiltroSucursal").val()) partes.push("<span class='ca-chip ca-chip--secondary'>Sucursal: " + escapeHtmlActivos(sucursal) + "</span>");
    if ($("#cbFiltroEstatus").val()) partes.push("<span class='ca-chip ca-chip--secondary'>Estatus: " + escapeHtmlActivos(estatus) + "</span>");

    const accordion = CheckAppUI.getAccordion("activos-filtros");
    if (accordion) {
        accordion.setSummaryHtml(partes.length ? "<span class='checkapp-summary-inline'>" + partes.join("") + "</span>" : "Sin filtros activos");
    }
}

function limpiarFiltrosActivos() {
    $("#txBusquedaActivos").val("");
    $("#cbFiltroTipoActivo").val(null).trigger("change");
    $("#cbFiltroMarcaActivo").val(null).trigger("change");
    $("#cbFiltroProveedorActivo").val(null).trigger("change");
    $("#cbFiltroEstadoOperativo").val(null).trigger("change");
    $("#cbFiltroSucursal").val(null).trigger("change");
    $("#cbFiltroEstatus").val("");
    actualizaResumenFiltros();
    CheckAppUI.reloadGrid("activos-grid");
}

function buildAccionesActivo(row) {
    const menuId = "activo-" + row.id;
    const acciones = [
        buildMenuItem("Ver", "fa fa-eye", "verActivo('" + escapeJsValue(row.id) + "')")
    ];

    if (row.cantidadFotos > 0 || row.cantidadVideos > 0 || row.cantidadDocumentos > 0) {
        acciones.push(buildMenuItem("Ver multimedia", "fa fa-photo", "verMultimediaActivo('" + escapeJsValue(row.id) + "')"));
    } else {
        acciones.push(buildMenuItem("Ver multimedia", "fa fa-photo", "verMultimediaActivo('" + escapeJsValue(row.id) + "')"));
    }

    if (permisosActivos.editar && row.activo) {
        acciones.push(buildMenuItem("Editar", "fa fa-edit", "editarActivo('" + escapeJsValue(row.id) + "')"));
    }

    if (permisosActivos.baja && row.activo) {
        acciones.push(buildMenuItem("Baja lógica", "fa fa-ban", "confirmarBajaActivo('" + escapeJsValue(row.id) + "')", true));
    }

    return buildActionMenu(menuId, acciones);
}

function buildAccionesCatalogo(config, row) {
    const acciones = [
        buildInlineAction("Editar", "fa fa-edit", "editarCatalogo('" + config.key + "','" + escapeJsValue(row.id) + "')")
    ];

    if (row.activo) {
        acciones.push(buildInlineAction("Dar de baja", "fa fa-ban", "confirmarCambioCatalogo('" + config.key + "','" + escapeJsValue(row.id) + "',false)", true));
    } else {
        acciones.push(buildInlineAction("Activar", "fa fa-check", "confirmarCambioCatalogo('" + config.key + "','" + escapeJsValue(row.id) + "',true)"));
    }

    return "<div class='checkapp-action-list'>" + acciones.join("") + "</div>";
}

function buildAccionesEstado(row) {
    const acciones = [
        buildInlineAction("Editar", "fa fa-edit", "editarEstadoOperativo('" + escapeJsValue(row.id) + "')")
    ];

    if (row.activo) {
        acciones.push(buildInlineAction("Dar de baja", "fa fa-ban", "confirmarBajaEstadoOperativo('" + escapeJsValue(row.id) + "')", true));
    } else {
        acciones.push(buildInlineAction("Activar", "fa fa-check", "activarEstadoOperativo('" + escapeJsValue(row.id) + "')"));
    }

    return "<div class='checkapp-action-list'>" + acciones.join("") + "</div>";
}

function buildActionMenu(menuId, acciones) {
    const abierto = activosActionMenuOpenId === menuId ? " is-open" : "";
    return "" +
        "<div class='activos-action-menu" + abierto + "' data-menu-id='" + escapeHtmlActivos(menuId) + "'>" +
        "  <button type='button' class='checkapp-btn checkapp-btn-ghost js-activos-menu-toggle'>" +
        "    <i class='fa fa-ellipsis-v'></i><span>Acciones</span>" +
        "  </button>" +
        "  <div class='activos-action-menu-list'>" + acciones.join("") + "</div>" +
        "</div>";
}

function buildMenuItem(label, iconClass, onclick, danger) {
    return "" +
        "<button type='button' class='activos-action-menu-item" + (danger ? " is-danger" : "") + "' onclick=\"" + onclick + "\">" +
        "  <i class='" + iconClass + "'></i><span>" + escapeHtmlActivos(label) + "</span>" +
        "</button>";
}

function buildInlineAction(label, iconClass, onclick, danger) {
    return "<a href='javascript:void(0)' class='" + (danger ? "is-danger" : "") + "' onclick=\"" + onclick + "\" title='" + escapeHtmlActivos(label) + "'><i class='" + iconClass + "'></i></a>";
}

function renderAccionMenus() {
    $(".activos-action-menu").each(function () {
        const isOpen = ($(this).data("menuId") || "") === activosActionMenuOpenId;
        $(this).toggleClass("is-open", isOpen);
        $(this).find(".activos-action-menu-list").toggleClass("is-upward", false).removeAttr("style");
    });

    syncOpenActionMenuPosition();
}

function syncOpenActionMenuPosition() {
    if (!activosActionMenuOpenId) {
        return;
    }

    const host = $(".activos-action-menu.is-open").first();
    if (!host.length) {
        return;
    }

    const trigger = host.find(".js-activos-menu-toggle").first();
    const menu = host.find(".activos-action-menu-list").first();
    if (!trigger.length || !menu.length) {
        return;
    }

    const triggerRect = trigger[0].getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const menuWidth = Math.max(menu.outerWidth() || 0, trigger.outerWidth() || 0, 208);
    const menuHeight = menu.outerHeight() || 0;
    const margin = 12;
    const openUpward = menuHeight > 0 && (triggerRect.bottom + menuHeight + margin > viewportHeight) && triggerRect.top > menuHeight;

    let left = triggerRect.right - menuWidth;
    if (left < margin) {
        left = margin;
    }

    if ((left + menuWidth + margin) > viewportWidth) {
        left = Math.max(margin, viewportWidth - menuWidth - margin);
    }

    const top = openUpward
        ? Math.max(margin, triggerRect.top - menuHeight - 6)
        : Math.min(viewportHeight - margin, triggerRect.bottom + 6);

    menu
        .toggleClass("is-upward", openUpward)
        .css({
            left: left + "px",
            top: top + "px",
            minWidth: menuWidth + "px"
        });
}

function abrirNuevoActivo() {
    if (!permisosActivos.crear) {
        mensajeErrorActivos("No tienes permiso para registrar activos.");
        return;
    }

    limpiarFormularioActivo();
    activoFormReadOnly = false;
    $("#txModalActivoKicker").text("Registro");
    $("#txModalActivoTitulo").text("Nuevo activo");
    $("#btGuardarActivo").show();
    habilitaFormularioActivo(true);
    $("#modalActivo").modal("show");
}

function limpiarFormularioActivo() {
    $("#frmActivo")[0].reset();
    $("#hdActivoId").val("");
    $("#txInfoActivo").removeClass("is-danger is-success").text("");
    $("#cbTipoActivo").val(null).trigger("change");
    $("#cbMarcaActivo").val(null).trigger("change");
    $("#cbProveedorActivo").val(null).trigger("change");
    $("#cbEstadoOperativo").val(null).trigger("change");
    $("#cbSucursal").val(null).trigger("change");
    activoFormReadOnly = false;
    clearActivoValidationState();
    resetActivoMultimediaState();
    resetActivoUploadState();
    closeActivoMediaCapture(false);
    renderActivoMultimediaEditor();
}

function habilitaFormularioActivo(habilitado) {
    $("#frmActivo").find("input, textarea, select").prop("disabled", !habilitado);
    $("#btGuardarActivo").prop("disabled", !habilitado);
    $("#btTomarFotoActivo, #btElegirFotoActivo, #btGrabarVideoActivo, #btElegirVideoActivo, #btAgregarDocumentosActivo").prop("disabled", !habilitado);
    renderActivoMultimediaEditor();
    renderActivoMediaCaptureOverlay();
}

function verActivo(idActivo) {
    cargarActivo(idActivo, true);
}

function editarActivo(idActivo) {
    if (!permisosActivos.editar) {
        mensajeErrorActivos("No tienes permiso para editar activos.");
        return;
    }

    cargarActivo(idActivo, false);
}

function cargarActivo(idActivo, soloLectura) {
    fetchJson("/Activos/GetActivo?idActivo=" + encodeURIComponent(idActivo))
        .then(function (data) {
            if (!data.d) {
                throw new Error("No fue posible cargar el activo.");
            }

            const item = data.d;
            limpiarFormularioActivo();
            $("#hdActivoId").val(item.id || "");
            $("#txCodigoActivo").val(item.codigo || "");
            $("#txNombreActivo").val(item.nombre || "");
            setSelect2Value("#cbTipoActivo", item.idTipoActivo, item.tipoActivo);
            setSelect2Value("#cbMarcaActivo", item.idMarca, item.marca);
            setSelect2Value("#cbProveedorActivo", item.idProveedor, item.proveedor);
            setSelect2Value("#cbEstadoOperativo", item.idEstadoOperativo, item.estadoOperativo);
            setSelect2Value("#cbSucursal", item.idSucursal, item.sucursal);
            $("#txTagActivo").val(item.tag || "");
            $("#txNumeroSerieActivo").val(item.numeroSerie || "");
            $("#txDescripcionActivo").val(item.descripcion || "");
            hydrateActivoMultimediaFromServer(item.multimedia || []);
            $("#txInfoActivo")
                .removeClass("is-danger")
                .addClass("is-success")
                .text("Creado el " + formatDisplayDate(item.fechaCreacion) + " · Actualizado el " + formatDisplayDate(item.fechaActualizacion));

            activoFormReadOnly = soloLectura;
            if (soloLectura) {
                $("#txModalActivoKicker").text("Consulta");
                $("#txModalActivoTitulo").text("Detalle de activo");
                $("#btGuardarActivo").hide();
                habilitaFormularioActivo(false);
            } else {
                $("#txModalActivoKicker").text("Edición");
                $("#txModalActivoTitulo").text("Editar activo");
                $("#btGuardarActivo").show();
                habilitaFormularioActivo(true);
            }

            $("#modalActivo").modal("show");
        })
        .catch(function (error) {
            mensajeErrorActivos(error && error.message ? error.message : "No fue posible cargar el activo.");
        });
}

function guardarActivo() {
    if (activoSaveState.isSaving) {
        return;
    }

    beginActivoSaveProgress(["Validando multimedia...", "Confirmando cargas temporales...", "Guardando información del activo..."]);

    ensureActivoUploadsCompleted()
        .then(function () {
            const payload = {
                id: $("#hdActivoId").val(),
                codigo: ($("#txCodigoActivo").val() || "").trim(),
                nombre: ($("#txNombreActivo").val() || "").trim(),
                idTipoActivo: $("#cbTipoActivo").val() || "",
                idMarca: $("#cbMarcaActivo").val() || "",
                idProveedor: $("#cbProveedorActivo").val() || "",
                idEstadoOperativo: $("#cbEstadoOperativo").val() || "",
                idSucursal: $("#cbSucursal").val() || "",
                tag: ($("#txTagActivo").val() || "").trim(),
                numeroSerie: ($("#txNumeroSerieActivo").val() || "").trim(),
                descripcion: ($("#txDescripcionActivo").val() || "").trim(),
                multimedia: buildActivoMultimediaPayload()
            };

            const validation = validateActivoPayload(payload);
            if (validation) {
                throw validation;
            }

            beginActivoSaveProgress(buildActivoSaveProgressMessages(payload));
            return fetchJson("/Activos/GuardarActivo", {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify(payload)
            });
        })
        .then(function (data) {
            const message = data.d || "";
            if (!/^El activo fue /.test(message)) {
                throw new Error(message || "No fue posible guardar el activo.");
            }

            finishActivoSaveProgress();
            $("#modalActivo").modal("hide");
            mensajeOkActivos(message);
            CheckAppUI.reloadGrid("activos-grid");
        })
        .catch(function (error) {
            if (error && error.selector && error.message) {
                failActivoSaveProgress();
                showActivoValidation(error.selector, error.message);
                return;
            }

            console.error("[Activos][GuardarActivo]", error);
            failActivoSaveProgress();
            mensajeErrorActivos(resolveActivoSaveErrorMessage(error && error.message ? error.message : ""));
        });
}

function confirmarBajaActivo(idActivo) {
    Swal.fire({
        title: "¿Deseas dar de baja este activo?",
        text: "La baja será lógica y conservará el historial del registro.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Dar de baja",
        cancelButtonText: "Cancelar"
    }).then(function (result) {
        if (!result.isConfirmed) {
            return;
        }

        fetchJson("/Activos/BajaActivo", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({ idActivo: idActivo })
        })
            .then(function (data) {
                mensajeOkActivos(data.d || "El activo fue dado de baja.");
                CheckAppUI.reloadGrid("activos-grid");
            })
            .catch(function () {
                mensajeErrorActivos("No fue posible dar de baja el activo.");
            });
    });
}

function verMultimediaActivo(idActivo) {
    fetchJson("/Activos/GetActivo?idActivo=" + encodeURIComponent(idActivo))
        .then(function (data) {
            if (!data.d) {
                throw new Error("No fue posible cargar la multimedia del activo.");
            }

            const multimedia = data.d.multimedia || [];
            renderVisorMultimedia(multimedia);
            $("#modalMultimediaActivo").modal("show");
        })
        .catch(function (error) {
            mensajeErrorActivos(error && error.message ? error.message : "No fue posible cargar la multimedia del activo.");
        });
}

function abrirModalCatalogo(config) {
    if (!permisosActivos.catalogos) {
        return;
    }

    limpiarFormularioCatalogo(config);
    $(config.modalSelector).modal("show");
    CheckAppUI.reloadGrid(config.gridId);
}

function abrirModalAltaRapida(config) {
    if (!config || !permisosActivos.catalogos) {
        return;
    }

    limpiarFormularioAltaRapida(config);
    $(config.modalSelector).modal("show");
}

function limpiarFormularioAltaRapida(config) {
    if (!config) {
        return;
    }

    const form = $(config.formSelector).get(0);
    if (form) {
        form.reset();
    }

    $(config.infoSelector).removeClass("is-danger is-success").text("");
    if (config.fieldSelectors && config.fieldSelectors.codigo) {
        $(config.fieldSelectors.codigo).prop("readonly", true).attr("placeholder", "Se generará automáticamente");
    }

    Object.keys(config.fieldSelectors || {}).forEach(function (key) {
        clearGenericFieldError(config.fieldSelectors[key], config.infoSelector);
    });
}

function limpiarFormularioCatalogo(config) {
    const fieldSelectors = config.fieldSelectors;
    $(config.idSelector).val("");
    $(fieldSelectors.codigo).val("");
    $(fieldSelectors.codigo).prop("readonly", true).attr("placeholder", "Se generará automáticamente");
    $(fieldSelectors.nombre).val("");
    $(fieldSelectors.descripcion).val("");
    $(config.titleSelector).text(buildCatalogCreateTitle(config.label));
    $(config.infoSelector).removeClass("is-danger is-success").text("");
    clearGenericFieldError(fieldSelectors.codigo, config.infoSelector);
    clearGenericFieldError(fieldSelectors.nombre, config.infoSelector);
    clearGenericFieldError(fieldSelectors.descripcion, config.infoSelector);
}

function buildCatalogCreateTitle(label) {
    if (label === "marca") {
        return "Nueva marca";
    }

    return "Nuevo " + label;
}

function editarCatalogo(tipo, id) {
    const config = activosCatalogConfigs[tipo];
    if (!config) {
        return;
    }

    fetchJson(config.detailUrl + encodeURIComponent(id))
        .then(function (data) {
            if (!data.d) {
                throw new Error("No fue posible cargar el " + config.label + ".");
            }

            $(config.idSelector).val(data.d.id || "");
            $(config.fieldSelectors.codigo).val(data.d.codigo || "");
            $(config.fieldSelectors.codigo).prop("readonly", true).attr("placeholder", "");
            $(config.fieldSelectors.nombre).val(data.d.nombre || "");
            $(config.fieldSelectors.descripcion).val(data.d.descripcion || "");
            $(config.titleSelector).text("Editar " + config.label);
            $(config.infoSelector).removeClass("is-danger").text("");
            if (isStandaloneCatalogPage(config.key)) {
                openStandaloneCatalogModal(config.modalSelector);
            }
        })
        .catch(function () {
            mensajeErrorActivos("No fue posible cargar el " + config.label + ".");
        });
}

function guardarCatalogo(config) {
    const payload = {
        id: $(config.idSelector).val(),
        codigo: ($(config.fieldSelectors.codigo).val() || "").trim(),
        nombre: ($(config.fieldSelectors.nombre).val() || "").trim(),
        descripcion: ($(config.fieldSelectors.descripcion).val() || "").trim()
    };

    const validation = validateCatalogoPayload(config, payload);
    if (validation) {
        showCatalogoValidation(config, validation.selector, validation.message);
        return;
    }

    fetchJson(config.saveUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload)
    })
        .then(function (data) {
            const message = data.d || "";
            if (!/^El .* fue /.test(message)) {
                throw new Error(message || "No fue posible guardar el " + config.label + ".");
            }

            const useStandaloneModal = isStandaloneCatalogPage(config.key);
            limpiarFormularioCatalogo(config);
            CheckAppUI.reloadGrid(config.gridId);
            if (typeof config.resetCombos === "function") {
                config.resetCombos();
            }

            if (useStandaloneModal) {
                closeStandaloneCatalogModal(config.modalSelector);
                mensajeOkActivos(message);
                return;
            }

            $(config.infoSelector).removeClass("is-danger").addClass("is-success").text(message);
        })
        .catch(function (error) {
            mensajeErrorActivos(error && error.message ? error.message : "No fue posible guardar el " + config.label + ".");
        });
}

function guardarAltaRapidaCatalogo(config) {
    const payload = buildQuickAddPayload(config);
    const validation = validateQuickAddPayload(config, payload);
    if (validation) {
        showGenericValidation(validation.selector, config.infoSelector, validation.message);
        return;
    }

    fetchJson(config.saveUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload)
    })
        .then(function (data) {
            const message = data.d || "";
            if (!/^El /.test(message)) {
                throw new Error(message || "No fue posible guardar el registro.");
            }

            if (data.item && data.item.id) {
                setSelect2Value(config.selectSelector, data.item.id, buildQuickAddOptionText(data.item));
                $(config.modalSelector).modal("hide");
                limpiarFormularioAltaRapida(config);
                $("#txInfoActivo").removeClass("is-danger").addClass("is-success").text(config.successMessage);
                return null;
            }

            return resolveQuickAddCreatedItem(config, payload)
                .then(function (item) {
                    if (!item || !item.id) {
                        throw new Error("El registro fue creado, pero no fue posible seleccionarlo automáticamente.");
                    }

                    setSelect2Value(config.selectSelector, item.id, buildQuickAddOptionText(item));
                    $(config.modalSelector).modal("hide");
                    limpiarFormularioAltaRapida(config);
                    $("#txInfoActivo").removeClass("is-danger").addClass("is-success").text(config.successMessage);
                });
        })
        .catch(function (error) {
            $(config.infoSelector)
                .removeClass("is-success")
                .addClass("is-danger")
                .text(error && error.message ? error.message : "No fue posible guardar el registro.");
        });
}

function buildQuickAddPayload(config) {
    if (config.key === "tipo") {
        return {
            id: "",
            codigo: ($(config.fieldSelectors.codigo).val() || "").trim(),
            nombre: ($(config.fieldSelectors.nombre).val() || "").trim(),
            descripcion: ($(config.fieldSelectors.descripcion).val() || "").trim()
        };
    }

    if (config.key === "marca" || config.key === "proveedor") {
        return {
            id: "",
            codigo: ($(config.fieldSelectors.codigo).val() || "").trim(),
            nombre: ($(config.fieldSelectors.nombre).val() || "").trim(),
            descripcion: ($(config.fieldSelectors.descripcion).val() || "").trim()
        };
    }

    return {
        id: "",
        codigo: ($(config.fieldSelectors.codigo).val() || "").trim(),
        nombre: ($(config.fieldSelectors.nombre).val() || "").trim(),
        descripcion: ($(config.fieldSelectors.descripcion).val() || "").trim(),
        permiteOperacion: $(config.fieldSelectors.permiteOperacion).is(":checked"),
        ordenTexto: ($(config.fieldSelectors.orden).val() || "").toString().trim(),
        orden: parseStrictPositiveInteger(($(config.fieldSelectors.orden).val() || "").toString().trim())
    };
}

function validateQuickAddPayload(config, payload) {
    if (config.key === "tipo") {
        return validateCatalogoPayload({
            fieldSelectors: config.fieldSelectors
        }, payload);
    }

    if (config.key === "marca" || config.key === "proveedor") {
        return validateCatalogoPayload({
            fieldSelectors: config.fieldSelectors
        }, payload);
    }

    if (!payload.nombre || payload.nombre.length > activosValidationLimits.estadoNombre) {
        return {
            selector: config.fieldSelectors.nombre,
            message: "Captura un nombre válido de hasta " + activosValidationLimits.estadoNombre + " caracteres."
        };
    }

    if (!payload.ordenTexto || !Number.isInteger(payload.orden) || payload.orden <= 0) {
        return {
            selector: config.fieldSelectors.orden,
            message: "Captura un orden entero mayor que cero."
        };
    }

    if (payload.descripcion.length > activosValidationLimits.estadoDescripcion) {
        return {
            selector: config.fieldSelectors.descripcion,
            message: "La descripción no puede exceder " + activosValidationLimits.estadoDescripcion + " caracteres."
        };
    }

    return null;
}

function resolveQuickAddCreatedItem(config, payload) {
    const query = new URLSearchParams({
        busqueda: payload.codigo || payload.nombre || "",
        estatus: "activos"
    });

    return fetchJson(config.loadUrl + "?" + query.toString())
        .then(function (data) {
            const items = data.items || [];
            return findQuickAddCreatedItem(config, items, payload);
        });
}

function findQuickAddCreatedItem(config, items, payload) {
    const normalizedCodigo = normalizeQuickAddCompareValue(payload.codigo);
    const normalizedNombre = normalizeQuickAddCompareValue(payload.nombre);

    return items.find(function (item) {
        if (!item || !item.id || item.activo === false) {
            return false;
        }

        if (config.key === "estado") {
            return normalizeQuickAddCompareValue(item.codigo) === normalizedCodigo
                && normalizeQuickAddCompareValue(item.nombre) === normalizedNombre
                && Number(item.orden || 0) === Number(payload.orden || 0);
        }

        if (config.key === "tipo") {
            return normalizeQuickAddCompareValue(item.codigo) === normalizedCodigo
                && normalizeQuickAddCompareValue(item.nombre) === normalizedNombre;
        }

        return normalizeQuickAddCompareValue(item.nombre) === normalizedNombre
            && normalizeQuickAddCompareValue(item.codigo) === normalizedCodigo;
    }) || null;
}

function buildQuickAddOptionText(item) {
    const codigo = String(item.codigo || "").trim();
    const nombre = String(item.nombre || "").trim();
    return codigo ? codigo + " - " + nombre : nombre;
}

function normalizeQuickAddCompareValue(value) {
    return String(value || "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function confirmarCambioCatalogo(tipo, id, activar) {
    const config = activosCatalogConfigs[tipo];
    if (!config) {
        return;
    }

    Swal.fire({
        title: activar ? "¿Deseas activar este registro?" : "¿Deseas dar de baja este registro?",
        text: activar
            ? "El registro volverá a estar disponible para Activos."
            : "El historial se conservará y dejará de aparecer en los combos activos.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: activar ? "Activar" : "Dar de baja",
        cancelButtonText: "Cancelar"
    }).then(function (result) {
        if (!result.isConfirmed) {
            return;
        }

        const payload = {};
        payload[config.idPayloadKey] = id;

        fetchJson(activar ? config.activarUrl : config.bajaUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload)
        })
            .then(function (data) {
                mensajeOkActivos(data.d || (activar ? "El registro fue activado." : "El registro fue dado de baja."));
                CheckAppUI.reloadGrid(config.gridId);
                if (typeof config.resetCombos === "function") {
                    config.resetCombos();
                }
            })
            .catch(function () {
                mensajeErrorActivos("No fue posible actualizar el estatus del " + config.label + ".");
            });
    });
}

function limpiarFormularioEstadoOperativo() {
    $("#frmEstadoOperativo")[0].reset();
    $("#hdEstadoOperativoId").val("");
    $("#txCodigoEstadoOperativo").prop("readonly", true).attr("placeholder", "Se generará automáticamente");
    $("#txOrdenEstadoOperativo").val("");
    $("#chkPermiteOperacionEstado").prop("checked", false);
    $("#txTituloEstadoOperativo").text("Nuevo estado operativo");
    $("#txInfoEstadoOperativo").removeClass("is-danger is-success").text("");
    clearEstadoOperativoValidationState();
}

function editarEstadoOperativo(idEstadoOperativo) {
    fetchJson("/Activos/GetEstadoOperativo?idEstadoOperativo=" + encodeURIComponent(idEstadoOperativo))
        .then(function (data) {
            if (!data.d) {
                throw new Error("No fue posible cargar el estado operativo.");
            }

            $("#hdEstadoOperativoId").val(data.d.id || "");
            $("#txCodigoEstadoOperativo").val(data.d.codigo || "");
            $("#txCodigoEstadoOperativo").prop("readonly", true).attr("placeholder", "");
            $("#txNombreEstadoOperativo").val(data.d.nombre || "");
            $("#txDescripcionEstadoOperativo").val(data.d.descripcion || "");
            $("#txOrdenEstadoOperativo").val(Number(data.d.orden || 0) > 0 ? data.d.orden : "");
            $("#chkPermiteOperacionEstado").prop("checked", !!data.d.permiteOperacion);
            $("#txTituloEstadoOperativo").text("Editar estado operativo");
            if (isStandaloneCatalogPage("estado")) {
                openStandaloneCatalogModal("#modalEstadosOperativos");
            }
        })
        .catch(function () {
            mensajeErrorActivos("No fue posible cargar el estado operativo.");
        });
}

function guardarEstadoOperativo() {
    const ordenTexto = ($("#txOrdenEstadoOperativo").val() || "").toString().trim();
    const payload = {
        id: $("#hdEstadoOperativoId").val(),
        codigo: ($("#txCodigoEstadoOperativo").val() || "").trim(),
        nombre: ($("#txNombreEstadoOperativo").val() || "").trim(),
        descripcion: ($("#txDescripcionEstadoOperativo").val() || "").trim(),
        permiteOperacion: $("#chkPermiteOperacionEstado").is(":checked"),
        ordenTexto: ordenTexto,
        orden: parseStrictPositiveInteger(ordenTexto)
    };

    const validation = validateEstadoOperativoPayload(payload);
    if (validation) {
        showEstadoOperativoValidation(validation.selector, validation.message);
        return;
    }

    fetchJson("/Activos/GuardarEstadoOperativo", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload)
    })
        .then(function (data) {
            const message = data.d || "";
            if (!/^El estado operativo fue /.test(message)) {
                throw new Error(message || "No fue posible guardar el estado operativo.");
            }

            const useStandaloneModal = isStandaloneCatalogPage("estado");
            limpiarFormularioEstadoOperativo();
            CheckAppUI.reloadGrid("estados-grid");
            resetCatalogoEstadoOperativo();

            if (useStandaloneModal) {
                closeStandaloneCatalogModal("#modalEstadosOperativos");
                mensajeOkActivos(message);
                return;
            }

            $("#txInfoEstadoOperativo").removeClass("is-danger").addClass("is-success").text(message);
        })
        .catch(function (error) {
            mensajeErrorActivos(error && error.message ? error.message : "No fue posible guardar el estado operativo.");
        });
}

function confirmarBajaEstadoOperativo(idEstadoOperativo) {
    Swal.fire({
        title: "¿Deseas dar de baja este estado operativo?",
        text: "Los activos existentes conservarán su historial.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Dar de baja",
        cancelButtonText: "Cancelar"
    }).then(function (result) {
        if (!result.isConfirmed) {
            return;
        }

        fetchJson("/Activos/BajaEstadoOperativo", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({ idEstadoOperativo: idEstadoOperativo })
        })
            .then(function (data) {
                mensajeOkActivos(data.d || "El estado operativo fue dado de baja.");
                CheckAppUI.reloadGrid("estados-grid");
                resetCatalogoEstadoOperativo();
            })
            .catch(function () {
                mensajeErrorActivos("No fue posible dar de baja el estado operativo.");
            });
    });
}

function activarEstadoOperativo(idEstadoOperativo) {
    fetchJson("/Activos/ActivarEstadoOperativo", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ idEstadoOperativo: idEstadoOperativo })
    })
        .then(function (data) {
            mensajeOkActivos(data.d || "El estado operativo fue activado.");
            CheckAppUI.reloadGrid("estados-grid");
            resetCatalogoEstadoOperativo();
        })
        .catch(function () {
            mensajeErrorActivos("No fue posible activar el estado operativo.");
        });
}

function agregarArchivosActivos(tipo, fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) {
        return;
    }

    if (tipo === "video" && (activoMultimediaState.video.length + files.length) > 1) {
        mensajeErrorActivos("Solo puedes agregar un video por activo.");
        return;
    }

    const currentCount = getMultimediaArrayByTipo(tipo).length;
    const maxCount = tipo === "foto" || tipo === "documento" ? 3 : 1;
    if ((currentCount + files.length) > maxCount) {
        mensajeErrorActivos(buildMultimediaCountExceededMessage(tipo, maxCount));
        return;
    }

    Promise.all(files.map(function (file) {
        return prepareMultimediaDraftItem(tipo, file);
    }))
        .then(function (items) {
            const target = getMultimediaArrayByTipo(tipo);
            items.forEach(function (item) {
                target.push(item);
                queueActivoUpload(item);
            });
            normalizaOrdenMultimedia();
            renderActivoMultimediaEditor();
            pumpActivoUploads();
        })
        .catch(function (error) {
            mensajeErrorActivos(error && error.message ? error.message : "No fue posible preparar los archivos seleccionados.");
        });
}

function startActivoMediaCapture(tipo) {
    if (activoFormReadOnly) {
        return;
    }

    const multimediaActual = getMultimediaArrayByTipo(tipo);
    const maxCount = tipo === "foto" ? 3 : 1;
    if (multimediaActual.length >= maxCount) {
        mensajeErrorActivos(tipo === "foto"
            ? "Solo puedes agregar hasta 3 fotografías por activo."
            : "Solo puedes agregar un video por activo.");
        return;
    }

    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
        mensajeErrorActivos(tipo === "foto"
            ? "No fue posible acceder a la cámara en este dispositivo."
            : "No fue posible acceder a la cámara y al micrófono en este dispositivo.");
        return;
    }

    if (tipo === "video" && typeof window.MediaRecorder !== "function") {
        mensajeErrorActivos("Este dispositivo no permite grabar video desde el navegador.");
        return;
    }

    closeActivoMediaCapture(false);
    activoMediaCaptureState = createEmptyActivoMediaCaptureState();
    activoMediaCaptureState.tipo = tipo;
    activoMediaCaptureState.status = "requesting";
    syncActivoModalCaptureState(true);
    renderActivoMediaCaptureOverlay();

    const constraints = {
        video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280, max: 1280 },
            height: { ideal: 720, max: 720 }
        },
        audio: false
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
            activoMediaCaptureState.stream = stream;
            activoMediaCaptureState.status = "ready";
            activoMediaCaptureState.error = "";

            if (tipo === "video") {
                const recorder = new MediaRecorder(stream);
                activoMediaCaptureState.recorder = recorder;
                activoMediaCaptureState.chunks = [];
                const onDataAvailable = function (event) {
                    if (event.data && event.data.size > 0) {
                        activoMediaCaptureState.chunks.push(event.data);
                    }
                };
                const onStop = function () {
                    finalizeActivoRecordedMedia("video", recorder.mimeType || "video/webm");
                };

                activoMediaCaptureState.recorderHandlers = {
                    onDataAvailable: onDataAvailable,
                    onStop: onStop
                };

                recorder.addEventListener("dataavailable", onDataAvailable);
                recorder.addEventListener("stop", onStop);
            }

            renderActivoMediaCaptureOverlay();
            hydrateActivoMediaCaptureNode();
        })
        .catch(function () {
            setActivoMediaCaptureError("No fue posible acceder a la cámara en este dispositivo.");
        });
}

function hydrateActivoMediaCaptureNode() {
    if (!activoMediaCaptureState.stream) {
        return;
    }

    const videoNode = document.getElementById("activos-media-live-preview");
    if (videoNode && videoNode.srcObject !== activoMediaCaptureState.stream) {
        videoNode.srcObject = activoMediaCaptureState.stream;
        const playPromise = videoNode.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
            });
        }
    }
}

function captureActivoPhotoFrame() {
    if (activoMediaCaptureState.tipo !== "foto" || !activoMediaCaptureState.stream) {
        return;
    }

    const videoNode = document.getElementById("activos-media-live-preview");
    if (!videoNode) {
        return;
    }

    const width = videoNode.videoWidth || 1280;
    const height = videoNode.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context2d = canvas.getContext("2d");
    if (!context2d) {
        return;
    }

    context2d.drawImage(videoNode, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/png");
    const blob = dataUrlToBlobActivos(dataUrl);
    if (!blob) {
        return;
    }

    cleanupActivoMediaCaptureStream();
    activoMediaCaptureState.file = new File([blob], "foto-" + Date.now() + ".png", { type: "image/png" });
    activoMediaCaptureState.previewUrl = dataUrl;
    activoMediaCaptureState.status = "preview";
    activoMediaCaptureState.error = "";
    renderActivoMediaCaptureOverlay();
}

function startActivoVideoRecording() {
    if (activoMediaCaptureState.tipo !== "video" || !activoMediaCaptureState.recorder || activoMediaCaptureState.status === "recording") {
        return;
    }

    activoMediaCaptureState.chunks = [];
    activoMediaCaptureState.seconds = 0;
    activoMediaCaptureState.status = "recording";
    activoMediaCaptureState.recorder.start();
    startActivoMediaCaptureTimer();
    renderActivoMediaCaptureOverlay();
}

function stopActivoMediaRecording() {
    if (!activoMediaCaptureState.recorder || activoMediaCaptureState.recorder.state !== "recording") {
        return;
    }

    stopActivoMediaCaptureTimer();
    activoMediaCaptureState.recorder.stop();
    activoMediaCaptureState.status = "processing";
    renderActivoMediaCaptureOverlay();
}

function finalizeActivoRecordedMedia(tipo, mimeType) {
    cleanupActivoMediaCaptureStream();
    stopActivoMediaCaptureTimer();

    if (!activoMediaCaptureState.chunks.length) {
        closeActivoMediaCapture();
        return;
    }

    const blob = new Blob(activoMediaCaptureState.chunks, { type: mimeType });
    const extension = resolveVideoExtensionActivos(blob.type || mimeType);
    activoMediaCaptureState.file = new File([blob], tipo + "-" + Date.now() + extension, { type: blob.type || mimeType });
    activoMediaCaptureState.previewUrl = createObjectUrlActivos(activoMediaCaptureState.file);
    activoMediaCaptureState.status = "preview";
    activoMediaCaptureState.error = "";
    activoMediaCaptureState.recorder = null;
    activoMediaCaptureState.chunks = [];
    renderActivoMediaCaptureOverlay();
}

function restartActivoMediaCapture() {
    const tipo = activoMediaCaptureState.tipo;
    closeActivoMediaCapture(false);
    if (tipo) {
        startActivoMediaCapture(tipo);
    }
}

function saveActivoMediaCapture() {
    if (!activoMediaCaptureState.tipo || !activoMediaCaptureState.file) {
        return;
    }

    agregarArchivosActivos(activoMediaCaptureState.tipo, [activoMediaCaptureState.file]);
    closeActivoMediaCapture();
}

function closeActivoMediaCapture(shouldRender) {
    if (shouldRender === undefined) {
        shouldRender = true;
    }

    revokeObjectUrlActivos(activoMediaCaptureState.previewUrl);
    cleanupActivoMediaCaptureStream();
    stopActivoMediaCaptureTimer();
    activoMediaCaptureState = createEmptyActivoMediaCaptureState();
    syncActivoModalCaptureState(false);

    if (shouldRender) {
        renderActivoMediaCaptureOverlay();
    }
}

function cleanupActivoModalResources() {
    closeActivoMediaCapture(false);
    $("#flFotosActivo, #flVideoActivo, #flDocumentosActivo").val("");
}

function cleanupActivoMediaCaptureStream() {
    const videoNode = document.getElementById("activos-media-live-preview");
    if (videoNode) {
        try {
            videoNode.pause();
        } catch (_error) {
        }

        if (videoNode.srcObject) {
            videoNode.srcObject = null;
        }
    }

    if (activoMediaCaptureState.recorder && activoMediaCaptureState.recorderHandlers) {
        try {
            activoMediaCaptureState.recorder.removeEventListener("dataavailable", activoMediaCaptureState.recorderHandlers.onDataAvailable);
            activoMediaCaptureState.recorder.removeEventListener("stop", activoMediaCaptureState.recorderHandlers.onStop);
        } catch (_error) {
        }
    }

    activoMediaCaptureState.recorderHandlers = null;

    if (activoMediaCaptureState.stream) {
        activoMediaCaptureState.stream.getTracks().forEach(function (track) {
            track.stop();
        });
    }

    activoMediaCaptureState.stream = null;
    activoMediaCaptureState.recorder = null;
}

function cleanupActivoViewerResources() {
    $("#modalMultimediaActivo video").each(function () {
        try {
            this.pause();
        } catch (_error) {
        }

        this.removeAttribute("src");
        this.load();
    });

    $("#visorFotosActivo, #visorVideoActivo, #visorDocumentosActivo").empty();
}

function setActivoMediaCaptureError(message) {
    cleanupActivoMediaCaptureStream();
    stopActivoMediaCaptureTimer();
    activoMediaCaptureState.status = "error";
    activoMediaCaptureState.error = message || "No fue posible completar la captura.";
    renderActivoMediaCaptureOverlay();
}

function startActivoMediaCaptureTimer() {
    stopActivoMediaCaptureTimer();
    activoMediaCaptureState.seconds = 0;
    activoMediaCaptureState.intervalId = window.setInterval(function () {
        activoMediaCaptureState.seconds += 1;
        renderActivoMediaCaptureOverlay();
    }, 1000);
}

function stopActivoMediaCaptureTimer() {
    if (activoMediaCaptureState.intervalId) {
        window.clearInterval(activoMediaCaptureState.intervalId);
        activoMediaCaptureState.intervalId = 0;
    }
}

function renderActivoMediaCaptureOverlay() {
    const host = $("#activosMediaCaptureHost");
    if (!host.length) {
        return;
    }

    if (!activoMediaCaptureState.tipo || activoMediaCaptureState.status === "idle") {
        host.html("");
        return;
    }

    const tipo = activoMediaCaptureState.tipo;
    const isPhoto = tipo === "foto";
    const isVideo = tipo === "video";
    const showLivePreview = (isPhoto || isVideo) && (activoMediaCaptureState.status === "ready" || activoMediaCaptureState.status === "recording");
    const showPhotoPreview = isPhoto && activoMediaCaptureState.status === "preview" && activoMediaCaptureState.previewUrl;
    const showVideoPreview = isVideo && activoMediaCaptureState.status === "preview" && activoMediaCaptureState.previewUrl;
    ensureActivoMediaCaptureShell(host);

    host.find(".activos-media-capture-shell").addClass("is-open");
    host.find("[data-activos-capture-title]").text(isPhoto ? "Tomar foto" : "Grabar video");
    host.find("[data-activos-capture-status]").html(renderActivoMediaCaptureStatus());
    host.find("[data-activos-capture-actions]").html(renderActivoMediaCaptureActions(showLivePreview));

    const stage = host.find("[data-activos-capture-stage]").first();
    if (!stage.length) {
        return;
    }

    if (showLivePreview) {
        if (!stage.find("#activos-media-live-preview").length) {
            stage.html('<video id="activos-media-live-preview" class="activos-media-live" autoplay playsinline muted></video>');
        }

        hydrateActivoMediaCaptureNode();
        return;
    }

    if (showPhotoPreview) {
        stage.html('<img class="activos-media-preview-image" src="' + escapeHtmlActivos(activoMediaCaptureState.previewUrl) + '" alt="Vista previa de foto" />');
        return;
    }

    if (showVideoPreview) {
        stage.html('<video class="activos-media-preview-video" src="' + escapeHtmlActivos(activoMediaCaptureState.previewUrl) + '" controls playsinline preload="metadata"></video>');
        return;
    }

    stage.html("");
}

function renderActivoMediaCaptureStatus() {
    if (activoMediaCaptureState.error) {
        return '<p class="activos-media-capture-copy error">' + escapeHtmlActivos(activoMediaCaptureState.error) + '</p>';
    }

    if (activoMediaCaptureState.status === "recording") {
        return '<p class="activos-media-capture-copy recording">Grabando · ' + escapeHtmlActivos(formatCaptureSecondsActivos(activoMediaCaptureState.seconds)) + '</p>';
    }

    if (activoMediaCaptureState.status === "preview") {
        return '<p class="activos-media-capture-copy">La evidencia está lista para agregarse al activo.</p>';
    }

    if (activoMediaCaptureState.tipo === "foto") {
        return '<p class="activos-media-capture-copy">Encuadra la toma y captura la fotografía cuando estés listo.</p>';
    }

    return '<p class="activos-media-capture-copy">Inicia la grabación y deténla al terminar para revisar el video.</p>';
}

function renderActivoMediaCaptureActions(showLivePreview) {
    const actions = [];
    actions.push('<button type="button" class="checkapp-btn checkapp-btn-ghost" data-activos-capture-action="close">Cancelar</button>');

    if (activoMediaCaptureState.tipo === "foto" && showLivePreview) {
        actions.push('<button type="button" class="checkapp-btn checkapp-btn-primary" data-activos-capture-action="capture-photo">Capturar</button>');
    }

    if (activoMediaCaptureState.tipo === "video" && activoMediaCaptureState.status === "ready") {
        actions.push('<button type="button" class="checkapp-btn checkapp-btn-primary" data-activos-capture-action="start-video">Iniciar grabación</button>');
    }

    if (activoMediaCaptureState.tipo === "video" && activoMediaCaptureState.status === "recording") {
        actions.push('<button type="button" class="checkapp-btn checkapp-btn-primary" data-activos-capture-action="stop-video">Detener</button>');
    }

    if (activoMediaCaptureState.status === "preview") {
        actions.push('<button type="button" class="checkapp-btn checkapp-btn-secondary" data-activos-capture-action="restart">Repetir</button>');
        actions.push('<button type="button" class="checkapp-btn checkapp-btn-primary" data-activos-capture-action="save">Guardar</button>');
    }

    return actions.join("");
}

function ensureActivoMediaCaptureShell(host) {
    if (host.find(".activos-media-capture-shell").length) {
        return;
    }

    host.html([
        '<section class="activos-media-capture-shell is-open">',
        '<button type="button" class="activos-media-capture-backdrop" data-activos-capture-action="close" aria-label="Cerrar captura"></button>',
        '<div class="activos-media-capture-panel">',
        '<div class="activos-media-capture-handle" aria-hidden="true"></div>',
        '<div class="activos-media-capture-head">',
        '<div><p class="checkapp-kicker">Evidencia</p><h2 data-activos-capture-title></h2></div>',
        '<button type="button" class="checkapp-btn checkapp-btn-ghost" data-activos-capture-action="close">Cerrar</button>',
        '</div>',
        '<div class="activos-media-capture-body">',
        '<div class="activos-media-capture-stage" data-activos-capture-stage></div>',
        '<div data-activos-capture-status></div>',
        '<div class="activos-media-capture-actions" data-activos-capture-actions></div>',
        '</div>',
        '</div>',
        '</section>'
    ].join(""));
}

function syncActivoModalCaptureState(isCaptureOpen) {
    $("#modalActivo").toggleClass("activos-capture-open", !!isCaptureOpen);
}

function eliminarMultimediaDraft(tipo, idTemporal) {
    if (activoFormReadOnly) {
        return;
    }

    const currentItems = getMultimediaArrayByTipo(tipo);
    const targetItem = currentItems.find(function (item) {
        return item.idTemporal === idTemporal;
    });
    if (!targetItem) {
        return;
    }

    targetItem.uploadIntent = "removed";
    abortActivoUpload(targetItem);
    releaseActivoTemporaryUpload(targetItem);

    const items = currentItems.filter(function (item) {
        return item.idTemporal !== idTemporal;
    });

    if (tipo === "foto") {
        activoMultimediaState.fotos = items;
    } else if (tipo === "video") {
        activoMultimediaState.video = items;
    } else {
        activoMultimediaState.documentos = items;
    }

    normalizaOrdenMultimedia();
    renderActivoMultimediaEditor();
}

function resetActivoMultimediaState() {
    revokeMultimediaPreviews();
    activoMultimediaState = {
        fotos: [],
        video: [],
        documentos: []
    };
}

function resetActivoUploadState() {
    activoUploadState = createEmptyActivoUploadState();
}

function hydrateActivoMultimediaFromServer(multimedia) {
    resetActivoMultimediaState();

    (multimedia || []).forEach(function (item, index) {
        const tipo = inferTipoMultimedia(item);
        if (!tipo) {
            return;
        }

        const normalized = {
            id: item.id || "",
            idTemporal: "srv-" + index + "-" + (item.id || Math.random().toString(36).slice(2)),
            tipoMultimedia: tipo,
            nombreOriginal: item.nombreOriginal || item.nombreAlmacenado || "Archivo",
            nombreAlmacenado: item.nombreAlmacenado || "",
            extension: item.extension || "",
            mimeType: item.mimeType || "",
            urlFirebase: item.urlFirebase || "",
            pesoBytes: Number(item.pesoBytes || 0),
            orden: Number(item.orden || 0),
            previewUrl: item.urlFirebase || "",
            temporalToken: "",
            isNew: false,
            file: null,
            originalFile: null,
            status: "saved",
            progress: 100,
            error: "",
            xhr: null,
            uploadIntent: "persisted",
            originalBytes: Number(item.pesoBytes || 0),
            optimizedBytes: Number(item.pesoBytes || 0),
            optimizationSummary: ""
        };

        getMultimediaArrayByTipo(tipo).push(normalized);
    });

    normalizaOrdenMultimedia();
    renderActivoMultimediaEditor();
}

function buildActivoMultimediaPayload() {
    return getAllMultimediaItems().map(function (item) {
        return {
            id: item.id || "",
            tipoMultimedia: item.tipoMultimedia,
            nombreOriginal: item.nombreOriginal || "",
            nombreAlmacenado: item.nombreAlmacenado || "",
            extension: item.extension || "",
            mimeType: item.mimeType || "",
            urlFirebase: item.urlFirebase || "",
            pesoBytes: Number(item.pesoBytes || 0),
            orden: Number(item.orden || 0),
            temporalToken: item.temporalToken || ""
        };
    });
}

function renderActivoMultimediaEditor() {
    syncActivoUploadSummary();
    renderMultimediaSection("foto", "#contenedorFotosActivo", "#txResumenFotosActivo");
    renderMultimediaSection("video", "#contenedorVideoActivo", "#txResumenVideoActivo");
    renderMultimediaSection("documento", "#contenedorDocumentosActivo", "#txResumenDocumentosActivo");
}

function renderMultimediaSection(tipo, containerSelector, summarySelector) {
    const items = getMultimediaArrayByTipo(tipo);
    const max = tipo === "video" ? 1 : 3;
    const min = tipo === "video" ? 0 : 1;
    const hasWarning = tipo !== "video" && (items.length < min || items.length > max);
    const uploadedCount = items.filter(function (item) { return isActivoUploadReady(item); }).length;
    const erroredCount = items.filter(function (item) { return item.status === "error"; }).length;
    const activeCount = items.filter(function (item) { return item.status === "queued" || item.status === "uploading" || item.status === "optimizing"; }).length;
    let summaryText = tipo === "video"
        ? (items.length ? uploadedCount + " de 1 listo" : "Sin video")
        : (uploadedCount + " de " + max + " listos");

    if (activeCount) {
        summaryText += " · " + activeCount + " en proceso";
    }

    if (erroredCount) {
        summaryText += " · " + erroredCount + " con error";
    }

    $(summarySelector)
        .toggleClass("is-danger", hasWarning || erroredCount > 0)
        .toggleClass("is-success", !hasWarning && !erroredCount && uploadedCount > 0)
        .text(summaryText);

    if (!items.length) {
        const emptyMessages = {
            foto: "Sin fotos cargadas.",
            video: "Sin video cargado.",
            documento: "Sin documentos cargados."
        };
        $(containerSelector).html("<div class='activos-empty-media'>" + emptyMessages[tipo] + "</div>");
        return;
    }

    const html = items.map(function (item) {
        if (tipo === "foto") {
            return renderFotoEditorItem(item);
        }

        if (tipo === "video") {
            return renderVideoEditorItem(item);
        }

        return renderDocumentoEditorItem(item);
    }).join("");

    $(containerSelector).html(html);
}

function renderFotoEditorItem(item) {
    return "" +
        "<article class='activos-media-item activos-media-item--photo'>" +
        "  <img src='" + escapeHtmlActivos(item.previewUrl || item.urlFirebase || "") + "' alt='" + escapeHtmlActivos(item.nombreOriginal || "Foto") + "' />" +
        "  <div class='activos-media-item-meta'>" +
        "    <strong>" + escapeHtmlActivos(item.nombreOriginal || "Foto") + "</strong>" +
        "    <small>" + formatFileSize(item.pesoBytes) + "</small>" +
        renderMultimediaItemStatus(item) +
        "  </div>" +
        renderMultimediaItemActions(item) +
        "</article>";
}

function renderVideoEditorItem(item) {
    return "" +
        "<article class='activos-media-item'>" +
        "  <div class='activos-media-item-file'>" +
        "    <i class='fa fa-video-camera'></i>" +
        "    <div><strong>" + escapeHtmlActivos(item.nombreOriginal || "Video") + "</strong><small>" + formatFileSize(item.pesoBytes) + "</small>" + renderMultimediaItemStatus(item) + "</div>" +
        "  </div>" +
        "  <video controls preload='metadata' src='" + escapeHtmlActivos(item.previewUrl || item.urlFirebase || "") + "'></video>" +
        renderMultimediaItemActions(item) +
        "</article>";
}

function renderDocumentoEditorItem(item) {
    const href = item.previewUrl || item.urlFirebase || "#";
    return "" +
        "<article class='activos-media-item'>" +
        "  <div class='activos-media-item-file'>" +
        "    <i class='fa fa-file-text-o'></i>" +
        "    <div><strong>" + escapeHtmlActivos(item.nombreOriginal || "Documento") + "</strong><small>" + formatFileSize(item.pesoBytes) + "</small>" + renderMultimediaItemStatus(item) + "</div>" +
        "  </div>" +
        "  <a class='checkapp-btn checkapp-btn-ghost' href='" + escapeHtmlActivos(href) + "' target='_blank' rel='noopener noreferrer'>Abrir</a>" +
        renderMultimediaItemActions(item) +
        "</article>";
}

function renderMultimediaItemActions(item) {
    const actions = [];
    if (!activoFormReadOnly && item.status === "error") {
        actions.push("<button type='button' class='checkapp-btn checkapp-btn-secondary activos-media-retry' onclick=\"reintentarMultimediaDraft('" + item.tipoMultimedia + "','" + escapeJsValue(item.idTemporal) + "')\"><i class='fa fa-refresh'></i><span>Reintentar</span></button>");
    }

    if (!activoFormReadOnly) {
        actions.push(renderMultimediaRemoveButton(item));
    }

    return actions.join("");
}

function renderMultimediaRemoveButton(item) {
    if (activoFormReadOnly) {
        return "";
    }

    return "<button type='button' class='checkapp-btn checkapp-btn-ghost activos-media-remove' onclick=\"eliminarMultimediaDraft('" + item.tipoMultimedia + "','" + escapeJsValue(item.idTemporal) + "')\"><i class='fa fa-trash'></i><span>Quitar</span></button>";
}

function renderMultimediaItemStatus(item) {
    const statusText = resolveMultimediaStatusText(item);
    const showProgress = item.status === "uploading" || item.status === "queued" || item.status === "optimizing";
    const parts = ["<div class='activos-media-status'>"];
    parts.push("<span class='activos-media-status-pill is-" + escapeHtmlActivos(item.status || "pending") + "'>" + escapeHtmlActivos(statusText) + "</span>");
    if (item.optimizationSummary) {
        parts.push("<small>" + escapeHtmlActivos(item.optimizationSummary) + "</small>");
    }

    if (item.error) {
        parts.push("<small class='activos-media-status-error'>" + escapeHtmlActivos(item.error) + "</small>");
    }

    if (showProgress) {
        parts.push("<div class='activos-media-progress'><span style='width:" + Math.max(4, Math.min(100, Number(item.progress || 0))) + "%'></span></div>");
    }

    parts.push("</div>");
    return parts.join("");
}

function renderVisorMultimedia(multimedia) {
    const fotos = [];
    const videos = [];
    const documentos = [];

    (multimedia || []).forEach(function (item, index) {
        const tipo = inferTipoMultimedia(item);
        if (!tipo) {
            return;
        }

        const normalized = {
            id: item.id || "",
            nombreOriginal: item.nombreOriginal || item.nombreAlmacenado || "Archivo",
            urlFirebase: item.urlFirebase || "",
            pesoBytes: Number(item.pesoBytes || 0),
            orden: Number(item.orden || 0),
            mimeType: item.mimeType || "",
            index: index
        };

        if (tipo === "foto") {
            fotos.push(normalized);
        } else if (tipo === "video") {
            videos.push(normalized);
        } else {
            documentos.push(normalized);
        }
    });

    $("#visorFotosActivo").html(fotos.length
        ? fotos.map(function (item) {
            return "<figure class='activos-viewer-card'><img src='" + escapeHtmlActivos(item.urlFirebase) + "' alt='" + escapeHtmlActivos(item.nombreOriginal) + "' /><figcaption>" + escapeHtmlActivos(item.nombreOriginal) + "</figcaption></figure>";
        }).join("")
        : "<div class='activos-empty-media'>Sin fotos registradas.</div>");

    $("#visorVideoActivo").html(videos.length
        ? videos.map(function (item) {
            return "<div class='activos-viewer-player'><video controls preload='metadata' src='" + escapeHtmlActivos(item.urlFirebase) + "'></video><small>" + escapeHtmlActivos(item.nombreOriginal) + "</small></div>";
        }).join("")
        : "<div class='activos-empty-media'>Sin video registrado.</div>");

    $("#visorDocumentosActivo").html(documentos.length
        ? documentos.map(function (item) {
            return "<a class='activos-viewer-doc' href='" + escapeHtmlActivos(item.urlFirebase) + "' target='_blank' rel='noopener noreferrer'><i class='fa fa-file-text-o'></i><span>" + escapeHtmlActivos(item.nombreOriginal) + "</span><small>" + formatFileSize(item.pesoBytes) + "</small></a>";
        }).join("")
        : "<div class='activos-empty-media'>Sin documentos registrados.</div>");
}

function setCatalogCache(tipo, items) {
    const map = new Map((items || []).map(function (item) { return [item.id, item]; }));
    if (tipo === "tipo") {
        tiposDetalleCache = map;
    } else if (tipo === "marca") {
        marcasDetalleCache = map;
    } else if (tipo === "proveedor") {
        proveedoresDetalleCache = map;
    }
}

function setSelect2Value(selector, id, text) {
    $(selector).empty();
    if (!id) {
        $(selector).val(null).trigger("change");
        return;
    }

    const option = new Option(text || "", id, true, true);
    $(selector).append(option).trigger("change");
}

function resetCatalogoTipoActivo() {
    $("#cbFiltroTipoActivo").val(null).trigger("change");
    $("#cbTipoActivo").val(null).trigger("change");
}

function resetCatalogoMarcaActivo() {
    $("#cbFiltroMarcaActivo").val(null).trigger("change");
    $("#cbMarcaActivo").val(null).trigger("change");
}

function resetCatalogoProveedorActivo() {
    $("#cbFiltroProveedorActivo").val(null).trigger("change");
    $("#cbProveedorActivo").val(null).trigger("change");
}

function resetCatalogoEstadoOperativo() {
    $("#cbFiltroEstadoOperativo").val(null).trigger("change");
    $("#cbEstadoOperativo").val(null).trigger("change");
}

function renderIndicadorConteo(value, _label) {
    if (!value) {
        return "<span class='checkapp-badge checkapp-badge-muted'>0</span>";
    }

    return "<span class='checkapp-badge checkapp-badge-success'>" + escapeHtmlActivos(String(value)) + "</span>";
}

function formatDisplayDate(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("es-MX");
}

function formatDateForFile(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return yyyy + mm + dd + "_" + hh + mi;
}

function formatFileSize(bytes) {
    const size = Number(bytes || 0);
    if (!size) {
        return "0 KB";
    }

    if (size >= 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(1) + " MB";
    }

    return Math.max(1, Math.round(size / 1024)) + " KB";
}

function escapeHtmlActivos(value) {
    return CheckAppUI.escapeHtml(value == null ? "" : String(value));
}

function escapeJsValue(value) {
    return String(value == null ? "" : value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function mensajeOkActivos(texto) {
    Swal.fire({
        icon: "success",
        title: "Listo",
        text: texto
    });
}

function mensajeErrorActivos(texto) {
    Swal.fire({
        icon: "error",
        title: "No fue posible completar la acción",
        text: texto
    });
}

function validateActivoPayload(payload) {
    if (!payload.codigo || payload.codigo.length > activosValidationLimits.codigo) {
        return {
            selector: "#txCodigoActivo",
            message: "Captura un código válido de hasta " + activosValidationLimits.codigo + " caracteres."
        };
    }

    if (!payload.nombre || payload.nombre.length > activosValidationLimits.nombre) {
        return {
            selector: "#txNombreActivo",
            message: "Captura un nombre válido de hasta " + activosValidationLimits.nombre + " caracteres."
        };
    }

    if (!payload.idTipoActivo) {
        return {
            selector: "#cbTipoActivo",
            message: "Selecciona un tipo de activo."
        };
    }

    if (!payload.idMarca) {
        return {
            selector: "#cbMarcaActivo",
            message: "Selecciona una marca."
        };
    }

    if (!payload.idProveedor) {
        return {
            selector: "#cbProveedorActivo",
            message: "Selecciona un proveedor."
        };
    }

    if (!payload.idEstadoOperativo) {
        return {
            selector: "#cbEstadoOperativo",
            message: "Selecciona un estado operativo."
        };
    }

    if (!payload.idSucursal) {
        return {
            selector: "#cbSucursal",
            message: "Selecciona una sucursal."
        };
    }

    if (payload.tag.length > activosValidationLimits.tag) {
        return {
            selector: "#txTagActivo",
            message: "La etiqueta no puede exceder " + activosValidationLimits.tag + " caracteres."
        };
    }

    if (payload.numeroSerie.length > activosValidationLimits.numeroSerie) {
        return {
            selector: "#txNumeroSerieActivo",
            message: "El número de serie no puede exceder " + activosValidationLimits.numeroSerie + " caracteres."
        };
    }

    if (payload.descripcion.length > activosValidationLimits.descripcion) {
        return {
            selector: "#txDescripcionActivo",
            message: "La descripción no puede exceder " + activosValidationLimits.descripcion + " caracteres."
        };
    }

    const fotos = payload.multimedia.filter(function (item) { return item.tipoMultimedia === "foto"; }).length;
    const videos = payload.multimedia.filter(function (item) { return item.tipoMultimedia === "video"; }).length;
    const documentos = payload.multimedia.filter(function (item) { return item.tipoMultimedia === "documento"; }).length;

    if (fotos < 1 || fotos > 3) {
        return {
            selector: "#contenedorFotosActivo",
            message: "Captura entre 1 y 3 fotos."
        };
    }

    if (videos > 1) {
        return {
            selector: "#contenedorVideoActivo",
            message: "Solo se permite 1 video por activo."
        };
    }

    if (documentos < 1 || documentos > 3) {
        return {
            selector: "#contenedorDocumentosActivo",
            message: "Captura entre 1 y 3 documentos."
        };
    }

    const pendingUpload = payload.multimedia.find(function (item) {
        return !item.id && !item.temporalToken;
    });
    if (pendingUpload) {
        return {
            selector: "#contenedor" + (pendingUpload.tipoMultimedia === "foto" ? "Fotos" : pendingUpload.tipoMultimedia === "video" ? "Video" : "Documentos") + "Activo",
            message: "Espera a que termine la carga de todas las evidencias antes de guardar."
        };
    }

    return null;
}

function validateCatalogoPayload(config, payload) {
    if (!payload.nombre || payload.nombre.length > activosValidationLimits.catalogoNombre) {
        return {
            selector: config.fieldSelectors.nombre,
            message: "Captura un nombre válido de hasta " + activosValidationLimits.catalogoNombre + " caracteres."
        };
    }

    if (payload.descripcion.length > activosValidationLimits.catalogoDescripcion) {
        return {
            selector: config.fieldSelectors.descripcion,
            message: "La descripción no puede exceder " + activosValidationLimits.catalogoDescripcion + " caracteres."
        };
    }

    return null;
}

function validateEstadoOperativoPayload(payload) {
    if (!payload.nombre || payload.nombre.length > activosValidationLimits.estadoNombre) {
        return {
            selector: "#txNombreEstadoOperativo",
            message: "Captura un nombre válido de hasta " + activosValidationLimits.estadoNombre + " caracteres."
        };
    }

    if (payload.descripcion.length > activosValidationLimits.estadoDescripcion) {
        return {
            selector: "#txDescripcionEstadoOperativo",
            message: "La descripción no puede exceder " + activosValidationLimits.estadoDescripcion + " caracteres."
        };
    }

    if (!payload.ordenTexto) {
        return {
            selector: "#txOrdenEstadoOperativo",
            message: "Captura un orden entero mayor que cero."
        };
    }

    if (!Number.isInteger(payload.orden) || payload.orden <= 0) {
        return {
            selector: "#txOrdenEstadoOperativo",
            message: "Captura un orden entero mayor que cero."
        };
    }

    return null;
}

function showActivoValidation(selector, message) {
    showGenericValidation(selector, "#txInfoActivo", message);
}

function showCatalogoValidation(config, selector, message) {
    showGenericValidation(selector, config.infoSelector, message);
}

function showEstadoOperativoValidation(selector, message) {
    showGenericValidation(selector, "#txInfoEstadoOperativo", message);
}

function showGenericValidation(selector, infoSelector, message) {
    clearGenericFieldError(selector, infoSelector);
    markFieldInvalid(selector);
    $(infoSelector).removeClass("is-success").addClass("is-danger").text(message);
    const element = $(selector);
    if (element.length) {
        if (element.hasClass("select2-hidden-accessible")) {
            element.trigger("focus");
        } else {
            element.trigger("focus");
        }
    }
}

function clearActivoValidationState() {
    ["#txCodigoActivo", "#txNombreActivo", "#cbTipoActivo", "#cbMarcaActivo", "#cbProveedorActivo", "#cbEstadoOperativo", "#cbSucursal", "#txTagActivo", "#txNumeroSerieActivo", "#txDescripcionActivo"].forEach(function (selector) {
        clearGenericFieldError(selector, "#txInfoActivo");
    });
}

function clearEstadoOperativoValidationState() {
    ["#txCodigoEstadoOperativo", "#txNombreEstadoOperativo", "#txDescripcionEstadoOperativo", "#txOrdenEstadoOperativo"].forEach(function (selector) {
        clearGenericFieldError(selector, "#txInfoEstadoOperativo");
    });
}

function clearGenericFieldError(selector, infoSelector) {
    const element = $(selector);
    element.removeClass("is-invalid");
    if (element.hasClass("select2-hidden-accessible")) {
        element.next(".select2").find(".select2-selection").removeClass("is-invalid");
    }

    if ($(infoSelector).hasClass("is-danger")) {
        $(infoSelector).removeClass("is-danger").text("");
    }
}

function parseStrictPositiveInteger(value) {
    const normalized = String(value || "").trim();
    if (!/^\d+$/.test(normalized)) {
        return Number.NaN;
    }

    const parsed = Number(normalized);
    return Number.isInteger(parsed) ? parsed : Number.NaN;
}

function markFieldInvalid(selector) {
    const element = $(selector);
    element.addClass("is-invalid");
    if (element.hasClass("select2-hidden-accessible")) {
        element.next(".select2").find(".select2-selection").addClass("is-invalid");
    }
}

function getMultimediaArrayByTipo(tipo) {
    if (tipo === "foto") {
        return activoMultimediaState.fotos;
    }

    if (tipo === "video") {
        return activoMultimediaState.video;
    }

    return activoMultimediaState.documentos;
}

function getAllMultimediaItems() {
    return []
        .concat(activoMultimediaState.fotos)
        .concat(activoMultimediaState.video)
        .concat(activoMultimediaState.documentos);
}

function normalizaOrdenMultimedia() {
    ["fotos", "video", "documentos"].forEach(function (key) {
        activoMultimediaState[key].forEach(function (item, index) {
            item.orden = index + 1;
        });
    });
}

function inferTipoMultimedia(item) {
    if (!item) {
        return "";
    }

    if (item.tipoMultimedia) {
        return String(item.tipoMultimedia).toLowerCase();
    }

    if (item.foto) {
        return "foto";
    }

    if (item.video) {
        return "video";
    }

    if (item.documento) {
        return "documento";
    }

    return "";
}

function getTipoMultimediaLabel(tipo) {
    if (tipo === "foto") {
        return "Fotos";
    }

    if (tipo === "video") {
        return "Video";
    }

    return "Documentos";
}

function buildMultimediaCountExceededMessage(tipo, maxCount) {
    if (tipo === "foto") {
        return "Puedes agregar hasta " + maxCount + " fotografías por activo.";
    }

    if (tipo === "video") {
        return "Solo puedes agregar un video por activo.";
    }

    return "Puedes agregar hasta " + maxCount + " documentos por activo.";
}

function revokeMultimediaPreviews() {
    getAllMultimediaItems().forEach(function (item) {
        if (item.isNew && item.previewUrl && item.previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(item.previewUrl);
        }
    });
}

function createMultimediaDraftItem(tipo, file) {
    return {
        id: "",
        idTemporal: "tmp-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2),
        tipoMultimedia: tipo,
        nombreOriginal: file.name || "archivo",
        nombreAlmacenado: "",
        extension: getFileExtension(file.name),
        mimeType: file.type || "",
        urlFirebase: "",
        pesoBytes: Number(file.size || 0),
        orden: 0,
        temporalToken: "",
        previewUrl: tipo === "documento" ? "" : createObjectUrlActivos(file),
        isNew: true,
        file: file,
        originalFile: file,
        status: "pending",
        progress: 0,
        error: "",
        xhr: null,
        uploadIntent: "active",
        originalBytes: Number(file.size || 0),
        optimizedBytes: Number(file.size || 0),
        optimizationSummary: ""
    };
}

function createEmptyActivoMediaCaptureState() {
    return {
        tipo: "",
        status: "idle",
        previewUrl: "",
        file: null,
        error: "",
        seconds: 0,
        stream: null,
        recorder: null,
        recorderHandlers: null,
        intervalId: 0,
        chunks: []
    };
}

function createEmptyActivoSaveState() {
    return {
        isSaving: false,
        intervalId: 0,
        messages: [],
        index: 0
    };
}

function createEmptyActivoUploadState() {
    return {
        operationId: "activos-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2),
        counters: {
            foto: 0,
            video: 0,
            documento: 0
        }
    };
}

function resetActivoSaveState() {
    stopActivoSaveProgressTimer();
    activoSaveState = createEmptyActivoSaveState();
    syncActivoSaveUi(false, "Guardando activo...", "Preparando información del activo...");
}

function beginActivoSaveProgress(messages) {
    stopActivoSaveProgressTimer();
    activoSaveState.isSaving = true;
    activoSaveState.messages = messages && messages.length ? messages.slice() : ["Guardando información del activo..."];
    activoSaveState.index = 0;
    syncActivoSaveUi(true, "Guardando activo...", activoSaveState.messages[0]);

    activoSaveState.intervalId = window.setInterval(function () {
        if (!activoSaveState.isSaving || !activoSaveState.messages.length) {
            return;
        }

        if (activoSaveState.index < (activoSaveState.messages.length - 1)) {
            activoSaveState.index += 1;
            syncActivoSaveUi(true, "Guardando activo...", activoSaveState.messages[activoSaveState.index]);
        }
    }, 1200);
}

function finishActivoSaveProgress() {
    stopActivoSaveProgressTimer();
    syncActivoSaveUi(false, "Guardando activo...", "Preparando información del activo...");
    activoSaveState = createEmptyActivoSaveState();
}

function failActivoSaveProgress() {
    stopActivoSaveProgressTimer();
    syncActivoSaveUi(false, "Guardando activo...", "Preparando información del activo...");
    activoSaveState = createEmptyActivoSaveState();
}

function stopActivoSaveProgressTimer() {
    if (activoSaveState.intervalId) {
        window.clearInterval(activoSaveState.intervalId);
        activoSaveState.intervalId = 0;
    }
}

function syncActivoSaveUi(isSaving, title, status) {
    $("#modalActivo").toggleClass("is-saving", !!isSaving);
    $("#activosSaveOverlay").attr("aria-hidden", isSaving ? "false" : "true");
    $("#txActivosSaveTitle").text(title || "Guardando activo...");
    $("#txActivosSaveStatus").text(status || "Preparando información del activo...");
    $("#btGuardarActivo").prop("disabled", !!isSaving);
    $("#modalActivo [data-bs-dismiss]").prop("disabled", !!isSaving);
}

function buildActivoSaveProgressMessages(payload) {
    const fotos = payload.multimedia.filter(function (item) { return item.tipoMultimedia === "foto"; }).length;
    const videos = payload.multimedia.filter(function (item) { return item.tipoMultimedia === "video"; }).length;
    const documentos = payload.multimedia.filter(function (item) { return item.tipoMultimedia === "documento"; }).length;
    const messages = ["Guardando información del activo..."];

    for (let index = 0; index < fotos; index += 1) {
        messages.push("Subiendo fotos " + (index + 1) + " de " + fotos + "...");
    }

    if (videos) {
        messages.push("Subiendo video...");
    }

    for (let index = 0; index < documentos; index += 1) {
        messages.push("Subiendo documentos " + (index + 1) + " de " + documentos + "...");
    }

    messages.push("Finalizando registro...");
    return messages;
}

function resolveActivoSaveErrorMessage(message) {
    const raw = String(message || "").trim();
    const normalized = raw.toLowerCase();

    if (!raw) {
        return "No fue posible completar el registro. Tus datos permanecen en el formulario para que puedas intentarlo nuevamente.";
    }

    if (normalized.includes("document")) {
        return "No fue posible subir uno de los documentos. Tus datos permanecen en el formulario para que puedas intentarlo nuevamente.";
    }

    if (normalized.includes("video")) {
        return "No fue posible guardar el video del activo. Tus datos permanecen en el formulario para que puedas intentarlo nuevamente.";
    }

    if (normalized.includes("foto") || normalized.includes("image")) {
        return "No fue posible subir una de las fotos. Tus datos permanecen en el formulario para que puedas intentarlo nuevamente.";
    }

    if (normalized.includes("evidencia") || normalized.includes("multimedia")) {
        return "No fue posible guardar la evidencia del activo. Tus datos permanecen en el formulario para que puedas intentarlo nuevamente.";
    }

    return "No fue posible completar el registro. Tus datos permanecen en el formulario para que puedas intentarlo nuevamente.";
}

function createObjectUrlActivos(file) {
    if (!file || typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
        return "";
    }

    return URL.createObjectURL(file);
}

function revokeObjectUrlActivos(url) {
    if (!url || typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function" || url.indexOf("blob:") !== 0) {
        return;
    }

    URL.revokeObjectURL(url);
}

function dataUrlToBlobActivos(dataUrl) {
    if (!dataUrl || dataUrl.indexOf(",") < 0) {
        return null;
    }

    const segments = dataUrl.split(",");
    const mimeMatch = segments[0].match(/:(.*?);/);
    const mimeType = mimeMatch && mimeMatch[1] ? mimeMatch[1] : "application/octet-stream";
    const binary = window.atob(segments[1]);
    let length = binary.length;
    const array = new Uint8Array(length);

    while (length--) {
        array[length] = binary.charCodeAt(length);
    }

    return new Blob([array], { type: mimeType });
}

function validateMultimediaFile(tipo, file) {
    const fileName = (file && file.name) ? file.name : "El archivo";
    if (!file || !Number(file.size || 0)) {
        return fileName + " está vacío. Selecciona un archivo válido.";
    }

    const extension = getFileExtension(file.name).toLowerCase();
    const mimeType = String(file.type || "").toLowerCase();
    const maxBytes = activosMultimediaLimits[tipo] ? activosMultimediaLimits[tipo].maxBytes : 0;
    if (maxBytes && Number(file.size || 0) > maxBytes) {
        if (tipo === "foto") {
            return fileName + " supera el tamaño permitido. Cada fotografía debe pesar como máximo 10 MB.";
        }

        if (tipo === "video") {
            return fileName + " supera el tamaño permitido. El video debe pesar como máximo 200 MB.";
        }

        return fileName + " supera el tamaño permitido. Cada documento debe pesar como máximo 25 MB.";
    }

    if (tipo === "foto") {
        const allowedPhotoExtensions = [".png", ".jpg", ".jpeg", ".webp", ".heic"];
        if (mimeType.indexOf("image/") !== 0 && allowedPhotoExtensions.indexOf(extension) < 0) {
            return fileName + " no es una fotografía válida. Usa PNG, JPG, JPEG, WEBP o HEIC.";
        }
    }

    if (tipo === "video") {
        const allowedVideoExtensions = [".webm", ".mp4", ".mov"];
        if (mimeType.indexOf("video/") !== 0 && allowedVideoExtensions.indexOf(extension) < 0) {
            return fileName + " no es un video válido. Usa WEBM, MP4 o MOV.";
        }
    }

    if (tipo === "documento") {
        const allowedDocumentExtensions = [".pdf", ".doc", ".docx"];
        if (allowedDocumentExtensions.indexOf(extension) < 0) {
            return fileName + " no es un documento permitido. Usa PDF, DOC o DOCX.";
        }
    }

    return "";
}

function formatCaptureSecondsActivos(totalSeconds) {
    const safeSeconds = Number(totalSeconds || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function resolveVideoExtensionActivos(mimeType) {
    if (mimeType === "video/mp4") {
        return ".mp4";
    }

    if (mimeType === "video/quicktime") {
        return ".mov";
    }

    return ".webm";
}

function getFileExtension(filename) {
    const index = String(filename || "").lastIndexOf(".");
    return index >= 0 ? filename.substring(index) : "";
}

function fetchJson(url, options) {
    return fetch(url, options).then(function (response) {
        return response.text().then(function (text) {
            const data = text ? JSON.parse(text) : {};
            if (!response.ok) {
                throw new Error(resolveServerMessage(data) || "No fue posible completar la acción.");
            }

            return data;
        });
    });
}

function resolveServerMessage(data) {
    if (!data) {
        return "";
    }

    if (typeof data.d === "string") {
        return data.d;
    }

    if (typeof data.mensaje === "string") {
        return data.mensaje;
    }

    return "";
}

function prepareMultimediaDraftItem(tipo, file) {
    const validation = validateMultimediaFile(tipo, file);
    if (validation) {
        return Promise.reject(new Error(validation));
    }

    if (tipo === "foto") {
        return optimizePhotoForActivo(file).then(function (preparedFile) {
            const item = createMultimediaDraftItem(tipo, preparedFile);
            item.originalFile = file;
            item.originalBytes = Number(file.size || 0);
            item.optimizedBytes = Number(preparedFile.size || 0);
            item.optimizationSummary = buildPhotoOptimizationSummary(item.originalBytes, item.optimizedBytes);
            return item;
        });
    }

    const item = createMultimediaDraftItem(tipo, file);
    if (tipo === "video") {
        item.optimizationSummary = "Objetivo de captura 720p · máx. 200 MB";
    }

    if (tipo === "documento") {
        item.optimizationSummary = "Formato permitido: PDF o Word · tamaño máximo 25 MB";
    }

    return Promise.resolve(item);
}

function optimizePhotoForActivo(file) {
    return loadImageBitmapActivos(file).then(function (bitmap) {
        const width = bitmap.width || 1;
        const height = bitmap.height || 1;
        const scale = Math.min(1, 1920 / Math.max(width, height));
        const targetWidth = Math.max(1, Math.round(width * scale));
        const targetHeight = Math.max(1, Math.round(height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const context2d = canvas.getContext("2d");
        if (!context2d) {
            throw new Error("No fue posible optimizar la foto seleccionada.");
        }

        context2d.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
        if (typeof bitmap.close === "function") {
            bitmap.close();
        }

        return canvasToFileActivos(canvas, buildOptimizedPhotoName(file.name));
    });
}

function loadImageBitmapActivos(file) {
    if (typeof createImageBitmap === "function") {
        return createImageBitmap(file, { imageOrientation: "from-image" }).catch(function () {
            return loadImageElementActivos(file);
        });
    }

    return loadImageElementActivos(file);
}

function loadImageElementActivos(file) {
    return new Promise(function (resolve, reject) {
        const url = createObjectUrlActivos(file);
        const image = new Image();
        image.onload = function () {
            revokeObjectUrlActivos(url);
            resolve(image);
        };
        image.onerror = function () {
            revokeObjectUrlActivos(url);
            reject(new Error("No fue posible leer la foto seleccionada."));
        };
        image.src = url;
    });
}

function canvasToFileActivos(canvas, fileName) {
    return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
            if (!blob) {
                reject(new Error("No fue posible optimizar la foto seleccionada."));
                return;
            }

            resolve(new File([blob], fileName, { type: "image/jpeg" }));
        }, "image/jpeg", 0.82);
    });
}

function buildOptimizedPhotoName(fileName) {
    const baseName = String(fileName || "foto").replace(/\.[^.]+$/, "");
    return baseName + ".jpg";
}

function buildPhotoOptimizationSummary(originalBytes, optimizedBytes) {
    return "Optimizada: " + formatFileSize(originalBytes) + " -> " + formatFileSize(optimizedBytes) + " · máx. 1920 px";
}

function queueActivoUpload(item) {
    item.status = "queued";
    item.progress = 0;
    item.error = "";
    item.uploadIntent = "active";
}

function pumpActivoUploads() {
    ["foto", "video", "documento"].forEach(function (tipo) {
        const items = getMultimediaArrayByTipo(tipo);
        const activeUploads = items.filter(function (item) { return item.status === "uploading"; }).length;
        const concurrency = activosMultimediaLimits[tipo].uploadConcurrency;
        if (activeUploads >= concurrency) {
            return;
        }

        items
            .filter(function (item) {
                return item.isNew && item.uploadIntent === "active" && (item.status === "queued" || item.status === "pending");
            })
            .slice(0, concurrency - activeUploads)
            .forEach(function (item) {
                startActivoUpload(item);
            });
    });
}

function startActivoUpload(item) {
    const tipo = item.tipoMultimedia;
    item.status = "uploading";
    item.progress = 2;
    item.error = "";
    renderActivoMultimediaEditor();

    const xhr = new XMLHttpRequest();
    item.xhr = xhr;
    xhr.open("POST", "/Activos/SubirMultimediaTemporal", true);
    xhr.responseType = "json";
    xhr.upload.onprogress = function (event) {
        if (!event.lengthComputable) {
            return;
        }

        item.progress = Math.max(5, Math.min(95, Math.round((event.loaded / event.total) * 100)));
        renderActivoMultimediaEditor();
    };

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) {
            return;
        }

        item.xhr = null;
        if (xhr.status >= 200 && xhr.status < 300) {
            const response = xhr.response || parseJsonSafely(xhr.responseText);
            const archivo = response && response.archivo ? response.archivo : null;
            if (!archivo || !archivo.temporalToken) {
                markActivoUploadError(item, "No fue posible confirmar la evidencia cargada.");
                return;
            }

            item.temporalToken = archivo.temporalToken || "";
            item.nombreOriginal = archivo.nombreOriginal || item.nombreOriginal;
            item.nombreAlmacenado = archivo.nombreAlmacenado || item.nombreAlmacenado;
            item.extension = archivo.extension || item.extension;
            item.mimeType = archivo.mimeType || item.mimeType;
            item.urlFirebase = archivo.urlFirebase || item.urlFirebase;
            item.pesoBytes = Number(archivo.pesoBytes || item.pesoBytes || 0);
            item.optimizedBytes = item.pesoBytes;
            item.status = "uploaded";
            item.progress = 100;
            item.error = "";
            if (item.tipoMultimedia !== "documento" && item.urlFirebase) {
                revokeObjectUrlActivos(item.previewUrl);
                item.previewUrl = item.urlFirebase;
            }

            renderActivoMultimediaEditor();
            pumpActivoUploads();
            return;
        }

        const errorResponse = xhr.response || parseJsonSafely(xhr.responseText);
        markActivoUploadError(item, resolveServerMessage(errorResponse) || "No fue posible cargar la evidencia.");
    };

    const formData = new FormData();
    formData.append("tipoMultimedia", tipo);
    formData.append("operacionCarga", activoUploadState.operationId);
    formData.append("archivo", item.file, item.file.name || "archivo.bin");
    xhr.send(formData);
}

function markActivoUploadError(item, message) {
    item.status = "error";
    item.progress = 0;
    item.error = message || "No fue posible cargar la evidencia.";
    renderActivoMultimediaEditor();
    pumpActivoUploads();
}

function abortActivoUpload(item) {
    if (item && item.xhr) {
        try {
            item.xhr.abort();
        } catch (_error) {
        }
    }

    item.xhr = null;
}

function reintentarMultimediaDraft(tipo, idTemporal) {
    const item = getMultimediaArrayByTipo(tipo).find(function (current) {
        return current.idTemporal === idTemporal;
    });
    if (!item || !item.isNew) {
        return;
    }

    item.error = "";
    item.temporalToken = "";
    item.urlFirebase = "";
    item.status = "queued";
    item.progress = 0;
    item.uploadIntent = "active";
    if (item.tipoMultimedia !== "documento" && item.file) {
        revokeObjectUrlActivos(item.previewUrl);
        item.previewUrl = createObjectUrlActivos(item.file);
    }

    renderActivoMultimediaEditor();
    pumpActivoUploads();
}

function releaseActivoTemporaryUpload(item) {
    if (!item || !item.temporalToken) {
        return;
    }

    const token = item.temporalToken;
    item.temporalToken = "";
    fetchJson("/Activos/LimpiarMultimediaTemporal", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ tokens: [token] })
    }).catch(function () {
    });
}

function releaseAllActivoTemporaryUploads() {
    const tokens = getAllMultimediaItems()
        .filter(function (item) { return item.temporalToken; })
        .map(function (item) { return item.temporalToken; });

    getAllMultimediaItems().forEach(function (item) {
        abortActivoUpload(item);
        revokeObjectUrlActivos(item.previewUrl);
        item.temporalToken = "";
    });

    if (!tokens.length) {
        resetActivoUploadState();
        return;
    }

    fetchJson("/Activos/LimpiarMultimediaTemporal", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ tokens: tokens })
    }).catch(function () {
    }).finally(function () {
        resetActivoUploadState();
    });
}

function ensureActivoUploadsCompleted() {
    const pendingItems = getAllMultimediaItems().filter(function (item) {
        return item.isNew && item.uploadIntent === "active";
    });

    if (!pendingItems.length) {
        return Promise.resolve();
    }

    pumpActivoUploads();
    return waitForActivoUploads();
}

function waitForActivoUploads() {
    return new Promise(function (resolve, reject) {
        function inspect() {
            const items = getAllMultimediaItems().filter(function (item) {
                return item.isNew && item.uploadIntent === "active";
            });

            if (items.some(function (item) { return item.status === "error"; })) {
                reject(new Error("Hay evidencias con error. Reintenta cada archivo antes de guardar."));
                return;
            }

            if (items.some(function (item) { return item.status === "queued" || item.status === "uploading" || item.status === "pending"; })) {
                window.setTimeout(inspect, 250);
                return;
            }

            resolve();
        }

        inspect();
    });
}

function isActivoUploadReady(item) {
    return item.status === "uploaded" || item.status === "saved";
}

function resolveMultimediaStatusText(item) {
    switch (item.status) {
        case "queued":
            return "En cola";
        case "uploading":
            return "Subiendo " + Math.round(Number(item.progress || 0)) + "%";
        case "uploaded":
            return "Listo";
        case "saved":
            return "Guardado";
        case "error":
            return "Error";
        default:
            return "Preparando";
    }
}

function parseJsonSafely(text) {
    try {
        return text ? JSON.parse(text) : {};
    } catch (_error) {
        return {};
    }
}

function syncActivoUploadSummary() {
    const items = getAllMultimediaItems().filter(function (item) { return item.isNew; });
    if (!items.length) {
        $("#txResumenCargaActivosMultimedia").removeClass("is-danger is-success").text("Puedes revisar aquí el avance de las evidencias antes de guardar.");
        return;
    }

    const ready = items.filter(function (item) { return item.status === "uploaded"; }).length;
    const active = items.filter(function (item) { return item.status === "queued" || item.status === "uploading" || item.status === "pending"; }).length;
    const failed = items.filter(function (item) { return item.status === "error"; }).length;
    const message = ready + " de " + items.length + " archivos listos"
        + (active ? " · " + active + " en proceso" : "")
        + (failed ? " · " + failed + " con error" : "");

    $("#txResumenCargaActivosMultimedia")
        .toggleClass("is-danger", failed > 0)
        .toggleClass("is-success", failed === 0 && ready === items.length && items.length > 0)
        .text(message);
}
