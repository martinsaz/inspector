using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Web;
using checklist.Clases;
using checklist.Models.EstrcuturaCombo;
using checklist.Models.Roles;
using checklist.Models.Usuarios;
using Firebase.Auth;
using Firebase.Auth.Providers;
using Firebase.Database;
using Firebase.Database.Query;
using Firebase.Storage;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;



namespace checklist.Controllers.Usuarios
{
    public class UsuarioController : Controller
    {
        private readonly IConfiguration _configuration;

        public UsuarioController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IActionResult Index()
        {
            return View();
        }

        #region Combos

        public async Task<ActionResult> Inicializa(string idEmpresa, string cadena, string empresa)
        {
            string idRol = Utilerias.IdRol;

            Opciones opc = await Utilerias.GetOpcion("04001001", idEmpresa, idRol, empresa, cadena);
            return Json(new { d = "Ok", perm = opc.Permisos.Escritura });
        }
        public async Task<IActionResult> GetRoles(string idEmpresa, string cadena, string empresa, string searchTerm = "")
        {

            string sComp = string.Empty;
            searchTerm = JsonConvert.DeserializeObject<string>(searchTerm);
            if (!string.IsNullOrEmpty(searchTerm)) sComp = string.Format("&rol={0}", searchTerm);

            string url = string.Format("{0}GetComboRoles?idEmpresa={1}&empresa={3}{2}&cadena={4}", Utilerias.UrlBase, idEmpresa, sComp, empresa, cadena);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<DataPair> respuesta = JsonConvert.DeserializeObject<List<DataPair>>(response.Content);
            List<select2Data> result = new List<select2Data>();
            foreach (var resp in respuesta)
            {
                result.Add(new select2Data()
                {
                    id = resp.value,
                    text = resp.name
                });
            }
            return Json(new { d = result });
        }
        public async Task<IActionResult> GetSucursales(string idEmpresa, string cadena, string empresa, string searchTerm = "")
        {

            string sComp = string.Empty;
            searchTerm = JsonConvert.DeserializeObject<string>(searchTerm);
            if (!string.IsNullOrEmpty(searchTerm)) sComp = string.Format("&nombre={0}", searchTerm);

            string url = string.Format("{0}api/Sucursal/GetComboSucursales?idEmpresa={1}&empresa={3}{2}&cadena={4}", Utilerias.UrlBase, idEmpresa, sComp, empresa, cadena);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<DataPair> respuesta = JsonConvert.DeserializeObject<List<DataPair>>(response.Content);
            List<select2Data> result = new List<select2Data>();
            foreach (var resp in respuesta)
            {
                result.Add(new select2Data()
                {
                    id = resp.value,
                    text = resp.name
                });
            }
            return Json(new { d = result });
        }

        public async Task<IActionResult> GetDepartamentos(string idEmpresa, string cadena, string empresa, string searchTerm = "")
        {

            string sComp = string.Empty;
            searchTerm = JsonConvert.DeserializeObject<string>(searchTerm);
            if (!string.IsNullOrEmpty(searchTerm)) sComp = string.Format("&nombre={0}", searchTerm);

            string url = string.Format("{0}GetComboDepartamentos?idEmpresa={1}&empresa={3}{2}&cadena={4}", Utilerias.UrlBase, idEmpresa, sComp, empresa, cadena);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<DataPair> respuesta = JsonConvert.DeserializeObject<List<DataPair>>(response.Content);
            List<select2Data> result = new List<select2Data>();
            foreach (var resp in respuesta)
            {
                result.Add(new select2Data()
                {
                    id = resp.value,
                    text = resp.name
                });
            }
            return Json(new { d = result });
        }

