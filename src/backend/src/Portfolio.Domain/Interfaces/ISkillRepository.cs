using Portfolio.Domain.Entities;
using Portfolio.Domain.Enums;

namespace Portfolio.Domain.Interfaces;

public interface ISkillRepository
{
    Task<IReadOnlyList<Skill>> GetAllAsync(SkillCategory? category = null, CancellationToken ct = default);
    Task<Skill?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Skill skill, CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
