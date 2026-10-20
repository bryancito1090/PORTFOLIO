using Portfolio.Domain.Entities;

namespace Portfolio.Domain.Interfaces;

public interface IProjectRepository
{
    Task<IReadOnlyList<Project>> GetAllAsync(bool featuredOnly = false, CancellationToken ct = default);
    Task<Project?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<Project?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Project project, CancellationToken ct = default);
    void Update(Project project);
    void Delete(Project project);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
