using System.Text;
using checklist.Models.Roles;

namespace checklist.Clases
{
    public static class AjustesSucursalesMenuBuilder
    {
        private const string SucursalesParentCode = "04003000";
        private const string AbcSucursalesCode = "04003100";
        private const string RazonesSocialesCode = "04004000";
        private const string RegionesCode = "04005000";

        public static string Build(IEnumerable<Opciones> ajustesHijos)
        {
            List<Opciones> grantedChildren = GetGrantedSucursalesChildren(ajustesHijos).ToList();
            if (!grantedChildren.Any())
            {
                return string.Empty;
            }

            StringBuilder sb = new StringBuilder();
            sb.Append(@"<div id=""04003000"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion""> <span class=""menu-link""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Sucursales</span> <span class=""menu-arrow""></span> </span>");
            sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");

            foreach (Opciones opcion in grantedChildren)
            {
                switch (opcion.Opcion)
                {
                    case AbcSucursalesCode:
                        sb.Append(@"<div id=""04003100"" class=""menu-item""> <a class=""menu-link"" href=""/Sucursales/SucursalesABC""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">ABC Sucursales</span> </a> </div>");
                        break;
                    case RazonesSocialesCode:
                        sb.Append(@"<div id=""04004000"" class=""menu-item""> <a class=""menu-link"" href=""/RazonesSociales/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Razones Sociales</span> </a> </div>");
                        break;
                    case RegionesCode:
                        sb.Append(@"<div id=""04005000"" class=""menu-item""> <a class=""menu-link"" href=""/Regiones/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Regiones</span> </a> </div>");
                        break;
                }
            }

            sb.Append(@"</div>");
            sb.Append(@"</div>");
            return sb.ToString();
        }

        private static IEnumerable<Opciones> GetGrantedSucursalesChildren(IEnumerable<Opciones> ajustesHijos)
        {
            List<Opciones> explicitChildren = new List<Opciones>();
            Opciones? parent = ajustesHijos.FirstOrDefault(hijo => hijo.Opcion == SucursalesParentCode);

            if (parent?.Permisos.Acceso == 1)
            {
                explicitChildren.AddRange(parent.Hijos);
            }

            explicitChildren.AddRange(ajustesHijos.Where(hijo =>
                hijo.Opcion == AbcSucursalesCode ||
                hijo.Opcion == RazonesSocialesCode ||
                hijo.Opcion == RegionesCode));

            HashSet<string> emitted = new HashSet<string>();
            foreach (string code in new[] { AbcSucursalesCode, RazonesSocialesCode, RegionesCode })
            {
                Opciones? child = explicitChildren.FirstOrDefault(opcion => opcion.Opcion == code && opcion.Permisos.Acceso == 1);
                if (child != null && emitted.Add(code))
                {
                    yield return child;
                }
            }
        }
    }
}
