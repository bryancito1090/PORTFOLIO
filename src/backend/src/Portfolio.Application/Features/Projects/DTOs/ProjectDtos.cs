namespace Portfolio.Application.Features.Projects.DTOs;

public sealed record ProjectResponseDto(
    Guid Id,
    string Slug,
    string Title,
    string ShortDescription,
    string FullDescription,
    string RepositoryUrl,
    string? LiveDemoUrl,
    string? ThumbnailUrl,
    bool IsFeatured,
    ushort DisplayOrder,
    IReadOnlyList<string> Skills
);
