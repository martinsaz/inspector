//"use strict";
//var inicializar = function () {
//    var e,
//        t,
//        r,
//        a,
//        s = function () {
//            return a.getScore() > 50
//        };
//    return {
//        init: function () {
//            e = document.querySelector("#kt_sign_up_form"),
//                t = document.querySelector("#kt_sign_up_submit"),
//                a = KTPasswordMeter.getInstance(e.querySelector('[data-kt-password-meter="true"]')),
//                !function (e) {
//                    try {
//                        return new URL(e),
//                            !0
//                    } catch (e) {
//                        return !1
//                    }
//                }
//                    (t.closest("form").getAttribute("action")) ? (r = FormValidation.formValidation(e, {
//                        fields: {
//                            "nombre": {
//                                validators: {
//                                    notEmpty: {
//                                        message: "Se requiere el nombre"
//                                    }
//                                }
//                            },
//                            email: {
//                                validators: {
//                                    regexp: {
//                                        regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//                                        message: "No es una dirección email válida"
//                                    },
//                                    notEmpty: {
//                                        message: "Se requiere una dirección Email"
//                                    }
//                                }
//                            },
//                            password: {
//                                validators: {
//                                    notEmpty: {
//                                        message: "Se requiere la contrseña"
//                                    },
//                                    callback: {
//                                        message: "Por favor ingrese una contraseña válida",
//                                        callback: function (e) {
//                                            if (e.value.length > 0)
//                                                return s()
//                                        }
//                                    }
//                                }
//                            },
//                            "confirm-password": {
//                                validators: {
//                                    notEmpty: {
//                                        message: "Se requiere la confirmación de la contraseña"
//                                    },
//                                    identical: {
//                                        compare: function () {
//                                            return e.querySelector('[name="password"]').value
//                                        },
//                                        message: "La contraseña y su confirmación no son iguales"
//                                    }
//                                }
//                            },
//                            toc: {
//                                validators: {
//                                    notEmpty: {
//                                        message: "Debe aceptar los términos"
//                                    }
//                                }
//                            }
//                        },
//                        plugins: {
//                            trigger: new FormValidation.plugins.Trigger({
//                                event: {
//                                    password: !1
//                                }
//                            }),
//                            bootstrap: new FormValidation.plugins.Bootstrap5({
//                                rowSelector: ".fv-row",
//                                eleInvalidClass: "",
//                                eleValidClass: ""
//                            })
//                        }
//                    }), t.addEventListener("click", (function (s) {
//                        s.preventDefault(),
//                            r.revalidateField("password"),
//                            r.validate().then((function (r) {
//                                if (r == "Valid") {
//                                    let nom = $("#nombre").val();
//                                    let usr = $("#email").val();
//                                    let pwd = $("#password").val();
//                                    $.ajax({
//                                        type: "POST",
//                                        contentType: "application/json; charset=utf-8",
//                                        url: `/Login/Registro?nom=${nom}&usr=${usr}&pwd=${pwd}`,
//                                        dataType: "json",
//                                        success: function (response) {
//                                            if (response.d == 'Ok') {
//                                                Swal.fire({
//                                                    text: "Usted ha sido registrado. Se le ha enviado un mail de verificación. Por favor haga el proceso de verificación antes de ingresar.",
//                                                    icon: "success",
//                                                    buttonsStyling: !1,
//                                                    confirmButtonText: "Ok, Entendido!",
//                                                    customClass: {
//                                                        confirmButton: "btn btn-primary"
//                                                    }
//                                                }).then((function (e) {
//                                                    window.location.href = "/Login/Index";
//                                                }))
//                                            }
//                                            else {
//                                                Swal.fire({
//                                                    text: response.d,
//                                                    icon: "error",
//                                                    buttonsStyling: !1,
//                                                    confirmButtonText: "Ok, Entendido!",
//                                                    customClass: {
//                                                        confirmButton: "btn btn-primary"
//                                                    }
//                                                });
//                                            }
//                                        },
//                                        error: function (xhr, status, error) {
//                                            alert('status: ' + xhr.status + ' responseText: ' + xhr.responseText);
//                                        }
//                                    });
//                                } else {
//                                    Swal.fire({
//                                        text: "Lo siento parece que hay errores, Por favor intente de nuevo.",
//                                        icon: "error",
//                                        buttonsStyling: !1,
//                                        confirmButtonText: "Ok, Entendido!",
//                                        customClass: {
//                                            confirmButton: "btn btn-primary"
//                                        }
//                                    });
//                                }
//                            }))
//                    })), e.querySelector('input[name="password"]').addEventListener("input", (function () {
//                        this.value.length > 0 && r.updateFieldStatus("password", "NotValidated")
//                    }))) : (r = FormValidation.formValidation(e, {
//                        fields: {
//                            "nombre": {
//                                validators: {
//                                    notEmpty: {
//                                        message: "Se requiere el nombre"
//                                    }
//                                }
//                            },
//                            email: {
//                                validators: {
//                                    regexp: {
//                                        regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//                                        message: "No es una dirección email válida"
//                                    },
//                                    notEmpty: {
//                                        message: "Se requiere una dirección Email"
//                                    }
//                                }
//                            },
//                            password: {
//                                validators: {
//                                    notEmpty: {
//                                        message: "Se requiere la contrseña"
//                                    },
//                                    callback: {
//                                        message: "Por favor ingrese una contraseña válida",
//                                        callback: function (e) {
//                                            if (e.value.length > 0)
//                                                return s()
//                                        }
//                                    }
//                                }
//                            },
//                            "confirm-password": {
//                                validators: {
//                                    notEmpty: {
//                                        message: "Se requiere la confirmación de la contraseña"
//                                    },
//                                    identical: {
//                                        compare: function () {
//                                            return e.querySelector('[name="password"]').value
//                                        },
//                                        message: "La contraseña y su confirmación no son iguales"
//                                    }
//                                }
//                            },
//                            toc: {
//                                validators: {
//                                    notEmpty: {
//                                        message: "Debe aceptar los términos"
//                                    }
//                                }
//                            }
//                        },
//                        plugins: {
//                            trigger: new FormValidation.plugins.Trigger({
//                                event: {
//                                    password: !1
//                                }
//                            }),
//                            bootstrap: new FormValidation.plugins.Bootstrap5({
//                                rowSelector: ".fv-row",
//                                eleInvalidClass: "",
//                                eleValidClass: ""
//                            })
//                        }
//                    }), t.addEventListener("click", (function (a) {
//                        a.preventDefault(),
//                            r.revalidateField("password"),
//                            r.validate().then((function (r) {
//                                if (r == "Valid") {
//                                    let nom = $("#nombre").val();
//                                    let usr = $("#email").val();
//                                    let pwd = $("#password").val();
//                                    $.ajax({
//                                        type: "POST",
//                                        contentType: "application/json; charset=utf-8",
//                                        url: `/Login/Registro?nom=${nom}&usr=${usr}&pwd=${pwd}`,
//                                        dataType: "json",
//                                        success: function (response) {
//                                            if (response.d == 'Ok') {
//                                                Swal.fire({
//                                                    text: "Usted ha sido registrado. Se le ha enviado un mail de verificación. Por favor haga el proceso de verificación antes de ingresar.",
//                                                    icon: "success",
//                                                    buttonsStyling: !1,
//                                                    confirmButtonText: "Ok, Entendido!",
//                                                    customClass: {
//                                                        confirmButton: "btn btn-primary"
//                                                    }
//                                                }).then((function (e) {
//                                                    window.location.href = "/Login/Index";
//                                                }))
//                                            }
//                                            else {
//                                                Swal.fire({
//                                                    text: response.d,
//                                                    icon: "error",
//                                                    buttonsStyling: !1,
//                                                    confirmButtonText: "Ok, Entendido!",
//                                                    customClass: {
//                                                        confirmButton: "btn btn-primary"
//                                                    }
//                                                });
//                                            }
//                                        },
//                                        error: function (xhr, status, error) {
//                                            alert('status: ' + xhr.status + ' responseText: ' + xhr.responseText);
//                                        }
//                                    });
//                                } else {
//                                    Swal.fire({
//                                        text: "Lo siento parece que hay errores, Por favor intente de nuevo.",
//                                        icon: "error",
//                                        buttonsStyling: !1,
//                                        confirmButtonText: "Ok, Entendido!",
//                                        customClass: {
//                                            confirmButton: "btn btn-primary"
//                                        }
//                                    });
//                                }
//                            }))
//                    })), e.querySelector('input[name="password"]').addEventListener("input", (function () {
//                        this.value.length > 0 && r.updateFieldStatus("password", "NotValidated")
//                    })))
//        }
//    }
//}
//    ();
//KTUtil.onDOMContentLoaded((function () {
//    KTSignupGeneral.init()
//}));
