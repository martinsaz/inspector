let permisosOperadores = {
    escritura: false
};
let operadoresDetalleCache = new Map();
const PASSWORD_POLICY = {
    minLength: 8,
    rules: ["length", "uppercase", "lowercase", "digit", "special"]
};
const PASSWORD_STRENGTH_LEVELS = [
    { key: "very-weak", label: "Muy débil", filled: 1 },
    { key: "weak", label: "Débil", filled: 2 },
    { key: "acceptable", label: "Aceptable", filled: 3 },
    { key: "strong", label: "Segura", filled: 4 }
];

let operadoresFormNuevo;
let operadoresFormEditar;
let identidadDualCandidata = null;

document.addEventListener("DOMContentLoaded", () => {
    inicializaOperadores();
    configuraCombos();
    configuraValidaciones();
    configuraEventos();
    cargaOperadores();
});

function inicializaOperadores() {
    $.ajax({
        type: "GET",
        async: true,
        contentType: "application/json; charset=utf-8",
        url: "/Operadores/Inicializa",
        data: {
            idEmpresa: sessionStorage.getItem("idEmpresa"),
            cadena: sessionStorage.getItem("cadenaBase64"),
            empresa: sessionStorage.getItem("empresa")
        },
        dataType: "json",
        success: function (data) {
            permisosOperadores.escritura = !!data.perm && !data.accessDenied;
            if (!permisosOperadores.escritura) {
                $("#btNuevoOperador").hide();
                $("#btVincularOperadorExistente").hide();
            }
        },
        error: function () {
            permisosOperadores.escritura = false;
            $("#btNuevoOperador").hide();
            $("#btVincularOperadorExistente").hide();
        }
    });
}

function configuraCombos() {
    const configBase = {
        minimumInputLength: 0,
        allowClear: true,
        language: {
            noResults: function () { return "Sin resultados"; },
            searching: function () { return "Buscando..."; },
            inputTooShort: function () { return "Escribe para buscar"; }
        }
    };

    $("#cbFiltroSucursal").select2({
        ...configBase,
        placeholder: "Todas",
        ajax: buildSelect2Config("/Operadores/GetSucursales")
    });

    $("#cbSucursalesNuevo").select2({
        ...configBase,
        placeholder: "Selecciona una o varias sucursales",
        closeOnSelect: false,
        dropdownParent: $("#modalNuevoOperador"),
        ajax: buildSelect2Config("/Operadores/GetSucursales")
    });

    $("#cbSucursalesEditar").select2({
        ...configBase,
        placeholder: "Selecciona una o varias sucursales",
        closeOnSelect: false,
        dropdownParent: $("#modalEditarOperador"),
        ajax: buildSelect2Config("/Operadores/GetSucursales")
    });

    $("#cbSucursalesExistente").select2({
        ...configBase,
        placeholder: "Selecciona una o varias sucursales",
        closeOnSelect: false,
        dropdownParent: $("#modalVincularOperador"),
        ajax: buildSelect2Config("/Operadores/GetSucursales")
    });
}

function buildSelect2Config(url) {
    return {
        quietMillis: 150,
        url: url,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: function (valores) {
            return {
                searchTerm: valores.term ? JSON.stringify(valores.term) : JSON.stringify(""),
                idEmpresa: sessionStorage.getItem("idEmpresa"),
                cadena: sessionStorage.getItem("cadenaBase64"),
                empresa: sessionStorage.getItem("empresa"),
                correo: sessionStorage.getItem("correo")
            };
        },
        processResults: function (data) {
            return {
                results: data.d || []
            };
        }
    };
}

