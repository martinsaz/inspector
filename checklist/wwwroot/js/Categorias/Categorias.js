let pickerNac = null;
let pickerIng = null;

function normalizeSessionValue(value) {
    return (value || "").replace(/^"+|"+$/g, "").trim();
}

function getSessionValue(key) {
    const storageValue = typeof window.sessionStorage !== "undefined"
        ? normalizeSessionValue(sessionStorage.getItem(key))
        : "";

    if (storageValue) {
        return storageValue;
    }

    const context = document.getElementById("categorias-session-context");
    if (!context) {
        return "";
    }

    const fallbackMap = {
        idEmpresa: "idEmpresa",
        cadenaBase64: "cadenaBase64",
        empresa: "empresa",
        correo: "correo"
    };

    return normalizeSessionValue(context.dataset[fallbackMap[key]] || "");
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    document.querySelector('#btNuevo').addEventListener('click', () => {
        $('#modalNuevo').modal('show');
        //document.getElementById('modalNuevo').modal('show');
        //document.getElementById('modalTitle').innerHTML = 'Nuevo Usuario';
        // $('#modalTitle').html('Categoria');
        document.getElementById('valorId').value = '';
        document.getElementById('txNombre').value = '';
        document.getElementById('txNotas').value = '';

    });
    LlenaTabla();

});
function Inicializa() {
    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/Categorias/Inicializa',
        data: {
            idEmpresa: getSessionValue('idEmpresa'),
            cadena: getSessionValue('cadenaBase64'),
            empresa: getSessionValue('empresa'),
            correo: getSessionValue('correo')
        },
        dataType: 'json',
        success: function (data) {
            if (data.perm != 1) {
                $('#btNuevo').hide();

            }
        },
        error: function (xhr, textStatus, error) {
            alert('[Inicializa] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });
}

const fechador = () => {
    pickerNac = new tempusDominus.TempusDominus(document.getElementById("dpFechaNace"), {
        localization: {
            locale: "es",
            startOfTheWeek: 1,
            format: "yyyy/MM/dd"
        },
        display: {
            viewMode: "calendar",
            components: {
                decades: true,
                year: true,
                month: true,
                date: true,
                hours: false,
                minutes: false,
                seconds: false
            }
        }
    });
    pickerIng = new tempusDominus.TempusDominus(document.getElementById("dpFechaIngr"), {
        localization: {
            locale: "es",
            startOfTheWeek: 1,
            format: "yyyy/MM/dd"
        },
        display: {
            viewMode: "calendar",
            components: {
                decades: true,
                year: true,
                month: true,
                date: true,
                hours: false,
                minutes: false,
                seconds: false
            }
        }
    });
};
const initFormValidation = () => {
    const form = document.querySelector('#frmZona');
    const saveButton = document.querySelector('#btGuardar');

    if (!form) {
        console.error("Formulario no encontrado: #frmUsuario");
        return;
    }

    if (!saveButton) {
        console.error("Botón de guardar no encontrado: #btGuardar");
        return;
    }

    const validator = FormValidation.formValidation(form, {
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
                eleInvalidClass: "",
                eleValidClass: ""
            })
        }
    });

    saveButton.addEventListener("click", (event) => {
        event.preventDefault();
        validator.validate().then((status) => {
            if (status === "Valid") {
                Guardar();
            } else {
                console.warn("El formulario contiene errores de validación.");
            }
        }).catch((error) => {
            console.error("Error en la validación del formulario:", error);
        });
    });
};
const initApp = () => {
    // fechador();
    Inicializa();
    initFormValidation();
};

let imgBase64 = null;
let imgCambiada = '0';
function LlenaTabla() {
    const tableElement = document.getElementById('grData');
    // Destruye la tabla existente para evitar conflictos al recargar datos
    if ($.fn.DataTable.isDataTable('#grData')) {
        $('#grData').DataTable().destroy();
    }
    Swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {
            // Realizar la llamada AJAX
            $.ajax({
                type: 'GET',
                url: '/Categorias/GetData',
                data: {
                    idEmpresa: getSessionValue('idEmpresa'),
                    cadena: getSessionValue('cadenaBase64'),
                    empresa: getSessionValue('empresa'),
                    correo: getSessionValue('correo')
                },
                contentType: 'application/json; charset=utf-8',
                success: function (data) {
                    $('#grData').DataTable({
                        "data": data.aaData,
                        "language": {
                            url: '//cdn.datatables.net/plug-ins/3cfcc339e89/i18n/Spanish.json'
                        },
                        "columns": [
                            { "data": "0", "orderable": false, "width": "60px" },
                            { "data": "1" },
                            { "data": "2" },
                            { "data": "3" }
                        ],
                        "filter": true,
                        "pagingType": "simple_numbers",
                        "info": true,
                        "fnDrawCallback": function () {
                            Swal.close();
                        },
                        "order": [
                            [1, 'asc']
                        ],
                        "buttons": [
                            { extend: 'print', className: 'btn dark btn-outline', text: 'Imprimir' },
                            { extend: 'pdf', className: 'btn green btn-outline' },
                            { extend: 'excel', className: 'btn yellow btn-outline' },
                            { extend: 'csv', className: 'btn purple btn-outline' }
                        ],
                        "lengthMenu": [
                            [10, 15, 20, -1],
                            [10, 15, 20, "Todos"]
                        ],
                        "pageLength": 10,
                        dom: `<'row'<'col-sm-6 text-left'f><'col-sm-6 text-right'B>>
                              <'row'<'col-sm-12'tr>>
                              <'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 dataTables_pager'lp>>`,
                    });
                    tableElement.style.display = 'table';
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('error', errorThrown);
                    alert(`[GetData] status: ${textStatus} - ${errorThrown}`);
                }
            });
        }
    });
}
function Editar(cual) {
    console.log(cual); // Verifica que 'cual' no sea null o undefined
    document.getElementById('valorId').value = cual

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: '/Categorias/GetCategoria',
        data: {
            lla: cual,
            idEmpresa: getSessionValue('idEmpresa'),
            cadena: getSessionValue('cadenaBase64'),
            empresa: getSessionValue('empresa')
        },
        dataType: "json",
        success: function (data) {
            console.log(data); // Para verificar la estructura de la respuesta
            $('#modalNuevo').modal('show');
            // $('#modalTitle').html('Categoría');
            $('#txNombre').val(data.d.nombre);
            $('#txNotas').val(data.d.notas);

        },
        error: function (xhr, status, error) {
            console.error(`[GetCategoria] status: ${xhr.status} responseText: ${xhr.responseText}`);
            alert(`[GetCategoria] status: ${xhr.status} responseText: ${xhr.responseText}`);
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
                url: '/Categorias/GuardaCategoria',
                data: {
                    llav: document.getElementById('valorId').value,
                    nomb: document.getElementById('txNombre').value,
                    nota: document.getElementById('txNotas').value,
                    idEmpresa: getSessionValue('idEmpresa'),
                    cadena: getSessionValue('cadenaBase64'),
                    empresa: getSessionValue('empresa')
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
                    console.error('[GuardaCategoria] status:', xhr.status, 'responseText:', xhr.responseText);
                }
            });
        }
    });
}
