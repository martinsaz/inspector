using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using checklist.Clases;
using checklist.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace checklist.Controllers.Kits;

[Authorize]
[Route("[controller]")]
public sealed class KitsController : Controller
{
    private const string ProxyEmpresaIdHeader = "X-ProductosServicios-Proxy-EmpresaId";
    private const string ProxyEmpresaKeyHeader = "X-ProductosServicios-Proxy-Empresa";
    private const string ProxyUsuarioIdHeader = "X-ProductosServicios-Proxy-UsuarioId";
    private const string ProxyTimestampHeader = "X-ProductosServicios-Proxy-Timestamp";
    private const string ProxySignatureHeader = "X-ProductosServicios-Proxy-Signature";
    private const string SuperAdminRoleCookie = "chkRoleName";
    private const string ReadPermissionCode = "05001010";
    private const string WritePermissionCode = "05001011";
    private static readonly string[] TenantInputNames =
    {
        "idEmpresa", "empresaId", "tenantId", "empresa", "empresaKey",
        "cadena", "connectionString", "server", "database", "password"
    };

    private readonly IHttpClientFactory _clientFactory;
    private readonly IConfiguration _configuration;

    public KitsController(IHttpClientFactory clientFactory, IConfiguration configuration)
    {
        _clientFactory = clientFactory;
        _configuration = configuration;
    }

    [HttpGet("Index")]
    public IActionResult Index()
    {
        IActionResult? authorization = AuthorizeRead();
        if (authorization != null)
        {
            return authorization;
        }

        ViewBag.PuedeAdministrarKits = CanWrite();
        return View("~/Views/Kits/Index.cshtml");
    }

    [HttpGet("Consultar")]
    public async Task<IActionResult> Consultar()
    {
        IActionResult? authorization = AuthorizeRead();
        if (authorization != null)
        {
            return authorization;
        }

        using HttpRequestMessage request = new(HttpMethod.Get, BuildApiUrl());
        AddSignedTenantHeaders(request);
        using HttpClient client = _clientFactory.CreateClient();
        using HttpResponseMessage response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
        string content = await response.Content.ReadAsStringAsync();
        return new ContentResult
        {
            Content = string.IsNullOrWhiteSpace(content) ? "[]" : content,
            ContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json",
            StatusCode = (int)response.StatusCode
        };
    }

    [HttpGet("Opciones")]
    public Task<IActionResult> Opciones() => ForwardAsync(HttpMethod.Get, "Opciones", requireWrite: false);

    [HttpPost("ResolverPrecio")]
    public Task<IActionResult> ResolverPrecio() => ForwardAsync(HttpMethod.Post, "ResolverPrecio", requireWrite: true);

    [HttpPost("Crear")]
    public Task<IActionResult> Crear() => ForwardAsync(HttpMethod.Post, string.Empty, requireWrite: true);

    [HttpGet("Detalle/{idKit:guid}")]
    public Task<IActionResult> Detalle(Guid idKit) => ForwardAsync(HttpMethod.Get, idKit.ToString(), requireWrite: false);

    [HttpPut("Actualizar/{idKit:guid}")]
    public Task<IActionResult> Actualizar(Guid idKit) => ForwardAsync(HttpMethod.Put, idKit.ToString(), requireWrite: true);

    [HttpPost("Baja/{idKit:guid}")]
    public Task<IActionResult> Baja(Guid idKit) => ForwardAsync(HttpMethod.Post, $"{idKit}/Baja", requireWrite: true);

    [HttpPost("Reactivar/{idKit:guid}")]
    public Task<IActionResult> Reactivar(Guid idKit) => ForwardAsync(HttpMethod.Post, $"{idKit}/Reactivar", requireWrite: true);

    [HttpPost("SubirImagenTemporal")]
    [RequestFormLimits(MultipartBodyLengthLimit = 12L * 1024L * 1024L)]
    [RequestSizeLimit(12L * 1024L * 1024L)]
    public Task<IActionResult> SubirImagenTemporal() => ForwardAsync(HttpMethod.Post, "SubirImagenTemporal", requireWrite: true);

    [HttpPost("LimpiarImagenTemporal")]
    public Task<IActionResult> LimpiarImagenTemporal() => ForwardAsync(HttpMethod.Post, "LimpiarImagenTemporal", requireWrite: true);

