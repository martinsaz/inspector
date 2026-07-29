var contadorVideos = 0;
var contadorUrls = 0;
var isSaveForm = false;
var isBotonPrecionado = false;
var FormularioEnviado = false;
var solicitudes = false;
//------------------------------------------------------------------------------------
var idPrograma = '';
var evento = ''
var archivosVideos = []
var archivosImg = []

let mediaRecorder;
let recordedChunks = [];

const video = document.getElementById('video');
const video2 = document.getElementById('video2');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const snapButton = document.getElementById('snap');
const startRecordingButton = document.getElementById('startRecording');
const stopRecordingButton = document.getElementById('stopRecording');
const recordedVideo = document.getElementById('recordedVideo');
const cbSucursal = document.getElementById('cbSucursal');
const cbUsuario = document.getElementById('cbUsuario');

var idSucursal = "";
var idUsuario = "";
var latitud = "";
var longitud = "";

let currentIdPregunta;
jQuery(document).ready(function () {
    //$(document).ajaxStart(function () {
    //    // Se ejecuta cuando comienza la primera solicitud Ajax
    //    solicitudes = true;
    //    console.log("Una solicitud Ajax está en curso.");
    //    $('#loading').show(); // Muestra un indicador de carga, por ejemplo.
    //});

    //$(document).ajaxStop(function () {
    //    // Se ejecuta cuando todas las solicitudes Ajax han finalizado
    //    solicitudes = false;

    //    if (isBotonPrecionado && FormularioEnviado == false) { EnviarFormularioLista()}
    //    console.log("No hay solicitudes Ajax pendientes.");
    //    $('#loading').hide(); // Oculta el indicador de carga.
    //});
    Inicializa();
    ObtenerComboPrograma();
    ocultarBoton();
    ObtenerSucursal();
    ObtenerTokenFirebase();
    $('#btBuscar').on('click', function () {
        ocultarBoton();
        clearContent();
        ConsultarPreguntas();
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
                    text: 'Por favor, debe activar la geolocalización para poder responder ',
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

    // Capturar la foto cuando se presiona el botón
    $('#snap').on('click', function () {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');

        // console.log(dataUrl)

        archivosImg.push({ idPregunta: currentIdPregunta, url: dataUrl });

    });

    //$('#fileInput').on('change', function (event) {
    //    $('#loadingMessage').show();
    //    const file = event.target.files[0];
    //    const reader = new FileReader();

    //    reader.onload = function (e) {
    //        const dataUrl = e.target.result;


    //        //console.log(dataUrl)

    //        contadorVideos++;
    //        console.log(contadorVideos + " - " + contadorUrls)
    //        if (dataUrl.startsWith('data:video/mp4;base64') || dataUrl.startsWith('data:video/quicktime;base64')) {

    //            //const dataUrl = e.target.result;

    //            //// Convertir base64 a Blob
    //            //const blob = dataURLtoBlob(dataUrl);
    //            //archivosVideos.push({ idPregunta: currentIdPregunta, url: blob, name: file.name }); // Agregar el archivo al array


    //            // archivosVideos.push({ idPregunta: currentIdPregunta, url: dataUrl });
    //            Swal.fire({
    //                title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
    //                allowEscapeKey: false,
    //                allowOutsideClick: false,
    //                showConfirmButton: false,
    //                didOpen: function () {
    //                    const obj = {
    //                        filePath: dataUrl,
    //                        fileType: "video",
    //                        idPregunta: currentIdPregunta,
    //                        tokenFirebase: sessionStorage.getItem('tokenFirebase')
    //                    };

    //                    $.ajax({
    //                        async: true,
    //                        type: "POST",
    //                        contentType: "application/json; charset=utf-8",
    //                        url: '/ContestarLista/UploadVideoToFirebaseStorage',
    //                        data: JSON.stringify(obj), // Envía la lista de respuestas directamente
    //                        dataType: "json",

    //                        success: function (data) {
    //                            swal.close();

    //                            var url = data.d;

    //                            // Validar que la URL comienza con el dominio de Firebase y contiene el parámetro 'token'
    //                            if (url.startsWith('https://firebasestorage.googleapis.com/') && url.includes('token=')) {
    //                                archivosVideos.push({ idPregunta: currentIdPregunta, url: url });
    //                            } else {

    //                            }

    //                        },
    //                        error: function (xhr, status, error) {
    //                            swal.close();
    //                            alert('No se pudo cargar el video. Por favor, intenta nuevamente.')


    //                        }

    //                    });

    //                }

    //            });


    //        } else {

    //            // archivosImg.push({ idPregunta: currentIdPregunta, url: dataUrl });

    //            const obj = {
    //                filePath: dataUrl,
    //                fileType: "foto",
    //                idPregunta: currentIdPregunta,
    //                tokenFirebase: sessionStorage.getItem('tokenFirebase')

    //            };
    //            $.ajax({
    //                async: true,
    //                type: "POST",
    //                contentType: "application/json; charset=utf-8",
    //                url: '/ContestarLista/UploadVideoToFirebaseStorage',
    //                data: JSON.stringify(obj), // Envía la lista de respuestas directamente
    //                dataType: "json",

    //                success: function (data) {

    //                    swal.close();
    //                    //  console.log(data.d)
    //                    contadorUrls++;
    //                    console.log(contadorVideos + " - " + contadorUrls)

    //                    archivosImg.push({ idPregunta: currentIdPregunta, url: data.d });


    //                },
    //                error: function (xhr, status, error) {


    //                    contadorUrls = contadorVideos;

    //                }

    //            });

    //        }

    //        $('#loadingMessage').hide();
    //        $('#fileInput').val('');
    //    };

    //    reader.readAsDataURL(file);
    //});

    $('#fileInput').on('change', function (event) {
        $('#loadingMessage').show();
        const file = event.target.files[0]; // Obtiene el archivo seleccionado

        if (file) {
            const maxSize = 262144000; // 100 MB en bytes
            // const maxSize = 10485760
            // Verificar si el archivo supera los 100 MB
            if (file.size > maxSize) {
                Swal.fire({
                    icon: 'error',
                    title: 'Archivo demasiado grande',
                    text: 'El archivo seleccionado supera el tamaño máximo permitido de 100 MB.',
                    confirmButtonText: 'Aceptar'
                });
                $('#loadingMessage').hide();
                $('#fileInput').val(''); // Limpiar el input
                return; // No continuar con el proceso de subida
            }

            Swal.fire({
                title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
                allowEscapeKey: false,
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: function () {
                    // Crear un FormData y agregar el archivo
                    const formData = new FormData();
                    formData.append('file', file); // Aquí 'file' es el nombre que usaremos en el controlador
                    formData.append('idPregunta', currentIdPregunta);
                    formData.append('tokenFirebase', sessionStorage.getItem('tokenFirebase'));

                    let urlEndpoint;
                    // Verificar si es video o imagen
                    if (file.type.startsWith('video/')) {
                        urlEndpoint = '/ContestarLista/UploadVideoToFirebaseStorage';
                    } else if (file.type.startsWith('image/')) {
                        urlEndpoint = '/ContestarLista/UploadImageToFirebaseStorage';
                    } else {
                        swal.close();
                        alert('Tipo de archivo no soportado. Por favor, sube un video o una imagen.');
                        return;
                    }

                    // Hacer la llamada AJAX
                    $.ajax({
                        url: urlEndpoint,
                        type: 'POST',
                        data: formData,
                        contentType: false, // No establecer el tipo de contenido
                        processData: false, // No procesar los datos, ya que enviamos FormData
                        timeout: 120000, // Establecer un timeout de 2 minutos

                        success: function (data) {
                            swal.close();
                            var url = data.d;

                            // Verificar que la URL es válida
                            if (url.startsWith('https://firebasestorage.googleapis.com/') && url.includes('token=')) {
                                if (file.type.startsWith('video/')) {
                                    archivosVideos.push({ idPregunta: currentIdPregunta, url: url });
                                } else if (file.type.startsWith('image/')) {
                                    archivosImg.push({ idPregunta: currentIdPregunta, url: url });
                                }
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            swal.close();
                            console.error('Error al cargar el archivo:', textStatus, errorThrown);
                            alert('No se pudo cargar el archivo. Por favor, intenta nuevamente.');
                        }

                    });
                }
            });
        }

        $('#loadingMessage').hide();
        $('#fileInput').val(''); // Limpiar el input después de cargar el archivo
    });

    // Iniciar la grabación
    $('#startRecording').on('click', function () {
        if (mediaRecorder && mediaRecorder.state === 'inactive') {
            mediaRecorder.start();
            startRecordingButton.disabled = true;
            stopRecordingButton.disabled = false;
        }
    });

    // Detener la grabación
    $('#stopRecording').on('click', function () {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            startRecordingButton.disabled = false;
            stopRecordingButton.disabled = true;
        }
    });

    // Evento para mostrar el modal y comenzar la cámara
    //$('#modalFoto').on('shown.bs.modal', function () {
    //    startCamera('foto');
    //});

    //$('#modalVideo').on('shown.bs.modal', function () {
    //    startCamera('video');
    //});

    $(document).ready(function () {
        $('#btCerrarFoto').click(function () {
            $('#modalFoto').modal('hide');
        });
    });

    $(document).ready(function () {
        $('#btCerrarVideo').click(function () {
            $('#modalVideo').modal('hide');
        });
    });

    $(document).ready(function () {
        $('#btCerrarCargar').click(function () {
            $('#modalCargar').modal('hide');
        });
    });

    cbSucursal.addEventListener('change', function () {
        const selectedValue = this.value;
        idSucursal = selectedValue;
        //  console.log(idSucursal)
        if (selectedValue != 0) { ObtenerUsuariosXSucursal(selectedValue) }

    });
    cbUsuario.addEventListener('change', function () {
        const selectedValue = this.value;
        idUsuario = selectedValue;
        //  console.log(idUsuario)

    });
});
function Inicializa() {
    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/ContestarLista/Inicializa',
        data: {
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        dataType: 'json',
        success: function (data) {
            if (data.perm != 1) {

                $('#btEnviar').hide();
            }
        },
        error: function (xhr, textStatus, error) {
            alert(status, error);
            alert('[Inicializa] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });
}
function ObtenerTokenFirebase() {
    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/ContestarListaHibrida/ObtenerTokenFirebase',
        dataType: 'json',
        success: function (data) {

            sessionStorage.setItem('tokenFirebase', data.d);
        },
        error: function (xhr, textStatus, error) {
            alert(status, error);
            alert('[Inicializa] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });
}
function dataURLtoBlob(dataUrl) {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}
function agregarImagenASessionStorage(imagen) {
    // Obtener las imágenes existentes del sessionStorage
    const listaImagensStr = sessionStorage.getItem('listaImagens') || '[]';
    const listaImagens = JSON.parse(listaImagensStr);

    // Agregar la nueva imagen a la lista
    listaImagens.push(imagen);

    // Guardar la lista actualizada en sessionStorage
    sessionStorage.setItem('listaImagens', JSON.stringify(listaImagens));

    console.log('Lista de imágenes en sessionStorage:', listaImagens);
}
function obtenerImagensGuardadas() {
    const listaImagensStr = sessionStorage.getItem('listaImagens') || '[]';
    return JSON.parse(listaImagensStr);
}
function generateUUID() {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16).toUpperCase();
    });

    evento = uuid;
}
function ocultarBoton() {
    var boton = document.getElementById('btEnviar');
    boton.style.display = 'none';
}
function mostrarBoton() {
    var boton = document.getElementById('btEnviar');
    boton.style.display = 'block'; // o 'inline-block' dependiendo de tu diseño
}
function generateTextInput(name, idPregunta, esObligatorio, respuestaCorrecta) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.name = name;
    input.dataset.id = idPregunta;
    input.dataset.type = 'text';
    input.dataset.esObligatorio = esObligatorio;
    input.dataset.respuestaCorrecta = respuestaCorrecta; // Añadir respuestaCorrecta aquí
    return input;
}
function generateNumberInput(name, idPregunta, esObligatorio, respuestaCorrecta) {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-control';
    input.name = name;
    input.dataset.id = idPregunta;
    input.dataset.type = 'number';
    input.dataset.esObligatorio = esObligatorio;
    input.dataset.respuestaCorrecta = respuestaCorrecta; // Añadir respuestaCorrecta aquí
    return input;
}
function generateDateInput(name, idPregunta, esObligatorio, respuestaCorrecta) {
    const input = document.createElement('input');
    input.type = 'date';
    input.className = 'form-control datepicker';
    input.name = name;
    input.dataset.id = idPregunta;
    input.dataset.type = 'date';
    input.dataset.esObligatorio = esObligatorio;
    input.dataset.respuestaCorrecta = respuestaCorrecta; // Añadir respuestaCorrecta aquí
    return input;
}
function generateRatingBar(name, starCount, idPregunta, esObligatorio, respuestaCorrecta) {
    starCount = 5;
    const ratingBar = document.createElement('div');
    ratingBar.className = 'rating-bar';
    ratingBar.dataset.name = name;

    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = name;
    hiddenInput.dataset.id = idPregunta;
    hiddenInput.dataset.type = 'rating';
    hiddenInput.dataset.esObligatorio = esObligatorio;
    hiddenInput.dataset.respuestaCorrecta = respuestaCorrecta; // Añadir respuestaCorrecta aquí
    ratingBar.appendChild(hiddenInput);

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('i');
        star.className = 'fa fa-star';
        star.dataset.index = i + 1;
        star.addEventListener('click', function () {
            setRating(ratingBar, star.dataset.index);
        });
        ratingBar.appendChild(star);
    }

    return ratingBar;
}
function setRating(ratingBar, rating) {
    const stars = ratingBar.querySelectorAll('i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
    const hiddenInput = ratingBar.querySelector('input[type="hidden"]');
    hiddenInput.value = rating;
}
function generateRadioButtons(count, name, idPregunta, esObligatorio, respuestaCorrecta) {
    const div = document.createElement('div');
    for (let i = 1; i <= count; i++) {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'grupo' + idPregunta;
        radio.value = i;
        radio.id = `${name[i - 1].opcion}_${i}`;
        radio.dataset.id = idPregunta;
        radio.dataset.type = 'radio';
        radio.dataset.esObligatorio = esObligatorio;
        radio.dataset.respuestaCorrecta = respuestaCorrecta; // Añadir respuestaCorrecta aquí

        const label = document.createElement('label');
        label.className = 'radio-button';

        const span = document.createElement('span');
        span.innerText = name[i - 1].opcion;

        label.appendChild(radio);
        label.appendChild(span);
        div.appendChild(label);
    }
    return div;
}
function generateCheckboxes(count, name, idPregunta, esObligatorio, respuestaCorrecta) {
    const div = document.createElement('div');
    for (let i = 1; i <= count; i++) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'grupo 2';
        checkbox.value = i;
        checkbox.id = `${name[i - 1].opcion}_${i}`;
        checkbox.dataset.id = idPregunta;
        checkbox.dataset.type = 'checkbox';
        checkbox.dataset.esObligatorio = esObligatorio;
        checkbox.dataset.respuestaCorrecta = respuestaCorrecta; // Añadir respuestaCorrecta aquí

        const label = document.createElement('label');
        label.className = 'checkbox-button';

        const span = document.createElement('span');
        span.innerText = name[i - 1].opcion;

        label.appendChild(checkbox);
        label.appendChild(span);
        div.appendChild(label);
    }
    return div;
}
function renderQuestions(questions) {
    const content = document.getElementById('content');
    content.innerHTML = ''; // Limpiar el contenido antes de agregar nuevas preguntas

    questions.forEach((q, index) => {
        const questionContainer = document.createElement('div');
        questionContainer.className = 'question-container mb-3';

        // Crear y agregar elementos de categoría y subcategoría en la misma línea
        const categorySubcategoryDiv = document.createElement('div');
        categorySubcategoryDiv.className = 'category-subcategory';

        const categorySpan = document.createElement('span');
        categorySpan.innerHTML = `Categor&iacute;a: ${q.categoria}`;
        categorySubcategoryDiv.appendChild(categorySpan);

        const subcategorySpan = document.createElement('span');
        subcategorySpan.innerHTML = `Subcategor&iacute;a: ${q.subcategoria}`;
        categorySubcategoryDiv.appendChild(subcategorySpan);

        questionContainer.appendChild(categorySubcategoryDiv);

        // Crear y agregar el elemento de notas
        if (q.notas) {
            const notesDiv = document.createElement('div');
            notesDiv.className = 'notes';

            const notesLabel = document.createElement('label');
            notesLabel.innerText = 'Notas:';

            const notesContent = document.createElement('p');
            notesContent.innerText = q.notas;

            notesDiv.appendChild(notesLabel);
            notesDiv.appendChild(notesContent);

            questionContainer.appendChild(notesDiv);
        }

        const questionDiv = document.createElement('div');
        questionDiv.className = 'col-12 mb-3';

        const questionLabel = document.createElement('label');
        questionLabel.innerText = q.pregunta;
        questionDiv.appendChild(questionLabel);

        const inputName = `question_${index}`;

        if (q.valor === 1) {
            questionDiv.appendChild(generateRatingBar(inputName, q.numero, q.idPregunta, q.esObligatorio, q.respuestaCorrecta));
            questionDiv.appendChild(generateButtons(q.idPregunta)); // Agregar los botones aquí
        } else if (q.valor === 2) {
            var obj = { llav: q.idPregunta, tipoPregunta: "2" };
            $.ajax({
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                type: 'GET',
                url: '/ContestarLista/GetElementoOpciones',
                data: {
                    llav: q.idPregunta,
                    tipoPregunta: "2",
                    idEmpresa: sessionStorage.getItem('idEmpresa'),
                    cadena: sessionStorage.getItem('cadenaBase64'),
                    empresa: sessionStorage.getItem('empresa'),
                    correo: sessionStorage.getItem('correo')


                },
                success: function (msg) {
                    questionDiv.appendChild(generateRadioButtons(msg.d.length, msg.d, q.idPregunta, q.esObligatorio, q.respuestaCorrecta));
                    questionDiv.appendChild(generateButtons(q.idPregunta)); // Agregar los botones aquí
                },
                error: function (xhr, textStatus, error) {
                    alert(textStatus, error);
                    console.error(error);
                }
            });
        } else if (q.valor === 3) {
            var obj = { llav: q.idPregunta, tipoPregunta: "3", empresa: sessionStorage.getItem('empresa'), cadena: sessionStorage.getItem('cadenaBase64') };
            console.error(JSON.stringify(obj))
            $.ajax({
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                type: 'GET',
                url: '/ContestarLista/GetElementoOpciones',
                data: obj,
                
                success: function (msg) {
                    questionDiv.appendChild(generateCheckboxes(msg.d.length, msg.d, q.idPregunta, q.esObligatorio, q.respuestaCorrecta));
                    questionDiv.appendChild(generateButtons(q.idPregunta)); // Agregar los botones aquí
                },
                error: function (xhr, textStatus, error) {
                    alert(textStatus, error);
                    console.error(error);
                }
            });
        } else if (q.valor === 4) {
            questionDiv.appendChild(generateTextInput(inputName, q.idPregunta, q.esObligatorio, q.respuestaCorrecta));
            questionDiv.appendChild(generateButtons(q.idPregunta)); // Agregar los botones aquí
        } else if (q.valor === 5) {
            questionDiv.appendChild(generateNumberInput(inputName, q.idPregunta, q.esObligatorio, q.respuestaCorrecta));
            questionDiv.appendChild(generateButtons(q.idPregunta)); // Agregar los botones aquí
        } else if (q.valor === 6) {
            questionDiv.appendChild(generateDateInput(inputName, q.idPregunta, q.esObligatorio, q.respuestaCorrecta));
            questionDiv.appendChild(generateButtons(q.idPregunta)); // Agregar los botones aquí
        }

        const notesDiv = document.createElement('div');
        notesDiv.className = 'notes';

        // Creación de la etiqueta de notas
        const notesLabel = document.createElement('label');
        notesLabel.innerText = 'Notas:';

        // Creación del área de texto de notas
        const notesTextarea = document.createElement('textarea');
        notesTextarea.className = 'form-control';
        notesTextarea.dataset.id = q.idPregunta;
        notesTextarea.dataset.type = 'notas';
        notesTextarea.rows = 3;

        // Asegúrate de no tener ningún evento que bloquee el comportamiento por defecto de la barra espaciadora
        notesTextarea.addEventListener('keydown', function (event) {
            if (event.key === ' ') {
                // Permite el comportamiento por defecto
                event.stopPropagation();
            }
        });

        // Añadir la etiqueta y el área de texto al contenedor de notas
        notesDiv.appendChild(notesLabel);
        notesDiv.appendChild(notesTextarea);

        // Añadir el contenedor de preguntas y notas al contenedor principal
        questionContainer.appendChild(questionDiv);
        questionContainer.appendChild(notesDiv);
        content.appendChild(questionContainer);
    });
}
function startCamera(idPregunta) {
    currentIdPregunta = idPregunta;

    // Solicitar acceso a la cámara para video
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {

                archivosVideos.push({ idPregunta: currentIdPregunta, url: dataUrl });
            };
        })
        .catch((err) => {
            console.error("Error al acceder a la cámara para video: ", err);
        });

    // Si necesitas acceso a una segunda cámara (si el dispositivo lo permite), aquí se solicita
    navigator.mediaDevices.getUserMedia({ video: true }) // Puedes usar 'video: { facingMode: { exact: 'environment' } }' para cámaras traseras
        .then((stream) => {
            video2.srcObject = stream;
            video2.play();
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };


            mediaRecorder.onstop = async () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                recordedChunks = [];
                const videoURL = URL.createObjectURL(blob);
                recordedVideo.src = videoURL;

                const blobData = await fetchBlobAsBase64(videoURL);
                sessionStorage.setItem(`video_${currentIdPregunta}`, blobData);
            };
        })

        .catch((err) => {
            console.error("Error al acceder a la segunda cámara: ", err);
        });
}
async function fetchBlobAsBase64(blobUrl) {
    const response = await fetch(blobUrl);
    const blobData = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result;
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blobData);
    });
}
function generateButtons(idPregunta) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    //const buttons = ['Foto', 'Video', 'Archivo'];
    //const modalIds = ['#modalFoto', '#modalVideo', '#modalCargar'];
    //const buttonClasses = ['button-foto', 'button-video', 'button-archivo'];

    const buttons = ['Archivo'];
    const modalIds = ['#modalCargar'];
    const buttonClasses = ['button-archivo'];

    buttons.forEach((text, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `btn btn-primary custom-margin ${buttonClasses[index]}`; // Añadir clase específica
        button.innerText = text;
        button.dataset.idPregunta = idPregunta; // Agregar idPregunta como atributo de datos
        button.addEventListener('click', () => {
            $(modalIds[index]).modal('show');
            startCamera(idPregunta);
        });
        buttonContainer.appendChild(button);
    });

    return buttonContainer;
}
// Initialize datepickers
/*$('.datepicker').datepicker({
    dateFormat: 'yy-mm-dd'
});*/

