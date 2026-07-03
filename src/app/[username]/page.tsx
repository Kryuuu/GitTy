// ============================================
// GitTy — Public Profile Page
// ============================================
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import type { Profile, PublicPage } from "@/lib/types";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  let decodedUsername = decodeURIComponent(username);
  if (decodedUsername.startsWith("@")) {
    decodedUsername = decodedUsername.substring(1);
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", decodedUsername)
    .single();

  if (!profile) {
    return { title: "Not Found" };
  }

  const { data: publicPages } = await supabase
    .from("public_pages")
    .select("*")
    .eq("user_id", profile.id);
  
  profile.public_pages = publicPages || [];

  if (!profile || !profile.public_pages?.[0]?.is_published) {
    return { title: "Not Found" };
  }

  const page = profile.public_pages[0];
  return {
    title: page.seo_metadata?.title || `${profile.full_name || profile.username} | GitTy Hub`,
    description: page.seo_metadata?.description || profile.bio || "Public Business Hub",
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  
  // Parse the username from the URL (handles /@username)
  let decodedUsername = decodeURIComponent(username);
  if (decodedUsername.startsWith("@")) {
    decodedUsername = decodedUsername.substring(1);
  }

  const supabase = await createClient();

  // Fetch the profile and their public page configuration
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", decodedUsername)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: publicPages } = await supabase
    .from("public_pages")
    .select("*")
    .eq("user_id", profile.id);
  
  profile.public_pages = publicPages || [];

  if (!profile) {
    notFound();
  }

  const pageConfig = (profile.public_pages as PublicPage[])?.[0];

  if (!pageConfig || !pageConfig.is_published) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="text-4xl">🚧</div>
          <h1 className="text-xl font-bold text-white">Hub Not Available</h1>
          <p className="text-zinc-400">This profile is not public yet.</p>
          <Link href="/" className="text-brand-400 hover:underline block mt-4 text-sm">
            Return to GitTy
          </Link>
        </div>
      </div>
    );
  }

  const isDark = pageConfig.theme === "dark" || pageConfig.theme === "glass" || pageConfig.theme === "retro" || !pageConfig.theme;
  const layoutConfig = pageConfig.layout_config || {};

  // Fetch Store Items from Marketplace for this user
  const { data: storeItems } = await supabase
    .from("marketplace_items")
    .select("*")
    .eq("creator_id", profile.id)
    .eq("is_published", true);

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#09090b] text-white" : "bg-zinc-50 text-zinc-900"} ${layoutConfig.fontFamily === 'serif' ? 'font-serif' : layoutConfig.fontFamily === 'mono' ? 'font-mono' : layoutConfig.fontFamily === 'comic' ? 'font-[Comic_Sans_MS,Comic_Sans,cursive]' : 'font-sans'} relative overflow-x-hidden`} id="hub-container">
      {/* Background Layer */}
      {layoutConfig.bgImage ? (
        <>
          <div className="fixed inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${layoutConfig.bgImage})` }} />
          <div className={`fixed inset-0 z-0 ${isDark ? 'bg-black/60' : 'bg-white/60'} backdrop-blur-md`} />
        </>
      ) : isDark ? (
        <>
          <div className="fixed top-0 right-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none z-0" style={{ backgroundColor: layoutConfig.accentColor ? layoutConfig.accentColor + '33' : 'rgba(99, 102, 241, 0.1)' }} />
          <div className="fixed top-1/2 left-0 w-96 h-96 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none z-0" style={{ backgroundColor: layoutConfig.accentColor ? layoutConfig.accentColor + '33' : 'rgba(168, 85, 247, 0.1)' }} />
          <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none z-0" />
        </>
      ) : null}

      {/* Inject Custom CSS */}
      {layoutConfig.customCss && (
        <style dangerouslySetInnerHTML={{ __html: layoutConfig.customCss.replace(/body|html/g, '#hub-container') }} />
      )}

      <main className="max-w-2xl mx-auto px-6 py-20 relative z-10 animate-slide-up">
        
        {/* Profile Header */}
        <div className="text-center space-y-6 mb-14">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-brand-400 via-indigo-500 to-purple-600 p-[3px] shadow-[0_8px_32px_rgba(99,102,241,0.25)] relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-400 to-purple-500 blur-xl opacity-40 rounded-full" />
            <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden relative z-10 ${isDark ? "bg-zinc-950 border-2 border-zinc-900" : "bg-white border-2 border-zinc-100"}`}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name || ""} className="w-full h-full object-cover" />
              ) : (
                <span className={`text-4xl font-bold ${isDark ? "text-white" : "text-zinc-800"}`}>{decodedUsername[0].toUpperCase()}</span>
              )}
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              {profile.full_name || `@${decodedUsername}`}
            </h1>
            {profile.bio && (
              <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"} max-w-md mx-auto font-medium leading-relaxed`}>
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Links Section */}
        {pageConfig.links && pageConfig.links.length > 0 && (
          <div className="space-y-4 mb-14">
            {pageConfig.links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex items-center p-5 rounded-3xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                  isDark 
                    ? "bg-white/5 hover:bg-white/10 border border-white/10 text-white shadow-xl shadow-black/20 backdrop-blur-xl" 
                    : "bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-900 shadow-sm"
                }`}
              >
                <span className={`text-3xl w-14 h-14 flex items-center justify-center rounded-2xl absolute left-4 shadow-inner ${isDark ? "bg-white/5 border border-white/5" : "bg-zinc-100"}`}>
                  {link.icon || "🔗"}
                </span>
                <div className="flex-1 text-center w-full px-20">
                  <span className="font-bold tracking-wide">{link.title}</span>
                  {link.description && (
                    <span className={`text-xs mt-1 block font-medium opacity-80 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                      {link.description}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Digital Store Section */}
        {storeItems && storeItems.length > 0 && (
          <div className="mb-14">
            <h3 className={`text-xs font-bold uppercase tracking-widest mb-6 text-center ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
              Digital Store
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {storeItems.map(item => (
                <Link
                  key={item.id}
                  href={`/marketplace/item/${item.id}`}
                  className={`block p-5 rounded-3xl transition-all duration-300 hover:scale-[1.02] ${
                    isDark ? "bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-xl" : "bg-white border border-zinc-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className={`h-24 w-24 mx-auto rounded-2xl mb-4 flex items-center justify-center text-4xl shadow-inner ${isDark ? "bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5" : "bg-zinc-100"}`}>
                    📦
                  </div>
                  <h4 className="font-bold text-sm truncate text-center mb-2">{item.title}</h4>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-brand-400" : "text-brand-600"}`}>{item.type}</span>
                    <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
                      {item.price_cents === 0 ? "Gratis" : `Rp ${(item.price_cents || 0).toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center pt-16 border-t border-zinc-800/50 pb-20">
          <Link href="/" className="inline-flex flex-col items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-sm text-white font-extrabold shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">G</div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-zinc-600 group-hover:text-zinc-400" : "text-zinc-400 group-hover:text-zinc-600"} transition-colors`}>
              Powered by GitTy Hub
            </span>
          </Link>
        </footer>

      </main>

      {/* Floating AI Assistant Widget */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-16 h-16 rounded-full text-white flex items-center justify-center text-3xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:scale-110 transition-transform cursor-pointer border-2 border-white/20" style={{ background: layoutConfig.accentColor || 'linear-gradient(to top right, #4f46e5, #9333ea)' }}>
          <span className="drop-shadow-md animate-bounce">🤖</span>
        </button>
      </div>
    </div>
  );
}
