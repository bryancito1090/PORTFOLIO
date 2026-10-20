using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Configurations;

public sealed class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("projects");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id").HasMaxLength(36);

        builder.Property(p => p.Slug).HasColumnName("slug").HasMaxLength(100).IsRequired();
        builder.HasIndex(p => p.Slug).IsUnique();

        builder.Property(p => p.Title).HasColumnName("title").HasMaxLength(150).IsRequired();
        builder.Property(p => p.ShortDescription).HasColumnName("short_description").HasMaxLength(255).IsRequired();
        builder.Property(p => p.FullDescription).HasColumnName("full_description").HasColumnType("TEXT").IsRequired();
        builder.Property(p => p.RepositoryUrl).HasColumnName("repository_url").HasMaxLength(255).IsRequired();
        builder.Property(p => p.LiveDemoUrl).HasColumnName("live_demo_url").HasMaxLength(255);
        builder.Property(p => p.ThumbnailUrl).HasColumnName("thumbnail_url").HasMaxLength(255);
        builder.Property(p => p.IsFeatured).HasColumnName("is_featured").IsRequired();
        builder.Property(p => p.DisplayOrder).HasColumnName("display_order").IsRequired();
        builder.Property(p => p.CreatedAtUtc).HasColumnName("created_at_utc").IsRequired();
        builder.Property(p => p.UpdatedAtUtc).HasColumnName("updated_at_utc");

        builder.HasIndex(p => new { p.IsFeatured, p.DisplayOrder });
    }
}
