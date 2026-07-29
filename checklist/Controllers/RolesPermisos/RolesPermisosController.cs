using checklist.Clases;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Newtonsoft.Json;
using RestSharp;
using checklist.Models.EstrcuturaCombo;
using checklist.Models.Roles;
using System.Net;
using System.Text.Json;
using checklist.Models.Puestos;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Numerics;

namespace checklist.Controllers.RolesPermisos
{
    public class RolesPermisosController : Controller
    {

        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _clientFactory;

        public RolesPermisosController(IConfiguration configuration, IHttpClientFactory clientFactory)
        {
            _configuration = configuration;
            _clientFactory = clientFactory;
        }
        public IActionResult RolesPermisos()
        {
            return View();
        }
        public async Task<ActionResult> Inicializa(string idEmpresa, string cadena, string empresa)
        {

            Opciones opc = await Utilerias.GetOpcion("04002000", idEmpresa, "", empresa, cadena);
            return Json(new { d = "Ok", perm = opc.Permisos.Escritura });
        }
        public async Task<ActionResult> GetRoles(string idEmpresa, string cadena, string empresa, string searchTerm = "")
        {

            string sComp = string.Empty;
            searchTerm = JsonConvert.DeserializeObject<string>(searchTerm);

            if (!string.IsNullOrEmpty(searchTerm)) sComp = string.Format("&rol={0}", searchTerm);
            string url = string.Format("{0}GetComboRoles?idEmpresa={1}&empresa={3}{2}&cadena={4}", Utilerias.UrlBase, idEmpresa, sComp, empresa, cadena);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<DataPair> respuesta = JsonConvert.DeserializeObject<List<DataPair>>(response.Content);
            List<select2Data> result = new List<select2Data>();
            foreach (var resp in respuesta)
            {
                result.Add(new select2Data()
                {
                    id = resp.value,
                    text = resp.name
                });
            }
            return Json(new { d = result });
        }
        public async Task<ActionResult> GuardaRol(string nom, string idEmpresa, string cadena, string empresa)
        {

            respRoles item = new respRoles();
            item.idEmpresa = Guid.Parse(idEmpresa);
            item.NombreRol = nom.Trim();

            item.id = Guid.Parse("00000000-0000-0000-0000-000000000000");
            item.Permisos = "[{\"Opcion\":\"01000000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[{\"Opcion\":\"01001000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[{\"Opcion\":\"01001001\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"01001002\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"01001003\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]}]} ,{\"Opcion\":\"01002000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[{\"Opcion\":\"01002001\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"01002002\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]}]}]},{\"Opcion\":\"02000000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":0},\"Hijos\":[{\"Opcion\":\"02001000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"02002000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"02003000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"02004000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]}]} ,{\"Opcion\":\"03000000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[{\"Opcion\":\"03001000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[{\"Opcion\":\"03001001\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"03001002\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]}]} ,{\"Opcion\":\"03002000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]}]} ,{\"Opcion\":\"04000000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[{\"Opcion\":\"04001000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[{\"Opcion\":\"04001001\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"04001002\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]},{\"Opcion\":\"04001003\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]}]} ,{\"Opcion\":\"04002000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]} ,{\"Opcion\":\"04003000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]} ,{\"Opcion\":\"04004000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]} ,{\"Opcion\":\"04005000\",\"Permisos\":{\"Acceso\":1,\"Escritura\":1},\"Hijos\":[]}]}]";
            //

            var json = JsonConvert.SerializeObject(item, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            string url = string.Format("{0}Guardar?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
            var clientS = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Put;
            request.RequestFormat = DataFormat.Json;
            request.AddJsonBody(json);
            RestResponse response = await clientS.ExecuteAsync(request);
            return Json(new { d = JsonConvert.DeserializeObject<string>(response.Content) });
        }

        /* public async Task<ActionResult> GuardaPerm([FromBody] dynamic parametros)
         {


             string llave = parametros.TryGetProperty("llave", out JsonElement llaveElement) ? llaveElement.GetString() : null;
             string nombre = parametros.TryGetProperty("nombre", out JsonElement nombreElement) ? nombreElement.GetString() : null;

             string menuLista = parametros.TryGetProperty("menuLista", out JsonElement menuListaElement) ? menuListaElement.GetString() : null;


             string CreadorListaA = parametros.TryGetProperty("CreadorListaA", out JsonElement CreadorListaAElement) ? CreadorListaAElement.GetString() : null;
             string CreadorListaW = parametros.TryGetProperty("CreadorListaW", out JsonElement CreadorListaWElement) ? CreadorListaWElement.GetString() : null;


             string swEnProcesoA = parametros.TryGetProperty("swEnProcesoA", out JsonElement swEnProcesoAElement) ? swEnProcesoAElement.GetString() : null;
             string swEnProcesoW = parametros.TryGetProperty("swEnProcesoW", out JsonElement swEnProcesoWElement) ? swEnProcesoWElement.GetString() : null;


             string swConsultaDistribucionA = parametros.TryGetProperty("swConsultaDistribucionA", out JsonElement swConsultaDistribucionAElement) ? swConsultaDistribucionAElement.GetString() : null;
             string swConsultaDistribucionW = parametros.TryGetProperty("swConsultaDistribucionW", out JsonElement swConsultaDistribucionWElement) ? swConsultaDistribucionWElement.GetString() : null;


             string swResultadosA = parametros.TryGetProperty("swResultadosA", out JsonElement swResultadosAElement) ? swResultadosAElement.GetString() : null;
             string swResultadosW = parametros.TryGetProperty("swResultadosW", out JsonElement swResultadosWElement) ? swResultadosWElement.GetString() : null;


             string swRespuestasA = parametros.TryGetProperty("swRespuestasA", out JsonElement swRespuestasAElement) ? swRespuestasAElement.GetString() : null;
             string swRespuestasW = parametros.TryGetProperty("swRespuestasW", out JsonElement swRespuestasWElement) ? swRespuestasWElement.GetString() : null;

             string swContestarA = parametros.TryGetProperty("swContestarA", out JsonElement swContestarAElement) ? swContestarAElement.GetString() : null;
             string swContestarW = parametros.TryGetProperty("swContestarW", out JsonElement swContestarWElement) ? swContestarWElement.GetString() : null;

             string swCategoriasA = parametros.TryGetProperty("swCategoriasA", out JsonElement swCategoriasAElement) ? swCategoriasAElement.GetString() : null;
             string swCategoriasW = parametros.TryGetProperty("swCategoriasW", out JsonElement swCategoriasWElement) ? swCategoriasWElement.GetString() : null;

             string swSubcategoriasA = parametros.TryGetProperty("swSubcategoriasA", out JsonElement swSubcategoriasAElement) ? swSubcategoriasAElement.GetString() : null;
             string swSubcategoriasW = parametros.TryGetProperty("swSubcategoriasW", out JsonElement swSubcategoriasWElement) ? swSubcategoriasWElement.GetString() : null;


             //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


             string menuAjuste = parametros.TryGetProperty("menuAjuste", out JsonElement menuAjusteElement) ? menuAjusteElement.GetString() : null;
             string swUsuariosABCA = parametros.TryGetProperty("swUsuariosABCA", out JsonElement swUsuariosABCAElement) ? swUsuariosABCAElement.GetString() : null;

             string swUsuariosABCW = parametros.TryGetProperty("swUsuariosABCW", out JsonElement swUsuariosABCWElement) ? swUsuariosABCWElement.GetString() : null;
             string swDepartamentosA = parametros.TryGetProperty("swDepartamentosA", out JsonElement swDepartamentosAElement) ? swDepartamentosAElement.GetString() : null;

             string swDepartamentosW = parametros.TryGetProperty("swDepartamentosW", out JsonElement swDepartamentosWElement) ? swDepartamentosWElement.GetString() : null;
             string swPuestosA = parametros.TryGetProperty("swPuestosA", out JsonElement swPuestosAElement) ? swPuestosAElement.GetString() : null;

             string swPuestosW = parametros.TryGetProperty("swPuestosW", out JsonElement swPuestosWElement) ? swPuestosWElement.GetString() : null;
             string swRolesPermisosA = parametros.TryGetProperty("swRolesPermisosA", out JsonElement swRolesPermisosAElement) ? swRolesPermisosAElement.GetString() : null;

             string swRolesPermisosW = parametros.TryGetProperty("swRolesPermisosW", out JsonElement swRolesPermisosWElement) ? swRolesPermisosWElement.GetString() : null;
             string swCorreoElectronicoA = parametros.TryGetProperty("swCorreoElectronicoA", out JsonElement swCorreoElectronicoAElement) ? swCorreoElectronicoAElement.GetString() : null;

             string swCorreoElectronicoW = parametros.TryGetProperty("swCorreoElectronicoW", out JsonElement swCorreoElectronicoWElement) ? swCorreoElectronicoWElement.GetString() : null;
             string swSucursalesA = parametros.TryGetProperty("swSucursalesA", out JsonElement swSucursalesAElement) ? swSucursalesAElement.GetString() : null;

             string swSucursalesW = parametros.TryGetProperty("swSucursalesW", out JsonElement swSucursalesWElement) ? swSucursalesWElement.GetString() : null;

             string menuReporte = parametros.TryGetProperty("menuReporte", out JsonElement menuReporteWElement) ? menuReporteWElement.GetString() : null;

             string R1A = parametros.TryGetProperty("R1A", out JsonElement R1AElement) ? R1AElement.GetString() : null;
             string R1W = parametros.TryGetProperty("R1W", out JsonElement R1WElement) ? R1WElement.GetString() : null;

             string R2A = parametros.TryGetProperty("R2A", out JsonElement R2AElement) ? R2AElement.GetString() : null;
             string R2W = parametros.TryGetProperty("R2W", out JsonElement R2WElement) ? R2WElement.GetString() : null;

             string R3A = parametros.TryGetProperty("R3A", out JsonElement R3AElement) ? R3AElement.GetString() : null;
             string R3W = parametros.TryGetProperty("R3W", out JsonElement R3WElement) ? R3WElement.GetString() : null;

             string R4A = parametros.TryGetProperty("R4A", out JsonElement R4AElement) ? R4AElement.GetString() : null;
             string R4W = parametros.TryGetProperty("R4W", out JsonElement R4WElement) ? R4WElement.GetString() : null;

             string R5A = parametros.TryGetProperty("R5A", out JsonElement R5AElement) ? R5AElement.GetString() : null;
             string R5W = parametros.TryGetProperty("R5W", out JsonElement R5WElement) ? R5WElement.GetString() : null;

             string R6A = parametros.TryGetProperty("R6A", out JsonElement R6AElement) ? R6AElement.GetString() : null;
             string R6W = parametros.TryGetProperty("R6W", out JsonElement R6WElement) ? R6WElement.GetString() : null;

             string idEmpresa = parametros.TryGetProperty("idEmpresa", out JsonElement idEmpresaElement) ? idEmpresaElement.GetString() : null;
             string cadena = parametros.TryGetProperty("cadena", out JsonElement cadenaElement) ? cadenaElement.GetString() : null;
             string empresa = parametros.TryGetProperty("empresa", out JsonElement empresaElement) ? empresaElement.GetString() : null;
             string correo = parametros.TryGetProperty("correo", out JsonElement correoElement) ? correoElement.GetString() : null;


             // string smevaa, string smevaw,
             // string vpcpra, string vpcprw, 
             // string auroaa, string aurorw, 
             // string auacta, string auactw,
             // string vpdasa, string vpdasw, 

             respRoles item = new respRoles();
             item.id = Guid.Parse(llave);
             item.idEmpresa = Guid.Parse(idEmpresa);
             item.NombreRol = nombre.Trim();
             List<Opciones> opciones = new List<Opciones>();
             // Cursos

             if (Convert.ToBoolean(menuLista))
             {
                 Opciones opc = new Opciones();
                 opc.Opcion = "m020000";
                 opc.Permisos.Acceso = 1;
                 Opciones opciH = new Opciones();
                 if (Convert.ToBoolean(CreadorListaA))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m020100";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(CreadorListaW)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);

                 }
                 if (Convert.ToBoolean(swEnProcesoA))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m020200";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(swEnProcesoW)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }
                 if (Convert.ToBoolean(swConsultaDistribucionA))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m020300";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(swConsultaDistribucionW)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }
                 if (Convert.ToBoolean(swResultadosA))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m020500";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(swResultadosW)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }

                 if (Convert.ToBoolean(swRespuestasA))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m020600";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(swRespuestasW)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }

                 if (Convert.ToBoolean(swContestarA))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m020400";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(swContestarW)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }

                 if (Convert.ToBoolean(swCategoriasA))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m020700";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(swCategoriasW)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }

                 if (Convert.ToBoolean(swSubcategoriasA))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m020800";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(swSubcategoriasW)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }

                 opciones.Add(opc);
             }
             else
             {
                 Opciones opci = new Opciones();
                 opci.Opcion = "m020000";
                 opci.Permisos.Acceso = 0;
                 opciones.Add(opci);
             }
             //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
             if (Convert.ToBoolean(menuReporte))
             {
                 Opciones opc = new Opciones();
                 opc.Opcion = "m010000";
                 opc.Permisos.Acceso = 1;
                 Opciones opciH = new Opciones();
                 if (Convert.ToBoolean(R1A))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m010100";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(R1W)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);

                 }
                 if (Convert.ToBoolean(R2A))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m010200";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(R2W)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }
                 if (Convert.ToBoolean(R3A))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m010300";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(R3W)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }
                 if (Convert.ToBoolean(R4A))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m010400";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(R4W)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }

                 if (Convert.ToBoolean(R5A))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m010500";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(R5W)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }

                 if (Convert.ToBoolean(R6A))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m010600";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(R6W)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }



                 opciones.Add(opc);
             }
             else
             {
                 Opciones opci = new Opciones();
                 opci.Opcion = "m010000";
                 opci.Permisos.Acceso = 0;
                 opciones.Add(opci);
             }




             //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
             if (Convert.ToBoolean(menuAjuste))
             {
                 Opciones opc = new Opciones();
                 opc.Opcion = "m000000";
                 opc.Permisos.Acceso = 1;
                 Opciones opciH = new Opciones();
                 if (Convert.ToBoolean(swUsuariosABCA))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m000100";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(swUsuariosABCW)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);

                 }
                 if (Convert.ToBoolean(swDepartamentosA))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m000200";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(swDepartamentosW)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }
                 if (Convert.ToBoolean(swPuestosA))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m000300";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(swPuestosW)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }
                 if (Convert.ToBoolean(swRolesPermisosA))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m000400";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(swRolesPermisosW)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }

                 if (Convert.ToBoolean(swCorreoElectronicoA))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m000500";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(swCorreoElectronicoW)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }

                 if (Convert.ToBoolean(swSucursalesA))
                 {
                     opciH = new Opciones();
                     opciH.Opcion = "m000600";
                     opciH.Permisos.Acceso = 1;
                     if (Convert.ToBoolean(swSucursalesW)) opciH.Permisos.Escritura = 1;
                     opc.Hijos.Add(opciH);
                 }



                 opciones.Add(opc);
             }
             else
             {
                 Opciones opci = new Opciones();
                 opci.Opcion = "m000000";
                 opci.Permisos.Acceso = 0;
                 opciones.Add(opci);
             }



             item.Permisos = JsonConvert.SerializeObject(opciones);

             var json = JsonConvert.SerializeObject(item, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
             string url = string.Format("{0}Guardar?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
             var clientS = new RestClient(url);
             var request = new RestRequest();
             request.Method = Method.Put;
             request.RequestFormat = DataFormat.Json;
             request.AddJsonBody(json);
             RestResponse response = await clientS.ExecuteAsync(request);
             return Json(new { d = JsonConvert.DeserializeObject<string>(response.Content) });
         }*/
        //, string mnlistaa, string mnlistaw, string mnlistaabcw, string mncategorizacionw, string mnrecoleccionesa, string mnrecoleccionesw, string mnconlistasw, string mnconlistas, string mnajustesa, string mnajustesw, string mnusuariosw
        public async Task<ActionResult> GuardaPerm(string llavero, string nombrer, string idEmpresa, string empresa, string correo, string cadena, string mnlista, string mnlistaabc, string mncrealistaa, string mncrealistaw, string mnprocesoa, string mnprocesow, string mnmislistasa, string mnmislistasw, string mncategorizacion, string mncategoria, string mncategoriaw, string mnsubcategoria, string mnsubcategoriaw, string mnrecolecciones, string mnnuevar, string mnnuevarw, string mninspeccioncampo, string mninspeccioncampow, string mnnuevaroff, string mnnuevaroffw, string mnresultados, string mnresultadosw, string mnrespuestas, string mnrespuestasw, string mnreportes, string mnestrella, string mnestrellaw, string mncontraido, string mncontraidow, string mnccat, string mnccatw, string mnlistado, string mnlistadow, string mnajustes, string mnusuarios, string mnabcus, string mnabcusw, string mndepto, string mndeptow, string mnpuesto, string mnpuestow, string mnroles, string mnrolesw, string mnsucursales, string mnsucursalesw, string mnrazones, string mnrazonesw, string mnregiones, string mnregionesw)
        {

            respRoles item = new respRoles();
            item.id = Guid.Parse(llavero);
            item.idEmpresa = Guid.Parse(idEmpresa);
            item.NombreRol = nombrer.Trim();
            List<Opciones> opciones = new List<Opciones>();
            // Listas
            if (Convert.ToBoolean(mnlista))
            {
                Opciones opc = new Opciones
                {
                    Opcion = "01000000",
                    Permisos = new Permisos { Acceso = 1 }
                };
                Opciones opciH = new Opciones();

                if (Convert.ToBoolean(mnlistaabc))
                {
                    opciH = new Opciones
                    {
                        Opcion = "01001000",
                        Permisos = new Permisos { Acceso = 1 }
                    };

                    if (Convert.ToBoolean(mncrealistaa))
                    {
                        Opciones opciN = new Opciones
                        {
                            Opcion = "01001001",
                            Permisos = new Permisos
                            {
                                Acceso = 1,
                                Escritura = Convert.ToBoolean(mncrealistaw) ? 1 : 0
                            }
                        };
                        opciH.Hijos.Add(opciN);
                    }

                    if (Convert.ToBoolean(mnprocesoa))
                    {
                        Opciones opciN = new Opciones
                        {
                            Opcion = "01001002",
                            Permisos = new Permisos
                            {
                                Acceso = 1,
                                Escritura = Convert.ToBoolean(mnprocesow) ? 1 : 0
                            }
                        };
                        opciH.Hijos.Add(opciN);
                    }

                    if (Convert.ToBoolean(mnmislistasa))
                    {
                        Opciones opciN = new Opciones
                        {
                            Opcion = "01001003",
                            Permisos = new Permisos
                            {
                                Acceso = 1,
                                Escritura = Convert.ToBoolean(mnmislistasw) ? 1 : 0
                            }
                        };
                        opciH.Hijos.Add(opciN);
                    }

                    opc.Hijos.Add(opciH);
                }
                else
                {
                    opciH = new Opciones
                    {
                        Opcion = "01001000",
                        Permisos = new Permisos { Acceso = 0 }
                    };
                    opc.Hijos.Add(opciH);
                }

                if (Convert.ToBoolean(mncategorizacion))
                {
                    opciH = new Opciones
                    {
                        Opcion = "01002000",
                        Permisos = new Permisos { Acceso = 1 }
                    };

                    if (Convert.ToBoolean(mncategoria))
                    {
                        Opciones opciN = new Opciones
                        {
                            Opcion = "01002001",
                            Permisos = new Permisos
                            {
                                Acceso = 1,
                                Escritura = Convert.ToBoolean(mncategoriaw) ? 1 : 0
                            }
                        };
                        opciH.Hijos.Add(opciN);
                    }

                    if (Convert.ToBoolean(mnsubcategoria))
                    {
                        Opciones opciN = new Opciones
                        {
                            Opcion = "01002002",
                            Permisos = new Permisos
                            {
                                Acceso = 1,
                                Escritura = Convert.ToBoolean(mnsubcategoriaw) ? 1 : 0
                            }
                        };
                        opciH.Hijos.Add(opciN);
                    }

                    opc.Hijos.Add(opciH);
                }
                else
                {
                    opciH = new Opciones
                    {
                        Opcion = "01002000",
                        Permisos = new Permisos { Acceso = 0 }
                    };
                    opc.Hijos.Add(opciH);
                }

                opciones.Add(opc);
            }
            else
            {
                Opciones opci = new Opciones
                {
                    Opcion = "01000000",
                    Permisos = new Permisos { Acceso = 0 }
                };
                opciones.Add(opci);
            }

            if (Convert.ToBoolean(mnrecolecciones))
            {
                Opciones opc = new Opciones
                {
                    Opcion = "02000000",
                    Permisos = new Permisos { Acceso = 1 }
                };

                // 02001000
                if (Convert.ToBoolean(mnnuevar))
                {
                    Opciones opciH = new Opciones
                    {
                        Opcion = "02001000",
                        Permisos = new Permisos
                        {
                            Acceso = 1,
                            Escritura = Convert.ToBoolean(mnnuevarw) ? 1 : 0
                        }
                    };
                    opc.Hijos.Add(opciH);
                }

                if (Convert.ToBoolean(mninspeccioncampo))
                {
                    Opciones opciH = new Opciones
                    {
                        Opcion = "02005000",
                        Permisos = new Permisos
                        {
                            Acceso = 1,
                            Escritura = Convert.ToBoolean(mninspeccioncampow) ? 1 : 0
                        }
                    };
                    opc.Hijos.Add(opciH);
                }

                // 02002000 (offline)
              /*  if (Convert.ToBoolean(mnnuevaroff))
                {
                    Opciones opciH = new Opciones
                    {
                        Opcion = "02002000",
                        Permisos = new Permisos
                        {
                            Acceso = 1,
                            Escritura = Convert.ToBoolean(mnnuevaroffw) ? 1 : 0
                        }
                    };
                    opc.Hijos.Add(opciH);
                }*/

                // 02003000
                if (Convert.ToBoolean(mnresultados))
                {
                    Opciones opciH = new Opciones
                    {
                        Opcion = "02003000",
                        Permisos = new Permisos
                        {
                            Acceso = 1,
                            Escritura = Convert.ToBoolean(mnresultadosw) ? 1 : 0
                        }
                    };
                    opc.Hijos.Add(opciH);
                }

                // 02004000
                if (Convert.ToBoolean(mnrespuestas))
                {
                    Opciones opciH = new Opciones
                    {
                        Opcion = "02004000",
                        Permisos = new Permisos
                        {
                            Acceso = 1,
                            Escritura = Convert.ToBoolean(mnrespuestasw) ? 1 : 0
                        }
                    };
                    opc.Hijos.Add(opciH);
                }
                            

                opciones.Add(opc);
            }
            else
            {
                Opciones opci = new Opciones
                {
                    Opcion = "02000000",
                    Permisos = new Permisos { Acceso = 0 }
                };
                opciones.Add(opci);
            }


            // Reportes
            if (Convert.ToBoolean(mnreportes))
            {
                Opciones opc = new Opciones
                {
                    Opcion = "03000000",
                    Permisos = new Permisos { Acceso = 1 }
                };

                if (Convert.ToBoolean(mnestrella))
                {
                    Opciones opciH = new Opciones
                    {
                        Opcion = "03001000",
                        Permisos = new Permisos { Acceso = 1 }
                    };

                    if (Convert.ToBoolean(mncontraido))
                    {
                        Opciones opciN = new Opciones
                        {
                            Opcion = "03001001",
                            Permisos = new Permisos
                            {
                                Acceso = 1,
                                Escritura = Convert.ToBoolean(mncontraidow) ? 1 : 0
                            }
                        };
                        opciH.Hijos.Add(opciN);
                    }

                    if (Convert.ToBoolean(mnccat))
                    {
                        Opciones opciN = new Opciones
                        {
                            Opcion = "03001002",
                            Permisos = new Permisos
                            {
                                Acceso = 1,
                                Escritura = Convert.ToBoolean(mnccatw) ? 1 : 0
                            }
                        };
                        opciH.Hijos.Add(opciN);
                    }

                    opc.Hijos.Add(opciH);
                }

                if (Convert.ToBoolean(mnlistado))
                {
                    Opciones opciH = new Opciones
                    {
                        Opcion = "03002000",
                        Permisos = new Permisos
                        {
                            Acceso = 1,
                            Escritura = Convert.ToBoolean(mnlistadow) ? 1 : 0
                        }
                    };
                    opc.Hijos.Add(opciH);
                }

                opciones.Add(opc);
            }
            else
            {
                Opciones opci = new Opciones
                {
                    Opcion = "03000000",
                    Permisos = new Permisos { Acceso = 0 }
                };
                opciones.Add(opci);
            }

            // Ajustes
            if (Convert.ToBoolean(mnajustes))
            {
                // Opción principal para ajustes
                Opciones opc = new Opciones
                {
                    Opcion = "04000000",
                    Permisos = new Permisos { Acceso = 1 }
                };

                // Opciones de usuarios
                if (Convert.ToBoolean(mnusuarios))
                {
                    Opciones opciH = new Opciones
                    {
                        Opcion = "04001000",
                        Permisos = new Permisos { Acceso = 1 }
                    };

                    // Agregar subopciones para usuarios
                    if (Convert.ToBoolean(mnabcus))
                    {
                        Opciones opciN = new Opciones
                        {
                            Opcion = "04001001",
                            Permisos = new Permisos
                            {
                                Acceso = 1,
                                Escritura = Convert.ToBoolean(mnabcusw) ? 1 : 0
                            }
                        };
                        opciH.Hijos.Add(opciN);
                    }

                    if (Convert.ToBoolean(mndepto))
                    {
                        Opciones opciN = new Opciones
                        {
                            Opcion = "04001002",
                            Permisos = new Permisos
                            {
                                Acceso = 1,
                                Escritura = Convert.ToBoolean(mndeptow) ? 1 : 0
                            }
                        };
                        opciH.Hijos.Add(opciN);
                    }

                    if (Convert.ToBoolean(mnpuesto))
                    {
                        Opciones opciN = new Opciones
                        {
                            Opcion = "04001003",
                            Permisos = new Permisos
                            {
                                Acceso = 1,
                                Escritura = Convert.ToBoolean(mnpuestow) ? 1 : 0
                            }
                        };
                        opciH.Hijos.Add(opciN);
                    }

                    // Agregar la opción de usuarios al padre
                    opc.Hijos.Add(opciH);
                }

                // Opciones de roles
                if (Convert.ToBoolean(mnroles))
                {
                    Opciones opciH = new Opciones
                    {
                        Opcion = "04002000",
                        Permisos = new Permisos
                        {
                            Acceso = 1,
                            Escritura = Convert.ToBoolean(mnrolesw) ? 1 : 0
                        }
                    };
                    opc.Hijos.Add(opciH);
                }

                // Opciones de sucursales
                if (Convert.ToBoolean(mnsucursales))
                {
                    Opciones opciH = new Opciones
                    {
                        Opcion = "04003000",
                        Permisos = new Permisos
                        {
                            Acceso = 1,
                            Escritura = Convert.ToBoolean(mnsucursalesw) ? 1 : 0
                        }
                    };
                    opc.Hijos.Add(opciH);
                }

                // Opciones de razones sociales
                if (Convert.ToBoolean(mnrazones))
                {
                    Opciones opciH = new Opciones
                    {
                        Opcion = "04004000",
                        Permisos = new Permisos
                        {
                            Acceso = 1,
                            Escritura = Convert.ToBoolean(mnrazonesw) ? 1 : 0
                        }
                    };
                    opc.Hijos.Add(opciH);
                }

                // Opciones de regiones
                if (Convert.ToBoolean(mnregiones))
                {
                    Opciones opciH = new Opciones
                    {
                        Opcion = "04005000",
                        Permisos = new Permisos
                        {
                            Acceso = 1,
                            Escritura = Convert.ToBoolean(mnregionesw) ? 1 : 0
                        }
                    };
                    opc.Hijos.Add(opciH);
                }

                // Agregar la opción principal de ajustes a la lista
                opciones.Add(opc);
            }
            else
            {
                // Opción principal con acceso deshabilitado
                Opciones opci = new Opciones
                {
                    Opcion = "04000000",
                    Permisos = new Permisos { Acceso = 0 }
                };
                opciones.Add(opci);
            }
            item.Permisos = JsonConvert.SerializeObject(opciones);
            //
            var json = JsonConvert.SerializeObject(item, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            string url = string.Format("{0}Guardar?empresa={1}&cadena={2}", Utilerias.UrlBase, empresa, cadena);
            var clientS = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Put;
            request.RequestFormat = DataFormat.Json;
            request.AddJsonBody(json);
            RestResponse response = await clientS.ExecuteAsync(request);
            return Json(new { d = JsonConvert.DeserializeObject<string>(response.Content) });
        }

        public async Task<IActionResult> GetRol(string cua, string idEmpresa, string cadena, string empresa)
        {

            string url = string.Format("{0}GetRoles?idEmpresa={1}&id={2}&empresa={3}&cadena={4}", Utilerias.UrlBase, idEmpresa, cua, empresa, cadena);
            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respRoles> roles = JsonConvert.DeserializeObject<List<respRoles>>(response.Content);
            List<DataPair2> result = new List<DataPair2>();
            foreach (respRoles role in roles)
            {
                if (!string.IsNullOrEmpty(role.Permisos))
                {
                    List<Opciones> lstPerm = JsonConvert.DeserializeObject<List<Opciones>>(role.Permisos);
                    foreach (Opciones permiso in lstPerm)
                    {
                        switch (permiso.Opcion)
                        {
                            case "01000000":
                                result.Add(new DataPair2()
                                {
                                    Nombre = "#swMenuListas",
                                    Valor = permiso.Permisos.Acceso == 1 ? "true" : "false"
                                });
                                if (permiso.Permisos.Acceso == 1)
                                {
                                    foreach (var hijo in permiso.Hijos)
                                    {
                                        switch (hijo.Opcion)
                                        {
                                            case "01001000":
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw01001000A",
                                                    Valor = hijo.Permisos.Acceso == 1 ? "true" : "false"
                                                });
                                                if (hijo.Permisos.Acceso == 1)
                                                {
                                                    foreach (var nieto in hijo.Hijos)
                                                    {
                                                        switch (nieto.Opcion)
                                                        {
                                                            case "01001001":
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw01001001A",
                                                                    Valor = nieto.Permisos.Acceso == 1 ? "true" : "false"
                                                                });
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw01001001W",
                                                                    Valor = nieto.Permisos.Escritura == 1 ? "true" : "false"
                                                                });
                                                                break;
                                                            case "01001002":
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw01001002A",
                                                                    Valor = nieto.Permisos.Acceso == 1 ? "true" : "false"
                                                                });
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw01001002W",
                                                                    Valor = nieto.Permisos.Escritura == 1 ? "true" : "false"
                                                                });
                                                                break;
                                                            case "01001003":
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw01001003A",
                                                                    Valor = nieto.Permisos.Acceso == 1 ? "true" : "false"
                                                                });
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw01001003W",
                                                                    Valor = nieto.Permisos.Escritura == 1 ? "true" : "false"
                                                                });
                                                                break;
                                                        }
                                                    }
                                                }
                                                break;
                                            case "01002000":
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw01002000A",
                                                    Valor = hijo.Permisos.Acceso == 1 ? "true" : "false"
                                                });
                                                if (hijo.Permisos.Acceso == 1)
                                                {
                                                    foreach (var nieto in hijo.Hijos)
                                                    {
                                                        switch (nieto.Opcion)
                                                        {
                                                            case "01002001":
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw01002001A",
                                                                    Valor = nieto.Permisos.Acceso == 1 ? "true" : "false"
                                                                });
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw01002001W",
                                                                    Valor = nieto.Permisos.Escritura == 1 ? "true" : "false"
                                                                });
                                                                break;
                                                            case "01002002":
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw01002002A",
                                                                    Valor = nieto.Permisos.Acceso == 1 ? "true" : "false"
                                                                });
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw01002002W",
                                                                    Valor = nieto.Permisos.Escritura == 1 ? "true" : "false"
                                                                });
                                                                break;

                                                        }
                                                    }
                                                }
                                                break;
                                        }
                                    }
                                }
                                break;
                            case "02000000":
                                result.Add(new DataPair2()
                                {
                                    Nombre = "#swMenuRecolecciones",
                                    Valor = permiso.Permisos.Acceso == 1 ? "true" : "false"
                                });
                                if (permiso.Permisos.Acceso == 1)
                                {
                                    foreach (var hijo in permiso.Hijos)
                                    {
                                        switch (hijo.Opcion)
                                        {
                                            case "02001000":
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw02001000A",
                                                    Valor = hijo.Permisos.Acceso == 1 ? "true" : "false"
                                                });
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw02001000W",
                                                    Valor = hijo.Permisos.Escritura == 1 ? "true" : "false"
                                                });
                                                break;
                                            case "02005000":
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw02005000A",
                                                    Valor = hijo.Permisos.Acceso == 1 ? "true" : "false"
                                                });
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw02005000W",
                                                    Valor = hijo.Permisos.Escritura == 1 ? "true" : "false"
                                                });
                                                break;
                                           /* case "02002000":
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw02002000A",
                                                    Valor = hijo.Permisos.Acceso == 1 ? "true" : "false"
                                                });
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw02002000W",
                                                    Valor = hijo.Permisos.Escritura == 1 ? "true" : "false"
                                                });
                                                break;*/
                                            case "02003000":
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw02003000A",
                                                    Valor = hijo.Permisos.Acceso == 1 ? "true" : "false"
                                                });
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw02003000W",
                                                    Valor = hijo.Permisos.Escritura == 1 ? "true" : "false"
                                                });
                                                break;
                                            case "02004000":
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw02004000A",
                                                    Valor = hijo.Permisos.Acceso == 1 ? "true" : "false"
                                                });
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw02004000W",
                                                    Valor = hijo.Permisos.Escritura == 1 ? "true" : "false"
                                                });
                                                break;
                                        }
                                    }
                                }
                                break;
                            case "03000000":
                                result.Add(new DataPair2()
                                {
                                    Nombre = "#swMenuReportes",
                                    Valor = permiso.Permisos.Acceso == 1 ? "true" : "false"
                                });
                                if (permiso.Permisos.Acceso == 1)
                                {
                                    foreach (var hijo in permiso.Hijos)
                                    {
                                        switch (hijo.Opcion)
                                        {
                                            case "03001000":
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw03001000A",
                                                    Valor = hijo.Permisos.Acceso == 1 ? "true" : "false"
                                                });
                                                if (hijo.Permisos.Acceso == 1)
                                                {
                                                    foreach (var nieto in hijo.Hijos)
                                                    {
                                                        switch (nieto.Opcion)
                                                        {
                                                            case "03001001":
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw03001001A",
                                                                    Valor = nieto.Permisos.Acceso == 1 ? "true" : "false"
                                                                });
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw03001001W",
                                                                    Valor = nieto.Permisos.Escritura == 1 ? "true" : "false"
                                                                });
                                                                break;
                                                            case "03001002":
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw03001002A",
                                                                    Valor = nieto.Permisos.Acceso == 1 ? "true" : "false"
                                                                });
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw03001002W",
                                                                    Valor = nieto.Permisos.Escritura == 1 ? "true" : "false"
                                                                });
                                                                break;
                                                        }
                                                    }
                                                }
                                                break;
                                            case "03002000":
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw03002000A",
                                                    Valor = hijo.Permisos.Acceso == 1 ? "true" : "false"
                                                });
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw03002000W",
                                                    Valor = hijo.Permisos.Escritura == 1 ? "true" : "false"
                                                });
                                                break;
                                        }
                                    }
                                }
                                break;
                            case "04000000":
                                result.Add(new DataPair2()
                                {
                                    Nombre = "#swMenuAjustes",
                                    Valor = permiso.Permisos.Acceso == 1 ? "true" : "false"
                                });
                                if (permiso.Permisos.Acceso == 1)
                                {
                                    foreach (var hijo in permiso.Hijos)
                                    {
                                        switch (hijo.Opcion)
                                        {
                                            case "04001000":
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw04001000A",
                                                    Valor = hijo.Permisos.Acceso == 1 ? "true" : "false"
                                                });
                                                if (hijo.Permisos.Acceso == 1)
                                                {
                                                    foreach (var nieto in hijo.Hijos)
                                                    {
                                                        switch (nieto.Opcion)
                                                        {
                                                            case "04001001":
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw04001001A",
                                                                    Valor = nieto.Permisos.Acceso == 1 ? "true" : "false"
                                                                });
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw04001001W",
                                                                    Valor = nieto.Permisos.Escritura == 1 ? "true" : "false"
                                                                });
                                                                break;
                                                            case "04001002":
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw04001002A",
                                                                    Valor = nieto.Permisos.Acceso == 1 ? "true" : "false"
                                                                });
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw04001002W",
                                                                    Valor = nieto.Permisos.Escritura == 1 ? "true" : "false"
                                                                });
                                                                break;
                                                            case "04001003":
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw04001003A",
                                                                    Valor = nieto.Permisos.Acceso == 1 ? "true" : "false"
                                                                });
                                                                result.Add(new DataPair2()
                                                                {
                                                                    Nombre = "#sw04001003W",
                                                                    Valor = nieto.Permisos.Escritura == 1 ? "true" : "false"
                                                                });
                                                                break;
                                                        }
                                                    }
                                                }
                                                break;
                                            case "04002000":
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw04002000A",
                                                    Valor = hijo.Permisos.Acceso == 1 ? "true" : "false"
                                                });
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw04002000W",
                                                    Valor = hijo.Permisos.Escritura == 1 ? "true" : "false"
                                                });
                                                break;
                                            case "04003000":
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw04003000A",
                                                    Valor = hijo.Permisos.Acceso == 1 ? "true" : "false"
                                                });
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw04003000W",
                                                    Valor = hijo.Permisos.Escritura == 1 ? "true" : "false"
                                                });
                                                break;
                                            case "04004000":
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw04004000A",
                                                    Valor = hijo.Permisos.Acceso == 1 ? "true" : "false"
                                                });
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw04004000W",
                                                    Valor = hijo.Permisos.Escritura == 1 ? "true" : "false"
                                                });
                                                break;
                                            case "04005000":
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw04005000A",
                                                    Valor = hijo.Permisos.Acceso == 1 ? "true" : "false"
                                                });
                                                result.Add(new DataPair2()
                                                {
                                                    Nombre = "#sw04005000W",
                                                    Valor = hijo.Permisos.Escritura == 1 ? "true" : "false"
                                                });
                                                break;
                                        }
                                    }
                                }
                                break;
                        }

                    }
                }
            }
            return Json(new { result });
        }

    }
}
