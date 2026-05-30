import express from "express";
import cors from "cors";
import multer from "multer";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

const starterSpecies = [
  "Escherichia coli",
  "Staphylococcus aureus",
  "Klebsiella pneumoniae",
  "Pseudomonas aeruginosa",
  "Enterococcus faecalis",
  "Acinetobacter baumannii",
  "Streptococcus pneumoniae",
  "Salmonella enterica",
];

app.get("/api/species", (req, res) => {
  res.json({ species: starterSpecies });
});

app.post("/api/analysis", upload.single("fasta"), (req, res) => {
  const { species } = req.body;

  if (!req.file) {
    return res.status(400).send("Missing FASTA file.");
  }

  if (!species) {
    return res.status(400).send("Missing species selection.");
  }

  const reportId = `REP-${Date.now().toString().slice(-6)}`;

  res.json({
    reportId,
    organismName: species,
    confidence: 0.82,
    mappingSummary: "Potential beta-lactam resistance cluster",
    amrMarkers: ["blaTEM-1", "acrB", "mdtK"],
    associations: [
      { gene: "gyrA", category: "Quinolone target" },
      { gene: "parC", category: "Quinolone target" },
      { gene: "marA", category: "Regulatory" },
    ],
  });
});

const PORT = process.env.PORT || 5170;
app.listen(PORT, () => {
  console.log(`AMR API listening on http://localhost:${PORT}`);
});
