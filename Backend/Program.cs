using AdminRobin.Data;
using AdminRobin.Data.Repositories;
using AdminRobin.Services.Interfaces;
using AdminRobin.Services.Implementations;
using AdminRobin.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Database configuration - MySQL
builder.Services.AddDbContext<AdminRobinDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

// Repository registration
builder.Services.AddScoped<GenericRepository<User>>();
builder.Services.AddScoped<GenericRepository<UserType>>();
builder.Services.AddScoped<GenericRepository<ActionType>>();
builder.Services.AddScoped<GenericRepository<PauseEvent>>();
builder.Services.AddScoped<LogsRepository>();
builder.Services.AddScoped<PagesRepository>();
builder.Services.AddScoped<AdminRobin.Data.Repositories.IUsersRepository, AdminRobin.Data.Repositories.UsersRepository>();
builder.Services.AddScoped<GenericRepository<AdminRobin.Models.Entities.RevokedToken>>();

// Service registration

builder.Services.AddScoped<ILogService, LogService>();
builder.Services.AddScoped<IPageService, PageService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAdminService, AdminService>(); // ⬅️ AGREGAR ESTA LÍNEA
builder.Services.AddScoped<ICsvExportService, CsvExportService>();
builder.Services.AddScoped<IPptExportService, PptExportService>();
builder.Services.AddScoped<AdminRobin.Services.Interfaces.ITokenBlacklistService, AdminRobin.Services.Implementations.TokenBlacklistService>();


// JWT Authentication
var jwtSecret = builder.Configuration["Jwt:SecretKey"] ?? builder.Configuration["Jwt:Key"] ?? string.Empty;
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = !string.IsNullOrEmpty(jwtSecret),
            IssuerSigningKey = !string.IsNullOrEmpty(jwtSecret) ? new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)) : null,
            ValidateIssuer = !string.IsNullOrEmpty(jwtIssuer),
            ValidIssuer = jwtIssuer,
            ValidateAudience = !string.IsNullOrEmpty(jwtAudience),
            ValidAudience = jwtAudience,
            RequireExpirationTime = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        // Check if token has been revoked
        options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                try
                {
                    var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(' ').Last();
                    if (string.IsNullOrEmpty(token)) return;

                    var blacklist = context.HttpContext.RequestServices.GetService(typeof(AdminRobin.Services.Interfaces.ITokenBlacklistService)) as AdminRobin.Services.Interfaces.ITokenBlacklistService;
                    if (blacklist == null) return;

                    var isRevoked = await blacklist.IsTokenRevokedAsync(token);
                    if (isRevoked)
                    {
                        context.Fail("Token revoked");
                    }
                }
                catch (Exception)
                {
                    // Si hay cualquier error al comprobar la blacklist (p.ej. tabla no existente), no fallamos la autenticación.
                }
            }
        };
    });

builder.Services.AddAuthorization();

// CORS (if needed for frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "AdminRobin API", Version = "v1" });

    // JWT configuration for Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement()
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AdminRobinDbContext>();
    context.Database.EnsureCreated();
}

app.Run();