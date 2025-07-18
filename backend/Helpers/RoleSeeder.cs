using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;

namespace backend.Helpers
{
    public static class RoleSeeder
    {
        public static async Task SeedRoles(RoleManager<IdentityRole> roleManager)
        {
            if (!await roleManager.RoleExistsAsync("Admin"))
                await roleManager.CreateAsync(new IdentityRole("Admin"));

            if (!await roleManager.RoleExistsAsync("User"))
                await roleManager.CreateAsync(new IdentityRole("User"));
        }

        public static async Task AddAdminRoleToUser(UserManager<backend.Models.ApplicationUser> userManager, string userName)
        {
            var user = await userManager.FindByNameAsync(userName);
            if (user != null && !(await userManager.IsInRoleAsync(user, "Admin")))
            {
                await userManager.AddToRoleAsync(user, "Admin");
                System.Console.WriteLine($"{userName} kullanıcısına Admin rolü atandı.");
            }
            else
            {
                System.Console.WriteLine($"{userName} zaten Admin veya bulunamadı.");
            }
        }
    }
}
