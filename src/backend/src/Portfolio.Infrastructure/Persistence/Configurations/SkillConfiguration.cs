using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Configurations;

public sealed class SkillConfiguration : IEntityTypeConfiguration<Skill>
{
    public void Configure(EntityTypeBuilder<Skill> builder)
    {
        builder.ToTable("skills");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id").HasMaxLength(36);

        builder.Property(s => s.Name).HasColumnName("name").HasMaxLength(50).IsRequired();
        builder.HasIndex(s => s.Name).IsUnique();

        builder.Property(s => s.Category).HasColumnName("category").HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(s => s.IconSlug).HasColumnName("icon_slug").HasMaxLength(50);
        builder.Property(s => s.ProficiencyPercentage).HasColumnName("proficiency_percentage").IsRequired();
        builder.Property(s => s.DisplayOrder).HasColumnName("display_order").IsRequired();
        builder.Property(s => s.IsFeatured).HasColumnName("is_featured").IsRequired();
        builder.Property(s => s.CreatedAtUtc).HasColumnName("created_at_utc").IsRequired();

        builder.HasIndex(s => new { s.Category, s.DisplayOrder });
    }
}
