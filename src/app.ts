import express from 'express';
import offerRouter from './controllers/offer.controller';
import leadsRouter from './controllers/leads.controller';
import scoreRouter from './controllers/score.controller';

const app = express();
app.use(express.json());

app.use('/offer', offerRouter);
app.use('/leads', leadsRouter);
app.use('/score', scoreRouter);

app.get('/', (req, res) => res.json({ status: 'ok', message: 'Backend Lead Scorer scaffold' }));

export default app;
