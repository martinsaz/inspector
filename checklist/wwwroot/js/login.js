"use strict";
var KTSigninGeneral = function () {
    var t, e, r;
    return {
        init: function () {
            t = document.querySelector("#kt_sign_in_form"),
                e = document.querySelector("#kt_sign_in_submit"),
                r = FormValidation.formValidation(t, {
                    fields: {
                        email: {
                            validators: {
                                regexp: {
                                    regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "No es una dirección de correo válida"
                                },
                                notEmpty: {
                                    message: "Elemento requerido"
                                }
                            }
                        },
                        password: {
                            validators: {
                                notEmpty: {
                                    message: "Elemento requerido"
                                },
                                checkPassword: {
                                    message: "Su clave es demasiado insegura"
                                }
                            }
                        }
                    },
                    plugins: {
                        trigger: new FormValidation.plugins.Trigger,
                        bootstrap: new FormValidation.plugins.Bootstrap5({
                            rowSelector: ".fv-row",
                            eleInvalidClass: "",
                            eleValidClass: ""
                        })
                    }
                })
                !function (t) {
                    try {
                        return new URL(t),
                            !0
                    } catch (t) {
                        return !1
                    }
                }
                    (e.closest("form").getAttribute("action")) ? e.addEventListener("click", (function (i) {
                        i.preventDefault(),
                            r.validate().then((function (r) {
                                if (r == "Valid") {
                                    let usr = $("#email").val();
                                    let pwd = $("#password").val();
                                    let nem = $("#noEmp").val();
                                    let usrEncoded = encodeURIComponent(usr || "");
                                    let pwdEncoded = encodeURIComponent(pwd || "");
                                    let nemEncoded = encodeURIComponent(nem || "");
                                    $.ajax({
                                        type: "POST",
                                        contentType: "application/json; charset=utf-8",
                                        url: `/Login/Ingreso?usr=${usrEncoded}&pwd=${pwdEncoded}&nem=${nemEncoded}`,
                                        dataType: "json",
                                        success: function (response) {
                                            if (response.d == 'Ok') {
                                                sessionStorage.setItem('idEmpresa', response.idEmpresa);
                                                sessionStorage.setItem('cadenaBase64', response.cadenaBase64);
                                                sessionStorage.setItem('empresa', response.empresa);
                                                sessionStorage.setItem('correo', response.correo);
                                                sessionStorage.setItem('userUid', response.userUid);
                                                sessionStorage.setItem('fbToken', response.firebaseToken);
                                                sessionStorage.setItem('accountType', response.accountType || 'Usuario');
                                                window.location.href = response.redirectUrl || "/Home/Index";
                                            }
                                            else {
                                                if (response.d == 'Existe otra sesión abierta en otro dispositivo la cuál se cerrará.') {
                                                    swal.fire({
                                                        text: response.d,
                                                        icon: "error",
                                                        buttonsStyling: false,
                                                        confirmButtonText: "Ok, Entendido!",
                                                        customClass: {
                                                            confirmButton: "btn btn-primary"
                                                        }
                                                    }).then((result) => {
                                                        // Este código se ejecuta después de que el usuario presiona el botón
                                                        if (result.isConfirmed) {
                                                            // Guardar en sessionStorage
                                                            sessionStorage.setItem('idEmpresa', response.idEmpresa);
                                                            sessionStorage.setItem('cadenaBase64', response.cadenaBase64);
                                                            sessionStorage.setItem('empresa', response.empresa);
                                                            sessionStorage.setItem('correo', response.correo);
                                                            sessionStorage.setItem('userUid', response.userUid);
                                                            sessionStorage.setItem('fbToken', response.firebaseToken);
                                                            sessionStorage.setItem('accountType', response.accountType || 'Usuario');
                                                            window.location.href = response.redirectUrl || "/Home/Index";
                                                        }
                                                    });
                                                } else {
                                                    swal.fire({
                                                        text: response.d,
                                                        icon: "error",
                                                        buttonsStyling: !1,
                                                        confirmButtonText: "Ok, Entendido!",
                                                        customClass: {
                                                            confirmButton: "btn btn-primary"
                                                        }
                                                    });
                                                }

                                            }
                                        },
                                        error: function (xhr, status, error) {
                                            alert('status: ' + xhr.status + ' responseText: ' + xhr.responseText);
                                        }
                                    });
                                } else {
                                    swal.fire({
                                        text: "Lo siento parece que hay errores, Por favor intente de nuevo.",
                                        icon: "error",
                                        buttonsStyling: !1,
                                        confirmButtonText: "Ok, Entendido!",
                                        customClass: {
                                            confirmButton: "btn btn-primary"
                                        }
                                    });
                                }
                            }))
                    })) : e.addEventListener("click", (function (i) {
                        i.preventDefault(),
                            r.validate().then((function (r) {
                                let usr = $("#email").val();
                                let pwd = $("#password").val();
                                let nem = $("#noEmp").val();
                                let usrEncoded = encodeURIComponent(usr || "");
                                let pwdEncoded = encodeURIComponent(pwd || "");
                                let nemEncoded = encodeURIComponent(nem || "");
                                $.ajax({
                                    async: true,
                                    type: "POST",
                                    contentType: "application/json; charset=utf-8",
                                    url: `/Login/Ingreso?usr=${usrEncoded}&pwd=${pwdEncoded}&nem=${nemEncoded}`,
                                    dataType: "json",
                                    success: function (response) {
                                        if (response.d == 'Ok') {
                                            sessionStorage.setItem('idEmpresa', response.idEmpresa);
                                            sessionStorage.setItem('cadenaBase64', response.cadenaBase64);
                                            sessionStorage.setItem('empresa', response.empresa);
                                            sessionStorage.setItem('correo', response.correo);
                                            sessionStorage.setItem('accountType', response.accountType || 'Usuario');
                                            window.location.href = response.redirectUrl || "/Home/Index";
                                        }
                                        else {
                                            swal.fire({
                                                text: response.d,
                                                icon: "error",
                                                buttonsStyling: !1,
                                                confirmButtonText: "Ok, Entendido!",
                                                customClass: {
                                                    confirmButton: "btn btn-primary"
                                                }
                                            });
                                        }
                                    },
                                    error: function (xhr, status, error) {
                                        alert('status: ' + xhr.status + ' responseText: ' + xhr.responseText);
                                    }
                                });
                            }))
                    }))
        }
    }
}();

