using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using checklist.Clases;
using checklist.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        private readonly IHttpClientFactory _clientFactory;
        private readonly IConfiguration _configuration;

        public ProductosServiciosController(IHttpClientFactory clientFactory, IConfiguration configuration)
        {
            _clientFactory = clientFactory;
            _configuration = configuration;
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

        [HttpPost("SubirImagenTemporal")]
        public Task<IActionResult> SubirImagenTemporal() => ProxyMultipartAsync("SubirImagenTemporal");

        [HttpPost("LimpiarImagenTemporal")]
        public Task<IActionResult> LimpiarImagenTemporal() => ProxyJsonAsync(HttpMethod.Post, "LimpiarImagenTemporal");

        [HttpPost("GuardarProductoServicio")]
        public Task<IActionResult> GuardarProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "GuardarProductoServicio");

        [HttpPost("BajaProductoServicio")]
        public Task<IActionResult> BajaProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "BajaProductoServicio");

        [HttpPost("ActivarProductoServicio")]
        public Task<IActionResult> ActivarProductoServicio() => ProxyJsonAsync(HttpMethod.Post, "ActivarProductoServicio");

        [HttpGet("ObtenerCombosProductosServicios")]
        public Task<IActionResult> ObtenerCombosProductosServicios() => ProxyGetAsync("ObtenerCombosProductosServicios");

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
            request.Content = new StringContent(string.IsNullOrWhiteSpace(body) ? "{}" : body, Encoding.UTF8, Request.ContentType ?? "application/json");
            return await SendAsync(request);
        }

        private async Task<IActionResult> ProxyMultipartAsync(string actionName)
        {
            using HttpRequestMessage request = CreateApiRequest(HttpMethod.Post, actionName);
            IFormCollection form = await Request.ReadFormAsync();
            MultipartFormDataContent payload = new MultipartFormDataContent();

            foreach (var entry in form)
            {
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

            string? serialized = HttpContext.Session.GetObject<string>(key);
            if (!string.IsNullOrWhiteSpace(serialized))
            {
                return NormalizeSerializedValue(serialized);
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
