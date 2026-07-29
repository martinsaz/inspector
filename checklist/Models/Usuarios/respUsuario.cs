namespace checklist.Models.Usuarios
{
	public class respUsuario
	{
		public string Id { get; set; }
		public string Nombre { get; set; }
	
		public string APaterno { get; set; }
		
		public string AMaterno { get; set; }
		public DateTime? FechaNacimiento { get; set; }
		public string Numero { get; set; }
		public string TelefonoMovil { get; set; }
		public string TelefonoFijo { get; set; }
		public string CorreoInstitucional { get; set; }
		public string CorreoPersonal { get; set; }
		public string IdSucursal { get; set; }
        public string NombreSucursal { get; set; }
        public string IdDepartamento { get; set; }
        public string NombreDepartamento { get; set; }
        public string IdPuesto { get; set; }
        public string NombrePuesto { get; set; }
        public bool? Estado { get; set; }
		public DateTime? FechaIngreso { get; set; }
		public bool? Estatus { get; set; }
		public string Notas { get; set; }
		public bool? borrado { get; set; }
		public DateTime? FechaAlta { get; set; }
		public string FotoLink { get; set; }
		public string IdFirebase { get; set; }
		public string IdEmpresa { get; set; }

		public string cadFechaNac { get; set; }
		public string cadFechaIng { get; set; }
		public int ValEstado { get; set; }

        public Guid? idRol { get; set; }
        public string NombreRol { get; set; }
    }
}
