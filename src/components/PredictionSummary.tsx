import { useState } from "react";
import { generatePredictionReport } from "../api/predictionService";
import type { PredictionReport } from "../types/amr";

const ORGANISM = "Escherichia coli";

const ANTIBIOTICS = [
  "ampicillin",
  "ciprofloxacin",
  "cefotaxime",
  "ceftazidime",
  "cefuroxime",
  "gentamicin",
  "piperacillin_tazobactam",
  "trimethoprim_sulfamethoxazole",
];

const getPendingReport = (
  organism: string,
  antibiotic: string,
): PredictionReport => ({
  report_id: "Processing...",
  antibiotic_response: {
    antibiotic,
    status: "Pending",
    confidence: "Pending",
  },
  detected_organism: {
    organism,
    confidence: "Analyzing...",
  },
  amr_markers: [],
  gene_mappings: [],
  top_association: "Analyzing strain genome...",
  status: "pending",
});

export default function PredictionSummary() {
  const [organism] = useState(ORGANISM);
  const [antibiotic, setAntibiotic] = useState(ANTIBIOTICS[0]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<PredictionReport | null>(null);
  const isResistant = report?.antibiotic_response.status === "Resistant";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      return;
    }

    setLoading(true);
    setReport(getPendingReport(organism, antibiotic));

    try {
      const result = await generatePredictionReport(organism, antibiotic, file);
      setReport(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Prediction Error: Failed to process request";

      console.error("Prediction request failed:", error);
      alert(`Prediction Error: ${message}`);

      setReport((current) => ({
        ...(current ?? getPendingReport(organism, antibiotic)),
        report_id: "Error",
        status: "failed",
        error: message,
      }));
    } finally {
      setLoading(false);
    }
  };

  const selectedFileName = file ? file.name : "No file selected";

  return (
    <div className="dashboard-container">
      <form onSubmit={handleSubmit} className="input-panel">
        <h2>Run a new prediction</h2>

        <label className="field">
          <span>Organism</span>
          <select value={organism} aria-label="Organism" disabled>
            <option value={organism}>{organism}</option>
          </select>
        </label>

        <label className="field">
          <span>Antibiotic</span>
          <select
            value={antibiotic}
            onChange={(e) => setAntibiotic(e.target.value)}
          >
            {ANTIBIOTICS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>FASTA file</span>
          <div className="file-picker">
            <label className="file-button">
              <input
                type="file"
                accept=".fasta,.fa,.fna,.txt"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
            </label>
            <span className="file-name">{selectedFileName}</span>
          </div>
          <small>Accepted: .fasta, .fa, .fna</small>
        </label>

        <button type="submit" disabled={loading || !file} className="primary">
          {loading ? "Processing..." : "Generate report"}
        </button>
      </form>

      <div className="summary-panel">
        <h2>Prediction summary</h2>

        {loading || report?.status === "pending" ? (
          <div className="processing-banner" aria-live="polite">
            <span className="pulse-dot" aria-hidden="true" />
            <span>Predicting resistance</span>
          </div>
        ) : !report ? (
          <div className="empty-state-box">
            <div className="empty-substate">
              <p>No report yet. Upload a file to start.</p>
              <p>Reports stay available for the session only in this MVP.</p>
            </div>
          </div>
        ) : (
          <div className="result-grid">
            <div className="result-card">
              <p className="card-label">Antibiotic response</p>
              <h3>{report.antibiotic_response.antibiotic}</h3>
              <span
                className={`badge ${report.antibiotic_response.status.toLowerCase()}`}
              >
                {report.antibiotic_response.status}
              </span>
              <p className="card-note">
                Confidence: {report.antibiotic_response.confidence}
              </p>
            </div>

            <div className="result-card">
              <p className="card-label">Detected organism</p>
              <h3>{report.detected_organism.organism}</h3>
              <p className="card-note">
                Confidence: {report.detected_organism.confidence}
              </p>
            </div>

            {isResistant ? (
              <>
                <div className="result-card">
                  <p className="card-label">AMR markers</p>
                  {report.amr_markers.length ? (
                    <ul>
                      {report.amr_markers.map((marker) => (
                        <li key={marker}>{marker}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="card-note">No markers detected yet.</p>
                  )}
                </div>

                <div className="result-card">
                  <p className="card-label">Gene mappings</p>
                  {report.gene_mappings.length ? (
                    <div className="gene-list">
                      {report.gene_mappings.map((item) => (
                        <div
                          key={`${item.gene}-${item.tag}`}
                          className="gene-row"
                        >
                          <span>{item.gene}</span>
                          <span className="tag">{item.tag}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="card-note">No gene mappings yet.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="result-card">
                <p className="card-label">Resistance evidence</p>
                <p className="card-note">
                  No resistance-associated ARGs reported
                </p>
              </div>
            )}

            <div className="result-card">
              <p className="card-label">Top association</p>
              <p className="strong-text">{report.top_association}</p>
              <p className="card-note">Report ID: {report.report_id}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
