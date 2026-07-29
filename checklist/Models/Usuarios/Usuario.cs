namespace checklist.Models.Usuarios
{
    public class Usuario1
    {
        public int? CheckApp { get; set; }
        public string? correo { get; set; }
        public string empresa { get; set; }
        public string? fechahora { get; set; }
        public string? nombre { get; set; }
        public bool? status { get; set; }
        public string telefono { get; set; }
        public string? uid { get; set; }
        public Guid? idRol { get; set; }

        public string? Cadena { get; set; }

		public string idEmpresa { get; set; }
	}


	//public class Conexion
	//{
	//	public string Cadena { get; set; }
	//	public string IdEmpresa { get; set; }
	//	public string Nombre { get; set; }
	//	public int Status { get; set; }
	//	public string Vigencia { get; set; }
	//}
}
