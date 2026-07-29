using checklist.Clases;
using checklist.Models.EstrcuturaCombo;
using checklist.Models.Listas;
using checklist.Models.Preguntas;
using checklist.Models.Roles;
using checklist.Models.Usuarios;
using checklistWs.Models.Categorias;
using Firebase.Auth;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;
using System.Numerics;
using System.Security.Claims;
using System.Text.Json;


namespace checklist.Controllers.Listas
{
    public class ListasController : Controller
    {

        private readonly IConfiguration _configuration;

        public ListasController(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public IActionResult CreadorLista()
        {
            return View();
        }

        public IActionResult CreadorListaBL26()
        {
            return View();
        }

        #region funciones
        public async Task<ActionResult> Inicializa(string idEmpresa, string cadena, string empresa)
        {
            string idRol = Utilerias.IdRol;

            Opciones opc = await Utilerias.GetOpcion("01001001", idEmpresa, idRol, empresa, cadena);
            return Json(new { d = "Ok", perm = opc.Permisos.Escritura });
        }

        public async Task<IActionResult> GetCategoriasComboBox(string searchTerm, string idEmpresa, string cadena, string empresa)
        {

            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.Replace("\"", ""); // Elimina las comillas dobles
            }
            string sComp = string.Empty;
            if (!string.IsNullOrEmpty(searchTerm)) sComp = string.Format("&cualPrograma={0}", searchTerm.Trim());
            string url = string.Format("{0}ObtenerCategorias?idEmpresa={1}&empresa={2}&cadena={3}{4}", Utilerias.UrlBase, idEmpresa, empresa, cadena, sComp);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            var response = await client.ExecuteAsync(request);
            List<DataPair4> respuesta2 = JsonConvert.DeserializeObject<List<DataPair4>>(response.Content);
            List<select3Data> result2 = new List<select3Data>();

            foreach (var resp2 in respuesta2)
            {
                result2.Add(new select3Data()
                {
                    id = resp2.id,
                    text = resp2.Nombre,


                });
            }
            return Json(new { d = result2 });

        }
        public async Task<IActionResult> GetSubcategoriasComboBox(string searchTerm, string idEmpresa, string cadena, string empresa)
        {

            string sComp = string.Empty;
            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.Replace("\"", ""); // Elimina las comillas dobles
            }
            if (!string.IsNullOrEmpty(searchTerm)) sComp = string.Format("&cualPrograma={0}", searchTerm.Trim());
            string url = string.Format("{0}ObtenerSubcategorias?idEmpresa={1}&empresa={2}&cadena={3}{4}", Utilerias.UrlBase, idEmpresa, empresa, cadena, sComp);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            var response = await client.ExecuteAsync(request);
            List<DataPair4> respuesta2 = JsonConvert.DeserializeObject<List<DataPair4>>(response.Content);
            List<select3Data> result2 = new List<select3Data>();

            foreach (var resp2 in respuesta2)
            {
                result2.Add(new select3Data()
                {
                    id = resp2.id,
                    text = resp2.Nombre,


                });
            }
            return Json(new { d = result2 });

        }

        public async Task<IActionResult> GetTiposActivosBL26(string searchTerm, string idEmpresa, string cadena, string empresa)
        {
            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.Replace("\"", string.Empty);
            }

            string url = string.Format(
                "{0}api/Activos/ObtenerTiposActivos?idEmpresa={1}&cadena={2}&busqueda={3}&estatus=activos",
                Utilerias.UrlBase,
                idEmpresa,
                cadena,
                Uri.EscapeDataString(searchTerm?.Trim() ?? string.Empty));

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            var response = await client.ExecuteAsync(request);
            List<checklist.Models.Activos.TipoActivoDto> respuesta = JsonConvert.DeserializeObject<List<checklist.Models.Activos.TipoActivoDto>>(response.Content);
            List<select3Data> result = new List<select3Data>();

            foreach (var item in respuesta ?? new List<checklist.Models.Activos.TipoActivoDto>())
            {
                result.Add(new select3Data()
                {
                    id = item.Id.ToString(),
                    text = item.Nombre
                });
            }

