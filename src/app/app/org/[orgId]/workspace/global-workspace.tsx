// ============================================
// GitTy — Global Workspace Client Component
// ============================================
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Project, AILog } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GlobalWorkspaceProps {
  orgId: string;
  userEmail: string;
  recentProjects: Project[];
  recentLogs: AILog[];
  memoryCount: number;
}

export function GlobalWorkspace({
  orgId,
  userEmail,
  recentProjects,
  recentLogs,
  memoryCount,
}: GlobalWorkspaceProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Parse recent logs into messages (just mapping the latest ones to display history)
  useEffect(() => {
    if (recentLogs && recentLogs.length > 0 && messages.length === 0) {
      // For simplicity, we just take the last log as a placeholder history, 
      // in reality we'd structure conversations better.
      const lastLog = recentLogs[0];
      setMessages([
        { role: "user", content: lastLog.prompt },
        { role: "assistant", content: lastLog.response || "..." },
      ]);
    }
  }, [recentLogs, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          orgId,
          agentType: "assistant",
          history: messages, // pass previous messages as history
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content || "..." },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-4rem)] lg:h-screen lg:max-h-screen p-4 lg:p-6 gap-6 lg:overflow-hidden">
      
      {/* Main AI Interaction Area */}
      <div className="flex-1 flex flex-col glass-card rounded-3xl overflow-hidden shadow-2xl relative min-h-[600px] lg:min-h-0">
        <div className="orb orb-brand w-[300px] h-[300px] -top-20 -left-20 opacity-20" />
        
        {/* Header */}
        <div className="p-6 border-b border-surface-300/30 backdrop-blur-md z-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">✨</span> Ask GitTy
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Your AI-Native Operating System</p>
          </div>
          <Badge variant="brand" className="animate-pulse-glow">AI Ready</Badge>
        </div>

        {/* Chat / Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 relative custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-6 animate-slide-up">
              <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center text-3xl shadow-xl shadow-brand-500/20">
                G
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">How can I help you today, {userEmail.split('@')[0]}?</h3>
                <p className="text-zinc-400 text-sm">
                  I can generate documents, analyze data, manage your projects, or create automated workflows.
                </p>
              </div>

              {/* Suggestions */}
              <div className="grid grid-cols-2 gap-3 w-full mt-4">
                <button onClick={() => setInput("Create a new project for marketing campaign")} className="p-3 text-left bg-surface-200 hover:bg-surface-300 border border-surface-300/50 rounded-xl text-xs text-zinc-300 transition-all">
                  <span className="block text-lg mb-1">📢</span>
                  Create marketing project
                </button>
                <button onClick={() => setInput("Summarize my recent AI memory context")} className="p-3 text-left bg-surface-200 hover:bg-surface-300 border border-surface-300/50 rounded-xl text-xs text-zinc-300 transition-all">
                  <span className="block text-lg mb-1">🧠</span>
                  Summarize AI memory
                </button>
                <button onClick={() => setInput("Write a draft for a new feature announcement")} className="p-3 text-left bg-surface-200 hover:bg-surface-300 border border-surface-300/50 rounded-xl text-xs text-zinc-300 transition-all">
                  <span className="block text-lg mb-1">✍️</span>
                  Draft announcement
                </button>
                <button onClick={() => setInput("Analyze the latest trends in SaaS")} className="p-3 text-left bg-surface-200 hover:bg-surface-300 border border-surface-300/50 rounded-xl text-xs text-zinc-300 transition-all">
                  <span className="block text-lg mb-1">📈</span>
                  Analyze SaaS trends
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-4 max-w-[85%]",
                    msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm",
                      msg.role === "user"
                        ? "bg-brand-500 text-white"
                        : "gradient-brand text-white"
                    )}
                  >
                    {msg.role === "user" ? userEmail[0]?.toUpperCase() : "G"}
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-brand-500/10 border border-brand-500/20 text-white rounded-tr-sm"
                        : "bg-surface-200 border border-surface-300/30 text-zinc-300 rounded-tl-sm whitespace-pre-wrap"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 pt-2 z-10">
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
            <div className="relative flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message GitTy or type '/' for commands..."
                className="min-h-[60px] max-h-[200px] resize-none pb-12 rounded-2xl bg-surface-200/50 border-surface-300/50 focus:bg-surface-200 focus:ring-1 focus:ring-brand-500/50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="absolute bottom-3 left-3 flex gap-2">
                <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-300 text-zinc-400 transition-colors">
                  <span className="text-lg">📎</span>
                </button>
                <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-300 text-zinc-400 transition-colors">
                  <span className="text-lg">🌐</span>
                </button>
              </div>
            </div>
            <Button
              type="submit"
              variant="gradient"
              disabled={!input.trim() || isLoading}
              className="h-[60px] w-[60px] rounded-2xl shrink-0"
              isLoading={isLoading}
            >
              <span className="text-xl">↑</span>
            </Button>
          </form>
          <p className="text-center text-[10px] text-zinc-500 mt-3">
            GitTy AI can make mistakes. Consider verifying critical information.
          </p>
        </div>
      </div>

      {/* Right Sidebar - Context & Quick Navigation */}
      <div className="w-full lg:w-80 flex flex-col gap-6 lg:overflow-y-auto custom-scrollbar pb-8 lg:pb-0">
        
        {/* System Context */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Context
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-200 p-3 rounded-xl border border-surface-300/30">
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-1">Memory Nodes</p>
              <p className="text-xl font-bold text-white">{memoryCount}</p>
            </div>
            <div className="bg-surface-200 p-3 rounded-xl border border-surface-300/30">
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-1">Active Model</p>
              <p className="text-sm font-bold text-brand-400 truncate">GPT-4o</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pl-1">Quick Actions</h3>
          <Link href={`/app/org/${orgId}/projects`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-200 text-zinc-300 transition-colors border border-transparent hover:border-surface-300/50">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">📁</div>
            <span className="text-sm font-medium">New Project</span>
          </Link>
          <Link href={`/app/org/${orgId}/agents`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-200 text-zinc-300 transition-colors border border-transparent hover:border-surface-300/50">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">🤖</div>
            <span className="text-sm font-medium">Configure Agents</span>
          </Link>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-200 text-zinc-300 transition-colors border border-transparent hover:border-surface-300/50">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">⚡</div>
            <span className="text-sm font-medium">New Automation (Soon)</span>
          </button>
        </div>

        {/* Recent Projects */}
        <div className="space-y-3 flex-1">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pl-1">Recent Projects</h3>
          {recentProjects.length === 0 ? (
            <div className="text-sm text-zinc-500 p-4 bg-surface-200/50 rounded-xl border border-surface-300/30 text-center">
              No recent projects
            </div>
          ) : (
            <div className="space-y-2">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/app/org/${orgId}/project/${project.id}`}
                  className="flex items-start gap-3 p-3 rounded-xl bg-surface-200 border border-surface-300/30 hover:bg-surface-300 hover:border-surface-400/50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-400/30 flex items-center justify-center text-sm">
                    {project.title[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate group-hover:text-brand-300 transition-colors">{project.title}</h4>
                    <p className="text-xs text-zinc-500 truncate">{new Date(project.updated_at).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
