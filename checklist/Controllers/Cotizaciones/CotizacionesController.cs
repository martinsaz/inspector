using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using checklist.Clases;
using checklist.Models.Firebase;
using checklist.Services;
using Firebase.Auth;
using Firebase.Auth.Providers;
using Firebase.Database;
using Firebase.Database.Query;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

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
        private readonly EmailServices _emailServices;

        public CotizacionesController(IHttpClientFactory clientFactory, IConfiguration configuration, EmailServices emailServices)
        {
            _clientFactory = clientFactory;
            _configuration = configuration;
            _emailServices = emailServices;
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

        [HttpPost("AutorizarCotizacion")]
        public Task<IActionResult> AutorizarCotizacion() => ProxyJsonAsync(HttpMethod.Post, "AutorizarCotizacion");

        [HttpGet("ExportarCotizacionPdf")]
        public Task<IActionResult> ExportarCotizacionPdf() => ProxyGetAsync("ExportarCotizacionPdf");

        [HttpPost("EnviarCotizacionCorreo")]
        public async Task<IActionResult> EnviarCotizacionCorreo([FromBody] CotizacionCorreoRequest request)
        {
            if (request == null || request.IdCotizacion == Guid.Empty)
            {
                return BadRequest(new { mensaje = "La cotización no está disponible." });
            }

            string correo = (request.Correo ?? string.Empty).Trim();
            string asunto = (request.Asunto ?? string.Empty).Trim();
            string mensaje = (request.Mensaje ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(correo) || string.IsNullOrWhiteSpace(asunto) || string.IsNullOrWhiteSpace(mensaje))
            {
                return BadRequest(new { mensaje = "Correo, asunto y mensaje son obligatorios." });
            }

            if (!IsValidEmail(correo))
            {
                return BadRequest(new { mensaje = "Captura un correo válido." });
            }

            MailRegistro mailRegistro = await LoadMailRegistroAsync();
            if (string.IsNullOrWhiteSpace(mailRegistro.smtpServer) || string.IsNullOrWhiteSpace(mailRegistro.correo) || string.IsNullOrWhiteSpace(mailRegistro.password))
            {
                return StatusCode(500, new { mensaje = "La configuración de correo no está disponible." });
            }

            byte[] pdfBytes = await DownloadApiBytesAsync("ExportarCotizacionPdf", new[]
            {
                new KeyValuePair<string, string?>("idCotizacion", request.IdCotizacion.ToString())
            });

            if (pdfBytes.Length == 0)
            {
                return StatusCode(500, new { mensaje = "No fue posible adjuntar el PDF de la cotización." });
            }

            mailRegistro.asunto = asunto;
            mailRegistro.bodyHTML = BuildEmailBodyHtml(mensaje, request.Folio);
            string result = await _emailServices.EnviarCorreoAsync(
                request.ClienteNombre?.Trim() ?? correo,
                correo,
                mailRegistro,
                new[]
                {
                    new EmailAttachment
                    {
                        FileName = BuildPdfFileName(request.Folio),
                        Content = pdfBytes,
                        ContentType = "application/pdf"
                    }
                });

            if (!string.Equals(result, "Ok", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(500, new { mensaje = "No fue posible enviar el correo.", detalle = result });
            }

            return Ok(new { exito = true, mensaje = "La cotización se envió por correo correctamente." });
        }

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

        private HttpRequestMessage CreateApiRequest(HttpMethod method, string actionName, IEnumerable<KeyValuePair<string, string?>>? extraQuery = null)
        {
            HttpRequestMessage request = new HttpRequestMessage(method, BuildApiUrl(actionName, extraQuery));
            AddProxyHeaders(request);
            return request;
        }

        private string BuildApiUrl(string actionName, IEnumerable<KeyValuePair<string, string?>>? extraQuery = null)
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
            if (extraQuery != null)
            {
                query.AddRange(extraQuery);
            }
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

        private async Task<byte[]> DownloadApiBytesAsync(string actionName, IEnumerable<KeyValuePair<string, string?>> extraQuery)
        {
            using HttpRequestMessage request = CreateApiRequest(HttpMethod.Get, actionName, extraQuery);
            using HttpClient client = _clientFactory.CreateClient();
            using HttpResponseMessage response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
            if (!response.IsSuccessStatusCode)
            {
                return Array.Empty<byte>();
            }

            return await response.Content.ReadAsByteArrayAsync();
        }

        private async Task<MailRegistro> LoadMailRegistroAsync()
        {
            string fireUser = _configuration.GetValue<string>("fireBdata:fireUser") ?? string.Empty;
            string fireClave = _configuration.GetValue<string>("fireBdata:fireClave") ?? string.Empty;
            var config = new FirebaseAuthConfig
            {
                ApiKey = _configuration.GetValue<string>("fireBdata:fireApiKey"),
                AuthDomain = _configuration.GetValue<string>("fireBdata:fireAuthDomain"),
                Providers = new FirebaseAuthProvider[] { new EmailProvider() }
            };
            var authClient = new FirebaseAuthClient(config);
            await authClient.SignInWithEmailAndPasswordAsync(fireUser, fireClave);
            var firebaseClient = new FirebaseClient(
                _configuration.GetValue<string>("fireBdata:fireDatabaseUrl"),
                new FirebaseOptions { AuthTokenAsyncFactory = () => Task.FromResult(authClient.User.Credential.IdToken) });

            MailRegistro mailRegistro = new MailRegistro();
            var datosMail = await firebaseClient.Child("MailRegistro").OnceAsync<object>();
            foreach (var mail in datosMail)
            {
                switch ((mail.Key ?? string.Empty).Trim().ToLowerInvariant())
                {
                    case "asunto":
                        mailRegistro.asunto = mail.Object?.ToString();
                        break;
                    case "bodyhtml":
                        mailRegistro.bodyHTML = mail.Object?.ToString();
                        break;
                    case "correo":
                        mailRegistro.correo = mail.Object?.ToString();
                        break;
                    case "password":
                        mailRegistro.password = mail.Object?.ToString();
                        break;
                    case "puerto":
                        mailRegistro.puerto = mail.Object == null ? null : Convert.ToInt32(mail.Object);
                        break;
                    case "smtpserver":
                        mailRegistro.smtpServer = mail.Object?.ToString();
                        break;
                    case "ssl":
                        mailRegistro.ssl = mail.Object != null && Convert.ToBoolean(mail.Object);
                        break;
                }
            }

            authClient.SignOut();
            return mailRegistro;
        }

        private static string BuildEmailBodyHtml(string mensaje, string? folio)
        {
            string safeMessage = WebUtility.HtmlEncode(mensaje ?? string.Empty).Replace("\r\n", "<br/>").Replace("\n", "<br/>");
            string safeFolio = WebUtility.HtmlEncode(folio ?? string.Empty);
            return $"<p>{safeMessage}</p><p><strong>Cotización:</strong> {safeFolio}</p>";
        }

        private static string BuildPdfFileName(string? folio)
        {
            string cleanFolio = new string((folio ?? string.Empty).Where(ch => char.IsLetterOrDigit(ch) || ch == '-' || ch == '_').ToArray());
            if (string.IsNullOrWhiteSpace(cleanFolio))
            {
                cleanFolio = "cotizacion";
            }

            return $"cotizacion_{cleanFolio}.pdf";
        }

        private static bool IsValidEmail(string correo)
        {
            try
            {
                _ = new System.Net.Mail.MailAddress(correo);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public sealed class CotizacionCorreoRequest
        {
            public Guid IdCotizacion { get; set; }
            public string Correo { get; set; } = string.Empty;
            public string Asunto { get; set; } = string.Empty;
            public string Mensaje { get; set; } = string.Empty;
            public string Folio { get; set; } = string.Empty;
            public string ClienteNombre { get; set; } = string.Empty;
        }
    }
}
