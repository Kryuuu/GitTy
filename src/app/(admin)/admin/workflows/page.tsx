import { requireAdminPermission } from "@/lib/admin/auth";
import { GitMerge, Construction } from "lucide-react";

export const metadata = { title: "Workflows - Admin" };

export default async function AdminWorkflowsPage() {
  await requireAdminPermission("workflows.read");

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-slide-up flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 bg-surface-200/50 rounded-full flex items-center justify-center mb-4 border border-surface-400/50">
        <GitMerge className="w-10 h-10 text-brand-400" />
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight">AI Workflows</h1>
      <p className="text-zinc-400 max-w-md">
        The Workflow orchestration engine is currently under construction. 
        Soon you will be able to monitor multi-agent chains and automated pipelines here.
      </p>
      
      <div className="mt-8 px-4 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg flex items-center gap-2 text-sm font-medium">
        <Construction className="w-4 h-4" /> Coming in v2.1
      </div>
    </div>
  );
}
