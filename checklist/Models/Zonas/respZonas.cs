namespace checklist.Models.Zonas
{
	public class respZona
	{

        public string? Id { get; set; }
        public string? IdEmpresa { get; set; }
        public string Nombre { get; set; }
        public string Notas { get; set; }
        public DateTime? Fecha { get; set; }
        public bool? borrado { get; set; }
    }
}
