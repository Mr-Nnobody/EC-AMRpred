from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class GeneMappingItem(BaseModel):
    gene: str = Field(..., description="Target gene or mapped mechanism")
    tag: str = Field(..., description="Biological mechanism or gene tag")


class AntibioticResponse(BaseModel):
    antibiotic: str = Field(..., description="Selected antibiotic")
    status: Literal["Resistant", "Susceptible"] = Field(
        ..., description="Resistance prediction outcome"
    )
    confidence: str = Field(..., description="Confidence formatted as XX.X%")


class DetectedOrganism(BaseModel):
    organism: str = Field(..., description="Detected organism")
    confidence: str = Field(..., description="Confidence formatted as XX%")


class PredictionResponse(BaseModel):
    report_id: str = Field(..., description="Unique report identifier")
    antibiotic_response: AntibioticResponse
    detected_organism: DetectedOrganism
    amr_markers: List[str] = Field(..., description="CARD-derived AMR markers")
    gene_mappings: List[GeneMappingItem] = Field(
        ..., description="Mapped genes and biological tags"
    )
    top_association: str = Field(..., description="Strongest association summary")
    status: Literal["completed", "failed"] = Field(
        ..., description="Final status of prediction"
    )
    error: Optional[str] = Field(default=None, description="Error details when failed")
