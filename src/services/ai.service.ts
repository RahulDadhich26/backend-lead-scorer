import fetch from "node-fetch";
import { Lead, Offer } from "../models/types";

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 15000);

type AIResult = { intent: "High" | "Medium" | "Low"; explanation: string };

function parseJsonFromText(text: string): any {
  if (!text) return {};
  let candidate = text.trim();

  // If wrapped in Markdown code fences, extract inner content
  const fenceMatch = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) {
    candidate = fenceMatch[1].trim();
  }

  // If still not a plain object start, try to isolate the first {...} block
  if (!candidate.trim().startsWith("{")) {
    const firstBrace = candidate.indexOf("{");
    const lastBrace = candidate.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      candidate = candidate.substring(firstBrace, lastBrace + 1);
    }
  }

  return JSON.parse(candidate);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
    const doRequest = async (): Promise<AIResult> => {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
          signal: controller.signal as any,
        }
      );

      if (res.status === 429) {
        // Try to respect retry delay once
        const bodyText = await res.text();
        try {
          const body = JSON.parse(bodyText);
          const retryInfo = body?.error?.details?.find((d: any) => d && typeof d["@type"] === "string" && d["@type"].includes("RetryInfo"));
          const delayStr: string | undefined = retryInfo?.retryDelay; // e.g., "42s"
          const delayMs = delayStr && delayStr.endsWith("s") ? Number(delayStr.replace("s", "")) * 1000 : 3000;
          if (delayMs && delayMs > 0) {
            await sleep(delayMs);
          }
        } catch {
          // default small backoff
          await sleep(3000);
        }
        // one retry
        const retryRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            signal: controller.signal as any,
          }
        );
        if (!retryRes.ok) {
          throw new Error(`Gemini error ${retryRes.status}: ${await retryRes.text()}`);
        }
        const retryData = await retryRes.json();
        const retryText = retryData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const retryParsed = parseJsonFromText(retryText);
        const retryIntent = ["High", "Medium", "Low"].includes(retryParsed.intent) ? retryParsed.intent : "Medium";
        return { intent: retryIntent, explanation: retryParsed.explanation || "No explanation" };
      }

      if (!res.ok) {
        throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const parsed = parseJsonFromText(text);
      const intent = ["High", "Medium", "Low"].includes(parsed.intent) ? parsed.intent : "Medium";
      return { intent, explanation: parsed.explanation || "No explanation" };
    };

    const result = await doRequest();
    clearTimeout(id);
    return result;
  } catch (err: any) {
    return {
      intent: "Medium",
      explanation: `Gemini API error: ${err.message}. Fallback Medium.`,
    };
  } finally {
    clearTimeout(id);
  }
}