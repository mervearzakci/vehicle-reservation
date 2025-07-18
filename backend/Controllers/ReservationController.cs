using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly MailService _mailService;
        private readonly UserManager<ApplicationUser> _userManager;

        public ReservationController(AppDbContext context, MailService mailService, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _mailService = mailService;
            _userManager = userManager;
        }

        // Ping testi (herkese açık)
        [AllowAnonymous]
        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok("Pong");
        }

        // Tüm rezervasyonları getir (giriş yapmış kullanıcılar)
        [HttpGet]
        public async Task<IActionResult> GetReservations()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();
            var roles = await _userManager.GetRolesAsync(user);
            bool isAdmin = roles.Contains("Admin");

            var query = _context.Reservations
                .Include(r => r.Vehicle)
                .Include(r => r.Driver)
                .AsQueryable();

            if (!isAdmin && !string.IsNullOrEmpty(user.CompanyName))
            {
                query = query.Where(r => r.CompanyName == user.CompanyName);
            }

            var reservations = await query.ToListAsync();
            return Ok(reservations);
        }

        // Yeni rezervasyon oluştur ve mail gönder
        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] Reservation reservation)
        {
            if (reservation == null)
                return BadRequest("Rezervasyon bilgisi gönderilmedi.");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();
            var userCompanyName = user.CompanyName;
            if (string.IsNullOrEmpty(userCompanyName))
                return BadRequest("Kullanıcıya ait firma bilgisi bulunamadı.");

            // Araç ve şoför var mı kontrolü
            var vehicleExists = _context.Vehicles.Any(v => v.Id == reservation.VehicleId);
            var driverExists = _context.Drivers.Any(d => d.Id == reservation.DriverId);
            if (!vehicleExists || !driverExists)
                return BadRequest("Araç veya şoför bulunamadı. Lütfen geçerli bir araç ve şoför seçin.");

            reservation.CreatedAt = DateTime.UtcNow;
            reservation.IsApproved = false;
            reservation.UserId = userId;
            reservation.CompanyName = userCompanyName;

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            // Bildirim ekle (rezervasyon oluşturuldu)
            var notification = new Notification
            {
                CompanyName = userCompanyName!,
                Message = $"Yeni rezervasyon oluşturuldu. Tarih: {reservation.ReservationDate:yyyy-MM-dd HH:mm}",
                Type = "success",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Araç ve ilişkili bilgileri yükle
            var vehicle = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.Id == reservation.VehicleId);

            if (vehicle == null)
                return BadRequest("Rezervasyon için belirtilen araç bulunamadı.");

            // Rezervasyondaki şoför bilgisini çek
            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.Id == reservation.DriverId);

            // Kullanıcıya mail gönder
            if (user != null && !string.IsNullOrEmpty(user.Email))
            {
                try
                {
                    string userMailBody = $@"
<html>
  <body style='font-family: Arial, sans-serif; background: #f8fafc; color: #232946; padding: 24px;'>
    <div style='max-width: 480px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px #23294611; border: 1px solid #e0e7ef;'>
      <div style='background: linear-gradient(90deg, #6366f1 0%, #38bdf8 100%); padding: 18px 0; border-radius: 12px 12px 0 0; text-align: center;'>
        <h2 style='color: #fff; margin: 0;'>Rezervasyonunuz Oluşturuldu!</h2>
      </div>
      <div style='padding: 24px;'>
        <p>Merhaba <b>{user?.UserName ?? "-"}</b>,</p>
        <p>Aşağıdaki bilgilerle yeni bir rezervasyon oluşturuldu:</p>
        <table style='width: 100%; border-collapse: collapse; margin: 16px 0;'>
          <tr>
            <td style='font-weight: bold; padding: 6px;'>Tarih:</td>
            <td style='padding: 6px;'>{reservation.ReservationDate:yyyy-MM-dd HH:mm}</td>
          </tr>
          <tr>
            <td style='font-weight: bold; padding: 6px;'>Araç:</td>
            <td style='padding: 6px;'>{vehicle.PlateNumber} {vehicle.Brand} {vehicle.Model}</td>
          </tr>
          <tr>
            <td style='font-weight: bold; padding: 6px;'>Şoför:</td>
            <td style='padding: 6px;'>{driver?.FullName ?? "-"}</td>
          </tr>
          <tr>
            <td style='font-weight: bold; padding: 6px;'>Firma:</td>
            <td style='padding: 6px;'>{userCompanyName}</td>
          </tr>
        </table>
        <p style='margin-top: 24px; color: #6366f1;'>Herhangi bir sorunuz olursa bizimle iletişime geçebilirsiniz.</p>
      </div>
      <div style='background: #f1f5f9; border-radius: 0 0 12px 12px; padding: 12px; text-align: center; color: #64748b; font-size: 13px;'>
        Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
      </div>
    </div>
  </body>
</html>";
                    await _mailService.SendMailAsync(
                        to: user!.Email,
                        subject: "Rezervasyonunuz Oluşturuldu!",
                        body: userMailBody,
                        isHtml: true
                    );
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Kullanıcıya mail gönderilemedi: " + ex.Message);
                }
            }

            // Tüm adminlere mail gönder (CompanyName eşleşmesi olmadan)
            var admins = await _userManager.GetUsersInRoleAsync("Admin");
            foreach (var admin in admins.Where(a => !string.IsNullOrEmpty(a.Email)))
            {
                string approveToken = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{reservation.Id}:{vehicle.PlateNumber}:{reservation.CreatedAt:yyyyMMddHHmmss}"));
                string approveUrl = $"http://localhost:5003/api/Reservation/approve/{reservation.Id}?token={approveToken}";
                string rejectToken = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{reservation.Id}:{vehicle.PlateNumber}:{reservation.CreatedAt:yyyyMMddHHmmss}:reject"));
                string rejectUrl = $"http://localhost:5003/api/Reservation/reject/{reservation.Id}?token={rejectToken}";
                string adminMailBody = $@"
<html>
  <body style='font-family: Arial, sans-serif; background: #f8fafc; color: #232946; padding: 24px;'>
    <div style='max-width: 480px; margin: auto; background: #fff; border-radius: 14px; box-shadow: 0 4px 24px #23294611; border: 1px solid #e0e7ef;'>
      <div style='background: linear-gradient(90deg, #6366f1 0%, #38bdf8 100%); padding: 18px 0; border-radius: 14px 14px 0 0; text-align: center;'>
        <h2 style='color: #fff; margin: 0;'>Yeni Rezervasyon Talebi</h2>
      </div>
      <div style='padding: 24px;'>
        <table style='width: 100%; border-collapse: collapse; margin: 16px 0;'>
          <tr><td style='font-weight: bold; padding: 8px;'>Firma:</td><td style='padding: 8px;'>{userCompanyName}</td></tr>
          <tr><td style='font-weight: bold; padding: 8px;'>Araç:</td><td style='padding: 8px;'>{vehicle.PlateNumber} {vehicle.Brand} {vehicle.Model}</td></tr>
          <tr><td style='font-weight: bold; padding: 8px;'>Şoför:</td><td style='padding: 8px;'>{driver?.FullName ?? "-"} - {driver?.PhoneNumber ?? "-"} - {driver?.LicenseNumber ?? "-"}</td></tr>
        </table>
        <div style='display:flex;gap:16px;justify-content:center;margin-top:32px;'>
          <a href='{approveUrl}' style='display:inline-block;padding:14px 32px;background:#22c55e;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;box-shadow:0 2px 8px #22c55e55;transition:background 0.2s;'>✔ Onayla</a>
          <a href='{rejectUrl}' style='display:inline-block;padding:14px 32px;background:#ef4444;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;box-shadow:0 2px 8px #ef444455;transition:background 0.2s;'>✖ Reddet</a>
        </div>
        <p style='margin-top: 24px; color: #6366f1; font-size: 14px;'>Rezervasyon detaylarını panelinizden de inceleyebilirsiniz.</p>
      </div>
      <div style='background: #f1f5f9; border-radius: 0 0 14px 14px; padding: 12px; text-align: center; color: #64748b; font-size: 13px;'>
        Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
      </div>
    </div>
  </body>
</html>";
                await _mailService.SendMailAsync(
                    to: admin.Email!,
                    subject: "Yeni Rezervasyon Talebi",
                    body: adminMailBody,
                    isHtml: true
                );
            }

            return CreatedAtAction(nameof(GetReservations), new { id = reservation.Id }, reservation);
        }

        // Onay endpoint'ini güncelle:
        [HttpGet("approve/{id}")]
        [AllowAnonymous]
        public IActionResult ApproveReservation(int id, string token)
        {
            // Token doğrulama (basit kontrol)
            var reservation = _context.Reservations.Find(id);
            if (reservation == null)
                return NotFound();
            var expectedToken = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{reservation.Id}:{reservation.VehicleId}:{reservation.CreatedAt:yyyyMMddHHmmss}"));
            if (token != expectedToken)
                return Unauthorized("Geçersiz veya süresi dolmuş onay linki.");
            reservation.IsApproved = true;
            _context.SaveChanges();
            return Content("<html><body style='font-family:sans-serif;text-align:center;padding:40px;'><h2>Rezervasyon başarıyla onaylandı!</h2></body></html>", "text/html");
        }

        // Rezervasyon güncelle
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReservation(int id, [FromBody] Reservation updatedReservation)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();
            var roles = await _userManager.GetRolesAsync(user);
            bool isAdmin = roles.Contains("Admin");

            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
                return NotFound();

            if (!isAdmin && reservation.CompanyName != user.CompanyName)
                return Forbid();

            // Sadece güncellenebilir alanlar
            reservation.ReservationDate = updatedReservation.ReservationDate;
            reservation.StartDate = updatedReservation.StartDate;
            reservation.EndDate = updatedReservation.EndDate;
            reservation.Notes = updatedReservation.Notes;
            reservation.VehicleId = updatedReservation.VehicleId;
            reservation.DriverId = updatedReservation.DriverId;
            reservation.IsApproved = updatedReservation.IsApproved;
            reservation.ApprovedBy = updatedReservation.ApprovedBy;

            await _context.SaveChangesAsync();
            return Ok(reservation);
        }

        // Rezervasyon sil
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();
            var roles = await _userManager.GetRolesAsync(user);
            bool isAdmin = roles.Contains("Admin");

            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
                return NotFound();

            if (!isAdmin && reservation.CompanyName != user.CompanyName)
                return Forbid();

            _context.Reservations.Remove(reservation);
            await _context.SaveChangesAsync();

            // Bildirim ekle (rezervasyon silindi)
            var notification = new Notification
            {
                CompanyName = reservation.CompanyName!,
                Message = $"Bir rezervasyon silindi. Tarih: {reservation.ReservationDate:yyyy-MM-dd HH:mm}",
                Type = "warning",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Reddet endpointi ekle:
        [HttpGet("reject/{id}")]
        [AllowAnonymous]
        public IActionResult RejectReservation(int id, string token)
        {
            var reservation = _context.Reservations.Find(id);
            if (reservation == null)
                return NotFound();
            var expectedToken = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{reservation.Id}:{reservation.VehicleId}:{reservation.CreatedAt:yyyyMMddHHmmss}:reject"));
            if (token != expectedToken)
                return Unauthorized("Geçersiz veya süresi dolmuş reddetme linki.");
            reservation.IsApproved = false;
            reservation.ApprovedBy = "REJECTED";
            _context.SaveChanges();
            return Content("<html><body style='font-family:sans-serif;text-align:center;padding:40px;'><h2>Rezervasyon reddedildi.</h2></body></html>", "text/html");
        }

        [HttpPost("approve/{id}")]
        [Authorize]
        public IActionResult ApproveReservationPanel(int id)
        {
            var reservation = _context.Reservations.Find(id);
            if (reservation == null)
                return NotFound();
            reservation.IsApproved = true;
            reservation.ApprovedBy = User.Identity?.Name ?? "AdminPanel";
            _context.SaveChanges();
            return Ok(new { message = "Rezervasyon onaylandı." });
        }
    }
}