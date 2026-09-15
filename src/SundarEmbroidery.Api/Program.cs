using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using SundarEmbroidery.Application;
using Microsoft.EntityFrameworkCore;
using SundarEmbroidery.Domain;
using SundarEmbroidery.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");
var cloudinaryCloudName = builder.Configuration["Cloudinary:CloudName"];
var cloudinaryApiKey = builder.Configuration["Cloudinary:ApiKey"];
var cloudinaryApiSecret = builder.Configuration["Cloudinary:ApiSecret"];
if (string.IsNullOrWhiteSpace(cloudinaryCloudName)
    || string.IsNullOrWhiteSpace(cloudinaryApiKey)
    || string.IsNullOrWhiteSpace(cloudinaryApiSecret))
{
    throw new InvalidOperationException("Cloudinary configuration is incomplete.");
}
builder.Services.AddDbContext<SundarEmbroideryDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddSingleton<ICatalogService, DemoCatalogService>();
builder.Services.AddSingleton(new Cloudinary(new Account(cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret)));
builder.Services.AddProblemDetails();
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
{
    if (allowedOrigins.Length > 0)
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
}));
var app = builder.Build();
app.UseExceptionHandler();
app.UseCors();
app.MapGet("/api/health",()=>Results.Ok(new { status="ok" }));
app.MapGet("/api/businesses/{id:guid}",(Guid id,ICatalogService s)=>s.GetBusiness().Id==id?Results.Ok(s.GetBusiness()):Results.NotFound());
app.MapGet("/api/categories",(ICatalogService s)=>s.GetCategories());
app.MapGet("/api/products",(Guid? categoryId,bool? bulk,ICatalogService s)=>s.GetProducts(categoryId,bulk));
app.MapGet("/api/products/{id:guid}",(Guid id,ICatalogService s)=>s.GetProduct(id) is { } p?Results.Ok(p):Results.NotFound());
app.MapGet("/api/search/products",(string? pincode,Guid? category,bool? bulk,ICatalogService s)=>string.IsNullOrWhiteSpace(pincode)||s.ServicesPincode(pincode)?Results.Ok(s.GetProducts(category,bulk)):Results.Ok(Array.Empty<object>()));

var designs = app.MapGroup("/api/designs");
const long maxImageFileSize = 5 * 1024 * 1024;
var allowedImageTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
{
    [".jpg"] = "image/jpeg",
    [".jpeg"] = "image/jpeg",
    [".png"] = "image/png",
    [".webp"] = "image/webp"
};

designs.MapPost("/upload", async (IFormFile file, Cloudinary cloudinary, CancellationToken cancellationToken) =>
{
    if (file.Length == 0)
        return Results.ValidationProblem(new Dictionary<string, string[]> { ["file"] = ["An image file is required."] });

    if (file.Length > maxImageFileSize)
        return Results.Problem(statusCode: StatusCodes.Status413PayloadTooLarge, title: "The image cannot exceed 5 MB.");

    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
    if (!allowedImageTypes.TryGetValue(extension, out var expectedContentType)
        || !string.Equals(file.ContentType, expectedContentType, StringComparison.OrdinalIgnoreCase))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["file"] = ["Only JPG, JPEG, PNG, and WEBP images are allowed."]
        });
    }

    await using var stream = file.OpenReadStream();
    var uploadResult = await cloudinary.UploadAsync(new ImageUploadParams
    {
        File = new FileDescription(file.FileName, stream),
        Folder = "sundar-embroidery/designs",
        PublicId = Guid.NewGuid().ToString("N"),
        Overwrite = false
    }, cancellationToken);

    var imageUrl = uploadResult.SecureUrl?.ToString();
    if (uploadResult.Error is not null || string.IsNullOrWhiteSpace(imageUrl))
        return Results.Problem(statusCode: StatusCodes.Status502BadGateway, title: "Cloudinary could not upload the image.");

    return Results.Ok(new { imageUrl });
}).DisableAntiforgery();

designs.MapGet("", async (SundarEmbroideryDbContext db, CancellationToken cancellationToken) =>
    Results.Ok(await db.Designs
        .AsNoTracking()
        .Where(design => design.IsActive)
        .OrderByDescending(design => design.CreatedAt)
        .ToListAsync(cancellationToken)));

