using checklist.Clases;
using checklist.Models.Departamentos;
using checklist.Models.Roles;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Web;

namespace checklist.Controllers.Departamentos
{
    public class DepartamentosController : Controller
    {

        private readonly IConfiguration _configuration;

        public DepartamentosController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IActionResult ABCDepartamentos()
        {
            return View();
        }

        public async Task<ActionResult> Inicializa(string idEmpresa, string cadena, string empresa)
        {
            string idRol = Utilerias.IdRol;

            Opciones opc = await Utilerias.GetOpcion("04001002", idEmpresa, idRol, empresa, cadena);
            return Json(new { d = "Ok", perm = opc.Permisos.Escritura });
        }
        public async Task<IActionResult> GetData(string idEmpresa, string cadena, string empresa)
        {

            string url = $"{Utilerias.UrlBase}ObtenerDepartamentos?empresa={empresa}&idEmpresa={idEmpresa}&cadena={cadena}";
            string idRol = Utilerias.IdRol;
            Opciones opc = await Utilerias.GetOpcion("04001002", idEmpresa, idRol, empresa, cadena);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<Departamento> respuesta = JsonConvert.DeserializeObject<List<Departamento>>(response.Content ?? "[]") ?? new List<Departamento>();
            List<Departamento> respuestaOrden = respuesta.OrderBy(r => r.Nombre ?? string.Empty).ToList();
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
                    sb.Append("\"" + HttpUtility.JavaScriptStringEncode($"<a href='javascript:Editar(\"{resp.id}\")'; data-toggle='tooltip' title='Editar'><i class='fa fa-edit'></i></a>") + "\",");
                }
                else
                {
                    sb.Append("\"\",");

                }

                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Nombre ?? string.Empty) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.notas ?? string.Empty) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.fecha.ToString()) + "\"");
                sb.Append("]");
                hasMoreRecords = true;
            }
            sb.Append("]}");
            var json = sb.ToString();
            return Content(json, "application/json");
        }
        public async Task<IActionResult> GetDepartamento(string lla, string idEmpresa, string cadena, string empresa)
        {
            string url = $"{Utilerias.UrlBase}ObtenerDepartamento?id={lla}&empresa={empresa}&cadena={cadena}";
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<Departamento> respuesta = JsonConvert.DeserializeObject<List<Departamento>>(response.Content ?? "[]") ?? new List<Departamento>();
            var result = respuesta.FirstOrDefault();
            return Json(new { d = result });
        }
        public async Task<IActionResult> GuardaDepartamento(string llav, string nomb, string nota, string idEmpresa, string cadena, string empresa)
        {
            string regresa = "Ok";
            var zona = new Departamento
            {
                idEmpresa = Guid.Parse(idEmpresa),
                Nombre = nomb.Trim(),
                notas = nota != null ? nota.Trim() : "",
                fecha = Utilerias.FechaActual(),
                borrado = false
            };
            if (string.IsNullOrEmpty(llav))
            {
                var json = JsonConvert.SerializeObject(zona, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                string url = $"{Utilerias.UrlBase}InsertarDepartamento?empresa={empresa}&cadena={cadena}";
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Post;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(json);
                var response = await clientS.ExecuteAsync(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Departamento insertado con éxito.") regresa = response.Content;
            }
            else
            {
                zona.id = Guid.Parse(llav);
                var json = JsonConvert.SerializeObject(zona, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                string url = $"{Utilerias.UrlBase}ActualizarDepartamento?id={llav}&empresa={empresa}&cadena={cadena}";
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Put;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(json);
                var response = await clientS.ExecuteAsync(request);
                if (Utilerias.LimpiaCadena(response.Content) != "") regresa = response.Content;
            }
            return Json(new { d = regresa });
        }
    }
}
