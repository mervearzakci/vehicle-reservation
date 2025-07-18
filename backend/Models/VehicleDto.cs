using System;

namespace backend.Models
{
    public class VehicleDto
    {
        public int Id { get; set; }
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string PlateNumber { get; set; } = string.Empty;
        public int DriverId { get; set; }
        public string DriverName { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
    }
} 