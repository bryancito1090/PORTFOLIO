using MediatR;
using Portfolio.Application.Features.Leaderboard.DTOs;
using Portfolio.Domain.Interfaces;

namespace Portfolio.Application.Features.Leaderboard.Queries;

public sealed record GetLeaderboardQuery(string GameName = "Minesweeper", int Limit = 10)
    : IRequest<IReadOnlyList<GameScoreResponseDto>>;

public sealed class GetLeaderboardQueryHandler(IGameScoreRepository scoreRepository)
    : IRequestHandler<GetLeaderboardQuery, IReadOnlyList<GameScoreResponseDto>>
{
    public async Task<IReadOnlyList<GameScoreResponseDto>> Handle(GetLeaderboardQuery request, CancellationToken cancellationToken)
    {
        var scores = await scoreRepository.GetTopScoresAsync(request.GameName, request.Limit, cancellationToken);

        return scores.Select(s => new GameScoreResponseDto(
            s.Id,
            s.PlayerName,
            s.GameName,
            s.Score,
            s.DurationSeconds,
            s.CountryCode,
            s.CreatedAtUtc
        )).ToList();
    }
}
