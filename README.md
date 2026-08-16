# EC-AMRpred

EC-AMRpred is a scientific web platform for rapid antimicrobial resistance (AMR) screening in E. coli using whole-genome or assembled sequence input. The system integrates sequence-derived k-mer features, trained antibiotic-specific classifiers, and database-guided annotation into a single decision-support workflow for research and translational review.

The repository contains a FastAPI backend and a React/Vite frontend designed to accept FASTA uploads, predict resistance status for selected antibiotics, and summarize plausible resistance mechanisms through CARD and E. coli mapping.

## Overview

The workflow is built around the following sequence of operations:

1. Accept a FASTA file upload from the browser.
2. Validate organism and antibiotic inputs.
3. Count k-mers from the sequence using the KMC CLI.
4. Align the resulting feature vector to the trained vocabulary for the chosen antibiotic.
5. Run the saved LightGBM classifier to produce a probability score.
6. Apply an antibiotic-specific decision threshold to assign a resistance status.
7. Rank active k-mers by model-native gain importance.
8. BLAST the most predictive k-mers against CARD and E. coli databases.
9. Return a structured summary report to the frontend.

## Scientific motivation

Antimicrobial resistance prediction from genomic sequence data is most informative when coupled with explainability. EC-AMRpred therefore combines statistical prediction with biological interpretation: the model output is not only a label but also a ranked set of candidate resistance-associated determinants and mapping context.

## Core features

- FASTA-based input handling
- E. coli-locked organism workflow
- Antibiotic-specific inference routing
- Probability-threshold decision logic
- Native LightGBM gain-based feature prioritization
- CARD-based AMR marker detection
- E. coli reference mapping for contextual interpretation
- Structured front-end summary for model outcomes and gene associations

## System architecture

### Frontend

- React + Vite
- Clinical dashboard and prediction summary UI
- HTTP multipart requests to the FastAPI endpoint

### Backend

- FastAPI application with Pydantic models
- Endpoint: POST /api/v1/predict
- Sequence processing, model loading, and annotation logic in the AMR pipeline module

### Data layer

- model artifacts in server/fastapi_app/models/
- CARD database in server/card_database/
- E. coli reference database in server/ecoli_database/
- KMC binaries in server/fastapi_app/kmc/

## Repository structure

```text
EC-AMRpred/
├── src/                          # React frontend source
├── server/
│   ├── fastapi_app/
│   │   ├── amr_pipeline.py      # inference, k-mer extraction, annotation flow
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── models.py            # API response schemas
│   │   ├── models/              # saved model vocabularies and metadata
│   │   └── kmc/                 # local KMC executables
│   ├── card_database/           # CARD BLAST database
│   ├── ecoli_database/          # E. coli reference BLAST database
│   ├── requirements.txt         # Python backend dependencies
│   └── README.md                # backend service notes
├── package.json                 # frontend dependencies and scripts
├── vite.config.js               # Vite configuration
├── index.html                   # frontend entry document
├── LICENSE                      # project license
├── README.md                    # project overview and usage instructions
└── .gitignore
```

## Requirements

- Node.js 18+
- npm 9+
- Python 3.10+
- BLASTN installed and available in PATH
- KMC binary package available in the project bundle

## Local setup

### Backend

From the project root:

```powershell
cd server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn fastapi_app.main:app --host 0.0.0.0 --port 8000 --reload
```

On Unix-like systems:

```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn fastapi_app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend is available at:

- http://localhost:8000/health
- http://localhost:8000/api/v1/predict

### Frontend

Open a second terminal and run:

```powershell
cd .
npm install
npm run dev
```

The frontend is served by Vite at:

- http://localhost:5173

Optional API override:

```powershell
$env:VITE_API_BASE = "http://localhost:8000"
```

## API contract

### Request

The prediction endpoint accepts multipart form data with:

- organism
- antibiotic
- fasta_file

### Example response

```json
{
  "report_id": "REP-XXXXXX",
  "antibiotic_response": {
    "antibiotic": "ampicillin",
    "status": "Resistant",
    "confidence": "80.2%"
  },
  "detected_organism": {
    "organism": "E. coli",
    "confidence": "82%"
  },
  "amr_markers": ["tetA(58) [Paenibacillus sp. LC231]"],
  "gene_mappings": [
    {
      "gene": "tetA(58) [Paenibacillus sp. LC231]",
      "tag": "CARD Resistance Gene"
    }
  ],
  "top_association": "Detected primary mechanism: tetA(58) [Paenibacillus sp. LC231] cluster",
  "status": "completed"
}
```

## Model and annotation strategy

The ML stack uses pre-trained, antibiotic-specific model artifacts and aligns each isolate to a fixed vocabulary. Prediction confidence is derived from probability output, while the most important determinants are extracted from the model-native gain importance ranking. These active sequence features are then mapped against CARD and E. coli reference databases to provide biological context to the resistance prediction.

## Data assets

The project includes the scientific assets required for end-to-end prediction and annotation:

- server/fastapi_app/models/ — trained vocabularies and model pickles
- server/card_database/ — CARD BLAST database
- server/ecoli_database/ — E. coli reference BLAST database
- server/fastapi_app/kmc/ — KMC CLI executables

## Research and clinical interpretation

EC-AMRpred is intended as a research and decision-support platform. It is not a substitute for validated diagnostic testing or institutional clinical workflows. Outputs should be interpreted alongside laboratory evidence, antimicrobial stewardship context, and expert review.

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE) for details.
