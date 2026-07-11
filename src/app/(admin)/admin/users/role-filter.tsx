"use client";

export default function RoleFilter({ currentRole, currentQuery }: { currentRole: string, currentQuery: string }) {
  return (
    <form action="/admin/users" method="GET">
      {currentQuery && <input type="hidden" name="query" value={currentQuery} />}
      <select 
        name="role" 
        defaultValue={currentRole} 
        onChange={(e) => e.target.form?.submit()}
        className="px-3 py-2 bg-surface-200 border border-surface-400/50 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none cursor-pointer"
      >
        <option value="all">All Roles</option>
        <option value="user">User</option>
        <option value="support">Support</option>
        <option value="admin">Admin</option>
        <option value="super_admin">Super Admin</option>
      </select>
    </form>
  );
}
