namespace checklist.Models.Puestos
{
    public class Puesto
    {
        public Guid id { get; set; }
        public string Nombre { get; set; }
        public string notas { get; set; }
        public DateTime? fecha { get; set; }
        public bool? borrado { get; set; }
        public Guid? idEmpresa { get; set; }
    }
}
