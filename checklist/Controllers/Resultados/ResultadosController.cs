using checklist.Clases;
using checklist.Models.Listas;
using checklist.Models.Roles;
using checklist.Models.Usuarios;
using Firebase.Auth;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Web;

namespace checklist.Controllers.Resultados
{
    public class ResultadosController : Controller
    {
        public IActionResult Resultados()
        {
            return View();
        }
        private readonly IConfiguration _configuration;

        public ResultadosController(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public async Task<ActionResult> Inicializa(string idEmpresa, string cadena, string empresa)
        {
            string idRol = Utilerias.IdRol;

            Opciones opc = await Utilerias.GetOpcion("02003000", idEmpresa, idRol, empresa, cadena);
            return Json(new { d = "Ok", perm = opc.Permisos.Escritura });
        }
        public async Task<ActionResult> GetSucursales(string opci, string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}api/Sucursal/ObtenerSucursales?idEmpresa={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idEmpresa, empresa, cadena);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<Lista> respuesta = JsonConvert.DeserializeObject<List<Lista>>(response.Content);
            string result = string.Empty;
            result = "<option value='0'> -- Todas las sucursales --  </option> ";
            foreach (var resp in respuesta)
            {
                result += String.Format("<option value='{0}'>{1}</option> ", resp.id, resp.Nombre.Trim());
            }
            return Json(new { d = result });

        }
        public async Task<ActionResult> GetUsuariosXSucursal(string idSucursal, string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}api/Usuario/ObtenerUsuariosCompleto?idEmpresa={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idEmpresa, empresa, cadena);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respUsuario> respuesta = JsonConvert.DeserializeObject<List<respUsuario>>(response.Content);
            string result = string.Empty;
            result = "<option value='0'> -- Todos los usuarios --  </option> ";
            foreach (var resp in respuesta)
            {
                result += String.Format("<option value='{0}'>{1}</option> ", resp.Id, resp.Nombre.Trim() + " " + resp.APaterno + " " + resp.AMaterno);
            }
            return Json(new { d = result });

        }
        public async Task<IActionResult> GetPlantelesComboBox(string opci, string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}api/Sucursal/ObtenerSucursales?idEmpresa={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idEmpresa, empresa, cadena);
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
        public async Task<IActionResult> GetListasCerradasComboBox(string opci, string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}Listas/GetTodosCerradas?idEmpresa={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idEmpresa, empresa, cadena);

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
        public async Task<IActionResult> GetData(string idLista, string idUsuario, string fechaInicia, string fechaFin, string idSucursal, string idEmpresa, string cadena, string empresa)
        {



            // Formatear las fechas a cadenas con el formato "yyyy-MM-dd"
            string fechaI = fechaInicia;
            string fechaF = fechaFin;

            string url = string.Format("{0}api/Evaluaciones/Evaluacion/ObtenerConsultaEvaluacion?fechaInicia={1}&fechaFin={2}&idSucursal={3}&idUsuario={4}&idLista={5}&empresa={6}&cadena={7}", Utilerias.UrlBase, fechaI, fechaF, idSucursal, idUsuario, idLista, empresa, cadena);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);

            // Verificar si el contenido es un objeto JSON en lugar de un arreglo JSON
            if (!response.Content.StartsWith("["))
            {
                // Si es un objeto JSON, envolverlo en un arreglo JSON
                response.Content = "[" + response.Content + "]";
            }

            // Deserializar el JSON en una lista de objetos respcExperienciaVisible
            List<ConsultaEvaluacionRes> respuesta = JsonConvert.DeserializeObject<List<ConsultaEvaluacionRes>>(response.Content);
            // List<ConsultaEvaluacionRes> respuestaOrden = respuesta.OrderBy(r => r.Curso).ToList();
            StringBuilder sb = new StringBuilder();
            bool hasMoreRecords = false;
            sb.Append(@"{" + "\"sEcho\": 1,");
            sb.Append("\"iTotalRecords\": " + respuesta.Count + ",");
            sb.Append("\"iTotalDisplayRecords\": " + respuesta.Count + ",");
            sb.Append("\"aaData\": [");
            foreach (var resp in respuesta)
            {
                if (hasMoreRecords) sb.Append(",");
                sb.Append("[");

                StringBuilder contenido = new StringBuilder();

                string[] fechaParseada = resp.Fecha.Split(' ');
                sb.Append("\"<a onclick='mostrarLozalizacion(" + resp.latitud + "," + resp.longitud + ")' class='btn btn-link-primary font-weight-bold mr-2' data-toggle='tooltip' title='Mostrar localización'><i class='fas fas fa-map-marked-alt'></i></a>\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Lista) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.nombreUsuario) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.nombreSucursal) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(fechaParseada[0]) + "\",");
                //sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Instructor.ToString()) + "\",");
                //sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Fecha.ToString()) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode("<button class='btn btn-primary' onclick='llenarComboProgramacionModal(\"" + resp.Evento + "\",\"" + resp.idUsuario + "\")'>Resultados</button>") + "\"");




                sb.Append("]");
                hasMoreRecords = true;
            }
            sb.Append("]}");
            var jsonResult = Json(new { d = sb.ToString() });
            // jsonResult.MaxJsonLength = int.MaxValue;

