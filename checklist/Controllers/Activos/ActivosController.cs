using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using checklist.Clases;
using checklist.Extensions;
using checklist.Models.Activos;
using checklist.Models.Roles;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace checklist.Controllers.Activos
{
    public class ActivosController : Controller
    {
        private const string ProxyEmpresaIdHeader = "X-Activos-Proxy-EmpresaId";
        private const string ProxyEmpresaKeyHeader = "X-Activos-Proxy-Empresa";
        private const string ProxyUsuarioIdHeader = "X-Activos-Proxy-UsuarioId";
        private const string ProxyTimestampHeader = "X-Activos-Proxy-Timestamp";
        private const string ProxySignatureHeader = "X-Activos-Proxy-Signature";

        private readonly IHttpClientFactory _clientFactory;
        private static readonly JsonSerializerSettings CamelCaseJson = new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            NullValueHandling = NullValueHandling.Ignore
        };

        public ActivosController(IHttpClientFactory clientFactory)
        {
            _clientFactory = clientFactory;
        }

        public async Task<IActionResult> Index()
        {
            if (!await CanOpenActivosAsync())
            {
                return RedirectToAction("Index", "Home");
            }

            return View();
        }

        public async Task<IActionResult> Tipos()
        {
            if (!await HasCatalogosAccessAsync())
            {
                return RedirectToAction(nameof(Index));
            }

            return View();
        }

        public async Task<IActionResult> Marcas()
        {
            if (!await HasCatalogosAccessAsync())
            {
                return RedirectToAction(nameof(Index));
            }

            return View();
        }

        public async Task<IActionResult> Proveedores()
        {
            if (!await HasCatalogosAccessAsync())
            {
                return RedirectToAction(nameof(Index));
            }

            return View();
        }

        public async Task<IActionResult> EstadosOperativos()
        {
            if (!await HasCatalogosAccessAsync())
            {
                return RedirectToAction(nameof(Index));
            }

            return View();
        }

        public async Task<IActionResult> Inicializa()
        {
            bool isSuperAdmin = await IsSuperAdminSessionAsync();
            return Json(new
            {
                d = "Ok",
                permisos = new
                {
                    consulta = isSuperAdmin || await HasPermAsync("03501000", requireWrite: false),
                    crear = isSuperAdmin || await HasPermAsync("03502000", requireWrite: true),
                    editar = isSuperAdmin || await HasPermAsync("03503000", requireWrite: true),
                    baja = isSuperAdmin || await HasPermAsync("03504000", requireWrite: true),
                    exportar = isSuperAdmin || await HasPermAsync("03505000", requireWrite: true),
                    catalogos = isSuperAdmin || await HasPermAsync("03506000", requireWrite: true)
                }
            });
        }

        public async Task<IActionResult> GetListado(
            string busqueda = "",
            string idTipoActivo = "",
            string idEstadoOperativo = "",
            string idSucursal = "",
            string idMarca = "",
            string idProveedor = "",
            string estatus = "")
        {
            if (!await HasActivosAccessAsync("03501000", requireWrite: false))
            {
                return Content(@"{""items"":[]}", "application/json");
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            StringBuilder url = new StringBuilder($"{Utilerias.UrlBase}api/Activos/ObtenerActivos?idEmpresa={idEmpresa}&cadena={cadena}");

            AppendString(url, "busqueda", busqueda);
            AppendGuid(url, "idTipoActivo", idTipoActivo);
            AppendGuid(url, "idEstadoOperativo", idEstadoOperativo);
            AppendGuid(url, "idSucursal", idSucursal);
            AppendGuid(url, "idMarca", idMarca);
            AppendGuid(url, "idProveedor", idProveedor);
            AppendString(url, "estatus", estatus);

            List<ActivoListadoDto> activos = await ExecuteGetAsync<List<ActivoListadoDto>>(url.ToString()) ?? new List<ActivoListadoDto>();
            return Content(JsonConvert.SerializeObject(new { items = activos }, CamelCaseJson), "application/json");
        }

        public async Task<IActionResult> GetActivo(string idActivo)
        {
            if (!await HasActivosAccessAsync("03501000", requireWrite: false))
            {
                return Json(new { d = "" });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Activos/ObtenerActivo?idEmpresa={idEmpresa}&idActivo={idActivo}&cadena={cadena}";
            ActivoDetalleDto? activo = await ExecuteGetAsync<ActivoDetalleDto>(url);
            return Json(new { d = activo });
        }

        [HttpPost]
        public async Task<IActionResult> SubirMultimediaTemporal(IFormFile archivo, string tipoMultimedia, string operacionCarga)
        {
            if (!await HasActivosAccessAsync("03502000", requireWrite: true) && !await HasActivosAccessAsync("03503000", requireWrite: true))
            {
                return StatusCode((int)HttpStatusCode.Forbidden, new { mensaje = "No tienes permiso para cargar evidencia en activos." });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string empresa = ResolveEmpresa();
            string url = $"{Utilerias.UrlBase}api/Activos/SubirMultimediaTemporal?idEmpresa={idEmpresa}&cadena={cadena}&empresa={Uri.EscapeDataString(empresa)}";

            using MultipartFormDataContent content = new MultipartFormDataContent();
            content.Add(new StringContent(tipoMultimedia ?? string.Empty, Encoding.UTF8), "tipoMultimedia");
            content.Add(new StringContent(operacionCarga ?? string.Empty, Encoding.UTF8), "operacionCarga");

            StreamContent fileContent = new StreamContent(archivo.OpenReadStream());
            fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse(string.IsNullOrWhiteSpace(archivo.ContentType) ? "application/octet-stream" : archivo.ContentType);
            content.Add(fileContent, "archivo", archivo.FileName ?? "archivo.bin");

            (HttpStatusCode statusCode, ActivoMultimediaTemporalResponse? respuesta) = await ExecuteMultipartAsync<ActivoMultimediaTemporalResponse>(url, content);
            return StatusCode((int)statusCode, new
            {
                mensaje = respuesta?.Mensaje ?? "No fue posible cargar la evidencia.",
                archivo = respuesta?.Archivo
            });
        }

        [HttpPost]
        public async Task<IActionResult> LimpiarMultimediaTemporal([FromBody] JsonElement parametros)
        {
            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Activos/LimpiarMultimediaTemporal?idEmpresa={idEmpresa}&cadena={cadena}";

            var payload = new
            {
                tokens = ReadStringArray(parametros, "tokens")
            };

            ActivoOperacionResponse? respuesta = await ExecuteJsonAsync<ActivoOperacionResponse>(HttpMethod.Post, url, payload);
            return Json(new { d = respuesta?.Mensaje ?? "No fue posible liberar la multimedia temporal." });
        }

        public async Task<IActionResult> GuardarActivo([FromBody] JsonElement parametros)
        {
            string id = ReadString(parametros, "id");
            bool esNuevo = string.IsNullOrWhiteSpace(id);
            if (!await HasActivosAccessAsync(esNuevo ? "03502000" : "03503000", requireWrite: true))
            {
                return Json(new { d = "No tienes permiso para guardar activos." });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string empresa = ResolveEmpresa();
            string url = $"{Utilerias.UrlBase}api/Activos/GuardarActivo?idEmpresa={idEmpresa}&cadena={cadena}&empresa={Uri.EscapeDataString(empresa)}";

            var payload = new
            {
                id = ParseNullableGuid(id),
                codigo = ReadString(parametros, "codigo"),
                nombre = ReadString(parametros, "nombre"),
                idTipoActivo = ParseNullableGuid(ReadString(parametros, "idTipoActivo")),
                idEstadoOperativo = ParseNullableGuid(ReadString(parametros, "idEstadoOperativo")),
                idSucursal = ParseNullableGuid(ReadString(parametros, "idSucursal")),
                idMarca = ParseNullableGuid(ReadString(parametros, "idMarca")),
                idProveedor = ParseNullableGuid(ReadString(parametros, "idProveedor")),
                tag = ReadString(parametros, "tag"),
                numeroSerie = ReadString(parametros, "numeroSerie"),
                descripcion = ReadString(parametros, "descripcion"),
                multimedia = ReadMultimedia(parametros)
            };

            ActivoOperacionResponse? respuesta = await ExecuteJsonAsync<ActivoOperacionResponse>(HttpMethod.Post, url, payload);
            return Json(new { d = respuesta?.Mensaje ?? "No fue posible guardar el activo." });
        }

        public async Task<IActionResult> BajaActivo([FromBody] JsonElement parametros)
        {
            if (!await HasActivosAccessAsync("03504000", requireWrite: true))
            {
                return Json(new { d = "No tienes permiso para dar de baja activos." });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string idActivo = ReadString(parametros, "idActivo");
            string url = $"{Utilerias.UrlBase}api/Activos/BajaActivo?idEmpresa={idEmpresa}&idActivo={idActivo}&cadena={cadena}";

            ActivoOperacionResponse? respuesta = await ExecuteJsonAsync<ActivoOperacionResponse>(HttpMethod.Put, url, new { });
            return Json(new { d = respuesta?.Mensaje ?? "No fue posible dar de baja el activo." });
        }

        public async Task<IActionResult> GetTiposActivos(string busqueda = "", string estatus = "")
        {
            if (!await HasCatalogosAccessAsync())
            {
                return Content(@"{""items"":[]}", "application/json");
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Activos/ObtenerTiposActivos?idEmpresa={idEmpresa}&cadena={cadena}&busqueda={Uri.EscapeDataString(busqueda ?? string.Empty)}&estatus={Uri.EscapeDataString(estatus ?? string.Empty)}";
            List<TipoActivoDto> tipos = await ExecuteGetAsync<List<TipoActivoDto>>(url) ?? new List<TipoActivoDto>();
            return Content(JsonConvert.SerializeObject(new { items = tipos }, CamelCaseJson), "application/json");
        }

        public async Task<IActionResult> GetTipoActivo(string idTipoActivo)
        {
            if (!await HasActivosAccessAsync("03506000", requireWrite: true))
            {
                return Json(new { d = "" });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Activos/ObtenerTipoActivo?idEmpresa={idEmpresa}&idTipoActivo={idTipoActivo}&cadena={cadena}";
            TipoActivoDto? tipo = await ExecuteGetAsync<TipoActivoDto>(url);
            return Json(new { d = tipo });
        }

        public async Task<IActionResult> GetMarcasActivos(string busqueda = "", string estatus = "")
        {
            if (!await HasCatalogosAccessAsync())
            {
                return Content(@"{""items"":[]}", "application/json");
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Activos/ObtenerMarcasActivos?idEmpresa={idEmpresa}&cadena={cadena}&busqueda={Uri.EscapeDataString(busqueda ?? string.Empty)}&estatus={Uri.EscapeDataString(estatus ?? string.Empty)}";
            List<MarcaActivoDto> marcas = await ExecuteGetAsync<List<MarcaActivoDto>>(url) ?? new List<MarcaActivoDto>();
            return Content(JsonConvert.SerializeObject(new { items = marcas }, CamelCaseJson), "application/json");
        }

        public async Task<IActionResult> GetMarcaActivo(string idMarca)
        {
            if (!await HasActivosAccessAsync("03506000", requireWrite: true))
            {
                return Json(new { d = "" });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Activos/ObtenerMarcaActivo?idEmpresa={idEmpresa}&idMarca={idMarca}&cadena={cadena}";
            MarcaActivoDto? marca = await ExecuteGetAsync<MarcaActivoDto>(url);
            return Json(new { d = marca });
        }

        public async Task<IActionResult> GetProveedoresActivos(string busqueda = "", string estatus = "")
        {
            if (!await HasCatalogosAccessAsync())
            {
                return Content(@"{""items"":[]}", "application/json");
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Activos/ObtenerProveedoresActivos?idEmpresa={idEmpresa}&cadena={cadena}&busqueda={Uri.EscapeDataString(busqueda ?? string.Empty)}&estatus={Uri.EscapeDataString(estatus ?? string.Empty)}";
            List<ProveedorActivoDto> proveedores = await ExecuteGetAsync<List<ProveedorActivoDto>>(url) ?? new List<ProveedorActivoDto>();
            return Content(JsonConvert.SerializeObject(new { items = proveedores }, CamelCaseJson), "application/json");
        }

        public async Task<IActionResult> GetProveedorActivo(string idProveedor)
        {
            if (!await HasActivosAccessAsync("03506000", requireWrite: true))
            {
                return Json(new { d = "" });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Activos/ObtenerProveedorActivo?idEmpresa={idEmpresa}&idProveedor={idProveedor}&cadena={cadena}";
            ProveedorActivoDto? proveedor = await ExecuteGetAsync<ProveedorActivoDto>(url);
            return Json(new { d = proveedor });
        }

        public async Task<IActionResult> GetEstadosOperativos(string busqueda = "", string estatus = "")
        {
            if (!await HasCatalogosAccessAsync())
            {
                return Content(@"{""items"":[]}", "application/json");
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Activos/ObtenerEstadosOperativos?idEmpresa={idEmpresa}&cadena={cadena}&busqueda={Uri.EscapeDataString(busqueda ?? string.Empty)}&estatus={Uri.EscapeDataString(estatus ?? string.Empty)}";
            List<EstadoOperativoDto> estados = await ExecuteGetAsync<List<EstadoOperativoDto>>(url) ?? new List<EstadoOperativoDto>();
            return Content(JsonConvert.SerializeObject(new { items = estados }, CamelCaseJson), "application/json");
        }

        public async Task<IActionResult> GetEstadoOperativo(string idEstadoOperativo)
        {
            if (!await HasActivosAccessAsync("03506000", requireWrite: true))
            {
                return Json(new { d = "" });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Activos/ObtenerEstadoOperativo?idEmpresa={idEmpresa}&idEstadoOperativo={idEstadoOperativo}&cadena={cadena}";
            EstadoOperativoDto? estado = await ExecuteGetAsync<EstadoOperativoDto>(url);
            return Json(new { d = estado });
        }

        public async Task<IActionResult> GuardarTipoActivo([FromBody] JsonElement parametros)
        {
            if (!await HasActivosAccessAsync("03506000", requireWrite: true))
            {
                return Json(new { d = "No tienes permiso para administrar tipos de activo." });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Activos/GuardarTipoActivo?idEmpresa={idEmpresa}&cadena={cadena}";
            var payload = new
            {
                id = ParseNullableGuid(ReadString(parametros, "id")),
                codigo = ReadString(parametros, "codigo"),
                nombre = ReadString(parametros, "nombre"),
                descripcion = ReadString(parametros, "descripcion")
            };

            ActivoOperacionResponse? respuesta = await ExecuteJsonAsync<ActivoOperacionResponse>(HttpMethod.Post, url, payload);
            return Json(new
            {
                d = respuesta?.Mensaje ?? "No fue posible guardar el tipo de activo.",
                item = respuesta == null ? null : new { id = respuesta.Id, codigo = respuesta.Codigo, nombre = respuesta.Nombre }
            });
        }

        public async Task<IActionResult> GuardarMarcaActivo([FromBody] JsonElement parametros)
        {
            if (!await HasActivosAccessAsync("03506000", requireWrite: true))
            {
                return Json(new { d = "No tienes permiso para administrar marcas." });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Activos/GuardarMarcaActivo?idEmpresa={idEmpresa}&cadena={cadena}";
            var payload = new
            {
                id = ParseNullableGuid(ReadString(parametros, "id")),
                codigo = ReadString(parametros, "codigo"),
                nombre = ReadString(parametros, "nombre"),
                descripcion = ReadString(parametros, "descripcion")
            };

            ActivoOperacionResponse? respuesta = await ExecuteJsonAsync<ActivoOperacionResponse>(HttpMethod.Post, url, payload);
            return Json(new
            {
                d = respuesta?.Mensaje ?? "No fue posible guardar la marca.",
                item = respuesta == null ? null : new { id = respuesta.Id, codigo = respuesta.Codigo, nombre = respuesta.Nombre }
            });
        }

        public async Task<IActionResult> GuardarProveedorActivo([FromBody] JsonElement parametros)
        {
            if (!await HasActivosAccessAsync("03506000", requireWrite: true))
            {
                return Json(new { d = "No tienes permiso para administrar proveedores." });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Activos/GuardarProveedorActivo?idEmpresa={idEmpresa}&cadena={cadena}";
            var payload = new
            {
                id = ParseNullableGuid(ReadString(parametros, "id")),
                codigo = ReadString(parametros, "codigo"),
                nombre = ReadString(parametros, "nombre"),
                descripcion = ReadString(parametros, "descripcion")
            };

            ActivoOperacionResponse? respuesta = await ExecuteJsonAsync<ActivoOperacionResponse>(HttpMethod.Post, url, payload);
            return Json(new
            {
                d = respuesta?.Mensaje ?? "No fue posible guardar el proveedor.",
                item = respuesta == null ? null : new { id = respuesta.Id, codigo = respuesta.Codigo, nombre = respuesta.Nombre }
            });
        }

        public async Task<IActionResult> GuardarEstadoOperativo([FromBody] JsonElement parametros)
        {
            if (!await HasActivosAccessAsync("03506000", requireWrite: true))
            {
                return Json(new { d = "No tienes permiso para administrar estados operativos." });
            }

            string ordenTexto = ReadString(parametros, "orden");
            if (!TryParseStrictPositiveInteger(ordenTexto, out int orden))
            {
                return Json(new { d = "Captura un orden entero mayor que cero." });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Activos/GuardarEstadoOperativo?idEmpresa={idEmpresa}&cadena={cadena}";
            var payload = new
            {
                id = ParseNullableGuid(ReadString(parametros, "id")),
                codigo = ReadString(parametros, "codigo"),
                nombre = ReadString(parametros, "nombre"),
                descripcion = ReadString(parametros, "descripcion"),
                permiteOperacion = ReadBool(parametros, "permiteOperacion"),
                orden = orden
            };

            ActivoOperacionResponse? respuesta = await ExecuteJsonAsync<ActivoOperacionResponse>(HttpMethod.Post, url, payload);
            return Json(new
            {
                d = respuesta?.Mensaje ?? "No fue posible guardar el estado operativo.",
                item = respuesta == null ? null : new { id = respuesta.Id, codigo = respuesta.Codigo, nombre = respuesta.Nombre }
            });
        }

        public async Task<IActionResult> BajaTipoActivo([FromBody] JsonElement parametros)
        {
            return await EjecutaCambioEstatusCatalogo(parametros, "idTipoActivo", "BajaTipoActivo", "No fue posible dar de baja el tipo de activo.");
        }

        public async Task<IActionResult> ActivarTipoActivo([FromBody] JsonElement parametros)
        {
            return await EjecutaCambioEstatusCatalogo(parametros, "idTipoActivo", "ActivarTipoActivo", "No fue posible activar el tipo de activo.");
        }

        public async Task<IActionResult> BajaMarcaActivo([FromBody] JsonElement parametros)
        {
            return await EjecutaCambioEstatusCatalogo(parametros, "idMarca", "BajaMarcaActivo", "No fue posible dar de baja la marca.");
        }

        public async Task<IActionResult> ActivarMarcaActivo([FromBody] JsonElement parametros)
        {
            return await EjecutaCambioEstatusCatalogo(parametros, "idMarca", "ActivarMarcaActivo", "No fue posible activar la marca.");
        }

        public async Task<IActionResult> BajaProveedorActivo([FromBody] JsonElement parametros)
        {
            return await EjecutaCambioEstatusCatalogo(parametros, "idProveedor", "BajaProveedorActivo", "No fue posible dar de baja el proveedor.");
        }

        public async Task<IActionResult> ActivarProveedorActivo([FromBody] JsonElement parametros)
        {
            return await EjecutaCambioEstatusCatalogo(parametros, "idProveedor", "ActivarProveedorActivo", "No fue posible activar el proveedor.");
        }

        public async Task<IActionResult> BajaEstadoOperativo([FromBody] JsonElement parametros)
        {
            return await EjecutaCambioEstatusCatalogo(parametros, "idEstadoOperativo", "BajaEstadoOperativo", "No fue posible dar de baja el estado operativo.");
        }

        public async Task<IActionResult> ActivarEstadoOperativo([FromBody] JsonElement parametros)
        {
            return await EjecutaCambioEstatusCatalogo(parametros, "idEstadoOperativo", "ActivarEstadoOperativo", "No fue posible activar el estado operativo.");
        }

        public async Task<IActionResult> GetCatalogoTipos(string searchTerm = "")
        {
            return await GetCatalogoAsync("ObtenerCatalogoTiposActivos", searchTerm);
        }

        public async Task<IActionResult> GetCatalogoMarcas(string searchTerm = "")
        {
            return await GetCatalogoAsync("ObtenerCatalogoMarcasActivos", searchTerm);
        }

        public async Task<IActionResult> GetCatalogoProveedores(string searchTerm = "")
        {
            return await GetCatalogoAsync("ObtenerCatalogoProveedoresActivos", searchTerm);
        }

        public async Task<IActionResult> GetCatalogoEstados(string searchTerm = "")
        {
            return await GetCatalogoAsync("ObtenerCatalogoEstadosOperativos", searchTerm);
        }

        public async Task<IActionResult> GetCatalogoSucursales(string searchTerm = "")
        {
            return await GetCatalogoAsync("ObtenerCatalogoSucursales", searchTerm);
        }

        private async Task<IActionResult> EjecutaCambioEstatusCatalogo(JsonElement parametros, string parameterName, string actionName, string fallbackMessage)
        {
            if (!await HasActivosAccessAsync("03506000", requireWrite: true))
            {
                return Json(new { d = "No tienes permiso para administrar catálogos de activos." });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string id = ReadString(parametros, parameterName);
            string url = $"{Utilerias.UrlBase}api/Activos/{actionName}?idEmpresa={idEmpresa}&{parameterName}={id}&cadena={cadena}";

            ActivoOperacionResponse? respuesta = await ExecuteJsonAsync<ActivoOperacionResponse>(HttpMethod.Put, url, new { });
            return Json(new { d = respuesta?.Mensaje ?? fallbackMessage });
        }

        private async Task<IActionResult> GetCatalogoAsync(string actionName, string searchTerm)
        {
            if (!await HasActivosAccessAsync("03501000", requireWrite: false))
            {
                return Json(new { d = new List<object>() });
            }

            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string url = $"{Utilerias.UrlBase}api/Activos/{actionName}?idEmpresa={idEmpresa}&cadena={cadena}&busqueda={Uri.EscapeDataString(searchTerm ?? string.Empty)}";
            List<CatalogoActivoDto> catalogo = await ExecuteGetAsync<List<CatalogoActivoDto>>(url) ?? new List<CatalogoActivoDto>();
            return Json(new
            {
                d = catalogo.Select(item => new
                {
                    id = item.Id.ToString(),
                    text = BuildCatalogText(item)
                }).ToList()
            });
        }

        private async Task<bool> HasCatalogosAccessAsync()
        {
            return await HasActivosAccessAsync("03506000", requireWrite: true)
                || await HasActivosAccessAsync("03501000", requireWrite: false);
        }

        private async Task<bool> HasAnyActivosAccessAsync()
        {
            return await IsSuperAdminSessionAsync()
                || await HasPermAsync("03501000", false)
                || await HasPermAsync("03502000", true)
                || await HasPermAsync("03503000", true)
                || await HasPermAsync("03504000", true)
                || await HasPermAsync("03505000", true)
                || await HasPermAsync("03506000", true);
        }

        private async Task<bool> CanOpenActivosAsync()
        {
            return await HasAnyActivosAccessAsync() || await HasLegacyAdministrativeScopeAsync();
        }

        private async Task<bool> HasActivosAccessAsync(string opcion, bool requireWrite)
        {
            return await IsSuperAdminSessionAsync() || await HasPermAsync(opcion, requireWrite);
        }

        private async Task<bool> HasLegacyAdministrativeScopeAsync()
        {
            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string empresa = ResolveEmpresa();
            string correo = ResolveCorreo();
            if (string.IsNullOrWhiteSpace(idEmpresa)
                || string.IsNullOrWhiteSpace(cadena)
                || string.IsNullOrWhiteSpace(empresa)
                || string.IsNullOrWhiteSpace(correo)
                || string.IsNullOrWhiteSpace(await ResolveCurrentRoleIdAsync(idEmpresa, cadena, empresa, correo)))
            {
                return false;
            }

            checklist.Models.Usuarios.respUsuario? usuarioActual = await ResolveCurrentUserAsync(idEmpresa, cadena, empresa, correo);
            if (usuarioActual == null || string.IsNullOrWhiteSpace(usuarioActual.Id))
            {
                return false;
            }

            return await HasPermAsync("02000000", requireWrite: false);
        }

        private async Task<bool> HasPermAsync(string opcion, bool requireWrite)
        {
            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string empresa = ResolveEmpresa();
            string correo = ResolveCorreo();
            string idRol = await ResolveCurrentRoleIdAsync(idEmpresa, cadena, empresa, correo);
            if (string.IsNullOrWhiteSpace(idEmpresa) || string.IsNullOrWhiteSpace(cadena) || string.IsNullOrWhiteSpace(empresa) || string.IsNullOrWhiteSpace(idRol))
            {
                return false;
            }

            Opciones perm = await Utilerias.GetOpcion(opcion, idEmpresa, idRol, empresa, cadena);
            if (perm?.Permisos == null)
            {
                return false;
            }

            return requireWrite ? perm.Permisos.Escritura == 1 : perm.Permisos.Acceso == 1;
        }

        private async Task<bool> IsSuperAdminSessionAsync()
        {
            string idEmpresa = ResolveIdEmpresa();
            string cadena = ResolveCadena();
            string empresa = ResolveEmpresa();
            string correo = ResolveCorreo();
            if (string.IsNullOrWhiteSpace(idEmpresa) || string.IsNullOrWhiteSpace(cadena) || string.IsNullOrWhiteSpace(empresa) || string.IsNullOrWhiteSpace(correo))
            {
                return false;
            }

            checklist.Models.Usuarios.respUsuario? usuarioActual = await ResolveCurrentUserAsync(idEmpresa, cadena, empresa, correo);
            if (usuarioActual == null || string.IsNullOrWhiteSpace(usuarioActual.Id))
            {
                return false;
            }

            if (string.Equals(usuarioActual.NombreRol?.Trim(), "SuperAdmin", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            string urlSuperAdmin = $"{Utilerias.UrlBase}api/Usuario/ObtenerSuperAdminId?idEmpresa={idEmpresa}&cadena={cadena}";
            string? superAdminId = await ExecuteGetAsync<string>(urlSuperAdmin);
            return Guid.TryParse(superAdminId, out Guid superAdminGuid)
                && superAdminGuid != Guid.Empty
                && Guid.TryParse(usuarioActual.Id, out Guid usuarioActualGuid)
                && usuarioActualGuid == superAdminGuid;
        }

        private async Task<string> ResolveCurrentRoleIdAsync(string idEmpresa, string cadena, string empresa, string correo)
        {
            if (!string.IsNullOrWhiteSpace(Utilerias.IdRol))
            {
                return Utilerias.IdRol;
            }

            checklist.Models.Usuarios.respUsuario? usuarioActual = await ResolveCurrentUserAsync(idEmpresa, cadena, empresa, correo);
            string idRol = usuarioActual?.idRol?.ToString() ?? string.Empty;
            if (!string.IsNullOrWhiteSpace(idRol))
            {
                Utilerias.IdRol = idRol;
            }

            return idRol;
        }

        private async Task<checklist.Models.Usuarios.respUsuario?> ResolveCurrentUserAsync(string idEmpresa, string cadena, string empresa, string correo)
        {
            string urlUsuario = $"{Utilerias.UrlBase}api/Usuario/ObtenerUsuarioPorEmail?idEmpresa={idEmpresa}&email={Uri.EscapeDataString(correo)}&empresa={Uri.EscapeDataString(empresa)}&cadena={cadena}";
            List<checklist.Models.Usuarios.respUsuario> usuarios = await ExecuteGetAsync<List<checklist.Models.Usuarios.respUsuario>>(urlUsuario) ?? new List<checklist.Models.Usuarios.respUsuario>();
            checklist.Models.Usuarios.respUsuario? usuarioBase = usuarios.FirstOrDefault(item => !string.IsNullOrWhiteSpace(item.Id));
            if (usuarioBase == null || string.IsNullOrWhiteSpace(usuarioBase.Id))
            {
                return null;
            }

            string urlDetalle = $"{Utilerias.UrlBase}api/Usuario/ObtenerUsuario?idEmpresa={idEmpresa}&id={usuarioBase.Id}&empresa={Uri.EscapeDataString(empresa)}&cadena={cadena}";
            List<checklist.Models.Usuarios.respUsuario> usuariosDetalle = await ExecuteGetAsync<List<checklist.Models.Usuarios.respUsuario>>(urlDetalle) ?? new List<checklist.Models.Usuarios.respUsuario>();
            checklist.Models.Usuarios.respUsuario? usuarioDetalle = usuariosDetalle.FirstOrDefault(item => !string.IsNullOrWhiteSpace(item.Id));
            return usuarioDetalle ?? usuarioBase;
        }

        private async Task<T?> ExecuteGetAsync<T>(string url)
        {
            using HttpClient client = _clientFactory.CreateClient();
            using HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, url);
            AddProxyHeaders(request);
            using HttpResponseMessage response = await client.SendAsync(request);
            string content = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode || string.IsNullOrWhiteSpace(content))
            {
                return default;
            }

            return JsonConvert.DeserializeObject<T>(content);
        }

        private async Task<T?> ExecuteJsonAsync<T>(HttpMethod method, string url, object payload)
        {
            using HttpClient client = _clientFactory.CreateClient();
            using HttpRequestMessage request = new HttpRequestMessage(method, url);
            AddProxyHeaders(request);
            request.Content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");
            using HttpResponseMessage response = await client.SendAsync(request);
            string content = await response.Content.ReadAsStringAsync();

            if (string.IsNullOrWhiteSpace(content))
            {
                return default;
            }

            if (response.StatusCode == HttpStatusCode.BadRequest || response.StatusCode == HttpStatusCode.NotFound)
            {
                return JsonConvert.DeserializeObject<T>(content);
            }

            if (!response.IsSuccessStatusCode)
            {
                T? parsedError = JsonConvert.DeserializeObject<T>(content);
                if (parsedError != null)
                {
                    return parsedError;
                }

                return default;
            }

            return JsonConvert.DeserializeObject<T>(content);
        }

        private async Task<(HttpStatusCode StatusCode, T? Payload)> ExecuteMultipartAsync<T>(string url, MultipartFormDataContent payload)
        {
            using HttpClient client = _clientFactory.CreateClient();
            using HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, url);
            AddProxyHeaders(request);
            request.Content = payload;
            using HttpResponseMessage response = await client.SendAsync(request);
            string content = await response.Content.ReadAsStringAsync();

            if (string.IsNullOrWhiteSpace(content))
            {
                return (response.StatusCode, default);
            }

            return (response.StatusCode, JsonConvert.DeserializeObject<T>(content));
        }

        private static IEnumerable<object> ReadMultimedia(JsonElement element)
        {
            if (!element.TryGetProperty("multimedia", out JsonElement multimedia) || multimedia.ValueKind != JsonValueKind.Array)
            {
                return Enumerable.Empty<object>();
            }

            List<object> result = new List<object>();
            foreach (JsonElement item in multimedia.EnumerateArray())
            {
                result.Add(new
                {
                    id = ParseNullableGuid(ReadString(item, "id")),
                    tipoMultimedia = ReadString(item, "tipoMultimedia"),
                    nombreOriginal = ReadString(item, "nombreOriginal"),
                    nombreAlmacenado = ReadString(item, "nombreAlmacenado"),
                    extension = ReadString(item, "extension"),
                    mimeType = ReadString(item, "mimeType"),
                    urlFirebase = ReadString(item, "urlFirebase"),
                    pesoBytes = ReadLong(item, "pesoBytes"),
                    orden = ReadInt(item, "orden"),
                    temporalToken = ReadString(item, "temporalToken")
                });
            }

            return result;
        }

        private static IEnumerable<string> ReadStringArray(JsonElement element, string propertyName)
        {
            if (!element.TryGetProperty(propertyName, out JsonElement array) || array.ValueKind != JsonValueKind.Array)
            {
                return Enumerable.Empty<string>();
            }

            List<string> values = new List<string>();
            foreach (JsonElement item in array.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.String)
                {
                    string? value = item.GetString();
                    if (!string.IsNullOrWhiteSpace(value))
                    {
                        values.Add(value.Trim());
                    }
                }
            }

            return values;
        }

        private static void AppendString(StringBuilder url, string name, string? value)
        {
            if (!string.IsNullOrWhiteSpace(value))
            {
                url.Append($"&{name}={Uri.EscapeDataString(value.Trim())}");
            }
        }

        private static void AppendGuid(StringBuilder url, string name, string? value)
        {
            if (Guid.TryParse(value, out Guid guid) && guid != Guid.Empty)
            {
                url.Append($"&{name}={guid}");
            }
        }

        private string ResolveIdEmpresa()
        {
            return ResolveSessionValue("idEmpresa")
                ?? User.FindFirstValue(ClaimTypes.SerialNumber)
                ?? Request.Query["idEmpresa"].FirstOrDefault()
                ?? string.Empty;
        }

        private string ResolveCadena()
        {
            return ResolveSessionValue("cadena")
                ?? User.FindFirstValue(ClaimTypes.Uri)
                ?? Request.Query["cadena"].FirstOrDefault()
                ?? string.Empty;
        }

        private string ResolveEmpresa()
        {
            return ResolveSessionValue("empresa")
                ?? User.FindFirstValue(ClaimTypes.Sid)
                ?? Request.Query["empresa"].FirstOrDefault()
                ?? string.Empty;
        }

        private string? ResolveUsuarioId()
        {
            string? claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(claimValue, out Guid usuarioId) && usuarioId != Guid.Empty
                ? usuarioId.ToString()
                : null;
        }

        private void AddProxyHeaders(HttpRequestMessage request)
        {
            string idEmpresa = ResolveIdEmpresa();
            string empresa = ResolveEmpresa();
            string usuarioId = ResolveUsuarioId() ?? string.Empty;
            string timestamp = DateTimeOffset.UtcNow.ToString("O");
            string signature = ComputeSignature("Leon2022*", idEmpresa, empresa, usuarioId, timestamp);

            request.Headers.TryAddWithoutValidation(ProxyEmpresaIdHeader, idEmpresa);
            request.Headers.TryAddWithoutValidation(ProxyEmpresaKeyHeader, empresa);
            request.Headers.TryAddWithoutValidation(ProxyTimestampHeader, timestamp);
            request.Headers.TryAddWithoutValidation(ProxySignatureHeader, signature);

            if (!string.IsNullOrWhiteSpace(usuarioId))
            {
                request.Headers.TryAddWithoutValidation(ProxyUsuarioIdHeader, usuarioId);
            }
        }

        private static string ComputeSignature(string secret, string empresaId, string empresa, string usuarioId, string timestamp)
        {
            using HMACSHA256 hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            string payload = string.Join('\n', empresaId.Trim(), empresa.Trim().ToUpperInvariant(), usuarioId.Trim(), timestamp.Trim());
            byte[] signature = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
            return Convert.ToBase64String(signature);
        }

        private string ResolveCorreo()
        {
            return ResolveSessionValue("emailUser")
                ?? User.FindFirstValue(ClaimTypes.Email)
                ?? Request.Query["correo"].FirstOrDefault()
                ?? string.Empty;
        }

        private string? ResolveSessionValue(string key)
        {
            string? raw = HttpContext.Session.GetString(key);
            if (!string.IsNullOrWhiteSpace(raw))
            {
                return NormalizeSerializedValue(raw);
            }

            string? serialized = HttpContext.Session.GetObject<string>(key);
            if (!string.IsNullOrWhiteSpace(serialized))
            {
                return NormalizeSerializedValue(serialized);
            }

            return null;
        }

        private static string NormalizeSerializedValue(string value)
        {
            string normalized = value?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(normalized))
            {
                return string.Empty;
            }

            try
            {
                if (normalized.StartsWith("\"") && normalized.EndsWith("\""))
                {
                    string? deserialized = JsonConvert.DeserializeObject<string>(normalized);
                    if (!string.IsNullOrWhiteSpace(deserialized))
                    {
                        return deserialized.Trim();
                    }
                }
            }
            catch
            {
            }

            return normalized.Trim('"').Trim();
        }

        private static string ReadString(JsonElement element, string propertyName)
        {
            if (!element.TryGetProperty(propertyName, out JsonElement value))
            {
                return string.Empty;
            }

            if (value.ValueKind == JsonValueKind.String)
            {
                return value.GetString()?.Trim() ?? string.Empty;
            }

            return value.ToString().Trim();
        }

        private static bool ReadBool(JsonElement element, string propertyName)
        {
            if (!element.TryGetProperty(propertyName, out JsonElement value))
            {
                return false;
            }

            if (value.ValueKind == JsonValueKind.True || value.ValueKind == JsonValueKind.False)
            {
                return value.GetBoolean();
            }

            return bool.TryParse(value.ToString(), out bool result) && result;
        }

        private static int ReadInt(JsonElement element, string propertyName)
        {
            if (!element.TryGetProperty(propertyName, out JsonElement value))
            {
                return 0;
            }

            if (value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out int number))
            {
                return number;
            }

            return int.TryParse(value.ToString(), out int result) ? result : 0;
        }

        private static bool TryParseStrictPositiveInteger(string? value, out int result)
        {
            string normalized = (value ?? string.Empty).Trim();
            if (!int.TryParse(normalized, out result))
            {
                return false;
            }

            return result > 0 && normalized == result.ToString();
        }

        private static long ReadLong(JsonElement element, string propertyName)
        {
            if (!element.TryGetProperty(propertyName, out JsonElement value))
            {
                return 0;
            }

            if (value.ValueKind == JsonValueKind.Number && value.TryGetInt64(out long number))
            {
                return number;
            }

            return long.TryParse(value.ToString(), out long result) ? result : 0;
        }

        private static Guid? ParseNullableGuid(string? value)
        {
            return Guid.TryParse(value, out Guid guid) && guid != Guid.Empty ? guid : null;
        }

        private static string BuildCatalogText(CatalogoActivoDto item)
        {
            string codigo = (item.Codigo ?? string.Empty).Trim();
            string nombre = (item.Nombre ?? string.Empty).Trim();
            return string.IsNullOrWhiteSpace(codigo) ? nombre : $"{codigo} - {nombre}";
        }
    }
}
