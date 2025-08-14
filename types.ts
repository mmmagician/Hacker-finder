export enum SafetyLevel {
  SAFE = 'SAFE',
  CAUTION = 'CAUTION',
  DANGEROUS = 'DANGEROUS',
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface AnalysisResult {
  safetyLevel: SafetyLevel;
  summary: string;
  details: string;
  sources?: GroundingSource[];
}
