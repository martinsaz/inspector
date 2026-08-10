using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using checklist.Clases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace checklist.Controllers.Clientes
{
    [Authorize]
    [Route("Clientes")]
    public class ClientesReporteController : Controller
    {
        private const string ProxyEmpresaIdHeader = "X-ProductosServicios-Proxy-EmpresaId";
        private const string ProxyEmpresaKeyHeader = "X-ProductosServicios-Proxy-Empresa";
        private const string ProxyUsuarioIdHeader = "X-ProductosServicios-Proxy-UsuarioId";
        private const string ProxyTimestampHeader = "X-ProductosServicios-Proxy-Timestamp";
        private const string ProxySignatureHeader = "X-ProductosServicios-Proxy-Signature";

        private readonly IHttpClientFactory _clientFactory;
        private readonly IConfiguration _configuration;

        public ClientesReporteController(IHttpClientFactory clientFactory, IConfiguration configuration)
        {
            _clientFactory = clientFactory;
            _configuration = configuration;
        }

        [HttpGet("Reporte")]
        public IActionResult Reporte()
        {
            return View("~/Views/Clientes/Reporte.cshtml");
        }

        [HttpGet("ObtenerConfiguracionReporte")]
        public Task<IActionResult> ObtenerConfiguracionReporte() => ProxyGetAsync("ObtenerConfiguracion");

        [HttpGet("GenerarReporte")]
        public Task<IActionResult> GenerarReporte() => ProxyGetAsync("Generar");

        [HttpGet("ExportarReporteExcel")]
        public Task<IActionResult> ExportarReporteExcel() => ProxyFileAsync("ExportarExcel");

        private async Task<IActionResult> ProxyGetAsync(string actionName)
        {
            using HttpRequestMessage request = CreateApiRequest(HttpMethod.Get, actionName);
            return await SendAsync(request);
        }

        private async Task<IActionResult> ProxyFileAsync(string actionName)
        {
            using HttpRequestMessage request = CreateApiRequest(HttpMethod.Get, actionName);
            using HttpClient client = _clientFactory.CreateClient();
            using HttpResponseMessage response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

            byte[] content = await response.Content.ReadAsByteArrayAsync();
            if (!response.IsSuccessStatusCode)
            {
                string text = Encoding.UTF8.GetString(content);
                return new ContentResult
                {
                    Content = text,
                    ContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json",
                    StatusCode = (int)response.StatusCode
                };
            }

            string fileName = response.Content.Headers.ContentDisposition?.FileNameStar
                ?? response.Content.Headers.ContentDisposition?.FileName
                ?? "reporte-clientes.xlsx";

            return File(content,
                response.Content.Headers.ContentType?.ToString() ?? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName.Trim('"'));
        }

        private HttpRequestMessage CreateApiRequest(HttpMethod method, string actionName)
        {
            HttpRequestMessage request = new HttpRequestMessage(method, BuildApiUrl(actionName));
            AddProxyHeaders(request);
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
            return $"{Utilerias.UrlBase}api/ClientesReporte/{actionName}{queryString}";
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

        private async Task<IActionResult> SendAsync(HttpRequestMessage request)
        {
            using HttpClient client = _clientFactory.CreateClient();
            using HttpResponseMessage response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

            string content = await response.Content.ReadAsStringAsync();
            string responseContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json";

            if (string.IsNullOrWhiteSpace(content))
            {
                return StatusCode((int)response.StatusCode);
            }

            return new ContentResult
            {
                Content = content,
                ContentType = responseContentType,
                StatusCode = (int)response.StatusCode
            };
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
    }
}
