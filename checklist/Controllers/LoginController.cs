using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using checklist.Clases;
using checklist.Extensions;
using checklist.Models.Departamentos;
using checklist.Models.Operadores;
using checklist.Models.Firebase;
using checklist.Models.Puestos;
using checklist.Models.RazonSocial;
using checklist.Models.Roles;
using checklist.Models.Sucursales;
using checklist.Models.Usuarios;
using checklist.Models.Zonas;
using checklist.Services;


//using checklist.Models.Usuarios;
using Firebase.Auth;
using Firebase.Auth.Providers;
using Firebase.Database;
using Firebase.Database.Query;
using Firebase.Storage;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;

namespace checklist.Controllers
{
    public class LoginController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly EmailServices _emailService;
        private readonly ILogger<LoginController> _logger;

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Registro()
        {
            return View();
        }

        public IActionResult Olvido()
        {
            return View();
        }

        public LoginController(IConfiguration configuration, EmailServices emailService, ILogger<LoginController> logger)
        {
            _configuration = configuration;
            _emailService = emailService;
            _logger = logger;
        }

        #region Olvido
        [HttpPost]
        public async Task<IActionResult> olvido(string usr)
        {
            string regresa = string.Empty;
            var config = new FirebaseAuthConfig
            {
                ApiKey = _configuration.GetValue<string>("fireBdata:fireApiKey"),
                AuthDomain = _configuration.GetValue<string>("fireBdata:fireAuthDomain"),
                Providers = new FirebaseAuthProvider[]
                {
                    new EmailProvider()
                }
            };
            // Create Client
            var client = new FirebaseAuthClient(config);
            try
            {
                await client.ResetEmailPasswordAsync(usr);
                regresa = "Ok";
            }
            catch (Exception ex)
            {
                regresa = "No se encontró la cuenta, por favor verifique";
            }
            return Json(new { d = regresa });
        }
        #endregion

        #region Registro
        [HttpPost]
        public async Task<IActionResult> Registro(string nom, string usr, string pwd)
        {
            string result = "Ok";
            try
            {
                string tmpUser = _configuration.GetValue<string>("fireBdata:fireUser");
                string tmpClave = _configuration.GetValue<string>("fireBdata:fireClave");

                var config = new FirebaseAuthConfig
                {
                    ApiKey = _configuration.GetValue<string>("fireBdata:fireApiKey"),
                    AuthDomain = _configuration.GetValue<string>("fireBdata:fireAuthDomain"),
                    Providers = new FirebaseAuthProvider[]
                    {
                    new EmailProvider()
                    }
                };
                // Create Client
                var client = new FirebaseAuthClient(config);
                await client.CreateUserWithEmailAndPasswordAsync(usr.Trim().ToLower(), pwd.Trim(), nom.Trim().ToUpper());
                var user = client.User;
                var uid = user.Uid;
                if (!user.Info.IsEmailVerified)
                {
                    using (var clientH = new HttpClient())
                    {
                        string RequestUri = "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=" + _configuration.GetValue<string>("fireBdata:fireApiKey");
                        clientH.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                        var content = new StringContent("{\"requestType\":\"VERIFY_EMAIL\",\"idToken\":\"" + user.Credential.IdToken + "\"}");
                        content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

                        var response = await clientH.PostAsync(RequestUri, content);
                        response.EnsureSuccessStatusCode();
                    }
                }
                client.SignOut();
                //

                Usuario1 usuario1 = new Usuario1();
                usuario1.CheckApp = 1;
                usuario1.correo = usr.Trim().ToLower();
                usuario1.empresa = "";
                usuario1.fechahora = Utilerias.FechaActual().ToString();
                usuario1.nombre = nom.Trim().ToUpper();
                usuario1.status = false;
                usuario1.telefono = string.Empty;
                usuario1.uid = uid;
                await client.SignInWithEmailAndPasswordAsync(_configuration.GetValue<string>("fireBdata:fireUser"), _configuration.GetValue<string>("fireBdata:fireClave"));
                var firebase = new FirebaseClient(
                     _configuration.GetValue<string>("fireBdata:fireDatabaseUrl"),
                     new FirebaseOptions
                     {
                         AuthTokenAsyncFactory = () => Task.FromResult(client.User.Credential.IdToken)  // refreshToken)
                     });
                string datos = JsonConvert.SerializeObject(usuario1, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                await firebase
                    .Child("Usuarios")
                    .Child(uid)
                    .PutAsync(datos);
                client.SignOut();
            }
            catch (Exception ex)
            {
                if (ex.InnerException is FirebaseAuthException)
                {
                    var fbAutException = (FirebaseAuthException)ex.InnerException;
                    result = fbAutException.Reason.ToString();
                    switch (result)
                    {
                        case "EmailExists":
                            result = "Ese usuario ya existe.";
                            break;
                        case "UnknownEmailAddress":
                            result = "Usuario o clave incorrecto";
                            break;
                    }
                }
                else
                {
                    result = ex.Message;
                }
            }
            return Json(new { d = result });
        }
        #endregion

        #region Login
        [HttpPost]
        public async Task<IActionResult> Ingreso(string usr, string pwd, string nem)
        {
            string result = "Ok";
            string idEmpresa = string.Empty;
            string cadenaBase64 = string.Empty;
            string empresa = string.Empty;
            string correo = string.Empty;
            string firebaseToken = string.Empty; // Para almacenar el token de Firebase
            string userUid = string.Empty;
            string accountType = "Usuario";
            string redirectUrl = "/Home/Index";
            try
            {
                var config = new FirebaseAuthConfig
                {
                    ApiKey = _configuration.GetValue<string>("fireBdata:fireApiKey"),
                    AuthDomain = _configuration.GetValue<string>("fireBdata:fireAuthDomain"),
                    Providers = new FirebaseAuthProvider[] { new EmailProvider() }
                };
                var client = new FirebaseAuthClient(config);
                var authResult = await client.SignInWithEmailAndPasswordAsync(usr.Trim().ToLower(), pwd.Trim());
                await Task.Delay(800);
                firebaseToken = await client.User.GetIdTokenAsync();
                var firebaseClient = new FirebaseClient(
                    _configuration.GetValue<string>("fireBdata:fireDatabaseUrl"),
                    new FirebaseOptions { AuthTokenAsyncFactory = () => Task.FromResult(client.User.Credential.IdToken) }
                );
                if (usr.Trim() != "soporte@secuencia.com")
                {
                    // Verificar si ya existe un token para el usuario
                    var existingToken = await firebaseClient.Child("Tokens").Child(client.User.Uid).OnceSingleAsync<object>();
                    if (existingToken != null)
                    {
                        // Si existe un token anterior, informamos al usuario
                        result = "Existe otra sesión abierta en otro dispositivo la cuál se cerrará.";
                    }
                    // Guardar el token en Firebase bajo la colección "Tokens"
                    var userToken = new { Token = firebaseToken, UserId = client.User.Uid, Timestamp = DateTime.UtcNow };
                    await firebaseClient.Child("Tokens").Child(client.User.Uid).PutAsync(userToken);
                    userUid = client.User.Uid;
                }
                // Obtener las conexiones y usuarios
                var conexionesFb = await firebaseClient.Child("Conexiones").OnceAsync<object>();
                var usuariosFb = await firebaseClient.Child("Usuarios").OnceAsync<object>();
                var operadoresFb = await firebaseClient.Child("Operadores").OnceAsync<object>();
                OperatorAccessResolution operatorResolution = await ResolveOperatorAccessAsync(
                    conexionesFb,
                    operadoresFb,
                    client.User.Uid,
                    usr,
                    firebaseToken,
                    client.User.Info.IsEmailVerified,
                    client.User.Credential.IdToken);

                AdministrativeLoginAttemptResult loginAdmin = await ResolveAdministrativeAccessAsync(
                    firebaseClient,
                    conexionesFb,
                    usuariosFb,
                    client.User.Uid,
                    usr,
                    firebaseToken,
                    nem,
                    client.User.Info.IsEmailVerified,
                    client.User.Credential.IdToken);

                if (loginAdmin.Success && operatorResolution.HasAccess)
                {
                    string dualMode = "Administracion";
                    ConfigureSessionModes(canAdmin: true, canOperate: true, currentMode: dualMode);
                    result = "Ok";
                    idEmpresa = loginAdmin.IdEmpresa;
                    cadenaBase64 = loginAdmin.CadenaBase64;
                    empresa = loginAdmin.Empresa;
                    correo = loginAdmin.Correo;
                    userUid = client.User.Uid;
                    accountType = string.Equals(dualMode, "Operacion", StringComparison.OrdinalIgnoreCase) ? "Operador" : "Usuario";
                    redirectUrl = string.Equals(dualMode, "Operacion", StringComparison.OrdinalIgnoreCase)
                        ? "/ContestarLista/RecoleccionesBL26"
                        : "/Home/Index";
                }
                else if (loginAdmin.Success)
                {
                    ConfigureSessionModes(canAdmin: true, canOperate: false, currentMode: "Administracion");
                    result = "Ok";
                    idEmpresa = loginAdmin.IdEmpresa;
                    cadenaBase64 = loginAdmin.CadenaBase64;
                    empresa = loginAdmin.Empresa;
                    correo = loginAdmin.Correo;
                    userUid = client.User.Uid;
                    accountType = "Usuario";
                    redirectUrl = "/Home/Index";
                }
                else if (operatorResolution.HasAccess)
                {
                    await SignInOperatorAsync(operatorResolution, client.User.Uid, firebaseToken, usr);
                    ConfigureSessionModes(canAdmin: false, canOperate: true, currentMode: "Operacion");
                    result = "Ok";
                    idEmpresa = operatorResolution.IdEmpresa;
                    cadenaBase64 = operatorResolution.CadenaBase64;
                    empresa = operatorResolution.Empresa;
                    correo = operatorResolution.Correo;
                    userUid = client.User.Uid;
                    accountType = "Operador";
                    redirectUrl = "/ContestarLista/RecoleccionesBL26";
                }
                else if (!string.IsNullOrWhiteSpace(operatorResolution.Message))
                {
                    result = operatorResolution.Message;
                }
                else if (!string.IsNullOrWhiteSpace(loginAdmin.Message))
                {
                    result = loginAdmin.Message;
                }
                client.SignOut();
            }
            catch (Exception ex)
            {
                if (ex.InnerException is FirebaseAuthException)
                {
                    var fbAutException = (FirebaseAuthException)ex.InnerException;
                    result = fbAutException.Reason.ToString();
                    switch (result)
                    {
                        case "EmailExists":
                            result = "Ese usuario ya existe.";
                            break;
                        case "UnknownEmailAddress":
                            result = "Usuario o clave incorrecto";
                            break;
                    }
                }
                else
                {
                    result = "Usuario o clave incorrecto";
                }
            }

            return Json(new { d = result, idEmpresa = idEmpresa, cadenaBase64 = cadenaBase64, empresa = empresa, correo = correo, firebaseToken = firebaseToken, userUid = userUid, accountType, redirectUrl });
        }

        private async Task<AdministrativeLoginAttemptResult> ResolveAdministrativeAccessAsync(
            FirebaseClient firebaseClient,
            IReadOnlyCollection<FirebaseObject<object>> conexionesFb,
            IReadOnlyCollection<FirebaseObject<object>> usuariosFb,
            string authenticatedUid,
            string usr,
            string firebaseToken,
            string nem,
            bool emailVerified,
            string verificationToken)
        {
            bool usuarioFirebaseEncontrado = false;
            foreach (var itemU in usuariosFb)
            {
                if (itemU.Key != authenticatedUid)
                {
                    continue;
                }

                usuarioFirebaseEncontrado = true;
                Usuario1 usuario = JsonConvert.DeserializeObject<Usuario1>(itemU.Object.ToString());
                if (!string.Equals(usuario.correo, usr.ToLower().Trim(), StringComparison.OrdinalIgnoreCase))
                {
                    break;
                }

                return await TrySignInAdministrativeUserAsync(
                    firebaseClient,
                    conexionesFb,
                    usuario,
                    authenticatedUid,
                    usr,
                    firebaseToken,
                    nem,
                    requireFirebaseStatus: (bool?)usuario.status == true,
                    emailVerified: emailVerified,
                    verificationToken: verificationToken);
            }

            if (!usuarioFirebaseEncontrado)
            {
                return await TrySignInAdministrativeUserAsync(
                    firebaseClient,
                    conexionesFb,
                    null,
                    authenticatedUid,
                    usr,
                    firebaseToken,
                    nem,
                    requireFirebaseStatus: false,
                    emailVerified: emailVerified,
                    verificationToken: verificationToken);
            }

            return new AdministrativeLoginAttemptResult();
        }

        private async Task<OperatorAccessResolution> ResolveOperatorAccessAsync(
            IReadOnlyCollection<FirebaseObject<object>> conexionesFb,
            IReadOnlyCollection<FirebaseObject<object>> operadoresFb,
            string authenticatedUid,
            string usr,
            string firebaseToken,
            bool emailVerified,
            string verificationToken)
        {
            foreach (var itemO in operadoresFb)
            {
                if (itemO.Key != authenticatedUid)
                {
                    continue;
                }

                dynamic operador = JsonConvert.DeserializeObject<dynamic>(itemO.Object.ToString());
                string correoOperador = operador?.correo?.ToString() ?? string.Empty;
                bool estadoOperador = false;
                bool operadorActivo = operador?.status != null && bool.TryParse(operador.status.ToString(), out estadoOperador) && estadoOperador;

                if (!string.Equals(correoOperador, usr.ToLower().Trim(), StringComparison.OrdinalIgnoreCase))
                {
                    return OperatorAccessResolution.Denied();
                }

                if (!operadorActivo)
                {
                    return OperatorAccessResolution.Denied("Tu cuenta de operador está inactiva. Contacta a tu administrador.");
                }

                if (!emailVerified)
                {
                    await TrySendVerificationEmailAsync(verificationToken);
                    await UpdateOperatorVerificationNodeAsync(authenticatedUid, false);
                    return OperatorAccessResolution.Denied("Debes verificar tu correo antes de ingresar. Revisa tu bandeja de entrada o solicita un nuevo enlace.");
                }

                string tmpEmp = operador?.empresa?.ToString()?.Trim().ToUpperInvariant() ?? string.Empty;
                foreach (var itemC in conexionesFb)
                {
                    if (itemC.Key.ToUpper() != tmpEmp)
                    {
                        continue;
                    }

                    FireBconn conexionFB = JsonConvert.DeserializeObject<FireBconn>(itemC.Object.ToString());
                    if (conexionFB.Status != "1")
                    {
                        return OperatorAccessResolution.Denied("La empresa del operador no está activa. Lo sentimos.");
                    }

                    string cadenaBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(conexionFB.Cadena));
                    await UpdateOperatorVerificationNodeAsync(authenticatedUid, true);

                    return new OperatorAccessResolution
                    {
                        HasAccess = true,
                        IdEmpresa = conexionFB.IdEmpresa,
                        CadenaBase64 = cadenaBase64,
                        CadenaDescifrada = conexionFB.Cadena,
                        Empresa = tmpEmp,
                        EmpresaNombre = conexionFB.Nombre,
                        Correo = correoOperador,
                        Nombre = operador?.nombre?.ToString() ?? usr.Trim().ToUpperInvariant(),
                        FirebaseToken = firebaseToken
                    };
                }

                return OperatorAccessResolution.Denied();
            }

            return OperatorAccessResolution.Denied();
        }

