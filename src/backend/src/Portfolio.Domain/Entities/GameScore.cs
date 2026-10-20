using Portfolio.Domain.Common;

namespace Portfolio.Domain.Entities;

public sealed class GameScore : BaseEntity
{
    public string PlayerName { get; private set; } = string.Empty;
    public string GameName { get; private set; } = "Minesweeper";
    public int Score { get; private set; }
    public int DurationSeconds { get; private set; }
    public string? CountryCode { get; private set; }

    private GameScore() { }

    public static GameScore Create(
        string playerName,
        string gameName,
        int score,
        int durationSeconds,
        string? countryCode = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(playerName);
        ArgumentException.ThrowIfNullOrWhiteSpace(gameName);

        return new GameScore
        {
            PlayerName = playerName.Trim(),
            GameName = gameName.Trim().ToLowerInvariant(),
            Score = score,
            DurationSeconds = durationSeconds,
            CountryCode = countryCode?.Trim().ToUpperInvariant()
        };
    }
}