        public async Task<IActionResult> GetPuestos(string idEmpresa, string cadena, string empresa, string searchTerm = "")
        {

            string sComp = string.Empty;
            searchTerm = JsonConvert.DeserializeObject<string>(searchTerm);
            if (!string.IsNullOrEmpty(searchTerm)) sComp = string.Format("&nombre={0}", searchTerm);

            string url = string.Format("{0}GetComboPuestos?idEmpresa={1}&empresa={3}{2}&cadena={4}", Utilerias.UrlBase, idEmpresa, sComp, empresa, cadena);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<DataPair> respuesta = JsonConvert.DeserializeObject<List<DataPair>>(response.Content);
            List<select2Data> result = new List<select2Data>();
            foreach (var resp in respuesta)
            {
                result.Add(new select2Data()
                {
                    id = resp.value,
                    text = resp.name
                });
            }
            return Json(new { d = result });
        }
        /*public async Task<IActionResult> GetSucursales(string idEmpresa, string cadena, string empresa, string opci = "")
		{
			
            string url = string.Format("{0}api/Sucursal/ObtenerSucursales?idEmpresa={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idEmpresa, empresa, cadena);

			var client = new RestClient(url);
			var request = new RestRequest();
			request.Method = Method.Get;
			RestResponse response = await client.ExecuteAsync(request);
			List<respSucursal> respuesta = JsonConvert.DeserializeObject<List<respSucursal>>(response.Content);
			List<respSucursal> respuestaOrden = respuesta.OrderBy(r => r.Nombre).ToList();
			string result = string.Empty;
			if (!string.IsNullOrEmpty(opci))
			{
				if (opci == "1") result = "<option value='00000000-0000-0000-0000-000000000000'>-- Todos --</option> ";
			}
			foreach (var resp in respuestaOrden)
			{
				result += string.Format("<option value='{0}'>{1}</option> ", resp.Id.Trim(), resp.Nombre.Trim());
			}
			return Json(new { d = result });
		}

		public async Task<IActionResult> GetDepartamentos(string idEmpresa, string cadena, string empresa)
		{
			
            string url = string.Format("{0}ObtenerDepartamentos?empresa={1}&idEmpresa={2}&cadena={3}", Utilerias.UrlBase, empresa, idEmpresa, cadena);

			var client = new RestClient(url);
			var request = new RestRequest();
			request.Method = Method.Get;
			RestResponse response = await client.ExecuteAsync(request);
			List<respZona> respuesta = JsonConvert.DeserializeObject<List<respZona>>(response.Content);
			List<respZona> respuestaOrden = respuesta.OrderBy(r => r.Nombre).ToList();
			string result = string.Empty;
			foreach (var resp in respuestaOrden)
			{
				result += string.Format("<option value='{0}'>{1}</option> ", resp.Id.Trim(), resp.Nombre.Trim());
			}
			return Json(new { d = result });
		}

		public async Task<IActionResult> GetPuestos(string idEmpresa, string cadena, string empresa)
		{
			
            string url = string.Format("{0}ObtenerPuestos?empresa={1}&idEmpresa={2}&cadena={3}", Utilerias.UrlBase, empresa, idEmpresa, cadena);

			var client = new RestClient(url);
			var request = new RestRequest();
			request.Method = Method.Get;
			RestResponse response = await client.ExecuteAsync(request);
			List<respZona> respuesta = JsonConvert.DeserializeObject<List<respZona>>(response.Content);
			List<respZona> respuestaOrden = respuesta.OrderBy(r => r.Nombre).ToList();
			string result = string.Empty;
			foreach (var resp in respuestaOrden)
			{
				result += string.Format("<option value='{0}'>{1}</option> ", resp.Id.Trim(), resp.Nombre.Trim());
			}
			return Json(new { d = result });
		}*/

        #endregion

