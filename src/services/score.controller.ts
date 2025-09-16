import express from 'express';
import { Parser } from 'json2csv';
import { getLeadsStore } from './leads.controller';
import { getCurrentOffer } from './offer.controller';
import { Offer } from '../models/types';
import { scoreLeads } from '../services/scoring.service';

const router = express.Router();

let resultsStore: any[] = [];

router.post('/', async (req, res) => {
  try {
    const offerFromBody: Offer | null = req.body.offer || null;
    const offer = offerFromBody || getCurrentOffer();
    if (!offer) {
      return res.status(400).json({ error: 'No offer set. Provide offer in body or POST /offer first.' });
    }
    const leads = getLeadsStore();
    if (!leads || leads.length === 0) {
      return res.status(400).json({ error: 'No leads uploaded. POST /leads/upload first.' });
    }
    const scored = await scoreLeads(leads, offer);
    resultsStore = scored;
    return res.json({ status: 'ok', scored: scored.length, results: scored });
  } catch (err: any) {
    return res.status(500).json({ error: 'Scoring failed', details: err.message });
  }
});

router.get('/results', (req, res) => {
  return res.json(resultsStore);
});

router.get('/results/export', (req, res) => {
  if (!resultsStore || resultsStore.length === 0) {
    return res.status(400).json({ error: 'No results to export' });
  }

  try {
    const parser = new Parser();
    const csv = parser.parse(resultsStore);
    res.header('Content-Type', 'text/csv');
    res.attachment('results.csv');
    return res.send(csv);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
