from __future__ import annotations

import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .amr_pipeline import run_full_amr_prediction_pipeline
from .models import PredictionResponse

app = FastAPI(title="EC-AMRpred API", version="1.0.0")


def _split_csv_env(value: str | None, default: list[str]) -> list[str]:
    if not value:
        return default

    parsed = [item.strip() for item in value.split(",") if item.strip()]
    return parsed or default


def _resolve_path_env(value: str | None, default: Path) -> Path:
    if not value:
        return default

    return Path(value).expanduser().resolve()


app_dir = Path(__file__).resolve().parent
server_root = app_dir.parent
model_dir = _resolve_path_env(os.getenv("MODEL_DIR"), app_dir / "models")
card_db_path = _resolve_path_env(os.getenv("CARD_DB_PATH"), server_root / "card_database" / "card_db")
ecoli_db_path = _resolve_path_env(os.getenv("ECOLI_DB_PATH"), server_root / "ecoli_database" / "ecoli_ref_db")
allowed_origins = _split_csv_env(
    os.getenv("CORS_ORIGINS"),
    ["http://localhost:5173", "http://127.0.0.1:5173"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/v1/predict", response_model=PredictionResponse)
async def predict_amr(
    organism: str = Form(..., description="Organism name"),
    antibiotic: str = Form(..., description="Target antibiotic"),
    fasta_file: UploadFile = File(..., description="FASTA sequence upload"),
) -> PredictionResponse:
    if not organism or not antibiotic:
        raise HTTPException(status_code=400, detail="organism and antibiotic are required")

    if not fasta_file.filename:
        raise HTTPException(status_code=400, detail="fasta_file is required")

    suffix = Path(fasta_file.filename).suffix or ".fasta"
    temp_dir = tempfile.mkdtemp(prefix="ec_amrpred_")
    temp_path = os.path.join(temp_dir, f"upload{suffix}")

    try:
        contents = await fasta_file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded FASTA file is empty.")

        with open(temp_path, "wb") as handle:
            handle.write(contents)

        try:
            payload = run_full_amr_prediction_pipeline(
                fasta_path=temp_path,
                antibiotic=antibiotic,
                organism=organism,
                models_dir=str(model_dir),
                card_db=str(card_db_path),
                ecoli_db=str(ecoli_db_path),
            )
        except FileNotFoundError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Prediction pipeline failed: {exc}") from exc

        return PredictionResponse(**payload)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        if os.path.isdir(temp_dir):
            try:
                os.rmdir(temp_dir)
            except OSError:
                pass
