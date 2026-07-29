using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Web;
using checklist.Clases;
using checklist.Extensions;
using checklist.Models.EstrcuturaCombo;
using checklist.Models.Operadores;
using checklist.Models.Roles;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Serialization;
using Newtonsoft.Json;

namespace checklist.Controllers.Operadores
{
    public class OperadoresController : Controller
    {
        private readonly IHttpClientFactory _clientFactory;
        private static readonly JsonSerializerSettings CamelCaseJson = new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            NullValueHandling = NullValueHandling.Ignore
        };

        public OperadoresController(IHttpClientFactory clientFactory)
        {
            _clientFactory = clientFactory;
        }

        public IActionResult Index()
        {
            if (IsOperatorSession())
            {
                return RedirectToAction("RecoleccionesBL26", "ContestarLista");
            }

            return View();
        }

        public async Task<IActionResult> Inicializa(string idEmpresa, string cadena, string empresa)
        {
            if (IsOperatorSession())
            {
                return Json(new { d = "Ok", perm = false, accessDenied = true });
            }

            string idRol = Utilerias.IdRol;
            Opciones opcion = await Utilerias.GetOpcion("04001001", idEmpresa, idRol, empresa, cadena);
            return Json(new { d = "Ok", perm = opcion?.Permisos?.Escritura == 1 });
        }

        public async Task<IActionResult> GetSucursales(string searchTerm = "")
        {
            if (IsOperatorSession())
            {
                return Json(new { d = new List<select2Data>() });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string empresa = ResolveEmpresa();

            searchTerm = JsonConvert.DeserializeObject<string>(searchTerm) ?? string.Empty;
            string extra = string.IsNullOrWhiteSpace(searchTerm) ? string.Empty : $"&nombre={Uri.EscapeDataString(searchTerm)}";
            string url = $"{Utilerias.UrlBase}api/Sucursal/GetComboSucursales?idEmpresa={idEmpresa}&empresa={empresa}{extra}&cadena={cadena}";

            List<DataPair> respuesta = await ExecuteGetAsync<List<DataPair>>(url) ?? new List<DataPair>();
            List<select2Data> result = respuesta
                .Select(resp => new select2Data
                {
                    id = resp.value,
                    text = resp.name
                })
                .ToList();

            return Json(new { d = result });
        }

        public async Task<IActionResult> GetDataOperadores(string busqueda = "", string idSucursal = "", string estado = "")
        {
            if (IsOperatorSession())
            {
                return Content(@"{""sEcho"":1,""iTotalRecords"":0,""iTotalDisplayRecords"":0,""aaData"":[]}", "application/json");
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string idRol = Utilerias.IdRol;
            string empresa = ResolveEmpresa();
            Opciones opcion = await Utilerias.GetOpcion("04001001", idEmpresa, idRol, empresa, cadena);

            StringBuilder url = new StringBuilder($"{Utilerias.UrlBase}api/Operadores/ObtenerOperadores?idEmpresa={idEmpresa}&cadena={cadena}");
            if (!string.IsNullOrWhiteSpace(busqueda))
            {
                url.Append($"&busqueda={Uri.EscapeDataString(busqueda)}");
            }

            if (Guid.TryParse(idSucursal, out Guid idSucursalGuid) && idSucursalGuid != Guid.Empty)
            {
                url.Append($"&idSucursal={idSucursalGuid}");
            }

            if (!string.IsNullOrWhiteSpace(estado))
            {
                url.Append($"&estado={Uri.EscapeDataString(estado)}");
            }

            List<respOperador> respuesta = await ExecuteGetAsync<List<respOperador>>(url.ToString()) ?? new List<respOperador>();
            List<respOperador> respuestaOrden = respuesta.OrderBy(item => item.NombreCompleto).ToList();

            StringBuilder sb = new StringBuilder();
            bool hasMoreRecords = false;
            sb.Append(@"{""sEcho"":1,");
            sb.Append(@"""iTotalRecords"":" + respuestaOrden.Count + ",");
            sb.Append(@"""iTotalDisplayRecords"":" + respuestaOrden.Count + ",");
            sb.Append(@"""operadores"":" + JsonConvert.SerializeObject(respuestaOrden, CamelCaseJson) + ",");
            sb.Append(@"""aaData"":[");

            foreach (respOperador resp in respuestaOrden)
            {
                if (hasMoreRecords)
                {
                    sb.Append(",");
                }

                sb.Append("[");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(BuildActions(resp, opcion?.Permisos?.Escritura == 1)) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.NombreCompleto) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Correo) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Sucursales) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Estado) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.FechaAlta?.ToString("dd/MM/yyyy") ?? string.Empty) + "\"");
                sb.Append("]");
                hasMoreRecords = true;
            }

