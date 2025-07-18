using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompanyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CompanyController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/company
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Company>>> GetCompanies()
        {
            return await _context.Companies.ToListAsync();
        }

        // POST: api/company
        [HttpPost]
        public async Task<ActionResult<Company>> CreateCompany(Company company)
        {
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCompanies), new { id = company.Id }, company);
        }
    }
}
// This code defines a CompanyController for managing companies in the application.