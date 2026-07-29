using checklist.Clases;
using checklist.Models.Listas;
using checklist.Models.Reportes;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;
using System.Text;
using System.Web;
using System.Data;
using Newtonsoft.Json.Linq;
using System.Text.RegularExpressions;
using System.Security.Claims;
using System.Text.Json;
using System.Collections.Generic;
using System.Threading.Tasks;
using checklist.Models.Roles;


namespace checklist.Controllers.ReporteDinamico
{
    public class ReporteDinamicoController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        private readonly IConfiguration _configuration;

        public async Task<ActionResult> Inicializa(string idEmpresa, string cadena, string empresa)
        {
            string idRol = Utilerias.IdRol;

            Opciones opc = await Utilerias.GetOpcion("03001002", idEmpresa, idRol, empresa, cadena);
            return Json(new { d = "Ok", perm = opc.Permisos.Escritura });
        }

        public ReporteDinamicoController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        //public async Task<ActionResult> GetSucursales(string opci)
        //{
        //    string empresa = User.FindFirstValue(ClaimTypes.Sid);
        //    string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
        //    string url = string.Format("{0}api/Sucursal/ObtenerSucursales?idEmpresa={1}&empresa={2}", Utilerias.UrlBase, idEmpresa, empresa);

        //    var client = new RestClient(url);
        //    var request = new RestRequest();
        //    request.Method = Method.Get;
        //    RestResponse response = await client.ExecuteAsync(request);
        //    List<Lista> respuesta = JsonConvert.DeserializeObject<List<Lista>>(response.Content);
        //    string result = string.Empty;
        //    result = "<option value='0'> -- Todas las sucursales --  </option> ";
        //    foreach (var resp in respuesta)
        //    {
        //        result += String.Format("<option value='{0}'>{1}</option> ", resp.id, resp.Nombre.Trim());
        //    }
        //    return Json(new { d = result });

        //}

        //public async Task<ActionResult> GetUsuariosXSucursal([FromBody] dynamic parametros)
        //{
        //    string idSucursal = parametros.TryGetProperty("idSucursal", out JsonElement idSucursalElement) ? idSucursalElement.GetString() : null;
        //    string empresa = User.FindFirstValue(ClaimTypes.Sid);
        //    string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
        //    string url = string.Format("{0}api/Usuario/ObtenerUsuariosCompleto?idEmpresa={1}&empresa={2}", Utilerias.UrlBase, idEmpresa, empresa);

        //    var client = new RestClient(url);
        //    var request = new RestRequest();
        //    request.Method = Method.Get;
        //    RestResponse response = await client.ExecuteAsync(request);
        //    List<respUsuario> respuesta = JsonConvert.DeserializeObject<List<respUsuario>>(response.Content);
        //    string result = string.Empty;
        //    result = "<option value='0'> -- Todos los usuarios --  </option> ";
        //    foreach (var resp in respuesta)
        //    {
        //        result += String.Format("<option value='{0}'>{1}</option> ", resp.Id, resp.Nombre.Trim() + " " + resp.APaterno + " " + resp.AMaterno);
        //    }
        //    return Json(new { d = result });

        //}



        //public async Task<IActionResult> GetPlantelesComboBox(string opci)
        //{
        //    string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
        //    string empresa = User.FindFirstValue(ClaimTypes.Sid);
        //    string url = string.Format("{0}api/Sucursal/ObtenerSucursales?idEmpresa={1}&empresa={2}", Utilerias.UrlBase, idEmpresa, empresa);
        //    var client = new RestClient(url);
        //    var request = new RestRequest();
        //    request.Method = Method.Get;
        //    RestResponse response = await client.ExecuteAsync(request);
        //    List<Lista> respuesta = JsonConvert.DeserializeObject<List<Lista>>(response.Content);
        //    string result = string.Empty;
        //    if (opci == "1") result = "<option value='b'> -- Todos --  </option> ";
        //    foreach (var resp in respuesta)
        //    {
        //        result += String.Format("<option value='{0}'>{1}</option> ", resp.id, resp.Nombre.Trim());
        //    }
        //    return Json(new { d = result });

