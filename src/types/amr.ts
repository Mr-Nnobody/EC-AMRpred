export type AntibioticStatus = "Resistant" | "Susceptible" | "Pending";
export type PredictionStatus = "pending" | "completed" | "failed";

export interface GeneMappingItem {
  gene: string;
  tag: string;
}

export interface PredictionReport {
  report_id: string;
  antibiotic_response: {
    antibiotic: string;
    status: AntibioticStatus;
    confidence: string;
  };
  detected_organism: {
    organism: string;
    confidence: string;
  };
  amr_markers: string[];
  gene_mappings: GeneMappingItem[];
  top_association: string;
  status: PredictionStatus;
  error?: string;
}
