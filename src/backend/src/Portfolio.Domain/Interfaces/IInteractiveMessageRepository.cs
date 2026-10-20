using Portfolio.Domain.Entities;

namespace Portfolio.Domain.Interfaces;

public interface IInteractiveMessageRepository
{
    Task<IReadOnlyList<InteractiveMessage>> GetRecentApprovedAsync(int limit = 50, CancellationToken ct = default);
    Task AddAsync(InteractiveMessage message, CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
