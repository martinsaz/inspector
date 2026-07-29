// Inicialización de la función de componentes
var componentes = function () {
    var t, e, r;

    var v = function () {
        // Selección del formulario y botón de guardado
        t = document.querySelector('#frmZona');
        e = document.querySelector('#btGuardar');

        // Verificar si los elementos se encuentran correctamente
        if (!t) {
            console.error("Formulario '#frmZona' no encontrado.");
            return;
        }
        if (!e) {
            console.error("Botón '#btGuardar' no encontrado.");
            return;
        }

        // Inicialización de FormValidation para el formulario
        r = FormValidation.formValidation(t, {
            fields: {
                txNombre: {
                    validators: {
                        notEmpty: {
                            message: "Se requiere un Nombre"
                        }
                    }
                }
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap5({
                    rowSelector: ".fv-row",
                    eleInvalidClass: "", // Clase opcional si quieres personalizar el estilo de campo inválido
                    eleValidClass: ""    // Clase opcional si quieres personalizar el estilo de campo válido
                })
            }
        });

        // Confirmar que FormValidation se inicializó correctamente
        console.log("FormValidation inicializado:", r);

        // Configurar el evento de clic en el botón de guardar
        e.addEventListener("click", function (i) {
            i.preventDefault();

            // Ejecutar la validación del formulario
            r.validate().then(function (r) {
                if (r === "Valid") {
                    console.log("Formulario válido, ejecutando Guardar...");
                    Guardar(); // Llamada a la función Guardar
                } else {
                    console.log("Formulario inválido.");
                }
            });
        });
    };

    return {
        init: function () {
            v();
        }
    };
}();

// Iniciar el módulo de componentes cuando la página esté lista
document.addEventListener("DOMContentLoaded", function () {
    componentes.init();
});


function Inicializa() {
    $.ajax({
        type: 'GET',
        async: true,
        url: '/Regiones/Inicializa',
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
    // ilumina('m050000', 'm050100', 'm050102');
    //  PintaRuta('m050102');
    //componentes.init();

    LlenaTabla();
    Inicializa();

    $('#btNuevo').click(function () {
        $('#valorId').val('');
        $('#txNombre').val('');
        $('#txNotas').val('');
        $('#modalTitle').html('Nueva Región');
        $('#modalNuevo').modal('show');
    });
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
                url: "/Regiones/GetData",
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
                            { data: "2" }

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
function EditarZona(cual) {
    console.log(cual)
    $('#valorId').val(cual);
    $('#txNombre').val('');
    $('#txNotas').val('');
    var obj = {};
    obj.lla = $('#valorId').val();
    obj.cua = cual;
    $.ajax({
        async: false,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: '/Regiones/GetZona',
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
            $('#modalTitle').html('Editar Región');
            $('#txNombre').val(data.d.nombre);
            $('#txNotas').val(data.d.notas);
        },
        error: function (xhr, status, error) {
            alert('[GetZona] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
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
                url: '/Regiones/Guardar',
                data: {
                    llave: $('#valorId').val(),
                    nombre: $('#txNombre').val(),
                    notas: $('#txNotas').val(),
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
