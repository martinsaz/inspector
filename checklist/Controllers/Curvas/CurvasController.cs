using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using checklist.Clases;
using checklist.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace checklist.Controllers.Curvas
{
    [Authorize]
    [Route("Proveeduria/Curvas")]
    public sealed class CurvasController : Controller
    {
        private const string ProxyEmpresaIdHeader = "X-ProductosServicios-Proxy-EmpresaId";
        private const string ProxyEmpresaKeyHeader = "X-ProductosServicios-Proxy-Empresa";
        private const string ProxyUsuarioIdHeader = "X-ProductosServicios-Proxy-UsuarioId";
        private const string ProxyTimestampHeader = "X-ProductosServicios-Proxy-Timestamp";
        private const string ProxySignatureHeader = "X-ProductosServicios-Proxy-Signature";
        private const string CurvasCatalogoPermissionCode = "05005001";
        private static readonly JsonSerializerOptions ProxyJsonOptions = new(JsonSerializerDefaults.Web);

        private readonly IHttpClientFactory _clientFactory;
        private readonly IConfiguration _configuration;

        public CurvasController(IHttpClientFactory clientFactory, IConfiguration configuration)
        {
            _clientFactory = clientFactory;
            _configuration = configuration;
        }

        [HttpGet("Catalogo")]
        public async Task<IActionResult> Catalogo()
        {
            if (!await HasCurvasAccessAsync())
            {
                return Forbid();
            }

            return View("~/Views/Curvas/Catalogo.cshtml");
        }

        [HttpGet("Listar")]
        public Task<IActionResult> Listar() => ProxyGetAsync("Listar");

        [HttpGet("Detalle")]
        public Task<IActionResult> Detalle() => ProxyGetAsync("Detalle");

        [HttpGet("ProductosElegibles")]
        public Task<IActionResult> ProductosElegibles() => ProxyGetAsync("ProductosElegibles");

        [HttpGet("Variantes")]
        public Task<IActionResult> Variantes() => ProxyGetAsync("Variantes");

        [HttpPost("Guardar")]
        public Task<IActionResult> Guardar() => ProxyJsonAsync(HttpMethod.Post, "Guardar");

        [HttpPost("Baja")]
        public Task<IActionResult> Baja() => ProxyPostQueryAsync("Baja");

        [HttpPost("Reactivar")]
        public Task<IActionResult> Reactivar() => ProxyPostQueryAsync("Reactivar");

        private async Task<IActionResult> ProxyGetAsync(string actionName)
        {
            using HttpRequestMessage request = CreateApiRequest(HttpMethod.Get, actionName);
            return await SendAsync(request);
        }

        private async Task<IActionResult> ProxyPostQueryAsync(string actionName)
        {
            using HttpRequestMessage request = CreateApiRequest(HttpMethod.Post, actionName);
            return await SendAsync(request);
        }

        private async Task<IActionResult> ProxyJsonAsync(HttpMethod method, string actionName)
        {
            using HttpRequestMessage request = CreateApiRequest(method, actionName);
            string body = await ReadBodyAsync();
            JsonObject payload = string.IsNullOrWhiteSpace(body) ? new JsonObject() : JsonNode.Parse(body) as JsonObject ?? new JsonObject();
            request.Content = new StringContent(payload.ToJsonString(ProxyJsonOptions), Encoding.UTF8, "application/json");
            return await SendAsync(request);
        }

        private HttpRequestMessage CreateApiRequest(HttpMethod method, string actionName)
        {
            HttpRequestMessage request = new(method, BuildApiUrl(actionName));
            AddProxyHeaders(request);
            return request;
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
            query.Add(new KeyValuePair<string, string?>("empresaKey", ResolveEmpresa()));
            string queryString = QueryString.Create(query).ToUriComponent();
            return $"{Utilerias.UrlBase}api/CurvasCatalogo/{actionName}{queryString}";
        }

        private void AddProxyHeaders(HttpRequestMessage request)
        {
            string idEmpresa = ResolveIdEmpresa();
            string empresa = ResolveEmpresa();
            string? usuarioId = ResolveUsuarioId();
            string timestamp = DateTimeOffset.UtcNow.ToString("O");
            string secret = _configuration["fireBdata:fireClave"] ?? string.Empty;
            string signature = ComputeSignature(secret, idEmpresa, empresa, usuarioId ?? string.Empty, timestamp);

            request.Headers.TryAddWithoutValidation(ProxyEmpresaIdHeader, idEmpresa);
            request.Headers.TryAddWithoutValidation(ProxyEmpresaKeyHeader, empresa);
            request.Headers.TryAddWithoutValidation(ProxyTimestampHeader, timestamp);
            request.Headers.TryAddWithoutValidation(ProxySignatureHeader, signature);
            if (!string.IsNullOrWhiteSpace(usuarioId))
            {
                request.Headers.TryAddWithoutValidation(ProxyUsuarioIdHeader, usuarioId);
            }
        }

        private async Task<IActionResult> SendAsync(HttpRequestMessage request)
        {
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

        private async Task<string> ReadBodyAsync()
        {
            using StreamReader reader = new(Request.Body, Encoding.UTF8);
            return await reader.ReadToEndAsync();
        }

        private async Task<bool> HasCurvasAccessAsync()
        {
            string idEmpresa = ResolveIdEmpresa();
            string empresa = ResolveEmpresa();
            string cadena = ResolveSessionValue("cadena") ?? User.FindFirstValue(ClaimTypes.Uri) ?? string.Empty;
            string idRol = await ResolveCurrentRoleIdAsync(idEmpresa, empresa, cadena)
                ?? User.FindFirstValue(ClaimTypes.Role)
                ?? ResolveSessionValue("idRol")
                ?? string.Empty;
            if (string.IsNullOrWhiteSpace(idEmpresa) || string.IsNullOrWhiteSpace(empresa) || string.IsNullOrWhiteSpace(cadena) || string.IsNullOrWhiteSpace(idRol))
            {
                return false;
            }

            string url = string.Format("{0}GetRoles?idEmpresa={1}&empresa={3}&cadena={4}&id={2}", Utilerias.UrlBase, Uri.EscapeDataString(idEmpresa), Uri.EscapeDataString(idRol), Uri.EscapeDataString(empresa), Uri.EscapeDataString(cadena));
            using HttpClient client = _clientFactory.CreateClient();
            using HttpResponseMessage response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                return false;
            }

            string content = await response.Content.ReadAsStringAsync();
            JsonNode? parsed = JsonNode.Parse(content);
            JsonObject? role = parsed as JsonArray is { Count: > 0 } roles ? roles[0] as JsonObject : null;
            if (string.Equals(role?["nombreRol"]?.GetValue<string>() ?? role?["NombreRol"]?.GetValue<string>(), "SuperAdmin", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            string permisos = role?["permisos"]?.GetValue<string>() ?? role?["Permisos"]?.GetValue<string>() ?? string.Empty;
            JsonNode? permission = FindPermission(JsonNode.Parse(permisos), CurvasCatalogoPermissionCode);
            return permission?["Permisos"]?["Acceso"]?.GetValue<int>() == 1 ||
                   permission?["permisos"]?["acceso"]?.GetValue<int>() == 1;
        }

        private async Task<string?> ResolveCurrentRoleIdAsync(string idEmpresa, string empresa, string cadena)
        {
            string correo = ResolveSessionValue("emailUser") ?? User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
            if (string.IsNullOrWhiteSpace(idEmpresa) || string.IsNullOrWhiteSpace(empresa) || string.IsNullOrWhiteSpace(cadena) || string.IsNullOrWhiteSpace(correo))
            {
                return null;
            }

            try
            {
                using HttpClient client = _clientFactory.CreateClient();
                string urlUsuario = string.Format("{0}api/Usuario/ObtenerUsuarioPorEmail?idEmpresa={1}&email={2}&empresa={3}&cadena={4}", Utilerias.UrlBase, Uri.EscapeDataString(idEmpresa), Uri.EscapeDataString(correo), Uri.EscapeDataString(empresa), Uri.EscapeDataString(cadena));
                using HttpResponseMessage response = await client.GetAsync(urlUsuario);
                if (!response.IsSuccessStatusCode) return null;

                JsonNode? parsed = JsonNode.Parse(await response.Content.ReadAsStringAsync());
                JsonObject? usuario = parsed as JsonArray is { Count: > 0 } usuarios ? usuarios[0] as JsonObject : null;
                string idUsuario = usuario?["id"]?.GetValue<string>() ?? usuario?["Id"]?.GetValue<string>() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(idUsuario))
                {
                    return null;
                }

                string urlDetalle = string.Format("{0}api/Usuario/ObtenerUsuario?idEmpresa={1}&id={2}&empresa={3}&cadena={4}", Utilerias.UrlBase, Uri.EscapeDataString(idEmpresa), Uri.EscapeDataString(idUsuario), Uri.EscapeDataString(empresa), Uri.EscapeDataString(cadena));
                using HttpResponseMessage detailResponse = await client.GetAsync(urlDetalle);
                if (!detailResponse.IsSuccessStatusCode)
                {
                    return null;
                }

                JsonNode? detailParsed = JsonNode.Parse(await detailResponse.Content.ReadAsStringAsync());
                JsonObject? detalle = detailParsed as JsonArray is { Count: > 0 } detalles ? detalles[0] as JsonObject : null;
                return detalle?["idRol"]?.GetValue<string>() ?? detalle?["IdRol"]?.GetValue<string>();
            }
            catch (JsonException)
            {
                return null;
            }
            catch (HttpRequestException)
            {
                return null;
            }
        }

        private string ResolveIdEmpresa()
            => NormalizeEmpresaId(ResolveSessionValue("idEmpresa")) ?? NormalizeEmpresaId(User.FindFirstValue(ClaimTypes.SerialNumber)) ?? string.Empty;

        private string ResolveEmpresa()
            => ResolveSessionValue("empresa") ?? User.FindFirstValue(ClaimTypes.Sid) ?? string.Empty;

        private string? ResolveUsuarioId()
        {
            string? claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return !string.IsNullOrWhiteSpace(claimValue) && claimValue.Length <= 256 && !claimValue.Any(char.IsControl) ? claimValue.Trim() : null;
        }

        private string? ResolveSessionValue(string key)
        {
            string? raw = HttpContext.Session.GetString(key);
            if (!string.IsNullOrWhiteSpace(raw)) return NormalizeSerializedValue(raw);
            string? serialized = HttpContext.Session.GetObject<string>(key);
            return string.IsNullOrWhiteSpace(serialized) ? null : NormalizeSerializedValue(serialized);
        }

        private static string ComputeSignature(string secret, string empresaId, string empresa, string usuarioId, string timestamp)
        {
            using HMACSHA256 hmac = new(Encoding.UTF8.GetBytes(secret));
            return Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(string.Join('\n', empresaId.Trim(), empresa.Trim().ToUpperInvariant(), usuarioId.Trim(), timestamp.Trim()))));
        }

        private static JsonNode? FindPermission(JsonNode? node, string permissionCode)
        {
            if (node == null) return null;
            if (node is JsonObject obj && string.Equals(obj["Opcion"]?.GetValue<string>() ?? obj["opcion"]?.GetValue<string>(), permissionCode, StringComparison.OrdinalIgnoreCase)) return node;
            JsonArray? children = node["Hijos"] as JsonArray ?? node["hijos"] as JsonArray;
            if (children == null) return null;
            foreach (JsonNode? child in children)
            {
                JsonNode? match = FindPermission(child, permissionCode);
                if (match != null) return match;
            }
            return null;
        }

        private static string? NormalizeEmpresaId(string? value)
            => Guid.TryParse(NormalizeSerializedValue(value), out Guid parsed) && parsed != Guid.Empty ? parsed.ToString() : null;

        private static string? NormalizeSerializedValue(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            string trimmed = value.Trim();
            if (trimmed.Length >= 2 && trimmed[0] == '"' && trimmed[^1] == '"')
            {
                try { return JsonSerializer.Deserialize<string>(trimmed); } catch (JsonException) { return trimmed.Trim('"'); }
            }
            return trimmed;
        }
    }
}
