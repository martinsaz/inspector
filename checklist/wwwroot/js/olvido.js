"use strict";
var KTAuthResetPassword = function () {
    var t,
        e,
        r;
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
                !function (t) {
                    try {
                        return new URL(t),
                            !0
                    } catch (t) {
                        return !1
                    }
                }
                    (t.getAttribute("action")) ? e.addEventListener("click", (function (i) {
                        i.preventDefault(),
                            r.validate().then((function (r) {
                                if (r == "Valid") {
                                    let usr = $("#email").val();
                                    $.ajax({
                                        type: "POST",
                                        contentType: "application/json; charset=utf-8",
                                        url: `/Login/olvido?usr=${usr}`,
                                        dataType: "json",
                                        success: function (response) {
                                            if (response.d == 'Ok') {
                                                Swal.fire({
                                                    text: "Hemos enviado un correo a dirección con instrucciones.",
                                                    icon: "success",
                                                    buttonsStyling: !1,
                                                    confirmButtonText: "Ok, Entendido!",
                                                    customClass: {
                                                        confirmButton: "btn btn-primary"
                                                    }
                                                }).then((function (e) {
                                                    window.location.href = "/Login/Index";
                                                }))
                                            }
                                            else {
                                                Swal.fire({
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
                                    Swal.fire({
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
                                if (r == "Valid") {
                                    let usr = $("#email").val();
                                    $.ajax({
                                        type: "POST",
                                        contentType: "application/json; charset=utf-8",
                                        url: `/Login/Index?usr=${usr}&pwd=${pwd}&emp=${emp}`,
                                        dataType: "json",
                                        success: function (response) {
                                            if (response.d == 'Ok') {
                                                Swal.fire({
                                                    text: "Hemos enviado un correo a dirección con instrucciones.",
                                                    icon: "success",
                                                    buttonsStyling: !1,
                                                    confirmButtonText: "Ok, Entendido!",
                                                    customClass: {
                                                        confirmButton: "btn btn-primary"
                                                    }
                                                }).then((function (e) {
                                                    window.location.href = "/Login/Index";
                                                }))
                                            }
                                            else {
                                                Swal.fire({
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
                                    Swal.fire({
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
    KTAuthResetPassword.init()
}));