function configuraValidaciones() {
    operadoresFormNuevo = FormValidation.formValidation(document.querySelector("#frmOperadorNuevo"), {
        fields: {
            txNombreNuevo: { validators: { notEmpty: { message: "Ingresa el nombre." } } },
            txApellidoPaternoNuevo: { validators: { notEmpty: { message: "Ingresa el apellido paterno." } } },
            txCorreoNuevo: {
                validators: {
                    notEmpty: { message: "Ingresa el correo." },
                    regexp: {
                        regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Ingresa un correo válido."
                    }
                }
            },
            txPasswordNuevo: {
                validators: {
                    notEmpty: { message: "Ingresa la contraseña." },
                    callback: {
                        message: "La contraseña no cumple los requisitos de seguridad.",
                        callback: function (input) {
                            return evaluatePasswordPolicy(input.value).valid;
                        }
                    }
                }
            },
            txPasswordConfirmNuevo: {
                validators: {
                    notEmpty: { message: "Confirma la contraseña." },
                    identical: {
                        compare: function () {
                            return document.querySelector("#txPasswordNuevo").value;
                        },
                        message: "La contraseña y su confirmación no coinciden."
                    }
                }
            }
        },
        plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            bootstrap: new FormValidation.plugins.Bootstrap5({
                rowSelector: ".fv-row",
                eleInvalidClass: "",
                eleValidClass: ""
            })
        }
    });

    operadoresFormEditar = FormValidation.formValidation(document.querySelector("#frmOperadorEditar"), {
        fields: {
            txNombreEditar: { validators: { notEmpty: { message: "Ingresa el nombre." } } },
            txApellidoPaternoEditar: { validators: { notEmpty: { message: "Ingresa el apellido paterno." } } }
        },
        plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            bootstrap: new FormValidation.plugins.Bootstrap5({
                rowSelector: ".fv-row",
                eleInvalidClass: "",
                eleValidClass: ""
            })
        }
    });
}

function configuraEventos() {
    $("#btBuscar").on("click", cargaOperadores);
    $("#btLimpiar").on("click", limpiarFiltros);
    $("#btNuevoOperador").on("click", abrirNuevoOperador);
    $("#btVincularOperadorExistente").on("click", abrirVincularOperador);
    $("#btBuscarIdentidadDual").on("click", buscarIdentidadDual);
    $("#btGuardarOperadorExistente").on("click", guardarOperadorExistente);
    $("#btGuardarOperador").on("click", guardarOperador);
    $("#btActualizarOperador").on("click", actualizarOperador);
    $("#txPasswordNuevo, #txPasswordConfirmNuevo").on("input", handlePasswordInputState);
    $("#txNombreNuevo, #txApellidoPaternoNuevo, #txCorreoNuevo").on("input", syncNuevoOperadorState);
    $("#cbSucursalesNuevo").on("change", syncNuevoOperadorState);
    $("#txCorreoExistente").on("input", syncOperadorExistenteState);
    $("#cbSucursalesExistente").on("change", syncOperadorExistenteState);

    $(".bl26-ops-toggle-visibility").on("click", function () {
        togglePasswordVisibility($(this));
    });

    $("#modalNuevoOperador").on("hidden.bs.modal", function () {
        limpiarModalNuevo();
    });

    $("#modalEditarOperador").on("hidden.bs.modal", function () {
        limpiarModalEditar();
    });

    $("#modalVincularOperador").on("hidden.bs.modal", function () {
        limpiarModalExistente();
    });

    updatePasswordUi();
    syncNuevoOperadorState();
    syncOperadorExistenteState();
}

function cargaOperadores() {
    if ($.fn.DataTable.isDataTable("#grDataOperadores")) {
        $("#grDataOperadores").DataTable().destroy();
    }

    swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {
            const url = `/Operadores/GetDataOperadores?busqueda=${encodeURIComponent($("#txBusqueda").val() || "")}&idSucursal=${encodeURIComponent($("#cbFiltroSucursal").val() || "")}&estado=${encodeURIComponent($("#cbFiltroEstado").val() || "")}&idEmpresa=${encodeURIComponent(sessionStorage.getItem("idEmpresa"))}&cadena=${encodeURIComponent(sessionStorage.getItem("cadenaBase64"))}&empresa=${encodeURIComponent(sessionStorage.getItem("empresa"))}&correo=${encodeURIComponent(sessionStorage.getItem("correo"))}`;
            fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            })
                .then(response => response.json())
                .then(data => {
                    operadoresDetalleCache = new Map();
                    (data.operadores || []).forEach(function (operador) {
                        const detalleNormalizado = normalizeOperadorDetalle(operador);
                        if (detalleNormalizado && detalleNormalizado.idOperador) {
                            operadoresDetalleCache.set(detalleNormalizado.idOperador, detalleNormalizado);
                        }
                    });

                    $("#grDataOperadores").DataTable({
                        data: data.aaData,
                        language: {
                            url: "//cdn.datatables.net/plug-ins/3cfcc339e89/i18n/Spanish.json"
                        },
                        columns: [
                            { data: "0", orderable: false, width: "100px" },
                            { data: "1", className: "text-center" },
                            { data: "2", className: "text-center" },
                            { data: "3", className: "text-center" },
                            {
                                data: "4",
                                className: "text-center",
                                render: function (value) {
                                    return renderEstadoBadge(value);
                                }
                            },
                            { data: "5", className: "text-center" }
                        ],
                        filter: false,
                        pagingType: "simple_numbers",
                        info: true,
                        fnDrawCallback: function () {
                            swal.close();
                        },
                        order: [[1, "asc"]],
                        lengthMenu: [[10, 15, 20, -1], [10, 15, 20, "Todos"]],
                        pageLength: 10,
                        dom: `<'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 dataTables_pager'lp>>`
                    });
                })
                .catch(() => {
                    swal.close();
                    mensajeError("No fue posible cargar el listado de operadores.");
                });
        }
    });
}

