namespace checklist.Models.Preguntas
{
    public class PreguntasOpciones
    {
        public Guid? id { get; set; }
        public Guid idEmpresa { get; set; }
        public Guid idLista { get; set; }
        public string opcion { get; set; }
        public Guid? idPregunta { get; set; }
        public string tipoPregunta { get; set; }
    }
}
