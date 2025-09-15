import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import { Lead } from '../models/types';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// In-memory leads store
let leadsStore: Lead[] = [];

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file required (multipart form-data field "file")' });
  const text = req.file.buffer.toString('utf-8');
  const records: Lead[] = [];
  parse(text, { columns: true, trim: true }, (err, parsed) => {
    if (err) {
      return res.status(400).json({ error: 'CSV parse error', details: err.message });
    }
    for (const row of parsed) {
      // minimal normalization
      records.push({
        name: row.name || '',
        role: row.role || '',
        company: row.company || '',
        industry: row.industry || '',
        location: row.location || '',
        linkedin_bio: row.linkedin_bio || ''
      });
    }
    leadsStore = leadsStore.concat(records);
    return res.json({ status: 'ok', uploaded: records.length });
  });
});

router.get('/all', (req, res) => {
  return res.json(leadsStore);
});

// Export simple accessor for other modules
export function getLeadsStore() {
  return leadsStore;
}

export default router;
