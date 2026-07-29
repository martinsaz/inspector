using checklist.Clases;
using checklist.Models.EstrcuturaCombo;
using checklist.Models.Listas;
using checklist.Models.Operadores;
using checklist.Models.Preguntas;
using checklist.Models.Usuarios;
using checklist.Models.Sucursales;
using Firebase.Storage;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;
using System.Security.Claims;
using System.Text.Json;
using Firebase.Auth.Providers;
using Firebase.Auth;
using checklist.Models.Firebase;
using checklist.Models.Activos;
using System.Net;
using System.Reflection.Metadata;
using System.Text;
using checklist.Models.Roles;
using checklist.Extensions;
using checklist.Models.Temporales;
using System.Reflection.Metadata.Ecma335;
using NuGet.Common;
using checklist.Services;
using System.Linq;


namespace checklist.Controllers.ContestarLista
{
    public class ContestarLista : Controller
    {

        //private readonly SQLiteHelper _sqliteHelper;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _clientFactory;

        public ContestarLista(IConfiguration configuration, IHttpClientFactory clientFactory)
        {
            _configuration = configuration;
            _clientFactory = clientFactory;
            //_sqliteHelper = new SQLiteHelper();
        }
        public IActionResult Index()
        {
            return View();
        }

        public async Task<IActionResult> RecoleccionesBL26()
        {
            Bl26Authorization authorization = await ResolveBl26AuthorizationAsync(string.Empty, string.Empty, string.Empty, string.Empty);
            if (!authorization.HasAccess)
            {
                if (authorization.RedirectToAdministration)
                {
                    return RedirectToAction("CambiarModo", "Home", new { modo = "Administracion", reason = authorization.RedirectReason });
                }

                return RedirectToAction("Index", "Home");
            }

            return View();
        }

        public async Task<ActionResult> Inicializa(string idEmpresa, string cadena, string empresa)
        {
            string idRol = Utilerias.IdRol;

            Opciones opc = await Utilerias.GetOpcion("02001000", idEmpresa, idRol, empresa, cadena);
            return Json(new { d = "Ok", perm = opc.Permisos.Escritura });
        }

        public async Task<ActionResult> InicializaRecoleccionesBL26(string idEmpresa, string cadena, string empresa)
        {
            Bl26Authorization authorization = await ResolveBl26AuthorizationAsync(idEmpresa, cadena, empresa, string.Empty);
            if (!authorization.HasAccess)
            {
                return Json(new
                {
                    d = string.Empty,
                    perm = false,
                    accessDenied = true,
                    redirectToAdministration = authorization.RedirectToAdministration,
                    redirectReason = authorization.RedirectReason,
                    sessionExpired = false,
                    session = BuildBl26SessionContext(idEmpresa, cadena, empresa)
                });
            }

            return Json(new
            {
                d = "Ok",
                perm = authorization.CanWrite,
                session = BuildBl26SessionContext(idEmpresa, cadena, empresa)
            });
        }

