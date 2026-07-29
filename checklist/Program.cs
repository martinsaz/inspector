using checklist.Services;
//using ElmahCore.Mvc;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http.Features;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<EmailServices>();

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 8589934592; // 5 GB en bytes
});

builder.Services.Configure<FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = int.MaxValue; // Permitir archivos grandes
});

// Add services to the container.
builder.Services.AddControllersWithViews()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.SuppressModelStateInvalidFilter = true;
    });

// Registrar IHttpClientFactory
builder.Services.AddHttpClient();

// Manejo de autenticación por cookies
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(option =>
    {
        option.LoginPath = "/Login/Index";
        option.ExpireTimeSpan = TimeSpan.FromMinutes(90); // Coincide con el tiempo de sesión
        option.SlidingExpiration = true; // Renovar cookie de sesión al interactuar
    });

// Añadir soporte para Response Caching
builder.Services.AddResponseCaching();

// Añadir soporte para la sesión
builder.Services.AddDistributedMemoryCache();



// Si usas Redis, esta configuración es útil para ambientes distribuidos
/*
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379"; // Configuración de Redis
    options.InstanceName = "YourAppName";
});
*/

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(90); // Configurar el tiempo de inactividad
    options.Cookie.HttpOnly = true; // Hacer la cookie de sesión accesible solo por HTTP
    options.Cookie.IsEssential = true; // Marcar la cookie como esencial para que no sea bloqueada por consentimiento de cookies
});

// Añadir Elmah para el manejo de errores
//builder.Services.AddElmah(options => options.Path = "/elmah");

var app = builder.Build();

// Configurar el pipeline HTTP
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Manejo de autenticación por cookies
app.UseAuthentication();
app.UseAuthorization();

// Habilitar el uso de la sesión antes de mapear rutas
app.UseSession();

// Middleware para depuración de sesión (opcional)
app.Use(async (context, next) =>
{
    try
    {
        var empresa = context.Session.GetString("empresa");
        //if (string.IsNullOrEmpty(empresa))
        //{
        //    Console.WriteLine("La sesión 'empresa' está vacía o no existe.");
        //}
        //else
        //{
        //    Console.WriteLine($"Valor de 'empresa' en la sesión: {empresa}");
        //}
        await next.Invoke();
    }
    catch (Exception ex) { }
});

// Mapear rutas
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Login}/{action=Index}/{id?}");

app.MapControllerRoute(
    name: "areaRoute",
    pattern: "{area:exists}/{controller=Home}/{action=Index}/{Id?}");

// Usar Elmah para el manejo de errores
//app.UseElmah();

app.Run();







//using ElmahCore.Mvc;
//using Microsoft.AspNetCore.Authentication.Cookies;

//var builder = WebApplication.CreateBuilder(args);

//// Add services to the container.
//builder.Services.AddControllersWithViews();

//// Registrar IHttpClientFactory
//builder.Services.AddHttpClient();

//// Manejo de autenticación por cookies
//builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
//    .AddCookie(option =>
//    {
//        option.LoginPath = "/Login/Index";
//        option.ExpireTimeSpan = TimeSpan.FromMinutes(90);
//    });

//// Añadir soporte para Response Caching
//builder.Services.AddResponseCaching();

//// Añadir soporte para la sesión
//builder.Services.AddDistributedMemoryCache(); // Usar almacenamiento en memoria para la sesión
//builder.Services.AddSession(options =>
//{
//    options.IdleTimeout = TimeSpan.FromMinutes(90); // Configurar el tiempo de inactividad
//    options.Cookie.HttpOnly = true; // Hacer la cookie de sesión accesible solo por HTTP
//    options.Cookie.IsEssential = true; // Marcar la cookie como esencial para que no sea bloqueada por consentimiento de cookies
//});

////
//builder.Services.AddElmah(options => options.Path = "/elmah");

//var app = builder.Build();

//// Configure the HTTP request pipeline.
//if (!app.Environment.IsDevelopment())
//{
//    app.UseExceptionHandler("/Home/Error");
//    app.UseHsts();
//}

//app.UseHttpsRedirection();
//app.UseStaticFiles();

//app.UseRouting();

//// Manejo de autenticación por cookies
//app.UseAuthentication();
//app.UseAuthorization();

//// Habilitar el uso de la sesión antes de mapear rutas
//app.UseSession(); // Es importante que esto esté antes de los endpoints

//// Mapear rutas
//app.MapControllerRoute(
//    name: "default",
//    pattern: "{controller=Login}/{action=Index}/{id?}");

//app.MapControllerRoute(
//    name: "areaRoute",
//    pattern: "{area:exists}/{controller=Home}/{action=Index}/{Id?}");

//app.UseElmah();

//app.Run();
