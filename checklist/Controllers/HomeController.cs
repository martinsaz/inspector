using System.Diagnostics;
using System.Net;
using System.Security.Claims;
using System.Text;
using checklist.Clases;
using checklist.Extensions;
using checklist.Models;
using checklist.Models.Operadores;
using checklist.Models.Roles;
using checklist.Models.Usuarios;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;


namespace checklist.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            if (IsOperatorSession())
            {
                return RedirectToAction("RecoleccionesBL26", "ContestarLista");
            }

            return View();
        }

        [HttpGet]
        public async Task<IActionResult> CambiarModo(string modo, string reason = "")
        {
            string normalizedMode = NormalizeMode(modo);
            if (normalizedMode == "Operacion")
            {
                if (!await CanOperateAsync())
                {
                    SetCurrentWorkMode("Administracion");
                    SetWorkModeNotice("Tu acceso a Operación en campo ya no está disponible.");
                    return RedirectToAction("Index");
                }

                SetCurrentWorkMode("Operacion");
                return RedirectToAction("RecoleccionesBL26", "ContestarLista");
            }

            if (!await CanAdminAsync())
            {
                SetWorkModeNotice("Tu acceso a Administración ya no está disponible.");
                return RedirectToAction("RecoleccionesBL26", "ContestarLista");
            }

            SetCurrentWorkMode("Administracion");
            if (string.Equals(reason, "operation-unavailable", StringComparison.OrdinalIgnoreCase))
            {
                SetWorkModeNotice("Tu acceso a Operación en campo ya no está disponible.");
            }
            return RedirectToAction("Index");
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }



        public IActionResult GetDatosUsuario()
        {
            try
            {
                string usr = User.FindFirstValue(ClaimTypes.Name);
                string cor = User.FindFirstValue(ClaimTypes.Email);
                string emp = User.FindFirstValue(ClaimTypes.GivenName);
                return Ok(new { Usuario = usr, Correo = cor, Empresa = emp, Mensaje = "Ok" });
            }
            catch (Exception ex)
            {
                var jsonResult = Json(new
                {
                    Mensaje = "Error"
                });
                return jsonResult;
            }
        }

        public async Task<IActionResult> Salir()
        {
            ViewBag.prmmnu = null;
            ClearWorkModeSession();
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Index", "Login");
        }


        public async Task<IActionResult> BuildMenu(string idEmpresa, string cadena, string empresa, string correo)
        {
            string result = string.Empty;
            string cookieValue = "";
            bool hasOperatorAccess = false;
            bool renderedRecolecciones = false;
            bool renderedBl26 = false;
            Stopwatch stopwatch = new Stopwatch();
            stopwatch.Start();
            try
            {
                if (IsOperatorSession())
                {
                    result = BuildOperatorMenu();
                    stopwatch.Stop();
                    TimeSpan operatorElapsed = stopwatch.Elapsed;
                    return Json(new { d = result, tiempoEjecucion = $"Tiempo total de ejecución: {operatorElapsed.TotalMilliseconds} ms" });
                }

                string idRol = "";
                // Obtener valores de los Claims
                string emailUsuario = correo;
                string numeroEmpresa = empresa;
                // Validar que los parámetros tengan datos
                if (string.IsNullOrEmpty(idEmpresa))
                {
                    throw new ArgumentException("El id de la empresa no puede ser nulo o vacío.");
                }
                if (string.IsNullOrEmpty(emailUsuario))
                {
                    throw new ArgumentException("El email del usuario no puede ser nulo o vacío.");
                }
                if (string.IsNullOrEmpty(numeroEmpresa))
                {
                    throw new ArgumentException("El número de la empresa no puede ser nulo o vacío.");
                }
                // Construir la URL solo si los parámetros son válidos
                string urlUsuario = string.Format("{0}api/Usuario/ObtenerUsuarioPorEmail?idEmpresa={1}&email={2}&cadena={4}&empresa={3}",
                    Utilerias.UrlBase, idEmpresa, emailUsuario, numeroEmpresa, cadena);
                var client = new RestClient(urlUsuario);
                var request = new RestRequest();
                request.Method = Method.Get;
                RestResponse response = await client.ExecuteAsync(request);
                if (response.StatusCode == HttpStatusCode.OK)
                {
                    // Deserializar la respuesta si es exitosa
                    List<respUsuario> respuesta = JsonConvert.DeserializeObject<List<respUsuario>>(response.Content);

                    if (respuesta != null && respuesta.Count > 0)
                    {
                        respUsuario resultado = new respUsuario();
                        foreach (var item in respuesta)
                        {
                            resultado = item;
                        }

                        string url = string.Format("{0}api/Usuario/ObtenerUsuario?idEmpresa={1}&id={2}&empresa={3}&cadena={4}", Utilerias.UrlBase, idEmpresa, resultado.Id, empresa, cadena);
                        client = new RestClient(url);
                        request = new RestRequest();
                        request.Method = Method.Get;
                        response = await client.ExecuteAsync(request);
                        List<respUsuario> user = JsonConvert.DeserializeObject<List<respUsuario>>(response.Content);
                        foreach (var element in user)
                        {
                            idRol = element.idRol.ToString();
                        }

                        hasOperatorAccess = await HasOperatorAccessAsync(idEmpresa, cadena);

                        // Guardar el idRol en la propiedad estática
                        Utilerias.IdRol = idRol;


                        url = string.Format("{0}GetRoles?idEmpresa={1}&empresa={3}&cadena={4}&id={2}", Utilerias.UrlBase, idEmpresa, idRol, empresa, cadena);
                        client = new RestClient(url);
                        request = new RestRequest();
                        request.Method = Method.Get;
                        response = await client.ExecuteAsync(request);
                        //RestResponse response = await client.ExecuteAsync(request);

                        if (response.StatusCode == HttpStatusCode.OK)
                        {
                            try
                            {
                                // Intenta deserializar solo si la respuesta es válida
                                List<respRoles> roles = JsonConvert.DeserializeObject<List<respRoles>>(response.Content);

                                foreach (var role in roles)
                                {
                                    HttpContext.Response.Cookies.Append("prmmnu", role.Permisos);
                                    cookieValue = role.Permisos;
                                }
                            }
                            catch (JsonSerializationException ex)
                            {
                                // Manejar la excepción de deserialización
                                // Registrar el error o lanzar una excepción personalizada
                                Console.WriteLine("Error deserializando la respuesta: " + ex.Message);
                                throw new Exception("Error deserializando la respuesta.");
                            }
                        }
                        else
                        {
                            // Maneja el caso cuando el estado no es 200 OK
                            Console.WriteLine($"Error en la solicitud HTTP: {response.StatusDescription}");
                            throw new Exception("Error en la solicitud al servicio.");
                        }
                        List<Opciones> opciones = JsonConvert.DeserializeObject<List<Opciones>>(cookieValue);
                        StringBuilder sb = new StringBuilder();
                        foreach (var item in opciones)
                        {
                            switch (item.Opcion)
                            {

                                case "01000000":
                                    // Listas
                                    if (item.Permisos.Acceso == 1)
                                    {
                                        sb.Append(@"<div id=""01000000"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
                                        sb.Append(@"<span class=""menu-link""> <span class=""menu-icon""> <i class=""ki-duotone ki-element-plus fs-2""> <span class=""path1""></span> <span class=""path2""></span> <span class=""path3""></span> <span class=""path4""></span> <span class=""path5""></span> </i> </span> <span class=""menu-title"">Checklists</span> <span class=""menu-arrow""></span> </span>");
                                        sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
                                        // Hijos
                                        foreach (var hijo in item.Hijos)
                                        {
                                            switch (hijo.Opcion)
                                            {
                                                case "01001000":
                                                    if (hijo.Permisos.Acceso == 1)
                                                    {
                                                        sb.Append(@"<div id=""01001000"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion""> <span class=""menu-link""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">ABC Checklists</span> <span class=""menu-arrow""></span> </span>");
                                                        sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
                                                        // Nietos
                                                        foreach (var nieto in hijo.Hijos)
                                                        {
                                                            switch (nieto.Opcion)
                                                            {
                                                                case "01001001":
                                                                    if (nieto.Permisos.Acceso == 1)
                                                                    {
                                                                        sb.Append(@"<div id=""01001001BL26"" class=""menu-item""> <a class=""menu-link"" href=""/Listas/CreadorListaBL26""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Nueva</span> </a> </div>");
                                                                    }
                                                                    break;
                                                                case "01001002":
                                                                    if (nieto.Permisos.Acceso == 1)
                                                                    {
                                                                        sb.Append(@"<div id=""01001002"" class=""menu-item""> <a class=""menu-link"" href=""/DetalleLista/DetalleLista""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Borradores</span> </a> </div>");
                                                                    }
                                                                    break;
                                                                case "01001003":
                                                                    if (nieto.Permisos.Acceso == 1)
                                                                    {
                                                                        sb.Append(@"<div id=""01001003"" class=""menu-item""> <a class=""menu-link"" href=""/MisListas/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Vigentes</span> </a> </div>");
                                                                }
                                                                    break;
                                                            }
                                                        }
                                                        sb.Append(@"</div>");
                                                        sb.Append(@"</div>");
                                                    }
                                                    break;
                                                case "01002000":
                                                    if (hijo.Permisos.Acceso == 1)
                                                    {
                                                        sb.Append(@"<div id=""01002000"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion""> <span class=""menu-link""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Clasificación</span> <span class=""menu-arrow""></span> </span>");
                                                        sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
                                                        // Nietos
                                                        foreach (var nieto in hijo.Hijos)
                                                        {
                                                            switch (nieto.Opcion)
                                                            {
                                                                case "01002001":
                                                                    if (nieto.Permisos.Acceso == 1)
                                                                    {
                                                                        sb.Append(@"<div id=""01002001"" class=""menu-item""> <a class=""menu-link"" href=""/Categorias/CategoriasABC""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Categorías</span> </a> </div>");
                                                                    }
                                                                    break;
                                                                case "01002002":
                                                                    if (nieto.Permisos.Acceso == 1)
                                                                    {
                                                                        sb.Append(@"<div id=""01002002"" class=""menu-item""> <a class=""menu-link"" href=""/Subcategorias/SubcategoriasABC""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Subcategorías</span> </a> </div>");
                                                                    }
                                                                    break;

                                                            }
                                                        }
                                                        // End Nietos
                                                        sb.Append(@"</div>");
                                                        sb.Append(@"</div>");
                                                    }
                                                    break;
                                            }
                                        }
                                        // End hijos
                                        sb.Append(@"</div>");
                                        sb.Append(@"</div>");
                                    }
                                    break;
                                case "02000000":
                                    // Recolecciones
                                    if (item.Permisos.Acceso == 1)
                                    {
                                        renderedRecolecciones = true;
                                        sb.Append(@"<div id=""02000000"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
                                        sb.Append(@"<span class=""menu-link""> <span class=""menu-icon""> <i class=""ki-duotone ki-element-plus fs-2""> <span class=""path1""></span> <span class=""path2""></span> <span class=""path3""></span> <span class=""path4""></span> <span class=""path5""></span> </i> </span> <span class=""menu-title"">Inspecciones</span> <span class=""menu-arrow""></span> </span>");
                                        sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
                                        // Hijos
                                        foreach (var hijo in item.Hijos)
                                        {
                                            switch (hijo.Opcion)
                                            {
                                                case "02001000":
                                                    if (hijo.Permisos.Acceso == 1)
                                                    {

                                                        sb.Append(@"<div id=""02001000"" class=""menu-item""> <a class=""menu-link"" href=""/ContestarLista/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Nueva</span> </a> </div>");

                                                    }
                                                    break;
                                              /*  case "02002000":
                                                    if (hijo.Permisos.Acceso == 1)
                                                    {

                                                        sb.Append(@"<div id=""02002000"" class=""menu-item""> <a class=""menu-link"" href=""/ContestarListaHibrida/ListaHibrida""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Nueva Offline</span> </a> </div>");

                                                    }
                                                    break;*/
                                                case "02003000":
                                                    if (hijo.Permisos.Acceso == 1)
                                                    {

                                                        sb.Append(@"<div id=""02003000"" class=""menu-item""> <a class=""menu-link"" href=""/Resultados/Resultados""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Listado</span> </a> </div>");

                                                    }
                                                    break;
                                                case "02004000":
                                                    if (hijo.Permisos.Acceso == 1)
                                                    {

                                                        sb.Append(@"<div id=""02004000"" class=""menu-item""> <a class=""menu-link"" href=""/Respuestas/Respuestas""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Detalle</span> </a> </div>");

                                                    }
                                                    break;
                                            }
                                        }

                                        if (hasOperatorAccess)
                                        {
                                            renderedBl26 = true;
                                            sb.Append(@"<div id=""02001000BL26"" class=""menu-item""> <a class=""menu-link"" href=""/ContestarLista/RecoleccionesBL26""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Inspección en campo</span> </a> </div>");
                                        }

                                        // End hijos
                                        sb.Append(@"</div>");
                                        sb.Append(@"</div>");

                                        string currentMenuPath = ResolveCurrentMenuPath();

                                        sb.Append(BuildVentasMenu());
                                        sb.Append(BuildFacturacionMenu());
                                        sb.Append(BuildCotizacionesMenu(currentMenuPath));
                                        sb.Append(BuildClientesMenu());
                                        sb.Append(BuildActivosMenu());
                                        sb.Append(BuildProveeduriaMenu());
                                    }
                                    break;
                                case "03000000":
                                    // Reportes
                                    if (item.Permisos.Acceso == 1)
                                    {
                                        sb.Append(@"<div id=""03000000"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
                                        sb.Append(@"<span class=""menu-link""> <span class=""menu-icon""> <i class=""ki-duotone ki-element-plus fs-2""> <span class=""path1""></span> <span class=""path2""></span> <span class=""path3""></span> <span class=""path4""></span> <span class=""path5""></span> </i> </span> <span class=""menu-title"">Reportes</span> <span class=""menu-arrow""></span> </span>");
                                        sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
                                        // Hijos
                                        foreach (var hijo in item.Hijos)
                                        {
                                            switch (hijo.Opcion)
                                            {

                                                case "03001000":
                                                    if (hijo.Permisos.Acceso == 1)
                                                    {
                                                        sb.Append(@"<div id=""03001000"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion""> <span class=""menu-link""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Estrellas</span> <span class=""menu-arrow""></span> </span>");
                                                        sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
                                                        // Nietos
                                                        foreach (var nieto in hijo.Hijos)
                                                        {
                                                            switch (nieto.Opcion)
                                                            {
                                                                case "03001001":
                                                                    if (nieto.Permisos.Acceso == 1)
                                                                    {
                                                                        sb.Append(@"<div id=""03001001"" class=""menu-item""> <a class=""menu-link"" href=""/ReporteEstrellas/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Estrellas Contraido</span> </a> </div>");
                                                                    }
                                                                    break;
                                                                case "03001002":
                                                                    if (nieto.Permisos.Acceso == 1)
                                                                    {
                                                                        sb.Append(@"<div id=""03001002"" class=""menu-item""> <a class=""menu-link"" href=""/ReporteDinamico/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Estrellas con Categorías</span> </a> </div>");
                                                                    }
                                                                    break;

                                                            }
                                                        }
                                                        // End Nietos
                                                        sb.Append(@"</div>");
                                                        sb.Append(@"</div>");
                                                    }
                                                    break;
                                                case "03002000":
                                                    if (hijo.Permisos.Acceso == 1)
                                                    {

                                                        sb.Append(@"<div id=""03002000"" class=""menu-item""> <a class=""menu-link"" href=""/ReporteListado/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Listado Recolecciones</span> </a> </div>");

                                                    }
                                                    break;


                                            }
                                        }
                                        // End hijos
                                        sb.Append(@"</div>");
                                        sb.Append(@"</div>");
                                    }
                                    break;
                                case "04000000":
                                    // Ajustes
                                    if (item.Permisos.Acceso == 1)
                                    {
                                        sb.Append(@"<div id=""04000000"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
                                        sb.Append(@"<span class=""menu-link""> <span class=""menu-icon""> <i class=""ki-duotone ki-element-plus fs-2""> <span class=""path1""></span> <span class=""path2""></span> <span class=""path3""></span> <span class=""path4""></span> <span class=""path5""></span> </i> </span> <span class=""menu-title"">Ajustes</span> <span class=""menu-arrow""></span> </span>");
                                        sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
                                        // Hijos
                                        foreach (var hijo in item.Hijos)
                                        {
                                            switch (hijo.Opcion)
                                            {

                                                case "04001000":
                                                    if (hijo.Permisos.Acceso == 1)
                                                    {
                                                        sb.Append(@"<div id=""04001000"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion""> <span class=""menu-link""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Usuarios</span> <span class=""menu-arrow""></span> </span>");
                                                        sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
                                                        // Nietos
                                                        foreach (var nieto in hijo.Hijos)
                                                        {
                                                            switch (nieto.Opcion)
                                                            {
                                                                case "04001001":
                                                                    if (nieto.Permisos.Acceso == 1)
                                                                    {
                                                                        sb.Append(@"<div id=""04001001"" class=""menu-item""> <a class=""menu-link"" href=""/Usuario/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">ABC Usuarios</span> </a> </div>");
                                                                    }
                                                                    break;
                                                                case "04001002":
                                                                    if (nieto.Permisos.Acceso == 1)
                                                                    {
                                                                        sb.Append(@"<div id=""04001002"" class=""menu-item""> <a class=""menu-link"" href=""/Departamentos/ABCDepartamentos""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Departamentos</span> </a> </div>");
                                                                    }
                                                                    break;
                                                                case "04001003":
                                                                    if (nieto.Permisos.Acceso == 1)
                                                                    {
                                                                        sb.Append(@"<div id=""04001003"" class=""menu-item""> <a class=""menu-link"" href=""/Puestos/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Puestos</span> </a> </div>");
                                                                    }
                                                                    break;

                                                            }
                                                        }
                                                        // End Nietos
                                                        sb.Append(@"</div>");
                                                        sb.Append(@"</div>");
                                                    }
                                                    break;
                                                case "04002000":
                                                    if (hijo.Permisos.Acceso == 1)
                                                    {

                                                        sb.Append(@"<div id=""04002000"" class=""menu-item""> <a class=""menu-link"" href=""/RolesPermisos/RolesPermisos""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Roles y Permisos</span> </a> </div>");

                                                    }
                                                    break;
                                                case "04003000":
                                                    if (hijo.Permisos.Acceso == 1)
                                                    {

                                                        sb.Append(@"<div id=""04003000"" class=""menu-item""> <a class=""menu-link"" href=""/Sucursales/SucursalesABC""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Sucursales</span> </a> </div>");

                                                    }
                                                    break;
                                                case "04004000":
                                                    if (hijo.Permisos.Acceso == 1)
                                                    {

                                                        sb.Append(@"<div id=""04004000"" class=""menu-item""> <a class=""menu-link"" href=""/RazonesSociales/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Razones Sociales</span> </a> </div>");

                                                    }
                                                    break;
                                                case "04005000":
                                                    if (hijo.Permisos.Acceso == 1)
                                                    {

                                                        sb.Append(@"<div id=""04005000"" class=""menu-item""> <a class=""menu-link"" href=""/Regiones/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Regiones</span> </a> </div>");

                                                    }
                                                    break;

                                            }
                                        }
                                        if (item.Hijos.Any(hijo => hijo.Opcion == "04001000" && hijo.Permisos.Acceso == 1))
                                        {
                                            sb.Append(@"<div id=""04001001OPERADORES"" class=""menu-item""> <a class=""menu-link"" href=""/Operadores/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Operadores</span> </a> </div>");
                                        }
                                        sb.Append(@"<div id=""04009000CONFIGURACION"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
                                        sb.Append(@"<span class=""menu-link""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Configuración</span> <span class=""menu-arrow""></span> </span>");
                                        sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
                                        sb.Append(@"<div id=""04009001CORREOSALIENTE"" class=""menu-item""> <a class=""menu-link"" href=""/Configuracion/CorreoSaliente""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Correo saliente</span> </a> </div>");
                                        sb.Append(@"</div>");
                                        sb.Append(@"</div>");
                                        sb.Append(@"<div id=""04010000AJUSTESPV"" class=""menu-item""> <a class=""menu-link"" href=""/Ajustes/AjustesPvPorTienda""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Ajustes PV por tienda</span> </a> </div>");
                                        sb.Append(@"<div id=""04011000FORMASPAGO"" class=""menu-item""> <a class=""menu-link"" href=""/Ajustes/FormasPago""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Formas de pago</span> </a> </div>");
                                        // End hijos
                                        sb.Append(@"</div>");
                                        sb.Append(@"</div>");
                                    }
                                    break;

                            }
                        }
                        if (hasOperatorAccess && !renderedBl26)
                        {
                            if (!renderedRecolecciones)
                            {
                                sb.Append(@"<div id=""02000000"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
                                sb.Append(@"<span class=""menu-link""> <span class=""menu-icon""> <i class=""ki-duotone ki-element-plus fs-2""> <span class=""path1""></span> <span class=""path2""></span> <span class=""path3""></span> <span class=""path4""></span> <span class=""path5""></span> </i> </span> <span class=""menu-title"">Inspecciones</span> <span class=""menu-arrow""></span> </span>");
                                sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
                            }

                            sb.Append(@"<div id=""02001000BL26"" class=""menu-item""> <a class=""menu-link"" href=""/ContestarLista/RecoleccionesBL26""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Inspección en campo</span> </a> </div>");

                            if (!renderedRecolecciones)
                            {
                                sb.Append(@"</div>");
                                sb.Append(@"</div>");
                            }
                        }
                        result = sb.ToString();
                    }
                    else
                    {
                        Console.WriteLine("No se encontraron usuarios.");
                    }


                }
                else
                {
                    // Manejar el error de la solicitud
                    Console.WriteLine("Error al obtener el usuario: " + response.Content);
                }


            }
            catch (Exception ex)
            {

                result = ex.Message;
            }
            stopwatch.Stop();
            TimeSpan timeTaken = stopwatch.Elapsed;
            string tiempoTranscurrido = $"Tiempo total de ejecución: {timeTaken.TotalMilliseconds} ms";

            // Retornar el resultado junto con el tiempo transcurrido
            return Json(new { d = result, tiempoEjecucion = tiempoTranscurrido });
        }

        private bool IsOperatorSession()
        {
            string accountType = HttpContext.Session.GetString("accountType")
                ?? User.FindFirstValue("account_type")
                ?? string.Empty;

            return string.Equals(accountType, "Operador", StringComparison.OrdinalIgnoreCase);
        }

        private bool HasDualModeAccess()
        {
            return string.Equals(HttpContext.Session.GetString("hasDualModeAccess"), "true", StringComparison.OrdinalIgnoreCase);
        }

        private bool CanAdmin()
        {
            return string.Equals(HttpContext.Session.GetString("canAdminMode"), "true", StringComparison.OrdinalIgnoreCase);
        }

        private string ResolveCurrentMenuPath()
        {
            string referer = Request.Headers.Referer.ToString();
            if (string.IsNullOrWhiteSpace(referer))
            {
                return string.Empty;
            }

            return Uri.TryCreate(referer, UriKind.Absolute, out Uri refererUri)
                ? refererUri.AbsolutePath
                : string.Empty;
        }

        private bool CanOperate()
        {
            return string.Equals(HttpContext.Session.GetString("canOperateMode"), "true", StringComparison.OrdinalIgnoreCase);
        }

        private void SetCurrentWorkMode(string mode)
        {
            string normalizedMode = NormalizeMode(mode);
            HttpContext.Session.SetString("currentWorkMode", normalizedMode);
            HttpContext.Session.SetString("accountType", normalizedMode == "Operacion" ? "Operador" : "Usuario");
        }

        private static string NormalizeMode(string mode)
        {
            return string.Equals(mode, "Operacion", StringComparison.OrdinalIgnoreCase)
                ? "Operacion"
                : "Administracion";
        }

        private void ClearWorkModeSession()
        {
            HttpContext.Session.Remove("canAdminMode");
            HttpContext.Session.Remove("canOperateMode");
            HttpContext.Session.Remove("hasDualModeAccess");
            HttpContext.Session.Remove("currentWorkMode");
            HttpContext.Session.Remove("workModeNotice");
        }

        private void SetWorkModeNotice(string message)
        {
            HttpContext.Session.SetString("workModeNotice", message ?? string.Empty);
        }

        public IActionResult ConsumeWorkModeNotice()
        {
            string message = HttpContext.Session.GetString("workModeNotice") ?? string.Empty;
            HttpContext.Session.Remove("workModeNotice");
            return Json(new { message });
        }

        private async Task<bool> CanOperateAsync()
        {
            if (!CanOperate())
            {
                return false;
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            return await HasOperatorAccessAsync(idEmpresa, cadena);
        }

        private async Task<bool> CanAdminAsync()
        {
            if (!CanAdmin())
            {
                return false;
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string empresa = ResolveEmpresa();
            string correo = ResolveCorreo();
            if (string.IsNullOrWhiteSpace(idEmpresa) || string.IsNullOrWhiteSpace(cadena) || string.IsNullOrWhiteSpace(empresa) || string.IsNullOrWhiteSpace(correo))
            {
                return false;
            }

            string urlUsuario = string.Format(
                "{0}api/Usuario/ObtenerUsuarioPorEmail?idEmpresa={1}&email={2}&cadena={4}&empresa={3}",
                Utilerias.UrlBase,
                idEmpresa,
                correo,
                empresa,
                cadena);

            RestClient client = new RestClient(urlUsuario);
            RestRequest request = new RestRequest { Method = Method.Get };
            RestResponse response = await client.ExecuteAsync(request);
            if (response.StatusCode != HttpStatusCode.OK || string.IsNullOrWhiteSpace(response.Content))
            {
                return false;
            }

            List<respUsuario> respuesta = JsonConvert.DeserializeObject<List<respUsuario>>(response.Content) ?? new List<respUsuario>();
            respUsuario usuario = respuesta.FirstOrDefault();
            if (usuario == null || string.IsNullOrWhiteSpace(usuario.Id))
            {
                return false;
            }

            string urlDetalle = string.Format(
                "{0}api/Usuario/ObtenerUsuario?idEmpresa={1}&id={2}&empresa={3}&cadena={4}",
                Utilerias.UrlBase,
                idEmpresa,
                usuario.Id,
                empresa,
                cadena);

            client = new RestClient(urlDetalle);
            request = new RestRequest { Method = Method.Get };
            response = await client.ExecuteAsync(request);
            if (response.StatusCode != HttpStatusCode.OK || string.IsNullOrWhiteSpace(response.Content))
            {
                return false;
            }

            List<respUsuario> detalle = JsonConvert.DeserializeObject<List<respUsuario>>(response.Content) ?? new List<respUsuario>();
            return detalle.Any(item => item != null && item.borrado != true && (item.Estado == true || item.Estatus == true));
        }

        private string ResolveIdEmpresa()
        {
            return HttpContext.Session.GetObject<string>("idEmpresa")
                ?? HttpContext.Session.GetString("idEmpresa")
                ?? User.FindFirstValue(ClaimTypes.SerialNumber)
                ?? string.Empty;
        }

        private string ResolveCadena()
        {
            return HttpContext.Session.GetObject<string>("cadena")
                ?? HttpContext.Session.GetString("cadena")
                ?? User.FindFirstValue(ClaimTypes.Uri)
                ?? string.Empty;
        }

        private string ResolveEmpresa()
        {
            return HttpContext.Session.GetObject<string>("empresa")
                ?? HttpContext.Session.GetString("empresa")
                ?? User.FindFirstValue(ClaimTypes.Sid)
                ?? string.Empty;
        }

        private string ResolveCorreo()
        {
            return HttpContext.Session.GetObject<string>("emailUser")
                ?? HttpContext.Session.GetString("emailUser")
                ?? User.FindFirstValue(ClaimTypes.Email)
                ?? string.Empty;
        }

        private async Task<bool> HasOperatorAccessAsync(string idEmpresa, string cadena)
        {
            string userUid = HttpContext.Session.GetString("userUid")
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? string.Empty;

            if (string.IsNullOrWhiteSpace(idEmpresa) || string.IsNullOrWhiteSpace(cadena) || string.IsNullOrWhiteSpace(userUid))
            {
                return false;
            }

            string url = $"{Utilerias.UrlBase}api/Operadores/ObtenerAccesoOperador?idEmpresa={idEmpresa}&idFirebase={WebUtility.UrlEncode(userUid)}&cadena={cadena}";
            RestClient client = new RestClient(url);
            RestRequest request = new RestRequest { Method = Method.Get };
            RestResponse response = await client.ExecuteAsync(request);
            if (response.StatusCode != HttpStatusCode.OK || string.IsNullOrWhiteSpace(response.Content))
            {
                return false;
            }

            respOperadorAcceso? acceso = JsonConvert.DeserializeObject<respOperadorAcceso>(response.Content);
            return acceso?.TieneAcceso == true;
        }

        private static string BuildOperatorMenu()
        {
            return @"<div id=""02000000"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion here show"">
<span class=""menu-link active""> <span class=""menu-icon""> <i class=""ki-duotone ki-element-plus fs-2""> <span class=""path1""></span> <span class=""path2""></span> <span class=""path3""></span> <span class=""path4""></span> <span class=""path5""></span> </i> </span> <span class=""menu-title"">Inspecciones</span> <span class=""menu-arrow""></span> </span>
<div class=""menu-sub menu-sub-accordion show"">
<div id=""02005000BL26"" class=""menu-item here show""> <a class=""menu-link active"" href=""/ContestarLista/RecoleccionesBL26""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Inspección en campo</span> </a> </div>
</div>
</div>";
        }

        private static string BuildActivosMenu()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append(@"<div id=""menu-activos"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
            sb.Append(@"<span class=""menu-link""> <span class=""menu-icon""> <i class=""ki-duotone ki-element-plus fs-2""> <span class=""path1""></span> <span class=""path2""></span> <span class=""path3""></span> <span class=""path4""></span> <span class=""path5""></span> </i> </span> <span class=""menu-title"">Activos</span> <span class=""menu-arrow""></span> </span>");
            sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");

            sb.Append(@"<div id=""menu-activos-abc"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
            sb.Append(@"<span class=""menu-link""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">ABC Activos</span> <span class=""menu-arrow""></span> </span>");
            sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
            sb.Append(@"<div id=""menu-activos-abc-nuevo"" class=""menu-item""> <a class=""menu-link"" href=""/Activos/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Nuevo</span> </a> </div>");
            sb.Append(@"</div>");
            sb.Append(@"</div>");

            sb.Append(@"<div id=""menu-activos-catalogos"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
            sb.Append(@"<span class=""menu-link""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Catálogos</span> <span class=""menu-arrow""></span> </span>");
            sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
            sb.Append(@"<div id=""menu-activos-catalogos-tipos"" class=""menu-item""> <a class=""menu-link"" href=""/Activos/Tipos""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Tipos</span> </a> </div>");
            sb.Append(@"<div id=""menu-activos-catalogos-marcas"" class=""menu-item""> <a class=""menu-link"" href=""/Activos/Marcas""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Marcas</span> </a> </div>");
            sb.Append(@"<div id=""menu-activos-catalogos-estados"" class=""menu-item""> <a class=""menu-link"" href=""/Activos/EstadosOperativos""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Estados operativos</span> </a> </div>");
            sb.Append(@"</div>");
            sb.Append(@"</div>");

            sb.Append(@"</div>");
            sb.Append(@"</div>");
            return sb.ToString();
        }

        private static string BuildProveeduriaMenu()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append(@"<div id=""menu-proveeduria"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
            sb.Append(@"<span class=""menu-link""> <span class=""menu-icon""> <i class=""ki-duotone ki-element-plus fs-2""> <span class=""path1""></span> <span class=""path2""></span> <span class=""path3""></span> <span class=""path4""></span> <span class=""path5""></span> </i> </span> <span class=""menu-title"">Proveeduría</span> <span class=""menu-arrow""></span> </span>");
            sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
            sb.Append(@"<div id=""menu-proveeduria-productos-servicios"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
            sb.Append(@"<span class=""menu-link""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Productos y Servicios</span> <span class=""menu-arrow""></span> </span>");
            sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
            sb.Append(@"<div id=""menu-productos-servicios-abc"" class=""menu-item""> <a class=""menu-link"" href=""/ProductosServicios/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">ABC Productos y Servicios</span> </a> </div>");
            sb.Append(@"<div id=""menu-productos-servicios-catalogos"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
            sb.Append(@"<span class=""menu-link""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Catálogos</span> <span class=""menu-arrow""></span> </span>");
            sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
            sb.Append(@"<div id=""menu-productos-servicios-categorias"" class=""menu-item""> <a class=""menu-link"" href=""/ProductosServicios/Categorias""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Categorías</span> </a> </div>");
            sb.Append(@"<div id=""menu-productos-servicios-marcas"" class=""menu-item""> <a class=""menu-link"" href=""/ProductosServicios/Marcas""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Marcas</span> </a> </div>");
            sb.Append(@"<div id=""menu-productos-servicios-unidades"" class=""menu-item""> <a class=""menu-link"" href=""/ProductosServicios/UnidadesMedida""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Unidades de medida</span> </a> </div>");
            sb.Append(@"</div>");
            sb.Append(@"</div>");
            sb.Append(@"</div>");
            sb.Append(@"</div>");
            sb.Append(@"<div id=""menu-proveeduria-proveedores"" class=""menu-item""> <a class=""menu-link"" href=""/Activos/Proveedores""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Proveedores</span> </a> </div>");
            sb.Append(@"<div id=""menu-proveeduria-ordenes-compra"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
            sb.Append(@"<span class=""menu-link""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Órdenes de compra</span> <span class=""menu-arrow""></span> </span>");
            sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
            sb.Append(@"<div id=""menu-proveeduria-ordenes-compra-nueva"" class=""menu-item""> <a class=""menu-link"" href=""/Activos/OrdenesCompra/Nueva""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Nueva</span> </a> </div>");
            sb.Append(@"<div id=""menu-proveeduria-ordenes-compra-reporte"" class=""menu-item""> <a class=""menu-link"" href=""/Activos/OrdenesCompra/Reporte""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Reporte</span> </a> </div>");
            sb.Append(@"</div>");
            sb.Append(@"</div>");
            sb.Append(@"</div>");
            sb.Append(@"</div>");
            return sb.ToString();
        }

        private static string BuildClientesMenu()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append(@"<div id=""menu-clientes"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
            sb.Append(@"<span class=""menu-link""> <span class=""menu-icon""> <i class=""ki-duotone ki-element-plus fs-2""> <span class=""path1""></span> <span class=""path2""></span> <span class=""path3""></span> <span class=""path4""></span> <span class=""path5""></span> </i> </span> <span class=""menu-title"">Clientes</span> <span class=""menu-arrow""></span> </span>");
            sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
            sb.Append(@"<div id=""menu-clientes-abc"" class=""menu-item""> <a class=""menu-link"" href=""/Clientes/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">ABC Clientes</span> </a> </div>");
            sb.Append(@"<div id=""menu-clientes-reporte"" class=""menu-item""> <a class=""menu-link"" href=""/Clientes/Reporte""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Reporte</span> </a> </div>");
            sb.Append(@"</div>");
            sb.Append(@"</div>");
            return sb.ToString();
        }

        private static string BuildVentasMenu()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append(@"<div id=""menu-ventas"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
            sb.Append(@"<span class=""menu-link""> <span class=""menu-icon""> <i class=""ki-duotone ki-element-plus fs-2""> <span class=""path1""></span> <span class=""path2""></span> <span class=""path3""></span> <span class=""path4""></span> <span class=""path5""></span> </i> </span> <span class=""menu-title"">Ventas</span> <span class=""menu-arrow""></span> </span>");
            sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
            sb.Append(@"<div id=""menu-ventas-nueva"" class=""menu-item""> <a class=""menu-link"" href=""/Ventas/Nueva""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Nueva Venta</span> </a> </div>");
            sb.Append(@"<div id=""menu-ventas-devoluciones"" class=""menu-item""> <a class=""menu-link"" href=""/Ventas/Devoluciones""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Devoluciones</span> </a> </div>");
            sb.Append(@"</div>");
            sb.Append(@"</div>");
            return sb.ToString();
        }

        private static string BuildFacturacionMenu()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append(@"<div id=""menu-facturacion"" data-kt-menu-trigger=""click"" class=""menu-item menu-accordion"">");
            sb.Append(@"<span class=""menu-link""> <span class=""menu-icon""> <i class=""ki-duotone ki-element-plus fs-2""> <span class=""path1""></span> <span class=""path2""></span> <span class=""path3""></span> <span class=""path4""></span> <span class=""path5""></span> </i> </span> <span class=""menu-title"">Facturación</span> <span class=""menu-arrow""></span> </span>");
            sb.Append(@"<div class=""menu-sub menu-sub-accordion"">");
            sb.Append(@"<div id=""menu-facturacion-panel"" class=""menu-item""> <a class=""menu-link"" href=""/Facturacion/Panel""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">Panel de facturación</span> </a> </div>");
            sb.Append(@"</div>");
            sb.Append(@"</div>");
            return sb.ToString();
        }

        private static string BuildCotizacionesMenu(string currentPath)
        {
            bool isCotizacionesRoute = string.Equals(currentPath, "/Cotizaciones/Index", StringComparison.OrdinalIgnoreCase);
            string parentClasses = isCotizacionesRoute
                ? @"menu-item menu-accordion show here"
                : @"menu-item menu-accordion";
            string submenuClasses = isCotizacionesRoute
                ? @"menu-sub menu-sub-accordion show"
                : @"menu-sub menu-sub-accordion";
            string childClasses = isCotizacionesRoute
                ? @"menu-item show here"
                : @"menu-item";
            string childLinkClasses = isCotizacionesRoute
                ? @"menu-link active"
                : @"menu-link";

            StringBuilder sb = new StringBuilder();
            sb.Append($@"<div id=""menu-cotizaciones"" data-kt-menu-trigger=""click"" class=""{parentClasses}"">");
            sb.Append(@"<span class=""menu-link""> <span class=""menu-icon""> <i class=""ki-duotone ki-element-plus fs-2""> <span class=""path1""></span> <span class=""path2""></span> <span class=""path3""></span> <span class=""path4""></span> <span class=""path5""></span> </i> </span> <span class=""menu-title"">Cotizaciones</span> <span class=""menu-arrow""></span> </span>");
            sb.Append($@"<div class=""{submenuClasses}"">");
            sb.Append($@"<div id=""menu-cotizaciones-abc"" class=""{childClasses}""> <a class=""{childLinkClasses}"" href=""/Cotizaciones/Index""> <span class=""menu-bullet""> <span class=""bullet bullet-dot""></span> </span> <span class=""menu-title"">ABC Cotizaciones</span> </a> </div>");
            sb.Append(@"</div>");
            sb.Append(@"</div>");
            return sb.ToString();
        }
    }
}
