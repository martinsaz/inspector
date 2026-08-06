using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using checklist.Clases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QRCoder;

namespace checklist.Controllers.Activos
{
    [Authorize]
    [Route("Activos/OrdenesCompra")]
    public class OrdenesCompraController : Controller
    {
        private const string ProxyEmpresaIdHeader = "X-ProductosServicios-Proxy-EmpresaId";
        private const string ProxyEmpresaKeyHeader = "X-ProductosServicios-Proxy-Empresa";
        private const string ProxyUsuarioIdHeader = "X-ProductosServicios-Proxy-UsuarioId";
        private const string ProxyTimestampHeader = "X-ProductosServicios-Proxy-Timestamp";
        private const string ProxySignatureHeader = "X-ProductosServicios-Proxy-Signature";

        private readonly IHttpClientFactory _clientFactory;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;

        public OrdenesCompraController(IHttpClientFactory clientFactory, IConfiguration configuration, IWebHostEnvironment environment)
        {
            _clientFactory = clientFactory;
            _configuration = configuration;
            _environment = environment;
        }

        [HttpGet("Nueva")]
        public IActionResult Nueva()
        {
            ViewData["OrdenesCompraPageMode"] = "new";
            ViewData["OrdenesCompraDetailId"] = string.Empty;
            return View("~/Views/Activos/OrdenesCompra/Nueva.cshtml");
        }

        [HttpGet("Reporte")]
        public IActionResult Reporte()
        {
            return View("~/Views/Activos/OrdenesCompra/Index.cshtml");
        }

        [HttpGet("Index")]
        public IActionResult Index()
        {
            return RedirectToAction(nameof(Reporte));
        }

        [HttpGet("Detalle/{id:guid}")]
        public IActionResult Detalle(Guid id)
        {
            ViewData["OrdenesCompraPageMode"] = "detail";
            ViewData["OrdenesCompraDetailId"] = id.ToString();
            return View("~/Views/Activos/OrdenesCompra/Nueva.cshtml");
        }

        [HttpGet("Editar/{id:guid}")]
        public IActionResult Editar(Guid id)
        {
            return RedirectToAction(nameof(Detalle), new { id });
        }

        [HttpGet("ObtenerOrdenesCompra")]
        public Task<IActionResult> ObtenerOrdenesCompra() => ProxyGetAsync("ObtenerOrdenesCompra");

        [HttpGet("ObtenerOrdenCompra")]
        public Task<IActionResult> ObtenerOrdenCompra() => ProxyGetAsync("ObtenerOrdenCompra");

        [HttpGet("ObtenerResumenOrdenesCompra")]
        public Task<IActionResult> ObtenerResumenOrdenesCompra() => ProxyGetAsync("ObtenerResumenOrdenesCompra");

        [HttpGet("ObtenerCombosOrdenCompra")]
        public Task<IActionResult> ObtenerCombosOrdenCompra() => ProxyGetAsync("ObtenerCombosOrdenCompra");

        [HttpGet("BuscarProductosServiciosOrdenCompra")]
        public Task<IActionResult> BuscarProductosServiciosOrdenCompra() => ProxyGetAsync("BuscarProductosServiciosOrdenCompra");

        [HttpPost("ValidarPendientesOrdenCompra")]
        public Task<IActionResult> ValidarPendientesOrdenCompra() => ProxyJsonAsync(HttpMethod.Post, "ValidarPendientesOrdenCompra");

        [HttpGet("ExportarOrdenesCompra")]
        public Task<IActionResult> ExportarOrdenesCompra() => ProxyGetAsync("ExportarOrdenesCompra");

