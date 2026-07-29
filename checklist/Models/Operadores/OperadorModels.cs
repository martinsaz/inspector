namespace checklist.Models.Operadores
{
    public class respOperador
    {
        public string IdOperador { get; set; } = string.Empty;
        public string IdEmpresa { get; set; } = string.Empty;
        public string IdFirebase { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string ApellidoPaterno { get; set; } = string.Empty;
        public string ApellidoMaterno { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Sucursales { get; set; } = string.Empty;
        public bool Activo { get; set; }
        public int Estatus { get; set; }
        public string Estado { get; set; } = string.Empty;
        public DateTime? FechaAlta { get; set; }
        public DateTime? FechaSuspension { get; set; }
        public string VersionRow { get; set; } = string.Empty;
        public List<respOperadorSucursal> SucursalesDetalle { get; set; } = new();
    }

    public class respOperadorSucursal
    {
        public string IdSucursal { get; set; } = string.Empty;
        public string Sucursal { get; set; } = string.Empty;
        public bool Activo { get; set; }
    }

    public class respOperadorAcceso
    {
        public bool TieneAcceso { get; set; }
        public bool OperadorActivo { get; set; }
        public bool CuentaActiva { get; set; }
        public string IdOperador { get; set; } = string.Empty;
        public string IdEmpresa { get; set; } = string.Empty;
        public string IdFirebase { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string VersionRow { get; set; } = string.Empty;
        public List<respOperadorSucursal> Sucursales { get; set; } = new();
    }

    public class respOperadorOperacion
    {
        public bool Ok { get; set; }
        public string Mensaje { get; set; } = string.Empty;
        public string Advertencia { get; set; } = string.Empty;
        public string VersionRow { get; set; } = string.Empty;
    }

    public class respOperadorIdentidadDualCandidato
    {
        public string IdUsuario { get; set; } = string.Empty;
        public string IdEmpresa { get; set; } = string.Empty;
        public string IdFirebase { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string ApellidoPaterno { get; set; } = string.Empty;
        public string ApellidoMaterno { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public bool UsuarioActivo { get; set; }
        public bool YaEsOperador { get; set; }
        public string IdOperador { get; set; } = string.Empty;
        public bool IdentidadValida { get; set; }
        public string Mensaje { get; set; } = string.Empty;
    }
}