/*
function getResponses() {
    const responses = [];
    const content = document.getElementById('content');
    const inputs = content.querySelectorAll('input, select, textarea');

    const responseTypeMap = {
        'text': 4,
        'number': 5,
        'date': 6,
        'rating': 1,
        'radio': 2,
        'checkbox': 3
    };

    inputs.forEach(input => {
        if ((input.type === 'radio' || input.type === 'checkbox') && !input.checked) {
            return; // Saltar inputs de radio y checkbox no seleccionados
        }

        if (input.type === 'hidden' && !input.closest('.rating-bar')) {
            return; // Saltar inputs ocultos que no están en una barra de calificación
        }

        const label = input.closest('label');
        const type = input.dataset.type;

        if (type && responseTypeMap[type] !== undefined) {
            const response = {
                idPregunta: input.dataset.id,
                value: input.value,
                text: label ? label.innerText.trim() : '',
                type: responseTypeMap[type],
                esObligatorio: input.dataset.esObligatorio === 'true' // Convertir a booleano
            };
            responses.push(response);
        }
    });

    return responses;
}
*/

document.getElementById('btEnviar').addEventListener('click', async () => {

    ValidarFormulario();
});
function ValidarFormulario() {
    //const responses = getResponses();
    //generateUUID();
    //if (idSucursal == 0 || idUsuario == 0) {
    //    Swal.fire({
    //        text: 'Por favor, selecciona una sucursal y un usuario.',
    //        icon: "error",
    //        buttonsStyling: false,
    //        confirmButtonText: "Ok, entendido!",
    //        customClass: {
    //            confirmButton: "btn font-weight-bold btn-light-primary"
    //        }
    //    });
    //    return;
    //}

    //// Validar respuestas obligatorias
    //let allValid = true;
    //responses.forEach(response => {
    //    if (response.esObligatorio && !response.value.trim()) {
    //        allValid = false;
    //        const questionElement = document.querySelector(`[data-id='${response.idPregunta}']`);
    //        if (questionElement) {
    //            questionElement.classList.add('invalid');
    //        }
    //    }
    //});

    //if (!allValid) {
    //    Swal.fire({
    //        text: 'Por favor, responda todas las preguntas obligatorias.',
    //        icon: "error",
    //        buttonsStyling: false,
    //        confirmButtonText: "Ok, entendido!",
    //        customClass: {
    //            confirmButton: "btn font-weight-bold btn-light-primary"
    //        }
    //    });
    //    return;
    //}

    //responses.forEach(response => {
    //    const questionElement = document.querySelector(`[data-id='${response.idPregunta}']`);
    //    if (questionElement) {
    //        questionElement.classList.remove('invalid');
    //    }
    //});

    //const respuestas = [];


    //if ("geolocation" in navigator) {
    //    navigator.geolocation.getCurrentPosition(
    //        (position) => {
    //            console.log("Tienes permisos para geolocalización.");
    //            // Aquí puedes trabajar con la posición
    //            console.log("Latitud: " + position.coords.latitude);
    //            console.log("Longitud: " + position.coords.longitude);
    //        },
    //        (error) => {
    //            if (error.code === error.PERMISSION_DENIED) {
    //                console.log("No tienes permisos para acceder a la geolocalización.");
    //            } else {
    //                console.log("Error al intentar acceder a la geolocalización: " + error.message);
    //            }
    //        }
    //    );
    //} else {
    //    console.log("La geolocalización no está soportada por tu navegador.");
    //}


    //if (latitud === "" && longitud === "") {
    //    Swal.fire({
    //        text: 'Por favor, debe activar la geolocalización para poder responder ',
    //        icon: "error",
    //        buttonsStyling: false,
    //        confirmButtonText: "Ok, entendido!",
    //        customClass: {
    //            confirmButton: "btn font-weight-bold btn-light-primary"
    //        }
    //    });
    //    return;
    //}

    isBotonPrecionado = true;

    if (solicitudes == false) {
        EnviarFormularioLista();

    } else {

        Swal.fire({
            title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
            allowEscapeKey: false,
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: function () {

            }
        });
    }


}
function EnviarFormularioLista() {

    FormularioEnviado = true;
    const responses = getResponses();
    generateUUID();
    if (idSucursal == 0 || idUsuario == 0) {
        Swal.fire({
            text: 'Por favor, selecciona una sucursal y un usuario.',
            icon: "error",
            buttonsStyling: false,
            confirmButtonText: "Ok, entendido!",
            customClass: {
                confirmButton: "btn font-weight-bold btn-light-primary"
            }
        });
        return;
    }

    // Validar respuestas obligatorias
    let allValid = true;
    responses.forEach(response => {
        if (response.esObligatorio && !response.value.trim()) {
            allValid = false;
            const questionElement = document.querySelector(`[data-id='${response.idPregunta}']`);
            if (questionElement) {
                questionElement.classList.add('invalid');
            }
        }
    });

    if (!allValid) {
        Swal.fire({
            text: 'Por favor, responda todas las preguntas obligatorias.',
            icon: "error",
            buttonsStyling: false,
            confirmButtonText: "Ok, entendido!",
            customClass: {
                confirmButton: "btn font-weight-bold btn-light-primary"
            }
        });
        return;
    }

    responses.forEach(response => {
        const questionElement = document.querySelector(`[data-id='${response.idPregunta}']`);
        if (questionElement) {
            questionElement.classList.remove('invalid');
        }
    });

    const respuestas = [];


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


    responses.forEach(response => {
        let respuestaValor = '';
        if (response.type == 2 || response.type == 3) {
            respuestaValor = response.text;
        } else {
            respuestaValor = response.value;
        }

        const urlsVideo = [];
        //for (let i = 0; i < sessionStorage.length; i++) {
        //    const key = sessionStorage.key(i);
        //    if (key.startsWith(`video_${response.idPregunta}`)) {
        //        urlsVideo.push(sessionStorage.getItem(key));
        //    }
        //}

        const urlsFoto = [];
        archivosVideos.forEach((element) => {
            if (response.idPregunta == element.idPregunta) {
                urlsVideo.push(element.url)
            }
        });

        archivosImg.forEach((element) => {
            if (response.idPregunta == element.idPregunta) {
                urlsFoto.push(element.url)
            }
        });

        var calificacionPregunta = "0"
        if (response.respuestaCorrecta != null && response.respuestaCorrecta != "") {
            if (response.respuestaCorrecta == response.value) {
                calificacionPregunta = response.value
            } else {
                calificacionPregunta = "0"
            }
        }

        respuestas.push({
            llav: '',
            idLista: $('#cbPrograma').val(),
            idPregunta: response.idPregunta,
            respuestaValor: respuestaValor,
            notas: response.notas,
            idPrograma: idPrograma,
            idTipoPregunta: response.type,
            explicacion: '0',
            valor: response.value,
            calificacion: calificacionPregunta,
            obligatoria: false,
            evento: evento,
            urlVideos: urlsVideo,
            urlFotos: urlsFoto,
            RespuestaCorrecta: response.respuestaCorrecta == null ? "" : response.respuestaCorrecta,
            idSucursal: idSucursal,
            idUsuario: idUsuario,
            latitud: latitud.toString(),
            longitud: longitud.toString(),
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        });
    });



    console.log(respuestas);




    // Mostrar mensaje de procesamiento
    document.getElementById('processingMessage').style.display = 'block';


    //  if (contadorVideos === contadorUrls) {


    // Ocultar mensaje de procesamiento
    document.getElementById('processingMessage').style.display = 'none';

    Swal.fire({
        title: "<div>Procesando la petición, por favor espere...</div><div class='spinner spinner-primary spinner-lg mr-15'></div>",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: function () {
            try {
                $.ajax({
                    async: true,
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    url: '/ContestarLista/GuardarRespuesta',
                    data: JSON.stringify(transformarLista(respuestas)),
                    dataType: "json",
                    timeout: 600000,
                    success: function (data) {
                        Swal.close();
                        if (data.d === 'Ok') {
                            //  generateUUID()

                            ocultarBoton();
                            Swal.fire({
                                text: 'Los datos se han guardado.',
                                icon: "success",
                                buttonsStyling: false,
                                confirmButtonText: "Ok, entendido!",
                                customClass: {
                                    confirmButton: "btn font-weight-bold btn-light-primary"
                                }
                            }).then(function () {
                                clearContent();
                            });
                        } else {
                            Swal.fire({
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
                        console.log(xhr)
                        console.log(status)
                        console.log(error)
                        alert(status, error);
                        alert(error);
                        Swal.fire({
                            text: 'No se pudo contestar la lista ' + error + status + xhr,
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Ok",
                            customClass: {
                                confirmButton: "btn font-weight-bold btn-light-primary"
                            }
                        }).then(function () {
                            //clearContent();
                        });
                    }
                });
            } catch (error) {

                console.error('Error al procesar las respuestas:', error);
                Swal.fire({
                    text: 'Ocurrió un error al procesar las respuestas.',
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, entendido!",
                    customClass: {
                        confirmButton: "btn font-weight-bold btn-light-primary"
                    }
                });
            }
        }
    });
    // }
};
function transformarLista(lista) {

    return lista.map(item => ({
        llav: item.llav || "",
        idLista: item.idLista || "",
        idPregunta: item.idPregunta || "",
        respuestaValor: item.respuestaValor || "",
        notas: item.notas || "N/A",
        idPrograma: item.idPrograma || "",
        idTipoPregunta: item.idTipoPregunta || 0,
        explicacion: item.explicacion || "",
        valor: parseInt(item.valor) || 0,
        calificacion: parseInt(item.calificacion) || 0,
        obligatoria: item.obligatoria || false,
        evento: item.evento || "",
        urlVideos: item.urlVideos || [],
        urlFotos: item.urlFotos || [],
        RespuestaCorrecta: item.RespuestaCorrecta || "",
        idSucursal: item.idSucursal || "",
        idUsuario: item.idUsuario || "",
        latitud: item.latitud || "",
        longitud: item.longitud || "",
        idEmpresa: item.idEmpresa || "",
        cadena: item.cadena || "",
        empresa: item.empresa || "",
        correo: item.correo || ""
    }));
}
function getResponses() {
    const responses = [];
    const content = document.getElementById('content');
    const inputs = content.querySelectorAll('input, select, textarea');

    const responseTypeMap = {
        'text': 4,
        'number': 5,
        'date': 6,
        'rating': 1,
        'radio': 2,
        'checkbox': 3
    };

    inputs.forEach(input => {
        if ((input.type === 'radio' || input.type === 'checkbox') && !input.checked) {
            return; // Saltar inputs de radio y checkbox no seleccionados
        }

        if (input.type === 'hidden' && !input.closest('.rating-bar')) {
            return; // Saltar inputs ocultos que no están en una barra de calificación
        }

        const label = input.closest('label');
        const type = input.dataset.type;

        if (type && responseTypeMap[type] !== undefined) {
            const response = {
                idPregunta: input.dataset.id,
                value: input.value,
                text: label ? label.innerText.trim() : '',
                type: responseTypeMap[type],
                esObligatorio: input.dataset.esObligatorio === 'true', // Convertir a booleano
                respuestaCorrecta: input.dataset.respuestaCorrecta, // Añadir respuestaCorrecta aquí

            };
            responses.push(response);
        } else if (type === 'notas') {
            const existingResponse = responses.find(r => r.idPregunta === input.dataset.id);
            if (existingResponse) {
                existingResponse.notas = input.value;
            } else {
                responses.push({
                    idPregunta: input.dataset.id,
                    notas: input.value,
                    type: 'notas'
                });
            }
        }
    });

    return responses;
}
function ObtenerComboPrograma() {
    var obj = {};
    obj.opci = "1";


    $('#cbPrograma').on('select2:select', function (e) {
        console.log('funciona?');
        var selectedData = e.params.data;
        //  console.log('Selected idLista:', selectedData.idLista);
        idPrograma = selectedData.idLista;

        //  $(this).data('idLista', selectedData.idLista);
    });


    $('#cbPrograma').select2({
        minimumInputLength: 0,
        allowClear: true,
        placeholder: '',
        ajax: {
            quietMillis: 150,
            url: "/ContestarLista/GetProgramasXAlumno",
            dataType: 'json',
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            data: function (valores) {
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
                        idLista: item.idLista
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
function ObtenerSucursal() {
    var obj = {};
    obj.opci = "1";


    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/ContestarLista/GetSucursales',
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

            alert('[GetSucursales] status: ' + xhr.status + ', responseText: ' + xhr.responseText + ', textStatus: ' + textStatus + ', error: ' + error);
        }
    });

}
function ObtenerUsuariosXSucursal(selectedValue) {


    $.ajax({
        type: 'GET',
        async: true,
        contentType: 'application/json; charset=utf-8',
        url: '/ContestarLista/GetUsuariosXSucursal',
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
function ConsultarPreguntas() {


    $.ajax({
        'dataType': 'json',
        'contentType': 'application/json; charset=utf-8',
        'type': 'GET',
        'url': '/ContestarLista/GetData',
        'data': {
            idPrograma: $('#cbPrograma').val(),
            idLista: $('#cbEvaluaciones').val(),
            idEmpresa: sessionStorage.getItem('idEmpresa'),
            cadena: sessionStorage.getItem('cadenaBase64'),
            empresa: sessionStorage.getItem('empresa'),
            correo: sessionStorage.getItem('correo')
        },
        'success': function (msg) {
            // console.log(msg.d)
            var idPregunta = '';
            var pregunta = [];
            msg.d.forEach((elemento, indice) => {
                mostrarBoton();
                idLista = elemento.idLista;
                pregunta.push({
                    pregunta: elemento.pregunta,
                    valor: parseInt(elemento.tipo),
                    numero: parseInt(elemento.valor),
                    idPregunta: elemento.id,
                    esObligatorio: elemento.obligatorio,
                    respuestaCorrecta: elemento.respuestaCorrecta,
                    categoria: elemento.categoria,
                    subcategoria: elemento.subcategoria,
                    notas: elemento.notas
                });
                idPregunta = elemento.id;
            });

            renderQuestions(pregunta);
        },
        error: function (xhr, textStatus, error) {

            console.error('Error:', error);
        }
    });
}
// Renderiza las preguntas al cargar la página
/*
function generateRatingBar(starCount) {
    const ratingBar = document.getElementById('ratingBar');
    ratingBar.innerHTML = ''; // Clear any existing stars

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('i');
        star.className = 'fa fa-star';
        star.dataset.index = i + 1;
        star.addEventListener('click', function () {
            setRating(star.dataset.index);
        });
        ratingBar.appendChild(star);
    }
}

function setRating(rating) {
    const stars = document.querySelectorAll('.rating-bar i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
}*/
// Call the function with the desired number of stars
function clearContent() {
    const content = document.getElementById('content');
    content.innerHTML = '';
}