function limpiarFiltros() {
    $("#txBusqueda").val("");
    $("#cbFiltroSucursal").val(null).trigger("change");
    $("#cbFiltroEstado").val("");
    cargaOperadores();
}

function abrirNuevoOperador() {
    if (!permisosOperadores.escritura) {
        mensajeError("No tienes permiso para administrar operadores.");
        return;
    }

    limpiarModalNuevo();
    $("#modalNuevoOperador").modal("show");
}

function abrirVincularOperador() {
    if (!permisosOperadores.escritura) {
        mensajeError("No tienes permiso para administrar operadores.");
        return;
    }

    limpiarModalExistente();
    $("#modalVincularOperador").modal("show");
}

function limpiarModalNuevo() {
    $("#txNombreNuevo").val("");
    $("#txApellidoPaternoNuevo").val("");
    $("#txApellidoMaternoNuevo").val("");
    $("#txCorreoNuevo").val("");
    $("#txPasswordNuevo").val("");
    $("#txPasswordConfirmNuevo").val("");
    $("#cbSucursalesNuevo").val(null).trigger("change");
    $("#btGuardarOperador").prop("disabled", true);
    $(".bl26-ops-toggle-visibility").each(function () {
        const $button = $(this);
        const $input = $($button.data("target"));
        if (!$input.length) {
            return;
        }

        $input.attr("type", "password");
        $button.attr("aria-pressed", "false");
        $button.attr("aria-label", buildToggleLabel($input, false));
        $button.find("i").removeClass("fa-eye-slash").addClass("fa-eye");
    });
    updatePasswordUi();
}

function limpiarModalEditar() {
    $("#hdOperadorId").val("");
    $("#hdOperadorVersionRow").val("");
    $("#txNombreEditar").val("");
    $("#txApellidoPaternoEditar").val("");
    $("#txApellidoMaternoEditar").val("");
    $("#txCorreoEditar").val("");
    $("#txEstadoEditar").val("");
    $("#txFechaAltaEditar").val("");
    $("#cbSucursalesEditar").empty().trigger("change");
}

function limpiarModalExistente() {
    identidadDualCandidata = null;
    $("#txCorreoExistente").val("");
    $("#txNombreExistente").val("");
    $("#txCorreoEncontrado").val("");
    $("#txNombreIdentidadDual").text("Sin coincidencia");
    $("#panelIdentidadDual").hide();
    $("#cbSucursalesExistente").val(null).trigger("change");
    $("#hdUsuarioExistenteId").val("");
    $("#hdUsuarioExistenteFirebase").val("");
    $("#btGuardarOperadorExistente").prop("disabled", true);
}

function guardarOperador() {
    operadoresFormNuevo.validate().then(function (status) {
        if (status !== "Valid") {
            mensajeError("Completa los datos requeridos del operador.");
            return;
        }

        const sucursales = $("#cbSucursalesNuevo").val() || [];
        if (!sucursales.length) {
            mensajeError("Selecciona al menos una sucursal.");
            return;
        }

        bloquearProceso(function () {
            $.ajax({
                async: true,
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: "/Operadores/CrearOperador",
                data: JSON.stringify({
                    nombre: $("#txNombreNuevo").val(),
                    apellidoPaterno: $("#txApellidoPaternoNuevo").val(),
                    apellidoMaterno: $("#txApellidoMaternoNuevo").val(),
                    correo: $("#txCorreoNuevo").val(),
                    password: $("#txPasswordNuevo").val(),
                    confirmPassword: $("#txPasswordConfirmNuevo").val(),
                    sucursales: sucursales
                }),
                dataType: "json",
                success: function (data) {
                    swal.close();
                    if (data.d === "El Operador fue registrado. Se envió un correo para verificar su cuenta."
                        || data.d === "El Operador fue registrado, pero no fue posible enviar el correo de verificación. Puedes reenviarlo desde el listado.") {
                        mensajeExito(data.d, function () {
                            $("#modalNuevoOperador").modal("hide");
                            cargaOperadores();
                        });
                        return;
                    }

                    mensajeError(data.d || "No fue posible registrar al operador.");
                },
                error: function () {
                    swal.close();
                    mensajeError("No fue posible registrar al operador.");
                }
            });
        });
    });
}