    private async Task<IActionResult> ForwardAsync(HttpMethod method, string path, bool requireWrite)
    {
        IActionResult? authorization = requireWrite ? (CanWrite() ? null : Forbid()) : AuthorizeRead();
        if (authorization != null) return authorization;

        using HttpRequestMessage request = new(method, BuildApiUrl(path));
        AddSignedTenantHeaders(request);
        if (method != HttpMethod.Get && method != HttpMethod.Head)
        {
            request.Content = new StreamContent(Request.Body);
            if (!string.IsNullOrWhiteSpace(Request.ContentType))
                request.Content.Headers.ContentType = System.Net.Http.Headers.MediaTypeHeaderValue.Parse(Request.ContentType);
        }
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

    private string BuildApiUrl(string path = "")
    {
        List<KeyValuePair<string, string?>> query = new();
        foreach ((string key, Microsoft.Extensions.Primitives.StringValues values) in Request.Query)
        {
            if (TenantInputNames.Contains(key, StringComparer.OrdinalIgnoreCase))
            {
                continue;
            }

            foreach (string? value in values)
            {
                query.Add(new KeyValuePair<string, string?>(key, value));
            }
        }

        query.Add(new KeyValuePair<string, string?>("idEmpresa", ResolveIdEmpresa()));
        string suffix = string.IsNullOrWhiteSpace(path) ? string.Empty : "/" + path.Trim('/');
        return $"{Utilerias.UrlBase}api/Kits{suffix}{QueryString.Create(query).ToUriComponent()}";
    }

    private void AddSignedTenantHeaders(HttpRequestMessage request)
    {
        string empresaId = ResolveIdEmpresa();
        string empresa = ResolveEmpresa();
        string usuarioId = ResolveUsuarioId() ?? string.Empty;
        string timestamp = DateTimeOffset.UtcNow.ToString("O");
        string secret = _configuration["fireBdata:fireClave"] ?? string.Empty;
        string payload = string.Join('\n', empresaId.Trim(), empresa.Trim().ToUpperInvariant(), usuarioId.Trim(), timestamp.Trim());
        using HMACSHA256 hmac = new(Encoding.UTF8.GetBytes(secret));
        string signature = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload)));

        request.Headers.TryAddWithoutValidation(ProxyEmpresaIdHeader, empresaId);
        request.Headers.TryAddWithoutValidation(ProxyEmpresaKeyHeader, empresa);
        request.Headers.TryAddWithoutValidation(ProxyUsuarioIdHeader, usuarioId);
        request.Headers.TryAddWithoutValidation(ProxyTimestampHeader, timestamp);
        request.Headers.TryAddWithoutValidation(ProxySignatureHeader, signature);
    }

    private IActionResult? AuthorizeRead()
        => HasPermission(ReadPermissionCode, requireWrite: false) ? null : Forbid();

    private bool CanWrite()
        => HasPermission(ReadPermissionCode, requireWrite: false) &&
           HasPermission(WritePermissionCode, requireWrite: true);

    private bool HasPermission(string code, bool requireWrite)
    {
        if (IsSuperAdminSession() && ProveeduriaMenuBuilder.HasOfficialSuperAdminPermission(code, requireWrite))
        {
            return true;
        }

        try
        {
            string serialized = Request.Cookies["prmmnu"] ?? string.Empty;
            JsonNode? permission = string.IsNullOrWhiteSpace(serialized) ? null : FindPermission(JsonNode.Parse(serialized), code);
            int access = permission?["Permisos"]?["Acceso"]?.GetValue<int>()
                ?? permission?["permisos"]?["acceso"]?.GetValue<int>()
                ?? 0;
            int write = permission?["Permisos"]?["Escritura"]?.GetValue<int>()
                ?? permission?["permisos"]?["escritura"]?.GetValue<int>()
                ?? 0;
            return access == 1 && (!requireWrite || write == 1);
        }
        catch (JsonException)
        {
            return false;
        }
    }

    private bool IsSuperAdminSession()
        => string.Equals(Request.Cookies[SuperAdminRoleCookie]?.Trim(), "SuperAdmin", StringComparison.OrdinalIgnoreCase);

    private string ResolveIdEmpresa()
        => NormalizeEmpresaId(ResolveSessionValue("idEmpresa"))
           ?? NormalizeEmpresaId(User.FindFirstValue(ClaimTypes.SerialNumber))
           ?? string.Empty;

    private string ResolveEmpresa()
        => ResolveSessionValue("empresa") ?? User.FindFirstValue(ClaimTypes.Sid) ?? string.Empty;

    private string? ResolveUsuarioId()
    {
        string? value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return !string.IsNullOrWhiteSpace(value) && value.Length <= 256 && !value.Any(char.IsControl)
            ? value.Trim()
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

    private static JsonNode? FindPermission(JsonNode? node, string code)
    {
        if (node is JsonArray array)
        {
            foreach (JsonNode? child in array)
            {
                JsonNode? match = FindPermission(child, code);
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
        return string.Equals(option, code, StringComparison.OrdinalIgnoreCase)
            ? obj
            : FindPermission(obj["Hijos"] ?? obj["hijos"], code);
    }
}
