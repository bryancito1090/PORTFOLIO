namespace Portfolio.Domain.Exceptions;

public class DomainException(string message) : Exception(message);

public class NotFoundException(string entityName, object key)
    : DomainException($"Entity '{entityName}' with key ({key}) was not found.");
