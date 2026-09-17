using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using RestSharp;

namespace checklist.Clases
{
    public static class CheckAppProxyHeaders
    {
        private const string ProxyEmpresaIdHeader = "X-ProductosServicios-Proxy-EmpresaId";
        private const string ProxyEmpresaKeyHeader = "X-ProductosServicios-Proxy-Empresa";
        private const string ProxyUsuarioIdHeader = "X-ProductosServicios-Proxy-UsuarioId";
        private const string ProxyTimestampHeader = "X-ProductosServicios-Proxy-Timestamp";
        private const string ProxySignatureHeader = "X-ProductosServicios-Proxy-Signature";

        public static void AddCheckAppProxyHeaders(
            this RestRequest request,
            Controller controller,
            IConfiguration configuration,
            string? idEmpresa,
            string? empresa)
        {
            string empresaId = ResolveIdEmpresa(controller, idEmpresa);
            string empresaKey = ResolveEmpresa(controller, empresa);
            string usuarioId = ResolveUsuarioId(controller) ?? string.Empty;
            string timestamp = DateTimeOffset.UtcNow.ToString("O");
            string secret = configuration["fireBdata:fireClave"] ?? string.Empty;
            string signature = ComputeSignature(secret, empresaId, empresaKey, usuarioId, timestamp);

            request.AddHeader(ProxyEmpresaIdHeader, empresaId);
            request.AddHeader(ProxyEmpresaKeyHeader, empresaKey);
            request.AddHeader(ProxyTimestampHeader, timestamp);
            request.AddHeader(ProxySignatureHeader, signature);

            if (!string.IsNullOrWhiteSpace(usuarioId))
            {
                request.AddHeader(ProxyUsuarioIdHeader, usuarioId);
            }
        }

        private static string ComputeSignature(string secret, string empresaId, string empresa, string usuarioId, string timestamp)
        {
            using HMACSHA256 hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            string payload = string.Join('\n', empresaId.Trim(), empresa.Trim().ToUpperInvariant(), usuarioId.Trim(), timestamp.Trim());
            return Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload)));
        }

        private static string ResolveIdEmpresa(Controller controller, string? idEmpresa)
        {
            return NormalizeSerializedValue(controller.HttpContext.Session.GetString("idEmpresa"))
                ?? controller.User.FindFirstValue(ClaimTypes.SerialNumber)
                ?? idEmpresa
                ?? string.Empty;
        }

        private static string ResolveEmpresa(Controller controller, string? empresa)
        {
            return NormalizeSerializedValue(controller.HttpContext.Session.GetString("empresa"))
                ?? controller.User.FindFirstValue(ClaimTypes.Sid)
                ?? empresa
                ?? string.Empty;
        }

        private static string? ResolveUsuarioId(Controller controller)
        {
            string? claimValue = controller.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(claimValue, out Guid usuarioId) && usuarioId != Guid.Empty
                ? usuarioId.ToString()
                : null;
        }

        private static string? NormalizeSerializedValue(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            string trimmed = value.Trim();
            if (trimmed.Length >= 2 && trimmed.StartsWith('"') && trimmed.EndsWith('"'))
            {
                return trimmed.Substring(1, trimmed.Length - 2);
            }

            return trimmed;
        }
    }
}
