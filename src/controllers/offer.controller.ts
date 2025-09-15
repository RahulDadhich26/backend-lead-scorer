import express from 'express';
import { Offer } from '../models/types';

const router = express.Router();

// In-memory storage (simple)
let currentOffer: Offer | null = null;

router.post('/', (req, res) => {
  const offer: Offer = req.body;
  currentOffer = offer;
  return res.json({ status: 'ok', offer: currentOffer });
});

router.get('/current', (req, res) => {
  if (!currentOffer) return res.status(404).json({ error: 'No offer set' });
  return res.json(currentOffer);
});

export default router;
