namespace checklist.Models.Preguntas
{
    public class Respuesta
    {
        public string llav { get; set; }
        public string idLista { get; set; }
        public string idPregunta { get; set; }
        public string respuestaValor { get; set; }
        public string notas { get; set; }
        public string idPrograma { get; set; }
        public int idTipoPregunta { get; set; }
        public string explicacion { get; set; }
        public int valor { get; set; }
        public int calificacion { get; set; }
        public bool obligatoria { get; set; }
        public string evento { get; set; }
        public List<string> urlVideos { get; set; }
        public List<string> urlFotos { get; set; }
        public string idSucursal { get; set; }
        public string idUsuario { get; set; }
        public string idActivo { get; set; }

        public string RespuestaCorrecta { get; set; }
        public string latitud { get; set; }
        public string longitud { get; set; }
        public string idEmpresa { get; set; }
        public string cadena { get; set; }
        public string empresa { get; set; }
        public string correo { get; set; }
    }

}
