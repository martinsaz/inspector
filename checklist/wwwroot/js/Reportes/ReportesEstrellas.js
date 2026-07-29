var idSucursal = "";
var idUsuario = "";
const selectElement = document.getElementById('cbTipoPregunta');
jQuery(document).ready(function () {
    Inicializa();
    LlenaCombos();
    ObtenerSucursal();
    //componentes.init()
    inicializarFiltroTipoPregunta();
    
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
        url: '/ReporteEstrellas/Inicializa',
        data: {
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: 'json',
        success: function (data) {
            if (data.perm != 1) {
              //  $('#btNuevo').hide();
            }
        },
        error: function (xhr, textStatus, error) {
            alert('[Inicializa] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });
}

const inicializarFiltroTipoPregunta = () => {
    const items = [
        { value: '0', text: 'Selecciona un tipo de pregunta' },
        { value: '1', text: 'Calificación' },
        { value: '5', text: 'Numeros' },
        
    ];

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.value;
        option.text = item.text;
        selectElement.appendChild(option);
    });
}
function ObtenerSucursal() {
    var obj = {};
    obj.opci = "1";


    //$.ajax({
    //    type: 'POST',
    //    async: true,
    //    contentType: 'application/json; charset=utf-8',
    //    url: '/Resultados/GetSucursales',
    //    data: JSON.stringify(obj),
    //    dataType: 'json',
    //    success: function (data) {
    //        $('#cbSucursal').html(data.d);
    //    },
    //    error: function (xhr, textStatus, error) {
    //        alert('[GetEspecialidades] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
    //    }
    //});

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
        url: '/Resultados/GetListasCerradasComboBox',
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
            $.ajax({
                url: "/ReporteEstrellas/GetData",
                type: "GET",
                contentType: "application/json",
                data: {
                    idLista: $('#cbEvaluaciones').val(),
                    idUsuario: $('#cbUsuario').val(),
                    idSucursal: $('#cbSucursal').val(),
                    tipoPregunta: $('#cbTipoPregunta').val(),
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
                        createdRow: function (row, data, dataIndex) {
                            // Aplicar estilos a las columnas 4 y 5
                            [3, 4].forEach(colIndex => {
                                const cellValue = parseFloat(data[colIndex]); // Obtener el valor de la celda
                                const cell = $('td', row).eq(colIndex); // Obtener la celda correspondiente

                                if (cellValue < 2.69) {
                                    // Si el valor es menor que 2.69, fondo rojo
                                    cell.css('background-color', '#FF000080'); // Fondo rojo claro
                                    cell.css('color', '#FF0000'); // Texto rojo
                                } else if (cellValue >= 2.70 && cellValue <= 3.99) {
                                    // Si el valor está entre 2.70 y 3.99, fondo naranja
                                    cell.css('background-color', '#FFFF0080'); // Fondo naranja
                                    cell.css('color', '#000000'); // Texto negro
                                } else if (cellValue >= 4 && cellValue <= 5) {
                                    // Si el valor es entre 4 y 5, fondo verde
                                    cell.css('background-color', '#00FF0080'); // Fondo verde claro
                                    cell.css('color', '#006400'); // Texto verde oscuro
                                }
                            });
                        },
                        order: [
                            [1, 'asc']
                        ],
                        buttons: [
                            { extend: 'print', className: 'btn dark btn-outline', text: 'Imprimir' },
                            { extend: 'pdf', className: 'btn green btn-outline' },
                            {
                                text: 'Excel',
                                action: function (e, dt, button, config) {
                                    const wb = new ExcelJS.Workbook();
                                    const ws = wb.addWorksheet('Datos');

                                    // Agregar encabezados (nombres de las columnas)
                                    const headers = ['Sucursal', 'Nombre lista', 'Última fecha Evaluación', 'Promedio Últimos 12 meses', 'Promedio Última evaluación'];
                                    ws.addRow(headers);

                                    // Añadir las filas de datos
                                    parsedJson.aaData.forEach((row, rowIndex) => {
                                        const newRow = ws.addRow(Object.values(row));

                                        // Aplicar estilos a las columnas 3, 4 y 5
                                        [3, 4].forEach(colIndex => {
                                            const cell = ws.getCell(`${String.fromCharCode(65 + colIndex)}${rowIndex + 2}`);
                                            const cellValue = parseFloat(cell.value);

                                            if (cellValue < 2.69) {
                                                // Si el valor es menor que 2.69, fondo rojo
                                                cell.fill = {
                                                    type: 'pattern',
                                                    pattern: 'solid',
                                                    fgColor: { argb: 'FFFFCCCC' }
                                                };
                                                cell.font = { color: { argb: 'FFFF0000' } };
                                            } else if (cellValue >= 2.70 && cellValue <= 3.99) {
                                                // Si el valor está entre 2.70 y 3.99, fondo naranja
                                                cell.fill = {
                                                    type: 'pattern',
                                                    pattern: 'solid',
                                                    fgColor: { argb: 'fbff00' }
                                                };
                                                cell.font = { color: { argb: 'FF000000' } };
                                            } else if (cellValue >= 4 && cellValue <= 5) {
                                                // Si el valor es entre 4 y 5, fondo verde
                                                cell.fill = {
                                                    type: 'pattern',
                                                    pattern: 'solid',
                                                    fgColor: { argb: 'FF90EE90' }
                                                };
                                                cell.font = { color: { argb: 'FF006400' } };
                                            }
                                        });
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
                        dom: "<'row'<'col-sm-6 text-left'f><'col-sm-6 text-right'B>>" +
                            "<'row'<'col-sm-12'tr>>" +
                            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 dataTables_pager'lp>>"
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
