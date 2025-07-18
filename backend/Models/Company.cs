using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Company
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // Doğru: Navigation property olarak ICollection<Vehicle> olacak
        public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    }
}
