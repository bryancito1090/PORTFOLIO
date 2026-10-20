using Portfolio.Domain.Common;
using Portfolio.Domain.Enums;

namespace Portfolio.Domain.Entities;

public sealed class Skill : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public SkillCategory Category { get; private set; }
    public string? IconSlug { get; private set; }
    public byte ProficiencyPercentage { get; private set; }
    public ushort DisplayOrder { get; private set; }
    public bool IsFeatured { get; private set; }

    public ICollection<ProjectSkill> ProjectSkills { get; private set; } = [];

    private Skill() { }

    public static Skill Create(
        string name,
        SkillCategory category,
        string? iconSlug = null,
        byte proficiency = 85,
        ushort displayOrder = 0,
        bool isFeatured = true)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        return new Skill
        {
            Name = name.Trim(),
            Category = category,
            IconSlug = iconSlug?.Trim(),
            ProficiencyPercentage = Math.Min((byte)100, proficiency),
            DisplayOrder = displayOrder,
            IsFeatured = isFeatured
        };
    }
}