            return jsonResult;
        }
        public async Task<IActionResult> GetDataListas(string idLista, string idUsuario, string idSucursal, string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}ListasRespuestas/GetLista?idLista={1}&idEmpresa={2}&idUsuario={3}&empresa={4}&cadena={5}", Utilerias.UrlBase, idLista, idEmpresa, idUsuario, empresa, cadena);
       
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);

            // Verificar si el contenido es un objeto JSON en lugar de un arreglo JSON
            if (!response.Content.StartsWith("["))
            {
                // Si es un objeto JSON, envolverlo en un arreglo JSON
                response.Content = "[" + response.Content + "]";
            }

            // Deserializar el JSON en una lista de objetos respcExperienciaVisible
            List<ListasRespuestasDetalle> respuesta = JsonConvert.DeserializeObject<List<ListasRespuestasDetalle>>(response.Content);
            // List<ListasRespuestasDetalle> respuestaOrden = respuesta.OrderBy(r => r.Pregunta).ToList();

            StringBuilder sb = new StringBuilder();
            bool hasMoreRecords = false;
            sb.Append(@"{" + "\"sEcho\": 1,");
            sb.Append("\"iTotalRecords\": " + respuesta.Count + ",");
            sb.Append("\"iTotalDisplayRecords\": " + respuesta.Count + ",");
            sb.Append("\"aaData\": [");
            foreach (var resp in respuesta)
            {
                if (hasMoreRecords) sb.Append(",");
                sb.Append("[");

                StringBuilder contenido = new StringBuilder();

                // Validar si resp.url está vacía o es null
                bool urlValida = !string.IsNullOrEmpty(resp.urlAnexo);

                // Generar el botón de "Anexos" solo si la URL es válida
                if (urlValida)
                {
                    sb.Append("\"" + HttpUtility.JavaScriptStringEncode("<button class='btn btn-primary' onclick='llenarComboProgramacionModalAnexo(event, \"" + resp.id + "\")'>Anexos</button>") + "\",");
                }
                else
                {
                    // Si la URL no es válida, no mostrar ningún botón (celda vacía)
                    sb.Append("\"\",");
                }

                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Evaluacion) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Pregunta) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.categoria) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.subcategoria) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.RespuestaOpciones) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Respuesta) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Tipo) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.notas) + "\"");
                // sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Valor.ToString()) + "\",");
                // sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Alumno.ToString()) + "\"");
                //  sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Calificacion.ToString()) + "\"");




                sb.Append("]");
                hasMoreRecords = true;
            }
            sb.Append("]}");
            var jsonResult = Json(new { d = sb.ToString() });
            //jsonResult.MaxJsonLength = int.MaxValue;

            return jsonResult;
        }
        public async Task<IActionResult> GetDataAnexos(string idLista, string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}ListasRespuestas/GetAnexo?idListaRespuesta={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idLista, empresa, cadena);
            Console.WriteLine(url);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);

            // Verificar si el contenido es un objeto JSON en lugar de un arreglo JSON
            if (!response.Content.StartsWith("["))
            {
                // Si es un objeto JSON, envolverlo en un arreglo JSON
                response.Content = "[" + response.Content + "]";
            }

            // Deserializar el JSON en una lista de objetos respcExperienciaVisible
            List<AnexoPregunta> respuesta = JsonConvert.DeserializeObject<List<AnexoPregunta>>(response.Content);
            List<AnexoPregunta> respuestaOrden = respuesta.OrderBy(r => r.tipo_anexo).ToList();
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
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode("<a href=\"" + resp.url + "\" target=\"_blank\" data-toggle='tooltip' title='Mostrar documento'><i class='fa fa-search'></i></a>") + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.tipo_anexo == 1 ? "Foto" : "Video") + "\"");

                // sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Valor.ToString()) + "\",");
                // sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Alumno.ToString()) + "\"");
                //  sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Calificacion.ToString()) + "\"");




                sb.Append("]");
                hasMoreRecords = true;
            }
            sb.Append("]}");
            var jsonResult = Json(new { d = sb.ToString() });
            //jsonResult.MaxJsonLength = int.MaxValue;

            return jsonResult;
        }
    }
}