        [HttpGet("ExportarOrdenCompraPdf")]
        public async Task<IActionResult> ExportarOrdenCompraPdf(Guid idOrdenCompra)
        {
            if (idOrdenCompra == Guid.Empty)
            {
                return BadRequest(new { mensaje = "La orden de compra no está disponible." });
            }

            OrdenCompraDetallePdfDto? detail = await GetOrderDetailForPdfAsync(idOrdenCompra);
            if (detail == null || detail.Id == Guid.Empty)
            {
                return NotFound(new { mensaje = "La orden de compra no está disponible." });
            }

            try
            {
                byte[] pdf = BuildOrderPdf(detail);
                Console.WriteLine($"[OrdenesCompraPdf] Id={detail.Id} Folio={detail.Folio} Partidas={detail.Partidas.Count} Bytes={pdf.Length}");
                string fileName = BuildSafeExportFileName("orden_compra", detail.Folio, ".pdf");
                return File(pdf, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[OrdenesCompraPdf] Error al generar PDF de la orden {detail.Id} ({detail.Folio}).");
                Console.Error.WriteLine(ex);
                throw;
            }
        }

        [HttpGet("ExportarOrdenCompraExcel")]
        public Task<IActionResult> ExportarOrdenCompraExcel() => ProxyGetAsync("ExportarOrdenCompraExcel");

        [HttpPost("GuardarBorradorOrdenCompra")]
        public Task<IActionResult> GuardarBorradorOrdenCompra() => ProxyJsonAsync(HttpMethod.Post, "GuardarBorradorOrdenCompra");

        [HttpPost("GenerarOrdenCompra")]
        public Task<IActionResult> GenerarOrdenCompra() => ProxyJsonAsync(HttpMethod.Post, "GenerarOrdenCompra");

        [HttpPost("CancelarOrdenCompra")]
        public Task<IActionResult> CancelarOrdenCompra() => ProxyJsonAsync(HttpMethod.Post, "CancelarOrdenCompra");

        private async Task<IActionResult> ProxyGetAsync(string actionName)
        {
            using HttpRequestMessage request = CreateApiRequest(HttpMethod.Get, actionName);
            return await SendAsync(request);
        }

        private async Task<IActionResult> ProxyJsonAsync(HttpMethod method, string actionName)
        {
            using HttpRequestMessage request = CreateApiRequest(method, actionName);
            string body = await ReadBodyAsync();
            request.Content = new StringContent(string.IsNullOrWhiteSpace(body) ? "{}" : body, Encoding.UTF8, Request.ContentType ?? "application/json");
            return await SendAsync(request);
        }

        private HttpRequestMessage CreateApiRequest(HttpMethod method, string actionName)
        {
            HttpRequestMessage request = new HttpRequestMessage(method, BuildApiUrl(actionName));
            AddProxyHeaders(request);
            return request;
        }

        private string BuildApiUrl(string actionName)
        {
            string idEmpresa = ResolveIdEmpresa();
            List<KeyValuePair<string, string?>> query = new List<KeyValuePair<string, string?>>();

            foreach (var item in Request.Query)
            {
                if (string.Equals(item.Key, "idEmpresa", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                foreach (string? value in item.Value)
                {
                    query.Add(new KeyValuePair<string, string?>(item.Key, value));
                }
            }

            query.Add(new KeyValuePair<string, string?>("idEmpresa", idEmpresa));
            string queryString = QueryString.Create(query).ToUriComponent();
            return $"{Utilerias.UrlBase}api/OrdenesCompra/{actionName}{queryString}";
        }

        private void AddProxyHeaders(HttpRequestMessage request)
        {
            string idEmpresa = ResolveIdEmpresa();
            string empresa = ResolveEmpresa();
            string? usuarioId = ResolveUsuarioId();
            string timestamp = DateTimeOffset.UtcNow.ToString("O");
            string secret = _configuration["fireBdata:fireClave"] ?? string.Empty;
            string signature = ComputeSignature(secret, idEmpresa, empresa, usuarioId ?? string.Empty, timestamp);

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

        private async Task<IActionResult> SendAsync(HttpRequestMessage request)
        {
            using HttpClient client = _clientFactory.CreateClient();
            using HttpResponseMessage response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
            string responseContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json";
            bool isAttachment = response.Content.Headers.ContentDisposition != null;
            bool isTextual =
                responseContentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase) ||
                responseContentType.StartsWith("text/", StringComparison.OrdinalIgnoreCase) ||
                responseContentType.StartsWith("application/problem+json", StringComparison.OrdinalIgnoreCase) ||
                responseContentType.StartsWith("application/xml", StringComparison.OrdinalIgnoreCase) ||
                responseContentType.StartsWith("text/csv", StringComparison.OrdinalIgnoreCase);

            if (!isTextual || isAttachment)
            {
                byte[] bytes = await response.Content.ReadAsByteArrayAsync();
                if (bytes.Length == 0)
                {
                    return StatusCode((int)response.StatusCode);
                }

                string fileName = response.Content.Headers.ContentDisposition?.FileNameStar
                    ?? response.Content.Headers.ContentDisposition?.FileName
                    ?? "archivo";

                fileName = fileName.Trim('"');

                return File(bytes, responseContentType, fileName);
            }

            string content = await response.Content.ReadAsStringAsync();

            if (string.IsNullOrWhiteSpace(content))
            {
                return StatusCode((int)response.StatusCode);
            }

            return new ContentResult
            {
                Content = content,
                ContentType = responseContentType,
                StatusCode = (int)response.StatusCode
            };
        }

        private async Task<string> ReadBodyAsync()
        {
            using StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8);
            return await reader.ReadToEndAsync();
        }

        private async Task<OrdenCompraDetallePdfDto?> GetOrderDetailForPdfAsync(Guid idOrdenCompra)
        {
            using HttpRequestMessage request = CreateApiRequest(HttpMethod.Get, "ObtenerOrdenCompra");
            using HttpClient client = _clientFactory.CreateClient();
            using HttpResponseMessage response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

            string content = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode || string.IsNullOrWhiteSpace(content))
            {
                return null;
            }

            return JsonSerializer.Deserialize<OrdenCompraDetallePdfDto>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }

        private byte[] BuildOrderPdf(OrdenCompraDetallePdfDto detail)
        {
            QuestPDF.Settings.License = LicenseType.Evaluation;

            byte[]? logo = LoadCheckAppLogo();
            byte[]? qr = BuildOrderQr(detail);
            string fechaOrden = FormatDate(detail.FechaOrden);
            string fechaLlegada = detail.FechaLlegada.HasValue ? FormatDate(detail.FechaLlegada.Value) : "Sin captura";
            string fechaEmision = DateTime.Now.ToString("dd/MM/yyyy");
            string observaciones = string.IsNullOrWhiteSpace(detail.Observaciones) ? "Sin observaciones" : detail.Observaciones.Trim();
            string estadoVisible = ResolveUserFacingOrderState(detail.Estado, detail.EstadoNombre);

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(32);
                    page.DefaultTextStyle(x => x.FontFamily(Fonts.Calibri).FontSize(10).FontColor("#333638"));

                    page.Header().Element(header =>
                    {
                        header.Row(row =>
                        {
                            row.RelativeItem(2.8f).Column(column =>
                            {
                                column.Spacing(5);
                                if (logo != null)
                                {
                                    column.Item().Height(24).AlignLeft().Image(logo).FitHeight();
                                }

                                column.Item().Text("Orden de compra").SemiBold().FontSize(20).FontColor("#39394D");
                                column.Item().Text($"{TextOrDash(detail.RazonSocial)} · {TextOrDash(detail.Sucursal)}").FontSize(10).FontColor("#4791AA");
                                column.Item().Text($"Proveedor: {TextOrDash(detail.Proveedor)}").FontSize(10).FontColor("#333638");
                            });

                            row.ConstantItem(190).Element(container =>
                            {
                                container
                                    .Border(1)
                                    .BorderColor("#4791AA")
                                    .CornerRadius(12)
                                    .Padding(10)
                                    .Background("#FAFAFA")
                                    .Column(card =>
                                {
                                    card.Spacing(4);
                                    card.Item().AlignCenter().Text($"Folio {TextOrDash(detail.Folio)}").SemiBold().FontColor("#39394D");
                                    card.Item().AlignCenter().Text($"Emitida {fechaEmision}").FontSize(9).FontColor("#4791AA");
                                    if (qr != null)
                                    {
                                        card.Item().Width(34).Height(34).AlignCenter().Image(qr).FitArea();
                                    }
                                });
                            });
                        });
                    });

                    page.Content().Column(content =>
                    {
                        content.Spacing(14);

                        content.Item().Element(x => ComposeMetadataTable(x, new[]
                        {
                            ("Folio", TextOrDash(detail.Folio)),
                            ("Estado", estadoVisible),
                            ("Fecha de orden", fechaOrden),
                            ("Fecha de llegada", fechaLlegada),
                            ("Razón social", TextOrDash(detail.RazonSocial)),
                            ("Sucursal", TextOrDash(detail.Sucursal)),
                            ("Proveedor", TextOrDash(detail.Proveedor)),
                            ("Partidas", detail.Partidas.Count.ToString())
                        }));

                        content.Item().Element(x => ComposeInfoCard(x, "Observaciones", new[]
                        {
                            ("Detalle", observaciones)
                        }));

                        content.Item().Element(x => ComposePartidasTable(x, detail.Partidas));

                        content.Item().AlignRight().Width(220).Element(x => ComposeTotalsCard(x, detail.Subtotal, detail.Total, detail.Partidas));
                    });

                    page.Footer()
                        .AlignCenter()
                        .DefaultTextStyle(x => x.FontSize(8).FontColor("#39394D"))
                        .Text(text =>
                        {
                            text.Span("CheckApp · Orden de compra · ");
                            text.CurrentPageNumber();
                            text.Span(" / ");
                            text.TotalPages();
                        });
                });
            }).GeneratePdf();
        }

        private void ComposeMetadataTable(IContainer container, IReadOnlyCollection<(string Label, string Value)> rows)
        {
            container
                .Border(1)
                .BorderColor("#4791AA")
                .CornerRadius(12)
                .Background("#FAFAFA")
                .Padding(10)
                .Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                    });

                    int index = 0;
                    foreach ((string label, string value) in rows)
                    {
                        table.Cell().Element(cell =>
                        {
                            cell
                                .Padding(8)
                                .BorderBottom(index < rows.Count - 4 ? 1 : 0)
                                .BorderRight(index % 4 != 3 ? 1 : 0)
                                .BorderColor("#4791AA")
                                .Column(column =>
                                {
                                    column.Spacing(3);
                                    column.Item().Text(label).FontSize(8).SemiBold().FontColor("#4791AA");
                                    column.Item().Text(TextOrDash(value)).FontSize(10).FontColor("#333638");
                                });
                        });
                        index++;
                    }
                });
        }

        private void ComposeInfoCard(IContainer container, string title, IEnumerable<(string Label, string Value)> rows)
        {
            container
                .Background("#FAFAFA")
                .Border(1)
                .BorderColor("#4791AA")
                .CornerRadius(12)
                .Padding(16)
                .Column(column =>
                {
                    column.Spacing(8);
                    column.Item().Text(title).SemiBold().FontSize(12).FontColor("#39394D");

                    foreach ((string label, string value) in rows)
                    {
                        column.Item().Column(item =>
                        {
                            item.Spacing(2);
                            item.Item().Text(label).FontSize(8).SemiBold().FontColor("#4791AA");
                            item.Item().Text(TextOrDash(value)).FontSize(10).FontColor("#333638");
                        });
                    }
                });
        }

        private void ComposePartidasTable(IContainer container, IReadOnlyCollection<OrdenCompraPartidaPdfDto> partidas)
        {
            container.Column(column =>
            {
                column.Spacing(10);
                column.Item().Text("Partidas").SemiBold().FontSize(12).FontColor("#39394D");
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(34);
                        columns.RelativeColumn(1.1f);
                        columns.RelativeColumn(1.3f);
                        columns.RelativeColumn(4.1f);
                        columns.RelativeColumn(1.5f);
                        columns.RelativeColumn(1.1f);
                        columns.RelativeColumn(1.35f);
                        columns.RelativeColumn(1.4f);
                    });

                    table.Header(header =>
                    {
                        string background = "#39394D";
                        header.Cell().Element(x => PdfHeaderCell(x, "No.", background));
                        header.Cell().Element(x => PdfHeaderCell(x, "Tipo", background));
                        header.Cell().Element(x => PdfHeaderCell(x, "Código", background));
                        header.Cell().Element(x => PdfHeaderCell(x, "Producto o servicio", background));
                        header.Cell().Element(x => PdfHeaderCell(x, "Unidad", background));
                        header.Cell().Element(x => PdfHeaderCell(x, "Cantidad", background));
                        header.Cell().Element(x => PdfHeaderCell(x, "Costo", background));
                        header.Cell().Element(x => PdfHeaderCell(x, "Subtotal", background));
                    });

                    int index = 0;
                    foreach (OrdenCompraPartidaPdfDto partida in partidas)
                    {
                        string rowBackground = index % 2 == 0 ? "#FAFAFA" : "#FAFAFA";
                        table.Cell().Element(x => PdfBodyCell(x, partida.NumeroPartida.ToString(), rowBackground, TextHorizontalAlignment.Center));
                        table.Cell().Element(x => PdfBodyCell(x, TextOrDash(partida.TipoProductoServicioNombre), rowBackground));
                        table.Cell().Element(x => PdfBodyCell(x, TextOrDash(partida.Codigo), rowBackground));
                        table.Cell().Element(x => PdfBodyCell(x, BuildProductLine(partida), rowBackground));
                        table.Cell().Element(x => PdfBodyCell(x, BuildUnidad(partida), rowBackground));
                        table.Cell().Element(x => PdfBodyCell(x, partida.Cantidad.ToString("0.####"), rowBackground, TextHorizontalAlignment.Right));
                        table.Cell().Element(x => PdfBodyCell(x, detailCurrency(partida.CostoUnitario), rowBackground, TextHorizontalAlignment.Right));
                        table.Cell().Element(x => PdfBodyCell(x, detailCurrency(partida.Subtotal), rowBackground, TextHorizontalAlignment.Right));
                        index++;
                    }
                });
            });

            static string detailCurrency(decimal amount) => amount.ToString("$#,##0.00", System.Globalization.CultureInfo.GetCultureInfo("es-MX"));
        }

        private void ComposeTotalsCard(IContainer container, decimal subtotal, decimal total, IReadOnlyCollection<OrdenCompraPartidaPdfDto> partidas)
        {
            container
                .Background("#FAFAFA")
                .Border(1)
                .BorderColor("#4791AA")
                .CornerRadius(12)
                .Padding(14)
                .Column(column =>
                {
                    column.Spacing(8);
                    column.Item().Text("Totales").SemiBold().FontSize(12).FontColor("#39394D");
                    column.Item().Row(row =>
                    {
                        row.RelativeItem().Text("Partidas").FontColor("#4791AA");
                        row.ConstantItem(96).AlignRight().Text(partidas.Count.ToString()).SemiBold();
                    });
                    column.Item().Row(row =>
                    {
                        row.RelativeItem().Text("Subtotal").FontColor("#4791AA");
                        row.ConstantItem(96).AlignRight().Text(FormatCurrency(subtotal)).SemiBold();
                    });
                    column.Item().LineHorizontal(1).LineColor("#4791AA");
                    column.Item().Row(row =>
                    {
                        row.RelativeItem().Text("Total").SemiBold().FontColor("#39394D");
                        row.ConstantItem(96).AlignRight().Text(FormatCurrency(total)).SemiBold().FontColor("#FF9230");
                    });
                });
        }

        private static void PdfHeaderCell(IContainer container, string text, string background)
        {
            container
                .Background(background)
                .PaddingVertical(8)
                .PaddingHorizontal(6)
                .Text(text)
                .FontSize(9)
                .SemiBold()
                .FontColor("#FAFAFA");
        }

        private static void PdfBodyCell(IContainer container, string text, string background, TextHorizontalAlignment alignment = TextHorizontalAlignment.Left)
        {
            IContainer alignedContainer = container
                .Background(background)
                .BorderBottom(1)
                .BorderColor("#4791AA")
                .PaddingVertical(8)
                .PaddingHorizontal(6);

            alignedContainer = alignment switch
            {
                TextHorizontalAlignment.Right => alignedContainer.AlignRight(),
                TextHorizontalAlignment.Center => alignedContainer.AlignCenter(),
                _ => alignedContainer.AlignLeft()
            };

            alignedContainer
                .Text(TextOrDash(text))
                .FontSize(9)
                .FontColor("#333638");
        }

        private byte[]? LoadCheckAppLogo()
        {
            string path = Path.Combine(_environment.WebRootPath, "assets", "media", "logos", "checkapp2.png");
            return System.IO.File.Exists(path) ? System.IO.File.ReadAllBytes(path) : null;
        }

        private static byte[]? BuildOrderQr(OrdenCompraDetallePdfDto detail)
        {
            string payload = string.Join("|", new[]
            {
                "OC",
                TextOrDash(detail.Folio),
                TextOrDash(detail.Proveedor),
                FormatDate(detail.FechaOrden),
                FormatCurrency(detail.Total)
            });

            using QRCodeGenerator generator = new QRCodeGenerator();
            using QRCodeData qrData = generator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q);
            PngByteQRCode qrCode = new PngByteQRCode(qrData);
            return qrCode.GetGraphic(12, new byte[] { 57, 57, 77 }, new byte[] { 250, 250, 250 }, true);
        }

        private static string BuildProductLine(OrdenCompraPartidaPdfDto partida)
        {
            string nombre = TextOrDash(partida.Nombre);
            string descripcion = string.IsNullOrWhiteSpace(partida.Descripcion) ? string.Empty : $" · {partida.Descripcion.Trim()}";
            return $"{nombre}{descripcion}";
        }

        private static string BuildUnidad(OrdenCompraPartidaPdfDto partida)
        {
            if (!string.IsNullOrWhiteSpace(partida.UnidadMedida) && !string.IsNullOrWhiteSpace(partida.UnidadAbreviatura))
            {
                return $"{partida.UnidadMedida} ({partida.UnidadAbreviatura})";
            }

            return TextOrDash(partida.UnidadMedida ?? partida.UnidadAbreviatura);
        }

        private static string TextOrDash(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? "—" : value.Trim();
        }

        private static string FormatDate(DateTime value)
        {
            return value.ToString("dd/MM/yyyy");
        }

        private static string FormatCurrency(decimal amount)
        {
            return amount.ToString("$#,##0.00", System.Globalization.CultureInfo.GetCultureInfo("es-MX"));
        }

        private static string ResolveUserFacingOrderState(int estado, string? estadoNombre)
        {
            string normalized = string.IsNullOrWhiteSpace(estadoNombre)
                ? string.Empty
                : estadoNombre.Trim().ToLowerInvariant();

            if (estado == 1 || normalized == "borrador")
            {
                return "En captura";
            }

            if (estado == 2 || normalized == "generada")
            {
                return "Confirmada";
            }

            if (estado == 3 || normalized == "cancelada")
            {
                return "Detenida";
            }

            if (string.IsNullOrWhiteSpace(normalized) || normalized == "nueva")
            {
                return "En captura";
            }

            return "Lista";
        }

        private static string BuildSafeExportFileName(string prefix, string folio, string extension)
        {
            string safeFolio = string.IsNullOrWhiteSpace(folio)
                ? "sin_folio"
                : string.Concat(folio.Trim().Select(character =>
                    char.IsLetterOrDigit(character) || character == '-' || character == '_' ? character : '_'));

            return $"{prefix}_{safeFolio}{extension}";
        }

        private static Guid TryResolveGuid(string? raw)
        {
            return Guid.TryParse(raw, out Guid value) ? value : Guid.Empty;
        }

        private string ResolveIdEmpresa()
        {
            return ResolveSessionValue("idEmpresa")
                ?? User.FindFirstValue(ClaimTypes.SerialNumber)
                ?? Request.Query["idEmpresa"].FirstOrDefault()
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

        private string? ResolveSessionValue(string key)
        {
            string? raw = HttpContext.Session.GetString(key);
            if (!string.IsNullOrWhiteSpace(raw))
            {
                return NormalizeSerializedValue(raw);
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
                    string? deserialized = Newtonsoft.Json.JsonConvert.DeserializeObject<string>(normalized);
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

        private sealed class OrdenCompraDetallePdfDto
        {
            public Guid Id { get; set; }
            public string Folio { get; set; } = string.Empty;
            public string RazonSocial { get; set; } = string.Empty;
            public string Sucursal { get; set; } = string.Empty;
            public string Proveedor { get; set; } = string.Empty;
            public DateTime FechaOrden { get; set; }
            public DateTime? FechaLlegada { get; set; }
            public byte Estado { get; set; }
            public string EstadoNombre { get; set; } = string.Empty;
            public string Observaciones { get; set; } = string.Empty;
            public decimal Subtotal { get; set; }
            public decimal Total { get; set; }
            public List<OrdenCompraPartidaPdfDto> Partidas { get; set; } = new();
        }

        private sealed class OrdenCompraPartidaPdfDto
        {
            public int NumeroPartida { get; set; }
            public string TipoProductoServicioNombre { get; set; } = string.Empty;
            public string Codigo { get; set; } = string.Empty;
            public string Nombre { get; set; } = string.Empty;
            public string Descripcion { get; set; } = string.Empty;
            public string UnidadMedida { get; set; } = string.Empty;
            public string UnidadAbreviatura { get; set; } = string.Empty;
            public decimal Cantidad { get; set; }
            public decimal CostoUnitario { get; set; }
            public decimal Subtotal { get; set; }
        }
    }
}
