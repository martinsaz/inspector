using checklist.Clases;
using checklist.Models.Roles;
using checklist.Models.Sucursales;
using checklist.Models.Usuarios;
using checklist.Models.Zonas;
using Firebase.Auth.Providers;
using Firebase.Auth;
using Firebase.Storage;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;
using System.Text;

using System.Web;
using System.Security.Claims;
using System.Text.Json;
using checklist.Models.RazonSocial;


namespace checklist.Controllers.Sucursales
{
    public class SucursalesController : Controller
    {

        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _clientFactory;

        public SucursalesController(IConfiguration configuration, IHttpClientFactory clientFactory)
        {
            _configuration = configuration;
            _clientFactory = clientFactory;
        }
        public IActionResult SucursalesABC()
        {
            return View();
        }

        public async Task<ActionResult> Inicializa(string idEmpresa, string cadena, string empresa)
        {
            string idRol = Utilerias.IdRol;

            Opciones opc = await Utilerias.GetOpcion("04003000", idEmpresa, idRol, empresa, cadena);
            return Json(new { d = "Ok", perm = opc.Permisos.Escritura });
        }
        public async Task<ActionResult> GetRazonesSociales(string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}ObtenerRazonesSociales?idEmpresa={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idEmpresa, empresa, cadena);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respRazonSocial> respuesta = JsonConvert.DeserializeObject<List<respRazonSocial>>(response.Content);
            List<respRazonSocial> respuestaOrden = respuesta.OrderBy(r => r.Nombre).ToList();
            //List<DataPair> result = new List<DataPair>();
            string result = string.Empty;
            foreach (var resp in respuestaOrden)
            {
                //result.Add(new DataPair()
                //{
                //    name = resp.Nombre.Trim(),
                //    value = resp.Id.Trim()
                //});

                result += String.Format("<option value='{0}'>{1}</option> ", resp.Id.Trim(), resp.Nombre.Trim());
            }
            return Json(new { d = result });
        }

        #region Catalogos
        //public async Task<ActionResult> GetTitulares(string opci = "")
        //{
        //    string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
        //    string url = string.Format("{0}ObtenerUsuariosCompleto?idEmpresa={1}", Utilerias.UrlBase, idEmpresa);

        //    var client = new RestClient(url);
        //    var request = new RestRequest();
        //    request.Method = Method.Get;
        //    RestResponse response = await client.ExecuteAsync(request);
        //    List<respUsuariosCompleto> respuesta = JsonConvert.DeserializeObject<List<respUsuariosCompleto>>(response.Content);
        //    List<respUsuariosCompleto> respuestaOrden = respuesta.OrderBy(r => r.Nombre).ThenBy(ap => ap.APaterno).ThenBy(am => am.AMaterno).ToList();
        //    string result = string.Empty;
        //    if (!string.IsNullOrEmpty(opci))
        //    {
        //        if (opci == "1") result = "<option value='00000000-0000-0000-0000-000000000000'>-- Todos --</option> ";
        //    }
        //    foreach (var resp in respuestaOrden)
        //    {
        //        result += String.Format("<option value='{0}'>{1} {2} {3}</option> ", resp.id.Trim(), resp.Nombre.Trim(), resp.APaterno, resp.AMaterno);
        //    }
        //    return Json(new { d = result });
        //}

