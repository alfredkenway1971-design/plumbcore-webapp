'use client';

import { useState } from 'react';
import { Card, Button, Input, Modal, ErrorState } from '@/pkg/ui-components';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  lastLogin: string;
}

const mockUsers: AdminUser[] = [
  { id: 'ADM-001', name: 'Amer Moreau', email: 'amer.niyonzima@gmail.com', role: 'super_admin', permissions: ['all'], lastLogin: '2026-07-09' },
  { id: 'ADM-002', name: 'Support Admin', email: 'support@plumbcore.ai', role: 'admin', permissions: ['view_companies', 'view_revenue', 'manage_support'], lastLogin: '2026-07-08' },
];

const allPermissions = [
  'view_companies', 'manage_leads', 'view_revenue', 'manage_pricing',
  'manage_payouts', 'manage_campaigns', 'manage_promos', 'manage_users',
  'view_usage', 'manage_support', 'view_audit', 'manage_settings',
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [showAdd, setShowAdd] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'admin' as 'admin' | 'super_admin', permissions: [] as string[] });
  const [error, setError] = useState<string | null>(null);

  const addUser = () => {
    if (!editForm.name || !editForm.email) return;
    setUsers(prev => [...prev, { id: `ADM-${String(prev.length + 1).padStart(3, '0')}`, ...editForm, lastLogin: '-' }]);
    setShowAdd(false);
    setEditForm({ name: '', email: '', role: 'admin', permissions: [] });
  };

  const togglePermission = (perm: string) => {
    setEditForm(f => ({ ...f, permissions: f.permissions.includes(perm) ? f.permissions.filter(p => p !== perm) : [...f.permissions, perm] }));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl sm:text-2xl font-bold text-white">Admin Users</h1><p className="text-sm text-slate-500 mt-0.5">Manage admin accounts and permissions</p></div>
        <Button size="sm" onClick={() => setShowAdd(true)}>+ Add Admin</Button>
      </div>

      <Card variant="bordered" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead><tr className="bg-slate-800/30 border-b border-white/10">
              <th className="text-left px-4 py-3 font-semibold text-white">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-white">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-white">Role</th>
              <th className="text-left px-4 py-3 font-semibold text-white">Last Login</th>
              <th className="text-left px-4 py-3 font-semibold text-white">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${u.role === 'super_admin' ? 'bg-purple-500/10 text-purple-300' : 'bg-blue-500/10 text-blue-300'}`}>{u.role}</span></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.lastLogin}</td>
                  <td className="px-4 py-3">{u.email !== 'amer.niyonzima@gmail.com' && <button onClick={() => deleteUser(u.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showAdd && (
        <Modal open={true} onClose={() => setShowAdd(false)} title="Add Admin User">
          <div className="space-y-4 p-4">
            <div><label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Name <span className="text-red-400">*</span></label><input value={editForm.name} onChange={(e: any) => setEditForm(f => ({...f, name: e.target.value}))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></div>
            <div><label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email <span className="text-red-400">*</span></label><input value={editForm.email} onChange={(e: any) => setEditForm(f => ({...f, email: e.target.value}))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></div>
            <div><label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Role</label>
              <select value={editForm.role} onChange={(e: any) => setEditForm(f => ({...f, role: e.target.value}))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                <option value="admin">Admin</option><option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div><label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Permissions</label>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {allPermissions.map(p => (
                  <label key={p} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={editForm.permissions.includes(p)} onChange={() => togglePermission(p)} className="rounded accent-blue-500 h-4 w-4" />
                    {p.replace(/_/g, ' ')}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button><Button onClick={addUser}>Add User</Button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
