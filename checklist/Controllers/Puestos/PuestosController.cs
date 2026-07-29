using checklist.Clases;
using checklist.Models.Puestos;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;
using System.Security.Claims;
using System.Text.Json;
using System.Text;
using System.Web;
using checklist.Models.Roles;

namespace checklist.Controllers.Puestos
{
    public class PuestosController : Controller
    {

        private readonly IConfiguration _configuration;

        public PuestosController(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public IActionResult Index()
        {
            return View();
        }

		public async Task<ActionResult> Inicializa(string idEmpresa, string cadena, string empresa)
		{
            string idRol = Utilerias.IdRol;

            Opciones opc = await Utilerias.GetOpcion("04001003", idEmpresa, idRol, empresa, cadena);
			return Json(new { d = "Ok", perm = opc.Permisos.Escritura });
		}

		public async Task<IActionResult> GetData(string idEmpresa, string cadena, string empresa)
        {
			
			string url = $"{Utilerias.UrlBase}ObtenerPuestos?empresa={empresa}&idEmpresa={idEmpresa}&cadena={cadena}";
            string idRol = Utilerias.IdRol;
            Opciones opc = await Utilerias.GetOpcion("04001003", idEmpresa, idRol, empresa, cadena);

			var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<Puesto> respuesta = JsonConvert.DeserializeObject<List<Puesto>>(response.Content ?? "[]") ?? new List<Puesto>();
            List<Puesto> respuestaOrden = respuesta.OrderBy(r => r.Nombre ?? string.Empty).ToList();
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

                //if (opc.Permisos.Escritura == 1)
                if (opc.Permisos.Escritura == 1 && resp.Nombre != "Administrador" && resp.Nombre != "Supervisor")
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

        public async Task<IActionResult> GetPuesto(string lla, string idEmpresa, string cadena, string empresa)
        {
            
            string url = $"{Utilerias.UrlBase}ObtenerPuesto?id={lla}&empresa={empresa}&cadena={cadena}";
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<Puesto> respuesta = JsonConvert.DeserializeObject<List<Puesto>>(response.Content ?? "[]") ?? new List<Puesto>();
            var result = respuesta.FirstOrDefault();
            return Json(new { d = result });
        }

        public async Task<IActionResult> GuardaPuesto(string llav, string nomb, string idEmpresa, string cadena, string empresa, string nota = "")
        {
            string regresa = "Ok";
            var zona = new Puesto
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
                string url = $"{Utilerias.UrlBase}InsertarPuesto?empresa={empresa}&cadena={cadena}";
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Post;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(json);
                var response = await clientS.ExecuteAsync(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Puesto insertado con éxito.") regresa = response.Content;
            }
            else
            {
                zona.id = Guid.Parse(llav);
               
                var json = JsonConvert.SerializeObject(zona, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                string url = $"{Utilerias.UrlBase}ActualizarPuesto?id={llav}&empresa={empresa}&cadena={cadena}";
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
