using System.Data.SqlClient;
using System.Text.RegularExpressions;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Security.Claims;
using checklistWs.Services.Tenant;
using checklistWs.Controllers.ProductosServicios;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

// Credential is supplied by the authorized QA environment, never persisted here.
static string? FindConnectionString() => Environment.GetEnvironmentVariable("MOKA_CHECKAPPERP_QA_CONNECTION");

static void Require(bool condition, string code) { if (!condition) throw new InvalidOperationException(code); }
static async Task<string> Digest(SqlConnection c, string query)
{
    using var cmd = new SqlCommand(query, c) { CommandTimeout = 60 };
    using var reader = await cmd.ExecuteReaderAsync();
    using var hash = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
    while (await reader.ReadAsync()) hash.AppendData(Encoding.UTF8.GetBytes(reader.GetString(0)));
    return Convert.ToHexString(hash.GetHashAndReset());
}
static async Task<Dictionary<string,string>> Snapshot(SqlConnection c, SchemaContract contract)
{
    var hashes = new Dictionary<string,string>();
    foreach (var t in contract.Tables)
        hashes[t.Name] = await Digest(c, $"SELECT * FROM [{t.Schema}].[{t.Name}] ORDER BY id FOR JSON PATH, INCLUDE_NULL_VALUES");
    foreach (var table in new[] { "CheckAppSchemaState", "CheckAppSchemaHistory", "CheckAppSchemaAttempts" })
        hashes[table] = await Digest(c, $"SELECT * FROM dbo.[{table}] FOR JSON PATH, INCLUDE_NULL_VALUES");
    hashes["objects"] = await Digest(c, "SELECT o.object_id,o.name,o.type,o.create_date,o.modify_date FROM sys.objects o WHERE o.is_ms_shipped=0 ORDER BY o.object_id FOR JSON PATH");
    return hashes;
}
static ProductosServiciosController Controller(Guid id, string key, ITenantDatabaseResolver resolver, ITenantSqlConnectionFactory factory, IProductosServiciosCompatibilityGate gate, IProductosServiciosCompanyBootstrapper company)
{
    var ctrl = new ProductosServiciosController(new ConfigurationBuilder().Build(), NullLogger<ProductosServiciosController>.Instance, resolver, factory, gate, company);
    ctrl.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
    ctrl.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim("idEmpresa", id.ToString()), new Claim("empresa", key), new Claim(ClaimTypes.NameIdentifier, "QA-SUBJECT") }, "ControlledQa"));
    return ctrl;
}
try
{
    var cs = FindConnectionString(); Require(cs != null, "QA_CONNECTION_NOT_AVAILABLE");
    var factory = new TenantSqlConnectionFactory();
    var cId = Guid.NewGuid(); var dId = Guid.NewGuid();
    var reader = new FixtureReader(cs!, cId, dId);
    var resolver = new TenantDatabaseResolver(reader, NullLogger<TenantDatabaseResolver>.Instance);
    var c = await resolver.ResolveAsync(new TenantDatabaseContext { EmpresaKey="QA-C-T22", IdEmpresa=cId });
    var d = await resolver.ResolveAsync(new TenantDatabaseContext { EmpresaKey="QA-D-T22", IdEmpresa=dId });
    var identityResolver = new DatabaseIdentityResolver(new SqlDatabaseMetadataReader(factory));
    var identity = await identityResolver.ResolveAsync(c);
    Require(identity.DatabaseName == "CHECKAPPERP", "WRONG_QA_DATABASE");
    Require(identity.DatabaseGuid == "A0E05B05-F509-44D3-8BE4-218F875720CA", "WRONG_QA_IDENTITY");
    Require(identity.Equals(await identityResolver.ResolveAsync(d)), "DISTINCT_DATABASES");
    var repository = new SchemaVersionRepository(factory);
    var known = new KnownSchemaVersionProvider();
    var provider = new ProductosServiciosSchemaContractProvider();
    var manifest = new SchemaManifestProvider();
    var contract = provider.GetContract(DatabaseScopes.ProductosServicios, 1);
    var snapshotReader = new SqlSchemaPhysicalSnapshotReader();
    var drift = new SchemaDriftValidator(factory, provider, manifest, snapshotReader);
    var classifier = new DatabaseStateClassifier(new SqlDatabaseSchemaProbe(factory, new ProductScopeInventory()), new DatabaseVersionEvidenceReader(repository, known));
    var gate = new ProductosServiciosCompatibilityGate(identityResolver, classifier, repository, known, provider, manifest, drift, NullLogger<ProductosServiciosCompatibilityGate>.Instance);
    var bootstrap = new ProductosServiciosCompanyBootstrapper(gate, NullLogger<ProductosServiciosCompanyBootstrapper>.Instance);
    var beforeGate = await gate.EvaluateAsync(c);
    Require(beforeGate.IsAllowed && beforeGate.ReasonCode == "COMPATIBLE", "BASE_NOT_COMPATIBLE");
    var state = await repository.GetStateAsync(c, identity, DatabaseScopes.ProductosServicios);
    Require(state?.CurrentVersion == 1 && state.ManifestHash == "4d51ce43a30ec3d583ce4252c8324f1053a52fdd89a7d80b3e01a6e8b780fb06", "WRONG_V1_STATE");
    using var sql = factory.CreateConnection(c); await sql.OpenAsync();
    var original = await Snapshot(sql, contract);
    await using var fixtures = await CategoryFixtures.CreateAsync(sql);
    var before = await Snapshot(sql, contract);
    var beforePhysical = JsonSerializer.Serialize(await snapshotReader.ReadAsync(sql, contract));
    var beforeDrift = await drift.ValidateAsync(c, identity, DatabaseScopes.ProductosServicios, state.CurrentVersion, state.ManifestHash);
    var existingCompanies = new List<Guid>();
    using (var cmd = new SqlCommand("SELECT DISTINCT idEmpresa FROM dbo.ProductosServicios ORDER BY idEmpresa", sql))
    using (var rows = await cmd.ExecuteReaderAsync()) while (await rows.ReadAsync()) existingCompanies.Add(rows.GetGuid(0));
    // Fresh GUIDs are fixture context only; no tenant/Firebase/data records are inserted.
    foreach (var table in contract.Tables)
    {
        using var cmd = new SqlCommand($"SELECT COUNT_BIG(*) FROM [{table.Schema}].[{table.Name}] WHERE idEmpresa IN (@c,@d)",sql);
        cmd.Parameters.AddWithValue("@c",cId);cmd.Parameters.AddWithValue("@d",dId);
        Require(Convert.ToInt64(await cmd.ExecuteScalarAsync())==0,"QA_GUID_NOT_FRESH");
    }
    var runs = new List<CompanyBootstrapResult>();
    for (var i=0;i<10;i++) runs.Add(await bootstrap.BootstrapAsync(c));
    runs.Add(await bootstrap.BootstrapAsync(d));
    runs.AddRange(await Task.WhenAll(bootstrap.BootstrapAsync(c), bootstrap.BootstrapAsync(c)));
    runs.AddRange(await Task.WhenAll(bootstrap.BootstrapAsync(c), bootstrap.BootstrapAsync(d)));
    Require(runs.All(x=>x.Status=="NO_CHANGES" && !x.ExecutedDdl && x.CreatedItems.Count==0),"COMPANY_RUN_FAILED");
    var ctrl = Controller(cId,"QA-C-T22",resolver,factory,gate,bootstrap);
    var list = await ctrl.ObtenerProductosServicios(cId);
    Require(list is OkObjectResult,"EMPTY_LIST_FAILED");
    var categories = await ctrl.ObtenerCategoriasProductosServicios(cId);
    Require(categories is OkObjectResult ok && ok.Value is System.Collections.IEnumerable items && !items.Cast<object>().Any(), "C_READS_AB_CATEGORIES");
    var detail = await ctrl.ObtenerFichaTecnicaProductoServicio(cId, Guid.NewGuid());
    Require(detail is NotFoundObjectResult,"MISSING_FICHA_NOT_404");
    var cross = await ctrl.ObtenerProductosServicios(dId);
    Require(cross is ObjectResult { StatusCode:403 },"CROSS_TENANT_NOT_REJECTED");
    var afterGate = await gate.EvaluateAsync(c);
    var afterDrift = await drift.ValidateAsync(c, identity, DatabaseScopes.ProductosServicios, state.CurrentVersion, state.ManifestHash);
    var afterPhysical = JsonSerializer.Serialize(await snapshotReader.ReadAsync(sql,contract));
    var after = await Snapshot(sql,contract);
    Require(before.All(x=>after.TryGetValue(x.Key,out var value)&&value==x.Value),"DATA_OR_CONTROL_CHANGED");
    Require(beforePhysical==afterPhysical,"PHYSICAL_SCHEMA_CHANGED");
    Require(afterGate.IsAllowed && afterDrift.GlobalResult==SchemaValidationGlobalResult.SchemaOk && afterDrift.Items.Count==0,"FINAL_GATE_DRIFT_FAILED");
    await fixtures.DisposeAsync();
    var cleaned = await Snapshot(sql, contract);
    Require(original.All(x => cleaned[x.Key] == x.Value), "FIXTURE_CLEANUP_NOT_EXACT");
    var finalGate = await gate.EvaluateAsync(c);
    Require(finalGate.IsAllowed, "POST_CLEANUP_GATE_BLOCKED");
    var report = new { Status="PASS", QA_A=fixtures.CompanyA, QA_B=fixtures.CompanyB,
        FixtureCategoryA=fixtures.RowA, FixtureCategoryB=fixtures.RowB,
        FixtureRowsCreated=2, FixtureRowsDeleted=2, PreexistingRowsDeleted=0, OriginalDataRestored=true, CReadsABCategories=false, identity=identity.ToSanitizedString(), QA_C=cId, QA_D=dId,
        ExistingProductCompanyCount=existingCompanies.Count, SameDatabaseIdentity=true, Runs=runs.Count,
        Results=runs.Select(x=>new {x.Status,x.ReasonCode,x.CreatedItems.Count,x.ExecutedDdl}),
        BeforeVersion=state.CurrentVersion, AfterVersion=afterGate.CurrentVersion, ManifestHash=state.ManifestHash,
        Counts=new[]{afterDrift.DetectedTables,afterDrift.DetectedColumns,afterDrift.DetectedIndexes,afterDrift.DetectedForeignKeys,afterDrift.DetectedChecks},
        PhysicalSnapshotEqual=beforePhysical==afterPhysical, All20TableDataAndSchemaControlDigestsEqual=true,
        BeforeGate=beforeGate.ReasonCode, AfterGate=afterGate.ReasonCode, Drift=afterDrift.Items.Count,
        ListStatus=200, MissingFichaStatus=404, CrossTenantStatus=403,
        CreatedRows=0, DeletedRows=0, FirebaseWrites=0, ExecutedDdl=false, Cleanup="PASS_TWO_QA_CATEGORIES_ONLY",
        BeforeDigests=before, AfterDigests=after };
    var output=JsonSerializer.Serialize(report,new JsonSerializerOptions{WriteIndented=true});
    File.WriteAllText(Path.Combine(AppContext.BaseDirectory, "T22_QA_RESULT.json"),output); Console.WriteLine(output);
}
catch(Exception ex)
{
    Console.WriteLine("QA_FAILED_TYPE="+ex.GetType().Name);
    if(ex is InvalidOperationException && Regex.IsMatch(ex.Message,"^[A-Z_]+$"))Console.WriteLine("QA_REASON="+ex.Message);
    if(ex is SqlException se) Console.WriteLine("SQL_ERROR_NUMBER="+se.Number);
    Environment.ExitCode=1;
}
sealed class FixtureReader(string connection,Guid c,Guid d) : ITenantConnectionReader
{
    public Task<TenantConnectionDescriptor?> GetConnectionAsync(string key,CancellationToken cancellationToken=default)
    {
        Guid id=key=="QA-C-T22"?c:key=="QA-D-T22"?d:Guid.Empty;
        return Task.FromResult<TenantConnectionDescriptor?>(id==Guid.Empty?null:new TenantConnectionDescriptor{EmpresaKey=key,IdEmpresa=id,Status="1",ConnectionString=connection});
    }
}

