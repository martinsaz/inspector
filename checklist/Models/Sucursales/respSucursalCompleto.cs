namespace checklist.Models.Sucursales
{
	public class respSucursalCompleto
	{
		public string Id { get; set; }
		public string IdEmpresa { get; set; }
		public string Nombre { get; set; }
		public string Direccion { get; set; }
		public string Ciudad { get; set; }
		public string Telefono { get; set; }
		public string Numero { get; set; }
		public string Correo { get; set; }
		public string Pais { get; set; }
		public string IdTitular { get; set; }
		public string usuario { get; set; }
		public string IdRazonSocial { get; set; }
		public string NombreRzonSocial { get; set; }
		public string IdZona { get; set; }
		public string NombreZona { get; set; }
		public string IdSucursalTipo { get; set; }
		public string NombreSucursalTipo { get; set; }
		public string Notas { get; set; }
		public bool borrado { get; set; }
		public DateTime Fecha { get; set; }
		public string LinkImagen { get; set; }
	}
}
