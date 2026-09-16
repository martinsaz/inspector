using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using checklist.Clases;
using checklist.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Globalization;

namespace checklist.Controllers.ProductosServicios
{
    [Authorize]
    [Route("[controller]")]
    public class ProductosServiciosController : Controller
    {
        private const string ProxyEmpresaIdHeader = "X-ProductosServicios-Proxy-EmpresaId";
        private const string ProxyEmpresaKeyHeader = "X-ProductosServicios-Proxy-Empresa";
        private const string ProxyUsuarioIdHeader = "X-ProductosServicios-Proxy-UsuarioId";
        private const string ProxyTimestampHeader = "X-ProductosServicios-Proxy-Timestamp";
        private const string ProxySignatureHeader = "X-ProductosServicios-Proxy-Signature";
        private const string PermissionCodeFallback = "05001000";
        private const string AbcPermissionCode = "05001001";
        private const string CategoriasPermissionCode = "05001003";
        private const string MarcasPermissionCode = "05001004";
        private const string UnidadesMedidaPermissionCode = "05001005";
        private static readonly HashSet<string> CategoriaActions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Categorias",
            "ObtenerCategoriasProductosServicios",
            "ObtenerCategoriaProductoServicio",
            "GuardarCategoriaProductoServicio",
            "BajaCategoriaProductoServicio",
            "ActivarCategoriaProductoServicio",
            "ObtenerCatalogoCategoriasProductosServicios",
            "ExportarCategoriasProductosServicios"
        };
        private static readonly HashSet<string> MarcaActions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Marcas",
            "ObtenerMarcasProductosServicios",
            "ObtenerMarcaProductoServicio",
            "GuardarMarcaProductoServicio",
            "GuardarTagProductoServicio",
            "BajaMarcaProductoServicio",
            "ActivarMarcaProductoServicio",
            "ObtenerCatalogoMarcasProductosServicios",
            "ExportarMarcasProductosServicios"
        };
        private static readonly HashSet<string> UnidadMedidaActions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "UnidadesMedida",
            "ObtenerUnidadesMedidaProductosServicios",
            "ObtenerUnidadMedidaProductoServicio",
            "GuardarUnidadMedidaProductoServicio",
            "BajaUnidadMedidaProductoServicio",
            "ActivarUnidadMedidaProductoServicio",
            "ObtenerCatalogoUnidadesMedidaProductosServicios",
            "ExportarUnidadesMedidaProductosServicios"
        };

        private readonly IHttpClientFactory _clientFactory;
        private readonly IConfiguration _configuration;
        private static readonly JsonSerializerOptions ProxyJsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);

        public ProductosServiciosController(IHttpClientFactory clientFactory, IConfiguration configuration)
        {
            _clientFactory = clientFactory;
            _configuration = configuration;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            string? companyClaim = User.FindFirstValue(ClaimTypes.Sid);
            string? idClaim = User.FindFirstValue(ClaimTypes.SerialNumber);
            string? userClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            bool ambiguous = new[] { ClaimTypes.Sid, ClaimTypes.SerialNumber, ClaimTypes.NameIdentifier }
                .Any(type => User.FindAll(type).Select(c => c.Value.Trim()).Distinct(type == ClaimTypes.NameIdentifier ? StringComparer.Ordinal : StringComparer.OrdinalIgnoreCase).Count() != 1);
            if (User.Identity?.IsAuthenticated != true || ambiguous ||
                !Guid.TryParse(idClaim, out Guid id) || id == Guid.Empty ||
                string.IsNullOrWhiteSpace(companyClaim) || string.IsNullOrWhiteSpace(userClaim) ||
                companyClaim.Length > 256 || userClaim.Length > 256 || companyClaim.Any(char.IsControl) || userClaim.Any(char.IsControl) ||
                string.IsNullOrWhiteSpace(_configuration["fireBdata:fireClave"]))
            { context.Result = Unauthorized(new { message = "No fue posible validar la sesión activa." }); return; }
            string? sessionId = ResolveSessionValue("idEmpresa"), sessionCompany = ResolveSessionValue("empresa");
            if ((sessionId != null && (!Guid.TryParse(sessionId, out var sid) || sid != id)) ||
                (sessionCompany != null && !string.Equals(sessionCompany.Trim(), companyClaim.Trim(), StringComparison.OrdinalIgnoreCase)))
            { context.Result = StatusCode(403, new { message = "La empresa no coincide con la sesión activa." }); return; }
            foreach (var entry in Request.Query)
                if (string.Equals(entry.Key, "empresa", StringComparison.OrdinalIgnoreCase) &&
                    entry.Value.Any(v => !string.Equals(v?.Trim(), companyClaim.Trim(), StringComparison.OrdinalIgnoreCase)))
                { context.Result = StatusCode(403, new { message = "La empresa no coincide con la sesión activa." }); return; }
            if (!await HasProductosServiciosAccessAsync())
            { context.Result = StatusCode(403, new { message = "No tienes permiso para acceder a Productos y Servicios." }); return; }
            await next();
        }

        [HttpGet("Index")]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet("Categorias")]
        public IActionResult Categorias()
        {
            return View();
        }

        [HttpGet("Marcas")]
        public IActionResult Marcas()
        {
            return View();
        }

        [HttpGet("UnidadesMedida")]
        public IActionResult UnidadesMedida()
        {
            return View();
        }

        [HttpGet("ObtenerProductosServicios")]
        public Task<IActionResult> ObtenerProductosServicios() => ProxyGetAsync("ObtenerProductosServicios");

        [HttpGet("ObtenerProductoServicio")]
        public Task<IActionResult> ObtenerProductoServicio() => ProxyGetAsync("ObtenerProductoServicio");

        [HttpGet("ObtenerFichaTecnicaProductoServicio")]
        public Task<IActionResult> ObtenerFichaTecnicaProductoServicio() => ProxyGetAsync("ObtenerFichaTecnicaProductoServicio");

        [HttpGet("ExportarFichaTecnicaProductoServicioPdf")]
        public Task<IActionResult> ExportarFichaTecnicaProductoServicioPdf() => ProxyFileAsync("ExportarFichaTecnicaProductoServicioPdf");

        [HttpPost("SubirImagenTemporal")]
        public Task<IActionResult> SubirImagenTemporal() => ProxyMultipartAsync("SubirImagenTemporal");

        [HttpPost("SubirMultimediaTemporal")]
        public Task<IActionResult> SubirMultimediaTemporal() => ProxyMultipartAsync("SubirMultimediaTemporal");

        [HttpPost("LimpiarImagenTemporal")]
        public Task<IActionResult> LimpiarImagenTemporal() => ProxyJsonAsync(HttpMethod.Post, "LimpiarImagenTemporal");

        [HttpPost("LimpiarMultimediaTemporal")]
        public Task<IActionResult> LimpiarMultimediaTemporal() => ProxyJsonAsync(HttpMethod.Post, "LimpiarMultimediaTemporal");

        [HttpPost("GuardarProductoServicio")]
        public Task<IActionResult> GuardarProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "GuardarProductoServicio");

        [HttpPost("BajaProductoServicio")]
        public Task<IActionResult> BajaProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "BajaProductoServicio");

        [HttpPost("ActivarProductoServicio")]
        public Task<IActionResult> ActivarProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "ActivarProductoServicio");

        [HttpPost("GuardarPresentacionVentaProductoServicio")]
        public Task<IActionResult> GuardarPresentacionVentaProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "GuardarPresentacionVentaProductoServicio");

        [HttpPost("BajaPresentacionVentaProductoServicio")]
        public Task<IActionResult> BajaPresentacionVentaProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "BajaPresentacionVentaProductoServicio");

        [HttpPost("CalcularPresentacionesVentaProductoServicio")]
        public Task<IActionResult> CalcularPresentacionesVentaProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "CalcularPresentacionesVentaProductoServicio");

        [HttpGet("ObtenerCombosProductosServicios")]
        public Task<IActionResult> ObtenerCombosProductosServicios() => ProxyGetAsync("ObtenerCombosProductosServicios");

        [HttpGet("BuscarCatalogosSatProductoServicio")]
        public Task<IActionResult> BuscarCatalogosSatProductoServicio() => ProxyGetAsync("BuscarCatalogosSatProductoServicio");

        [HttpGet("ObtenerResumenProductosServicios")]
        public Task<IActionResult> ObtenerResumenProductosServicios() => ProxyGetAsync("ObtenerResumenProductosServicios");

        [HttpGet("ExportarProductosServicios")]
        public Task<IActionResult> ExportarProductosServicios() => ProxyFileAsync("ExportarProductosServicios");

        [HttpGet("ObtenerCategoriasProductosServicios")]
        public Task<IActionResult> ObtenerCategoriasProductosServicios() => ProxyGetAsync("ObtenerCategoriasProductosServicios");

        [HttpGet("ObtenerCategoriaProductoServicio")]
        public Task<IActionResult> ObtenerCategoriaProductoServicio() => ProxyGetAsync("ObtenerCategoriaProductoServicio");

        [HttpPost("GuardarCategoriaProductoServicio")]
        public Task<IActionResult> GuardarCategoriaProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "GuardarCategoriaProductoServicio");

        [HttpPost("BajaCategoriaProductoServicio")]
        public Task<IActionResult> BajaCategoriaProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "BajaCategoriaProductoServicio");

        [HttpPost("ActivarCategoriaProductoServicio")]
        public Task<IActionResult> ActivarCategoriaProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "ActivarCategoriaProductoServicio");

        [HttpGet("ObtenerCatalogoCategoriasProductosServicios")]
        public Task<IActionResult> ObtenerCatalogoCategoriasProductosServicios() => ProxyGetAsync("ObtenerCatalogoCategoriasProductosServicios");

        [HttpGet("ExportarCategoriasProductosServicios")]
        public Task<IActionResult> ExportarCategoriasProductosServicios() => ProxyFileAsync("ExportarCategoriasProductosServicios");

        [HttpGet("ObtenerMarcasProductosServicios")]
        public Task<IActionResult> ObtenerMarcasProductosServicios() => ProxyGetAsync("ObtenerMarcasProductosServicios");

        [HttpGet("ObtenerMarcaProductoServicio")]
        public Task<IActionResult> ObtenerMarcaProductoServicio() => ProxyGetAsync("ObtenerMarcaProductoServicio");

        [HttpPost("GuardarMarcaProductoServicio")]
        public Task<IActionResult> GuardarMarcaProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "GuardarMarcaProductoServicio");

        [HttpPost("GuardarTagProductoServicio")]
        public Task<IActionResult> GuardarTagProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "GuardarTagProductoServicio");

        [HttpPost("BajaMarcaProductoServicio")]
        public Task<IActionResult> BajaMarcaProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "BajaMarcaProductoServicio");

        [HttpPost("ActivarMarcaProductoServicio")]
        public Task<IActionResult> ActivarMarcaProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "ActivarMarcaProductoServicio");

        [HttpGet("ObtenerCatalogoMarcasProductosServicios")]
        public Task<IActionResult> ObtenerCatalogoMarcasProductosServicios() => ProxyGetAsync("ObtenerCatalogoMarcasProductosServicios");

        [HttpGet("ExportarMarcasProductosServicios")]
        public Task<IActionResult> ExportarMarcasProductosServicios() => ProxyFileAsync("ExportarMarcasProductosServicios");

        [HttpGet("ObtenerUnidadesMedidaProductosServicios")]
        public Task<IActionResult> ObtenerUnidadesMedidaProductosServicios() => ProxyGetAsync("ObtenerUnidadesMedidaProductosServicios");

        [HttpGet("ObtenerUnidadMedidaProductoServicio")]
        public Task<IActionResult> ObtenerUnidadMedidaProductoServicio() => ProxyGetAsync("ObtenerUnidadMedidaProductoServicio");

        [HttpPost("GuardarUnidadMedidaProductoServicio")]
        public Task<IActionResult> GuardarUnidadMedidaProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "GuardarUnidadMedidaProductoServicio");

        [HttpPost("GuardarColeccionProductoServicio")]
        public Task<IActionResult> GuardarColeccionProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "GuardarColeccionProductoServicio");

        [HttpPost("GuardarPaqueteProductoServicio")]
        public Task<IActionResult> GuardarPaqueteProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "GuardarPaqueteProductoServicio");

        [HttpPost("GuardarAtributoProductoServicio")]
        public Task<IActionResult> GuardarAtributoProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "GuardarAtributoProductoServicio");

        [HttpPost("GuardarValorAtributoProductoServicio")]
        public Task<IActionResult> GuardarValorAtributoProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "GuardarValorAtributoProductoServicio");

        [HttpGet("ObtenerValoresAtributoProductoServicio")]
        public Task<IActionResult> ObtenerValoresAtributoProductoServicio() => ProxyGetAsync("ObtenerValoresAtributoProductoServicio");

        [HttpPost("BajaUnidadMedidaProductoServicio")]
        public Task<IActionResult> BajaUnidadMedidaProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "BajaUnidadMedidaProductoServicio");

        [HttpPost("ActivarUnidadMedidaProductoServicio")]
        public Task<IActionResult> ActivarUnidadMedidaProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "ActivarUnidadMedidaProductoServicio");

        [HttpGet("ObtenerCatalogoUnidadesMedidaProductosServicios")]
        public Task<IActionResult> ObtenerCatalogoUnidadesMedidaProductosServicios() => ProxyGetAsync("ObtenerCatalogoUnidadesMedidaProductosServicios");

        [HttpGet("ExportarUnidadesMedidaProductosServicios")]
        public Task<IActionResult> ExportarUnidadesMedidaProductosServicios() => ProxyFileAsync("ExportarUnidadesMedidaProductosServicios");

        [HttpGet("ObtenerExistenciaProductoServicio")]
        public Task<IActionResult> ObtenerExistenciaProductoServicio() => ProxyGetAsync("ObtenerExistenciaProductoServicio");

        [HttpGet("ObtenerMovimientosInventarioProductoServicio")]
        public Task<IActionResult> ObtenerMovimientosInventarioProductoServicio() => ProxyGetAsync("ObtenerMovimientosInventarioProductoServicio");

        [HttpPost("RegistrarEntradaInventarioProductoServicio")]
        public Task<IActionResult> RegistrarEntradaInventarioProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "RegistrarEntradaInventarioProductoServicio");

        [HttpPost("RegistrarSalidaInventarioProductoServicio")]
        public Task<IActionResult> RegistrarSalidaInventarioProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "RegistrarSalidaInventarioProductoServicio");

        [HttpPost("RegistrarAjustePositivoInventarioProductoServicio")]
        public Task<IActionResult> RegistrarAjustePositivoInventarioProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "RegistrarAjustePositivoInventarioProductoServicio");

        [HttpPost("RegistrarAjusteNegativoInventarioProductoServicio")]
        public Task<IActionResult> RegistrarAjusteNegativoInventarioProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "RegistrarAjusteNegativoInventarioProductoServicio");

        private async Task<IActionResult> ProxyGetAsync(string actionName)
        {
            using HttpRequestMessage request = CreateApiRequest(HttpMethod.Get, actionName);
            return await SendAsync(request);
        }

        private async Task<IActionResult> ProxyJsonAsync(HttpMethod method, string actionName)
        {
            using HttpRequestMessage request = CreateApiRequest(method, actionName);
            string body = await ReadBodyAsync();
            string rewrittenBody = RewriteJsonBodyWithServerEmpresa(body);
            request.Content = new StringContent(rewrittenBody, Encoding.UTF8, "application/json");
            return await SendAsync(request);
        }

        private async Task<IActionResult> ProxyMultipartAsync(string actionName)
        {
            using HttpRequestMessage request = CreateApiRequest(HttpMethod.Post, actionName);
            IFormCollection form = await Request.ReadFormAsync();
            MultipartFormDataContent payload = new MultipartFormDataContent();

            foreach (var entry in form)
            {
                if (IsTenantFormField(entry.Key))
                {
                    continue;
                }

                foreach (string? value in entry.Value)
                {
                    payload.Add(new StringContent(value ?? string.Empty, Encoding.UTF8), entry.Key);
                }
            }

            foreach (IFormFile file in form.Files)
            {
                MemoryStream buffer = new MemoryStream();
                await file.CopyToAsync(buffer);
                buffer.Position = 0;

                StreamContent fileContent = new StreamContent(buffer);
                if (!string.IsNullOrWhiteSpace(file.ContentType))
                {
                    fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse(file.ContentType);
                }

                payload.Add(fileContent, file.Name, file.FileName ?? "archivo.bin");
            }

            request.Content = payload;
            return await SendAsync(request);
        }

        private async Task<IActionResult> ProxyFileAsync(string actionName)
        {
            using HttpRequestMessage request = CreateApiRequest(HttpMethod.Get, actionName);
            return await SendAsync(request, asFile: true);
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
            return $"{Utilerias.UrlBase}api/ProductosServicios/{actionName}{queryString}";
        }

        private string RewriteJsonBodyWithServerEmpresa(string? body)
        {
            JsonNode? parsedBody = null;
            if (!string.IsNullOrWhiteSpace(body))
            {
                try
                {
                    parsedBody = JsonNode.Parse(body);
                }
                catch (JsonException)
                {
                    parsedBody = null;
                }
            }

            JsonObject payload = parsedBody as JsonObject ?? new JsonObject();
            payload["idEmpresa"] = ResolveIdEmpresa();
            return payload.ToJsonString(ProxyJsonOptions);
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

        private async Task<IActionResult> SendAsync(HttpRequestMessage request, bool asFile = false)
        {
            using HttpClient client = _clientFactory.CreateClient();
            using HttpResponseMessage response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

            if (asFile)
            {
                if (!response.IsSuccessStatusCode)
                {
                    string errorContent = await response.Content.ReadAsStringAsync();
                    if (string.IsNullOrWhiteSpace(errorContent))
                    {
                        return StatusCode((int)response.StatusCode);
                    }

                    return new ContentResult
                    {
                        Content = errorContent,
                        ContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json",
                        StatusCode = (int)response.StatusCode
                    };
                }

                byte[] bytes = await response.Content.ReadAsByteArrayAsync();
                string contentType = response.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";
                string? fileName = response.Content.Headers.ContentDisposition?.FileNameStar ?? response.Content.Headers.ContentDisposition?.FileName;
                fileName = string.IsNullOrWhiteSpace(fileName) ? null : fileName.Trim('"');
                return File(bytes, contentType, fileName ?? "exportacion");
            }

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

        private string ResolveCorreo()
        {
            return ResolveSessionValue("emailUser")
                ?? User.FindFirstValue(ClaimTypes.Email)
                ?? string.Empty;
        }

        private static bool IsTenantFormField(string key)
        {
            return string.Equals(key, "idEmpresa", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(key, "empresa", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(key, "cadena", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(key, "connectionString", StringComparison.OrdinalIgnoreCase);
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
            if (!string.IsNullOrWhiteSpace(serialized))
            {
                return NormalizeSerializedValue(serialized);
            }

            return null;
        }

        private async Task<bool> HasProductosServiciosAccessAsync()
        {
            string permissionCode = ResolvePermissionCodeForCurrentAction();

            string idEmpresa = ResolveIdEmpresa();
            string empresa = ResolveEmpresa();
            string cadena = ResolveSessionValue("cadena") ?? User.FindFirstValue(ClaimTypes.Uri) ?? string.Empty;
            string idRol = await ResolveCurrentRoleIdAsync(idEmpresa, empresa, cadena)
                ?? User.FindFirstValue(ClaimTypes.Role)
                ?? ResolveSessionValue("idRol")
                ?? string.Empty;
            if (string.IsNullOrWhiteSpace(idEmpresa) ||
                string.IsNullOrWhiteSpace(empresa) ||
                string.IsNullOrWhiteSpace(cadena) ||
                string.IsNullOrWhiteSpace(idRol))
            {
                return false;
            }

            string url = string.Format("{0}GetRoles?idEmpresa={1}&empresa={3}&cadena={4}&id={2}",
                Utilerias.UrlBase,
                Uri.EscapeDataString(idEmpresa),
                Uri.EscapeDataString(idRol),
                Uri.EscapeDataString(empresa),
                Uri.EscapeDataString(cadena));

            try
            {
                using HttpClient client = _clientFactory.CreateClient();
                using HttpResponseMessage response = await client.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                {
                    return false;
                }

                string content = await response.Content.ReadAsStringAsync();
                JsonNode? parsed = JsonNode.Parse(content);
                JsonObject? role = parsed as JsonArray is { Count: > 0 } roles ? roles[0] as JsonObject : null;
                string permisos = role?["permisos"]?.GetValue<string>() ?? role?["Permisos"]?.GetValue<string>() ?? string.Empty;
                JsonNode? permission = FindPermission(JsonNode.Parse(permisos), permissionCode);
                return permission?["Permisos"]?["Acceso"]?.GetValue<int>() == 1 ||
                       permission?["permisos"]?["acceso"]?.GetValue<int>() == 1;
            }
            catch (JsonException)
            {
                return false;
            }
        }

        private string ResolvePermissionCodeForCurrentAction()
        {
            string actionName = ControllerContext?.ActionDescriptor?.ActionName
                ?? RouteData?.Values["action"]?.ToString()
                ?? string.Empty;
            if (CategoriaActions.Contains(actionName))
            {
                return CategoriasPermissionCode;
            }

            if (MarcaActions.Contains(actionName))
            {
                return MarcasPermissionCode;
            }

            if (UnidadMedidaActions.Contains(actionName))
            {
                return UnidadesMedidaPermissionCode;
            }

            return string.Equals(actionName, "Index", StringComparison.OrdinalIgnoreCase) ||
                   string.IsNullOrWhiteSpace(actionName)
                ? AbcPermissionCode
                : AbcPermissionCode;
        }

        private async Task<string?> ResolveCurrentRoleIdAsync(string idEmpresa, string empresa, string cadena)
        {
            string correo = ResolveCorreo();
            if (string.IsNullOrWhiteSpace(idEmpresa) ||
                string.IsNullOrWhiteSpace(empresa) ||
                string.IsNullOrWhiteSpace(cadena) ||
                string.IsNullOrWhiteSpace(correo))
            {
                return null;
            }

            try
            {
                using HttpClient client = _clientFactory.CreateClient();
                string urlUsuario = string.Format("{0}api/Usuario/ObtenerUsuarioPorEmail?idEmpresa={1}&email={2}&empresa={3}&cadena={4}",
                    Utilerias.UrlBase,
                    Uri.EscapeDataString(idEmpresa),
                    Uri.EscapeDataString(correo),
                    Uri.EscapeDataString(empresa),
                    Uri.EscapeDataString(cadena));

                using HttpResponseMessage response = await client.GetAsync(urlUsuario);
                if (!response.IsSuccessStatusCode)
                {
                    return null;
                }

                string content = await response.Content.ReadAsStringAsync();
                JsonNode? parsed = JsonNode.Parse(content);
                JsonObject? usuario = parsed as JsonArray is { Count: > 0 } usuarios ? usuarios[0] as JsonObject : null;
                string idUsuario = usuario?["id"]?.GetValue<string>() ?? usuario?["Id"]?.GetValue<string>() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(idUsuario))
                {
                    return null;
                }

                string urlDetalle = string.Format("{0}api/Usuario/ObtenerUsuario?idEmpresa={1}&id={2}&empresa={3}&cadena={4}",
                    Utilerias.UrlBase,
                    Uri.EscapeDataString(idEmpresa),
                    Uri.EscapeDataString(idUsuario),
                    Uri.EscapeDataString(empresa),
                    Uri.EscapeDataString(cadena));

                using HttpResponseMessage detailResponse = await client.GetAsync(urlDetalle);
                if (!detailResponse.IsSuccessStatusCode)
                {
                    return null;
                }

                string detailContent = await detailResponse.Content.ReadAsStringAsync();
                JsonNode? detailParsed = JsonNode.Parse(detailContent);
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

        private static JsonNode? FindPermission(JsonNode? node, string permissionCode)
        {
            if (node is JsonArray array)
            {
                foreach (JsonNode? child in array)
                {
                    JsonNode? match = FindPermission(child, permissionCode);
                    if (match != null) return match;
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

        private static string NormalizeSerializedValue(string value)
        {
            string trimmed = value.Trim();
            if (trimmed.Length >= 2 && trimmed.StartsWith('"') && trimmed.EndsWith('"'))
            {
                return trimmed.Substring(1, trimmed.Length - 2);
            }

            return trimmed;
        }

        private static string? NormalizeEmpresaId(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            string trimmed = value.Trim();
            if (Guid.TryParse(trimmed, out Guid parsed) && parsed != Guid.Empty)
            {
                return parsed.ToString("D");
            }

            if (trimmed.All(char.IsDigit) &&
                trimmed.Length <= 12 &&
                ulong.TryParse(trimmed, NumberStyles.None, CultureInfo.InvariantCulture, out ulong numericEmpresaId) &&
                numericEmpresaId > 0)
            {
                return $"00000000-0000-0000-0000-{numericEmpresaId.ToString(CultureInfo.InvariantCulture).PadLeft(12, '0')}";
            }

            return trimmed;
        }
    }
}
