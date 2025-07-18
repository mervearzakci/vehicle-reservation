using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using System.Linq;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class VehicleController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;

        public VehicleController(AppDbContext context, IMapper mapper, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _mapper = mapper;
            _userManager = userManager;
        }

        // GET: api/vehicle
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VehicleDto>>> GetVehicles()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();
            var vehicles = await _context.Vehicles
                .Where(v => v.CompanyName == user.CompanyName)
                .Include(v => v.Driver)
                .ToListAsync();
            var vehicleDtos = _mapper.Map<List<VehicleDto>>(vehicles);
            return Ok(vehicleDtos);
        }

        // POST: api/vehicle
        [HttpPost]
        public async Task<ActionResult<Vehicle>> CreateVehicle([FromBody] Vehicle vehicle)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();
            vehicle.CompanyName = user.CompanyName;
            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetVehicles), new { id = vehicle.Id }, vehicle);
        }
    }
}
