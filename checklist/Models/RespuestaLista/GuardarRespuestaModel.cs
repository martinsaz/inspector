using checklist.Models.Preguntas;

namespace checklist.Models.RespuestaLista
{
    public class GuardarRespuestaModel
    {
        public List<Respuesta> ListaRespuesta { get; set; }
        public string IdEmpresa { get; set; }
        public string CadenaBase64 { get; set; }
        public string Empresa { get; set; }
        public string Correo { get; set; }
    }
}
