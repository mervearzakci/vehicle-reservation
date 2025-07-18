using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public NotificationController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // Şirketin tüm bildirimlerini getir (en yeni ilk)
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();
            var companyName = user.CompanyName;
            if (string.IsNullOrEmpty(companyName))
                return BadRequest("Kullanıcıya ait firma bilgisi bulunamadı.");

            var notifications = _context.Notifications
                .Where(n => n.CompanyName == companyName)
                .OrderByDescending(n => n.CreatedAt)
                .ToList();
            return Ok(notifications);
        }

        // Yeni bildirim ekle (genellikle sistem tarafından kullanılır)
        [HttpPost]
        public async Task<IActionResult> AddNotification([FromBody] Notification notification)
        {
            if (notification == null)
                return BadRequest("Bildirim bilgisi gönderilmedi.");
            if (string.IsNullOrEmpty(notification.CompanyName) || string.IsNullOrEmpty(notification.Message))
                return BadRequest("Firma adı ve mesaj zorunludur.");
            notification.CreatedAt = DateTime.UtcNow;
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            return Ok(notification);
        }

        // Bildirimi okundu olarak işaretle
        [HttpPost("markAsRead/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
                return NotFound();
            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok();
        }

        // Şirketin tüm bildirimlerini sil
        [HttpDelete("all")]
        public async Task<IActionResult> DeleteAllNotifications()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();
            var companyName = user.CompanyName;
            if (string.IsNullOrEmpty(companyName))
                return BadRequest("Kullanıcıya ait firma bilgisi bulunamadı.");

            var notifications = _context.Notifications.Where(n => n.CompanyName == companyName);
            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 