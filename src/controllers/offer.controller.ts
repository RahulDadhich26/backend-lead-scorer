import express from 'express';
import { Offer } from '../models/types';

const router = express.Router();

// In-memory storage (simple)
let currentOffer: Offer | null = null;

router.post('/', (req, res) => {
  const offer: Offer = req.body;
  if (!offer || !offer.name) {
    return res.status(400).json({ error: 'offer name required' });
  }
  if (!Array.isArray(offer.value_props)) offer.value_props = [];
  if (!Array.isArray(offer.ideal_use_cases)) offer.ideal_use_cases = [];
  currentOffer = offer;
  return res.json({ status: 'ok', offer: currentOffer });
});

router.get('/current', (req, res) => {
  if (!currentOffer) return res.status(404).json({ error: 'No offer set' });
  return res.json(currentOffer);
});

export function getCurrentOffer(): Offer | null {
  return currentOffer;
}

export default router;
