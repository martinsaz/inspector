(function () {
    'use strict';

    const state = {
        loading: false,
        saving: false,
        testing: false,
        hasStoredConfiguration: false,
        passwordConfigured: false,
        verificationToken: '',
        verified: false,
        baselineCoreSignature: '',
        currentConfiguration: null
    };

    const elements = {};

    document.addEventListener('DOMContentLoaded', () => {
        bindElements();
        if (!elements.root) {
            return;
        }

        bindEvents();
        void loadConfiguration();
    });

    function bindElements() {
        elements.root = document.querySelector('[data-mailcfg-page="correo-saliente"]');
        elements.globalStatus = document.getElementById('txMailCfgGlobalStatus');
        elements.estadoChip = document.getElementById('txMailCfgEstadoChip');
        elements.ultimaPrueba = document.getElementById('txMailCfgUltimaPrueba');
        elements.verificationState = document.getElementById('txMailCfgVerificationState');
        elements.cuenta = document.getElementById('txMailCfgCuenta');
        elements.servidor = document.getElementById('txMailCfgServidor');
        elements.contrasena = document.getElementById('txMailCfgContrasena');
        elements.puerto = document.getElementById('txMailCfgPuerto');
        elements.seguridad = document.getElementById('cbMailCfgSeguridad');
        elements.destinatario = document.getElementById('txMailCfgDestinatario');
        elements.passwordHint = document.getElementById('txMailCfgPasswordHint');
        elements.btProbar = document.getElementById('btMailCfgProbar');
        elements.btCancelar = document.getElementById('btMailCfgCancelar');
        elements.btGuardar = document.getElementById('btMailCfgGuardar');
    }

    function bindEvents() {
        [elements.cuenta, elements.servidor, elements.contrasena, elements.puerto, elements.seguridad, elements.destinatario]
            .forEach((element) => {
                if (!element) {
                    return;
                }

                element.addEventListener('input', onCoreConfigurationChanged);
                element.addEventListener('change', onCoreConfigurationChanged);
            });

        elements.btProbar?.addEventListener('click', () => {
            void sendTestEmail();
        });

        elements.btGuardar?.addEventListener('click', () => {
            void saveConfiguration();
        });

        elements.btCancelar?.addEventListener('click', () => {
            window.location.href = '/';
        });
    }

    async function loadConfiguration() {
        state.loading = true;
        updateButtons();
        setStatus('Cargando configuración de correo saliente…');

        try {
            const response = await fetch('/Configuracion/ObtenerCorreoSaliente', {
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                credentials: 'same-origin'
            });

            const payload = await readJson(response);
            if (!response.ok) {
                throw new Error(payload?.mensaje || 'No fue posible consultar la configuración de correo saliente.');
            }

            hydrateForm(payload);
            setStatus(payload?.configuracionGuardada ? 'Configuración cargada correctamente.' : 'No existe una configuración guardada para esta empresa.', payload?.configuracionGuardada ? 'success' : 'warning');
        } catch (error) {
            console.error(error);
            setStatus(error.message || 'No fue posible consultar la configuración de correo saliente.', 'error');
        } finally {
            state.loading = false;
            updateButtons();
        }
    }

    function hydrateForm(payload) {
        const data = payload || {};
        state.currentConfiguration = data;
        state.hasStoredConfiguration = !!data.configuracionGuardada;
        state.passwordConfigured = !!data.passwordConfigurado;
        state.verificationToken = '';
        state.verified = !!data.verificada;

        elements.cuenta.value = data.cuenta || '';
        elements.servidor.value = data.servidorSmtp || '';
        elements.puerto.value = data.puerto || 465;
        elements.seguridad.value = normalizeSecurity(data.seguridad);
        elements.destinatario.value = data.destinatarioPrueba || '';
        elements.contrasena.value = '';
        elements.passwordHint.textContent = state.passwordConfigured ? 'Contraseña configurada. Déjala vacía para conservarla.' : 'Captura la contraseña de la cuenta remitente.';

        state.baselineCoreSignature = buildCoreSignature();
        renderVerificationState(state.verified, data.fechaUltimaPrueba);
        updateButtons();
    }

    function onCoreConfigurationChanged() {
        const currentSignature = buildCoreSignature();
        const passwordTouched = !!(elements.contrasena.value || '').trim();
        const changed = currentSignature !== state.baselineCoreSignature || passwordTouched;

        if (changed) {
            state.verified = false;
            state.verificationToken = '';
            renderVerificationState(false, null);
        } else if (state.currentConfiguration?.verificada) {
            state.verified = true;
            renderVerificationState(true, state.currentConfiguration.fechaUltimaPrueba);
        }

        updateButtons();
    }

    async function sendTestEmail() {
        state.testing = true;
        updateButtons();
        setStatus('Enviando correo de prueba…');

        try {
            const payload = {
                cuenta: elements.cuenta.value.trim(),
                contrasena: elements.contrasena.value,
                servidorSmtp: elements.servidor.value.trim(),
                puerto: toInteger(elements.puerto.value),
                seguridad: normalizeSecurity(elements.seguridad.value),
                destinatarioPrueba: elements.destinatario.value.trim()
            };

            const response = await fetch('/Configuracion/ProbarCorreoSaliente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload)
            });

            const result = await readJson(response);
            if (!response.ok || !result?.exito) {
                throw new Error(result?.mensaje || 'No fue posible enviar el correo de prueba.');
            }

            state.verificationToken = result.tokenVerificacion || '';
            state.verified = true;
            state.currentConfiguration = result.configuracion || state.currentConfiguration;
            renderVerificationState(true, result.configuracion?.fechaUltimaPrueba);
            setStatus(result.mensaje || 'Correo de prueba enviado correctamente.', 'success');
        } catch (error) {
            state.verificationToken = '';
            state.verified = false;
            renderVerificationState(false, null);
            console.error(error);
            setStatus(error.message || 'No fue posible enviar el correo de prueba.', 'error');
        } finally {
            state.testing = false;
            updateButtons();
        }
    }

    async function saveConfiguration() {
        state.saving = true;
        updateButtons();
        setStatus('Guardando configuración…');

        try {
            const payload = {
                cuenta: elements.cuenta.value.trim(),
                contrasena: elements.contrasena.value,
                servidorSmtp: elements.servidor.value.trim(),
                puerto: toInteger(elements.puerto.value),
                seguridad: normalizeSecurity(elements.seguridad.value),
                destinatarioPrueba: elements.destinatario.value.trim(),
                tokenVerificacion: state.verificationToken
            };

            const response = await fetch('/Configuracion/GuardarCorreoSaliente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload)
            });

            const result = await readJson(response);
            if (!response.ok || !result?.exito) {
                throw new Error(result?.mensaje || 'No fue posible guardar la configuración de correo saliente.');
            }

            hydrateForm(result.configuracion || {});
            state.hasStoredConfiguration = true;
            state.verified = !!result.configuracion?.verificada;
            setStatus(result.mensaje || 'La configuración de correo saliente se guardó correctamente.', 'success');
        } catch (error) {
            console.error(error);
            setStatus(error.message || 'No fue posible guardar la configuración de correo saliente.', 'error');
        } finally {
            state.saving = false;
            updateButtons();
        }
    }

    function renderVerificationState(isVerified, dateValue) {
        const normalizedDate = formatDate(dateValue);
        if (isVerified) {
            elements.estadoChip.textContent = 'Verificada';
            elements.estadoChip.className = 'mailcfg-chip mailcfg-chip--success';
            elements.ultimaPrueba.textContent = normalizedDate ? `Última prueba: ${normalizedDate}` : 'Prueba validada correctamente.';
            elements.verificationState.textContent = 'La configuración está verificada y lista para guardarse o reutilizarse.';
            return;
        }

        elements.estadoChip.textContent = state.hasStoredConfiguration ? 'No verificada' : 'No configurada';
        elements.estadoChip.className = state.hasStoredConfiguration ? 'mailcfg-chip mailcfg-chip--warning' : 'mailcfg-chip mailcfg-chip--muted';
        elements.ultimaPrueba.textContent = normalizedDate ? `Última prueba registrada: ${normalizedDate}` : 'Sin prueba ejecutada.';
        elements.verificationState.textContent = 'Completa la configuración y ejecuta una prueba para habilitar el guardado.';
    }

    function updateButtons() {
        const currentSignature = buildCoreSignature();
        const passwordTouched = !!(elements.contrasena.value || '').trim();
        const coreChanged = currentSignature !== state.baselineCoreSignature || passwordTouched;
        const canSaveVerified = state.verified && !!state.verificationToken;
        const preserveVerified = state.hasStoredConfiguration && !coreChanged && !!state.currentConfiguration?.verificada;

        elements.btProbar.disabled = state.loading || state.testing || state.saving;
        elements.btCancelar.disabled = state.testing || state.saving;
        elements.btGuardar.disabled = state.loading || state.testing || state.saving || !(canSaveVerified || preserveVerified);
    }

    function buildCoreSignature() {
        return [
            elements.cuenta.value.trim().toLowerCase(),
            elements.servidor.value.trim().toLowerCase(),
            String(toInteger(elements.puerto.value)),
            normalizeSecurity(elements.seguridad.value),
            elements.destinatario.value.trim().toLowerCase()
        ].join('|');
    }

    function normalizeSecurity(value) {
        return String(value || '').trim().toUpperCase() === 'STARTTLS' ? 'STARTTLS' : 'SSL/TLS';
    }

    function toInteger(value) {
        const parsed = Number.parseInt(String(value || '').trim(), 10);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function formatDate(value) {
        if (!value) {
            return '';
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return new Intl.DateTimeFormat('es-MX', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    }

    function setStatus(message, tone) {
        elements.globalStatus.textContent = message || '';
        elements.globalStatus.classList.remove('mailcfg-status--success', 'mailcfg-status--error', 'mailcfg-status--warning');

        if (tone === 'success') {
            elements.globalStatus.classList.add('mailcfg-status--success');
        } else if (tone === 'error') {
            elements.globalStatus.classList.add('mailcfg-status--error');
        } else if (tone === 'warning') {
            elements.globalStatus.classList.add('mailcfg-status--warning');
        }
    }

    async function readJson(response) {
        const text = await response.text();
        if (!text) {
            return null;
        }

        try {
            return JSON.parse(text);
        } catch (error) {
            console.error(error);
            throw new Error('La respuesta del servidor no pudo interpretarse.');
        }
    }
})();
