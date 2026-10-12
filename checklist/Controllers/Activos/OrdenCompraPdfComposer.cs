using System.Globalization;
using QuestPDF.Elements.Table;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QRCoder;

namespace checklist.Controllers.Activos;

internal static class OrdenCompraPdfComposer
{
    private const string Navy = "#17365D";
    private const string Blue = "#0B67B2";
    private const string PaleBlue = "#EDF6FD";
    private const string Border = "#B8D5EA";
    private const string Ink = "#14213D";
    private const string Muted = "#52627A";
    private const string Orange = "#FF7A00";
    private static readonly CultureInfo MexicanCulture = CultureInfo.GetCultureInfo("es-MX");

    public static byte[] Build(
        OrdenCompraPdfModel detail,
        byte[]? logo,
        string creatorName,
        string creatorRole,
        DateTime generatedAt)
    {
        QuestPDF.Settings.License = LicenseType.Evaluation;

        byte[]? qr = BuildQr(detail);
        IReadOnlyList<string> branches = ResolveBranches(detail);
        IReadOnlyList<PdfProductGroup> groups = BuildGroups(detail, branches);
        IReadOnlyDictionary<string, PdfTotals> orderBranchTotals = branches.ToDictionary(
            branch => branch,
            branch => Sum(detail.Partidas.Where(item => Same(item.Sucursal, branch))));
        PdfTotals orderTotals = Sum(detail.Partidas);
        string observations = string.IsNullOrWhiteSpace(detail.Observaciones)
            ? "Sin observaciones"
            : detail.Observaciones.Trim();

        return Document.Create(document =>
        {
            document.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.MarginHorizontal(18);
                page.MarginVertical(16);
                page.DefaultTextStyle(style => style.FontFamily(Fonts.Calibri).FontSize(8.2f).FontColor(Ink));

                page.Content().Column(content =>
                {
                    content.Spacing(6);
                    content.Item().Element(container => ComposeHeader(container, detail, logo, qr));
                    content.Item().Element(container => ComposeSummaryStrip(container, detail, branches, observations));
                    content.Item().Element(container => ComposeMatrix(container, groups, branches, orderBranchTotals, orderTotals));
                    content.Item().AlignRight().Element(container => ComposeOrderSummary(container, orderTotals));
                    content.Item().Element(container => ComposeObservations(container, observations));
                    content.Item().ShowEntire().Element(container => ComposeSignatures(container, creatorName, creatorRole));
                });

                page.Footer().PaddingTop(4).BorderTop(0.5f).BorderColor(Border).Row(row =>
                {
                    row.RelativeItem().Text("CheckApp · Orden de compra").FontSize(7.5f).FontColor(Muted);
                    row.RelativeItem().AlignCenter().Text($"Generado el {generatedAt:dd/MM/yyyy · HH:mm}").FontSize(7.5f).FontColor(Muted);
                    row.RelativeItem().AlignRight().Text(text =>
                    {
                        text.DefaultTextStyle(style => style.FontSize(7.5f).FontColor(Muted));
                        text.Span("Página ");
                        text.CurrentPageNumber();
                        text.Span(" / ");
                        text.TotalPages();
                    });
                });
            });
        }).GeneratePdf();
    }

    private static void ComposeHeader(IContainer container, OrdenCompraPdfModel detail, byte[]? logo, byte[]? qr)
    {
        container.Row(row =>
        {
            row.RelativeItem(2.1f).Column(left =>
            {
                left.Spacing(2);
                if (logo != null)
                {
                    left.Item().Height(25).AlignLeft().Image(logo).FitHeight();
                }
                else
                {
                    left.Item().Text(text =>
                    {
                        text.Span("Check").Bold().FontSize(22).FontColor(Colors.Black);
                        text.Span("App").Bold().FontSize(22).FontColor(Orange);
                    });
                }

                left.Item().Text("Orden de compra").Bold().FontSize(18).FontColor(Navy);
                left.Item().Text(Text(detail.RazonSocial)).SemiBold().FontSize(9).FontColor(Blue);
                left.Item().Text($"Sucursales: {Text(string.Join(", ", ResolveBranches(detail)))}").FontSize(8.2f);
                left.Item().Text(text =>
                {
                    text.Span("Proveedor: ");
                    text.Span(Text(detail.Proveedor)).SemiBold();
                });
            });

            row.RelativeItem(1.55f).PaddingLeft(8).Border(0.7f).BorderColor(Border).CornerRadius(5).Padding(8).Column(card =>
            {
                card.Spacing(5);
                card.Item().Row(line =>
                {
                    line.RelativeItem().Element(x => LabelValue(x, "Folio", Text(detail.Folio), true));
                    line.RelativeItem().Element(x => LabelValue(x, "Estado", ResolveState(detail), true));
                });
                card.Item().LineHorizontal(0.5f).LineColor(Border);
                card.Item().Row(line =>
                {
                    line.RelativeItem().Element(x => LabelValue(x, "Fecha de orden", Date(detail.FechaOrden), false));
                    line.RelativeItem().Element(x => LabelValue(x, "Fecha de llegada", Date(detail.FechaLlegada), false));
                });
            });

            row.ConstantItem(76).PaddingLeft(8).Border(0.7f).BorderColor(Border).CornerRadius(5).Padding(5).Column(qrCard =>
            {
                if (qr != null)
                {
                    qrCard.Item().Height(55).AlignCenter().Image(qr).FitArea();
                }
                qrCard.Item().AlignCenter().Text(Text(detail.Folio)).SemiBold().FontSize(7.5f).FontColor(Navy);
            });
        });
    }

    private static void LabelValue(IContainer container, string label, string value, bool prominent)
    {
        container.PaddingHorizontal(4).Column(column =>
        {
            column.Item().Text(label).FontSize(7.2f).FontColor(Muted);
            column.Item().Text(value)
                .SemiBold()
                .FontSize(prominent ? 12 : 9)
                .FontColor(prominent ? Navy : Ink);
        });
    }

    private static void ComposeSummaryStrip(
        IContainer container,
        OrdenCompraPdfModel detail,
        IReadOnlyList<string> branches,
        string observations)
    {
        container.Border(0.7f).BorderColor(Border).CornerRadius(5).Background("#FBFDFF").PaddingVertical(6).PaddingHorizontal(8).Row(row =>
        {
            row.RelativeItem(1.25f).Element(x => SummaryItem(x, "Razón social", Text(detail.RazonSocial)));
            row.RelativeItem(1.35f).Element(x => SummaryItem(x, "Sucursales", Text(string.Join(", ", branches))));
            row.RelativeItem(1.0f).Element(x => SummaryItem(x, "Proveedor", Text(detail.Proveedor)));
            row.RelativeItem(1.15f).Element(x => SummaryItem(x, "Vigencia", $"Mín. {Date(detail.FechaMinima)}\nMáx. {Date(detail.FechaMaxima)}"));
            row.RelativeItem(0.55f).Element(x => SummaryItem(x, "Partidas", detail.Partidas.Count.ToString(CultureInfo.InvariantCulture)));
            row.RelativeItem(1.25f).Element(x => SummaryItem(x, "Observaciones", Compact(observations, 90)));
        });
    }

    private static void SummaryItem(IContainer container, string label, string value)
    {
        container.BorderRight(0.5f).BorderColor(Border).PaddingHorizontal(7).Column(column =>
        {
            column.Item().Text(label).FontSize(7).FontColor(Muted);
            column.Item().Text(Compact(value, 70)).SemiBold().FontSize(7.8f).FontColor(Ink);
        });
    }

    private static void ComposeMatrix(
        IContainer container,
        IReadOnlyList<PdfProductGroup> groups,
        IReadOnlyList<string> branches,
        IReadOnlyDictionary<string, PdfTotals> orderBranchTotals,
        PdfTotals orderTotals)
    {
        int columnCount = 4 + ((branches.Count + 1) * 2);

        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(46);
                columns.RelativeColumn(2.3f);
                columns.RelativeColumn(1.35f);
                columns.RelativeColumn(1.05f);
                foreach (string _ in branches.Append("Total"))
                {
                    columns.RelativeColumn(0.62f);
                    columns.RelativeColumn(1.02f);
                }
            });

            table.Header(header =>
            {
                HeaderBase(header.Cell(), "Código");
                HeaderBase(header.Cell(), "Producto o servicio");
                HeaderBase(header.Cell(), "Variante / Presentación");
                HeaderBase(header.Cell(), "Unidad");
                foreach (string branch in branches)
                {
                    HeaderGroup(header.Cell(), branch);
                }
                HeaderGroup(header.Cell(), "Total");

                foreach (string _ in branches.Append("Total"))
                {
                    HeaderSub(header.Cell(), "Cant.");
                    HeaderSub(header.Cell(), "Importe");
                }
            });

            foreach (IGrouping<byte, PdfProductGroup> typeGroup in groups.GroupBy(group => group.Type).OrderBy(group => group.Key))
            {
                string typeName = typeGroup.Key == 1 ? "PRODUCTO" : "SERVICIO";
                table.Cell().ColumnSpan((uint)columnCount).Background(PaleBlue).PaddingVertical(4).PaddingHorizontal(7)
                    .Text(typeName).Bold().FontSize(8).FontColor(Navy);

                foreach (PdfProductGroup group in typeGroup)
                {
                    uint rows = (uint)Math.Max(group.Rows.Count, 1);
                    table.Cell().RowSpan(rows).Element(x => MatrixCell(x, group.Code, true, TextHorizontalAlignment.Center));
                    table.Cell().RowSpan(rows).Element(x => ProductCell(x, group));
                    for (int index = 0; index < group.Rows.Count; index++)
                    {
                        PdfVariantRow variant = group.Rows[index];
                        table.Cell().Element(x => MatrixCell(x, variant.Identity, false));
                        if (index == 0)
                        {
                            table.Cell().RowSpan(rows).Element(x => MatrixCell(x, group.Unit, false));
                        }
                        foreach (string branch in branches)
                        {
                            PdfTotals totals = variant.ByBranch.TryGetValue(branch, out PdfTotals value) ? value : PdfTotals.Empty;
                            table.Cell().Element(x => MatrixCell(x, Quantity(totals.Quantity), false, TextHorizontalAlignment.Right));
                            table.Cell().Element(x => MatrixCell(x, Money(totals.Amount), false, TextHorizontalAlignment.Right));
                        }
                        table.Cell().Element(x => MatrixCell(x, Quantity(variant.Total.Quantity), true, TextHorizontalAlignment.Right));
                        table.Cell().Element(x => MatrixCell(x, Money(variant.Total.Amount), true, TextHorizontalAlignment.Right));
                    }

                    table.Cell().ColumnSpan(4).Background(PaleBlue).BorderBottom(0.5f).BorderColor(Border).PaddingVertical(3).PaddingHorizontal(5)
                        .AlignRight().Text($"Subtotal {(group.Type == 1 ? "producto" : "servicio")} {group.Code}")
                        .SemiBold().FontSize(7.5f).FontColor(Navy);
                    foreach (string branch in branches)
                    {
                        PdfTotals subtotal = group.ByBranch.TryGetValue(branch, out PdfTotals value) ? value : PdfTotals.Empty;
                        table.Cell().Element(x => MatrixSubtotalCell(x, Quantity(subtotal.Quantity)));
                        table.Cell().Element(x => MatrixSubtotalCell(x, Money(subtotal.Amount)));
                    }
                    table.Cell().Element(x => MatrixSubtotalCell(x, Quantity(group.Total.Quantity), true));
                    table.Cell().Element(x => MatrixSubtotalCell(x, Money(group.Total.Amount), true));
                }
            }

            table.Cell().ColumnSpan(4).Background(Navy).PaddingVertical(5).PaddingHorizontal(6)
                .AlignRight().Text("TOTAL DE LA ORDEN").Bold().FontSize(9).FontColor(Colors.White);
            foreach (string branch in branches)
            {
                PdfTotals totals = orderBranchTotals[branch];
                table.Cell().Element(x => MatrixTotalCell(x, Quantity(totals.Quantity)));
                table.Cell().Element(x => MatrixTotalCell(x, Money(totals.Amount)));
            }
            table.Cell().Element(x => MatrixTotalCell(x, Quantity(orderTotals.Quantity)));
            table.Cell().Element(x => MatrixTotalCell(x, Money(orderTotals.Amount)));
        });
    }

    private static void HeaderBase(ITableCellContainer container, string text)
    {
        container.RowSpan(2).Background(Navy).BorderRight(0.5f).BorderColor("#6F89A8").Padding(5)
            .AlignMiddle().Text(text).SemiBold().FontSize(7.3f).FontColor(Colors.White);
    }

    private static void HeaderGroup(ITableCellContainer container, string text)
    {
        container.ColumnSpan(2).Background(Navy).BorderRight(0.5f).BorderColor("#6F89A8").PaddingVertical(4).PaddingHorizontal(3)
            .AlignCenter().Text(Compact(text, 28)).SemiBold().FontSize(7.3f).FontColor(Colors.White);
    }

    private static void HeaderSub(ITableCellContainer container, string text)
    {
        container.Element(cell => cell.Background(Navy).BorderTop(0.5f).BorderRight(0.5f).BorderColor("#6F89A8")
            .PaddingVertical(3).PaddingHorizontal(2).AlignCenter().Text(text).SemiBold().FontSize(6.8f).FontColor(Colors.White));
    }

    private static void ProductCell(IContainer container, PdfProductGroup group)
    {
        container.Background(Colors.White).BorderBottom(0.5f).BorderColor(Border).PaddingVertical(4).PaddingHorizontal(6).Column(column =>
        {
            column.Spacing(1);
            column.Item().Text(Compact(group.Name, 55)).SemiBold().FontSize(8.3f).FontColor(Ink);
            if (!string.IsNullOrWhiteSpace(group.Description))
            {
                string description = group.Type == 2
                    ? group.Description
                    : Compact(group.Description, 115);
                column.Item().Text(description).FontSize(7).FontColor(Muted);
            }
            if (!string.IsNullOrWhiteSpace(group.Catalog))
            {
                column.Item().Text(Compact(group.Catalog, 60)).FontSize(6.8f).FontColor(Navy);
            }
        });
    }

    private static void MatrixCell(IContainer container, string value, bool bold, TextHorizontalAlignment alignment = TextHorizontalAlignment.Left)
    {
        IContainer cell = container.Background(Colors.White).BorderBottom(0.5f).BorderRight(0.5f).BorderColor(Border).PaddingVertical(3.5f).PaddingHorizontal(4);
        cell = alignment switch
        {
            TextHorizontalAlignment.Right => cell.AlignRight(),
            TextHorizontalAlignment.Center => cell.AlignCenter(),
            _ => cell.AlignLeft()
        };
        TextBlockDescriptor text = cell.Text(Text(value)).FontSize(7.4f).FontColor(Ink);
        if (bold)
        {
            text.SemiBold();
        }
    }

    private static void MatrixSubtotalCell(IContainer container, string value, bool strong = false)
    {
        TextBlockDescriptor text = container.Background(PaleBlue).BorderBottom(0.5f).BorderRight(0.5f).BorderColor(Border)
            .PaddingVertical(3).PaddingHorizontal(3).AlignRight().Text(value).FontSize(7.2f).FontColor(Navy);
        if (strong)
        {
            text.Bold();
        }
    }

    private static void MatrixTotalCell(IContainer container, string value)
    {
        container.Background(Navy).BorderRight(0.5f).BorderColor("#6F89A8").PaddingVertical(5).PaddingHorizontal(3)
            .AlignRight().Text(value).Bold().FontSize(7.6f).FontColor(Colors.White);
    }

    private static void ComposeOrderSummary(IContainer container, PdfTotals totals)
    {
        container.Background(PaleBlue).CornerRadius(4).PaddingVertical(5).PaddingHorizontal(9).Text(text =>
        {
            text.Span($"Total pedido: {Quantity(totals.Quantity)} pzas").SemiBold().FontColor(Navy);
            text.Span("   |   ").FontColor(Muted);
            text.Span($"Importe: {Money(totals.Amount)}").Bold().FontColor(Navy);
        });
    }

    private static void ComposeObservations(IContainer container, string observations)
    {
        container.Border(0.7f).BorderColor(Border).CornerRadius(5).PaddingVertical(6).PaddingHorizontal(9).Column(column =>
        {
            column.Item().Text("Observaciones").SemiBold().FontSize(8).FontColor(Navy);
            column.Item().Text(observations).FontSize(7.4f).FontColor(Muted);
        });
    }

    private static void ComposeSignatures(IContainer container, string creatorName, string creatorRole)
    {
        container.Row(row =>
        {
            row.RelativeItem().Element(x => SignatureBox(x, "Elaboró", creatorName, creatorRole));
            row.ConstantItem(10);
            row.RelativeItem().Element(x => SignatureBox(x, "Autorizó", string.Empty, string.Empty));
        });
    }

    private static void SignatureBox(IContainer container, string title, string name, string role)
    {
        container.Border(0.7f).BorderColor(Border).CornerRadius(5).Padding(7).Column(column =>
        {
            column.Spacing(2);
            column.Item().Text(title).SemiBold().FontSize(8).FontColor(Blue);
            column.Item().MinHeight(10).Text(string.IsNullOrWhiteSpace(name) ? " " : name).SemiBold().FontSize(7.5f);
            column.Item().MinHeight(9).Text(string.IsNullOrWhiteSpace(role) ? " " : role).FontSize(6.8f).FontColor(Muted);
            column.Item().PaddingTop(5).LineHorizontal(0.7f).LineColor(Navy);
            column.Item().AlignCenter().Text("Firma").FontSize(6.8f).FontColor(Muted);
        });
    }

    private static IReadOnlyList<PdfProductGroup> BuildGroups(OrdenCompraPdfModel detail, IReadOnlyList<string> branches)
    {
        return detail.Partidas
            .GroupBy(item => new
            {
                item.TipoProductoServicio,
                item.IdProductoServicio,
                Code = Normalize(item.Codigo),
                Name = Normalize(item.Nombre),
                Description = Normalize(item.Descripcion),
                Category = Normalize(item.Categoria),
                Brand = Normalize(item.Marca),
                Unit = BuildUnit(item)
            })
            .Select(product =>
            {
                IReadOnlyList<PdfVariantRow> rows = product
                    .GroupBy(item => new
                    {
                        item.IdVariante,
                        item.IdPresentacionCompra,
                        Variant = Normalize(item.VarianteSnapshot),
                        Presentation = Normalize(item.PresentacionCompraSnapshot)
                    })
                    .Select(variant => new PdfVariantRow(
                        BuildIdentity(product.Key.TipoProductoServicio, variant.Key.Variant, variant.Key.Presentation),
                        branches.ToDictionary(
                            branch => branch,
                            branch => Sum(variant.Where(item => Same(item.Sucursal, branch)))),
                        Sum(variant)))
                    .OrderBy(row => row.Identity, StringComparer.OrdinalIgnoreCase)
                    .ToList();

                return new PdfProductGroup(
                    product.Key.TipoProductoServicio,
                    Text(product.Key.Code),
                    Text(product.Key.Name),
                    product.Key.Description,
                    string.Join(" · ", new[] { product.Key.Category, product.Key.Brand }.Where(value => !string.IsNullOrWhiteSpace(value))),
                    Text(product.Key.Unit),
                    rows,
                    branches.ToDictionary(
                        branch => branch,
                        branch => Sum(product.Where(item => Same(item.Sucursal, branch)))),
                    Sum(product));
            })
            .OrderBy(group => group.Type)
            .ThenBy(group => group.Code, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static IReadOnlyList<string> ResolveBranches(OrdenCompraPdfModel detail)
    {
        List<string> fromDestinations = detail.Sucursales
            .Select(item => Normalize(item.Nombre))
            .Where(item => !string.IsNullOrWhiteSpace(item))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        IEnumerable<string> source = fromDestinations.Count > 0
            ? fromDestinations
            : detail.Partidas.Select(item => Normalize(item.Sucursal));

        List<string> branches = source
            .Where(item => !string.IsNullOrWhiteSpace(item))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(item => item, StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (branches.Count == 0 && !string.IsNullOrWhiteSpace(detail.Sucursal))
        {
            branches.Add(detail.Sucursal.Trim());
        }

        return branches.Count == 0 ? new[] { "Sin sucursal" } : branches;
    }

    private static PdfTotals Sum(IEnumerable<OrdenCompraPdfPartida> items)
    {
        return new PdfTotals(items.Sum(item => item.CantidadBaseOrdenada), items.Sum(item => item.Subtotal));
    }

    private static string BuildIdentity(byte type, string variant, string presentation)
    {
        if (type != 1)
        {
            return "-";
        }

        string identity = string.Join(" · ", new[] { variant, presentation }.Where(value => !string.IsNullOrWhiteSpace(value)));
        return Text(identity);
    }

    private static string BuildUnit(OrdenCompraPdfPartida item)
    {
        if (!string.IsNullOrWhiteSpace(item.PresentacionCompraSnapshot) && !string.IsNullOrWhiteSpace(item.UnidadCompraSnapshot))
        {
            return FormatUnit(item.UnidadCompraSnapshot, item.UnidadCompraAbreviaturaSnapshot);
        }

        return FormatUnit(item.UnidadMedida, item.UnidadAbreviatura);
    }

    private static string FormatUnit(string? name, string? abbreviation)
    {
        string normalizedName = Normalize(name);
        string normalizedAbbreviation = Normalize(abbreviation);
        if (!string.IsNullOrWhiteSpace(normalizedName) && !string.IsNullOrWhiteSpace(normalizedAbbreviation))
        {
            return $"{normalizedName} ({normalizedAbbreviation})";
        }
        return Text(normalizedName.Length > 0 ? normalizedName : normalizedAbbreviation);
    }

    private static byte[]? BuildQr(OrdenCompraPdfModel detail)
    {
        string payload = string.Join("|", new[]
        {
            "OC",
            Text(detail.Folio),
            Text(detail.Proveedor),
            Date(detail.FechaOrden),
            Money(detail.Total)
        });

        using QRCodeGenerator generator = new();
        using QRCodeData data = generator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q);
        return new PngByteQRCode(data).GetGraphic(12, new byte[] { 23, 54, 93 }, new byte[] { 255, 255, 255 }, true);
    }

    private static string ResolveState(OrdenCompraPdfModel detail)
    {
        string normalized = Normalize(detail.EstadoNombre).ToLowerInvariant();
        return detail.Estado switch
        {
            1 => "Borrador",
            2 => "Generada",
            3 => "Cancelada",
            4 => "Parcialmente recibida",
            5 => "Recibida",
            _ => string.IsNullOrWhiteSpace(normalized) ? "Borrador" : detail.EstadoNombre.Trim()
        };
    }

    private static string Date(DateTime value) => value.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture);
    private static string Date(DateTime? value) => value.HasValue ? Date(value.Value) : "-";
    private static string Money(decimal value) => value.ToString("$#,##0.00", MexicanCulture);
    private static string Quantity(decimal value) => value.ToString("0.####", MexicanCulture);
    private static bool Same(string? left, string? right) => string.Equals(Normalize(left), Normalize(right), StringComparison.OrdinalIgnoreCase);
    private static string Normalize(string? value) => value?.Trim() ?? string.Empty;
    private static string Text(string? value) => string.IsNullOrWhiteSpace(value) ? "-" : value.Trim();

    private static string Compact(string? value, int maxLength)
    {
        string normalized = Normalize(value);
        return normalized.Length <= maxLength ? normalized : $"{normalized[..Math.Max(1, maxLength - 1)].TrimEnd()}…";
    }

    private sealed record PdfTotals(decimal Quantity, decimal Amount)
    {
        public static PdfTotals Empty { get; } = new(0m, 0m);
    }

    private sealed record PdfVariantRow(string Identity, IReadOnlyDictionary<string, PdfTotals> ByBranch, PdfTotals Total);

    private sealed record PdfProductGroup(
        byte Type,
        string Code,
        string Name,
        string Description,
        string Catalog,
        string Unit,
        IReadOnlyList<PdfVariantRow> Rows,
        IReadOnlyDictionary<string, PdfTotals> ByBranch,
        PdfTotals Total);
}

