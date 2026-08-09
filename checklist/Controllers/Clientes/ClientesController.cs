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
    [Route("[controller]")]
    public class ClientesController : Controller
    {
        private const string ProxyEmpresaIdHeader = "X-ProductosServicios-Proxy-EmpresaId";
        private const string ProxyEmpresaKeyHeader = "X-ProductosServicios-Proxy-Empresa";
        private const string ProxyUsuarioIdHeader = "X-ProductosServicios-Proxy-UsuarioId";
        private const string ProxyTimestampHeader = "X-ProductosServicios-Proxy-Timestamp";
        private const string ProxySignatureHeader = "X-ProductosServicios-Proxy-Signature";

        private readonly IHttpClientFactory _clientFactory;
        private readonly IConfiguration _configuration;

        public ClientesController(IHttpClientFactory clientFactory, IConfiguration configuration)
        {
            _clientFactory = clientFactory;
            _configuration = configuration;
        }

        [HttpGet("Index")]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet("EdicionAvanzada")]
        public IActionResult EdicionAvanzada(Guid? idCliente = null, string? returnUrl = null)
        {
            ViewBag.ClienteId = idCliente?.ToString() ?? string.Empty;
            string fallbackUrl = Url.Action("Index", "Clientes") ?? "/Clientes/Index";
            ViewBag.ReturnUrl = string.IsNullOrWhiteSpace(returnUrl) || !Url.IsLocalUrl(returnUrl)
                ? fallbackUrl
                : returnUrl;
            return View();
        }

        [HttpGet("ObtenerClientes")]
        public Task<IActionResult> ObtenerClientes() => ProxyGetAsync("ObtenerClientes");

        [HttpGet("ObtenerCliente")]
        public Task<IActionResult> ObtenerCliente() => ProxyGetAsync("ObtenerCliente");

        [HttpGet("ObtenerClienteAvanzado")]
        public Task<IActionResult> ObtenerClienteAvanzado() => ProxyGetAsync("ObtenerClienteAvanzado");

        [HttpGet("ObtenerListasPrecioCliente")]
        public Task<IActionResult> ObtenerListasPrecioCliente() => ProxyGetAsync("ObtenerListasPrecioCliente");

        [HttpGet("ObtenerRegimenesFiscalesCliente")]
        public Task<IActionResult> ObtenerRegimenesFiscalesCliente() => ProxyGetAsync("ObtenerRegimenesFiscalesCliente");

        [HttpPost("ValidarDuplicadosCliente")]
        public Task<IActionResult> ValidarDuplicadosCliente() => ProxyJsonAsync(HttpMethod.Post, "ValidarDuplicadosCliente");

        [HttpPost("GuardarCliente")]
        public Task<IActionResult> GuardarCliente() => ProxyJsonAsync(HttpMethod.Post, "GuardarCliente");

        [HttpPost("GuardarClienteAvanzado")]
        public Task<IActionResult> GuardarClienteAvanzado() => ProxyJsonAsync(HttpMethod.Post, "GuardarClienteAvanzado");

        [HttpGet("ObtenerNotasCliente")]
        public Task<IActionResult> ObtenerNotasCliente() => ProxyGetAsync("ObtenerNotasCliente");

        [HttpPost("GuardarNotaCliente")]
        public Task<IActionResult> GuardarNotaCliente() => ProxyJsonAsync(HttpMethod.Post, "GuardarNotaCliente");

        [HttpPost("CompletarTareaCliente")]
        public Task<IActionResult> CompletarTareaCliente() => ProxyJsonAsync(HttpMethod.Post, "CompletarTareaCliente");

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
            return $"{Utilerias.UrlBase}api/Clientes/{actionName}{queryString}";
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
    }
}
