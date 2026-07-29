var idSucursal = "";
var idUsuario = "";
var map;
jQuery(document).ready(function () {
    //LlenaCombos();
    //ObtenerSucursal();
   // componentes.init()
    LlenaTablaRespuesta();
    initMap();

});

function Inicializa() {
    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/MisListas/Inicializa',
        data: {
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: 'json',
        success: function (data) {
            if (data.perm != 1) {
             //   $('#btNuevo').hide();
            }
        },
        error: function (xhr, textStatus, error) {
            alert('[Inicializa] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });
}
function mostrarLozalizacion(latitud, longitud) {
    $('#modalLozalizacion').modal('show');
    initMap();
    var localizacion = {
        lat: Number(latitud),
        lng: Number(longitud)
    }
    marcarPosicion(localizacion);
}
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: 21.139258165822927,
            lng: -101.70655989239731
        },
        zoom: 10,
    });
}
function marcarPosicion(localizacion) {
    var marker = new google.maps.Marker({
        position: localizacion,
        map: map,
    });
}
function ObtenerSucursal() {
    var obj = {};
    obj.opci = "1";


    $.ajax({
        type: 'POST',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/Resultados/GetSucursales',
        data: JSON.stringify(obj),
        dataType: 'json',
        success: function (data) {
            $('#cbSucursal').html(data.d);
        },
        error: function (xhr, textStatus, error) {
            alert('[GetEspecialidades] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });

}
function ObtenerUsuariosXSucursal(selectedValue) {
    var obj = {};
    obj.idSucursal = selectedValue;


    $.ajax({
        type: 'POST',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/Resultados/GetUsuariosXSucursal',
        data: JSON.stringify(obj),
        dataType: 'json',
        success: function (data) {
            $('#cbUsuario').html(data.d);
        },
        error: function (xhr, textStatus, error) {
            alert('[GetEspecialidades] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });

}
//document.getElementById('btBuscar').addEventListener('click', function () {

//    LlenaTablaRespuesta();
//});
function LlenaCombos() {
    var obj = {};
    obj.opci = "1";

    $.ajax({
        type: 'POST',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/Resultados/GetListasCerradasComboBox',
        data: JSON.stringify(obj),
        dataType: 'json',
        success: function (data) {
            $('#cbEvaluaciones').html(data.d);
        },
        error: function (xhr, textStatus, error) {
            alert('[GetEspecialidades] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });

}
function Editar(cual) {
    $('#valorId').val(cual);

    console.log(cual)
    var obj = {};
    obj.lla = cual;
    $.ajax({
        async: false,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: '/Consulta/GetElementoProgramacion',
        data: JSON.stringify(obj),
        dataType: "json",
        success: function (data) {
            // $('#modalNuevo').modal('show');
            // $('#modalTitle').html('Programacion');
            console.log(data.d);
        },
        error: function (xhr, status, error) {
            alert('[GetElemento] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
        }
    });
}
function LlenaTablaRespuesta() {
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
                url: "/MisListas/GetData",
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
                            { data: "8", orderable: false, width: "60px" }

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
function llenarComboProgramacionModal(cual, idUsuarioSelect) {

    var table = $('#grDataModal').DataTable();
    table.destroy();

    swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {

            $.ajax({
                url: "/Resultados/GetDataListas",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    idLista: cual,
                    idUsuario: idUsuarioSelect
                }),
                success: function (json) {
                    console.log("AJAX success response:", json);
                    var parsedJson = jQuery.parseJSON(json.d);
                    console.log("Parsed JSON:", parsedJson);
                    $('#modalNuevo').modal('show');
                    $('#grDataModal').DataTable({
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
                            { data: "7" }
                        ],
                        filter: true,
                        pagingType: "simple_numbers",
                        info: true,
                        drawCallback: function () {
                            swal.close();
                        },

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
function llenarComboProgramacionModalAnexo(event, cual) {
    // Prevenir el comportamiento predeterminado del botón
    event.preventDefault();

    var table = $('#grDataModalAnexo').DataTable();
    table.destroy();

    swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {
            $.ajax({
                url: "/Resultados/GetDataAnexos",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ idLista: cual }),
                success: function (json) {
                    console.log("AJAX success response:", json);
                    var parsedJson = jQuery.parseJSON(json.d);
                    console.log("Parsed JSON:", parsedJson);
                    $('#modalNuevoAnexo').modal('show');
                    $('#grDataModalAnexo').DataTable({
                        data: parsedJson.aaData,
                        language: { url: '//cdn.datatables.net/plug-ins/3cfcc339e89/i18n/Spanish.json' },
                        columns: [
                            { data: "0", orderable: false, width: "60px" },
                            { data: "1" },

                        ],
                        filter: true,
                        pagingType: "simple_numbers",
                        info: true,
                        drawCallback: function () {
                            swal.close();
                        },
                        order: [[1, 'asc']],
                        buttons: [
                            { extend: 'print', className: 'btn dark btn-outline', text: 'Imprimir' },
                            { extend: 'pdf', className: 'btn green btn-outline' },
                            { extend: 'excel', className: 'btn yellow btn-outline' },
                            { extend: 'csv', className: 'btn purple btn-outline' }
                        ],
                        lengthMenu: [[10, 15, 20, -1], [10, 15, 20, "Todos"]],
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

function mostrarDetalleLista(event, cual) {
    // Prevenir el comportamiento predeterminado del botón
    event.preventDefault();
    console.log("Valor recibido en mostrarDetalleLista:", cual);

    var table = $('#grDataModal').DataTable();
    table.destroy();

    swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {

            $.ajax({
                url: `/MisListas/GetDetalleLista?idLista=${cual}`,
                type: "POST",

               // data: JSON.stringify({ idLista: cual }),
                beforeSend: function () {
                    console.log("enviado:", JSON.stringify({ idLista: cual }));
                },
                               
                success: function (json) {
                    console.log("AJAX success response:", json);
                    var parsedJson = jQuery.parseJSON(json.d);
                    console.log("Parsed JSON:", parsedJson);
                    $('#modalNuevo2').modal('show');
                    $('#grDataModal').DataTable({
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
                            { data: "7" }
                        ],
                        filter: true,
                        pagingType: "simple_numbers",
                        info: true,
                        drawCallback: function () {
                            swal.close();
                        },

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
                    console.error('[GetDetalleLista] status:', xhr.status, ', responseText:', xhr.responseText, ', textStatus:', textStatus, ', error:', error);
                    alert('[GetDetalleLista] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
                }
            });


        }
    });
}