        public async Task<ActionResult> GetProgramasXAlumno(string searchTerm, string idEmpresa, string cadena, string empresa, string correo)
        {
            string emailUsuario = correo;
            string url = string.Format("{0}api/Usuario/ObtenerUsuarioPorEmail?idEmpresa={1}&email={2}&empresa={3}&cadena={4}", Utilerias.UrlBase, idEmpresa, correo, empresa, cadena);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respUsuario> respuesta = JsonConvert.DeserializeObject<List<respUsuario>>(response.Content);
            respUsuario result = new respUsuario();
            foreach (var item in respuesta)
            {
                result = item;
            }

            searchTerm = JsonConvert.DeserializeObject<string>(searchTerm);
            string sComp = string.Empty;
            if (!string.IsNullOrEmpty(searchTerm)) sComp = string.Format("&nombre={0}", searchTerm.Trim());
            url = string.Format("{0}api/Evaluaciones/ObtenerComboProgramasXAlumno?idAlumno={1}&empresa={2}&idEmpresa={3}{4}&cadena={5}", Utilerias.UrlBase, result.Id, empresa, idEmpresa, sComp, cadena);

            client = new RestClient(url);
            request = new RestRequest();
            request.Method = Method.Get;
            response = await client.ExecuteAsync(request);
            List<DataPair3> respuesta2 = JsonConvert.DeserializeObject<List<DataPair3>>(response.Content);
            List<select3Data> result2 = new List<select3Data>();

            foreach (var resp2 in respuesta2)
            {
                result2.Add(new select3Data()
                {
                    id = resp2.idLista,
                    text = resp2.name,
                    idLista = resp2.idLista

                });
            }
            return Json(new { d = result2 });
        }
        public async Task<ActionResult> GetListasCerradasComboBox(string opci)
        {
            //string empresa = User.FindFirstValue(ClaimTypes.Sid);
            //string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
            //string cadena = User.FindFirstValue(ClaimTypes.Uri);

            string empresa = HttpContext.Session.GetObject<String>("empresa");
            string idEmpresa = HttpContext.Session.GetObject<String>("idEmpresa");
            string cadena = HttpContext.Session.GetObject<String>("cadena");
            string emailUsuario = HttpContext.Session.GetObject<String>("emailUser");
            string url = string.Format("{0}Listas/GetTodosCerradas?idEmpresa={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idEmpresa, empresa, cadena);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<Lista> respuesta = JsonConvert.DeserializeObject<List<Lista>>(response.Content);
            string result = string.Empty;
            if (opci == "1") result = "<option value='b'> -- Todos --  </option> ";
            foreach (var resp in respuesta)
            {
                result += String.Format("<option value='{0}'>{1}</option> ", resp.id, resp.Nombre.Trim());
            }
            return Json(new { d = result });

        }
        public async Task<ActionResult> GetSucursales(string opci, string idEmpresa, string cadena, string empresa, string correo)
        {

            string emailUsuario = HttpContext.Session.GetObject<String>("emailUser");
            string url = string.Format("{0}api/Sucursal/ObtenerSucursalesPorUsuario?idEmpresa={1}&cadena={2}&correo={3}", Utilerias.UrlBase, idEmpresa, cadena, emailUsuario);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respSucursalx> respuesta = JsonConvert.DeserializeObject<List<respSucursalx>>(response.Content);
            string result = string.Empty;
            result = "<option value='0'> -- Selecciona una sucursal --  </option> ";
            foreach (var resp in respuesta)
            {
                result += String.Format("<option value='{0}'>{1}</option> ", resp.Id, resp.Nombre.Trim());
            }
            return Json(new { d = result });

        }

        public async Task<ActionResult> GetSucursalesAnterior(string opci, string idEmpresa, string cadena, string empresa, string correo)
        {

            string emailUsuario = HttpContext.Session.GetObject<String>("emailUser");
            string url = string.Format("{0}api/Sucursal/ObtenerSucursales?idEmpresa={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idEmpresa, empresa, cadena);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<Lista> respuesta = JsonConvert.DeserializeObject<List<Lista>>(response.Content);
            string result = string.Empty;
            result = "<option value='0'> -- Selecciona una sucursal --  </option> ";
            foreach (var resp in respuesta)
            {
                result += String.Format("<option value='{0}'>{1}</option> ", resp.id, resp.Nombre.Trim());
            }
            return Json(new { d = result });

        }
        public async Task<ActionResult> GetUsuariosXSucursal(string idSucursal, string idEmpresa, string cadena, string empresa, string correo)
        {
            //string empresa = User.FindFirstValue(ClaimTypes.Sid);

            string emailUsuario = correo;
            string url = string.Format("{0}api/Usuario/ObtenerUsuariosCompleto?idEmpresa={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idEmpresa, empresa, cadena);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respUsuario> respuesta = JsonConvert.DeserializeObject<List<respUsuario>>(response.Content);
            string result = string.Empty;
            result = "<option value='0'> -- Selecciona un USUARIO --  </option> ";
            foreach (var resp in respuesta)
            {
                result += String.Format("<option value='{0}'>{1}</option> ", resp.Id, resp.Nombre.Trim() + " " + resp.APaterno + " " + resp.AMaterno);
            }
            return Json(new { d = result });

        }
        public async Task<ActionResult> GetData(string idPrograma, string idLista, string idSucursal, string idEmpresa, string cadena, string empresa, string correo)
        {


            string emailUsuario = correo;
            string url = string.Format("{0}api/Evaluaciones/Evaluacion/ObtenerPreguntasXPrograma?idPrograma={1}&idLista={2}&empresa={3}&cadena={4}", Utilerias.UrlBase, idPrograma, idPrograma, empresa, cadena);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<PreguntasXResponder> respuesta = JsonConvert.DeserializeObject<List<PreguntasXResponder>>(response.Content);
            string result = string.Empty;

            return Json(new { d = respuesta });
        }
        public async Task<ActionResult> GetElementoOpciones(string llav, string tipoPregunta, string idEmpresa, string cadena, string empresa, string correo)
        {

            string emailUsuario = correo;
            string url = string.Format("{0}ListasPreguntasOpciones/GetPregunta?idPregunta={1}&empresa={2}&cadena={3}&tipoPregunta={4}", Utilerias.UrlBase, llav, empresa, cadena, tipoPregunta);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<PreguntasOpciones> respuesta = JsonConvert.DeserializeObject<List<PreguntasOpciones>>(response.Content);

            return Json(new { d = respuesta });
        }

        public async Task<ActionResult> GetListasRecoleccionesBL26(string searchTerm, string idEmpresa, string cadena, string empresa, string correo)
        {
            string sanitizedIdEmpresa = ResolveIdEmpresa(idEmpresa);
            string sanitizedCadena = ResolveCadena(cadena);
            string sanitizedEmpresa = ResolveEmpresa(empresa);
            string sanitizedCorreo = ResolveCorreo(correo);

            Bl26Authorization authorization = await ResolveBl26AuthorizationAsync(sanitizedIdEmpresa, sanitizedCadena, sanitizedEmpresa, sanitizedCorreo);
            if (!authorization.HasAccess)
            {
                return Json(new { d = new List<object>(), sessionExpired = false, accessDenied = true, redirectToAdministration = authorization.RedirectToAdministration, redirectReason = authorization.RedirectReason });
            }

            if (string.IsNullOrWhiteSpace(sanitizedIdEmpresa) || string.IsNullOrWhiteSpace(sanitizedCadena) || string.IsNullOrWhiteSpace(sanitizedEmpresa) || string.IsNullOrWhiteSpace(sanitizedCorreo))
            {
                return Json(new { d = new List<object>(), sessionExpired = true });
            }

            respUsuario usuario = await ObtenerUsuarioPorEmailProxy(sanitizedIdEmpresa, sanitizedCorreo, sanitizedEmpresa, sanitizedCadena);
            if (usuario == null || string.IsNullOrWhiteSpace(usuario.Id))
            {
                return Json(new { d = new List<object>(), sessionExpired = true });
            }

            string normalizedSearchTerm = NormalizeSerializedText(searchTerm);
            string searchQuery = string.IsNullOrWhiteSpace(normalizedSearchTerm)
                ? string.Empty
                : $"&nombre={WebUtility.UrlEncode(normalizedSearchTerm.Trim())}";

            string url = string.Format(
                "{0}api/Evaluaciones/ObtenerComboProgramasXAlumno?idAlumno={1}&empresa={2}&idEmpresa={3}{4}&cadena={5}",
                Utilerias.UrlBase,
                usuario.Id,
                sanitizedEmpresa,
                sanitizedIdEmpresa,
                searchQuery,
                sanitizedCadena);

            List<DataPair3> respuesta = await ExecuteGetAsync<List<DataPair3>>(url) ?? new List<DataPair3>();
            List<object> listas = respuesta
                .Select(item => new
                {
                    id = item.idLista,
                    text = item.name,
                    idLista = item.idLista
                })
                .Cast<object>()
                .ToList();

            return Json(new { d = listas, sessionExpired = false });
        }

        public async Task<ActionResult> GetListasEjecutablesRecoleccionesBL26(string searchTerm, string idEmpresa, string cadena, string empresa, string correo)
        {
            string sanitizedIdEmpresa = ResolveIdEmpresa(idEmpresa);
            string sanitizedCadena = ResolveCadena(cadena);
            string sanitizedEmpresa = ResolveEmpresa(empresa);
            string sanitizedCorreo = ResolveCorreo(correo);
            bool isOperator = IsOperatorSession();

            Bl26Authorization authorization = await ResolveBl26AuthorizationAsync(sanitizedIdEmpresa, sanitizedCadena, sanitizedEmpresa, sanitizedCorreo);
            if (!authorization.HasAccess)
            {
                return Json(new { d = new List<object>(), sessionExpired = false, accessDenied = true, redirectToAdministration = authorization.RedirectToAdministration, redirectReason = authorization.RedirectReason });
            }

            if (string.IsNullOrWhiteSpace(sanitizedIdEmpresa) || string.IsNullOrWhiteSpace(sanitizedCadena) || string.IsNullOrWhiteSpace(sanitizedEmpresa) || string.IsNullOrWhiteSpace(sanitizedCorreo))
            {
                return Json(new { d = new List<object>(), sessionExpired = true });
            }

            string idAlumno = string.Empty;
            if (isOperator)
            {
                idAlumno = authorization.OperatorId;
            }
            else
            {
                respUsuario usuario = await ObtenerUsuarioPorEmailProxy(sanitizedIdEmpresa, sanitizedCorreo, sanitizedEmpresa, sanitizedCadena);
                if (usuario == null || string.IsNullOrWhiteSpace(usuario.Id))
                {
                    return Json(new { d = new List<object>(), sessionExpired = true });
                }

                idAlumno = usuario.Id;
            }

            string normalizedSearchTerm = NormalizeSerializedText(searchTerm);
            string searchQuery = string.IsNullOrWhiteSpace(normalizedSearchTerm)
                ? string.Empty
                : $"&nombre={WebUtility.UrlEncode(normalizedSearchTerm.Trim())}";

            string url = string.Format(
                "{0}api/Evaluaciones/ObtenerComboProgramasEjecutablesXAlumno?idAlumno={1}&empresa={2}&idEmpresa={3}{4}&cadena={5}",
                Utilerias.UrlBase,
                idAlumno,
                sanitizedEmpresa,
                sanitizedIdEmpresa,
                searchQuery,
                sanitizedCadena);

            List<DataPair3> respuesta = await ExecuteGetAsync<List<DataPair3>>(url) ?? new List<DataPair3>();
            List<DataPair3> listasValidas = await FilterExecutableListsWithQuestionsAsync(respuesta, sanitizedEmpresa, sanitizedCadena);
            List<object> listas = listasValidas
                .Where(item => item != null && !string.IsNullOrWhiteSpace(item.idLista) && !string.IsNullOrWhiteSpace(item.name))
                .Select(item => new
                {
                    id = item.idLista,
                    text = item.name.Trim(),
                    idLista = item.idLista,
                    usaActivos = item.usaActivos,
                    idTipoActivo = item.idTipoActivo,
                    tipoActivo = item.tipoActivo
                })
                .Cast<object>()
                .ToList();

            return Json(new { d = listas, sessionExpired = false });
        }

        public async Task<ActionResult> GetActivosRecoleccionesBL26(string busqueda, string idTipoActivo, string idEmpresa, string cadena, string empresa, string correo)
        {
            string sanitizedIdEmpresa = ResolveIdEmpresa(idEmpresa);
            string sanitizedCadena = ResolveCadena(cadena);
            string sanitizedEmpresa = ResolveEmpresa(empresa);
            string sanitizedCorreo = ResolveCorreo(correo);

            Bl26Authorization authorization = await ResolveBl26AuthorizationAsync(sanitizedIdEmpresa, sanitizedCadena, sanitizedEmpresa, sanitizedCorreo);
            if (!authorization.HasAccess)
            {
                return Json(new { d = new List<object>(), sessionExpired = false, accessDenied = true, redirectToAdministration = authorization.RedirectToAdministration, redirectReason = authorization.RedirectReason });
            }

            if (string.IsNullOrWhiteSpace(sanitizedIdEmpresa) || string.IsNullOrWhiteSpace(sanitizedCadena))
            {
                return Json(new { d = new List<object>(), sessionExpired = true });
            }

            StringBuilder url = new StringBuilder($"{Utilerias.UrlBase}api/Activos/ObtenerActivos?idEmpresa={sanitizedIdEmpresa}&cadena={sanitizedCadena}&estatus=activos");
            string normalizedSearch = NormalizeSerializedText(busqueda);
            if (!string.IsNullOrWhiteSpace(normalizedSearch))
            {
                url.Append("&busqueda=").Append(WebUtility.UrlEncode(normalizedSearch));
            }

            string normalizedTipoActivo = NormalizeSerializedText(idTipoActivo);
            if (Guid.TryParse(normalizedTipoActivo, out Guid tipoActivoGuid))
            {
                url.Append("&idTipoActivo=").Append(tipoActivoGuid);
            }

            List<ActivoListadoDto> activos = await ExecuteGetAsync<List<ActivoListadoDto>>(url.ToString()) ?? new List<ActivoListadoDto>();
            List<object> resultado = activos
                .Where(item => item.Activo)
                .Select(item => new
                {
                    id = item.Id.ToString(),
                    codigo = item.Codigo,
                    nombre = item.Nombre,
                    tag = item.Tag,
                    numeroSerie = item.NumeroSerie,
                    tipoActivo = item.TipoActivo,
                    estadoOperativo = item.EstadoOperativo,
                    sucursal = item.Sucursal,
                    marca = item.Marca,
                    proveedor = item.Proveedor,
                    descripcion = item.Descripcion,
                    cantidadFotos = item.CantidadFotos,
                    cantidadVideos = item.CantidadVideos,
                    cantidadDocumentos = item.CantidadDocumentos
                })
                .Cast<object>()
                .ToList();

            return Json(new { d = resultado, sessionExpired = false });
        }

        public async Task<ActionResult> GetActivoRecoleccionesBL26(string idActivo, string idEmpresa, string cadena, string empresa, string correo)
        {
            string sanitizedIdActivo = NormalizeSerializedText(idActivo);
            string sanitizedIdEmpresa = ResolveIdEmpresa(idEmpresa);
            string sanitizedCadena = ResolveCadena(cadena);
            string sanitizedEmpresa = ResolveEmpresa(empresa);
            string sanitizedCorreo = ResolveCorreo(correo);

            Bl26Authorization authorization = await ResolveBl26AuthorizationAsync(sanitizedIdEmpresa, sanitizedCadena, sanitizedEmpresa, sanitizedCorreo);
            if (!authorization.HasAccess)
            {
                return Json(new { d = (object?)null, sessionExpired = false, accessDenied = true, redirectToAdministration = authorization.RedirectToAdministration, redirectReason = authorization.RedirectReason });
            }

            if (!Guid.TryParse(sanitizedIdActivo, out Guid activoGuid) || string.IsNullOrWhiteSpace(sanitizedIdEmpresa) || string.IsNullOrWhiteSpace(sanitizedCadena))
            {
                return Json(new { d = (object?)null, sessionExpired = true });
            }

            string url = $"{Utilerias.UrlBase}api/Activos/ObtenerActivo?idEmpresa={sanitizedIdEmpresa}&idActivo={activoGuid}&cadena={sanitizedCadena}";
            ActivoDetalleDto activo = await ExecuteGetAsync<ActivoDetalleDto>(url);
            return Json(new { d = activo, sessionExpired = false });
        }

        public async Task<ActionResult> GetSucursalesRecoleccionesBL26(string idEmpresa, string cadena, string empresa, string correo)
        {
            string sanitizedIdEmpresa = ResolveIdEmpresa(idEmpresa);
            string sanitizedCadena = ResolveCadena(cadena);
            string sanitizedEmpresa = ResolveEmpresa(empresa);
            string sanitizedCorreo = ResolveCorreo(correo);
            bool isOperator = IsOperatorSession();

            Bl26Authorization authorization = await ResolveBl26AuthorizationAsync(sanitizedIdEmpresa, sanitizedCadena, sanitizedEmpresa, sanitizedCorreo);
            if (!authorization.HasAccess)
            {
                return Json(new { d = new List<object>(), sessionExpired = false, accessDenied = true, redirectToAdministration = authorization.RedirectToAdministration, redirectReason = authorization.RedirectReason });
            }

            if (string.IsNullOrWhiteSpace(sanitizedIdEmpresa) || string.IsNullOrWhiteSpace(sanitizedCadena) || string.IsNullOrWhiteSpace(sanitizedCorreo))
            {
                return Json(new { d = new List<object>(), sessionExpired = true });
            }

            List<object> sucursales;
            if (isOperator)
            {
                sucursales = authorization.Sucursales
                    .Where(item => item != null && !string.IsNullOrWhiteSpace(item.IdSucursal))
                    .Select(item => new
                    {
                        id = item.IdSucursal,
                        text = item.Sucursal?.Trim() ?? string.Empty
                    })
                    .Cast<object>()
                    .ToList();
            }
            else
            {
                string url = string.Format(
                    "{0}api/Sucursal/ObtenerSucursalesPorUsuario?idEmpresa={1}&cadena={2}&correo={3}",
                    Utilerias.UrlBase,
                    sanitizedIdEmpresa,
                    sanitizedCadena,
                    sanitizedCorreo);

                List<respSucursalx> respuesta = await ExecuteGetAsync<List<respSucursalx>>(url) ?? new List<respSucursalx>();
                sucursales = respuesta
                    .Where(item => item != null && item.Id.HasValue)
                    .Select(item => new
                    {
                        id = item.Id.Value.ToString(),
                        text = item.Nombre?.Trim() ?? string.Empty
                    })
                    .Cast<object>()
                    .ToList();
            }

            return Json(new { d = sucursales, sessionExpired = false });
        }

        public async Task<ActionResult> GetResponsablesRecoleccionesBL26(string idSucursal, string idEmpresa, string cadena, string empresa, string correo)
        {
            string sanitizedSucursal = NormalizeSerializedText(idSucursal);
            string sanitizedIdEmpresa = ResolveIdEmpresa(idEmpresa);
            string sanitizedCadena = ResolveCadena(cadena);
            string sanitizedEmpresa = ResolveEmpresa(empresa);
            string sanitizedCorreo = ResolveCorreo(correo);
            bool isOperator = IsOperatorSession();

            Bl26Authorization authorization = await ResolveBl26AuthorizationAsync(sanitizedIdEmpresa, sanitizedCadena, sanitizedEmpresa, sanitizedCorreo);
            if (!authorization.HasAccess)
            {
                return Json(new { d = new List<object>(), sessionExpired = false, accessDenied = true, redirectToAdministration = authorization.RedirectToAdministration, redirectReason = authorization.RedirectReason });
            }

            if (string.IsNullOrWhiteSpace(sanitizedSucursal) || string.IsNullOrWhiteSpace(sanitizedIdEmpresa) || string.IsNullOrWhiteSpace(sanitizedCadena) || string.IsNullOrWhiteSpace(sanitizedEmpresa))
            {
                return Json(new { d = new List<object>(), sessionExpired = true });
            }

            List<object> responsables;
            if (isOperator)
            {
                bool sucursalValida = authorization.Sucursales.Any(item => string.Equals(item.IdSucursal, sanitizedSucursal, StringComparison.OrdinalIgnoreCase));
                responsables = sucursalValida
                    ? new List<object>
                    {
                        new
                        {
                            id = authorization.OperatorId,
                            text = authorization.OperatorName,
                            correo = authorization.OperatorCorreo
                        }
                    }
                    : new List<object>();
            }
            else
            {
                string url = string.Format(
                    "{0}api/Usuario/ObtenerUsuariosCompletoXSucursal?idSucursal={1}&idEmpresa={2}&empresa={3}&cadena={4}",
                    Utilerias.UrlBase,
                    sanitizedSucursal,
                    sanitizedIdEmpresa,
                    sanitizedEmpresa,
                    sanitizedCadena);

                List<respUsuario> respuesta = await ExecuteGetAsync<List<respUsuario>>(url) ?? new List<respUsuario>();
                responsables = respuesta
                    .Where(item => item != null && !string.IsNullOrWhiteSpace(item.Id))
                    .Select(item => new
                    {
                        id = item.Id,
                        text = BuildNombreCompleto(item),
                        correo = item.CorreoInstitucional ?? item.CorreoPersonal ?? string.Empty
                    })
                    .Cast<object>()
                    .ToList();
            }

            return Json(new { d = responsables, sessionExpired = false });
        }

        public async Task<ActionResult> GetCuestionarioRecoleccionesBL26(string idPrograma, string idLista, string idSucursal, string idResponsable, string idEmpresa, string cadena, string empresa, string correo)
        {
            string sanitizedPrograma = NormalizeSerializedText(idPrograma);
            string sanitizedIdEmpresa = ResolveIdEmpresa(idEmpresa);
            string sanitizedCadena = ResolveCadena(cadena);
            string sanitizedEmpresa = ResolveEmpresa(empresa);
            string sanitizedCorreo = ResolveCorreo(correo);

            Bl26Authorization authorization = await ResolveBl26AuthorizationAsync(sanitizedIdEmpresa, sanitizedCadena, sanitizedEmpresa, sanitizedCorreo);
            if (!authorization.HasAccess)
            {
                return Json(new { d = new List<object>(), sessionExpired = false, accessDenied = true, redirectToAdministration = authorization.RedirectToAdministration, redirectReason = authorization.RedirectReason });
            }

            if (string.IsNullOrWhiteSpace(sanitizedPrograma) || string.IsNullOrWhiteSpace(sanitizedIdEmpresa) || string.IsNullOrWhiteSpace(sanitizedCadena) || string.IsNullOrWhiteSpace(sanitizedEmpresa) || string.IsNullOrWhiteSpace(sanitizedCorreo))
            {
                return Json(new { d = new List<object>(), sessionExpired = true });
            }

            bool listaValida = await CanStartExecutableListAsync(sanitizedPrograma, sanitizedIdEmpresa, sanitizedCadena, sanitizedEmpresa, sanitizedCorreo, authorization);
            if (!listaValida)
            {
                return Json(new
                {
                    d = new List<object>(),
                    sessionExpired = false,
                    invalidList = true,
                    message = "La lista seleccionada ya no está disponible para iniciar una inspección."
                });
            }

            List<PreguntasXResponder> preguntas = await GetPreguntasRecoleccionesBl26Async(sanitizedPrograma, sanitizedEmpresa, sanitizedCadena);
            if (preguntas.Count == 0)
            {
                return Json(new
                {
                    d = new List<object>(),
                    sessionExpired = false,
                    invalidList = true,
                    message = "La lista seleccionada no tiene preguntas activas disponibles."
                });
            }

            List<object> preguntasViewModel = new List<object>();
            foreach (PreguntasXResponder pregunta in preguntas)
            {
                List<PreguntasOpciones> opciones = await GetOpcionesPreguntaBl26(pregunta, sanitizedEmpresa, sanitizedCadena);
                preguntasViewModel.Add(new
                {
                    id = pregunta.id,
                    idLista = pregunta.idLista,
                    pregunta = pregunta.pregunta,
                    explicacion = pregunta.explicacion ?? string.Empty,
                    tipo = pregunta.tipo ?? string.Empty,
                    valor = pregunta.valor ?? string.Empty,
                    obligatorio = pregunta.obligatorio,
                    respuestaCorrecta = pregunta.RespuestaCorrecta ?? string.Empty,
                    idCategoria = pregunta.idCategoria,
                    idSubcategoria = pregunta.idSubcategoria,
                    categoria = pregunta.categoria ?? string.Empty,
                    subcategoria = pregunta.subcategoria ?? string.Empty,
                    notas = pregunta.notas ?? string.Empty,
                    opciones = opciones.Select(opcion => new
                    {
                        id = opcion.id?.ToString() ?? string.Empty,
                        opcion = opcion.opcion ?? string.Empty,
                        tipoPregunta = opcion.tipoPregunta ?? string.Empty
                    }).ToList()
                });
            }

            return Json(new
            {
                d = preguntasViewModel,
                sessionExpired = false,
                context = new
                {
                    idPrograma = sanitizedPrograma,
                    idLista = NormalizeSerializedText(idLista),
                    idSucursal = NormalizeSerializedText(idSucursal),
                    idResponsable = NormalizeSerializedText(idResponsable),
                    idEmpresa = sanitizedIdEmpresa,
                    empresa = sanitizedEmpresa,
                    cadena = sanitizedCadena,
                    correo = sanitizedCorreo
                }
            });
        }

        [HttpPost]
        public async Task<ActionResult> GuardarRespuesta([FromBody] List<Respuesta> ListaRespuesta)
        {
            try
            {
                if (ListaRespuesta == null || ListaRespuesta.Count == 0)
                {
                    return Json(new { d = "Completa las preguntas obligatorias antes de finalizar." });
                }

                string empresa = ListaRespuesta[0].empresa;
                string idEmpresa = ListaRespuesta[0].idEmpresa;
                string cadena = ListaRespuesta[0].cadena;
                string emailUsuario = ListaRespuesta[0].correo;
                string idLista = ListaRespuesta[0].idLista;

                string requiredValidationError = await ValidateRequiredAnswersBeforeClosingAsync(ListaRespuesta, idLista, empresa, cadena);
                if (!string.IsNullOrWhiteSpace(requiredValidationError))
                {
                    return Json(new { d = requiredValidationError });
                }

                ResponderContext? respondedor = await ResolveResponderContextAsync(idEmpresa, emailUsuario, empresa, cadena);
                if (respondedor == null)
                {
                    return Json(new { d = "No fue posible identificar a la cuenta actual." });
                }

                // Enviar las respuestas
                string resultado = await EnviarRespuestas(ListaRespuesta, respondedor, idEmpresa, empresa, cadena);
                return Json(new { d = resultado });
            }
            catch (HttpRequestException)
            {
                return Json(new { d = "No fue posible enviar la información en este momento." });
            }
            catch (Exception)
            {
                return Json(new { d = "Ocurrió un problema al procesar la solicitud." });
            }
        }

        [HttpPost]
        public async Task<ActionResult> GuardarRespuestaBL26([FromBody] List<Respuesta> ListaRespuesta)
        {
            try
            {
                if (ListaRespuesta == null || ListaRespuesta.Count == 0)
                {
                    return Json(new { d = "Completa las preguntas obligatorias antes de finalizar." });
                }

                string empresa = ListaRespuesta[0].empresa;
                string idEmpresa = ListaRespuesta[0].idEmpresa;
                string cadena = ListaRespuesta[0].cadena;
                string emailUsuario = ListaRespuesta[0].correo;
                string idLista = ListaRespuesta[0].idLista;

                string requiredValidationError = await ValidateRequiredAnswersBeforeClosingAsync(ListaRespuesta, idLista, empresa, cadena);
                if (!string.IsNullOrWhiteSpace(requiredValidationError))
                {
                    return Json(new { d = requiredValidationError });
                }

                ResponderContext? respondedor = await ResolveResponderContextAsync(idEmpresa, emailUsuario, empresa, cadena);
                if (respondedor == null)
                {
                    return Json(new { d = "No fue posible identificar a la cuenta actual." });
                }

                GuardarInspeccionBl26Response resultado = await EnviarInspeccionBl26Async(ListaRespuesta, respondedor, idEmpresa, empresa, cadena);
                return Json(new
                {
                    d = "Ok",
                    idInspeccion = resultado.idInspeccion,
                    eventoLegacy = resultado.eventoLegacy,
                    respuestasGuardadas = resultado.respuestasGuardadas
                });
            }
            catch (HttpRequestException)
            {
                return Json(new { d = "No fue posible enviar la información en este momento." });
            }
            catch (Exception)
            {
                return Json(new { d = "Ocurrió un problema al procesar la solicitud." });
            }
        }

        // Método para obtener el usuario por email
        private async Task<respUsuario> ObtenerUsuarioPorEmail(string idEmpresa, string emailUsuario, string empresa, string cadena)
        {
            string url = $"{Utilerias.UrlBase}api/Usuario/ObtenerUsuarioPorEmail?idEmpresa={idEmpresa}&email={emailUsuario}&empresa={empresa}&cadena={cadena}";
            using (var client = new HttpClient())
            {
                client.Timeout = TimeSpan.FromMinutes(10);
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string responseBody = await response.Content.ReadAsStringAsync();
                List<respUsuario> respuesta = JsonConvert.DeserializeObject<List<respUsuario>>(responseBody);
                return respuesta.FirstOrDefault();
            }
        }

        private async Task<respUsuario> ObtenerUsuarioPorEmailProxy(string idEmpresa, string emailUsuario, string empresa, string cadena)
        {
            return await ObtenerUsuarioPorEmail(idEmpresa, emailUsuario, empresa, cadena);
        }

        private async Task<ResponderContext?> ResolveResponderContextAsync(string idEmpresa, string emailUsuario, string empresa, string cadena)
        {
            if (IsOperatorSession())
            {
                respOperadorAcceso? acceso = await ObtenerAccesoOperadorAsync(idEmpresa, ResolveUserUid(), cadena);
                if (acceso == null || !acceso.TieneAcceso || string.IsNullOrWhiteSpace(acceso.IdOperador))
                {
                    return null;
                }

                return new ResponderContext
                {
                    Id = acceso.IdOperador,
                    Nombre = acceso.NombreCompleto,
                    Correo = acceso.Correo
                };
            }

            respUsuario usuario = await ObtenerUsuarioPorEmail(idEmpresa, emailUsuario, empresa, cadena);
            if (usuario == null || string.IsNullOrWhiteSpace(usuario.Id))
            {
                return null;
            }

            return new ResponderContext
            {
                Id = usuario.Id,
                Nombre = BuildNombreCompleto(usuario),
                Correo = usuario.CorreoInstitucional ?? usuario.CorreoPersonal ?? string.Empty
            };
        }

        private async Task<respUsuario> ObtenerUsuarioPorId(string idEmpresa, string idUsuario, string empresa, string cadena)
        {
            string url = $"{Utilerias.UrlBase}api/Usuario/ObtenerUsuario?idEmpresa={idEmpresa}&id={idUsuario}&empresa={empresa}&cadena={cadena}";
            List<respUsuario> respuesta = await ExecuteGetAsync<List<respUsuario>>(url) ?? new List<respUsuario>();
            return respuesta.FirstOrDefault();
        }

        private async Task<List<PreguntasOpciones>> GetOpcionesPreguntaBl26(PreguntasXResponder pregunta, string empresa, string cadena)
        {
            string tipoPregunta = NormalizeSerializedText(pregunta?.tipo);
            if (pregunta == null || pregunta.id == null || (tipoPregunta != "2" && tipoPregunta != "3"))
            {
                return new List<PreguntasOpciones>();
            }

            string url = string.Format(
                "{0}ListasPreguntasOpciones/GetPregunta?idPregunta={1}&empresa={2}&cadena={3}&tipoPregunta={4}",
                Utilerias.UrlBase,
                pregunta.id,
                empresa,
                cadena,
                tipoPregunta);

            return await ExecuteGetAsync<List<PreguntasOpciones>>(url) ?? new List<PreguntasOpciones>();
        }

        private async Task<List<DataPair3>> FilterExecutableListsWithQuestionsAsync(IEnumerable<DataPair3> candidatos, string empresa, string cadena)
        {
            List<DataPair3> listas = (candidatos ?? Enumerable.Empty<DataPair3>())
                .Where(item => item != null && !string.IsNullOrWhiteSpace(item.idLista) && !string.IsNullOrWhiteSpace(item.name))
                .GroupBy(item => item.idLista.Trim(), StringComparer.OrdinalIgnoreCase)
                .Select(group => group.First())
                .ToList();

            List<DataPair3> resultado = new List<DataPair3>();
            foreach (DataPair3 lista in listas)
            {
                List<PreguntasXResponder> preguntas = await GetPreguntasRecoleccionesBl26Async(lista.idLista, empresa, cadena);
                if (preguntas.Count > 0)
                {
                    resultado.Add(lista);
                }
            }

            return resultado;
        }

        private async Task<bool> CanStartExecutableListAsync(string idLista, string idEmpresa, string cadena, string empresa, string correo, Bl26Authorization authorization)
        {
            string sanitizedIdLista = NormalizeSerializedText(idLista);
            if (string.IsNullOrWhiteSpace(sanitizedIdLista))
            {
                return false;
            }

            bool isOperator = IsOperatorSession();
            string idAlumno = string.Empty;
            if (isOperator)
            {
                idAlumno = authorization?.OperatorId ?? string.Empty;
            }
            else
            {
                respUsuario usuario = await ObtenerUsuarioPorEmailProxy(idEmpresa, correo, empresa, cadena);
                idAlumno = usuario?.Id ?? string.Empty;
            }

            if (string.IsNullOrWhiteSpace(idAlumno))
            {
                return false;
            }

            string url = string.Format(
                "{0}api/Evaluaciones/ObtenerComboProgramasEjecutablesXAlumno?idAlumno={1}&empresa={2}&idEmpresa={3}&cadena={4}",
                Utilerias.UrlBase,
                idAlumno,
                empresa,
                idEmpresa,
                cadena);

            List<DataPair3> candidatas = await ExecuteGetAsync<List<DataPair3>>(url) ?? new List<DataPair3>();
            List<DataPair3> validas = await FilterExecutableListsWithQuestionsAsync(candidatas, empresa, cadena);
            return validas.Any(item => string.Equals(item.idLista?.Trim(), sanitizedIdLista, StringComparison.OrdinalIgnoreCase));
        }

        private async Task<List<PreguntasXResponder>> GetPreguntasRecoleccionesBl26Async(string idLista, string empresa, string cadena)
        {
            string sanitizedIdLista = NormalizeSerializedText(idLista);
            if (string.IsNullOrWhiteSpace(sanitizedIdLista))
            {
                return new List<PreguntasXResponder>();
            }

            string url = string.Format(
                "{0}api/Evaluaciones/Evaluacion/ObtenerPreguntasXPrograma?idPrograma={1}&idLista={2}&empresa={3}&cadena={4}",
                Utilerias.UrlBase,
                sanitizedIdLista,
                sanitizedIdLista,
                empresa,
                cadena);

            return await ExecuteGetAsync<List<PreguntasXResponder>>(url) ?? new List<PreguntasXResponder>();
        }

        private async Task<string> ValidateRequiredAnswersBeforeClosingAsync(List<Respuesta> respuestas, string idLista, string empresa, string cadena)
        {
            string sanitizedIdLista = NormalizeSerializedText(idLista);
            if (string.IsNullOrWhiteSpace(sanitizedIdLista))
            {
                return "Completa las preguntas obligatorias antes de finalizar.";
            }

            List<PreguntasXResponder> preguntas = await GetPreguntasRecoleccionesBl26Async(sanitizedIdLista, empresa, cadena);
            if (preguntas.Count == 0)
            {
                return "No fue posible validar las preguntas obligatorias de esta inspección.";
            }

            ILookup<string, Respuesta> respuestasPorPregunta = (respuestas ?? new List<Respuesta>())
                .Where(respuesta => respuesta != null && !string.IsNullOrWhiteSpace(respuesta.idPregunta))
                .ToLookup(respuesta => NormalizeSerializedText(respuesta.idPregunta), StringComparer.OrdinalIgnoreCase);

            foreach (PreguntasXResponder pregunta in preguntas.Where(item => item != null && item.obligatorio))
            {
                string questionId = NormalizeSerializedText(pregunta.id?.ToString());
                if (string.IsNullOrWhiteSpace(questionId))
                {
                    continue;
                }

                List<Respuesta> respuestasPregunta = respuestasPorPregunta[questionId].ToList();
                if (!HasValidServerAnswer(pregunta, respuestasPregunta))
                {
                    return "Completa las preguntas obligatorias antes de finalizar.";
                }
            }

            return string.Empty;
        }

        private bool HasValidServerAnswer(PreguntasXResponder pregunta, List<Respuesta> respuestasPregunta)
        {
            if (pregunta == null)
            {
                return false;
            }

            string tipo = NormalizeSerializedText(pregunta.tipo);
            if (respuestasPregunta == null || respuestasPregunta.Count == 0)
            {
                return false;
            }

            if (tipo == "3")
            {
                return respuestasPregunta.Any(respuesta => !string.IsNullOrWhiteSpace(NormalizeSerializedText(respuesta?.respuestaValor)));
            }

            Respuesta respuesta = respuestasPregunta.FirstOrDefault();
            if (respuesta == null)
            {
                return false;
            }

            string respuestaValor = NormalizeSerializedText(respuesta.respuestaValor);
            if (string.IsNullOrWhiteSpace(respuestaValor))
            {
                return false;
            }

            if (tipo == "5")
            {
                return int.TryParse(respuestaValor, out _) || respuesta.valor != 0;
            }

            if (tipo == "6")
            {
                return DateTime.TryParse(respuestaValor, out _);
            }

            if (tipo == "7")
            {
                return DateTime.TryParse(respuestaValor, out _);
            }

            if (tipo == "8")
            {
                return TimeSpan.TryParse(respuestaValor, out _);
            }

            return true;
        }

        private async Task<T> ExecuteGetAsync<T>(string url)
        {
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);

            if (!response.IsSuccessful || string.IsNullOrWhiteSpace(response.Content))
            {
                return default;
            }

            return JsonConvert.DeserializeObject<T>(response.Content);
        }

        private object BuildBl26SessionContext(string idEmpresa, string cadena, string empresa)
        {
            return new
            {
                idEmpresa = ResolveIdEmpresa(idEmpresa),
                cadena = ResolveCadena(cadena),
                empresa = ResolveEmpresa(empresa),
                correo = ResolveCorreo(string.Empty)
            };
        }

        private string ResolveIdEmpresa(string fallback)
        {
            return NormalizeSerializedText(
                HttpContext.Session.GetObject<string>("idEmpresa")
                ?? HttpContext.Session.GetString("idEmpresa")
                ?? fallback);
        }

        private string ResolveCadena(string fallback)
        {
            return NormalizeSerializedText(
                HttpContext.Session.GetObject<string>("cadena")
                ?? HttpContext.Session.GetString("cadena")
                ?? fallback);
        }

        private string ResolveEmpresa(string fallback)
        {
            return NormalizeSerializedText(
                HttpContext.Session.GetObject<string>("empresa")
                ?? HttpContext.Session.GetString("empresa")
                ?? fallback);
        }

        private string ResolveCorreo(string fallback)
        {
            return NormalizeSerializedText(
                HttpContext.Session.GetObject<string>("emailUser")
                ?? HttpContext.Session.GetString("emailUser")
                ?? fallback);
        }

        private string NormalizeSerializedText(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }

            string normalized = value.Trim();
            if (normalized.StartsWith("\"") && normalized.EndsWith("\""))
            {
                try
                {
                    return JsonConvert.DeserializeObject<string>(normalized)?.Trim() ?? string.Empty;
                }
                catch
                {
                    return normalized.Trim('"').Trim();
                }
            }

            return normalized;
        }

        private string BuildNombreCompleto(respUsuario usuario)
        {
            List<string> partes = new List<string>
            {
                usuario?.Nombre?.Trim() ?? string.Empty,
                usuario?.APaterno?.Trim() ?? string.Empty,
                usuario?.AMaterno?.Trim() ?? string.Empty
            };

            return string.Join(" ", partes.Where(parte => !string.IsNullOrWhiteSpace(parte)));
        }

        private async Task<Bl26Authorization> ResolveBl26AuthorizationAsync(string idEmpresa, string cadena, string empresa, string correo)
        {
            string sanitizedIdEmpresa = ResolveIdEmpresa(idEmpresa);
            string sanitizedCadena = ResolveCadena(cadena);
            string sanitizedEmpresa = ResolveEmpresa(empresa);
            string sanitizedCorreo = ResolveCorreo(correo);
            bool dualModeAccess = HasDualModeAccess();
            bool operationMode = IsOperationMode();

            if (string.IsNullOrWhiteSpace(sanitizedIdEmpresa) || string.IsNullOrWhiteSpace(sanitizedCadena) || string.IsNullOrWhiteSpace(sanitizedEmpresa))
            {
                return Bl26Authorization.Denied;
            }

            respOperadorAcceso? accesoOperador = await ObtenerAccesoOperadorAsync(sanitizedIdEmpresa, ResolveUserUid(), sanitizedCadena);
            if (accesoOperador != null && accesoOperador.TieneAcceso)
            {
                if (dualModeAccess && !operationMode)
                {
                    return Bl26Authorization.RedirectToAdmin();
                }

                return new Bl26Authorization
                {
                    HasAccess = true,
                    CanWrite = true,
                    OperatorId = accesoOperador.IdOperador,
                    OperatorName = accesoOperador.NombreCompleto,
                    OperatorCorreo = accesoOperador.Correo,
                    Sucursales = accesoOperador.Sucursales ?? new List<respOperadorSucursal>()
                };
            }

            // Si la identidad ya tiene un perfil operador vinculado pero está
            // suspendido o sin acceso, no debe recuperar acceso operativo por
            // el permiso administrativo legacy.
            if (accesoOperador != null && !string.IsNullOrWhiteSpace(accesoOperador.IdOperador))
            {
                if (dualModeAccess)
                {
                    return Bl26Authorization.RedirectToAdmin("operation-unavailable");
                }

                return Bl26Authorization.Denied;
            }

            if (IsOperatorSession())
            {
                return Bl26Authorization.Denied;
            }

            respUsuario? usuarioActual = await ResolveCurrentUserAsync(sanitizedIdEmpresa, sanitizedCadena, sanitizedEmpresa, sanitizedCorreo);
            if (usuarioActual == null || string.IsNullOrWhiteSpace(usuarioActual.Id))
            {
                return Bl26Authorization.Denied;
            }

            string idRol = usuarioActual.idRol?.ToString() ?? string.Empty;
            Opciones legacy = await Utilerias.GetOpcion("02001000", sanitizedIdEmpresa, idRol, sanitizedEmpresa, sanitizedCadena);
            if (HasAccess(legacy))
            {
                return new Bl26Authorization
                {
                    HasAccess = true,
                    CanWrite = CanWrite(legacy)
                };
            }

            return Bl26Authorization.Denied;
        }

        private async Task<respUsuario?> ResolveCurrentUserAsync(string idEmpresa, string cadena, string empresa, string correo)
        {
            if (string.IsNullOrWhiteSpace(correo))
            {
                return null;
            }

            respUsuario usuario = await ObtenerUsuarioPorEmailProxy(idEmpresa, correo, empresa, cadena);
            if (usuario == null || string.IsNullOrWhiteSpace(usuario.Id))
            {
                return null;
            }

            respUsuario usuarioCompleto = await ObtenerUsuarioPorId(idEmpresa, usuario.Id, empresa, cadena);
            string idRol = usuarioCompleto?.idRol?.ToString() ?? string.Empty;

            if (!string.IsNullOrWhiteSpace(Utilerias.IdRol))
            {
                usuarioCompleto.idRol = Guid.TryParse(Utilerias.IdRol, out Guid rolActual) ? rolActual : usuarioCompleto.idRol;
            }
            else if (!string.IsNullOrWhiteSpace(idRol))
            {
                Utilerias.IdRol = idRol;
            }

            return usuarioCompleto;
        }

        private async Task<respOperadorAcceso?> ObtenerAccesoOperadorAsync(string idEmpresa, string idFirebase, string cadena)
        {
            if (string.IsNullOrWhiteSpace(idEmpresa) || string.IsNullOrWhiteSpace(idFirebase) || string.IsNullOrWhiteSpace(cadena))
            {
                return null;
            }

            string url = $"{Utilerias.UrlBase}api/Operadores/ObtenerAccesoOperador?idEmpresa={idEmpresa}&idFirebase={WebUtility.UrlEncode(idFirebase)}&cadena={cadena}";
            return await ExecuteGetAsync<respOperadorAcceso>(url);
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

        private bool IsOperationMode()
        {
            string currentMode = HttpContext.Session.GetString("currentWorkMode") ?? string.Empty;
            return string.Equals(currentMode, "Operacion", StringComparison.OrdinalIgnoreCase);
        }

        private string ResolveUserUid()
        {
            return NormalizeSerializedText(
                HttpContext.Session.GetString("userUid")
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? string.Empty);
        }

        private static bool HasAccess(Opciones opcion)
        {
            return opcion?.Permisos?.Acceso == 1;
        }

        private static bool CanWrite(Opciones opcion)
        {
            return opcion?.Permisos?.Escritura == 1;
        }

        private sealed class Bl26Authorization
        {
            public static readonly Bl26Authorization Denied = new Bl26Authorization
            {
                HasAccess = false,
                CanWrite = false,
                RedirectToAdministration = false
            };

            public bool HasAccess { get; init; }
            public bool CanWrite { get; init; }
            public string OperatorId { get; init; } = string.Empty;
            public string OperatorName { get; init; } = string.Empty;
            public string OperatorCorreo { get; init; } = string.Empty;
            public List<respOperadorSucursal> Sucursales { get; init; } = new();
            public bool RedirectToAdministration { get; init; }
            public string RedirectReason { get; init; } = string.Empty;

            public static Bl26Authorization RedirectToAdmin(string reason = "")
            {
                return new Bl26Authorization
                {
                    HasAccess = false,
                    CanWrite = false,
                    RedirectToAdministration = true,
                    RedirectReason = reason
                };
            }
        }

        // Método para enviar las respuestas a la API
        private async Task<string> EnviarRespuestas(List<Respuesta> ListaRespuesta, ResponderContext usuario, string idEmpresa, string empresa, string cadena)
        {
            long timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            string regresa = "Ok";

            //List<RespuestaSubida> respuestas = await UploadFileToFirebaseStorage2( idEmpresa,  empresa,  cadena);
            //  _sqliteHelper.InsertRespuestas(ListaRespuesta, usuario.Id, timestamp.ToString());

            foreach (var item in ListaRespuesta)
            {
                try
                {
                    //List<RespuestaSubida> respuestasIMG = await UploadFileToFirebaseStorage25(idEmpresa, empresa, cadena, item.urlFotos, "foto", item.idPregunta);
                    // List<RespuestaSubida> respuestasVideo = await UploadFileToFirebaseStorage25(idEmpresa, empresa, cadena, item.urlVideos, "video", item.idPregunta);

                    ListasRespuestas zona = new ListasRespuestas
                    {
                        idEmpresa = Guid.Parse(idEmpresa.ToString()),
                        idLista = Guid.Parse(item.idLista),
                        idPregunta = Guid.Parse(item.idPregunta),
                        RespuestaValor = item.respuestaValor,
                        Notas = item.notas,
                        idAlumno = Guid.Parse(usuario.Id),
                        idPrograma = Guid.Parse(item.idPrograma),
                        idTipoPregunta = item.idTipoPregunta,
                        Explicacion = item.explicacion,
                        Valor = item.valor,
                        Calificacion = item.calificacion,
                        obligatoria = item.obligatoria,
                        urlVideos = item.urlVideos,
                        urlFotos = item.urlFotos,
                        RespuestaCorrecta = item.RespuestaCorrecta,
                        idSucursal = item.idSucursal,
                        idUsuario = item.idUsuario,
                        idActivo = item.idActivo,
                        latitud = item.latitud,
                        longitud = item.longitud,
                        stamp = timestamp.ToString()
                    };


                    //var respuestasRelacionadas = respuestasIMG.Where(r => r.IdPregunta == item.idPregunta).ToList();


                    //if (respuestasRelacionadas.Any())
                    //{
                    //    zona.urlFotos.Clear();
                    //    foreach (var respuestaRelacionada in respuestasRelacionadas)
                    //    {
                    //        if (respuestaRelacionada != null)
                    //        {
                    //           if (respuestaRelacionada.TipoArchivo == "foto")
                    //            {
                    //                // Asegurar que la lista de fotos no sea null
                    //                if (zona.urlFotos == null)
                    //                {
                    //                    zona.urlFotos = new List<string>();
                    //                }

                    //                zona.urlFotos.Add(respuestaRelacionada.UrlArchivo);
                    //            }
                    //        }
                    //    }
                    //}

                    //var respuestasRelacionadasVideo = respuestasVideo.Where(r => r.IdPregunta == item.idPregunta).ToList();


                    //if (respuestasRelacionadasVideo.Any())
                    //{
                    //     zona.urlVideos.Clear();
                    //    foreach (var respuestaRelacionada in respuestasRelacionadasVideo)
                    //    {
                    //        if (respuestaRelacionada != null)
                    //        {
                    //            // Verificar si es un video o una foto y agregar a la lista correspondiente
                    //            if (respuestaRelacionada.TipoArchivo == "video")
                    //            {
                    //                // Asegurar que la lista de videos no sea null
                    //                if (zona.urlVideos == null)
                    //                {
                    //                    zona.urlVideos = new List<string>();
                    //                }

                    //                zona.urlVideos.Add(respuestaRelacionada.UrlArchivo);
                    //            }

                    //        }
                    //    }
                    //}


                    var json = JsonConvert.SerializeObject(zona, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                    string url = $"{Utilerias.UrlBase}api/Evaluaciones?evento={item.evento}&empresa={empresa}&cadena={cadena}";

                    using (var clientS = new HttpClient())
                    {
                        clientS.Timeout = TimeSpan.FromMinutes(10);
                        var request = new HttpRequestMessage(HttpMethod.Post, url)
                        {
                            Content = new StringContent(json, Encoding.UTF8, "application/json")
                        };
                        HttpResponseMessage response = await clientS.SendAsync(request);

                        if (!response.IsSuccessStatusCode)
                        {
                            string errorContent = await response.Content.ReadAsStringAsync();
                            return $"Error {response.StatusCode}: {errorContent}";
                        }

                        string responseContent = await response.Content.ReadAsStringAsync();
                        if (Utilerias.LimpiaCadena(responseContent) != "Ok")
                        {
                            regresa = responseContent;
                        }
                    }
                }
                catch (Exception ex)
                {
                    return $"Error al procesar la respuesta: {ex.Message}";
                }
            }

            return regresa;
        }

        private async Task<GuardarInspeccionBl26Response> EnviarInspeccionBl26Async(List<Respuesta> listaRespuesta, ResponderContext usuario, string idEmpresa, string empresa, string cadena)
        {
            long timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            Respuesta encabezado = listaRespuesta[0];

            GuardarInspeccionBl26Request requestBody = new GuardarInspeccionBl26Request
            {
                idEmpresa = Guid.Parse(idEmpresa),
                idLista = Guid.Parse(encabezado.idLista),
                idSucursal = Guid.Parse(encabezado.idSucursal),
                idUsuarioResponsable = Guid.Parse(encabezado.idUsuario),
                idAlumno = Guid.Parse(usuario.Id),
                idActivo = Guid.TryParse(encabezado.idActivo, out Guid activoGuid) ? activoGuid : null,
                idProgramacion = null,
                eventoLegacy = Guid.TryParse(encabezado.evento, out Guid eventoGuid) ? eventoGuid : null,
                respuestas = listaRespuesta.Select(item => new GuardarInspeccionBl26RespuestaItem
                {
                    idPregunta = Guid.Parse(item.idPregunta),
                    idPrograma = Guid.TryParse(item.idPrograma, out Guid programaGuid) ? programaGuid : null,
                    idTipoPregunta = item.idTipoPregunta,
                    RespuestaValor = item.respuestaValor,
                    Notas = item.notas,
                    Explicacion = item.explicacion,
                    Valor = item.valor,
                    Calificacion = item.calificacion,
                    obligatoria = item.obligatoria,
                    RespuestaCorrecta = item.RespuestaCorrecta,
                    latitud = item.latitud,
                    longitud = item.longitud,
                    stamp = timestamp.ToString(),
                    urlVideos = item.urlVideos ?? new List<string>(),
                    urlFotos = item.urlFotos ?? new List<string>()
                }).ToList()
            };

            string json = JsonConvert.SerializeObject(requestBody, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            string url = $"{Utilerias.UrlBase}api/Evaluaciones/GuardarInspeccionBL26?empresa={empresa}&cadena={cadena}";

            using var client = new HttpClient();
            client.Timeout = TimeSpan.FromMinutes(10);
            using var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);
            string responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(responseContent);
            }

            GuardarInspeccionBl26Response resultado = JsonConvert.DeserializeObject<GuardarInspeccionBl26Response>(responseContent);
            return resultado ?? new GuardarInspeccionBl26Response();
        }

        private sealed class ResponderContext
        {
            public string Id { get; init; } = string.Empty;
            public string Nombre { get; init; } = string.Empty;
            public string Correo { get; init; } = string.Empty;
        }

        //      private async Task<string> UploadFileToFirebaseStorage(string filePath, string fileType)
        //{

        //          //// Subir videos a Firebase Storage y obtener las URLs
        //          //List<string> videoUrls = new List<string>();
        //          //foreach (var videoPath in item.urlVideos)
        //          //{
        //          //    //var videoUrl = await UploadFileToFirebaseStorage(videoPath, "video");
        //          //    videoUrls.Add(videoPath);
        //          //}

        //          //// Subir fotos a Firebase Storage y obtener las URLs
        //          //List<string> photoUrls = new List<string>();
        //          //foreach (var photoPath in item.urlFotos)
        //          //{
        //          //   // var photoUrl = await UploadFileToFirebaseStorage(photoPath, "foto");
        //          //    photoUrls.Add(photoPath);
        //          //}
        //          //string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
        //          string empresa = HttpContext.Session.GetObject<String>("empresa");
        //          string idEmpresa = HttpContext.Session.GetObject<String>("idEmpresa");
        //          string cadena = HttpContext.Session.GetObject<String>("cadena");
        //          string emailUsuario = HttpContext.Session.GetObject<String>("emailUser");
        //          Stream reader2;
        //          var fileName = "";
        //          if (fileType == "foto")
        //	{
        //		int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
        //		string imag = filePath.Substring(posInicio);
        //		if (imag.Substring(imag.Length - 2) == "\")") imag = imag.Substring(0, imag.Length - 2);
        //		byte[] cont = Convert.FromBase64String(imag);
        //		reader2 = new MemoryStream(cont);
        //              fileName = Guid.NewGuid().ToString();
        //          }
        //	else if (fileType == "video")
        //	{
        //		int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
        //		string base64String = filePath.Substring(posInicio);
        //		byte[] byteArray = Convert.FromBase64String(base64String);
        //		reader2 = new MemoryStream(byteArray);
        //              fileName = Guid.NewGuid().ToString() + ".mp4";
        //          }
        //	else
        //	{
        //		throw new ArgumentException("Tipo de archivo no soportado", nameof(fileType));
        //	}

        //	// Configuración de Firebase Auth
        //	var config = new FirebaseAuthConfig
        //	{
        //		ApiKey = _configuration.GetValue<string>("fireBdata:fireApiKey"),
        //		AuthDomain = _configuration.GetValue<string>("fireBdata:fireAuthDomain"),
        //		Providers = new FirebaseAuthProvider[]
        //		{
        //	new EmailProvider()
        //		}
        //	};

        //	var client = new FirebaseAuthClient(config);
        //	var userCredential = await client.SignInWithEmailAndPasswordAsync(
        //		_configuration.GetValue<string>("fireBdata:fireUser"),
        //		_configuration.GetValue<string>("fireBdata:fireClave")
        //	);
        //	var token = await userCredential.User.GetIdTokenAsync();

        //	// Determinar la carpeta en Firebase Storage basada en el tipo de archivo
        //	string storageFolder = fileType switch
        //	{
        //		"video" => $"{idEmpresa.ToUpper()}/Videos",
        //		"foto" => $"{idEmpresa.ToUpper()}/Fotos",
        //		"archivo" => $"{idEmpresa.ToUpper()}/Archivos",
        //		_ => throw new ArgumentException("Tipo de archivo no soportado", nameof(fileType))
        //	};

        //	try
        //	{
        //		// Subir el archivo a Firebase Storage
        //		var firebaseStorage = new FirebaseStorage(
        //			_configuration.GetValue<string>("fireBdata:fireStorage"),
        //			new FirebaseStorageOptions
        //			{
        //				AuthTokenAsyncFactory = () => Task.FromResult(token),
        //				ThrowOnCancel = true
        //			});




        //		var task = firebaseStorage
        //			.Child(storageFolder)
        //			.Child(fileName)
        //			.PutAsync(reader2);

        //		// Obtener la URL de descarga
        //		var downloadUrl = await task;
        //		return downloadUrl;
        //	}
        //	catch (Exception ex)
        //	{
        //		throw new Exception($"Error al subir el archivo a Firebase Storage: {ex.Message}");
        //	}
        //}
        public async Task<string> IniciarSesionFirebase()
        {

            var config = new FirebaseAuthConfig
            {
                ApiKey = "AIzaSyDz8V94UZacxFAbdLOso7lxoxm5MmbtAMU",
                AuthDomain = "iecapp2.firebaseapp.com",
                Providers = [new EmailProvider()]
            };

            var client = new FirebaseAuthClient(config);
            var userCredential = await client.SignInWithEmailAndPasswordAsync(
                "hola@iecapp.com",
                "GtoAceI@2024"
            );
            var token = await userCredential.User.GetIdTokenAsync();

            return token;
        }

        //public async Task<List<RespuestaSubida>> UploadFileToFirebaseStorage2(string idEmpresa, string empresa, string cadena)
        //{
        //    //string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);


        //    string tokenFirebase = await IniciarSesionFirebase();

        //    List<ImagenTemporal> listaImgTemporal = HttpContext.Session.GetObject<List<ImagenTemporal>>("ListaImgTemporal") ?? new List<ImagenTemporal>();

        //    // Si no hay imágenes, retornar una lista vacía
        //    if (listaImgTemporal.Count == 0)
        //    {
        //        return new List<RespuestaSubida>();
        //    }

        //    // Lista para almacenar las respuestas (URLs e IdPregunta)
        //    List<RespuestaSubida> listaRespuestas = new List<RespuestaSubida>();

        //    foreach (var imagen in listaImgTemporal)
        //    {

        //        string filePath = imagen.FilePath;
        //        string fileType = imagen.FileType;
        //        string idPregunta = imagen.idPregunta;

        //        Stream reader2;
        //        var fileName = "";

        //        if (fileType == "foto")
        //        {
        //            int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
        //            string imag = filePath.Substring(posInicio);
        //            byte[] cont = Convert.FromBase64String(imag);
        //            reader2 = new MemoryStream(cont);
        //            fileName = Guid.NewGuid().ToString() + ".jpg"; // Asegúrate de agregar la extensión adecuada
        //        }
        //        else if (fileType == "video")
        //        {
        //            int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
        //            string base64String = filePath.Substring(posInicio);
        //            byte[] byteArray = Convert.FromBase64String(base64String);
        //            reader2 = new MemoryStream(byteArray);
        //            fileName = Guid.NewGuid().ToString() + ".mp4";
        //        }
        //        else
        //        {
        //            throw new ArgumentException("Tipo de archivo no soportado", nameof(fileType));
        //        }

        //        // Determinar la carpeta en Firebase Storage basada en el tipo de archivo
        //        string storageFolder = fileType switch
        //        {
        //            "video" => $"100/Videos",
        //            "foto" => $"100/Fotos",
        //            _ => throw new ArgumentException("Tipo de archivo no soportado", nameof(fileType))
        //        };

        //        try
        //        {
        //            // Subir el archivo a Firebase Storage
        //            var firebaseStorage = new FirebaseStorage(
        //                _configuration.GetValue<string>("fireBdata:fireStorage"),
        //                new FirebaseStorageOptions
        //                {
        //                    AuthTokenAsyncFactory = () => Task.FromResult(tokenFirebase),
        //                    ThrowOnCancel = true
        //                });

        //            var task = firebaseStorage
        //                .Child(storageFolder)
        //                .Child(fileName)
        //                .PutAsync(reader2);

        //            // Obtener la URL de descarga
        //            var downloadUrl = await task;

        //            // Agregar la URL y el idPregunta a la lista de respuestas
        //            listaRespuestas.Add(new RespuestaSubida
        //            {
        //                IdPregunta = idPregunta,
        //                UrlArchivo = downloadUrl,
        //                TipoArchivo = fileType
        //            });
        //        }
        //        catch (Exception ex)
        //        {
        //            throw new Exception($"Error al subir el archivo a Firebase Storage: {ex.Message}");
        //        }
        //    }

        //    // Retornar la lista de respuestas con URLs e idPregunta
        //    return listaRespuestas;
        //}
        public async Task<List<RespuestaSubida>> UploadFileToFirebaseStorage25(string idEmpresa, string empresa, string cadena, List<string> url, string tipo, string idPreguntaIMG)
        {
            //string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);


            string tokenFirebase = await IniciarSesionFirebase();


            // Lista para almacenar las respuestas (URLs e IdPregunta)
            List<RespuestaSubida> listaRespuestas = new List<RespuestaSubida>();

            foreach (var item in url)
            {

                string filePath = item;
                string fileType = tipo;
                string idPregunta = idPreguntaIMG;

                Stream reader2;
                var fileName = "";


                int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
                string imag = filePath.Substring(posInicio);
                byte[] cont = Convert.FromBase64String(imag);
                reader2 = new MemoryStream(cont);
                fileName = Guid.NewGuid().ToString() + ".jpg"; // Asegúrate de agregar la extensión adecuada


                //if (fileType == "foto")
                //{
                //    int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
                //    string imag = filePath.Substring(posInicio);
                //    byte[] cont = Convert.FromBase64String(imag);
                //    reader2 = new MemoryStream(cont);
                //    fileName = Guid.NewGuid().ToString() + ".jpg"; // Asegúrate de agregar la extensión adecuada
                //}
                //else if (fileType == "video")
                //{
                //    int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
                //    string base64String = filePath.Substring(posInicio);
                //    byte[] byteArray = Convert.FromBase64String(base64String);
                //    reader2 = new MemoryStream(byteArray);
                //    fileName = Guid.NewGuid().ToString() + ".mp4";
                //}
                //else
                //{
                //    throw new ArgumentException("Tipo de archivo no soportado", nameof(fileType));
                //}

                // Determinar la carpeta en Firebase Storage basada en el tipo de archivo
                string storageFolder = fileType switch
                {
                    "video" => $"1100/Videos",
                    "foto" => $"1100/Fotos",
                    _ => throw new ArgumentException("Tipo de archivo no soportado", nameof(fileType))
                };

                try
                {
                    // Subir el archivo a Firebase Storage
                    var firebaseStorage = new FirebaseStorage(
                        _configuration.GetValue<string>("fireBdata:fireStorage"),
                        new FirebaseStorageOptions
                        {
                            AuthTokenAsyncFactory = () => Task.FromResult(tokenFirebase),
                            ThrowOnCancel = true
                        });

                    var task = firebaseStorage
                        .Child(storageFolder)
                        .Child(fileName)
                        .PutAsync(reader2);

                    // Obtener la URL de descarga
                    var downloadUrl = await task;

                    // Agregar la URL y el idPregunta a la lista de respuestas
                    listaRespuestas.Add(new RespuestaSubida
                    {
                        IdPregunta = idPregunta,
                        UrlArchivo = downloadUrl,
                        TipoArchivo = fileType
                    });
                }
                catch (Exception ex)
                {
                    throw new Exception($"Error al subir el archivo a Firebase Storage: {ex.Message}");
                }
            }

            // Retornar la lista de respuestas con URLs e idPregunta
            return listaRespuestas;
        }

        [HttpPost]
        public void GuardarImagenBase64Local([FromBody] dynamic parametros)
        {
            try
            {
                string filePath = parametros.TryGetProperty("filePath", out JsonElement filePathElement) ? filePathElement.GetString() : null;
                string fileType = parametros.TryGetProperty("fileType", out JsonElement fileTypeElement) ? fileTypeElement.GetString() : null;
                string idPregunta = parametros.TryGetProperty("idPregunta", out JsonElement idPreguntaElement) ? idPreguntaElement.GetString() : null;

                List<ImagenTemporal> listaImgTemporal = HttpContext.Session.GetObject<List<ImagenTemporal>>("ListaImgTemporal") ?? new List<ImagenTemporal>();

                ImagenTemporal nuevaImagen = new ImagenTemporal
                {
                    FilePath = filePath,
                    FileType = fileType,
                    idPregunta = idPregunta
                };

                listaImgTemporal.Add(nuevaImagen);
                HttpContext.Session.SetObject("ListaImgTemporal", listaImgTemporal);
            }
            catch (Exception ex)
            {
                // Manejar el error aquí
                Console.WriteLine($"Error al guardar imagen: {ex.Message}");
            }
        }

        //Funcion para cargar video o imagenes a firebase y regreasr la url
        //[HttpPost]
        //public async Task<ActionResult> UploadVideoToFirebaseStorage([FromBody] dynamic parametros)
        //{
        //    try
        //    {
        //        // Validar los parámetros recibidos


        //        string filePath = parametros.TryGetProperty("filePath", out JsonElement filePathElement) ? filePathElement.GetString() : null;
        //        string fileType = parametros.TryGetProperty("fileType", out JsonElement fileTypeElement) ? fileTypeElement.GetString() : null;
        //        string tokenFirebase = parametros.TryGetProperty("tokenFirebase", out JsonElement tokenFirebaseElement) ? tokenFirebaseElement.GetString() : null;

        //        if (string.IsNullOrEmpty(filePath) || string.IsNullOrEmpty(fileType) || string.IsNullOrEmpty(tokenFirebase))
        //        {
        //            return BadRequest("Los parámetros filePath, fileType o tokenFirebase están vacíos o no son válidos.");
        //        }

        //        var token = tokenFirebase;
        //       // string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);

        //        Stream reader2;
        //        var fileName = "";

        //        try
        //        {
        //            if (fileType == "foto")
        //            {
        //                int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
        //                string imag = filePath.Substring(posInicio);
        //                if (imag.EndsWith("\")")) imag = imag.Substring(0, imag.Length - 2);
        //                byte[] cont = Convert.FromBase64String(imag);
        //                reader2 = new MemoryStream(cont);
        //                fileName = Guid.NewGuid().ToString();
        //            }
        //            else if (fileType == "video")
        //            {
        //                int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
        //                string base64String = filePath.Substring(posInicio);
        //                byte[] byteArray = Convert.FromBase64String(base64String);
        //                reader2 = new MemoryStream(byteArray);
        //                fileName = Guid.NewGuid().ToString() + ".mp4";
        //            }
        //            else
        //            {
        //                return BadRequest("Tipo de archivo no soportado.");
        //            }
        //        }
        //        catch (FormatException ex)
        //        {
        //            return BadRequest($"Error en la conversión de base64: {ex.Message}");
        //        }

        //        try
        //        {
        //            // Determinar la carpeta en Firebase Storage basada en el tipo de archivo
        //            string storageFolder = fileType switch
        //            {
        //                "video" => $"12100/Videos",
        //                "foto" => $"12100/Fotos",
        //                "archivo" => $"12100/Archivos",
        //                _ => throw new ArgumentException("Tipo de archivo no soportado", nameof(fileType))
        //            };

        //            // Configuración de Firebase Auth y carga de archivo
        //            var firebaseStorage = new FirebaseStorage(
        //                _configuration.GetValue<string>("fireBdata:fireStorage"),
        //                new FirebaseStorageOptions
        //                {
        //                    AuthTokenAsyncFactory = () => Task.FromResult(token),
        //                    ThrowOnCancel = true
        //                });

        //            var task = firebaseStorage
        //                .Child(storageFolder)
        //                .Child(fileName)
        //                .PutAsync(reader2);

        //            // Obtener la URL de descarga
        //            var downloadUrl = await task;

        //            return Json(new { d = downloadUrl });
        //        }
        //        catch (Exception ex)
        //        {
        //            return StatusCode(500, $"Error al subir el archivo a Firebase Storage: {ex.Message}");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, $"Error inesperado: {ex.Message}");
        //    }
        //}

        [HttpPost]
        public async Task<ActionResult> UploadVideoToFirebaseStorage(IFormFile file, string idPregunta, string tokenFirebase)
        {
            if (file == null || file.Length == 0 || string.IsNullOrEmpty(tokenFirebase))
            {
                return BadRequest("No se recibió un archivo válido o el token de Firebase es inválido.");
            }

            try
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName); // Asignar un nombre único al archivo

                // Definir la carpeta de almacenamiento en Firebase para videos
                string storageFolder = $"12100/Videos";

                // Leer el archivo a un stream
                using (var stream = file.OpenReadStream())
                {
                    var firebaseStorage = new FirebaseStorage(
                        _configuration.GetValue<string>("fireBdata:fireStorage"),
                        new FirebaseStorageOptions
                        {
                            AuthTokenAsyncFactory = () => Task.FromResult(tokenFirebase),
                            ThrowOnCancel = true
                        });

                    // Subir el archivo a Firebase Storage
                    var task = firebaseStorage
                        .Child(storageFolder)
                        .Child(fileName)
                        .PutAsync(stream);

                    // Obtener la URL de descarga
                    var downloadUrl = await task;

                    return Json(new { d = downloadUrl });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al subir el archivo a Firebase Storage: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult> UploadImageToFirebaseStorage(IFormFile file, string idPregunta, string tokenFirebase)
        {
            if (file == null || file.Length == 0 || string.IsNullOrEmpty(tokenFirebase))
            {
                return BadRequest("No se recibió un archivo válido o el token de Firebase es inválido.");
            }

            try
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName); // Asignar un nombre único al archivo

                // Definir la carpeta de almacenamiento en Firebase para imágenes
                string storageFolder = $"12100/Fotos";

                // Leer el archivo a un stream
                using (var stream = file.OpenReadStream())
                {
                    var firebaseStorage = new FirebaseStorage(
                        _configuration.GetValue<string>("fireBdata:fireStorage"),
                        new FirebaseStorageOptions
                        {
                            AuthTokenAsyncFactory = () => Task.FromResult(tokenFirebase),
                            ThrowOnCancel = true
                        });

                    // Subir el archivo a Firebase Storage
                    var task = firebaseStorage
                        .Child(storageFolder)
                        .Child(fileName)
                        .PutAsync(stream);

                    // Obtener la URL de descarga
                    var downloadUrl = await task;

                    return Json(new { d = downloadUrl });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al subir el archivo a Firebase Storage: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult> UploadAudioToFirebaseStorage(IFormFile file, string idPregunta, string tokenFirebase)
        {
            if (file == null || file.Length == 0 || string.IsNullOrEmpty(tokenFirebase))
            {
                return BadRequest("No se recibió un archivo válido o el token de Firebase es inválido.");
            }

            try
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                string storageFolder = $"12100/Audios";

                using (var stream = file.OpenReadStream())
                {
                    var firebaseStorage = new FirebaseStorage(
                        _configuration.GetValue<string>("fireBdata:fireStorage"),
                        new FirebaseStorageOptions
                        {
                            AuthTokenAsyncFactory = () => Task.FromResult(tokenFirebase),
                            ThrowOnCancel = true
                        });

                    var task = firebaseStorage
                        .Child(storageFolder)
                        .Child(fileName)
                        .PutAsync(stream);

                    var downloadUrl = await task;

                    return Json(new { d = downloadUrl });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al subir el archivo a Firebase Storage: {ex.Message}");
            }
        }


    }
}