        private async Task<AdministrativeLoginAttemptResult> TrySignInAdministrativeUserAsync(
            FirebaseClient firebaseClient,
            IReadOnlyCollection<FirebaseObject<object>> conexionesFb,
            Usuario1? usuarioFirebase,
            string authenticatedUid,
            string usr,
            string firebaseToken,
            string nem,
            bool requireFirebaseStatus,
            bool emailVerified,
            string verificationToken)
        {
            string correoNormalizado = usr.Trim().ToLowerInvariant();
            if (requireFirebaseStatus && usuarioFirebase?.status != true)
            {
                return new AdministrativeLoginAttemptResult
                {
                    Message = "Su usuario está inactivo. Contacte a su administrador."
                };
            }

            if (usr.Trim() != "soporte@secuencia.com" && !emailVerified)
            {
                await TrySendVerificationEmailAsync(verificationToken);
                return new AdministrativeLoginAttemptResult
                {
                    Message = "Su usuario no ha sido validado aún. Se ha enviado un nuevo mail para que verifique su cuenta. Revise su buzón y si no aparece revise también en los no deseados."
                };
            }

            string tmpEmp = usuarioFirebase?.empresa?.ToString()?.Trim().ToUpperInvariant() ?? string.Empty;
            if (usr.Trim() == "soporte@secuencia.com")
            {
                tmpEmp = nem?.Trim().ToUpperInvariant() ?? string.Empty;
            }

            if (string.IsNullOrWhiteSpace(tmpEmp))
            {
                return new AdministrativeLoginAttemptResult
                {
                    Message = requireFirebaseStatus
                        ? "Su usuario está inactivo. Contacte a su administrador."
                        : "No fue posible identificar la empresa de su cuenta."
                };
            }

            FireBconn? conexionFB = null;
            foreach (var itemC in conexionesFb)
            {
                if (itemC.Key.ToUpper() == tmpEmp)
                {
                    conexionFB = JsonConvert.DeserializeObject<FireBconn>(itemC.Object.ToString());
                    break;
                }
            }

            if (conexionFB == null)
            {
                return new AdministrativeLoginAttemptResult
                {
                    Message = "No fue posible identificar la empresa de su cuenta."
                };
            }

            if (conexionFB.Status != "1")
            {
                return new AdministrativeLoginAttemptResult
                {
                    Message = "Su empresa no está activa. Lo siento."
                };
            }

            respUsuario? usuarioSql = await TryGetAdministrativeUserFromSqlAsync(conexionFB, tmpEmp, correoNormalizado);
            if (usuarioSql == null)
            {
                return new AdministrativeLoginAttemptResult
                {
                    Message = requireFirebaseStatus
                        ? "Su usuario está inactivo. Contacte a su administrador."
                        : "No fue posible localizar una cuenta administrativa activa."
                };
            }

            await RepairAdministrativeFirebaseNodeAsync(firebaseClient, usuarioFirebase, authenticatedUid, correoNormalizado, tmpEmp, conexionFB.IdEmpresa, usuarioSql);

            string cadenaBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(conexionFB.Cadena));
            string tmpIdRol = usuarioSql.idRol?.ToString() ?? usuarioFirebase?.idRol?.ToString() ?? string.Empty;
            if (usr.Trim() == "soporte@secuencia.com")
            {
                string cadena = _configuration.GetValue<string>("Servidor");
                string urlT = $"{Utilerias.UrlBase}GetRoll?cadena={cadena}&idEmpresa={conexionFB.IdEmpresa}&nombreRol=SuperAdmin";
                var clientRT = new RestClient(urlT);
                var requestT = new RestRequest();
                requestT.Method = Method.Get;
                RestResponse responseRT = await clientRT.ExecuteAsync(requestT);
                var jsonArray = JArray.Parse(responseRT.Content);
                if (jsonArray.Count == 0)
                {
                    throw new Exception("No se encontraron roles en la respuesta.");
                }

                tmpIdRol = jsonArray[0]["id"]?.ToString() ?? string.Empty;
            }

            List<Claim> claims = new List<Claim>()
            {
                new Claim(ClaimTypes.Name, BuildAdministrativeDisplayName(usuarioSql)),
                new Claim(ClaimTypes.NameIdentifier, authenticatedUid),
                new Claim(ClaimTypes.Email, correoNormalizado),
                new Claim(ClaimTypes.Surname, AesOperation.EncryptString(conexionFB.Cadena)),
                new Claim(ClaimTypes.GivenName, conexionFB.Nombre),
                new Claim(ClaimTypes.SerialNumber, conexionFB.IdEmpresa),
                new Claim(ClaimTypes.Uri, cadenaBase64),
                new Claim(ClaimTypes.Sid, tmpEmp),
                new Claim(ClaimTypes.Role, tmpIdRol)
            };

            HttpContext.Session.SetObject("idEmpresa", conexionFB.IdEmpresa);
            HttpContext.Session.SetObject("cadena", cadenaBase64);
            HttpContext.Session.SetObject("empresa", tmpEmp);
            HttpContext.Session.SetObject("emailUser", correoNormalizado);

            ClaimsIdentity claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            AuthenticationProperties properties = new AuthenticationProperties()
            {
                AllowRefresh = true,
                IsPersistent = false
            };

