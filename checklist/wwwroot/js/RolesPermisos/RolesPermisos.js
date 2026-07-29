
var componentes = function () {
    var s1 = function () {
        $('#cbRol').select2({
            minimumInputLength: 0,
            //width: 'resolve',
            allowClear: true,
            placeholder: '',
            ajax: {
                type: 'GET',
                quietMillis: 150,
                url: "/RolesPermisos/GetRoles",
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
    };
    return {
        init: function () {
            s1();
        }
    };
}();
function Inicializa() {
    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/RolesPermisos/Inicializa',
        data: {
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: 'json',
        success: function (data) {
            if (data.perm != 1) {
                $('#btNuevoRol').hide();
                $('#btGuardaRol').hide();

            }
        },
        error: function (xhr, textStatus, error) {
            alert('[Inicializa] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });
}
jQuery(document).ready(function () {
    ilumina('m04000000', 'm04002000');
    PintaRuta('m04002000');
    componentes.init();
    Inicializa()

    $('#cbRol').change(function () {
        deshabilita();
        if ($('#cbRol').val()) {
            $('#valorId').val($('#cbRol').val());

            $.ajax({
                type: 'GET',
                async: true,
                contentType: 'application/json; charset=utf-8',
                url: '/RolesPermisos/GetRol',
                data: {
                    cua: $('#cbRol').val(),
                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa'),
                    correo: sessionStorage.getItem('correo')
                },
                dataType: 'json',
                success: function (data) {
                    data.result.forEach(function (item) {
                        $(item.nombre).prop('checked', (item.valor === 'true'));
                    });
                },
                error: function (xhr, textStatus, error) {
                    alert('[GetRol] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
                }
            });
        }
    });
    $('#btNuevoRol').click(function () {
        $('#txNombre').val('');
        $('#mdRol').modal('show');
    });
    $('#btGuardaRol').click(function () {
        if ($('#txNombre').val()) {

            $.ajax({
                type: 'GET',
                async: true,
                contentType: 'application/json; charset=utf-8',
                url: '/RolesPermisos/GuardaRol',
                data: {
                    nom: $('#txNombre').val(),
                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa'),
                    correo: sessionStorage.getItem('correo')

                },
                dataType: 'json',
                success: function (data) {
                    if (data.d == "Registro insertado correctamente" || data.d == "Registro actualizado correctamente") {
                        swal.fire({
                            text: 'Se ha guardado el registro',
                            icon: "success",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, entendido!",
                            customClass: {
                                confirmButton: "btn font-weight-bold btn-light-primary"
                            }
                        }).then(function () {
                            $('#mdRol').modal('hide');
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
                error: function (xhr, textStatus, error) {
                    alert('[GuardaRol] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
                }
            });
        } else {
            swal.fire({
                text: 'Debe especificar un nombre de rol',
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "Ok, entendido!",
                customClass: {
                    confirmButton: "btn font-weight-bold btn-light-primary"
                }
            });
        }
    });

    $('#swMenuListas').change(function () {
        if (this.checked) {
            $('#areaMenuListas').show();
        } else {
            $('#areaMenuListas').hide();
        }
    });

    $('#swMenuRecolecciones').change(function () {
        if (this.checked) {
            $('#areaMenuRecolecciones').show();
        } else {
            $('#areaMenuRecolecciones').hide();
        }
    });

    $('#swMenuReportes').change(function () {
        if (this.checked) {
            $('#areaMenuReportes').show();
        } else {
            $('#areaMenuReportes').hide();
        }
    });

    $('#swMenuAjustes').change(function () {
        if (this.checked) {
            $('#areaMenuAjustes').show();
        } else {
            $('#areaMenuAjustes').hide();
        }
    });

    // End Menus Principales

    // Listas
    $('#sw01000000A').change(function () {
        if (this.checked) {
            $('#areaLista').show();
        } else {
            $('#areaLista').hide();
        }
    });

    $('#sw01001000A').change(function () {
        if (this.checked) {
            $('#areaABCListas').show();
        } else {
            $('#areaABCListas').hide();
        }
    });
    //Nueva (creador)
    $('#sw01001001A').change(function () {
        $('#sw01001001W').prop('disabled', !this.checked);
    });
    //Abiertas
    $('#sw01001002A').change(function () {
        $('#sw01001002W').prop('disabled', !this.checked);
    });
    //Mis Listas
    $('#sw01001003A').change(function () {
        $('#sw01001003W').prop('disabled', !this.checked);
    });

    $('#sw01002000A').change(function () {
        if (this.checked) {
            $('#areaCategorizacion').show();
        } else {
            $('#areaCategorizacion').hide();
        }
    });
    //Categorías
    $('#sw01002001A').change(function () {
        $('#sw01002001W').prop('disabled', !this.checked);
    });
    //Subcategorías
    $('#sw01002002A').change(function () {
        $('#sw01002002W').prop('disabled', !this.checked);
    });

    // End Listas

    // Recolecciones
    $('#sw02000000A').change(function () {
        if (this.checked) {
            $('#areaRecoleccion').show();
        } else {
            $('#areaRecoleccion').hide();
        }
    });
    /*$('#sw02001000A').change(function () {
        if (this.checked) {
            $('#areaNuevaLista').show();
        } else {
            $('#areaNuevaLista').hide();
        }
    });*/
    // Nueva 
    $('#sw02001000A').change(function () {
        $('#sw02001000W').prop('disabled', !this.checked);
    });

    $('#sw02005000A').change(function () {
        $('#sw02005000W').prop('disabled', !this.checked);
    });

    // Nueva OFFLINE
  /*  $('#sw02002000A').change(function () {
        $('#sw02002000W').prop('disabled', !this.checked);
    });*/

    // Listado
    $('#sw02003000A').change(function () {
        $('#sw02003000W').prop('disabled', !this.checked);
    });
    // Detalle
    $('#sw02004000A').change(function () {
        $('#sw02004000W').prop('disabled', !this.checked);
    });

    // End Recolecciones

    // Reportes
    $('#sw03000000A').change(function () {
        if (this.checked) {
            $('#areaReporte').show();
        } else {
            $('#areaReporte').hide();
        }
    });
    $('#sw03001000A').change(function () {
        if (this.checked) {
            $('#areaEstrella').show();
        } else {
            $('#areaEstrella').hide();
        }
    });
    // Estrellas Contraido
    $('#sw03001001A').change(function () {
        $('#sw03001001W').prop('disabled', !this.checked);
    });
    // Estrellas con Categorías
    $('#sw03001002A').change(function () {
        $('#sw03001002W').prop('disabled', !this.checked);
    });
    // Listado Recolecciones
    $('#sw03002000A').change(function () {
        $('#sw03002000W').prop('disabled', !this.checked);
    });
    // End Reportes

    // Ajustes
    $('#sw04000000A').change(function () {
        if (this.checked) {
            $('#areaAjuste').show();
        } else {
            $('#areaAjuste').hide();
        }
    });
    $('#sw04001000A').change(function () {
        if (this.checked) {
            $('#areaUsuarios').show();
        } else {
            $('#areaUsuarios').hide();
        }
    });
    // ABC Usuarios
    $('#sw04001001A').change(function () {
        $('#sw04001001W').prop('disabled', !this.checked);
    });
    // Departamentos
    $('#sw04001002A').change(function () {
        $('#sw04001002W').prop('disabled', !this.checked);
    });
    // Puestos
    $('#sw04001003A').change(function () {
        $('#sw04001003W').prop('disabled', !this.checked);
    });
    // Roles y Permisos
    $('#sw04002000A').change(function () {
        $('#sw04002000W').prop('disabled', !this.checked);
    });
    // Sucursales
    $('#sw04003000A').change(function () {
        $('#sw04003000W').prop('disabled', !this.checked);
    });

    // Razones Sociales
    $('#sw04004000A').change(function () {
        $('#sw04004000W').prop('disabled', !this.checked);
    });
    // Regiones
    $('#sw04005000A').change(function () {
        $('#sw04005000W').prop('disabled', !this.checked);
    });

    // End Ajustes
    $('#Guardar').click(function () {
        if ($('#cbRol option:selected').text() != 'SuperAdmin') {
            if ($('#cbRol').val()) {
                $.ajax({
                    type: 'POST',
                    async: true,
                    //contentType: 'application/json; charset=utf-8',
                    url: '/RolesPermisos/GuardaPerm',
                    data: {
                        llavero: $('#valorId').val(),
                        nombrer: $('#cbRol option:selected').text(),

                        idEmpresa: sessionStorage.getItem('idEmpresa'),
                        cadena: sessionStorage.getItem('cadenaBase64'),
                        empresa: sessionStorage.getItem('empresa'),
                        correo: sessionStorage.getItem('correo'),

                        //LISTAS
                        mnlista: $('#swMenuListas').is(':checked'),
              
                        //ABC Listas
                        mnlistaabc: $('#sw01001000A').is(':checked'),

                        mncrealistaa: $('#sw01001001A').is(':checked'),
                        mncrealistaw: $('#sw01001001W').is(':checked'),
                        mnprocesoa: $('#sw01001002A').is(':checked'),
                        mnprocesow: $('#sw01001002W').is(':checked'),
                        mnmislistasa: $('#sw01001003A').is(':checked'),
                        mnmislistasw: $('#sw01001003W').is(':checked'),

                        //Categorización
                        mncategorizacion: $('#sw01002000A').is(':checked'),

                        mncategoria: $('#sw01002001A').is(':checked'),
                        mncategoriaw: $('#sw01002001W').is(':checked'),
                        mnsubcategoria: $('#sw01002002A').is(':checked'),
                        mnsubcategoriaw: $('#sw01002002W').is(':checked'),

                        //RECOLECCIONES
                        mnrecolecciones: $('#swMenuRecolecciones').is(':checked'),

                        //Nueva
                        mnnuevar: $('#sw02001000A').is(':checked'),
                        mnnuevarw: $('#sw02001000W').is(':checked'),
                        //Inspeccion en campo
                        mninspeccioncampo: $('#sw02005000A').is(':checked'),
                        mninspeccioncampow: $('#sw02005000W').is(':checked'),
                        //Nueva Offline
                       // mnnuevaroff: $('#sw02002000A').is(':checked'),
                      //  mnnuevaroffw: $('#sw02002000W').is(':checked'),
                        //Listado
                        mnresultados: $('#sw02003000A').is(':checked'),
                        mnresultadosw: $('#sw02003000W').is(':checked'),
                        //Detalle
                        mnrespuestas: $('#sw02004000A').is(':checked'),
                        mnrespuestasw: $('#sw02004000W').is(':checked'),

                        //REPORTES
                        mnreportes: $('#swMenuReportes').is(':checked'),

                        //Estrella
                        mnestrella: $('#sw03001000A').is(':checked'),

                        mncontraido: $('#sw03001001A').is(':checked'),
                        mncontraidow: $('#sw03001001W').is(':checked'),
                        mnccat: $('#sw03001002A').is(':checked'),
                        mnccatw: $('#sw03001002W').is(':checked'),

                        //Listado Recolecciones
                        mnlistado: $('#sw03002000A').is(':checked'),
                        mnlistadow: $('#sw03002000W').is(':checked'),

                        //AJUSTES
                        mnajustes: $('#swMenuAjustes').is(':checked'),

                        //Usuarios
                        mnusuarios: $('#sw04001000A').is(':checked'),
                                       
                        mnabcus: $('#sw04001001A').is(':checked'),
                        mnabcusw: $('#sw04001001W').is(':checked'),
                        mndepto: $('#sw04001002A').is(':checked'),
                        mndeptow: $('#sw04001002W').is(':checked'),
                        mnpuesto: $('#sw04001003A').is(':checked'),
                        mnpuestow: $('#sw04001003W').is(':checked'),

                        //Roles y Permisos
                        mnroles: $('#sw04002000A').is(':checked'),
                        mnrolesw: $('#sw04002000W').is(':checked'),

                        //Sucursales
                        mnsucursales: $('#sw04003000A').is(':checked'),
                        mnsucursalesw: $('#sw04003000W').is(':checked'),

                        //Razones Sociales
                        mnrazones: $('#sw04004000A').is(':checked'),
                        mnrazonesw: $('#sw04004000W').is(':checked'),

                        //Regiones
                        mnregiones: $('#sw04005000A').is(':checked'),
                        mnregionesw: $('#sw04005000W').is(':checked'),

                    },
                    dataType: 'json',
                    success: function (data) {
                        if (data.d == "Registro actualizado correctamente") {
                            swal.fire({
                                text: 'Se ha guardado el registro',
                                icon: "success",
                                buttonsStyling: false,
                                confirmButtonText: "Ok, entendido!",
                                customClass: {
                                    confirmButton: "btn font-weight-bold btn-light-primary"
                                }
                            }).then(function () {
                                $('#mdRol').modal('hide');
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
                    error: function (xhr, textStatus, error) {
                        alert('[GuardaPerm] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
                    }
                });
            } else {
                swal.fire({
                    text: 'Debe seleccionar un rol',
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, entendido!",
                    customClass: {
                        confirmButton: "btn font-weight-bold btn-light-primary"
                    }
                });
            }
        } else {
            swal.fire({
                text: 'No se pueden cambiar los permisos del SuperAdmin',
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "Ok, entendido!",
                customClass: {
                    confirmButton: "btn font-weight-bold btn-light-primary"
                }
            });
        }
    });

});

function deshabilita() {
    //LISTAS
    $('#swMenuListas').prop('checked', false);
    $('#sw01000000A').prop('checked', false);
    $('#sw01001000A').prop('checked', false);
    $('#sw01001001A').prop('checked', false);
    $('#sw01001001W').prop('checked', false);
    $('#sw01001002A').prop('checked', false);
    $('#sw01001002W').prop('checked', false);
    $('#sw01001003A').prop('checked', false);
    $('#sw01001003W').prop('checked', false);
    $('#sw01002000A').prop('checked', false);
    $('#sw01002000W').prop('checked', false);
    $('#sw01002001A').prop('checked', false);
    $('#sw01002001W').prop('checked', false);
    $('#sw01002002A').prop('checked', false);
    $('#sw01002002W').prop('checked', false);
    //RECOLECCIÓN
    $('#swMenuRecolecciones').prop('checked', false);
    $('#sw02000000A').prop('checked', false);
    $('#sw02001000A').prop('checked', false);
    $('#sw02001000A').prop('checked', false);
    $('#sw02001000W').prop('checked', false);
    $('#sw02005000A').prop('checked', false);
    $('#sw02005000W').prop('checked', false);
   // $('#sw02002000A').prop('checked', false);
   // $('#sw02002000W').prop('checked', false);
    $('#sw02003000A').prop('checked', false);
    $('#sw02003000W').prop('checked', false);
    $('#sw02004000A').prop('checked', false);
    $('#sw02004000W').prop('checked', false);
    //REPORTES
    $('#swMenuReportes').prop('checked', false);
    $('#sw03000000A').prop('checked', false);
    $('#sw03001000A').prop('checked', false);
    $('#sw03001001A').prop('checked', false);
    $('#sw03001001W').prop('checked', false);
    $('#sw03001002A').prop('checked', false);
    $('#sw03001002W').prop('checked', false);
    $('#sw03002000A').prop('checked', false);
    $('#sw03002000W').prop('checked', false);
    //AJUSTES
    $('#swMenuAjustes').prop('checked', false);
    $('#sw04000000A').prop('checked', false);
    $('#sw04001000A').prop('checked', false);
    $('#sw04001001A').prop('checked', false);
    $('#sw04001001W').prop('checked', false);
    $('#sw04001002A').prop('checked', false);
    $('#sw04001002W').prop('checked', false);
    $('#sw04001003A').prop('checked', false);
    $('#sw04001003W').prop('checked', false);
    $('#sw04002000A').prop('checked', false);
    $('#sw04002000W').prop('checked', false);
    $('#sw04003000A').prop('checked', false);
    $('#sw04003000W').prop('checked', false);
    $('#sw04004000A').prop('checked', false);
    $('#sw04004000W').prop('checked', false);
    $('#sw04005000A').prop('checked', false);
    $('#sw04005000W').prop('checked', false);

}