function buscarIdentidadDual() {
    const correo = ($("#txCorreoExistente").val() || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        mensajeError("Ingresa un correo válido.");
        return;
    }

    bloquearProceso(function () {
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: "/Operadores/BuscarCandidatoIdentidadDual",
            data: {
                correo: correo,
                idEmpresa: sessionStorage.getItem("idEmpresa"),
                cadena: sessionStorage.getItem("cadenaBase64"),
                empresa: sessionStorage.getItem("empresa"),
                correoActor: sessionStorage.getItem("correo")
            },
            dataType: "json",
            success: function (data) {
                swal.close();
                const candidato = data.d || {};
                if (!candidato.identidadValida && !candidato.IdentidadValida) {
                    identidadDualCandidata = null;
                    syncOperadorExistenteState();
                    $("#panelIdentidadDual").hide();
                    mensajeError(candidato.mensaje || candidato.Mensaje || "No fue posible completar la asignación. Revisa la información de la persona.");
                    return;
                }

                identidadDualCandidata = normalizaCandidatoDual(candidato);
                $("#hdUsuarioExistenteId").val(identidadDualCandidata.idUsuario || "");
                $("#hdUsuarioExistenteFirebase").val(identidadDualCandidata.idFirebase || "");
                $("#txNombreExistente").val(identidadDualCandidata.nombreCompleto || "");
                $("#txCorreoEncontrado").val(identidadDualCandidata.correo || "");
                $("#txNombreIdentidadDual").text(identidadDualCandidata.nombreCompleto || "Cuenta encontrada");
                $("#panelIdentidadDual").show();
                syncOperadorExistenteState();

                if (identidadDualCandidata.yaEsOperador) {
                    mensajeInfo("La persona ya cuenta con ambos accesos.");
                    return;
                }

                mensajeExito("La cuenta existente fue localizada correctamente.");
            },
            error: function () {
                swal.close();
                mensajeError("No fue posible completar la asignación. Revisa la información de la persona.");
            }
        });
    });
}

function guardarOperadorExistente() {
    const correo = ($("#txCorreoExistente").val() || "").trim();
    const sucursales = $("#cbSucursalesExistente").val() || [];
    if (!identidadDualCandidata || !identidadDualCandidata.identidadValida) {
        mensajeError("Busca primero la cuenta existente que deseas complementar.");
        return;
    }

    if (identidadDualCandidata.yaEsOperador) {
        mensajeInfo("La persona ya cuenta con ambos accesos.");
        return;
    }

    if (!sucursales.length) {
        mensajeError("Selecciona al menos una sucursal.");
        return;
    }

    bloquearProceso(function () {
        $.ajax({
            async: true,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "/Operadores/VincularIdentidadExistente",
            data: JSON.stringify({
                correo: correo,
                sucursales: sucursales
            }),
            dataType: "json",
            success: function (data) {
                swal.close();
                if (data.d === "El acceso como operador fue agregado correctamente."
                    || data.d === "La persona ya cuenta con ambos accesos.") {
                    mensajeExito(data.d, function () {
                        $("#modalVincularOperador").modal("hide");
                        cargaOperadores();
                    });
                    return;
                }

                mensajeError(data.d || "No fue posible completar el proceso. Intenta nuevamente.");
            },
            error: function () {
                swal.close();
                mensajeError("No fue posible completar el proceso. Intenta nuevamente.");
            }
        });
    });
}