        //}
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
        public static DataTable ConvertJsonToDataTable(string json)
        {
            try
            {
                // Si el JSON no empieza con '[', es posible que sea un string JSON.
                // Envolvemos el JSON en un array si es necesario.
                if (!json.Trim().StartsWith("["))
                {
                    json = "[" + json + "]";
                }

                // Parsear el JSON como JArray
                JArray jsonArray = JArray.Parse(json);

                // Crear un DataTable
                DataTable dataTable = new DataTable();

                // Si el array tiene elementos, crear columnas en el DataTable
                if (jsonArray.Count > 0)
                {
                    // Crear columnas
                    foreach (JProperty property in jsonArray[0].Children<JProperty>())
                    {
                        dataTable.Columns.Add(property.Name, typeof(string));
                    }

                    // Agregar filas
                    foreach (JObject jsonObject in jsonArray)
                    {
                        DataRow row = dataTable.NewRow();
                        foreach (JProperty property in jsonObject.Properties())
                        {
                            row[property.Name] = property.Value.ToString();
                        }
                        dataTable.Rows.Add(row);
                    }
                }

                return dataTable;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return null;
            }
        }
        public async Task<IActionResult> GetData2(string idLista, string idUsuario, string fechaInicia, string fechaFin, string idSucursal, string tipoPregunta, string idEmpresa, string cadena, string empresa)
        {

            // Formatear las fechas a cadenas con el formato "yyyy-MM-dd"
            string fechaI = fechaInicia;
            string fechaF = fechaFin;


            string url = string.Format("{0}ReporteDinamico?empresa={1}&idLista={2}&tipoPregunta={3}&cadena={4}", Utilerias.UrlBase, empresa, idLista, tipoPregunta, cadena);
            Console.WriteLine(url);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            string contenido = response.Content;
            string json = contenido.Replace("\\\"", "\"");
            string jsonWithoutExtraQuotes = json.Trim('"');
            DataTable dt = ConvertJsonToDataTable(jsonWithoutExtraQuotes);

            DataSet ds = new DataSet();
            ds.Tables.Add(dt);

            StringBuilder sb = new StringBuilder();

            if (ds.Tables[0].Rows.Count > 0)
            {
                List<string> Columnas = new List<string>();
                List<List<string>> Datos = new List<List<string>>();
                Boolean hasMoreRecords = false;
                foreach (DataColumn dc in ds.Tables[0].Columns)
                {
                    Columnas.Add(dc.ColumnName);
                }
                List<string> xData = new List<string>();
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    foreach (DataColumn dc in ds.Tables[0].Columns)
                    {
                        xData.Add(row[dc].ToString().Trim());
                    }
                    Datos.Add(xData);
                    xData = new List<string>();
                }
                sb.Append("[{\"COLUMNS\":[");
                foreach (string col in Columnas)
                {
                    if (hasMoreRecords)
                    {
                        sb.Append(",");
                    }
                    sb.Append(String.Format("{{\"title\":\"{0}\"}}", col));
                    hasMoreRecords = true;
                }
                sb.Append("],\"DATA\":[");
                hasMoreRecords = false;
                foreach (var val in Datos)
                {
                    if (hasMoreRecords)
                    {
                        sb.Append(",");
                    }
                    sb.Append("[");
                    bool hasMoreData = false;

                    foreach (var item in val)
                    {
                        if (hasMoreData)
                        {
                            sb.Append(",");
                        }
                        sb.Append(String.Format("\"{0}\"", item));
                        hasMoreData = true;
                    }

                    sb.Append("]");
                    hasMoreRecords = true;
                }
                sb.Append("]}]");

            }
            var jsonResult = Json(new { d = sb.ToString() });
            // jsonResult.MaxJsonLength = int.MaxValue;

