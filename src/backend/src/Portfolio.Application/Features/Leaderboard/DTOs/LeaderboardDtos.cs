namespace Portfolio.Application.Features.Leaderboard.DTOs;

public sealed record GameScoreResponseDto(
    Guid Id,
    string PlayerName,
    string GameName,
    int Score,
    int DurationSeconds,
    string? CountryCode,
    DateTime CreatedAtUtc
);

public sealed record SubmitGameScoreRequestDto(
    string PlayerName,
    string GameName,
    int Score,
    int DurationSeconds,
    string? CountryCode = null
);
