import { useEffect, useMemo, useState } from "react";

const SPECIES_OPTIONS = [
  "Escherichia coli",
  "Staphylococcus aureus",
  "Klebsiella pneumoniae",
  "Pseudomonas aeruginosa",
  "Enterococcus faecalis",
  "Acinetobacter baumannii",
  "Streptococcus pneumoniae",
  "Salmonella enterica",
];

const FALLBACK_ANTIBIOTICS = [
  "amoxicillin",
  "ampicillin",
  "azithromycin",
  "beta-lactam",
  "cefepime_taniborbactam",
  "cefmetazole",
  "cefoperazone/sulbactam",
  "ceftazidime",
  "ceftazidime/avibactam",
  "ceftazidime/clavulanic acid",
  "ceftibuten",
  "ceftiofur",
  "ceftobiprole",
  "ceftolozane/tazobactam",
  "ceftriaxone",
  "cefuroxime",
  "metronidazole",
  "minocycline",
  "moxifloxacin",
  "nalidixic acid",
  "neomycin",
  "netilmicin",
  "nitrofurantoin",
  "norfloxacin",
  "ofloxacin",
  "oxacillin",
];

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5170";

function formatConfidence(value) {
  if (value === null || value === undefined) return "Pending";
  return `${Math.round(value * 100)}%`;
}

function formatStatusLabel(value) {
  if (!value) return "Pending";
  return value;
}

function statusToClass(value) {
  if (!value) return "pending";
  return value.toLowerCase().replace(/\s+/g, "-");
}

export default function App() {
  const [species, setSpecies] = useState(SPECIES_OPTIONS[0]);
  const [antibioticOptions, setAntibioticOptions] =
    useState(FALLBACK_ANTIBIOTICS);
  const [antibiotic, setAntibiotic] = useState(FALLBACK_ANTIBIOTICS[0]);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadAntibiotics() {
      try {
        const response = await fetch(`${API_BASE}/api/antibiotics`);
        if (!response.ok) return;
        const payload = await response.json();
        if (!payload?.antibiotics?.length || !active) return;
        setAntibioticOptions(payload.antibiotics);
        setAntibiotic((current) =>
          payload.antibiotics.includes(current)
            ? current
            : payload.antibiotics[0],
        );
      } catch (err) {
        // Keep the fallback list if the API is unavailable.
      }
    }

    loadAntibiotics();

    return () => {
      active = false;
    };
  }, []);

  const canSubmit = useMemo(
    () => Boolean(species && file) && status !== "loading",
    [species, file, status],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("loading");
    setResult(null);

    const formData = new FormData();
    formData.append("species", species);
    formData.append("antibiotic", antibiotic);
    formData.append("fasta", file);

    try {
      const response = await fetch(`${API_BASE}/api/analysis`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Upload failed.");
      }

      const payload = await response.json();
      setResult(payload);
      setStatus("success");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">EC-AMRpred Clinical Genomics</p>
          <h1>AMR Resistance Prediction</h1>
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

      <main className="main-grid">
        <section className="panel">
          <h2>Run a new prediction</h2>
          <p className="panel-subtitle">
            Select the organism and antibiotic, then upload the FASTA file.
          </p>

          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Organism</span>
              <select
                value={species}
                onChange={(event) => setSpecies(event.target.value)}
              >
                {SPECIES_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Antibiotic</span>
              <select
                value={antibiotic}
                onChange={(event) => setAntibiotic(event.target.value)}
              >
                {antibioticOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>FASTA file</span>
              <input
                type="file"
                accept=".fasta,.fa,.fna,.txt"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
              <small>Accepted: .fasta, .fa, .fna</small>
            </label>

            <button className="primary" type="submit" disabled={!canSubmit}>
              {status === "loading" ? "Analyzing..." : "Generate report"}
            </button>

            {error && <p className="error">{error}</p>}
          </form>
        </section>

        <section className="panel results">
          <h2>Prediction summary</h2>
          <p className="panel-subtitle">
            Your report appears here once processing finishes.
          </p>

          {status === "loading" && (
            <div className="loading">
              <div className="pulse" />
              <div>
                <p className="loading-title">Predicting resistance</p>
              </div>
            </div>
          )}

          {result && (
            <div className="result-grid">
              <div className="result-card">
                <p className="card-label">Antibiotic response</p>
                <p className="card-value">
                  {result.susceptibility?.antibiotic || antibiotic}
                </p>
                <span
                  className={`status-chip ${statusToClass(
                    result.susceptibility?.status,
                  )}`}
                >
                  {formatStatusLabel(result.susceptibility?.status)}
                </span>
                <p className="card-note">
                  Confidence:{" "}
                  {formatConfidence(result.susceptibility?.confidence)}
                </p>
              </div>
              <div className="result-card">
                <p className="card-label">Detected organism</p>
                <p className="card-value">{result.organismName}</p>
                <p className="card-note">
                  Confidence: {formatConfidence(result.confidence)}
                </p>
              </div>
              <div className="result-card">
                <p className="card-label">AMR markers</p>
                <ul>
                  {result.amrMarkers.map((marker) => (
                    <li key={marker}>{marker}</li>
                  ))}
                </ul>
              </div>
              <div className="result-card">
                <p className="card-label">Gene mappings</p>
                <ul>
                  {result.associations.map((item) => (
                    <li key={item.gene}>
                      <span>{item.gene}</span>
                      <span>{item.category}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="result-card">
                <p className="card-label">Top association</p>
                <p className="card-value">{result.mappingSummary}</p>
                <p className="card-note">Report ID: {result.reportId}</p>
              </div>
            </div>
          )}

          {!result && status !== "loading" && (
            <div className="empty">
              <p>No report yet. Upload a file to start.</p>
              <span>
                Reports stay available for the session only in this MVP.
              </span>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
