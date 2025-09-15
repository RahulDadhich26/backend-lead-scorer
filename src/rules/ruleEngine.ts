import { Lead, Offer } from '../models/types';

const decisionMakerKeywords = ['ceo','founder','co-founder','cto','cpo','head','vp','director','president','managing director'];
const influencerKeywords = ['manager','lead','principal','senior','growth','product owner','marketing manager'];

function normalize(s: string) {
  return (s || '').toLowerCase().trim();
}

export default {
  computeRuleScore(lead: Lead, offer: Offer): number {
    let score = 0;
    const role = normalize(lead.role || '');
    const industry = normalize(lead.industry || '');

    // Role relevance
    if (decisionMakerKeywords.some(k => role.includes(k))) score += 20;
    else if (influencerKeywords.some(k => role.includes(k))) score += 10;

    // Industry match (simple exact match against offer.ideal_use_cases)
    const ideal = (offer.ideal_use_cases || []).map((s: string) => normalize(s));
    if (ideal.includes(industry)) score += 20;
    else if (ideal.some((i: string) => industry.includes(i) || i.includes(industry))) score += 10;

    // Data completeness
    const required = ['name','role','company','industry','location'];
    const complete = required.every(f => Boolean((lead as any)[f]));
    if (complete) score += 10;

    return Math.min(50, score);
  }
};
