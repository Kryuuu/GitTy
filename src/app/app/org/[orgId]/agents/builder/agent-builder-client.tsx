// ============================================
// GitTy — Agent Builder Client
// ============================================
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAgentAction } from "../actions";

interface AgentBuilderClientProps {
  orgId: string;
}

export function AgentBuilderClient({ orgId }: AgentBuilderClientProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("orgId", orgId);
      
      await createAgentAction(formData);
      // Navigation is handled by the server action redirect
    } catch (error) {
      console.error(error);
      alert("Failed to create agent");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
      <div className="glass-card rounded-2xl p-6 border border-surface-300/30 space-y-6">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Agent Name <span className="text-red-400">*</span></label>
            <Input 
              name="name" 
              placeholder="e.g. Content Writer AI" 
              required
              className="bg-surface-200 border-surface-300/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Emoji Avatar</label>
            <Input 
              name="avatar" 
              placeholder="✍️" 
              defaultValue="🤖"
              maxLength={2}
              className="bg-surface-200 border-surface-300/50 text-2xl text-center"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Short Description</label>
          <Input 
            name="description" 
            placeholder="Writes compelling marketing copy..." 
            className="bg-surface-200 border-surface-300/50"
          />
        </div>

        {/* Brain / System Prompt */}
        <div className="space-y-2 pt-4 border-t border-surface-300/30">
          <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            🧠 System Prompt <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-zinc-500 mb-2">
            This defines the persona, rules, and boundaries of your agent. Be as specific as possible.
          </p>
          <Textarea 
            name="systemPrompt" 
            required
            placeholder="You are an expert content writer for a SaaS company. Your tone is professional yet approachable. Always format your output in markdown..." 
            className="min-h-[150px] bg-surface-200 border-surface-300/50 font-mono text-sm resize-y"
          />
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-surface-300/30">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">AI Provider</label>
            <select 
              name="provider" 
              className="w-full h-10 px-3 py-2 rounded-xl bg-surface-200 border border-surface-300/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="openai">OpenAI (GPT-4o)</option>
              <option value="anthropic">Anthropic (Claude 3.5)</option>
              <option value="google">Google (Gemini 1.5)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Creativity (Temp)</label>
            <select 
              name="temperature" 
              className="w-full h-10 px-3 py-2 rounded-xl bg-surface-200 border border-surface-300/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              defaultValue="0.7"
            >
              <option value="0.2">Precise (0.2)</option>
              <option value="0.5">Balanced (0.5)</option>
              <option value="0.7">Creative (0.7)</option>
              <option value="0.9">Wild (0.9)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Visibility</label>
            <select 
              name="visibility" 
              className="w-full h-10 px-3 py-2 rounded-xl bg-surface-200 border border-surface-300/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="private">Private (Only me)</option>
              <option value="org">Organization (All members)</option>
              <option value="public">Public (Marketplace)</option>
            </select>
          </div>
        </div>

      </div>

      <div className="flex justify-end gap-3">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="gradient"
          isLoading={isLoading}
        >
          Deploy Agent
        </Button>
      </div>
    </form>
  );
}