            return jsonResult;
        }
        public async Task<IActionResult> GetData(string idLista, string idUsuario, string fechaInicia, string fechaFin, string idSucursal, string tipoPregunta, string idEmpresa, string cadena, string empresa)
        {
            // Formatear las fechas a cadenas con el formato "yyyy-MM-dd"
            string fechaI = fechaInicia;
            string fechaF = fechaFin;

            // Construcción de la URL para la solicitud al servicio externo
            string url = string.Format("{0}ReporteDinamico?empresa={1}&idLista={2}&tipoPregunta={3}&cadena={4}", Utilerias.UrlBase, empresa, idLista, tipoPregunta, cadena);
            Console.WriteLine(url);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            string contenido = response.Content;
            string json = contenido.Replace("\\\"", "\"");
            string jsonWithoutExtraQuotes = json.Trim('"');
            DataTable dt = ConvertJsonToDataTable(jsonWithoutExtraQuotes);

            DataSet ds = new DataSet();
            ds.Tables.Add(dt);

            StringBuilder sb = new StringBuilder();

            if (ds.Tables[0].Rows.Count > 0)
            {
                List<string> Columnas = new List<string>();
                List<List<string>> Datos = new List<List<string>>();
                Boolean hasMoreRecords = false;

                // Función auxiliar para formatear nombres de columnas
                string FormatearNombreColumna(string nombreColumna)
                {
                    return Regex.Replace(nombreColumna.Replace("_", " "), "(?<!^)([A-Z])", " $1");
                }

                // Formatear y agregar los nombres de las columnas
                foreach (DataColumn dc in ds.Tables[0].Columns)
                {
                    Columnas.Add(FormatearNombreColumna(dc.ColumnName));
                }

                // Extraer datos de cada fila y agregarlos a la lista `Datos`
                List<string> xData = new List<string>();
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    foreach (DataColumn dc in ds.Tables[0].Columns)
                    {
                        xData.Add(row[dc].ToString().Trim());
                    }
                    Datos.Add(xData);
                    xData = new List<string>();
                }

                // Construcción del JSON para columnas y datos
                sb.Append("[{\"COLUMNS\":[");
                foreach (string col in Columnas)
                {
                    if (hasMoreRecords)
                    {
                        sb.Append(",");
                    }
                    sb.Append(String.Format("{{\"title\":\"{0}\"}}", col));
                    hasMoreRecords = true;
                }
                sb.Append("],\"DATA\":[");

                hasMoreRecords = false;
                foreach (var val in Datos)
                {
                    if (hasMoreRecords)
                    {
                        sb.Append(",");
                    }
                    sb.Append("[");
                    bool hasMoreData = false;

                    foreach (var item in val)
                    {
                        if (hasMoreData)
                        {
                            sb.Append(",");
                        }
                        sb.Append(String.Format("\"{0}\"", item));
                        hasMoreData = true;
                    }

                    sb.Append("]");
                    hasMoreRecords = true;
                }
                sb.Append("]}]");
            }

            var jsonResult = Json(new { d = sb.ToString() });
            return jsonResult;
        }
        public async Task<IActionResult> GetListado(string idLista, string idUsuario, string fechaInicia, string fechaFin, string idSucursal, string tipoPregunta, string idEmpresa, string cadena, string empresa)
        {

            // Formatear las fechas a cadenas con el formato "yyyy-MM-dd"
            string fechaI = fechaInicia;
            string fechaF = fechaFin;
            string url = string.Format("{0}GetReporteEstrellas?idEmpresa={1}&empresa={2}&idLista={3}&cadena={4}", Utilerias.UrlBase, idEmpresa, empresa, idLista, cadena);
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
            List<ReportesEstrellas1> respuesta = JsonConvert.DeserializeObject<List<ReportesEstrellas1>>(response.Content);
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

                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Sucursal) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.NombreLista) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.UltimaFechaEvaluacion) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.PromedioUltimaEvaluacion) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.PromedioUltimos12Meses) + "\"");
                //sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Instructor.ToString()) + "\",");
                //sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Fecha.ToString()) + "\",");
                // sb.Append("\"" + HttpUtility.JavaScriptStringEncode("<button class='btn btn-primary' onclick='llenarComboProgramacionModal(\"\",\"\")'>Resultados</button>") + "\"");




                sb.Append("]");
                hasMoreRecords = true;
            }
            sb.Append("]}");
            var jsonResult = Json(new { d = sb.ToString() });
            // jsonResult.MaxJsonLength = int.MaxValue;

            return jsonResult;
        }

        //public async Task<IActionResult> GetDataListas([FromBody] dynamic parametros)
        //{
        //    string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
        //    string idLista = parametros.TryGetProperty("idLista", out JsonElement idListaElement) ? idListaElement.GetString() : null;
        //    string idUsuario = parametros.TryGetProperty("idUsuario", out JsonElement idUsuarioElement) ? idUsuarioElement.GetString() : null;
        //    string empresa = User.FindFirstValue(ClaimTypes.Sid);
        //    string url = string.Format("{0}ListasRespuestas/GetLista?idLista={1}&idEmpresa={2}&idUsuario={3}&empresa={4}", Utilerias.UrlBase, idLista, idEmpresa, idUsuario, empresa);
        //    Console.WriteLine(url);
        //    var client = new RestClient(url);
        //    var request = new RestRequest();
        //    request.Method = Method.Get;
        //    RestResponse response = await client.ExecuteAsync(request);

        //    // Verificar si el contenido es un objeto JSON en lugar de un arreglo JSON
        //    if (!response.Content.StartsWith("["))
        //    {
        //        // Si es un objeto JSON, envolverlo en un arreglo JSON
        //        response.Content = "[" + response.Content + "]";
        //    }

        //    // Deserializar el JSON en una lista de objetos respcExperienciaVisible
        //    List<ListasRespuestasDetalle> respuesta = JsonConvert.DeserializeObject<List<ListasRespuestasDetalle>>(response.Content);
        //    // List<ListasRespuestasDetalle> respuestaOrden = respuesta.OrderBy(r => r.Pregunta).ToList();
        //    StringBuilder sb = new StringBuilder();
        //    bool hasMoreRecords = false;
        //    sb.Append(@"{" + "\"sEcho\": 1,");
        //    sb.Append("\"iTotalRecords\": " + respuesta.Count + ",");
        //    sb.Append("\"iTotalDisplayRecords\": " + respuesta.Count + ",");
        //    sb.Append("\"aaData\": [");
        //    foreach (var resp in respuesta)
        //    {
        //        if (hasMoreRecords) sb.Append(",");
        //        sb.Append("[");

        //        StringBuilder contenido = new StringBuilder();
        //        sb.Append("\"" + HttpUtility.JavaScriptStringEncode("<button class='btn btn-primary' onclick='llenarComboProgramacionModalAnexo(event, \"" + resp.id + "\")'>Anexos</button>") + "\",");
        //        sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Evaluacion) + "\",");
        //        sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Pregunta) + "\",");
        //        sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.categoria) + "\",");
        //        sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.subcategoria) + "\",");
        //        sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.RespuestaOpciones) + "\",");
        //        sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Respuesta) + "\",");
        //        sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Tipo) + "\"");
        //        // sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Valor.ToString()) + "\",");
        //        // sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Alumno.ToString()) + "\"");
        //        //  sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Calificacion.ToString()) + "\"");




        //        sb.Append("]");
        //        hasMoreRecords = true;
        //    }
        //    sb.Append("]}");
        //    var jsonResult = Json(new { d = sb.ToString() });
        //    //jsonResult.MaxJsonLength = int.MaxValue;

        //    return jsonResult;
        //}

        //public async Task<IActionResult> GetDataAnexos([FromBody] dynamic parametros)
        //{
        //    string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
        //    string idLista = parametros.TryGetProperty("idLista", out JsonElement idListaElement) ? idListaElement.GetString() : null;
        //    string empresa = User.FindFirstValue(ClaimTypes.Sid);
        //    string url = string.Format("{0}ListasRespuestas/GetAnexo?idListaRespuesta={1}&empresa={2}", Utilerias.UrlBase, idLista, empresa);
        //    Console.WriteLine(url);
        //    var client = new RestClient(url);
        //    var request = new RestRequest();
        //    request.Method = Method.Get;
        //    RestResponse response = await client.ExecuteAsync(request);

        //    // Verificar si el contenido es un objeto JSON en lugar de un arreglo JSON
        //    if (!response.Content.StartsWith("["))
        //    {
        //        // Si es un objeto JSON, envolverlo en un arreglo JSON
        //        response.Content = "[" + response.Content + "]";
        //    }

        //    // Deserializar el JSON en una lista de objetos respcExperienciaVisible
        //    List<AnexoPregunta> respuesta = JsonConvert.DeserializeObject<List<AnexoPregunta>>(response.Content);
        //    List<AnexoPregunta> respuestaOrden = respuesta.OrderBy(r => r.tipo_anexo).ToList();
        //    StringBuilder sb = new StringBuilder();
        //    bool hasMoreRecords = false;
        //    sb.Append(@"{" + "\"sEcho\": 1,");
        //    sb.Append("\"iTotalRecords\": " + respuestaOrden.Count + ",");
        //    sb.Append("\"iTotalDisplayRecords\": " + respuestaOrden.Count + ",");
        //    sb.Append("\"aaData\": [");
        //    foreach (var resp in respuestaOrden)
        //    {
        //        if (hasMoreRecords) sb.Append(",");
        //        sb.Append("[");

        //        StringBuilder contenido = new StringBuilder();
        //        sb.Append("\"" + HttpUtility.JavaScriptStringEncode("<a href=\"" + resp.url + "\" target=\"_blank\" data-toggle='tooltip' title='Mostrar documento'><i class='fa fa-search'></i></a>") + "\",");
        //        sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.tipo_anexo == 1 ? "Foto" : "Video") + "\"");

        //        // sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Valor.ToString()) + "\",");
        //        // sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Alumno.ToString()) + "\"");
        //        //  sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Calificacion.ToString()) + "\"");




        //        sb.Append("]");
        //        hasMoreRecords = true;
        //    }
        //    sb.Append("]}");
        //    var jsonResult = Json(new { d = sb.ToString() });
        //    //jsonResult.MaxJsonLength = int.MaxValue;

        //    return jsonResult;
        //}
    }
}
