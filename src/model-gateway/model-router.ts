import { AgexError } from '../common/errors.js';

export type ProviderTrustClass = 'PRIVATE' | 'DIRECT_APPROVED' | 'ENTERPRISE_APPROVED' | 'AGGREGATOR';
export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export interface ModelCandidate {
  model_id: string;
  provider_id: string;
  provider_class: ProviderTrustClass;
  capabilities: string[];
  supported_classifications: DataClassification[];
  region: string[];
  latency_ms: number;
  healthy: boolean;
  cost_per_1k_tokens: number;
}

export interface ModelRoutingRequest {
  required_capabilities: string[];
  data_classification: DataClassification;
  target_region?: string;
  max_cost_budget?: number;
}

export class ModelRouter {
  private candidates: ModelCandidate[];

  constructor(candidates: ModelCandidate[]) {
    this.candidates = candidates;
  }

  public selectModel(request: ModelRoutingRequest): ModelCandidate {
    // 1. Required Capability Filter
    let filtered = this.candidates.filter(m =>
      request.required_capabilities.every(cap => m.capabilities.includes(cap))
    );

    if (filtered.length === 0) {
      throw new AgexError({
        code: 'NO_CAPABLE_MODEL_FOUND',
        category: 'PROVIDER',
        message: 'No model satisfies required capabilities.',
        request_id: 'mdl_req',
      });
    }

    // 2. Data Classification Filter
    filtered = filtered.filter(m =>
      m.supported_classifications.includes(request.data_classification)
    );

    if (filtered.length === 0) {
      throw new AgexError({
        code: 'DATA_CLASSIFICATION_DENIED',
        category: 'POLICY',
        message: `No model allowed for classification: ${request.data_classification}.`,
        request_id: 'mdl_req',
      });
    }

    // 3. Provider Health Filter
    filtered = filtered.filter(m => m.healthy);

    if (filtered.length === 0) {
      throw new AgexError({
        code: 'ALL_PROVIDERS_UNHEALTHY',
        category: 'PROVIDER',
        message: 'All matching model providers are currently unhealthy.',
        request_id: 'mdl_req',
      });
    }

    // 4. Region Filter (if specified)
    if (request.target_region) {
      const regionFiltered = filtered.filter(m => m.region.includes(request.target_region!));
      if (regionFiltered.length > 0) {
        filtered = regionFiltered;
      }
    }

    // Sort by Health/Latency then Cost (Security and Capability were enforced first)
    filtered.sort((a, b) => a.latency_ms - b.latency_ms || a.cost_per_1k_tokens - b.cost_per_1k_tokens);

    return filtered[0];
  }
}
