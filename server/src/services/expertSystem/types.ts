export interface FileMeta {
  extension: string;
  sizeBytes: number;
}

export interface RuleResult {
  triggered: boolean;
  metadata?: Record<string, unknown>;
}

export interface Rule {
  ruleId: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  evaluate: (filePath: string, meta: FileMeta) => Promise<RuleResult>;
}
