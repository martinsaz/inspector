namespace checklist.Models.Firebase
{
	public class Conexion
	{
		public string Cadena { get; set; }
		public string Nombre { get; set; }
		public int? Status { get; set; }
		public string Vigencia { get; set; }
		public string? Token { get; set; }
		public string idEmpresa { get; set; }
		public bool? BootstrapCompleto { get; set; }
		public string? BootstrapActualizado { get; set; }
		public BootstrapEmpresaIds? BootstrapIds { get; set; }
	}

	public class BootstrapEmpresaIds
	{
		public string? IdRol { get; set; }
		public string? IdRazonSocial { get; set; }
		public string? IdZona { get; set; }
		public string? IdSucursal { get; set; }
		public string? IdDepartamento { get; set; }
		public string? IdPuestoAdministrador { get; set; }
		public string? IdPuestoSupervisor { get; set; }
	}
}
