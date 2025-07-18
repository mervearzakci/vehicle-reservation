using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DriverController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public DriverController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetDrivers()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();
            var drivers = _context.Drivers.Where(d => d.CompanyName == user.CompanyName).ToList();
            return Ok(drivers);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDriver([FromBody] Driver driver)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();
            driver.CompanyName = user.CompanyName;
            _context.Drivers.Add(driver);
            await _context.SaveChangesAsync();
            return Ok(driver);
        }
    }
}
