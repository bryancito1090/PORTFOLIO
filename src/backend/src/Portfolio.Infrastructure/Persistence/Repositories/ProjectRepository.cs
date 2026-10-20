using Microsoft.EntityFrameworkCore;
using Portfolio.Domain.Entities;
using Portfolio.Domain.Interfaces;
using Portfolio.Infrastructure.Persistence.Context;

namespace Portfolio.Infrastructure.Persistence.Repositories;

public sealed class ProjectRepository(PortfolioDbContext context) : IProjectRepository
{
    public async Task<IReadOnlyList<Project>> GetAllAsync(bool featuredOnly = false, CancellationToken ct = default)
    {
        var query = context.Projects
            .AsNoTracking()
            .Include(p => p.ProjectSkills)
                .ThenInclude(ps => ps.Skill)
            .AsQueryable();

        if (featuredOnly)
        {
            query = query.Where(p => p.IsFeatured);
        }

        return await query
            .OrderBy(p => p.DisplayOrder)
            .ThenByDescending(p => p.CreatedAtUtc)
            .ToListAsync(ct);
    }

    public async Task<Project?> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        return await context.Projects
            .AsNoTracking()
            .Include(p => p.ProjectSkills)
                .ThenInclude(ps => ps.Skill)
            .FirstOrDefaultAsync(p => p.Slug == slug.ToLower(), ct);
    }

    public async Task<Project?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await context.Projects
            .Include(p => p.ProjectSkills)
            .FirstOrDefaultAsync(p => p.Id == id, ct);
    }

    public async Task AddAsync(Project project, CancellationToken ct = default)
    {
        await context.Projects.AddAsync(project, ct);
    }

    public void Update(Project project)
    {
        context.Projects.Update(project);
    }

    public void Delete(Project project)
    {
        context.Projects.Remove(project);
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        return context.SaveChangesAsync(ct);
    }
}