function EditarOperador(idOperador) {
    const operadorCache = operadoresDetalleCache.get(idOperador);
    if (operadorCache && operadorCache.idOperador) {
        cargarDetalleOperador(operadorCache);
        return;
    }

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: "/Operadores/GetOperador",
        data: {
            idOperador: idOperador,
            idEmpresa: sessionStorage.getItem("idEmpresa"),
            cadena: sessionStorage.getItem("cadenaBase64"),
            empresa: sessionStorage.getItem("empresa"),
            correo: sessionStorage.getItem("correo")
        },
        dataType: "json",
        success: function (data) {
            const detalle = normalizeOperadorDetalle(data.d);
            if (!detalle || !detalle.idOperador) {
                mensajeError("No fue posible cargar el operador seleccionado.");
                return;
            }

            operadoresDetalleCache.set(detalle.idOperador, detalle);
            cargarDetalleOperador(detalle);
        },
        error: function () {
            mensajeError("No fue posible cargar el operador seleccionado.");
        }
    });
}

function cargarDetalleOperador(detalle) {
    detalle = normalizeOperadorDetalle(detalle);
    if (!detalle || !detalle.idOperador) {
        mensajeError("No fue posible cargar el operador seleccionado.");
        return;
    }

    limpiarModalEditar();
    $("#hdOperadorId").val(detalle.idOperador);
    $("#hdOperadorVersionRow").val(detalle.versionRow || "");
    $("#txNombreEditar").val(detalle.nombre || "");
    $("#txApellidoPaternoEditar").val(detalle.apellidoPaterno || "");
    $("#txApellidoMaternoEditar").val(detalle.apellidoMaterno || "");
    $("#txCorreoEditar").val(detalle.correo || "");
    $("#txEstadoEditar").val(detalle.estado || renderEstadoPlano(detalle));
    $("#txFechaAltaEditar").val(detalle.fechaAlta ? formatFecha(detalle.fechaAlta) : "");
    setMultiSelectValues("#cbSucursalesEditar", detalle.sucursalesDetalle || detalle.sucursales || []);
    $("#modalEditarOperador").modal("show");
}

function actualizarOperador() {
    operadoresFormEditar.validate().then(function (status) {
        if (status !== "Valid") {
            mensajeError("Completa los datos requeridos del operador.");
            return;
        }

        const sucursales = $("#cbSucursalesEditar").val() || [];
        if (!sucursales.length) {
            mensajeError("Selecciona al menos una sucursal.");
            return;
        }

        bloquearProceso(function () {
            $.ajax({
                async: true,
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: "/Operadores/ActualizarOperador",
                data: JSON.stringify({
                    idOperador: $("#hdOperadorId").val(),
                    versionRow: $("#hdOperadorVersionRow").val(),
                    nombre: $("#txNombreEditar").val(),
                    apellidoPaterno: $("#txApellidoPaternoEditar").val(),
                    apellidoMaterno: $("#txApellidoMaternoEditar").val(),
                    sucursales: sucursales
                }),
                dataType: "json",
                success: function (data) {
                    swal.close();
                    if (data.d === "El operador fue actualizado.") {
                        mensajeExito(data.d, function () {
                            $("#modalEditarOperador").modal("hide");
                            cargaOperadores();
                        });
                        return;
                    }

                    mensajeError(data.d || "No fue posible actualizar al operador.");
                },
                error: function () {
                    swal.close();
                    mensajeError("No fue posible actualizar al operador.");
                }
            });
        });
    });
}

function SuspendOp(idOperador, versionRow) {
    confirmarCambioEstado("suspender", "¿Deseas suspender a este operador?", function () {
        ejecutarCambioEstado("/Operadores/Suspender", idOperador, versionRow);
    });
}

function ReactivaOp(idOperador, versionRow) {
    confirmarCambioEstado("reactivar", "¿Deseas reactivar a este operador?", function () {
        ejecutarCambioEstado("/Operadores/Reactivar", idOperador, versionRow);
    });
}

function EnviarRecuperacion(idOperador) {
    swal.fire({
        text: "Se enviará un correo para restablecer la contraseña del operador.",
        icon: "question",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonText: "Enviar correo",
        cancelButtonText: "Cancelar",
        customClass: {
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-light"
        }
    }).then(function (result) {
        if (!result.isConfirmed) {
            return;
        }

        bloquearProceso(function () {
            $.ajax({
                async: true,
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: "/Operadores/EnviarRecuperacion",
                data: JSON.stringify({ idOperador: idOperador }),
                dataType: "json",
                success: function (data) {
                    swal.close();
                    if (data.d === "Se envió el correo de recuperación al operador.") {
                        mensajeExito(data.d);
                        return;
                    }

                    mensajeError(data.d || "No fue posible enviar el correo de recuperación.");
                },
                error: function () {
                    swal.close();
                    mensajeError("No fue posible enviar el correo de recuperación.");
                }
            });
        });
    });
}

