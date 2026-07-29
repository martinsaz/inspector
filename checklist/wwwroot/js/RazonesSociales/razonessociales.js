var components = function () {
    var t, e, r;
    var v = function () {
        t = document.querySelector('#frmRazon'),
            e = document.querySelector('#btGuardar'),
            r = FormValidation.formValidation(t, {
                fields: {
                    txRazon: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere una Razón Social"
                            }
                        }
                    }, txRepresentante: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere un Representante"
                            }
                        }
                    }, txRfc: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere el RFC"
                            }
                        }
                    }, txDireccion: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere la Dirección"
                            }
                        }
                    }, txColonia: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere la Colonia"
                            }
                        }
                    }, txCP: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere el CP"
                            }
                        }
                    }, txCiudad: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere la Ciudad"
                            }
                        }
                    }, txEstado: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere el Estado"
                            }
                        }
                    }, txPais: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere el País"
                            }
                        }
                    }, txTelefono: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere el Teléfono"
                            }
                        }
                    }, txRegimenFiscal: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere el Régimen Fiscal"
                            }
                        }
                    }
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

function Inicializa() {
    $.ajax({
        type: 'GET',
        async: true,
        url: '/RazonesSociales/Inicializa',
        data: {
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: 'json',
        success: function (data) {

            if (data.perm != '1') {
                $('#btNuevo').hide()
            }
        },
        error: function (xhr, textStatus, error) {
            alert('[Inicializa] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });
}


jQuery(document).ready(function () {
    //if (checaE() === 0) {
    //    window.location.href = "/Login/Index";
    //}
  //  ilumina('m050000', 'm050100', 'm050105');
   // PintaRuta('m050105');
    Inicializa();

    //let hasAccess = validarAccesoPantalla("m046200END");

    //if (hasAccess) {
    components.init();

    $('#btNuevo').click(function () {
        $('#modalNuevo').modal('show');
        $('#modalTitle').html('Nueva Razón Social');

        $('#txRazon').val('');
        $('#txRepresentante').val('');
        $('#txRfc').val('');
        $('#txDireccion').val('');
        $('#txColonia').val('');
        $('#txCP').val('');
        $('#txCiudad').val('');
        $('#txEstado').val('');
        $('#txPais').val('');
        $('#txTelefono').val('');
        $('#txRegimenFiscal').val('');
        $('#txNotas').val('');
        $('#valorId').val('');

        //document.getElementById('imgLogo').style.backgroundImage = "url(/Imagenes/blank.jpg)";
        //document.getElementById('imgLogoWrapper').style.backgroundImage = "url(/Imagenes/blank.jpg)";
    });

   /* var imageInputElement = document.querySelector('#imgLogo');
    var imageInput = KTImageInput.getInstance(imageInputElement);
    imageInput.on('kt.imageinput.changed', function () {
        var imagenC = imageInput.getInputElement();
        var file = imagenC.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const fileAsBinaryString = reader.result;
            imgBase64 = fileAsBinaryString;
        }
        reader.readAsDataURL(file);
        imgCambiada = '1';
    });*/

    LlenaTabla();
    
});

function LlenaTabla() {

    console.log("ok listado")
    var table = $('#grData').DataTable();
    table.destroy();

    swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {
            $.ajax({
                url: "/RazonesSociales/GetData",
                type: "GET",
                data: {
                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa'),

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
                            { data: "8" },
                            { data: "9" },
                            { data: "10" },
                            { data: "11" },
                            { data: "12" }
                            //{ data: "13" }

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
                    console.error('[GetData] status:', xhr.status, ', responseText:', xhr.responseText, ', textStatus:', textStatus, ', error:', error);
                    alert('[GetData] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
                }
            });

        }
    });
}

function EditarRazon(cual) {
    console.log(cual)
     
    valorImagen = '';
    imgBase64 = '';
    imgCambiada = '0';
    $('#valorId').val(cual);
    $('#txRazon').val('');
    $('#txRepresentante').val('');
    $('#txRfc').val('');
    $('#txDireccion').val('');
    $('#txColonia').val('');
    $('#txCP').val('');
    $('#txCiudad').val('');
    $('#txEstado').val('');
    $('#txPais').val('');
    $('#txTelefono').val('');
   // document.getElementById('imgLogo').style.backgroundImage = "url(/Imagenes/blank.jpg)";
    //document.getElementById('imgLogoWrapper').style.backgroundImage = "url(/Imagenes/blank.jpg)";
    $('#txNotas').val('');
    $('#txRegimenFiscal').val('');

    var obj = {};
    obj.lla = $('#valorId').val();
    obj.cua = cual;
    $.ajax({
        async: false,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: '/RazonesSociales/GetRazon',
        data: {
            lla: $('#valorId').val(),
            //cua: cual,
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')

        },
        dataType: "json",
        success: function (data) {
            console.log(data.d)
            $('#modalNuevo').modal('show');
            $('#modalTitle').html('Editar Razón Social');

            $('#txRazon').val(data.d.nombre);
            $('#txRepresentante').val(data.d.representante);
            $('#txRfc').val(data.d.rfc);
            $('#txDireccion').val(data.d.direccion);
            $('#txColonia').val(data.d.colonia);
            $('#txCP').val(data.d.codigoPostal);
            $('#txCiudad').val(data.d.ciudad);
            $('#txEstado').val(data.d.estado);
            $('#txPais').val(data.d.pais);
            $('#txTelefono').val(data.d.telefono);
          //  document.getElementById('imgLogo').style.backgroundImage = "url(" + data.d.imgfirebase + ")";
         //   document.getElementById('imgLogoWrapper').style.backgroundImage = "url(" + data.d.imgfirebase + ")";
            $('#txNotas').val(data.d.notas);
            $('#txRegimenFiscal').val(data.d.regimen1);

        },
        error: function (xhr, status, error) {
            alert('[GetRazon] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
        }
    });
}

function Guardar() {
    swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {
            $.ajax({
                async: true,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: '/RazonesSociales/Guardar',
                data: {
                    
                    llav: $('#valorId').val(),
                    razo: $('#txRazon').val(),
                    repr: $('#txRepresentante').val(),
                    rfc: $('#txRfc').val(),
                    dire: $('#txDireccion').val(),
                    colo: $('#txColonia').val(),
                    cp_: $('#txCP').val(),
                    ciud: $('#txCiudad').val(),
                    esta: $('#txEstado').val(),
                    pais: $('#txPais').val(),
                    tele: $('#txTelefono').val(),
                    im64: imgBase64,
                    imca: imgCambiada,
                    nota: $('#txNotas').val(),
                    regi: $('#txRegimenFiscal').val(),

                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa')

                },
                dataType: "json",
                success: function (data) {
                    swal.close();

                    if (data.d === '"Ya existe un elemento con este nombre"') {
                        swal.fire({
                            text: data.d,
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, entendido!",
                            customClass: {
                                confirmButton: "btn font-weight-bold btn-light-primary"
                            }
                        });
                    } else if (data.d === "Ok") { // Ajuste en esta línea
                        $('#modalNuevo').modal('hide');
                        LlenaTabla();

                        swal.fire({
                            text: 'Los datos se han guardado.',
                            icon: "success",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, entendido!",
                            customClass: {
                                confirmButton: "btn font-weight-bold btn-light-primary"
                            }
                        });
                    } else {
                        swal.fire({
                            text: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
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
                    swal.fire({
                        text: 'Ups!!! Ha ocurrido un error en la solicitud.',
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, entendido!",
                        customClass: {
                            confirmButton: "btn font-weight-bold btn-light-primary"
                        }
                    }).then(function () {
                        $('#modalNuevo').modal('hide');
                        LlenaTabla();
                    });
                    console.error('[Guardar] status:', xhr.status, 'responseText:', xhr.responseText);
                }
            });
        }
    });
}

function cambiarImagen(idInput, idBackground) {
    const file = document.querySelector('#' + idInput).files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        reduce_image_file_size(reader.result).then((result) => {
            imgBase64 = result;
            $("#" + idBackground).attr("src", imgBase64);
        });
    };
}
async function reduce_image_file_size(base64Str, MAX_WIDTH = 1000, MAX_HEIGHT = 1000) {
    let resized_base64 = await new Promise((resolve) => {
        let img = new Image()
        img.src = base64Str
        img.onload = () => {
            let canvas = document.createElement('canvas')
            let width = img.width
            let height = img.height

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width
                    width = MAX_WIDTH
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height
                    height = MAX_HEIGHT
                }
            }
            canvas.width = width
            canvas.height = height
            let ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL()) // this will return base64 image results after resize
        }
    });
    return resized_base64;
}

/*function guardarRazonSocial() {
    swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {
            $.ajax({
                async: true,
                type: "POST",
                //contentType: "application/json; charset=utf-8",
                url: '/RazonesSociales/GuardaRazon',
                data: {
                    llav: $('#valorId').val(),
                    razo: $('#txRazon').val(),
                    repr: $('#txRepresentante').val(),
                    rfc: $('#txRfc').val(),
                    dire: $('#txDireccion').val(),
                    colo: $('#txColonia').val(),
                    cp_: $('#txCP').val(),
                    ciud: $('#txCiudad').val(),
                    esta: $('#txEstado').val(),
                    pais: $('#txPais').val(),
                    tele: $('#txTelefono').val(),
                    im64: imgBase64,
                    imca: imgCambiada,
                    nota: $('#txNotas').val(),
                    regi: $('#txRegimenFiscal').val()
                },
                dataType: "json",
                success: function (data) {
                    swal.close();
                    if (data.d === 'Ok') {
                        imgBase64 = null;
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
                            LlenaTabla();
                        });
                    } else {
                        swal.fire({
                            text: data.d,
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

                    alert('[GuardaRazon] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
                }
            });
        }
    });
}*/