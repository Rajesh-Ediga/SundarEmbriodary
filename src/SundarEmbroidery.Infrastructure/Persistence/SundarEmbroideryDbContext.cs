using Microsoft.EntityFrameworkCore;
using SundarEmbroidery.Domain;

namespace SundarEmbroidery.Infrastructure.Persistence;

public sealed class SundarEmbroideryDbContext(DbContextOptions<SundarEmbroideryDbContext> options) : DbContext(options)
{
    public DbSet<Design> Designs => Set<Design>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var design = modelBuilder.Entity<Design>();
        design.ToTable("Designs");
        design.HasKey(item => item.Id);
        design.Property(item => item.Name).HasMaxLength(200).IsRequired();
        design.Property(item => item.Category).HasMaxLength(100).IsRequired();
        design.Property(item => item.Price).HasPrecision(12, 2);
        design.Property(item => item.ImageUrl).HasMaxLength(1000).IsRequired();
    }
}
