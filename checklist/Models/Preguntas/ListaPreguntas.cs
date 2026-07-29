namespace checklist.Models.Preguntas
{
    public class ListaPreguntas
    {
        public Guid? id { get; set; }
        public Guid idEmpresa { get; set; }
        public Guid idLista { get; set; }
        public string Pregunta { get; set; }
        public string Explicacion { get; set; }
        public decimal? Tipo { get; set; }
        public decimal? Valor { get; set; }
        public bool? Obligatorio { get; set; }
        public bool? Status { get; set; }
        public decimal? Estado { get; set; }
        public string RespuestaCorrecta { get; set; }

        public Guid? idCategoria { get; set; }
        public string Categoria { get; set; }
        public Guid? idSubcategoria { get; set; }

        public string Subcategoria { get; set; }
    }
}
