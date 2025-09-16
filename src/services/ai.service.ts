import fetch from "node-fetch";
import { Lead, Offer } from "../models/types";

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 15000);

type AIResult = { intent: "High" | "Medium" | "Low"; explanation: string };

export async function classifyLeadWithAI(
  lead: Lead,
  offer: Offer
): Promise<AIResult> {
  if (!GEMINI_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const prompt = `Product offer:
- name: ${offer.name}
- value_props: ${JSON.stringify(offer.value_props)}
- ideal_use_cases: ${JSON.stringify(offer.ideal_use_cases)}

Prospect:
- name: ${lead.name}
- role: ${lead.role}
- company: ${lead.company}
- industry: ${lead.industry}
- location: ${lead.location}
- linkedin_bio: ${lead.linkedin_bio || ""}

Task:
1) Classify intent as High / Medium / Low.
2) Explain in 1-2 sentences why (mention role, industry fit, signals).
Return JSON:
{ "intent": "<High|Medium|Low>", "explanation": "<1-2 sentence explanation>" }`;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        signal: controller.signal as any,
      }
    );

    clearTimeout(id);
    if (!res.ok) {
      throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    const parsed = JSON.parse(text);
    const intent =
      ["High", "Medium", "Low"].includes(parsed.intent) ? parsed.intent : "Medium";

    return { intent, explanation: parsed.explanation || "No explanation" };
  } catch (err: any) {
    return {
      intent: "Medium",
      explanation: `Gemini API error: ${err.message}. Fallback Medium.`,
    };
  } finally {
    clearTimeout(id);
  }
}