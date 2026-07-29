namespace checklist.Models.Firebase
{
	public class Usuario
	{
		public bool cliente { get; set; }
		public string correo { get; set; }
		public int empresa { get; set; }
		public string fechahora { get; set; }
		public string nombre { get; set; }
		public bool status { get; set; }
		public string uid { get; set; }

		public Conexion Conexion { get; set; } = null;
		public Guid? idRol { get; set; }
		public string NombreRol { get; set; }

		public bool validado { get; set; }

        public int checkapp { get; set; }
    }
}
