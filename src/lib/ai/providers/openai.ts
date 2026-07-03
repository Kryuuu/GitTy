// ============================================
// GitTy — AI Provider: OpenAI
// ============================================
import OpenAI from "openai";

let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export interface AIProviderRequest {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface AIProviderResponse {
  content: string;
  model: string;
  provider: string;
  tokens_used: number;
  cost_cents: number;
}

export async function generateOpenAI(
  request: AIProviderRequest
): Promise<AIProviderResponse> {
  const model = request.model || "gpt-4o-mini";
  const response = await getOpenAI().chat.completions.create({
    model,
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.max_tokens ?? 2048,
  });

  const tokens = response.usage?.total_tokens || 0;
  // Rough cost estimation (gpt-4o-mini pricing)
  const costPer1kTokens = model.includes("gpt-4o-mini") ? 0.015 : 0.5;
  const cost_cents = Math.ceil((tokens / 1000) * costPer1kTokens * 100);

  return {
    content: response.choices[0]?.message?.content || "",
    model,
    provider: "openai",
    tokens_used: tokens,
    cost_cents,
  };
}

export async function streamOpenAI(request: AIProviderRequest) {
  const model = request.model || "gpt-4o-mini";
  const stream = await getOpenAI().chat.completions.create({
    model,
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.max_tokens ?? 2048,
    stream: true,
  });

  return stream;
}