            sb.Append("]}");
            return Content(sb.ToString(), "application/json");
        }

        public async Task<IActionResult> GetOperador(string idOperador)
        {
            if (IsOperatorSession())
            {
                return Content(@"{""d"":""""}", "application/json");
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Operadores/ObtenerOperador?idEmpresa={idEmpresa}&idOperador={idOperador}&cadena={cadena}";
            respOperador? operador = await ExecuteGetAsync<respOperador>(url);

            if (operador == null)
            {
                return Content(@"{""d"":""""}", "application/json");
            }

            string payload = JsonConvert.SerializeObject(new { d = operador }, CamelCaseJson);
            return Content(payload, "application/json");
        }

        public async Task<IActionResult> CrearOperador([FromBody] JsonElement parametros)
        {
            if (IsOperatorSession())
            {
                return Json(new { d = "No tienes permiso para administrar operadores." });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string empresa = ResolveEmpresa();
            string correoActor = ResolveCorreo();
            string url = $"{Utilerias.UrlBase}api/Operadores/Crear?idEmpresa={idEmpresa}&cadena={cadena}&empresa={Uri.EscapeDataString(empresa)}";

            var payload = new
            {
                nombre = ReadString(parametros, "nombre"),
                apellidoPaterno = ReadString(parametros, "apellidoPaterno"),
                apellidoMaterno = ReadString(parametros, "apellidoMaterno"),
                correo = ReadString(parametros, "correo"),
                password = ReadString(parametros, "password"),
                confirmPassword = ReadString(parametros, "confirmPassword"),
                sucursales = ReadArray(parametros, "sucursales"),
                correoActor
            };

            respOperadorOperacion? respuesta = await ExecuteJsonAsync<respOperadorOperacion>(HttpMethod.Post, url, payload);
            return Json(new
            {
                d = SanitizeOperatorMessage(respuesta?.Mensaje, "No fue posible registrar al operador."),
                warning = respuesta?.Advertencia ?? string.Empty
            });
        }

        public async Task<IActionResult> BuscarCandidatoIdentidadDual(string correo = "")
        {
            if (IsOperatorSession())
            {
                return Json(new { d = new respOperadorIdentidadDualCandidato { Mensaje = "No tienes permiso para administrar operadores." } });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Operadores/ObtenerCandidatoIdentidadDual?idEmpresa={idEmpresa}&cadena={cadena}&correo={Uri.EscapeDataString(correo ?? string.Empty)}";
            respOperadorIdentidadDualCandidato? candidato = await ExecuteGetAsync<respOperadorIdentidadDualCandidato>(url);

            return Json(new
            {
                d = candidato ?? new respOperadorIdentidadDualCandidato
                {
                    Mensaje = "No fue posible completar la asignación. Revisa la información de la persona."
                }
            });
        }

        public async Task<IActionResult> VincularIdentidadExistente([FromBody] JsonElement parametros)
        {
            if (IsOperatorSession())
            {
                return Json(new { d = "No tienes permiso para administrar operadores." });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string empresa = ResolveEmpresa();
            string correoActor = ResolveCorreo();
            string url = $"{Utilerias.UrlBase}api/Operadores/VincularIdentidadExistente?idEmpresa={idEmpresa}&cadena={cadena}&empresa={Uri.EscapeDataString(empresa)}";

            var payload = new
            {
                correo = ReadString(parametros, "correo"),
                sucursales = ReadArray(parametros, "sucursales"),
                correoActor
            };

            respOperadorOperacion? respuesta = await ExecuteJsonAsync<respOperadorOperacion>(HttpMethod.Post, url, payload);
            return Json(new
            {
                d = SanitizeOperatorMessage(respuesta?.Mensaje, "No fue posible completar el proceso. Intenta nuevamente."),
                warning = respuesta?.Advertencia ?? string.Empty
            });
        }

        public async Task<IActionResult> ActualizarOperador([FromBody] JsonElement parametros)
        {
            if (IsOperatorSession())
            {
                return Json(new { d = "No tienes permiso para administrar operadores." });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string empresa = ResolveEmpresa();
            string correoActor = ResolveCorreo();
            string url = $"{Utilerias.UrlBase}api/Operadores/Actualizar?idEmpresa={idEmpresa}&cadena={cadena}&empresa={Uri.EscapeDataString(empresa)}";

            var payload = new
            {
                idOperador = ReadString(parametros, "idOperador"),
                nombre = ReadString(parametros, "nombre"),
                apellidoPaterno = ReadString(parametros, "apellidoPaterno"),
                apellidoMaterno = ReadString(parametros, "apellidoMaterno"),
                sucursales = ReadArray(parametros, "sucursales"),
                versionRow = ReadString(parametros, "versionRow"),
                correoActor
            };

            respOperadorOperacion? respuesta = await ExecuteJsonAsync<respOperadorOperacion>(HttpMethod.Put, url, payload);
            return Json(new
            {
                d = SanitizeOperatorMessage(respuesta?.Mensaje, "No fue posible actualizar al operador."),
                versionRow = respuesta?.VersionRow ?? string.Empty
            });
        }

        public async Task<IActionResult> Suspender([FromBody] JsonElement parametros)
        {
            return Json(new { d = await CambiarEstadoOperadorAsync("Suspender", parametros) });
        }

        public async Task<IActionResult> Reactivar([FromBody] JsonElement parametros)
        {
            return Json(new { d = await CambiarEstadoOperadorAsync("Reactivar", parametros) });
        }

        public async Task<IActionResult> EnviarRecuperacion([FromBody] JsonElement parametros)
        {
            if (IsOperatorSession())
            {
                return Json(new { d = "No tienes permiso para administrar operadores." });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Operadores/EnviarRecuperacion?idEmpresa={idEmpresa}&cadena={cadena}";

            var payload = new
            {
                idOperador = ReadString(parametros, "idOperador")
            };

            respOperadorOperacion? respuesta = await ExecuteJsonAsync<respOperadorOperacion>(HttpMethod.Post, url, payload);
            return Json(new { d = SanitizeOperatorMessage(respuesta?.Mensaje, "No fue posible enviar la recuperación.") });
        }

        public async Task<IActionResult> ReenviarVerificacion([FromBody] JsonElement parametros)
        {
            if (IsOperatorSession())
            {
                return Json(new { d = "No tienes permiso para administrar operadores." });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Operadores/ReenviarVerificacion?idEmpresa={idEmpresa}&cadena={cadena}";

            var payload = new
            {
                idOperador = ReadString(parametros, "idOperador")
            };

            respOperadorOperacion? respuesta = await ExecuteJsonAsync<respOperadorOperacion>(HttpMethod.Post, url, payload);
            return Json(new { d = SanitizeOperatorMessage(respuesta?.Mensaje, "No fue posible reenviar el correo. Intenta nuevamente.") });
        }

        private async Task<object> CambiarEstadoOperadorAsync(string accion, JsonElement parametros)
        {
            if (IsOperatorSession())
            {
                return new { mensaje = "No tienes permiso para administrar operadores.", warning = string.Empty };
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string empresa = ResolveEmpresa();
            string correoActor = ResolveCorreo();
            string url = $"{Utilerias.UrlBase}api/Operadores/{accion}?idEmpresa={idEmpresa}&cadena={cadena}&empresa={Uri.EscapeDataString(empresa)}";

            var payload = new
            {
                idOperador = ReadString(parametros, "idOperador"),
                versionRow = ReadString(parametros, "versionRow"),
                correoActor
            };

            respOperadorOperacion? respuesta = await ExecuteJsonAsync<respOperadorOperacion>(HttpMethod.Put, url, payload);
            return new
            {
                mensaje = SanitizeOperatorMessage(respuesta?.Mensaje, "No fue posible completar la operación."),
                warning = respuesta?.Advertencia ?? string.Empty,
                versionRow = respuesta?.VersionRow ?? string.Empty
            };
        }

        private string BuildActions(respOperador operador, bool canWrite)
        {
            if (!canWrite)
            {
                return string.Empty;
            }

            List<string> acciones = new List<string>
            {
                $"<a href='javascript:EditarOperador(\"{operador.IdOperador}\")' data-toggle='tooltip' title='Editar'><i class='fa fa-edit'></i></a>",
                $"<a href='javascript:EnviarRecuperacion(\"{operador.IdOperador}\")' data-toggle='tooltip' title='Restablecer contraseña'><i class='fa fa-key'></i></a>"
            };

            if (string.Equals(operador.Estado, "Pendiente de verificar", StringComparison.OrdinalIgnoreCase))
            {
                acciones.Add($"<a href='javascript:ReenviarVerificacion(\"{operador.IdOperador}\")' data-toggle='tooltip' title='Reenviar verificación'><i class='fa fa-envelope'></i></a>");
            }

            if (operador.Activo)
            {
                acciones.Add($"<a href='javascript:SuspendOp(\"{operador.IdOperador}\",\"{operador.VersionRow}\")' data-toggle='tooltip' title='Suspender'><i class='fa fa-ban'></i></a>");
            }
            else
            {
                acciones.Add($"<a href='javascript:ReactivaOp(\"{operador.IdOperador}\",\"{operador.VersionRow}\")' data-toggle='tooltip' title='Reactivar'><i class='fa fa-check'></i></a>");
            }

            return string.Join("&nbsp;&nbsp;", acciones);
        }

        private bool IsOperatorSession()
        {
            string accountType = HttpContext.Session.GetString("accountType")
                ?? User.FindFirstValue("account_type")
                ?? string.Empty;

            return string.Equals(accountType, "Operador", StringComparison.OrdinalIgnoreCase);
        }

        private string ResolveIdEmpresa()
        {
            return ResolveSessionValue("idEmpresa")
                ?? User.FindFirstValue(ClaimTypes.SerialNumber)
                ?? Request.Query["idEmpresa"].FirstOrDefault()
                ?? string.Empty;
        }

        private string ResolveCadena()
        {
            return ResolveSessionValue("cadena")
                ?? User.FindFirstValue(ClaimTypes.Uri)
                ?? Request.Query["cadena"].FirstOrDefault()
                ?? string.Empty;
        }

        private string ResolveEmpresa()
        {
            return ResolveSessionValue("empresa")
                ?? User.FindFirstValue(ClaimTypes.Sid)
                ?? Request.Query["empresa"].FirstOrDefault()
                ?? string.Empty;
        }

        private string ResolveCorreo()
        {
            return ResolveSessionValue("emailUser")
                ?? User.FindFirstValue(ClaimTypes.Email)
                ?? Request.Query["correo"].FirstOrDefault()
                ?? string.Empty;
        }

        private string? ResolveSessionValue(string key)
        {
            string? raw = HttpContext.Session.GetString(key);
            if (!string.IsNullOrWhiteSpace(raw))
            {
                return NormalizeSerializedValue(raw);
            }

            string? serialized = HttpContext.Session.GetObject<string>(key);
            if (!string.IsNullOrWhiteSpace(serialized))
            {
                return NormalizeSerializedValue(serialized);
            }

            return null;
        }

        private static string NormalizeSerializedValue(string value)
        {
            string normalized = value?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(normalized))
            {
                return string.Empty;
            }

            try
            {
                if (normalized.StartsWith("\"") && normalized.EndsWith("\""))
                {
                    string? deserialized = JsonConvert.DeserializeObject<string>(normalized);
                    if (!string.IsNullOrWhiteSpace(deserialized))
                    {
                        return deserialized.Trim();
                    }
                }
            }
            catch
            {
            }

            return normalized.Trim('"').Trim();
        }

        private static string ReadString(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out JsonElement property)
                ? property.GetString() ?? string.Empty
                : string.Empty;
        }

        private static List<string> ReadArray(JsonElement element, string propertyName)
        {
            if (!element.TryGetProperty(propertyName, out JsonElement property) || property.ValueKind != JsonValueKind.Array)
            {
                return new List<string>();
            }

            return property.EnumerateArray()
                .Select(item => item.GetString() ?? string.Empty)
                .Where(item => !string.IsNullOrWhiteSpace(item))
                .ToList();
        }

        private async Task<T?> ExecuteGetAsync<T>(string url)
        {
            using HttpClient client = _clientFactory.CreateClient();
            HttpResponseMessage response = await client.GetAsync(url);
            string responseContent = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                return default;
            }

            return JsonConvert.DeserializeObject<T>(responseContent);
        }

        private async Task<T?> ExecuteJsonAsync<T>(HttpMethod method, string url, object payload)
        {
            using HttpClient client = _clientFactory.CreateClient();
            HttpRequestMessage request = new HttpRequestMessage(method, url)
            {
                Content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);
            string responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                respOperadorOperacion? errorResponse = JsonConvert.DeserializeObject<respOperadorOperacion>(responseContent);
                if (errorResponse != null)
                {
                    return (T?)(object)errorResponse;
                }

                return JsonConvert.DeserializeObject<T>(responseContent);
            }

            return JsonConvert.DeserializeObject<T>(responseContent);
        }

        private static string SanitizeOperatorMessage(string? message, string fallback)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                return fallback;
            }

            string normalized = message.Trim();
            string[] technicalMarkers =
            {
                "Response status code",
                "Bad Request",
                "Internal Server Error",
                "Firebase",
                "SQL",
                "stack trace",
                "UID",
                "JSON",
                "Exception"
            };

            return technicalMarkers.Any(marker => normalized.Contains(marker, StringComparison.OrdinalIgnoreCase))
                ? fallback
                : normalized;
        }
    }
}
