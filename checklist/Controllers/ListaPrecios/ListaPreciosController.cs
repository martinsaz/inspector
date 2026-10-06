using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using checklist.Clases;
using checklist.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace checklist.Controllers.ListaPrecios
{
    [Authorize]
    [Route("[controller]")]
    public class ListaPreciosController : Controller
    {
        private const string ProxyEmpresaIdHeader = "X-ProductosServicios-Proxy-EmpresaId";
        private const string ProxyEmpresaKeyHeader = "X-ProductosServicios-Proxy-Empresa";
        private const string ProxyUsuarioIdHeader = "X-ProductosServicios-Proxy-UsuarioId";
        private const string ProxyTimestampHeader = "X-ProductosServicios-Proxy-Timestamp";
        private const string ProxySignatureHeader = "X-ProductosServicios-Proxy-Signature";
        private const string SuperAdminRoleCookie = "chkRoleName";
        private const string ListaPreciosPermissionCode = "05001008";
        private const string ListaPreciosAdministrarPermissionCode = "05001009";

        private readonly IHttpClientFactory _clientFactory;
        private readonly IConfiguration _configuration;

        public ListaPreciosController(IHttpClientFactory clientFactory, IConfiguration configuration)
        {
            _clientFactory = clientFactory;
            _configuration = configuration;
        }

        [HttpGet("Index")]
        public IActionResult Index()
        {
            IActionResult? auth = AuthorizeListaPreciosMvc();
            if (auth != null)
            {
                return auth;
            }

            ViewBag.PuedeAdministrarListaPrecios = CanAdministrarListaPreciosMvc();
            return View("~/Views/ListaPrecios/Index.cshtml");
        }

        [HttpGet("ObtenerCombos")]
        public Task<IActionResult> ObtenerCombos() => ProxyGetAsync("Combos");

        [HttpGet("Consultar")]
        public Task<IActionResult> Consultar() => ProxyGetAsync("Consulta");

        [HttpGet("Inventario")]
        public Task<IActionResult> Inventario() => ProxyGetAsync("Inventario");

        [HttpGet("PreciosProducto")]
        public Task<IActionResult> PreciosProducto() => ProxyGetAsync("PreciosProducto");

        [HttpGet("Editor")]
        public Task<IActionResult> Editor() => ProxyGetAsync("Editor");

        [HttpPost("Resolver")]
        public Task<IActionResult> Resolver() => ProxyPostAsync("Resolver", requireWrite: false);

        [HttpPost("Preview")]
        public Task<IActionResult> Preview() => ProxyPostAsync("Preview", requireWrite: false);

        [HttpPost("GuardarPrecio")]
        public Task<IActionResult> GuardarPrecio() => ProxyPostAsync("GuardarPrecio", requireWrite: true);

        [HttpPost("PreviewMatriz")]
        public Task<IActionResult> PreviewMatriz() => ProxyPostAsync("PreviewMatriz", requireWrite: false);

        [HttpPost("GuardarMatriz")]
        public Task<IActionResult> GuardarMatriz() => ProxyPostAsync("GuardarMatriz", requireWrite: true);

        [HttpPost("PreviewAjusteMasivo")]
        public Task<IActionResult> PreviewAjusteMasivo() => ProxyPostAsync("PreviewAjusteMasivo", requireWrite: false);

        [HttpPost("EjecutarAjusteMasivo")]
        public Task<IActionResult> EjecutarAjusteMasivo() => ProxyPostAsync("EjecutarAjusteMasivo", requireWrite: true);

        [HttpPost("PreviewCopiarLista")]
        public Task<IActionResult> PreviewCopiarLista() => ProxyPostAsync("PreviewCopiarLista", requireWrite: false);

        [HttpPost("EjecutarCopiarLista")]
        public Task<IActionResult> EjecutarCopiarLista() => ProxyPostAsync("EjecutarCopiarLista", requireWrite: true);

        [HttpPost("PreviewDescuentoMarca")]
        public Task<IActionResult> PreviewDescuentoMarca() => ProxyPostAsync("PreviewDescuentoMarca", requireWrite: false);

        [HttpPost("EjecutarDescuentoMarca")]
        public Task<IActionResult> EjecutarDescuentoMarca() => ProxyPostAsync("EjecutarDescuentoMarca", requireWrite: true);

        [HttpPost("Historial")]
        public Task<IActionResult> Historial() => ProxyPostAsync("Historial", requireWrite: false);

        [HttpGet("HistorialConsulta")]
        public Task<IActionResult> HistorialConsulta() => ProxyGetAsync("HistorialConsulta");

        [HttpPost("BajaPrecio/{idPrecio:guid}")]
        public Task<IActionResult> BajaPrecio(Guid idPrecio) => ProxyPostAsync($"BajaPrecio/{idPrecio:D}", requireWrite: true);

        private async Task<IActionResult> ProxyGetAsync(string actionName)
        {
            IActionResult? auth = AuthorizeListaPreciosMvc();
            if (auth != null)
            {
                return auth;
            }

            using HttpRequestMessage request = new(HttpMethod.Get, BuildApiUrl(actionName));
            AddProxyHeaders(request);
            using HttpClient client = _clientFactory.CreateClient();
            using HttpResponseMessage response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
            string content = await response.Content.ReadAsStringAsync();
            return new ContentResult
            {
                Content = string.IsNullOrWhiteSpace(content) ? "{}" : content,
                ContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json",
                StatusCode = (int)response.StatusCode
            };
        }

        private async Task<IActionResult> ProxyPostAsync(string actionName, bool requireWrite)
        {
            IActionResult? auth = AuthorizeListaPreciosMvc();
            if (auth != null)
            {
                return auth;
            }

            if (requireWrite && !CanAdministrarListaPreciosMvc())
            {
                return Forbid();
            }

            Request.EnableBuffering();
            using StreamReader reader = new(Request.Body, Encoding.UTF8, detectEncodingFromByteOrderMarks: false, leaveOpen: true);
            string body = await reader.ReadToEndAsync();
            Request.Body.Position = 0;

            using HttpRequestMessage request = new(HttpMethod.Post, BuildApiUrl(actionName))
            {
                Content = new StringContent(string.IsNullOrWhiteSpace(body) ? "{}" : body, Encoding.UTF8, "application/json")
            };
            AddProxyHeaders(request);
            using HttpClient client = _clientFactory.CreateClient();
            using HttpResponseMessage response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
            string content = await response.Content.ReadAsStringAsync();
            return new ContentResult
            {
                Content = string.IsNullOrWhiteSpace(content) ? "{}" : content,
                ContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json",
                StatusCode = (int)response.StatusCode
            };
        }

        private string BuildApiUrl(string actionName)
        {
            List<KeyValuePair<string, string?>> query = new();
            foreach (var item in Request.Query)
            {
                if (string.Equals(item.Key, "idEmpresa", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                foreach (string? value in item.Value)
                {
                    query.Add(new KeyValuePair<string, string?>(item.Key, value));
                }
            }

            query.Add(new KeyValuePair<string, string?>("idEmpresa", ResolveIdEmpresa()));
            string queryString = QueryString.Create(query).ToUriComponent();
            return $"{Utilerias.UrlBase}api/ListaPrecios/{actionName}{queryString}";
        }

        private void AddProxyHeaders(HttpRequestMessage request)
        {
            string idEmpresa = ResolveIdEmpresa();
            string empresa = ResolveEmpresa();
            string usuarioId = ResolveUsuarioId() ?? string.Empty;
            string timestamp = DateTimeOffset.UtcNow.ToString("O");
            string secret = _configuration["fireBdata:fireClave"] ?? string.Empty;
            string signature = ComputeSignature(secret, idEmpresa, empresa, usuarioId, timestamp);

            request.Headers.TryAddWithoutValidation(ProxyEmpresaIdHeader, idEmpresa);
            request.Headers.TryAddWithoutValidation(ProxyEmpresaKeyHeader, empresa);
            request.Headers.TryAddWithoutValidation(ProxyUsuarioIdHeader, usuarioId);
            request.Headers.TryAddWithoutValidation(ProxyTimestampHeader, timestamp);
            request.Headers.TryAddWithoutValidation(ProxySignatureHeader, signature);
        }

        private static string ComputeSignature(string secret, string empresaId, string empresa, string usuarioId, string timestamp)
        {
            using HMACSHA256 hmac = new(Encoding.UTF8.GetBytes(secret));
            string payload = string.Join('\n', empresaId.Trim(), empresa.Trim().ToUpperInvariant(), usuarioId.Trim(), timestamp.Trim());
            return Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload)));
        }

        private string ResolveIdEmpresa()
        {
            return NormalizeEmpresaId(ResolveSessionValue("idEmpresa"))
                ?? NormalizeEmpresaId(User.FindFirstValue(ClaimTypes.SerialNumber))
                ?? string.Empty;
        }

        private string ResolveEmpresa()
        {
            return ResolveSessionValue("empresa")
                ?? User.FindFirstValue(ClaimTypes.Sid)
                ?? string.Empty;
        }

        private string? ResolveUsuarioId()
        {
            string? claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return !string.IsNullOrWhiteSpace(claimValue) && claimValue.Length <= 256 && !claimValue.Any(char.IsControl)
                ? claimValue.Trim()
                : null;
        }

        private string? ResolveSessionValue(string key)
        {
            string? raw = HttpContext.Session.GetString(key);
            if (!string.IsNullOrWhiteSpace(raw))
            {
                return NormalizeSerializedValue(raw);
            }

            string? serialized = HttpContext.Session.GetObject<string>(key);
            return string.IsNullOrWhiteSpace(serialized) ? null : NormalizeSerializedValue(serialized);
        }

        private static string? NormalizeEmpresaId(string? value)
        {
            string? normalized = NormalizeSerializedValue(value);
            return Guid.TryParse(normalized, out Guid id) && id != Guid.Empty ? id.ToString() : null;
        }

        private static string? NormalizeSerializedValue(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            string current = value.Trim();
            for (int i = 0; i < 2 && current.Length >= 2 && current[0] == '"' && current[^1] == '"'; i++)
            {
                try
                {
                    current = JsonSerializer.Deserialize<string>(current)?.Trim() ?? current.Trim('"');
                }
                catch (JsonException)
                {
                    current = current.Trim('"');
                }
            }

            return string.IsNullOrWhiteSpace(current) ? null : current;
        }

        private IActionResult? AuthorizeListaPreciosMvc()
        {
            if (IsSuperAdminSession() &&
                ProveeduriaMenuBuilder.HasOfficialSuperAdminPermission(ListaPreciosPermissionCode, requireWrite: false))
            {
                return null;
            }

            try
            {
                string permisos = Request.Cookies["prmmnu"] ?? string.Empty;
                JsonNode? permission = string.IsNullOrWhiteSpace(permisos)
                    ? null
                    : FindPermission(JsonNode.Parse(permisos), ListaPreciosPermissionCode);
                bool hasAccess = permission?["Permisos"]?["Acceso"]?.GetValue<int>() == 1 ||
                                 permission?["permisos"]?["acceso"]?.GetValue<int>() == 1;

                if (hasAccess)
                {
                    return null;
                }
            }
            catch (JsonException)
            {
                return Forbid();
            }

            return Forbid();
        }

        private bool CanAdministrarListaPreciosMvc()
        {
            if (IsSuperAdminSession() &&
                ProveeduriaMenuBuilder.HasOfficialSuperAdminPermission(ListaPreciosAdministrarPermissionCode, requireWrite: true))
            {
                return true;
            }

            try
            {
                string permisos = Request.Cookies["prmmnu"] ?? string.Empty;
                JsonNode? permission = string.IsNullOrWhiteSpace(permisos)
                    ? null
                    : FindPermission(JsonNode.Parse(permisos), ListaPreciosAdministrarPermissionCode);
                bool hasAccess = permission?["Permisos"]?["Acceso"]?.GetValue<int>() == 1 ||
                                 permission?["permisos"]?["acceso"]?.GetValue<int>() == 1;
                bool hasWrite = permission?["Permisos"]?["Escritura"]?.GetValue<int>() == 1 ||
                                permission?["permisos"]?["escritura"]?.GetValue<int>() == 1;
                return hasAccess && hasWrite;
            }
            catch (JsonException)
            {
                return false;
            }
        }

        private bool IsSuperAdminSession()
            => string.Equals(Request.Cookies[SuperAdminRoleCookie]?.Trim(), "SuperAdmin", StringComparison.OrdinalIgnoreCase);

        private static JsonNode? FindPermission(JsonNode? node, string permissionCode)
        {
            if (node is JsonArray array)
            {
                foreach (JsonNode? child in array)
                {
                    JsonNode? match = FindPermission(child, permissionCode);
                    if (match != null)
                    {
                        return match;
                    }
                }

                return null;
            }

            if (node is not JsonObject obj)
            {
                return null;
            }

            string option = obj["Opcion"]?.GetValue<string>() ?? obj["opcion"]?.GetValue<string>() ?? string.Empty;
            if (string.Equals(option, permissionCode, StringComparison.OrdinalIgnoreCase))
            {
                return obj;
            }

            return FindPermission(obj["Hijos"] ?? obj["hijos"], permissionCode);
        }
    }
}