function ReenviarVerificacion(idOperador) {
    swal.fire({
        text: "Se enviará un nuevo correo para verificar la cuenta del operador.",
        icon: "question",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonText: "Reenviar correo",
        cancelButtonText: "Cancelar",
        customClass: {
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-light"
        }
    }).then(function (result) {
        if (!result.isConfirmed) {
            return;
        }

        bloquearProceso(function () {
            $.ajax({
                async: true,
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: "/Operadores/ReenviarVerificacion",
                data: JSON.stringify({ idOperador: idOperador }),
                dataType: "json",
                success: function (data) {
                    swal.close();
                    if (data.d === "Se envió un nuevo correo de verificación." || data.d === "La cuenta ya está verificada.") {
                        mensajeExito(data.d, function () {
                            cargaOperadores();
                        });
                        return;
                    }

                    mensajeError(data.d || "No fue posible reenviar el correo. Intenta nuevamente.");
                },
                error: function () {
                    swal.close();
                    mensajeError("No fue posible reenviar el correo. Intenta nuevamente.");
                }
            });
        });
    });
}

function ejecutarCambioEstado(url, idOperador, versionRow) {
    bloquearProceso(function () {
        $.ajax({
            async: true,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: url,
            data: JSON.stringify({
                idOperador: idOperador,
                versionRow: versionRow
            }),
            dataType: "json",
            success: function (data) {
                swal.close();
                const payload = data.d || {};
                if (payload.mensaje === "El operador fue suspendido." || payload.mensaje === "El operador fue reactivado.") {
                    mensajeExito(payload.mensaje, function () {
                        cargaOperadores();
                    });
                    return;
                }

                mensajeError(payload.mensaje || "No fue posible completar la operación.");
            },
            error: function () {
                swal.close();
                mensajeError("No fue posible completar la operación.");
            }
        });
    });
}

function confirmarCambioEstado(tipo, mensaje, callback) {
    swal.fire({
        text: mensaje,
        icon: "question",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonText: tipo === "suspender" ? "Suspender" : "Reactivar",
        cancelButtonText: "Cancelar",
        customClass: {
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-light"
        }
    }).then(function (result) {
        if (result.isConfirmed) {
            callback();
        }
    });
}

function bloquearProceso(callback) {
    swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {
            callback();
        }
    });
}

function mensajeError(texto) {
    swal.fire({
        text: texto,
        icon: "error",
        buttonsStyling: false,
        confirmButtonText: "Ok, entendido",
        customClass: {
            confirmButton: "btn btn-primary"
        }
    });
}

function mensajeExito(texto, callback) {
    swal.fire({
        text: texto,
        icon: "success",
        buttonsStyling: false,
        confirmButtonText: "Ok",
        customClass: {
            confirmButton: "btn btn-primary"
        }
    }).then(function () {
        if (typeof callback === "function") {
            callback();
        }
    });
}

function mensajeInfo(texto, callback) {
    swal.fire({
        text: texto,
        icon: "info",
        buttonsStyling: false,
        confirmButtonText: "Ok",
        customClass: {
            confirmButton: "btn btn-primary"
        }
    }).then(function () {
        if (typeof callback === "function") {
            callback();
        }
    });
}

function setMultiSelectValues(selector, values) {
    const $select = $(selector);
    $select.empty();

    (values || []).forEach(function (item) {
        const option = new Option(item.sucursal, item.idSucursal, true, true);
        $select.append(option);
    });

    $select.trigger("change");
}

function formatFecha(fecha) {
    const value = new Date(fecha);
    if (Number.isNaN(value.getTime())) {
        return "";
    }

    return value.toLocaleDateString("es-MX");
}

