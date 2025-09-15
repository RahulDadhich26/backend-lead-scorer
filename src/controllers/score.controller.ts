import express from 'express';
import { getLeadsStore } from './leads.controller';
import { ScoredLead, Lead } from '../models/types';
import ruleEngine from '../rules/ruleEngine';

const router = express.Router();

// In-memory results
let resultsStore: ScoredLead[] = [];

router.post('/', async (req, res) => {
  // Placeholder synchronous scoring: rule-only + dummy AI points
  const leads: Lead[] = getLeadsStore();
  const offer = req.body.offer || null;
  if (!offer) {
    return res.status(400).json({ error: 'Offer required in request body for scoring (temporary placeholder).' });
  }
  const scored: ScoredLead[] = leads.map(lead => {
    const ruleScore = ruleEngine.computeRuleScore(lead, offer);
    const aiIntent = 'Medium'; // placeholder
    const aiPoints = 30;
    const final = Math.min(100, ruleScore + aiPoints);
    return {
      ...lead,
      intent: aiIntent as any,
      score: final,
      rule_score: ruleScore,
      ai_points: aiPoints,
      reasoning: 'AI reasoning placeholder. | rule_score: ' + ruleScore
    };
  });
  resultsStore = scored;
  return res.json({ status: 'ok', scored: scored.length, results: scored });
});

router.get('/results', (req, res) => {
  return res.json(resultsStore);
});

export default router;
