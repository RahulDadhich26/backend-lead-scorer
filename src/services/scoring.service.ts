import { Lead, Offer, ScoredLead } from '../models/types';
import ruleEngine from '../rules/ruleEngine';
import { classifyLeadWithAI } from './ai.service';

export async function scoreLeads(leads: Lead[], offer: Offer): Promise<ScoredLead[]> {
  const results: ScoredLead[] = [];
  for (const lead of leads) {
    const rule_score = ruleEngine.computeRuleScore(lead, offer); // 0-50
    const ai = await classifyLeadWithAI(lead, offer); // may fallback to Medium
    const ai_points = ai.intent === 'High' ? 50 : ai.intent === 'Medium' ? 30 : 10;
    let final_score = rule_score + ai_points;
    if (final_score > 100) final_score = 100;
    const scored: ScoredLead = {
      ...lead,
      intent: ai.intent,
      score: final_score,
      rule_score,
      ai_points,
      reasoning: ai.explanation + ` | rule_score: ${rule_score}`
    };
    results.push(scored);
  }
  return results;
}
