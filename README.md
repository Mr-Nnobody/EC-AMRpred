# EC-AMRpred Clinical Interface

EC-AMRpred is a clinician-facing interface for the mlAMRPred antimicrobial resistance research project. It provides a focused workflow to upload a FASTA file, select organism and antibiotic context, and review predicted resistance signals in a clear, clinical-friendly summary.

This repository contains a React (Vite) frontend and a Node/Express backend. The backend currently serves mock analysis output for demonstration and integration testing while the research model pipeline is integrated.

## Key features

- Simple clinical workflow for FASTA-based resistance prediction
- Antibiotic and organism selection with validated upload handling
- Structured results layout for rapid interpretation
- Backend API designed to be swapped to a production model pipeline

## Architecture

- Frontend: React + Vite
- Backend: Node.js + Express + Multer
- Data flow: Browser -> API -> JSON response -> UI summary cards

## Repository layout

- Frontend (Vite app) at repository root
- Backend API in the `server/` directory

## Requirements

- Node.js 18+ recommended
- npm 9+ recommended

## Local development

### 1) Start the API

```powershell
cd server
npm install
npm run dev
```

The API listens on http://localhost:5170 by default.

### 2) Start the frontend

```powershell
cd ..
npm install
npm run dev
```

The frontend will run on http://localhost:5173 by default.

## Environment variables

Frontend:

- `VITE_API_BASE` - Base URL for the API. Defaults to http://localhost:5170.

Example (PowerShell):

```powershell
$env:VITE_API_BASE = "http://localhost:5170"
```

Backend:

- `PORT` - Port for the API server. Defaults to 5170.

## API endpoints (MVP)

Base URL: `http://localhost:5170`

### GET /api/species

Returns the list of supported organisms.

Example response:

```json
{
  "species": ["Escherichia coli", "Staphylococcus aureus"]
}
```

### POST /api/analysis

Multipart form-data fields:

- `species` (string, required)
- `antibiotic` (string, optional)
- `fasta` (file, required)

Example response:

```json
{
  "reportId": "REP-123456",
  "organismName": "Escherichia coli",
  "confidence": 0.82,
  "mappingSummary": "Potential beta-lactam resistance cluster",
  "amrMarkers": ["blaTEM-1", "acrB", "mdtK"],
  "associations": [
    { "gene": "gyrA", "category": "Quinolone target" },
    { "gene": "parC", "category": "Quinolone target" }
  ]
}
```

## Deployment on Render (recommended)

Deploy as two services from the same repo.

### Backend (Web Service)

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `node server.js`
- Environment: Node

### Frontend (Static Site)

- Root Directory: `/`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment Variable: `VITE_API_BASE` set to your backend URL

## CORS policy

The API currently restricts CORS to approved origins, including the Render frontend and local development. Update the allow list in the API if you change the frontend URL.

## Clinical and research context

This interface is intended to support antimicrobial resistance research workflows and clinician-facing review. It does not replace clinical judgement or established diagnostic protocols. Any deployment should be validated against institutional governance and regulatory requirements.

## Roadmap (suggested)

- Replace mock analysis output with the mlAMRPred model pipeline
- Authentication and role-based access
- Audit logging and report export
- Integration with LIMS/EHR workflows

## License

MIT. See [LICENSE](LICENSE).
