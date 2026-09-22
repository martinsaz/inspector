using System.Text;
using checklist.Models.Roles;

namespace checklist.Clases
{
    public static class ProveeduriaMenuBuilder
    {
        private const string ProductosServiciosPermissionCode = "05001000";
        private const string ProductosServiciosAbcPermissionCode = "05001001";
        private const string ProductosServiciosCatalogosPermissionCode = "05001002";
        private const string ProductosServiciosCategoriasPermissionCode = "05001003";
        private const string ProductosServiciosMarcasPermissionCode = "05001004";
        private const string ProductosServiciosUnidadesPermissionCode = "05001005";
        private const string OrdenesCompraPermissionCode = "05003000";
        private const string OrdenesCompraNuevaPermissionCode = "05003001";
        private const string OrdenesCompraReportePermissionCode = "05003002";
        private const string RecepcionPermissionCode = "05004000";
        private const string RecepcionNuevaPermissionCode = "05004001";
        private const string RecepcionReportePermissionCode = "05004002";
        private const bool RecepcionUiDisponible = false;

        public static string BuildForSuperAdmin()
            => Build(OfficialSuperAdminPermissions());

        public static ProveeduriaMenuAccess ResolveAccessForSuperAdmin()
            => ResolveAccess(OfficialSuperAdminPermissions());

        public static List<Opciones> AddOfficialSuperAdminPermissions(IEnumerable<Opciones> currentPermissions)
        {
            List<Opciones> merged = CloneOptions(currentPermissions).ToList();
            foreach (Opciones official in OfficialSuperAdminPermissions())
            {
                MergePermission(merged, official);
            }

            return merged;
        }

        public static IReadOnlyList<Opciones> OfficialSuperAdminPermissions()
            => new List<Opciones>
            {
                new Opciones
                {
                    Opcion = "05000000",
                    Permisos = AccessOnly(),
                    Hijos =
                    {
                        new Opciones
                        {
                            Opcion = ProductosServiciosPermissionCode,
                            Permisos = AccessOnly(),
                            Hijos =
                            {
                                new Opciones { Opcion = ProductosServiciosAbcPermissionCode, Permisos = AccessWrite() },
                                new Opciones
                                {
                                    Opcion = ProductosServiciosCatalogosPermissionCode,
                                    Permisos = AccessOnly(),
                                    Hijos =
                                    {
                                        new Opciones { Opcion = ProductosServiciosCategoriasPermissionCode, Permisos = AccessWrite() },
                                        new Opciones { Opcion = ProductosServiciosMarcasPermissionCode, Permisos = AccessWrite() },
                                        new Opciones { Opcion = ProductosServiciosUnidadesPermissionCode, Permisos = AccessWrite() }
                                    }
                                }
                            }
                        },
                        new Opciones
                        {
                            Opcion = OrdenesCompraPermissionCode,
                            Permisos = AccessOnly(),
                            Hijos =
                            {
                                new Opciones { Opcion = OrdenesCompraNuevaPermissionCode, Permisos = AccessWrite() },
                                new Opciones { Opcion = OrdenesCompraReportePermissionCode, Permisos = AccessWrite() }
                            }
                        },
                        new Opciones
                        {
                            Opcion = RecepcionPermissionCode,
                            Permisos = AccessOnly(),
                            Hijos =
                            {
                                new Opciones { Opcion = RecepcionNuevaPermissionCode, Permisos = AccessWrite() },
                                new Opciones { Opcion = RecepcionReportePermissionCode, Permisos = AccessWrite() }
                            }
                        }
                    }
                }
            };

