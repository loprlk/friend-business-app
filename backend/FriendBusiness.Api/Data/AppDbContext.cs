using FriendBusiness.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FriendBusiness.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Customer> Customers => Set<Customer>();
    }
}
