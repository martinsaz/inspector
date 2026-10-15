(function (window, document, $) {
    "use strict";

    const gridId = "kits-grid";
    const canWrite = String($("[data-kits-page]").data("can-write")) === "true";
    let accordion, kitModal;
    let allOptions = [], sourceGroups = [], selectedIdentity = null, draftComponents = [];
    let editingComponentIndex = -1, editingKitId = null, currentKitType = 1, currentStep = 1, loadedSourceType = null;
    let suppressPriceResolution = false, priceResolving = false, priceResolutionVersion = 0;
    let imageToken = "", imagePreviewUrl = "", persistedImageUrl = "", persistedImageName = "", imageRemoved = false, operationKey = "";

    $(function () {
        accordion = CheckAppUI.createFilterAccordion({ id: "kits-filtros", selector: "#accordionFiltrosKits", open: true, emptySummaryText: "Sin filtros activos" });
        bindListEvents();
        initGrid();
        if (canWrite) initWriteFlow();
    });

    function bindListEvents() {
        $("#btBuscarKits").on("click", applyFilters);
        $("#btLimpiarKits").on("click", function () { $("#txBusquedaKits, #cbTipoKits, #cbEstatusKits").val(""); applyFilters(); });
        $("#txBusquedaKits").on("keydown", function (event) { if (event.key === "Enter") { event.preventDefault(); applyFilters(); } });
        $("#gridKitsHost").on("click", "[data-kit-edit]", function () { openEditModal($(this).attr("data-kit-edit")); });
        $("#gridKitsHost").on("click", "[data-kit-archive]", function () { changeKitState($(this).attr("data-kit-archive"), false, $(this).attr("data-kit-name")); });
        $("#gridKitsHost").on("click", "[data-kit-reactivate]", function () { changeKitState($(this).attr("data-kit-reactivate"), true, $(this).attr("data-kit-name")); });
    }

    function initWriteFlow() {
        if (!document.getElementById("modalKit") || !window.bootstrap) return;
        kitModal = window.bootstrap.Modal.getOrCreateInstance(document.getElementById("modalKit"));
        $("#btNuevoKit").on("click", openCreateModal);
        $("#btSiguienteKit").on("click", goToComponents);
        $("#btAnteriorKit").on("click", function () { showStep(1); });
        $("input[name='tipoKitAlta']").on("change", onKitTypeChanged);
        $("#cbFuenteKit").on("change", onSourceSelected);
        $("#cbIdentidadKit").on("change", onIdentitySelected);
        $("#btAgregarComponenteKit").on("click", addOrUpdateComponent);
        $("#txPrecioKit").on("input", renderSummary);
        $("#btSeleccionarImagenKit").on("click", function () { $("#flImagenKit").trigger("click"); });
        $("#flImagenKit").on("change", uploadImage);
        $("#btEliminarImagenKit").on("click", removeImage);
        $("#frmKit").on("submit", saveKit);
        $("#modalKit").on("hidden.bs.modal", function () { cleanupTemporaryImage(); resetForm(); });
        $("#tbComponentesKit").on("click", "[data-edit-component]", function () { editComponent(Number($(this).attr("data-edit-component"))); });
        $("#tbComponentesKit").on("click", "[data-remove-component]", function () { removeComponent(Number($(this).attr("data-remove-component"))); });
    }

    async function openCreateModal() {
        resetForm();
        $("#txModalKitTitulo").text("Nuevo Kit");
        kitModal.show();
        window.setTimeout(function () { $("#txNombreKit").trigger("focus"); }, 150);
    }

    async function openEditModal(idKit) {
        if (!canWrite || !idKit) return;
        resetForm(); editingKitId = idKit;
        $("#txModalKitTitulo").text("Editar Kit");
        setSaving(true, "Cargando…"); kitModal.show();
        try {
            const detail = await requestJson("/Kits/Detalle/" + encodeURIComponent(idKit));
            $("#txNombreKit").val(detail.nombre || "");
            $("#txPrecioKit").val(Number(detail.precioKit || 0).toFixed(2));
            currentKitType = Number(detail.tipo || 1);
            $("input[name='tipoKitAlta'][value='" + currentKitType + "']").prop("checked", true);
            $("input[name='estatusKitAlta'][value='" + Boolean(detail.activo) + "']").prop("checked", true);
            updateComponentTypeControl();
            persistedImageUrl = safeImageUrl(detail.imagenUrl); persistedImageName = detail.imagenNombre || ""; imagePreviewUrl = persistedImageUrl;
            draftComponents = (detail.componentes || []).filter(function (item) { return item.activo; }).map(function (item) { return Object.assign({}, item, { operationKey: newOperationKey("component-edit") }); });
            renderImage(); renderComponents(); showStep(1);
        } catch (error) { kitModal.hide(); notifyError(error.message); }
        finally { setSaving(false); }
    }

    function resetForm() {
        document.getElementById("frmKit")?.reset();
        destroySelect2("#cbFuenteKit"); destroySelect2("#cbIdentidadKit");
        allOptions = []; sourceGroups = []; selectedIdentity = null; draftComponents = [];
        editingComponentIndex = -1; editingKitId = null; currentKitType = 1; currentStep = 1; loadedSourceType = null; operationKey = newOperationKey("kit");
        priceResolutionVersion++; setPriceResolving(false);
        imageToken = ""; imagePreviewUrl = ""; persistedImageUrl = ""; persistedImageName = ""; imageRemoved = false;
        $("#txPrecioKit,#txPrecioComponenteKit").val("0.00"); $("#txCantidadComponenteKit").val("1").attr("step", "1");
        $("#fieldIdentidadKit").prop("hidden", true);
        $(".kits-component-editor").removeClass("has-identity");
        $("#cbFuenteKit,#cbIdentidadKit").html("<option value=''>Selecciona una opción</option>");
        renderImage(); renderComponents(); setPriceHint("Selecciona un componente para resolver su precio Nivel 1."); showStep(1); setSaving(false);
    }

    function onKitTypeChanged(event) {
        const nextType = Number(event.target.value);
        const incompatible = draftComponents.filter(function (item) { const service = Number(item.tipoIdentidad) === 2; return nextType !== 3 && ((nextType === 1 && service) || (nextType === 2 && !service)); });
        if (incompatible.length) {
            $("input[name='tipoKitAlta'][value='" + currentKitType + "']").prop("checked", true);
            notifyWarning("No se puede cambiar el tipo", "Lo impiden: " + incompatible.map(function (item) { return item.nombre; }).join(", ") + ". Retira esos componentes manualmente para continuar.");
            return;
        }
        currentKitType = nextType; loadedSourceType = null; updateComponentTypeControl(); clearComponentEditor();
        if (currentStep === 2) loadComponentOptions();
    }

    function updateComponentTypeControl() {
        $("#txEtiquetaFuenteKit").text("Componente *");
    }

    function validateGeneralInformation() {
        const name = String($("#txNombreKit").val() || "").trim(), price = Number($("#txPrecioKit").val());
        if (!name) { notifyWarning("Nombre requerido", "Captura el nombre del Kit."); $("#txNombreKit").trigger("focus"); return false; }
        if (!validMoney(price)) { notifyWarning("Precio no válido", "Captura un precio mayor o igual a cero con máximo dos decimales."); $("#txPrecioKit").trigger("focus"); return false; }
        return true;
    }

    async function goToComponents() {
        if (!validateGeneralInformation()) return;
        showStep(2);
        const sourceType = requestedSourceType();
        if (loadedSourceType !== sourceType) await loadComponentOptions();
        window.setTimeout(function () { $("#cbFuenteKit").next(".select2").find(".select2-selection").trigger("focus"); }, 50);
    }

    function showStep(step) {
        currentStep = step === 2 ? 2 : 1;
        $("[data-kit-step]").each(function () { $(this).prop("hidden", Number($(this).attr("data-kit-step")) !== currentStep); });
        $("[data-kit-step-indicator]").each(function () {
            const number = Number($(this).attr("data-kit-step-indicator"));
            $(this).toggleClass("is-active", number === currentStep).toggleClass("is-complete", number < currentStep);
            if (number === currentStep) $(this).attr("aria-current", "step"); else $(this).removeAttr("aria-current");
        });
        $("#btAnteriorKit,#btGuardarKit").prop("hidden", currentStep !== 2);
        $("#btSiguienteKit").prop("hidden", currentStep === 2);
        $(".kits-modal-body").scrollTop(0);
    }

    function requestedSourceType() { return currentKitType; }

    async function loadComponentOptions() {
        if (!kitModal) return;
        const sourceType = requestedSourceType(); const select = $("#cbFuenteKit").prop("disabled", true);
        destroySelect2("#cbFuenteKit"); destroySelect2("#cbIdentidadKit"); select.html("<option value=''>Cargando opciones…</option>");
        $("#fieldIdentidadKit").prop("hidden", true); $(".kits-component-editor").removeClass("has-identity"); $("#txEtiquetaFuenteKit").text("Componente *");
        try {
            allOptions = await requestJson("/Kits/Opciones?" + new URLSearchParams({ tipoKit: String(sourceType), search: "" }).toString());
            sourceGroups = buildSourceGroups(allOptions, sourceType);
            loadedSourceType = sourceType;
            select.html("<option value=''></option>" + sourceGroups.map(function (group) { return "<option value='" + escapeHtml(group.id) + "'>" + escapeHtml(group.label) + "</option>"; }).join(""));
            const placeholder = sourceType === 2 ? "Busca un servicio por código o nombre" : sourceType === 3 ? "Busca un producto o servicio por código o nombre" : "Busca un producto por código o nombre";
            initSearchableSelect("#cbFuenteKit", placeholder);
        } catch (error) { allOptions = []; sourceGroups = []; loadedSourceType = null; select.html("<option value=''>No fue posible cargar opciones</option>"); notifyError(error.message); }
        finally { select.prop("disabled", false); }
    }

    function buildSourceGroups(options, sourceType) {
        if (sourceType === 2) return options.map(function (item) { return { id: item.idProductoServicio, label: optionLabel(item, false), options: [item], service: true }; });
        const groups = [];
        options.forEach(function (item) { let group = groups.find(function (candidate) { return candidate.id === item.idProductoServicio; }); if (!group) { group = { id: item.idProductoServicio, label: "", options: [], service: Number(item.tipoIdentidad) === 2 }; groups.push(group); } group.options.push(item); });
        groups.forEach(function (group) { const base = group.options.find(function (item) { return Number(item.tipoIdentidad) === 1 || Number(item.tipoIdentidad) === 2; }) || group.options[0]; const prefix = sourceType === 3 ? (group.service ? "Servicio · " : "Producto · ") : ""; group.label = prefix + optionLabel(base, !group.service); });
        return groups.sort(function (a, b) { return a.label.localeCompare(b.label, "es"); });
    }

    function optionLabel(item, sourceOnly) { let name = String(item.nombre || ""); if (sourceOnly && Number(item.tipoIdentidad) !== 1) name = name.split(" · ")[0]; return (item.codigo ? item.codigo + " · " : "") + name; }

    function onSourceSelected() {
        selectedIdentity = null;
        const group = sourceGroups.find(function (item) { return item.id === $("#cbFuenteKit").val(); });
        destroySelect2("#cbIdentidadKit");
        if (!group) { $("#fieldIdentidadKit").prop("hidden", true); $(".kits-component-editor").removeClass("has-identity"); resetResolvedPrice(); return; }
        if (group.service || (group.options.length === 1 && Number(group.options[0].tipoIdentidad) === 1)) { $("#fieldIdentidadKit").prop("hidden", true); $(".kits-component-editor").removeClass("has-identity"); selectedIdentity = group.options[0]; if (!suppressPriceResolution) resolveSelectedPrice(); return; }
        $("#fieldIdentidadKit").prop("hidden", false); $(".kits-component-editor").addClass("has-identity");
        $("#cbIdentidadKit").html("<option value=''></option>" + group.options.map(function (item) { return "<option value='" + escapeHtml(identityKey(item)) + "'>" + escapeHtml(identityLabel(item)) + "</option>"; }).join(""));
        initSearchableSelect("#cbIdentidadKit", "Selecciona base, variante o presentación"); resetResolvedPrice();
    }

    function identityLabel(item) { return String(item.identidadVisible || "") + (item.codigo ? " · " + item.codigo : ""); }
    function identityKey(item) { return [item.tipoIdentidad, item.idProductoServicio, item.idVariante || "", item.idPresentacionVenta || ""].join("|"); }
    function onIdentitySelected() { const key = $("#cbIdentidadKit").val(); selectedIdentity = allOptions.find(function (item) { return identityKey(item) === key; }) || null; if (selectedIdentity && !suppressPriceResolution) resolveSelectedPrice(); else if (!selectedIdentity) resetResolvedPrice(); }

    async function resolveSelectedPrice() {
        const option = selectedIdentity; if (!option) return resetResolvedPrice();
        const version = ++priceResolutionVersion;
        $("#txCantidadComponenteKit").attr("step", option.unidadPermiteDecimales ? "0.0001" : "1"); setPriceResolving(true); setPriceHint("Resolviendo precio Nivel 1…");
        try {
            const resolved = await requestJson("/Kits/ResolverPrecio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(identityPayload(option)) });
            if (version !== priceResolutionVersion || !selectedIdentity || !sameIdentity(option, selectedIdentity)) return;
            $("#txPrecioComponenteKit").val(Number(resolved.precioPropuesto || 0).toFixed(2)); setPriceHint("Precio propuesto por Lista de Precios Nivel 1. Puedes ajustarlo antes de agregar.");
        }
        catch (_error) {
            if (version !== priceResolutionVersion) return;
            $("#txPrecioComponenteKit").val("0.00"); setPriceHint("No se encontró un precio Nivel 1. Captura un precio unitario válido.", true);
        }
        finally { if (version === priceResolutionVersion) setPriceResolving(false); }
    }

    function resetResolvedPrice() { priceResolutionVersion++; setPriceResolving(false); $("#txPrecioComponenteKit").val("0.00"); setPriceHint("Selecciona un componente para resolver su precio Nivel 1."); }

    function addOrUpdateComponent() {
        const option = selectedIdentity, quantity = Number($("#txCantidadComponenteKit").val()), price = Number($("#txPrecioComponenteKit").val());
        if (priceResolving) return notifyWarning("Precio en proceso", "Espera a que termine la resolución del precio Nivel 1.");
        if (!option) return notifyWarning("Selecciona un componente", requestedSourceType() === 2 ? "Busca y selecciona un servicio." : requestedSourceType() === 3 ? "Busca y selecciona un producto o servicio." : "Selecciona el producto y, cuando corresponda, su base, variante o presentación.");
        if (!Number.isFinite(quantity) || quantity <= 0 || (!option.unidadPermiteDecimales && !Number.isInteger(quantity))) return notifyWarning("Cantidad no válida", option.unidadPermiteDecimales ? "Captura una cantidad positiva con hasta cuatro decimales." : "Este componente requiere una cantidad entera positiva.");
        if (!validMoney(price)) return notifyWarning("Precio no válido", "Captura un precio mayor o igual a cero con máximo dos decimales.");
        const duplicate = draftComponents.findIndex(function (item, index) { return index !== editingComponentIndex && sameIdentity(item, option); });
        if (duplicate >= 0) return notifyWarning("Componente duplicado", "La identidad ya está agregada. Usa Editar para modificar cantidad o precio.");
        const previous = editingComponentIndex >= 0 ? draftComponents[editingComponentIndex] : null;
        const item = Object.assign({}, option, { id: previous && previous.id ? previous.id : null, cantidad: quantity, precioUnitario: price, operationKey: previous ? previous.operationKey : newOperationKey("component") });
        if (editingComponentIndex >= 0) draftComponents[editingComponentIndex] = item; else draftComponents.push(item);
        clearComponentEditor(); renderComponents();
    }

    async function editComponent(index) {
        const item = draftComponents[index]; if (!item) return; editingComponentIndex = index;
        await loadComponentOptions();
        suppressPriceResolution = true;
        $("#cbFuenteKit").val(item.idProductoServicio).trigger("change");
        if (!$("#fieldIdentidadKit").prop("hidden")) $("#cbIdentidadKit").val(identityKey(item)).trigger("change"); else selectedIdentity = allOptions.find(function (option) { return sameIdentity(option, item); }) || item;
        suppressPriceResolution = false;
        $("#txCantidadComponenteKit").val(item.cantidad); $("#txPrecioComponenteKit").val(Number(item.precioUnitario).toFixed(2));
        setComponentActionLabel("Actualizar componente"); setPriceHint("Editando " + item.nombre + ".");
    }

    function removeComponent(index) { if (!draftComponents[index]) return; draftComponents.splice(index, 1); clearComponentEditor(); renderComponents(); }
    function clearComponentEditor() { editingComponentIndex = -1; selectedIdentity = null; $("#cbFuenteKit").val("").trigger("change.select2"); destroySelect2("#cbIdentidadKit"); $("#cbIdentidadKit").html("<option value=''></option>"); $("#fieldIdentidadKit").prop("hidden", true); $(".kits-component-editor").removeClass("has-identity"); $("#txCantidadComponenteKit").val("1").attr("step", "1"); $("#txPrecioComponenteKit").val("0.00"); setComponentActionLabel("Agregar componente"); resetResolvedPrice(); }

    function setComponentActionLabel(label) { $("#btAgregarComponenteKit").attr({ title: label, "aria-label": label }); }

    function renderComponents() {
        const tbody = $("#tbComponentesKit");
        if (!draftComponents.length) tbody.html("<tr class='kits-components-empty'><td colspan='5'>Agrega al menos un componente para activar el Kit.</td></tr>");
        else tbody.html(draftComponents.map(function (item, index) { const type = Number(item.tipoIdentidad) === 2 ? "Servicio" : Number(item.tipoIdentidad) === 3 ? "Variante" : Number(item.tipoIdentidad) === 4 ? "Presentación" : "Producto base"; return "<tr><td data-label='Componente'><strong>" + escapeHtml(item.nombre) + "</strong><small>" + escapeHtml(type + " · " + (item.codigo || "Sin código")) + "</small></td><td data-label='Cantidad'>" + escapeHtml(String(item.cantidad)) + "</td><td data-label='Precio unitario'>" + money(item.precioUnitario) + "</td><td data-label='Importe'>" + money(item.cantidad * item.precioUnitario) + "</td><td data-label='Acciones'><div class='kits-row-actions'><button type='button' data-edit-component='" + index + "' aria-label='Editar " + escapeHtml(item.nombre) + "' title='Editar'><i class='fa fa-pencil'></i></button><button type='button' data-remove-component='" + index + "' aria-label='Quitar " + escapeHtml(item.nombre) + "' title='Quitar'><i class='fa fa-trash'></i></button></div></td></tr>"; }).join(""));
        renderSummary();
    }

    function renderSummary() { const value = draftComponents.reduce(function (sum, item) { return sum + item.cantidad * item.precioUnitario; }, 0), kitPrice = Number($("#txPrecioKit").val() || 0); $("#txResumenComponentesKit").text(String(draftComponents.length)); $("#txResumenValorKit").text(money(value)); $("#txResumenPrecioKit").text(money(kitPrice)); $("#txResumenDiferenciaKit").text(money(kitPrice - value)); }

    async function uploadImage(event) {
        const file = event.target.files && event.target.files[0]; if (!file) return;
        if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) { event.target.value = ""; return notifyWarning("Imagen no válida", "Selecciona JPG, PNG o WEBP de máximo 10 MB."); }
        await cleanupTemporaryImage(); const data = new FormData(); data.append("archivo", file);
        try { const result = await requestJson("/Kits/SubirImagenTemporal", { method: "POST", body: data }); imageToken = result.temporalToken || ""; imagePreviewUrl = safeImageUrl(result.url); imageRemoved = false; renderImage(); }
        catch (error) { notifyError(error.message); } finally { event.target.value = ""; }
    }

    async function removeImage() { await cleanupTemporaryImage(); imagePreviewUrl = ""; imageRemoved = true; renderImage(); }
    async function cleanupTemporaryImage() { const token = imageToken; imageToken = ""; if (!token) return; try { await requestJson("/Kits/LimpiarImagenTemporal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ temporalToken: token }) }); } catch (_error) { } }
    function renderImage() { const host = $("#vistaImagenKit"); host.toggleClass("has-image", Boolean(imagePreviewUrl)); host.html(imagePreviewUrl ? "<img src='" + escapeHtml(imagePreviewUrl) + "' alt='Vista previa del Kit' />" : "<i class='fa fa-picture-o'></i><strong>Sin imagen</strong><span>JPG, PNG o WEBP. Máximo 10 MB.</span>"); $("#btEliminarImagenKit").prop("disabled", !imagePreviewUrl); }

    async function saveKit(event) {
        event.preventDefault();
        if (currentStep !== 2) { await goToComponents(); return; }
        const name = String($("#txNombreKit").val() || "").trim(), price = Number($("#txPrecioKit").val()), active = $("input[name='estatusKitAlta']:checked").val() === "true";
        if (!validateGeneralInformation()) { showStep(1); return; }
        if (active && !draftComponents.length) return notifyWarning("Agrega componentes", "Un Kit activo requiere al menos un componente.");
        const components = draftComponents.map(function (item) { return Object.assign({ id: item.id || null, operationKey: item.operationKey, cantidad: item.cantidad, precioUnitario: item.precioUnitario }, identityPayload(item)); });
        const request = { operationKey: operationKey, nombre: name, tipo: currentKitType, activo: active, precioKit: price, imagenTemporalToken: imageToken || null, imagenUrl: imageRemoved ? null : persistedImageUrl || null, imagenNombre: imageRemoved ? null : persistedImageName || null, componentes: components };
        setSaving(true);
        try { const editing = Boolean(editingKitId); await requestJson(editing ? "/Kits/Actualizar/" + encodeURIComponent(editingKitId) : "/Kits/Crear", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) }); imageToken = ""; kitModal.hide(); CheckAppUI.reloadGrid(gridId); notifySuccess(editing ? "Kit actualizado" : "Kit creado", editing ? "Los datos y componentes se guardaron correctamente." : "El Kit y sus componentes se guardaron correctamente."); }
        catch (error) { notifyError(error.message); } finally { setSaving(false); }
    }

    async function changeKitState(idKit, reactivate, name) {
        const accepted = await confirmAction(reactivate ? "Reactivar Kit" : "Dar de baja Kit", reactivate ? "El Kit volverá a estar disponible." : "El Kit quedará inactivo y conservará su historial.", reactivate ? "Sí, reactivar" : "Sí, dar de baja"); if (!accepted) return;
        try { await requestJson("/Kits/" + (reactivate ? "Reactivar/" : "Baja/") + encodeURIComponent(idKit), { method: "POST" }); CheckAppUI.reloadGrid(gridId); notifySuccess(reactivate ? "Kit reactivado" : "Kit dado de baja", (name || "El Kit") + (reactivate ? " está activo nuevamente." : " quedó inactivo.")); }
        catch (error) { notifyError(error.message); }
    }

    async function confirmAction(title, text, confirmButtonText) { if (!window.Swal || typeof window.Swal.fire !== "function") return window.confirm(text); const result = await window.Swal.fire({ icon: "warning", title: title, text: text, showCancelButton: true, confirmButtonText: confirmButtonText, cancelButtonText: "Cancelar", reverseButtons: true }); return Boolean(result.isConfirmed); }
    function setSaving(saving, label) { $("#btGuardarKit,#btSiguienteKit,#btAnteriorKit").prop("disabled", saving); $("#btGuardarKit span").text(label || (saving ? "Guardando…" : "Guardar Kit")); }
    function setPriceResolving(resolving) { priceResolving = resolving; $("#btAgregarComponenteKit").prop("disabled", resolving); }
    function setPriceHint(text, error) { $("#txAyudaPrecioComponenteKit").text(text).toggleClass("is-error", Boolean(error)); }
    function identityPayload(item) { return { tipoIdentidad: Number(item.tipoIdentidad), idProductoServicio: item.idProductoServicio, idVariante: item.idVariante || null, idPresentacionVenta: item.idPresentacionVenta || null }; }
    function sameIdentity(a, b) { return Number(a.tipoIdentidad) === Number(b.tipoIdentidad) && a.idProductoServicio === b.idProductoServicio && (a.idVariante || null) === (b.idVariante || null) && (a.idPresentacionVenta || null) === (b.idPresentacionVenta || null); }
    function newOperationKey(prefix) { return prefix + "-" + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(16).slice(2)); }
    function money(value) { const number = Number(value); return (Number.isFinite(number) ? number : 0).toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 }); }
    function validMoney(value) { return Number.isFinite(value) && value >= 0 && Math.abs(value * 100 - Math.round(value * 100)) < 0.000001; }

    function initSearchableSelect(selector, placeholder) { const node = $(selector); if (!node.length || !$.fn || !$.fn.select2) return; node.select2({ width: "100%", placeholder: placeholder, allowClear: true, dropdownParent: $("#modalKit"), language: { noResults: function () { return "Sin resultados"; }, searching: function () { return "Buscando…"; } } }); }
    function destroySelect2(selector) { const node = $(selector); if (node.hasClass("select2-hidden-accessible")) node.select2("destroy"); }
    function applyFilters() { updateFilterSummary(); CheckAppUI.reloadGrid(gridId); }
    function updateFilterSummary() { const active = [], search = String($("#txBusquedaKits").val() || "").trim(); if (search) active.push("Buscar: " + search); if ($("#cbTipoKits").val()) active.push("Tipo: " + $("#cbTipoKits option:selected").text()); if ($("#cbEstatusKits").val()) active.push("Estatus: " + $("#cbEstatusKits option:selected").text()); if (accordion) accordion.setSummary(active.length ? active.join(" · ") : "Sin filtros activos"); }

    function initGrid() {
        CheckAppUI.createDynamicGrid({ id: gridId, hostSelector: "#gridKitsHost", tableSelector: "#grKits", searchInputSelector: "#txBusquedaGridKits", columnToggleButtonSelector: "#btColumnasKits", columnTogglePanelSelector: "#panelColumnasKits", resultCountSelector: "#txGridKitsCount", footerRangeSelector: "#txGridKitsRange", footerPageIndicatorSelector: "#txGridKitsPageIndicator", footerPrevButtonSelector: "#btGridKitsPrev", footerNextButtonSelector: "#btGridKitsNext", footerPageSizeSelector: "#txGridKitsPageSize", mobileCardTitleKey: "nombre", pageLength: 25, lengthMenu: [[25, 50, 100], [25, 50, 100]], order: [[1, "asc"]], emptyText: "No hay Kits registrados.", errorText: "No pudimos cargar los Kits. Intenta nuevamente.", loadData: loadKits,
            columns: [
                { key: "imagenUrl", title: "Imagen", sortable: false, render: function (value, row) { const imageUrl = safeImageUrl(value); return imageUrl ? "<img class='ps-grid-image' src='" + escapeHtml(imageUrl) + "' alt='" + escapeHtml(row.nombre || "Imagen del Kit") + "' />" : "<span class='ps-grid-image-empty' aria-label='Sin imagen'><i class='fa fa-picture-o'></i></span>"; } },
                { key: "nombre", title: "Nombre", render: function (value) { return "<span class='kits-name'>" + escapeHtml(value || "") + "</span>"; } }, { key: "tipoNombre", title: "Tipo", render: renderType },
                { key: "numeroComponentes", title: "Componentes", render: function (value) { const count = Number(value || 0); return "<span class='kits-components'>" + count + (count === 1 ? " componente" : " componentes") + "</span>"; } },
                { key: "valorComponentes", title: "Valor componentes", render: renderMoney }, { key: "precioKit", title: "Precio Kit", render: renderMoney }, { key: "diferencia", title: "Diferencia", render: renderMoney },
                { key: "activo", title: "Estatus", render: function (value) { return value ? "<span class='ca-chip ca-chip--success'>Activo</span>" : "<span class='ca-chip ca-chip--danger'>Inactivo</span>"; } }, { key: "fechaActualizacion", title: "Actualización", render: renderDate },
                { key: "acciones", title: "Acciones", sortable: false, hideable: false, exportable: false, render: renderActions }
            ], onLoaded: updateVisibleCount, onDraw: updateVisibleCountFromGrid, onError: function () { updateVisibleCount([]); notifyError("No pudimos cargar los Kits. Intenta nuevamente."); }
        });
    }

    function renderActions(_value, row) {
        if (!canWrite) return "<span class='kits-actions-empty' aria-label='Sin acciones disponibles'>—</span>";
        const id = escapeHtml(row.id || ""), name = escapeHtml(row.nombre || "Kit");
        const state = row.activo ? "<button type='button' class='kits-grid-action kits-grid-action--danger' data-kit-archive='" + id + "' data-kit-name='" + name + "' title='Dar de baja' aria-label='Dar de baja " + name + "'><i class='fa fa-archive'></i></button>" : "<button type='button' class='kits-grid-action' data-kit-reactivate='" + id + "' data-kit-name='" + name + "' title='Reactivar' aria-label='Reactivar " + name + "'><i class='fa fa-undo'></i></button>";
        return "<div class='kits-grid-actions'><button type='button' class='kits-grid-action' data-kit-edit='" + id + "' title='Editar' aria-label='Editar " + name + "'><i class='fa fa-pencil'></i></button>" + state + "</div>";
    }

    function loadKits() { const query = new URLSearchParams(); appendQuery(query, "busqueda", $("#txBusquedaKits").val()); appendQuery(query, "tipo", $("#cbTipoKits").val()); appendQuery(query, "activo", $("#cbEstatusKits").val()); return fetchList("/Kits/Consultar?" + query.toString()); }
    async function fetchList(url) { const payload = await requestJson(url); if (!Array.isArray(payload)) throw new Error("La respuesta del listado no es válida."); return payload; }
    async function requestJson(url, options) { const config = Object.assign({ credentials: "same-origin", headers: { Accept: "application/json" } }, options || {}); config.headers = Object.assign({ Accept: "application/json" }, (options && options.headers) || {}); const response = await fetch(url, config); const contentType = response.headers.get("content-type") || ""; let payload = null; if (contentType.toLowerCase().includes("application/json")) payload = await response.json(); if (!response.ok) throw new Error((payload && (payload.message || payload.mensaje)) || "No fue posible completar la operación."); return payload; }
    function appendQuery(query, key, raw) { const value = String(raw == null ? "" : raw).trim(); if (value) query.append(key, value); }
    function safeImageUrl(value) { if (!value) return ""; try { const url = new URL(String(value), window.location.origin); return url.protocol === "https:" || url.protocol === "http:" ? url.href : ""; } catch (_error) { return ""; } }
    function renderType(value, row) { const type = Number(row.tipo || 0), css = type === 1 ? "ca-chip--primary" : type === 2 ? "ca-chip--secondary" : "ca-chip--warning"; return "<span class='ca-chip " + css + "'>" + escapeHtml(value || "") + "</span>"; }
    function renderMoney(value) { const number = Number(value); return "<span class='kits-money'>" + (Number.isFinite(number) ? number : 0).toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 }) + "</span>"; }
    function renderDate(value) { if (!value) return "—"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "—" : "<span class='kits-date'>" + date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) + "</span>"; }
    function updateVisibleCount(rows) { const count = Array.isArray(rows) ? rows.length : 0; $("#txGridKitsVisibleCount").text(count + " " + (count === 1 ? "visible" : "visibles")); }
    function updateVisibleCountFromGrid(instance) { if (!instance || !instance.rows) return; const count = instance.rows({ search: "applied" }).count(); $("#txGridKitsVisibleCount").text(count + " " + (count === 1 ? "visible" : "visibles")); }
    function notifyError(message) { if (window.Swal && typeof window.Swal.fire === "function") window.Swal.fire({ icon: "error", title: "No fue posible completar la operación", text: message, confirmButtonText: "Entendido" }); }
    function notifyWarning(title, message) { if (window.Swal && typeof window.Swal.fire === "function") window.Swal.fire({ icon: "warning", title: title, text: message, confirmButtonText: "Entendido" }); }
    function notifySuccess(title, message) { if (window.Swal && typeof window.Swal.fire === "function") window.Swal.fire({ icon: "success", title: title, text: message, confirmButtonText: "Entendido" }); }
    function escapeHtml(value) { return CheckAppUI.escapeHtml(String(value == null ? "" : value)); }
})(window, document, window.jQuery);
