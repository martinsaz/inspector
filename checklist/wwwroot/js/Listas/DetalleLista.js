//var pickerFechaDel = '';
//var pickerFechaAl = '';
jQuery(document).ready(function () {
    LlenaCombos();
    Inicializa();
    //componentes.init()
  
});

function Inicializa() {
    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/DetalleLista/Inicializa',
        data: {
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: 'json',
        success: function (data) {
            if (data.perm != 1) {
               // $('#btNuevo').hide();
            }
        },
        error: function (xhr, textStatus, error) {
            alert('[Inicializa] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });
}

document.getElementById('btBuscar').addEventListener('click', function () {

    LlenaTabla();

});
function LlenaCombos() {
    var obj = {};
    obj.opci = "1";

    // Combo 1: cbListas
    $('#cbListas').select2({
        minimumInputLength: 0,
        allowClear: true,
        placeholder: '',
        ajax: {
            quietMillis: 150,
            url: "/DetalleLista/GetListasTodosSinFiltro",
            type: 'GET',
           
            dataType: 'json',
           
            contentType: 'application/json; charset=utf-8',
            data: function (valores) {
                console.log(valores.term)
                if (!valores.term) { valores.term = ''; }
                var queryParameters = {
                    searchTerm: JSON.stringify(valores.term),
                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa'),
                    correo: sessionStorage.getItem('correo')
                };
                return queryParameters;
            },
            processResults: function (data, params) {
                var formattedData = data.d.map(function (item) {
                    return {
                        id: item.id,
                        text: item.text,
                    };
                });
                return {
                    results: formattedData
                };
            }
        },
        templateSelection: function (data) {
            return data.text;
        }
    }).on('select2:open', function () {
        $('.select2-search__field').attr('placeholder', 'Buscar...');
    });

    //$.ajax({
    //    type: 'POST',
    //    async: true,
    //    contentType: 'application/json; charset=utf-8',
    //    url: '/DetalleLista/GetListasTodosSinFiltro',
    //    data: JSON.stringify(obj),
    //    dataType: 'json',
    //    success: function (data) {
    //        $('#cbEvaluaciones').html(data.d);
    //    },
    //    error: function (xhr, textStatus, error) {
    //        alert('[GetEspecialidades] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
    //    }
    //});

    //$.ajax({
    //    type: 'POST',
    //    async: true,
    //    contentType: 'application/json; charset=utf-8',
    //    url: '/DetalleLista/GetUusariosComboBox',
    //    data: JSON.stringify(obj),
    //    dataType: 'json',
    //    success: function (data) {
    //        $('#cbUsuario').html(data.d);
    //    },
    //    error: function (xhr, textStatus, error) {
    //        alert('[GetEspecialidades] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
    //    }
    //});





}
//var componentes = function () {
//    var fechador2

//    fechador2 = function () {
//        var fechaActual = new Date().toISOString().slice(0, 10);
//        pickerFechaAl = new tempusDominus.TempusDominus(document.getElementById("dpFechaNace2"), {
//            defaultDate: fechaActual, // Establecer la fecha actual como valor inicial

//            localization: {
//                locale: "es",
//                startOfTheWeek: 1,
//                format: "yyyy/MM/dd"
//            },
//            display: {
//                viewMode: "calendar",
//                components: {
//                    decades: true,
//                    year: true,
//                    month: true,
//                    date: true,
//                    hours: false,
//                    minutes: false,
//                    seconds: false
//                }
//            }
//        });

//    };
//    var fechador = function () {
//        var fechaActual = new Date().toISOString().slice(0, 10);
//        pickerFechaDel = new tempusDominus.TempusDominus(document.getElementById("dpFechaNace"), {
//            defaultDate: fechaActual,
//            localization: {
//                locale: "es",
//                startOfTheWeek: 1,
//                format: "yyyy/MM/dd"
//            },
//            display: {
//                viewMode: "calendar",
//                components: {
//                    decades: true,
//                    year: true,
//                    month: true,
//                    date: true,
//                    hours: false,
//                    minutes: false,
//                    seconds: false
//                }
//            }
//        });

//    };
//    return {
//        init: function () {
//            fechador(), fechador2();
//        }
//    };
//}();
function LlenaTabla() {
    var table = $('#grData').DataTable();
    table.destroy();

    swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {
            var fechaInicio = "1990-09-27";
            var fechaFin = "2030-09-27";

            console.log("Fecha Inicio:", fechaInicio);
            console.log("Fecha Fin:", fechaFin);
            console.log("ID Lista:", $('#cbEvaluaciones').val());

            $.ajax({
                url: "/DetalleLista/GetData",
                type: "GET",
                contentType: "application/json",
                data: {
                    idLista: $('#cbEvaluaciones').val(),
                    // idUsuario: $('#cbUsuario').val(),
                    fechaInicia: fechaInicio,
                    fechaFin: fechaFin,
                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa'),
                    correo: sessionStorage.getItem('correo')

                },
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
                            { data: "5" }
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
                    console.error('[GetDataCursos] status:', xhr.status, ', responseText:', xhr.responseText, ', textStatus:', textStatus, ', error:', error);
                    alert('[GetDataCursos] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
                }
            });
        }
    });
}
