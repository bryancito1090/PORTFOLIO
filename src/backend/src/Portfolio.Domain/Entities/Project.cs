using Portfolio.Domain.Common;

namespace Portfolio.Domain.Entities;

public sealed class Project : BaseEntity
{
    public string Slug { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string ShortDescription { get; private set; } = string.Empty;
    public string FullDescription { get; private set; } = string.Empty;
    public string RepositoryUrl { get; private set; } = string.Empty;
    public string? LiveDemoUrl { get; private set; }
    public string? ThumbnailUrl { get; private set; }
    public bool IsFeatured { get; private set; }
    public ushort DisplayOrder { get; private set; }
    public DateTime? UpdatedAtUtc { get; private set; }

    public ICollection<ProjectSkill> ProjectSkills { get; private set; } = [];

    private Project() { }

    public static Project Create(
        string slug,
        string title,
        string shortDescription,
        string fullDescription,
        string repositoryUrl,
        string? liveDemoUrl = null,
        string? thumbnailUrl = null,
        bool isFeatured = false,
        ushort displayOrder = 0)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(slug);
        ArgumentException.ThrowIfNullOrWhiteSpace(title);

        return new Project
        {
            Slug = slug.Trim().ToLowerInvariant(),
            Title = title.Trim(),
            ShortDescription = shortDescription.Trim(),
            FullDescription = fullDescription.Trim(),
            RepositoryUrl = repositoryUrl.Trim(),
            LiveDemoUrl = liveDemoUrl?.Trim(),
            ThumbnailUrl = thumbnailUrl?.Trim(),
            IsFeatured = isFeatured,
            DisplayOrder = displayOrder
        };
    }
}