var vaRegUsuario = function () {
    var t, e, r;
    return {
        init: function () {
            t = document.querySelector("#frmUsuario"),
                e = document.querySelector("#btGuardar"),
                r = FormValidation.formValidation(t, {
                    fields: {
                        txNombre: {
                            validators: {
                                notEmpty: {
                                    message: "Elemento requerido"
                                }
                            }
                        },
                        txApaterno: {
                            validators: {
                                notEmpty: {
                                    message: "Elemento requerido"
                                }
                            }
                        },
                        txAmaterno: {
                            validators: {
                                notEmpty: {
                                    message: "Elemento requerido"
                                }
                            }
                        },
                        txToken: {
                            validators: {
                                notEmpty: {
                                    message: "Elemento requerido"
                                }
                            }
                        },
                        txCorreo: {
                            validators: {
                                regexp: {
                                    regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "No es una dirección de correo válida"
                                },
                                notEmpty: {
                                    message: "Elemento requerido"
                                }
                            }
                        },
                        password1: {
                            validators: {
                                regexp: {
                                    regexp: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
                                    message: "Su contraseña es insegura"
                                },
                                notEmpty: {
                                    message: "Elemento requerido"
                                }, callback: {
                                    message: 'Ingrese una clave válida',
                                    callback: function (input) {
                                        if (input.value.length > 0) {
                                            return validatePassword();
                                        }
                                    }
                                }
                            }
                        },
                        confpassword: {
                            validators: {
                                notEmpty: {
                                    message: 'Se requiere la confirmación'
                                }, identical: {
                                    compare: function () {
                                        return form.querySelector('[name="password1"]').value;
                                    },
                                    message: 'La clave y la confirmación no coinciden'
                                }
                            }
                        },
                        toc: {
                            validators: {
                                notEmpty: {
                                    message: 'Debe aceptar los términos y condiciones'
                                }
                            }
                        },
                        privacy: {
                            validators: {
                                notEmpty: {
                                    message: 'Debe leer el aviso de privacidad'
                                }
                            }
                        },
                    },
                    plugins: {
                        trigger: new FormValidation.plugins.Trigger,
                        bootstrap: new FormValidation.plugins.Bootstrap5({
                            rowSelector: ".fv-row",
                            eleInvalidClass: "",
                            eleValidClass: ""
                        })
                    }
                }),
                !function (t) {
                    try {
                        return new URL(t),
                            !0
                    } catch (t) {
                        return !1
                    }
                }
            e.addEventListener("click", (function (i) {
                i.preventDefault(),
                    r.validate().then((function (r) {
                        if (r == "Valid") {
                            Guardar();
                        } else {
                            swal.fire({
                                text: "Lo siento parece que hay errores, Por favor intente de nuevo.",
                                icon: "error",
                                buttonsStyling: !1,
                                confirmButtonText: "Ok, Entendido!",
                                customClass: {
                                    confirmButton: "btn btn-primary"
                                }
                            });
                        }
                    }))
            }))
        }
    }
}();

