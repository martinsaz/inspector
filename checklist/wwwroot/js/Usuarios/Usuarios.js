let pickerNac = null;
let pickerIng = null;


document.addEventListener('DOMContentLoaded', () => {
    initApp();
    LlenaCombos();

    const imageInputElement = document.querySelector('#imgLogo');
    if (!imageInputElement) {
        console.error("El elemento #imgLogo no se encontró en el DOM.");
        return;
    }

    let imageInput = KTImageInput.getInstance(imageInputElement);
    if (!imageInput) {
        imageInput = new KTImageInput(imageInputElement);
    }

    imageInput.on('kt.imageinput.changed', () => {
        const imagenC = imageInput.getInputElement();
        const file = imagenC.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                imgBase64 = reader.result;
            };
            reader.readAsDataURL(file);
            imgCambiada = '1';
        }
    });
    LlenaTabla();

});

function Inicializa() {
    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/Usuario/Inicializa',
        data: {
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
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
    $('#dpFechaIngr_input').prop('disabled', true);
};

const initFormValidation = () => {
    const form = document.querySelector('#frmUsuario');
    const saveButton = document.querySelector('#btGuardar');

    const validator = FormValidation.formValidation(form, {
        fields: {
            txNombre: {
                validators: {
                    notEmpty: {
                        message: "Se requiere un Nombre"
                    }
                }
            },
            cbApaterno: {
                validators: {
                    notEmpty: {
                        message: "Se requiere el Apellido"
                    }
                }
            },
            cbAmaterno: {
                validators: {
                    notEmpty: {
                        message: "Se requiere el Apellido"
                    }
                }
            },
            txMovil: {
                validators: {
                    notEmpty: {
                        message: "Se requiere el Teléfono Móvil"
                    }
                }
            },
            txFijo: {
                validators: {
                    notEmpty: {
                        message: "Se requiere el Teléfono Fijo"
                    }
                }
            },
            txCorreoIns: {
                validators: {
                    regexp: {
                        regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "No es una dirección de email válida"
                    },
                    notEmpty: {
                        message: "Se requiere el Correo Institucional"
                    }
                }
            },
            txCorreoPer: {
                validators: {
                    regexp: {
                        regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "No es una dirección de email válida"
                    },
                    notEmpty: {
                        message: "Se requiere el Correo Personal"
                    }
                }
            },
            cbSucursal: {
                validators: {
                    notEmpty: {
                        message: "Se requiere el Plantel"
                    }
                }
            },
            cbDepartamento: {
                validators: {
                    notEmpty: {
                        message: "Se requiere el Departamento"
                    }
                }
            },
            cbPuesto: {
                validators: {
                    notEmpty: {
                        message: "Se requiere el Puesto"
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
            }
        });
    });
};

const initApp = () => {
    Inicializa();
    fechador();
    initFormValidation();
    getsad();
};

let imgBase64 = null;
let imgCambiada = '0';
function LlenaCombos() {

    $('#cbRol').select2({
        minimumInputLength: 0,
        //width: 'resolve',
        allowClear: true,
        placeholder: '',
        ajax: {
            quietMillis: 150,
            url: "/Usuario/GetRoles",
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: function (valores) {
                if (!valores.term) { valores.term = ''; }
                var queryParameters = {
                    searchTerm: valores.term,
                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa'),
                    correo: sessionStorage.getItem('correo')
                };
                return queryParameters;
            },
            processResults: function (data, params) {
                return {
                    results: data.d
                };
            }
        }
    });

    $('#cbSucursal').select2({
        minimumInputLength: 0,
        //width: 'resolve',
        allowClear: true,
        placeholder: '',
        ajax: {
            quietMillis: 150,
            url: "/Usuario/GetSucursales",
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: function (valores) {
                if (!valores.term) { valores.term = ''; }
                var queryParameters = {
                    searchTerm: valores.term,
                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa'),
                    correo: sessionStorage.getItem('correo')
                };
                return queryParameters;
            },
            processResults: function (data, params) {
                return {
                    results: data.d
                };
            }
        }
    });

    $('#cbDepartamento').select2({
        minimumInputLength: 0,
        //width: 'resolve',
        allowClear: true,
        placeholder: '',
        ajax: {
            quietMillis: 150,
            url: "/Usuario/GetDepartamentos",
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: function (valores) {
                if (!valores.term) { valores.term = ''; }
                var queryParameters = {
                    searchTerm: valores.term,
                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa'),
                    correo: sessionStorage.getItem('correo')
                };
                return queryParameters;
            },
            processResults: function (data, params) {
                return {
                    results: data.d
                };
            }
        }
    });
  
    $('#cbPuesto').select2({
        minimumInputLength: 0,
        //width: 'resolve',
        allowClear: true,
        placeholder: '',
        ajax: {
            quietMillis: 150,
            url: "/Usuario/GetPuestos",
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: function (valores) {
                if (!valores.term) { valores.term = ''; }
                var queryParameters = {
                    searchTerm: valores.term,
                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa'),
                    correo: sessionStorage.getItem('correo')
                };
                return queryParameters;
            },
            processResults: function (data, params) {
                return {
                    results: data.d
                };
            }
        }
    });

}
function LlenaTabla() {
    const tableElement = document.getElementById('grData');
    if ($.fn.DataTable.isDataTable('#grData')) {
        $('#grData').DataTable().destroy();
    }
    swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {
            const url = `/Usuario/GetDataUsuarios?idEmpresa=${encodeURIComponent(sessionStorage.getItem('idEmpresa'))}&cadena=${encodeURIComponent(sessionStorage.getItem('cadenaBase64'))}&empresa=${encodeURIComponent(sessionStorage.getItem('empresa'))}&correo=${encodeURIComponent(sessionStorage.getItem('correo'))}`;
            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    $('#grData').DataTable({
                        "data": data.aaData,
                        language: {
                            url: '//cdn.datatables.net/plug-ins/3cfcc339e89/i18n/Spanish.json'
                        },
                        "columns": [
                            { "data": "0", "orderable": false, "width": "60px" },
                            { "data": "1", "className": "text-center" },
                            { "data": "2", "className": "text-center" },
                            { "data": "3", "className": "text-center" },
                            { "data": "4", "className": "text-center" },
                            { "data": "5", "className": "text-center" },
                            { "data": "6", "className": "text-center" },
                            { "data": "7", "className": "text-center" },
                            { "data": "8", "className": "text-center" },
                            { "data": "9", "className": "text-center" },
                            { "data": "10", "className": "text-center" },
                            { "data": "11", "className": "text-center" },
                            { "data": "12", "className": "text-center" },
                            { "data": "13", "className": "text-center" }

                        ],
                        "filter": true,
                        "pagingType": "simple_numbers",
                        "info": true,
                        "fnDrawCallback": function () {
                            swal.close();
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
                })
                .catch(error => {
                    alert(`[GetDataUsuarios] status: ${error.message}`);
                });
        }
    });
}
function EditarUsuario(cual) {
    document.getElementById('valorId').value = cual
    document.querySelector("#miTitulo").innerHTML = "Editar usuario";
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: '/Usuario/GetUsuario',
        data: {
            lla: cual,
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: "json",
        success: function (data) {
            $('#modalNuevo').modal('show');
            $('#modalTitle').text('Editar Usuario');
            var rolSelect = $('#cbRol');
            var option1 = new Option(data.d.nombreRol, data.d.idRol, true, true);
            rolSelect.append(option1).trigger('change');
            if (cual == $('#valsad').val()) {
                rolSelect.prop('disabled', true);
                $('#swStatus').prop('disabled', true);
            } else {
                rolSelect.prop('disabled', false);
                $('#swStatus').prop('disabled', true);
            }
            $('#txNombre').val(data.d.nombre);
            $('#txApaterno').val(data.d.aPaterno);
            $('#txAmaterno').val(data.d.aMaterno);
            const parsedNac = pickerNac.dates.parseInput(new Date(data.d.cadFechaNac));
            pickerNac.dates.setValue(parsedNac, pickerNac.dates.lastPickedIndex);
            $('#txNumero').val(data.d.numero);
            $('#txMovil').val(data.d.telefonoMovil);
            $('#txFijo').val(data.d.telefonoFijo);
            $('#txCorreoIns').val(data.d.correoInstitucional);
            $('#txCorreoIns').prop('disabled', true);
            $('#txCorreoPer').val(data.d.correoPersonal);
            $('#txCorreoPer').prop('disabled', true);
            var SelectS = $('#cbSucursal');
            var optionS = new Option(data.d.nombreSucursal, data.d.idSucursal, true, true);
            SelectS.append(optionS).trigger('change');
            var SelectD = $('#cbDepartamento');
            var optionD = new Option(data.d.nombreDepartamento, data.d.idDepartamento, true, true);
            SelectD.append(optionD).trigger('change');
            var SelectP = $('#cbPuesto');
            var optionP = new Option(data.d.nombrePuesto, data.d.idPuesto, true, true);
            SelectP.append(optionP).trigger('change');
            $(`input[name=rbEstadoDoc1][value="${data.d.valEstado}"]`).prop('checked', true);
            const parsedIng = pickerIng.dates.parseInput(new Date(data.d.cadFechaIng));
            pickerIng.dates.setValue(parsedIng, pickerIng.dates.lastPickedIndex);
            $('#swStatus').prop('checked', data.d.estatus);
            $('#txNotas').val(data.d.notas);
            $('#imgLogo').css('backgroundImage', `url(${data.d.fotoLink})`);
            $('#imgLogoWrapper').css('backgroundImage', `url(${data.d.fotoLink})`);
        },
        error: function (xhr, status, error) {
            console.error(`[GetUsuario] status: ${xhr.status} responseText: ${xhr.responseText}`);
            alert(`[GetUsuario] status: ${xhr.status} responseText: ${xhr.responseText}`);
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
            const obj = {
                llav: document.getElementById('valorId').value,
                nomb: document.getElementById('txNombre').value,
                apat: document.getElementById('txApaterno').value,
                amat: document.getElementById('txAmaterno').value,
                fena: pickerNac.dates.lastPicked,
                nume: document.getElementById('txNumero').value,
                movi: document.getElementById('txMovil').value,
                fijo: document.getElementById('txFijo').value,
                coin: document.getElementById('txCorreoIns').value,
                cope: document.getElementById('txCorreoPer').value,
                sucu: document.getElementById('cbSucursal').value,
                depa: document.getElementById('cbDepartamento').value,
                pues: document.getElementById('cbPuesto').value,
                esta: '1',
                fein: pickerIng.dates.lastPicked,
                stat: document.getElementById('swStatus').checked,
                im64: imgBase64,
                imca: imgCambiada,
                nota: document.getElementById('txNotas').value,
                idRol: document.getElementById('cbRol').value,
                idEmpresa: sessionStorage.getItem('idEmpresa'),
                cadena: sessionStorage.getItem('cadenaBase64'),
                empresa: sessionStorage.getItem('empresa'),
                correo: sessionStorage.getItem('correo')
            };
            $.ajax({
                async: true,
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: '/Usuario/GuardaUsuario',
                data: JSON.stringify(obj),
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
                    swal.fire({
                        text: 'Ups!!!',
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, entendido!",
                        customClass: {
                            confirmButton: "btn font-weight-bold btn-light-primary"
                        }
                    }).then(function () {
                        document.getElementById('modalNuevo').modal('hide');
                        LlenaTabla();
                    });
                    alert('[GuardaUsuario] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
                }
            });
        }
    });
}

function getsad() {
    $.ajax({
        async: true,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: '/Usuario/GetSad',
        dataType: "json",
        success: function (data) {
            swal.close();
            $('#valsad').val(data.d);
        },
        error: function (xhr, status, error) {
            alert('[GetSad] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
        }
    });
}
