using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace backend.Models
{
    public class Reservation
    {
        public int Id { get; set; }
        
        [Required]
        public DateTime ReservationDate { get; set; }
        
        public DateTime CreatedAt { get; set; }

        // Vehicle relationship
        [Required]
        public int VehicleId { get; set; }
        public virtual Vehicle? Vehicle { get; set; }

        // Driver relationship - EKSIK OLAN KISIM
        [Required]
        public int DriverId { get; set; }
        public virtual Driver? Driver { get; set; }

        // Approval status
        public bool IsApproved { get; set; } = false;

        // Additional fields
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Notes { get; set; }
        public string? ApprovedBy { get; set; }

        // User ve şirket bilgisi
        public string? UserId { get; set; }
        public virtual ApplicationUser? User { get; set; }

        public string? CompanyName { get; set; }
    }
}