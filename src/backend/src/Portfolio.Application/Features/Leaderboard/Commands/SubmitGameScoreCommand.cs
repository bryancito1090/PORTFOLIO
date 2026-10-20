using MediatR;
using Portfolio.Application.Features.Leaderboard.DTOs;
using Portfolio.Domain.Entities;
using Portfolio.Domain.Interfaces;

namespace Portfolio.Application.Features.Leaderboard.Commands;

public sealed record SubmitGameScoreCommand(
    string PlayerName,
    string GameName,
    int Score,
    int DurationSeconds,
    string? CountryCode = null
) : IRequest<GameScoreResponseDto>;

public sealed class SubmitGameScoreCommandHandler(IGameScoreRepository scoreRepository)
    : IRequestHandler<SubmitGameScoreCommand, GameScoreResponseDto>
{
    public async Task<GameScoreResponseDto> Handle(SubmitGameScoreCommand request, CancellationToken cancellationToken)
    {
        var gameScore = GameScore.Create(
            request.PlayerName,
            request.GameName,
            request.Score,
            request.DurationSeconds,
            request.CountryCode
        );

        await scoreRepository.AddAsync(gameScore, cancellationToken);
        await scoreRepository.SaveChangesAsync(cancellationToken);

        return new GameScoreResponseDto(
            gameScore.Id,
            gameScore.PlayerName,
            gameScore.GameName,
            gameScore.Score,
            gameScore.DurationSeconds,
            gameScore.CountryCode,
            gameScore.CreatedAtUtc
        );
    }
}
