using Microsoft.EntityFrameworkCore;
using SundarEmbroidery.Domain;

namespace SundarEmbroidery.Infrastructure.Persistence;

public sealed class SundarEmbroideryDbContext(DbContextOptions<SundarEmbroideryDbContext> options) : DbContext(options)
{
    public DbSet<Design> Designs => Set<Design>();
    public DbSet<Enquiry> Enquiries => Set<Enquiry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var design = modelBuilder.Entity<Design>();
        design.ToTable("Designs");
        design.HasKey(item => item.Id);
        design.Property(item => item.Name).HasMaxLength(200).IsRequired();
        design.Property(item => item.Category).HasMaxLength(100).IsRequired();
        design.Property(item => item.Price).HasPrecision(12, 2);
        design.Property(item => item.ImageUrl).HasMaxLength(1000).IsRequired();

        var enquiry = modelBuilder.Entity<Enquiry>();
        enquiry.ToTable("Enquiries");
        enquiry.HasKey(item => item.Id);
        enquiry.Property(item => item.CustomerName).HasMaxLength(150).IsRequired();
        enquiry.Property(item => item.PhoneNumber).HasMaxLength(20).IsRequired();
        enquiry.Property(item => item.EnquiryType).HasMaxLength(20).IsRequired();
        enquiry.Property(item => item.Notes).HasMaxLength(1000);
        enquiry.Property(item => item.ReferenceImageUrl).HasMaxLength(1000);
        enquiry.Property(item => item.Status).HasMaxLength(20).IsRequired();
        enquiry.Property(item => item.RequiredDate).HasColumnType("timestamp with time zone");
        enquiry.Property(item => item.CreatedAt).HasColumnType("timestamp with time zone");
    }
}
