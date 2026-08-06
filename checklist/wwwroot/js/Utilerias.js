var inicia = '0';
$(document).ready(function () {
    validarSesion();
    consultarImagenPerfil();
    consumirAvisoModoTrabajo();
    BuildMenu();
    bindWorkModeTransition();


    //    getDatosEmpleado();


    // MostrarIMG();
});
function getDatosEmpleado() {
    //    $('#userData').html(decode_utf8(data.Empresa));
}



function consultarImagenPerfil() {
    const correo = sessionStorage.getItem('correo');
    const idEmpresa = sessionStorage.getItem('idEmpresa');
    const empresa = sessionStorage.getItem('empresa');
    const cadena = sessionStorage.getItem('cadenaBase64');
    // Realiza una petición AJAX al controlador para borrar el token de Firebase
    $.ajax({
        url: `/Login/ConsultarImagenPerfil?correo=${correo}&idEmpresa=${idEmpresa}&empresa=${empresa}&cadena=${cadena}`, // Cambia esto a la ruta correcta de tu controlador
        type: 'POST',
        success: function (response) {
            response.fotoLink
            $('.symbol img').attr('src', response.fotoLink);
        },
        error: function (xhr, status, error) {
            // Manejo de errores si es necesario
        }
    });
}


function validarSesion() {
    const userUid = sessionStorage.getItem('userUid');
    const tokenSesion = sessionStorage.getItem('fbToken');
    // Realiza una petición AJAX al controlador para borrar el token de Firebase
    $.ajax({
        url: `/Login/obtenerToken?userUid=${userUid}`, // Cambia esto a la ruta correcta de tu controlador
        type: 'POST',
        success: function (response) {
            if (response.token != "00000000-0000-0000-0000-000000000000") {
                if (tokenSesion !== response.token) {
                    swal.fire({
                        text: "Se inició sesión en otro dispositivo con su usuario",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, Entendido!",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        },
                        allowOutsideClick: false,   // Deshabilita cerrar al hacer clic fuera del modal
                        allowEscapeKey: false,      // Deshabilita cerrar usando la tecla Escape
                        allowEnterKey: false        // Deshabilita cerrar con la tecla Enter
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Si el usuario hace clic en "Ok, Entendido!", redirige al usuario
                            window.location.href = '/';
                        }
                    });
                }
            }
        },
        error: function (xhr, status, error) {
            // Manejo de errores si es necesario
        }
    });
}


function signOut() {
    const userUid = sessionStorage.getItem('userUid');
    $.ajax({
        url: `/Login/cerrarSesion?userUid=${userUid}`,
        type: 'POST',
        success: function (response) {
            if (response.success) {
                window.location.href = "/";
            }
        },
        error: function (xhr, status, error) {
            window.location.href = "/";
        }
    });
}

function bindWorkModeTransition() {
    $(document).on('click', '[data-work-mode-switch]', function (event) {
        const targetUrl = $(this).attr('href');

        if (!targetUrl) {
            return;
        }

        event.preventDefault();
        $('body').addClass('work-mode-switching');

        window.setTimeout(function () {
            window.location.href = targetUrl;
        }, 220);
    });
}

function consumirAvisoModoTrabajo() {
    $.ajax({
        type: 'GET',
        url: '/Home/ConsumeWorkModeNotice',
        dataType: 'json',
        success: function (response) {
            if (!response || !response.message) {
                return;
            }

            swal.fire({
                text: response.message,
                icon: "info",
                buttonsStyling: false,
                confirmButtonText: "Ok, entendido",
                customClass: {
                    confirmButton: "btn btn-primary"
                }
            });
        }
    });
}

