using AspNetCoreRateLimit;
using backend.Data;
using backend.Helpers;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;
using backend.Middleware;
using AutoMapper;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Serilog kaldırıldı
// builder.Logging.ClearProviders ve AddSimpleConsole ile özelleştirilmiş log formatı eklendi
builder.Logging.ClearProviders();
builder.Logging.AddSimpleConsole(options =>
{
    options.IncludeScopes = true;
    options.SingleLine = false;
    options.TimestampFormat = "[HH:mm:ss] ";
    options.ColorBehavior = Microsoft.Extensions.Logging.Console.LoggerColorBehavior.Enabled;
});

// ✅ 1. Config'den JwtSettings al
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.SecretKey))
{
    throw new InvalidOperationException("JWT ayarları eksik!");
}
Console.WriteLine($"[JWT] Issuer: {jwtSettings.Issuer}, Audience: {jwtSettings.Audience}, SecretKey: {jwtSettings.SecretKey.Substring(0, 6)}...");
var key = Encoding.ASCII.GetBytes(jwtSettings.SecretKey);

// ✅ 2. DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=reservation.db"));

// ✅ 3. Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// ✅ 4. Authentication & JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        RoleClaimType = "role",
        NameClaimType = ClaimTypes.Name
    };
});

// ✅ 5. Authorization
builder.Services.AddAuthorization();

// ✅ 6. CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// ✅ 7. Rate Limiting
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// ✅ 8. Mail Servisi
builder.Services.Configure<MailSettings>(builder.Configuration.GetSection("MailSettings"));
builder.Services.AddScoped<MailService>();

// ✅ 8.5 AutoMapper
builder.Services.AddAutoMapper(typeof(backend.Models.VehicleProfile));

// ✅ 9. Swagger (JWT ile)
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Reservation API", Version = "v1" });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Bearer token giriniz",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    };
    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, new string[] {} }
    });
});

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.WriteIndented = true;
});

var app = builder.Build();

// ✅ 10. Middleware Sırası
//app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseIpRateLimiting();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Reservation API v1");
});

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ✅ 11. Role Seeder
try
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        // Veritabanını oluştur (eğer yoksa)
        context.Database.EnsureCreated();
        
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        await RoleSeeder.SeedRoles(roleManager);

        // Kullanıcıya admin rolü ata (kullanıcı adını güncelleyebilirsiniz)
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        await RoleSeeder.AddAdminRoleToUser(userManager, "merve"); // <-- Buraya admin yapmak istediğiniz kullanıcı adını yazın

        // @kaptandemir.com.tr ile biten tüm kullanıcılara admin rolü ata
        var allUsers = userManager.Users.ToList();
        foreach (var user in allUsers)
        {
            if (user.Email != null && user.Email.EndsWith("@kaptandemir.com.tr", StringComparison.OrdinalIgnoreCase))
            {
                if (!await userManager.IsInRoleAsync(user, "Admin"))
                {
                    await userManager.AddToRoleAsync(user, "Admin");
                    Console.WriteLine($"{user.Email} kullanıcısına Admin rolü atandı.");
                }
            }
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Veritabanı başlatma hatası: {ex.Message}");
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
}

app.Run();









