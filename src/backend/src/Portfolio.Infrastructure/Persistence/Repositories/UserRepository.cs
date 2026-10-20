using Microsoft.EntityFrameworkCore;
using Portfolio.Domain.Entities;
using Portfolio.Domain.Interfaces;
using Portfolio.Infrastructure.Persistence.Context;

namespace Portfolio.Infrastructure.Persistence.Repositories;

public sealed class UserRepository(PortfolioDbContext context) : IUserRepository
{
    public async Task<User?> GetByUsernameOrEmailAsync(string identifier, CancellationToken ct = default)
    {
        var lower = identifier.ToLower().Trim();
        return await context.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == lower || u.Email.ToLower() == lower, ct);
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await context.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Id == id, ct);
    }

    public async Task AddRefreshTokenAsync(RefreshToken refreshToken, CancellationToken ct = default)
    {
        await context.RefreshTokens.AddAsync(refreshToken, ct);
    }

    public async Task<RefreshToken?> GetRefreshTokenAsync(string tokenHash, CancellationToken ct = default)
    {
        return await context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, ct);
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        return context.SaveChangesAsync(ct);
    }
}