            return Json(new { d = result });
        }
        #endregion
        public async Task<IActionResult> GetListasComboBox(string searchTerm, string idEmpresa, string cadena, string empresa)
        {

            string sComp = string.Empty;
            if (!string.IsNullOrEmpty(searchTerm)) sComp = string.Format("&cualPrograma={0}", searchTerm.Trim());
            string url = string.Format("{0}Listas/GetTodos?idEmpresa={1}&empresa={2}&cadena={3}{4}", Utilerias.UrlBase, idEmpresa, empresa, cadena, sComp);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            var response = await client.ExecuteAsync(request);
            List<DataPair4> respuesta2 = JsonConvert.DeserializeObject<List<DataPair4>>(response.Content);
            List<select3Data> result2 = new List<select3Data>();

            foreach (var resp2 in respuesta2)
            {
                result2.Add(new select3Data()
                {
                    id = resp2.id,
                    text = resp2.Nombre,


                });
            }
            return Json(new { d = result2 });

        }
        public async Task<IActionResult> GetListasPreguntasComboBox(string llave, string searchTerm, string idEmpresa, string cadena, string empresa)
        {

            string sComp = string.Empty;
            if (!string.IsNullOrEmpty(llave))
            {
                llave = llave.Replace("\"", ""); // Elimina las comillas dobles
            }

            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.Replace("\"", ""); // Elimina las comillas dobles
            }
            if (!string.IsNullOrEmpty(searchTerm) && searchTerm != "\"\"") sComp = string.Format("&cualPrograma={0}", searchTerm.Trim());
            string url = string.Format("{0}ListasPreguntas/GetLista?idLista={1}&empresa={2}&cadena={3}{4}", Utilerias.UrlBase, llave, empresa, cadena, sComp);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            var response = await client.ExecuteAsync(request);
            List<DataPair5> respuesta2 = JsonConvert.DeserializeObject<List<DataPair5>>(response.Content);
            List<select3Data> result2 = new List<select3Data>();

            foreach (var resp2 in respuesta2)
            {
                result2.Add(new select3Data()
                {
                    id = resp2.id,
                    text = resp2.pregunta,


                });
            }
            return Json(new { d = result2 });

        }
        public async Task<IActionResult> GetListasPreguntas(string llave, string idEmpresa, string cadena, string empresa)
        {

            string sComp = string.Empty;
            if (!string.IsNullOrEmpty(llave))
            {
                llave = llave.Replace("\"", ""); // Elimina las comillas dobles
            }

            string url = string.Format("{0}ListasPreguntas/GetLista?idLista={1}&empresa={2}&cadena={3}{4}", Utilerias.UrlBase, llave, empresa, cadena, sComp);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            var response = await client.ExecuteAsync(request);
            List<DataPair5> respuesta2 = JsonConvert.DeserializeObject<List<DataPair5>>(response.Content);
            List<select3Data> result2 = new List<select3Data>();

            foreach (var resp2 in respuesta2)
            {
                result2.Add(new select3Data()
                {
                    id = resp2.id,
                    text = resp2.pregunta,


                });
            }
            return Json(new { d = result2 });

        }
        //     public async Task<IActionResult> GetInstructoresComboBox(string opci)
        //     {
        //         string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
        //string empresa = User.FindFirstValue(ClaimTypes.Sid);
        //string cadena = User.FindFirstValue(ClaimTypes.Uri);
        //string url = string.Format("{0}api/Usuario/ObtenerUsuarios?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);

        //         var client = new RestClient(url);
        //         var request = new RestRequest();
        //         request.Method = Method.Get;
        //         RestResponse response = await client.ExecuteAsync(request);
        //         List<respUsuario> respuesta = JsonConvert.DeserializeObject<List<respUsuario>>(response.Content);
        //         string result = string.Empty;
        //         if (opci == "1") result = "<option value='00000000-0000-0000-0000-000000000000'> </option> ";
        //         foreach (var resp in respuesta)
        //         {
        //             result += String.Format("<option value='{0}'>{1}</option> ", resp.Id, resp.Nombre.Trim()+" "+resp.APaterno+" "+resp.AMaterno);
        //         }
        //         return Json(new { d = result });

        //     }

        /* public async Task<ActionResult> GetProgramasComboBox(string opci)
         {
             string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
             string url = string.Format("{0}Programas/GetTodos?idEmpresa={1}", Utilerias.UrlBase, idEmpresa);

             var client = new RestClient(url);
             var request = new RestRequest();
             request.Method = Method.Get;
             RestResponse response = await client.ExecuteAsync(request);
             List<Programa> respuesta = JsonConvert.DeserializeObject<List<Programa>>(response.Content);
             string result = string.Empty;
             if (opci == "1") result = "<option value='00000000-0000-0000-0000-000000000000'> </option> ";
             foreach (var resp in respuesta)
             {
                 result += String.Format("<option value='{0}'>{1}</option> ", resp.id, resp.Curso.Trim());
             }
             return Json(new { d = result }, JsonRequestBehavior.AllowGet);

         }*/
        public async Task<IActionResult> GuardarLista([FromBody] dynamic parametros)
        {
            JsonElement body = parametros is JsonElement jsonElement ? jsonElement : default;

            string llav = body.TryGetProperty("llav", out JsonElement llavElement) ? llavElement.GetString() : null;
            string idPrograma = body.TryGetProperty("idPrograma", out JsonElement nombElement) ? nombElement.GetString() : null;
            // string idInstructor = body.TryGetProperty("idInstructor", out JsonElement apatElement) ? apatElement.GetString() : null;
            string nombre = body.TryGetProperty("nombre", out JsonElement amatElement) ? amatElement.GetString() : null;
            string n = body.TryGetProperty("n", out JsonElement numeElement) ? numeElement.GetString() : null;
            bool isListaCerrada = body.TryGetProperty("isListaCerrada", out JsonElement isListaCerradaElement) && ReadJsonBoolean(isListaCerradaElement);
            bool usaActivos = body.TryGetProperty("usaActivos", out JsonElement usaActivosElement) && ReadJsonBoolean(usaActivosElement);
            string idTipoActivo = body.TryGetProperty("idTipoActivo", out JsonElement idTipoActivoElement) ? idTipoActivoElement.GetString() : null;
            string latitud = body.TryGetProperty("latitud", out JsonElement latitudElement) ? latitudElement.GetString() : null;
            string longitud = body.TryGetProperty("longitud", out JsonElement longitudElement) ? longitudElement.GetString() : null;

            string idEmpresa = body.TryGetProperty("idEmpresa", out JsonElement idEmpresaElement) ? idEmpresaElement.GetString() : null;
            string cadena = body.TryGetProperty("cadena", out JsonElement cadenaElement) ? cadenaElement.GetString() : null;
            string correo = body.TryGetProperty("correo", out JsonElement correoElement) ? correoElement.GetString() : null;
            string empresa = body.TryGetProperty("empresa", out JsonElement empresaElement) ? empresaElement.GetString() : null;


            string emailUsuario = correo;
            string urlu = string.Format("{0}api/Usuario/ObtenerUsuarioPorEmail?idEmpresa={1}&email={2}&empresa={3}&cadena={4}", Utilerias.UrlBase, idEmpresa, correo, empresa, cadena);
            var clientusr = new RestClient(urlu);
            var requestusr = new RestRequest();
            requestusr.Method = Method.Get;
            RestResponse responser = await clientusr.ExecuteAsync(requestusr);
            List<respUsuario> respuesta = JsonConvert.DeserializeObject<List<respUsuario>>(responser.Content);
            respUsuario result = new respUsuario();
            foreach (var item in respuesta)
            {
                result = item;
            }


            string regresa = "Ok";
            Lista zona = new Lista();
            bool estadoBool = isListaCerrada;
            int estado = estadoBool ? 2 : 1;
            Guid? tipoActivoGuid = null;

            if (usaActivos)
            {
                if (!Guid.TryParse(idTipoActivo, out Guid parsedTipoActivo))
                {
                    return Json(new { d = "Selecciona un tipo de activo vigente." });
                }

                if (!await ExisteTipoActivoVigenteAsync(idEmpresa, cadena, empresa, parsedTipoActivo))
                {
                    return Json(new { d = "Selecciona un tipo de activo vigente." });
                }

                tipoActivoGuid = parsedTipoActivo;
            }


            zona.idEmpresa = Guid.Parse(idEmpresa);
            zona.idPrograma = Guid.NewGuid();
            zona.idInstructor = Guid.NewGuid();
            zona.idusuario = Guid.Parse(result.Id);
            zona.Nombre = nombre;
            zona.fechacreacion = Utilerias.FechaActual();
            zona.Notas = n;
            zona.Activo = true;
            zona.Status = true;
            zona.id = Guid.Empty;
            zona.UsaActivos = usaActivos;
            zona.idTipoActivo = tipoActivoGuid;
            zona.latitud = latitud;
            zona.longitud = longitud;






            if (string.IsNullOrEmpty(llav))
            {
                zona.Estado = 1;
                var url = string.Format("{0}Listas/Guardar?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
                RestClient client = new RestClient(url);
                RestRequest request = new RestRequest();
                request.Method = Method.Post;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(zona);
                RestResponse response = await client.ExecuteAsync(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Ok") regresa = response.Content;
            }
            else
            {
                zona.Estado = estado;
                zona.id = Guid.Parse(llav);
                var url = string.Format("{0}Listas/Guardar?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
                RestClient clientS = new RestClient(url);
                RestRequest request = new RestRequest();
                request.Method = Method.Post;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(zona);
                RestResponse response = await clientS.ExecuteAsync(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Ok") regresa = response.Content;
            }
            return Json(new { d = regresa });
        }

        private async Task<bool> ExisteTipoActivoVigenteAsync(string idEmpresa, string cadena, string empresa, Guid idTipoActivo)
        {
            string url = string.Format(
                "{0}api/Activos/ObtenerTiposActivos?idEmpresa={1}&cadena={2}&busqueda=&estatus=activos",
                Utilerias.UrlBase,
                idEmpresa,
                cadena);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<checklist.Models.Activos.TipoActivoDto> respuesta = JsonConvert.DeserializeObject<List<checklist.Models.Activos.TipoActivoDto>>(response.Content);

            return (respuesta ?? new List<checklist.Models.Activos.TipoActivoDto>()).Any(item => item.Id == idTipoActivo && item.Activo);
        }

        public async Task<IActionResult> GuardarPregunta(string llav, string idLista, string nombre, string idCategoria, string idSubcategoria, string idEmpresa, string cadena, string empresa)
        {

            string regresa = "Ok";
            ListaPreguntas zona = new ListaPreguntas();

            zona.idEmpresa = Guid.Parse(idEmpresa);
            zona.idLista = Guid.Parse(idLista);
            zona.Pregunta = nombre;
            zona.Explicacion = "";
            zona.Tipo = 0;
            zona.Valor = 0;
            zona.Obligatorio = true;
            zona.Status = true;
            zona.idCategoria = Guid.Parse(idCategoria);
            zona.idSubcategoria = Guid.Parse(idSubcategoria);



            if (string.IsNullOrEmpty(llav))
            {
                var json = JsonConvert.SerializeObject(zona, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                string url = string.Format("{0}ListasPreguntas/Guardar?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Post;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(json);
                var response = clientS.Execute(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Ok") regresa = response.Content;
            }
            else
            {
                zona.id = Guid.Parse(llav);
                var json = JsonConvert.SerializeObject(zona, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                string url = string.Format("{0}ListasPreguntas/Guardar?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Post;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(json);
                var response = clientS.Execute(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Ok") regresa = response.Content;
            }
            return Json(new { d = regresa });
        }
        public async Task<IActionResult> GetElemento(string llav, string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}Listas/GetElemento?id={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, llav, empresa, cadena);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<Lista> respuesta = JsonConvert.DeserializeObject<List<Lista>>(response.Content);
            Lista result = new Lista();
            foreach (var item in respuesta)
            {
                result = item;
            }
            return Json(new { d = result });
        }
        public async Task<IActionResult> GetElementoPregunta(string llav, string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}ListasPreguntas/GetElemento?id={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, llav, empresa, cadena);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<ListaPreguntas> respuesta = JsonConvert.DeserializeObject<List<ListaPreguntas>>(response.Content);
            ListaPreguntas result = new ListaPreguntas();
            foreach (var item in respuesta)
            {
                result = item;
            }
            return Json(new { d = result });
        }
        public async Task<IActionResult> GetElementoOpciones(string llave, string tipoPregunta, string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}ListasPreguntasOpciones/GetPregunta?idPregunta={1}&empresa={2}&cadena={3}&tipoPregunta={4}", Utilerias.UrlBase, llave, empresa, cadena, tipoPregunta);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<PreguntasOpciones> respuesta = JsonConvert.DeserializeObject<List<PreguntasOpciones>>(response.Content);

            return Json(new { d = respuesta });
        }
        public async Task<IActionResult> DeleteElementoOpciones(string id, string idEmpresa, string cadena, string empresa)
        {

            string regresa = "Ok";
            string url = string.Format("{0}ListasPreguntasOpciones/Eliminar?id={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, id, empresa, cadena);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Post;
            RestResponse response = await client.ExecuteAsync(request);
            if (Utilerias.LimpiaCadena(response.Content) != "Ok") regresa = response.Content;

            return Json(new { d = regresa });
        }
        public async Task<IActionResult> GuardarOpcion(string llav, string idLista, string idPregunta, string nombre, string tipoPregunta, string idEmpresa, string cadena, string empresa)
        {

            string regresa = "Ok";
            PreguntasOpciones zona = new PreguntasOpciones();

            zona.idEmpresa = Guid.Parse(idEmpresa);
            zona.idLista = Guid.Parse(idLista);
            zona.idPregunta = Guid.Parse(idPregunta);
            zona.opcion = nombre;
            zona.id = Guid.Parse(idLista);
            zona.tipoPregunta = tipoPregunta;


            if (string.IsNullOrEmpty(llav))
            {
                var json = JsonConvert.SerializeObject(zona, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                string url = string.Format("{0}ListasPreguntasOpciones/Guardar?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Post;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(json);
                var response = clientS.Execute(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Ok") regresa = response.Content;
            }
            else
            {
                zona.id = Guid.Parse(llav);
                var json = JsonConvert.SerializeObject(zona, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                string url = string.Format("{0}ListasPreguntasOpciones/Guardar?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Post;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(json);
                var response = clientS.Execute(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Ok") regresa = response.Content;
            }
            return Json(new { d = regresa });
        }
        public async Task<IActionResult> GuardarConstructor(string llav, string idLista, string pregunta, string tipo, string valor, bool isListaCerrada, string obligatorio, string idPregunta, string respuestaCorrecta, string idEmpresa, string cadena, string empresa, string correo, string notas = "")
        {

            string regresa = "Ok";
            ListaPreguntas zona = new ListaPreguntas();

            zona.idEmpresa = Guid.Parse(idEmpresa);
            zona.idLista = Guid.Parse(idLista);
            zona.Pregunta = pregunta;
            zona.Explicacion = notas;
            zona.Tipo = decimal.Parse(tipo);
            zona.Valor = decimal.Parse(valor);
            zona.Obligatorio = bool.Parse(obligatorio);
            zona.id = Guid.Parse(idPregunta);
            zona.Status = true;
            zona.RespuestaCorrecta = respuestaCorrecta;





            if (string.IsNullOrEmpty(llav))
            {
                var json = JsonConvert.SerializeObject(zona, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                string url = string.Format("{0}ListasPreguntas/GuardarConstructor?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Post;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(json);
                var response = clientS.Execute(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Ok") regresa = response.Content;
            }
            else
            {
                zona.id = Guid.Parse(llav);
                var json = JsonConvert.SerializeObject(zona, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                string url = string.Format("{0}ListasPreguntas/GuardarConstructor?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Post;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(json);
                var response = clientS.Execute(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Ok") regresa = response.Content;
            }
            return Json(new { d = regresa });
        }

        private static bool ReadJsonBoolean(JsonElement element)
        {
            if (element.ValueKind == JsonValueKind.True)
            {
                return true;
            }

            if (element.ValueKind == JsonValueKind.False)
            {
                return false;
            }

            if (element.ValueKind == JsonValueKind.Number && element.TryGetInt32(out int numberValue))
            {
                return numberValue != 0;
            }

            if (element.ValueKind == JsonValueKind.String)
            {
                string value = element.GetString();
                if (bool.TryParse(value, out bool boolValue))
                {
                    return boolValue;
                }

                if (int.TryParse(value, out int parsedNumber))
                {
                    return parsedNumber != 0;
                }
            }

            return false;
        }
        public async Task<IActionResult> EliminarLista(string llav, string idEmpresa, string cadena, string empresa)
        {

            string regresa = "Ok";


            var json = JsonConvert.SerializeObject(Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            string url = string.Format("{0}Listas/Borrar?id={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, llav, empresa, cadena);
            var clientS = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Delete;
            request.RequestFormat = DataFormat.Json;
            request.AddJsonBody(json);
            var response = clientS.Execute(request);
            if (Utilerias.LimpiaCadena(response.Content) != "Ok") regresa = response.Content;


            return Json(new { d = regresa });
        }
        public async Task<IActionResult> EliminarPregunta(string llav, string idEmpresa, string cadena, string empresa)
        {

            string regresa = "Ok";

            var json = JsonConvert.SerializeObject(Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            string url = string.Format("{0}ListasPreguntas/Borrar?id={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, llav, empresa, cadena);
            var clientS = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Delete;
            request.RequestFormat = DataFormat.Json;
            request.AddJsonBody(json);
            var response = clientS.Execute(request);
            if (Utilerias.LimpiaCadena(response.Content) != "Ok") regresa = response.Content;


            return Json(new { d = regresa });
        }
    }
}
