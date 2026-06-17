using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using AssetInventoryAPI.Data;
using AssetInventoryAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AssetInventoryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableCors("AllowNextjsFrontend")]
public class ComputersController : ControllerBase
{
    private readonly AppDbContext _context;

    public ComputersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/computers
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Computer>>> GetComputers()
    {
        var computers = await _context.Computers
            .Include(c => c.Peripherals)
            .ToListAsync();
        return Ok(computers);
    }

    // GET: api/computers/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Computer>> GetComputer(int id)
    {
        var computer = await _context.Computers
            .Include(c => c.Peripherals)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (computer == null)
        {
            return NotFound(new { Message = $"Computer with ID {id} not found." });
        }

        return Ok(computer);
    }
}
