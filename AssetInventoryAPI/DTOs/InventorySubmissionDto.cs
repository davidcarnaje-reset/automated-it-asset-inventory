using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AssetInventoryAPI.DTOs;

public class InventorySubmissionDto
{
    [Required]
    [MaxLength(100)]
    public string Hostname { get; set; } = string.Empty;

    [Required]
    [MaxLength(45)]
    public string IPAddress { get; set; } = string.Empty;

    [Required]
    [MaxLength(17)]
    public string MACAddress { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? SerialNumber { get; set; }

    [MaxLength(100)]
    public string? CPU { get; set; }

    [MaxLength(50)]
    public string? RAM { get; set; }

    [MaxLength(100)]
    public string? Storage { get; set; }

    [MaxLength(50)]
    public string? OSVersion { get; set; }

    [MaxLength(100)]
    public string? LoggedInUser { get; set; }

    public List<PeripheralSubmissionDto> Peripherals { get; set; } = new();
}
