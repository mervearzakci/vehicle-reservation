using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class PasswordReset
    {
        public int Id { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsUsed { get; set; } = false;
    }
} 