import { Observable } from 'rxjs';
import { SecurityAgentRequest, SecurityAgentResponse } from '../models/security.model';

export abstract class SecurityAgentPort {
  abstract triggerSimulation(payload: SecurityAgentRequest): Observable<SecurityAgentResponse>;
}
