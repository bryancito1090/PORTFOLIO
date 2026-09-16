export type SimulationMode = 'PURPLE_TEAM' | 'EASM' | 'SOAR';
export type SecurityVerdict = 'SAFE' | 'ATTENTION_REQUIRED' | 'CRITICAL_THREAT';

export interface SecurityAgentParameters {
  readonly auto_isolate?: boolean;
  readonly scan_depth?: 'quick' | 'full';
}

export interface SecurityAgentRequest {
  readonly mode: SimulationMode;
  readonly target: string;
  readonly requested_by: string;
  readonly parameters?: SecurityAgentParameters;
}

export interface SecurityExecutionSummary {
  readonly risk_score: number;
  readonly verdict: SecurityVerdict;
  readonly mitre_techniques: string[];
  readonly containment_executed: boolean;
  readonly mitigation_time_ms: number;
}

export interface SecurityEvidence {
  readonly sha256_hash: string;
  readonly report_url: string;
}

export interface SecurityAgentResponse {
  readonly success: boolean;
  readonly execution_id: string;
  readonly simulation_id: string;
  readonly timestamp: string;
  readonly mode: SimulationMode;
  readonly target: string;
  readonly summary: SecurityExecutionSummary;
  readonly evidence: SecurityEvidence;
}
