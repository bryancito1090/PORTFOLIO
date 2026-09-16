import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SecurityAgentRequest, SecurityAgentResponse } from '../domain/models/security.model';
import { SecurityAgentPort } from '../domain/ports/security-agent.port';
import { SECURITY_AGENT_WEBHOOK_URL } from '../core/tokens/security-agent-config.token';

@Injectable({
  providedIn: 'root'
})
export class SecurityAgentService implements SecurityAgentPort {
  private readonly http = inject(HttpClient);
  private readonly webhookUrl = inject(SECURITY_AGENT_WEBHOOK_URL);

  triggerSimulation(payload: SecurityAgentRequest): Observable<SecurityAgentResponse> {
    return this.http.post<SecurityAgentResponse>(this.webhookUrl, payload).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error inesperado al conectar con el orquestador n8n.';
    if (error.status === 429) {
      errorMessage = 'Límite de tasa excedido (Rate Limit: máx 10 peticiones cada 5 min).';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Payload o parámetros inválidos.';
    } else if (error.status === 0) {
      errorMessage = 'Error de red o conexión rechazada con el servidor n8n.';
    } else if (error.status >= 500) {
      errorMessage = error.error?.message || `Error interno del orquestador n8n (HTTP ${error.status}).`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