        public async Task<IActionResult> GetSad()
        {
            ClaimsPrincipal claimUser = HttpContext.User;
            string empresa = claimUser.Claims
                .Where(c => c.Type == ClaimTypes.SerialNumber)
                .Select(c => c.Value).SingleOrDefault();
            string cadena = claimUser.Claims
                .Where(c => c.Type == ClaimTypes.Uri)
                .Select(c => c.Value).SingleOrDefault();
            string url = string.Format("{0}api/Usuario/ObtenerSuperAdminId?idEmpresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            return Json(new { d = JsonConvert.DeserializeObject<string>(response.Content) });
        }

        public async Task<IActionResult> GetDataUsuarios(string idEmpresa, string cadena, string empresa)
        {
            string url = string.Format("{0}api/Usuario/ObtenerUsuarios?idEmpresa={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idEmpresa, empresa, cadena);
            string idRol = Utilerias.IdRol;
            Opciones opc = await Utilerias.GetOpcion("04001001", idEmpresa, idRol, empresa, cadena);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respUsuariosCompleto> respuesta = JsonConvert.DeserializeObject<List<respUsuariosCompleto>>(response.Content);
            List<respUsuariosCompleto> respuestaOrden = respuesta.OrderBy(r => r.Nombre).ToList();
            StringBuilder sb = new StringBuilder();
            bool hasMoreRecords = false;
            sb.Append(@"{""sEcho"": 1,");
            sb.Append(@"""iTotalRecords"": " + respuestaOrden.Count + ",");
            sb.Append(@"""iTotalDisplayRecords"": " + respuestaOrden.Count + ",");
            sb.Append(@"""aaData"": [");
            foreach (var resp in respuestaOrden)
            {
                if (hasMoreRecords) sb.Append(",");
                sb.Append("[");

                if (opc.Permisos.Escritura == 1)
                {
                    sb.Append("\"" + HttpUtility.JavaScriptStringEncode("<a href='javascript:EditarUsuario(\"" + resp.id + "\")'; data-toggle='tooltip' title='Editar'><i class='fa fa-edit'></i></a>") + "\",");
                }
                else
                {
                    sb.Append("\"\",");

                }
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(string.Format("{0} {1} {2}", resp.Nombre, resp.APaterno, resp.AMaterno)) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.FechaNacimiento.ToString("dd/MM/yyyy")) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.NombreSucursal) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.NombreDepartamento) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.NombrePuesto) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Numero) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.TelefonoMovil) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.TelefonoFijo) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.CorreoInstitucional) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.CorreoPersonal) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.FechaIngreso.ToString("dd/MM/yyyy")) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode((bool)resp.Estatus ? "Si" : "No") + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Notas) + "\"");

                sb.Append("]");

                hasMoreRecords = true;
            }
            sb.Append("]}");
            var json = sb.ToString();

            return Content(json, "application/json");
        }

        public async Task<IActionResult> GetUsuario(string lla, string idEmpresa, string cadena, string empresa)
        {
            if (string.IsNullOrEmpty(lla))
            {
                return BadRequest("El parámetro 'lla' no puede estar vacío.");
            }

            if (lla == "1")
            {
                string idUsuario = User.FindFirstValue(ClaimTypes.NameIdentifier);
                string emailUsuario = User.FindFirstValue(ClaimTypes.Email);
                string numeroEmpresa = User.FindFirstValue(ClaimTypes.Sid);
                string urlUusario = string.Format("{0}api/Usuario/ObtenerUsuarioPorEmail?idEmpresa={1}&email={2}&empresa={3}&cadena={4}", Utilerias.UrlBase, idEmpresa, emailUsuario, numeroEmpresa, cadena);

                var cliente = new RestClient(urlUusario);
                var requestimg = new RestRequest();
                var request = new RestRequest();
                request.Method = Method.Get;
                RestResponse responseimg = await cliente.ExecuteAsync(request);
                List<respUsuario> respuestaimg = JsonConvert.DeserializeObject<List<respUsuario>>(responseimg.Content);
                respUsuario resultado = new respUsuario();
                foreach (var item in respuestaimg)
                {
                    resultado = item;
                }

                lla = resultado.Id;

            }

            string url = string.Format("{0}api/Usuario/ObtenerUsuario?idEmpresa={1}&id={2}&empresa={3}&cadena={4}", Utilerias.UrlBase, idEmpresa, lla, empresa, cadena);

            var client = new RestClient(url);
            var restRequest = new RestRequest();
            restRequest.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(restRequest);
            List<respUsuario> respuesta = JsonConvert.DeserializeObject<List<respUsuario>>(response.Content);

            if (respuesta == null || respuesta.Count == 0)
            {
                return NotFound("No se encontró el usuario.");
            }

            respUsuario result = respuesta.First();
            result.cadFechaNac = result.FechaNacimiento?.ToString("yyyy-MM-dd");
            result.cadFechaIng = result.FechaIngreso?.ToString("yyyy-MM-dd");
            result.ValEstado = result.Estado == true ? 1 : 0;

            return Json(new { d = result });
        }

        public async Task<IActionResult> GuardaUsuario([FromBody] dynamic parametros)
        {
            string llav = parametros.TryGetProperty("llav", out JsonElement llavElement) ? llavElement.GetString() : null;
            string nomb = parametros.TryGetProperty("nomb", out JsonElement nombElement) ? nombElement.GetString() : null;
            string apat = parametros.TryGetProperty("apat", out JsonElement apatElement) ? apatElement.GetString() : null;
            string amat = parametros.TryGetProperty("amat", out JsonElement amatElement) ? amatElement.GetString() : null;
            DateTime? fena = parametros.TryGetProperty("fena", out JsonElement fenaElement) ? DateTime.Parse(fenaElement.GetString()) : (DateTime?)null;
            string nume = parametros.TryGetProperty("nume", out JsonElement numeElement) ? numeElement.GetString() : null;
            string movi = parametros.TryGetProperty("movi", out JsonElement moviElement) ? moviElement.GetString() : null;
            string fijo = parametros.TryGetProperty("fijo", out JsonElement fijoElement) ? fijoElement.GetString() : null;
            string coin = parametros.TryGetProperty("coin", out JsonElement coinElement) ? coinElement.GetString() : null;
            string cope = parametros.TryGetProperty("cope", out JsonElement copeElement) ? copeElement.GetString() : null;
            string sucu = parametros.TryGetProperty("sucu", out JsonElement sucuElement) ? sucuElement.GetString() : null;
            string depa = parametros.TryGetProperty("depa", out JsonElement depaElement) ? depaElement.GetString() : null;
            string pues = parametros.TryGetProperty("pues", out JsonElement puesElement) ? puesElement.GetString() : null;
            bool? esta = parametros.TryGetProperty("esta", out JsonElement estaElement) ? (estaElement.GetString() == "1") : (bool?)null;
            DateTime? fein = parametros.TryGetProperty("fein", out JsonElement feinElement) ? DateTime.Parse(feinElement.GetString()) : (DateTime?)null;
            bool? stat = parametros.TryGetProperty("stat", out JsonElement statElement) ? statElement.GetBoolean() : (bool?)null;
            string im64 = parametros.TryGetProperty("im64", out JsonElement im64Element) ? im64Element.GetString() : null;
            string imca = parametros.TryGetProperty("imca", out JsonElement imcaElement) ? imcaElement.GetString() : null;
            string nota = parametros.TryGetProperty("nota", out JsonElement notaElement) ? notaElement.GetString() : null;
            string idRol = parametros.TryGetProperty("idRol", out JsonElement idRolElement) ? idRolElement.GetString() : null;

            string idEmpresa = parametros.TryGetProperty("idEmpresa", out JsonElement idEmpresaElement) ? idEmpresaElement.GetString() : null;
            string cadena = parametros.TryGetProperty("cadena", out JsonElement cadenaElement) ? cadenaElement.GetString() : null;
            string empresa = parametros.TryGetProperty("empresa", out JsonElement empresaElement) ? empresaElement.GetString() : null;

            string regresa = "Ok";
            var usuario = new respUsuario
            {
                Nombre = nomb.Trim(),
                APaterno = apat.Trim(),
                AMaterno = amat.Trim(),
                FechaNacimiento = Convert.ToDateTime(fena),
                Numero = nume.Trim(),
                TelefonoMovil = movi.Trim(),
                TelefonoFijo = fijo.Trim(),
                CorreoInstitucional = coin.Trim().ToLower(),
                CorreoPersonal = cope.Trim().ToLower(),
                IdSucursal = sucu.Trim(),
                IdDepartamento = depa.Trim(),
                IdPuesto = pues.Trim(),
                Estado = true,
                FechaIngreso = Convert.ToDateTime(fein),
                Estatus = Convert.ToBoolean(stat),
                Notas = nota.Trim(),
                borrado = false,
                FechaAlta = Utilerias.FechaActual(),
                IdEmpresa = idEmpresa,
                IdFirebase = "uid",
                idRol = Guid.Parse(idRol)
            };

            if (string.IsNullOrEmpty(llav))
            {
                usuario.Id = Guid.NewGuid().ToString();
                if (imca == "1")
                {
                    int posInicio = im64.IndexOf("base64,") + "base64,".Length;
                    string imag = im64.Substring(posInicio);
                    if (imag.Substring(imag.Length - 2) == "\")") imag = imag.Substring(0, imag.Length - 2);
                    byte[] cont = Convert.FromBase64String(imag);
                    Stream reader2 = new MemoryStream(cont);

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
                    var userCredential = await client.SignInWithEmailAndPasswordAsync(_configuration.GetValue<string>("fireBdata:fireUser"), _configuration.GetValue<string>("fireBdata:fireClave"));
                    var token = await userCredential.User.GetIdTokenAsync();
                    var task = new FirebaseStorage(_configuration.GetValue<string>("fireBdata:fireStorage"), new FirebaseStorageOptions
                    {
                        AuthTokenAsyncFactory = () => Task.FromResult(token),
                        ThrowOnCancel = true
                    }).Child($"{idEmpresa.ToUpper()}/FotoUsuario")
                      .Child(usuario.Id)
                      .PutAsync(reader2);
                    var downloadUrl = await task;
                    client.SignOut();
                    usuario.FotoLink = downloadUrl;
                }
                else { usuario.FotoLink = string.Empty; }

                var json = System.Text.Json.JsonSerializer.Serialize(usuario, new JsonSerializerOptions { DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull });
                string url = $"{Utilerias.UrlBase}api/Usuario/InsertarUsuario?empresa={empresa}&cadena={cadena}";
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Post;
                request.AddJsonBody(json);
                var response = await clientS.ExecuteAsync(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Usuario insertado correctamente") regresa = response.Content;
            }
            else
            {
                usuario.Id = llav;
                string url2 = $"{Utilerias.UrlBase}api/Usuario/ObtenerUsuario?idEmpresa={idEmpresa}&id={llav}&empresa={empresa}&cadena={cadena}";
                var client2 = new RestClient(url2);
                var request2 = new RestRequest();
                request2.Method = Method.Get;
                var response2 = await client2.ExecuteAsync(request2);
                var respuesta2 = JsonConvert.DeserializeObject<List<respUsuario>>(response2.Content);
                var result2 = respuesta2?[0];
                //
                if (imca == "1")
                {
                    int posInicio = im64.IndexOf("base64,") + "base64,".Length;
                    string imag = im64.Substring(posInicio);
                    if (imag.Substring(imag.Length - 2) == "\")") imag = imag.Substring(0, imag.Length - 2);
                    byte[] cont = Convert.FromBase64String(imag);
                    Stream reader2 = new MemoryStream(cont);
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
                    var userCredential = await client.SignInWithEmailAndPasswordAsync(_configuration.GetValue<string>("fireBdata:fireUser"), _configuration.GetValue<string>("fireBdata:fireClave"));
                    var token = await userCredential.User.GetIdTokenAsync();
                    try
                    {
                        var taskDel = new FirebaseStorage(_configuration.GetValue<string>("fireBdata:fireStorage"), new FirebaseStorageOptions
                        {
                            AuthTokenAsyncFactory = () => Task.FromResult(token),
                            ThrowOnCancel = true
                        }).Child($"{idEmpresa.ToUpper()}/FotoUsuario")
                          .Child(usuario.Id)
                          .DeleteAsync();
                    }
                    catch (Exception ex)
                    {
                        regresa = ex.Message;
                    }
                    if (regresa == "Ok")
                    {
                        var task = new FirebaseStorage(_configuration.GetValue<string>("fireBdata:fireStorage"), new FirebaseStorageOptions
                        {
                            AuthTokenAsyncFactory = () => Task.FromResult(token),
                            ThrowOnCancel = true
                        }).Child($"{idEmpresa.ToUpper()}/FotoUsuario")
                          .Child(usuario.Id)
                          .PutAsync(reader2);
                        var downloadUrl = await task;
                        usuario.FotoLink = downloadUrl;
                    }
                    client.SignOut();
                }
                else
                {
                    usuario.FotoLink = result2?.FotoLink;

                }
                if (regresa == "Ok")
                {
                    var json = System.Text.Json.JsonSerializer.Serialize(usuario, new JsonSerializerOptions { DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull });
                    string url = $"{Utilerias.UrlBase}api/Usuario/ActualizarUsuario?idEmpresa={idEmpresa}&empresa={empresa}&cadena={cadena}";
                    var clientS = new RestClient(url);
                    var request = new RestRequest();
                    request.Method = Method.Put;
                    request.AddJsonBody(json);
                    var response = await clientS.ExecuteAsync(request);
                    if (Utilerias.LimpiaCadena(response.Content) != "Usuario actualizado correctamente") regresa = response.Content;

                    // Actualizar firebase
                    var config_ = new FirebaseAuthConfig
                    {
                        ApiKey = _configuration.GetValue<string>("fireBdata:fireApiKey"),
                        AuthDomain = _configuration.GetValue<string>("fireBdata:fireAuthDomain"),
                        Providers = new FirebaseAuthProvider[] { new EmailProvider() }
                    };
                    var client_ = new FirebaseAuthClient(config_);
                    var authResult = await client_.SignInWithEmailAndPasswordAsync(_configuration.GetValue<string>("fireBdata:fireUser"), _configuration.GetValue<string>("fireBdata:fireClave"));
                    string firebaseToken = await client_.User.GetIdTokenAsync();
                    var firebaseClient = new FirebaseClient(
                        _configuration.GetValue<string>("fireBdata:fireDatabaseUrl"),
                        new FirebaseOptions { AuthTokenAsyncFactory = () => Task.FromResult(client_.User.Credential.RefreshToken) }
                    );
                    var usuariosFb = await firebaseClient.Child("Usuarios").OnceAsync<object>();
                    string uuidUsr = string.Empty;
                    foreach (var itemU in usuariosFb)
                    {
                        uuidUsr = itemU.Key;
                        Usuario1 usuario_ = JsonConvert.DeserializeObject<Usuario1>(itemU.Object.ToString());
                        if (usuario_.correo == cope.Trim().ToLower())
                        {
                            string tmpNombre = $"{usuario.Nombre.Trim()} {usuario.APaterno.Trim()} {usuario.AMaterno.Trim()}";
                            usuario_.nombre = tmpNombre.Trim();
                            usuario_.status = Convert.ToBoolean(stat);
                            string datos = JsonConvert.SerializeObject(usuario_, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                            await firebaseClient
                                .Child("Usuarios")
                                .Child(uuidUsr)
                                .PutAsync(datos);
                            break;
                        }
                    }
                    client_.SignOut();
                }
            }

            return Json(new { d = regresa });
        }
    }
}