$.ajax({
    type: 'POST',
    async: false,
    contentType: 'application/json; charset=utf-8',
    url: '/Home/GetDatosUsuario',
    cache: false,  // Deshabilitar caché
    dataType: 'json',
    success: function (data) {

        $('#userName1').html(decode_utf8(data.usuario));  // Nombre del usuario
        $('#empresa').html(decode_utf8(data.empresa));    // Empresa del usuario
    },
    error: function (xhr, textStatus, error) {
        alert('[GetDatosUsuario] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
    }
});

function BuildMenu() {
    $.ajax({
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        url: '/Home/BuildMenu',
        data: {
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: 'json',
        success: function (data) {


            $('#areaMenu').html(data.d);
            syncCurrentMenuState();
        },
        error: function (xhr, textStatus, error) {
            alert('[BuildMenu] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });
}

function syncCurrentMenuState() {
    var pathname = (window.location && window.location.pathname ? window.location.pathname : '').toLowerCase();
    var activosRouteMap = {
        '/activos/index': {
            ancestors: ['menu-activos', 'menu-activos-abc'],
            active: 'menu-activos-abc-nuevo'
        },
        '/activos/tipos': {
            ancestors: ['menu-activos', 'menu-activos-catalogos'],
            active: 'menu-activos-catalogos-tipos'
        },
        '/activos/marcas': {
            ancestors: ['menu-activos', 'menu-activos-catalogos'],
            active: 'menu-activos-catalogos-marcas'
        },
        '/activos/proveedores': {
            ancestors: ['menu-proveeduria'],
            active: 'menu-proveeduria-proveedores'
        },
        '/activos/estadosoperativos': {
            ancestors: ['menu-activos', 'menu-activos-catalogos'],
            active: 'menu-activos-catalogos-estados'
        },
        '/activos/ordenescompra/nueva': {
            ancestors: ['menu-proveeduria', 'menu-proveeduria-ordenes-compra'],
            active: 'menu-proveeduria-ordenes-compra-nueva'
        },
        '/activos/ordenescompra/index': {
            ancestors: ['menu-proveeduria', 'menu-proveeduria-ordenes-compra'],
            active: 'menu-proveeduria-ordenes-compra-nueva'
        }
    };

    if (pathname.indexOf('/activos/ordenescompra/detalle/') === 0 || pathname.indexOf('/activos/ordenescompra/editar/') === 0) {
        markMenuBranch(['menu-proveeduria', 'menu-proveeduria-ordenes-compra'], 'menu-proveeduria-ordenes-compra-nueva');
        return;
    }

    if (activosRouteMap[pathname]) {
        markMenuBranch(activosRouteMap[pathname].ancestors, activosRouteMap[pathname].active);
        return;
    }

    if (pathname === '/contestarlista/recoleccionesbl26') {
        var root = document.getElementById('02000000');
        var submenu = root ? root.querySelector('.menu-sub') : null;
        var item = document.getElementById('02001000BL26');
        var link = item ? item.querySelector('.menu-link') : null;

        if (root) {
            root.classList.add('show');
            root.classList.add('here');
        }

        if (submenu) {
            submenu.classList.add('show');
        }

        if (item) {
            item.classList.add('here');
            item.classList.add('show');
        }

        if (link) {
            link.classList.add('active');
        }
    }
}

function markMenuBranch(ancestorIds, activeItemId) {
    (ancestorIds || []).forEach(function (id) {
        var node = document.getElementById(id);
        if (!node) {
            return;
        }

        node.classList.add('show');
        node.classList.add('here');

        var submenu = getDirectMenuSub(node);
        if (submenu) {
            submenu.classList.add('show');
        }
    });

    var activeItem = document.getElementById(activeItemId);
    var activeLink = activeItem ? activeItem.querySelector('.menu-link') : null;

    if (activeItem) {
        activeItem.classList.add('show');
        activeItem.classList.add('here');
    }

    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function getDirectMenuSub(node) {
    if (!node || !node.children) {
        return null;
    }

    for (var i = 0; i < node.children.length; i++) {
        if (node.children[i].classList && node.children[i].classList.contains('menu-sub')) {
            return node.children[i];
        }
    }

    return null;
}

function ilumina(raiz, padre, hijo, nieto, bisnieto) {
    var elemn0 = ['000000', '010000', '020000', '030000', '040000', '050000'];
    var elemn1r = ['000100', '000200', '000300', '000400', '000500', '000600', '010100', '020100', '020200', '020300', '030100', '030200', '030300', '030400', '030500', '040100', '040200', '050100', '050200', '050300', '050500', '050600'];
    var elemn1s = ['000401', '000402', '000403', '000404', '000405', '000406', '000407', '000501', '000601', '000602', '000603', '000604', '000605', '000606', '010101', '010102', '010103', '010104', '010105', '020201', '020202', '020301', '020302', '020303', '020304', '030101', '030102', '030103', '030201', '030202', '030403', '030204', '030301', '030302', '030303', '030304', '030401', '030402', '030403', '030404', '030405', '030406', '030501', '050101', '050102', '050103', '050104', '050105', '050201', '050202', '050203', '050204', '050205', '050206', '050301', '050302', '050501', '050502', '050601'];
    var elemn2 = ['00060601', '00060602', '00060603', '00060604', '00060605', '01010501', '01010502', '01010503', '01010504', '01010505', '02020201', '02020202', '02020203'];

    for (var i = 0; i < elemn0.length; i++) {
        $('#' + elemn0[i]).removeClass('here');
        $('#' + elemn0[i]).removeClass('show');
    }
    for (var i = 0; i < elemn1r.length; i++) {
        $('#' + elemn1r[i]).removeClass('menu-active');
        $('#' + elemn1r[i]).removeClass('here');
        $('#' + elemn1r[i]).removeClass('show');
    }
    for (var i = 0; i < elemn1s.length; i++) {
        $('#' + elemn1s[i]).removeClass('here');
        $('#' + elemn1s[i]).removeClass('show');
    }
    for (var i = 0; i < elemn2.length; i++) {
        $('#' + elemn2[i]).removeClass('menu-active');
        $('#' + elemn1s[i]).removeClass('here');
        $('#' + elemn1s[i]).removeClass('show');
    }

    if (raiz) {
        $('#' + raiz).addClass('here');
        $('#' + raiz).addClass('show');
    }
    if (padre) {
        $('#' + padre).addClass('here');
        $('#' + padre).addClass('show');
    }
    if (hijo) {
        $('#' + hijo).addClass('here');
        $('#' + hijo).addClass('show');
    }

    if (nieto) {
        $('#' + nieto).addClass('here');
        $('#' + nieto).addClass('show');
    }

    if (bisnieto) {
        $('#' + bisnieto).addClass('here');
        $('#' + bisnieto).addClass('show');
    }
}

function PintaRuta(idMenu) {
    var breadcrumb = '<ul class="breadcrumb breadcrumb-dot fw-semibold text-gray-600 fs-7 my-1"><li class="breadcrumb-item text-gray-600"> <a href="/Home/Index" class="text-gray-600 text-hover-primary">Inicio</a> </li>';
    switch (idMenu) {
        case 'm02002001':
            breadcrumb += '<li class="breadcrumb-item text-gray-600">Productos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-500">Catálogos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-400">Categorias</li>';
            break;
        case 'm02002002':
            breadcrumb += '<li class="breadcrumb-item text-gray-600">Productos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-500">Catálogos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-400">Clasificaciones</li>';
            break;
        case 'm02002003':
            breadcrumb += '<li class="breadcrumb-item text-gray-600">Productos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-500">Catálogos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-400">Colecciones</li>';
            break;
        case 'm02002004':
            breadcrumb += '<li class="breadcrumb-item text-gray-600">Productos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-500">Catálogos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-400">Colores</li>';
            break;
        case 'm02002005':
            breadcrumb += '<li class="breadcrumb-item text-gray-600">Productos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-500">Catálogos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-400">Etiquetas</li>';
            break;
        case 'm02002006':
            breadcrumb += '<li class="breadcrumb-item text-gray-600">Productos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-500">Catálogos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-400">Marcas</li>';
            break;
        case 'm02002007':
            breadcrumb += '<li class="breadcrumb-item text-gray-600">Productos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-500">Catálogos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-400">Materiales</li>';
            break;
        case 'm02002008':
            breadcrumb += '<li class="breadcrumb-item text-gray-600">Productos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-500">Catálogos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-400">Tipo Producto</li>';
            break;

        case 'm02003000':
            breadcrumb += '<li class="breadcrumb-item text-gray-600">Productos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-500">ABC Productos</li>';
            break;

        case 'm02004000':
            breadcrumb += '<li class="breadcrumb-item text-gray-600">Productos</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-500">Proveedores</li>';
            break;

        case 'm05001000':
            breadcrumb += '<li class="breadcrumb-item text-gray-600">Configuración</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-500">Roles y Permisos</li>';
            break;

        case 'm05002000':
            breadcrumb += '<li class="breadcrumb-item text-gray-600">Configuración</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-500">Razones Sociales</li>';
            break;

        case 'm05003000':
            breadcrumb += '<li class="breadcrumb-item text-gray-600">Configuración</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-500">Sucursales</li>';
            break;

        case 'm05004000':
            breadcrumb += '<li class="breadcrumb-item text-gray-600">Configuración</li>';
            breadcrumb += '<li class="breadcrumb-item text-gray-500">Regiones</li>';
            break;


    }
    breadcrumb += '</ul>';
    $('#areaRuta').html(breadcrumb);
}

function decode_utf8(s) {
    try {
        return decodeURIComponent(escape(s));
    } catch (err) {
        return s;
    }
}

function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
}

function base64ToArrayBuffer(data) {
    var bString = window.atob(data);
    var bLength = bString.length;
    var bytes = new Uint8Array(bLength);
    for (var i = 0; i < bLength; i++) {
        var ascii = bString.charCodeAt(i);
        bytes[i] = ascii;
    }
    return bytes;
};

function Base64ToBytes(base64) {
    var s = window.atob(base64);
    var bytes = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) {
        bytes[i] = s.charCodeAt(i);
    }
    return bytes;
}

function addPeriodToDate(date, { years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0 }) {
    let new_date = new Date(date);
    new_date.setFullYear(new_date.getFullYear() + years);
    new_date.setMonth(new_date.getMonth() + months);
    new_date.setDate(new_date.getDate() + days);
    new_date.setHours(new_date.getHours() + hours);
    new_date.setMinutes(new_date.getMinutes() + minutes);
    new_date.setSeconds(new_date.getSeconds() + seconds);
    return new_date;
}

$.fn.rowCount = function () {
    return $('tr', $(this).find('tbody')).length;
};

function getPreviousMonday() {
    var date = new Date();
    var day = date.getDay();
    var prevMonday = new Date();
    if (date.getDay() == 0) {
        prevMonday.setDate(date.getDate() - 7);
    }
    else {
        prevMonday.setDate(date.getDate() - (day - 1));
    }
    return prevMonday;
}

function getNextDayOfWeek(date, dayOfWeek) {
    // dayOfWeek 0:Su,1:Mo,2:Tu,3:We,4:Th,5:Fr,6:Sa
    // Code to check that date and dayOfWeek are valid left as an exercise ;)
    var resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
    return resultDate;
}
