export type Offer = {
  name: string;
  value_props: string[];
  ideal_use_cases: string[];
};

export type Lead = {
  name: string;
  role: string;
  company: string;
  industry: string;
  location: string;
  linkedin_bio?: string;
};

export type ScoredLead = Lead & {
  intent: 'High' | 'Medium' | 'Low';
  score: number;
  rule_score: number;
  ai_points: number;
  reasoning: string;
};
