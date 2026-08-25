(function (window, document, $) {
    "use strict";

    function CatalogModalBridge(options) {
        this.options = Object.assign({
            formSelector: "",
            hiddenIdSelector: "",
            hiddenTypeSelector: "",
            codeSelector: "",
            nameSelector: "",
            descriptionSelector: "",
            appliesSelector: "",
            abbreviationSelector: "",
            decimalsSelector: "",
            descriptionFieldSelector: "",
            appliesFieldSelector: "",
            abbreviationFieldSelector: "",
            decimalsFieldSelector: "",
            kickerSelector: "",
            titleSelector: "",
            saveButtonTextSelector: "",
            infoSelector: "",
            overlaySelector: "",
            overlayTitleSelector: "",
            overlayStatusSelector: "",
            invalidScopeSelector: ""
        }, options || {});
    }

    CatalogModalBridge.prototype.syncFieldLimits = function (config) {
        setMaxLength(this.options.codeSelector, config.codeMax);
        setMaxLength(this.options.nameSelector, config.nameMax);
        setMaxLength(this.options.descriptionSelector, config.descriptionMax || 0);
        setMaxLength(this.options.abbreviationSelector, config.abreviaturaMax || 0);
    };

    CatalogModalBridge.prototype.applyFieldVisibility = function (config) {
        toggleField(this.options.descriptionFieldSelector, !!config.showDescription);
        toggleField(this.options.appliesFieldSelector, !!config.showAplicaA);
        toggleField(this.options.abbreviationFieldSelector, !!config.showAbreviatura);
        toggleField(this.options.decimalsFieldSelector, !!config.showPermiteDecimales);
    };

    CatalogModalBridge.prototype.syncCodeField = function (isEditing, value) {
        const $input = $(this.options.codeSelector);
        $input.prop("readonly", true);
        $input.val(value || "");
        $input.attr("placeholder", isEditing ? "" : "Se generará automáticamente");
    };

    CatalogModalBridge.prototype.buildPayload = function (config, payloadOverrides) {
        const payload = {
            id: normalizeGuid($(this.options.hiddenIdSelector).val()),
            codigo: ($(this.options.codeSelector).val() || "").trim(),
            nombre: ($(this.options.nameSelector).val() || "").trim(),
            descripcion: config.showDescription ? ($(this.options.descriptionSelector).val() || "").trim() : ""
        };

        if (config.showAplicaA) {
            const aplicaA = $(this.options.appliesSelector).val();
            payload.aplicaA = aplicaA === "" ? null : Number(aplicaA);
        }

        if (config.showAbreviatura) {
            payload.abreviatura = ($(this.options.abbreviationSelector).val() || "").trim();
        }

        if (config.showPermiteDecimales) {
            payload.permiteDecimales = $(this.options.decimalsSelector).is(":checked");
        }

        return Object.assign(payload, payloadOverrides || {});
    };

    CatalogModalBridge.prototype.validate = function (config) {
        const payload = this.buildPayload(config);
        const entityName = config.validationEntityName || config.singular || "registro";

        if (!payload.nombre) {
            return { selector: this.options.nameSelector, message: "Captura el nombre" + buildEntitySuffix(entityName) + "." };
        }
        if (payload.nombre.length > config.nameMax) {
            return { selector: this.options.nameSelector, message: "El nombre" + buildEntitySuffix(entityName) + " no puede exceder " + config.nameMax + " caracteres." };
        }
        if (config.showDescription && payload.descripcion.length > (config.descriptionMax || 0)) {
            return { selector: this.options.descriptionSelector, message: "La descripción no puede exceder " + (config.descriptionMax || 0) + " caracteres." };
        }
        if (config.showAplicaA && payload.aplicaA == null) {
            return { selector: this.options.appliesSelector, message: config.appliesRequiredMessage || "Selecciona a qué aplica el registro." };
        }
        if (config.showAbreviatura && !payload.abreviatura) {
            return { selector: this.options.abbreviationSelector, message: config.abbreviationRequiredMessage || "Captura la abreviatura." };
        }
        if (config.showAbreviatura && payload.abreviatura.length > (config.abreviaturaMax || 0)) {
            return { selector: this.options.abbreviationSelector, message: config.abbreviationLengthMessage || ("La abreviatura no puede exceder " + (config.abreviaturaMax || 0) + " caracteres.") };
        }

        return null;
    };

    CatalogModalBridge.prototype.reset = function (config, copy) {
        const form = document.querySelector(this.options.formSelector);
        if (form) {
            form.reset();
        }

        $(this.options.hiddenIdSelector).val("");
        if (this.options.hiddenTypeSelector) {
            $(this.options.hiddenTypeSelector).val("");
        }
        if (this.options.appliesSelector) {
            $(this.options.appliesSelector).val(config.defaultAplicaAValue || "");
        }
        if (this.options.decimalsSelector) {
            $(this.options.decimalsSelector).prop("checked", false);
        }

        this.applyFieldVisibility(config);
        this.syncCodeField(false, "");
        this.setCopy(copy || {});
        this.setStatus("", "");
        this.clearFieldErrors();
    };

    CatalogModalBridge.prototype.setCopy = function (copy) {
        if (this.options.kickerSelector && Object.prototype.hasOwnProperty.call(copy, "kicker")) {
            $(this.options.kickerSelector).text(copy.kicker || "");
        }
        if (this.options.titleSelector && Object.prototype.hasOwnProperty.call(copy, "title")) {
            $(this.options.titleSelector).text(copy.title || "");
        }
        if (this.options.saveButtonTextSelector && Object.prototype.hasOwnProperty.call(copy, "saveButton")) {
            $(this.options.saveButtonTextSelector).text(copy.saveButton || "");
        }
    };

    CatalogModalBridge.prototype.setBusy = function (isBusy, title, status) {
        $(this.options.formSelector).toggleClass("is-saving", !!isBusy);
        if (this.options.overlaySelector) {
            $(this.options.overlaySelector).attr("aria-hidden", isBusy ? "false" : "true");
        }
        if (this.options.overlayTitleSelector) {
            $(this.options.overlayTitleSelector).text(title || "Guardando registro...");
        }
        if (this.options.overlayStatusSelector) {
            $(this.options.overlayStatusSelector).text(status || "Preparando información del catálogo...");
        }
        $(this.options.formSelector).find("input, textarea, select, button").prop("disabled", !!isBusy);
    };

    CatalogModalBridge.prototype.setStatus = function (level, message) {
        const node = document.querySelector(this.options.infoSelector);
        if (!node) {
            return;
        }

        node.className = "checkapp-status-inline";
        if (level) {
            node.classList.add("is-" + level);
        }
        node.textContent = message || "";
    };

    CatalogModalBridge.prototype.markFieldError = function (selector) {
        if (!selector) {
            return;
        }
        const node = document.querySelector(selector);
        if (node) {
            node.classList.add("is-invalid");
        }
    };

    CatalogModalBridge.prototype.clearFieldError = function (selector) {
        if (!selector) {
            return;
        }
        const node = document.querySelector(selector);
        if (node) {
            node.classList.remove("is-invalid");
        }
    };

    CatalogModalBridge.prototype.clearFieldErrors = function () {
        const scope = this.options.invalidScopeSelector || this.options.formSelector;
        document.querySelectorAll(scope + " .is-invalid").forEach(function (node) {
            node.classList.remove("is-invalid");
        });
    };

    function setMaxLength(selector, value) {
        if (!selector) {
            return;
        }
        $(selector).attr("maxlength", value || 0);
    }

    function toggleField(selector, show) {
        if (!selector) {
            return;
        }
        const $field = $(selector);
        $field.prop("hidden", !show);
        $field.toggle(!!show);
    }

    function normalizeGuid(value) {
        const text = String(value || "").trim();
        return text ? text : null;
    }

    function buildEntitySuffix(entityName) {
        return entityName ? " de " + entityName : "";
    }

    window.ProductosServiciosCatalogModalShared = {
        create: function (options) {
            return new CatalogModalBridge(options);
        }
    };
}(window, document, window.jQuery));
