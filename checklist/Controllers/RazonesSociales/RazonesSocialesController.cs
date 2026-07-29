using checklist.Clases;
using checklist.Models.RazonSocial;
using checklist.Models.Roles;
using Firebase.Auth.Providers;
using Firebase.Auth;
using Firebase.Storage;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;
using System.Text;
using System.Web;
using checklist.Models.EstrcuturaCombo;
using checklist.Models.Firebase;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using checklist.Models.Zonas;

namespace checklist.Controllers.RazonesSociales
{
    public class RazonesSocialesController : Controller
    {
        private readonly IConfiguration _config;
        private readonly fbConfiguracion _fbConfig;

        public RazonesSocialesController(IConfiguration config, IOptions<fbConfiguracion> fbConfig)
        {
            _config = config;
            _fbConfig = fbConfig.Value;
        }

        public ActionResult Index()
        {
            return View();
        }

        public async Task<ActionResult> Inicializa(string idEmpresa, string cadena, string empresa)
        {
            string idRol;

            idRol = Utilerias.IdRol;


            Opciones opc = await Utilerias.GetOpcion("04004000", idEmpresa, idRol, empresa, cadena);
            return Json(new { d = "Ok", perm = opc.Permisos.Escritura });
        }

        public async Task<ActionResult> GetData(string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}ObtenerRazonesSociales?idEmpresa={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idEmpresa, empresa, cadena);
            string idRol = Utilerias.IdRol;
            Opciones opc = await Utilerias.GetOpcion("04004000", idEmpresa, idRol, empresa, cadena);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respRazonSocial> respuesta = JsonConvert.DeserializeObject<List<respRazonSocial>>(response.Content);
            List<respRazonSocial> respuestaOrden = respuesta.OrderBy(r => r.Nombre).ToList();
            StringBuilder sb = new StringBuilder();
            bool hasMoreRecords = false;
            sb.Append(@"{" + "\"sEcho\": 1,");
            sb.Append("\"iTotalRecords\": " + respuestaOrden.Count + ",");
            sb.Append("\"iTotalDisplayRecords\": " + respuestaOrden.Count + ",");
            sb.Append("\"aaData\": [");
            foreach (var resp in respuestaOrden)
            {
                if (hasMoreRecords) sb.Append(",");
                sb.Append("[");

                StringBuilder contenido = new StringBuilder();

                if (opc.Permisos.Escritura == 1)
                {

                    sb.Append("\"" + HttpUtility.JavaScriptStringEncode("<a href='javascript:EditarRazon(\"" + resp.Id + "\")'; data-toggle='tooltip' title='Editar'><i class='fa fa-edit'></i></a>") + "\",");
                }
                else
                {
                    sb.Append("\"\",");

                }


                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Nombre) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Representante) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.RFC) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Direccion) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Colonia) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.CodigoPostal) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Ciudad) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Estado) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Pais) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Telefono) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Regimen1) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Notas) + "\"");

               /* if (!string.IsNullOrEmpty(resp.IMGFIREBASE))
                {
                    string tmpImgg = resp.IMGFIREBASE.Trim();
                    sb.Append("\"" + HttpUtility.JavaScriptStringEncode("<img class='rounded-lg' src='" + tmpImgg + "' alt='Foto' style='width: 90px; height: auto;' data-toggle='tooltip' title='Editar información'>") + "\"");
                }
                else
                {
                    sb.Append("\"\"");
                }*/


                sb.Append("]");
                hasMoreRecords = true;
            }
            sb.Append("]}");
            var jsonResult = Json(new { d = sb.ToString() });

            return jsonResult;
        }

        public async Task<ActionResult> GetRazon(string lla, string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}ObtenerRazonSocial?idEmpresa={1}&id={2}&empresa={3}&cadena={4}", Utilerias.UrlBase, idEmpresa, lla, empresa, cadena);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respRazonSocial> respuesta = JsonConvert.DeserializeObject<List<respRazonSocial>>(response.Content);
            respRazonSocial result = new respRazonSocial();
            foreach (var item in respuesta)
            {
                result = item;
            }
            return Json(new { d = result });
        }

        private string ValidarYAsignar(string valor)
        {
            return string.IsNullOrWhiteSpace(valor) ? string.Empty : valor.Trim();
        }

        public async Task<ActionResult> Guardar(
       string idEmpresa, string cadena, string empresa, string llav, string razo,
       string repr, string rfc, string dire, string colo, string cp_, string ciud,
       string esta, string pais, string tele, string im64, string imca, string nota, string regi)
        {
            string regresa = "Ok";
            respRazonSocial item = new respRazonSocial
            {
                IdEmpresa = idEmpresa,
                Nombre = razo?.Trim() ?? "",
                Representante = repr?.Trim() ?? "",
                RFC = rfc?.Trim().ToUpper() ?? "",
                Direccion = dire?.Trim() ?? "",
                Colonia = colo?.Trim() ?? "",
                CodigoPostal = cp_?.Trim() ?? "",
                Ciudad = ciud?.Trim() ?? "",
                Estado = esta?.Trim() ?? "",
                Pais = pais?.Trim() ?? "",
                Telefono = tele?.Trim() ?? "",
                Regimen1 = regi?.Trim() ?? "",
                Fecha = Utilerias.FechaActual(),
                borrado = false,
                Notas = nota?.Trim() ?? ""
            };

            // Manejo de imagen en base64 (logorazon)
            if (imca == "1" && !string.IsNullOrEmpty(im64))
            {
                try
                {
                    int posInicio = im64.IndexOf("base64,") + "base64,".Length;
                    string imag = im64.Substring(posInicio);
                    if (imag.EndsWith("\")")) imag = imag.Substring(0, imag.Length - 2);
                    byte[] cont = Convert.FromBase64String(imag);
                    using Stream reader2 = new MemoryStream(cont);

                    var config = new FirebaseAuthConfig
                    {
                        ApiKey = _fbConfig.fireApiKey,
                        AuthDomain = _fbConfig.fireAuthDomain,
                        Providers = new FirebaseAuthProvider[] { new EmailProvider() }
                    };
                    var client = new FirebaseAuthClient(config);
                    var userCredential = await client.SignInWithEmailAndPasswordAsync(_fbConfig.fireUser, _fbConfig.fireClave);
                    var token = await userCredential.User.GetIdTokenAsync();

                    // Si existe una llave, intenta eliminar la imagen anterior
                    if (!string.IsNullOrEmpty(llav))
                    {
                        string urlOldImage = string.Format("{0}LogoRazonSocial/{1}", empresa, item.Nombre);
                        await new FirebaseStorage(_fbConfig.fireStorage, new FirebaseStorageOptions
                        {
                            AuthTokenAsyncFactory = () => Task.FromResult(token),
                            ThrowOnCancel = true
                        }).Child(urlOldImage).DeleteAsync();
                    }

                    // Subir la nueva imagen
                    var task = new FirebaseStorage(_fbConfig.fireStorage, new FirebaseStorageOptions
                    {
                        AuthTokenAsyncFactory = () => Task.FromResult(token),
                        ThrowOnCancel = true
                    }).Child(string.Format("{0}LogoRazonSocial", empresa))
                      .Child(razo.Trim())
                      .PutAsync(reader2);

                    var downloadUrl = await task;
                    item.IMGFIREBASE = downloadUrl;
                }
                catch (Exception ex)
                {
                    regresa = $"Error al guardar imagen: {ex.Message}";
                }
            }

            string url = string.Empty;
            if (string.IsNullOrEmpty(llav)) // Crear nueva razón social
            {
                url = $"{Utilerias.UrlBase}InsertarRazonSocial?empresa={empresa}&cadena={cadena}";
            }
            else // Actualizar razón social existente
            {
                item.Id = llav;
                url = $"{Utilerias.UrlBase}ActualizarRazonSocial?id={llav}&idEmpresa={idEmpresa}&empresa={empresa}&cadena={cadena}";
            }

            try
            {
                var json = JsonConvert.SerializeObject(item, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = string.IsNullOrEmpty(llav) ? Method.Post : Method.Put;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(json);

                var response = clientS.Execute(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Ok")
                    regresa = response.Content;
            }
            catch (Exception ex)
            {
                regresa = $"Error al guardar razón social: {ex.Message}";
            }

            return Json(new { d = regresa });
        }




        public async Task<ActionResult> Guardar2(string idEmpresa, string cadena, string empresa, string llav, string razo, string repr, string rfc, string dire, string colo, string cp_, string ciud, string esta, string pais, string tele, string im64, string imca, string nota, string regi)
        {
            string regresa = "Ok";
            respRazonSocial item = new respRazonSocial();


            item.IdEmpresa = idEmpresa;
            item.Nombre = razo != null ? razo.Trim() : "";
            item.Representante = repr != null ? repr.Trim() : "";
            item.RFC = rfc != null ? rfc.Trim().ToUpper() : "";
            item.Direccion = dire != null ? dire.Trim() : "";
            item.Colonia = colo != null ? colo.Trim() : "";
            item.CodigoPostal = cp_ != null ? cp_.Trim() : "";
            item.Ciudad = ciud != null ? ciud.Trim() : "";
            item.Estado = esta != null ? esta.Trim() : "";
            item.Pais = pais != null ? pais.Trim() : "";
            item.Telefono = tele != null ? tele.Trim() : "";
            item.Regimen1 = regi != null ? regi.Trim() : "";
            item.Fecha = Utilerias.FechaActual();
            item.borrado = false;
            item.Notas = nota != null ? nota.Trim() : "";



            if (string.IsNullOrEmpty(llav))
            {
                try
                {

                    var json = JsonConvert.SerializeObject(item, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                    string url = string.Format("{0}InsertarRazonSocial?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
                    var clientS = new RestClient(url);
                    var request = new RestRequest();
                    request.Method = Method.Post;
                    request.RequestFormat = DataFormat.Json;
                    request.AddJsonBody(json);
                    var response = clientS.Execute(request);
                    if (Utilerias.LimpiaCadena(response.Content) != "Ok") regresa = response.Content;
                }
                catch (Exception ex)
                {
                    string sComp = string.Empty;
                    if (ex.InnerException != null)
                    {
                        sComp = ex.InnerException.Message;
                    }
                    regresa = string.Format("Nueva.Razón Social: {0} - {1}", ex.Message, sComp);
                }
            }
            else
            {
                item.Id = llav;
                var json = JsonConvert.SerializeObject(item, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                string url = string.Format("{0}ActualizarRazonSocial/{1}?id={1}&idEmpresa={2}&empresa={3}&cadena={4}", Utilerias.UrlBase, llav, idEmpresa, empresa, cadena);
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Put;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(json);
                var response = clientS.Execute(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Ok") regresa = response.Content;

            }
            return Json(new { d = regresa });
        }
        public async Task<ActionResult> GuardaRazon(string llav, string razo, string repr, string rfc, string dire, string colo, string cp_, string ciud, string esta, string pais, string tele, string im64, string imca, string nota, string regi)
        {
            string empresa = User.FindFirstValue(ClaimTypes.Sid);
            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
            string cadena = User.FindFirstValue(ClaimTypes.Uri);

            string regresa = "Ok";
            respRazonSocial razon = new respRazonSocial();
            razon.IdEmpresa = idEmpresa;
            razon.Nombre = razo.Trim();
            razon.Representante = repr.Trim();
            razon.RFC = rfc.Trim().ToUpper();
            razon.Direccion = dire.Trim();
            razon.Colonia = colo.Trim();
            razon.CodigoPostal = cp_.Trim();
            razon.Ciudad = ciud.Trim();
            razon.Estado = esta.Trim();
            razon.Pais = pais.Trim();
            razon.Telefono = tele.Trim();
            razon.Regimen1 = regi.Trim();
            razon.Fecha = Utilerias.FechaActual();
            razon.borrado = false;
            razon.Notas = nota.Trim();

            if (string.IsNullOrEmpty(llav))
            {
                try
                {
                    // Nueva razón
                    if (imca == "1")
                    {
                        int posInicio = im64.IndexOf("base64,") + "base64,".Length;
                        string imag = im64.Substring(posInicio);
                        if (imag.Substring(imag.Length - 2) == "\")") imag = imag.Substring(0, imag.Length - 2);
                        byte[] cont = Convert.FromBase64String(imag);
                        Stream reader2 = new MemoryStream(cont);

                        var config = new FirebaseAuthConfig
                        {
                            ApiKey = _fbConfig.fireApiKey,  // ConfigurationManager.AppSettings["fireApiKey"],
                            AuthDomain = _fbConfig.fireAuthDomain,  // ConfigurationManager.AppSettings["fireAuthDomain"],
                            Providers = new FirebaseAuthProvider[]
                    {
                      new EmailProvider()
                    }
                        };
                        // Create Client
                        var client = new FirebaseAuthClient(config);
                        // _fbConfig.fireUser, _fbConfig.fireClave
                        var userCredential = await client.SignInWithEmailAndPasswordAsync(_fbConfig.fireUser, _fbConfig.fireClave);
                        var token = await userCredential.User.GetIdTokenAsync();
                        // _fbConfig.fireStorage
                        var task = new FirebaseStorage(_fbConfig.fireStorage, new FirebaseStorageOptions
                        {
                            AuthTokenAsyncFactory = () => Task.FromResult(token),
                            ThrowOnCancel = true
                        }).Child(string.Format("{0}LogoRazonSocial", empresa))
                        .Child(razo.Trim())
                        .PutAsync(reader2);
                        var downloadUrl = await task;

                        razon.IMGFIREBASE = downloadUrl;
                    }
                    //
                    var json = JsonConvert.SerializeObject(razon, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                    string url = string.Format("{0}api/RazonSocial", Utilerias.UrlBase);
                    var clientS = new RestClient(url);
                    var request = new RestRequest();
                    request.Method = Method.Post;
                    request.RequestFormat = DataFormat.Json;
                    request.AddStringBody(json, DataFormat.Json);
                    var response = clientS.Execute(request);
                    if (Utilerias.LimpiaCadena(response.Content) != "Razón social creada correctamente") regresa = response.Content;
                }
                catch (Exception ex)
                {
                    string sComp = string.Empty;
                    if (ex.InnerException != null)
                    {
                        sComp = ex.InnerException.Message;
                    }
                    regresa = string.Format("Nueva.RazonSocial: {0} - {1}", ex.Message, sComp);
                }
            }
            else
            {
                razon.Id = llav;
                // traer registro anterior
                string url2 = string.Format("{0}ObtenerRazonSocial?idEmpresa={1}&id={2}", Utilerias.UrlBase, empresa, llav);
                var client2 = new RestClient(url2);
                var request2 = new RestRequest();
                request2.Method = Method.Get;
                RestResponse response2 = await client2.ExecuteAsync(request2);
                List<respRazonSocial> respuesta2 = JsonConvert.DeserializeObject<List<respRazonSocial>>(response2.Content);
                respRazonSocial result2 = new respRazonSocial();
                foreach (var item in respuesta2)
                {
                    result2 = item;
                    break;
                }
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
                        ApiKey = _fbConfig.fireApiKey,  // ConfigurationManager.AppSettings["fireApiKey"],
                        AuthDomain = _fbConfig.fireAuthDomain,  // ConfigurationManager.AppSettings["fireAuthDomain"],
                        Providers = new FirebaseAuthProvider[]
                {
                      new EmailProvider()
                }
                    };
                    // Create Client
                    var client = new FirebaseAuthClient(config);
                    // _fbConfig.fireUser, _fbConfig.fireClave
                    var userCredential = await client.SignInWithEmailAndPasswordAsync(_fbConfig.fireUser, _fbConfig.fireClave);
                    var token = await userCredential.User.GetIdTokenAsync();

                    // Delete old file
                    try
                    {
                        // _fbConfig.fireStorage
                        var taskDel = new FirebaseStorage(_fbConfig.fireStorage, new FirebaseStorageOptions
                        {
                            AuthTokenAsyncFactory = () => Task.FromResult(token),
                            ThrowOnCancel = true
                        }).Child(string.Format("{0}LogoRazonSocial", empresa))
                    .Child(result2.Nombre.Trim())
                    .DeleteAsync();
                    }
                    catch (Exception ex)
                    {
                        regresa = ex.Message;
                    }
                    if (regresa == "Ok")
                    {
                        // Store new file
                        // _fbConfig.fireStorage
                        var task = new FirebaseStorage(_fbConfig.fireStorage, new FirebaseStorageOptions
                        {
                            AuthTokenAsyncFactory = () => Task.FromResult(token),
                            ThrowOnCancel = true
                        }).Child(string.Format("{0}LogoRazonSocial", empresa))
                        .Child(razo.Trim())
                        .PutAsync(reader2);
                        var downloadUrl = await task;

                        razon.IMGFIREBASE = downloadUrl;
                    }
                }
                else
                {
                    razon.IMGFIREBASE = result2.IMGFIREBASE;
                }
                if (regresa == "Ok")
                {
                    var json = JsonConvert.SerializeObject(razon, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                    string url = string.Format("{0}api/RazonSocial/?id={1}&idEmpresa={2}", Utilerias.UrlBase, llav, empresa);
                    var clientS = new RestClient(url);
                    var request = new RestRequest();
                    request.Method = Method.Put;
                    request.RequestFormat = DataFormat.Json;
                    request.AddStringBody(json, DataFormat.Json);
                    var response = clientS.Execute(request);
                    if (Utilerias.LimpiaCadena(response.Content) != "Razón social actualizada correctamente") regresa = response.Content;
                }
            }
            return Json(new { d = regresa });
        }
    }
}

