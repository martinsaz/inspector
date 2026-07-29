using Newtonsoft.Json;

namespace checklist.Models.Roles
{
	public class Opciones
	{
		[JsonProperty(Order = 1)]
		public string Opcion { get; set; }
		[JsonProperty(Order = 2)]
		public Permisos Permisos { get; set; } = new Permisos();
		[JsonProperty(Order = 3)]
		public List<Opciones> Hijos = new List<Opciones>();
	}

	public class Permisos
	{
		[JsonProperty(Order = 1)]
		public int Acceso { get; set; }
		[JsonProperty(Order = 2)]
		public int Escritura { get; set; }
	}
}
