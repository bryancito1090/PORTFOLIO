using Microsoft.EntityFrameworkCore;
using Portfolio.Domain.Entities;
using Portfolio.Domain.Enums;
using Portfolio.Domain.Interfaces;
using Portfolio.Infrastructure.Persistence.Context;

namespace Portfolio.Infrastructure.Persistence.Repositories;

public sealed class SkillRepository(PortfolioDbContext context) : ISkillRepository
{
    public async Task<IReadOnlyList<Skill>> GetAllAsync(SkillCategory? category = null, CancellationToken ct = default)
    {
        var query = context.Skills.AsNoTracking().AsQueryable();

        if (category.HasValue)
        {
            query = query.Where(s => s.Category == category.Value);
        }

        return await query
            .OrderBy(s => s.Category)
            .ThenBy(s => s.DisplayOrder)
            .ToListAsync(ct);
    }

    public async Task<Skill?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await context.Skills.FindAsync([id], ct);
    }

    public async Task AddAsync(Skill skill, CancellationToken ct = default)
    {
        await context.Skills.AddAsync(skill, ct);
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        return context.SaveChangesAsync(ct);
    }
}
