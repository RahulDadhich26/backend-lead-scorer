import fetch from 'node-fetch';
import { Lead, Offer } from '../models/types';

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const MODEL = process.env.AI_MODEL || 'gpt-4o-mini';
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 15000);

type AIResult = { intent: 'High'|'Medium'|'Low', explanation: string };

async function callOpenAI(prompt: string): Promise<string> {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY not set in env');
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: "You are a concise sales-intent classifier. Given a short product/offer description and prospect information, classify the prospect's buying intent as one of: High, Medium, or Low. Provide a 1-2 sentence reasoning focused on fit to product, role, and signals from the biography. Respond with a JSON object only." },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.0
      }),
      signal: controller.signal as any
    });
    clearTimeout(id);
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OpenAI error ${res.status}: ${txt}`);
    }
    const data = await res.json();
    const choice = data.choices && data.choices[0];
    const content = choice && (choice.message?.content || choice.text) || '';
    return content;
  } finally {
    clearTimeout(id);
  }
}

export async function classifyLeadWithAI(lead: Lead, offer: Offer): Promise<AIResult> {
  const prompt = `Product offer:\n- name: ${offer.name}\n- value_props: ${JSON.stringify(offer.value_props)}\n- ideal_use_cases: ${JSON.stringify(offer.ideal_use_cases)}\n\nProspect:\n- name: ${lead.name}\n- role: ${lead.role}\n- company: ${lead.company}\n- industry: ${lead.industry}\n- location: ${lead.location}\n- linkedin_bio: ${lead.linkedin_bio || ''}\n\nTask:\n1) Classify intent as High / Medium / Low.\n2) Explain in 1-2 sentences why (mention role, industry fit, signals).\nReturn a JSON object exactly in this format:\n{ "intent": "<High|Medium|Low>", "explanation": "<1-2 sentence explanation>" }`;

  try {
    const raw = await callOpenAI(prompt);
    const jsonTextMatch = raw.match(/\{[\s\S]*\}/);
    const jsonText = jsonTextMatch ? jsonTextMatch[0] : raw;
    const parsed = JSON.parse(jsonText);
    const intent = (parsed.intent || 'Medium');
    const explanation = parsed.explanation || (typeof parsed === 'string' ? parsed : 'No explanation provided');
    const normalizedIntent = ['High','Medium','Low'].includes(intent) ? intent : 'Medium';
    return { intent: normalizedIntent as any, explanation: String(explanation).trim() };
  } catch (err: any) {
    return { intent: 'Medium', explanation: `AI unavailable or parse error: ${err.message}. Fallback to Medium.` };
  }
}
