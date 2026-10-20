using Microsoft.EntityFrameworkCore;
using Portfolio.Domain.Entities;
using Portfolio.Domain.Interfaces;
using Portfolio.Infrastructure.Persistence.Context;

namespace Portfolio.Infrastructure.Persistence.Repositories;

public sealed class GameScoreRepository(PortfolioDbContext context) : IGameScoreRepository
{
    public async Task<IReadOnlyList<GameScore>> GetTopScoresAsync(string gameName, int limit = 10, CancellationToken ct = default)
    {
        return await context.GameScores
            .AsNoTracking()
            .Where(g => g.GameName == gameName.ToLower())
            .OrderByDescending(g => g.Score)
            .ThenBy(g => g.DurationSeconds)
            .Take(limit)
            .ToListAsync(ct);
    }

    public async Task AddAsync(GameScore score, CancellationToken ct = default)
    {
        await context.GameScores.AddAsync(score, ct);
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        return context.SaveChangesAsync(ct);
    }
}
