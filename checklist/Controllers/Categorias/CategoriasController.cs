using checklist.Clases;
using checklist.Models.Puestos;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;
using System.Security.Claims;
using System.Text.Json;
using System.Text;
using System.Web;
using checklistWs.Models.Categorias;
using checklist.Models.Roles;

namespace checklist.Controllers.Categorias
{
    public class CategoriasController : Controller
    {
        private readonly IConfiguration _configuration;

        public CategoriasController(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public IActionResult CategoriasABC()
        {
            return View();
        }

		public async Task<ActionResult> Inicializa(string idEmpresa, string cadena, string empresa)
		{
            string idRol = Utilerias.IdRol;

            Opciones opc = await Utilerias.GetOpcion("01002001", idEmpresa, idRol, empresa, cadena);
			return Json(new { d = "Ok", perm = opc.Permisos.Escritura });
		}

		public async Task<IActionResult> GetData(string idEmpresa, string cadena, string empresa)
        {
 
			string url = $"{Utilerias.UrlBase}ObtenerCategorias?idEmpresa={idEmpresa}&empresa={empresa}&cadena={cadena}";
            string idRol = Utilerias.IdRol;
            Opciones opc = await Utilerias.GetOpcion("01002001", idEmpresa, idRol, empresa, cadena);

			var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<ListasPreguntasCategorias> respuesta = JsonConvert.DeserializeObject<List<ListasPreguntasCategorias>>(response.Content);
            List<ListasPreguntasCategorias> respuestaOrden = respuesta.OrderBy(r => r.Nombre).ToList();
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
					sb.Append("\"" + HttpUtility.JavaScriptStringEncode($"<a href='javascript:Editar(\"{resp.Id}\")'; data-toggle='tooltip' title='Editar'><i class='fa fa-edit'></i></a>") + "\",");
				}
				else
				{
					sb.Append("\"\",");

				}

				 sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Nombre) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Notas) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Fecha.ToString()) + "\"");
                sb.Append("]");
                hasMoreRecords = true;
            }
            sb.Append("]}");
            var json = sb.ToString();
            return Content(json, "application/json");
        }

        public async Task<IActionResult> GetCategoria(string lla, string idEmpresa, string cadena, string empresa)
        {
           
			
			string url = $"{Utilerias.UrlBase}ObtenerCategoria?idEmpresa={idEmpresa}&id={lla}&empresa={empresa}&cadena={cadena}";
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<Puesto> respuesta = JsonConvert.DeserializeObject<List<Puesto>>(response.Content);
            var result = respuesta.FirstOrDefault();
            return Json(new { d = result });
        }

        public async Task<IActionResult> GuardaCategoria(string llav, string nomb, string nota, string idEmpresa, string cadena, string empresa)
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
                string url = $"{Utilerias.UrlBase}InsertarCategoria?empresa={empresa}&cadena={cadena}";
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Post;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(json);
                var response = await clientS.ExecuteAsync(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Ok") regresa = response.Content;
            }
            else
            {
                zona.id = Guid.Parse(llav);
                var json = JsonConvert.SerializeObject(zona, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                string url = $"{Utilerias.UrlBase}ActualizarCategoria?id={llav}&empresa={empresa}&cadena={cadena}";
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Put;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(json);
                var response = await clientS.ExecuteAsync(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Ok") regresa = response.Content;
            }
            return Json(new { d = regresa });
        }
    }
}
