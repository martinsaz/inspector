using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using checklist.Clases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace checklist.Controllers.Activos
{
    [Authorize]
    [Route("Activos/OrdenesCompra")]
    public class OrdenesCompraController : Controller
    {
        private const string ProxyEmpresaIdHeader = "X-ProductosServicios-Proxy-EmpresaId";
        private const string ProxyEmpresaKeyHeader = "X-ProductosServicios-Proxy-Empresa";
        private const string ProxyUsuarioIdHeader = "X-ProductosServicios-Proxy-UsuarioId";
        private const string ProxyTimestampHeader = "X-ProductosServicios-Proxy-Timestamp";
        private const string ProxySignatureHeader = "X-ProductosServicios-Proxy-Signature";
        private const string SuperAdminRoleCookie = "chkRoleName";
        private const string OrdenesCompraNuevaPermissionCode = "05003001";
        private const string OrdenesCompraReportePermissionCode = "05003002";

        private readonly IHttpClientFactory _clientFactory;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<OrdenesCompraController> _logger;

        public OrdenesCompraController(
            IHttpClientFactory clientFactory,
            IConfiguration configuration,
            IWebHostEnvironment environment,
            ILogger<OrdenesCompraController> logger)
        {
            _clientFactory = clientFactory;
            _configuration = configuration;
            _environment = environment;
            _logger = logger;
        }

        [HttpGet("Nueva")]
        public IActionResult Nueva()
        {
            IActionResult? auth = AuthorizeOrdenCompraMvc(OrdenesCompraNuevaPermissionCode, requireWrite: false);
            if (auth != null)
            {
                return auth;
            }

            ViewData["OrdenesCompraPageMode"] = "new";
            ViewData["OrdenesCompraDetailId"] = string.Empty;
            return View("~/Views/Activos/OrdenesCompra/Nueva.cshtml");
        }

        [HttpGet("Reporte")]
        public IActionResult Reporte()
        {
            IActionResult? auth = AuthorizeOrdenCompraMvc(OrdenesCompraReportePermissionCode, requireWrite: false);
            if (auth != null)
            {
                return auth;
            }

            return View("~/Views/Activos/OrdenesCompra/Index.cshtml");
        }

        [HttpGet("Index")]
        public IActionResult Index()
        {
            return RedirectToAction(nameof(Reporte));
        }

        [HttpGet("Detalle/{id:guid}")]
        public IActionResult Detalle(Guid id)
        {
            IActionResult? auth = AuthorizeOrdenCompraMvcAny(requireWrite: false, OrdenesCompraNuevaPermissionCode, OrdenesCompraReportePermissionCode);
            if (auth != null)
            {
                return auth;
            }

            ViewData["OrdenesCompraPageMode"] = "detail";
            ViewData["OrdenesCompraDetailId"] = id.ToString();
            return View("~/Views/Activos/OrdenesCompra/Nueva.cshtml");
        }

        [HttpGet("Editar/{id:guid}")]
        public IActionResult Editar(Guid id)
        {
            return RedirectToAction(nameof(Detalle), new { id });
        }

        [HttpGet("ObtenerOrdenesCompra")]
        public Task<IActionResult> ObtenerOrdenesCompra() => ProxyGetAsync("ObtenerOrdenesCompra", OrdenesCompraReportePermissionCode);

        [HttpGet("ObtenerOrdenCompra")]
        public Task<IActionResult> ObtenerOrdenCompra() => ProxyGetAsync("ObtenerOrdenCompra", OrdenesCompraNuevaPermissionCode, OrdenesCompraReportePermissionCode);

        [HttpGet("ObtenerResumenOrdenesCompra")]
        public Task<IActionResult> ObtenerResumenOrdenesCompra() => ProxyGetAsync("ObtenerResumenOrdenesCompra", OrdenesCompraReportePermissionCode);

        [HttpGet("ObtenerCombosOrdenCompra")]
        public Task<IActionResult> ObtenerCombosOrdenCompra() => ProxyGetAsync("ObtenerCombosOrdenCompra", OrdenesCompraNuevaPermissionCode);

        [HttpGet("BuscarProductosServiciosOrdenCompra")]
        public Task<IActionResult> BuscarProductosServiciosOrdenCompra() => ProxyGetAsync("BuscarProductosServiciosOrdenCompra", OrdenesCompraNuevaPermissionCode);

        [HttpPost("PreviewCurvasOrdenCompra")]
        public async Task<IActionResult> PreviewCurvasOrdenCompra()
        {
            IActionResult? auth = AuthorizeOrdenCompraMvc(OrdenesCompraNuevaPermissionCode, requireWrite: false);
            if (auth != null)
            {
                return auth;
            }

            using HttpRequestMessage request = new(HttpMethod.Post, $"{Utilerias.UrlBase}api/CurvasSugerencias/Preview");
            AddProxyHeaders(request);
            string body = await ReadBodyAsync();
            JsonObject payload = string.IsNullOrWhiteSpace(body)
                ? new JsonObject()
                : JsonNode.Parse(body)?.AsObject() ?? new JsonObject();
            payload["idEmpresa"] = ResolveIdEmpresa();
            payload["empresaKey"] = ResolveEmpresa();
            request.Content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json");
            return await SendAsync(request);
        }

        [HttpGet("ObtenerCurvasAplicablesOrdenCompra")]
        public async Task<IActionResult> ObtenerCurvasAplicablesOrdenCompra(Guid idProductoServicio)
        {
            IActionResult? auth = AuthorizeOrdenCompraMvc(OrdenesCompraNuevaPermissionCode, requireWrite: false);
            if (auth != null) return auth;
            if (idProductoServicio == Guid.Empty)
            {
                return BadRequest(new { mensaje = "Selecciona un producto válido." });
            }

            string query = $"idEmpresa={Uri.EscapeDataString(ResolveIdEmpresa().ToString())}&empresaKey={Uri.EscapeDataString(ResolveEmpresa())}&idProductoServicio={Uri.EscapeDataString(idProductoServicio.ToString())}";
            using HttpRequestMessage request = new(HttpMethod.Get, $"{Utilerias.UrlBase}api/CurvasSugerencias/Aplicables?{query}");
            AddProxyHeaders(request);
            return await SendAsync(request);
        }

        [HttpPost("ValidarPendientesOrdenCompra")]
        public Task<IActionResult> ValidarPendientesOrdenCompra() => ProxyJsonAsync(HttpMethod.Post, "ValidarPendientesOrdenCompra", requireWrite: false, OrdenesCompraNuevaPermissionCode);

        [HttpPost("PrepararCierreOrdenCompra")]
        public Task<IActionResult> PrepararCierreOrdenCompra() => ProxyJsonAsync(HttpMethod.Post, "PrepararCierreOrdenCompra", requireWrite: true, OrdenesCompraNuevaPermissionCode);

        [HttpPost("EjecutarCierreOrdenCompra")]
        public Task<IActionResult> EjecutarCierreOrdenCompra() => ProxyJsonAsync(HttpMethod.Post, "EjecutarCierreOrdenCompra", requireWrite: true, OrdenesCompraNuevaPermissionCode);

        [HttpGet("ExportarOrdenesCompra")]
        public Task<IActionResult> ExportarOrdenesCompra() => ProxyGetAsync("ExportarOrdenesCompra", OrdenesCompraReportePermissionCode);

        [HttpGet("ExportarOrdenCompraPdf")]
        public async Task<IActionResult> ExportarOrdenCompraPdf(Guid idOrdenCompra)
        {
            IActionResult? auth = AuthorizeOrdenCompraMvc(OrdenesCompraReportePermissionCode, requireWrite: false);
            if (auth != null)
            {
                return auth;
            }

            if (idOrdenCompra == Guid.Empty)
            {
                return BadRequest(new { mensaje = "La orden de compra no está disponible." });
            }

            OrdenCompraPdfModel? detail = await GetOrderDetailForPdfAsync(idOrdenCompra);
            if (detail == null || detail.Id == Guid.Empty)
            {
                return NotFound(new { mensaje = "La orden de compra no está disponible." });
            }

            try
            {
                byte[] pdf = BuildOrderPdf(detail);
                Console.WriteLine($"[OrdenesCompraPdf] Id={detail.Id} Folio={detail.Folio} Partidas={detail.Partidas.Count} Bytes={pdf.Length}");
                string fileName = BuildSafeExportFileName("orden_compra", detail.Folio, ".pdf");
                return File(pdf, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[OrdenesCompraPdf] Error al generar PDF de la orden {detail.Id} ({detail.Folio}).");
                Console.Error.WriteLine(ex);
                throw;
            }
        }

        [HttpGet("ExportarOrdenCompraExcel")]
        public Task<IActionResult> ExportarOrdenCompraExcel() => ProxyGetAsync("ExportarOrdenCompraExcel", OrdenesCompraReportePermissionCode);

        [HttpPost("GuardarBorradorOrdenCompra")]
        public Task<IActionResult> GuardarBorradorOrdenCompra() => ProxyJsonAsync(HttpMethod.Post, "GuardarBorradorOrdenCompra", requireWrite: true, OrdenesCompraNuevaPermissionCode);

        [HttpPost("GenerarOrdenCompra")]
        public Task<IActionResult> GenerarOrdenCompra() => ProxyJsonAsync(HttpMethod.Post, "GenerarOrdenCompra", requireWrite: true, OrdenesCompraNuevaPermissionCode);

        [HttpPost("CancelarOrdenCompra")]
        public Task<IActionResult> CancelarOrdenCompra() => ProxyJsonAsync(HttpMethod.Post, "CancelarOrdenCompra", requireWrite: true, OrdenesCompraReportePermissionCode);

        private async Task<IActionResult> ProxyGetAsync(string actionName, params string[] permissionCodes)
        {
            IActionResult? auth = AuthorizeOrdenCompraMvcAny(requireWrite: false, permissionCodes);
            if (auth != null)
            {
                return auth;
            }

            using HttpRequestMessage request = CreateApiRequest(HttpMethod.Get, actionName);
            return await SendAsync(request);
        }

        private async Task<IActionResult> ProxyJsonAsync(HttpMethod method, string actionName, bool requireWrite, params string[] permissionCodes)
        {
            IActionResult? auth = AuthorizeOrdenCompraMvcAny(requireWrite, permissionCodes);
            if (auth != null)
            {
                return auth;
            }

            using HttpRequestMessage request = CreateApiRequest(method, actionName);
            string body = await ReadBodyAsync();
            request.Content = new StringContent(string.IsNullOrWhiteSpace(body) ? "{}" : body, Encoding.UTF8, Request.ContentType ?? "application/json");
            return await SendAsync(request);
        }

        private IActionResult? AuthorizeOrdenCompraMvcAny(bool requireWrite, params string[] permissionCodes)
        {
            IActionResult? lastDenied = null;
            foreach (string permissionCode in permissionCodes)
            {
                IActionResult? auth = AuthorizeOrdenCompraMvc(permissionCode, requireWrite);
                if (auth == null)
                {
                    return null;
                }

                lastDenied = auth;
            }

            return lastDenied;
        }

        private IActionResult? AuthorizeOrdenCompraMvc(string permissionCode, bool requireWrite)
        {
            if (IsSuperAdminSession() &&
                ProveeduriaMenuBuilder.HasOfficialSuperAdminPermission(permissionCode, requireWrite))
            {
                return null;
            }

            try
            {
                string permisos = Request.Cookies["prmmnu"] ?? string.Empty;
                JsonNode? permission = string.IsNullOrWhiteSpace(permisos)
                    ? null
                    : FindPermission(JsonNode.Parse(permisos), permissionCode);
                bool hasAccess = permission?["Permisos"]?["Acceso"]?.GetValue<int>() == 1 ||
                                 permission?["permisos"]?["acceso"]?.GetValue<int>() == 1;
                bool canWrite = permission?["Permisos"]?["Escritura"]?.GetValue<int>() == 1 ||
                                permission?["permisos"]?["escritura"]?.GetValue<int>() == 1;

                if (hasAccess && (!requireWrite || canWrite))
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
            return $"{Utilerias.UrlBase}api/OrdenesCompra/{actionName}{queryString}";
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
            HttpResponseMessage response;

            try
            {
                response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
            }
            catch (HttpRequestException exception)
            {
                _logger.LogError(
                    exception,
                    "No fue posible conectar con la API de OrdenesCompra. Metodo: {Method}. URL: {Url}.",
                    request.Method,
                    request.RequestUri);

                return StatusCode(StatusCodes.Status502BadGateway, new
                {
                    exitoso = false,
                    mensaje = "No fue posible conectar con el servicio de órdenes de compra. Intenta nuevamente."
                });
            }

            using (response)
            {
                string responseContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json";
                bool isAttachment = response.Content.Headers.ContentDisposition != null;
                bool isTextual =
                    responseContentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase) ||
                    responseContentType.StartsWith("text/", StringComparison.OrdinalIgnoreCase) ||
                    responseContentType.StartsWith("application/problem+json", StringComparison.OrdinalIgnoreCase) ||
                    responseContentType.StartsWith("application/xml", StringComparison.OrdinalIgnoreCase) ||
                    responseContentType.StartsWith("text/csv", StringComparison.OrdinalIgnoreCase);

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

                    fileName = fileName.Trim('"');

                    return File(bytes, responseContentType, fileName);
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
        }

        private async Task<string> ReadBodyAsync()
        {
            using StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8);
            return await reader.ReadToEndAsync();
        }

        private async Task<OrdenCompraPdfModel?> GetOrderDetailForPdfAsync(Guid idOrdenCompra)
        {
            using HttpRequestMessage request = CreateApiRequest(HttpMethod.Get, "ObtenerOrdenCompra");
            using HttpClient client = _clientFactory.CreateClient();
            using HttpResponseMessage response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

            string content = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode || string.IsNullOrWhiteSpace(content))
            {
                return null;
            }

            return JsonSerializer.Deserialize<OrdenCompraPdfModel>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }

        private byte[] BuildOrderPdf(OrdenCompraPdfModel detail)
        {
            byte[]? logo = LoadCheckAppLogo();
            string creatorName = detail.IdUsuarioCreacion.HasValue
                ? detail.UsuarioCreacionNombre.Trim()
                : string.Empty;
            string creatorPosition = detail.IdUsuarioCreacion.HasValue
                ? detail.UsuarioCreacionPuesto.Trim()
                : string.Empty;

            return OrdenCompraPdfComposer.Build(detail, logo, creatorName, creatorPosition, DateTime.Now);
        }

        private byte[]? LoadCheckAppLogo()
        {
            string path = Path.Combine(_environment.WebRootPath, "assets", "media", "logos", "checkapp2.png");
            return System.IO.File.Exists(path) ? System.IO.File.ReadAllBytes(path) : null;
        }
        private static string BuildSafeExportFileName(string prefix, string folio, string extension)
        {
            string safeFolio = string.IsNullOrWhiteSpace(folio)
                ? "sin_folio"
                : string.Concat(folio.Trim().Select(character =>
                    char.IsLetterOrDigit(character) || character == '-' || character == '_' ? character : '_'));

            return $"{prefix}_{safeFolio}{extension}";
        }

        private static Guid TryResolveGuid(string? raw)
        {
            return Guid.TryParse(raw, out Guid value) ? value : Guid.Empty;
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
            return this.ResolveCheckAppUsuarioId();
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
            string normalized = value?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(normalized))
            {
                return string.Empty;
            }

            try
            {
                if (normalized.StartsWith("\"") && normalized.EndsWith("\""))
                {
                    string? deserialized = Newtonsoft.Json.JsonConvert.DeserializeObject<string>(normalized);
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

    }
}
