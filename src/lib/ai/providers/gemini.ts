// ============================================
// GitTy — AI Provider: Gemini (Google)
// ============================================

export interface GeminiRequest {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
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

export async function generateGemini(
  request: GeminiRequest
): Promise<AIProviderResponse> {
  const model = request.model || "gemini-2.0-flash";
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) throw new Error("Google AI API key not configured");

  // Convert messages to Gemini format
  const systemInstruction = request.messages.find((m) => m.role === "system");
  const contents = request.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: systemInstruction
          ? { parts: [{ text: systemInstruction.content }] }
          : undefined,
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.max_tokens ?? 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const tokens =
    (data.usageMetadata?.totalTokenCount) || 0;

  return {
    content: text,
    model,
    provider: "gemini",
    tokens_used: tokens,
    cost_cents: Math.ceil((tokens / 1000) * 0.01 * 100),
  };
}
