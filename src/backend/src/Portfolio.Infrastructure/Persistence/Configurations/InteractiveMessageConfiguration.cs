using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Configurations;

public sealed class InteractiveMessageConfiguration : IEntityTypeConfiguration<InteractiveMessage>
{
    public void Configure(EntityTypeBuilder<InteractiveMessage> builder)
    {
        builder.ToTable("interactive_messages");

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasColumnName("id").HasMaxLength(36);

        builder.Property(m => m.SenderName).HasColumnName("sender_name").HasMaxLength(60).IsRequired();
        builder.Property(m => m.SenderContact).HasColumnName("sender_contact").HasMaxLength(100);
        builder.Property(m => m.Message).HasColumnName("message").HasMaxLength(500).IsRequired();
        builder.Property(m => m.Origin).HasColumnName("origin").HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(m => m.IsApproved).HasColumnName("is_approved").IsRequired();
        builder.Property(m => m.CreatedAtUtc).HasColumnName("created_at_utc").IsRequired();

        builder.HasIndex(m => new { m.IsApproved, m.CreatedAtUtc });
    }
}
