var components = function () {
    var t, e, r;
    var v = function () {
        t = document.querySelector('#frmSucursal'),
            e = document.querySelector('#btGuardar'),
            r = FormValidation.formValidation(t, {
                fields: {
                    txNombre: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere un Nombre"
                            }
                        }
                    }
                    //, txNoIdentif: {
                    //    validators: {
                    //        notEmpty: {
                    //            message: "Se requiere un Identificador"
                    //        }
                    //    }
                    //}
                    , txCalle: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere la Dirección"
                            }
                        }
                    }, txCiudad: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere la Ciudad"
                            }
                        }
                    }, txTelefono: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere el Teléfono"
                            }
                        }
                    }
                    //, cbTitular: {
                    //    validators: {
                    //        notEmpty: {
                    //            message: "Se requiere el Titular"
                    //        }
                    //    }
                    //}
                    , txCorreo: {
                        validators: {
                            regexp: {
                                regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "No es una dirección de email válida"
                            },
                            notEmpty: {
                                message: "Se requiere el Correo"
                            }
                        }
                    }, txPais: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere el País"
                            }
                        }
                    }
                    , cbRazon: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere la Razón Social"
                            }
                        }
                    }
                    , cbZonas: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere la Región"
                            }
                        }
                    }
                    //}, cbTipo: {
                    //    validators: {
                    //        notEmpty: {
                    //            message: "Se requiere el Tipo"
                    //        }
                    //    }
                    //}
                }, plugins: {
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
                    }
                }))
        }))
    };
    return {
        init: function () {
            v();
        }
    };
}();
var imgBase64 = null;
var imgCambiada = '0';
jQuery(document).ready(function () {
    //if (checaE() === 0) {
    //    window.location.href = "/Login/Index";
    //}
    //ilumina('m050000', 'm050100', 'm050101');
    //PintaRuta('m050101');

    //let hasAccess = validarAccesoPantalla("m046600END");

    //if (hasAccess) {
    Inicializa();
    components.init();
    LlenaCatalogos();
    Inicializa();
    //var imageInputElement = document.querySelector('#imgLogo');
    //var imageInput = KTImageInput.getInstance(imageInputElement);
    //imageInput.on('kt.imageinput.changed', function () {
    //    var imagenC = imageInput.getInputElement();
    //    var file = imagenC.files[0];
    //    const reader = new FileReader();
    //    reader.onload = () => {
    //        const fileAsBinaryString = reader.result;
    //        imgBase64 = fileAsBinaryString;
    //    }
    //    reader.readAsDataURL(file);
    //    imgCambiada = '1';
    //});
    $('#btNuevo').click(function () {
        valorImagen = '';
        imgBase64 = '';
        imgCambiada = '0';
        $('#txNombre').val('');
        // $('#txNoIdentif').val('');
        $('#txCalle').val('');
        $('#txCiudad').val('');
        $('#txTelefono').val('');
        // $('#cbTitular').val(null).trigger("change");
        $('#txCorreo').val('');
        $('#txPais').val('');
        $('#cbRazon').val(null).trigger("change");
        $('#cbZonas').val(null).trigger("change");
        $('#cbTipo').val(null).trigger("change");
        $('#txNotas').val('');
        $('#valorId').val('');
        // document.getElementById('imgLogo').style.backgroundImage = "url(/Imagenes/blank.jpg)";
        //  document.getElementById('imgLogoWrapper').style.backgroundImage = "url(/Imagenes/blank.jpg)";
        $('#modalNuevo').modal('show');
        $('#modalTitle').html('Nueva sucursal');
    });

    LlenaTablaSucursales();
    document.getElementById('btGuardarZona').addEventListener('click', function () {
        const nombreZona = document.getElementById('txNombreZona').value.trim();

        if (nombreZona) {
            // Llama a la función que deseas ejecutar si txNombreZona tiene algún valor
            guardarZona(nombreZona);
        } else {
            // Muestra un mensaje de error o realiza alguna acción si txNombreZona está vacío
            alert('Por favor, ingrese el nombre de la zona.');
        }
    });
    document.getElementById('btGuardarRazon').addEventListener('click', function () {
        const nombreRazon = document.getElementById('txNombreRazon').value.trim();
        const rfcRazon = document.getElementById('txRFC').value.trim();
        //const nombreRazon = document.getElementById('txDireccionRazon').value.trim();

        if (nombreRazon && rfcRazon) {
            // Llama a la función que deseas ejecutar si txNombreZona tiene algún valor
            GuardarRazonSocial(nombreRazon, rfcRazon);
        } else {
            // Muestra un mensaje de error o realiza alguna acción si txNombreZona está vacío
            alert('Por favor, ingrese los datos completos.');
        }
    });
});
function Inicializa() {
    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/Sucursales/Inicializa',
        data: {
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: 'json',
        success: function (data) {
            if (data.perm != 1) {
                $('#btNuevaZona').hide();
                $('#btNuevaRazonSocial').hide();
                $('#btNuevo').hide();

            }
        },
        error: function (xhr, textStatus, error) {
            alert('[Inicializa] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });
}
function LlenaCatalogos() {

    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/Sucursales/GetRazonesSociales',
        data: {
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: 'json',
        success: function (data) {
            $('#cbRazon').html(data.d);
            $("#cbRazon").val(null).trigger('change');
        },
        error: function (xhr, textStatus, error) {
            alert('[GetRazones] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });
    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/Sucursales/GetZonas',
        data: {
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: 'json',
        success: function (data) {
            $('#cbZonas').html(data.d);
            $("#cbZonas").val(null).trigger('change');
        },
        error: function (xhr, textStatus, error) {
            alert('[GetZonas] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });

}
function LlenaTablaSucursales() {

    console.log("funciona?")
    var table = $('#grData').DataTable();
    table.destroy();

    swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {
            $.ajax({
                url: "/Sucursales/GetDataSucursales",
                type: "GET",
                data: {
                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa'),
                    correo: sessionStorage.getItem('correo')
                },
                contentType: "application/json",

                success: function (json) {

                    console.log("AJAX success response:", json);
                    var parsedJson = jQuery.parseJSON(json.d);
                    console.log("Parsed JSON:", parsedJson);

                    $('#grData').DataTable({
                        data: parsedJson.aaData,
                        language: {
                            url: '//cdn.datatables.net/plug-ins/3cfcc339e89/i18n/Spanish.json'
                        },
                        columns: [
                            { data: "0", orderable: false, width: "60px" },
                            { data: "1" },
                            { data: "2" },
                            { data: "3" },
                            { data: "4" },
                            { data: "5" },
                            { data: "6" },
                            { data: "7" },
                            { data: "8" }

                        ],
                        filter: true,
                        pagingType: "simple_numbers",
                        info: true,
                        drawCallback: function () {
                            swal.close();
                        },
                        order: [
                            [1, 'asc']
                        ],
                        buttons: [
                            { extend: 'print', className: 'btn dark btn-outline', text: 'Imprimir' },
                            { extend: 'pdf', className: 'btn green btn-outline' },
                            { extend: 'excel', className: 'btn yellow btn-outline' },
                            { extend: 'csv', className: 'btn purple btn-outline' }
                        ],
                        lengthMenu: [
                            [10, 15, 20, -1],
                            [10, 15, 20, "Todos"]
                        ],
                        pageLength: 10,
                        dom: `<'row'<'col-sm-6 text-left'f><'col-sm-6 text-right'B>>
                                <'row'<'col-sm-12'tr>>
                                <'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 dataTables_pager'lp>>`,
                    });
                },
                error: function (xhr, textStatus, error) {
                    swal.close();
                    console.error('[GetDataSucursales] status:', xhr.status, ', responseText:', xhr.responseText, ', textStatus:', textStatus, ', error:', error);
                    alert('[GetDataSucursales] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
                }
            });

        }
    });
}
function EditarSucursal(cual) {
    console.log(cual)
    $('#valorId').val(cual);
    valorImagen = '';
    imgBase64 = '';
    imgCambiada = '0';
    $('#txNombre').val('');
    // $('#txNoIdentif').val('');
    $('#txCalle').val('');
    $('#txCiudad').val('');
    $('#txTelefono').val('');
    //$('#cbTitular').val(null).trigger("change");
    $('#txCorreo').val('');
    $('#txPais').val('');
    $('#cbRazon').val(null).trigger("change");
    $('#cbZonas').val(null).trigger("change");
    //$('#cbTipo').val(null).trigger("change");
    $('#txNotas').val('');
    //document.getElementById('imgLogo').style.backgroundImage = "url(/Imagenes/blank.jpg)";
    //document.getElementById('imgLogoWrapper').style.backgroundImage = "url(/Imagenes/blank.jpg)";
    var obj = {};
    obj.lla = $('#valorId').val();
    obj.cua = cual;
    $.ajax({
        async: false,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: '/Sucursales/GetSucursal',
        data: {
            lla: $('#valorId').val(),
            cua: cual,
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')

        },
        dataType: "json",
        success: function (data) {
            console.log(data.d)
            $('#modalNuevo').modal('show');
            $('#modalTitle').html('Editar sucursal');
            $('#txNombre').val(data.d.nombre);
            // $('#txNoIdentif').val(data.d.Numero);
            $('#txCalle').val(data.d.direccion);
            $('#txCiudad').val(data.d.ciudad);
            $('#txTelefono').val(data.d.telefono);
            // $('#cbTitular').val(data.d.IdTitular);
            $('#txCorreo').val(data.d.correo);
            $('#txPais').val(data.d.pais);
            $('#cbRazon').val(data.d.idRazonSocial);
            $('#cbZonas').val(data.d.idZona);
            //$('#cbTipo').val(data.d.IdSucursalTipo);
            $('#txNotas').val(data.d.notas);
            // document.getElementById('imgLogo').style.backgroundImage = "url(" + data.d.LinkImagen + ")";
            //document.getElementById('imgLogoWrapper').style.backgroundImage = "url(" + data.d.LinkImagen + ")";
        },
        error: function (xhr, status, error) {
            alert('[GetSucursal] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
        }
    });
}
function Guardar() {
    console.log("Funciona?")
    var obj = {};
    obj.llav = $('#valorId').val();
    obj.nomb = $('#txNombre').val();
    //obj.iden = $('#txNoIdentif').val();
    obj.call = $('#txCalle').val();
    obj.ciud = $('#txCiudad').val();
    obj.tele = $('#txTelefono').val();
    //obj.titu = $('#cbTitular').val();
    obj.emai = $('#txCorreo').val();
    obj.pais = $('#txPais').val();
    obj.razo = $('#cbRazon').val();
    obj.zona = $('#cbZonas').val();
    //obj.tipo = $('#cbTipo').val();
    obj.nota = $('#txNotas').val();


    obj.idEmpresa = sessionStorage.getItem('idEmpresa');
    obj.cadena = sessionStorage.getItem('cadenaBase64');
    obj.empresa = sessionStorage.getItem('empresa');
    obj.correo = sessionStorage.getItem('correo');
    //obj.im64 = imgBase64;
    //obj.imca = imgCambiada;
    $.ajax({
        async: false,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: '/Sucursales/GuardaSucursal',
        data: JSON.stringify(obj),
        dataType: "json",
        success: function (data) {
            if (data.d === 'Sucursal insertada con éxito.') {
                swal.fire({
                    text: 'Los datos se han guardado.',
                    icon: "success",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, entendido!",
                    customClass: {
                        confirmButton: "btn font-weight-bold btn-light-primary"
                    }
                }).then(function () {
                    $('#modalNuevo').modal('hide');
                    $('#modalNuevo').modal('hide');
                    LlenaTablaSucursales();
                });
            } else if (data.d === 'Ya existe una sucursal con esos datos') {
                swal.fire({
                    text: "Ya existe un Plantel con esos datos",
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "¡Ok, entendido!",
                    customClass: {
                        confirmButton: "btn font-weight-bold btn-light-primary"
                    }
                });
            } else {
                swal.fire({
                    text: 'Los datos se han guardado.',
                    icon: "success",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, entendido!",
                    customClass: {
                        confirmButton: "btn font-weight-bold btn-light-primary"
                    }
                }).then(function () {
                    $('#modalNuevo').modal('hide');
                    $('#modalNuevo').modal('hide');
                    LlenaTablaSucursales();
                });

            }
        },
        error: function (xhr, status, error) {
            alert('[GuardaSucursal] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
        }
    });
}
function guardarZona(nombreZona) {

    $.ajax({
        async: false,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: '/Sucursales/GuardaZona',
        data: {
            llav: $('#valorId').val(),
            nomb: nombreZona,
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')

        },
        dataType: "json",
        success: function (data) {
            if (data.d === 'Ok') {
                swal.fire({
                    text: 'Los datos se han guardado.',
                    icon: "success",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, entendido!",
                    customClass: {
                        confirmButton: "btn font-weight-bold btn-light-primary"
                    }
                }).then(function () {
                    LlenaCatalogos();
                    $('#modalNuevaZona').modal('hide');
                    $('#modalNuevaZona').modal('hide');
                    LlenaTablaSucursales();
                });
            } else if (data.d === 'Ya existe una sucursal con esos datos') {
                swal.fire({
                    text: "Ya existe un Plantel con esos datos",
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "¡Ok, entendido!",
                    customClass: {
                        confirmButton: "btn font-weight-bold btn-light-primary"
                    }
                });
            } else {

                LlenaCatalogos();
                $('#modalNuevaZona').modal('hide');
                $('#modalNuevaZona').modal('hide');
                LlenaTablaSucursales();

                alert(data.d);

            }
        },
        error: function (xhr, status, error) {
            alert('[GuardaZona] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
        }
    });
}
function GuardarRazonSocial(nombreRazon, rfcRazon) {
    console.log("Funciona?")
    var obj = {};
    obj.llav = $('#valorId').val();
    obj.nomb = nombreRazon;
    //obj.iden = $('#txNoIdentif').val();
    obj.rfc = rfcRazon;

    $.ajax({
        async: false,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: '/Sucursales/GuardaRazonSocial',
        data: {
            llav: $('#valorId').val(),
            nomb: nombreRazon,
            rfc: rfcRazon,
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')

        },
        dataType: "json",
        success: function (data) {
            if (data.d === 'Ok') {
                swal.fire({
                    text: 'Los datos se han guardado.',
                    icon: "success",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, entendido!",
                    customClass: {
                        confirmButton: "btn font-weight-bold btn-light-primary"
                    }
                }).then(function () {
                    LlenaCatalogos();
                    $('#modalNuevaRazonSocial').modal('hide');
                    $('#modalNuevaRazonSocial').modal('hide');
                    LlenaTablaSucursales();
                });
            } else if (data.d === 'Ya existe una sucursal con esos datos') {
                swal.fire({
                    text: "Ya existe un Plantel con esos datos",
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "¡Ok, entendido!",
                    customClass: {
                        confirmButton: "btn font-weight-bold btn-light-primary"
                    }
                });
            } else {
                $('#modalNuevo').modal('hide');
                LlenaCatalogos();
                $('#modalNuevaRazonSocial').modal('hide');
                $('#modalNuevaRazonSocial').modal('hide');
                LlenaTablaSucursales();
                alert(data.d);

            }
        },
        error: function (xhr, status, error) {
            alert('[GuardaRazonSocial] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
        }
    });
}