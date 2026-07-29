namespace checklist.Models.Listas
{
    public class Lista
    {
        public Guid? id { get; set; }
        public Guid idEmpresa { get; set; }
        public Guid idPrograma { get; set; }
        public Guid idInstructor { get; set; }
        public Guid idusuario { get; set; }
        public string Nombre { get; set; }
        public DateTime? fechacreacion { get; set; }
        public string Notas { get; set; }
        public bool? Activo { get; set; }
        public bool? Status { get; set; }
        public decimal? Estado { get; set; }
        public bool? UsaActivos { get; set; }
        public Guid? idTipoActivo { get; set; }
        public string? TipoActivo { get; set; }
        public int? CantidadTareas { get; set; }
        public string? latitud { get; set; }
        public string? longitud { get; set; }
    }
}
