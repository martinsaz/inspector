using checklist.Clases;
using checklist.Extensions;
using checklist.Models.EstrcuturaCombo;
using checklist.Models.Listas;
using checklist.Models.Preguntas;
using checklist.Models.Roles;
using checklist.Models.Temporales;
using checklist.Models.Usuarios;
using Firebase.Auth.Providers;
using Firebase.Auth;
using Firebase.Storage;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;
using System.Security.Claims;
using System.Text.Json;
using System.Text;

namespace checklist.Controllers.ContestadorHibrido
{

    public class ContestarListaHibrida : Controller
    {

        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _clientFactory;

        public ContestarListaHibrida(IConfiguration configuration, IHttpClientFactory clientFactory)
        {
            _configuration = configuration;
            _clientFactory = clientFactory;
        }

        public IActionResult ListaHibrida()
        {
            return View();
        }

        public async Task<ActionResult> Inicializa()
        {

            string empresa = User.FindFirstValue(ClaimTypes.Sid);
            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
            string cadena = User.FindFirstValue(ClaimTypes.Uri);
            string idRol = User.FindFirstValue(ClaimTypes.Role);
            Opciones opc = await Utilerias.GetOpcion("02002000", idEmpresa, idRol, empresa, cadena);
            return Json(new { d = "Ok", perm = opc.Permisos.Escritura });
        }

        public async Task<ActionResult> GetProgramasXAlumno(string searchTerm)
        {
            string empresa = User.FindFirstValue(ClaimTypes.Sid);
            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
            string cadena = User.FindFirstValue(ClaimTypes.Uri);
            string url = $"{Utilerias.UrlBase}api/Usuario/ObtenerUsuarioPorEmail?idEmpresa={idEmpresa}&email=omag@gmail.com&empresa={empresa}&cadena={cadena}";
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respUsuario> respuesta = JsonConvert.DeserializeObject<List<respUsuario>>(response.Content);
            respUsuario result = new respUsuario();
            foreach (var item in respuesta)
            {
                result = item;
            }



            searchTerm = JsonConvert.DeserializeObject<string>(searchTerm);
            string sComp = string.Empty;
            if (!string.IsNullOrEmpty(searchTerm)) sComp = string.Format("&nombre={0}", searchTerm.Trim());
            url = $"{Utilerias.UrlBase}api/Evaluaciones/ObtenerComboProgramasXAlumno?idAlumno={result.Id}&empresa={empresa}&idEmpresa={idEmpresa}{sComp}&cadena={cadena}";

            client = new RestClient(url);
            request = new RestRequest();
            request.Method = Method.Get;
            response = await client.ExecuteAsync(request);
            List<DataPair3> respuesta2 = JsonConvert.DeserializeObject<List<DataPair3>>(response.Content);
            List<select3Data> result2 = new List<select3Data>();

            foreach (var resp2 in respuesta2)
            {
                result2.Add(new select3Data()
                {
                    id = resp2.idLista,
                    text = resp2.name,
                    idLista = resp2.idLista

                });
            }
            return Json(new { d = result2 });
        }

        /*  public async Task<ActionResult> GetAlumnosComboBox(string opci)
          {
              string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
              string url = string.Format("{0}ObtenerClientesComp?idEmpresa={1}", Utilerias.UrlBase, idEmpresa);

              var client = new RestClient(url);
              var request = new RestRequest();
              request.Method = Method.Get;
              RestResponse response = await client.ExecuteAsync(request);
              List<resppCliente> respuesta = JsonConvert.DeserializeObject<List<resppCliente>>(response.Content);
              string result = string.Empty;
              if (opci == "1") result = "<option value='b'> -- Todos --  </option> ";
              foreach (var resp in respuesta)
              {
                  result += String.Format("<option value='{0}'>{1}</option> ", resp.Id, resp.Nombre.Trim());
              }
              return Json(new { d = result });

          }*/

