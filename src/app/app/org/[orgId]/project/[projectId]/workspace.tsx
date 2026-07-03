// ============================================
// GitTy — Project Workspace Client
// ============================================
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { agentTypes } from "@/lib/config";
import type { Project, AILog, AIMemory, ChatMessage } from "@/lib/types";

interface WorkspaceProps {
  project: Project;
  orgId: string;
  userId: string;
  initialLogs: AILog[];
  initialMemories: AIMemory[];
}

export function ProjectWorkspace({
  project,
  orgId,
  userId,
  initialLogs,
  initialMemories,
}: WorkspaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    initialLogs.flatMap((log) => [
      {
        id: `${log.id}-q`,
        role: "user" as const,
        content: log.prompt,
        timestamp: new Date(log.created_at).getTime(),
      },
      ...(log.response
        ? [
            {
              id: `${log.id}-a`,
              role: "assistant" as const,
              content: log.response,
              agent_type: log.agent_type,
              timestamp: new Date(log.created_at).getTime() + 1,
            },
          ]
        : []),
    ])
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState("assistant");
  const [activeTab, setActiveTab] = useState<"chat" | "memory" | "agents">(
    "chat"
  );
  const [memories] = useState(initialMemories);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          orgId,
          projectId: project.id,
          userId,
          agentType: activeAgent,
          history: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        agent_type: activeAgent,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Error: ${err instanceof Error ? err.message : "Failed to get response"}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-surface-300/30 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">{project.title}</h1>
          <p className="text-sm text-zinc-500">{project.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">{project.status}</Badge>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          <div className="border-b border-surface-300/30 px-6 flex gap-1">
            {(["chat", "memory", "agents"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium transition-all border-b-2 cursor-pointer capitalize ${
                  activeTab === tab
                    ? "text-brand-400 border-brand-400"
                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                }`}
              >
                {tab === "chat" ? "🤖 AI Chat" : tab === "memory" ? "🧠 Memory" : "⚡ Agents"}
              </button>
            ))}
          </div>

          {activeTab === "chat" && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-surface-200 flex items-center justify-center mx-auto mb-4 text-3xl">
                        🤖
                      </div>
                      <h2 className="text-xl font-semibold text-white mb-2">
                        Start a conversation
                      </h2>
                      <p className="text-zinc-400 text-sm max-w-md">
                        Ask your AI assistant anything about this project. It
                        can generate content, analyze data, and help you build.
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-brand-600 text-white"
                          : "bg-surface-200 text-zinc-200"
                      }`}
                    >
                      {msg.role === "assistant" && msg.agent_type && (
                        <p className="text-xs text-zinc-500 mb-1 capitalize">
                          {msg.agent_type} Agent
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-surface-200 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" />
                        <div
                          className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-surface-300/30 p-4">
                <form
                  onSubmit={handleSend}
                  className="flex items-end gap-3 max-w-4xl mx-auto"
                >
                  <div className="flex-1 relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                      placeholder={`Ask the ${activeAgent} agent...`}
                      className="w-full rounded-xl bg-surface-100 border border-surface-400/50 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none min-h-[48px] max-h-[200px]"
                      rows={1}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={!input.trim() || isLoading}
                    isLoading={isLoading}
                  >
                    Send
                  </Button>
                </form>

                {/* Agent Selector */}
                <div className="flex items-center gap-2 mt-3 max-w-4xl mx-auto">
                  <span className="text-xs text-zinc-500">Agent:</span>
                  <select
                    value={activeAgent}
                    onChange={(e) => setActiveAgent(e.target.value)}
                    className="bg-surface-200 border border-surface-400/50 rounded-lg px-2.5 py-1 text-xs text-zinc-300 focus:outline-none cursor-pointer"
                  >
                    <option value="assistant">General Assistant</option>
                    {agentTypes.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.icon} {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === "memory" && (
            <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Project Memory
              </h2>
              <p className="text-sm text-zinc-400 mb-6">
                Persistent context that AI uses to provide better responses over
                time.
              </p>
              {memories.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-zinc-500 text-sm">
                    No memories stored yet. AI will automatically build context as
                    you interact.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memories.map((mem) => (
                    <div
                      key={mem.id}
                      className="glass-card rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="brand">{mem.memory_type}</Badge>
                        <span className="text-xs text-zinc-500">
                          {new Date(mem.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300">{mem.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "agents" && (
            <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Available AI Agents
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {agentTypes.map((agent) => (
                  <div
                    key={agent.id}
                    className={`glass-card rounded-xl p-5 cursor-pointer transition-all ${
                      activeAgent === agent.id
                        ? "ring-2 ring-brand-500/50"
                        : ""
                    }`}
                    onClick={() => {
                      setActiveAgent(agent.id);
                      setActiveTab("chat");
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{agent.icon}</span>
                      <div>
                        <h3 className="font-semibold text-white">
                          {agent.name}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-400">{agent.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-xs text-zinc-500">Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
