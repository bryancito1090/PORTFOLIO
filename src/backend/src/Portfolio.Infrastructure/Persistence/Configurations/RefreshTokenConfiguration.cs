using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Configurations;

public sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_tokens");

        builder.HasKey(rt => rt.Id);
        builder.Property(rt => rt.Id).HasColumnName("id").HasMaxLength(36);

        builder.Property(rt => rt.UserId).HasColumnName("user_id").HasMaxLength(36).IsRequired();
        builder.Property(rt => rt.TokenHash).HasColumnName("token_hash").HasMaxLength(255).IsRequired();
        builder.Property(rt => rt.ExpiresAtUtc).HasColumnName("expires_at_utc").IsRequired();
        builder.Property(rt => rt.IsRevoked).HasColumnName("is_revoked").IsRequired();
        builder.Property(rt => rt.ReplacedByToken).HasColumnName("replaced_by_token").HasMaxLength(255);
        builder.Property(rt => rt.CreatedAtUtc).HasColumnName("created_at_utc").IsRequired();

        builder.HasOne(rt => rt.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(rt => new { rt.UserId, rt.IsRevoked, rt.ExpiresAtUtc });
    }
}
