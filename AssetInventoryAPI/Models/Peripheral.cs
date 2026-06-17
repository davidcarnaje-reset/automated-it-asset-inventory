using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssetInventoryAPI.Models;

[Table("peripherals")]
public class Peripheral
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("computer_id")]
    public int? ComputerId { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("device_name")]
    public string DeviceName { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("device_type")]
    public string? DeviceType { get; set; }

    [MaxLength(100)]
    [Column("manufacturer")]
    public string? Manufacturer { get; set; }

    // Navigation properties
    [ForeignKey(nameof(ComputerId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public Computer? Computer { get; set; }
}