        public async Task<ActionResult> GetListasCerradasComboBox(string opci)
        {
            string empresa = User.FindFirstValue(ClaimTypes.Sid);
            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
            string cadena = User.FindFirstValue(ClaimTypes.Uri);
            string url = $"{Utilerias.UrlBase}Listas/GetTodosCerradas?idEmpresa={idEmpresa}&empresa={empresa}&cadena={cadena}";

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<Lista> respuesta = JsonConvert.DeserializeObject<List<Lista>>(response.Content);
            string result = string.Empty;
            if (opci == "1") result = "<option value='b'> -- Todos --  </option> ";
            foreach (var resp in respuesta)
            {
                result += String.Format("<option value='{0}'>{1}</option> ", resp.id, resp.Nombre.Trim());
            }
            return Json(new { d = result });

        }

        public async Task<ActionResult> GetSucursales(string opci)
        {
            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
            string empresa = User.FindFirstValue(ClaimTypes.Sid);
            string cadena = User.FindFirstValue(ClaimTypes.Uri);
            string url = $"{Utilerias.UrlBase}api/Sucursal/ObtenerSucursales?idEmpresa={idEmpresa}&empresa={empresa}&cadena={cadena}";

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<Lista> respuesta = JsonConvert.DeserializeObject<List<Lista>>(response.Content);
            string result = string.Empty;
            result = "<option value='0'> -- Selecciona una sucursal --  </option> ";
            foreach (var resp in respuesta)
            {
                result += String.Format("<option value='{0}'>{1}</option> ", resp.id, resp.Nombre.Trim());
            }
            return Json(new { d = result });

        }

        public async Task<ActionResult> GetUsuariosXSucursal([FromBody] dynamic parametros)
        {
            string empresa = User.FindFirstValue(ClaimTypes.Sid);
            string idSucursal = parametros.TryGetProperty("idSucursal", out JsonElement idSucursalElement) ? idSucursalElement.GetString() : null;
            string cadena = User.FindFirstValue(ClaimTypes.Uri);
            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
            string url = $"{Utilerias.UrlBase}api/Usuario/ObtenerUsuariosCompleto?idEmpresa={idEmpresa}&empresa={empresa}&cadena={cadena}";

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respUsuario> respuesta = JsonConvert.DeserializeObject<List<respUsuario>>(response.Content);
            string result = string.Empty;
            result = "<option value='0'> -- Selecciona un USUARIO --  </option> ";
            foreach (var resp in respuesta)
            {
                result += String.Format("<option value='{0}'>{1}</option> ", resp.Id, resp.Nombre.Trim() + " " + resp.APaterno + " " + resp.AMaterno);
            }
            return Json(new { d = result });

        }

        public async Task<ActionResult> GetData(string idPrograma, string idLista)
        {
            string empresa = User.FindFirstValue(ClaimTypes.Sid);
            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
            string cadena = User.FindFirstValue(ClaimTypes.Uri);
            string url = $"{Utilerias.UrlBase}api/Evaluaciones/Evaluacion/ObtenerPreguntasXPrograma?idPrograma={idPrograma}&idLista={idLista}&empresa={empresa}&cadena={cadena}";

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<PreguntasXResponder> respuesta = JsonConvert.DeserializeObject<List<PreguntasXResponder>>(response.Content);
            string result = string.Empty;

            return Json(new { d = respuesta });
        }
        public async Task<ActionResult> GetElementoOpciones(string llav, string tipoPregunta)
        {
            string empresa = User.FindFirstValue(ClaimTypes.Sid);
            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
            string cadena = User.FindFirstValue(ClaimTypes.Uri);
            string url = $"{Utilerias.UrlBase}ListasPreguntasOpciones/GetPregunta?idPregunta={llav}&empresa={empresa}&cadena={cadena}&tipoPregunta={tipoPregunta}";
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<PreguntasOpciones> respuesta = JsonConvert.DeserializeObject<List<PreguntasOpciones>>(response.Content);

            return Json(new { d = respuesta });
        }

        [HttpPost]
        public async Task<ActionResult> GuardarRespuesta([FromBody] List<Respuesta> ListaRespuesta)
        {
            try
            {
                string empresa = ListaRespuesta[0].empresa;
                string idEmpresa = ListaRespuesta[0].idEmpresa;
                string cadena = ListaRespuesta[0].cadena;
                string emailUsuario = ListaRespuesta[0].correo;

                // Obtener el usuario por email
                respUsuario usuario = await ObtenerUsuarioPorEmail(idEmpresa, emailUsuario, empresa, cadena);
                if (usuario == null)
                {
                    return Json(new { d = "Error al obtener el usuario" });
                }

                // Enviar las respuestas
                string resultado = await EnviarRespuestas(ListaRespuesta, usuario, idEmpresa, empresa, cadena);
                return Json(new { d = resultado });
            }
            catch (HttpRequestException httpEx)
            {
                return Json(new { d = $"Error de conexión: {httpEx.Message}" });
            }
            catch (Exception ex)
            {
                return Json(new { d = $"Error: {ex.Message}" });
            }
        }

