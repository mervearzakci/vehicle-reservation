using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Notification
    {
        public int Id { get; set; }
        [Required]
        public string CompanyName { get; set; } = string.Empty;
        [Required]
        public string Message { get; set; } = string.Empty;
        // info, error, warning, success gibi tipler
        [Required]
        public string Type { get; set; } = "info";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;
    }
} 