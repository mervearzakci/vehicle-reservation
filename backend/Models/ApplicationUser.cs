using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class ApplicationUser : IdentityUser
    {
        // Identity zaten UserName, Email, Id gibi temel alanları sağlıyor
        // Bu alanları tekrar tanımlamamıza gerek yok
        
        // İsterseniz ekstra alanlar ekleyebilirsiniz:
        
        [StringLength(100)]
        public string? FirstName { get; set; }
        
        [StringLength(100)]
        public string? LastName { get; set; }
        
        // Tam ad için computed property
        public string FullName => $"{FirstName} {LastName}".Trim();
        
        // Kullanıcı profil resmi için
        public string? ProfilePicture { get; set; }
        
        // Hesap oluşturulma tarihi
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Son giriş tarihi
        public DateTime? LastLoginAt { get; set; }
        
        // Hesap aktif mi?
        public bool IsActive { get; set; } = true;
        
        // Şirket çalışanı mı? (Admin kayıt için)
        public bool IsCompanyEmployee { get; set; } = false;
        
        // Telefon numarası doğrulandı mı?
        public bool IsPhoneVerified { get; set; } = false;
        
        // İsteğe bağlı: Kullanıcının tercih ettiği dil
        [StringLength(10)]
        public string PreferredLanguage { get; set; } = "tr-TR";
        
        public string CompanyName { get; set; } = string.Empty;
        
        // Navigation properties (eğer kullanıcı rezervasyon yapabiliyorsa)
        // public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}