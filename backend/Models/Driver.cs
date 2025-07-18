using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Driver
    {
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        public string LicenseNumber { get; set; } = string.Empty;

        [Required]
        public string TCKimlikNo { get; set; } = string.Empty;  // Yeni alan eklendi

        public string CompanyName { get; set; } = string.Empty;

        public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    }
}
