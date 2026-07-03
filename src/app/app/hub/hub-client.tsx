// ============================================
// GitTy Hub — Client Builder
// ============================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AvatarUpload } from "../settings/avatar-upload";
import { updateHubSettingsAction } from "./actions";
import type { Profile, PublicPage, MarketplaceItem } from "@/lib/types";

export function HubClient({
  initialProfile,
  initialConfig,
  storeItems,
}: {
  initialProfile: Profile;
  initialConfig: PublicPage;
  storeItems: MarketplaceItem[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState(initialProfile.username || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || "");
  const [links, setLinks] = useState(initialConfig.links || []);
  const [theme, setTheme] = useState(initialConfig.theme || "dark");
  const [layoutConfig, setLayoutConfig] = useState<any>(initialConfig.layout_config || {});
  const [activeTab, setActiveTab] = useState("general");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [proModal, setProModal] = useState({ isOpen: false, title: "", desc: "" });
  const router = useRouter();

  const triggerPro = (title: string, desc: string) => {
    setProModal({ isOpen: true, title, desc });
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/@${username}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const addLink = () => {
    if (links.length >= 3) {
      triggerPro("Unlimited Links", "Free accounts are limited to 3 links. Upgrade to GitTy Pro to add unlimited links, social media embeds, and custom icons to your Hub.");
      return;
    }
    setLinks([...links, { title: "", url: "", icon: "🔗", description: "" }]);
  };

  const updateLink = (index: number, field: string, value: string | boolean) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
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
      formData.append("layout_config", JSON.stringify(layoutConfig));
      await updateHubSettingsAction(formData);
      setSuccessMsg("✨ Hub configuration saved successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to update hub");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8">
      {/* Editor Main */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium animate-slide-up flex items-center gap-2">
            ⚠️ {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium animate-slide-up flex items-center gap-2">
            {successMsg}
          </div>
        )}

        {/* Builder Nav & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-300/30 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {["general", "design pro 🎨", "links", "store", "ai", "portfolio"].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                  activeTab === tab ? "bg-brand-500/20 text-brand-400 border border-brand-500/30" : "text-zinc-400 hover:text-white"
                } ${tab === "design pro 🎨" ? "bg-gradient-to-r from-purple-500/10 to-brand-500/10 border-purple-500/20 hover:border-purple-500/50" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="secondary" size="sm" onClick={handleCopyLink} className="gap-2">
              🔗 Copy Link
            </Button>
            <a href={`/@${username}`} target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="outline" size="sm" className="gap-2 border-brand-500/30 text-brand-400 hover:bg-brand-500/10">
                ↗ Visit Live
              </Button>
            </a>
          </div>
        </div>

        {/* General Tab */}
        {activeTab === "general" && (
          <div className="glass-card rounded-3xl p-8 space-y-8 animate-slide-up border border-white/5 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Core Identity</h2>
              <p className="text-sm text-zinc-400 mt-1">Configure your personal URL and theme.</p>
            </div>
            
            <div className="space-y-3 relative z-10">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Username (GitTy URL)</label>
              <div className="flex rounded-2xl shadow-inner bg-zinc-900/50 p-1 border border-white/5 focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/50 transition-all">
                <span className="inline-flex items-center pl-4 pr-2 text-zinc-500 text-sm font-medium">
                  gitty.app/@
                </span>
                <Input 
                  name="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  required
                  className="bg-transparent border-0 focus-visible:ring-0 text-white font-semibold pl-1"
                />
              </div>
            </div>

            <div className="space-y-3 relative z-10 border border-surface-300/30 rounded-2xl p-4 bg-surface-200/20">
              <AvatarUpload 
                initialUrl={avatarUrl} 
                onChange={(url) => setAvatarUrl(url)} 
              />
            </div>

            <div className="space-y-3 relative z-10">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Theme Engine</label>
              <div className="relative">
                <select name="theme" value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full h-12 px-4 rounded-2xl bg-zinc-900/80 text-sm text-white font-medium border border-white/5 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 appearance-none cursor-pointer">
                  <option value="dark">🌙 Cybernetic Dark (GitTy Native)</option>
                  <option value="glass">🧊 Pure Glassmorphism</option>
                  <option value="light">☀️ Minimal Light</option>
                  <option value="retro">👾 Retro Terminal</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">▼</div>
              </div>
            </div>

            <label className="relative z-10 flex items-center justify-between cursor-pointer mt-4 p-5 bg-gradient-to-r from-brand-900/20 to-indigo-900/20 rounded-2xl border border-brand-500/20 hover:border-brand-500/40 transition-colors group">
              <div>
                <span className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">Publish to the World</span>
                <p className="text-xs text-zinc-400 mt-1">Make your Hub visible to anyone on the internet.</p>
              </div>
              <div className="relative">
                <input type="checkbox" name="isPublished" defaultChecked={initialConfig.is_published} className="peer sr-only" />
                <div className="w-11 h-6 bg-surface-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </div>
            </label>
          </div>
        )}

        {/* Design Pro Tab */}
        {activeTab === "design pro 🎨" && (
          <div className="glass-card rounded-3xl p-8 space-y-8 animate-slide-up border border-purple-500/20 relative overflow-hidden bg-gradient-to-br from-zinc-900/50 to-purple-900/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div>
              <div className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-[10px] font-bold uppercase tracking-widest mb-3">Pro Feature</div>
              <h2 className="text-xl font-bold text-white tracking-tight">Design Studio</h2>
              <p className="text-sm text-zinc-400 mt-1">Full creative control over your Hub's appearance.</p>
            </div>

            <div className="relative z-10 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-start gap-4">
              <span className="text-2xl mt-1">🌟</span>
              <div>
                <h4 className="font-bold text-purple-300 text-sm">Upgrade to GitTy Pro</h4>
                <p className="text-xs text-purple-200/70 mt-1">You are currently previewing Pro features. Upgrade your workspace to GitTy Pro to unlock these advanced customizations on your live public profile.</p>
                <Button type="button" variant="outline" size="sm" className="mt-3 border-purple-500/50 text-purple-300 hover:bg-purple-500/20 h-8 text-xs">
                  Upgrade Now
                </Button>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              
              {/* Pro Feature Paywall Overlay */}
              <div 
                className="absolute inset-0 z-50 cursor-pointer" 
                onClick={() => triggerPro("Design Studio Pro", "Unlock full creative control over your public Hub. Change fonts, inject custom CSS, set dynamic backgrounds, and more!")}
                title="Upgrade to Pro to unlock"
              />

              {/* Brand Color */}
              <div className="space-y-3 opacity-50 grayscale transition-all">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex justify-between">
                  <span>Brand Accent Color</span>
                  <span className="text-purple-400 font-mono">{layoutConfig.accentColor || "#6366f1"}</span>
                </label>
                <div className="flex items-center gap-4 p-2 bg-zinc-900/80 border border-white/5 rounded-2xl">
                  <input 
                    type="color" 
                    value={layoutConfig.accentColor || "#6366f1"} 
                    onChange={(e) => setLayoutConfig({...layoutConfig, accentColor: e.target.value})}
                    className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                  />
                  <p className="text-xs text-zinc-500">Applied to buttons, badges, and glowing elements.</p>
                </div>
              </div>

              {/* Background Image */}
              <div className="space-y-3 opacity-50 grayscale transition-all">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Custom Background Image URL</label>
                <Input 
                  placeholder="https://images.unsplash.com/..." 
                  value={layoutConfig.bgImage || ""}
                  onChange={(e) => setLayoutConfig({...layoutConfig, bgImage: e.target.value})}
                  className="bg-zinc-900/80 border-white/5 focus-visible:border-purple-500/50 h-12 rounded-2xl text-white"
                />
              </div>

              {/* Typography */}
              <div className="space-y-3 opacity-50 grayscale transition-all">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Typography Engine</label>
                <select 
                  value={layoutConfig.fontFamily || "sans"} 
                  onChange={(e) => setLayoutConfig({...layoutConfig, fontFamily: e.target.value})}
                  className="w-full h-12 px-4 rounded-2xl bg-zinc-900/80 text-sm text-white font-medium border border-white/5 focus:border-purple-500/50 appearance-none cursor-pointer"
                >
                  <option value="sans">Modern Sans (Default)</option>
                  <option value="serif">Playfair Display (Elegant Serif)</option>
                  <option value="mono">Fira Code (Developer Mono)</option>
                  <option value="comic">Comic Sans (Just for fun)</option>
                </select>
              </div>

              {/* Custom CSS Engine */}
              <div className="space-y-3 opacity-50 grayscale transition-all">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <span>Custom CSS Injection</span>
                  <Badge variant="outline" className="text-[9px] border-yellow-500/30 text-yellow-500">Advanced</Badge>
                </label>
                <textarea 
                  placeholder=".hub-card { border-radius: 50px !important; }&#10;body { animation: neon 1.5s infinite; }" 
                  value={layoutConfig.customCss || ""}
                  onChange={(e) => setLayoutConfig({...layoutConfig, customCss: e.target.value})}
                  className="w-full h-32 p-4 rounded-2xl bg-[#0d0d0d] text-zinc-300 font-mono text-xs border border-white/5 focus:border-purple-500/50 resize-none shadow-inner"
                />
              </div>
            </div>
          </div>
        )}

        {/* Links Tab */}
        {activeTab === "links" && (
          <div className="glass-card rounded-2xl p-6 animate-fade-in space-y-4 border border-surface-300/30">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-bold text-white">Links & Socials</h2>
                <p className="text-xs text-zinc-400">Add unlimited links to your profile</p>
              </div>
              <Button type="button" variant="gradient" size="sm" onClick={addLink} className="shadow-lg shadow-brand-500/20 hover:scale-105 transition-transform">+ Add Link</Button>
            </div>
            <div className="space-y-4">
              {links.length === 0 && <p className="text-zinc-500 text-sm text-center py-8 border border-dashed border-surface-300/30 rounded-xl">No links added yet. Click the button above to start.</p>}
              {links.map((link, idx) => (
                <div key={idx} className="p-5 bg-surface-200/40 hover:bg-surface-200/60 transition-colors border border-surface-300/30 rounded-2xl space-y-4 relative group backdrop-blur-md">
                  <button type="button" onClick={() => removeLink(idx)} className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-500/10">✕</button>
                  <div className="grid grid-cols-[3rem_1fr] gap-3 pr-8">
                    <Input className="text-center text-lg bg-surface-300/50 border-surface-300/30 focus:border-brand-500/50 h-10 px-0 rounded-xl" placeholder="🔗" value={link.icon || ""} onChange={(e) => updateLink(idx, "icon", e.target.value)} />
                    <Input className="bg-surface-300/50 border-surface-300/30 focus:border-brand-500/50 text-white font-medium h-10 rounded-xl" placeholder="Link Title (e.g. My Website)" value={link.title} onChange={(e) => updateLink(idx, "title", e.target.value)} />
                  </div>
                  <Input className="w-full bg-surface-300/30 border-surface-300/30 text-sm focus:border-brand-500/50 rounded-xl" placeholder="URL (https://...)" value={link.url} onChange={(e) => updateLink(idx, "url", e.target.value)} />
                  <Input className="w-full bg-surface-300/30 border-surface-300/30 text-sm focus:border-brand-500/50 rounded-xl" placeholder="Short description (optional)" value={link.description || ""} onChange={(e) => updateLink(idx, "description", e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Digital Store Tab */}
        {activeTab === "store" && (
          <div className="glass-card rounded-2xl p-6 animate-fade-in space-y-4">
            <h2 className="text-lg font-bold text-white">Digital Store (Marketplace Sync)</h2>
            <p className="text-sm text-zinc-400">Assets you publish in the Marketplace automatically appear here on your Hub.</p>
            <div className="space-y-3 mt-4">
              {storeItems.length === 0 ? (
                <div className="p-4 border border-dashed border-surface-300/50 rounded-xl text-center text-zinc-500 text-sm">
                  No published products yet. Go to Marketplace Vendor Dashboard to publish.
                </div>
              ) : (
                storeItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-surface-200 rounded-xl border border-surface-300/30">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl opacity-80">📦</span>
                      <div>
                        <p className="font-semibold text-white text-sm">{item.title}</p>
                        <p className="text-xs text-brand-400">{item.type}</p>
                      </div>
                    </div>
                    <Badge variant="success">Syncing</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* AI Assistant Tab */}
        {activeTab === "ai" && (
          <div className="glass-card rounded-2xl p-6 animate-fade-in space-y-4 relative overflow-hidden">
            <h2 className="text-lg font-bold text-white">AI Assistant (Chat Widget)</h2>
            <p className="text-sm text-zinc-400">Enable an AI Assistant on your Hub that answers visitor questions using your public data and knowledge base.</p>
            
            <div className="absolute inset-0 z-50 cursor-pointer" onClick={() => triggerPro("Hub AI Assistant", "Deploy a trained AI agent to your public profile that answers visitor questions 24/7 based on your GitTy OS knowledge base.")} />

            <div className="p-4 bg-surface-200/50 border border-surface-300/30 rounded-xl opacity-50 grayscale transition-all">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="rounded text-brand-500 bg-surface-300" defaultChecked />
                <span className="text-sm font-medium text-white">Enable AI Chat Widget</span>
              </label>
              <div className="mt-4 space-y-2">
                <label className="text-xs text-zinc-400">Assistant Greeting</label>
                <Input defaultValue={`Hi! I'm the AI assistant for ${initialProfile.full_name || username}. How can I help you?`} className="bg-surface-300 text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === "portfolio" && (
          <div className="glass-card rounded-2xl p-6 animate-fade-in relative overflow-hidden">
            <h2 className="text-lg font-bold text-white mb-2">Portfolio / CMS</h2>
            <p className="text-sm text-zinc-400 mb-6">Create multiple sub-pages (e.g. /about, /portfolio, /blog) inside your Hub.</p>
            
            <div className="absolute inset-0 z-50 cursor-pointer" onClick={() => triggerPro("CMS & Custom Pages", "Create unlimited sub-pages like /about, /portfolio, and /blog natively within your Hub using our Notion-like editor.")} />

            <div className="p-8 border border-dashed border-surface-300/50 rounded-xl text-center text-zinc-500 text-sm opacity-50 grayscale">
              <span className="text-2xl mb-2 block">📄</span>
              CMS Engine is initialized in the architecture. Click here to initialize your first sub-page.
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-surface-300/30">
          <Button type="submit" variant="gradient" isLoading={isLoading} size="lg">
            Save Hub Configuration
          </Button>
        </div>
      </form>

      {/* Live Preview Pane */}
      <div className="sticky top-6 hidden lg:flex justify-center items-center">
        {/* Device Chassis (Premium iPhone Mockup) */}
        <div className="relative w-[360px] h-[740px] rounded-[3.5rem] bg-zinc-900 p-3 shadow-2xl shadow-brand-500/10 ring-1 ring-white/10 before:content-[''] before:absolute before:inset-0 before:rounded-[3.5rem] before:ring-2 before:ring-inset before:ring-white/20 before:pointer-events-none">
          {/* Hardware Buttons (Volume & Power) */}
          <div className="absolute -left-1 top-32 w-1 h-12 bg-zinc-800 rounded-l-md" />
          <div className="absolute -left-1 top-48 w-1 h-12 bg-zinc-800 rounded-l-md" />
          <div className="absolute -right-1 top-40 w-1 h-16 bg-zinc-800 rounded-r-md" />
          
          {/* Inner Screen */}
          <div className={`relative w-full h-full rounded-[2.8rem] overflow-hidden flex flex-col border border-black group/screen transition-colors duration-500 ${theme === 'light' ? 'bg-zinc-50' : theme === 'retro' ? 'bg-black font-mono' : 'bg-zinc-950'}`}>
            {/* Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[110px] h-7 bg-black rounded-full z-50 flex items-center justify-between px-3 shadow-[0_0_1px_rgba(255,255,255,0.2)]">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800/80 shadow-inner"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-blue-900/50 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            </div>
            
            {/* Screen Backgrounds */}
            {layoutConfig.bgImage ? (
              <>
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${layoutConfig.bgImage})` }} />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
              </>
            ) : theme === "dark" || theme === "glass" ? (
              <>
                <div className="absolute inset-0 bg-[#09090b] pointer-events-none" />
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -translate-y-1/2 pointer-events-none ${theme === 'glass' ? 'bg-indigo-500/40' : 'bg-indigo-500/20'}`} />
                <div className={`absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[80px] translate-y-1/3 pointer-events-none ${theme === 'glass' ? 'bg-brand-500/40' : 'bg-brand-500/20'}`} style={{ backgroundColor: layoutConfig.accentColor ? layoutConfig.accentColor + '33' : undefined }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
              </>
            ) : theme === "retro" ? (
              <div className="absolute inset-0 bg-black bg-[radial-gradient(#11581e_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            ) : null}

            <div className={`flex-1 overflow-y-auto no-scrollbar relative w-full h-full pt-20 pb-24 px-5 ${layoutConfig.fontFamily === 'serif' ? 'font-serif' : layoutConfig.fontFamily === 'mono' ? 'font-mono' : layoutConfig.fontFamily === 'comic' ? 'font-[Comic_Sans_MS,Comic_Sans,cursive]' : 'font-sans'}`}>
              
              {/* Profile Avatar */}
              <div className="text-center space-y-4 mb-10 relative z-10 animate-slide-up">
                <div className={`w-28 h-28 mx-auto rounded-full p-[3px] relative ${theme === 'light' ? 'bg-zinc-200 shadow-lg' : theme === 'retro' ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-gradient-to-br from-brand-400 via-indigo-500 to-purple-600 shadow-[0_8px_32px_rgba(99,102,241,0.4)]'}`}>
                  {(theme === 'dark' || theme === 'glass') && <div className="absolute inset-0 bg-gradient-to-tr from-brand-400 to-purple-500 blur-xl opacity-40 rounded-full" />}
                  <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden border-2 relative z-10 ${theme === 'light' ? 'bg-white border-white text-zinc-800' : theme === 'retro' ? 'bg-black border-green-500 text-green-500' : 'bg-zinc-950 border-zinc-900 text-white'}`}>
                    {avatarUrl && theme !== 'retro' ? (
                      <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold">{username[0]?.toUpperCase() || "G"}</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className={`font-extrabold text-2xl tracking-tight ${theme === 'light' ? 'text-zinc-900' : theme === 'retro' ? 'text-green-500 uppercase' : 'text-white'}`}>{initialProfile.full_name || `@${username}`}</h3>
                  <p className={`text-sm mt-1.5 font-medium ${theme === 'light' ? 'text-zinc-500' : theme === 'retro' ? 'text-green-600' : 'text-zinc-400'}`}>{initialProfile.bio || "AI Hub Operating System"}</p>
                </div>
              </div>

              {/* Links Preview */}
              <div className="space-y-4 mb-10 relative z-10">
                {links.filter(l => l.title).map((link, i) => (
                  <div key={i} className={`group relative flex items-center p-4 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl ${
                    theme === 'light' ? 'bg-white border border-zinc-200 text-zinc-800 shadow-zinc-200/50 hover:bg-zinc-50' : 
                    theme === 'retro' ? 'bg-black border border-green-500 text-green-500 rounded-none shadow-none hover:bg-green-950' :
                    'bg-white/5 hover:bg-white/10 border border-white/10 text-white shadow-black/20 backdrop-blur-xl'
                  }`}>
                    <span className={`text-2xl w-12 h-12 flex items-center justify-center absolute left-2 shadow-inner ${
                      theme === 'light' ? 'bg-zinc-100 rounded-2xl border border-zinc-100' :
                      theme === 'retro' ? 'bg-transparent border border-green-500 rounded-none' :
                      'bg-white/5 rounded-2xl border border-white/5'
                    }`}>
                      {link.icon || "🔗"}
                    </span>
                    <div className="flex-1 text-center w-full px-14">
                      <p className="font-bold text-sm tracking-wide">{link.title}</p>
                      {link.description && <p className={`text-[10px] mt-1 opacity-90 ${theme === 'light' ? 'text-zinc-500' : theme === 'retro' ? 'text-green-700' : 'text-zinc-400'}`}>{link.description}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Store Preview */}
              {storeItems.length > 0 && (
                <div className="mb-10 relative z-10">
                  <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-4 text-center ${theme === 'light' ? 'text-zinc-400' : theme === 'retro' ? 'text-green-700' : 'text-zinc-500'}`}>Digital Store</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {storeItems.map(item => (
                      <div key={item.id} className={`p-4 text-center transition-colors cursor-pointer ${
                        theme === 'light' ? 'bg-white border border-zinc-200 rounded-3xl hover:bg-zinc-50 shadow-sm' :
                        theme === 'retro' ? 'bg-black border border-green-500 rounded-none hover:bg-green-950' :
                        'bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl hover:bg-white/10'
                      }`}>
                        <div className={`h-16 w-16 mx-auto mb-3 flex items-center justify-center text-3xl shadow-inner border ${
                          theme === 'light' ? 'bg-zinc-100 rounded-2xl border-zinc-100' :
                          theme === 'retro' ? 'bg-black border-green-500 rounded-none' :
                          'bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl border-white/5'
                        }`}>📦</div>
                        <p className={`text-xs font-bold truncate ${theme === 'light' ? 'text-zinc-800' : theme === 'retro' ? 'text-green-500' : 'text-white'}`}>{item.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hub Footer Mark */}
              <div className={`text-center mt-12 mb-8 ${theme === 'light' ? 'opacity-70' : 'opacity-50'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'light' ? 'text-zinc-400' : theme === 'retro' ? 'text-green-700' : 'text-white'}`}>Powered by GitTy</span>
              </div>

            </div>

            {/* Mock Floating AI Widget */}
            <div className={`absolute bottom-8 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform cursor-pointer border-2 z-50 animate-bounce ${
              theme === 'light' ? 'text-white border-white/20' :
              theme === 'retro' ? 'bg-black border-green-500 text-green-500 shadow-[0_0_15px_#22c55e]' :
              'text-white border-white/20'
            }`} style={{ background: theme !== 'retro' ? (layoutConfig.accentColor || '#6366f1') : undefined }}>
              <span className="drop-shadow-md">🤖</span>
            </div>
            
            {/* Inject Custom CSS from LayoutConfig */}
            {layoutConfig.customCss && (
              <style dangerouslySetInnerHTML={{ __html: layoutConfig.customCss.replace(/body|html/g, '.group\\/screen') }} />
            )}
          </div>
        </div>
      </div>

      {/* Pro Feature Paywall Popup Modal */}
      {proModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-slide-up text-center">
            <button 
              onClick={() => setProModal({ ...proModal, isOpen: false })}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800"
            >
              ✕
            </button>
            <div className="w-16 h-16 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center text-4xl mb-4 border border-purple-500/20 shadow-inner">
              🌟
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{proModal.title}</h3>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              {proModal.desc}
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push('/pricing')} variant="gradient" className="w-full h-12 text-base font-bold shadow-lg shadow-purple-500/20">
                Upgrade to Pro
              </Button>
              <Button onClick={() => setProModal({ ...proModal, isOpen: false })} variant="ghost" className="w-full text-zinc-500 hover:text-white">
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
