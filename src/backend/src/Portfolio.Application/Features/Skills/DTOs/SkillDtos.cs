using Portfolio.Domain.Enums;

namespace Portfolio.Application.Features.Skills.DTOs;

public sealed record SkillResponseDto(
    Guid Id,
    string Name,
    SkillCategory Category,
    string? IconSlug,
    byte ProficiencyPercentage,
    ushort DisplayOrder,
    bool IsFeatured
);