function renderEstadoBadge(value) {
    const text = String(value || "").trim() || "Sin estado";
    let badgeClass = "badge-light-secondary";

    if (text === "Activo") {
        badgeClass = "badge-light-success";
    } else if (text === "Suspendido") {
        badgeClass = "badge-light-danger";
    } else if (text === "Pendiente de verificar") {
        badgeClass = "badge-light-warning";
    }

    return `<span class="badge ${badgeClass} fw-semibold">${escapeHtml(text)}</span>`;
}

function renderEstadoPlano(operador) {
    operador = normalizeOperadorDetalle(operador);
    if (!operador) {
        return "Sin estado";
    }

    if (operador.estado) {
        return operador.estado;
    }

    return operador.activo && Number(operador.estatus) === 1 ? "Activo" : "Suspendido";
}

function normalizeOperadorDetalle(operador) {
    if (!operador || typeof operador !== "object") {
        return null;
    }

    const sucursales = Array.isArray(operador.sucursalesDetalle)
        ? operador.sucursalesDetalle
        : Array.isArray(operador.SucursalesDetalle)
            ? operador.SucursalesDetalle
            : [];

    return {
        idOperador: operador.idOperador || operador.IdOperador || "",
        idEmpresa: operador.idEmpresa || operador.IdEmpresa || "",
        idFirebase: operador.idFirebase || operador.IdFirebase || "",
        nombre: operador.nombre || operador.Nombre || "",
        apellidoPaterno: operador.apellidoPaterno || operador.ApellidoPaterno || "",
        apellidoMaterno: operador.apellidoMaterno || operador.ApellidoMaterno || "",
        nombreCompleto: operador.nombreCompleto || operador.NombreCompleto || "",
        correo: operador.correo || operador.Correo || "",
        sucursales: operador.sucursales || operador.Sucursales || "",
        activo: typeof operador.activo === "boolean" ? operador.activo : !!operador.Activo,
        estatus: Number(operador.estatus != null ? operador.estatus : operador.Estatus || 0),
        estado: operador.estado || operador.Estado || "",
        fechaAlta: operador.fechaAlta || operador.FechaAlta || "",
        fechaSuspension: operador.fechaSuspension || operador.FechaSuspension || "",
        versionRow: operador.versionRow || operador.VersionRow || "",
        sucursalesDetalle: sucursales.map(function (sucursal) {
            return {
                idSucursal: sucursal.idSucursal || sucursal.IdSucursal || "",
                sucursal: sucursal.sucursal || sucursal.Sucursal || "",
                activo: typeof sucursal.activo === "boolean" ? sucursal.activo : !!sucursal.Activo
            };
        })
    };
}

