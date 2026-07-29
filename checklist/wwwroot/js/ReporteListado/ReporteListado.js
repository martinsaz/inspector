var idSucursal = "";
var idUsuario = "";
jQuery(document).ready(function () {
    Inicializa();
    LlenaCombos();
    ObtenerSucursal();
    componentes.init()

    cbSucursal.addEventListener('change', function () {
        const selectedValue = this.value;
        idSucursal = selectedValue;
        console.log(idSucursal)
        if (selectedValue != 0) { ObtenerUsuariosXSucursal(selectedValue) }

    });
    cbUsuario.addEventListener('change', function () {
        const selectedValue = this.value;
        idUsuario = selectedValue;
        console.log(idUsuario)

    });
});
function Inicializa() {
    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/ReporteListado/Inicializa',
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
function ObtenerSucursal() {
    var obj = {};
    obj.opci = "1";

    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/ReporteListado/GetSucursales',
        data: {

            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
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
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/ReporteListado/GetUsuariosXSucursal',
        data: {
            idSucursal: selectedValue,
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: 'json',
        success: function (data) {
            $('#cbUsuario').html(data.d);
        },
        error: function (xhr, textStatus, error) {
            alert('[GetEspecialidades] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });

}
document.getElementById('btBuscar').addEventListener('click', function () {

    LlenaTablaRespuesta();
});
function LlenaCombos() {
    var obj = {};
    obj.opci = "1";

    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/ReporteListado/GetListasCerradasComboBox',
        data: {
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: 'json',
        success: function (data) {
            $('#cbEvaluaciones').html(data.d);
        },
        error: function (xhr, textStatus, error) {
            alert('[GetEspecialidades] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });

}
var componentes = function () {
    var fechador2

    fechador2 = function () {
        var fechaActual = new Date().toISOString().slice(0, 10);
        pickerFechaAl = new tempusDominus.TempusDominus(document.getElementById("dpFechaNace2"), {
            defaultDate: fechaActual,

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
    var fechador = function () {
        var fechaActual = new Date().toISOString().slice(0, 10);
        pickerFechaDel = new tempusDominus.TempusDominus(document.getElementById("dpFechaNace"), {
            defaultDate: fechaActual,
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
    return {
        init: function () {
            fechador(), fechador2();
        }
    };
}();
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
            console.log(pickerFechaAl.dates.lastPicked)
            var fechaInicio = moment(pickerFechaDel.dates.lastPicked).format("YYYY-MM-DD");
            var fechaFin = moment(pickerFechaAl.dates.lastPicked).format("YYYY-MM-DD");


            $.ajax({
                url: "/ReporteListado/GetData",
                type: "GET",
                contentType: "application/json",
                data: {
                    idLista: $('#cbEvaluaciones').val(),
                    idUsuario: $('#cbUsuario').val(),
                    idSucursal: $('#cbSucursal').val(),
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
                            { data: "4" }

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
function llenarComboProgramacionModal(cual, idSucursal, idLista) {
    var table = $('#grDataModal').DataTable();
    table.destroy();

    swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {
            $.ajax({
                url: "/ReporteListado/GetDataListas",
                type: "GET",
                contentType: "application/json",
                data: {
                    evento: cual,
                    idSucursal: idSucursal,
                    idLista: idLista,
                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa'),
                    correo: sessionStorage.getItem('correo')
                },
                success: function (json) {
                    console.log("AJAX success response:", json);
                    var parsedJson = jQuery.parseJSON(json.d);
                    console.log("Parsed JSON:", parsedJson);
                    $('#modalNuevo').modal('show');

                    // Inicializar DataTable
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
                            { data: "7" },
                            { data: "8" },
                            { data: "9" },
                            { data: "10" }
                        ],
                        rowCallback: function (row, data, index) {
                            // Pintar solo la columna K (índice 10)
                            $(row).find('td:eq(10)').css({
                                'background-color': '#ffffff',  // Fondo rojo claro
                                'color': '#000000'              // Texto rojo
                            });
                        },

                        filter: true,
                        pagingType: "simple_numbers",
                        info: true,
                        drawCallback: function () {
                            swal.close();
                        },

                        buttons: [
                            
                            { extend: 'print', className: 'btn dark btn-outline', text: 'Imprimir' },
                            { extend: 'pdf', className: 'btn green btn-outline' },
                            {
                                text: 'Excel',
                                action: function (e, dt, button, config) {
                                    const wb = new ExcelJS.Workbook();
                                    const ws = wb.addWorksheet('Datos');

                                    // Agregar encabezados (nombres de las columnas)
                                    const headers = ['Pregunta', 'Categoría', 'SubCategoría', 'Respuesta valor', 'Valor correcto', 'Fecha respuesta', 'Nota', 'Explicación', 'Usuario', 'Tipo de tarea', 'Ponderación']; // Cambia los nombres según corresponda
                                    ws.addRow(headers);

                                    // Añadir las filas de datos
                                    parsedJson.aaData.forEach((row, rowIndex) => {
                                        const newRow = ws.addRow(Object.values(row));

                                        // Aplicar estilos a la columna K
                                        const cellK = ws.getCell(`K${rowIndex + 2}`); // Columna K (rowIndex + 2 porque +1 es el encabezado)
                                        const cellValue = parseFloat(cellK.value); // Obtener el valor de la celda K

                                        if (cellValue < 50) {
                                            // Si el valor es menor que 50, fondo rojo
                                            cellK.fill = {
                                                type: 'pattern',
                                                pattern: 'solid',
                                                fgColor: { argb: 'FFFFCCCC' } // Fondo rojo claro
                                            };
                                            cellK.font = { color: { argb: 'FFFF0000' } }; // Texto rojo
                                        } else if (cellValue >= 50 && cellValue <= 70) {
                                            // Si el valor está entre 50 y 70, fondo naranja
                                            cellK.fill = {
                                                type: 'pattern',
                                                pattern: 'solid',
                                                fgColor: { argb: 'fbff00' } // Fondo naranja
                                            };
                                            cellK.font = { color: { argb: 'FF000000' } }; // Texto negro
                                        } else {
                                            // Si el valor es mayor que 70, fondo verde
                                            cellK.fill = {
                                                type: 'pattern',
                                                pattern: 'solid',
                                                fgColor: { argb: 'FF90EE90' } // Fondo verde claro
                                            };
                                            cellK.font = { color: { argb: 'FF006400' } }; // Texto verde oscuro
                                        }
                                    });

                                    // Guardar el archivo Excel
                                    wb.xlsx.writeBuffer().then(function (buffer) {
                                        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                                        const link = document.createElement('a');
                                        link.href = window.URL.createObjectURL(blob);
                                        link.download = 'datos_modificados.xlsx';
                                        link.click();
                                    });
                                }


                            },
                            { extend: 'csv', className: 'btn purple btn-outline' }
                        ],

                        lengthMenu: [
                            [10, 15, 20, -1],
                            [10, 15, 20, "Todos"]
                        ],
                        pageLength: 10,
                        dom: `<'row'<'col-sm-6 text-left'f><'col-sm-6 text-right'B>>
                              <'row'<'col-sm-12'tr>>
                              <'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 dataTables_pager'lp>>`
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
                url: "/ReporteListado/GetDataAnexos",
                type: "GET",
                contentType: "application/json",
                data: {
                    idLista: cual,
                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa'),
                    correo: sessionStorage.getItem('correo')
                },
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
