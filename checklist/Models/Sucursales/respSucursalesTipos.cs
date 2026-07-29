namespace checklist.Models.Sucursales
{
	public class respSucursalesTipos
	{
		public string Id { get; set; }
		public string IdEmpresa { get; set; }
		public string Nombre { get; set; }
		public DateTime? Fecha { get; set; }
		public bool? Virtual { get; set; }
		public bool? Borrado { get; set; }
		public string Notas { get; set; }
		public int? ValVirtual { get; set; }
	}
}
