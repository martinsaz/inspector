using checklist.Clases;
using checklist.Models.Zonas;
using checklist.Models.Roles;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;
using System.Text.Json;
using System.Text;
using System.Web;
using System.Security.Claims;
using Microsoft.AspNetCore.WebUtilities;
using checklist.Models.Firebase;
using Microsoft.Extensions.Options;
using checklist.Models.Sucursales;

namespace checklist.Controllers.Regiones
{
    public class RegionesController : Controller
    {
        private readonly IConfiguration _config;
        private readonly fbConfiguracion _fbConfig;

        public RegionesController(IConfiguration config, IOptions<fbConfiguracion> fbConfig)
        {
            _config = config;
            _fbConfig = fbConfig.Value;
        }
        public IActionResult Index()
        {
            return View();
        }

        public async Task<ActionResult> Inicializa(string idEmpresa, string cadena, string empresa)
        {
            string idRol;
    
            idRol = Utilerias.IdRol;

            Opciones opc = await Utilerias.GetOpcion("04005000", idEmpresa, idRol, empresa, cadena);
            return Json(new { d = "Ok", perm = opc.Permisos.Escritura });
        }

        #region Nuevo 
        private string ValidarYAsignar(string valor)
        {
            return string.IsNullOrWhiteSpace(valor) ? string.Empty : valor.Trim();
        }
        public async Task<ActionResult> Guardar(string llave, string nombre, string notas, string idEmpresa, string cadena, string empresa)
        {
            string regresa = "Ok";
            respZona item = new respZona();
            item.IdEmpresa = idEmpresa;
            item.Nombre = nombre.Trim();
            item.Notas = notas != null ? notas.Trim() : "";
            item.borrado = false;
            item.Fecha = Utilerias.FechaActual();



            if (string.IsNullOrEmpty(llave))
            {
                try
                {

                    var json = JsonConvert.SerializeObject(item, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                    string url = string.Format("{0}InsertarZona?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
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
                    regresa = string.Format("Nueva.Sucursal: {0} - {1}", ex.Message, sComp);
                }
            }
            else
            {
                item.Id = llave;
                var json = JsonConvert.SerializeObject(item, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                string url = string.Format("{0}ActualizarZona?id={1}&cadena={2}", Utilerias.UrlBase, llave, cadena);
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
        #endregion

        #region Get
        public async Task<ActionResult> GetData(string idEmpresa, string cadena, string empresa)
        {
            string url = string.Format("{0}ObtenerZonas?idEmpresa={1}", Utilerias.UrlBase, idEmpresa);
            string idRol = Utilerias.IdRol;
            Opciones opc = await Utilerias.GetOpcion("04005000", idEmpresa, idRol, empresa, cadena);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respZona> respuesta = JsonConvert.DeserializeObject<List<respZona>>(response.Content);
            List<respZona> respuestaOrden = respuesta.OrderBy(r => r.Nombre).ToList();
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

                    sb.Append("\"" + HttpUtility.JavaScriptStringEncode("<a href='javascript:EditarZona(\"" + resp.Id + "\")'; data-toggle='tooltip' title='Editar'><i class='fa fa-edit'></i></a>") + "\",");
                }
                else
                {
                    sb.Append("\"\",");

                }

                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Nombre) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Notas) + "\"");
                sb.Append("]");
                hasMoreRecords = true;
            }
            sb.Append("]}");
            var jsonResult = Json(new { d = sb.ToString() });

            return jsonResult;
        }

        public async Task<ActionResult> GetZona(string lla, string cua, string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}ObtenerZona?idEmpresa={1}&id={2}", Utilerias.UrlBase, idEmpresa, cua);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respZona> respuesta = JsonConvert.DeserializeObject<List<respZona>>(response.Content);
            respZona result = new respZona();
            foreach (var item in respuesta)
            {
                result = item;
            }
            return Json(new { d = result });
        }


        #endregion
    }
}
