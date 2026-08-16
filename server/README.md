# EC-AMRpred FastAPI Service

This directory contains the backend service for the EC-AMRpred platform. The service accepts FASTA input, resolves the appropriate antibiotic model, scores the isolate, and returns a structured AMR interpretation report for the frontend.

## Service responsibilities

- ingest FASTA uploads through multipart form data
- validate antibiotic and organism inputs
- load trained k-mer vocabularies and LightGBM classifiers
- count sequence k-mers using KMC
- infer probability-based resistance calls
- rank active k-mers by model gain importance
- annotate candidate sequences against CARD and E. coli references
- return summary output to the web dashboard

## Runtime requirements

Python dependencies are defined in [requirements.txt](requirements.txt). The current validated backend environment uses:

- Python 3.12
- FastAPI 0.115.0
- Uvicorn 0.30.6
- scikit-learn 1.6.1
- LightGBM 4.7.0
- pandas 3.0.5
- numpy 2.5.2
- joblib 1.5.3

## Local startup

```powershell
cd server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn fastapi_app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Endpoints

### Health

```http
GET /health
```

Returns a basic service status payload.

### Prediction

```http
POST /api/v1/predict
```

Parameters:

- organism
- antibiotic
- fasta_file

The endpoint returns the AMR summary JSON used by the web interface, including the model outcome, confidence score, marker list, and gene mappings.

## Scientific assets

- [fastapi_app/models](fastapi_app/models) — trained model artifacts and metadata
- [card_database](card_database) — CARD BLAST database
- [ecoli_database](ecoli_database) — E. coli reference BLAST database
- [fastapi_app/kmc](fastapi_app/kmc) — KMC executables used for k-mer counting

## Notes

This service is intended for AMR research support and structured review workflows. It is not a replacement for laboratory validation or clinical diagnostic decision-making.
