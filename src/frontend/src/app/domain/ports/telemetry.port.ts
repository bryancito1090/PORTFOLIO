import { Observable } from 'rxjs';
import { PingResponse, ServerTelemetry } from '../models/telemetry.model';

export abstract class TelemetryPort {
  abstract getTelemetry(): Observable<ServerTelemetry>;
  abstract ping(): Observable<PingResponse>;
}
