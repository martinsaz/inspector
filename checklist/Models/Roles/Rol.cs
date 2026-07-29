namespace checklist.Models.Roles
{
	public class Rol
	{
		public Guid? id { get; set; }
		public int? idEmpresa { get; set; }
		public string? NombreRol { get; set; }
		public string? Permisos { get; set; }

		public string CadConexion { get; set; }
	}
}
