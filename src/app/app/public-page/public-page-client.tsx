// ============================================
// GitTy — Public Page Builder Client
// ============================================
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePublicPageAction } from "./actions";
import type { Profile, PublicPage } from "@/lib/types";

export function PublicPageClient({
  initialProfile,
  initialConfig,
}: {
  initialProfile: Profile;
  initialConfig: PublicPage;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [links, setLinks] = useState<{ title: string; url: string; icon?: string }[]>(
    initialConfig.links || []
  );
  const [username, setUsername] = useState(initialProfile.username || "");
  const [errorMsg, setErrorMsg] = useState("");

  const addLink = () => {
    setLinks([...links, { title: "", url: "", icon: "🔗" }]);
  };

  const updateLink = (index: number, field: "title" | "url" | "icon", value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("links", JSON.stringify(links.filter(l => l.title && l.url)));
      
      await updatePublicPageAction(formData);
      alert("Public page updated successfully!");
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Failed to update public page");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="glass-card rounded-2xl p-6 border border-surface-300/30 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">General Settings</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-zinc-400">Publish Page</span>
              <input 
                type="checkbox" 
                name="isPublished"
                defaultChecked={initialConfig.is_published}
                className="rounded text-brand-500 focus:ring-brand-500 bg-surface-200 border-surface-400/50"
              />
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Username / Slug</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-surface-300/50 bg-surface-200/50 text-zinc-400 sm:text-sm">
                gitty.app/@
              </span>
              <Input 
                name="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                required
                className="rounded-l-none bg-surface-200 border-surface-300/50"
              />
            </div>
            <p className="text-xs text-zinc-500">Only letters, numbers, underscores, and dashes allowed.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Theme</label>
            <select 
              name="theme" 
              defaultValue={initialConfig.theme || "dark"}
              className="w-full h-10 px-3 py-2 rounded-xl bg-surface-200 border border-surface-300/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="dark">Dark Theme (Default)</option>
              <option value="light">Light Theme</option>
            </select>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-surface-300/30 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Links & Socials</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addLink}>
              + Add Link
            </Button>
          </div>

          <div className="space-y-3">
            {links.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4">No links added yet.</p>
            )}
            
            {links.map((link, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-surface-200/50 border border-surface-300/30 rounded-xl">
                <Input
                  className="w-16 bg-surface-200"
                  placeholder="Icon"
                  value={link.icon}
                  onChange={(e) => updateLink(idx, "icon", e.target.value)}
                />
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Link Title (e.g., Twitter)"
                    value={link.title}
                    onChange={(e) => updateLink(idx, "title", e.target.value)}
                    className="bg-surface-200 h-8 text-sm"
                  />
                  <Input
                    placeholder="URL (https://...)"
                    value={link.url}
                    onChange={(e) => updateLink(idx, "url", e.target.value)}
                    className="bg-surface-200 h-8 text-sm"
                  />
                </div>
                <button type="button" onClick={() => removeLink(idx)} className="text-red-400 hover:text-red-300 p-2">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" variant="gradient" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Live Preview */}
      <div className="hidden lg:flex justify-center">
        <div className="w-[375px] h-[700px] bg-black rounded-[3rem] border-8 border-surface-200 p-2 shadow-2xl relative overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
            <div className="w-32 h-6 bg-surface-200 rounded-b-2xl"></div>
          </div>

          {/* Screen Content */}
          <div className="w-full h-full bg-surface-50 rounded-[2.5rem] overflow-y-auto no-scrollbar pt-12 pb-6 px-4 relative">
            
            <div className="text-center space-y-4 mb-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 p-1">
                <div className="w-full h-full rounded-full bg-surface-200 flex items-center justify-center overflow-hidden text-2xl font-bold text-white">
                  {initialProfile.avatar_url ? (
                    <img src={initialProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    username[0]?.toUpperCase() || "G"
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-white">{initialProfile.full_name || `@${username}`}</h3>
                <p className="text-xs text-zinc-400 mt-1">{initialProfile.bio || "Public Business Hub"}</p>
              </div>
            </div>

            <div className="space-y-3">
              {links.filter(l => l.title).map((link, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-surface-200 border border-surface-300/50 text-white text-sm shadow-sm">
                  <span>{link.icon}</span>
                  <span className="font-medium text-center flex-1 pr-6">{link.title}</span>
                </div>
              ))}
              
              {links.length === 0 && (
                <div className="h-12 border border-dashed border-surface-300/50 rounded-xl flex items-center justify-center text-xs text-zinc-500">
                  Links will appear here
                </div>
              )}
            </div>
            
            {username && (
              <div className="mt-8 text-center">
                <a href={`/@${username}`} target="_blank" rel="noreferrer" className="text-xs text-brand-400 hover:underline">
                  View Live Page →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
