export interface ServerTelemetry {
  status: string;
  region: string;
  provider: string;
  architecture: string;
  runtimeVersion: string;
  uptime: string;
  processMemoryMb: number;
  activeThreads: number;
  serverTimeUtc: string;
  pingMs?: number;
}

export interface PingResponse {
  message: string;
  latencyMs: number;
  timestampUtc: string;
}
