(function () {
    const root = document.getElementById("bl26-list-builder-app");
    if (!root) {
        return;
    }

    const responseTypes = [
        "Calificacion",
        "Opcion simple",
        "Opcion multiple",
        "Texto",
        "Numeros",
        "Fecha",
        "Fecha y hora",
        "Hora"
    ];

    const responseTypeToLegacyValue = {
        Calificacion: "1",
        "Opcion simple": "2",
        "Opcion multiple": "3",
        Texto: "4",
        Numeros: "5",
        Fecha: "6",
        "Fecha y hora": "7",
        Hora: "8"
    };

    const legacyValueToResponseType = {
        "1": "Calificacion",
        "2": "Opcion simple",
        "3": "Opcion multiple",
        "4": "Texto",
        "5": "Numeros",
        "6": "Fecha",
        "7": "Fecha y hora",
        "8": "Hora"
    };

    const state = {
        categoryRecords: [],
        subcategoryRecords: [],
        assetTypeRecords: [],
        lists: [],
        listFilter: "editing",
        listSearchTerm: "",
        listSort: "name-asc",
        selectedListId: null,
        selectedTaskId: null,
        newOptionText: "",
        notification: null,
        notificationVersion: 0,
        modal: null,
        confirmation: null,
        canWrite: true,
        isSwitchingList: false,
        isBootstrapping: true,
        listLoadState: "loading",
        listLoadError: "",
        pendingRefreshPromise: null,
        isBusy: false,
        shouldFocusTaskName: false,
        preservedScrollState: null,
        draftPersistPromises: {},
        saveTimers: {
            question: null,
            constructor: null
        },
        lastKnownPosition: null
    };

    function createList(id, name, description, isClosed, tasks, detailsLoaded, status, stateCode, isActive, usesAssets, assetTypeId, assetTypeName, taskCount) {
        return {
            id,
            name,
            description,
            isClosed,
            status: toBoolean(status, true),
            stateCode: Number(stateCode || (isClosed ? 2 : 1)),
            isActive: toBoolean(isActive, true),
            usesAssets: toBoolean(usesAssets, false),
            assetTypeId: assetTypeId || "",
            assetTypeName: assetTypeName || "",
            tasks,
            taskCount: Number(taskCount || (Array.isArray(tasks) ? tasks.length : 0)),
            detailsLoaded: Boolean(detailsLoaded)
        };
    }

    function listStatusKey(list) {
        if (!list) {
            return "editing";
        }

        if (list.status === false) {
            return "deleted";
        }

        return list.isClosed ? "closed" : "editing";
    }

    function listStatusLabel(list) {
        const key = listStatusKey(list);
        if (key === "deleted") {
            return "Eliminada";
        }

        return key === "closed" ? "Cerrada" : "En edicion";
    }

    function normalizeSearchValue(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function toBoolean(value, fallback) {
        if (typeof value === "boolean") {
            return value;
        }

        if (typeof value === "string") {
            const normalized = value.trim().toLowerCase();
            if (normalized === "true" || normalized === "1") {
                return true;
            }

            if (normalized === "false" || normalized === "0") {
                return false;
            }
        }

        if (typeof value === "number") {
            return value !== 0;
        }

        return fallback;
    }

    function countIncompleteTasks(list) {
        if (!list || !list.detailsLoaded) {
            return null;
        }

        return list.tasks.reduce(function (total, task) {
            return total + (isTaskComplete(task) ? 0 : 1);
        }, 0);
    }

    function getListCounters() {
        return state.lists.reduce(function (accumulator, list) {
            const statusKey = listStatusKey(list);
            if (statusKey === "deleted") {
                accumulator.deleted += 1;
            } else if (statusKey === "closed") {
                accumulator.closed += 1;
            } else {
                accumulator.editing += 1;
            }

            if (statusKey !== "deleted") {
                accumulator.total += 1;
            }
            return accumulator;
        }, {
            editing: 0,
            closed: 0,
            deleted: 0,
            total: 0
        });
    }

    function getVisibleLists() {
        const normalizedSearchTerm = normalizeSearchValue(state.listSearchTerm);
        const visibleLists = state.lists.filter(function (list) {
            const statusKey = listStatusKey(list);

            if (state.listFilter === "editing" && statusKey !== "editing") {
                return false;
            }

            if (state.listFilter === "closed" && statusKey !== "closed") {
                return false;
            }

            if (state.listFilter === "deleted" && statusKey !== "deleted") {
                return false;
            }

            if (state.listFilter === "all" && statusKey === "deleted") {
                return false;
            }

            if (!normalizedSearchTerm) {
                return true;
            }

            return normalizeSearchValue(list.name).includes(normalizedSearchTerm);
        });

        visibleLists.sort(function (left, right) {
            const leftName = String(left && left.name ? left.name : "");
            const rightName = String(right && right.name ? right.name : "");
            const result = leftName.localeCompare(rightName, "es", { sensitivity: "base" });
            return state.listSort === "name-desc" ? result * -1 : result;
        });

        return visibleLists;
    }

    function syncSelectionWithVisibleLists(visibleLists) {
        if (state.listLoadState === "loading") {
            return;
        }

        if (!visibleLists.length) {
            state.selectedListId = null;
            state.selectedTaskId = null;
            return;
        }

        if (state.selectedListId && !visibleLists.some(function (item) { return item.id === state.selectedListId; })) {
            state.selectedListId = null;
            state.selectedTaskId = null;
        }
    }

    function createTask(raw) {
        return {
            id: raw.id,
            name: raw.name,
            category: raw.category || "",
            categoryId: raw.categoryId || "",
            subcategory: raw.subcategory || "",
            subcategoryId: raw.subcategoryId || "",
            responseType: raw.responseType || "Calificacion",
            notes: raw.notes || "",
            value: Number(raw.value || 0),
            correctAnswers: Array.isArray(raw.correctAnswers) ? raw.correctAnswers : [],
            singleOptions: Array.isArray(raw.singleOptions) ? raw.singleOptions : [],
            multipleOptions: Array.isArray(raw.multipleOptions) ? raw.multipleOptions : [],
            optionIdsByValue: raw.optionIdsByValue || {},
            optionsLoaded: Boolean(raw.optionsLoaded),
            previewResponse: raw.previewResponse || createPreviewResponse(),
            isDraft: Boolean(raw.isDraft)
        };
    }

    function createPreviewResponse() {
        return {
            rating: 0,
            singleOption: "",
            multiOptions: [],
            text: "",
            number: "",
            date: "",
            dateTime: "",
            time: ""
        };
    }

    function selectedList() {
        return state.lists.find((item) => item.id === state.selectedListId) || null;
    }

    function selectedTask() {
        const list = selectedList();
        return list ? list.tasks.find((item) => item.id === state.selectedTaskId) || null : null;
    }

    function categories() {
        return [...state.categoryRecords];
    }

    function getSubcategories() {
        return [...state.subcategoryRecords];
    }

    function getAssetTypes() {
        return [...state.assetTypeRecords];
    }

    function findAssetTypeRecordById(id) {
        const normalizedId = String(id || "").trim();
        if (!normalizedId) {
            return null;
        }

        return state.assetTypeRecords.find(function (item) {
            return item.id === normalizedId;
        }) || null;
    }

    function getAssetTypeOptionsForSelection(selection) {
        const options = [{
            id: "",
            text: "Selecciona un tipo de activo",
            label: "Selecciona un tipo de activo"
        }].concat(getAssetTypes());
        const selectedId = selection && selection.assetTypeId ? String(selection.assetTypeId).trim() : "";
        const selectedText = selection && selection.assetTypeName ? String(selection.assetTypeName).trim() : "";
        if (selectedId && !findAssetTypeRecordById(selectedId)) {
            options.push({
                id: selectedId,
                text: selectedText,
                label: buildTemporaryOptionLabel(selectedText, selectedId),
                isTemporary: true
            });
        }

        return options;
    }

    function findAssetTypeTextById(id, fallback) {
        const record = findAssetTypeRecordById(id);
        return record ? record.text : (fallback || "");
    }

    function buildTemporaryOptionLabel(text, id) {
        const normalizedText = String(text || "").trim() || "Sin nombre";
        const normalizedId = String(id || "").trim() || "sin-id";
        return `[Temporal] ${normalizedText} (${normalizedId})`;
    }

    function findCategoryRecordById(id) {
        const normalizedId = String(id || "").trim();
        if (!normalizedId) {
            return null;
        }

        return state.categoryRecords.find(function (item) {
            return item.id === normalizedId;
        }) || null;
    }

    function findSubcategoryRecordById(id) {
        const normalizedId = String(id || "").trim();
        if (!normalizedId) {
            return null;
        }

        return state.subcategoryRecords.find(function (item) {
            return item.id === normalizedId;
        }) || null;
    }

    function getCategoryOptionsForSelection(selection) {
        const options = categories();
        const selectedId = selection && selection.categoryId ? String(selection.categoryId).trim() : "";
        const selectedText = selection && selection.category ? String(selection.category).trim() : "";
        if (selectedId && !findCategoryRecordById(selectedId)) {
            options.push({
                id: selectedId,
                text: selectedText,
                label: buildTemporaryOptionLabel(selectedText, selectedId),
                isTemporary: true
            });
        }

        return options;
    }

    function getSubcategoryOptionsForSelection(selection) {
        const options = getSubcategories();
        const selectedId = selection && selection.subcategoryId ? String(selection.subcategoryId).trim() : "";
        const selectedText = selection && selection.subcategory ? String(selection.subcategory).trim() : "";
        if (selectedId && !findSubcategoryRecordById(selectedId)) {
            options.push({
                id: selectedId,
                text: selectedText,
                label: buildTemporaryOptionLabel(selectedText, selectedId),
                isTemporary: true
            });
        }

        return options;
    }

    function findCategoryTextById(id, fallback) {
        const record = findCategoryRecordById(id);
        return record ? record.text : (fallback || "");
    }

    function findSubcategoryTextById(id, fallback) {
        const record = findSubcategoryRecordById(id);
        return record ? record.text : (fallback || "");
    }

    function getOptionsForTask(task) {
        if (!task) {
            return [];
        }

        if (task.responseType === "Opcion simple") {
            return task.singleOptions;
        }

        if (task.responseType === "Opcion multiple") {
            return task.multipleOptions;
        }

        return [];
    }

    function supportsOptions(task) {
        return task && (task.responseType === "Opcion simple" || task.responseType === "Opcion multiple");
    }

    function isSelectedListClosed() {
        const list = selectedList();
        return list ? list.isClosed || list.status === false : false;
    }

    function canCreateAnotherTask() {
        const task = selectedTask();
        if (!task) {
            return true;
        }

        return isTaskComplete(task);
    }

    function isDraftTask(task) {
        return Boolean(task && task.isDraft);
    }

    function getListTaskCount(list) {
        if (!list) {
            return 0;
        }

        if (list.detailsLoaded) {
            return Array.isArray(list.tasks) ? list.tasks.length : 0;
        }

        return Number(list.taskCount || 0);
    }

    function isTaskComplete(task) {
        if (!task) {
            return false;
        }

        if (!String(task.responseType || "").trim()) {
            return false;
        }

        if (!String(task.category || "").trim()) {
            return false;
        }

        if (!String(task.subcategory || "").trim()) {
            return false;
        }

        if (!String(task.notes || "").trim()) {
            return false;
        }

        if (!(Number(task.value) > 0)) {
            return false;
        }

        if (task.responseType === "Opcion simple") {
            return task.singleOptions.length > 0;
        }

        if (task.responseType === "Opcion multiple") {
            return task.multipleOptions.length > 0;
        }

        return true;
    }

    function ensureSelectedReferences() {
        if (state.selectedListId && !selectedList()) {
            state.selectedListId = null;
            state.selectedTaskId = null;
        }

        const list = selectedList();
        if (!list) {
            state.selectedTaskId = null;
            return;
        }

        if (state.selectedTaskId && !list.tasks.find((item) => item.id === state.selectedTaskId)) {
            state.selectedTaskId = null;
        }
    }

    function findListIndex(listId) {
        return state.lists.findIndex(function (item) {
            return item.id === listId;
        });
    }

    function replaceListInState(nextList) {
        if (!nextList) {
            return;
        }

        const listIndex = findListIndex(nextList.id);
        if (listIndex >= 0) {
            state.lists.splice(listIndex, 1, nextList);
            return;
        }

        state.lists.push(nextList);
    }

    function removeListFromState(listId) {
        const listIndex = findListIndex(listId);
        if (listIndex >= 0) {
            state.lists.splice(listIndex, 1);
        }
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function responseTypeIcon(responseType) {
        switch (responseType) {
            case "Calificacion": return "☆";
            case "Opcion simple": return "◉";
            case "Opcion multiple": return "☑";
            case "Texto": return "≡";
            case "Numeros": return "123";
            case "Fecha": return "📅";
            case "Fecha y hora": return "🗓";
            case "Hora": return "🕒";
            default: return "•";
        }
    }

    function showNotification(kind, title, message) {
        state.notificationVersion += 1;
        const version = state.notificationVersion;
        state.notification = { kind, title, message };
        render();
        window.setTimeout(function () {
            if (state.notificationVersion === version) {
                state.notification = null;
                render();
            }
        }, 4000);
    }

    function closeNotification() {
        state.notification = null;
        state.notificationVersion += 1;
        render();
    }

    function markBusy(isBusy) {
        state.isBusy = isBusy;
    }

    async function runMutation(action) {
        if (state.isBusy) {
            return;
        }

        markBusy(true);
        render();

        try {
            return await action();
        } finally {
            markBusy(false);
            render();
        }
    }

    function normalizeTaskState(task) {
        if (!task) {
            return;
        }

        task.category = findCategoryTextById(task.categoryId, task.category);
        task.subcategory = findSubcategoryTextById(task.subcategoryId, task.subcategory);
    }

    function resetPreview(task) {
        task.previewResponse = createPreviewResponse();
    }

    function updateResponseType(task, responseType, clearCurrentOptions) {
        if (!task) {
            return;
        }

        if (clearCurrentOptions) {
            if (task.responseType === "Opcion simple") {
                task.singleOptions = [];
            } else if (task.responseType === "Opcion multiple") {
                task.multipleOptions = [];
            }
            task.optionIdsByValue = {};
            task.optionsLoaded = true;
        }

        task.responseType = responseType;
        task.correctAnswers = responseType === "Calificacion" ? ["1"] : [];
        resetPreview(task);
    }

    function openListModal(mode, listId) {
        const list = mode === "edit" ? state.lists.find((item) => item.id === listId) : null;
        state.modal = {
            type: "list",
            mode,
            listId: list ? list.id : null,
            name: list ? list.name : "",
            description: list ? list.description : "",
            usesAssets: list ? Boolean(list.usesAssets) : false,
            assetTypeId: list ? (list.assetTypeId || "") : "",
            assetTypeName: list ? (list.assetTypeName || "") : ""
        };
        render();
    }

    function openTaskModal(task) {
        const taskToEdit = task || selectedTask();
        if (!taskToEdit) {
            return;
        }

        state.modal = {
            type: "task",
            taskId: taskToEdit.id,
            name: taskToEdit.name,
            categoryId: taskToEdit.categoryId,
            category: taskToEdit.category,
            subcategoryId: taskToEdit.subcategoryId,
            subcategory: taskToEdit.subcategory
        };
        render();
    }

    function openCategoryModal() {
        state.modal = { type: "category", name: "" };
        render();
    }

    function openSubcategoryModal() {
        const task = selectedTask();
        const categoryId = task ? task.categoryId : "";
        if (!categoryId) {
            showNotification("validation", "Validacion", "Selecciona una categoria antes de crear una subcategoria.");
            return;
        }

        state.modal = { type: "subcategory", categoryId, category: task.category, name: "" };
        render();
    }

    function closeModal() {
        state.modal = null;
        render();
    }

    function openConfirmation(payload) {
        state.confirmation = payload;
        render();
    }

    function closeConfirmation() {
        state.confirmation = null;
        render();
    }

    function normalizeSessionValue(value) {
        return String(value || "").replace(/^"+|"+$/g, "").trim();
    }

    function getSessionValue(key) {
        try {
            if (window.sessionStorage) {
                return normalizeSessionValue(window.sessionStorage.getItem(key) || "");
            }
        } catch (error) {
            console.warn("[BL26] sessionStorage no disponible para", key, error);
        }

        if (window.__bl26SessionContext && window.__bl26SessionContext[key]) {
            return normalizeSessionValue(window.__bl26SessionContext[key]);
        }

        const fallbackNode = document.getElementById("bl26-session-context");
        if (fallbackNode && fallbackNode.dataset && fallbackNode.dataset[key]) {
            return normalizeSessionValue(fallbackNode.dataset[key]);
        }

        return "";
    }

    function getCommonParams() {
        return {
            idEmpresa: getSessionValue("idEmpresa"),
            cadena: getSessionValue("cadenaBase64"),
            empresa: getSessionValue("empresa"),
            correo: getSessionValue("correo")
        };
    }

    function hasSessionContext() {
        const params = getCommonParams();
        return Boolean(params.idEmpresa && params.cadena && params.empresa && params.correo);
    }

    function seedSessionStorageFromFallback() {
        const fallbackNode = document.getElementById("bl26-session-context");
        if (!fallbackNode || !fallbackNode.dataset) {
            return;
        }

        const context = {
            idEmpresa: normalizeSessionValue(fallbackNode.dataset.idEmpresa || ""),
            cadenaBase64: normalizeSessionValue(fallbackNode.dataset.cadenaBase64 || ""),
            empresa: normalizeSessionValue(fallbackNode.dataset.empresa || ""),
            correo: normalizeSessionValue(fallbackNode.dataset.correo || "")
        };

        try {
            if (window.sessionStorage) {
                Object.entries(context).forEach(function ([key, value]) {
                    if (!window.sessionStorage.getItem(key) && value) {
                        window.sessionStorage.setItem(key, value);
                    }
                });
            }
        } catch (error) {
            console.warn("[BL26] No fue posible sembrar sessionStorage desde el fallback.", error);
        }
    }

    function buildQueryString(params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(function ([key, value]) {
            if (value !== undefined && value !== null) {
                searchParams.set(key, String(value));
            }
        });
        return searchParams.toString();
    }

    async function parseJsonResponse(response, url, method) {
        const rawBody = await response.text();
        const contentType = response.headers.get("content-type") || "";

        if (!response.ok) {
            console.error("[BL26] Respuesta HTTP inválida", {
                url: url,
                method: method,
                status: response.status,
                contentType: contentType,
                body: rawBody
            });
            throw new Error("No fue posible completar la solicitud al servidor.");
        }

        if (!rawBody.trim()) {
            console.error("[BL26] Respuesta vacía detectada", {
                url: url,
                method: method,
                status: response.status,
                contentType: contentType,
                params: getCommonParams()
            });
            throw new Error("No fue posible cargar la información requerida. Verifica la sesión e intenta de nuevo.");
        }

        if (!contentType.toLowerCase().includes("json")) {
            console.error("[BL26] Respuesta no JSON detectada", {
                url: url,
                method: method,
                status: response.status,
                contentType: contentType,
                body: rawBody
            });
            throw new Error("El servidor devolvió una respuesta inválida.");
        }

        try {
            return JSON.parse(rawBody);
        } catch (error) {
            console.error("[BL26] Error al parsear JSON", {
                url: url,
                method: method,
                status: response.status,
                contentType: contentType,
                body: rawBody,
                error: error
            });
            throw new Error("No fue posible interpretar la respuesta del servidor.");
        }
    }

    async function legacyGet(url, params) {
        const query = buildQueryString(params || {});
        const requestUrl = query ? `${url}?${query}` : url;
        const response = await fetch(requestUrl, {
            method: "GET",
            headers: {
                Accept: "application/json"
            },
            credentials: "same-origin"
        });

        return parseJsonResponse(response, requestUrl, "GET");
    }

    async function legacyPostJson(url, payload) {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                Accept: "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify(payload)
        });

        return parseJsonResponse(response, url, "POST");
    }

    function pick(obj, keys, fallback) {
        for (let index = 0; index < keys.length; index += 1) {
            const key = keys[index];
            if (obj && obj[key] !== undefined && obj[key] !== null) {
                return obj[key];
            }
        }

        return fallback;
    }

    function mapLegacyType(value) {
        const raw = String(value ?? "0");
        return legacyValueToResponseType[raw] || "Calificacion";
    }

    function toLegacyTypeValue(responseType) {
        return responseTypeToLegacyValue[responseType] || "0";
    }

    function parseCorrectAnswers(responseType, rawValue) {
        const value = String(rawValue || "").trim();
        if (!value) {
            return [];
        }

        if (responseType === "Opcion multiple") {
            return value
                .split(",")
                .map(function (item) { return item.trim(); })
                .filter(Boolean);
        }

        return [value];
    }

    function buildCorrectAnswerValue(task) {
        if (!task) {
            return "";
        }

        if (task.responseType === "Opcion multiple") {
            return task.correctAnswers.join(",");
        }

        return task.correctAnswers[0] || "";
    }

    function upsertCategoryRecord(id, text) {
        const normalizedId = String(id || "").trim();
        const normalizedText = String(text || "").trim();
        if (!normalizedId || !normalizedText) {
            return;
        }

        if (state.categoryRecords.find(function (item) { return item.id === normalizedId; })) {
            return;
        }

        state.categoryRecords.push({
            id: normalizedId,
            text: normalizedText,
            label: normalizedText,
            isTemporary: false
        });
    }

    function upsertSubcategoryRecord(id, text) {
        const normalizedId = String(id || "").trim();
        const normalizedText = String(text || "").trim();
        if (!normalizedId || !normalizedText) {
            return;
        }

        if (state.subcategoryRecords.find(function (item) { return item.id === normalizedId; })) {
            return;
        }

        state.subcategoryRecords.push({
            id: normalizedId,
            text: normalizedText,
            label: normalizedText,
            isTemporary: false
        });
    }

    async function searchCategoryRecordsByName(categoryName) {
        const response = await legacyGet("/Listas/GetCategoriasComboBox", Object.assign({
            searchTerm: JSON.stringify(categoryName || "")
        }, getCommonParams()));

        const items = Array.isArray(response.d) ? response.d : [];
        items.forEach(function (item) {
            upsertCategoryRecord(pick(item, ["id"], ""), pick(item, ["text"], ""));
        });

        return items;
    }

    async function searchSubcategoryRecordsByName(subcategoryName) {
        const response = await legacyGet("/Listas/GetSubcategoriasComboBox", Object.assign({
            searchTerm: JSON.stringify(subcategoryName || "")
        }, getCommonParams()));

        const items = Array.isArray(response.d) ? response.d : [];
        items.forEach(function (item) {
            upsertSubcategoryRecord(pick(item, ["id"], ""), pick(item, ["text"], ""));
        });

        return items;
    }

    function getCategoryIdByName(categoryName) {
        const normalizedName = String(categoryName || "").trim().toLowerCase();
        const matches = state.categoryRecords.filter(function (item) {
            return String(item.text || "").trim().toLowerCase() === normalizedName;
        });

        return matches.length === 1 ? matches[0].id : "";
    }

    function getSubcategoryId(subcategoryName) {
        const normalizedName = String(subcategoryName || "").trim().toLowerCase();
        const matches = state.subcategoryRecords.filter(function (item) {
            return String(item.text || "").trim().toLowerCase() === normalizedName;
        });

        return matches.length === 1 ? matches[0].id : "";
    }

    async function resolveListPosition() {
        if (state.lastKnownPosition && state.lastKnownPosition.latitud && state.lastKnownPosition.longitud) {
            return state.lastKnownPosition;
        }

        if (!navigator.geolocation) {
            return { latitud: "", longitud: "" };
        }

        return new Promise(function (resolve) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    state.lastKnownPosition = {
                        latitud: String(position.coords.latitude),
                        longitud: String(position.coords.longitude)
                    };
                    resolve(state.lastKnownPosition);
                },
                function () {
                    resolve({ latitud: "", longitud: "" });
                }
            );
        });
    }

    async function initializePermissions() {
        const params = getCommonParams();
        if (!hasSessionContext()) {
            return;
        }

        try {
            const response = await legacyGet("/Listas/Inicializa", params);
            state.canWrite = Number(response.perm || 0) === 1;
        } catch (error) {
            state.canWrite = true;
        }
    }

    async function loadCategoryCatalogs() {
        if (!hasSessionContext()) {
            return;
        }

        const params = getCommonParams();
        const [categoriesResponse, subcategoriesResponse] = await Promise.all([
            legacyGet("/Listas/GetCategoriasComboBox", Object.assign({ searchTerm: JSON.stringify("") }, params)),
            legacyGet("/Listas/GetSubcategoriasComboBox", Object.assign({ searchTerm: JSON.stringify("") }, params))
        ]);

        const nextCategoryRecords = [];
        const nextSubcategoryRecords = [];

        (categoriesResponse.d || []).forEach(function (item) {
            const id = String(pick(item, ["id"], "") || "").trim();
            const text = String(pick(item, ["text"], "") || "").trim();
            if (!id || !text || nextCategoryRecords.find(function (record) { return record.id === id; })) {
                return;
            }

            nextCategoryRecords.push({
                id: id,
                text: text,
                label: text,
                isTemporary: false
            });
        });

        (subcategoriesResponse.d || []).forEach(function (item) {
            const id = String(pick(item, ["id"], "") || "").trim();
            const text = String(pick(item, ["text"], "") || "").trim();
            if (!id || !text || nextSubcategoryRecords.find(function (record) { return record.id === id; })) {
                return;
            }

            nextSubcategoryRecords.push({
                id: id,
                text: text,
                label: text,
                isTemporary: false
            });
        });

        state.categoryRecords = nextCategoryRecords;
        state.subcategoryRecords = nextSubcategoryRecords;
    }

    async function loadAssetTypeCatalog() {
        if (!hasSessionContext()) {
            return;
        }

        const params = getCommonParams();
        const response = await legacyGet("/Listas/GetTiposActivosBL26", Object.assign({ searchTerm: "" }, params));
        state.assetTypeRecords = Array.isArray(response.d)
            ? response.d.map(function (item) {
                return {
                    id: String(pick(item, ["id"], "") || "").trim(),
                    text: String(pick(item, ["text"], "") || "").trim(),
                    label: String(pick(item, ["text"], "") || "").trim()
                };
            }).filter(function (item) {
                return item.id && item.text;
            })
            : [];
    }

    function normalizeLegacyMessage(value) {
        return String(value || "").replace(/^"+|"+$/g, "").trim();
    }

    function isDuplicateLegacyMessage(value) {
        return normalizeLegacyMessage(value).toLowerCase() === "ya existe un elemento con este nombre";
    }

    async function loadListSummaries() {
        const items = await loadListSummaryItems();
        return (Array.isArray(items) ? items : []).map(function (item) {
            const listId = pick(item, ["id"], "");
            if (!listId) {
                return null;
            }

            const stateCode = Number(pick(item, ["estado", "Estado"], 1) || 1);
            return createList(
                listId,
                pick(item, ["text", "nombre", "Nombre"], ""),
                pick(item, ["notas", "Notas"], ""),
                stateCode === 2,
                [],
                false,
                toBoolean(pick(item, ["status", "Status"], true), true),
                stateCode,
                toBoolean(pick(item, ["activo", "Activo"], true), true),
                toBoolean(pick(item, ["usaActivos", "UsaActivos"], false), false),
                pick(item, ["idTipoActivo"], ""),
                pick(item, ["tipoActivo", "TipoActivo"], ""),
                Number(pick(item, ["cantidadTareas", "CantidadTareas"], 0) || 0)
            );
        }).filter(Boolean);
    }

    async function loadListSummaryItems() {
        const params = getCommonParams();
        const response = await legacyGet("/DetalleLista/GetListasEstadosBL26", Object.assign({ searchTerm: "" }, params));
        return Array.isArray(response.d) ? response.d : [];
    }

    async function loadListSnapshotById(listId, summaryItem) {
        if (!listId) {
            return null;
        }

        const detailResponse = await legacyGet("/Listas/GetElemento", Object.assign({ llav: listId }, getCommonParams()));
        const listDetail = Array.isArray(detailResponse.d) ? detailResponse.d[0] : (detailResponse.d || {});
        const stateCode = Number(pick(listDetail, ["estado", "Estado"], pick(summaryItem, ["estado", "Estado"], 1)) || 1);
        const statusValue = pick(listDetail, ["status", "Status"], pick(summaryItem, ["status", "Status"], true));
        const activeValue = pick(listDetail, ["activo", "Activo"], pick(summaryItem, ["activo", "Activo"], true));
        const tasksResponse = await legacyGet("/Listas/GetListasPreguntas", Object.assign({ llave: listId }, getCommonParams()));
        const summaries = Array.isArray(tasksResponse.d) ? tasksResponse.d : [];
        const tasks = summaries.map(function (summary) {
            return createTask({
                id: pick(summary, ["id"], ""),
                name: pick(summary, ["text"], ""),
                responseType: "Calificacion",
                notes: "",
                value: 0,
                correctAnswers: [],
                optionsLoaded: false
            });
        });

        return createList(
            listId,
            pick(listDetail, ["nombre", "Nombre"], pick(summaryItem, ["text"], "")),
            pick(listDetail, ["notas", "Notas"], ""),
            stateCode === 2,
            tasks,
            false,
            toBoolean(statusValue, true),
            stateCode,
            toBoolean(activeValue, true),
            toBoolean(pick(listDetail, ["usaActivos", "UsaActivos"], pick(summaryItem, ["usaActivos", "UsaActivos"], false)), false),
            pick(listDetail, ["idTipoActivo"], pick(summaryItem, ["idTipoActivo"], "")),
            pick(listDetail, ["tipoActivo", "TipoActivo"], pick(summaryItem, ["tipoActivo", "TipoActivo"], "")),
            Number(pick(summaryItem, ["cantidadTareas", "CantidadTareas"], tasks.length) || tasks.length)
        );
    }

    async function tryLoadCategoryCatalogs() {
        const hadExistingCatalog = state.categoryRecords.length > 0 || state.subcategoryRecords.length > 0;
        try {
            await loadCategoryCatalogs();
            return true;
        } catch (error) {
            console.error("[BL26] No fue posible cargar los catálogos de categorías.", error);
            showNotification(
                hadExistingCatalog ? "attention" : "error",
                "Catalogos",
                "No fue posible actualizar el catálogo completo. Se conservarán temporalmente los datos ya cargados."
            );
            return false;
        }
    }

    async function ensureCategoryCatalogsAvailable() {
        if (categories().length > 0 && getSubcategories().length > 0) {
            return true;
        }

        return tryLoadCategoryCatalogs();
    }

    async function loadTaskDetail(taskSummary) {
        const response = await legacyGet("/Listas/GetElementoPregunta", Object.assign({ llav: taskSummary.id }, getCommonParams()));
        const detail = response.d || {};
        const responseType = mapLegacyType(pick(detail, ["tipo", "Tipo"], "1"));
        const category = pick(detail, ["categoria", "Categoria"], taskSummary.category || "");
        const subcategory = pick(detail, ["subcategoria", "Subcategoria"], taskSummary.subcategory || "");
        const categoryId = pick(detail, ["idCategoria", "IdCategoria"], "");
        const subcategoryId = pick(detail, ["idSubcategoria", "IdSubcategoria"], "");

        return createTask({
            id: pick(detail, ["id", "Id"], taskSummary.id),
            name: pick(detail, ["pregunta", "Pregunta"], taskSummary.name),
            category: category,
            categoryId: categoryId,
            subcategory: subcategory,
            subcategoryId: subcategoryId,
            responseType: responseType,
            notes: pick(detail, ["explicacion", "Explicacion"], ""),
            value: Number(pick(detail, ["valor", "Valor"], 0) || 0),
            correctAnswers: parseCorrectAnswers(responseType, pick(detail, ["respuestaCorrecta", "RespuestaCorrecta"], "")),
            optionsLoaded: !(responseType === "Opcion simple" || responseType === "Opcion multiple")
        });
    }

    async function ensureListDetailsLoaded(listId) {
        const list = state.lists.find(function (item) { return item.id === listId; });
        if (!list || list.detailsLoaded) {
            return;
        }

        const detailResponse = await legacyGet("/Listas/GetElemento", Object.assign({ llav: listId }, getCommonParams()));
        const listDetail = Array.isArray(detailResponse.d) ? detailResponse.d[0] : (detailResponse.d || {});
        list.name = pick(listDetail, ["nombre", "Nombre"], list.name);
        list.description = pick(listDetail, ["notas", "Notas"], list.description);
        list.isClosed = Number(pick(listDetail, ["estado", "Estado"], list.stateCode || (list.isClosed ? 2 : 1))) === 2;
        list.status = toBoolean(pick(listDetail, ["status", "Status"], list.status), list.status);
        list.stateCode = Number(pick(listDetail, ["estado", "Estado"], list.stateCode || 1) || 1);
        list.isActive = toBoolean(pick(listDetail, ["activo", "Activo"], list.isActive), list.isActive);
        list.usesAssets = toBoolean(pick(listDetail, ["usaActivos", "UsaActivos"], list.usesAssets), list.usesAssets);
        list.assetTypeId = pick(listDetail, ["idTipoActivo"], list.assetTypeId || "");
        list.assetTypeName = pick(listDetail, ["tipoActivo", "TipoActivo"], list.assetTypeName || "");

        if (!Array.isArray(list.tasks) || list.tasks.length === 0) {
            const tasksResponse = await legacyGet("/Listas/GetListasPreguntas", Object.assign({ llave: listId }, getCommonParams()));
            const summaries = Array.isArray(tasksResponse.d) ? tasksResponse.d : [];
            list.tasks = summaries.map(function (summary) {
                return createTask({
                    id: pick(summary, ["id"], ""),
                    name: pick(summary, ["text"], ""),
                    responseType: "Calificacion",
                    notes: "",
                    value: 0,
                    correctAnswers: [],
                    optionsLoaded: false
                });
            });
        }

        const detailedTasks = [];
        for (const taskSummary of list.tasks) {
            detailedTasks.push(await loadTaskDetail(taskSummary));
        }

        list.tasks = detailedTasks;
        list.taskCount = detailedTasks.length;
        list.detailsLoaded = true;
    }

    async function ensureTaskOptionsLoaded(task) {
        if (!task || !supportsOptions(task) || task.optionsLoaded === true) {
            return;
        }

        const response = await legacyGet("/Listas/GetElementoOpciones", Object.assign({
            llave: task.id,
            tipoPregunta: toLegacyTypeValue(task.responseType)
        }, getCommonParams()));

        const options = Array.isArray(response.d) ? response.d : [];
        const values = options.map(function (item) {
            return pick(item, ["opcion"], "");
        }).filter(Boolean);
        const optionIdsByValue = {};
        options.forEach(function (item) {
            const text = pick(item, ["opcion"], "");
            if (text) {
                optionIdsByValue[text] = pick(item, ["id"], "");
            }
        });

        if (task.responseType === "Opcion simple") {
            task.singleOptions = values;
        } else {
            task.multipleOptions = values;
        }
        task.optionIdsByValue = optionIdsByValue;
        task.optionsLoaded = true;
    }

    async function refreshLists(selection) {
        if (state.pendingRefreshPromise) {
            return state.pendingRefreshPromise;
        }

        if (!hasSessionContext()) {
            state.lists = [];
            state.selectedListId = null;
            state.selectedTaskId = null;
            state.isBootstrapping = false;
            state.listLoadState = "error";
            state.listLoadError = "No fue posible recuperar la sesión de trabajo.";
            render();
            return;
        }

        state.listLoadState = "loading";
        state.listLoadError = "";
        render();

        state.pendingRefreshPromise = (async function () {
            const previousSelectedListId = selection && selection.listId ? selection.listId : state.selectedListId;
            const previousSelectedTaskId = selection && selection.taskId ? selection.taskId : state.selectedTaskId;
            const previousListIds = new Set(state.lists.map(function (item) { return item.id; }));
            const previousTaskIds = new Set((selectedList() ? selectedList().tasks : []).map(function (item) { return item.id; }));

            try {
                state.lists = await loadListSummaries();
                ensureSelectedReferences();

                if (selection && selection.preferNewList) {
                    const newList = state.lists.find(function (item) { return !previousListIds.has(item.id); });
                    if (newList) {
                        state.selectedListId = newList.id;
                    }
                } else if (previousSelectedListId && state.lists.find(function (item) { return item.id === previousSelectedListId; })) {
                    state.selectedListId = previousSelectedListId;
                }

                ensureSelectedReferences();

                const currentList = selectedList();
                if (currentList) {
                    if (selection && selection.resetTaskSelection) {
                        state.selectedTaskId = null;
                    }

                    await ensureListDetailsLoaded(currentList.id);

                    if (selection && selection.preferNewTask) {
                        const newTask = currentList.tasks.find(function (item) { return !previousTaskIds.has(item.id); });
                        if (newTask) {
                            state.selectedTaskId = newTask.id;
                        }
                    } else if (previousSelectedTaskId && currentList.tasks.find(function (item) { return item.id === previousSelectedTaskId; })) {
                        state.selectedTaskId = previousSelectedTaskId;
                    }

                    ensureSelectedReferences();

                    if (selectedTask()) {
                        await ensureTaskOptionsLoaded(selectedTask());
                    }
                }

                state.isBootstrapping = false;
                state.listLoadState = state.lists.length > 0 ? "success-with-data" : "success-empty";
                render();
            } catch (error) {
                state.isBootstrapping = false;
                state.listLoadState = "error";
                state.listLoadError = error && error.message ? error.message : "No fue posible cargar las listas.";
                render();
                throw error;
            } finally {
                state.pendingRefreshPromise = null;
            }
        })();

        return state.pendingRefreshPromise;
    }

    async function reloadCurrentList(selection) {
        const listId = selection && selection.listId ? selection.listId : state.selectedListId;
        if (!listId) {
            return null;
        }

        const existingList = state.lists.find(function (item) {
            return item.id === listId;
        });
        const previousTaskIds = new Set((existingList ? existingList.tasks : []).map(function (item) {
            return item.id;
        }));
        const previousSelectedTaskId = selection && selection.taskId ? selection.taskId : state.selectedTaskId;
        const detailResponse = await legacyGet("/Listas/GetElemento", Object.assign({ llav: listId }, getCommonParams()));
        const listDetail = Array.isArray(detailResponse.d) ? detailResponse.d[0] : (detailResponse.d || {});
        const tasksResponse = await legacyGet("/Listas/GetListasPreguntas", Object.assign({ llave: listId }, getCommonParams()));
        const summaries = Array.isArray(tasksResponse.d) ? tasksResponse.d : [];
        const nextList = createList(
            listId,
            pick(listDetail, ["nombre", "Nombre"], existingList ? existingList.name : ""),
            pick(listDetail, ["notas", "Notas"], existingList ? existingList.description : ""),
            Number(pick(listDetail, ["estado", "Estado"], 1)) === 2,
            summaries.map(function (summary) {
                const existingTask = existingList
                    ? existingList.tasks.find(function (item) { return item.id === pick(summary, ["id"], ""); })
                    : null;
                return createTask({
                    id: pick(summary, ["id"], ""),
                    name: pick(summary, ["text"], ""),
                    category: existingTask ? existingTask.category : "",
                    categoryId: existingTask ? existingTask.categoryId : "",
                    subcategory: existingTask ? existingTask.subcategory : "",
                    subcategoryId: existingTask ? existingTask.subcategoryId : "",
                    responseType: existingTask ? existingTask.responseType : "Calificacion",
                    notes: existingTask ? existingTask.notes : "",
                    value: existingTask ? existingTask.value : 0,
                    correctAnswers: existingTask ? existingTask.correctAnswers : [],
                    singleOptions: existingTask ? existingTask.singleOptions : [],
                    multipleOptions: existingTask ? existingTask.multipleOptions : [],
                    optionIdsByValue: existingTask ? existingTask.optionIdsByValue : {},
                    optionsLoaded: existingTask ? existingTask.optionsLoaded : false,
                    previewResponse: existingTask ? existingTask.previewResponse : createPreviewResponse(),
                    isDraft: false
                });
            }),
            false,
            toBoolean(pick(listDetail, ["status", "Status"], existingList ? existingList.status : true), true),
            Number(pick(listDetail, ["estado", "Estado"], existingList ? existingList.stateCode : 1) || 1),
            toBoolean(pick(listDetail, ["activo", "Activo"], existingList ? existingList.isActive : true), true),
            toBoolean(pick(listDetail, ["usaActivos", "UsaActivos"], existingList ? existingList.usesAssets : false), false),
            pick(listDetail, ["idTipoActivo"], existingList ? existingList.assetTypeId : ""),
            pick(listDetail, ["tipoActivo", "TipoActivo"], existingList ? existingList.assetTypeName : ""),
            summaries.length
        );

        replaceListInState(nextList);

        if (selection && selection.preferNewTask) {
            const newTask = nextList.tasks.find(function (item) { return !previousTaskIds.has(item.id); });
            state.selectedTaskId = newTask ? newTask.id : null;
        } else if (previousSelectedTaskId && nextList.tasks.find(function (item) { return item.id === previousSelectedTaskId; })) {
            state.selectedTaskId = previousSelectedTaskId;
        } else if (selection && selection.resetTaskSelection) {
            state.selectedTaskId = null;
        }

        if (selection && selection.includeDetails) {
            await ensureListDetailsLoaded(nextList.id);
            if (!state.selectedTaskId && selection.autoSelectFirstTask !== false) {
                state.selectedTaskId = nextList.tasks[0] ? nextList.tasks[0].id : null;
            }
            if (selectedTask()) {
                await ensureTaskOptionsLoaded(selectedTask());
            }
        }

        ensureSelectedReferences();
        render();
        return nextList;
    }

    async function ensureListValidationDataLoaded(list) {
        if (!list || isDraftTask(list)) {
            return;
        }

        await ensureListDetailsLoaded(list.id);
        for (const task of list.tasks) {
            if (supportsOptions(task)) {
                await ensureTaskOptionsLoaded(task);
            }
        }
    }

    async function persistDraftTask(task) {
        if (!task || !isDraftTask(task) || !isTaskComplete(task)) {
            return null;
        }

        if (state.draftPersistPromises[task.id]) {
            return state.draftPersistPromises[task.id];
        }

        clearScheduledSave("question");
        clearScheduledSave("constructor");

        const list = selectedList();
        if (!list) {
            return null;
        }

        const persistPromise = (async function () {
            const snapshot = {
                name: task.name,
                categoryId: task.categoryId,
                category: task.category,
                subcategoryId: task.subcategoryId,
                subcategory: task.subcategory,
                responseType: task.responseType,
                notes: task.notes,
                value: task.value,
                correctAnswers: [...task.correctAnswers],
                singleOptions: [...task.singleOptions],
                multipleOptions: [...task.multipleOptions]
            };

            const ids = await ensureServerCategoryIds(snapshot);
            await persistQuestion({
                llav: "",
                idLista: list.id,
                nombre: snapshot.name,
                idCategoria: ids.categoryId,
                idSubcategoria: ids.subcategoryId
            });

            await reloadCurrentList({ listId: list.id, preferNewTask: true, includeDetails: false });

            const persistedTask = selectedTask();
            if (!persistedTask) {
                return null;
            }

            persistedTask.name = snapshot.name;
            persistedTask.categoryId = ids.categoryId;
            persistedTask.category = snapshot.category;
            persistedTask.subcategoryId = ids.subcategoryId;
            persistedTask.subcategory = snapshot.subcategory;
            persistedTask.responseType = snapshot.responseType;
            persistedTask.notes = snapshot.notes;
            persistedTask.value = snapshot.value;
            persistedTask.correctAnswers = [...snapshot.correctAnswers];
            persistedTask.singleOptions = [...snapshot.singleOptions];
            persistedTask.multipleOptions = [...snapshot.multipleOptions];
            persistedTask.optionsLoaded = false;

            const optionsToPersist = getOptionsForTask(persistedTask);
            for (const optionText of optionsToPersist) {
                await persistOption(persistedTask, optionText);
            }

            if (supportsOptions(persistedTask)) {
                persistedTask.optionsLoaded = false;
                await ensureTaskOptionsLoaded(persistedTask);
            }

            await persistConstructor(persistedTask);
            syncTaskSummary(persistedTask);
            render();
            return selectedTask();
        })();

        state.draftPersistPromises[task.id] = persistPromise;

        try {
            return await persistPromise;
        } finally {
            delete state.draftPersistPromises[task.id];
        }
    }

    async function ensureServerCategoryIds(taskLike) {
        let categoryId = String(taskLike && taskLike.categoryId ? taskLike.categoryId : "").trim();
        let subcategoryId = String(taskLike && taskLike.subcategoryId ? taskLike.subcategoryId : "").trim();
        const categoryName = String(taskLike && taskLike.category ? taskLike.category : "").trim();
        const subcategoryName = String(taskLike && taskLike.subcategory ? taskLike.subcategory : "").trim();

        if (!categoryId && categoryName) {
            await searchCategoryRecordsByName(categoryName);
            categoryId = getCategoryIdByName(categoryName);
        }

        if (!subcategoryId && subcategoryName) {
            await searchSubcategoryRecordsByName(subcategoryName);
            subcategoryId = getSubcategoryId(subcategoryName);
        }

        if (!categoryId || !subcategoryId) {
            throw new Error("La categoria o subcategoria seleccionada no existe en los catalogos del creador actual.");
        }

        if (taskLike) {
            taskLike.categoryId = categoryId;
            taskLike.subcategoryId = subcategoryId;
            taskLike.category = findCategoryTextById(categoryId, categoryName);
            taskLike.subcategory = findSubcategoryTextById(subcategoryId, subcategoryName);
        }

        return { categoryId: categoryId, subcategoryId: subcategoryId };
    }

    async function persistList(payload) {
        const position = await resolveListPosition();
        const requestPayload = {
            llav: payload.llav || "",
            nombre: payload.nombre,
            n: payload.notas,
            usaActivos: Boolean(payload.usaActivos),
            idTipoActivo: payload.usaActivos && payload.idTipoActivo ? payload.idTipoActivo : "",
            latitud: position.latitud,
            longitud: position.longitud,
            idEmpresa: getSessionValue("idEmpresa"),
            cadena: getSessionValue("cadenaBase64"),
            empresa: getSessionValue("empresa"),
            correo: getSessionValue("correo")
        };

        if (payload.isListaCerrada === true) {
            requestPayload.isListaCerrada = true;
        }

        const response = await legacyPostJson("/Listas/GuardarLista", requestPayload);

        const result = pick(response, ["d"], "");
        if (String(result) !== "Ok") {
            throw new Error(String(result));
        }
    }

    async function persistQuestion(payload) {
        const response = await legacyGet("/Listas/GuardarPregunta", Object.assign({
            llav: payload.llav || "",
            idLista: payload.idLista,
            nombre: payload.nombre,
            idCategoria: payload.idCategoria,
            idSubcategoria: payload.idSubcategoria
        }, getCommonParams()));

        const result = pick(response, ["d"], "");
        if (String(result) !== "Ok") {
            throw new Error(String(result));
        }
    }

    async function persistConstructor(task) {
        const list = selectedList();
        if (!task || !list) {
            return;
        }

        const response = await legacyGet("/Listas/GuardarConstructor", Object.assign({
            llav: task.id,
            idLista: list.id,
            pregunta: task.name,
            notas: task.notes,
            tipo: toLegacyTypeValue(task.responseType),
            valor: task.value > 0 ? String(task.value) : "0",
            isListaCerrada: list.isClosed,
            obligatorio: "true",
            idPregunta: task.id,
            respuestaCorrecta: buildCorrectAnswerValue(task)
        }, getCommonParams()));

        const result = pick(response, ["d"], "");
        if (String(result) !== "Ok") {
            throw new Error(String(result));
        }
    }

    async function persistOption(task, optionText) {
        const list = selectedList();
        if (!task || !list) {
            return;
        }

        const response = await legacyGet("/Listas/GuardarOpcion", Object.assign({
            llav: "",
            idLista: list.id,
            idPregunta: task.id,
            nombre: optionText,
            tipoPregunta: toLegacyTypeValue(task.responseType)
        }, getCommonParams()));

        const result = pick(response, ["d"], "");
        if (String(result) !== "Ok" && String(result) !== "\"Ya existe el elemento\"") {
            throw new Error(String(result));
        }

        if (String(result) === "\"Ya existe el elemento\"") {
            throw new Error("Ya existe el elemento.");
        }
    }

    async function deleteOption(optionId) {
        const response = await legacyGet("/Listas/DeleteElementoOpciones", Object.assign({
            id: optionId
        }, getCommonParams()));

        const result = pick(response, ["d"], "");
        if (String(result) !== "Ok") {
            throw new Error(String(result));
        }
    }

    async function deleteListById(listId) {
        const response = await legacyGet("/Listas/EliminarLista", Object.assign({
            llav: listId
        }, getCommonParams()));

        const result = pick(response, ["d"], "");
        if (String(result) !== "Ok") {
            throw new Error(String(result));
        }
    }

    async function deleteTaskById(taskId) {
        const response = await legacyGet("/Listas/EliminarPregunta", Object.assign({
            llav: taskId
        }, getCommonParams()));

        const result = pick(response, ["d"], "");
        if (String(result) !== "Ok") {
            throw new Error(String(result));
        }
    }

    async function persistCategory(name) {
        return legacyGet("/Categorias/GuardaCategoria", Object.assign({
            llav: "",
            nomb: name,
            nota: ""
        }, getCommonParams()));
    }

    async function persistSubcategory(name) {
        return legacyGet("/Subcategorias/GuardaSubcategoria", Object.assign({
            llav: "",
            nomb: name,
            nota: ""
        }, getCommonParams()));
    }

    function clearScheduledSave(kind) {
        if (state.saveTimers[kind]) {
            window.clearTimeout(state.saveTimers[kind]);
            state.saveTimers[kind] = null;
        }
    }

    function scheduleSave(kind, callback) {
        clearScheduledSave(kind);
        state.saveTimers[kind] = window.setTimeout(function () {
            state.saveTimers[kind] = null;
            callback().catch(handleAsyncError);
        }, 450);
    }

    async function saveListModal() {
        if (!state.modal || state.modal.type !== "list") {
            return;
        }

        if (state.modal.usesAssets && !String(state.modal.assetTypeId || "").trim()) {
            showNotification("validation", "Validacion", "Selecciona un tipo de activo vigente para esta lista.");
            return;
        }

        await runMutation(async function () {
            const name = (state.modal.name || "").trim() || "Nueva lista";
            const description = (state.modal.description || "").trim() || "Sin descripcion";
            const usesAssets = Boolean(state.modal.usesAssets);
            const assetTypeId = usesAssets ? (state.modal.assetTypeId || "") : "";
            const assetTypeName = usesAssets ? findAssetTypeTextById(assetTypeId, state.modal.assetTypeName || "") : "";
            const editingList = state.modal.mode === "edit" && state.modal.listId
                ? state.lists.find(function (item) { return item.id === state.modal.listId; })
                : null;
            const previousListIds = new Set(state.lists.map(function (item) { return item.id; }));

            await persistList({
                llav: editingList ? editingList.id : "",
                nombre: name,
                notas: description,
                usaActivos: usesAssets,
                idTipoActivo: assetTypeId,
                isListaCerrada: editingList ? editingList.isClosed : false
            });

            state.modal = null;
            if (editingList) {
                editingList.name = name;
                editingList.description = description;
                editingList.usesAssets = usesAssets;
                editingList.assetTypeId = assetTypeId;
                editingList.assetTypeName = assetTypeName;
                render();
                return;
            }

            const summaryItems = await loadListSummaryItems();
            const createdSummary = summaryItems.find(function (item) {
                return !previousListIds.has(pick(item, ["id"], ""));
            });

            if (!createdSummary) {
                await refreshLists({ listId: null, preferNewList: true, resetTaskSelection: true });
                return;
            }

            const createdList = await loadListSnapshotById(pick(createdSummary, ["id"], ""), createdSummary);
            if (!createdList) {
                await refreshLists({ listId: null, preferNewList: true, resetTaskSelection: true });
                return;
            }

            replaceListInState(createdList);
            state.selectedListId = createdList.id;
            state.selectedTaskId = null;
            state.newOptionText = "";
            ensureSelectedReferences();
            render();
        });
    }

    async function saveTaskModal() {
        if (!state.modal || state.modal.type !== "task") {
            return;
        }

        await runMutation(async function () {
            const list = selectedList();
            if (!list) {
                return;
            }

            const task = list.tasks.find(function (item) { return item.id === state.modal.taskId; });
            if (!task) {
                return;
            }

            task.name = (state.modal.name || "").trim() || "Nueva tarea";
            task.categoryId = state.modal.categoryId || "";
            task.category = findCategoryTextById(task.categoryId, state.modal.category || "");
            task.subcategoryId = state.modal.subcategoryId || "";
            task.subcategory = findSubcategoryTextById(task.subcategoryId, state.modal.subcategory || "");
            normalizeTaskState(task);
            state.modal = null;
            render();

            if (isDraftTask(task)) {
                await persistDraftTask(task);
                return;
            }

            const ids = await ensureServerCategoryIds(task);
            await persistQuestion({
                llav: task.id,
                idLista: list.id,
                nombre: task.name,
                idCategoria: ids.categoryId,
                idSubcategoria: ids.subcategoryId
            });

            syncTaskSummary(task);
            render();
        });
    }

    async function saveCategoryModal() {
        if (!state.modal || state.modal.type !== "category") {
            return;
        }

        const categoryName = (state.modal.name || "").trim();
        if (!categoryName) {
            showNotification("validation", "Validacion", "Ingresa un nombre de categoria antes de guardar.");
            return;
        }

        if (categories().some(function (item) { return item.text.toLowerCase() === categoryName.toLowerCase(); })) {
            showNotification("validation", "Validacion", "La categoria ya existe.");
            return;
        }

        await runMutation(async function () {
            const response = await persistCategory(categoryName);
            const result = normalizeLegacyMessage(response.d);
            if (result === "Ok") {
                const reloadedCatalogs = await tryLoadCategoryCatalogs();
                if (!reloadedCatalogs) {
                    await searchCategoryRecordsByName(categoryName);
                }

                const selectedCategoryRecord = state.categoryRecords.find(function (item) {
                    return item.text.toLowerCase() === categoryName.toLowerCase();
                });

                const task = selectedTask();
                if (task) {
                    task.categoryId = selectedCategoryRecord ? selectedCategoryRecord.id : "";
                    task.category = selectedCategoryRecord ? selectedCategoryRecord.text : categoryName;
                    normalizeTaskState(task);
                }

                state.modal = null;
                showNotification("success", "Exito", "La categoria fue registrada correctamente.");
                render();
                return;
            }

            if (isDuplicateLegacyMessage(response.d)) {
                showNotification("validation", "Validacion", "La categoria ya existe.");
                return;
            }

            console.error("[BL26][Categoria] Guardado rechazado:", response.d);
            showNotification("error", "Error", "No fue posible guardar la categoria.");
        }).catch(function (error) {
            console.error("[BL26][Categoria] Error al guardar:", error);
            showNotification("error", "Error", "No fue posible guardar la categoria.");
        });
    }

    async function saveSubcategoryModal() {
        if (!state.modal || state.modal.type !== "subcategory") {
            return;
        }

        const subcategoryName = (state.modal.name || "").trim();
        if (!subcategoryName) {
            showNotification("validation", "Validacion", "Ingresa un nombre de subcategoria antes de guardar.");
            return;
        }

        const currentSubcategories = getSubcategories();
        if (currentSubcategories.some(function (item) { return item.text.toLowerCase() === subcategoryName.toLowerCase(); })) {
            showNotification("validation", "Validacion", "La subcategoria ya existe.");
            return;
        }

        await runMutation(async function () {
            const response = await persistSubcategory(subcategoryName);
            const result = normalizeLegacyMessage(response.d);
            if (result === "Ok") {
                const reloadedCatalogs = await tryLoadCategoryCatalogs();
                if (!reloadedCatalogs) {
                    await searchSubcategoryRecordsByName(subcategoryName);
                }

                const task = selectedTask();
                if (task) {
                    const selectedSubcategoryRecord = state.subcategoryRecords.find(function (item) {
                        return item.text.toLowerCase() === subcategoryName.toLowerCase();
                    });
                    task.subcategoryId = selectedSubcategoryRecord ? selectedSubcategoryRecord.id : "";
                    task.subcategory = selectedSubcategoryRecord ? selectedSubcategoryRecord.text : subcategoryName;
                    normalizeTaskState(task);
                }

                state.modal = null;
                showNotification("success", "Exito", "La subcategoria quedo creada y seleccionada.");
                render();
                return;
            }

            if (isDuplicateLegacyMessage(response.d)) {
                showNotification("validation", "Validacion", "La subcategoria ya existe.");
                return;
            }

            console.error("[BL26][Subcategoria] Guardado rechazado:", response.d);
            showNotification("error", "Error", "No fue posible guardar la subcategoria.");
        }).catch(function (error) {
            console.error("[BL26][Subcategoria] Error al guardar:", error);
            showNotification("error", "Error", "No fue posible guardar la subcategoria.");
        });
    }

    async function addTask() {
        await runMutation(async function () {
            const list = selectedList();
            if (!list || list.isClosed || list.status === false) {
                return;
            }

            if (!canCreateAnotherTask()) {
                showNotification("attention", "Atencion", "Primero completa la tarea pendiente antes de crear una nueva.");
                return;
            }

            const firstCategory = categories()[0] || null;
            const firstSubcategory = getSubcategories()[0] || null;
            const draftTask = createTask({
                id: `draft-${Date.now()}`,
                name: "Nueva tarea",
                categoryId: firstCategory ? firstCategory.id : "",
                category: firstCategory ? firstCategory.text : "",
                subcategoryId: firstSubcategory ? firstSubcategory.id : "",
                subcategory: firstSubcategory ? firstSubcategory.text : "",
                responseType: "Calificacion",
                notes: "",
                value: 0,
                correctAnswers: [],
                singleOptions: [],
                multipleOptions: [],
                optionsLoaded: true,
                isDraft: true
            });

            list.tasks.unshift(draftTask);
            state.selectedTaskId = draftTask.id;
            state.newOptionText = "";
            state.shouldFocusTaskName = true;
            render();
        });
    }

    async function selectListById(listId) {
        if (!listId || listId === state.selectedListId) {
            return;
        }

        preserveScrollForNextRender();
        state.isSwitchingList = true;
        state.selectedListId = listId;
        state.selectedTaskId = null;
        state.newOptionText = "";
        render();

        try {
            await ensureListDetailsLoaded(listId);
            const list = selectedList();
            state.selectedTaskId = list && list.tasks[0] ? list.tasks[0].id : null;
            if (selectedTask()) {
                await ensureTaskOptionsLoaded(selectedTask());
            }
        } finally {
            state.isSwitchingList = false;
        }

        render();
    }

    async function selectTaskById(taskId) {
        state.selectedTaskId = taskId;
        state.newOptionText = "";
        const task = selectedTask();
        if (task) {
            await ensureTaskOptionsLoaded(task);
        }
        render();
    }

    async function hydrateSelectedListIfNeeded() {
        const list = selectedList();
        if (!list || list.detailsLoaded || state.isSwitchingList) {
            return;
        }

        await ensureListDetailsLoaded(list.id);
        if (!state.selectedTaskId && state.selectedListId) {
            state.selectedTaskId = list.tasks[0] ? list.tasks[0].id : null;
        }
        if (selectedTask()) {
            await ensureTaskOptionsLoaded(selectedTask());
        }
        render();
    }

    function requestToggleListClosed(listId) {
        const list = state.lists.find(function (item) { return item.id === listId; });
        if (!list) {
            return;
        }

        if (list.isClosed) {
            openConfirmation({
                type: "reopen-list",
                listId: list.id,
                title: "Reabrir lista",
                message: "La lista volvera a En edicion y podras modificar su contenido nuevamente.",
                details: [],
                question: "¿Deseas continuar?",
                confirmLabel: "Reabrir lista"
            });
            return;
        }

        openConfirmation({
            type: "close-list",
            listId: list.id,
            title: "Cerrar lista",
            message: "La lista pasara a la seccion Cerradas. Podras consultarla y reabrirla posteriormente.",
            details: [],
            question: "¿Deseas continuar?",
            confirmLabel: "Cerrar lista"
        });
    }

    async function applyListStatusChange(listId, shouldClose) {
        const list = state.lists.find(function (item) { return item.id === listId; });
        if (!list) {
            return;
        }

        if (shouldClose) {
            await ensureListValidationDataLoaded(list);

            if (list.tasks.length === 0) {
                showNotification("validation", "Validacion", "No puedes cerrar una lista que no contiene tareas.");
                return;
            }

            if (list.tasks.some(function (task) { return !isTaskComplete(task); })) {
                showNotification("validation", "Validacion", "No puedes cerrar una lista porque existen tareas incompletas.");
                return;
            }
        }

        await persistList({
            llav: list.id,
            nombre: list.name,
            notas: list.description,
            usaActivos: Boolean(list.usesAssets),
            idTipoActivo: list.usesAssets ? (list.assetTypeId || "") : "",
            isListaCerrada: shouldClose
        });
        clearScheduledSave("question");
        clearScheduledSave("constructor");
        await refreshLists({ listId: list.id });

        const refreshedList = state.lists.find(function (item) { return item.id === list.id; });
        if (!refreshedList || refreshedList.isClosed !== shouldClose || refreshedList.status === false) {
            throw new Error(shouldClose
                ? "No fue posible confirmar el cierre real de la lista."
                : "No fue posible confirmar la reapertura real de la lista.");
        }

        if (shouldClose) {
            showNotification("success", "Listas", "La lista se cerro correctamente y ahora esta disponible en Cerradas.");
        } else {
            showNotification("success", "Listas", "La lista fue reabierta y ya puedes seguir editandola.");
        }
    }

    async function confirmAction() {
        const confirmation = state.confirmation;
        if (!confirmation) {
            return;
        }

        state.confirmation = null;
        render();

        await runMutation(async function () {
            if (confirmation.type === "delete-list") {
                await deleteListById(confirmation.listId);
                state.selectedListId = confirmation.listId;
                state.selectedTaskId = null;
                state.listFilter = "deleted";
                await refreshLists({ listId: confirmation.listId, resetTaskSelection: true });
                showNotification("success", "Listas", "La lista fue dada de baja y ahora aparece en Eliminadas.");
                return;
            }

            if (confirmation.type === "delete-task") {
                const currentList = selectedList();
                if (state.selectedTaskId === confirmation.taskId) {
                    state.selectedTaskId = null;
                }
                if (currentList) {
                    const draftIndex = currentList.tasks.findIndex(function (item) {
                        return item.id === confirmation.taskId && isDraftTask(item);
                    });
                    if (draftIndex >= 0) {
                        currentList.tasks.splice(draftIndex, 1);
                        ensureSelectedReferences();
                        render();
                        return;
                    }
                }
                await deleteTaskById(confirmation.taskId);
                if (currentList) {
                    currentList.tasks = currentList.tasks.filter(function (item) {
                        return item.id !== confirmation.taskId;
                    });
                    ensureSelectedReferences();
                    render();
                }
                return;
            }

            if (confirmation.type === "close-list") {
                await applyListStatusChange(confirmation.listId, true);
                return;
            }

            if (confirmation.type === "reopen-list") {
                await applyListStatusChange(confirmation.listId, false);
                return;
            }

            if (confirmation.type === "change-response-type") {
                const task = selectedTask();
                if (!task) {
                    return;
                }

                if (!isDraftTask(task)) {
                    const optionIds = Object.values(task.optionIdsByValue || {}).filter(Boolean);
                    for (const optionId of optionIds) {
                        await deleteOption(optionId);
                    }
                }

                updateResponseType(task, confirmation.responseType, true);
                showNotification("attention", "Atencion", "Las opciones registradas fueron eliminadas por el cambio de tipo.");
                if (isDraftTask(task)) {
                    render();
                    await persistDraftTask(task);
                    return;
                }
                await persistConstructor(task);
                syncTaskSummary(task);
                render();
            }
        });
    }

    async function addOption() {
        const task = selectedTask();
        const optionText = state.newOptionText.trim();
        if (!task || !optionText || isSelectedListClosed()) {
            return;
        }

        const existingOptions = getOptionsForTask(task);
        if (existingOptions.some(function (item) { return item.toLowerCase() === optionText.toLowerCase(); })) {
            return;
        }

        if (isDraftTask(task)) {
            existingOptions.push(optionText);
            state.newOptionText = "";
            render();
            await runMutation(async function () {
                await persistDraftTask(task);
            });
            return;
        }

        await runMutation(async function () {
            await persistOption(task, optionText);
            state.newOptionText = "";
            task.optionsLoaded = false;
            await ensureTaskOptionsLoaded(task);
            render();
        });
    }

    async function removeOption(optionText) {
        const task = selectedTask();
        if (!task || isSelectedListClosed()) {
            return;
        }

        if (isDraftTask(task)) {
            const currentOptions = getOptionsForTask(task);
            const optionIndex = currentOptions.findIndex(function (item) { return item === optionText; });
            if (optionIndex >= 0) {
                currentOptions.splice(optionIndex, 1);
                task.correctAnswers = task.correctAnswers.filter(function (item) { return item !== optionText; });
                render();
            }
            return;
        }

        const optionId = task.optionIdsByValue[optionText];
        if (!optionId) {
            return;
        }

        await runMutation(async function () {
            await deleteOption(optionId);
            task.optionsLoaded = false;
            await ensureTaskOptionsLoaded(task);
            task.correctAnswers = task.correctAnswers.filter(function (item) { return item !== optionText; });
            await persistConstructor(task);
            render();
        });
    }

    function handleAsyncError(error) {
        const message = error && error.message ? error.message : "Ocurrio un error al procesar la solicitud.";
        showNotification("validation", "Validacion", message);
    }

    function syncTaskSummary(task) {
        const list = selectedList();
        if (!list || !task) {
            return;
        }

        const current = list.tasks.find(function (item) { return item.id === task.id; });
        if (current) {
            current.name = task.name;
            current.responseType = task.responseType;
            current.category = task.category;
            current.subcategory = task.subcategory;
            current.notes = task.notes;
            current.value = task.value;
            current.correctAnswers = [...task.correctAnswers];
        }
    }

    function scheduleQuestionSave(task) {
        syncTaskSummary(task);
        scheduleSave("question", async function () {
            const list = selectedList();
            if (!list || !task) {
                return;
            }

            if (isDraftTask(task)) {
                await persistDraftTask(task);
                return;
            }

            const ids = await ensureServerCategoryIds(task);
            await persistQuestion({
                llav: task.id,
                idLista: list.id,
                nombre: task.name,
                idCategoria: ids.categoryId,
                idSubcategoria: ids.subcategoryId
            });
            syncTaskSummary(task);
        });
    }

    function scheduleConstructorSave(task) {
        syncTaskSummary(task);
        scheduleSave("constructor", async function () {
            if (isDraftTask(task)) {
                await persistDraftTask(task);
                return;
            }
            await persistConstructor(task);
            syncTaskSummary(task);
        });
    }

    function renderNotification() {
        if (!state.notification) {
            return "";
        }

        const icon = state.notification.kind === "success" ? "✓" : "!";
        return `
            <div class="notification-shell">
                <article class="notification-card notification-${escapeHtml(state.notification.kind)}">
                    <div class="notification-accent"></div>
                    <div class="notification-icon" aria-hidden="true">${icon}</div>
                    <div class="notification-content">
                        <strong>${escapeHtml(state.notification.title)}</strong>
                        <p>${escapeHtml(state.notification.message)}</p>
                    </div>
                    <button type="button" class="notification-close" data-action="dismiss-notification">×</button>
                </article>
            </div>
        `;
    }

    function renderTypeSpecificAnswer(task) {
        if (!task) {
            return "";
        }

        const options = getOptionsForTask(task);
        const singleAnswer = escapeHtml(task.correctAnswers[0] || "");

        switch (task.responseType) {
            case "Calificacion":
                return `<div class="rating-row">${[1, 2, 3, 4, 5].map(function (value) {
                    return `
                        <button type="button" class="star-button ${task.correctAnswers.includes(String(value)) ? "is-active" : ""}" data-action="set-rating-answer" data-value="${value}" ${isSelectedListClosed() ? "disabled" : ""}>★</button>
                    `;
                }).join("")}</div>`;
            case "Opcion simple":
                return `
                    <select data-field="single-correct-answer" ${isSelectedListClosed() || options.length === 0 ? "disabled" : ""}>
                        <option value="">Selecciona una opcion</option>
                        ${options.map(function (option) {
                            return `<option value="${escapeHtml(option)}" ${task.correctAnswers[0] === option ? "selected" : ""}>${escapeHtml(option)}</option>`;
                        }).join("")}
                    </select>
                `;
            case "Opcion multiple":
                return options.length === 0
                    ? `<div class="empty-state compact-empty"><span>Primero agrega opciones.</span></div>`
                    : `<div class="multi-answer-list">${options.map(function (option) {
                        return `
                            <label class="checkbox-row">
                                <input type="checkbox" data-field="multi-correct-answer" data-option="${escapeHtml(option)}" ${task.correctAnswers.includes(option) ? "checked" : ""} ${isSelectedListClosed() ? "disabled" : ""} />
                                <span>${escapeHtml(option)}</span>
                            </label>`;
                    }).join("")}</div>`;
            case "Texto":
                return `<input value="${singleAnswer}" data-field="text-correct-answer" ${isSelectedListClosed() ? "disabled" : ""} />`;
            case "Numeros":
                return `<input type="number" value="${singleAnswer}" data-field="number-correct-answer" ${isSelectedListClosed() ? "disabled" : ""} />`;
            case "Fecha":
                return `<input type="date" value="${singleAnswer}" data-field="date-correct-answer" ${isSelectedListClosed() ? "disabled" : ""} />`;
            case "Fecha y hora":
                return `<input type="datetime-local" value="${singleAnswer}" data-field="datetime-correct-answer" ${isSelectedListClosed() ? "disabled" : ""} />`;
            case "Hora":
                return `<input type="time" value="${singleAnswer}" data-field="time-correct-answer" ${isSelectedListClosed() ? "disabled" : ""} />`;
            default:
                return "";
        }
    }

    function renderPreview(task) {
        if (!task) {
            return `
                <div class="mobile-question">
                    <strong>Selecciona una tarea</strong>
                    <span>La vista previa aparece aqui.</span>
                </div>
            `;
        }

        const preview = task.previewResponse;
        const options = getOptionsForTask(task);
        const isReadonly = isSelectedListClosed();
        let control = "";

        switch (task.responseType) {
            case "Calificacion":
                control = `<div class="preview-control-shell"><div class="preview-rating">${[1, 2, 3, 4, 5].map(function (value) {
                    return `
                        <button type="button" class="preview-star-button ${preview.rating >= value ? "is-active" : ""}" data-action="preview-rating" data-value="${value}" ${isReadonly ? "disabled" : ""}>★</button>
                    `;
                }).join("")}</div></div>`;
                break;
            case "Opcion simple":
                control = options.length === 0
                    ? `<div class="preview-empty-state">No hay opciones configuradas.</div>`
                    : `<div class="preview-list">${options.map(function (option) {
                        return `
                            <label class="preview-choice is-interactive ${preview.singleOption === option ? "is-selected" : ""}">
                                <input type="radio" name="preview-single-${escapeHtml(task.id)}" data-action="preview-single-option" data-option="${escapeHtml(option)}" ${preview.singleOption === option ? "checked" : ""} ${isReadonly ? "disabled" : ""} />
                                <span>${escapeHtml(option)}</span>
                            </label>`;
                    }).join("")}</div>`;
                break;
            case "Opcion multiple":
                control = options.length === 0
                    ? `<div class="preview-empty-state">No hay opciones configuradas.</div>`
                    : `<div class="preview-list">${options.map(function (option) {
                        return `
                            <label class="preview-choice is-interactive ${preview.multiOptions.includes(option) ? "is-selected" : ""}">
                                <input type="checkbox" data-action="preview-multi-option" data-option="${escapeHtml(option)}" ${preview.multiOptions.includes(option) ? "checked" : ""} ${isReadonly ? "disabled" : ""} />
                                <span>${escapeHtml(option)}</span>
                            </label>`;
                    }).join("")}</div>`;
                break;
            case "Texto":
                control = `<div class="preview-control-shell"><label class="preview-input-label"><span class="sr-only">Respuesta de texto simulada</span><input class="preview-native-input" data-field="preview-text" value="${escapeHtml(preview.text)}" placeholder="Escribe tu respuesta" ${isReadonly ? "disabled" : ""} /></label></div>`;
                break;
            case "Numeros":
                control = `<div class="preview-control-shell"><label class="preview-input-label"><span class="sr-only">Respuesta numerica simulada</span><input class="preview-native-input" type="number" data-field="preview-number" value="${escapeHtml(preview.number)}" placeholder="0" ${isReadonly ? "disabled" : ""} /></label></div>`;
                break;
            case "Fecha":
                control = `<div class="preview-control-shell"><label class="preview-input-label preview-picker-label"><span aria-hidden="true">📅</span><span class="sr-only">Fecha simulada</span><input class="preview-native-input" type="date" data-field="preview-date" value="${escapeHtml(preview.date)}" ${isReadonly ? "disabled" : ""} /></label></div>`;
                break;
            case "Fecha y hora":
                control = `<div class="preview-control-shell"><label class="preview-input-label preview-picker-label"><span aria-hidden="true">🗓</span><span class="sr-only">Fecha y hora simulada</span><input class="preview-native-input" type="datetime-local" data-field="preview-datetime" value="${escapeHtml(preview.dateTime)}" ${isReadonly ? "disabled" : ""} /></label></div>`;
                break;
            case "Hora":
                control = `<div class="preview-control-shell"><label class="preview-input-label preview-picker-label"><span aria-hidden="true">🕒</span><span class="sr-only">Hora simulada</span><input class="preview-native-input" type="time" data-field="preview-time" value="${escapeHtml(preview.time)}" ${isReadonly ? "disabled" : ""} /></label></div>`;
                break;
        }

        return `
            <div class="mobile-question">
                <strong>${escapeHtml(task.name)}</strong>
                <span>${escapeHtml(task.category)} / ${escapeHtml(task.subcategory)}</span>
            </div>
            ${control}
        `;
    }

    function renderModal() {
        if (!state.modal) {
            return "";
        }

        if (state.modal.type === "list") {
            const modalAssetTypes = getAssetTypeOptionsForSelection(state.modal);
            return `
                <div class="modal-overlay" data-action="close-modal-overlay">
                    <div class="modal-card" data-stop-click="true">
                        <div class="modal-header">
                            <h3>${state.modal.mode === "edit" ? "Editar lista" : "Agregar lista"}</h3>
                            <button type="button" class="modal-close" data-action="close-modal">×</button>
                        </div>
                        <div class="modal-form">
                            <label><span>Nombre</span><input data-modal-field="name" value="${escapeHtml(state.modal.name)}" /></label>
                            <label><span>Descripcion u objetivo</span><textarea rows="4" data-modal-field="description">${escapeHtml(state.modal.description)}</textarea></label>
                            <label>
                                <span>¿Usa Activos?</span>
                                <select data-modal-field="usesAssets">
                                    <option value="false" ${state.modal.usesAssets ? "" : "selected"}>No</option>
                                    <option value="true" ${state.modal.usesAssets ? "selected" : ""}>Sí</option>
                                </select>
                            </label>
                            <label class="${state.modal.usesAssets ? "" : "is-disabled"}">
                                <span>Tipo de Activo</span>
                                <select data-modal-field="assetTypeId" ${state.modal.usesAssets ? "" : "disabled"}>
                                    ${modalAssetTypes.map(function (item) {
                                        return `<option value="${escapeHtml(item.id)}" ${state.modal.assetTypeId === item.id ? "selected" : ""}>${escapeHtml(item.label || item.text)}</option>`;
                                    }).join("")}
                                </select>
                            </label>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="secondary-button" data-action="save-modal">Guardar</button>
                            <button type="button" class="ghost-button" data-action="close-modal">Cancelar</button>
                        </div>
                    </div>
                </div>`;
        }

        if (state.modal.type === "task") {
            const modalCategories = getCategoryOptionsForSelection(state.modal);
            const modalSubcategories = getSubcategoryOptionsForSelection(state.modal);
            return `
                <div class="modal-overlay" data-action="close-modal-overlay">
                    <div class="modal-card" data-stop-click="true">
                        <div class="modal-header">
                            <h3>Editar tarea</h3>
                            <button type="button" class="modal-close" data-action="close-modal">×</button>
                        </div>
                        <div class="modal-form">
                            <label><span>Nombre</span><input data-modal-field="name" value="${escapeHtml(state.modal.name)}" /></label>
                            <label><span>Categoria</span><select data-modal-field="categoryId">${modalCategories.map(function (item) {
                                return `<option value="${escapeHtml(item.id)}" ${state.modal.categoryId === item.id ? "selected" : ""}>${escapeHtml(item.label || item.text)}</option>`;
                            }).join("")}</select></label>
                            <label><span>Subcategoria</span><select data-modal-field="subcategoryId">${modalSubcategories.map(function (item) {
                                return `<option value="${escapeHtml(item.id)}" ${state.modal.subcategoryId === item.id ? "selected" : ""}>${escapeHtml(item.label || item.text)}</option>`;
                            }).join("")}</select></label>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="secondary-button" data-action="save-modal">Guardar</button>
                            <button type="button" class="ghost-button" data-action="close-modal">Cancelar</button>
                        </div>
                    </div>
                </div>`;
        }

        if (state.modal.type === "category") {
            return `
                <div class="modal-overlay" data-action="close-modal-overlay">
                    <div class="modal-card" data-stop-click="true">
                        <div class="modal-header">
                            <h3>Nueva categoria</h3>
                            <button type="button" class="modal-close" data-action="close-modal">×</button>
                        </div>
                        <div class="modal-form">
                            <label><span>Nombre de la categoria</span><input data-modal-field="name" value="${escapeHtml(state.modal.name)}" /></label>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="secondary-button" data-action="save-modal">Guardar</button>
                            <button type="button" class="ghost-button" data-action="close-modal">Cancelar</button>
                        </div>
                    </div>
                </div>`;
        }

        return `
            <div class="modal-overlay" data-action="close-modal-overlay">
                <div class="modal-card" data-stop-click="true">
                    <div class="modal-header">
                        <h3>Nueva subcategoria</h3>
                        <button type="button" class="modal-close" data-action="close-modal">×</button>
                    </div>
                    <div class="modal-form">
                        <label><span>Categoria actual</span><input value="${escapeHtml(state.modal.category)}" disabled /></label>
                        <label><span>Nombre de la subcategoria</span><input data-modal-field="name" value="${escapeHtml(state.modal.name)}" /></label>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="secondary-button" data-action="save-modal">Guardar</button>
                        <button type="button" class="ghost-button" data-action="close-modal">Cancelar</button>
                    </div>
                </div>
            </div>`;
    }

    function renderConfirmation() {
        if (!state.confirmation) {
            return "";
        }

        return `
            <div class="modal-overlay" data-action="close-confirmation-overlay">
                <div class="modal-card confirm-card" data-stop-click="true">
                    <div class="modal-header">
                        <h3>${escapeHtml(state.confirmation.title)}</h3>
                        <button type="button" class="modal-close" data-action="close-confirmation">×</button>
                    </div>
                    <div class="modal-form">
                        <p class="confirm-copy">${escapeHtml(state.confirmation.message)}</p>
                        ${state.confirmation.details && state.confirmation.details.length ? `<ul class="confirm-list">${state.confirmation.details.map(function (item) { return `<li>${escapeHtml(item)}</li>`; }).join("")}</ul>` : ""}
                        <p class="confirm-copy">${escapeHtml(state.confirmation.question)}</p>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="ghost-button" data-action="close-confirmation">Cancelar</button>
                        <button type="button" class="danger-primary-button" data-action="confirm-action">${escapeHtml(state.confirmation.confirmLabel)}</button>
                    </div>
                </div>
            </div>`;
    }

    function captureFocusState() {
        const active = document.activeElement;
        if (!active || !root.contains(active)) {
            return null;
        }

        const selectorParts = [];
        if (active.getAttribute("data-field")) {
            selectorParts.push(`[data-field="${active.getAttribute("data-field")}"]`);
        }
        if (active.getAttribute("data-modal-field")) {
            selectorParts.push(`[data-modal-field="${active.getAttribute("data-modal-field")}"]`);
        }
        if (active.id) {
            selectorParts.push(`#${active.id}`);
        }

        if (selectorParts.length === 0) {
            return null;
        }

        return {
            selector: selectorParts.join(","),
            start: typeof active.selectionStart === "number" ? active.selectionStart : null,
            end: typeof active.selectionEnd === "number" ? active.selectionEnd : null
        };
    }

    function restoreFocusState(focusState) {
        if (!focusState) {
            return;
        }

        const target = root.querySelector(focusState.selector);
        if (!target) {
            return;
        }

        target.focus();
        if (focusState.start !== null && typeof target.setSelectionRange === "function") {
            target.setSelectionRange(focusState.start, focusState.end ?? focusState.start);
        }
    }

    function captureScrollState() {
        return {
            regions: Array.from(root.querySelectorAll(".scroll-region")).map(function (element) {
                return element.scrollTop;
            }),
            windowX: window.scrollX,
            windowY: window.scrollY
        };
    }

    function preserveScrollForNextRender() {
        if (!state.preservedScrollState) {
            state.preservedScrollState = captureScrollState();
        }
    }

    function restoreScrollState(scrollState) {
        if (!scrollState) {
            return;
        }

        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                Array.from(root.querySelectorAll(".scroll-region")).forEach(function (element, index) {
                    if (typeof scrollState.regions[index] === "number") {
                        if (typeof element.scrollTo === "function") {
                            element.scrollTo(0, scrollState.regions[index]);
                        } else {
                            element.scrollTop = scrollState.regions[index];
                        }
                    }
                });

                window.scrollTo(scrollState.windowX || 0, scrollState.windowY || 0);
            });
        });
    }

    function render() {
        const focusState = captureFocusState();
        const scrollState = state.preservedScrollState || captureScrollState();
        ensureSelectedReferences();
        const visibleLists = getVisibleLists();
        syncSelectionWithVisibleLists(visibleLists);
        ensureSelectedReferences();
        const list = selectedList();
        const task = selectedTask();
        const taskOptions = getOptionsForTask(task);
        const taskCategoryOptions = task ? getCategoryOptionsForSelection(task) : [];
        const taskSubcategoryOptions = task ? getSubcategoryOptionsForSelection(task) : [];
        const isListLoading = state.listLoadState === "loading";
        const counters = getListCounters();
        const listCountLabel = isListLoading ? "Cargando..." : `${visibleLists.length} lista(s) visibles`;
        const taskCountLabel = isListLoading ? "Cargando..." : `${list ? getListTaskCount(list) : 0} tarea(s)`;
        const canWrite = state.canWrite && !state.isBusy && !isListLoading;
        const hasSearchTerm = Boolean(String(state.listSearchTerm || "").trim());
        const activeFilterLabel = state.listFilter === "closed"
            ? "Cerradas"
            : state.listFilter === "deleted"
                ? "Eliminadas"
            : state.listFilter === "all"
                ? "Todas"
                : "En edicion";

        root.innerHTML = `
            <div class="bl26-creator-host">
                <div class="mockup-page">
                    <header class="mockup-header">
                        <div>
                            <h1>Crear lista</h1>
                            <p class="mockup-copy">Organiza listas, tareas y tipos de respuesta en una sola pantalla.</p>
                        </div>
                        <div class="mockup-header-fields">
                            <div class="header-card">
                                <span>Nombre de la lista</span>
                                <strong>${escapeHtml(list ? list.name : (isListLoading ? "Cargando listas..." : "Sin lista seleccionada"))}</strong>
                            </div>
                            <div class="header-card">
                                <span>Descripcion u objetivo</span>
                                <p>${escapeHtml(list ? list.description : (isListLoading ? "Estamos recuperando la configuración del creador." : "Selecciona una lista o crea una nueva."))}</p>
                            </div>
                        </div>
                    </header>
                    ${renderNotification()}
                    <div class="mockup-layout">
                        <aside class="mockup-panel left-panel">
                            <div class="mockup-panel-header">
                                <div>
                                    <p class="mockup-kicker">Panel izquierdo</p>
                                    <h2>Listas y tareas</h2>
                                </div>
                            </div>
                            <div class="list-section">
                                <div class="section-heading">
                                    <div class="section-meta">
                                        <span>Listas</span>
                                        <small>${listCountLabel}</small>
                                    </div>
                                </div>
                                <div class="list-toolbar">
                                    <label class="search-field" for="list-search-input">
                                        <span class="sr-only">Buscar listas</span>
                                        <input id="list-search-input" type="search" data-field="list-search" placeholder="Buscar listas" value="${escapeHtml(state.listSearchTerm)}" ${isListLoading ? "disabled" : ""} />
                                    </label>
                                    <div class="filter-chip-row" role="tablist" aria-label="Filtros de listas">
                                        <button type="button" class="filter-chip ${state.listFilter === "editing" ? "is-active" : ""}" data-action="set-list-filter" data-value="editing" ${isListLoading ? "disabled" : ""}>En edicion <span>${isListLoading ? "..." : counters.editing}</span></button>
                                        <button type="button" class="filter-chip ${state.listFilter === "closed" ? "is-active" : ""}" data-action="set-list-filter" data-value="closed" ${isListLoading ? "disabled" : ""}>Cerradas <span>${isListLoading ? "..." : counters.closed}</span></button>
                                        <button type="button" class="filter-chip ${state.listFilter === "deleted" ? "is-active" : ""}" data-action="set-list-filter" data-value="deleted" ${isListLoading ? "disabled" : ""}>Eliminadas <span>${isListLoading ? "..." : counters.deleted}</span></button>
                                        <button type="button" class="filter-chip ${state.listFilter === "all" ? "is-active" : ""}" data-action="set-list-filter" data-value="all" ${isListLoading ? "disabled" : ""}>Todas <span>${isListLoading ? "..." : counters.total}</span></button>
                                    </div>
                                    <div class="list-toolbar-row">
                                        <label class="sort-field" for="list-sort-select">
                                            <span>Orden</span>
                                            <select id="list-sort-select" data-field="list-sort" ${isListLoading ? "disabled" : ""}>
                                                <option value="name-asc" ${state.listSort === "name-asc" ? "selected" : ""}>Nombre A-Z</option>
                                                <option value="name-desc" ${state.listSort === "name-desc" ? "selected" : ""}>Nombre Z-A</option>
                                            </select>
                                        </label>
                                        ${hasSearchTerm ? `<button type="button" class="ghost-button inline-ghost-button" data-action="clear-list-search">Limpiar</button>` : ""}
                                    </div>
                                </div>
                                <button type="button" class="secondary-button section-primary-button" data-action="open-add-list" ${!canWrite ? "disabled" : ""}>Agregar lista</button>
                                ${state.listLoadState === "loading" ? `
                                    <div class="empty-state loading-state" aria-live="polite">
                                        <div class="loading-inline-spinner" aria-hidden="true"></div>
                                        <strong>Cargando listas...</strong>
                                        <span>Estamos consultando la información real del creador.</span>
                                    </div>` : state.listLoadState === "error" ? `
                                    <div class="empty-state">
                                        <strong>No fue posible cargar las listas</strong>
                                        <span>${escapeHtml(state.listLoadError || "Intenta nuevamente.")}</span>
                                        <button type="button" class="ghost-button retry-button" data-action="retry-load">Reintentar</button>
                                    </div>` : state.lists.length === 0 ? `
                                    <div class="empty-state">
                                        <strong>No hay listas disponibles todavia</strong>
                                        <span>Crea una lista para comenzar.</span>
                                    </div>` : visibleLists.length === 0 ? `
                                    <div class="empty-state">
                                        <strong>${hasSearchTerm ? "No encontramos listas con ese nombre" : state.listFilter === "closed" ? "Aun no hay listas cerradas" : state.listFilter === "deleted" ? "Aun no hay listas eliminadas" : state.listFilter === "editing" ? "No tienes listas en edicion" : "No hay listas disponibles todavia"}</strong>
                                        <span>${hasSearchTerm ? `Prueba con otro nombre o limpia la búsqueda en ${activeFilterLabel}.` : state.listFilter === "closed" ? "Las listas cerradas apareceran aqui cuando completes su cierre." : state.listFilter === "deleted" ? "Las listas con baja logica apareceran aqui." : state.listFilter === "editing" ? "Crea una nueva o revisa tus listas cerradas." : "Ajusta tus filtros o crea una nueva lista."}</span>
                                        ${hasSearchTerm ? `<button type="button" class="ghost-button retry-button" data-action="clear-list-search">Limpiar busqueda</button>` : ""}
                                    </div>` : `
                                    <div class="question-list scroll-region">
                                        ${visibleLists.map(function (item) {
                                            const incompleteTasks = countIncompleteTasks(item);
                                            const statusKey = listStatusKey(item);
                                            const assetLabel = item.usesAssets
                                                ? (item.assetTypeName ? `Usa activos · ${item.assetTypeName}` : "Usa activos · Tipo pendiente")
                                                : "Sin activos";
                                            const taskCount = getListTaskCount(item);
                                            const secondaryLabel = statusKey === "deleted"
                                                ? `${taskCount} tarea(s) conservadas`
                                                : item.isClosed
                                                ? `${taskCount} tarea(s)`
                                                : incompleteTasks === null
                                                    ? `${taskCount} tarea(s)`
                                                    : incompleteTasks > 0
                                                        ? `${incompleteTasks} pendiente(s) por completar`
                                                        : `${taskCount} tarea(s) completas`;
                                            return `
                                                <article class="list-card ${item.id === state.selectedListId ? "is-selected" : ""}">
                                                    <button type="button" class="list-card-main" data-action="select-list" data-id="${escapeHtml(item.id)}">
                                                        <span class="question-badge">Lista</span>
                                                        <span class="status-chip ${statusKey === "deleted" ? "status-deleted" : item.isClosed ? "status-closed" : "status-editing"}">${statusKey === "deleted" ? "Eliminada" : item.isClosed ? "Cerrada" : "En edicion"}</span>
                                                        <strong>${escapeHtml(item.name)}</strong>
                                                        <span>${escapeHtml(assetLabel)}</span>
                                                        <span>${escapeHtml(secondaryLabel)}</span>
                                                    </button>
                                                    <div class="list-card-actions">
                                                        ${statusKey === "editing" ? `<button type="button" class="mini-icon-button" title="Editar lista" aria-label="Editar lista" data-action="edit-list" data-id="${escapeHtml(item.id)}" ${!canWrite ? "disabled" : ""}>✎</button>` : ""}
                                                        ${statusKey === "editing" ? `<button type="button" class="mini-icon-button warning-button" title="Cerrar lista" aria-label="Cerrar lista" data-action="request-toggle-list" data-id="${escapeHtml(item.id)}" ${!canWrite ? "disabled" : ""}>✓</button>` : ""}
                                                        ${statusKey === "deleted" ? "" : `<button type="button" class="mini-icon-button danger-button" title="Eliminar lista" data-action="request-delete-list" data-id="${escapeHtml(item.id)}" ${!canWrite ? "disabled" : ""}>🗑</button>`}
                                                    </div>
                                                </article>`;
                                        }).join("")}
                                    </div>`}
                            </div>
                            <div class="selection-section">
                                <div class="section-heading">
                                    <div class="section-meta">
                                        <span>Lista seleccionada</span>
                                        <small>${list ? listStatusLabel(list) : "Sin lista seleccionada"}</small>
                                    </div>
                                </div>
                                ${!list ? `
                                    <div class="empty-state compact-empty">
                                        <strong>Sin selección</strong>
                                        <span>Elige una lista para revisar sus tareas y acciones disponibles.</span>
                                    </div>` : `
                                    <article class="selection-summary-card">
                                        <strong>${escapeHtml(list.name)}</strong>
                                        <span>${escapeHtml(list.description || "Sin descripción")}</span>
                                        <small>${escapeHtml(list.usesAssets ? (list.assetTypeName ? `Usa activos · ${list.assetTypeName}` : "Usa activos · Tipo pendiente") : "Sin activos")}</small>
                                    </article>`}
                            </div>
                            <div class="task-section">
                                <div class="section-heading">
                                    <div class="section-meta">
                                        <span>Tareas de la lista seleccionada</span>
                                        <small>${taskCountLabel}</small>
                                    </div>
                                </div>
                                ${list && (list.isClosed || list.status === false) ? "" : `<button type="button" class="secondary-button section-primary-button" data-action="add-task" ${!list || !canWrite || isListLoading ? "disabled" : ""}>Agregar tarea</button>`}
                                ${state.listLoadState === "loading" ? `
                                    <div class="empty-state loading-state" aria-live="polite">
                                        <div class="loading-inline-spinner" aria-hidden="true"></div>
                                        <strong>Cargando tareas...</strong>
                                        <span>La lista seleccionable aparecerá cuando termine la consulta.</span>
                                    </div>` : !list ? `
                                    <div class="empty-state">
                                        <strong>Selecciona una lista o crea una nueva.</strong>
                                        <span>Las tareas aparecen cuando eliges una lista.</span>
                                    </div>` : (!list.detailsLoaded || state.isSwitchingList) ? `
                                    <div class="empty-state loading-state" aria-live="polite">
                                        <div class="loading-inline-spinner" aria-hidden="true"></div>
                                        <strong>Cargando tareas...</strong>
                                        <span>Estamos recuperando la configuración completa de esta lista.</span>
                                    </div>` : list.tasks.length === 0 ? `
                                    <div class="empty-state">
                                        <strong>Sin tareas</strong>
                                        <span>Agrega la primera tarea para configurar su respuesta.</span>
                                    </div>` : `
                                    <div class="question-list compact-list scroll-region">
                                        ${task ? `<div class="task-section-hint"><strong>${escapeHtml(task.name)}</strong><span>Selecciona una tarjeta para editarla en el panel central.</span></div>` : ""}
                                        ${list.tasks.map(function (item) {
                                            return `
                                                <article class="task-list-card ${item.id === state.selectedTaskId ? "is-selected" : ""}">
                                                    <button type="button" class="question-list-item ${item.id === state.selectedTaskId ? "is-selected" : ""}" data-action="select-task" data-id="${escapeHtml(item.id)}">
                                                        <span class="question-badge task-badge">Tarea</span>
                                                        <strong>${escapeHtml(item.name)}</strong>
                                                        <span>${escapeHtml(item.responseType)}</span>
                                                    </button>
                                                    <div class="task-card-actions">
                                                        ${isSelectedListClosed() ? "" : `<button type="button" class="mini-icon-button danger-button task-delete-button" title="Eliminar tarea" aria-label="Eliminar tarea" data-action="request-delete-task" data-id="${escapeHtml(item.id)}" ${!canWrite ? "disabled" : ""}>🗑</button>`}
                                                    </div>
                                                </article>`;
                                        }).join("")}
                                    </div>`}
                            </div>
                        </aside>
                        <section class="mockup-panel">
                            <div class="mockup-panel-header">
                                <div>
                                    <p class="mockup-kicker">Zona central</p>
                                    <h2>Configuracion de tarea</h2>
                                </div>
                            </div>
                            ${!list ? `<div class="empty-state large-empty"><strong>Selecciona una lista o crea una nueva.</strong><span>El editor se cargará cuando elijas una lista.</span></div>` :
                            !task ? `<div class="empty-state large-empty"><strong>Sin tarea seleccionada</strong><span>Agrega o selecciona una tarea para configurar su tipo de respuesta.</span></div>` :
                            `<div>
                                ${list && list.status === false ? `<div class="editor-banner"><div><strong>Lista eliminada</strong><p>Esta lista tiene baja logica. Su contenido se conserva solo para consulta e historial.</p></div></div>` : isSelectedListClosed() ? `<div class="editor-banner"><div><strong>Lista cerrada</strong><p>Esta lista esta cerrada. Puedes consultarla y reabrirla cuando necesites seguir editandola.</p></div><button type="button" class="ghost-button inline-ghost-button" data-action="request-toggle-list" data-id="${escapeHtml(list.id)}" ${!canWrite ? "disabled" : ""}>Reabrir lista</button></div>` : ""}
                                <div class="question-form">
                                    <div class="editor-top-row">
                                        <label>
                                            <span>Nombre de la tarea</span>
                                            <input value="${escapeHtml(task.name)}" data-field="task-name" ${isSelectedListClosed() || !canWrite ? "disabled" : ""} />
                                        </label>
                                        <div>
                                            <span class="field-label">Tipo de respuesta</span>
                                            <div class="type-grid top-type-grid">
                                                ${responseTypes.map(function (item) {
                                                    return `
                                                        <button type="button" class="type-card ${task.responseType === item ? "is-active" : ""}" data-action="change-response-type" data-value="${escapeHtml(item)}" ${isSelectedListClosed() || !canWrite ? "disabled" : ""}>
                                                            <span class="type-card-icon">${responseTypeIcon(item)}</span>
                                                            <strong>${escapeHtml(item)}</strong>
                                                        </button>`;
                                                }).join("")}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-split">
                                        <div class="field-with-action">
                                            <label for="task-category-select">Categoria</label>
                                            <div class="field-control-row">
                                                <select id="task-category-select" data-field="task-category" ${isSelectedListClosed() || !canWrite ? "disabled" : ""}>
                                                    ${taskCategoryOptions.map(function (item) {
                                                        return `<option value="${escapeHtml(item.id)}" ${task.categoryId === item.id ? "selected" : ""}>${escapeHtml(item.label || item.text)}</option>`;
                                                    }).join("")}
                                                </select>
                                                <button type="button" class="field-action-button" data-action="open-category-modal" ${isSelectedListClosed() || !canWrite ? "disabled" : ""}>+</button>
                                            </div>
                                        </div>
                                        <div class="field-with-action">
                                            <label for="task-subcategory-select">Subcategoria</label>
                                            <div class="field-control-row">
                                                <select id="task-subcategory-select" data-field="task-subcategory" ${isSelectedListClosed() || !canWrite ? "disabled" : ""}>
                                                    ${taskSubcategoryOptions.map(function (item) {
                                                        return `<option value="${escapeHtml(item.id)}" ${task.subcategoryId === item.id ? "selected" : ""}>${escapeHtml(item.label || item.text)}</option>`;
                                                    }).join("")}
                                                </select>
                                                <button type="button" class="field-action-button" data-action="open-subcategory-modal" ${isSelectedListClosed() || !canWrite ? "disabled" : ""}>+</button>
                                            </div>
                                        </div>
                                    </div>
                                    ${supportsOptions(task) ? `
                                        <div class="options-editor">
                                            <div class="section-heading">
                                                <span>Opciones</span>
                                                <small>${taskOptions.length} opcion(es)</small>
                                            </div>
                                            <div class="option-input-row">
                                                <input value="${escapeHtml(state.newOptionText)}" data-field="new-option" placeholder="Agregar opcion" ${isSelectedListClosed() || !canWrite ? "disabled" : ""} />
                                                <button type="button" class="ghost-button" data-action="add-option" ${isSelectedListClosed() || !canWrite ? "disabled" : ""}>Agregar</button>
                                            </div>
                                            ${taskOptions.length === 0 ? `<div class="empty-state compact-empty"><span>Agrega opciones para completar este tipo de respuesta.</span></div>` :
                                                `<div class="option-list">${taskOptions.map(function (item) {
                                                    return `
                                                        <div class="option-item">
                                                            <span>${escapeHtml(item)}</span>
                                                            <button type="button" class="icon-button" data-action="remove-option" data-option="${escapeHtml(item)}" ${isSelectedListClosed() || !canWrite ? "disabled" : ""}>Quitar</button>
                                                        </div>`;
                                                }).join("")}</div>`}
                                        </div>` : ""}
                                    <label>
                                        <span>Notas</span>
                                        <textarea rows="4" data-field="task-notes" ${isSelectedListClosed() || !canWrite ? "disabled" : ""}>${escapeHtml(task.notes)}</textarea>
                                    </label>
                                    <label>
                                        <span>Valor</span>
                                        <input type="number" min="0" data-field="task-value" value="${escapeHtml(task.value)}" ${isSelectedListClosed() || !canWrite ? "disabled" : ""} />
                                    </label>
                                    <div class="answer-panel">
                                        <span class="field-label">Respuesta correcta (opcional)</span>
                                        ${renderTypeSpecificAnswer(task)}
                                    </div>
                                </div>
                            </div>`}
                        </section>
                        <aside class="mockup-panel">
                            <div class="mockup-panel-header">
                                <div>
                                    <p class="mockup-kicker">Panel derecho</p>
                                    <h2>Vista previa movil</h2>
                                </div>
                            </div>
                            <div class="mobile-preview">
                                <div class="mobile-preview-screen">
                                    <p class="mobile-eyebrow">Lista</p>
                                    <h3>${escapeHtml(list ? list.name : "Nueva lista")}</h3>
                                    <p class="mobile-objective">${escapeHtml(list ? list.description : "Selecciona una lista o crea una nueva.")}</p>
                                    ${list ? renderPreview(task) : `<div class="mobile-question"><strong>Selecciona una lista o crea una nueva.</strong><span>La vista previa aparecerá aquí.</span></div>`}
                                </div>
                            </div>
                        </aside>
                    </div>
                    ${renderModal()}
                    ${renderConfirmation()}
                </div>
            </div>
        `;

        restoreScrollState(scrollState);
        restoreFocusState(focusState);
        if (!state.isSwitchingList) {
            state.preservedScrollState = null;
        }

        if (state.shouldFocusTaskName) {
            window.requestAnimationFrame(function () {
                const taskNameInput = root.querySelector("[data-field='task-name']");
                if (taskNameInput) {
                    taskNameInput.focus();
                    if (typeof taskNameInput.select === "function") {
                        taskNameInput.select();
                    }
                }
                state.shouldFocusTaskName = false;
            });
        }
    }

    root.addEventListener("click", function (event) {
        const actionTarget = event.target.closest("[data-action]");
        const stopTarget = event.target.closest("[data-stop-click='true']");
        if (stopTarget && !actionTarget) {
            return;
        }

        if (!actionTarget) {
            return;
        }

        const action = actionTarget.getAttribute("data-action");
        const id = actionTarget.getAttribute("data-id");
        const value = actionTarget.getAttribute("data-value");
        const option = actionTarget.getAttribute("data-option");

        switch (action) {
            case "dismiss-notification":
                closeNotification();
                break;
            case "open-add-list":
                openListModal("add");
                break;
            case "select-list":
                selectListById(id).catch(handleAsyncError);
                break;
            case "select-task":
                selectTaskById(id).catch(handleAsyncError);
                break;
            case "edit-list":
                openListModal("edit", id);
                break;
            case "request-toggle-list":
                requestToggleListClosed(id);
                break;
            case "request-delete-list":
                openConfirmation({
                    type: "delete-list",
                    listId: id,
                    title: "Eliminar lista",
                    message: "La lista se enviara a Eliminadas mediante baja logica. Sus preguntas e historial se conservaran.",
                    details: [],
                    question: "¿Deseas continuar?",
                    confirmLabel: "Eliminar"
                });
                break;
            case "retry-load":
                refreshLists({}).catch(handleAsyncError);
                break;
            case "set-list-filter":
                state.listFilter = value || "editing";
                render();
                hydrateSelectedListIfNeeded().catch(handleAsyncError);
                break;
            case "clear-list-search":
                state.listSearchTerm = "";
                render();
                hydrateSelectedListIfNeeded().catch(handleAsyncError);
                break;
            case "add-task":
                addTask().catch(handleAsyncError);
                break;
            case "edit-task":
                openTaskModal();
                break;
            case "request-delete-task":
                openConfirmation({
                    type: "delete-task",
                    taskId: id || state.selectedTaskId,
                    title: "Eliminar tarea",
                    message: "La tarea sera eliminada junto con toda su configuracion.",
                    details: ["notas", "valor", "opciones (si aplica)"],
                    question: "¿Deseas continuar?",
                    confirmLabel: "Eliminar"
                });
                break;
            case "change-response-type": {
                const task = selectedTask();
                if (!task || task.responseType === value || isSelectedListClosed()) {
                    break;
                }

                if (supportsOptions(task) && getOptionsForTask(task).length > 0) {
                    openConfirmation({
                        type: "change-response-type",
                        responseType: value,
                        title: "Cambiar tipo de respuesta",
                        message: "Al cambiar el tipo de respuesta se eliminarán las opciones registradas.",
                        details: [],
                        question: "¿Deseas continuar?",
                        confirmLabel: "Aceptar"
                    });
                    break;
                }

                updateResponseType(task, value, false);
                render();
                scheduleConstructorSave(task);
                break;
            }
            case "open-category-modal":
                openCategoryModal();
                break;
            case "open-subcategory-modal":
                openSubcategoryModal();
                break;
            case "add-option":
                addOption().catch(handleAsyncError);
                break;
            case "remove-option":
                removeOption(option).catch(handleAsyncError);
                break;
            case "set-rating-answer": {
                const task = selectedTask();
                if (task && !isSelectedListClosed()) {
                    task.correctAnswers = [String(value)];
                    render();
                    scheduleConstructorSave(task);
                }
                break;
            }
            case "preview-rating": {
                const task = selectedTask();
                if (task) {
                    task.previewResponse.rating = Number(value) || 0;
                    render();
                }
                break;
            }
            case "preview-single-option": {
                const task = selectedTask();
                if (task) {
                    task.previewResponse.singleOption = option;
                    render();
                }
                break;
            }
            case "preview-multi-option": {
                const task = selectedTask();
                if (task) {
                    const exists = task.previewResponse.multiOptions.includes(option);
                    task.previewResponse.multiOptions = exists
                        ? task.previewResponse.multiOptions.filter(function (item) { return item !== option; })
                        : task.previewResponse.multiOptions.concat(option);
                    render();
                }
                break;
            }
            case "close-modal":
                closeModal();
                break;
            case "close-modal-overlay":
                if (event.target === actionTarget) {
                    closeModal();
                }
                break;
            case "save-modal":
                if (state.modal) {
                    if (state.modal.type === "list") {
                        saveListModal().catch(handleAsyncError);
                    } else if (state.modal.type === "task") {
                        saveTaskModal().catch(handleAsyncError);
                    } else if (state.modal.type === "category") {
                        saveCategoryModal().catch(handleAsyncError);
                    } else if (state.modal.type === "subcategory") {
                        saveSubcategoryModal().catch(handleAsyncError);
                    }
                }
                break;
            case "close-confirmation":
                closeConfirmation();
                break;
            case "close-confirmation-overlay":
                if (event.target === actionTarget) {
                    closeConfirmation();
                }
                break;
            case "confirm-action":
                confirmAction().catch(handleAsyncError);
                break;
        }
    });

    root.addEventListener("input", function (event) {
        const field = event.target.getAttribute("data-field");
        const modalField = event.target.getAttribute("data-modal-field");

        if (modalField && state.modal) {
            if (state.modal.type === "list" && modalField === "usesAssets") {
                state.modal.usesAssets = String(event.target.value) === "true";
                if (!state.modal.usesAssets) {
                    state.modal.assetTypeId = "";
                    state.modal.assetTypeName = "";
                }
            } else if (state.modal.type === "list" && modalField === "assetTypeId") {
                state.modal.assetTypeId = event.target.value;
                state.modal.assetTypeName = findAssetTypeTextById(state.modal.assetTypeId, state.modal.assetTypeName || "");
            } else {
                state.modal[modalField] = event.target.value;
            }
            if (state.modal.type === "task" && modalField === "categoryId") {
                state.modal.category = findCategoryTextById(state.modal.categoryId, state.modal.category);
            }
            if (state.modal.type === "task" && modalField === "subcategoryId") {
                state.modal.subcategory = findSubcategoryTextById(state.modal.subcategoryId, state.modal.subcategory);
            }
            render();
            return;
        }

        if (field === "list-search") {
            state.listSearchTerm = event.target.value;
            render();
            hydrateSelectedListIfNeeded().catch(handleAsyncError);
            return;
        }

        const task = selectedTask();
        if (!task) {
            return;
        }

        switch (field) {
            case "task-name":
                task.name = event.target.value;
                syncTaskSummary(task);
                scheduleQuestionSave(task);
                break;
            case "task-notes":
                task.notes = event.target.value;
                scheduleConstructorSave(task);
                break;
            case "task-value":
                task.value = Math.max(0, Number(event.target.value) || 0);
                scheduleConstructorSave(task);
                break;
            case "new-option":
                state.newOptionText = event.target.value;
                break;
            case "text-correct-answer":
            case "number-correct-answer":
            case "date-correct-answer":
            case "datetime-correct-answer":
            case "time-correct-answer":
                task.correctAnswers = event.target.value ? [event.target.value] : [];
                scheduleConstructorSave(task);
                break;
            case "preview-text":
                task.previewResponse.text = event.target.value;
                break;
            case "preview-number":
                task.previewResponse.number = event.target.value;
                break;
            case "preview-date":
                task.previewResponse.date = event.target.value;
                break;
            case "preview-datetime":
                task.previewResponse.dateTime = event.target.value;
                break;
            case "preview-time":
                task.previewResponse.time = event.target.value;
                break;
        }
    });

    root.addEventListener("change", function (event) {
        const field = event.target.getAttribute("data-field");
        const modalField = event.target.getAttribute("data-modal-field");

        if (modalField && state.modal) {
            if (state.modal.type === "list" && modalField === "usesAssets") {
                state.modal.usesAssets = String(event.target.value) === "true";
                if (!state.modal.usesAssets) {
                    state.modal.assetTypeId = "";
                    state.modal.assetTypeName = "";
                }
            } else if (state.modal.type === "list" && modalField === "assetTypeId") {
                state.modal.assetTypeId = event.target.value;
                state.modal.assetTypeName = findAssetTypeTextById(state.modal.assetTypeId, state.modal.assetTypeName || "");
            } else {
                state.modal[modalField] = event.target.value;
            }
            if (state.modal.type === "task" && modalField === "categoryId") {
                state.modal.category = findCategoryTextById(state.modal.categoryId, state.modal.category);
            }
            if (state.modal.type === "task" && modalField === "subcategoryId") {
                state.modal.subcategory = findSubcategoryTextById(state.modal.subcategoryId, state.modal.subcategory);
            }
            render();
            return;
        }

        if (field === "list-sort") {
            state.listSort = event.target.value || "name-asc";
            render();
            hydrateSelectedListIfNeeded().catch(handleAsyncError);
            return;
        }

        const task = selectedTask();
        if (!task) {
            return;
        }

        switch (field) {
            case "task-category":
                task.categoryId = event.target.value;
                task.category = findCategoryTextById(task.categoryId, task.category);
                normalizeTaskState(task);
                render();
                scheduleQuestionSave(task);
                break;
            case "task-subcategory":
                task.subcategoryId = event.target.value;
                task.subcategory = findSubcategoryTextById(task.subcategoryId, task.subcategory);
                normalizeTaskState(task);
                render();
                scheduleQuestionSave(task);
                break;
            case "single-correct-answer":
                task.correctAnswers = event.target.value ? [event.target.value] : [];
                scheduleConstructorSave(task);
                break;
        }

        if (field === "multi-correct-answer") {
            const option = event.target.getAttribute("data-option");
            const exists = task.correctAnswers.includes(option);
            task.correctAnswers = event.target.checked
                ? (exists ? task.correctAnswers : task.correctAnswers.concat(option))
                : task.correctAnswers.filter(function (item) { return item !== option; });
            scheduleConstructorSave(task);
        }
    });

    (async function bootstrap() {
        seedSessionStorageFromFallback();
        render();

        if (!hasSessionContext()) {
            state.isBootstrapping = false;
            console.error("[BL26] No se encontró contexto de sesión para cargar el creador.", getCommonParams());
            showNotification("validation", "Validacion", "No fue posible recuperar la sesión de trabajo. Recarga la página e intenta de nuevo.");
            render();
            return;
        }

        try {
            await initializePermissions();
            await refreshLists({});
            await tryLoadCategoryCatalogs();
            await loadAssetTypeCatalog();
        } catch (error) {
            state.isBootstrapping = false;
            handleAsyncError(error);
        }
    })();
})();