designs.MapGet("/admin", async (SundarEmbroideryDbContext db, CancellationToken cancellationToken) =>
    Results.Ok(await db.Designs
        .AsNoTracking()
        .OrderByDescending(design => design.CreatedAt)
        .ToListAsync(cancellationToken)));

designs.MapGet("/{id:guid}", async (Guid id, SundarEmbroideryDbContext db, CancellationToken cancellationToken) =>
{
    var design = await db.Designs.AsNoTracking().FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    return design is null ? Results.NotFound() : Results.Ok(design);
});

designs.MapPost("", async (DesignRequest request, SundarEmbroideryDbContext db, CancellationToken cancellationToken) =>
{
    var validationErrors = Validate(request);
    if (validationErrors.Count > 0)
        return Results.ValidationProblem(validationErrors);

    var design = new Design
    {
        Name = request.Name!.Trim(),
        Category = request.Category!.Trim(),
        Price = request.Price,
        ImageUrl = request.ImageUrl!.Trim(),
        IsActive = request.IsActive
    };

    db.Designs.Add(design);
    await db.SaveChangesAsync(cancellationToken);
    return Results.Created($"/api/designs/{design.Id}", design);
});

designs.MapPut("/{id:guid}", async (Guid id, DesignRequest request, SundarEmbroideryDbContext db, CancellationToken cancellationToken) =>
{
    var validationErrors = Validate(request);
    if (validationErrors.Count > 0)
        return Results.ValidationProblem(validationErrors);

    var design = await db.Designs.FindAsync([id], cancellationToken);
    if (design is null)
        return Results.NotFound();

    design.Name = request.Name!.Trim();
    design.Category = request.Category!.Trim();
    design.Price = request.Price;
    design.ImageUrl = request.ImageUrl!.Trim();
    design.IsActive = request.IsActive;
    await db.SaveChangesAsync(cancellationToken);
    return Results.Ok(design);
});

designs.MapPatch("/{id:guid}/visibility", async (Guid id, DesignVisibilityRequest request, SundarEmbroideryDbContext db, CancellationToken cancellationToken) =>
{
    var design = await db.Designs.FindAsync([id], cancellationToken);
    if (design is null)
        return Results.NotFound();

    design.IsActive = request.IsActive ?? !design.IsActive;
    await db.SaveChangesAsync(cancellationToken);
    return Results.Ok(design);
});

designs.MapDelete("/{id:guid}", async (Guid id, SundarEmbroideryDbContext db, CancellationToken cancellationToken) =>
{
    var design = await db.Designs.FindAsync([id], cancellationToken);
    if (design is null)
        return Results.NotFound();

    db.Designs.Remove(design);
    await db.SaveChangesAsync(cancellationToken);
    return Results.NoContent();
});

var enquiries = app.MapGroup("/api/enquiries");

enquiries.MapPost("", async (EnquiryRequest request, SundarEmbroideryDbContext db, CancellationToken cancellationToken) =>
{
    var validationErrors = ValidateEnquiry(request);
    if (validationErrors.Count > 0)
        return Results.ValidationProblem(validationErrors);

    if (request.DesignId.HasValue
        && !await db.Designs.AsNoTracking().AnyAsync(design => design.Id == request.DesignId.Value, cancellationToken))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [nameof(request.DesignId)] = ["The selected design does not exist."]
        });
    }

    var enquiry = new Enquiry
    {
        CustomerName = request.CustomerName!.Trim(),
        PhoneNumber = request.PhoneNumber!.Trim(),
        DesignId = request.DesignId,
        Quantity = request.Quantity,
        EnquiryType = NormalizeEnquiryType(request.EnquiryType!),
        RequiredDate = request.RequiredDate,
        Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
        ReferenceImageUrl = string.IsNullOrWhiteSpace(request.ReferenceImageUrl) ? null : request.ReferenceImageUrl.Trim()
    };

    db.Enquiries.Add(enquiry);
    await db.SaveChangesAsync(cancellationToken);
    return Results.Created($"/api/enquiries/{enquiry.Id}", enquiry);
});

enquiries.MapGet("/admin", async (SundarEmbroideryDbContext db, CancellationToken cancellationToken) =>
    Results.Ok(await db.Enquiries
        .AsNoTracking()
        .OrderByDescending(enquiry => enquiry.CreatedAt)
        .ToListAsync(cancellationToken)));

