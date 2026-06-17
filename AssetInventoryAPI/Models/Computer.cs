using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssetInventoryAPI.Models;

[Table("computers")]
public class Computer
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("hostname")]
    public string Hostname { get; set; } = string.Empty;

    [Required]
    [MaxLength(45)]
    [Column("ip_address")]
    public string IPAddress { get; set; } = string.Empty;

    [Required]
    [MaxLength(17)]
    [Column("mac_address")]
    public string MACAddress { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("serial_number")]
    public string? SerialNumber { get; set; }

    [MaxLength(100)]
    [Column("cpu")]
    public string? CPU { get; set; }

    [MaxLength(50)]
    [Column("ram")]
    public string? RAM { get; set; }

    [MaxLength(100)]
    [Column("storage")]
    public string? Storage { get; set; }

    [MaxLength(50)]
    [Column("os_version")]
    public string? OSVersion { get; set; }

    [MaxLength(100)]
    [Column("logged_in_user")]
    public string? LoggedInUser { get; set; }

    [Column("last_seen")]
    public DateTime? LastSeen { get; set; }

    // Navigation property for Peripherals
    public ICollection<Peripheral> Peripherals { get; set; } = new List<Peripheral>();
}
