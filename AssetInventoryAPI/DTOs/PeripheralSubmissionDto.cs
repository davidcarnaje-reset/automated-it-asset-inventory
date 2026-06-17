using System.ComponentModel.DataAnnotations;

namespace AssetInventoryAPI.DTOs;

public class PeripheralSubmissionDto
{
    [Required]
    [MaxLength(255)]
    public string DeviceName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? DeviceType { get; set; }

    [MaxLength(100)]
    public string? Manufacturer { get; set; }
}