internal sealed class OrdenCompraPdfModel
{
    public Guid Id { get; set; }
    public string Folio { get; set; } = string.Empty;
    public string RazonSocial { get; set; } = string.Empty;
    public string Sucursal { get; set; } = string.Empty;
    public List<OrdenCompraPdfSucursal> Sucursales { get; set; } = new();
    public string Proveedor { get; set; } = string.Empty;
    public DateTime FechaOrden { get; set; }
    public DateTime? FechaLlegada { get; set; }
    public DateTime? FechaMinima { get; set; }
    public DateTime? FechaMaxima { get; set; }
    public byte Estado { get; set; }
    public string EstadoNombre { get; set; } = string.Empty;
    public string Observaciones { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal Total { get; set; }
    public Guid? IdUsuarioCreacion { get; set; }
    public string UsuarioCreacionNombre { get; set; } = string.Empty;
    public string UsuarioCreacionPuesto { get; set; } = string.Empty;
    public List<OrdenCompraPdfPartida> Partidas { get; set; } = new();
}

internal sealed class OrdenCompraPdfSucursal
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
}

internal sealed class OrdenCompraPdfPartida
{
    public int NumeroPartida { get; set; }
    public Guid IdProductoServicio { get; set; }
    public byte TipoProductoServicio { get; set; }
    public Guid? IdVariante { get; set; }
    public Guid? IdPresentacionCompra { get; set; }
    public string Sucursal { get; set; } = string.Empty;
    public string TipoProductoServicioNombre { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string VarianteSnapshot { get; set; } = string.Empty;
    public string PresentacionCompraSnapshot { get; set; } = string.Empty;
    public string UnidadMedida { get; set; } = string.Empty;
    public string UnidadAbreviatura { get; set; } = string.Empty;
    public string UnidadCompraSnapshot { get; set; } = string.Empty;
    public string UnidadCompraAbreviaturaSnapshot { get; set; } = string.Empty;
    public decimal CantidadBaseOrdenada { get; set; }
    public decimal Subtotal { get; set; }
}
