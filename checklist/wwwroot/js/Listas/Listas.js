let contadorRadio = 0;
let registrosAgregados = [];
var tipo = "0";
var editarlista = false;
var latitud = "";
var longitud = "";

jQuery(document).ready(function () {

    LlenaCombos();
    Inicializa();
    componentes2.init();

    $('#btEditarLista').on('click', function (event) {
        var selectedValue = $('#cbListas').val();
        console.log(selectedValue)
        if (selectedValue == 0) {
            // Si no hay nada seleccionado, prevenimos la apertura del modal
            event.preventDefault();
            alert('Por favor selecciona una lista antes de editar.');
        } else {
            var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
                keyboard: false
            });
            myModal.show();
            Editar()
        }
    });

    if (navigator.geolocation) {
        // Solicita la geolocalización
        navigator.geolocation.getCurrentPosition(
            // Función de éxito
            function (position) {
                // Obtén las coordenadas
                latitud = position.coords.latitude;
                longitud = position.coords.longitude;
                console.log("Latitud: " + latitud + ", Longitud: " + longitud);
            },
            // Función de error
            function (error) {
                Swal.fire({
                    text: 'Por favor, debe activar la geolocalización para poder crear una lista ',
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, entendido!",
                    customClass: {
                        confirmButton: "btn font-weight-bold btn-light-primary"
                    }
                });

            }
        );
    } else {
        Swal.fire({
            text: 'Geolocalización no soportada por este navegador.',
            icon: "error",
            buttonsStyling: false,
            confirmButtonText: "Ok, entendido!",
            customClass: {
                confirmButton: "btn font-weight-bold btn-light-primary"
            }
        });
    }

    $("#btEditarLista").click(function () {
        // Llama a la función que deseas ejecutar
        editarlista = true;
        $('.form-check.form-switch').closest('.col-12').show();
        //  Editar()
    });

    $("#btEditarPregunta").click(function () {
        // Llama a la función que deseas ejecutar
        EditarPregunta()
    });
    $("#buttonEliminarLista").click(function () {
        // Llama a la función que deseas ejecutar
        EliminarLista()
    });
    $("#buttonEliminarPregunta").click(function () {
        // Llama a la función que deseas ejecutar
        EliminarPregunta()
    });
    $('#btAgregarLista').click(function () {
        editarlista = false;
        // $('#cbUsuario').val('')
        $('#txNombreLista').val('')
        $('#txNotasLista').val('')
        $('.form-check.form-switch').closest('.col-12').hide();

    });

    $('#btAgregarPregunta').click(function () {

        $('#cbPreguntas').val('');
        $('#txNombrePregunta').val('')
        $('#txNotasPregunta').val('')
        $('#cbCategorias').val('')
        $('#cbSubcategorias').val('')

    });

    let contador = 0;

    // Función para agregar una nueva opción
    //document.getElementById('agregarOpcion').addEventListener('click', function () {
    //    const nuevaOpcion = document.getElementById('nuevaOpcion').value;
    //    if (nuevaOpcion.trim() === '') return; // Evitar opciones vacías

    //    // Crear un nuevo checkbox
    //    const checkbox = document.createElement('input');
    //    checkbox.type = 'checkbox';  // Asegura que siempre es un checkbox
    //    checkbox.id = `opcion-${contador}`;
    //    contador++;

    //    // Crear una etiqueta para el checkbox
    //    const label = document.createElement('label');
    //    label.htmlFor = checkbox.id;
    //    label.textContent = nuevaOpcion;

    //    // Crear un botón para eliminar
    //    const botonEliminar = document.createElement('button');
    //    botonEliminar.textContent = 'Eliminar';
    //    botonEliminar.classList.add('btn', 'btn-danger');
    //    botonEliminar.onclick = function () {
    //        tr.remove(); // Elimina la fila completa
    //    };

    //    // Crear fila y celdas para la tabla
    //    const tr = document.createElement('tr');
    //    const td1 = document.createElement('td');
    //    const td2 = document.createElement('td');

    //    // Agregar checkbox y etiqueta a la primera celda
    //    td1.appendChild(checkbox);
    //    td1.appendChild(label);

    //    // Agregar botón a la segunda celda
    //    td2.appendChild(botonEliminar);

    //    // Agregar celdas a la fila
    //    tr.appendChild(td1);
    //    tr.appendChild(td2);

    //    // Agregar la fila a la tabla
    //    const listaOpciones = document.getElementById('listaOpciones'); // Asegúrate de que este ID pertenece a un elemento <table>
    //    listaOpciones.appendChild(tr);

    //    // Limpiar el input
    //    document.getElementById('nuevaOpcion').value = '';
    //});


    // Array para almacenar los registros agregados

    // Evento de clic para agregar una opción con radio button
    //document.getElementById('agregarOpcionRadio').addEventListener('click', function () {
    //    const nuevaOpcionRadio = document.getElementById('nuevaOpcionRadio').value;
    //    if (nuevaOpcionRadio.trim() === '') return; // Evitar opciones vacías

    //    // Crear un nuevo objeto para el registro
    //    const nuevoRegistro = {
    //        id: `opcionRadio-${contadorRadio}`, // ID del radio button
    //        opcion: nuevaOpcionRadio // Valor del radio button
    //    };

    //    // Agregar el nuevo registro al array
    //    registrosAgregados.push(nuevoRegistro);

    //    // Crear un nuevo radio button
    //    const radioButton = document.createElement('input');
    //    radioButton.type = 'radio';
    //    radioButton.name = 'opcionRadio';
    //    radioButton.id = nuevoRegistro.id; // Utilizar el ID del registro
    //    contadorRadio++;

    //    // Crear una etiqueta para el radio button
    //    const label = document.createElement('label');
    //    label.className = 'radio-button';
    //    label.htmlFor = radioButton.id;
    //    label.textContent = nuevoRegistro.opcion;

    //    // Crear un botón para eliminar
    //    const botonEliminar = document.createElement('button');
    //    botonEliminar.textContent = 'Eliminar';
    //    botonEliminar.classList.add('btn', 'btn-danger');
    //    botonEliminar.onclick = function () {

    //        tr.remove(); // Elimina la fila completa
    //    };

    //    // Crear fila y celdas para la tabla
    //    const tr = document.createElement('tr');
    //    const td1 = document.createElement('td');
    //    const td2 = document.createElement('td');

    //    // Agregar radio button y etiqueta a la primera celda
    //    td1.appendChild(radioButton);
    //    td1.appendChild(label);

    //    // Agregar botón a la segunda celda
    //    td2.appendChild(botonEliminar);

    //    // Agregar celdas a la fila
    //    tr.appendChild(td1);
    //    tr.appendChild(td2);

    //    // Agregar la fila a la tabla
    //    const listaOpcionesRadio = document.getElementById('listaOpcionesRadio'); // Asegúrate de que este ID pertenece a un elemento <table>
    //    listaOpcionesRadio.appendChild(tr);

    //    // Limpiar el input
    //    document.getElementById('nuevaOpcionRadio').value = '';
    //    console.log(registrosAgregados);
    //});
    const txValorPregunta = document.getElementById('txValorPregunta');
    const txRespuestaCorrecta = document.getElementById('txRespuestaCorrecta');

    // Función para validar y habilitar/deshabilitar el campo

    // Agregar el evento de escucha al campo txValorPregunta
    txValorPregunta.addEventListener('change', validarValorPregunta);

    // Ejecutar la validación al cargar la página (por si ya hay un valor)
    validarValorPregunta();

    $('#cbListas').on('select2:select', function (e) {
        console.log('funciona ? ')
        $('#cbPreguntas').val('');
        limpiarCampos();
        var selectedValue = $(this).val();
        if (selectedValue) {
            console.log('Valor seleccionado:', selectedValue);
            LlenaComboPreguntas();
        } else {
            console.log('No se ha seleccionado ningún valor en cbListas.');
        }
    });

    $('#cbPreguntas').on('select2:select', function (e) {
        var selectedValue = $(this).val();
        if (selectedValue) {
            console.log('Valor seleccionado:', selectedValue);
            ObtenerElementoPreguntas();
        } else {
            console.log('No se ha seleccionado ningún valor en cbPreguntas.');
        }
    });

    document.getElementById('agregarOpcionRadio').addEventListener('click', function () {
        const inputCampo = document.getElementById('nuevaOpcionRadio');
        const nuevaOpcion = inputCampo.value.trim();
        if (nuevaOpcion !== '') {
            GuardarOpcion();
            inputCampo.value = '';
        } else {
            swal.fire({
                text: 'Ingresa un nombre',
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "Ok, entendido!",
                customClass: {
                    confirmButton: "btn font-weight-bold btn-light-primary"
                }
            }).then(function () {

            });
        }

    });

});
function Inicializa() {
    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/Listas/Inicializa',
        data: {
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: 'json',
        success: function (data) {
            if (data.perm != 1) {
                $('#btAgregarLista').hide();
                $('#btEditarLista').hide();
                $('#buttonEliminarLista').hide();

                $('#btAgregarPregunta').hide();
                $('#btEditarPregunta').hide();
                $('#buttonEliminarPregunta').hide();

                $('#btGuardarConstructor').hide();
            }
        },
        error: function (xhr, textStatus, error) {
            alert('[Inicializa] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });
}
function validarValorPregunta() {
    const valor = parseFloat(txValorPregunta.value);

    if (valor > 0 && tipo != "3" && tipo != "0") {
        txRespuestaCorrecta.disabled = false;

    } else {
        txRespuestaCorrecta.disabled = true;
        txRespuestaCorrecta.value = '';
    }
}

//Changes de combos 
//$('#cbListas').change(function () {
//    console.log('funciona ? ')
//    limpiarCampos();
//    var selectedValue = $(this).val();
//    if (selectedValue) {
//        console.log('Valor seleccionado:', selectedValue);
//        LlenaComboPreguntas();
//    } else {
//        console.log('No se ha seleccionado ningún valor en cbListas.');
//    }
//});
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
            url: "/Listas/GetListasComboBox",
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: function (valores) {
                console.log(valores.term)
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

    $('#exampleModalPregunta').on('shown.bs.modal', function () {
        // Inicializar el combo de categorías
        $('#cbCategorias').select2({
            dropdownParent: $('#exampleModalPregunta'), // Establece el modal como padre del dropdown
            minimumInputLength: 0,
            allowClear: true,

            ajax: {
                quietMillis: 150,
                url: "/Listas/GetCategoriasComboBox",
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: function (valores) {
                    console.log(valores.term)
                    if (!valores.term) { valores.term = ''; }
                    return {
                        searchTerm: JSON.stringify(valores.term),
                        idEmpresa: sessionStorage.getItem('idEmpresa'),
                        cadena: sessionStorage.getItem('cadenaBase64'),
                        empresa: sessionStorage.getItem('empresa'),
                        correo: sessionStorage.getItem('correo')
                    };
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
            }
        });

        // Inicializar el combo de subcategorías
        $('#cbSubcategorias').select2({
            dropdownParent: $('#exampleModalPregunta'), // Establece el modal como padre del dropdown
            minimumInputLength: 0,
            allowClear: true,

            ajax: {
                quietMillis: 150,
                url: "/Listas/GetSubcategoriasComboBox",
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: function (valores) {
                    console.log(valores.term)
                    if (!valores.term) { valores.term = ''; }
                    return {
                        searchTerm: JSON.stringify(valores.term),
                        idEmpresa: sessionStorage.getItem('idEmpresa'),
                        cadena: sessionStorage.getItem('cadenaBase64'),
                        empresa: sessionStorage.getItem('empresa'),
                        correo: sessionStorage.getItem('correo')
                    };
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
            }
        });
    });
}
function ObtenerElementoPreguntas() {

    limpiarCampos();
    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/Listas/GetElementoPregunta',
        data: {
            llav: $('#cbPreguntas').val(),
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')

        },
        dataType: 'json',
        success: function (data) {
            console.log(data)
            $('#txNotas').val(data.d.explicacion);
            $('#txValorPregunta').val(data.d.valor);
            if (data.d.respuestaCorrecta.trim() !== '' && data.d.respuestaCorrecta.trim() != null) {
                txRespuestaCorrecta.disabled = false;
                $('#txRespuestaCorrecta').val(data.d.respuestaCorrecta)
            }
            $('#txRespuestaCorrecta').val(data.d.respuestaCorrecta)
            validarValorPregunta();
            //  document.getElementById('swVence').checked = data.d.Obligatorio == 1;
            activarBoton(data.d.tipo);
            validarValorPregunta();
            $('#txRespuestaCorrecta').val(data.d.respuestaCorrecta)
        },
        error: function (xhr, textStatus, error) {
            alert('[GetEspecialidades] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });

}
function limpiarCampos() {
    $('#txNotas').val('');
    $('#txValorPregunta').val('');
    $('#txRespuestaCorrecta').val('');
    // $('#swVence').prop('checked', false);
    activarBoton(0);
}
function LlenaComboPreguntas() {
    var obj = {};
    obj.llav = $('#cbListas').val();

    $('#cbPreguntas').select2({
        minimumInputLength: 0,
        allowClear: true,
        placeholder: '',
        ajax: {
            quietMillis: 150,
            url: "/Listas/GetListasPreguntasComboBox",
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: function (valores) {
                console.log(valores.term)
                if (!valores.term) { valores.term = ''; }
                var queryParameters = {
                    searchTerm: valores.term,
                    llave: $('#cbListas').val(),
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
    });

}
function ObtenerPreguntas() {

    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            async: true,
            contentType: 'application/json; charset=utf-8',
            url: '/Listas/GetListasPreguntas',
            data: {
                llave: $('#cbListas').val(),
                idEmpresa: sessionStorage.getItem('idEmpresa'),
                cadena: sessionStorage.getItem('cadenaBase64'),
                empresa: sessionStorage.getItem('empresa'),
                correo: sessionStorage.getItem('correo')
            },
            dataType: 'json',
            success: function (data) {
                if (data.d && data.d.length > 0) {
                    resolve(true); // Si hay registros, regresa true
                } else {
                    resolve(false); // Si no hay registros, regresa false
                }
            },
            error: function (xhr, textStatus, error) {
                alert('[GetEspecialidades] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
                reject(false); // En caso de error, puedes rechazar la promesa
            }
        });
    });
}

let botonActivo = null;
// Función para activar un botón específico según el número proporcionado
function activarBoton(numero) {
    tipo = String(numero);
    const valor = parseFloat(txValorPregunta.value);
    if (tipo != 3 && valor > 0) {
        txRespuestaCorrecta.disabled = false;

    } else {
        txRespuestaCorrecta.disabled = true;
        txRespuestaCorrecta.value = '';
    }

    if (numero == 2 || numero == 3) {
        // Desactivar el botón actual si existe
        if (botonActivo) {
            botonActivo.classList.remove('active');
        }

        // Obtener el nuevo botón correspondiente al número proporcionado
        const botones = document.querySelectorAll('.btn-selectable');
        const nuevoBoton = botones[numero - 1]; // El índice del botón es número - 1

        // Activar el nuevo botón si existe
        if (nuevoBoton) {
            nuevoBoton.classList.add('active');
            botonActivo = nuevoBoton; // Actualizar el botón activo
        }
        ObtenerOpciones()
    } else {
        // Desactivar el botón actual si existe
        if (botonActivo) {
            botonActivo.classList.remove('active');
        }

        // Obtener el nuevo botón correspondiente al número proporcionado
        const botones = document.querySelectorAll('.btn-selectable');
        const nuevoBoton = botones[numero - 1]; // El índice del botón es número - 1

        // Activar el nuevo botón si existe
        if (nuevoBoton) {
            nuevoBoton.classList.add('active');
            botonActivo = nuevoBoton; // Actualizar el botón activo
        }

    }

}
var componentes2 = function () {
    var t, e, r, t2, e2, r2, i2, z2, e3, r3, i3, t4, e4, r4, t5, e5, r5;

    validarConstructor = function () {
        t5 = document.querySelector('#fmConstructor'),
            e5 = document.querySelector('#btGuardarConstructor'),
            r5 = FormValidation.formValidation(t5, {
                fields: {
                    txNotas: {
                        validators: {
                            notEmpty: {
                                message: "Se requiere un nombre"
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
            !function (t5) {
                try {
                    return new URL(t5),
                        !0
                } catch (t5) {
                    return !1
                }
            }
        e5.addEventListener("click", (function (i5) {
            i5.preventDefault(),
                r5.validate().then((function (r5) {
                    if (r5 == "Valid") {

                        if (tipo != "0" && $('#cbPreguntas').val() != undefined) { GuardarConstruccion(); } else {
                            swal.fire({
                                text: 'Te falta llenar campos o seleccionar un tipo',
                                icon: "error",
                                buttonsStyling: false,
                                confirmButtonText: "Ok, entendido!",
                                customClass: {
                                    confirmButton: "btn font-weight-bold btn-light-primary"
                                }
                            }).then(function () {

                            });
                        }

                    }
                }))
        }))
    },
        validarOpcion = function () {
            t4 = document.querySelector('#exampleModal2'),
                e4 = document.querySelector('#agregarOpcionRadio'),
                r4 = FormValidation.formValidation(t4, {
                    fields: {
                        nuevaOpcionRadio: {
                            validators: {
                                notEmpty: {
                                    message: "Se requiere un nombre"
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
                !function (t4) {
                    try {
                        return new URL(t4),
                            !0
                    } catch (t4) {
                        return !1
                    }
                }
            e4.addEventListener("click", (function (i4) {
                i4.preventDefault(),
                    r4.validate().then((function (r4) {
                        if (r4 == "Valid") {
                            // GuardarOpcion();
                        }
                    }))
            }))
        },
        validarPregunta = function () {
            t2 = document.querySelector('#exampleModalPregunta'),
                e2 = document.querySelector('#btGuardarPregunta'),
                r2 = FormValidation.formValidation(t2, {
                    fields: {
                        txNombrePregunta: {
                            validators: {
                                notEmpty: {
                                    message: "Se requiere un nombre"
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
                !function (t2) {
                    try {
                        return new URL(t2),
                            !0
                    } catch (t2) {
                        return !1
                    }
                }
            e2.addEventListener("click", (function (i2) {
                i2.preventDefault(),
                    r2.validate().then((function (r2) {
                        if (r2 == "Valid") {
                            var nombrePregunta = document.getElementById('txNombrePregunta').value;
                            if (nombrePregunta.trim() != "") {
                                GuardarPregunta();
                            } else {
                                swal.fire({
                                    text: 'Tienes que agregar un nombre.',
                                    icon: "error",
                                    buttonsStyling: false,
                                    confirmButtonText: "Ok, entendido!",
                                    customClass: {
                                        confirmButton: "btn font-weight-bold btn-light-primary"
                                    }
                                }).then(function () {

                                });
                            }
                        }
                    }))
            }))
        },
        validarLista = function () {
            t3 = document.querySelector('#exampleModal'),
                e3 = document.querySelector('#btGuardarLista'),
                r3 = FormValidation.formValidation(t3, {
                    fields: {
                        txNombreLista: {
                            validators: {
                                notEmpty: {
                                    message: "Se requiere un nombre"
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
                !function (t3) {
                    try {
                        return new URL(t3),
                            !0
                    } catch (t3) {
                        return !1
                    }
                }
            e3.addEventListener("click", (function (i3) {
                i3.preventDefault(),
                    r3.validate().then((function (r3) {
                        if (r3 == "Valid") {
                            GuardarLista();
                        }
                    }))
            }))
        };
    return {
        init: function () {
            validarLista(), validarPregunta(), validarOpcion(), validarConstructor();
        }
    };
}();
function GuardarLista() {

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("Tienes permisos para geolocalización.");
                // Aquí puedes trabajar con la posición
                console.log("Latitud: " + position.coords.latitude);
                console.log("Longitud: " + position.coords.longitude);
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    console.log("No tienes permisos para acceder a la geolocalización.");
                } else {
                    console.log("Error al intentar acceder a la geolocalización: " + error.message);
                }
            }
        );
    } else {
        console.log("La geolocalización no está soportada por tu navegador.");
    }


    if (latitud === "" && longitud === "") {
        Swal.fire({
            text: 'Por favor, debe activar la geolocalización para poder responder ',
            icon: "error",
            buttonsStyling: false,
            confirmButtonText: "Ok, entendido!",
            customClass: {
                confirmButton: "btn font-weight-bold btn-light-primary"
            }
        });
        return;
    }
    swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {
            var obj = {};

            obj.llav = $('#valorId').val();


            //obj.idInstructor = $('#cbUsuario').val();
            obj.nombre = $('#txNombreLista').val();
            obj.n = $('#txNotasLista').val();
            obj.latitud = latitud.toString();
            obj.longitud = longitud.toString();
            obj.idEmpresa = sessionStorage.getItem('idEmpresa');
            obj.cadena = sessionStorage.getItem('cadenaBase64');
            obj.empresa = sessionStorage.getItem('empresa');
            obj.correo = sessionStorage.getItem('correo');

            var estadoSwitch = document.getElementById('swCerrada').checked;


            ObtenerPreguntas().then(function (result) {

                if (estadoSwitch && editarlista == true) {
                    if (result == true) {
                        obj.isListaCerrada = estadoSwitch;
                    } else {
                        swal.fire({
                            text: 'No puedes cerrar la lista si no tiene tareas asignadas.',
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, entendido!",
                            customClass: {
                                confirmButton: "btn font-weight-bold btn-light-primary"
                            }
                        }).then(function () {

                        });

                        return
                    }

                }

                console.log(obj);
                $.ajax({
                    async: true,
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    url: '/Listas/GuardarLista',
                    data: JSON.stringify(obj),
                    dataType: "json",
                    success: function (data) {
                        $('#cbListas').val('');
                        $('#cbPreguntas').val('').trigger('change');
                        if (data.d === 'Ok') {
                            swal.fire({
                                text: 'Los datos se han guardado.',
                                icon: "success",
                                buttonsStyling: false,
                                confirmButtonText: "Ok, entendido!",
                                customClass: {
                                    confirmButton: "btn font-weight-bold btn-light-primary"
                                }
                            }).then(function () {
                                $('#cbListas').val('');
                                $('#cbPreguntas').val('');
                                limpiarCampos()
                                $('#exampleModal').modal('hide');
                                LlenaCombos()
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

                        alert('[Guardar] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
                    }
                });


            });




        }
    });
}
function GuardarPregunta() {
    var idLista = $('#cbListas').val();

    var x = 2
    // Validación para asegurar que se haya seleccionado una opción válida en #cbListas
    if (idLista != 0 || idLista != '0') {
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
                    url: '/Listas/GuardarPregunta',
                    data: {
                        llav: $('#cbPreguntas').val(),
                        idLista: $('#cbListas').val(),
                        nombre: $('#txNombrePregunta').val(),
                        idCategoria: $('#cbCategorias').val(),
                        idSubcategoria: $('#cbSubcategorias').val(),
                        idEmpresa: sessionStorage.getItem('idEmpresa'),
                        cadena: sessionStorage.getItem('cadenaBase64'),
                        empresa: sessionStorage.getItem('empresa'),
                        correo: sessionStorage.getItem('correo')
                    },
                    dataType: "json",
                    success: function (data) {
                        swal.close();
                        if (data.d === 'Ok') {

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
                                $('#exampleModalPregunta').modal('hide')
                                // LlenaCombos()
                                LlenaComboPreguntas()
                                limpiarCampos();
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

                        alert('[Guardar] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
                    }
                });
            }
        });
    } else {
        alert('No has seleccionado una lista')
    }
}
function Editar(cual) {
    $('#valorId').val(cual);
    // $('#cbUsuario').val('');
    $('#txNombreLista').val('');
    $('#txNotasLista').val('');
    // Limpiar fechas si es un datepicker

    $('#txTitulo').val('');
    $('#txNotas').val('');


    $.ajax({
        async: false,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: '/Listas/GetElemento',
        data: {
            llav: $('#cbListas').val(),
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: "json",
        success: function (data) {
            console.log(data)
            // $('#cbUsuario').val(data.d.idInstructor);
            $('#txNombreLista').val(data.d.nombre);
            $('#txNotasLista').val(data.d.notas);
            $('#valorId').val(data.d.id);
        },
        error: function (xhr, status, error) {
            alert('[GetElemento] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
        }
    });
}
function EditarPregunta(cual) {

    $('#txNombrePregunta').val('');
    $('#txNotasPregunta').val('');


    $.ajax({
        async: false,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: '/Listas/GetElementoPregunta',
        data: {
            llav: $('#cbPreguntas').val(),
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: "json",
        success: function (data) {
            var myModal = new bootstrap.Modal(document.getElementById('exampleModalPregunta'), {
                keyboard: false
            });
            myModal.show();
            Editar()
            console.log(data)
            console.log(data.idSubcategoria)
            console.log(data.idCategoria)
            $('#txNombrePregunta').val(data.d.pregunta);

            var cbCategoria = $('#cbCategorias');
            var option = new Option(data.d.categoria, data.d.idCategoria, true, true);
            cbCategoria.append(option).trigger('change');


            var cbSubcategoria = $('#cbSubcategorias');
            var option = new Option(data.d.subcategoria, data.d.idSubcategoria, true, true);
            cbSubcategoria.append(option).trigger('change');

            //$('#cbCategorias').val(data.d.idCategoria);
            //$('#cbSubcategorias').val(data.d.idSubcategoria);
            $('#txNotasPregunta').val('');
        },
        error: function (xhr, status, error) {
            alert('[GetElemento] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
        }
    });
}
function ObtenerOpciones() {
    $('#txNombrePregunta').val('');
    $('#txNotasPregunta').val('');



    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: '/Listas/GetElementoOpciones',
        data: {
            llave: $('#cbPreguntas').val(),
            tipoPregunta: tipo,
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: "json",
        success: function (data) {
            console.log(data);
            const opciones = data.d;
            const listaOpciones = $('#listaOpcionesRadio'); // Asegúrate de que este ID pertenece a un contenedor adecuado
            listaOpciones.empty();

            opciones.forEach((opcion, index) => {
                let inputType = tipo == 2 ? 'radio' : 'checkbox'; // Asegúrate de que `tipo` es la propiedad correcta
                const input = $('<input>', {
                    type: inputType,
                    id: `opcion-${opcion.id}`,
                    name: 'opcionRadio',
                    'class': 'radio-button',
                    value: opcion.opcion
                });

                const label = $('<label>', {
                    for: input.attr('id'),
                    text: opcion.opcion
                });

                const btnEliminar = $('<button>', {
                    html: '<i class="fas fa-trash"></i>', // Usamos el ícono de basura
                    'class': 'btn-danger', // Clase personalizada para manejar el estilo
                    click: function () {
                        eliminarOpcion(opcion.id); // Función para eliminar la opción
                    }
                });


                const div = $('<div>').append(input, label, btnEliminar);
                listaOpciones.append(div);
            });
        },
        error: function (xhr, status, error) {
            alert(`[GetElemento] status: ${xhr.status} responseText: ${xhr.responseText}`);
        }
    });
}
function eliminarOpcion(id) {
    $.ajax({
        type: 'GET',
        url: '/Listas/DeleteElementoOpciones',
        data: {
            id: id,
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        contentType: 'application/json; charset=utf-8',
        success: function (response) {
            console.log('Eliminación exitosa', response);
            // Actualiza la UI después de eliminar
            ObtenerOpciones();
        },
        error: function (xhr) {
            alert('Error al eliminar: ' + xhr.responseText);
        }
    });
}
function GuardarOpcion() {


    var obj = {};
    obj.llav = '';
    obj.idLista = $('#cbListas').val();
    obj.idPregunta = $('#cbPreguntas').val();
    obj.nombre = $('#nuevaOpcionRadio').val();
    obj.ti = $('#nuevaOpcionRadio').val();
    obj.tipoPregunta = tipo;

    console.log(obj);

    $.ajax({
        async: false,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: '/Listas/GuardarOpcion',
        data: {
            llav: '',
            idLista: $('#cbListas').val(),
            idPregunta: $('#cbPreguntas').val(),
            nombre: $('#nuevaOpcionRadio').val(),
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')

        },
        dataType: "json",
        success: function (data) {
            console.log(data.d)
            if (data.d == "\"Ya existe el elemento\"") {
                swal.fire({
                    text: 'Ya existe el elemento.',
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, entendido!",
                    customClass: {
                        confirmButton: "btn font-weight-bold btn-light-primary"
                    }
                }).then(function () {
                    $('#modalNuevo').modal('hide');
                    // LlenaCombos()
                    // LlenaComboPreguntas()
                });
            }

            ObtenerOpciones()

        },
        error: function (xhr, status, error) {
            alert('[GetElemento] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
        }
    });
}
function GuardarConstruccion() {
    swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {
            var estadoSwitch = $('#swCerrada').prop('checked');
            $.ajax({
                async: true,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: '/Listas/GuardarConstructor',
                data: {
                    llav: $('#cbPreguntas').val(),
                    idLista: $('#cbListas').val(),
                    pregunta: $('#cbPreguntas option:selected').text(),
                    notas: $('#txNotas').val(),
                    tipo: tipo,
                    valor: $('#txValorPregunta').val() > 0 ? $('#txValorPregunta').val() : "0",
                    isListaCerrada: estadoSwitch,
                    obligatorio: "true",
                    idPregunta: $('#cbPreguntas').val(),
                    respuestaCorrecta: $('#txRespuestaCorrecta').val(),
                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa'),
                    correo: sessionStorage.getItem('correo')
                },
                dataType: "json",
                success: function (data) {
                    swal.close();
                    if (data.d === 'Ok') {
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
                            // LlenaCombos()
                            // LlenaComboPreguntas()
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

                    alert('[Guardar] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
                }
            });
        }
    });
}
function EliminarLista() {
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
                url: '/Listas/EliminarLista',
                data: {
                    llav: $('#cbListas').val(),
                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa'),
                    correo: sessionStorage.getItem('correo')
                },
                dataType: "json",
                success: function (data) {
                    swal.close();
                    if (data.d === 'Ok') {
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
                            LlenaCombos()
                            // LlenaComboPreguntas()
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

                    alert('[Guardar] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
                }
            });
        }
    });
}
function EliminarPregunta() {
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
                url: '/Listas/EliminarPregunta',
                data: {

                    llav: $('#cbPreguntas').val(),
                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa'),
                    correo: sessionStorage.getItem('correo')
                },
                dataType: "json",
                success: function (data) {
                    swal.close();
                    if (data.d === 'Ok') {
                        $('#cbPreguntas').val('');
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

                            LlenaComboPreguntas()
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

                    alert('[Guardar] status: ' + xhr.status + ' responseText: ' + xhr.responseText);
                }
            });
        }
    });
}
