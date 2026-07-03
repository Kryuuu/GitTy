// ============================================
// GitTy — Projects List (Client Component)
// ============================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/lib/types";

interface ProjectsListProps {
  orgId: string;
  userId: string;
  initialProjects: Project[];
}

export function ProjectsList({
  orgId,
  userId,
  initialProjects,
}: ProjectsListProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: createError } = await supabase
      .from("projects")
      .insert({
        org_id: orgId,
        title: title.trim(),
        description: description.trim() || null,
        created_by: userId,
      })
      .select()
      .single();

    if (createError) {
      setError(createError.message);
      setIsLoading(false);
      return;
    }

    setProjects([data, ...projects]);
    setIsCreateOpen(false);
    setTitle("");
    setDescription("");
    setIsLoading(false);
  }

  async function handleDelete(projectId: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;

    const supabase = createClient();
    await supabase.from("projects").delete().eq("id", projectId);
    setProjects(projects.filter((p) => p.id !== projectId));
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-zinc-400 mt-1">
            Manage your organization&apos;s projects and workspaces
          </p>
        </div>
        <Button variant="gradient" onClick={() => setIsCreateOpen(true)}>
          + New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-200 flex items-center justify-center mx-auto mb-4 text-3xl">
            📁
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No projects yet
          </h2>
          <p className="text-zinc-400 mb-6">
            Create your first project to start working with AI agents
          </p>
          <Button variant="gradient" onClick={() => setIsCreateOpen(true)}>
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="glass-card rounded-2xl p-5 group">
              <div className="flex items-start justify-between mb-3">
                <Badge
                  variant={
                    project.status === "active"
                      ? "success"
                      : project.status === "paused"
                        ? "warning"
                        : "default"
                  }
                >
                  {project.status}
                </Badge>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete project"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              <Link
                href={`/app/org/${orgId}/project/${project.id}`}
                className="block"
              >
                <h3 className="text-lg font-semibold text-white group-hover:gradient-text transition-all mb-1">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span>{formatDate(project.created_at)}</span>
                  {project.is_public && (
                    <>
                      <span>•</span>
                      <span className="text-green-400">Public</span>
                    </>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Project"
        description="Start a new workspace with AI capabilities"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            id="project-title"
            label="Project Name"
            placeholder="My Awesome Project"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            id="project-desc"
            label="Description (optional)"
            placeholder="What is this project about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              isLoading={isLoading}
            >
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