        public static string Build(IEnumerable<Opciones> opciones)
        {
            ProveeduriaMenuAccess access = ResolveAccess(opciones);
            if (!access.ShowModule)
            {
                return string.Empty;
            }

            StringBuilder sb = new StringBuilder();
            sb.Append(@"<div id=""menu-proveeduria"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
            sb.Append(@"<span class=""menu-link""> <span class=""menu-icon""> <i class=""ki-duotone ki-element-plus fs-2""> <span class=""path1""></span> <span class=""path2""></span> <span class=""path3""></span> <span class=""path4""></span> <span class=""path5""></span> </i> </span> <span class=""menu-title"">Proveeduría</span> <span class=""menu-arrow""></span> </span>");
            sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");

            AppendProductosServicios(sb, access);
            AppendProveedores(sb);
            AppendOrdenesCompra(sb, access);
            AppendRecepcion(sb, access);

            sb.Append(@"</div>");
            sb.Append(@"</div>");
            return sb.ToString();
        }

        public static ProveeduriaMenuAccess ResolveAccess(IEnumerable<Opciones> opciones)
        {
            bool productosServicios = HasAccess(opciones, ProductosServiciosPermissionCode);
            bool catalogos = HasAccess(opciones, ProductosServiciosCatalogosPermissionCode);
            bool categorias = HasAccess(opciones, ProductosServiciosCategoriasPermissionCode);
            bool marcas = HasAccess(opciones, ProductosServiciosMarcasPermissionCode);
            bool unidades = HasAccess(opciones, ProductosServiciosUnidadesPermissionCode);
            bool ordenesCompraNueva = HasAccess(opciones, OrdenesCompraNuevaPermissionCode);
            bool ordenesCompraReporte = HasAccess(opciones, OrdenesCompraReportePermissionCode);
            bool ordenesCompra = HasAccess(opciones, OrdenesCompraPermissionCode) || ordenesCompraNueva || ordenesCompraReporte;
            bool recepcionNueva = HasAccess(opciones, RecepcionNuevaPermissionCode);
            bool recepcionReporte = HasAccess(opciones, RecepcionReportePermissionCode);
            bool recepcion = HasAccess(opciones, RecepcionPermissionCode) || recepcionNueva || recepcionReporte;
            bool recepcionMenuDisponible = RecepcionUiDisponible && recepcion;

            return new ProveeduriaMenuAccess
            {
                ShowProductosServiciosAbc = productosServicios && HasAccess(opciones, ProductosServiciosAbcPermissionCode),
                ShowProductosServiciosCatalogos = productosServicios && catalogos && (categorias || marcas || unidades),
                ShowProductosServiciosCategorias = productosServicios && catalogos && categorias,
                ShowProductosServiciosMarcas = productosServicios && catalogos && marcas,
                ShowProductosServiciosUnidades = productosServicios && catalogos && unidades,
                ShowOrdenesCompraNueva = ordenesCompra && ordenesCompraNueva,
                ShowOrdenesCompraReporte = ordenesCompra && ordenesCompraReporte,
                ShowRecepcionNueva = recepcionMenuDisponible && recepcionNueva,
                ShowRecepcionReporte = recepcionMenuDisponible && recepcionReporte
            };
        }

        private static void AppendProductosServicios(StringBuilder sb, ProveeduriaMenuAccess access)
        {
            if (!access.ShowProductosServicios)
            {
                return;
            }

            sb.Append(@"<div id=""menu-proveeduria-productos-servicios"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
            sb.Append(@"<span class=""menu-link""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Productos y Servicios</span> <span class=""menu-arrow""></span> </span>");
            sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
            if (access.ShowProductosServiciosAbc)
            {
                sb.Append(@"<div id=""menu-productos-servicios-abc"" class=""menu-item""> <a class=""menu-link"" href=""/ProductosServicios/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">ABC Productos y Servicios</span> </a> </div>");
            }

            if (access.ShowProductosServiciosCatalogos)
            {
                sb.Append(@"<div id=""menu-productos-servicios-catalogos"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
                sb.Append(@"<span class=""menu-link""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Catálogos</span> <span class=""menu-arrow""></span> </span>");
                sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
                if (access.ShowProductosServiciosCategorias)
                {
                    sb.Append(@"<div id=""menu-productos-servicios-categorias"" class=""menu-item""> <a class=""menu-link"" href=""/ProductosServicios/Categorias""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Categorías</span> </a> </div>");
                }
                if (access.ShowProductosServiciosMarcas)
                {
                    sb.Append(@"<div id=""menu-productos-servicios-marcas"" class=""menu-item""> <a class=""menu-link"" href=""/ProductosServicios/Marcas""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Marcas</span> </a> </div>");
                }
                if (access.ShowProductosServiciosUnidades)
                {
                    sb.Append(@"<div id=""menu-productos-servicios-unidades"" class=""menu-item""> <a class=""menu-link"" href=""/ProductosServicios/UnidadesMedida""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Unidades de medida</span> </a> </div>");
                }
                sb.Append(@"</div>");
                sb.Append(@"</div>");
            }
            sb.Append(@"</div>");
            sb.Append(@"</div>");
        }

        private static void AppendProveedores(StringBuilder sb)
        {
            sb.Append(@"<div id=""menu-proveeduria-proveedores"" class=""menu-item""> <a class=""menu-link"" href=""/Activos/Proveedores""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Proveedores</span> </a> </div>");
        }

        private static void AppendOrdenesCompra(StringBuilder sb, ProveeduriaMenuAccess access)
        {
            if (!access.ShowOrdenesCompra)
            {
                return;
            }

            sb.Append(@"<div id=""menu-proveeduria-ordenes-compra"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
            sb.Append(@"<span class=""menu-link""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Órdenes de compra</span> <span class=""menu-arrow""></span> </span>");
            sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
            if (access.ShowOrdenesCompraNueva)
            {
                sb.Append(@"<div id=""menu-proveeduria-ordenes-compra-nueva"" class=""menu-item""> <a class=""menu-link"" href=""/Activos/OrdenesCompra/Nueva""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Nueva</span> </a> </div>");
            }
            if (access.ShowOrdenesCompraReporte)
            {
                sb.Append(@"<div id=""menu-proveeduria-ordenes-compra-reporte"" class=""menu-item""> <a class=""menu-link"" href=""/Activos/OrdenesCompra/Reporte""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Reporte</span> </a> </div>");
            }
            sb.Append(@"</div>");
            sb.Append(@"</div>");
        }

        private static void AppendRecepcion(StringBuilder sb, ProveeduriaMenuAccess access)
        {
            if (!access.ShowRecepcion)
            {
                return;
            }

            sb.Append(@"<div id=""menu-proveeduria-recepcion"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
            sb.Append(@"<span class=""menu-link""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Recepción</span> <span class=""menu-arrow""></span> </span>");
            sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
            if (access.ShowRecepcionNueva)
            {
                sb.Append(@"<div id=""menu-proveeduria-recepcion-nueva"" class=""menu-item""> <a class=""menu-link"" href=""/Activos/Recepcion/Nueva""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Nueva</span> </a> </div>");
            }
            if (access.ShowRecepcionReporte)
            {
                sb.Append(@"<div id=""menu-proveeduria-recepcion-reporte"" class=""menu-item""> <a class=""menu-link"" href=""/Activos/Recepcion/Reporte""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Reporte</span> </a> </div>");
            }
            sb.Append(@"</div>");
            sb.Append(@"</div>");
        }

        private static bool HasAccess(IEnumerable<Opciones> opciones, string permissionCode)
            => FindPermission(opciones, permissionCode)?.Permisos?.Acceso == 1;

        public static bool HasOfficialSuperAdminPermission(string permissionCode, bool requireWrite)
        {
            Opciones? option = FindPermission(OfficialSuperAdminPermissions(), permissionCode);
            if (option?.Permisos?.Acceso != 1)
            {
                return false;
            }

            return !requireWrite || option.Permisos.Escritura == 1;
        }

        private static Opciones? FindPermission(IEnumerable<Opciones>? opciones, string permissionCode)
        {
            if (opciones == null)
            {
                return null;
            }

            foreach (Opciones option in opciones)
            {
                if (string.Equals(option.Opcion, permissionCode, StringComparison.OrdinalIgnoreCase))
                {
                    return option;
                }

                Opciones? child = FindPermission(option.Hijos, permissionCode);
                if (child != null)
                {
                    return child;
                }
            }

            return null;
        }

        private static void MergePermission(List<Opciones> target, Opciones official)
        {
            Opciones? existing = target.FirstOrDefault(option =>
                string.Equals(option.Opcion, official.Opcion, StringComparison.OrdinalIgnoreCase));

            if (existing == null)
            {
                target.Add(CloneOption(official));
                return;
            }

            existing.Permisos = new Permisos
            {
                Acceso = Math.Max(existing.Permisos?.Acceso ?? 0, official.Permisos?.Acceso ?? 0),
                Escritura = Math.Max(existing.Permisos?.Escritura ?? 0, official.Permisos?.Escritura ?? 0)
            };

            foreach (Opciones officialChild in official.Hijos)
            {
                MergePermission(existing.Hijos, officialChild);
            }
        }

        private static IEnumerable<Opciones> CloneOptions(IEnumerable<Opciones>? opciones)
        {
            if (opciones == null)
            {
                yield break;
            }

            foreach (Opciones option in opciones)
            {
                yield return CloneOption(option);
            }
        }

        private static Opciones CloneOption(Opciones option)
            => new Opciones
            {
                Opcion = option.Opcion,
                Permisos = new Permisos
                {
                    Acceso = option.Permisos?.Acceso ?? 0,
                    Escritura = option.Permisos?.Escritura ?? 0
                },
                Hijos = CloneOptions(option.Hijos).ToList()
            };

        private static Permisos AccessOnly() => new Permisos { Acceso = 1, Escritura = 0 };

        private static Permisos AccessWrite() => new Permisos { Acceso = 1, Escritura = 1 };
    }

    public sealed class ProveeduriaMenuAccess
    {
        public bool ShowProductosServiciosAbc { get; init; }
        public bool ShowProductosServiciosCatalogos { get; init; }
        public bool ShowProductosServiciosCategorias { get; init; }
        public bool ShowProductosServiciosMarcas { get; init; }
        public bool ShowProductosServiciosUnidades { get; init; }
        public bool ShowOrdenesCompraNueva { get; init; }
        public bool ShowOrdenesCompraReporte { get; init; }
        public bool ShowRecepcionNueva { get; init; }
        public bool ShowRecepcionReporte { get; init; }
        public bool ShowProductosServicios => ShowProductosServiciosAbc || ShowProductosServiciosCatalogos;
        public bool ShowOrdenesCompra => ShowOrdenesCompraNueva || ShowOrdenesCompraReporte;
        public bool ShowRecepcion => ShowRecepcionNueva || ShowRecepcionReporte;
        public bool ShowModule => ShowProductosServicios || ShowOrdenesCompra || ShowRecepcion;
    }
}
