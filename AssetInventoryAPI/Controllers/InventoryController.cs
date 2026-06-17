using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using AssetInventoryAPI.Data;
using AssetInventoryAPI.DTOs;
using AssetInventoryAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AssetInventoryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableCors("AllowNextjsFrontend")]
public class InventoryController : ControllerBase
{
    private readonly AppDbContext _context;

    public InventoryController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> SubmitInventory([FromBody] InventorySubmissionDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Using a transaction to ensure atomicity, particularly when clearing and recreating peripherals
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Search for existing computer by MAC Address
            var computer = await _context.Computers
                .Include(c => c.Peripherals)
                .FirstOrDefaultAsync(c => c.MACAddress == dto.MACAddress);

            if (computer != null)
            {
                // Update computer specs
                computer.Hostname = dto.Hostname;
                computer.IPAddress = dto.IPAddress;
                computer.SerialNumber = dto.SerialNumber;
                computer.CPU = dto.CPU;
                computer.RAM = dto.RAM;
                computer.Storage = dto.Storage;
                computer.OSVersion = dto.OSVersion;
                computer.LoggedInUser = dto.LoggedInUser;
                computer.LastSeen = DateTime.UtcNow;

                // Clear out existing peripherals associated with the computer
                _context.Peripherals.RemoveRange(computer.Peripherals);
                computer.Peripherals.Clear();

                // Add the new list of peripherals
                foreach (var pDto in dto.Peripherals)
                {
                    computer.Peripherals.Add(new Peripheral
                    {
                        DeviceName = pDto.DeviceName,
                        DeviceType = pDto.DeviceType,
                        Manufacturer = pDto.Manufacturer
                    });
                }
            }
            else
            {
                // Create a new computer entry
                computer = new Computer
                {
                    Hostname = dto.Hostname,
                    IPAddress = dto.IPAddress,
                    MACAddress = dto.MACAddress,
                    SerialNumber = dto.SerialNumber,
                    CPU = dto.CPU,
                    RAM = dto.RAM,
                    Storage = dto.Storage,
                    OSVersion = dto.OSVersion,
                    LoggedInUser = dto.LoggedInUser,
                    LastSeen = DateTime.UtcNow
                };

                // Add peripherals
                foreach (var pDto in dto.Peripherals)
                {
                    computer.Peripherals.Add(new Peripheral
                    {
                        DeviceName = pDto.DeviceName,
                        DeviceType = pDto.DeviceType,
                        Manufacturer = pDto.Manufacturer
                    });
                }

                await _context.Computers.AddAsync(computer);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { Message = "Inventory submission processed successfully.", ComputerId = computer.Id });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { Message = "An error occurred while saving inventory data.", Error = ex.Message });
        }
    }

    // GET: api/inventory
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Computer>>> GetInventory()
    {
        var computers = await _context.Computers
            .Include(c => c.Peripherals)
            .ToListAsync();
        return Ok(computers);
    }

    // GET: api/inventory/5
    [HttpGet("{id}")]
    [EnableCors("AllowNextjsFrontend")]
    public async Task<ActionResult<Computer>> GetInventoryItem(string id)
    {
        if (!int.TryParse(id, out int numericId))
        {
            return NotFound(new { Message = $"Computer with ID {id} not found." });
        }

        var computer = await _context.Computers
            .Include(c => c.Peripherals)
            .FirstOrDefaultAsync(c => c.Id == numericId);

        if (computer == null)
        {
            return NotFound(new { Message = $"Computer with ID {numericId} not found." });
        }

        return Ok(computer);
    }
}
