// ============================================
// GitTy — AI Chat API Route
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { routeAI } from "@/lib/ai/router";
import { agentTypes } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, orgId, projectId, userId, agentType, history } = body;

    if (!message || !orgId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user is member of org
    const { data: membership } = await supabase
      .from("org_members")
      .select("id")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check usage limits
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("org_id", orgId)
      .single();

    if (
      subscription &&
      subscription.usage_limit > 0 &&
      subscription.usage_count >= subscription.usage_limit
    ) {
      return NextResponse.json(
        { error: "AI usage limit reached. Please upgrade your plan." },
        { status: 429 }
      );
    }

    // Get agent system prompt
    const agent = agentTypes.find((a) => a.id === agentType);
    const systemPrompt = agent?.systemPrompt ||
      "You are a helpful AI assistant for the GitTy platform. Help the user with their project tasks.";

    // Get project memory for context
    let memoryQuery = supabase
      .from("ai_memory")
      .select("content")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (projectId) {
      memoryQuery = memoryQuery.eq("project_id", projectId);
    } else {
      memoryQuery = memoryQuery.is("project_id", null);
    }

    const { data: memories } = await memoryQuery;

    const memoryContext = memories?.length
      ? `\n\nRelevant project memory:\n${memories.map((m) => `- ${m.content}`).join("\n")}`
      : "";

    // Build messages array
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      {
        role: "system",
        content: systemPrompt + memoryContext,
      },
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    // Route to AI provider
    const response = await routeAI({ messages });

    // Log the interaction
    await supabase.from("ai_logs").insert({
      org_id: orgId,
      project_id: projectId || null,
      user_id: userId || user.id,
      agent_type: agentType || "assistant",
      prompt: message,
      response: response.content,
      provider: response.provider,
      model: response.model,
      tokens_used: response.tokens_used,
      cost_cents: response.cost_cents,
    });

    // Increment usage count
    if (subscription) {
      await supabase
        .from("subscriptions")
        .update({ usage_count: (subscription.usage_count || 0) + 1 })
        .eq("id", subscription.id);
    }

    // Auto-store important context as memory
    if (response.tokens_used > 200) {
      await supabase.from("ai_memory").insert({
        org_id: orgId,
        project_id: projectId || null,
        memory_type: "context",
        content: `User asked: "${message.substring(0, 200)}" — AI provided a detailed response about this topic.`,
      });
    }

    return NextResponse.json({
      content: response.content,
      provider: response.provider,
      model: response.model,
      tokens_used: response.tokens_used,
    });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}
