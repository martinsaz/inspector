using checklist.Clases;
using checklist.Models.Listas;
using checklist.Models.MisListas;
using checklist.Models.Roles;
using checklist.Models.Usuarios;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Web;

namespace checklist.Controllers.MisListas
{
    public class MisListasController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        private readonly IConfiguration _configuration;

        public async Task<ActionResult> Inicializa(string idEmpresa, string cadena, string empresa)
        {
            string idRol = Utilerias.IdRol;

            Opciones opc = await Utilerias.GetOpcion("01001003", idEmpresa, idRol, empresa, cadena);
            return Json(new { d = "Ok", perm = opc.Permisos.Escritura });
        }
        public MisListasController(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public async Task<ActionResult> GetSucursales(string opci)
        {
            string empresa = User.FindFirstValue(ClaimTypes.Sid);
            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
            string cadena = User.FindFirstValue(ClaimTypes.Uri);
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
        public async Task<ActionResult> GetUsuariosXSucursal([FromBody] dynamic parametros)
        {
            string idSucursal = parametros.TryGetProperty("idSucursal", out JsonElement idSucursalElement) ? idSucursalElement.GetString() : null;
            string cadena = User.FindFirstValue(ClaimTypes.Uri);
            string empresa = User.FindFirstValue(ClaimTypes.Sid);
            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
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
        public async Task<IActionResult> GetPlantelesComboBox(string opci)
        {
            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
            string cadena = User.FindFirstValue(ClaimTypes.Uri);
            string empresa = User.FindFirstValue(ClaimTypes.Sid);
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
        public async Task<IActionResult> GetListasCerradasComboBox(string opci)
        {
            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
            string empresa = User.FindFirstValue(ClaimTypes.Sid);
            string cadena = User.FindFirstValue(ClaimTypes.Uri);
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
        public async Task<IActionResult> GetData(string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}MisListas?idEmpresa={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idEmpresa, empresa, cadena);
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
            List<MiLista> respuesta = JsonConvert.DeserializeObject<List<MiLista>>(response.Content);
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

                sb.Append("\"<a onclick='mostrarLozalizacion(" + resp.latitud + "," + resp.longitud + ")' class='btn btn-link-primary font-weight-bold mr-2' data-toggle='tooltip' title='Mostrar localización'><i class='fas fas fa-map-marked-alt'></i></a>\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Lista) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.FechaCreacion) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Notas) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Status == "1" ? "Activa" : "Inactiva") + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Creador) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Preguntas) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Veces) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode("<button class='btn btn-primary' onclick='mostrarDetalleLista(event, \"" + resp.Id + "\")'>Detalle</button>") + "\"");



                sb.Append("]");
                hasMoreRecords = true;
            }
            sb.Append("]}");
            var jsonResult = Json(new { d = sb.ToString() });
            // jsonResult.MaxJsonLength = int.MaxValue;

            return jsonResult;
        }
        public async Task<IActionResult> GetDetalleLista(string idLista)
        {
            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
            string cadena = User.FindFirstValue(ClaimTypes.Uri);

            string url = string.Format("{0}Listas/GetLista?idLista={1}&idEmpresa={2}&cadena={3}", Utilerias.UrlBase, idLista, idEmpresa, cadena);
            
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);

            if (!response.Content.StartsWith("["))
            {

                response.Content = "[" + response.Content + "]";
            }

            List<ListaDetalle> respuesta = JsonConvert.DeserializeObject<List<ListaDetalle>>(response.Content);

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

                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Lista) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Pregunta) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Categoria) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Subcategoria) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Tipo) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Opciones) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.ValorCorrecto) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Explicacion) + "\"");

                sb.Append("]");
                hasMoreRecords = true;
            }
            sb.Append("]}");
            var jsonResult = Json(new { d = sb.ToString() });
            //jsonResult.MaxJsonLength = int.MaxValue;

            return jsonResult;
        }

        public async Task<IActionResult> GetDataListas([FromBody] dynamic parametros)
        {
            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
            string cadena = User.FindFirstValue(ClaimTypes.Uri);
            string idLista = parametros.TryGetProperty("idLista", out JsonElement idListaElement) ? idListaElement.GetString() : null;
            string idUsuario = parametros.TryGetProperty("idUsuario", out JsonElement idUsuarioElement) ? idUsuarioElement.GetString() : null;
            string empresa = User.FindFirstValue(ClaimTypes.Sid);
            string url = string.Format("{0}ListasRespuestas/GetLista?idLista={1}&idEmpresa={2}&idUsuario={3}&empresa={4}&cadena={5}", Utilerias.UrlBase, idLista, idEmpresa, idUsuario, empresa, cadena);
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
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode("<button class='btn btn-primary' onclick='llenarComboProgramacionModalAnexo(event, \"" + resp.id + "\")'>Anexos</button>") + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Evaluacion) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Pregunta) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.categoria) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.subcategoria) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.RespuestaOpciones) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Respuesta) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Tipo) + "\"");
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
        public async Task<IActionResult> GetDataAnexos([FromBody] dynamic parametros)
        {
            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
            string idLista = parametros.TryGetProperty("idLista", out JsonElement idListaElement) ? idListaElement.GetString() : null;
            string empresa = User.FindFirstValue(ClaimTypes.Sid);
            string cadena = User.FindFirstValue(ClaimTypes.Uri);
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
