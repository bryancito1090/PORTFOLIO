using Microsoft.EntityFrameworkCore;
using Portfolio.Domain.Entities;
using Portfolio.Domain.Interfaces;
using Portfolio.Infrastructure.Persistence.Context;

namespace Portfolio.Infrastructure.Persistence.Repositories;

public sealed class InteractiveMessageRepository(PortfolioDbContext context) : IInteractiveMessageRepository
{
    public async Task<IReadOnlyList<InteractiveMessage>> GetRecentApprovedAsync(int limit = 50, CancellationToken ct = default)
    {
        return await context.InteractiveMessages
            .AsNoTracking()
            .Where(m => m.IsApproved)
            .OrderByDescending(m => m.CreatedAtUtc)
            .Take(limit)
            .ToListAsync(ct);
    }

    public async Task AddAsync(InteractiveMessage message, CancellationToken ct = default)
    {
        await context.InteractiveMessages.AddAsync(message, ct);
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        return context.SaveChangesAsync(ct);
    }
}
