import type { PredictionReport } from "../types/amr";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function generatePredictionReport(
  organism: string,
  antibiotic: string,
  fastaFile: File,
): Promise<PredictionReport> {
  const formData = new FormData();
  formData.append("organism", organism);
  formData.append("antibiotic", antibiotic);
  formData.append("fasta_file", fastaFile);

  try {
    const response = await fetch(`${API_BASE}/api/v1/predict`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let message = `Prediction request failed with HTTP ${response.status}`;

      try {
        const errorData = await response.json();
        message = errorData.detail || errorData.error || message;
      } catch {
        try {
          const text = await response.text();
          if (text) {
            message = text;
          }
        } catch {
          // no-op: keep the HTTP status fallback message
        }
      }

      throw new Error(message || "Failed to process prediction");
    }

    return (await response.json()) as PredictionReport;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        error.message.includes("Failed to fetch")
          ? `Unable to reach the prediction backend at ${API_BASE}. Make sure the FastAPI server is running and CORS allows this frontend.`
          : error.message,
      );
    }

    throw new Error("Unable to process prediction request");
  }
}
