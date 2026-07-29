using checklist.Clases;
using checklist.Models.EstrcuturaCombo;
using checklist.Models.Listas;
using checklist.Models.Roles;
using checklist.Models.Usuarios;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Web;

namespace checklist.Controllers.Detalle
{
    public class DetalleListaController : Controller
    {
        public IActionResult DetalleLista()
        {
            return View();
        }

        private readonly IConfiguration _configuration;

        public DetalleListaController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<ActionResult> Inicializa(string idEmpresa, string cadena, string empresa)
        {
            string idRol = Utilerias.IdRol;

            Opciones opc = await Utilerias.GetOpcion("01001002", idEmpresa, idRol, empresa, cadena);
            return Json(new { d = "Ok", perm = opc.Permisos.Escritura });
        }

        public async Task<ActionResult> GetListasTodosSinFiltro(string searchTerm, string idEmpresa, string cadena, string empresa)
        {
           
			if (!string.IsNullOrEmpty(searchTerm))
			{
				searchTerm = searchTerm.Replace("\"", ""); // Elimina las comillas dobles
			}
			string url = string.Format("{0}Listas/GetTodosSinFiltro?idEmpresa={1}&empresa={2}&cadena={3}&cualPrograma={4}", Utilerias.UrlBase, idEmpresa, empresa, cadena, searchTerm);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
			List<DataLista> respuesta = JsonConvert.DeserializeObject<List<DataLista>>(response.Content);
			List<select2Data> result = new List<select2Data>();
			foreach (var resp in respuesta)
			{
				result.Add(new select2Data()
				{
					id = resp.id,
					text = resp.nombre
				});
			}
			return Json(new { d = result });

		}

        public async Task<ActionResult> GetListasCerradasSinFiltro(string idEmpresa, string cadena, string empresa)
        {
            string url = string.Format("{0}Listas/GetTodosCerradas?idEmpresa={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idEmpresa, empresa, cadena);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<Lista> respuesta = JsonConvert.DeserializeObject<List<Lista>>(response.Content);
            List<select2Data> result = new List<select2Data>();
            foreach (var resp in respuesta)
            {
                result.Add(new select2Data()
                {
                    id = resp.id.HasValue ? resp.id.Value.ToString() : string.Empty,
                    text = resp.Nombre
                });
            }
            return Json(new { d = result });
        }

        public async Task<ActionResult> GetListasEstadosBL26(string searchTerm, string idEmpresa, string cadena, string empresa)
        {
            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.Replace("\"", "");
            }

            string url = string.Format("{0}Listas/GetTodosEstadosBL26?idEmpresa={1}&empresa={2}&cadena={3}&cualPrograma={4}", Utilerias.UrlBase, idEmpresa, empresa, cadena, searchTerm);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<checklist.Models.Listas.Lista> respuesta = JsonConvert.DeserializeObject<List<checklist.Models.Listas.Lista>>(response.Content);
            List<object> result = new List<object>();

            foreach (var resp in respuesta)
            {
                result.Add(new
                {
                    id = resp.id.HasValue ? resp.id.Value.ToString() : string.Empty,
                    text = resp.Nombre,
                    notas = resp.Notas,
                    status = resp.Status,
                    estado = resp.Estado,
                    activo = resp.Activo,
                    usaActivos = resp.UsaActivos,
                    idTipoActivo = resp.idTipoActivo.HasValue ? resp.idTipoActivo.Value.ToString() : string.Empty,
                    tipoActivo = resp.TipoActivo,
                    cantidadTareas = resp.CantidadTareas ?? 0
                });
            }

            return Json(new { d = result });
        }
        public async Task<IActionResult> GetEvaluacionesComboBox(string opci, string idEmpresa, string cadena, string empresa)
        {
			
            string url = string.Format("{0}Listas/GetTodos?idEmpresa={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idEmpresa, empresa, cadena);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<Lista> respuesta = JsonConvert.DeserializeObject<List<Lista>>(response.Content);
            string result = string.Empty;
            if (opci == "1") result = "<option value='b'> -- Todos --  </option> ";
            foreach (var resp in respuesta)
            {
                result += string.Format("<option value='{0}'>{1}</option> ", resp.id, resp.Nombre.Trim());
            }
            return Json(new { d = result });

        }

        public async Task<IActionResult> GetUusariosComboBox(string opci)
        {
            string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
			string empresa = User.FindFirstValue(ClaimTypes.Sid);
            string cadena = User.FindFirstValue(ClaimTypes.Uri);
            string url = string.Format("{0}api/Usuario/ObtenerUsuariosCompleto?idEmpresa={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idEmpresa, empresa, cadena);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respUsuario> respuesta = JsonConvert.DeserializeObject<List<respUsuario>>(response.Content);
            string result = string.Empty;
            if (opci == "1") result = "<option value='a'>-- Todos --  </option> ";
            foreach (var resp in respuesta)
            {
                result += string.Format("<option value='{0}'>{1}</option> ", resp.Id, resp.Nombre.Trim() + ' ' + resp.APaterno.Trim() + ' ' + resp.AMaterno.Trim());
            }
            return Json(new { d = result });

        }

        [HttpGet]
        public async Task<IActionResult> GetData(string idLista, string fechaInicia, string fechaFin, string idEmpresa, string cadena, string empresa)
        {
           
           // string idUsuario = parametros.TryGetProperty("idUsuario", out JsonElement idUsuarioElement) ? idUsuarioElement.GetString() : null;
         
            string fechaI = fechaInicia;
            string fechaF = fechaFin;

			string url = string.Format("{0}api/Evaluaciones/ObtenerDetalleEvaluacion?fechaInicia={1}&fechaFin={2}&empresaa={4}&idLista={3}&cadena={5}", Utilerias.UrlBase, fechaI, fechaF, idLista, empresa, cadena);
            Console.WriteLine(url);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);

            if (!response.Content.StartsWith("["))
            {
                response.Content = "[" + response.Content + "]";
            }

            List<EvaluacionDetalle> respuesta = JsonConvert.DeserializeObject<List<EvaluacionDetalle>>(response.Content);
            List<EvaluacionDetalle> respuestaOrden = respuesta.OrderBy(r => r.Evaluacion).ToList();
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

                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Evaluacion) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Pregunta) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Tipo) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Explicacion) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Valor.ToString()) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.StatusLista ? "Activo" : "Inactivo") + "\"");

                sb.Append("]");
                hasMoreRecords = true;
            }
            sb.Append("]}");
            var jsonResult = Json(new { d = sb.ToString() });

            return jsonResult;
        }

    }
}