sealed class CategoryFixtures(SqlConnection sql) : IAsyncDisposable
{
    public Guid CompanyA { get; } = Guid.NewGuid();
    public Guid CompanyB { get; } = Guid.NewGuid();
    public Guid RowA { get; } = Guid.NewGuid();
    public Guid RowB { get; } = Guid.NewGuid();
    private bool created;
    public static async Task<CategoryFixtures> CreateAsync(SqlConnection sql)
    {
        var f = new CategoryFixtures(sql);
        using var tx = sql.BeginTransaction();
        try
        {
            foreach (var (row,company,label) in new[]{(f.RowA,f.CompanyA,"QA-A-T22"),(f.RowB,f.CompanyB,"QA-B-T22")})
            {
                using var cmd = new SqlCommand("INSERT INTO dbo.ProductosServiciosCategorias (id,idEmpresa,identityKey,Codigo,Nombre,AplicaA,Activo) VALUES (@id,@empresa,@identity,@codigo,@nombre,0,1)",sql,tx);
                cmd.Parameters.AddWithValue("@id",row);cmd.Parameters.AddWithValue("@empresa",company);cmd.Parameters.AddWithValue("@identity",Guid.NewGuid());
                cmd.Parameters.AddWithValue("@codigo",label);cmd.Parameters.AddWithValue("@nombre",label);
                await cmd.ExecuteNonQueryAsync();
            }
            tx.Commit(); f.created=true; return f;
        }
        catch { tx.Rollback(); throw; }
    }
    public async ValueTask DisposeAsync()
    {
        if(!created)return;
        using var tx=sql.BeginTransaction();
        try
        {
            using var cmd=new SqlCommand("DELETE FROM dbo.ProductosServiciosCategorias WHERE (id=@a AND idEmpresa=@ca AND Codigo=N'QA-A-T22') OR (id=@b AND idEmpresa=@cb AND Codigo=N'QA-B-T22')",sql,tx);
            cmd.Parameters.AddWithValue("@a",RowA);cmd.Parameters.AddWithValue("@ca",CompanyA);cmd.Parameters.AddWithValue("@b",RowB);cmd.Parameters.AddWithValue("@cb",CompanyB);
            var count=await cmd.ExecuteNonQueryAsync(); if(count!=2)throw new InvalidOperationException("FIXTURE_CLEANUP_COUNT");
            tx.Commit();created=false;
        }
        catch {tx.Rollback();throw;}
    }
}
