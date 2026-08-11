using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using checklist.Clases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace checklist.Controllers.Cotizaciones
{
    [Authorize]
    [Route("[controller]")]
    public class CotizacionesController : Controller
    {
        private const string ProxyEmpresaIdHeader = "X-ProductosServicios-Proxy-EmpresaId";
        private const string ProxyEmpresaKeyHeader = "X-ProductosServicios-Proxy-Empresa";
        private const string ProxyUsuarioIdHeader = "X-ProductosServicios-Proxy-UsuarioId";
        private const string ProxyTimestampHeader = "X-ProductosServicios-Proxy-Timestamp";
        private const string ProxySignatureHeader = "X-ProductosServicios-Proxy-Signature";
        private const string ProxyCorreoHeader = "X-Cotizaciones-Proxy-Correo";

        private readonly IHttpClientFactory _clientFactory;
        private readonly IConfiguration _configuration;

        public CotizacionesController(IHttpClientFactory clientFactory, IConfiguration configuration)
        {
            _clientFactory = clientFactory;
            _configuration = configuration;
        }

        [HttpGet("Index")]
        public IActionResult Index()
        {
            return RedirectToAction(nameof(Reporte));
        }

        [HttpGet("Reporte")]
        public IActionResult Reporte()
        {
            return View("~/Views/Cotizaciones/Index.cshtml");
        }

        [HttpGet("Nueva")]
        public IActionResult Nueva()
        {
            ViewData["CotizacionesPageMode"] = "new";
            ViewData["CotizacionesDetailId"] = string.Empty;
            return View("~/Views/Cotizaciones/Nueva.cshtml");
        }

        [HttpGet("Detalle/{id:guid}")]
        public IActionResult Detalle(Guid id)
        {
            ViewData["CotizacionesPageMode"] = "detail";
            ViewData["CotizacionesDetailId"] = id.ToString();
            return View("~/Views/Cotizaciones/Nueva.cshtml");
        }

        [HttpGet("Editar/{id:guid}")]
        public IActionResult Editar(Guid id)
        {
            ViewData["CotizacionesPageMode"] = "detail";
            ViewData["CotizacionesDetailId"] = id.ToString();
            return View("~/Views/Cotizaciones/Nueva.cshtml");
        }

        [HttpGet("Clonar/{id:guid}")]
        public IActionResult Clonar(Guid id)
        {
            ViewData["CotizacionesPageMode"] = "clone";
            ViewData["CotizacionesDetailId"] = id.ToString();
            return View("~/Views/Cotizaciones/Nueva.cshtml");
        }

        [HttpGet("ObtenerCotizaciones")]
        public Task<IActionResult> ObtenerCotizaciones() => ProxyGetAsync("ObtenerCotizaciones");

        [HttpGet("ObtenerResumenCotizaciones")]
        public Task<IActionResult> ObtenerResumenCotizaciones() => ProxyGetAsync("ObtenerResumenCotizaciones");

        [HttpGet("ObtenerCotizacion")]
        public Task<IActionResult> ObtenerCotizacion() => ProxyGetAsync("ObtenerCotizacion");

        [HttpPost("GuardarCotizacion")]
        public Task<IActionResult> GuardarCotizacion() => ProxyJsonAsync(HttpMethod.Post, "GuardarCotizacion");

        [HttpPost("CancelarCotizacion")]
        public Task<IActionResult> CancelarCotizacion() => ProxyJsonAsync(HttpMethod.Post, "CancelarCotizacion");

        [HttpGet("ExportarCotizacionPdf")]
        public Task<IActionResult> ExportarCotizacionPdf() => ProxyGetAsync("ExportarCotizacionPdf");

        [HttpGet("ObtenerSucursalesCotizacion")]
        public async Task<IActionResult> ObtenerSucursalesCotizacion()
        {
            string url = BuildSucursalApiUrl();
            using HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            using HttpClient client = _clientFactory.CreateClient();
            using HttpResponseMessage response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

            string content = await response.Content.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(content))
            {
                return StatusCode((int)response.StatusCode);
            }

            return new ContentResult
            {
                Content = content,
                ContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json",
                StatusCode = (int)response.StatusCode
            };
        }

        private async Task<IActionResult> ProxyGetAsync(string actionName)
        {
            using HttpRequestMessage request = CreateApiRequest(HttpMethod.Get, actionName);
            return await SendAsync(request);
        }

        private async Task<IActionResult> ProxyJsonAsync(HttpMethod method, string actionName)
        {
            using HttpRequestMessage request = CreateApiRequest(method, actionName);
            string body = await ReadBodyAsync();
            request.Content = new StringContent(string.IsNullOrWhiteSpace(body) ? "{}" : body, Encoding.UTF8, Request.ContentType ?? "application/json");
            return await SendAsync(request);
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
            return $"{Utilerias.UrlBase}api/Cotizaciones/{actionName}{queryString}";
        }

        private string BuildSucursalApiUrl()
        {
            string idEmpresa = ResolveIdEmpresa();
            string empresa = ResolveEmpresa();
            string cadena = ResolveCadena();
            List<KeyValuePair<string, string?>> query = new List<KeyValuePair<string, string?>>
            {
                new("idEmpresa", idEmpresa),
                new("empresa", empresa),
                new("cadena", cadena)
            };

            return $"{Utilerias.UrlBase}api/Sucursal/ObtenerSucursales{QueryString.Create(query).ToUriComponent()}";
        }

        private void AddProxyHeaders(HttpRequestMessage request)
        {
            string idEmpresa = ResolveIdEmpresa();
            string empresa = ResolveEmpresa();
            string? usuarioId = ResolveUsuarioId();
            string correo = ResolveCorreo();
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

            if (!string.IsNullOrWhiteSpace(correo))
            {
                request.Headers.TryAddWithoutValidation(ProxyCorreoHeader, correo);
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
            string responseContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json";
            bool isAttachment = response.Content.Headers.ContentDisposition != null;
            bool isTextual =
                responseContentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase) ||
                responseContentType.StartsWith("text/", StringComparison.OrdinalIgnoreCase) ||
                responseContentType.StartsWith("application/problem+json", StringComparison.OrdinalIgnoreCase);

            if (!isTextual || isAttachment)
            {
                byte[] bytes = await response.Content.ReadAsByteArrayAsync();
                if (bytes.Length == 0)
                {
                    return StatusCode((int)response.StatusCode);
                }

                string fileName = response.Content.Headers.ContentDisposition?.FileNameStar
                    ?? response.Content.Headers.ContentDisposition?.FileName
                    ?? "archivo";

                return File(bytes, responseContentType, fileName.Trim('"'));
            }

            string content = await response.Content.ReadAsStringAsync();
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

        private string ResolveCadena()
        {
            return ResolveSessionValue("cadena")
                ?? User.FindFirstValue(ClaimTypes.Uri)
                ?? Request.Query["cadena"].FirstOrDefault()
                ?? string.Empty;
        }

        private string ResolveCorreo()
        {
            return ResolveSessionValue("emailUser")
                ?? User.FindFirstValue(ClaimTypes.Email)
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