        public async Task<ActionResult> GetZonas(string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}ObtenerZonas?idEmpresa={1}&empresa={2}", Utilerias.UrlBase, idEmpresa, empresa);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respZona> respuesta = JsonConvert.DeserializeObject<List<respZona>>(response.Content);
            List<respZona> respuestaOrden = respuesta.OrderBy(r => r.Nombre).ToList();
            string result = string.Empty;
            foreach (var resp in respuestaOrden)
            {
                result += String.Format("<option value='{0}'>{1}</option> ", resp.Id.Trim(), resp.Nombre.Trim());
            }
            return Json(new { d = result });
        }

        public async Task<ActionResult> GetTipos(string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}api/SucursalesTipos?idEmpresa={1}&empresa={2}", Utilerias.UrlBase, idEmpresa, empresa);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respSucursalesTipos> respuesta = JsonConvert.DeserializeObject<List<respSucursalesTipos>>(response.Content);
            List<respSucursalesTipos> respuestaOrden = respuesta.OrderBy(r => r.Nombre).ToList();
            string result = string.Empty;
            foreach (var resp in respuestaOrden)
            {
                result += String.Format("<option value='{0}'>{1}</option> ", resp.Id.Trim(), resp.Nombre.Trim());
            }
            return Json(new { d = result });
        }
        #endregion

        public async Task<ActionResult> GetDataSucursales(string idEmpresa, string cadena, string empresa)
        {
            string url = string.Format("{0}api/Sucursal/ObtenerSucursalesCompleta?idEmpresa={1}&empresa={2}&cadena={3}", Utilerias.UrlBase, idEmpresa, empresa, cadena);
            string idRol = Utilerias.IdRol;
            Opciones opc = await Utilerias.GetOpcion("04003000", idEmpresa, idRol, empresa, cadena);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respSucursalCompleto> respuesta = JsonConvert.DeserializeObject<List<respSucursalCompleto>>(response.Content);
            List<respSucursalCompleto> respuestaOrden = respuesta.OrderBy(r => r.Nombre).ToList();
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

                    sb.Append("\"" + HttpUtility.JavaScriptStringEncode("<a href='javascript:EditarSucursal(\"" + resp.Id + "\")'; data-toggle='tooltip' title='Editar'><i class='fa fa-edit'></i></a>") + "\",");
                }
                else
                {
                    sb.Append("\"\",");

                }

                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Nombre) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Direccion) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Ciudad) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Telefono) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Correo) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.Pais) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.NombreZona) + "\",");
                sb.Append("\"" + HttpUtility.JavaScriptStringEncode(resp.NombreRzonSocial) + "\"");
                sb.Append("]");
                hasMoreRecords = true;
            }
            sb.Append("]}");
            var jsonResult = Json(new { d = sb.ToString() });

            return jsonResult;
        }

        public async Task<ActionResult> GetSucursal(string lla, string cua, string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}api/Sucursal/ObtenerSucursal?idEmpresa={1}&id={2}&empresa={3}&cadena={4}", Utilerias.UrlBase, idEmpresa, cua, empresa, cadena);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respSucursal> respuesta = JsonConvert.DeserializeObject<List<respSucursal>>(response.Content);
            respSucursal result = new respSucursal();
            foreach (var item in respuesta)
            {
                result = item;
            }
            return Json(new { d = result });
        }

        public async Task<ActionResult> GuardaSucursal([FromBody] dynamic parametros)
        {
            string llav = parametros.TryGetProperty("llav", out JsonElement llavElement) ? llavElement.GetString() : null;
            string nomb = parametros.TryGetProperty("nomb", out JsonElement nombElement) ? nombElement.GetString() : null;
            //string iden = parametros.TryGetProperty("iden", out JsonElement idenElement) ? idenElement.GetString() : null;
            string call = parametros.TryGetProperty("call", out JsonElement callElement) ? callElement.GetString() : null;
            string ciud = parametros.TryGetProperty("ciud", out JsonElement ciudElement) ? ciudElement.GetString() : null;
            string tele = parametros.TryGetProperty("tele", out JsonElement teleElement) ? teleElement.GetString() : null;
            //string titu = parametros.TryGetProperty("titu", out JsonElement tituElement) ? tituElement.GetString() : null;
            string emai = parametros.TryGetProperty("emai", out JsonElement emaiElement) ? emaiElement.GetString() : null;
            string pais = parametros.TryGetProperty("pais", out JsonElement paisElement) ? paisElement.GetString() : null;
            string razo = parametros.TryGetProperty("razo", out JsonElement razoElement) ? razoElement.GetString() : null;
            string zona = parametros.TryGetProperty("zona", out JsonElement zonaElement) ? zonaElement.GetString() : null;
            //string tipo = parametros.TryGetProperty("tipo", out JsonElement tipoElement) ? tipoElement.GetString() : null;
            string nota = parametros.TryGetProperty("nota", out JsonElement notaElement) ? notaElement.GetString() : null;
            //string im64 = parametros.TryGetProperty("im64", out JsonElement im64Element) ? im64Element.GetString() : null;
            //string imca = parametros.TryGetProperty("imca", out JsonElement imcaElement) ? imcaElement.GetString() : null;


            string idEmpresa = parametros.TryGetProperty("idEmpresa", out JsonElement idEmpresaElement) ? idEmpresaElement.GetString() : null;
            string empresa = parametros.TryGetProperty("empresa", out JsonElement empresaElement) ? empresaElement.GetString() : null;
            string cadena = parametros.TryGetProperty("cadena", out JsonElement cadenaElement) ? cadenaElement.GetString() : null;



            string regresa = "Ok";

            respSucursal sucursal = new respSucursal();
            sucursal.IdEmpresa = idEmpresa;
            sucursal.Nombre = nomb.Trim();
            sucursal.Direccion = call.Trim();
            sucursal.Ciudad = ciud.Trim();
            sucursal.Telefono = tele.Trim();
            sucursal.Numero = "3FA85F64";
            sucursal.Correo = emai.Trim().ToLower();
            sucursal.Pais = pais.Trim();
            sucursal.IdTitular = "3FA85F64-5717-4562-B3FC-2C963F66AFA6";
            sucursal.IdRazonSocial = razo.Trim();
            sucursal.IdZona = zona.Trim();
            sucursal.IdSucursalTipo = "3FA85F64-5717-4562-B3FC-2C963F66AFA6";
            sucursal.Notas = "asdfg";
            sucursal.borrado = false;
            sucursal.Fecha = Utilerias.FechaActual();
            sucursal.LinkImagen = "N/A";
            if (string.IsNullOrEmpty(llav))
            {
                try
                {

                    var json = JsonConvert.SerializeObject(sucursal, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                    string url = string.Format("{0}api/Sucursal/InsertarSucursal?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
                    var clientS = new RestClient(url);
                    var request = new RestRequest();
                    request.Method = Method.Post;
                    request.RequestFormat = DataFormat.Json;
                    request.AddJsonBody(json);
                    var response = clientS.Execute(request);
                    if (Utilerias.LimpiaCadena(response.Content) != "Sucursal creada correctamente") regresa = response.Content;
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


                var json = JsonConvert.SerializeObject(sucursal, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                string url = string.Format("{0}api/Sucursal/ActualizarSucursal?id={1}&idEmpresa={2}&empresa={3}&cadena={4}", Utilerias.UrlBase, llav, idEmpresa, empresa, cadena);
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Put;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(json);
                var response = clientS.Execute(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Sucursal actualizada correctamente") regresa = response.Content;

            }
            return Json(new { d = regresa });
        }

        public async Task<ActionResult> GuardaRazonSocial(string llav, string nomb, string rfc, string idEmpresa, string cadena, string empresa)
        {

            string regresa = "Ok";
            respRazonSocial sucursal = new respRazonSocial();
            sucursal.IdEmpresa = idEmpresa;
            sucursal.Nombre = nomb.Trim();
            sucursal.Direccion = "";
            sucursal.Ciudad = "";
            sucursal.Telefono = "";
            sucursal.Colonia = "";
            sucursal.RFC = rfc;
            sucursal.Estado = "";
            sucursal.Pais = "";
            sucursal.Regimen1 = "";
            sucursal.IMGFIREBASE = "";
            sucursal.Notas = "asdfg";
            sucursal.borrado = false;
            sucursal.CodigoPostal = "";
            sucursal.Representante = "8C4DCDD4-894C-440E-B5B3-9F99CF37504A";
            sucursal.Fecha = Utilerias.FechaActual();
            if (string.IsNullOrEmpty(llav))
            {
                try
                {

                    var json = JsonConvert.SerializeObject(sucursal, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                    string url = string.Format("{0}InsertarRazonSocial?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
                    var clientS = new RestClient(url);
                    var request = new RestRequest();
                    request.Method = Method.Post;
                    request.RequestFormat = DataFormat.Json;
                    request.AddJsonBody(json);
                    var response = clientS.Execute(request);
                    if (Utilerias.LimpiaCadena(response.Content) != "Sucursal creada correctamente") regresa = response.Content;
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


                var json = JsonConvert.SerializeObject(sucursal, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                string url = string.Format("{0}InsertarRazonSocial?id={1}&idEmpresa={2}&empresa={3}&cadena={4}", Utilerias.UrlBase, llav, idEmpresa, empresa, cadena);
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Put;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(json);
                var response = clientS.Execute(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Sucursal actualizada correctamente") regresa = response.Content;

            }
            return Json(new { d = regresa });
        }
        public async Task<ActionResult> GuardaZona(string llav, string nomb, string idEmpresa, string cadena, string empresa)
        {
            string regresa = "Ok";
            respZona sucursal = new respZona();
            sucursal.IdEmpresa = idEmpresa;
            sucursal.Nombre = nomb.Trim();
            sucursal.Notas = "";

            if (string.IsNullOrEmpty(llav))
            {
                try
                {

                    var json = JsonConvert.SerializeObject(sucursal, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                    string url = string.Format("{0}InsertarZona?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
                    var clientS = new RestClient(url);
                    var request = new RestRequest();
                    request.Method = Method.Post;
                    request.RequestFormat = DataFormat.Json;
                    request.AddJsonBody(json);
                    var response = clientS.Execute(request);
                    if (Utilerias.LimpiaCadena(response.Content) != "Sucursal creada correctamente") regresa = response.Content;
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
                var json = JsonConvert.SerializeObject(sucursal, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                string url = string.Format("{0}/InsertarZona?id={1}&idEmpresa={2}&empresa={3}&cadena={4}", Utilerias.UrlBase, llav, idEmpresa, empresa, cadena);
                var clientS = new RestClient(url);
                var request = new RestRequest();
                request.Method = Method.Put;
                request.RequestFormat = DataFormat.Json;
                request.AddJsonBody(json);
                var response = clientS.Execute(request);
                if (Utilerias.LimpiaCadena(response.Content) != "Sucursal actualizada correctamente") regresa = response.Content;

            }
            return Json(new { d = regresa });
        }

        //     public async Task<ActionResult> Inicializa()
        //     {
        //string idEmpresa = User.FindFirstValue(ClaimTypes.SerialNumber);
        //Opciones opc = await Utilerias.GetOpcion("m050101");
        //         return Json(new { d = "Ok", perm = opc.Permisos.Escritura }, JsonRequestBehavior.AllowGet);
        //     }
    }
}
