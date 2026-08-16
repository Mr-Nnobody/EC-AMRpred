import PredictionSummary from "./components/PredictionSummary";

export default function App() {
  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">EC-AMRpred Clinical Genomics</p>
          <h1>AMR Prediction</h1>
          <p className="subtitle">
            Upload a FASTA file to predict resistance and map genome
          </p>
        </div>

        <div className="status-card">
          <p className="status-label">Pipeline</p>
          <p className="status-value">Prediction-Mapping</p>
          <p className="status-caption">
            prediction and mapping of resistant genome
          </p>
        </div>
      </header>

      <PredictionSummary />
    </div>
  );
}
