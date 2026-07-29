$(document).ready(function () {
    PintaDatos();
});

function PintaDatos() {
    $.ajax({
        type: 'GET',
        url: '/Home/GetDatosUsuario',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            $('#userName1').html(data.usuario);
            $('#userName2').html(data.usuario);
            $('#mail1').html(data.correo);
            $('#empresa').html(data.empresa);
        },
        error: function (error) {
            console.log(error)
        }
    });
}