            HttpContext.Session.SetString("accountType", "Usuario");
            HttpContext.Session.SetString("userUid", authenticatedUid);
            HttpContext.Session.SetString("firebaseToken", firebaseToken);
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), properties);

            return new AdministrativeLoginAttemptResult
            {
                Success = true,
                IdEmpresa = conexionFB.IdEmpresa,
                CadenaBase64 = cadenaBase64,
                Empresa = tmpEmp,
                Correo = correoNormalizado
            };
        }

        private async Task<respUsuario?> TryGetAdministrativeUserFromSqlAsync(FireBconn conexionFB, string empresa, string correoNormalizado)
        {
            string cadena = Convert.ToBase64String(Encoding.UTF8.GetBytes(conexionFB.Cadena));
            string url = $"{Utilerias.UrlBase}api/Usuario/ObtenerUsuariosCompleto?idEmpresa={conexionFB.IdEmpresa}&empresa={empresa}&cadena={cadena}";
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            if (!response.IsSuccessful || string.IsNullOrWhiteSpace(response.Content))
            {
                return null;
            }

            List<respUsuario>? usuarios = JsonConvert.DeserializeObject<List<respUsuario>>(response.Content);
            if (usuarios == null)
            {
                return null;
            }

            List<respUsuario> coincidencias = usuarios.Where(item =>
            {
                string correoInstitucional = (item.CorreoInstitucional ?? string.Empty).Trim().ToLowerInvariant();
                string correoPersonal = (item.CorreoPersonal ?? string.Empty).Trim().ToLowerInvariant();
                bool coincideCorreo = correoInstitucional == correoNormalizado || correoPersonal == correoNormalizado;
                bool activo = item.borrado != true && (item.Estado == true || item.Estatus == true);
                return coincideCorreo && activo;
            }).ToList();

            return coincidencias.Count == 1 ? coincidencias[0] : null;
        }

        private async Task SignInOperatorAsync(OperatorAccessResolution resolution, string authenticatedUid, string firebaseToken, string usr)
        {
            List<Claim> claims = new List<Claim>()
            {
                new Claim(ClaimTypes.Name, resolution.Nombre ?? usr.Trim().ToUpperInvariant()),
                new Claim(ClaimTypes.NameIdentifier, authenticatedUid),
                new Claim(ClaimTypes.Email, resolution.Correo),
                new Claim(ClaimTypes.Surname, AesOperation.EncryptString(resolution.CadenaDescifrada)),
                new Claim(ClaimTypes.GivenName, resolution.EmpresaNombre),
                new Claim(ClaimTypes.SerialNumber, resolution.IdEmpresa),
                new Claim(ClaimTypes.Uri, resolution.CadenaBase64),
                new Claim(ClaimTypes.Sid, resolution.Empresa),
                new Claim("account_type", "Operador")
            };

            HttpContext.Session.SetObject("idEmpresa", resolution.IdEmpresa);
            HttpContext.Session.SetObject("cadena", resolution.CadenaBase64);
            HttpContext.Session.SetObject("empresa", resolution.Empresa);
            HttpContext.Session.SetObject("emailUser", resolution.Correo);
            HttpContext.Session.SetString("accountType", "Operador");
            HttpContext.Session.SetString("userUid", authenticatedUid);
            HttpContext.Session.SetString("firebaseToken", firebaseToken);

            ClaimsIdentity claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            AuthenticationProperties properties = new AuthenticationProperties()
            {
                AllowRefresh = true,
                IsPersistent = false
            };

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), properties);
        }

        private void ConfigureSessionModes(bool canAdmin, bool canOperate, string currentMode)
        {
            string normalizedMode = NormalizeWorkMode(currentMode, canAdmin, canOperate);
            HttpContext.Session.SetString("canAdminMode", canAdmin ? "true" : "false");
            HttpContext.Session.SetString("canOperateMode", canOperate ? "true" : "false");
            HttpContext.Session.SetString("hasDualModeAccess", canAdmin && canOperate ? "true" : "false");
            HttpContext.Session.SetString("currentWorkMode", normalizedMode);
            HttpContext.Session.SetString("accountType", normalizedMode == "Operacion" ? "Operador" : "Usuario");
        }

        private string NormalizeWorkMode(string currentMode, bool canAdmin, bool canOperate)
        {
            if (string.Equals(currentMode, "Operacion", StringComparison.OrdinalIgnoreCase) && canOperate)
            {
                return "Operacion";
            }

            if (canAdmin)
            {
                return "Administracion";
            }

            return canOperate ? "Operacion" : string.Empty;
        }
        private async Task RepairAdministrativeFirebaseNodeAsync(
            FirebaseClient firebaseClient,
            Usuario1? usuarioFirebase,
            string authenticatedUid,
            string correoNormalizado,
            string empresa,
            string idEmpresa,
            respUsuario usuarioSql)
        {
            if (usuarioFirebase?.status == true && string.Equals(usuarioFirebase.uid, authenticatedUid, StringComparison.Ordinal) && usuarioFirebase.idRol == usuarioSql.idRol)
            {
                return;
            }

            Usuario1 usuarioActualizado = new Usuario1
            {
                CheckApp = usuarioFirebase?.CheckApp ?? 1,
                correo = correoNormalizado,
                empresa = empresa,
                fechahora = Utilerias.FechaActual().ToString(),
                nombre = BuildAdministrativeDisplayName(usuarioSql).ToUpperInvariant(),
                status = true,
                telefono = usuarioFirebase?.telefono ?? string.Empty,
                uid = authenticatedUid,
                idRol = usuarioSql.idRol,
                idEmpresa = idEmpresa
            };

            string datos = JsonConvert.SerializeObject(
                usuarioActualizado,
                Formatting.None,
                new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });

            await firebaseClient
                .Child("Usuarios")
                .Child(authenticatedUid)
                .PutAsync(datos);
        }

        private static string BuildAdministrativeDisplayName(respUsuario usuarioSql)
        {
            return string.Join(
                " ",
                new[]
                {
                    usuarioSql.Nombre?.Trim(),
                    usuarioSql.APaterno?.Trim(),
                    usuarioSql.AMaterno?.Trim()
                }.Where(value => !string.IsNullOrWhiteSpace(value)));
        }

        private sealed class AdministrativeLoginAttemptResult
        {
            public bool Success { get; set; }
            public string Message { get; set; } = string.Empty;
            public string IdEmpresa { get; set; } = string.Empty;
            public string CadenaBase64 { get; set; } = string.Empty;
            public string Empresa { get; set; } = string.Empty;
            public string Correo { get; set; } = string.Empty;
        }

        private sealed class OperatorAccessResolution
        {
            public bool HasAccess { get; init; }
            public string Message { get; init; } = string.Empty;
            public string IdEmpresa { get; init; } = string.Empty;
            public string CadenaBase64 { get; init; } = string.Empty;
            public string CadenaDescifrada { get; init; } = string.Empty;
            public string Empresa { get; init; } = string.Empty;
            public string EmpresaNombre { get; init; } = string.Empty;
            public string Correo { get; init; } = string.Empty;
            public string Nombre { get; init; } = string.Empty;
            public string FirebaseToken { get; init; } = string.Empty;

            public static OperatorAccessResolution Denied(string message = "")
            {
                return new OperatorAccessResolution
                {
                    HasAccess = false,
                    Message = message
                };
            }
        }

        private sealed class RegistrationSqlSyncResult
        {
            public bool Success { get; init; }
            public bool Inserted { get; init; }
            public string Message { get; init; } = string.Empty;
            public string Payload { get; init; } = string.Empty;
            public string ResponseContent { get; init; } = string.Empty;
            public int ResponseStatusCode { get; init; }
        }

        private sealed class BootstrapOperationResult
        {
            public bool Success { get; init; }
            public bool AlreadyExists { get; init; }
            public bool CreatedInExecution { get; init; }
            public string Entity { get; init; } = string.Empty;
            public string Id { get; init; } = string.Empty;
            public string Message { get; init; } = string.Empty;

            public static BootstrapOperationResult Failure(string entity, string message)
            {
                return new BootstrapOperationResult
                {
                    Entity = entity,
                    Message = message
                };
            }

            public static BootstrapOperationResult Ok(string entity, string id, bool alreadyExists, bool createdInExecution, string message = "")
            {
                return new BootstrapOperationResult
                {
                    Success = true,
                    Entity = entity,
                    Id = id,
                    AlreadyExists = alreadyExists,
                    CreatedInExecution = createdInExecution,
                    Message = message
                };
            }
        }

        private sealed class BootstrapEmpresaResultado
        {
            public bool Success { get; init; }
            public string Message { get; init; } = string.Empty;
            public string NumeroEmpresa { get; init; } = string.Empty;
            public string Token { get; init; } = string.Empty;
            public DateTime Vigencia { get; init; }
            public FireBconn ConexionSql { get; init; } = new FireBconn();
            public Conexion ConexionRtdb { get; init; } = new Conexion();
            public BootstrapEmpresaIds BootstrapIds { get; init; } = new BootstrapEmpresaIds();
            public BootstrapOperationResult EmpresaLogica { get; init; } = BootstrapOperationResult.Failure("EmpresaLogica", string.Empty);
            public BootstrapOperationResult Rol { get; init; } = BootstrapOperationResult.Failure("Rol", string.Empty);
            public BootstrapOperationResult RazonSocial { get; init; } = BootstrapOperationResult.Failure("RazonSocial", string.Empty);
            public BootstrapOperationResult Region { get; init; } = BootstrapOperationResult.Failure("Region", string.Empty);
            public BootstrapOperationResult Sucursal { get; init; } = BootstrapOperationResult.Failure("Sucursal", string.Empty);
            public BootstrapOperationResult Departamento { get; init; } = BootstrapOperationResult.Failure("Departamento", string.Empty);
            public BootstrapOperationResult PuestoAdministrador { get; init; } = BootstrapOperationResult.Failure("PuestoAdministrador", string.Empty);
            public BootstrapOperationResult PuestoSupervisor { get; init; } = BootstrapOperationResult.Failure("PuestoSupervisor", string.Empty);
        }

        private string ResolveRegistrationConnectionString(string? cadenaConfigurada)
        {
            if (string.IsNullOrWhiteSpace(cadenaConfigurada))
            {
                return string.Empty;
            }

            try
            {
                return AesOperation.DecryptString(cadenaConfigurada);
            }
            catch
            {
                return cadenaConfigurada;
            }
        }

        private static string NormalizeCompanyName(string value)
        {
            string tmpNombre = value.Trim().ToLowerInvariant();
            if (tmpNombre.Contains("sa de"))
            {
                return tmpNombre[..tmpNombre.IndexOf("sa de", StringComparison.Ordinal)];
            }

            if (tmpNombre.Contains("s.a."))
            {
                return tmpNombre[..tmpNombre.IndexOf("s.a.", StringComparison.Ordinal)];
            }

            if (tmpNombre.Contains("s. a."))
            {
                return tmpNombre[..tmpNombre.IndexOf("s. a.", StringComparison.Ordinal)];
            }

            return tmpNombre;
        }

        private static string EnsureGuidString(string? value)
        {
            return Guid.TryParse(value, out Guid parsed) && parsed != Guid.Empty
                ? parsed.ToString()
                : Guid.NewGuid().ToString();
        }

        private static BootstrapEmpresaIds EnsureBootstrapIds(Conexion conexion)
        {
            conexion.BootstrapIds ??= new BootstrapEmpresaIds();
            conexion.BootstrapIds.IdRol = EnsureGuidString(conexion.BootstrapIds.IdRol);
            conexion.BootstrapIds.IdRazonSocial = EnsureGuidString(conexion.BootstrapIds.IdRazonSocial);
            conexion.BootstrapIds.IdZona = EnsureGuidString(conexion.BootstrapIds.IdZona);
            conexion.BootstrapIds.IdSucursal = EnsureGuidString(conexion.BootstrapIds.IdSucursal);
            conexion.BootstrapIds.IdDepartamento = EnsureGuidString(conexion.BootstrapIds.IdDepartamento);
            conexion.BootstrapIds.IdPuestoAdministrador = EnsureGuidString(conexion.BootstrapIds.IdPuestoAdministrador);
            conexion.BootstrapIds.IdPuestoSupervisor = EnsureGuidString(conexion.BootstrapIds.IdPuestoSupervisor);
            return conexion.BootstrapIds;
        }

        private async Task SaveConnectionRegistrationStateAsync(FirebaseClient firebase, string numeroEmpresa, Conexion conexion)
        {
            conexion.BootstrapActualizado = Utilerias.FechaActual().ToString("yyyy-MM-dd HH:mm:ss");
            string datos = JsonConvert.SerializeObject(
                conexion,
                Formatting.None,
                new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });

            await firebase
                .Child("Conexiones")
                .Child(numeroEmpresa)
                .PutAsync(datos);
        }

        private async Task<bool> RoleExistsAsync(string idEmpresa, string roleId, string cadenaBase64)
        {
            string url = $"{Utilerias.UrlBase}GetRoles?idEmpresa={idEmpresa}&empresa={idEmpresa}&cadena={cadenaBase64}&id={roleId}";
            var client = new RestClient(url);
            var request = new RestRequest { Method = Method.Get };
            RestResponse response = await client.ExecuteAsync(request);
            if (!response.IsSuccessful)
            {
                return false;
            }

            List<respRoles>? roles = JsonConvert.DeserializeObject<List<respRoles>>(response.Content ?? "[]");
            return roles?.Any(role => string.Equals(role.id?.ToString(), roleId, StringComparison.OrdinalIgnoreCase)
                && string.Equals(role.idEmpresa?.ToString(), idEmpresa, StringComparison.OrdinalIgnoreCase)) == true;
        }

        private async Task<bool> RazonSocialExistsAsync(string idEmpresa, string razonId, string cadenaBase64)
        {
            string url = $"{Utilerias.UrlBase}ObtenerRazonSocial?idEmpresa={idEmpresa}&id={razonId}&empresa={idEmpresa}&cadena={cadenaBase64}";
            var client = new RestClient(url);
            var request = new RestRequest { Method = Method.Get };
            RestResponse response = await client.ExecuteAsync(request);
            if (!response.IsSuccessful)
            {
                return false;
            }

            List<respRazonSocial>? razones = JsonConvert.DeserializeObject<List<respRazonSocial>>(response.Content ?? "[]");
            return razones?.Any(razon => string.Equals(razon.Id, razonId, StringComparison.OrdinalIgnoreCase)
                && string.Equals(razon.IdEmpresa, idEmpresa, StringComparison.OrdinalIgnoreCase)) == true;
        }

        private async Task<bool> ZonaExistsAsync(string idEmpresa, string zonaId)
        {
            string url = $"{Utilerias.UrlBase}ObtenerZona?idEmpresa={idEmpresa}&id={zonaId}";
            var client = new RestClient(url);
            var request = new RestRequest { Method = Method.Get };
            RestResponse response = await client.ExecuteAsync(request);
            if (!response.IsSuccessful)
            {
                return false;
            }

            List<respZona>? zonas = JsonConvert.DeserializeObject<List<respZona>>(response.Content ?? "[]");
            return zonas?.Any(zona => string.Equals(zona.Id, zonaId, StringComparison.OrdinalIgnoreCase)
                && string.Equals(zona.IdEmpresa, idEmpresa, StringComparison.OrdinalIgnoreCase)) == true;
        }

        private async Task<bool> SucursalExistsAsync(string idEmpresa, string sucursalId, string cadenaBase64)
        {
            string url = $"{Utilerias.UrlBase}api/Sucursal/ObtenerSucursal?idEmpresa={idEmpresa}&id={sucursalId}&empresa={idEmpresa}&cadena={cadenaBase64}";
            var client = new RestClient(url);
            var request = new RestRequest { Method = Method.Get };
            RestResponse response = await client.ExecuteAsync(request);
            if (!response.IsSuccessful)
            {
                return false;
            }

            List<respSucursal>? sucursales = JsonConvert.DeserializeObject<List<respSucursal>>(response.Content ?? "[]");
            return sucursales?.Any(sucursal => string.Equals(sucursal.Id, sucursalId, StringComparison.OrdinalIgnoreCase)
                && string.Equals(sucursal.IdEmpresa, idEmpresa, StringComparison.OrdinalIgnoreCase)) == true;
        }

        private async Task<Departamento?> GetDepartamentoByIdAsync(string departamentoId, string cadenaBase64)
        {
            string url = $"{Utilerias.UrlBase}ObtenerDepartamento?id={departamentoId}&empresa=bootstrap&cadena={cadenaBase64}";
            var client = new RestClient(url);
            var request = new RestRequest { Method = Method.Get };
            RestResponse response = await client.ExecuteAsync(request);
            if (!response.IsSuccessful)
            {
                return null;
            }

            return (JsonConvert.DeserializeObject<List<Departamento>>(response.Content ?? "[]") ?? new List<Departamento>()).FirstOrDefault();
        }

        private async Task<Puesto?> GetPuestoByIdAsync(string puestoId, string cadenaBase64)
        {
            string url = $"{Utilerias.UrlBase}ObtenerPuesto?id={puestoId}&empresa=bootstrap&cadena={cadenaBase64}";
            var client = new RestClient(url);
            var request = new RestRequest { Method = Method.Get };
            RestResponse response = await client.ExecuteAsync(request);
            if (!response.IsSuccessful)
            {
                return null;
            }

            return (JsonConvert.DeserializeObject<List<Puesto>>(response.Content ?? "[]") ?? new List<Puesto>()).FirstOrDefault();
        }

        private async Task<List<respUsuario>> GetAdministrativeUsersFromSqlAsync(FireBconn conexionFB, string empresa)
        {
            string cadena = Convert.ToBase64String(Encoding.UTF8.GetBytes(conexionFB.Cadena));
            string url = $"{Utilerias.UrlBase}api/Usuario/ObtenerUsuariosCompleto?idEmpresa={conexionFB.IdEmpresa}&empresa={empresa}&cadena={cadena}";
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            if (!response.IsSuccessful || string.IsNullOrWhiteSpace(response.Content))
            {
                return new List<respUsuario>();
            }

            return JsonConvert.DeserializeObject<List<respUsuario>>(response.Content) ?? new List<respUsuario>();
        }

        private async Task<RegistrationSqlSyncResult> EnsureAdministrativeSqlUserAsync(
            FireBconn conexionFB,
            string empresa,
            string correo,
            string uid,
            string nombre,
            string apellidoPaterno,
            string apellidoMaterno,
            int usuariosPreviosEmpresa,
            BootstrapEmpresaIds? bootstrapIds = null)
        {
            string correoNormalizado = correo.Trim().ToLowerInvariant();
            List<respUsuario> usuariosSql = await GetAdministrativeUsersFromSqlAsync(conexionFB, empresa);

            List<respUsuario> coincidenciasCorreo = usuariosSql
                .Where(item =>
                {
                    string correoInstitucional = (item.CorreoInstitucional ?? string.Empty).Trim().ToLowerInvariant();
                    string correoPersonal = (item.CorreoPersonal ?? string.Empty).Trim().ToLowerInvariant();
                    return correoInstitucional == correoNormalizado || correoPersonal == correoNormalizado;
                })
                .ToList();

            List<respUsuario> coincidenciasUid = usuariosSql
                .Where(item => string.Equals((item.IdFirebase ?? string.Empty).Trim(), uid.Trim(), StringComparison.Ordinal))
                .ToList();

            if (coincidenciasCorreo.Count > 0 || coincidenciasUid.Count > 0)
            {
                return new RegistrationSqlSyncResult
                {
                    Success = coincidenciasCorreo.Count == 1 || coincidenciasUid.Count == 1,
                    Inserted = false,
                    Message = coincidenciasCorreo.Count > 1 || coincidenciasUid.Count > 1
                        ? "Se detectó un conflicto de identidad al completar el usuario administrativo."
                        : "El usuario administrativo ya existe en SQL."
                };
            }

            Guid idRol = Guid.Empty;
            string cadenaServidor = _configuration.GetValue<string>("Servidor");
            string idSucursal = string.Empty;
            string idDepartamento = string.Empty;
            string idPuesto = string.Empty;

            if (bootstrapIds != null)
            {
                idSucursal = bootstrapIds.IdSucursal ?? string.Empty;
                idDepartamento = bootstrapIds.IdDepartamento ?? string.Empty;
                idPuesto = usuariosPreviosEmpresa == 0
                    ? bootstrapIds.IdPuestoAdministrador ?? string.Empty
                    : bootstrapIds.IdPuestoSupervisor ?? string.Empty;

                if (usuariosPreviosEmpresa == 0)
                {
                    idRol = Guid.TryParse(bootstrapIds.IdRol, out Guid bootstrapRoleId) ? bootstrapRoleId : Guid.Empty;
                }
            }

            if (usuariosPreviosEmpresa == 0 && idRol == Guid.Empty)
            {
                string urlRol = $"{Utilerias.UrlBase}GetRoll?cadena={cadenaServidor}&idEmpresa={conexionFB.IdEmpresa}&nombreRol=SuperAdmin";
                var clienteRol = new RestClient(urlRol);
                var requestRol = new RestRequest { Method = Method.Get };
                RestResponse responseRol = await clienteRol.ExecuteAsync(requestRol);
                var roles = JArray.Parse(responseRol.Content ?? "[]");
                if (roles.Count == 0)
                {
                    return new RegistrationSqlSyncResult
                    {
                        Success = false,
                        Message = "No fue posible obtener el rol base del primer usuario."
                    };
                }

                idRol = Guid.Parse(roles[0]["id"]?.ToString() ?? Guid.Empty.ToString());
            }

            if (string.IsNullOrWhiteSpace(idSucursal))
            {
                string urlSucursal = $"{Utilerias.UrlBase}api/Sucursal/ObtenerPrimerSucursal?idEmpresa={conexionFB.IdEmpresa}&nombre={"Mi sucursal"}&empresa={empresa}&cadena={cadenaServidor}";
                var clienteSucursal = new RestClient(urlSucursal);
                var requestSucursal = new RestRequest { Method = Method.Get };
                RestResponse responseSucursal = await clienteSucursal.ExecuteAsync(requestSucursal);
                List<respSucursal> sucursales = JsonConvert.DeserializeObject<List<respSucursal>>(responseSucursal.Content ?? "[]") ?? new List<respSucursal>();
                idSucursal = sucursales.FirstOrDefault()?.Id ?? string.Empty;
            }

            if (string.IsNullOrWhiteSpace(idDepartamento))
            {
                string urlDepartamento = $"{Utilerias.UrlBase}ObtenerPrimerDepartamento?nombre={"Supervisión"}&empresa={conexionFB.IdEmpresa}&cadena={cadenaServidor}&idEmpresa={conexionFB.IdEmpresa}";
                var clienteDepartamento = new RestClient(urlDepartamento);
                var requestDepartamento = new RestRequest { Method = Method.Get };
                RestResponse responseDepartamento = await clienteDepartamento.ExecuteAsync(requestDepartamento);
                List<Departamento> departamentos = JsonConvert.DeserializeObject<List<Departamento>>(responseDepartamento.Content ?? "[]") ?? new List<Departamento>();
                idDepartamento = departamentos.FirstOrDefault()?.id.ToString() ?? string.Empty;
            }

            if (string.IsNullOrWhiteSpace(idPuesto))
            {
                string nombrePuesto = usuariosPreviosEmpresa == 0 ? "Administrador" : "Supervisor";
                string urlPuesto = $"{Utilerias.UrlBase}ObtenerPrimerPuesto?nombre={nombrePuesto}&empresa={conexionFB.IdEmpresa}&cadena={cadenaServidor}&idEmpresa={conexionFB.IdEmpresa}";
                var clientePuesto = new RestClient(urlPuesto);
                var requestPuesto = new RestRequest { Method = Method.Get };
                RestResponse responsePuesto = await clientePuesto.ExecuteAsync(requestPuesto);
                List<Puesto> puestos = JsonConvert.DeserializeObject<List<Puesto>>(responsePuesto.Content ?? "[]") ?? new List<Puesto>();
                idPuesto = puestos.FirstOrDefault()?.id.ToString() ?? string.Empty;
            }

            if (string.IsNullOrWhiteSpace(idSucursal) || string.IsNullOrWhiteSpace(idDepartamento) || string.IsNullOrWhiteSpace(idPuesto))
            {
                return new RegistrationSqlSyncResult
                {
                    Success = false,
                    Message = "No fue posible resolver los datos organizacionales base del usuario."
                };
            }

            var userDB = new respUsuario
            {
                Nombre = nombre.Trim(),
                APaterno = apellidoPaterno?.Trim() ?? string.Empty,
                AMaterno = apellidoMaterno?.Trim() ?? string.Empty,
                FechaNacimiento = Utilerias.FechaActual(),
                Numero = "0000000",
                TelefonoMovil = "0000000000",
                TelefonoFijo = "0000000000",
                CorreoInstitucional = correoNormalizado,
                CorreoPersonal = correoNormalizado,
                IdSucursal = idSucursal,
                IdDepartamento = idDepartamento,
                IdPuesto = idPuesto,
                Estado = true,
                FechaIngreso = Utilerias.FechaActual(),
                Estatus = true,
                Notas = "sin nota",
                borrado = false,
                FechaAlta = Utilerias.FechaActual(),
                IdEmpresa = conexionFB.IdEmpresa,
                IdFirebase = uid,
                idRol = idRol,
                FotoLink = string.Empty
            };

            string payload = JsonConvert.SerializeObject(userDB, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            string cadenaApi = Convert.ToBase64String(Encoding.UTF8.GetBytes(conexionFB.Cadena));
            string urlInsertar = $"{Utilerias.UrlBase}api/Usuario/InsertarUsuario?empresa={conexionFB.IdEmpresa}&cadena={cadenaApi}";
            var clientInsertar = new RestClient(urlInsertar);
            var requestInsertar = new RestRequest();
            requestInsertar.Method = Method.Post;
            requestInsertar.RequestFormat = DataFormat.Json;
            requestInsertar.AddStringBody(payload, DataFormat.Json);
            RestResponse responseInsertar = await clientInsertar.ExecuteAsync(requestInsertar);

            return new RegistrationSqlSyncResult
            {
                Success = responseInsertar.IsSuccessful,
                Inserted = responseInsertar.IsSuccessful,
                Message = responseInsertar.IsSuccessful
                    ? "Usuario administrativo insertado correctamente."
                    : "La API no confirmó la inserción del usuario administrativo.",
                Payload = payload,
                ResponseContent = responseInsertar.Content ?? string.Empty,
                ResponseStatusCode = (int)responseInsertar.StatusCode
            };
        }

        private async Task<bool> TrySendVerificationEmailAsync(string idToken)
        {
            if (string.IsNullOrWhiteSpace(idToken))
            {
                return false;
            }

            using HttpClient client = new HttpClient();
            string requestUri = "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=" + _configuration.GetValue<string>("fireBdata:fireApiKey");
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            StringContent content = new StringContent(
                "{\"requestType\":\"VERIFY_EMAIL\",\"idToken\":\"" + idToken + "\"}",
                Encoding.UTF8,
                "application/json");

            HttpResponseMessage response = await client.PostAsync(requestUri, content);
            return response.IsSuccessStatusCode;
        }

        private async Task UpdateOperatorVerificationNodeAsync(string uid, bool emailVerified)
        {
            if (string.IsNullOrWhiteSpace(uid))
            {
                return;
            }

            var config = new FirebaseAuthConfig
            {
                ApiKey = _configuration.GetValue<string>("fireBdata:fireApiKey"),
                AuthDomain = _configuration.GetValue<string>("fireBdata:fireAuthDomain"),
                Providers = new FirebaseAuthProvider[]
                {
                    new EmailProvider()
                }
            };

            var client = new FirebaseAuthClient(config);
            try
            {
                await client.SignInWithEmailAndPasswordAsync(
                    _configuration.GetValue<string>("fireBdata:fireUser"),
                    _configuration.GetValue<string>("fireBdata:fireClave"));

                var firebase = new FirebaseClient(
                    _configuration.GetValue<string>("fireBdata:fireDatabaseUrl"),
                    new FirebaseOptions
                    {
                        AuthTokenAsyncFactory = () => Task.FromResult(client.User.Credential.IdToken)
                    });

                await firebase
                    .Child("Operadores")
                    .Child(uid)
                    .Child("emailVerificado")
                    .PutAsync(emailVerified);
            }
            catch
            {
            }
            finally
            {
                client.SignOut();
            }
        }


        [HttpPost]
        public async Task<IActionResult> cerrarSesion(string userUid)
        {
            try
            {
                if (!string.IsNullOrEmpty(userUid))
                {
                    // Inicializar FirebaseClient para conectarse a Firebase
                    var firebaseClient = new FirebaseClient(
                        _configuration.GetValue<string>("fireBdata:fireDatabaseUrl"),
                        new FirebaseOptions { AuthTokenAsyncFactory = () => Task.FromResult(HttpContext.Session.GetString("firebaseToken")) }
                    );

                    // Eliminar el token de Firebase de la colección "Tokens"
                    await firebaseClient.Child("Tokens").Child(userUid).DeleteAsync();

                    // Eliminar el token de la sesión
                    HttpContext.Session.Remove("firebaseToken");
                    HttpContext.Session.Remove("canAdminMode");
                    HttpContext.Session.Remove("canOperateMode");
                    HttpContext.Session.Remove("hasDualModeAccess");
                    HttpContext.Session.Remove("currentWorkMode");
                    HttpContext.Session.Remove("workModeNotice");

                    return Json(new { success = true });
                }
                else
                {
                    return Json(new { success = true });
                }
            }
            catch (Exception ex)
            {
                // Manejo de errores
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> obtenerToken(string userUid)
        {
            string emailUsuario = User.FindFirstValue(ClaimTypes.Email);
            if (emailUsuario != "soporte@secuencia.com")
            {
                try
                {
                    // Inicializar FirebaseClient para conectarse a Firebase
                    var firebaseClient = new FirebaseClient(
                        _configuration.GetValue<string>("fireBdata:fireDatabaseUrl"),
                        new FirebaseOptions { AuthTokenAsyncFactory = () => Task.FromResult(HttpContext.Session.GetString("firebaseToken")) }
                    );

                    // Obtener el token almacenado en Firebase bajo la colección "Tokens"
                    var tokenData = await firebaseClient.Child("Tokens").Child(userUid).OnceSingleAsync<dynamic>();

                    if (tokenData != null)
                    {
                        // Extraer el token del objeto que se almacenó
                        string token = tokenData.Token;
                        return Json(new { success = true, token = token });
                    }
                    else
                    {
                        return Json(new { success = false, message = "Token no encontrado." });
                    }
                }
                catch (Exception ex)
                {
                    // Manejo de errores
                    return Json(new { success = false, message = ex.Message });
                }
            }
            else
            {
                return Json(new { success = true, token = "00000000-0000-0000-0000-000000000000" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> ConsultarImagenPerfil(string idEmpresa, string correo, string empresa, string cadena)
        {
            try
            {
                string url = string.Format("{0}api/Usuario/ObtenerUsuarioPorEmail?idEmpresa={1}&email={2}&empresa={3}&cadena={4}", Utilerias.UrlBase, idEmpresa, correo, empresa, cadena);

                var clients = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Get;
                RestResponse response = await clients.ExecuteAsync(request);
                List<respUsuario> respuesta = JsonConvert.DeserializeObject<List<respUsuario>>(response.Content);
                respUsuario result = new respUsuario();
                foreach (var item in respuesta)
                {
                    result = item;
                }

                var config = new FirebaseAuthConfig
                {
                    ApiKey = _configuration.GetValue<string>("fireBdata:fireApiKey"),
                    AuthDomain = _configuration.GetValue<string>("fireBdata:fireAuthDomain"),
                    Providers = new FirebaseAuthProvider[]
                    {
                new EmailProvider()
                    }
                };

                var client = new FirebaseAuthClient(config);
                var userCredential = await client.SignInWithEmailAndPasswordAsync(
                    _configuration.GetValue<string>("fireBdata:fireUser"),
                    _configuration.GetValue<string>("fireBdata:fireClave")
                );
                var token = await userCredential.User.GetIdTokenAsync();

                // Obtener la URL de descarga del archivo almacenado en Firebase Storage
                var storage = new FirebaseStorage(
                    _configuration.GetValue<string>("fireBdata:fireStorage"),
                    new FirebaseStorageOptions
                    {
                        AuthTokenAsyncFactory = () => Task.FromResult(token),
                        ThrowOnCancel = true
                    }
                );

                // Generar la ruta de la imagen en Firebase Storage
                var downloadUrl = await storage
                    .Child($"{idEmpresa.ToUpper()}/FotoUsuario")
                    .Child(result.Id)
                    .GetDownloadUrlAsync();

                return Ok(new { FotoLink = downloadUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener la imagen de perfil: {ex.Message}");
            }
        }

        #endregion

        #region Registro
        #region registro empresa
        public async Task<ActionResult> Registrare(string emp)
        {
            DateTime vigencia = Utilerias.FechaActual();
            string regresa, token;
            regresa = token = string.Empty;
            try
            {
                // Configure
                var config = new FirebaseAuthConfig
                {
                    ApiKey = _configuration.GetValue<string>("fireBdata:fireApiKey"),
                    AuthDomain = _configuration.GetValue<string>("fireBdata:fireAuthDomain"),
                    Providers = new FirebaseAuthProvider[]
                {
                    new EmailProvider()
                }
                };
                // Create Client
                var client = new FirebaseAuthClient(config);
                await client.SignInWithEmailAndPasswordAsync(_configuration.GetValue<string>("fireBdata:fireUser"),
                    _configuration.GetValue<string>("fireBdata:fireClave"));
                var firebase = new FirebaseClient(
                     _configuration.GetValue<string>("fireBdata:fireDatabaseUrl"),
                     new FirebaseOptions
                     {
                         AuthTokenAsyncFactory = () => Task.FromResult(client.User.Credential.IdToken)
                     });
                //
                // Determinar numero de empresa siguiente
                var conexionesFb = await firebase
                        .Child("Conexiones")
                        .OnceAsync<object>();
                int ultimo = 100;
                string tmpNombre = NormalizeCompanyName(emp);
                string numeroEmpresa = string.Empty;
                Conexion? conexionRegistro = null;
                foreach (var item in conexionesFb)
                {
                    if (int.TryParse(item.Key, out int consecutivoActual) && consecutivoActual > ultimo)
                    {
                        ultimo = consecutivoActual;
                    }

                    Conexion conexionFB = JsonConvert.DeserializeObject<Conexion>(item.Object.ToString());
                    if (conexionFB?.Nombre != null && NormalizeCompanyName(conexionFB.Nombre).Contains(tmpNombre, StringComparison.Ordinal))
                    {
                        numeroEmpresa = item.Key;
                        conexionRegistro = conexionFB;
                        break;
                    }
                }

                if (conexionRegistro != null && conexionRegistro.BootstrapCompleto == true)
                {
                    regresa = "Esta empresa parece ya haber sido dada de alta con anterioridad. Por favor contacte a soporte en soporte@secuencia.com";
                    return Json(new { d = regresa, e = string.Format("{0:dd/MM/yyyy}", vigencia), t = token });
                }

                if (conexionRegistro == null)
                {
                    var servidorFb = await firebase.Child("Hosting").OnceAsync<string>();
                    string valorServidor = servidorFb.FirstOrDefault()?.Object;
                    ultimo++;
                    numeroEmpresa = ultimo.ToString();
                    conexionRegistro = new Conexion
                    {
                        Cadena = valorServidor,
                        Nombre = emp.Trim().ToUpperInvariant(),
                        Status = 1,
                        idEmpresa = Guid.NewGuid().ToString()
                    };
                    vigencia = Utilerias.FechaActual().AddDays(7);
                    token = Utilerias.GetTimeStamp(vigencia);
                    conexionRegistro.Token = token;
                    conexionRegistro.Vigencia = string.Format("{0:dd/MM/yyyy}", vigencia);
                }
                else
                {
                    DateTime.TryParseExact(conexionRegistro.Vigencia, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out vigencia);
                    token = conexionRegistro.Token ?? string.Empty;
                }

                BootstrapEmpresaIds bootstrapIds = EnsureBootstrapIds(conexionRegistro);
                conexionRegistro.BootstrapCompleto = false;
                await SaveConnectionRegistrationStateAsync(firebase, numeroEmpresa, conexionRegistro);

                string cadena = _configuration.GetValue<string>("Servidor");
                string idEmpresa = conexionRegistro.idEmpresa;

                respRoles rolInicial = new respRoles
                {
                    idEmpresa = Guid.Parse(idEmpresa),
                    NombreRol = "SuperAdmin",
                    id = Guid.Parse(bootstrapIds.IdRol!),
                    Permisos = "[{\"Opcion\":\"01000000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[{\"Opcion\":\"01001000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[{\"Opcion\":\"01001001\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"01001002\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"01001003\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]}]} ,{\"Opcion\":\"01002000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[{\"Opcion\":\"01002001\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"01002002\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]}]}]},{\"Opcion\":\"02000000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":0},\"Hijos\":[{\"Opcion\":\"02001000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"02002000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"02003000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"02004000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]}]} ,{\"Opcion\":\"03000000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[{\"Opcion\":\"03001000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[{\"Opcion\":\"03001001\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"03001002\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]}]} ,{\"Opcion\":\"03002000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]}]} ,{\"Opcion\":\"04000000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[{\"Opcion\":\"04001000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[{\"Opcion\":\"04001001\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"04001002\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"04001003\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]}]} ,{\"Opcion\":\"04002000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]} ,{\"Opcion\":\"04003000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]} ,{\"Opcion\":\"04004000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]} ,{\"Opcion\":\"04005000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]}]}]"
                };

                var json = JsonConvert.SerializeObject(rolInicial, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                string url = string.Format("{0}Guardar?empresa={1}&cadena={2}", Utilerias.UrlBase, rolInicial.idEmpresa, cadena);
                var clientS = new RestClient(url);
                var request = new RestRequest { Method = Method.Put, RequestFormat = DataFormat.Json };
                request.AddJsonBody(json);
                RestResponse response = await clientS.ExecuteAsync(request);
                BootstrapOperationResult rolResult = response.IsSuccessful && await RoleExistsAsync(idEmpresa, bootstrapIds.IdRol!, cadena)
                    ? BootstrapOperationResult.Ok("Rol", bootstrapIds.IdRol!, false, true)
                    : BootstrapOperationResult.Failure("Rol", "No fue posible completar el rol inicial.");

                BootstrapOperationResult razonResult = rolResult.Success
                    ? await GuardaRazonSocialAsync(bootstrapIds.IdRazonSocial!, idEmpresa, numeroEmpresa, cadena)
                    : BootstrapOperationResult.Failure("RazonSocial", "Bootstrap detenido.");
                BootstrapOperationResult zonaResult = razonResult.Success
                    ? await GuardaZonaAsync(bootstrapIds.IdZona!, "centro", idEmpresa, cadena, numeroEmpresa)
                    : BootstrapOperationResult.Failure("Region", "Bootstrap detenido.");
                BootstrapOperationResult sucursalResult = zonaResult.Success
                    ? await GuardaSucursalAsync(bootstrapIds.IdSucursal!, "Mi sucursal", "", "", "", "", "", bootstrapIds.IdRazonSocial!, bootstrapIds.IdZona!, "", idEmpresa, numeroEmpresa, cadena)
                    : BootstrapOperationResult.Failure("Sucursal", "Bootstrap detenido.");
                BootstrapOperationResult departamentoResult = sucursalResult.Success
                    ? await GuardaPrimerDepartamentoAsync(bootstrapIds.IdDepartamento!, "Supervisión", "", idEmpresa, cadena, numeroEmpresa)
                    : BootstrapOperationResult.Failure("Departamento", "Bootstrap detenido.");
                BootstrapOperationResult puestoAdminResult = departamentoResult.Success
                    ? await GuardaPrimerPuestoAsync(bootstrapIds.IdPuestoAdministrador!, "Administrador", idEmpresa, cadena, numeroEmpresa)
                    : BootstrapOperationResult.Failure("PuestoAdministrador", "Bootstrap detenido.");
                BootstrapOperationResult puestoSupervisorResult = puestoAdminResult.Success
                    ? await GuardaPrimerPuestoAsync(bootstrapIds.IdPuestoSupervisor!, "Supervisor", idEmpresa, cadena, numeroEmpresa)
                    : BootstrapOperationResult.Failure("PuestoSupervisor", "Bootstrap detenido.");

                bool bootstrapCompleto = rolResult.Success
                    && razonResult.Success
                    && zonaResult.Success
                    && sucursalResult.Success
                    && departamentoResult.Success
                    && puestoAdminResult.Success
                    && puestoSupervisorResult.Success;

                conexionRegistro.BootstrapCompleto = bootstrapCompleto;
                await SaveConnectionRegistrationStateAsync(firebase, numeroEmpresa, conexionRegistro);

                regresa = bootstrapCompleto
                    ? "Ok"
                    : "No fue posible completar la configuración inicial de la empresa. Intenta nuevamente.";
                client.SignOut();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "No fue posible completar el bootstrap inicial de la empresa {Empresa}.", emp);
                regresa = "No fue posible completar la configuración inicial de la empresa. Intenta nuevamente.";
            }
            return Json(new { d = regresa, e = string.Format("{0:dd/MM/yyyy}", vigencia), t = token });
        }
        #endregion

        #region registro usuario
        public async Task<ActionResult> Registraru(string nom, string tok, string cor, string cla, string Apaterno, string Amaterno)
        {
            string regresa = "Ok";
            try
            {
                // Configure
                var config = new FirebaseAuthConfig
                {
                    ApiKey = _configuration.GetValue<string>("fireBdata:fireApiKey"),
                    AuthDomain = _configuration.GetValue<string>("fireBdata:fireAuthDomain"),
                    Providers = new FirebaseAuthProvider[]
                {
                    new EmailProvider()
                }
                };
                // Create Client
                var client = new FirebaseAuthClient(config);
                await client.SignInWithEmailAndPasswordAsync(_configuration.GetValue<string>("fireBdata:fireUser"),
                    _configuration.GetValue<string>("fireBdata:fireClave"));
                var firebaseClient = new FirebaseClient(
                     _configuration.GetValue<string>("fireBdata:fireDatabaseUrl"),
                     new FirebaseOptions
                     {
                         AuthTokenAsyncFactory = () => Task.FromResult(client.User.Credential.IdToken)  // refreshToken)
                     });
                //
                var conexionesFb = await firebaseClient
                    .Child("Conexiones")
                    .OnceAsync<object>();
                // Buscar usuario
                var usuariosFb = await firebaseClient
                    .Child("Usuarios")
                    .OnceAsync<object>();
                //
                bool continuar = false;
                int numeroEmpresa = 0;
                string noEmp = "";
                bool isExistEmpresa = false;
                Conexion? conexionRegistro = null;
                foreach (var item in conexionesFb)
                {
                    Conexion conexionFB = JsonConvert.DeserializeObject<Conexion>(item.Object.ToString());
                    if (conexionFB.Token == tok.Trim())
                    {
                        numeroEmpresa = int.Parse(item.Key);
                        noEmp = conexionFB.idEmpresa;
                        conexionRegistro = conexionFB;
                        continuar = true;
                        isExistEmpresa = true;
                        break;
                    }
                }

                if (!isExistEmpresa)
                {
                    regresa = "El identificador de cuenta no existe.";
                    continuar = false;
                }
                else if (conexionRegistro?.BootstrapCompleto != true)
                {
                    regresa = "No fue posible completar la configuración inicial de la empresa. Intenta nuevamente.";
                    continuar = false;
                }

                if (continuar)
                {
                    Usuario1? usuarioExistente = null;
                    foreach (var itemU in usuariosFb)
                    {
                        Usuario1 usuario = JsonConvert.DeserializeObject<Usuario1>(itemU.Object.ToString());
                        if (cor.Trim().ToLower() == usuario.correo)
                        {
                            usuarioExistente = usuario;
                            break;
                        }
                    }

                    if (usuarioExistente != null)
                    {
                        int empresaUsuarioExistente = 0;
                        int.TryParse(usuarioExistente.empresa, out empresaUsuarioExistente);

                        if (empresaUsuarioExistente == numeroEmpresa)
                        {
                            if (conexionRegistro != null)
                            {
                                int usuariosPreviosEmpresa = 0;
                                foreach (var itemU in usuariosFb)
                                {
                                    try
                                    {
                                        Usuario1 usuarioE = JsonConvert.DeserializeObject<Usuario1>(itemU.Object.ToString());
                                        if (!string.IsNullOrEmpty(usuarioE.empresa) &&
                                            int.Parse(usuarioE.empresa) == numeroEmpresa &&
                                            !string.Equals(usuarioE.uid, usuarioExistente.uid, StringComparison.Ordinal))
                                        {
                                            usuariosPreviosEmpresa++;
                                        }
                                    }
                                    catch
                                    {
                                    }
                                }

                                RegistrationSqlSyncResult syncResult = await EnsureAdministrativeSqlUserAsync(
                                    new FireBconn
                                    {
                                        IdEmpresa = conexionRegistro.idEmpresa,
                                        Cadena = ResolveRegistrationConnectionString(conexionRegistro.Cadena),
                                        Nombre = conexionRegistro.Nombre,
                                        Status = conexionRegistro.Status?.ToString() ?? "0"
                                    },
                                    numeroEmpresa.ToString(),
                                    cor,
                                    usuarioExistente.uid,
                                    nom,
                                    Apaterno,
                                    Amaterno,
                                    usuariosPreviosEmpresa,
                                    conexionRegistro.BootstrapIds);

                                if (!syncResult.Success && syncResult.ResponseStatusCode > 0)
                                {
                                    _logger.LogWarning(
                                        "No fue posible completar el usuario SQL para {Correo}. Status {StatusCode}. Payload: {Payload}. Respuesta: {Response}",
                                        cor.Trim().ToLower(),
                                        syncResult.ResponseStatusCode,
                                        syncResult.Payload,
                                        syncResult.ResponseContent);

                                    regresa = "Tu cuenta existe, pero no fue posible completar el alta administrativa. Intenta nuevamente o contacta a soporte.";
                                    continuar = false;
                                    return Json(new { d = regresa });
                                }
                            }

                            if (conexionRegistro != null)
                            {
                                regresa = "Ok";
                            }
                            else
                            {
                                VerificationResendAttemptResult resendResult = await TryResendExistingAdministrativeVerificationAsync(
                                    cor,
                                    cla,
                                    usuarioExistente.uid);

                                regresa = resendResult switch
                                {
                                    VerificationResendAttemptResult.Sent => "El correo de confirmación fue enviado nuevamente.",
                                    VerificationResendAttemptResult.AlreadyVerified => "Lo siento. Ese usuario ya está registrado, no puedo continuar el proceso.",
                                    _ => "Tu cuenta fue creada, pero no fue posible enviar el correo de confirmación. Intenta reenviarlo nuevamente."
                                };
                            }
                        }
                        else
                        {
                            regresa = "Lo siento. Ese usuario ya está registrado, no puedo continuar el proceso.";
                        }

                        continuar = false;
                    }
                }

                if (continuar)
                {
                    if (continuar)
                    {
                        // Cuantos usuarios hay de esa empresa
                        int cuantosEmp = 0;
                        foreach (var itemU in usuariosFb)
                        {
                            try
                            {
                                Usuario1 usuarioE = JsonConvert.DeserializeObject<Usuario1>(itemU.Object.ToString());
                                if (!string.IsNullOrEmpty(usuarioE.empresa))
                                {
                                    if (int.Parse(usuarioE.empresa) == numeroEmpresa) cuantosEmp++;
                                }
                            }
                            catch (Exception ex)
                            {
                            }
                        }
                        // Crear nuevo usuario firebase
                        await client.CreateUserWithEmailAndPasswordAsync(cor.Trim().ToLower(), cla, nom.Trim().ToUpper());
                        var user = client.User;
                        var uid = user.Uid;
                        // Validar
                        using (var clientH = new HttpClient())
                        {
                            string RequestUri = "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=" + _configuration.GetValue<string>("fireBdata:fireApiKey");
                            clientH.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                            var content = new StringContent("{\"requestType\":\"VERIFY_EMAIL\",\"idToken\":\"" + user.Credential.IdToken + "\"}");
                            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

                            var responser = await clientH.PostAsync(RequestUri, content);
                            responser.EnsureSuccessStatusCode();
                        }
                        bool tmpStatus = true;
                        // Guardar nuevo usuario firebase
                        string tmpNombre = $"{nom.Trim()} {Apaterno.Trim()} {Amaterno.Trim()}";
                        Usuario usuario = new Usuario();
                        usuario.checkapp = 1;
                        usuario.correo = cor.Trim().ToLower();
                        usuario.empresa = numeroEmpresa;
                        usuario.fechahora = string.Format("{0:yyyy-MM-dd HH:mm:ss.fff}", Utilerias.FechaActual());
                        usuario.nombre = tmpNombre.Trim();
                        usuario.status = tmpStatus;
                        usuario.uid = uid;
                        usuario.validado = false;
                        // Guardar nuevo usuario en firebase
                        string datos = JsonConvert.SerializeObject(usuario, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                        await firebaseClient
                            .Child("Usuarios")
                            .Child(uid)
                            .PutAsync(datos);

                        MailRegistro mailRegistro = new MailRegistro();
                        if (cuantosEmp == 0)
                        {
                            var datosMail = await firebaseClient
                    .Child("MailRegistro")
                    .OnceAsync<object>();
                            foreach (var mail in datosMail)
                            {
                                switch (mail.Key)
                                {
                                    case "asunto":
                                        mailRegistro.asunto = mail.Object.ToString();
                                        break;
                                    case "bodyHTML":
                                        mailRegistro.bodyHTML = mail.Object.ToString();
                                        break;
                                    case "correo":
                                        mailRegistro.correo = mail.Object.ToString();
                                        break;
                                    case "password":
                                        mailRegistro.password = mail.Object.ToString();
                                        break;
                                    case "puerto":
                                        mailRegistro.puerto = Convert.ToInt32(mail.Object);
                                        break;
                                    case "smtpserver":
                                        mailRegistro.smtpServer = mail.Object.ToString();
                                        break;
                                    case "ssl":
                                        mailRegistro.ssl = Convert.ToBoolean(mail.Object);
                                        break;
                                }
                            }
                        }

                        client.SignOut();
                        // Si no hay usuarios...
                        if (conexionRegistro == null)
                        {
                            regresa = "No fue posible resolver la conexión de la empresa.";
                            return Json(new { d = regresa });
                        }

                        FireBconn conexionSql = new FireBconn
                        {
                            IdEmpresa = noEmp,
                            Cadena = ResolveRegistrationConnectionString(conexionRegistro.Cadena),
                            Nombre = conexionRegistro.Nombre,
                            Status = conexionRegistro.Status?.ToString() ?? "0"
                        };

                        RegistrationSqlSyncResult responseR = await EnsureAdministrativeSqlUserAsync(
                            conexionSql,
                            numeroEmpresa.ToString(),
                            cor,
                            uid,
                            nom,
                            Apaterno,
                            Amaterno,
                            cuantosEmp,
                            conexionRegistro.BootstrapIds);

                        if (!responseR.Success)
                        {
                            _logger.LogWarning(
                                "No fue posible insertar el usuario SQL para {Correo}. Status {StatusCode}. Payload: {Payload}. Respuesta: {Response}",
                                cor.Trim().ToLower(),
                                responseR.ResponseStatusCode,
                                responseR.Payload,
                                responseR.ResponseContent);

                            regresa = "Tu cuenta fue creada, pero no fue posible completar el alta administrativa. Intenta nuevamente.";
                            return Json(new { d = regresa });
                        }

                        if (cuantosEmp == 0)
                        {
                            // Itera sobre los resultados para asignar los valores a 'asunto' y 'bodyHTML'
                            int position = mailRegistro.bodyHTML.IndexOf("Su número de cuenta es:");
                            // Si encuentra la frase, inserta el contenido de 'tok' justo después
                            if (position != -1)
                            {
                                position += "Su número de cuenta es:".Length;
                                mailRegistro.bodyHTML = mailRegistro.bodyHTML.Insert(position, tok);
                            }
                            string resultadoCorreo = await _emailService.EnviarCorreoAsync(tmpNombre, cor, mailRegistro);
                            if (resultadoCorreo == "Ok")
                            {
                                regresa = "Ok";
                            }
                            else
                            {
                                _logger.LogWarning(
                                    "El usuario administrativo {Correo} se creo correctamente, pero fallo el correo adicional de registro. Resultado: {ResultadoCorreo}. Host configurado: {Host}. Puerto: {Puerto}",
                                    cor.Trim().ToLower(),
                                    resultadoCorreo,
                                    mailRegistro.smtpServer,
                                    mailRegistro.puerto);

                                regresa = "Tu cuenta fue creada, pero no fue posible enviar el correo de confirmación. Intenta reenviarlo nuevamente.";
                            }
                        }
                        else regresa = "Ok";
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { d = ex }); ;
            }
            return Json(new { d = regresa });
        }

        private async Task<VerificationResendAttemptResult> TryResendExistingAdministrativeVerificationAsync(string correo, string password, string expectedUid)
        {
            try
            {
                var config = new FirebaseAuthConfig
                {
                    ApiKey = _configuration.GetValue<string>("fireBdata:fireApiKey"),
                    AuthDomain = _configuration.GetValue<string>("fireBdata:fireAuthDomain"),
                    Providers = new FirebaseAuthProvider[]
                    {
                        new EmailProvider()
                    }
                };

                var client = new FirebaseAuthClient(config);
                try
                {
                    var credential = await client.SignInWithEmailAndPasswordAsync(
                        correo.Trim().ToLowerInvariant(),
                        password);

                    if (!string.IsNullOrWhiteSpace(expectedUid) &&
                        !string.Equals(credential.User.Uid, expectedUid.Trim(), StringComparison.Ordinal))
                    {
                        _logger.LogWarning(
                            "El reenvio administrativo encontro un UID distinto para {Correo}. Esperado: {ExpectedUid}. Recibido: {CurrentUid}",
                            correo.Trim().ToLowerInvariant(),
                            expectedUid,
                            credential.User.Uid);
                        return VerificationResendAttemptResult.Failed;
                    }

                    if (credential.User.Info.IsEmailVerified)
                    {
                        return VerificationResendAttemptResult.AlreadyVerified;
                    }

                    bool sent = await TrySendVerificationEmailAsync(credential.User.Credential.IdToken);
                    return sent ? VerificationResendAttemptResult.Sent : VerificationResendAttemptResult.Failed;
                }
                finally
                {
                    client.SignOut();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "No fue posible reenviar la verificacion administrativa para {Correo}.",
                    correo.Trim().ToLowerInvariant());
                return VerificationResendAttemptResult.Failed;
            }
        }

        private enum VerificationResendAttemptResult
        {
            Failed = 0,
            Sent = 1,
            AlreadyVerified = 2
        }
        #endregion

        #region razon zona sucursal puesto departamento
        private async Task<BootstrapOperationResult> GuardaRazonSocialAsync(string guid, string idEmpresa, string empresa, string cadena)
        {
            if (await RazonSocialExistsAsync(idEmpresa, guid, cadena))
            {
                return BootstrapOperationResult.Ok("RazonSocial", guid, true, false);
            }

            respRazonSocial razon = new respRazonSocial
            {
                Id = guid,
                IdEmpresa = idEmpresa,
                Nombre = "Ejemplo razón social-D",
                Direccion = "",
                Ciudad = "",
                Telefono = "",
                Colonia = "",
                RFC = "XAXX010101000",
                Estado = "",
                Pais = "México",
                Regimen1 = "",
                IMGFIREBASE = "",
                Notas = "asdfg",
                borrado = false,
                CodigoPostal = "",
                Representante = "8C4DCDD4-894C-440E-B5B3-9F99CF37504A",
                Fecha = Utilerias.FechaActual()
            };

            var json = JsonConvert.SerializeObject(razon, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            string url = string.Format("{0}InsertarPrimerRazonSocial?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
            var clientS = new RestClient(url);
            var request = new RestRequest { Method = Method.Post, RequestFormat = DataFormat.Json };
            request.AddJsonBody(json);
            RestResponse response = await clientS.ExecuteAsync(request);
            if (!response.IsSuccessful || !await RazonSocialExistsAsync(idEmpresa, guid, cadena))
            {
                return BootstrapOperationResult.Failure("RazonSocial", "No fue posible completar la razón social inicial.");
            }

            return BootstrapOperationResult.Ok("RazonSocial", guid, false, true);
        }

        private async Task<BootstrapOperationResult> GuardaZonaAsync(string llav, string nomb, string idEmpresa, string cadena, string empresa)
        {
            if (await ZonaExistsAsync(idEmpresa, llav))
            {
                return BootstrapOperationResult.Ok("Region", llav, true, false);
            }

            respZona zona = new respZona
            {
                IdEmpresa = idEmpresa,
                Nombre = nomb.Trim(),
                Notas = "",
                Id = llav
            };

            var json = JsonConvert.SerializeObject(zona, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            string url = string.Format("{0}InsertarPrimerZona?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
            var clientS = new RestClient(url);
            var request = new RestRequest { Method = Method.Post, RequestFormat = DataFormat.Json };
            request.AddJsonBody(json);
            RestResponse response = await clientS.ExecuteAsync(request);
            if (!response.IsSuccessful || !await ZonaExistsAsync(idEmpresa, llav))
            {
                return BootstrapOperationResult.Failure("Region", "No fue posible completar la región inicial.");
            }

            return BootstrapOperationResult.Ok("Region", llav, false, true);
        }

        private async Task<BootstrapOperationResult> GuardaSucursalAsync(string sucursalId, string nombre, string calle, string ciudad, string telefono, string email, string pais, string idRazonSocial, string idZona, string nota, string idEmpresa, string empresa, string cadena)
        {
            if (await SucursalExistsAsync(idEmpresa, sucursalId, cadena))
            {
                return BootstrapOperationResult.Ok("Sucursal", sucursalId, true, false);
            }

            respSucursal sucursal = new respSucursal
            {
                Id = sucursalId,
                IdEmpresa = idEmpresa,
                Nombre = nombre.Trim(),
                Direccion = calle.Trim(),
                Ciudad = ciudad.Trim(),
                Telefono = telefono.Trim(),
                Numero = "3FA85F64",
                Correo = email.Trim().ToLowerInvariant(),
                Pais = pais.Trim(),
                IdTitular = "3FA85F64-5717-4562-B3FC-2C963F66AFA6",
                IdRazonSocial = idRazonSocial.Trim(),
                IdZona = idZona.Trim(),
                IdSucursalTipo = "3FA85F64-5717-4562-B3FC-2C963F66AFA6",
                Notas = string.IsNullOrWhiteSpace(nota) ? "asdfg" : nota.Trim(),
                borrado = false,
                Fecha = Utilerias.FechaActual(),
                LinkImagen = "N/A"
            };

            var json = JsonConvert.SerializeObject(sucursal, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            string url = string.Format("{0}api/Sucursal/InsertarSucursal?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
            var clientS = new RestClient(url);
            var request = new RestRequest { Method = Method.Post, RequestFormat = DataFormat.Json };
            request.AddJsonBody(json);
            RestResponse response = await clientS.ExecuteAsync(request);
            if (!response.IsSuccessful || !await SucursalExistsAsync(idEmpresa, sucursalId, cadena))
            {
                return BootstrapOperationResult.Failure("Sucursal", "No fue posible completar la sucursal inicial.");
            }

            return BootstrapOperationResult.Ok("Sucursal", sucursalId, false, true);
        }

        private async Task<BootstrapOperationResult> GuardaPrimerPuestoAsync(string puestoId, string nomb, string idEmpresa, string cadena, string empresa, string nota = "")
        {
            Puesto? puestoActual = await GetPuestoByIdAsync(puestoId, cadena);
            if (puestoActual != null && string.Equals(puestoActual.idEmpresa?.ToString(), idEmpresa, StringComparison.OrdinalIgnoreCase))
            {
                return BootstrapOperationResult.Ok("Puesto", puestoId, true, false);
            }

            var puesto = new Puesto
            {
                id = Guid.Parse(puestoId),
                idEmpresa = Guid.Parse(idEmpresa),
                Nombre = nomb.Trim(),
                notas = nota.Trim(),
                fecha = Utilerias.FechaActual(),
                borrado = false
            };

            var json = JsonConvert.SerializeObject(puesto, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            string url = $"{Utilerias.UrlBase}InsertarPrimerPuesto?empresa={empresa}&cadena={cadena}";
            var clientS = new RestClient(url);
            var request = new RestRequest { Method = Method.Post, RequestFormat = DataFormat.Json };
            request.AddJsonBody(json);
            RestResponse response = await clientS.ExecuteAsync(request);
            puestoActual = await GetPuestoByIdAsync(puestoId, cadena);
            if (!response.IsSuccessful || puestoActual == null || !string.Equals(puestoActual.idEmpresa?.ToString(), idEmpresa, StringComparison.OrdinalIgnoreCase))
            {
                return BootstrapOperationResult.Failure("Puesto", $"No fue posible completar el puesto inicial {nomb}.");
            }

            return BootstrapOperationResult.Ok("Puesto", puestoId, false, true);
        }

        private async Task<BootstrapOperationResult> GuardaPrimerDepartamentoAsync(string departamentoId, string nomb, string nota, string idEmpresa, string cadena, string empresa)
        {
            Departamento? departamentoActual = await GetDepartamentoByIdAsync(departamentoId, cadena);
            if (departamentoActual != null && string.Equals(departamentoActual.idEmpresa?.ToString(), idEmpresa, StringComparison.OrdinalIgnoreCase))
            {
                return BootstrapOperationResult.Ok("Departamento", departamentoId, true, false);
            }

            var departamento = new Departamento
            {
                id = Guid.Parse(departamentoId),
                idEmpresa = Guid.Parse(idEmpresa),
                Nombre = nomb.Trim(),
                notas = nota.Trim(),
                fecha = Utilerias.FechaActual(),
                borrado = false
            };

            var json = JsonConvert.SerializeObject(departamento, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            string url = $"{Utilerias.UrlBase}InsertarPrimerDepartamento?empresa={empresa}&cadena={cadena}";
            var clientS = new RestClient(url);
            var request = new RestRequest { Method = Method.Post, RequestFormat = DataFormat.Json };
            request.AddJsonBody(json);
            RestResponse response = await clientS.ExecuteAsync(request);
            departamentoActual = await GetDepartamentoByIdAsync(departamentoId, cadena);
            if (!response.IsSuccessful || departamentoActual == null || !string.Equals(departamentoActual.idEmpresa?.ToString(), idEmpresa, StringComparison.OrdinalIgnoreCase))
            {
                return BootstrapOperationResult.Failure("Departamento", "No fue posible completar el departamento inicial.");
            }

            return BootstrapOperationResult.Ok("Departamento", departamentoId, false, true);
        }
        #endregion
        #endregion
    }
}
