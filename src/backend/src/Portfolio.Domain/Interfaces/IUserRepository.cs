using Portfolio.Domain.Entities;

namespace Portfolio.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByUsernameOrEmailAsync(string identifier, CancellationToken ct = default);
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddRefreshTokenAsync(RefreshToken refreshToken, CancellationToken ct = default);
    Task<RefreshToken?> GetRefreshTokenAsync(string tokenHash, CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
