import { Router } from "express";
import { getResults } from "../services/scoring.service";
import { Parser } from "json2csv";

const router = Router();

// Existing routes ...
router.get("/results", (req, res) => {
  const results = getResults();
  res.json(results);
});

// ✅ New: Export results as CSV
router.get("/results/export", (req, res) => {
  const results = getResults();
  if (!results || results.length === 0) {
    return res.status(400).json({ error: "No results to export" });
  }

  try {
    const parser = new Parser();
    const csv = parser.parse(results);

    res.header("Content-Type", "text/csv");
    res.attachment("results.csv");
    return res.send(csv);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;