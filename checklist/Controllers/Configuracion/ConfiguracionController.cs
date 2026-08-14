using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using checklist.Clases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace checklist.Controllers.Configuracion
{
    [Authorize]
    [Route("[controller]")]
    public sealed class ConfiguracionController : Controller
    {
        private const string ProxyEmpresaIdHeader = "X-ProductosServicios-Proxy-EmpresaId";
        private const string ProxyEmpresaKeyHeader = "X-ProductosServicios-Proxy-Empresa";
        private const string ProxyUsuarioIdHeader = "X-ProductosServicios-Proxy-UsuarioId";
        private const string ProxyTimestampHeader = "X-ProductosServicios-Proxy-Timestamp";
        private const string ProxySignatureHeader = "X-ProductosServicios-Proxy-Signature";

        private readonly IHttpClientFactory _clientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ConfiguracionController> _logger;

        public ConfiguracionController(IHttpClientFactory clientFactory, IConfiguration configuration, ILogger<ConfiguracionController> logger)
        {
            _clientFactory = clientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpGet("CorreoSaliente")]
        public IActionResult CorreoSaliente()
        {
            return View();
        }

        [HttpGet("ObtenerCorreoSaliente")]
        public Task<IActionResult> ObtenerCorreoSaliente() => ProxyGetAsync("ObtenerConfiguracion");

        [HttpPost("ProbarCorreoSaliente")]
        public Task<IActionResult> ProbarCorreoSaliente()
        {
            _logger.LogInformation("CorreoSaliente MVC: inicio de prueba SMTP desde la UI.");
            return ProxyJsonAsync(HttpMethod.Post, "ProbarConfiguracion");
        }

        [HttpPost("GuardarCorreoSaliente")]
        public Task<IActionResult> GuardarCorreoSaliente() => ProxyJsonAsync(HttpMethod.Post, "GuardarConfiguracion");

        private async Task<IActionResult> ProxyGetAsync(string actionName)
        {
            try
            {
                using HttpRequestMessage request = CreateApiRequest(HttpMethod.Get, actionName);
                return await SendAsync(request, actionName);
            }
            catch (Exception ex)
            {
                return HandleProxyException(ex, actionName);
            }
        }

        private async Task<IActionResult> ProxyJsonAsync(HttpMethod method, string actionName)
        {
            try
            {
                using HttpRequestMessage request = CreateApiRequest(method, actionName);
                string body = await ReadBodyAsync();
                request.Content = new StringContent(string.IsNullOrWhiteSpace(body) ? "{}" : body, Encoding.UTF8, "application/json");
                return await SendAsync(request, actionName);
            }
            catch (Exception ex)
            {
                return HandleProxyException(ex, actionName);
            }
        }

        private HttpRequestMessage CreateApiRequest(HttpMethod method, string actionName)
        {
            HttpRequestMessage request = new HttpRequestMessage(method, BuildApiUrl(actionName));
            AddProxyHeaders(request);
            request.Headers.Accept.Clear();
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            return request;
        }

        private string BuildApiUrl(string actionName)
        {
            string idEmpresa = ResolveIdEmpresa();
            List<KeyValuePair<string, string?>> query = new List<KeyValuePair<string, string?>>();

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

            query.Add(new KeyValuePair<string, string?>("idEmpresa", idEmpresa));
            string queryString = QueryString.Create(query).ToUriComponent();
            return $"{Utilerias.UrlBase}api/CorreoSaliente/{actionName}{queryString}";
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

        private static string ComputeSignature(string secret, string empresaId, string empresa, string usuarioId, string timestamp)
        {
            using HMACSHA256 hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            string payload = string.Join('\n', empresaId.Trim(), empresa.Trim().ToUpperInvariant(), usuarioId.Trim(), timestamp.Trim());
            byte[] signature = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
            return Convert.ToBase64String(signature);
        }

        private async Task<IActionResult> SendAsync(HttpRequestMessage request, string actionName)
        {
            using HttpClient client = _clientFactory.CreateClient();
            using HttpResponseMessage response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

            string content = await response.Content.ReadAsStringAsync();
            string responseContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json";
            string? responseMediaType = response.Content.Headers.ContentType?.MediaType;

            _logger.LogInformation(
                "CorreoSaliente MVC: respuesta de {ActionName} con status {StatusCode}, mediaType {MediaType} y longitud {ContentLength}.",
                actionName,
                (int)response.StatusCode,
                responseMediaType ?? "(null)",
                content.Length);

            if (string.IsNullOrWhiteSpace(content))
            {
                return BuildJsonResult(
                    (int)response.StatusCode,
                    new
                    {
                        exito = false,
                        mensaje = "El servicio de correo no devolvió una respuesta utilizable.",
                        estado = string.Empty,
                        tokenVerificacion = string.Empty,
                        configuracion = (object?)null
                    });
            }

            if (!LooksLikeJson(responseMediaType, content))
            {
                _logger.LogWarning(
                    "CorreoSaliente proxy recibió contenido no JSON en {ActionName}. HTTP {StatusCode}. Content-Type {ContentType}.",
                    actionName,
                    (int)response.StatusCode,
                    responseContentType);

                return BuildJsonResult(
                    StatusCodes.Status502BadGateway,
                    new
                    {
                        exito = false,
                        mensaje = "El servicio interno de correo devolvió una respuesta no válida.",
                        estado = string.Empty,
                        tokenVerificacion = string.Empty,
                        configuracion = (object?)null
                    });
            }

            return new ContentResult
            {
                Content = content,
                ContentType = responseContentType,
                StatusCode = (int)response.StatusCode
            };
        }

        private async Task<string> ReadBodyAsync()
        {
            using StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8);
            return await reader.ReadToEndAsync();
        }

        private string ResolveIdEmpresa()
        {
            return ResolveSessionValue("idEmpresa")
                ?? User.FindFirstValue(ClaimTypes.SerialNumber)
                ?? Request.Query["idEmpresa"].FirstOrDefault()
                ?? string.Empty;
        }

        private string ResolveEmpresa()
        {
            return ResolveSessionValue("empresa")
                ?? User.FindFirstValue(ClaimTypes.Sid)
                ?? Request.Query["empresa"].FirstOrDefault()
                ?? string.Empty;
        }

        private string? ResolveUsuarioId()
        {
            string? claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(claimValue, out Guid usuarioId) && usuarioId != Guid.Empty
                ? usuarioId.ToString()
                : null;
        }

        private string? ResolveSessionValue(string key)
        {
            string? raw = HttpContext.Session.GetString(key);
            if (!string.IsNullOrWhiteSpace(raw))
            {
                return NormalizeSerializedValue(raw);
            }

            return null;
        }

        private static string NormalizeSerializedValue(string value)
        {
            string trimmed = value.Trim();
            if (trimmed.Length >= 2 && trimmed.StartsWith('"') && trimmed.EndsWith('"'))
            {
                return trimmed.Substring(1, trimmed.Length - 2);
            }

            return trimmed;
        }

        private IActionResult HandleProxyException(Exception ex, string actionName)
        {
            _logger.LogError(ex, "Error en proxy MVC de CorreoSaliente para {ActionName}.", actionName);

            return BuildJsonResult(
                StatusCodes.Status502BadGateway,
                new
                {
                    exito = false,
                    mensaje = "No fue posible completar la comunicación con el servicio de correo.",
                    estado = string.Empty,
                    tokenVerificacion = string.Empty,
                    configuracion = (object?)null
                });
        }

        private static bool LooksLikeJson(string? mediaType, string content)
        {
            if (!string.IsNullOrWhiteSpace(mediaType) &&
                mediaType.Contains("json", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            string trimmed = content.TrimStart();
            if (string.IsNullOrEmpty(trimmed))
            {
                return false;
            }

            if (trimmed[0] != '{' && trimmed[0] != '[')
            {
                return false;
            }

            try
            {
                using var _ = JsonDocument.Parse(trimmed);
                return true;
            }
            catch
            {
                return false;
            }
        }

        private static ContentResult BuildJsonResult(int statusCode, object payload)
        {
            return new ContentResult
            {
                Content = JsonSerializer.Serialize(payload),
                ContentType = "application/json; charset=utf-8",
                StatusCode = statusCode
            };
        }
    }
}
