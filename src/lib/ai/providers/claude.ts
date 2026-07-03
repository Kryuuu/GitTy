// ============================================
// GitTy — AI Provider: Claude (Anthropic)
// ============================================

export interface ClaudeRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  system?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface AIProviderResponse {
  content: string;
  model: string;
  provider: string;
  tokens_used: number;
  cost_cents: number;
}

export async function generateClaude(
  request: ClaudeRequest
): Promise<AIProviderResponse> {
  const model = request.model || "claude-sonnet-4-20250514";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: request.max_tokens || 2048,
      system: request.system,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();
  const tokens =
    (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

  return {
    content: data.content?.[0]?.text || "",
    model,
    provider: "claude",
    tokens_used: tokens,
    cost_cents: Math.ceil((tokens / 1000) * 0.3 * 100),
  };
}
