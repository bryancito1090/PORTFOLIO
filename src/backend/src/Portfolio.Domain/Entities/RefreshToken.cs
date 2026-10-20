using Portfolio.Domain.Common;

namespace Portfolio.Domain.Entities;

public sealed class RefreshToken : BaseEntity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;

    public string TokenHash { get; private set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; private set; }
    public bool IsRevoked { get; private set; }
    public string? ReplacedByToken { get; private set; }

    public bool IsActive => !IsRevoked && DateTime.UtcNow < ExpiresAtUtc;

    private RefreshToken() { }

    public static RefreshToken Create(Guid userId, string tokenHash, DateTime expiresAtUtc)
    {
        return new RefreshToken
        {
            UserId = userId,
            TokenHash = tokenHash,
            ExpiresAtUtc = expiresAtUtc,
            IsRevoked = false
        };
    }

    public void Revoke(string? replacedBy = null)
    {
        IsRevoked = true;
        ReplacedByToken = replacedBy;
    }
}
