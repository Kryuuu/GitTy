"use client";

import { overrideSubscriptionPlan } from "./actions";
import { useTransition } from "react";
import { Check, Edit2, X, Loader2 } from "lucide-react";
import { useState } from "react";

export default function PlanEditor({ subId, currentPlan, orgId, currentEnd }: { subId: string, currentPlan: string, orgId: string, currentEnd: string | null }) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  async function handleAction(formData: FormData) {
    startTransition(async () => {
      await overrideSubscriptionPlan(formData);
      setIsEditing(false);
    });
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="uppercase text-xs font-bold tracking-wider text-brand-400 bg-brand-500/10 px-2 py-1 rounded w-fit">
            {currentPlan}
          </span>
          {currentEnd && <span className="text-[10px] text-zinc-500 mt-1">Exp: {new Date(currentEnd).toLocaleDateString()}</span>}
        </div>
        <button 
          onClick={() => setIsEditing(true)}
          className="p-1 text-zinc-500 hover:text-white transition-colors"
          title="Override Plan"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <form action={handleAction} className="flex items-center gap-2">
      <input type="hidden" name="sub_id" value={subId} />
      <input type="hidden" name="org_id" value={orgId} />
      <select 
        name="plan" 
        defaultValue={currentPlan}
        className="px-2 py-1 bg-surface-300 border border-brand-500/50 rounded text-xs text-white focus:outline-none focus:border-brand-500 transition-colors uppercase font-bold"
        disabled={isPending}
      >
        <option value="free">FREE</option>
        <option value="pro">PRO</option>
        <option value="team">TEAM</option>
        <option value="enterprise">ENTERPRISE</option>
      </select>
      <input 
        type="date"
        name="expires_at"
        defaultValue={currentEnd ? new Date(currentEnd).toISOString().split('T')[0] : ''}
        className="px-2 py-1 bg-surface-300 border border-brand-500/50 rounded text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
        disabled={isPending}
      />
      <div className="flex items-center gap-1">
        <button 
          type="submit" 
          disabled={isPending}
          className="p-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 rounded transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        </button>
        <button 
          type="button" 
          onClick={() => setIsEditing(false)}
          disabled={isPending}
          className="p-1 bg-surface-300 text-zinc-400 hover:text-white rounded transition-colors disabled:opacity-50"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </form>
  );
}