        // Método para obtener el usuario por email
        private async Task<respUsuario> ObtenerUsuarioPorEmail(string idEmpresa, string emailUsuario, string empresa, string cadena)
        {
            string url = $"{Utilerias.UrlBase}api/Usuario/ObtenerUsuarioPorEmail?idEmpresa={idEmpresa}&email={emailUsuario}&empresa={empresa}&cadena={cadena}";
            using (var client = new HttpClient())
            {
                client.Timeout = TimeSpan.FromMinutes(10);
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string responseBody = await response.Content.ReadAsStringAsync();
                List<respUsuario> respuesta = JsonConvert.DeserializeObject<List<respUsuario>>(responseBody);
                return respuesta.FirstOrDefault();
            }
        }

        // Método para enviar las respuestas a la API
        private async Task<string> EnviarRespuestas(List<Respuesta> ListaRespuesta, respUsuario usuario, string idEmpresa, string empresa, string cadena)
        {
            long timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            string regresa = "Ok";

            foreach (var item in ListaRespuesta)
            {
                try
                {
                    ListasRespuestas zona = new ListasRespuestas
                    {
                        idEmpresa = Guid.Parse(idEmpresa.ToString()),
                        idLista = Guid.Parse(item.idLista),
                        idPregunta = Guid.Parse(item.idPregunta),
                        RespuestaValor = item.respuestaValor,
                        Notas = item.notas,
                        idAlumno = Guid.Parse(usuario.Id),
                        idPrograma = Guid.Parse(item.idPrograma),
                        idTipoPregunta = item.idTipoPregunta,
                        Explicacion = item.explicacion,
                        Valor = item.valor,
                        Calificacion = item.calificacion,
                        obligatoria = item.obligatoria,
                        // urlVideos = item.urlVideos,
                        urlFotos = item.urlFotos,
                        RespuestaCorrecta = item.RespuestaCorrecta,
                        idSucursal = item.idSucursal,
                        idUsuario = item.idUsuario,
                        latitud = item.latitud,
                        longitud = item.longitud,
                        stamp = timestamp.ToString()
                    };

                    var json = JsonConvert.SerializeObject(zona, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                    string url = $"{Utilerias.UrlBase}api/Evaluaciones?evento={item.evento}&empresa={empresa}&cadena={cadena}";

                    using (var clientS = new HttpClient())
                    {
                        clientS.Timeout = TimeSpan.FromMinutes(10);
                        var request = new HttpRequestMessage(HttpMethod.Post, url)
                        {
                            Content = new StringContent(json, Encoding.UTF8, "application/json")
                        };
                        HttpResponseMessage response = await clientS.SendAsync(request);

                        if (!response.IsSuccessStatusCode)
                        {
                            string errorContent = await response.Content.ReadAsStringAsync();
                            return $"Error {response.StatusCode}: {errorContent}";
                        }

                        string responseContent = await response.Content.ReadAsStringAsync();
                        if (Utilerias.LimpiaCadena(responseContent) != "Ok")
                        {
                            regresa = responseContent;
                        }
                    }
                }
                catch (Exception ex)
                {
                    return $"Error al procesar la respuesta: {ex.Message}";
                }
            }

            return regresa;
        }
        //private async Task<string> UploadFileToFirebaseStorage(string filePath, string fileType)
        //{

        //    //// Subir videos a Firebase Storage y obtener las URLs
        //    //List<string> videoUrls = new List<string>();
        //    //foreach (var videoPath in item.urlVideos)
        //    //{
        //    //    //var videoUrl = await UploadFileToFirebaseStorage(videoPath, "video");
        //    //    videoUrls.Add(videoPath);
        //    //}

        //    //// Subir fotos a Firebase Storage y obtener las URLs
        //    //List<string> photoUrls = new List<string>();
        //    //foreach (var photoPath in item.urlFotos)
        //    //{
        //    //   // var photoUrl = await UploadFileToFirebaseStorage(photoPath, "foto");
        //    //    photoUrls.Add(photoPath);
        //    //}
        //    string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
        //    Stream reader2;
        //    var fileName = "";
        //    if (fileType == "foto")
        //    {
        //        int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
        //        string imag = filePath.Substring(posInicio);
        //        if (imag.Substring(imag.Length - 2) == "\")") imag = imag.Substring(0, imag.Length - 2);
        //        byte[] cont = Convert.FromBase64String(imag);
        //        reader2 = new MemoryStream(cont);
        //        fileName = Guid.NewGuid().ToString();
        //    }
        //    else if (fileType == "video")
        //    {
        //        int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
        //        string base64String = filePath.Substring(posInicio);
        //        byte[] byteArray = Convert.FromBase64String(base64String);
        //        reader2 = new MemoryStream(byteArray);
        //        fileName = Guid.NewGuid().ToString() + ".mp4";
        //    }
        //    else
        //    {
        //        throw new ArgumentException("Tipo de archivo no soportado", nameof(fileType));
        //    }

        //    // Configuración de Firebase Auth
        //    var config = new FirebaseAuthConfig
        //    {
        //        ApiKey = _configuration.GetValue<string>("fireBdata:fireApiKey"),
        //        AuthDomain = _configuration.GetValue<string>("fireBdata:fireAuthDomain"),
        //        Providers = new FirebaseAuthProvider[]
        //        {
        //    new EmailProvider()
        //        }
        //    };

        //    var client = new FirebaseAuthClient(config);
        //    var userCredential = await client.SignInWithEmailAndPasswordAsync(
        //        _configuration.GetValue<string>("fireBdata:fireUser"),
        //        _configuration.GetValue<string>("fireBdata:fireClave")
        //    );
        //    var token = await userCredential.User.GetIdTokenAsync();

        //    // Determinar la carpeta en Firebase Storage basada en el tipo de archivo
        //    string storageFolder = fileType switch
        //    {
        //        "video" => $"{idEmpresa.ToUpper()}/Videos",
        //        "foto" => $"{idEmpresa.ToUpper()}/Fotos",
        //        "archivo" => $"{idEmpresa.ToUpper()}/Archivos",
        //        _ => throw new ArgumentException("Tipo de archivo no soportado", nameof(fileType))
        //    };

        //    try
        //    {
        //        // Subir el archivo a Firebase Storage
        //        var firebaseStorage = new FirebaseStorage(
        //            _configuration.GetValue<string>("fireBdata:fireStorage"),
        //            new FirebaseStorageOptions
        //            {
        //                AuthTokenAsyncFactory = () => Task.FromResult(token),
        //                ThrowOnCancel = true
        //            });




        //        var task = firebaseStorage
        //            .Child(storageFolder)
        //            .Child(fileName)
        //            .PutAsync(reader2);

        //        // Obtener la URL de descarga
        //        var downloadUrl = await task;
        //        return downloadUrl;
        //    }
        //    catch (Exception ex)
        //    {
        //        throw new Exception($"Error al subir el archivo a Firebase Storage: {ex.Message}");
        //    }
        //}


        //[HttpPost]
        //public async Task<ActionResult> UploadFileToFirebaseStorage2old([FromBody] dynamic parametros)
        //{

        //    string filePath = parametros.TryGetProperty("filePath", out JsonElement filePathElement) ? filePathElement.GetString() : null;
        //    string fileType = parametros.TryGetProperty("fileType", out JsonElement fileTypeElement) ? fileTypeElement.GetString() : null;

        //    string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
        //    Stream reader2;
        //    var fileName = "";
        //    if (fileType == "foto")
        //    {
        //        int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
        //        string imag = filePath.Substring(posInicio);
        //        if (imag.Substring(imag.Length - 2) == "\")") imag = imag.Substring(0, imag.Length - 2);
        //        byte[] cont = Convert.FromBase64String(imag);
        //        reader2 = new MemoryStream(cont);
        //        fileName = Guid.NewGuid().ToString();
        //    }
        //    else if (fileType == "video")
        //    {
        //        int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
        //        string base64String = filePath.Substring(posInicio);
        //        byte[] byteArray = Convert.FromBase64String(base64String);
        //        reader2 = new MemoryStream(byteArray);
        //        fileName = Guid.NewGuid().ToString() + ".mp4";
        //    }
        //    else
        //    {
        //        throw new ArgumentException("Tipo de archivo no soportado", nameof(fileType));
        //    }

        //    // Configuración de Firebase Auth
        //    var config = new FirebaseAuthConfig
        //    {
        //        ApiKey = _configuration.GetValue<string>("fireBdata:fireApiKey"),
        //        AuthDomain = _configuration.GetValue<string>("fireBdata:fireAuthDomain"),
        //        Providers = new FirebaseAuthProvider[]
        //        {
        //    new EmailProvider()
        //        }
        //    };

        //    var client = new FirebaseAuthClient(config);
        //    var userCredential = await client.SignInWithEmailAndPasswordAsync(
        //        _configuration.GetValue<string>("fireBdata:fireUser"),
        //        _configuration.GetValue<string>("fireBdata:fireClave")
        //    );
        //    var token = await userCredential.User.GetIdTokenAsync();

        //    // Determinar la carpeta en Firebase Storage basada en el tipo de archivo
        //    string storageFolder = fileType switch
        //    {
        //        "video" => $"{idEmpresa.ToUpper()}/Videos",
        //        "foto" => $"{idEmpresa.ToUpper()}/Fotos",
        //        "archivo" => $"{idEmpresa.ToUpper()}/Archivos",
        //        _ => throw new ArgumentException("Tipo de archivo no soportado", nameof(fileType))
        //    };

        //    try
        //    {
        //        // Subir el archivo a Firebase Storage
        //        var firebaseStorage = new FirebaseStorage(
        //            _configuration.GetValue<string>("fireBdata:fireStorage"),
        //            new FirebaseStorageOptions
        //            {
        //                AuthTokenAsyncFactory = () => Task.FromResult(token),
        //                ThrowOnCancel = true
        //            });




        //        var task = firebaseStorage
        //            .Child(storageFolder)
        //            .Child(fileName)
        //            .PutAsync(reader2);

        //        // Obtener la URL de descarga
        //        var downloadUrl = await task;

        //        return Json(new { d = downloadUrl });
        //    }
        //    catch (Exception ex)
        //    {
        //        throw new Exception($"Error al subir el archivo a Firebase Storage: {ex.Message}");
        //    }
        //}

        [HttpGet]
        public async Task<ActionResult> ObtenerTokenFirebase()
        {
            var config = new FirebaseAuthConfig
            {
                ApiKey = "AIzaSyDz8V94UZacxFAbdLOso7lxoxm5MmbtAMU",
                AuthDomain = "iecapp2.firebaseapp.com",
                Providers = [new EmailProvider()]
            };

            var client = new FirebaseAuthClient(config);
            var userCredential = await client.SignInWithEmailAndPasswordAsync(
                "hola@iecapp.com",
                "GtoAceI@2024"
            );
            var token = await userCredential.User.GetIdTokenAsync();



            return Json(new { d = token });
        }

        [HttpPost]
        public async Task<ActionResult> UploadFileToFirebaseStorage2([FromBody] dynamic parametros)
        {

            string filePath = parametros.TryGetProperty("filePath", out JsonElement filePathElement) ? filePathElement.GetString() : null;
            string fileType = parametros.TryGetProperty("fileType", out JsonElement fileTypeElement) ? fileTypeElement.GetString() : null;
            string tokenFirebase = parametros.TryGetProperty("tokenFirebase", out JsonElement tokenFirebaseElement) ? tokenFirebaseElement.GetString() : null;

            var token = tokenFirebase;

            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
            Stream reader2;
            var fileName = "";
            if (fileType == "foto")
            {
                int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
                string imag = filePath.Substring(posInicio);
                if (imag.Substring(imag.Length - 2) == "\")") imag = imag.Substring(0, imag.Length - 2);
                byte[] cont = Convert.FromBase64String(imag);
                reader2 = new MemoryStream(cont);
                fileName = Guid.NewGuid().ToString();
            }
            else if (fileType == "video")
            {
                int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
                string base64String = filePath.Substring(posInicio);
                byte[] byteArray = Convert.FromBase64String(base64String);
                reader2 = new MemoryStream(byteArray);
                fileName = Guid.NewGuid().ToString() + ".mp4";
            }
            else
            {
                throw new ArgumentException("Tipo de archivo no soportado", nameof(fileType));
            }

            // Configuración de Firebase Auth

            // Determinar la carpeta en Firebase Storage basada en el tipo de archivo
            string storageFolder = fileType switch
            {
                "video" => $"{idEmpresa.ToUpper()}/Videos",
                "foto" => $"{idEmpresa.ToUpper()}/Fotos",
                "archivo" => $"{idEmpresa.ToUpper()}/Archivos",
                _ => throw new ArgumentException("Tipo de archivo no soportado", nameof(fileType))
            };

            try
            {
                // Subir el archivo a Firebase Storage
                var firebaseStorage = new FirebaseStorage(
                    _configuration.GetValue<string>("fireBdata:fireStorage"),
                    new FirebaseStorageOptions
                    {
                        AuthTokenAsyncFactory = () => Task.FromResult(token),
                        ThrowOnCancel = true
                    });




                var task = firebaseStorage
                    .Child(storageFolder)
                    .Child(fileName)
                    .PutAsync(reader2);

                // Obtener la URL de descarga
                var downloadUrl = await task;

                return Json(new { d = downloadUrl });
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al subir el archivo a Firebase Storage: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult> UploadVideoToFirebaseStorage([FromBody] dynamic parametros)
        {
            try
            {
                // Validar los parámetros recibidos

                string filePath = parametros.TryGetProperty("filePath", out JsonElement filePathElement) ? filePathElement.GetString() : null;
                string fileType = parametros.TryGetProperty("fileType", out JsonElement fileTypeElement) ? fileTypeElement.GetString() : null;
                string tokenFirebase = parametros.TryGetProperty("tokenFirebase", out JsonElement tokenFirebaseElement) ? tokenFirebaseElement.GetString() : null;

                if (string.IsNullOrEmpty(filePath) || string.IsNullOrEmpty(fileType) || string.IsNullOrEmpty(tokenFirebase))
                {
                    return BadRequest("Los parámetros filePath, fileType o tokenFirebase están vacíos o no son válidos.");
                }

                var token = tokenFirebase;
                // string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);

                Stream reader2;
                var fileName = "";

                try
                {
                    if (fileType == "foto")
                    {
                        int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
                        string imag = filePath.Substring(posInicio);
                        if (imag.EndsWith("\")")) imag = imag.Substring(0, imag.Length - 2);
                        byte[] cont = Convert.FromBase64String(imag);
                        reader2 = new MemoryStream(cont);
                        fileName = Guid.NewGuid().ToString();
                    }
                    else if (fileType == "video")
                    {
                        int posInicio = filePath.IndexOf("base64,") + "base64,".Length;
                        string base64String = filePath.Substring(posInicio);
                        byte[] byteArray = Convert.FromBase64String(base64String);
                        reader2 = new MemoryStream(byteArray);
                        fileName = Guid.NewGuid().ToString() + ".mp4";
                    }
                    else
                    {
                        return BadRequest("Tipo de archivo no soportado.");
                    }
                }
                catch (FormatException ex)
                {
                    return BadRequest($"Error en la conversión de base64: {ex.Message}");
                }

                try
                {
                    // Determinar la carpeta en Firebase Storage basada en el tipo de archivo
                    string storageFolder = fileType switch
                    {
                        "video" => $"12100/Videos",
                        "foto" => $"12100/Fotos",
                        "archivo" => $"12100/Archivos",
                        _ => throw new ArgumentException("Tipo de archivo no soportado", nameof(fileType))
                    };

                    // Configuración de Firebase Auth y carga de archivo
                    var firebaseStorage = new FirebaseStorage(
                        _configuration.GetValue<string>("fireBdata:fireStorage"),
                        new FirebaseStorageOptions
                        {
                            AuthTokenAsyncFactory = () => Task.FromResult(token),
                            ThrowOnCancel = true
                        });

                    var task = firebaseStorage
                        .Child(storageFolder)
                        .Child(fileName)
                        .PutAsync(reader2);

                    // Obtener la URL de descarga
                    var downloadUrl = await task;

                    return Json(new { d = downloadUrl });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, $"Error al subir el archivo a Firebase Storage: {ex.Message}");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error inesperado: {ex.Message}");
            }
        }
    }
}