enquiries.MapPatch("/{id:guid}/status", async (Guid id, EnquiryStatusRequest request, SundarEmbroideryDbContext db, CancellationToken cancellationToken) =>
{
    var status = NormalizeEnquiryStatus(request.Status);
    if (status is null)
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [nameof(request.Status)] = ["Status must be New, Contacted, Quoted, or Closed."]
        });
    }

    var enquiry = await db.Enquiries.FindAsync([id], cancellationToken);
    if (enquiry is null)
        return Results.NotFound();

    enquiry.Status = status;
    await db.SaveChangesAsync(cancellationToken);
    return Results.Ok(enquiry);
});

app.Run();

static Dictionary<string, string[]> Validate(DesignRequest request)
{
    var errors = new Dictionary<string, string[]>();

    if (string.IsNullOrWhiteSpace(request.Name))
        errors[nameof(request.Name)] = ["Name is required."];
    else if (request.Name.Trim().Length > 200)
        errors[nameof(request.Name)] = ["Name cannot exceed 200 characters."];

    if (string.IsNullOrWhiteSpace(request.Category))
        errors[nameof(request.Category)] = ["Category is required."];
    else if (request.Category.Trim().Length > 100)
        errors[nameof(request.Category)] = ["Category cannot exceed 100 characters."];

    if (request.Price < 0)
        errors[nameof(request.Price)] = ["Price cannot be negative."];

    if (string.IsNullOrWhiteSpace(request.ImageUrl))
        errors[nameof(request.ImageUrl)] = ["ImageUrl is required."];
    else if (request.ImageUrl.Trim().Length > 1000)
        errors[nameof(request.ImageUrl)] = ["ImageUrl cannot exceed 1000 characters."];

    return errors;
}

static Dictionary<string, string[]> ValidateEnquiry(EnquiryRequest request)
{
    var errors = new Dictionary<string, string[]>();

    if (string.IsNullOrWhiteSpace(request.CustomerName))
        errors[nameof(request.CustomerName)] = ["CustomerName is required."];
    else if (request.CustomerName.Trim().Length > 150)
        errors[nameof(request.CustomerName)] = ["CustomerName cannot exceed 150 characters."];

    if (string.IsNullOrWhiteSpace(request.PhoneNumber))
        errors[nameof(request.PhoneNumber)] = ["PhoneNumber is required."];
    else if (request.PhoneNumber.Trim().Length > 20)
        errors[nameof(request.PhoneNumber)] = ["PhoneNumber cannot exceed 20 characters."];

    if (request.Quantity < 1)
        errors[nameof(request.Quantity)] = ["Quantity must be at least 1."];

    if (string.IsNullOrWhiteSpace(request.EnquiryType)
        || (!request.EnquiryType.Equals("Normal", StringComparison.OrdinalIgnoreCase)
            && !request.EnquiryType.Equals("Bulk", StringComparison.OrdinalIgnoreCase)))
    {
        errors[nameof(request.EnquiryType)] = ["EnquiryType must be Normal or Bulk."];
    }

    if (request.Notes?.Length > 1000)
        errors[nameof(request.Notes)] = ["Notes cannot exceed 1000 characters."];

    if (request.ReferenceImageUrl?.Length > 1000)
        errors[nameof(request.ReferenceImageUrl)] = ["ReferenceImageUrl cannot exceed 1000 characters."];

    return errors;
}

static string NormalizeEnquiryType(string value) =>
    value.Equals("Bulk", StringComparison.OrdinalIgnoreCase) ? "Bulk" : "Normal";

static string? NormalizeEnquiryStatus(string? value) => value?.Trim().ToLowerInvariant() switch
{
    "new" => "New",
    "contacted" => "Contacted",
    "quoted" => "Quoted",
    "closed" => "Closed",
    _ => null
};

public partial class Program { }

public sealed record DesignRequest(string? Name, string? Category, decimal Price, string? ImageUrl, bool IsActive);

public sealed record DesignVisibilityRequest(bool? IsActive);

public sealed record EnquiryRequest(
    string? CustomerName,
    string? PhoneNumber,
    Guid? DesignId,
    int Quantity,
    string? EnquiryType,
    DateTime? RequiredDate,
    string? Notes,
    string? ReferenceImageUrl);

public sealed record EnquiryStatusRequest(string? Status);
