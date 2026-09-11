using SundarEmbroidery.Application;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<ICatalogService, DemoCatalogService>();
builder.Services.AddProblemDetails();
builder.Services.AddCors(o=>o.AddDefaultPolicy(p=>p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
var app = builder.Build();
app.UseExceptionHandler();
app.UseCors();
app.MapGet("/api/health",()=>Results.Ok(new { status="ok" }));
app.MapGet("/api/businesses/{id:guid}",(Guid id,ICatalogService s)=>s.GetBusiness().Id==id?Results.Ok(s.GetBusiness()):Results.NotFound());
app.MapGet("/api/categories",(ICatalogService s)=>s.GetCategories());
app.MapGet("/api/products",(Guid? categoryId,bool? bulk,ICatalogService s)=>s.GetProducts(categoryId,bulk));
app.MapGet("/api/products/{id:guid}",(Guid id,ICatalogService s)=>s.GetProduct(id) is { } p?Results.Ok(p):Results.NotFound());
app.MapGet("/api/search/products",(string? pincode,Guid? category,bool? bulk,ICatalogService s)=>string.IsNullOrWhiteSpace(pincode)||s.ServicesPincode(pincode)?Results.Ok(s.GetProducts(category,bulk)):Results.Ok(Array.Empty<object>()));
app.Run();

public partial class Program { }