KTUtil.onDOMContentLoaded((function () {
    KTSigninGeneral.init();
    KTAuthResetPassword.init();
    vaRegUsuario.init();
}));

$(document).ready(function () {
    $('#forgotPasswordModal').on('shown.bs.modal', function () {
        $('#email').val('');
    });

    $('#btNuevaEmpresa').click(function () {
        $('#txEmpresa').val('');
        $('#mdEmpresa').modal('show');
    });

    $('#email').on('focusout', function () {
        if ($('#email').val() == 'soporte@secuencia.com') {
            $('#areaNoEmp').show();
        } else {
            $('#areaNoEmp').hide();
        }
    });

    $('#txEmpresa').keyup(function () {
        this.value = this.value.toUpperCase();
    });

    $('#btRegistro').click(function () {
        $('#txNombre').val('');
        $('#txApaterno').val('');
        $('#txAmaterno').val('');
        $('#password1').val('');
        $('input[name="confirm-password"]').val('');
        $('#toc').prop('checked', false);
        $('#privacy').prop('checked', false);
        $('#txToken').val('');
        $('#txCorreo').val('');
        $('#txClave').val('');
        $('#confpassword').val('');
        $('#areaUsuario').show();
        $('#areaEmpresa').hide();
        $('#idTitulo').html('Nuevo Usuario');
        $('#btGuardar').show();
        $('#modalNuevo').modal('show');
    });

    $('#btRegistrar').click(function () {
        swal.fire({
            title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
            allowEscapeKey: false,
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: function () {
                if ($('#txEmpresa').val()) {
                    $.ajax({
                        async: true,
                        type: "POST",
                        url: `/Login/Registrare`,
                        dataType: "json",
                        data: {
                            emp: $('#txEmpresa').val()
                        },
                        success: function (response) {
                            if (response.d == 'Ok') {
                                swal.fire({
                                    text: `Su empresa se ha registrado. La vigencia de su prueba expira el ${response.e}. Su token es: ${response.t} anótelo en un lugar seguro pues será necesario para que pueda registrar otros usuarios para su empresa.`,
                                    icon: "success",
                                    buttonsStyling: !1,
                                    confirmButtonText: "¡Ok, enterado!",
                                    customClass: {
                                        confirmButton: "btn btn-primary"
                                    }
                                }).then(function () {
                                    $('#mdEmpresa').modal('hide');
                                    $('#txToken').val(response.t);
                                    $('#areaUsuario').show();
                                    $('#areaEmpresa').hide();
                                    $('#btGuardar').show();
                                });
                            }
                            else {
                                $(".alert-danger", $(".login-form")).show();
                                $("#lblError").html(response.d);
                                $("#email").focus();
                                swal.fire({
                                    text: response.d,
                                    icon: "error",
                                    buttonsStyling: false,
                                    confirmButtonText: "Ok, entendido!",
                                    customClass: {
                                        confirmButton: "btn font-weight-bold btn-light-primary"
                                    }
                                });
                            }
                        },
                        error: function (xhr, status, error) {
                            alert('status: ' + xhr.status + ' responseText: ' + xhr.responseText);
                        }
                    });
                } else {
                    swal.fire({
                        text: "Debe proporcionar un nombre de empresa",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, entendido!",
                        customClass: {
                            confirmButton: "btn font-weight-bold btn-light-primary"
                        }
                    });
                }
            }
        });
    });
});

