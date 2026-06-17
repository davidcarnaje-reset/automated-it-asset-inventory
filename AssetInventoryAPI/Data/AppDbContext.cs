using Microsoft.EntityFrameworkCore;
using AssetInventoryAPI.Models;

namespace AssetInventoryAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Computer> Computers { get; set; } = null!;
    public DbSet<Peripheral> Peripherals { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure unique indexes
        modelBuilder.Entity<Computer>()
            .HasIndex(c => c.MACAddress)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        // Relationship mapping: Computer has many Peripherals
        modelBuilder.Entity<Peripheral>()
            .HasOne(p => p.Computer)
            .WithMany(c => c.Peripherals)
            .HasForeignKey(p => p.ComputerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure database-generated default values
        modelBuilder.Entity<Computer>()
            .Property(c => c.LastSeen)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        modelBuilder.Entity<User>()
            .Property(u => u.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasDefaultValue("Staff");
    }
}