function normalizaCandidatoDual(candidato) {
    return {
        idUsuario: candidato.idUsuario || candidato.IdUsuario || "",
        idEmpresa: candidato.idEmpresa || candidato.IdEmpresa || "",
        idFirebase: candidato.idFirebase || candidato.IdFirebase || "",
        nombre: candidato.nombre || candidato.Nombre || "",
        apellidoPaterno: candidato.apellidoPaterno || candidato.ApellidoPaterno || "",
        apellidoMaterno: candidato.apellidoMaterno || candidato.ApellidoMaterno || "",
        nombreCompleto: candidato.nombreCompleto || candidato.NombreCompleto || "",
        correo: candidato.correo || candidato.Correo || "",
        usuarioActivo: typeof candidato.usuarioActivo === "boolean" ? candidato.usuarioActivo : !!candidato.UsuarioActivo,
        yaEsOperador: typeof candidato.yaEsOperador === "boolean" ? candidato.yaEsOperador : !!candidato.YaEsOperador,
        identidadValida: typeof candidato.identidadValida === "boolean" ? candidato.identidadValida : !!candidato.IdentidadValida,
        mensaje: candidato.mensaje || candidato.Mensaje || ""
    };
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function handlePasswordInputState() {
    updatePasswordUi();

    if (operadoresFormNuevo) {
        operadoresFormNuevo.revalidateField("txPasswordNuevo");
        operadoresFormNuevo.revalidateField("txPasswordConfirmNuevo");
    }

    syncNuevoOperadorState();
}

function togglePasswordVisibility($button) {
    const $input = $($button.data("target"));
    if (!$input.length) {
        return;
    }

    const showing = $input.attr("type") === "text";
    $input.attr("type", showing ? "password" : "text");
    $button.attr("aria-pressed", showing ? "false" : "true");
    $button.attr("aria-label", buildToggleLabel($input, !showing));
    $button.find("i").toggleClass("fa-eye", showing).toggleClass("fa-eye-slash", !showing);
}

function buildToggleLabel($input, visible) {
    const isConfirm = $input.attr("id") === "txPasswordConfirmNuevo";
    return (visible ? "Ocultar " : "Mostrar ") + (isConfirm ? "confirmación de contraseña" : "contraseña");
}

function evaluatePasswordPolicy(password) {
    const value = String(password || "");
    const result = {
        length: value.length >= PASSWORD_POLICY.minLength,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        digit: /\d/.test(value),
        special: /[^A-Za-z0-9]/.test(value)
    };

    result.score = PASSWORD_POLICY.rules.reduce(function (count, rule) {
        return count + (result[rule] ? 1 : 0);
    }, 0);
    result.valid = PASSWORD_POLICY.rules.every(function (rule) {
        return result[rule];
    });

    return result;
}

function getPasswordStrengthState(policyState, password) {
    if (!String(password || "").trim()) {
        return PASSWORD_STRENGTH_LEVELS[0];
    }

    if (policyState.valid) {
        return PASSWORD_STRENGTH_LEVELS[3];
    }

    if (policyState.score >= 4) {
        return PASSWORD_STRENGTH_LEVELS[2];
    }

    if (policyState.score >= 2) {
        return PASSWORD_STRENGTH_LEVELS[1];
    }

    return PASSWORD_STRENGTH_LEVELS[0];
}

function updatePasswordUi() {
    const password = $("#txPasswordNuevo").val() || "";
    const confirmPassword = $("#txPasswordConfirmNuevo").val() || "";
    const policyState = evaluatePasswordPolicy(password);
    const strengthState = getPasswordStrengthState(policyState, password);

    $("#passwordStrengthLive")
        .text(strengthState.label)
        .removeClass("very-weak weak acceptable strong")
        .addClass(strengthState.key);

    $("#passwordPolicyStatus [data-rule]").each(function () {
        const $rule = $(this);
        const ruleKey = $rule.data("rule");
        const fulfilled = !!policyState[ruleKey];
        $rule.toggleClass("is-valid", fulfilled).toggleClass("is-pending", !fulfilled);
        $rule.attr("aria-label", (fulfilled ? "Cumplido: " : "Pendiente: ") + $rule.text());
    });

    $(".bl26-ops-strength-bar [data-strength-segment]").each(function (index) {
        const active = index < strengthState.filled;
        $(this)
            .toggleClass("is-active", active)
            .removeClass("very-weak weak acceptable strong")
            .addClass(active ? strengthState.key : "");
    });

    let matchClass = "neutral";
    let matchMessage = "Confirma la contraseña para validar la coincidencia.";
    if (confirmPassword) {
        if (confirmPassword === password) {
            matchClass = "success";
            matchMessage = "La confirmación coincide con la contraseña.";
        } else {
            matchClass = "danger";
            matchMessage = "La confirmación todavía no coincide con la contraseña.";
        }
    }

    $("#passwordMatchStatus")
        .removeClass("neutral success danger")
        .addClass(matchClass)
        .text(matchMessage);
}

function isNuevoOperadorReady() {
    const password = $("#txPasswordNuevo").val() || "";
    const confirmPassword = $("#txPasswordConfirmNuevo").val() || "";
    const correo = ($("#txCorreoNuevo").val() || "").trim();
    const nombre = ($("#txNombreNuevo").val() || "").trim();
    const apellidoPaterno = ($("#txApellidoPaternoNuevo").val() || "").trim();
    const sucursales = $("#cbSucursalesNuevo").val() || [];
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    const passwordState = evaluatePasswordPolicy(password);

    return !!nombre
        && !!apellidoPaterno
        && emailOk
        && passwordState.valid
        && !!confirmPassword
        && confirmPassword === password
        && sucursales.length > 0;
}

function syncNuevoOperadorState() {
    $("#btGuardarOperador").prop("disabled", !isNuevoOperadorReady());
}

function syncOperadorExistenteState() {
    const sucursales = $("#cbSucursalesExistente").val() || [];
    const habilitado = !!identidadDualCandidata
        && !!identidadDualCandidata.identidadValida
        && !identidadDualCandidata.yaEsOperador
        && sucursales.length > 0;

    $("#btGuardarOperadorExistente").prop("disabled", !habilitado);
}