"use strict";
var KTAuthResetPassword = function () {
    var t, e, r;
    return {
        init: function () {
            t = document.querySelector("#kt_password_reset_form"),
                e = document.querySelector("#kt_password_reset_submit"),
                r = FormValidation.formValidation(t, {
                    fields: {
                        email: {
                            validators: {
                                regexp: {
                                    regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "No es una dirección email válida"
                                },
                                notEmpty: {
                                    message: "Se requiere una dirección Email"
                                }
                            }
                        }
                    },
                    plugins: {
                        trigger: new FormValidation.plugins.Trigger,
                        bootstrap: new FormValidation.plugins.Bootstrap5({
                            rowSelector: ".fv-row",
                            eleInvalidClass: "",
                            eleValidClass: ""
                        })
                    }
                }),
                e.addEventListener("click", (function (i) {
                    i.preventDefault(),
                        r.validate().then((function (r) {
                            if (r == "Valid") {
                                let usr = $("#kt_password_reset_form #email").val();
                                $.ajax({
                                    type: "POST",
                                    contentType: "application/json; charset=utf-8",
                                    url: `/Login/olvido?usr=${usr}`,
                                    dataType: "json",
                                    success: function (response) {
                                        if (response.d == 'Ok') {
                                            swal.fire({
                                                text: "Hemos enviado un correo a dirección con instrucciones.",
                                                icon: "success",
                                                buttonsStyling: !1,
                                                confirmButtonText: "Ok, Entendido!",
                                                customClass: {
                                                    confirmButton: "btn btn-primary"
                                                }
                                            }).then((function (e) {
                                                window.location.href = "/Login/Index";
                                            }));
                                        } else {
                                            swal.fire({
                                                text: response.d,
                                                icon: "error",
                                                buttonsStyling: !1,
                                                confirmButtonText: "Ok, Entendido!",
                                                customClass: {
                                                    confirmButton: "btn btn-primary"
                                                }
                                            });
                                        }
                                    },
                                    error: function (xhr, status, error) {
                                        alert('status: ' + xhr.status + ' responseText: ' + xhr.responseText);
                                    }
                                });
                            } else {
                                swal.fire({
                                    text: "Lo siento parece que hay errores, Por favor intente de nuevo.",
                                    icon: "error",
                                    buttonsStyling: !1,
                                    confirmButtonText: "Ok, Entendido!",
                                    customClass: {
                                        confirmButton: "btn btn-primary"
                                    }
                                });
                            }
                        }));
                }));
        }
    }
}();

function Guardar() {
    swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {
            $.ajax({
                async: true,
                type: "POST",
                url: `/Login/Registraru`,
                dataType: "json",
                data: {
                    nom: $('#txNombre').val(),
                    tok: $('#txToken').val(),
                    cor: $('#txCorreo').val(),
                    cla: $('#password1').val(),
                    Apaterno: $('#txApaterno').val(),
                    Amaterno: $('#txAmaterno').val()
                },
                success: function (response) {
                    if (response.d == 'Ok') {
                        swal.fire({
                            text: `¡Su usuario se ha registrado! No olvide validar su usuario antes de que pueda ingresar al sistema. Para validarlo, revise su buzón de correo.`,
                            icon: "success",
                            buttonsStyling: !1,
                            confirmButtonText: "¡Ok, enterado!",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        }).then(function () {
                            $('#modalNuevo').modal('hide');
                        });
                    }
                    else {
                        $(".alert-danger", $(".login-form")).show();
                        $("#lblError").html(response.d);
                        $("#email").focus();
                        swal.fire({
                            text: response.d,
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, entendido!",
                            customClass: {
                                confirmButton: "btn font-weight-bold btn-light-primary"
                            }
                        });
                    }
                },
                error: function (xhr, status, error) {
                    alert('status: ' + xhr.status + ' responseText: ' + xhr.responseText);
                }
            });
        }
    });
}

function abreModal(cual) {
    switch (cual) {
        case 1:
            $('#termsModal').modal('show');
            break;
        case 2:
            $('#CuentaModal').modal('show');
            break;
        case 3:
            $('#privacyModal').modal('show');
            break;
    }
}
