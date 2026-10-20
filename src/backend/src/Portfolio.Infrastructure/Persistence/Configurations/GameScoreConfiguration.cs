using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Configurations;

public sealed class GameScoreConfiguration : IEntityTypeConfiguration<GameScore>
{
    public void Configure(EntityTypeBuilder<GameScore> builder)
    {
        builder.ToTable("game_scores");

        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id).HasColumnName("id").HasMaxLength(36);

        builder.Property(g => g.PlayerName).HasColumnName("player_name").HasMaxLength(30).IsRequired();
        builder.Property(g => g.GameName).HasColumnName("game_name").HasMaxLength(30).IsRequired();
        builder.Property(g => g.Score).HasColumnName("score").IsRequired();
        builder.Property(g => g.DurationSeconds).HasColumnName("duration_seconds").IsRequired();
        builder.Property(g => g.CountryCode).HasColumnName("country_code").HasMaxLength(5);
        builder.Property(g => g.CreatedAtUtc).HasColumnName("created_at_utc").IsRequired();

        builder.HasIndex(g => new { g.GameName, g.Score });
    }
}
