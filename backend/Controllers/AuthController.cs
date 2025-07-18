using backend.Models;
using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly JwtSettings _jwtSettings;
        private readonly AppDbContext _db;
        private readonly MailService _mailService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IOptions<JwtSettings> jwtSettings,
            AppDbContext db,
            MailService mailService,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtSettings = jwtSettings.Value;
            _db = db;
            _mailService = mailService;
            _logger = logger;
        }

        private string GenerateJwtToken(ApplicationUser user, string role)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.UserName ?? ""),
                new Claim(ClaimTypes.NameIdentifier, user.Id ?? ""),
                new Claim("role", role),
                new Claim(ClaimTypes.Role, role)
            };

            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_jwtSettings.SecretKey));
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(_jwtSettings.ExpiryInHours),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // Normal kullanıcı kayıt
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(model.Username))
                return BadRequest("Kullanıcı adı boş olamaz!");
            if (string.IsNullOrWhiteSpace(model.Email))
                return BadRequest("E-posta adresi boş olamaz!");
            if (string.IsNullOrWhiteSpace(model.Password))
                return BadRequest("Şifre boş olamaz!");
            if (string.IsNullOrWhiteSpace(model.CompanyName))
                return BadRequest("Firma adı boş olamaz!");

            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
                return BadRequest("Bu e-posta zaten kayıtlı!");

            var user = new ApplicationUser { UserName = model.Username, Email = model.Email, CompanyName = model.CompanyName };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            string role = "User";
            if (model.Email.ToLower().EndsWith("@kaptandemir.com.tr"))
            {
                role = "Admin";
                await _userManager.AddToRoleAsync(user, "Admin");
            }
            else
            {
                await _userManager.AddToRoleAsync(user, "User");
            }

            _logger.LogInformation($"User registered: {model.Username} ({model.Email})");

            return Ok(new { message = "Kayıt başarılı.", role });
        }

        // Admin kayıt (onay kodu gönderme)
        [HttpPost("register-admin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(model.Email))
                return BadRequest("E-posta adresi boş olamaz!");

            if (!model.Email.ToLower().EndsWith("@kaptandemir.com.tr"))
                return Forbid("Sadece şirket e-posta adresiniz ile admin kaydı yapılabilir.");

            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
                return BadRequest("Bu e-posta zaten kayıtlı!");

            // 6 haneli onay kodu oluştur
            var code = new Random().Next(100000, 999999).ToString();

            // Önceki geçerli kodları pasif yap
            var previousVerifies = _db.AdminVerifications.Where(a => a.Email == model.Email && !a.IsUsed).ToList();
            foreach (var v in previousVerifies) v.IsUsed = true;

            var verify = new AdminVerification
            {
                Email = model.Email,
                Code = code,
                CreatedAt = DateTime.UtcNow,
                IsUsed = false
            };
            _db.AdminVerifications.Add(verify);
            await _db.SaveChangesAsync();

            await _mailService.SendMailAsync(
                to: model.Email,
                subject: "Admin Kayıt Onay Kodunuz",
                body: $"Admin kaydı için onay kodunuz: <b>{code}</b>",
                isHtml: true
            );

            _logger.LogInformation($"Admin registration code sent to: {model.Email}");

            return Ok("Onay kodu e-posta adresinize gönderildi. Lütfen kodu girerek işlemi tamamlayın.");
        }

        // Admin onay kodu ile doğrulama ve kayıt tamamlama
        [AllowAnonymous]
        [HttpPost("verify-admin")]
        public async Task<IActionResult> VerifyAdmin([FromBody] AdminRegisterVerifyModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Email))
                return BadRequest("E-posta adresi boş olamaz!");
            if (string.IsNullOrWhiteSpace(model.Username))
                return BadRequest("Kullanıcı adı boş olamaz!");
            if (string.IsNullOrWhiteSpace(model.Password))
                return BadRequest("Şifre boş olamaz!");
            if (string.IsNullOrWhiteSpace(model.Code))
                return BadRequest("Onay kodu boş olamaz!");

            var verify = _db.AdminVerifications
                .Where(v => v.Email == model.Email && v.Code == model.Code && !v.IsUsed && v.CreatedAt > DateTime.UtcNow.AddMinutes(-10))
                .FirstOrDefault();

            if (verify == null)
                return BadRequest("Kod yanlış veya süresi doldu!");

            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
                return BadRequest("Bu e-posta zaten kayıtlı!");

            var user = new ApplicationUser { UserName = model.Username, Email = model.Email };
            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, "Admin");

            verify.IsUsed = true;
            await _db.SaveChangesAsync();

            // Token oluştur
            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "";

            var tokenString = GenerateJwtToken(user, role);

            return Ok(new { message = "Admin hesabınız başarıyla aktif oldu!", token = tokenString, role });
        }

        // E-posta ve kullanıcı adı ile login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Identifier))
                return BadRequest("Kullanıcı adı veya e-posta boş olamaz!");
            if (string.IsNullOrWhiteSpace(model.Password))
                return BadRequest("Şifre boş olamaz!");

            ApplicationUser? user = null;

            if (model.Identifier.Contains("@"))
                user = await _userManager.FindByEmailAsync(model.Identifier);
            else
                user = await _userManager.FindByNameAsync(model.Identifier);

            if (user == null)
                return Unauthorized("Kullanıcı bulunamadı.");

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded)
                return Unauthorized("Kullanıcı adı veya parola hatalı.");

            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "";

            var tokenString = GenerateJwtToken(user, role);

            return Ok(new { token = tokenString, role });
        }

        // Admin rolündeki kullanıcıların listelemesi - async kaldırıldı
        [HttpGet("users")]
        [Authorize]
        public IActionResult GetUsers()
        {
            try
            {
                var users = _userManager.Users.ToList();
                var result = new List<object>();
                foreach (var user in users)
                {
                    result.Add(new
                    {
                        Email = user.Email,
                        CompanyName = user.CompanyName,
                        UserName = user.UserName
                    });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Kullanıcılar alınırken hata oluştu: {ex.Message}");
            }
        }

        // Şifre sıfırlama kodu gönderme
        [AllowAnonymous]
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest model)
        {
            if (string.IsNullOrWhiteSpace(model.Email))
                return BadRequest("E-posta adresi boş olamaz!");

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return Ok("Eğer bu e-posta sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi."); // Güvenlik için

            // Eski kodları pasif yap
            var oldCodes = _db.PasswordResets.Where(p => p.Email == model.Email && !p.IsUsed).ToList();
            foreach (var c in oldCodes) c.IsUsed = true;

            // 6 haneli kod üret
            var code = new Random().Next(100000, 999999).ToString();
            var reset = new PasswordReset
            {
                Email = model.Email,
                Code = code,
                CreatedAt = DateTime.UtcNow,
                IsUsed = false
            };
            _db.PasswordResets.Add(reset);
            await _db.SaveChangesAsync();

            // Mail gönder
            await _mailService.SendMailAsync(
                to: model.Email,
                subject: "Şifre Sıfırlama Kodu",
                body: $"Şifre sıfırlama kodunuz: <b>{code}</b> (10 dakika geçerli)",
                isHtml: true
            );

            return Ok("Eğer bu e-posta sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.");
        }

        // Şifre sıfırlama kodu ile yeni şifre belirleme
        [AllowAnonymous]
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest model)
        {
            if (string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Code) || string.IsNullOrWhiteSpace(model.NewPassword))
                return BadRequest("Tüm alanlar zorunludur.");

            var reset = _db.PasswordResets.FirstOrDefault(p => p.Email == model.Email && p.Code == model.Code && !p.IsUsed && p.CreatedAt > DateTime.UtcNow.AddMinutes(-10));
            if (reset == null)
                return BadRequest("Kod yanlış veya süresi doldu!");

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return BadRequest("Kullanıcı bulunamadı.");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            reset.IsUsed = true;
            await _db.SaveChangesAsync();

            return Ok("Şifreniz başarıyla sıfırlandı. Artık yeni şifrenizle giriş yapabilirsiniz.");
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();
            
            return Ok(new
            {
                user.UserName,
                user.Email,
                user.CompanyName
            });
        }

        // Kullanıcı sil (sadece admin)
        [HttpDelete("users/{email}")]
        [Authorize]
        public async Task<IActionResult> DeleteUser(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");
            
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                return StatusCode(500, "Kullanıcı silinemedi.");
            
            return NoContent();
        }
    }

    // DTO'lar
    public class ForgotPasswordRequest { public string Email { get; set; } = string.Empty; }
    public class ResetPasswordRequest { public string Email { get; set; } = string.Empty; public string Code { get; set; } = string.Empty; public string NewPassword { get; set; } = string.Empty; }
}