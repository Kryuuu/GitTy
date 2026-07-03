// ============================================
// GitTy — AI Router (Smart Routing + Fallback)
// ============================================
import {
  generateOpenAI,
  type AIProviderRequest,
} from "./providers/openai";
import { generateClaude } from "./providers/claude";
import { generateGemini } from "./providers/gemini";

export type AIProvider = "openai" | "claude" | "gemini";

interface RouterConfig {
  provider?: AIProvider;
  fallbackOrder?: AIProvider[];
  costOptimize?: boolean;
}

interface AIRouterResponse {
  content: string;
  model: string;
  provider: string;
  tokens_used: number;
  cost_cents: number;
}

const DEFAULT_FALLBACK_ORDER: AIProvider[] = ["openai", "claude", "gemini"];

function isProviderAvailable(provider: AIProvider): boolean {
  switch (provider) {
    case "openai":
      return !!process.env.OPENAI_API_KEY;
    case "claude":
      return !!process.env.ANTHROPIC_API_KEY;
    case "gemini":
      return !!process.env.GOOGLE_AI_API_KEY;
    default:
      return false;
  }
}

async function callProvider(
  provider: AIProvider,
  request: AIProviderRequest
): Promise<AIRouterResponse> {
  switch (provider) {
    case "openai":
      return generateOpenAI(request);
    case "claude": {
      const systemMsg = request.messages.find((m) => m.role === "system");
      const nonSystemMsgs = request.messages.filter(
        (m) => m.role !== "system"
      ) as { role: "user" | "assistant"; content: string }[];
      return generateClaude({
        ...request,
        system: systemMsg?.content,
        messages: nonSystemMsgs,
      });
    }
    case "gemini":
      return generateGemini(request);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export async function routeAI(
  request: AIProviderRequest,
  config: RouterConfig = {}
): Promise<AIRouterResponse> {
  const {
    provider: preferredProvider,
    fallbackOrder = DEFAULT_FALLBACK_ORDER,
    costOptimize = false,
  } = config;

  // Determine provider order
  let providerOrder: AIProvider[];
  if (preferredProvider && isProviderAvailable(preferredProvider)) {
    providerOrder = [
      preferredProvider,
      ...fallbackOrder.filter((p) => p !== preferredProvider),
    ];
  } else if (costOptimize) {
    // Cost-optimized order: Gemini < OpenAI (mini) < Claude
    providerOrder = ["gemini", "openai", "claude"];
  } else {
    providerOrder = fallbackOrder;
  }

  // Filter to available providers
  const availableProviders = providerOrder.filter(isProviderAvailable);

  if (availableProviders.length === 0) {
    throw new Error(
      "No AI providers available. Please configure at least one API key."
    );
  }

  // Try each provider in order with fallback
  let lastError: Error | null = null;
  for (const prov of availableProviders) {
    try {
      return await callProvider(prov, request);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`AI provider ${prov} failed:`, lastError.message);
      continue;
    }
  }

  throw lastError || new Error("All AI providers failed");
}
