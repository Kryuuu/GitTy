// ============================================
// GitTy — Knowledge Client
// ============================================
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Knowledge } from "@/lib/types";

interface KnowledgeClientProps {
  orgId: string;
  initialFiles: Knowledge[];
}

export function KnowledgeClient({ orgId, initialFiles }: KnowledgeClientProps) {
  const [files, setFiles] = useState<Knowledge[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("orgId", orgId);

      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload file");
      }

      const newFile = await res.json();
      setFiles((prev) => [newFile.data, ...prev]);
    } catch (error) {
      console.error(error);
      alert("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge variant="success">Ready</Badge>;
      case "processing":
        return <Badge variant="warning" className="animate-pulse">Processing</Badge>;
      case "failed":
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getFileIcon = (type: string | null) => {
    if (!type) return "📄";
    if (type.includes("pdf")) return "📕";
    if (type.includes("word") || type.includes("document")) return "📘";
    if (type.includes("text") || type.includes("markdown")) return "📝";
    if (type.includes("csv") || type.includes("excel")) return "📊";
    if (type.includes("image")) return "🖼️";
    return "📄";
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-8 border border-surface-300/30 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="w-16 h-16 rounded-full bg-surface-200 border border-surface-300/50 flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
          ☁️
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2">Upload Knowledge</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
          Support PDF, DOCX, TXT, Markdown, CSV, and Images. Files will be automatically processed into AI Context memory.
        </p>
        
        <label className="relative inline-flex cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,.md,.csv,image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="gradient"
            isLoading={isUploading}
            disabled={isUploading}
            className="cursor-pointer pointer-events-none"
          >
            {isUploading ? "Processing..." : "Select File"}
          </Button>
        </label>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider pl-2">
          Knowledge Base ({files.length})
        </h3>
        
        {files.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border border-dashed border-surface-300/50">
            <p className="text-zinc-500">Your knowledge base is empty.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="glass-card rounded-2xl p-4 border border-surface-300/30 flex items-center justify-between hover:bg-surface-200 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-300/50 flex items-center justify-center text-xl">
                    {getFileIcon(file.file_type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white truncate max-w-[300px] sm:max-w-md">
                      {file.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-500">
                        {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : "Unknown size"}
                      </span>
                      <span className="text-zinc-600 text-xs">•</span>
                      <span className="text-xs text-zinc-500">
                        {new Date(file.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(file.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
