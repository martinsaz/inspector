namespace checklist.Models.Listas
{
	public class ListasRespuestas
	{
		public Guid? id { get; set; }
		public Guid idEmpresa { get; set; }
		public Guid idLista { get; set; }
		public Guid idPregunta { get; set; }
		public string RespuestaValor { get; set; }
		public string Notas { get; set; }
		public Guid idAlumno { get; set; }
		public Guid? idPrograma { get; set; }
		public decimal? idTipoPregunta { get; set; }
		public string Explicacion { get; set; }
		public decimal? Valor { get; set; }
		public decimal? Calificacion { get; set; }
		public bool? obligatoria { get; set; }

		public string Lista { get; set; }
		public string Pregunta { get; set; }
		public string Alumno { get; set; }

        public List<string> urlVideos { get; set; }
        public List<string> urlFotos { get; set; }
        public string RespuestaCorrecta { get; set; }

        public string idSucursal { get; set; }
        public string idUsuario { get; set; }
        public string idActivo { get; set; }

        public string latitud { get; set; }
        public string longitud { get; set; }
        public string stamp { get; set; }
    }
}
