using Portfolio.Domain.Entities;

namespace Portfolio.Domain.Interfaces;

public interface IGameScoreRepository
{
    Task<IReadOnlyList<GameScore>> GetTopScoresAsync(string gameName, int limit = 10, CancellationToken ct = default);
    Task AddAsync(GameScore score, CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
