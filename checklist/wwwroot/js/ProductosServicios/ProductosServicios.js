(function (window, document, $) {
    "use strict";

    const gridId = "productos-servicios-grid";
    const multimediaLimits = {
        foto: { max: 3, maxBytes: 10 * 1024 * 1024, accepts: ["image/jpeg", "image/png", "image/webp"] },
        video: { max: 1, maxBytes: 200 * 1024 * 1024, accepts: ["video/mp4", "video/webm", "video/quicktime"] },
        documento: {
            max: 3,
            maxBytes: 25 * 1024 * 1024,
            accepts: [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ]
        }
    };

    const state = {
        combos: {
            categorias: [],
            marcas: [],
            unidadesMedida: [],
            colecciones: [],
            paquetes: [],
            atributos: [],
            tags: [],
            tipos: [],
            estatus: [],
            objetosImpuesto: [],
            tiposPaquete: [],
            unidadesPrecioUnitario: []
        },
        summaryType: "",
        detailCache: new Map(),
        activeRows: [],
        imageDraft: null,
        existingImage: null,
        removeExistingImage: false,
        savedModalImage: false,
        modal: null,
        fichaModal: null,
        quickCatalogModal: null,
        collectionModal: null,
        packageModal: null,
        attributeModal: null,
        attributeValueModal: null,
        isSaving: false,
        isUploadingImage: false,
        variantImageUploadCount: 0,
        saveProgressTimerId: 0,
        quickCatalogSaving: false,
        quickCatalogKey: "",
        attributeRows: [],
        attributeDraft: {
            idAtributo: "",
            idAtributoValor: ""
        },
        variantOptionRows: [],
        variants: [],
        attributeValueCatalog: {},
        multimedia: createEmptyMultimediaState(),
        savedMultimedia: false,
        uploadOperationId: "",
        uploadCounts: { foto: 0, video: 0, documento: 0 },
        modalSections: createDefaultModalSections(),
        unitPriceSnapshot: null,
        unitPricePopoverOpen: false,
        selectedTags: [],
        tagsPopoverOpen: false,
        tagSearch: "",
        tagSaving: false,
        legacyTagValue: "",
        fichaTecnica: {
            id: "",
            detail: null,
            loading: false,
            downloading: false
        },
        actionsMenu: {
            openRowId: "",
            anchorElement: null,
            layerElement: null
        }
    };

    const quickCatalogConfigs = {
        categoria: {
            key: "categoria",
            title: "Nueva categoría",
            singular: "categoría",
            validationEntityName: "la categoría",
            appliesRequiredMessage: "Selecciona a qué aplica la categoría.",
            saveUrl: "/ProductosServicios/GuardarCategoriaProductoServicio",
            listUrl: "/ProductosServicios/ObtenerCategoriasProductosServicios",
            selectSelector: "#cbCategoriaProductoServicio",
            comboCollectionKey: "categorias",
            codeMax: 50,
            nameMax: 150,
            descriptionMax: 500,
            showDescription: true,
            showAplicaA: true,
            showAbreviatura: false,
            showPermiteDecimales: false
        },
        marca: {
            key: "marca",
            title: "Nueva marca",
            singular: "marca",
            validationEntityName: "la marca",
            saveUrl: "/ProductosServicios/GuardarMarcaProductoServicio",
            listUrl: "/ProductosServicios/ObtenerMarcasProductosServicios",
            selectSelector: "#cbMarcaProductoServicio",
            comboCollectionKey: "marcas",
            codeMax: 50,
            nameMax: 150,
            descriptionMax: 500,
            showDescription: true,
            showAplicaA: false,
            showAbreviatura: false,
            showPermiteDecimales: false
        },
        unidad: {
            key: "unidad",
            title: "Nueva unidad de medida",
            singular: "unidad de medida",
            validationEntityName: "la unidad de medida",
            abbreviationRequiredMessage: "Captura la abreviatura de la unidad de medida.",
            abbreviationLengthMessage: "La abreviatura de la unidad de medida no puede exceder 20 caracteres.",
            saveUrl: "/ProductosServicios/GuardarUnidadMedidaProductoServicio",
            listUrl: "/ProductosServicios/ObtenerUnidadesMedidaProductosServicios",
            selectSelector: "#cbUnidadProductoServicio",
            comboCollectionKey: "unidadesMedida",
            codeMax: 30,
            nameMax: 100,
            descriptionMax: 0,
            abreviaturaMax: 20,
            showDescription: false,
            showAplicaA: false,
            showAbreviatura: true,
            showPermiteDecimales: true
        }
    };

    const quickCatalogBridge = window.ProductosServiciosCatalogModalShared.create({
        formSelector: "#frmQuickCatalogoProductoServicio",
        hiddenIdSelector: "#hdQuickCatalogoId",
        hiddenTypeSelector: "#hdQuickCatalogoTipo",
        codeSelector: "#txQuickCatalogoCodigo",
        nameSelector: "#txQuickCatalogoNombre",
        descriptionSelector: "#txQuickCatalogoDescripcion",
        appliesSelector: "#cbQuickCatalogoAplicaA",
        abbreviationSelector: "#txQuickCatalogoAbreviatura",
        decimalsSelector: "#chkQuickCatalogoPermiteDecimales",
        descriptionFieldSelector: "#fieldQuickCatalogoDescripcion",
        appliesFieldSelector: "#fieldQuickCatalogoAplicaA",
        abbreviationFieldSelector: "#fieldQuickCatalogoAbreviatura",
        decimalsFieldSelector: "#fieldQuickCatalogoPermiteDecimales",
        kickerSelector: "#txQuickCatalogoKicker",
        titleSelector: "#txQuickCatalogoTitulo",
        saveButtonTextSelector: "#btGuardarQuickCatalogoProductoServicio span",
        infoSelector: "#txInfoQuickCatalogo",
        overlaySelector: "#quickCatalogoSaveOverlay",
        overlayTitleSelector: "#txQuickCatalogoSaveTitle",
        overlayStatusSelector: "#txQuickCatalogoSaveStatus",
        invalidScopeSelector: "#frmQuickCatalogoProductoServicio"
    });

    document.addEventListener("DOMContentLoaded", function () {
        state.modal = resolveModalApi("#modalProductoServicio");
        state.fichaModal = resolveModalApi("#modalFichaTecnicaProductoServicio");
        state.quickCatalogModal = resolveModalApi("#modalQuickCatalogoProductoServicio");
        state.collectionModal = resolveModalApi("#modalColeccionProductoServicio");
        state.packageModal = resolveModalApi("#modalPaqueteProductoServicio");
        state.attributeModal = resolveModalApi("#modalAtributoProductoServicio");
        state.attributeValueModal = resolveModalApi("#modalAtributoValorProductoServicio");
        ensureActionsMenuLayer();
        initAccordion();
        initEvents();
        initGrid();
        resetSaveUi();

        loadCombos()
            .then(function () {
                syncTypeVisibility();
                renderAttributesEditor();
                renderVariantOptionsEditor();
                renderVariantsEditor();
                renderMultimediaEditor();
                return Promise.all([loadSummary(), CheckAppUI.reloadGrid(gridId)]);
            })
            .catch(function (error) {
                setStatus("#txInfoProductoServicio", "danger", resolveErrorMessage(error));
            });
    });

    function initAccordion() {
        CheckAppUI.createFilterAccordion({
            id: "productos-servicios-filtros",
            selector: "#accordionFiltrosProductosServicios",
            open: true,
            emptySummaryText: "Sin filtros activos"
        });
    }

    function initEvents() {
        $(document).on("click", "[data-ps-row-actions-toggle]", function (event) {
            event.preventDefault();
            event.stopPropagation();

            const rowId = String($(this).attr("data-ps-row-actions-toggle") || "").trim();
            if (!rowId) {
                return;
            }

            if (state.actionsMenu.openRowId === rowId) {
                closeActionsMenu();
                return;
            }

            openActionsMenu(rowId, this);
        });

        $(document).on("click", "[data-ps-row-action]", function (event) {
            event.preventDefault();
            event.stopPropagation();

            const action = String($(this).attr("data-ps-row-action") || "").trim();
            const rowId = String($(this).attr("data-ps-row-id") || "").trim();
            if (!action || !rowId) {
                return;
            }

            closeActionsMenu();
            runRowAction(action, rowId);
        });

        $("#btBuscarProductosServicios").on("click", function () {
            updateFilterSummary();
            loadSummary();
            CheckAppUI.reloadGrid(gridId);
        });

        $("#btLimpiarProductosServicios").on("click", clearFilters);
        $("#btNuevoProductoServicio").on("click", openCreateModal);
        $("#btGuardarProductoServicio").on("click", saveProductoServicio);
        $("#btGuardarQuickCatalogoProductoServicio").on("click", saveQuickCatalog);
        $("#btQuickAddCategoriaProductoServicio").on("click", function () { openQuickCatalogModal("categoria"); });
        $("#btQuickAddMarcaProductoServicio").on("click", function () { openQuickCatalogModal("marca"); });
        $("#btQuickAddUnidadProductoServicio").on("click", function () { openQuickCatalogModal("unidad"); });
        $("#btQuickAddColeccionProductoServicio").on("click", function () { openCollectionModal(); });
        $("#btQuickAddPaqueteProductoServicio").on("click", function () { openPackageModal(); });
        $("#btQuickAddAtributoProductoServicio").on("click", function () { openAttributeModal(); });
        $("#btGuardarColeccionProductoServicio").on("click", saveCollection);
        $("#btGuardarPaqueteProductoServicio").on("click", savePackage);
        $("#btGuardarAtributoProductoServicio").on("click", saveAttributeCatalog);
        $("#btGuardarAtributoValorProductoServicio").on("click", saveAttributeValueCatalog);
        $("#btDescargarFichaTecnicaProductoServicio").on("click", downloadFichaTecnicaPdf);
        $("#btPrecioUnitarioResumenProductoServicio").on("click", toggleUnitPricePopover);
        $("#btLimpiarPrecioUnitarioProductoServicio").on("click", clearUnitPriceEditor);
        $("#btCancelarPrecioUnitarioProductoServicio").on("click", cancelUnitPriceEditor);
        $("#btAceptarPrecioUnitarioProductoServicio").on("click", applyUnitPriceEditor);

        $("#txBusquedaProductosServicios").on("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                $("#btBuscarProductosServicios").trigger("click");
            }
        });

        $(document).on("click", "[data-summary-type]", function () {
            state.summaryType = String($(this).data("summaryType") || "");
            $("#cbFiltroTipoProductoServicio").val(state.summaryType).trigger("change");
            syncSummarySelection();
            updateFilterSummary();
            loadSummary();
            CheckAppUI.reloadGrid(gridId);
        });

        $("#cbTipoProductoServicio").on("change", function () {
            syncCategoryOptions();
            syncTypeVisibility();
            clearFieldError("#cbTipoProductoServicio");
        });

        $("#cbPaqueteProductoServicio").on("change", renderLogisticsSummary);

        $("#swActivoProductoServicio").on("change", syncStatusSwitchUi);

        $("#chkCausaInventarioProductoServicio, #chkEsProductoFisicoProductoServicio").on("change", syncTypeVisibility);

        $("#frmProductoServicio input, #frmProductoServicio textarea").on("input", function () {
            clearFieldError("#" + this.id);
        });
        $("#frmProductoServicio select").on("change", function () {
            clearFieldError("#" + this.id);
        });
        $("#txPrecioUnitarioMontoProductoServicio, #txPrecioUnitarioBaseProductoServicio").on("input", updateUnitPriceSummary);
        $("#txPesoKgProductoServicio").on("input", renderLogisticsSummary);
        $("#cbPrecioUnitarioUnidadProductoServicio").on("change", updateUnitPriceSummary);
        $("#frmQuickCatalogoProductoServicio input, #frmQuickCatalogoProductoServicio textarea").on("input", function () {
            clearQuickCatalogFieldError("#" + this.id);
        });
        $("#frmQuickCatalogoProductoServicio select").on("change", function () {
            clearQuickCatalogFieldError("#" + this.id);
        });

        $("#btCambiarImagenProductoServicio").on("click", function () {
            $("#flImagenProductoServicio").trigger("click");
        });
        $("#btEliminarImagenProductoServicio").on("click", removeCurrentImage);
        $("#flImagenProductoServicio").on("change", handleImageSelection);

        $("#btElegirFotoProductoServicio").on("click", function () { $("#flFotosProductoServicio").trigger("click"); });
        $("#btTomarFotoProductoServicio").on("click", function () { $("#flFotosCapturaProductoServicio").trigger("click"); });
        $("#btElegirVideoProductoServicio").on("click", function () { $("#flVideoProductoServicio").trigger("click"); });
        $("#btGrabarVideoProductoServicio").on("click", function () { $("#flVideoCapturaProductoServicio").trigger("click"); });
        $("#btAgregarDocumentosProductoServicio").on("click", function () { $("#flDocumentosProductoServicio").trigger("click"); });

        $("#flFotosProductoServicio, #flFotosCapturaProductoServicio").on("change", function (event) {
            addMultimediaFiles("foto", event.target.files);
            event.target.value = "";
        });
        $("#flVideoProductoServicio, #flVideoCapturaProductoServicio").on("change", function (event) {
            addMultimediaFiles("video", event.target.files);
            event.target.value = "";
        });
        $("#flDocumentosProductoServicio").on("change", function (event) {
            addMultimediaFiles("documento", event.target.files);
            event.target.value = "";
        });

        $("#modalProductoServicio").on("hidden.bs.modal", function () {
            cleanupDraftImageOnClose();
            cleanupVariantImagesOnClose();
            cleanupMultimediaOnClose();
            resetSaveUi();
            closeUnitPricePopover();
            resetModal();
        });

        $("#modalQuickCatalogoProductoServicio").on("hidden.bs.modal", resetQuickCatalogModal);
        $("#modalColeccionProductoServicio").on("hidden.bs.modal", resetCollectionModal);
        $("#modalPaqueteProductoServicio").on("hidden.bs.modal", resetPackageModal);
        $("#modalAtributoProductoServicio").on("hidden.bs.modal", resetAttributeModal);
        $("#modalAtributoValorProductoServicio").on("hidden.bs.modal", resetAttributeValueModal);

        $(document).on("click", "[data-ps-toggle-header]", function (event) {
            if (shouldIgnoreHeaderToggle(event)) {
                return;
            }

            const section = String($(this).data("psToggleHeader") || "");
            if (!section) {
                return;
            }

            setModalSectionCollapsed(section, !state.modalSections[section]);
        });

        $(document).on("keydown", "[data-ps-toggle-header]", function (event) {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }

            if (shouldIgnoreHeaderToggle(event)) {
                return;
            }

            event.preventDefault();
            const section = String($(this).data("psToggleHeader") || "");
            if (!section) {
                return;
            }

            setModalSectionCollapsed(section, !state.modalSections[section]);
        });

        $(document).on("click", "[data-ps-toggle-section]", function () {
            const section = String($(this).data("psToggleSection") || "");
            if (!section) {
                return;
            }

            setModalSectionCollapsed(section, !state.modalSections[section]);
        });

        $(document).on("mousedown", function (event) {
            if (shouldCloseActionsMenu(event.target)) {
                closeActionsMenu();
            }

            if (!state.unitPricePopoverOpen) {
                const tagsHost = document.getElementById("psTagsControlProductoServicio");
                if (state.tagsPopoverOpen && tagsHost && !tagsHost.contains(event.target)) {
                    closeTagsPopover();
                }
            } else {
                const host = document.querySelector(".ps-unit-price-shell");
                if (host && !host.contains(event.target)) {
                    closeUnitPricePopover();
                }
            }
        });

        $(window).on("resize", function () {
            if (state.unitPricePopoverOpen) {
                syncUnitPricePopoverLayout();
            }
        });

        $("#modalProductoServicio .modal-body").on("scroll", function () {
            if (state.unitPricePopoverOpen) {
                syncUnitPricePopoverLayout();
            }
        });

        $(document).on("click", "[data-ps-attribute-remove]", function () {
            const key = String($(this).data("psAttributeRemove") || "");
            state.attributeRows = state.attributeRows.filter(function (item) { return item.rowKey !== key; });
            renderAttributesEditor();
        });

        $(document).on("change", "#cbAtributoProductoServicioRelacion", function () {
            const idAtributo = normalizeGuid(this.value);
            state.attributeDraft.idAtributo = idAtributo || "";
            state.attributeDraft.idAtributoValor = "";
            renderAttributesEditor();
            ensureAttributeValuesLoaded(idAtributo)
                .then(renderAttributesEditor)
                .catch(function () { });
        });

        $(document).on("change", "#cbElementoAtributoProductoServicioRelacion", function () {
            state.attributeDraft.idAtributoValor = normalizeGuid(this.value) || "";
            renderAttributesEditor();
        });

        $(document).on("click", "#btAgregarRelacionAtributoProductoServicio", function () {
            addCurrentAttributeRelation();
        });

        $(document).on("click", "#btQuickAddAtributoFilaProductoServicio", function () {
            openAttributeModal();
        });

        $(document).on("click", "#btQuickAddAtributoValorFilaProductoServicio", function () {
            const idAtributo = normalizeGuid(state.attributeDraft.idAtributo);
            if (!idAtributo) {
                showError("Selecciona primero un atributo para poder registrar su elemento.");
                return;
            }

            openAttributeValueModal("", idAtributo);
        });

        $(document).on("click", "[data-ps-variant-add-option]", function () {
            state.variantOptionRows.push(createVariantOptionRow({ isEditing: true }));
            renderVariantOptionsEditor({
                focusOptionKey: state.variantOptionRows[state.variantOptionRows.length - 1].rowKey,
                focusTarget: "name"
            });
            syncVariantsWithOptions();
        });

        $(document).on("click", "[data-ps-variant-option-remove]", function () {
            const key = String($(this).data("psVariantOptionRemove") || "");
            state.variantOptionRows = state.variantOptionRows.filter(function (item) { return item.rowKey !== key; });
            renderVariantOptionsEditor();
            syncVariantsWithOptions();
        });

        $(document).on("click", "[data-ps-variant-option-edit]", function () {
            const key = String($(this).data("psVariantOptionEdit") || "");
            const row = findVariantOptionRow(key);
            if (!row) {
                return;
            }

            row.isEditing = true;
            renderVariantOptionsEditor({
                focusOptionKey: row.rowKey,
                focusTarget: "name"
            });
        });

        $(document).on("click", "[data-ps-variant-option-done]", function () {
            const key = String($(this).data("psVariantOptionDone") || "");
            const row = findVariantOptionRow(key);
            if (!row) {
                return;
            }

            row.isEditing = false;
            renderVariantOptionsEditor();
        });

        $(document).on("input", "[data-ps-variant-option-name]", function () {
            const key = String($(this).data("psVariantOptionName") || "");
            const row = findVariantOptionRow(key);
            if (!row) {
                return;
            }

            row.nombre = String($(this).val() || "").trimStart();
            syncVariantsWithOptions();
        });

        $(document).on("click", "[data-ps-variant-option-add-value]", function () {
            const key = String($(this).data("psVariantOptionAddValue") || "");
            const row = findVariantOptionRow(key);
            if (!row) {
                return;
            }

            row.valores.push(createVariantOptionValueRow());
            row.isEditing = true;
            renderVariantOptionsEditor({
                focusOptionKey: row.rowKey,
                focusTarget: "value",
                focusValueKey: row.valores[row.valores.length - 1].rowKey
            });
            syncVariantsWithOptions();
        });

        $(document).on("input", "[data-ps-variant-option-value-input]", function () {
            const key = String($(this).data("psVariantOptionValueInput") || "");
            const valueKey = String($(this).data("psValueKey") || "");
            const row = findVariantOptionRow(key);
            if (!row) {
                return;
            }

            const item = findVariantOptionValueRow(row, valueKey);
            if (!item) {
                return;
            }

            item.valor = String($(this).val() || "");
            syncVariantsWithOptions();
        });

        $(document).on("click", "[data-ps-variant-option-value-remove]", function () {
            const key = String($(this).data("psVariantOptionValueRemove") || "");
            const valueKey = String($(this).data("psValueKey") || "");
            const row = findVariantOptionRow(key);
            if (!row) {
                return;
            }

            row.valores = (row.valores || []).filter(function (item) { return item.rowKey !== valueKey; });
            if (!row.valores.length) {
                row.valores.push(createVariantOptionValueRow());
            }
            renderVariantOptionsEditor();
            syncVariantsWithOptions();
        });

        $(document).on("input change", "[data-ps-variant-field]", function () {
            const key = String($(this).data("psVariantKey") || "");
            const field = String($(this).data("psVariantField") || "");
            const variant = findVariantRow(key);
            if (!variant) {
                return;
            }

            if (field === "costo" || field === "precioPublico" || field === "precioComparacion" || field === "precioUnitarioMonto" || field === "precioUnitarioBaseCantidad") {
                variant[field] = toNullableNumber($(this).val());
            } else {
                variant[field] = ($(this).val() || "").trim();
            }
        });

        $(document).on("click", "[data-ps-variant-image-select]", function () {
            if (state.isSaving) {
                return;
            }

            const row = findVariantRow(String($(this).data("psVariantImageSelect") || ""));
            if (!row) {
                return;
            }

            const input = document.querySelector("[data-ps-variant-image-input='" + row.rowKey + "']");
            if (input) {
                input.click();
            }
        });

        $(document).on("change", "[data-ps-variant-image-input]", handleVariantImageSelection);

        $(document).on("click", "[data-ps-variant-image-remove]", function () {
            const row = findVariantRow(String($(this).data("psVariantImageRemove") || ""));
            if (!row || row.isUploadingImage || state.isSaving) {
                return;
            }

            cleanupVariantImageRow(row);
            row.imageDraft = null;
            if (row.existingImage) {
                row.existingImage = null;
                row.removeExistingImage = true;
            } else {
                row.removeExistingImage = false;
            }

            renderVariantsEditor();
        });

        $(document).on("click", "[data-ps-media-remove]", function () {
            removeMultimediaItem(String($(this).data("psMediaTipo") || ""), String($(this).data("psMediaRemove") || ""));
        });

        $(document).on("click", "[data-ps-media-retry]", function () {
            retryMultimediaItem(String($(this).data("psMediaTipo") || ""), String($(this).data("psMediaRetry") || ""));
        });

        $(document).on("click", "[data-ps-tags-toggle]", function (event) {
            event.preventDefault();
            event.stopPropagation();
            toggleTagsPopover();
        });

        $(document).on("keydown", "[data-ps-tags-toggle]", function (event) {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }

            event.preventDefault();
            toggleTagsPopover();
        });

        $(document).on("click", "[data-ps-tag-remove]", function (event) {
            event.preventDefault();
            event.stopPropagation();
            removeSelectedTag(String($(this).data("psTagRemove") || ""));
        });

        $(document).on("input", "#txBusquedaTagsProductoServicio", function () {
            state.tagSearch = normalizeTagSearch($(this).val());
            renderTagsControl();
        });

        $(document).on("change", "[data-ps-tag-option]", function () {
            toggleTagSelection(String($(this).data("psTagOption") || ""));
        });

        $(document).on("click", "[data-ps-tag-create]", function () {
            createTagFromSearch();
        });
    }

    function initGrid() {
        CheckAppUI.createDynamicGrid({
            id: gridId,
            hostSelector: "#gridProductosServiciosHost",
            tableSelector: "#grProductosServicios",
            searchInputSelector: "#txBusquedaGridProductosServicios",
            exportButtonSelector: "#btExportarProductosServicios",
            columnToggleButtonSelector: "#btColumnasProductosServicios",
            columnTogglePanelSelector: "#panelColumnasProductosServicios",
            resultCountSelector: "#txGridProductosServiciosCount",
            footerRangeSelector: "#txGridProductosServiciosRange",
            footerPageIndicatorSelector: "#txGridProductosServiciosPageIndicator",
            footerPrevButtonSelector: "#btGridProductosServiciosPrev",
            footerNextButtonSelector: "#btGridProductosServiciosNext",
            footerPageSizeSelector: "#txGridProductosServiciosPageSize",
            pageLength: 25,
            lengthMenu: [[25, 50, 100], [25, 50, 100]],
            order: [[4, "asc"]],
            exportSheetName: "ProductosServicios",
            exportFileName: function () {
                return "ProductosServicios_" + formatDateForFile(new Date()) + ".xlsx";
            },
            loadData: function () {
                closeActionsMenu();
                const query = new URLSearchParams();
                appendQuery(query, "busqueda", $("#txBusquedaProductosServicios").val());
                appendQuery(query, "tipo", $("#cbFiltroTipoProductoServicio").val());
                appendQuery(query, "idCategoria", $("#cbFiltroCategoriaProductoServicio").val());
                appendQuery(query, "idMarca", $("#cbFiltroMarcaProductoServicio").val());
                appendQuery(query, "idUnidadMedida", $("#cbFiltroUnidadProductoServicio").val());
                appendQuery(query, "causaInventario", $("#cbFiltroCausaInventario").val());
                appendQuery(query, "estatus", $("#cbFiltroEstatusProductosServicios").val());

                return fetchJson("/ProductosServicios/ObtenerProductosServicios?" + query.toString())
                    .then(function (items) {
                        state.activeRows = Array.isArray(items) ? items : [];
                        state.detailCache = new Map(state.activeRows.map(function (item) { return [item.id, item]; }));
                        return state.activeRows;
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
                        return buildActions(row);
                    }
                },
                {
                    key: "imagenUrl",
                    title: "Imagen",
                    exportValue: function (_value, row) {
                        return row.imagenNombre || "";
                    },
                    render: function (value, row) {
                        if (value) {
                            return "<img class='ps-grid-image' src='" + escapeHtml(value) + "' alt='" + escapeHtml(row.nombre || "Imagen") + "' />";
                        }

                        return "<span class='ps-grid-image-empty'><i class='fa fa-picture-o'></i></span>";
                    }
                },
                { key: "codigo", title: "Código" },
                { key: "tag", title: "Tag" },
                {
                    key: "nombre",
                    title: "Nombre",
                    render: function (value, row) {
                        return "<div class='ps-grid-title'><strong>" + escapeHtml(value || "") + "</strong><small>" + escapeHtml(row.descripcion || "") + "</small></div>";
                    }
                },
                { key: "tipoNombre", title: "Tipo" },
                { key: "categoria", title: "Categoría" },
                {
                    key: "marca",
                    title: "Marca",
                    render: function (value) {
                        return escapeHtml(value || "Sin marca");
                    }
                },
                {
                    key: "unidadMedida",
                    title: "Unidad",
                    exportValue: function (_value, row) {
                        return [row.unidadMedida || "", row.unidadAbreviatura || ""].filter(Boolean).join(" ");
                    },
                    render: function (_value, row) {
                        const parts = [row.unidadMedida || "", row.unidadAbreviatura ? "(" + row.unidadAbreviatura + ")" : ""].filter(Boolean);
                        return escapeHtml(parts.join(" "));
                    }
                },
                {
                    key: "costo",
                    title: "Costo",
                    exportValue: function (value) {
                        return value == null ? "" : Number(value);
                    },
                    render: function (value) {
                        return value == null ? "—" : formatCurrency(value);
                    }
                },
                {
                    key: "precioPublico",
                    title: "Precio Público",
                    exportValue: function (value) {
                        return value == null ? "" : Number(value);
                    },
                    render: function (value) {
                        return formatCurrency(value);
                    }
                },
                {
                    key: "causaInventario",
                    title: "Inventario",
                    exportValue: function (_value, row) {
                        if (row.tipo === 2) {
                            return "Servicio";
                        }

                        return row.causaInventario ? "Inventariable" : "Sin inventario";
                    },
                    render: function (_value, row) {
                        if (row.tipo === 2) {
                            return "<span class='ps-inventory-chip ps-inventory-chip--service'>Servicio</span>";
                        }

                        if (row.causaInventario) {
                            return "<span class='ps-inventory-chip ps-inventory-chip--inventory'>Existencia " + escapeHtml(formatDecimal(row.existenciaActual)) + "</span>";
                        }

                        return "<span class='ps-inventory-chip ps-inventory-chip--disabled'>Sin inventario</span>";
                    }
                },
                {
                    key: "activo",
                    title: "Estatus",
                    exportValue: function (value) {
                        return value ? "Activo" : "Inactivo";
                    },
                    render: function (value) {
                        return value
                            ? "<span class='checkapp-badge checkapp-badge-success'>Activo</span>"
                            : "<span class='checkapp-badge checkapp-badge-muted'>Baja lógica</span>";
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
                $("#txGridPsVisibleCount").text(rows.length + " visibles");
            },
            emptyText: "No hay productos o servicios para los filtros aplicados."
        });
    }

    function loadCombos() {
        return fetchJson("/ProductosServicios/ObtenerCombosProductosServicios")
            .then(function (data) {
                state.combos = decorateComboState(Object.assign({}, state.combos, data || {}));
                populateFilterCombos();
                populateModalCombos();
                renderTagsControl();
                renderLogisticsSummary();
                syncSummarySelection();
                updateFilterSummary();
            });
    }

    function syncStatusSwitchUi() {
        const active = $("#swActivoProductoServicio").is(":checked");
        const copy = document.getElementById("txEstadoProductoServicio");
        if (!copy) {
            return;
        }

        copy.textContent = active ? "Activo" : "Inactivo";
        copy.classList.toggle("is-inactive", !active);
    }

    function normalizeTagName(value) {
        return String(value || "").replace(/\s+/g, " ").trim();
    }

    function normalizeTagSearch(value) {
        return normalizeTagName(value);
    }

    function normalizeTagsFieldContainer() {
        const host = document.getElementById("psTagsControlProductoServicio");
        if (!host) {
            return;
        }

        const field = host.closest("label.ps-form-field--tag");
        if (!field) {
            return;
        }

        const replacement = document.createElement("div");
        Array.from(field.attributes || []).forEach(function (attribute) {
            replacement.setAttribute(attribute.name, attribute.value);
        });

        while (field.firstChild) {
            replacement.appendChild(field.firstChild);
        }

        field.replaceWith(replacement);
    }

    function getTagColorPalette() {
        return [
            { bg: "#eef6ff", border: "#c7defc", text: "#1e40af" },
            { bg: "#effaf3", border: "#bfe6cb", text: "#166534" },
            { bg: "#fff6e8", border: "#f5d7a8", text: "#9a3412" },
            { bg: "#f7f0ff", border: "#d9c2f3", text: "#6b21a8" },
            { bg: "#eef8f7", border: "#bfded8", text: "#0f766e" },
            { bg: "#fff1f2", border: "#f3c3ca", text: "#be123c" }
        ];
    }

    function getTagTone(tag) {
        if (tag && tag.legacy) {
            return { bg: "#fff6e8", border: "#f5d7a8", text: "#9a3412" };
        }

        const key = getTagKey(tag);
        let hash = 0;
        for (let index = 0; index < key.length; index += 1) {
            hash = ((hash * 31) + key.charCodeAt(index)) >>> 0;
        }

        const palette = getTagColorPalette();
        return palette[hash % palette.length];
    }

    function buildTagToneStyle(tag) {
        const tone = getTagTone(tag);
        return [
            "--ps-tag-chip-bg:" + tone.bg,
            "--ps-tag-chip-border:" + tone.border,
            "--ps-tag-chip-text:" + tone.text
        ].join(";");
    }

    function captureTagsFocusState() {
        const activeElement = document.activeElement;
        const searchInput = document.getElementById("txBusquedaTagsProductoServicio");
        const shell = document.querySelector("[data-ps-tags-toggle='1']");
        const createButton = document.querySelector("[data-ps-tag-create='1']");
        const selectedTagOption = activeElement && activeElement.matches("[data-ps-tag-option]")
            ? String(activeElement.getAttribute("data-ps-tag-option") || "")
            : "";
        const tagRemovalKey = activeElement && activeElement.matches("[data-ps-tag-remove]")
            ? String(activeElement.getAttribute("data-ps-tag-remove") || "")
            : "";

        return {
            shellFocused: !!(shell && activeElement === shell),
            searchFocused: !!(searchInput && activeElement === searchInput),
            searchSelectionStart: searchInput && typeof searchInput.selectionStart === "number" ? searchInput.selectionStart : null,
            searchSelectionEnd: searchInput && typeof searchInput.selectionEnd === "number" ? searchInput.selectionEnd : null,
            createFocused: !!(createButton && activeElement === createButton),
            selectedTagOption: selectedTagOption,
            tagRemovalKey: tagRemovalKey
        };
    }

    function restoreTagsFocusState(focusState, options) {
        const shouldFocusSearch = !!(options && options.focusSearch);
        const shouldRestoreSearch = !!(focusState && (focusState.searchFocused || focusState.createFocused || shouldFocusSearch));

        window.requestAnimationFrame(function () {
            const searchInput = document.getElementById("txBusquedaTagsProductoServicio");
            if (shouldRestoreSearch && searchInput) {
                searchInput.focus({ preventScroll: true });
                if (typeof focusState.searchSelectionStart === "number" && typeof focusState.searchSelectionEnd === "number") {
                    searchInput.setSelectionRange(focusState.searchSelectionStart, focusState.searchSelectionEnd);
                } else {
                    const value = searchInput.value || "";
                    searchInput.setSelectionRange(value.length, value.length);
                }
                return;
            }

            if (focusState && focusState.selectedTagOption) {
                const option = document.querySelector("[data-ps-tag-option='" + focusState.selectedTagOption.replace(/'/g, "\\'") + "']");
                if (option) {
                    option.focus({ preventScroll: true });
                    return;
                }
            }

            if (focusState && focusState.tagRemovalKey) {
                const removeButton = document.querySelector("[data-ps-tag-remove='" + focusState.tagRemovalKey.replace(/'/g, "\\'") + "']");
                if (removeButton) {
                    removeButton.focus({ preventScroll: true });
                    return;
                }
            }

            if (focusState && focusState.shellFocused) {
                const shell = document.querySelector("[data-ps-tags-toggle='1']");
                if (shell) {
                    shell.focus({ preventScroll: true });
                }
            }
        });

        $(document).on("keydown", function (event) {
            if (event.key === "Escape") {
                closeActionsMenu();
            }
        });

        window.addEventListener("resize", closeActionsMenu);
        document.addEventListener("scroll", closeActionsMenu, true);
    }

    function getTagKey(tag) {
        if (tag && tag.id) {
            return "id:" + String(tag.id).toLowerCase();
        }

        return "name:" + normalizeTagName(tag && tag.nombre).toLowerCase();
    }

    function getTagIdentity(tag) {
        const normalizedName = normalizeTagName(tag && tag.nombre).toLowerCase();
        if (normalizedName) {
            return "name:" + normalizedName;
        }

        const normalizedId = String(tag && tag.id || "").trim().toLowerCase();
        return normalizedId ? "id:" + normalizedId : "";
    }

    function normalizeSelectedTag(tag) {
        const normalizedName = normalizeTagName(tag && tag.nombre);
        const normalizedId = String(tag && tag.id || "").trim();
        const catalogItem = (state.combos.tags || []).find(function (item) {
            const sameId = normalizedId && String(item && item.id || "").trim().toLowerCase() === normalizedId.toLowerCase();
            const sameName = normalizedName && normalizeTagName(item && item.nombre).toLowerCase() === normalizedName.toLowerCase();
            return sameId || sameName;
        });

        return {
            id: normalizedId || String(catalogItem && catalogItem.id || "").trim(),
            nombre: normalizedName || normalizeTagName(catalogItem && catalogItem.nombre),
            legacy: !!(tag && tag.legacy && !(catalogItem && catalogItem.id))
        };
    }

    function setSelectedTags(items) {
        const deduped = [];
        const seen = new Set();

        (items || []).forEach(function (item) {
            const normalized = normalizeSelectedTag(item);
            if (!normalized.nombre && !normalized.id) {
                return;
            }

            const identity = getTagIdentity(normalized);
            if (!identity || seen.has(identity)) {
                return;
            }

            seen.add(identity);
            deduped.push(normalized);
        });

        state.selectedTags = deduped;
        syncLegacyTagValue();
    }

    function addSelectedTag(tag) {
        const next = state.selectedTags.slice();
        next.push(tag);
        setSelectedTags(next);
    }

    function isSelectedTag(tag) {
        const identity = getTagIdentity(tag);
        return !!identity && state.selectedTags.some(function (item) { return getTagIdentity(item) === identity; });
    }

    function syncLegacyTagValue() {
        const normalizedLegacy = normalizeTagName(state.legacyTagValue);
        const stillSelected = state.selectedTags.some(function (item) {
            return normalizeTagName(item.nombre).toLowerCase() === normalizedLegacy.toLowerCase();
        });

        if (!stillSelected) {
            state.legacyTagValue = "";
        }

        $("#txTagProductoServicioLegacy").val(state.legacyTagValue || "");
    }

    function hydrateTagsFromServer(items, legacyTag) {
        const selected = (items || []).map(function (item) {
            return {
                id: item.id || "",
                nombre: normalizeTagName(item.nombre),
                legacy: !!item.legacy
            };
        }).filter(function (item) { return !!item.nombre; });

        const normalizedLegacy = normalizeTagName(legacyTag);
        state.legacyTagValue = normalizedLegacy;

        if (!selected.length && normalizedLegacy) {
            const existing = (state.combos.tags || []).find(function (item) {
                return normalizeTagName(item.nombre).toLowerCase() === normalizedLegacy.toLowerCase();
            });

            selected.push({
                id: existing && existing.id ? existing.id : "",
                nombre: existing && existing.nombre ? normalizeTagName(existing.nombre) : normalizedLegacy,
                legacy: true
            });
        }

        setSelectedTags(selected);
        state.tagSearch = "";
        renderTagsControl();
    }

    function closeTagsPopover() {
        if (!state.tagsPopoverOpen) {
            return;
        }

        state.tagsPopoverOpen = false;
        state.tagSearch = "";
        renderTagsControl();
    }

    function toggleTagsPopover() {
        state.tagsPopoverOpen = !state.tagsPopoverOpen;
        if (!state.tagsPopoverOpen) {
            state.tagSearch = "";
        }

        renderTagsControl({ focusSearch: state.tagsPopoverOpen });
    }

    function removeSelectedTag(key) {
        state.selectedTags = state.selectedTags.filter(function (item) { return getTagKey(item) !== key; });
        setSelectedTags(state.selectedTags);
        renderTagsControl({ focusSearch: state.tagsPopoverOpen });
    }

    function toggleTagSelection(key) {
        const catalogItem = (state.combos.tags || []).find(function (item) {
            return getTagKey({ id: item.id, nombre: item.nombre }) === key;
        });

        if (!catalogItem) {
            return;
        }

        if (state.selectedTags.some(function (item) { return getTagIdentity(item) === getTagIdentity(catalogItem); })) {
            removeSelectedTag(key);
            return;
        }

        addSelectedTag({
            id: catalogItem.id || "",
            nombre: normalizeTagName(catalogItem.nombre),
            legacy: false
        });
        renderTagsControl({ focusSearch: state.tagsPopoverOpen });
    }

    function createTagFromSearch() {
        const nombre = normalizeTagName(state.tagSearch);
        if (!nombre || state.tagSaving) {
            return;
        }

        state.tagSaving = true;
        renderTagsControl({ focusSearch: true });

        fetchJson("/ProductosServicios/GuardarTagProductoServicio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: nombre })
        }).then(function (data) {
            const tag = data && data.tag ? data.tag : null;
            if (!tag || !tag.id) {
                throw new Error(resolveServerMessage(data) || "No fue posible guardar la etiqueta.");
            }

            const existsInCatalog = (state.combos.tags || []).some(function (item) {
                return String(item.id || "").toLowerCase() === String(tag.id || "").toLowerCase();
            });

            if (!existsInCatalog) {
                state.combos.tags.push(tag);
                state.combos.tags.sort(function (a, b) {
                    return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es-MX", { sensitivity: "base" });
                });
            }

            const normalizedTag = {
                id: tag.id || "",
                nombre: normalizeTagName(tag.nombre),
                legacy: false
            };
            if (!state.selectedTags.some(function (item) { return getTagIdentity(item) === getTagIdentity(normalizedTag); })) {
                addSelectedTag({
                    id: tag.id || "",
                    nombre: normalizeTagName(tag.nombre),
                    legacy: false
                });
            }

            state.tagSearch = "";
            renderTagsControl({ focusSearch: true });
        }).catch(function (error) {
            showError(resolveErrorMessage(error));
        }).finally(function () {
            state.tagSaving = false;
            renderTagsControl({ focusSearch: true });
        });
    }

    function buildTagsPayload() {
        const seen = new Set();
        return state.selectedTags
            .map(function (item) {
                return {
                    id: item.id || null,
                    nombre: normalizeTagName(item.nombre)
                };
            })
            .filter(function (item) {
                const key = (item.id ? "id:" + String(item.id).toLowerCase() : "name:" + item.nombre.toLowerCase());
                if (!item.id && !item.nombre) {
                    return false;
                }
                if (seen.has(key)) {
                    return false;
                }
                seen.add(key);
                return true;
            });
    }

    function renderTagsControl(options) {
        normalizeTagsFieldContainer();

        const host = document.getElementById("psTagsControlProductoServicio");
        if (!host) {
            return;
        }

        const focusState = captureTagsFocusState();

        const normalizedSearch = normalizeTagSearch(state.tagSearch);
        const catalog = (state.combos.tags || []).slice().sort(function (a, b) {
            return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es-MX", { sensitivity: "base" });
        });
        const filtered = normalizedSearch
            ? catalog.filter(function (item) {
                return normalizeTagName(item.nombre).toLowerCase().includes(normalizedSearch.toLowerCase());
            })
            : catalog;
        const canCreate = !!normalizedSearch && !catalog.some(function (item) {
            return normalizeTagName(item.nombre).toLowerCase() === normalizedSearch.toLowerCase();
        });

        const chipsHtml = state.selectedTags.length
            ? state.selectedTags.map(function (item) {
                return "<span class='ps-tag-chip" + (item.legacy ? " is-legacy" : "") + "' style='" + escapeHtml(buildTagToneStyle(item)) + "'>" +
                    "<span>" + escapeHtml(item.nombre) + "</span>" +
                    "<button type='button' data-ps-tag-remove='" + escapeHtml(getTagKey(item)) + "' aria-label='Quitar etiqueta'><i class='fa fa-times'></i></button>" +
                    "</span>";
            }).join("")
            : "<span class='ps-tags-placeholder'>Agregar etiquetas</span>";

        const optionsHtml = filtered.length
            ? filtered.map(function (item) {
                const key = getTagKey({ id: item.id, nombre: item.nombre });
                const checked = isSelectedTag(item);
                return "<label class='ps-tags-option'>" +
                    "<input type='checkbox' data-ps-tag-option='" + escapeHtml(key) + "'" + (checked ? " checked" : "") + " />" +
                    "<span>" + escapeHtml(item.nombre || "") + "</span>" +
                    "</label>";
            }).join("")
            : "<div class='ps-tags-list-empty'>No hay etiquetas disponibles.</div>";

        host.innerHTML = "" +
            "<div class='ps-tags-shell" + (state.tagsPopoverOpen ? " is-open" : "") + "' data-ps-tags-toggle='1' tabindex='0' role='button' aria-expanded='" + (state.tagsPopoverOpen ? "true" : "false") + "'>" +
            "  <div class='ps-tags-value'>" + chipsHtml + "</div>" +
            "  <button type='button' class='ps-tags-trigger' tabindex='-1' aria-hidden='true'><i class='fa fa-plus'></i></button>" +
            "</div>" +
            (state.tagsPopoverOpen
                ? "<div class='ps-tags-popover'>" +
                    "  <div class='ps-tags-search'>" +
                    "    <input id='txBusquedaTagsProductoServicio' type='text' class='form-control' placeholder='Buscar o agregar etiqueta' value='" + escapeHtml(state.tagSearch || "") + "' />" +
                    (canCreate
                        ? "<button type='button' class='checkapp-btn checkapp-btn-ghost ps-tags-search-action' data-ps-tag-create='1' " + (state.tagSaving ? "disabled" : "") + "><i class='fa fa-plus-circle'></i><span>Agregar \"" + escapeHtml(normalizedSearch) + "\"</span></button>"
                        : "") +
                    "  </div>" +
                    "  <div class='ps-tags-list'>" + optionsHtml + "</div>" +
                    "</div>"
                : "");

        restoreTagsFocusState(focusState, options);
    }

    function loadSummary() {
        return fetchJson("/ProductosServicios/ObtenerResumenProductosServicios")
            .then(function (data) {
                $("#txResumenPsTotal").text(data.totalRegistros || 0);
                $("#txResumenPsProductos").text(data.totalProductos || 0);
                $("#txResumenPsServicios").text(data.totalServicios || 0);
            })
            .catch(function () {
                $("#txResumenPsTotal").text("0");
                $("#txResumenPsProductos").text("0");
                $("#txResumenPsServicios").text("0");
            });
    }

    function populateFilterCombos() {
        fillSelect("#cbFiltroTipoProductoServicio", state.combos.tipos, {
            includeBlank: true,
            blankText: "Todos",
            valueKey: "clave",
            textKey: "nombre",
            selectedValue: state.summaryType
        });
        fillSelect("#cbFiltroCategoriaProductoServicio", state.combos.categorias, {
            includeBlank: true,
            blankText: "Todas",
            valueKey: "id",
            textKey: "displayName"
        });
        fillSelect("#cbFiltroMarcaProductoServicio", state.combos.marcas, {
            includeBlank: true,
            blankText: "Todas",
            valueKey: "id",
            textKey: "displayName"
        });
        fillSelect("#cbFiltroUnidadProductoServicio", state.combos.unidadesMedida, {
            includeBlank: true,
            blankText: "Todas",
            valueKey: "id",
            textKey: "displayName"
        });
        fillSelect("#cbFiltroEstatusProductosServicios", state.combos.estatus, {
            includeBlank: true,
            blankText: "Todos",
            valueKey: "clave",
            textKey: "nombre"
        });

        initSelect2("#cbFiltroTipoProductoServicio", "Todos");
        initSelect2("#cbFiltroCategoriaProductoServicio", "Todas");
        initSelect2("#cbFiltroMarcaProductoServicio", "Todas");
        initSelect2("#cbFiltroUnidadProductoServicio", "Todas");
        initSelect2("#cbFiltroEstatusProductosServicios", "Todos");
    }

    function populateModalCombos() {
        fillSelect("#cbTipoProductoServicio", state.combos.tipos, {
            includeBlank: true,
            blankText: "Selecciona un tipo",
            valueKey: "clave",
            textKey: "nombre"
        });
        fillSelect("#cbMarcaProductoServicio", state.combos.marcas, {
            includeBlank: true,
            blankText: "Sin marca",
            valueKey: "id",
            textKey: "displayName"
        });
        fillSelect("#cbUnidadProductoServicio", state.combos.unidadesMedida, {
            includeBlank: true,
            blankText: "Selecciona una unidad",
            valueKey: "id",
            textKey: "displayName"
        });
        fillSelect("#cbColeccionProductoServicio", state.combos.colecciones, {
            includeBlank: true,
            blankText: "Sin colección",
            valueKey: "id",
            textKey: "displayName"
        });
        fillSelect("#cbPaqueteProductoServicio", state.combos.paquetes, {
            includeBlank: true,
            blankText: "Sin paquete",
            valueKey: "id",
            textKey: "displayName"
        });
        fillSelect("#cbObjetoImpuestoProductoServicio", state.combos.objetosImpuesto, {
            includeBlank: true,
            blankText: "Sin capturar",
            valueKey: "clave",
            textKey: "nombre"
        });
        fillSelect("#cbPrecioUnitarioUnidadProductoServicio", state.combos.unidadesPrecioUnitario, {
            includeBlank: true,
            blankText: "Sin unidad",
            valueKey: "clave",
            textKey: "nombre"
        });
        fillSelect("#cbTipoPaqueteProductoServicio", state.combos.tiposPaquete, {
            includeBlank: false,
            valueKey: "clave",
            textKey: "nombre"
        });
        syncCategoryOptions();

        initSelect2("#cbTipoProductoServicio", "Selecciona un tipo", $("#modalProductoServicio"));
        initSelect2("#cbCategoriaProductoServicio", "Selecciona una categoría", $("#modalProductoServicio"));
        initSelect2("#cbMarcaProductoServicio", "Sin marca", $("#modalProductoServicio"));
        initSelect2("#cbUnidadProductoServicio", "Selecciona una unidad", $("#modalProductoServicio"));
        initSelect2("#cbColeccionProductoServicio", "Sin colección", $("#modalProductoServicio"));
        initSelect2("#cbPaqueteProductoServicio", "Sin paquete", $("#modalProductoServicio"));
        initSelect2("#cbObjetoImpuestoProductoServicio", "Sin capturar", $("#modalProductoServicio"));
        initSelect2("#cbPrecioUnitarioUnidadProductoServicio", "Sin unidad", $("#modalProductoServicio"));
        initSelect2("#cbTipoPaqueteProductoServicio", "Selecciona un tipo", $("#modalPaqueteProductoServicio"));
        initSatSelect("#cbClaveProductoSatProductoServicio", "producto", "Busca clave o descripción SAT");
        initSatSelect("#cbClaveUnidadSatProductoServicio", "unidad", "Busca clave o unidad SAT");
    }

    function getSelectedTipoProductoServicio() {
        const rawValue = ($("#cbTipoProductoServicio").val() || "").trim();
        if (!rawValue) {
            return null;
        }

        const parsed = Number(rawValue);
        return Number.isFinite(parsed) ? parsed : null;
    }

    function syncCategoryOptions(selectedValue) {
        const tipo = getSelectedTipoProductoServicio();
        const categorias = (state.combos.categorias || []).filter(function (item) {
            return tipo == null || item.aplicaA === 0 || item.aplicaA === tipo;
        });

        fillSelect("#cbCategoriaProductoServicio", categorias, {
            includeBlank: true,
            blankText: "Selecciona una categoría",
            valueKey: "id",
            textKey: "displayName",
            selectedValue: selectedValue || $("#cbCategoriaProductoServicio").val()
        });
    }

    function fillSelect(selector, items, config) {
        const options = Object.assign({
            includeBlank: false,
            blankText: "",
            valueKey: "id",
            textKey: "text",
            selectedValue: ""
        }, config || {});

        const node = document.querySelector(selector);
        if (!node) {
            return;
        }

        const currentValue = options.selectedValue || "";
        node.innerHTML = "";

        if (options.includeBlank) {
            const blank = document.createElement("option");
            blank.value = "";
            blank.textContent = options.blankText;
            node.appendChild(blank);
        }

        (items || []).forEach(function (item) {
            const option = document.createElement("option");
            option.value = item[options.valueKey] != null ? String(item[options.valueKey]) : "";
            option.textContent = resolveSelectText(item, options.textKey);
            node.appendChild(option);
        });

        if (currentValue) {
            node.value = currentValue;
        } else if (!options.includeBlank && node.options.length > 0) {
            node.selectedIndex = 0;
        }
    }

    function decorateComboState(combos) {
        const next = Object.assign({}, combos || {});
        next.categorias = decorateDuplicateComboDisplay(next.categorias, "categoria");
        next.marcas = decorateDuplicateComboDisplay(next.marcas, "marca");
        next.colecciones = decorateDuplicateComboDisplay(next.colecciones, "coleccion");
        next.unidadesMedida = decorateDuplicateComboDisplay(next.unidadesMedida, "unidad");
        return next;
    }

    function decorateDuplicateComboDisplay(items, kind) {
        const source = Array.isArray(items) ? items : [];
        const duplicateNames = countDuplicateKeys(source, function (item) {
            return normalizeCatalogCompareValue(item && item.nombre);
        });

        return source.map(function (item) {
            const copy = Object.assign({}, item);
            const normalizedName = normalizeCatalogCompareValue(copy.nombre);
            if (!normalizedName || !duplicateNames.has(normalizedName)) {
                copy.displayName = copy.nombre || "";
                return copy;
            }

            switch (kind) {
                case "categoria":
                    copy.displayName = [copy.nombre, resolveAplicaAText(copy.aplicaA), copy.codigo].filter(Boolean).join(" · ");
                    break;
                case "marca":
                    copy.displayName = [copy.nombre, copy.codigo].filter(Boolean).join(" · ");
                    break;
                case "coleccion":
                    copy.displayName = [copy.nombre, copy.numero].filter(Boolean).join(" · ");
                    break;
                case "unidad":
                    copy.displayName = [copy.nombre, copy.codigo].filter(Boolean).join(" · ");
                    break;
                default:
                    copy.displayName = copy.nombre || "";
                    break;
            }

            return copy;
        });
    }

    function countDuplicateKeys(items, keySelector) {
        const counts = new Map();
        (items || []).forEach(function (item) {
            const key = keySelector(item);
            if (!key) {
                return;
            }
            counts.set(key, (counts.get(key) || 0) + 1);
        });

        const duplicates = new Set();
        counts.forEach(function (count, key) {
            if (count > 1) {
                duplicates.add(key);
            }
        });
        return duplicates;
    }

    function resolveAplicaAText(value) {
        switch (Number(value)) {
            case 1:
                return "Producto";
            case 2:
                return "Servicio";
            case 0:
                return "Todos";
            default:
                return "";
        }
    }

    function resolveSelectText(item, textKey) {
        if (item.displayName && (textKey === "displayName" || textKey === "nombre")) {
            return String(item.displayName);
        }

        if (item[textKey] != null) {
            return String(item[textKey]);
        }

        if (textKey === "displayName") {
            if (item.numero) {
                return item.numero + " · " + (item.nombre || "");
            }

            if (item.tipoPaquete) {
                return buildPackageDisplayName(item);
            }
        }

        return String(item.nombre || "");
    }

    function buildPackageDisplayName(item) {
        const parts = [];
        const nombre = String(item.nombre || "").trim();
        const tipo = String(item.tipoPaquete || "").trim();
        const dimensiones = [item.largoCm, item.anchoCm, item.altoCm]
            .filter(function (value) { return value != null && value !== ""; })
            .map(function (value) { return formatMeasure(value, 2); });

        if (nombre) {
            parts.push(nombre);
        }

        if (tipo) {
            parts.push(capitalize(tipo));
        }

        if (dimensiones.length === 3) {
            parts.push(dimensiones.join(" × ") + " cm");
        }

        if (item.pesoEmpaqueVacioKg != null && item.pesoEmpaqueVacioKg !== "") {
            parts.push(formatMeasure(item.pesoEmpaqueVacioKg, 5) + " kg vacío");
        }

        if (item.esPredeterminado) {
            parts.push("Predeterminado");
        }

        return parts.filter(Boolean).join(" · ") || "Paquete";
    }

    function getSelectedPackageLogistics() {
        const selectedId = String($("#cbPaqueteProductoServicio").val() || "").trim();
        if (!selectedId) {
            return null;
        }

        return (state.combos.paquetes || []).find(function (item) {
            return String(item && item.id ? item.id : "") === selectedId;
        }) || null;
    }

    function getVolumetricFactor() {
        const factor = Number(state.combos.factorVolumetrico);
        return Number.isFinite(factor) && factor > 0 ? factor : null;
    }

    function calculateLogisticsPreview() {
        const tipo = getSelectedTipoProductoServicio() || 1;
        const esProductoFisico = $("#chkEsProductoFisicoProductoServicio").is(":checked");
        if (tipo !== 1 || !esProductoFisico) {
            return {
                pesoFisicoTotalKg: null,
                pesoVolumetricoKg: null,
                pesoFacturableKg: null
            };
        }

        const pesoProductoKg = toNullableNumber($("#txPesoKgProductoServicio").val());
        const paquete = getSelectedPackageLogistics();
        const pesoEmpaqueVacioKg = paquete && paquete.pesoEmpaqueVacioKg != null
            ? Number(paquete.pesoEmpaqueVacioKg)
            : null;
        const largoCm = paquete && paquete.largoCm != null ? Number(paquete.largoCm) : null;
        const anchoCm = paquete && paquete.anchoCm != null ? Number(paquete.anchoCm) : null;
        const altoCm = paquete && paquete.altoCm != null ? Number(paquete.altoCm) : null;

        let pesoFisicoTotalKg = null;
        if (pesoProductoKg != null) {
            pesoFisicoTotalKg = Number(pesoProductoKg) + (pesoEmpaqueVacioKg || 0);
        }

        let pesoVolumetricoKg = null;
        const factorVolumetrico = getVolumetricFactor();
        if (paquete &&
            largoCm != null && largoCm > 0 &&
            anchoCm != null && anchoCm > 0 &&
            altoCm != null && altoCm > 0 &&
            factorVolumetrico != null) {
            pesoVolumetricoKg = (largoCm * anchoCm * altoCm) / factorVolumetrico;
        }

        let pesoFacturableKg = null;
        if (pesoFisicoTotalKg != null && pesoVolumetricoKg != null) {
            pesoFacturableKg = Math.max(pesoFisicoTotalKg, pesoVolumetricoKg);
        } else {
            pesoFacturableKg = pesoFisicoTotalKg != null ? pesoFisicoTotalKg : pesoVolumetricoKg;
        }

        return {
            pesoFisicoTotalKg: pesoFisicoTotalKg,
            pesoVolumetricoKg: pesoVolumetricoKg,
            pesoFacturableKg: pesoFacturableKg
        };
    }

    function formatLogisticsWeight(value) {
        if (value == null || value === "" || !Number.isFinite(Number(value))) {
            return "No disponible";
        }

        return Number(value).toFixed(2) + " kg";
    }

    function renderLogisticsSummary() {
        const physicalNode = document.getElementById("txPesoFisicoTotalProductoServicio");
        const volumetricNode = document.getElementById("txPesoVolumetricoProductoServicio");
        const billableNode = document.getElementById("txPesoFacturableProductoServicio");
        if (!physicalNode || !volumetricNode || !billableNode) {
            return;
        }

        const preview = calculateLogisticsPreview();
        physicalNode.textContent = formatLogisticsWeight(preview.pesoFisicoTotalKg);
        volumetricNode.textContent = formatLogisticsWeight(preview.pesoVolumetricoKg);
        billableNode.textContent = formatLogisticsWeight(preview.pesoFacturableKg);
    }

    function formatMeasure(value, decimals) {
        const number = Number(value);
        if (!Number.isFinite(number)) {
            return "";
        }

        return number.toLocaleString("es-MX", {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimals
        });
    }

    function initSatSelect(selector, tipo, placeholder) {
        if (!window.$ || !$.fn || !$.fn.select2) {
            return;
        }

        const node = $(selector);
        if (!node.length) {
            return;
        }

        if (node.hasClass("select2-hidden-accessible")) {
            node.select2("destroy");
        }

        const normalizedDropdownParent = resolveSelect2DropdownParent($("#modalProductoServicio"));

        node.select2({
            placeholder: placeholder,
            width: "100%",
            allowClear: true,
            dropdownParent: normalizedDropdownParent,
            minimumInputLength: tipo === "producto" ? 2 : 0,
            ajax: {
                delay: 250,
                transport: function (params, success, failure) {
                    const term = params && params.data ? params.data.term || "" : "";
                    const query = new URLSearchParams({
                        tipo: tipo,
                        q: term,
                        take: tipo === "producto" ? "40" : "80"
                    });

                    fetchJson("/ProductosServicios/BuscarCatalogosSatProductoServicio?" + query.toString())
                        .then(success)
                        .catch(function (error) {
                            failure(error);
                        });
                },
                processResults: function (data) {
                    const items = Array.isArray(data && data.items) ? data.items : [];
                    return {
                        results: items.map(function (item) {
                            return {
                                id: item.clave,
                                text: item.nombre
                            };
                        })
                    };
                }
            }
        });
        wireSelect2ClearBehavior(node);
    }

    function ensureSelect2Option(selector, value, text) {
        const normalizedValue = String(value || "").trim();
        if (!normalizedValue) {
            $(selector).val("").trigger("change");
            return;
        }

        const node = $(selector);
        if (!node.find("option[value='" + normalizedValue.replace(/'/g, "\\'") + "']").length) {
            const option = new Option(text || normalizedValue, normalizedValue, true, true);
            node.append(option);
        }

        node.val(normalizedValue).trigger("change");
    }

    function resolveSatOptionText(tipo, value, fallbackText) {
        const normalizedValue = String(value || "").trim();
        const normalizedFallback = String(fallbackText || "").trim();
        if (!normalizedValue) {
            return Promise.resolve("");
        }

        if (normalizedFallback && normalizedFallback !== normalizedValue) {
            return Promise.resolve(normalizedFallback);
        }

        const query = new URLSearchParams({
            tipo: tipo,
            q: normalizedValue,
            take: "20"
        });

        return fetchJson("/ProductosServicios/BuscarCatalogosSatProductoServicio?" + query.toString())
            .then(function (data) {
                const items = Array.isArray(data && data.items) ? data.items : [];
                const match = items.find(function (item) {
                    return String(item && item.clave || "").trim().toUpperCase() === normalizedValue.toUpperCase();
                });

                return match && match.nombre ? match.nombre : (normalizedFallback || normalizedValue);
            })
            .catch(function () {
                return normalizedFallback || normalizedValue;
            });
    }

    function initSelect2(selector, placeholder, dropdownParent) {
        if (!window.$ || !$.fn || !$.fn.select2) {
            return;
        }

        const node = $(selector);
        if (!node.length) {
            return;
        }

        if (node.hasClass("select2-hidden-accessible")) {
            node.select2("destroy");
        }

        const config = {
            placeholder: placeholder,
            width: "100%",
            allowClear: true,
            minimumResultsForSearch: 8
        };

        const normalizedDropdownParent = resolveSelect2DropdownParent(dropdownParent);
        if (normalizedDropdownParent) {
            config.dropdownParent = normalizedDropdownParent;
        }

        node.select2(config);
        wireSelect2ClearBehavior(node);
    }

    function resolveSelect2DropdownParent(dropdownParent) {
        if (!dropdownParent || !dropdownParent.length) {
            return null;
        }

        const modalBody = dropdownParent.hasClass("modal")
            ? dropdownParent.find(".modal-body").first()
            : dropdownParent.closest(".modal").find(".modal-body").first();

        return modalBody.length ? modalBody : dropdownParent;
    }

    function wireSelect2ClearBehavior(node) {
        if (!node || !node.length || !node.select2) {
            return;
        }

        node.off(".psSelect2Clear");
        node.next(".select2-container").off(".psSelect2Clear");

        node.next(".select2-container").on("mousedown.psSelect2Clear", ".select2-selection__clear", function () {
            node.data("ps-clear-pending", true);
        });

        node.on("select2:opening.psSelect2Clear", function (event) {
            if (node.data("ps-clear-pending")) {
                event.preventDefault();
            }
        });

        node.on("select2:clear.psSelect2Clear", function () {
            node.removeData("ps-clear-pending");
            window.setTimeout(function () {
                if (node.hasClass("select2-hidden-accessible")) {
                    node.select2("close");
                }
            }, 0);
        });

        node.on("select2:close.psSelect2Clear select2:select.psSelect2Clear", function () {
            node.removeData("ps-clear-pending");
        });
    }

    function updateFilterSummary() {
        const parts = [];
        const busqueda = ($("#txBusquedaProductosServicios").val() || "").trim();

        pushFilterChip(parts, busqueda, "Búsqueda");
        pushFilterChip(parts, $("#cbFiltroTipoProductoServicio").val(), "Tipo", $("#cbFiltroTipoProductoServicio").find("option:selected").text());
        pushFilterChip(parts, $("#cbFiltroCategoriaProductoServicio").val(), "Categoría", $("#cbFiltroCategoriaProductoServicio").find("option:selected").text());
        pushFilterChip(parts, $("#cbFiltroMarcaProductoServicio").val(), "Marca", $("#cbFiltroMarcaProductoServicio").find("option:selected").text());
        pushFilterChip(parts, $("#cbFiltroUnidadProductoServicio").val(), "Unidad", $("#cbFiltroUnidadProductoServicio").find("option:selected").text());
        pushFilterChip(parts, $("#cbFiltroCausaInventario").val(), "Inventario", $("#cbFiltroCausaInventario").find("option:selected").text());
        pushFilterChip(parts, $("#cbFiltroEstatusProductosServicios").val(), "Estatus", $("#cbFiltroEstatusProductosServicios").find("option:selected").text());

        const accordion = CheckAppUI.getAccordion("productos-servicios-filtros");
        if (accordion) {
            accordion.setSummaryHtml(parts.length ? "<span class='checkapp-summary-inline'>" + parts.join("") + "</span>" : "Sin filtros activos");
        }
    }

    function pushFilterChip(parts, value, label, displayValue) {
        if (!value) {
            return;
        }

        parts.push("<span class='ca-chip ca-chip--secondary'>" + escapeHtml(label) + ": " + escapeHtml(displayValue || value) + "</span>");
    }

    function clearFilters() {
        state.summaryType = "";
        $("#txBusquedaProductosServicios").val("");
        $("#cbFiltroTipoProductoServicio").val("").trigger("change");
        $("#cbFiltroCategoriaProductoServicio").val("").trigger("change");
        $("#cbFiltroMarcaProductoServicio").val("").trigger("change");
        $("#cbFiltroUnidadProductoServicio").val("").trigger("change");
        $("#cbFiltroCausaInventario").val("");
        $("#cbFiltroEstatusProductosServicios").val("").trigger("change");
        syncSummarySelection();
        updateFilterSummary();
        loadSummary();
        CheckAppUI.reloadGrid(gridId);
    }

    function syncSummarySelection() {
        document.querySelectorAll("[data-summary-type]").forEach(function (button) {
            const isSelected = String(button.getAttribute("data-summary-type") || "") === String(state.summaryType || "");
            button.classList.toggle("is-selected", isSelected);
            button.setAttribute("aria-pressed", isSelected ? "true" : "false");
        });
    }

    function buildActions(row) {
        const rowId = escapeHtml(String(row.id || ""));

        return [
            "<div class='ps-action-cell'>",
            "  <button type='button' class='ps-action-trigger' data-ps-row-actions-toggle='" + rowId + "' aria-expanded='false' aria-haspopup='menu' aria-label='Abrir acciones'>",
            "    <i class='fa fa-ellipsis-v' aria-hidden='true'></i>",
            "    <span>Acciones</span>",
            "    <i class='fa fa-chevron-down ps-action-trigger-caret' aria-hidden='true'></i>",
            "  </button>",
            "</div>"
        ].join("");
    }

    function getRowActions(row) {
        const rowId = String(row && row.id ? row.id : "").trim();
        if (!rowId) {
            return [];
        }

        const actions = [
            { key: "ficha", label: "Ficha técnica", iconClass: "fa fa-file-text-o" },
            { key: "editar", label: "Editar", iconClass: "fa fa-edit" },
            { type: "separator" }
        ];

        if (row.activo) {
            actions.push({ key: "baja", label: "Baja lógica", iconClass: "fa fa-ban", danger: true });
        } else {
            actions.push({ key: "reactivar", label: "Reactivar", iconClass: "fa fa-check" });
        }

        return actions;
    }

    function ensureActionsMenuLayer() {
        if (state.actionsMenu.layerElement && document.body.contains(state.actionsMenu.layerElement)) {
            return state.actionsMenu.layerElement;
        }

        const layer = document.createElement("div");
        layer.className = "ps-row-actions-menu-layer";
        layer.setAttribute("hidden", "hidden");
        layer.innerHTML = "<div class='ps-row-actions-menu' role='menu' aria-label='Acciones del registro'></div>";
        document.body.appendChild(layer);
        state.actionsMenu.layerElement = layer;
        return layer;
    }

    function openActionsMenu(rowId, anchorElement) {
        const row = state.detailCache.get(rowId) || state.activeRows.find(function (item) {
            return String(item && item.id ? item.id : "") === rowId;
        });
        if (!row || !anchorElement) {
            closeActionsMenu();
            return;
        }

        const layer = ensureActionsMenuLayer();
        const menu = layer.querySelector(".ps-row-actions-menu");
        if (!menu) {
            return;
        }

        menu.innerHTML = getRowActions(row).map(function (item) {
            if (item.type === "separator") {
                return "<div class='ps-row-actions-separator' role='separator'></div>";
            }

            return [
                "<button type='button' class='ps-row-action-item" + (item.danger ? " is-danger" : "") + "' role='menuitem'",
                " data-ps-row-action='" + escapeHtml(item.key) + "'",
                " data-ps-row-id='" + escapeHtml(rowId) + "'>",
                "  <i class='" + escapeHtml(item.iconClass) + "' aria-hidden='true'></i>",
                "  <span>" + escapeHtml(item.label) + "</span>",
                "</button>"
            ].join("");
        }).join("");

        state.actionsMenu.openRowId = rowId;
        state.actionsMenu.anchorElement = anchorElement;
        layer.hidden = false;
        positionActionsMenu(anchorElement, layer);
        syncActionsMenuTriggers();
    }

    function closeActionsMenu() {
        const layer = state.actionsMenu.layerElement;
        if (layer) {
            layer.hidden = true;
        }

        state.actionsMenu.openRowId = "";
        state.actionsMenu.anchorElement = null;
        syncActionsMenuTriggers();
    }

    function shouldCloseActionsMenu(target) {
        if (!state.actionsMenu.openRowId) {
            return false;
        }

        const layer = state.actionsMenu.layerElement;
        if (layer && layer.contains(target)) {
            return false;
        }

        return !(state.actionsMenu.anchorElement && state.actionsMenu.anchorElement.contains(target));
    }

    function syncActionsMenuTriggers() {
        document.querySelectorAll("[data-ps-row-actions-toggle]").forEach(function (button) {
            const isOpen = String(button.getAttribute("data-ps-row-actions-toggle") || "") === state.actionsMenu.openRowId;
            button.setAttribute("aria-expanded", isOpen ? "true" : "false");
            button.classList.toggle("is-open", isOpen);
        });
    }

    function positionActionsMenu(anchorElement, layer) {
        const menu = layer.querySelector(".ps-row-actions-menu");
        if (!menu || !anchorElement) {
            return;
        }

        const anchorRect = anchorElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        const spacing = 10;
        const padding = 12;

        layer.style.left = "0";
        layer.style.top = "0";
        menu.style.left = "0";
        menu.style.top = "0";

        const menuRect = menu.getBoundingClientRect();
        let left = anchorRect.left;
        let top = anchorRect.bottom + spacing;

        if (left + menuRect.width > viewportWidth - padding) {
            left = anchorRect.right - menuRect.width;
        }

        if (left < padding) {
            left = padding;
        }

        if (top + menuRect.height > viewportHeight - padding) {
            top = anchorRect.top - menuRect.height - spacing;
        }

        if (top < padding) {
            top = padding;
        }

        menu.style.left = Math.round(left) + "px";
        menu.style.top = Math.round(top) + "px";
    }

    function runRowAction(action, rowId) {
        if (action === "ficha") {
            window.verFichaTecnicaProductoServicio(rowId);
            return;
        }

        if (action === "editar") {
            window.editarProductoServicio(rowId);
            return;
        }

        if (action === "baja") {
            window.cambiarEstatusProductoServicio(rowId, false);
            return;
        }

        if (action === "reactivar") {
            window.cambiarEstatusProductoServicio(rowId, true);
        }
    }

    window.verFichaTecnicaProductoServicio = function (id) {
        const normalizedId = String(id || "").trim();
        if (!normalizedId || state.fichaTecnica.loading) {
            return;
        }

        state.fichaModal = state.fichaModal || resolveModalApi("#modalFichaTecnicaProductoServicio");
        if (!state.fichaModal) {
            setStatus("#txInfoProductoServicio", "danger", "No fue posible preparar el modal de la ficha técnica.");
            return;
        }

        state.fichaTecnica.id = normalizedId;
        state.fichaTecnica.detail = null;
        state.fichaTecnica.loading = true;
        renderFichaTecnicaSkeleton();
        setStatus("#txInfoFichaTecnicaProductoServicio", "info", "Cargando ficha técnica...");
        syncFichaTecnicaActions();
        state.fichaModal.show();

        fetchJson("/ProductosServicios/ObtenerFichaTecnicaProductoServicio?idProductoServicio=" + encodeURIComponent(normalizedId))
            .then(function (detail) {
                state.fichaTecnica.detail = detail || null;
                renderFichaTecnicaDetail();
                setStatus("#txInfoFichaTecnicaProductoServicio", "", "");
            })
            .catch(function (error) {
                state.fichaTecnica.detail = null;
                renderFichaTecnicaEmpty();
                setStatus("#txInfoFichaTecnicaProductoServicio", "danger", resolveErrorMessage(error));
            })
            .finally(function () {
                state.fichaTecnica.loading = false;
                syncFichaTecnicaActions();
            });
    };

    function renderFichaTecnicaSkeleton() {
        $("#txFichaTecnicaProductoServicioTitulo").text("Ficha técnica");
        $("#txFichaTecnicaProductoServicioMeta").text("");
        $("#psFichaTecnicaProductoServicioContenido").html("<div class='ps-ficha-placeholder'>Preparando información del registro...</div>");
    }

    function renderFichaTecnicaEmpty() {
        $("#txFichaTecnicaProductoServicioTitulo").text("Ficha técnica");
        $("#txFichaTecnicaProductoServicioMeta").text("");
        $("#psFichaTecnicaProductoServicioContenido").html("<div class='ps-ficha-placeholder'>No fue posible cargar la ficha técnica.</div>");
    }

    function renderFichaTecnicaDetail() {
        const detail = state.fichaTecnica.detail;
        if (!detail) {
            renderFichaTecnicaEmpty();
            return;
        }

        const commercialItems = [
            buildFichaMetric("Unidad", buildUnitLabel(detail.unidadMedida, detail.unidadAbreviatura)),
            detail.costo != null ? buildFichaMetric("Costo", formatCurrency(detail.costo)) : "",
            buildFichaMetric("Precio público", formatCurrency(detail.precioPublico)),
            detail.precioComparacion != null && Number(detail.precioComparacion) > 0 ? buildFichaMetric("Precio de comparación", formatCurrency(detail.precioComparacion)) : "",
            detail.precioUnitarioResumen ? buildFichaMetric("Precio unitario", escapeHtml(detail.precioUnitarioResumen)) : ""
        ].filter(Boolean).join("");

        const fiscalItems = [
            detail.claveProductoSat ? buildFichaMetric("Clave producto/servicio SAT", escapeHtml(buildSatLabel(detail.claveProductoSat, detail.claveProductoSatDescripcion))) : "",
            detail.claveUnidadSat ? buildFichaMetric("Clave unidad SAT", escapeHtml(buildSatLabel(detail.claveUnidadSat, detail.claveUnidadSatDescripcion))) : "",
            detail.objetoImpuesto ? buildFichaMetric("Objeto de impuesto", escapeHtml(detail.objetoImpuesto)) : ""
        ].filter(Boolean).join("");

        const physicalItems = detail.tipo === 1 ? [
            detail.esProductoFisico ? buildFichaMetric("Producto físico", "Sí") : "",
            buildFichaMetric("Peso del producto", escapeHtml(formatLogisticsWeight(detail.pesoKg))),
            detail.paqueteNombre ? buildFichaMetric("Paquete", escapeHtml(detail.paqueteNombre)) : "",
            detail.tipoPaquete ? buildFichaMetric("Tipo de paquete", escapeHtml(formatPackageType(detail.tipoPaquete))) : "",
            buildFichaMetric("Peso vacío del empaque", escapeHtml(formatLogisticsWeight(detail.paquetePesoEmpaqueVacioKg))),
            buildFichaMetric("Peso físico total", escapeHtml(formatLogisticsWeight(detail.pesoFisicoTotalKg))),
            buildFichaMetric("Dimensiones del paquete", escapeHtml(resolvePackageDimensionsText(detail))),
            buildFichaMetric("Peso volumétrico", escapeHtml(formatLogisticsWeight(detail.pesoVolumetricoKg))),
            buildFichaMetric("Peso facturable", escapeHtml(formatLogisticsWeight(detail.pesoFacturableKg))),
            detail.usaNumeroSerie ? buildFichaMetric("Usa número de serie", "Sí") : ""
        ].filter(Boolean).join("") : "";

        const inventoryItems = detail.tipo === 1 && detail.causaInventario ? [
            detail.existenciaActual != null ? buildFichaMetric("Existencia actual", escapeHtml(formatDecimal(detail.existenciaActual))) : "",
            detail.existenciaMinima != null ? buildFichaMetric("Existencia mínima", escapeHtml(formatDecimal(detail.existenciaMinima))) : "",
            buildFichaMetric("Permite venta sin existencia", detail.permiteVentaSinExistencia ? "Sí" : "No")
        ].filter(Boolean).join("") : "";

        $("#txFichaTecnicaProductoServicioTitulo").text(detail.nombre || "Ficha técnica");
        $("#txFichaTecnicaProductoServicioMeta").text(buildFichaHeaderMeta(detail));
        $("#psFichaTecnicaProductoServicioContenido").html([
            "<section class='ps-ficha-general'>",
            "  <div class='ps-ficha-image-card'>",
            buildFichaImage(detail),
            "  </div>",
            "  <div class='ps-ficha-section-card ps-ficha-section-card--general'>",
            "    <span class='checkapp-panel-eyebrow'>Información general</span>",
            "    <div class='ps-ficha-metrics'>",
            buildFichaMetric("Código", escapeHtml(detail.codigo || "")),
            buildFichaMetric("Tipo", escapeHtml(detail.tipoNombre || "")),
            buildFichaMetric("Estatus", escapeHtml(detail.estatusNombre || (detail.activo ? "Activo" : "Inactivo"))),
            detail.descripcion ? buildFichaMetric("Descripción", escapeHtml(detail.descripcion)) : "",
            detail.categoria ? buildFichaMetric("Categoría", escapeHtml(detail.categoria)) : "",
            detail.tipo === 1 && detail.marca ? buildFichaMetric("Marca", escapeHtml(detail.marca)) : "",
            buildCollectionMetric(detail),
            "    </div>",
            buildTagsSection(detail.tags || []),
            "  </div>",
            "</section>",
            commercialItems ? buildFichaSectionCard("Información comercial", commercialItems) : "",
            fiscalItems ? buildFichaSectionCard("Información fiscal", fiscalItems) : "",
            physicalItems ? buildFichaSectionCard("Información física y logística", physicalItems) : "",
            inventoryItems ? buildFichaSectionCard("Inventario", inventoryItems) : "",
            buildAttributesSection(detail.atributos || [], detail.tipo),
            buildVariantsSection(detail.variantes || [], detail.tipo),
            buildMultimediaSection(detail.multimedia || [])
        ].join(""));
    }

    function syncFichaTecnicaActions() {
        const disabled = state.fichaTecnica.loading || !state.fichaTecnica.id || state.fichaTecnica.downloading;
        const $button = $("#btDescargarFichaTecnicaProductoServicio");
        $button.prop("disabled", disabled);
        $button.find("span").text(state.fichaTecnica.downloading ? "Descargando..." : "Descargar PDF");
    }

    function downloadFichaTecnicaPdf() {
        if (!state.fichaTecnica.id || state.fichaTecnica.downloading) {
            return;
        }

        state.fichaTecnica.downloading = true;
        syncFichaTecnicaActions();
        setStatus("#txInfoFichaTecnicaProductoServicio", "info", "Generando PDF...");
        downloadBlobFile("/ProductosServicios/ExportarFichaTecnicaProductoServicioPdf?idProductoServicio=" + encodeURIComponent(state.fichaTecnica.id))
            .then(function () {
                setStatus("#txInfoFichaTecnicaProductoServicio", "success", "La descarga del PDF inició correctamente.");
            })
            .catch(function (error) {
                setStatus("#txInfoFichaTecnicaProductoServicio", "danger", resolveErrorMessage(error));
            })
            .finally(function () {
                state.fichaTecnica.downloading = false;
                syncFichaTecnicaActions();
            });
    }

    function downloadBlobFile(url) {
        return fetch(url, { credentials: "same-origin" })
            .then(function (response) {
                if (!response.ok) {
                    return response.text().then(function (text) {
                        throw new Error(text || ("HTTP " + response.status));
                    });
                }

                return Promise.all([response.blob(), Promise.resolve(response.headers.get("Content-Disposition") || "")]);
            })
            .then(function (result) {
                const blob = result[0];
                const disposition = result[1];
                const match = /filename\\*?=(?:UTF-8''|\"?)([^\";]+)/i.exec(disposition || "");
                const fileName = match ? decodeURIComponent(match[1].replace(/\"/g, "")) : "FichaTecnica.pdf";
                const objectUrl = window.URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = objectUrl;
                anchor.download = fileName;
                document.body.appendChild(anchor);
                anchor.click();
                anchor.remove();
                window.setTimeout(function () {
                    window.URL.revokeObjectURL(objectUrl);
                }, 1000);
            });
    }

    function buildFichaHeaderMeta(detail) {
        const parts = [detail.codigo || "", detail.tipoNombre || "", detail.activo ? "Activo" : "Inactivo"].filter(Boolean);
        return parts.join(" · ");
    }

    function buildFichaImage(detail) {
        if (detail.imagenUrl) {
            return "<img class='ps-ficha-image' src='" + escapeHtml(detail.imagenUrl) + "' alt='" + escapeHtml(detail.nombre || "Imagen principal") + "' />";
        }

        return "<div class='ps-ficha-image-empty'><i class='fa fa-picture-o'></i><span>Sin imagen</span></div>";
    }

    function buildFichaMetric(label, value) {
        if (!value) {
            return "";
        }

        return "<article class='ps-ficha-metric'><small>" + escapeHtml(label) + "</small><strong>" + value + "</strong></article>";
    }

    function buildFichaSectionCard(title, contentHtml) {
        return [
            "<section class='ps-ficha-section-card'>",
            "  <span class='checkapp-panel-eyebrow'>" + escapeHtml(title) + "</span>",
            "  <div class='ps-ficha-metrics'>",
            contentHtml,
            "  </div>",
            "</section>"
        ].join("");
    }

    function buildCollectionMetric(detail) {
        const parts = [detail.coleccionNumero || "", detail.coleccionNombre || ""].filter(Boolean);
        return parts.length ? buildFichaMetric("Colección", escapeHtml(parts.join(" · "))) : "";
    }

    function buildTagsSection(tags) {
        if (!Array.isArray(tags) || !tags.length) {
            return "";
        }

        return [
            "<div class='ps-ficha-tags'>",
            "  <small>Etiquetas</small>",
            "  <div class='ps-ficha-tag-list'>",
            tags.map(function (tag) {
                return "<span class='ps-ficha-tag-chip'>" + escapeHtml(tag.nombre || "") + "</span>";
            }).join(""),
            "  </div>",
            "</div>"
        ].join("");
    }

    function buildAttributesSection(attributes, tipo) {
        if (Number(tipo) !== 1 || !Array.isArray(attributes) || !attributes.length) {
            return "";
        }

        return [
            "<section class='ps-ficha-section-card'>",
            "  <span class='checkapp-panel-eyebrow'>Atributos</span>",
            "  <div class='ps-ficha-table-wrap'>",
            "    <table class='ps-ficha-table'>",
            "      <thead><tr><th>Atributo</th><th>Elemento(s)</th></tr></thead>",
            "      <tbody>",
            attributes.map(function (attribute) {
                const values = Array.isArray(attribute.valores) ? attribute.valores.map(function (value) { return value.valor; }).filter(Boolean).join(", ") : "";
                return "<tr><td>" + escapeHtml(attribute.nombre || "") + "</td><td>" + escapeHtml(values || "—") + "</td></tr>";
            }).join(""),
            "      </tbody>",
            "    </table>",
            "  </div>",
            "</section>"
        ].join("");
    }

    function buildVariantsSection(variants, tipo) {
        if (Number(tipo) !== 1 || !Array.isArray(variants) || !variants.length) {
            return "";
        }

        return [
            "<section class='ps-ficha-section-card'>",
            "  <span class='checkapp-panel-eyebrow'>Variantes</span>",
            "  <div class='ps-ficha-table-wrap'>",
            "    <table class='ps-ficha-table ps-ficha-table--variants'>",
            "      <thead><tr><th>Variante</th><th>Imagen</th><th>Costo</th><th>Precio</th></tr></thead>",
            "      <tbody>",
            variants.map(function (variant) {
                return [
                    "<tr>",
                    "  <td>" + escapeHtml(buildVariantSummary(variant)) + "</td>",
                    "  <td>" + buildVariantImage(variant) + "</td>",
                    "  <td>" + escapeHtml(variant.costo != null ? formatCurrency(variant.costo) : "—") + "</td>",
                    "  <td>" + escapeHtml(variant.precioPublico != null ? formatCurrency(variant.precioPublico) : "—") + "</td>",
                    "</tr>"
                ].join("");
            }).join(""),
            "      </tbody>",
            "    </table>",
            "  </div>",
            "</section>"
        ].join("");
    }

    function buildVariantSummary(variant) {
        if (variant.nombre) {
            return variant.nombre;
        }

        if (Array.isArray(variant.valores) && variant.valores.length) {
            return variant.valores
                .slice()
                .sort(function (left, right) { return Number(left.orden || 0) - Number(right.orden || 0); })
                .map(function (value) { return value.valor || ""; })
                .filter(Boolean)
                .join(" / ");
        }

        return variant.sku || "Variante";
    }

    function buildVariantImage(variant) {
        if (variant.imagenUrl) {
            return "<img class='ps-ficha-variant-image' src='" + escapeHtml(variant.imagenUrl) + "' alt='" + escapeHtml(buildVariantSummary(variant)) + "' />";
        }

        return "<span class='ps-ficha-variant-image-empty'>—</span>";
    }

    function buildMultimediaSection(multimedia) {
        if (!Array.isArray(multimedia) || !multimedia.length) {
            return "";
        }

        const photos = multimedia.filter(function (item) { return item.foto; });
        const videos = multimedia.filter(function (item) { return item.video; });
        const documents = multimedia.filter(function (item) { return item.documento; });
        const groups = [
            photos.length ? buildFichaMetric("Fotografías", escapeHtml(photos.map(function (item) { return item.nombreOriginal; }).join(", "))) : "",
            videos.length ? buildFichaMetric("Video", escapeHtml(videos.map(function (item) { return item.nombreOriginal; }).join(", "))) : "",
            documents.length ? buildFichaMetric("Documentos", escapeHtml(documents.map(function (item) { return item.nombreOriginal; }).join(", "))) : ""
        ].filter(Boolean).join("");

        return groups ? buildFichaSectionCard("Evidencia y multimedia", groups) : "";
    }

    function buildUnitLabel(unit, abbreviation) {
        if (!unit) {
            return "";
        }

        return abbreviation ? (unit + " (" + abbreviation + ")") : unit;
    }

    function buildSatLabel(code, description) {
        return description ? (code + " - " + description) : code;
    }

    function formatPackageType(value) {
        const normalized = String(value || "").trim().toLowerCase();
        if (normalized === "caja") {
            return "Caja";
        }

        if (normalized === "sobre") {
            return "Sobre";
        }

        if (normalized === "flexible") {
            return "Paquete flexible";
        }

        return value || "";
    }

    function buildPackageDimensionsMetric(detail) {
        const text = resolvePackageDimensionsText(detail);
        return text !== "No disponible"
            ? buildFichaMetric("Dimensiones del paquete", escapeHtml(text))
            : "";
    }

    function resolvePackageDimensionsText(detail) {
        const parts = [];
        if (detail.paqueteLargoCm != null) {
            parts.push("L " + formatDecimal(detail.paqueteLargoCm) + " cm");
        }

        if (detail.paqueteAnchoCm != null) {
            parts.push("A " + formatDecimal(detail.paqueteAnchoCm) + " cm");
        }

        if (detail.paqueteAltoCm != null) {
            parts.push("H " + formatDecimal(detail.paqueteAltoCm) + " cm");
        }

        return parts.length ? parts.join(" · ") : "No disponible";
    }

    function openCreateModal() {
        if (isModalBusy()) {
            return;
        }

        resetModal();
        $("#txModalProductoServicioKicker").text("Registro");
        $("#txModalProductoServicioTitulo").text("Nuevo producto / servicio");
        $("#btGuardarProductoServicio span").text("Guardar");
        $("#cbTipoProductoServicio").val("").trigger("change");
        $("#swActivoProductoServicio").prop("checked", true);
        syncStatusSwitchUi();
        ensureSelect2Option("#cbClaveUnidadSatProductoServicio", "H87", "H87 - Pieza");
        updateUnitPriceSummary();
        syncTypeVisibility();
        renderTagsControl();
        renderImagePreview();
        renderAttributesEditor();
        renderVariantOptionsEditor();
        renderVariantsEditor();
        renderMultimediaEditor();
        state.modal.show();
    }

    window.editarProductoServicio = function (id) {
        if (isModalBusy()) {
            return;
        }

        setStatus("#txInfoProductoServicio", "", "");
        fetchJson("/ProductosServicios/ObtenerProductoServicio?idProductoServicio=" + encodeURIComponent(id))
            .then(function (data) {
                return Promise.all([
                    resolveSatOptionText("producto", data.claveProductoSat || "", data.claveProductoSat || ""),
                    resolveSatOptionText("unidad", data.claveUnidadSat || "", data.claveUnidadSat || "")
                ]).then(function (satTexts) {
                    return {
                        data: data,
                        satProductoText: satTexts[0],
                        satUnidadText: satTexts[1]
                    };
                });
            })
            .then(function (context) {
                const data = context.data;
                resetModal();
                $("#hdProductoServicioId").val(data.id || "");
                $("#txModalProductoServicioKicker").text("Edición");
                $("#txModalProductoServicioTitulo").text("Editar producto / servicio");
                $("#btGuardarProductoServicio span").text("Guardar cambios");

                $("#cbTipoProductoServicio").val(String(data.tipo || "1")).trigger("change");
                $("#swActivoProductoServicio").prop("checked", data.activo !== false);
                syncStatusSwitchUi();
                $("#txCodigoProductoServicio").val(data.codigo || "");
                $("#txNombreProductoServicio").val(data.nombre || "");
                $("#txDescripcionProductoServicio").val(data.descripcion || "");
                syncCategoryOptions(data.idCategoria || "");
                $("#cbCategoriaProductoServicio").val(data.idCategoria || "").trigger("change");
                $("#cbMarcaProductoServicio").val(data.idMarca || "").trigger("change");
                $("#cbUnidadProductoServicio").val(data.idUnidadMedida || "").trigger("change");
                $("#cbColeccionProductoServicio").val(data.idColeccion || "").trigger("change");
                $("#cbPaqueteProductoServicio").val(data.idPaquete || "").trigger("change");
                $("#cbObjetoImpuestoProductoServicio").val(data.objetoImpuesto || "").trigger("change");
                $("#cbPrecioUnitarioUnidadProductoServicio").val(data.precioUnitarioUnidad || "").trigger("change");
                ensureSelect2Option("#cbClaveProductoSatProductoServicio", data.claveProductoSat || "", context.satProductoText || data.claveProductoSat || "");
                ensureSelect2Option("#cbClaveUnidadSatProductoServicio", data.claveUnidadSat || "", context.satUnidadText || data.claveUnidadSat || "");
                $("#txCostoProductoServicio").val(data.costo == null ? "" : data.costo);
                $("#txPrecioPublicoProductoServicio").val(data.precioPublico == null ? "" : data.precioPublico);
                $("#txPrecioComparacionProductoServicio").val(data.precioComparacion == null ? "" : data.precioComparacion);
                $("#txPrecioUnitarioMontoProductoServicio").val(data.precioUnitarioMonto == null ? "" : data.precioUnitarioMonto);
                $("#txPrecioUnitarioBaseProductoServicio").val(data.precioUnitarioBaseCantidad == null ? "" : data.precioUnitarioBaseCantidad);
                $("#chkEsProductoFisicoProductoServicio").prop("checked", !!data.esProductoFisico);
                $("#chkUsaNumeroSerieProductoServicio").prop("checked", !!data.usaNumeroSerie);
                $("#txPesoKgProductoServicio").val(data.pesoKg == null ? "" : data.pesoKg);
                $("#txLargoCmProductoServicio").val(data.largoCm == null ? "" : data.largoCm);
                $("#txAnchoCmProductoServicio").val(data.anchoCm == null ? "" : data.anchoCm);
                $("#txAltoCmProductoServicio").val(data.altoCm == null ? "" : data.altoCm);
                $("#chkCausaInventarioProductoServicio").prop("checked", !!data.causaInventario);
                $("#chkPermiteVentaSinExistencia").prop("checked", !!data.permiteVentaSinExistencia);
                $("#txExistenciaInicialProductoServicio").val(data.existenciaActual == null ? "" : data.existenciaActual);
                $("#txExistenciaMinimaProductoServicio").val(data.existenciaMinima == null ? "" : data.existenciaMinima);

                state.attributeRows = mapAttributesFromServer(data.atributos || []);
                state.attributeDraft = { idAtributo: "", idAtributoValor: "" };
                state.variantOptionRows = mapVariantOptionsFromServer(data.opcionesVariante || []);
                state.variants = mapVariantsFromServer(data.variantes || []);
                hydrateTagsFromServer(data.tags || [], data.tag || "");
                hydrateMultimediaFromServer(data.multimedia || []);

                if (data.imagenUrl) {
                    state.existingImage = {
                        url: data.imagenUrl,
                        nombre: data.imagenNombre || ""
                    };
                }

                syncTypeVisibility();
                updateUnitPriceSummary();
                renderImagePreview();
                renderAttributesEditor();
                renderVariantOptionsEditor();
                syncVariantsWithOptions();
                renderMultimediaEditor();
                state.modal.show();
            })
            .catch(function (error) {
                showError(resolveErrorMessage(error));
            });
    };

    window.cambiarEstatusProductoServicio = function (id, activar) {
        const title = activar ? "¿Reactivar registro?" : "¿Aplicar baja lógica?";
        const text = activar
            ? "El registro volverá a mostrarse como activo."
            : "El registro dejará de mostrarse como activo, conservando su historial.";

        Swal.fire({
            icon: "warning",
            title: title,
            text: text,
            showCancelButton: true,
            confirmButtonText: activar ? "Reactivar" : "Dar de baja",
            cancelButtonText: "Cancelar"
        }).then(function (result) {
            if (!result.isConfirmed) {
                return;
            }

            const url = activar
                ? "/ProductosServicios/ActivarProductoServicio?idProductoServicio=" + encodeURIComponent(id)
                : "/ProductosServicios/BajaProductoServicio?idProductoServicio=" + encodeURIComponent(id);

            fetchJson(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "{}"
            }).then(function (data) {
                showSuccess(resolveServerMessage(data) || "La acción fue completada.");
                loadSummary();
                CheckAppUI.reloadGrid(gridId);
            }).catch(function (error) {
                showError(resolveErrorMessage(error));
            });
        });
    };

    function saveProductoServicio() {
        if (state.isSaving || state.isUploadingImage || hasPendingMultimediaUploads()) {
            return;
        }

        const validation = validateForm();
        if (validation) {
            setStatus("#txInfoProductoServicio", "danger", validation.message);
            markFieldError(validation.selector);
            return;
        }

        const payload = buildPayload();
        beginSaveProgress(buildSaveMessages(payload));
        setStatus("#txInfoProductoServicio", "info", "Guardando producto / servicio...");

        fetchJson("/ProductosServicios/GuardarProductoServicio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).then(function (data) {
            finishSaveProgress();
            state.savedModalImage = true;
            state.savedMultimedia = true;
            state.imageDraft = null;
            state.variants.forEach(function (item) { item.imageDraft = null; });
            showSuccess(resolveServerMessage(data) || "El registro fue guardado correctamente.");
            state.modal.hide();
            loadCombos();
            loadSummary();
            CheckAppUI.reloadGrid(gridId);
        }).catch(function (error) {
            failSaveProgress();
            setStatus("#txInfoProductoServicio", "danger", resolveErrorMessage(error));
        });
    }

    function validateForm() {
        if (!$("#cbTipoProductoServicio").val()) {
            return { selector: "#cbTipoProductoServicio", message: "Selecciona un tipo." };
        }
        if (!($("#txCodigoProductoServicio").val() || "").trim()) {
            return { selector: "#txCodigoProductoServicio", message: "Captura un código." };
        }
        if (!($("#txNombreProductoServicio").val() || "").trim()) {
            return { selector: "#txNombreProductoServicio", message: "Captura un nombre." };
        }
        if (!$("#cbCategoriaProductoServicio").val()) {
            return { selector: "#cbCategoriaProductoServicio", message: "Selecciona una categoría." };
        }
        if (!$("#cbUnidadProductoServicio").val()) {
            return { selector: "#cbUnidadProductoServicio", message: "Selecciona una unidad." };
        }
        if (($("#txPrecioPublicoProductoServicio").val() || "").trim() === "") {
            return { selector: "#txPrecioPublicoProductoServicio", message: "Captura el precio público." };
        }
        const unitPriceValidation = validateUnitPriceFields();
        if (unitPriceValidation) {
            return unitPriceValidation;
        }
        if ($("#chkEsProductoFisicoProductoServicio").is(":checked") && ($("#txPesoKgProductoServicio").val() || "").trim() !== "" && toNullableNumber($("#txPesoKgProductoServicio").val()) < 0) {
            return { selector: "#txPesoKgProductoServicio", message: "El peso no puede ser negativo." };
        }
        if (hasMultimediaErrors()) {
            return { selector: "#txInfoProductoServicio", message: "Corrige o elimina los archivos multimedia con error antes de guardar." };
        }
        if (hasPendingMultimediaUploads()) {
            return { selector: "#txInfoProductoServicio", message: "Espera a que termine la carga de evidencias antes de guardar." };
        }
        if (hasPendingVariantImageUploads()) {
            return { selector: "#txInfoProductoServicio", message: "Espera a que termine la carga de imágenes por variante antes de guardar." };
        }
        return null;
    }

    function buildPayload() {
        const tipo = getSelectedTipoProductoServicio() || 1;
        const causaInventario = tipo === 1 && $("#chkCausaInventarioProductoServicio").is(":checked");
        const esProductoFisico = $("#chkEsProductoFisicoProductoServicio").is(":checked");
        const payload = {
            id: normalizeGuid($("#hdProductoServicioId").val()),
            tipo: tipo,
            codigo: ($("#txCodigoProductoServicio").val() || "").trim(),
            tag: normalizeTagName(state.legacyTagValue),
            nombre: ($("#txNombreProductoServicio").val() || "").trim(),
            descripcion: ($("#txDescripcionProductoServicio").val() || "").trim(),
            idCategoria: $("#cbCategoriaProductoServicio").val() || "",
            idMarca: tipo === 2 ? null : normalizeGuid($("#cbMarcaProductoServicio").val()),
            idUnidadMedida: $("#cbUnidadProductoServicio").val() || "",
            idColeccion: normalizeGuid($("#cbColeccionProductoServicio").val()),
            idPaquete: esProductoFisico ? normalizeGuid($("#cbPaqueteProductoServicio").val()) : null,
            costo: toNullableNumber($("#txCostoProductoServicio").val()),
            precioPublico: toNumber($("#txPrecioPublicoProductoServicio").val()),
            precioComparacion: toNullableNumber($("#txPrecioComparacionProductoServicio").val()),
            precioUnitarioMonto: toNullableNumber($("#txPrecioUnitarioMontoProductoServicio").val()),
            precioUnitarioBaseCantidad: toNullableNumber($("#txPrecioUnitarioBaseProductoServicio").val()),
            precioUnitarioUnidad: ($("#cbPrecioUnitarioUnidadProductoServicio").val() || "").trim(),
            objetoImpuesto: ($("#cbObjetoImpuestoProductoServicio").val() || "").trim(),
            claveProductoSat: ($("#cbClaveProductoSatProductoServicio").val() || "").trim(),
            claveUnidadSat: ($("#cbClaveUnidadSatProductoServicio").val() || "").trim(),
            esProductoFisico: esProductoFisico,
            pesoKg: esProductoFisico ? toNullableNumber($("#txPesoKgProductoServicio").val()) : null,
            largoCm: esProductoFisico ? toNullableNumber($("#txLargoCmProductoServicio").val()) : null,
            anchoCm: esProductoFisico ? toNullableNumber($("#txAnchoCmProductoServicio").val()) : null,
            altoCm: esProductoFisico ? toNullableNumber($("#txAltoCmProductoServicio").val()) : null,
            usaNumeroSerie: $("#chkUsaNumeroSerieProductoServicio").is(":checked"),
            causaInventario: causaInventario,
            permiteVentaSinExistencia: causaInventario && $("#chkPermiteVentaSinExistencia").is(":checked"),
            existenciaInicial: causaInventario ? toNullableNumber($("#txExistenciaInicialProductoServicio").val()) : null,
            existenciaMinima: causaInventario ? toNullableNumber($("#txExistenciaMinimaProductoServicio").val()) : null,
            activo: $("#swActivoProductoServicio").is(":checked"),
            eliminarImagenPrincipal: state.removeExistingImage,
            tags: buildTagsPayload(),
            atributos: buildAttributesPayload(),
            opcionesVariante: buildVariantOptionsRequestPayload(),
            variantes: buildVariantsPayload(),
            multimedia: buildMultimediaPayload()
        };

        if (!payload.id) {
            delete payload.id;
        }

        if (state.imageDraft && state.imageDraft.archivo) {
            payload.imagenPrincipal = state.imageDraft.archivo;
            payload.eliminarImagenPrincipal = false;
        }

        return payload;
    }

    function captureUnitPriceValues() {
        return {
            monto: $("#txPrecioUnitarioMontoProductoServicio").val() || "",
            base: $("#txPrecioUnitarioBaseProductoServicio").val() || "",
            unidad: $("#cbPrecioUnitarioUnidadProductoServicio").val() || ""
        };
    }

    function restoreUnitPriceValues(values) {
        const source = values || { monto: "", base: "", unidad: "" };
        $("#txPrecioUnitarioMontoProductoServicio").val(source.monto || "");
        $("#txPrecioUnitarioBaseProductoServicio").val(source.base || "");
        $("#cbPrecioUnitarioUnidadProductoServicio").val(source.unidad || "").trigger("change");
        updateUnitPriceSummary();
    }

    function toggleUnitPricePopover() {
        if (state.unitPricePopoverOpen) {
            closeUnitPricePopover();
            return;
        }

        state.unitPriceSnapshot = captureUnitPriceValues();
        state.unitPricePopoverOpen = true;
        $("#panelPrecioUnitarioProductoServicio").prop("hidden", false);
        $("#btPrecioUnitarioResumenProductoServicio").attr("aria-expanded", "true");
        syncUnitPricePopoverLayout();
    }

    function closeUnitPricePopover() {
        state.unitPricePopoverOpen = false;
        $("#panelPrecioUnitarioProductoServicio").prop("hidden", true);
        $("#btPrecioUnitarioResumenProductoServicio").attr("aria-expanded", "false");
        clearUnitPricePopoverLayout();
    }

    function clearUnitPriceEditor() {
        restoreUnitPriceValues({ monto: "", base: "", unidad: "" });
        clearFieldError("#btPrecioUnitarioResumenProductoServicio");
    }

    function cancelUnitPriceEditor() {
        restoreUnitPriceValues(state.unitPriceSnapshot);
        closeUnitPricePopover();
    }

    function applyUnitPriceEditor() {
        const validation = validateUnitPriceFields();
        if (validation) {
            setStatus("#txInfoProductoServicio", "danger", validation.message);
            markFieldError(validation.selector);
            return;
        }

        clearFieldError("#btPrecioUnitarioResumenProductoServicio");
        updateUnitPriceSummary();
        closeUnitPricePopover();
    }

    function validateUnitPriceFields() {
        const monto = ($("#txPrecioUnitarioMontoProductoServicio").val() || "").trim();
        const base = ($("#txPrecioUnitarioBaseProductoServicio").val() || "").trim();
        const unidad = ($("#cbPrecioUnitarioUnidadProductoServicio").val() || "").trim();
        const anyValue = !!(monto || base || unidad);

        if (!anyValue) {
            return null;
        }

        if (!monto) {
            return { selector: "#btPrecioUnitarioResumenProductoServicio", message: "Captura el importe total del precio unitario." };
        }

        if (!base) {
            return { selector: "#btPrecioUnitarioResumenProductoServicio", message: "Captura la medida base del precio unitario." };
        }

        if (!unidad) {
            return { selector: "#btPrecioUnitarioResumenProductoServicio", message: "Selecciona la unidad base del precio unitario." };
        }

        return null;
    }

    function updateUnitPriceSummary() {
        const monto = toNullableNumber($("#txPrecioUnitarioMontoProductoServicio").val());
        const base = toNullableNumber($("#txPrecioUnitarioBaseProductoServicio").val());
        const unidad = ($("#cbPrecioUnitarioUnidadProductoServicio").val() || "").trim();
        const target = document.getElementById("txPrecioUnitarioResumenProductoServicio");
        if (!target) {
            return;
        }

        if (monto == null && base == null && !unidad) {
            target.textContent = "$0.00";
            return;
        }

        const amountText = monto == null
            ? "$0.00"
            : monto.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2, maximumFractionDigits: 4 });
        const baseText = base == null ? "1" : formatMeasure(base, 4);
        target.textContent = amountText + " por " + baseText + (unidad ? " " + unidad : "");
    }

    function syncUnitPricePopoverLayout() {
        const panel = document.getElementById("panelPrecioUnitarioProductoServicio");
        const trigger = document.getElementById("btPrecioUnitarioResumenProductoServicio");
        const shell = trigger ? trigger.closest(".ps-unit-price-shell") : null;
        const modalBody = panel ? panel.closest(".modal-body, .cot-panel-body, .checkapp-card-body") : null;

        if (!panel || !trigger || !shell || window.innerWidth <= 768) {
            clearUnitPricePopoverLayout();
            return;
        }

        const triggerRect = trigger.getBoundingClientRect();
        const shellRect = shell.getBoundingClientRect();
        const containerRect = modalBody ? modalBody.getBoundingClientRect() : shellRect;
        const viewportPadding = 16;
        const minWidth = Math.min(420, Math.max(triggerRect.width, 320));
        const maxWidth = Math.min(540, Math.max(360, containerRect.width - 24));
        const width = Math.max(Math.min(maxWidth, Math.max(triggerRect.width, minWidth)), Math.min(maxWidth, triggerRect.width));
        const desiredLeft = triggerRect.right - width;
        const minLeft = Math.max(containerRect.left + 12, viewportPadding);
        const maxLeft = Math.max(minLeft, Math.min(containerRect.right - width - 12, window.innerWidth - width - viewportPadding));
        const left = Math.min(Math.max(desiredLeft, minLeft), maxLeft);
        const leftOffset = left - shellRect.left;
        const verticalSpaceBelow = window.innerHeight - triggerRect.bottom;
        const shouldOpenUpward = verticalSpaceBelow < 260 && triggerRect.top > verticalSpaceBelow;

        panel.style.width = width + "px";
        panel.style.left = leftOffset + "px";
        panel.style.right = "auto";
        panel.style.top = shouldOpenUpward ? "auto" : "calc(100% + 0.65rem)";
        panel.style.bottom = shouldOpenUpward ? "calc(100% + 0.65rem)" : "auto";
        panel.classList.toggle("is-open-upward", shouldOpenUpward);
        panel.classList.toggle("is-anchored-right", leftOffset > 8);
    }

    function clearUnitPricePopoverLayout() {
        const panel = document.getElementById("panelPrecioUnitarioProductoServicio");
        if (!panel) {
            return;
        }

        panel.style.width = "";
        panel.style.left = "";
        panel.style.right = "";
        panel.style.top = "";
        panel.style.bottom = "";
        panel.classList.remove("is-open-upward", "is-anchored-right");
    }

    function buildAttributesPayload() {
        const groups = [];
        const lookup = new Map();

        state.attributeRows
            .filter(function (item) {
                return item.idAtributo && item.valores.length;
            })
            .forEach(function (item) {
                const normalizedProductAttributeId = normalizeGuid(item.idProductoAtributo);
                const key = normalizedProductAttributeId || ("new:" + item.idAtributo);
                let current = lookup.get(key);
                if (!current) {
                    current = {
                        idProductoAtributo: normalizedProductAttributeId,
                        idAtributo: item.idAtributo,
                        orden: groups.length + 1,
                        valores: []
                    };
                    lookup.set(key, current);
                    groups.push(current);
                }

                (item.valores || []).forEach(function (value) {
                    const normalizedValueId = normalizeGuid(value.idAtributoValor);
                    const compareKey = normalizedValueId || normalizeCatalogCompareValue(value.valor);
                    if (current.valores.some(function (existing) {
                        const existingKey = normalizeGuid(existing.idAtributoValor) || normalizeCatalogCompareValue(existing.valor);
                        return existingKey === compareKey;
                    })) {
                        return;
                    }

                    current.valores.push({
                        idAtributoValor: normalizedValueId,
                        valor: value.valor,
                        orden: current.valores.length + 1
                    });
                });
            });

        return groups;
    }

    function buildVariantsPayload() {
        return state.variants.map(function (item, index) {
            const payload = {
                id: normalizeGuid(item.id),
                nombre: item.nombre || "",
                claveCombinacion: item.claveCombinacion || "",
                costo: item.costo,
                precioPublico: item.precioPublico,
                precioComparacion: item.precioComparacion,
                precioUnitarioMonto: item.precioUnitarioMonto,
                precioUnitarioBaseCantidad: item.precioUnitarioBaseCantidad,
                precioUnitarioUnidad: item.precioUnitarioUnidad || "",
                orden: index + 1,
                valores: (item.valores || []).map(function (value, valueIndex) {
                    return {
                        idOpcionVariante: normalizeGuid(value.idOpcionVariante),
                        idOpcionVarianteValor: normalizeGuid(value.idOpcionVarianteValor),
                        opcion: value.opcion || "",
                        valor: value.valor,
                        orden: valueIndex + 1
                    };
                })
            };

            const image = buildVariantImagePayload(item);
            if (image) {
                payload.imagen = image;
            }

            payload.eliminarImagen = !!item.removeExistingImage;
            return payload;
        });
    }

    function buildVariantImagePayload(row) {
        if (row.imageDraft && row.imageDraft.archivo) {
            return row.imageDraft.archivo;
        }

        return null;
    }

    function buildVariantOptionsRequestPayload() {
        return buildVariantOptionsPayload().map(function (item, index) {
            return {
                id: normalizeGuid(item.idOpcionVariante),
                nombre: item.nombre,
                orden: index + 1,
                valores: (item.valores || []).map(function (value, valueIndex) {
                    return {
                        id: normalizeGuid(value.idOpcionVarianteValor),
                        valor: value.valor,
                        orden: valueIndex + 1
                    };
                })
            };
        });
    }

    function buildMultimediaPayload() {
        return getAllMultimediaItems().map(function (item, index) {
            return {
                id: normalizeGuid(item.id),
                tipoMultimedia: item.tipoMultimedia,
                nombreOriginal: item.nombreOriginal || "",
                nombreAlmacenado: item.nombreAlmacenado || "",
                extension: item.extension || "",
                mimeType: item.mimeType || "",
                urlFirebase: item.urlFirebase || "",
                pesoBytes: Number(item.pesoBytes || 0),
                orden: index + 1,
                temporalToken: item.temporalToken || ""
            };
        });
    }

    function syncTypeVisibility() {
        const tipo = getSelectedTipoProductoServicio();
        const causaInventario = $("#chkCausaInventarioProductoServicio").is(":checked");
        const isService = tipo === 2;
        const isPhysical = $("#chkEsProductoFisicoProductoServicio").is(":checked");
        const modalNode = document.querySelector("#modalProductoServicio");

        toggleField("#fieldMarcaProductoServicio", !isService);
        toggleField("[data-ps-section='control']", !isService);
        toggleField("[data-ps-section='atributos']", !isService);
        toggleField("[data-ps-section='variantes']", !isService);
        toggleField("#panelInventarioProductoServicio", !isService);
        toggleField("#fieldPermiteVentaSinExistencia", !isService && causaInventario);
        toggleField("#fieldExistenciaInicial", !isService && causaInventario);
        toggleField("#fieldExistenciaMinima", !isService && causaInventario);
        toggleField("#panelLogisticaProductoServicio", !isService && isPhysical);

        if (modalNode) {
            modalNode.classList.toggle("ps-type-service", isService);
            modalNode.classList.toggle("ps-type-product", !isService);
        }

        if (!isService && !causaInventario) {
            $("#chkPermiteVentaSinExistencia").prop("checked", false);
            $("#txExistenciaInicialProductoServicio").val("");
            $("#txExistenciaMinimaProductoServicio").val("");
        }

        if (!isService && isPhysical && !$("#hdProductoServicioId").val()) {
            applyDefaultPackageSelection();
        }

        renderLogisticsSummary();
    }

    function applyDefaultPackageSelection() {
        if ($("#cbPaqueteProductoServicio").val()) {
            return;
        }

        const predeterminado = (state.combos.paquetes || []).find(function (item) {
            return !!item.esPredeterminado;
        });

        if (predeterminado && predeterminado.id) {
            $("#cbPaqueteProductoServicio").val(predeterminado.id).trigger("change");
        }
    }

    function toggleField(selector, show) {
        const node = document.querySelector(selector);
        if (!node) {
            return;
        }

        node.hidden = !show;
    }

    function handleImageSelection(event) {
        if (state.isSaving || state.isUploadingImage) {
            event.target.value = "";
            return;
        }

        const file = event.target.files && event.target.files[0];
        event.target.value = "";
        if (!file) {
            return;
        }

        if (!isValidImageFile(file)) {
            setStatus("#txInfoImagenProductoServicio", "danger", "Selecciona una imagen JPG, PNG o WEBP de hasta 10 MB.");
            return;
        }

        if (state.imageDraft && state.imageDraft.archivo && state.imageDraft.archivo.temporalToken) {
            cleanupTempTokens([state.imageDraft.archivo.temporalToken], "/ProductosServicios/LimpiarImagenTemporal");
        }

        setStatus("#txInfoImagenProductoServicio", "info", "Subiendo imagen...");
        beginImageUpload();

        const formData = new FormData();
        formData.append("archivo", file);

        fetch("/ProductosServicios/SubirImagenTemporal", {
            method: "POST",
            body: formData
        }).then(function (response) {
            return response.text().then(function (text) {
                const data = text ? JSON.parse(text) : {};
                if (!response.ok) {
                    throw new Error(resolveServerMessage(data) || "No fue posible subir la imagen.");
                }

                return data;
            });
        }).then(function (data) {
            state.imageDraft = { archivo: data.archivo || null };
            state.existingImage = null;
            state.removeExistingImage = false;
            renderImagePreview();
            setStatus("#txInfoImagenProductoServicio", "success", "La imagen quedó lista para guardarse.");
        }).catch(function (error) {
            setStatus("#txInfoImagenProductoServicio", "danger", resolveErrorMessage(error));
        }).finally(function () {
            finishImageUpload();
        });
    }

    function removeCurrentImage() {
        if (state.isSaving || state.isUploadingImage) {
            return;
        }

        if (state.imageDraft && state.imageDraft.archivo && state.imageDraft.archivo.temporalToken) {
            cleanupTempTokens([state.imageDraft.archivo.temporalToken], "/ProductosServicios/LimpiarImagenTemporal");
            state.imageDraft = null;
        } else if (state.existingImage) {
            state.existingImage = null;
            state.removeExistingImage = true;
        }

        renderImagePreview();
        setStatus("#txInfoImagenProductoServicio", "", "");
    }

    function renderImagePreview() {
        const host = document.getElementById("psImagePreview");
        if (!host) {
            return;
        }

        host.innerHTML = "";
        let imageUrl = "";
        let imageName = "";

        if (state.imageDraft && state.imageDraft.archivo) {
            imageUrl = state.imageDraft.archivo.urlFirebase || "";
            imageName = state.imageDraft.archivo.nombreOriginal || "Imagen temporal";
        } else if (state.existingImage) {
            imageUrl = state.existingImage.url || "";
            imageName = state.existingImage.nombre || "Imagen actual";
        }

        if (!imageUrl) {
            host.innerHTML = "<div class='ps-image-empty'><i class='fa fa-picture-o'></i><strong>Sin imagen</strong><span>Carga una imagen principal para este registro.</span></div>";
            return;
        }

        host.innerHTML = "<img src='" + escapeHtml(imageUrl) + "' alt='" + escapeHtml(imageName) + "' />";
    }

    function cleanupDraftImageOnClose() {
        if (state.savedModalImage) {
            state.savedModalImage = false;
            return;
        }

        if (state.imageDraft && state.imageDraft.archivo && state.imageDraft.archivo.temporalToken) {
            cleanupTempTokens([state.imageDraft.archivo.temporalToken], "/ProductosServicios/LimpiarImagenTemporal");
        }
    }

    function cleanupMultimediaOnClose() {
        if (state.savedMultimedia) {
            state.savedMultimedia = false;
            return;
        }

        releaseAllTemporaryMultimedia();
    }

    function cleanupTempTokens(tokens, url) {
        if (!tokens || !tokens.length) {
            return Promise.resolve();
        }

        return fetchJson(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tokens: tokens })
        }).catch(function () {
            return null;
        });
    }

    function resetModal() {
        const form = document.getElementById("frmProductoServicio");
        if (form) {
            form.reset();
        }

        $("#hdProductoServicioId").val("");
        $("#cbTipoProductoServicio").val("").trigger("change");
        $("#swActivoProductoServicio").prop("checked", true);
        syncStatusSwitchUi();
        syncCategoryOptions();
        $("#cbCategoriaProductoServicio").val("").trigger("change");
        $("#cbMarcaProductoServicio").val("").trigger("change");
        $("#cbUnidadProductoServicio").val("").trigger("change");
        $("#cbColeccionProductoServicio").val("").trigger("change");
        $("#cbPaqueteProductoServicio").val("").trigger("change");
        $("#cbObjetoImpuestoProductoServicio").val("").trigger("change");
        $("#cbPrecioUnitarioUnidadProductoServicio").val("").trigger("change");
        ensureSelect2Option("#cbClaveProductoSatProductoServicio", "", "");
        ensureSelect2Option("#cbClaveUnidadSatProductoServicio", "H87", "H87 - Pieza");
        $("#chkEsProductoFisicoProductoServicio").prop("checked", false);
        $("#chkUsaNumeroSerieProductoServicio").prop("checked", false);

        state.attributeRows = [];
        state.attributeDraft = { idAtributo: "", idAtributoValor: "" };
        state.variantOptionRows = [];
        state.variants = [];
        state.imageDraft = null;
        state.existingImage = null;
        state.removeExistingImage = false;
        state.savedModalImage = false;
        state.variantImageUploadCount = 0;
        state.savedMultimedia = false;
        state.multimedia = createEmptyMultimediaState();
        state.uploadOperationId = "";
        state.uploadCounts = { foto: 0, video: 0, documento: 0 };
        state.selectedTags = [];
        state.tagsPopoverOpen = false;
        state.tagSearch = "";
        state.tagSaving = false;
        state.legacyTagValue = "";
        resetSaveUi();

        setStatus("#txInfoProductoServicio", "", "");
        setStatus("#txInfoImagenProductoServicio", "", "");
        renderImagePreview();
        renderTagsControl();
        renderAttributesEditor();
        renderVariantOptionsEditor();
        renderVariantsEditor();
        renderMultimediaEditor();
        renderLogisticsSummary();
        resetModalSections();
        syncTypeVisibility();
        updateUnitPriceSummary();
        clearAllFieldErrors();
    }

    function createDefaultModalSections() {
        return {
            general: false,
            comercial: false,
            fiscal: true,
            control: true,
            logistica: true,
            inventario: true,
            atributos: true,
            variantes: true,
            evidencia: true
        };
    }

    function shouldIgnoreHeaderToggle(event) {
        const target = event.target;
        return !!(target && typeof target.closest === "function" && target.closest("button, a, input, select, textarea, label"));
    }

    function setModalSectionCollapsed(section, collapsed) {
        if (!Object.prototype.hasOwnProperty.call(state.modalSections, section)) {
            return;
        }

        state.modalSections[section] = !!collapsed;
        syncModalSections();
    }

    function resetModalSections() {
        state.modalSections = createDefaultModalSections();
        syncModalSections();
    }

    function syncModalSections() {
        Object.keys(state.modalSections).forEach(function (section) {
            const collapsed = !!state.modalSections[section];
            const $panel = $("[data-ps-section='" + section + "']");
            const $button = $panel.find("[data-ps-toggle-section='" + section + "']");
            const $header = $panel.find("[data-ps-toggle-header='" + section + "']");
            $panel.toggleClass("is-collapsed", collapsed);
            $button.attr("aria-expanded", collapsed ? "false" : "true");
            $button.find("span").text(collapsed ? "Expandir" : "Contraer");
            $header.attr("aria-expanded", collapsed ? "false" : "true");
        });
    }

    function openQuickCatalogModal(key) {
        const config = quickCatalogConfigs[key];
        if (!config || state.quickCatalogSaving || state.isSaving || state.isUploadingImage) {
            return;
        }

        state.quickCatalogKey = key;
        resetQuickCatalogModal();
        $("#hdQuickCatalogoTipo").val(key);
        quickCatalogBridge.setCopy({
            kicker: "Registro",
            title: config.title,
            saveButton: "Guardar"
        });
        $("#frmQuickCatalogoProductoServicio").attr("data-quick-catalog-layout", key);
        quickCatalogBridge.applyFieldVisibility(config);
        syncQuickCatalogCodeField(false, "");
        state.quickCatalogModal.show();
    }

    function applyQuickCatalogFieldVisibility(config) {
        quickCatalogBridge.applyFieldVisibility(config);
    }

    function resetQuickCatalogModal() {
        state.quickCatalogSaving = false;
        state.quickCatalogKey = "";

        const defaultConfig = {
            showDescription: true,
            showAplicaA: false,
            showAbreviatura: false,
            showPermiteDecimales: false,
            defaultAplicaAValue: ""
        };
        quickCatalogBridge.reset(defaultConfig, {
            kicker: "Registro",
            title: "Nuevo catálogo",
            saveButton: "Guardar"
        });
        $(quickCatalogBridge.options.formSelector).removeClass("is-saving").removeAttr("data-quick-catalog-layout");
    }

    function saveQuickCatalog() {
        const config = quickCatalogConfigs[state.quickCatalogKey || $("#hdQuickCatalogoTipo").val()];
        if (!config || state.quickCatalogSaving) {
            return;
        }

        const payload = buildQuickCatalogPayload(config);
        const validation = validateQuickCatalogPayload(config);
        if (validation) {
            quickCatalogBridge.markFieldError(validation.selector);
            quickCatalogBridge.setStatus("danger", validation.message);
            return;
        }

        state.quickCatalogSaving = true;
        quickCatalogBridge.setBusy(true, "Guardando " + config.singular + "...", "Validando información y enviando una sola solicitud.");
        quickCatalogBridge.setStatus("info", "Guardando " + config.singular + "...");

        fetchJson(config.saveUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload)
        }).then(function (response) {
            return resolveQuickCatalogCreatedItem(config, payload, response)
                .then(function (item) {
                    if (!item || !item.id) {
                        throw new Error("El catálogo fue creado, pero no fue posible seleccionarlo automáticamente.");
                    }

                    syncQuickCatalogCombo(config, item);
                    state.quickCatalogModal.hide();
                    setStatus("#txInfoProductoServicio", "success", "Se agregó la " + config.singular + " y quedó seleccionada.");
                });
        }).catch(function (error) {
            const message = resolveErrorMessage(error);
            applyCatalogErrorFeedback("#txInfoQuickCatalogo", message, [
                { includes: ["código"], selector: "#txQuickCatalogoCodigo" },
                { includes: ["nombre"], selector: "#txQuickCatalogoNombre" },
                { includes: ["descripción"], selector: "#txQuickCatalogoDescripcion" },
                { includes: ["abreviatura"], selector: "#txQuickCatalogoAbreviatura" }
            ]);
        }).finally(function () {
            state.quickCatalogSaving = false;
            quickCatalogBridge.setBusy(false, "Guardando registro...", "Preparando información del catálogo...");
        });
    }

    function buildQuickCatalogPayload(config) {
        return quickCatalogBridge.buildPayload(config, { id: null });
    }

    function validateQuickCatalogPayload(config) {
        return quickCatalogBridge.validate(config);
    }

    function resolveQuickCatalogCreatedItem(config, payload, response) {
        if (response && response.id) {
            return Promise.resolve({
                id: response.id,
                codigo: response.codigo || "",
                nombre: response.nombre || payload.nombre || ""
            });
        }

        const query = new URLSearchParams({
            busqueda: payload.nombre || payload.codigo || "",
            estatus: "activos"
        });

        return fetchJson(config.listUrl + "?" + query.toString())
            .then(function (data) {
                const items = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
                return findQuickCatalogCreatedItem(items, payload);
            });
    }

    function syncQuickCatalogCodeField(isEditing, value) {
        quickCatalogBridge.syncCodeField(isEditing, value);
    }

    function findQuickCatalogCreatedItem(items, payload) {
        const normalizedCodigo = normalizeCatalogCompareValue(payload.codigo);
        const normalizedNombre = normalizeCatalogCompareValue(payload.nombre);

        return (items || []).find(function (item) {
            if (!item || !item.id || item.activo === false) {
                return false;
            }

            return normalizeCatalogCompareValue(item.codigo) === normalizedCodigo
                && normalizeCatalogCompareValue(item.nombre) === normalizedNombre;
        }) || null;
    }

    function syncQuickCatalogCombo(config, item) {
        const collectionKey = config.comboCollectionKey;
        const currentItems = Array.isArray(state.combos[collectionKey]) ? state.combos[collectionKey].slice() : [];
        const nextItem = normalizeQuickCatalogComboItem(config, item);
        const modalSelections = captureModalSelections();
        const filteredItems = currentItems.filter(function (entry) {
            return String(entry.id || "") !== String(nextItem.id || "");
        });

        filteredItems.push(nextItem);
        filteredItems.sort(function (a, b) {
            return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", { sensitivity: "base" });
        });
        state.combos[collectionKey] = filteredItems;

        populateModalCombos();
        restoreModalSelections(modalSelections);
        if (config.key === "categoria") {
            syncCategoryOptions(nextItem.id);
            $("#cbCategoriaProductoServicio").val(nextItem.id).trigger("change");
        } else {
            $(config.selectSelector).val(nextItem.id).trigger("change");
        }
    }

    function normalizeQuickCatalogComboItem(config, item) {
        const normalized = {
            id: item.id,
            codigo: item.codigo || "",
            nombre: item.nombre || ""
        };

        if (config.key === "categoria") {
            normalized.aplicaA = item.aplicaA == null ? 0 : Number(item.aplicaA);
        }

        if (config.key === "unidad") {
            normalized.abreviatura = item.abreviatura || "";
            normalized.permiteDecimales = !!item.permiteDecimales;
        }

        return normalized;
    }

    function openCollectionModal() {
        resetCollectionModal();
        state.collectionModal.show();
    }

    function resetCollectionModal() {
        const form = document.getElementById("frmColeccionProductoServicio");
        if (form) {
            form.reset();
        }
        setStatus("#txInfoColeccionProductoServicio", "", "");
    }

    function findComboItemById(items, id) {
        const targetId = String(id || "").trim();
        if (!targetId) {
            return null;
        }

        return (items || []).find(function (item) {
            return String(item.id || "").trim() === targetId;
        }) || null;
    }

    function requireCreatedComboItem(responseItem, items, fallbackMatcher, notFoundMessage) {
        const created = findComboItemById(items, responseItem && responseItem.id);
        if (created) {
            return created;
        }

        if (typeof fallbackMatcher === "function") {
            const fallback = (items || []).find(fallbackMatcher);
            if (fallback) {
                return fallback;
            }
        }

        throw new Error(notFoundMessage);
    }

    function saveCollection() {
        const payload = {
            numero: ($("#txColeccionNumeroProductoServicio").val() || "").trim(),
            nombre: ($("#txColeccionNombreProductoServicio").val() || "").trim(),
            descripcion: ($("#txColeccionDescripcionProductoServicio").val() || "").trim()
        };

        if (!payload.numero) {
            setStatus("#txInfoColeccionProductoServicio", "danger", "Captura el número de colección.");
            markFieldError("#txColeccionNumeroProductoServicio");
            return;
        }
        if (!payload.nombre) {
            setStatus("#txInfoColeccionProductoServicio", "danger", "Captura el nombre de la colección.");
            markFieldError("#txColeccionNombreProductoServicio");
            return;
        }

        setStatus("#txInfoColeccionProductoServicio", "info", "Guardando colección...");
        const modalSelections = captureModalSelections();
        fetchJson("/ProductosServicios/GuardarColeccionProductoServicio", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload)
        }).then(function (response) {
            if (!response || !response.coleccion || !response.coleccion.id) {
                throw new Error("La colección no devolvió una entidad válida. Intenta nuevamente.");
            }

            return loadCombos().then(function () {
                restoreModalSelections(modalSelections);
                const created = requireCreatedComboItem(response.coleccion, state.combos.colecciones, function (item) {
                    return normalizeCatalogCompareValue(item.numero) === normalizeCatalogCompareValue(payload.numero)
                        && normalizeCatalogCompareValue(item.nombre) === normalizeCatalogCompareValue(payload.nombre);
                }, "La colección no apareció en el catálogo después de guardar. Verifica el registro antes de cerrar.");

                $("#cbColeccionProductoServicio").val(created.id).trigger("change");
                state.collectionModal.hide();
                setStatus("#txInfoProductoServicio", "success", "La colección fue registrada y quedó seleccionada.");
            });
        }).catch(function (error) {
            applyCatalogErrorFeedback("#txInfoColeccionProductoServicio", resolveErrorMessage(error), [
                { includes: ["número"], selector: "#txColeccionNumeroProductoServicio" },
                { includes: ["nombre"], selector: "#txColeccionNombreProductoServicio" },
                { includes: ["descripción"], selector: "#txColeccionDescripcionProductoServicio" }
            ]);
        });
    }

    function openPackageModal() {
        resetPackageModal();
        state.packageModal.show();
    }

    function resetPackageModal() {
        const form = document.getElementById("frmPaqueteProductoServicio");
        if (form) {
            form.reset();
        }
        if ($("#cbTipoPaqueteProductoServicio option").length) {
            $("#cbTipoPaqueteProductoServicio").val($("#cbTipoPaqueteProductoServicio option:first").val()).trigger("change");
        }
        setStatus("#txInfoPaqueteProductoServicio", "", "");
    }

    function savePackage() {
        const payload = {
            nombre: ($("#txPaqueteNombreProductoServicio").val() || "").trim(),
            tipoPaquete: ($("#cbTipoPaqueteProductoServicio").val() || "").trim(),
            largoCm: toNullableNumber($("#txPaqueteLargoProductoServicio").val()),
            anchoCm: toNullableNumber($("#txPaqueteAnchoProductoServicio").val()),
            altoCm: toNullableNumber($("#txPaqueteAltoProductoServicio").val()),
            pesoEmpaqueVacioKg: toNullableNumber($("#txPaquetePesoProductoServicio").val()),
            esPredeterminado: $("#chkPaquetePredeterminadoProductoServicio").is(":checked")
        };

        if (!payload.nombre) {
            setStatus("#txInfoPaqueteProductoServicio", "danger", "Captura el nombre del paquete.");
            markFieldError("#txPaqueteNombreProductoServicio");
            return;
        }
        if (!payload.tipoPaquete) {
            setStatus("#txInfoPaqueteProductoServicio", "danger", "Selecciona el tipo de paquete.");
            markFieldError("#cbTipoPaqueteProductoServicio");
            return;
        }

        setStatus("#txInfoPaqueteProductoServicio", "info", "Guardando paquete...");
        const modalSelections = captureModalSelections();
        fetchJson("/ProductosServicios/GuardarPaqueteProductoServicio", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload)
        }).then(function (response) {
            if (!response || !response.paquete || !response.paquete.id) {
                throw new Error("El paquete no devolvió una entidad válida. Intenta nuevamente.");
            }

            return loadCombos().then(function () {
                restoreModalSelections(modalSelections);
                const created = requireCreatedComboItem(response.paquete, state.combos.paquetes, function (item) {
                    return normalizeCatalogCompareValue(item.nombre) === normalizeCatalogCompareValue(payload.nombre)
                        && normalizeCatalogCompareValue(item.tipoPaquete) === normalizeCatalogCompareValue(payload.tipoPaquete);
                }, "El paquete no apareció en el catálogo después de guardar. Verifica el registro antes de cerrar.");

                $("#cbPaqueteProductoServicio").val(created.id).trigger("change");
                state.packageModal.hide();
                setStatus("#txInfoProductoServicio", "success", "El paquete fue registrado y quedó seleccionado.");
            });
        }).catch(function (error) {
            applyCatalogErrorFeedback("#txInfoPaqueteProductoServicio", resolveErrorMessage(error), [
                { includes: ["nombre"], selector: "#txPaqueteNombreProductoServicio" },
                { includes: ["tipo"], selector: "#cbTipoPaqueteProductoServicio" },
                { includes: ["medidas", "peso"], selector: "#txPaqueteLargoProductoServicio" }
            ]);
        });
    }

    function openAttributeModal() {
        resetAttributeModal();
        state.attributeModal.show();
    }

    function openAttributeValueModal(rowKey, attributeId) {
        resetAttributeValueModal();
        $("#hdAtributoValorRowKeyProductoServicio").val(rowKey || "");
        $("#hdAtributoValorCatalogoProductoServicio").val(attributeId || "");
        $("#txAtributoValorAtributoNombreProductoServicio").val(resolveAttributeName(attributeId));
        state.attributeValueModal.show();
    }

    function resetAttributeModal() {
        const form = document.getElementById("frmAtributoProductoServicio");
        if (form) {
            form.reset();
        }
        setStatus("#txInfoAtributoProductoServicio", "", "");
    }

    function resetAttributeValueModal() {
        const form = document.getElementById("frmAtributoValorProductoServicio");
        if (form) {
            form.reset();
        }
        $("#hdAtributoValorRowKeyProductoServicio").val("");
        $("#hdAtributoValorCatalogoProductoServicio").val("");
        $("#txAtributoValorAtributoNombreProductoServicio").val("");
        setStatus("#txInfoAtributoValorProductoServicio", "", "");
    }

    function saveAttributeCatalog() {
        const payload = {
            nombre: ($("#txAtributoNombreProductoServicio").val() || "").trim()
        };

        if (!payload.nombre) {
            setStatus("#txInfoAtributoProductoServicio", "danger", "Captura el nombre del atributo.");
            markFieldError("#txAtributoNombreProductoServicio");
            return;
        }

        setStatus("#txInfoAtributoProductoServicio", "info", "Guardando atributo...");
        const modalSelections = captureModalSelections();
        fetchJson("/ProductosServicios/GuardarAtributoProductoServicio", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload)
        }).then(function (response) {
            if (!response || !response.atributo || !response.atributo.id) {
                throw new Error("El atributo no devolvió una entidad válida. Intenta nuevamente.");
            }

            return loadCombos().then(function () {
                restoreModalSelections(modalSelections);
                const created = requireCreatedComboItem(response.atributo, state.combos.atributos, function (item) {
                    return normalizeCatalogCompareValue(item.nombre) === normalizeCatalogCompareValue(payload.nombre);
                }, "El atributo no apareció en el catálogo después de guardar. Verifica el registro antes de cerrar.");

                state.attributeDraft.idAtributo = created.id;
                state.attributeDraft.idAtributoValor = "";
                renderAttributesEditor();
                state.attributeModal.hide();
                setStatus("#txInfoProductoServicio", "success", "El atributo fue registrado y quedó seleccionado.");
            });
        }).catch(function (error) {
            setStatus("#txInfoAtributoProductoServicio", "danger", resolveErrorMessage(error));
        });
    }

    function saveAttributeValueCatalog() {
        const rowKey = $("#hdAtributoValorRowKeyProductoServicio").val() || "";
        const idAtributo = normalizeGuid($("#hdAtributoValorCatalogoProductoServicio").val());
        const valor = ($("#txAtributoValorNombreProductoServicio").val() || "").trim();
        if (!idAtributo) {
            setStatus("#txInfoAtributoValorProductoServicio", "danger", "Selecciona el atributo al que pertenecerá el elemento.");
            return;
        }

        if (!valor) {
            setStatus("#txInfoAtributoValorProductoServicio", "danger", "Captura el nombre del elemento.");
            markFieldError("#txAtributoValorNombreProductoServicio");
            return;
        }

        setStatus("#txInfoAtributoValorProductoServicio", "info", "Guardando elemento...");
        fetchJson("/ProductosServicios/GuardarValorAtributoProductoServicio", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({
                idAtributo: idAtributo,
                valor: valor,
                orden: 1
            })
        }).then(function (response) {
            if (!response || !response.valor || !response.valor.id) {
                throw new Error("El elemento no devolvió una entidad válida. Intenta nuevamente.");
            }

            return ensureAttributeValuesLoaded(idAtributo, true).then(function (items) {
                state.attributeDraft.idAtributo = idAtributo;
                state.attributeDraft.idAtributoValor = response.valor.id || "";
                if (rowKey) {
                    const row = findAttributeRow(String(rowKey || ""));
                    if (row && String(row.idAtributo || "") === String(idAtributo || "")) {
                        addValueToRow(row, response.valor.valor || valor, response.valor.id || "");
                    }
                }
                renderAttributesEditor();
                state.attributeValueModal.hide();
                setStatus("#txInfoProductoServicio", "success", "El elemento fue registrado y quedó disponible para el atributo.");
                return items;
            });
        }).catch(function (error) {
            setStatus("#txInfoAtributoValorProductoServicio", "danger", resolveErrorMessage(error));
        });
    }

    function renderAttributesEditor() {
        const host = document.getElementById("contenedorAtributosProductoServicio");
        if (!host) {
            return;
        }
        const draftAttributeId = normalizeGuid(state.attributeDraft.idAtributo);
        const draftValueId = normalizeGuid(state.attributeDraft.idAtributoValor);
        const selectedValue = resolveAttributeValue(draftAttributeId, draftValueId);
        const relationRows = buildAttributeRelationRows();

        host.innerHTML = "" +
            "<div class='ps-attribute-form-row'>" +
            "  <label class='checkapp-field ps-attribute-form-field'>" +
            "    <span>Atributo</span>" +
            "    <select id='cbAtributoProductoServicioRelacion' class='form-select'>" + buildAttributeSelectOptions(draftAttributeId) + "</select>" +
            "  </label>" +
            "  <div class='ps-attribute-inline-button'>" +
            "    <button id='btQuickAddAtributoFilaProductoServicio' type='button' class='checkapp-btn checkapp-btn-ghost' aria-label='Nuevo atributo'><i class='fa fa-plus'></i></button>" +
            "  </div>" +
            "  <label class='checkapp-field ps-attribute-form-field'>" +
            "    <span>Elemento</span>" +
            "    <select id='cbElementoAtributoProductoServicioRelacion' class='form-select'" + (draftAttributeId ? "" : " disabled") + ">" + buildAttributeSingleValueOptions(draftAttributeId, draftValueId) + "</select>" +
            "  </label>" +
            "  <div class='ps-attribute-inline-button'>" +
            "    <button id='btQuickAddAtributoValorFilaProductoServicio' type='button' class='checkapp-btn checkapp-btn-ghost' aria-label='Nuevo elemento'" + (draftAttributeId ? "" : " disabled") + "><i class='fa fa-plus'></i></button>" +
            "  </div>" +
            "  <div class='ps-attribute-form-actions'>" +
            "    <button id='btAgregarRelacionAtributoProductoServicio' type='button' class='checkapp-btn checkapp-btn-secondary'" + (draftAttributeId && draftValueId ? "" : " disabled") + "><i class='fa fa-plus'></i><span>Agregar</span></button>" +
            "  </div>" +
            "</div>" +
            "<div class='ps-inline-actions ps-attribute-form-hint'>" +
            (selectedValue ? "<span class='ps-value-hint'>Se agregará: " + escapeHtml(resolveAttributeName(draftAttributeId)) + " / " + escapeHtml(selectedValue.valor || "") + "</span>" : "") +
            "</div>" +
            (relationRows.length
                ? "<div class='ps-value-tags' style='margin-top:1rem;'>" + relationRows.join("") + "</div>"
                : "<div class='ps-empty-state' style='margin-top:1rem;'>Sin asociaciones de atributos todavía. Selecciona un atributo, carga su elemento dependiente y agrégalo al producto sin generar variantes.</div>");
    }

    function buildAttributeSelectOptions(selectedId) {
        const options = ["<option value=''>Selecciona un atributo</option>"];
        (state.combos.atributos || []).forEach(function (item) {
            const isSelected = String(item.id || "") === String(selectedId || "");
            options.push("<option value='" + escapeHtml(item.id || "") + "'" + (isSelected ? " selected" : "") + ">" + escapeHtml(item.nombre || "") + "</option>");
        });
        return options.join("");
    }

    function createAttributeRow(initial) {
        const data = initial || {};
        return {
            rowKey: data.rowKey || createClientKey("atr"),
            idProductoAtributo: data.idProductoAtributo || "",
            idAtributo: data.idAtributo || "",
            nombre: data.nombre || "",
            valores: data.valores || []
        };
    }

    function mapAttributesFromServer(items) {
        const rows = [];
        (items || []).forEach(function (item) {
            const values = (item.valores || []).map(function (value) {
                return {
                    idAtributoValor: value.idAtributoValor || "",
                    valor: value.valor || "",
                    orden: Number(value.orden || 0)
                };
            });

            if (!values.length) {
                rows.push(createAttributeRow({
                    idProductoAtributo: item.idProductoAtributo || "",
                    idAtributo: item.idAtributo || "",
                    nombre: item.nombre || "",
                    valores: []
                }));
                return;
            }

            values.forEach(function (value) {
                rows.push(createAttributeRow({
                    idProductoAtributo: item.idProductoAtributo || "",
                    idAtributo: item.idAtributo || "",
                    nombre: item.nombre || "",
                    valores: [value]
                }));
            });
        });
        return rows;
    }

    function createVariantOptionRow(initial) {
        const data = initial || {};
        return {
            rowKey: data.rowKey || createClientKey("opt"),
            idOpcionVariante: data.idOpcionVariante || "",
            nombre: data.nombre || "",
            valores: (data.valores || []).length ? data.valores : [createVariantOptionValueRow()],
            isEditing: data.isEditing !== false
        };
    }

    function createVariantOptionValueRow(initial) {
        const data = initial || {};
        return {
            rowKey: data.rowKey || createClientKey("optval"),
            idOpcionVarianteValor: data.idOpcionVarianteValor || "",
            valor: data.valor || "",
            orden: Number(data.orden || 0)
        };
    }

    function findAttributeRow(key) {
        return state.attributeRows.find(function (item) { return item.rowKey === key; }) || null;
    }

    function findVariantOptionRow(key) {
        return state.variantOptionRows.find(function (item) { return item.rowKey === key; }) || null;
    }

    function findVariantOptionValueRow(row, valueKey) {
        return (row && row.valores || []).find(function (item) { return item.rowKey === valueKey; }) || null;
    }

    function resolveAttributeName(idAtributo) {
        const found = (state.combos.atributos || []).find(function (item) {
            return String(item.id || "") === String(idAtributo || "");
        });
        return found ? (found.nombre || "") : "";
    }

    function addValueToRow(row, value, valueId) {
        const normalized = normalizeCatalogCompareValue(value);
        if ((row.valores || []).some(function (item) { return normalizeCatalogCompareValue(item.valor) === normalized; })) {
            return;
        }

        row.valores = (row.valores || []).concat([{
            idAtributoValor: valueId || "",
            valor: value,
            orden: (row.valores || []).length + 1
        }]);
    }

    function buildAttributeSingleValueOptions(idAtributo, selectedValueId) {
        if (!idAtributo) {
            return "<option value=''>Selecciona primero un atributo</option>";
        }

        const options = getAttributeCatalogValues(idAtributo).map(function (item) {
            const selected = String(item.id || "") === String(selectedValueId || "");
            return "<option value='" + escapeHtml(item.id || "") + "'" + (selected ? " selected" : "") + ">" + escapeHtml(item.valor || "") + "</option>";
        });

        return options.length
            ? "<option value=''>Selecciona un elemento</option>" + options.join("")
            : "<option value=''>Todavía no hay elementos para este atributo</option>";
    }

    function buildAttributeRelationRows() {
        return state.attributeRows
            .filter(function (item) {
                return item.idAtributo && item.valores.length;
            })
            .map(function (item) {
                const value = item.valores[0] || { valor: "" };
                return "<span class='ps-value-tag'>" +
                    "<span class='ps-value-tag__attribute'>" + escapeHtml(resolveAttributeName(item.idAtributo) || item.nombre || "Atributo") + "</span>" +
                    "<span class='ps-value-tag__value'>" + escapeHtml(value.valor || "") + "</span>" +
                    "<button type='button' class='checkapp-btn checkapp-btn-ghost ps-inline-remove' data-ps-attribute-remove='" + escapeHtml(item.rowKey) + "'><i class='fa fa-times'></i><span>Quitar</span></button>" +
                    "</span>";
            });
    }

    function resolveAttributeValue(idAtributo, idAtributoValor) {
        if (!idAtributo || !idAtributoValor) {
            return null;
        }

        return getAttributeCatalogValues(idAtributo).find(function (item) {
            return String(item.id || "") === String(idAtributoValor || "");
        }) || null;
    }

    function addCurrentAttributeRelation() {
        const idAtributo = normalizeGuid(state.attributeDraft.idAtributo);
        const idAtributoValor = normalizeGuid(state.attributeDraft.idAtributoValor);
        const attributeName = resolveAttributeName(idAtributo);
        const value = resolveAttributeValue(idAtributo, idAtributoValor);

        if (!idAtributo || !idAtributoValor || !value) {
            showError("Selecciona un atributo y un elemento antes de agregar la relación.");
            return;
        }

        const duplicated = state.attributeRows.some(function (item) {
            const current = item.valores[0];
            return String(item.idAtributo || "") === String(idAtributo || "")
                && current
                && String(current.idAtributoValor || "") === String(idAtributoValor || "");
        });

        if (duplicated) {
            showError("Esa relación atributo / elemento ya fue agregada al producto.");
            return;
        }

        state.attributeRows.push(createAttributeRow({
            idAtributo: idAtributo,
            nombre: attributeName,
            valores: [{
                idAtributoValor: idAtributoValor,
                valor: value.valor || "",
                orden: 1
            }]
        }));

        state.attributeDraft.idAtributo = "";
        state.attributeDraft.idAtributoValor = "";
        renderAttributesEditor();
    }

    function getAttributeCatalogValues(idAtributo) {
        return state.attributeValueCatalog[String(idAtributo || "")] || [];
    }

    function ensureAttributeValuesLoaded(idAtributo, forceReload) {
        const key = String(idAtributo || "");
        if (!key) {
            return Promise.resolve([]);
        }

        if (!forceReload && Object.prototype.hasOwnProperty.call(state.attributeValueCatalog, key)) {
            return Promise.resolve(state.attributeValueCatalog[key] || []);
        }

        return fetchJson("/ProductosServicios/ObtenerValoresAtributoProductoServicio?idAtributo=" + encodeURIComponent(key))
            .then(function (items) {
                state.attributeValueCatalog[key] = Array.isArray(items) ? items : [];
                return state.attributeValueCatalog[key];
            })
            .catch(function (error) {
                state.attributeValueCatalog[key] = [];
                throw error;
            });
    }

    function syncVariantsWithOptions() {
        const normalizedOptions = buildVariantOptionsPayload().filter(function (item) {
            return item.nombre && item.valores.length;
        });

        if (!normalizedOptions.length) {
            state.variants = [];
            renderVariantsEditor();
            return;
        }

        const combinations = buildVariantCombinations(normalizedOptions);
        const existingMap = new Map(state.variants.map(function (item) { return [item.claveCombinacion, item]; }));

        state.variants = combinations.map(function (combo, index) {
            const key = combo.claveCombinacion;
            const existing = existingMap.get(key);
            return {
                rowKey: existing ? existing.rowKey : createClientKey("var"),
                id: existing ? existing.id : "",
                nombre: existing ? existing.nombre : combo.nombre,
                claveCombinacion: key,
                existingImage: existing ? (existing.existingImage || null) : null,
                imageDraft: existing ? (existing.imageDraft || null) : null,
                removeExistingImage: existing ? !!existing.removeExistingImage : false,
                isUploadingImage: existing ? !!existing.isUploadingImage : false,
                costo: existing ? existing.costo : null,
                precioPublico: existing ? existing.precioPublico : null,
                precioComparacion: existing ? existing.precioComparacion : null,
                precioUnitarioMonto: existing ? existing.precioUnitarioMonto : null,
                precioUnitarioBaseCantidad: existing ? existing.precioUnitarioBaseCantidad : null,
                precioUnitarioUnidad: existing ? existing.precioUnitarioUnidad : "",
                orden: index + 1,
                valores: combo.valores
            };
        });

        renderVariantsEditor();
    }

    function buildVariantOptionsPayload() {
        return state.variantOptionRows
            .filter(function (item) {
                return String(item.nombre || "").trim() && normalizeVariantOptionValues(item.valores || []).length;
            })
            .map(function (item) {
                const valores = normalizeVariantOptionValues(item.valores || []);
                return {
                    idOpcionVariante: item.idOpcionVariante || "",
                    nombre: String(item.nombre || "").trim(),
                    valores: valores.map(function (value, index) {
                        return {
                            idOpcionVarianteValor: value.idOpcionVarianteValor || "",
                            valor: value.valor || "",
                            orden: index + 1
                        };
                    })
                };
            });
    }

    function normalizeVariantOptionValues(values) {
        const seen = new Set();
        return (values || [])
            .map(function (item, index) {
                return {
                    rowKey: item.rowKey || createClientKey("optval"),
                    idOpcionVarianteValor: item.idOpcionVarianteValor || "",
                    valor: String(item.valor || "").trim(),
                    orden: index + 1
                };
            })
            .filter(function (item) {
                if (!item.valor) {
                    return false;
                }
                const key = normalizeCatalogCompareValue(item.valor);
                if (seen.has(key)) {
                    return false;
                }
                seen.add(key);
                return true;
            });
    }

    function buildVariantCombinations(options) {
        let combos = [{ valores: [], partes: [] }];
        options.forEach(function (option) {
            const next = [];
            combos.forEach(function (combo) {
                option.valores.forEach(function (value) {
                    next.push({
                        valores: combo.valores.concat([{
                            idOpcionVariante: option.idOpcionVariante || "",
                            idOpcionVarianteValor: value.idOpcionVarianteValor || "",
                            opcion: option.nombre,
                            valor: value.valor,
                            orden: combo.valores.length + 1
                        }]),
                        partes: combo.partes.concat([option.nombre + ":" + value.valor])
                    });
                });
            });
            combos = next;
        });

        return combos.map(function (combo) {
            return {
                nombre: combo.valores.map(function (item) { return item.valor; }).join(" / "),
                claveCombinacion: combo.partes.join("|"),
                valores: combo.valores
            };
        });
    }

    function renderVariantOptionsEditor(focusConfig) {
        const host = document.getElementById("contenedorOpcionesVariantesProductoServicio");
        if (!host) {
            return;
        }

        if (!state.variantOptionRows.length) {
            host.innerHTML = "<div class='ps-empty-state'><button type='button' class='checkapp-btn checkapp-btn-secondary' data-ps-variant-add-option='1'><i class='fa fa-plus'></i><span>Agregar opción</span></button></div>";
            return;
        }

        host.innerHTML = "<div class='ps-variant-options-shell'>" +
            state.variantOptionRows.map(function (item, index) {
                const normalizedValues = item.valores || [];
                const compactValues = normalizeVariantOptionValues(normalizedValues);
                if (!item.isEditing) {
                    return "<article class='ps-variant-option-card'>" +
                        "  <div class='ps-variant-option-head'>" +
                        "    <div><strong>" + escapeHtml(item.nombre || ("Opción " + (index + 1))) + "</strong></div>" +
                        "    <div class='ps-inline-actions'>" +
                        "      <button type='button' class='checkapp-btn checkapp-btn-ghost' data-ps-variant-option-edit='" + escapeHtml(item.rowKey) + "'><i class='fa fa-pencil'></i><span>Editar</span></button>" +
                        "      <button type='button' class='checkapp-btn checkapp-btn-ghost ps-inline-remove' data-ps-variant-option-remove='" + escapeHtml(item.rowKey) + "'><i class='fa fa-trash'></i><span>Eliminar opción</span></button>" +
                        "    </div>" +
                        "  </div>" +
                        "  <div class='ps-value-tags'>" +
                        compactValues.map(function (value) {
                            return "<span class='ps-value-tag'><span>" + escapeHtml(value.valor || "") + "</span></span>";
                        }).join("") +
                        "  </div>" +
                        "</article>";
                }

                return "" +
                    "<article class='ps-variant-option-card'>" +
                    "  <div class='ps-variant-option-head'>" +
                    "    <strong>Opción " + (index + 1) + "</strong>" +
                    "    <div class='ps-inline-actions'>" +
                    "      <button type='button' class='checkapp-btn checkapp-btn-ghost ps-inline-remove' data-ps-variant-option-remove='" + escapeHtml(item.rowKey) + "'><i class='fa fa-trash'></i><span>Eliminar opción</span></button>" +
                    "      <button type='button' class='checkapp-btn checkapp-btn-secondary' data-ps-variant-option-done='" + escapeHtml(item.rowKey) + "'><span>Listo</span></button>" +
                    "    </div>" +
                    "  </div>" +
                    "  <div class='ps-variant-option-grid'>" +
                    "    <label class='checkapp-field'>" +
                    "      <span>Nombre de opción</span>" +
                    "      <input class='form-control' data-ps-variant-option-name='" + escapeHtml(item.rowKey) + "' value='" + escapeHtml(item.nombre || "") + "' placeholder='Ejemplo: Talla' />" +
                    "    </label>" +
                    "    <div class='ps-variant-values-editor'>" +
                    "      <span class='ps-variant-values-label'>Valores de opción</span>" +
                    normalizedValues.map(function (value) {
                        return "" +
                            "<div class='ps-variant-value-row'>" +
                            "  <input class='form-control' data-ps-variant-option-value-input='" + escapeHtml(item.rowKey) + "' data-ps-value-key='" + escapeHtml(value.rowKey || "") + "' value='" + escapeHtml(value.valor || "") + "' placeholder='Ejemplo: CH' />" +
                            "  <button type='button' class='checkapp-btn checkapp-btn-ghost ps-inline-remove' data-ps-variant-option-value-remove='" + escapeHtml(item.rowKey) + "' data-ps-value-key='" + escapeHtml(value.rowKey || "") + "'><i class='fa fa-trash'></i><span>Quitar</span></button>" +
                            "</div>";
                    }).join("") +
                    "      <button type='button' class='checkapp-btn checkapp-btn-ghost' data-ps-variant-option-add-value='" + escapeHtml(item.rowKey) + "'><i class='fa fa-plus'></i><span>Agregar otro valor</span></button>" +
                    "    </div>" +
                    "  </div>" +
                    "</article>";
            }).join("") +
            "<div class='ps-inline-actions' style='margin-top:1rem;'><button type='button' class='checkapp-btn checkapp-btn-secondary' data-ps-variant-add-option='1'><i class='fa fa-plus'></i><span>Agregar opción</span></button></div>" +
            "</div>";

        applyVariantOptionFocus(focusConfig);
    }

    function mapVariantOptionsFromServer(items) {
        return (items || []).map(function (item) {
            return createVariantOptionRow({
                idOpcionVariante: item.id || "",
                nombre: item.nombre || "",
                valores: (item.valores || []).map(function (value) {
                    return createVariantOptionValueRow({
                        idOpcionVarianteValor: value.id || "",
                        valor: value.valor || "",
                        orden: Number(value.orden || 0)
                    });
                }),
                isEditing: false
            });
        });
    }

    function mapVariantsFromServer(items) {
        return (items || []).map(function (item) {
            return {
                rowKey: createClientKey("var"),
                id: item.id || "",
                nombre: item.nombre || "",
                claveCombinacion: item.claveCombinacion || "",
                existingImage: item.imagenUrl ? { url: item.imagenUrl || "", nombre: item.imagenNombre || "" } : null,
                imageDraft: null,
                removeExistingImage: false,
                isUploadingImage: false,
                costo: item.costo == null ? null : Number(item.costo),
                precioPublico: item.precioPublico == null ? null : Number(item.precioPublico),
                precioComparacion: item.precioComparacion == null ? null : Number(item.precioComparacion),
                precioUnitarioMonto: item.precioUnitarioMonto == null ? null : Number(item.precioUnitarioMonto),
                precioUnitarioBaseCantidad: item.precioUnitarioBaseCantidad == null ? null : Number(item.precioUnitarioBaseCantidad),
                precioUnitarioUnidad: item.precioUnitarioUnidad || "",
                orden: Number(item.orden || 0),
                valores: (item.valores || []).map(function (value) {
                    return {
                        idOpcionVariante: value.idOpcionVariante || "",
                        idOpcionVarianteValor: value.idOpcionVarianteValor || "",
                        opcion: value.opcion || "",
                        valor: value.valor || "",
                        orden: Number(value.orden || 0)
                    };
                })
            };
        });
    }

    function renderVariantsEditor() {
        const host = document.getElementById("contenedorVariantesProductoServicio");
        const summary = document.getElementById("txResumenVariantesProductoServicio");
        if (!host || !summary) {
            return;
        }

        if (!state.variantOptionRows.length) {
            summary.textContent = "Sin opciones de variante configuradas.";
            host.innerHTML = "<div class='ps-empty-state'>Agrega una opción como talla o color para comenzar.</div>";
            return;
        }

        if (!state.variants.length) {
            summary.textContent = "Completa al menos una opción con valores para construir variantes.";
            host.innerHTML = "<div class='ps-empty-state'>Todavía no hay combinaciones vendibles.</div>";
            return;
        }

        summary.textContent = state.variants.length + " variante(s). El precio base del producto permanece independiente.";
        host.innerHTML = "" +
            "<div class='ps-variants-table-wrap'>" +
            "  <table class='table table-row-bordered align-middle ps-variants-table'>" +
            "    <thead><tr><th>Variante</th><th>Imagen</th><th>Costo</th><th>Precio</th></tr></thead>" +
            "    <tbody>" + state.variants.map(renderVariantRow).join("") + "</tbody>" +
            "  </table>" +
            "</div>";
    }

    function renderVariantRow(item) {
        const image = resolveVariantImageState(item);
        const imageActions = item.isUploadingImage
            ? "<span class='checkapp-status-inline is-info'>Subiendo...</span>"
            : "<div class='ps-inline-actions'>" +
                "<button type='button' class='checkapp-btn checkapp-btn-ghost' data-ps-variant-image-select='" + escapeHtml(item.rowKey) + "'><span>" + (image.url ? "Cambiar" : "Agregar imagen") + "</span></button>" +
                (image.url
                    ? "<button type='button' class='checkapp-btn checkapp-btn-ghost ps-inline-remove' data-ps-variant-image-remove='" + escapeHtml(item.rowKey) + "'><span>Eliminar</span></button>"
                    : "") +
              "</div>";

        return "" +
            "<tr>" +
            "  <td><div class='ps-variant-name'><strong>" + escapeHtml(item.nombre || "Variante") + "</strong><small>" + escapeHtml((item.valores || []).map(function (value) { return value.opcion + ": " + value.valor; }).join(" · ")) + "</small></div></td>" +
            "  <td><div class='ps-variant-image-cell'>" +
            (image.url
                ? "<div class='ps-variant-image-preview'><img src='" + escapeHtml(image.url) + "' alt='" + escapeHtml(image.nombre || item.nombre || "Imagen de variante") + "' style='width:48px;height:48px;object-fit:cover;border-radius:12px;border:1px solid #d6dce8;display:block;' /></div>"
                : "<div class='ps-variant-image-empty' style='font-size:.85rem;color:#6b7280;'>Sin imagen</div>") +
            imageActions +
            "<input type='file' accept='image/png,image/jpeg,image/webp' hidden data-ps-variant-image-input='" + escapeHtml(item.rowKey) + "' />" +
            "</div></td>" +
            "  <td><input class='form-control' type='number' min='0' step='0.0001' placeholder='$0.00' data-ps-variant-field='costo' data-ps-variant-key='" + escapeHtml(item.rowKey) + "' value='" + escapeHtml(item.costo == null ? "" : item.costo) + "' /></td>" +
            "  <td><input class='form-control' type='number' min='0' step='0.0001' data-ps-variant-field='precioPublico' data-ps-variant-key='" + escapeHtml(item.rowKey) + "' value='" + escapeHtml(item.precioPublico == null ? "" : item.precioPublico) + "' />" +
            "<input type='hidden' data-ps-variant-field='precioComparacion' data-ps-variant-key='" + escapeHtml(item.rowKey) + "' value='" + escapeHtml(item.precioComparacion == null ? "" : item.precioComparacion) + "' />" +
            "<input type='hidden' data-ps-variant-field='precioUnitarioMonto' data-ps-variant-key='" + escapeHtml(item.rowKey) + "' value='" + escapeHtml(item.precioUnitarioMonto == null ? "" : item.precioUnitarioMonto) + "' />" +
            "<input type='hidden' data-ps-variant-field='precioUnitarioBaseCantidad' data-ps-variant-key='" + escapeHtml(item.rowKey) + "' value='" + escapeHtml(item.precioUnitarioBaseCantidad == null ? "" : item.precioUnitarioBaseCantidad) + "' />" +
            "<input type='hidden' data-ps-variant-field='precioUnitarioUnidad' data-ps-variant-key='" + escapeHtml(item.rowKey) + "' value='" + escapeHtml(item.precioUnitarioUnidad || "") + "' /></td>" +
            "</tr>";
    }

    function applyVariantOptionFocus(focusConfig) {
        if (!focusConfig || !focusConfig.focusOptionKey) {
            return;
        }

        window.setTimeout(function () {
            let selector = "[data-ps-variant-option-name='" + focusConfig.focusOptionKey + "']";
            if (focusConfig.focusTarget === "value" && focusConfig.focusValueKey) {
                selector = "[data-ps-variant-option-value-input='" + focusConfig.focusOptionKey + "'][data-ps-value-key='" + focusConfig.focusValueKey + "']";
            }

            const node = document.querySelector(selector);
            if (node && typeof node.focus === "function") {
                node.focus();
                if (typeof node.setSelectionRange === "function") {
                    const end = String(node.value || "").length;
                    node.setSelectionRange(end, end);
                }
            }
        }, 0);
    }

    function findVariantRow(key) {
        return state.variants.find(function (item) { return item.rowKey === key; }) || null;
    }

    function resolveVariantImageState(row) {
        if (row.imageDraft && row.imageDraft.archivo) {
            return {
                url: row.imageDraft.archivo.urlFirebase || "",
                nombre: row.imageDraft.archivo.nombreOriginal || "Imagen temporal"
            };
        }

        if (row.existingImage) {
            return {
                url: row.existingImage.url || "",
                nombre: row.existingImage.nombre || "Imagen actual"
            };
        }

        return { url: "", nombre: "" };
    }

    function hasPendingVariantImageUploads() {
        return state.variantImageUploadCount > 0 || state.variants.some(function (item) { return !!item.isUploadingImage; });
    }

    function handleVariantImageSelection(event) {
        const key = event.target.getAttribute("data-ps-variant-image-input") || "";
        const row = findVariantRow(key);
        const file = event.target.files && event.target.files[0];
        event.target.value = "";
        if (!row || !file) {
            return;
        }

        if (!isValidImageFile(file)) {
            showError("Selecciona una imagen JPG, PNG o WEBP de hasta 10 MB para la variante.");
            return;
        }

        cleanupVariantImageRow(row);
        row.isUploadingImage = true;
        state.variantImageUploadCount += 1;
        renderVariantsEditor();

        const formData = new FormData();
        formData.append("archivo", file);

        fetch("/ProductosServicios/SubirImagenTemporal", {
            method: "POST",
            body: formData
        }).then(function (response) {
            return response.text().then(function (text) {
                const data = text ? JSON.parse(text) : {};
                if (!response.ok) {
                    throw new Error(resolveServerMessage(data) || "No fue posible subir la imagen de la variante.");
                }

                return data;
            });
        }).then(function (data) {
            row.imageDraft = { archivo: data.archivo || null };
            row.existingImage = null;
            row.removeExistingImage = false;
        }).catch(function (error) {
            showError(resolveErrorMessage(error));
        }).finally(function () {
            row.isUploadingImage = false;
            state.variantImageUploadCount = Math.max(0, state.variantImageUploadCount - 1);
            renderVariantsEditor();
        });
    }

    function cleanupVariantImageRow(row) {
        if (row && row.imageDraft && row.imageDraft.archivo && row.imageDraft.archivo.temporalToken) {
            cleanupTempTokens([row.imageDraft.archivo.temporalToken], "/ProductosServicios/LimpiarImagenTemporal");
        }
    }

    function cleanupVariantImagesOnClose() {
        if (state.savedModalImage) {
            return;
        }

        state.variants.forEach(function (row) {
            cleanupVariantImageRow(row);
        });
    }

    function createEmptyMultimediaState() {
        return {
            foto: [],
            video: [],
            documento: []
        };
    }

    function hydrateMultimediaFromServer(items) {
        state.multimedia = createEmptyMultimediaState();
        (items || []).forEach(function (item, index) {
            const tipo = inferTipoMultimedia(item);
            if (!tipo) {
                return;
            }

            state.multimedia[tipo].push({
                id: item.id || "",
                clientKey: "srv-" + index + "-" + createClientKey("media"),
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
                status: "saved",
                progress: 100,
                error: "",
                xhr: null,
                file: null
            });
        });
    }

    function renderMultimediaEditor() {
        renderMultimediaSection("foto", "#contenedorFotosProductoServicio", "#txResumenFotosProductoServicio");
        renderMultimediaSection("video", "#contenedorVideoProductoServicio", "#txResumenVideoProductoServicio");
        renderMultimediaSection("documento", "#contenedorDocumentosProductoServicio", "#txResumenDocumentosProductoServicio");
    }

    function renderMultimediaSection(tipo, containerSelector, summarySelector) {
        const items = state.multimedia[tipo] || [];
        const uploadedCount = items.filter(isMultimediaReady).length;
        const activeCount = items.filter(isMultimediaUploading).length;
        const erroredCount = items.filter(function (item) { return item.status === "error"; }).length;
        let summaryText = tipo === "video"
            ? (items.length ? uploadedCount + " de 1 listo" : "Sin video")
            : (uploadedCount + " de " + multimediaLimits[tipo].max + " listos");

        if (activeCount) {
            summaryText += " · " + activeCount + " en proceso";
        }
        if (erroredCount) {
            summaryText += " · " + erroredCount + " con error";
        }

        $(summarySelector)
            .toggleClass("is-danger", erroredCount > 0)
            .toggleClass("is-success", erroredCount === 0 && uploadedCount > 0)
            .text(summaryText);

        if (!items.length) {
            const emptyText = tipo === "foto"
                ? "Sin fotos cargadas."
                : tipo === "video"
                    ? "Sin video cargado."
                    : "Sin documentos cargados.";
            $(containerSelector).html("<div class='ps-empty-media'>" + emptyText + "</div>");
            return;
        }

        $(containerSelector).html(items.map(renderMultimediaItem).join(""));
    }

    function renderMultimediaItem(item) {
        if (item.tipoMultimedia === "foto") {
            return "" +
                "<article class='ps-media-item ps-media-item--photo'>" +
                "  <img src='" + escapeHtml(item.previewUrl || item.urlFirebase || "") + "' alt='" + escapeHtml(item.nombreOriginal || "Foto") + "' />" +
                "  <div class='ps-media-item-meta'><strong>" + escapeHtml(item.nombreOriginal || "Foto") + "</strong><small>" + formatFileSize(item.pesoBytes) + "</small>" + renderMultimediaStatus(item) + "</div>" +
                renderMultimediaActions(item) +
                "</article>";
        }

        if (item.tipoMultimedia === "video") {
            return "" +
                "<article class='ps-media-item'>" +
                "  <div class='ps-media-item-meta'><strong>" + escapeHtml(item.nombreOriginal || "Video") + "</strong><small>" + formatFileSize(item.pesoBytes) + "</small>" + renderMultimediaStatus(item) + "</div>" +
                "  <video controls preload='metadata' src='" + escapeHtml(item.previewUrl || item.urlFirebase || "") + "'></video>" +
                renderMultimediaActions(item) +
                "</article>";
        }

        return "" +
            "<article class='ps-media-item'>" +
            "  <div class='ps-media-item-meta'><strong>" + escapeHtml(item.nombreOriginal || "Documento") + "</strong><small>" + formatFileSize(item.pesoBytes) + "</small>" + renderMultimediaStatus(item) + "</div>" +
            "  <a class='checkapp-btn checkapp-btn-ghost' href='" + escapeHtml(item.previewUrl || item.urlFirebase || "#") + "' target='_blank' rel='noopener noreferrer'>Abrir</a>" +
            renderMultimediaActions(item) +
            "</article>";
    }

    function renderMultimediaStatus(item) {
        const text = resolveMultimediaStatusText(item);
        const progress = isMultimediaUploading(item) ? "<div class='ps-media-progress'><span style='width:" + Math.max(2, Math.min(100, item.progress || 0)) + "%'></span></div>" : "";
        const error = item.error ? "<small class='ps-media-error'>" + escapeHtml(item.error) + "</small>" : "";
        return "<div class='ps-media-status'><span class='ps-media-status-pill is-" + escapeHtml(item.status || "queued") + "'>" + escapeHtml(text) + "</span>" + progress + error + "</div>";
    }

    function renderMultimediaActions(item) {
        const actions = [];
        if (item.status === "error") {
            actions.push("<button type='button' class='checkapp-btn checkapp-btn-secondary' data-ps-media-retry='" + escapeHtml(item.clientKey) + "' data-ps-media-tipo='" + escapeHtml(item.tipoMultimedia) + "'><i class='fa fa-refresh'></i><span>Reintentar</span></button>");
        }
        actions.push("<button type='button' class='checkapp-btn checkapp-btn-ghost' data-ps-media-remove='" + escapeHtml(item.clientKey) + "' data-ps-media-tipo='" + escapeHtml(item.tipoMultimedia) + "'><i class='fa fa-trash'></i><span>Quitar</span></button>");
        return "<div class='ps-media-actions'>" + actions.join("") + "</div>";
    }

    function addMultimediaFiles(tipo, fileList) {
        const files = Array.prototype.slice.call(fileList || []);
        if (!files.length) {
            return;
        }

        const target = state.multimedia[tipo] || [];
        const max = multimediaLimits[tipo].max;
        if ((target.length + files.length) > max) {
            showError("Solo puedes agregar hasta " + max + " archivo(s) de tipo " + tipo + ".");
            return;
        }

        const prepared = [];
        try {
            files.forEach(function (file) {
                validateMultimediaFile(tipo, file);
                prepared.push(createMultimediaDraft(tipo, file));
            });
        } catch (error) {
            showError(resolveErrorMessage(error));
            return;
        }

        ensureUploadOperation();
        prepared.forEach(function (item) {
            target.push(item);
        });
        renderMultimediaEditor();
        pumpUploads();
    }

    function validateMultimediaFile(tipo, file) {
        const limit = multimediaLimits[tipo];
        if (!limit) {
            throw new Error("Tipo de evidencia no soportado.");
        }

        const mimeType = String(file.type || "").toLowerCase();
        const extension = "." + String(file.name || "").split(".").pop().toLowerCase();
        const matchesType = limit.accepts.indexOf(mimeType) >= 0
            || (tipo === "documento" && [".pdf", ".doc", ".docx"].indexOf(extension) >= 0);
        if (!matchesType) {
            throw new Error("El archivo seleccionado no corresponde al tipo permitido para " + tipo + ".");
        }

        if (Number(file.size || 0) > limit.maxBytes) {
            throw new Error("El archivo excede el tamaño permitido para " + tipo + ".");
        }
    }

    function createMultimediaDraft(tipo, file) {
        const previewUrl = tipo === "documento" ? "" : createObjectUrl(file);
        return {
            id: "",
            clientKey: createClientKey("media"),
            tipoMultimedia: tipo,
            nombreOriginal: file.name || "archivo",
            nombreAlmacenado: "",
            extension: resolveFileExtension(file.name || ""),
            mimeType: file.type || "",
            urlFirebase: "",
            pesoBytes: Number(file.size || 0),
            orden: 0,
            previewUrl: previewUrl,
            temporalToken: "",
            isNew: true,
            status: "queued",
            progress: 0,
            error: "",
            xhr: null,
            file: file
        };
    }

    function ensureUploadOperation() {
        if (!state.uploadOperationId) {
            state.uploadOperationId = createClientKey("upl");
        }
    }

    function pumpUploads() {
        ["foto", "video", "documento"].forEach(function (tipo) {
            const queue = (state.multimedia[tipo] || []).filter(function (item) { return item.status === "queued"; });
            if (!queue.length) {
                return;
            }
            if (state.uploadCounts[tipo] > 0) {
                return;
            }
            const item = queue[0];
            startUpload(item);
        });
    }

    function startUpload(item) {
        state.uploadCounts[item.tipoMultimedia] += 1;
        item.status = "uploading";
        item.progress = 2;
        item.error = "";
        renderMultimediaEditor();

        const xhr = new XMLHttpRequest();
        item.xhr = xhr;
        xhr.open("POST", "/ProductosServicios/SubirMultimediaTemporal", true);
        xhr.responseType = "json";
        xhr.upload.onprogress = function (event) {
            if (!event.lengthComputable) {
                return;
            }
            item.progress = Math.max(5, Math.min(95, Math.round((event.loaded / event.total) * 100)));
            renderMultimediaEditor();
        };
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }

            item.xhr = null;
            state.uploadCounts[item.tipoMultimedia] = Math.max(0, state.uploadCounts[item.tipoMultimedia] - 1);
            if (xhr.status >= 200 && xhr.status < 300) {
                const response = xhr.response || parseJsonSafely(xhr.responseText);
                const archivo = response && response.archivo ? response.archivo : null;
                if (!archivo || !archivo.temporalToken) {
                    markUploadError(item, "No fue posible confirmar la evidencia cargada.");
                    return;
                }

                item.temporalToken = archivo.temporalToken || "";
                item.nombreOriginal = archivo.nombreOriginal || item.nombreOriginal;
                item.nombreAlmacenado = archivo.nombreAlmacenado || item.nombreAlmacenado;
                item.extension = archivo.extension || item.extension;
                item.mimeType = archivo.mimeType || item.mimeType;
                item.urlFirebase = archivo.urlFirebase || item.urlFirebase;
                item.pesoBytes = Number(archivo.pesoBytes || item.pesoBytes || 0);
                item.status = "uploaded";
                item.progress = 100;
                item.error = "";
                if (item.tipoMultimedia !== "documento" && item.urlFirebase) {
                    revokeObjectUrl(item.previewUrl);
                    item.previewUrl = item.urlFirebase;
                }
                renderMultimediaEditor();
                pumpUploads();
                return;
            }

            const errorResponse = xhr.response || parseJsonSafely(xhr.responseText);
            markUploadError(item, resolveServerMessage(errorResponse) || "No fue posible cargar la evidencia.");
        };

        const formData = new FormData();
        formData.append("tipoMultimedia", item.tipoMultimedia);
        formData.append("operacionCarga", state.uploadOperationId);
        formData.append("archivo", item.file, item.file.name || "archivo.bin");
        xhr.send(formData);
    }

    function markUploadError(item, message) {
        item.status = "error";
        item.progress = 0;
        item.error = message || "No fue posible cargar la evidencia.";
        renderMultimediaEditor();
        pumpUploads();
    }

    function removeMultimediaItem(tipo, key) {
        const items = state.multimedia[tipo] || [];
        const index = items.findIndex(function (item) { return item.clientKey === key; });
        if (index < 0) {
            return;
        }

        const item = items[index];
        if (item.xhr) {
            try {
                item.xhr.abort();
            } catch (_error) {
            }
        }
        if (item.temporalToken) {
            cleanupTempTokens([item.temporalToken], "/ProductosServicios/LimpiarMultimediaTemporal");
        }
        revokeObjectUrl(item.previewUrl);
        items.splice(index, 1);
        renderMultimediaEditor();
        pumpUploads();
    }

    function retryMultimediaItem(tipo, key) {
        const item = (state.multimedia[tipo] || []).find(function (current) {
            return current.clientKey === key;
        });
        if (!item || !item.isNew) {
            return;
        }

        item.error = "";
        item.temporalToken = "";
        item.urlFirebase = "";
        item.status = "queued";
        item.progress = 0;
        if (item.tipoMultimedia !== "documento" && item.file) {
            revokeObjectUrl(item.previewUrl);
            item.previewUrl = createObjectUrl(item.file);
        }
        renderMultimediaEditor();
        pumpUploads();
    }

    function releaseAllTemporaryMultimedia() {
        const tokens = getAllMultimediaItems()
            .filter(function (item) { return item.temporalToken; })
            .map(function (item) { return item.temporalToken; });

        getAllMultimediaItems().forEach(function (item) {
            if (item.xhr) {
                try {
                    item.xhr.abort();
                } catch (_error) {
                }
            }
            revokeObjectUrl(item.previewUrl);
            item.temporalToken = "";
        });

        if (tokens.length) {
            cleanupTempTokens(tokens, "/ProductosServicios/LimpiarMultimediaTemporal");
        }
    }

    function getAllMultimediaItems() {
        return []
            .concat(state.multimedia.foto || [])
            .concat(state.multimedia.video || [])
            .concat(state.multimedia.documento || []);
    }

    function inferTipoMultimedia(item) {
        const normalized = String(item.tipoMultimedia || "").toLowerCase();
        if (normalized === "foto" || item.foto) {
            return "foto";
        }
        if (normalized === "video" || item.video) {
            return "video";
        }
        if (normalized === "documento" || item.documento) {
            return "documento";
        }
        return "";
    }

    function isMultimediaUploading(item) {
        return item.status === "queued" || item.status === "uploading";
    }

    function isMultimediaReady(item) {
        return item.status === "uploaded" || item.status === "saved";
    }

    function hasMultimediaErrors() {
        return getAllMultimediaItems().some(function (item) { return item.status === "error"; });
    }

    function hasPendingMultimediaUploads() {
        return getAllMultimediaItems().some(isMultimediaUploading);
    }

    function resolveMultimediaStatusText(item) {
        switch (item.status) {
            case "saved": return "Guardado";
            case "uploaded": return "Listo";
            case "uploading": return "Subiendo";
            case "queued": return "Pendiente";
            case "error": return "Error";
            default: return "Pendiente";
        }
    }

    function clearQuickCatalogFieldError(selector) {
        quickCatalogBridge.clearFieldError(selector);
    }

    function clearQuickCatalogFieldErrors() {
        quickCatalogBridge.clearFieldErrors();
    }

    function applyCatalogErrorFeedback(statusSelector, message, mappings) {
        setStatus(statusSelector, "danger", message);
        const normalizedMessage = normalizeCatalogCompareValue(message);
        const match = (mappings || []).find(function (item) {
            return (item.includes || []).some(function (term) {
                return normalizedMessage.indexOf(normalizeCatalogCompareValue(term)) >= 0;
            });
        });

        if (match && match.selector) {
            markFieldError(match.selector);
        }
    }

    function markFieldError(selector) {
        if (!selector) {
            return;
        }
        const node = document.querySelector(selector);
        if (node) {
            node.classList.add("is-invalid");
        }
    }

    function clearFieldError(selector) {
        const node = document.querySelector(selector);
        if (node) {
            node.classList.remove("is-invalid");
        }
    }

    function clearAllFieldErrors() {
        document.querySelectorAll("#frmProductoServicio .is-invalid, #frmColeccionProductoServicio .is-invalid, #frmPaqueteProductoServicio .is-invalid, #frmAtributoProductoServicio .is-invalid").forEach(function (node) {
            node.classList.remove("is-invalid");
        });
    }

    function beginSaveProgress(messages) {
        stopSaveProgressTimer();
        state.isSaving = true;
        const progressMessages = messages && messages.length ? messages.slice() : ["Guardando producto / servicio..."];
        let messageIndex = 0;

        syncModalBusyUi(true, "Guardando producto / servicio...", progressMessages[0]);
        state.saveProgressTimerId = window.setInterval(function () {
            if (!state.isSaving || messageIndex >= progressMessages.length - 1) {
                return;
            }

            messageIndex += 1;
            syncModalBusyUi(true, "Guardando producto / servicio...", progressMessages[messageIndex]);
        }, 1200);
    }

    function finishSaveProgress() {
        stopSaveProgressTimer();
        state.isSaving = false;
        syncModalBusyUi(state.isUploadingImage, "Subiendo imagen...", "Procesando imagen...");
        if (!state.isUploadingImage) {
            syncModalBusyUi(false, "Guardando producto / servicio...", "Preparando información del registro...");
        }
    }

    function failSaveProgress() {
        stopSaveProgressTimer();
        state.isSaving = false;
        syncModalBusyUi(state.isUploadingImage, "Subiendo imagen...", "Procesando imagen...");
        if (!state.isUploadingImage) {
            syncModalBusyUi(false, "Guardando producto / servicio...", "Preparando información del registro...");
        }
    }

    function stopSaveProgressTimer() {
        if (state.saveProgressTimerId) {
            window.clearInterval(state.saveProgressTimerId);
            state.saveProgressTimerId = 0;
        }
    }

    function beginImageUpload() {
        state.isUploadingImage = true;
        syncModalBusyUi(true, "Subiendo imagen...", "Preparando imagen...");
    }

    function finishImageUpload() {
        state.isUploadingImage = false;
        if (state.isSaving) {
            syncModalBusyUi(true, "Guardando producto / servicio...", "Finalizando registro...");
            return;
        }

        syncModalBusyUi(false, "Guardando producto / servicio...", "Preparando información del registro...");
    }

    function resetSaveUi() {
        stopSaveProgressTimer();
        state.isSaving = false;
        state.isUploadingImage = false;
        syncModalBusyUi(false, "Guardando producto / servicio...", "Preparando información del registro...");
    }

    function syncModalBusyUi(isBusy, title, status) {
        $("#modalProductoServicio").toggleClass("is-saving", !!isBusy);
        $("#productosServiciosSaveOverlay").attr("aria-hidden", isBusy ? "false" : "true");
        $("#txProductosServiciosSaveTitle").text(title || "Guardando producto / servicio...");
        $("#txProductosServiciosSaveStatus").text(status || "Preparando información del registro...");
        $("#frmProductoServicio").find("input, textarea, select, button").prop("disabled", !!isBusy);
        $("#flImagenProductoServicio").prop("disabled", !!isBusy);
    }

    function buildSaveMessages(payload) {
        const messages = ["Validando información del registro..."];

        if (payload.imagenPrincipal) {
            messages.push("Confirmando imagen principal...");
        }
        if (payload.multimedia && payload.multimedia.length) {
            messages.push("Confirmando evidencia multimedia...");
        }
        if (payload.variantes && payload.variantes.length) {
            messages.push("Sincronizando variantes...");
        }

        messages.push("Guardando producto / servicio...");
        messages.push("Actualizando listado...");
        return messages;
    }

    function isModalBusy() {
        return state.isSaving || state.isUploadingImage;
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

    function appendQuery(params, key, value) {
        if (value == null || value === "") {
            return;
        }
        params.append(key, String(value));
    }

    function resolveServerMessage(data) {
        if (!data) {
            return "";
        }
        if (typeof data.d === "string") {
            return normalizeServerMessage(data.d);
        }
        if (typeof data.mensaje === "string") {
            const friendlyMessage = normalizeServerMessage(data.mensaje);
            if (friendlyMessage) {
                return friendlyMessage;
            }
        }
        if (data.errors && typeof data.errors === "object") {
            const firstKey = Object.keys(data.errors)[0];
            if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey].length) {
                const fieldMessage = normalizeServerMessage(data.errors[firstKey][0]);
                if (fieldMessage) {
                    return fieldMessage;
                }
            }
        }
        if (typeof data.detail === "string") {
            const detailMessage = normalizeServerMessage(data.detail);
            if (detailMessage) {
                return detailMessage;
            }
        }
        if (typeof data.title === "string" && data.title) {
            const titleMessage = normalizeServerMessage(data.title);
            if (titleMessage) {
                return titleMessage;
            }
        }
        return "";
    }

    function normalizeServerMessage(value) {
        const message = String(value || "").trim();
        if (!message) {
            return "";
        }

        const technicalMessages = [
            "One or more validation errors occurred.",
            "Validation failed.",
            "Bad Request.",
            "Bad Request"
        ];

        return technicalMessages.indexOf(message) >= 0 ? "" : message;
    }

    function resolveErrorMessage(error) {
        return error && error.message ? error.message : "No fue posible completar la acción.";
    }

    function resolveModalApi(selector) {
        const modalNode = document.querySelector(selector);
        if (!modalNode) {
            return null;
        }

        if (window.bootstrap && window.bootstrap.Modal) {
            return window.bootstrap.Modal.getOrCreateInstance(modalNode);
        }

        return {
            show: function () { $(selector).modal("show"); },
            hide: function () { $(selector).modal("hide"); }
        };
    }

    function normalizeGuid(value) {
        const text = String(value || "").trim();
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)
            ? text
            : null;
    }

    function toNullableNumber(value) {
        const text = String(value == null ? "" : value).trim();
        if (!text) {
            return null;
        }

        const parsed = Number(text);
        return Number.isFinite(parsed) ? parsed : null;
    }

    function toNumber(value) {
        const parsed = Number(String(value == null ? "" : value).trim());
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function formatCurrency(value) {
        const number = Number(value || 0);
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    }

    function formatDecimal(value) {
        if (value == null || value === "") {
            return "0";
        }

        return new Intl.NumberFormat("es-MX", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 4
        }).format(Number(value || 0));
    }

    function formatDisplayDate(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return new Intl.DateTimeFormat("es-MX", {
            dateStyle: "short",
            timeStyle: "short"
        }).format(date);
    }

    function formatDateForFile(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return year + month + day + "_" + hours + minutes;
    }

    function formatFileSize(value) {
        const size = Number(value || 0);
        if (size >= (1024 * 1024)) {
            return (size / (1024 * 1024)).toFixed(2) + " MB";
        }
        if (size >= 1024) {
            return (size / 1024).toFixed(1) + " KB";
        }
        return size + " B";
    }

    function isValidImageFile(file) {
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        return validTypes.indexOf(file.type) >= 0 && Number(file.size || 0) <= (10 * 1024 * 1024);
    }

    function createClientKey(prefix) {
        return prefix + "-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    function captureModalSelections() {
        return {
            tipo: $("#cbTipoProductoServicio").val() || "",
            categoria: $("#cbCategoriaProductoServicio").val() || "",
            marca: $("#cbMarcaProductoServicio").val() || "",
            unidad: $("#cbUnidadProductoServicio").val() || "",
            coleccion: $("#cbColeccionProductoServicio").val() || "",
            paquete: $("#cbPaqueteProductoServicio").val() || "",
            objetoImpuesto: $("#cbObjetoImpuestoProductoServicio").val() || "",
            precioUnitarioUnidad: $("#cbPrecioUnitarioUnidadProductoServicio").val() || "",
            claveProductoSat: $("#cbClaveProductoSatProductoServicio").val() || "",
            claveUnidadSat: $("#cbClaveUnidadSatProductoServicio").val() || ""
        };
    }

    function restoreModalSelections(values) {
        $("#cbTipoProductoServicio").val(values.tipo).trigger("change");
        syncCategoryOptions(values.categoria);
        $("#cbCategoriaProductoServicio").val(values.categoria).trigger("change");
        $("#cbMarcaProductoServicio").val(values.marca).trigger("change");
        $("#cbUnidadProductoServicio").val(values.unidad).trigger("change");
        $("#cbColeccionProductoServicio").val(values.coleccion).trigger("change");
        $("#cbPaqueteProductoServicio").val(values.paquete).trigger("change");
        $("#cbObjetoImpuestoProductoServicio").val(values.objetoImpuesto).trigger("change");
        $("#cbPrecioUnitarioUnidadProductoServicio").val(values.precioUnitarioUnidad).trigger("change");
        ensureSelect2Option("#cbClaveProductoSatProductoServicio", values.claveProductoSat || "", values.claveProductoSat || "");
        ensureSelect2Option("#cbClaveUnidadSatProductoServicio", values.claveUnidadSat || "", values.claveUnidadSat || "");
        updateUnitPriceSummary();
    }

    function normalizeCatalogCompareValue(value) {
        return String(value || "")
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    function parseJsonSafely(text) {
        try {
            return text ? JSON.parse(text) : {};
        } catch (_error) {
            return {};
        }
    }

    function resolveFileExtension(name) {
        const parts = String(name || "").split(".");
        return parts.length > 1 ? "." + parts.pop().toLowerCase() : "";
    }

    function createObjectUrl(file) {
        try {
            return window.URL && window.URL.createObjectURL ? window.URL.createObjectURL(file) : "";
        } catch (_error) {
            return "";
        }
    }

    function revokeObjectUrl(url) {
        if (!url || !window.URL || typeof window.URL.revokeObjectURL !== "function") {
            return;
        }

        if (/^blob:/.test(url)) {
            try {
                window.URL.revokeObjectURL(url);
            } catch (_error) {
            }
        }
    }

    function uniqueFilter(value, index, array) {
        return array.indexOf(value) === index;
    }

    function slugify(value) {
        return normalizeCatalogCompareValue(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }

    function capitalize(value) {
        const text = String(value || "");
        return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
    }

    function setStatus(selector, level, message) {
        const node = document.querySelector(selector);
        if (!node) {
            return;
        }

        node.className = "checkapp-status-inline";
        if (level) {
            node.classList.add("is-" + level);
        }
        node.textContent = message || "";
    }

    function escapeHtml(value) {
        const text = String(value == null ? "" : value);
        if (window.CheckAppUI && typeof window.CheckAppUI.escapeHtml === "function") {
            return window.CheckAppUI.escapeHtml(text);
        }

        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function escapeJs(value) {
        return String(value == null ? "" : value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    }

    function showSuccess(message) {
        Swal.fire({
            icon: "success",
            title: "Listo",
            text: message,
            confirmButtonText: "Aceptar"
        });
    }

    function showError(message) {
        Swal.fire({
            icon: "error",
            title: "No fue posible completar la acción",
            text: message,
            confirmButtonText: "Aceptar"
        });
    }
})(window, document, window.jQuery);
