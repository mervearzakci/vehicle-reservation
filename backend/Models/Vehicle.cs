using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Vehicle
    {
    public int Id { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;

    public int? DriverId { get; set; }
    public Driver? Driver { get; set; }

    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }

}
// This code defines a Vehicle model with properties for Id, PlateNumber, Brand, and Model.