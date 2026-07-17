'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  Input,
  Avatar,
  EmptyState,
  ErrorState,
  Modal,
} from '@/pkg/ui-components';
import { teamMembers, jobs } from '@/lib/mock-data';

/* ── Types ── */

type TeamRole = 'tech' | 'senior-tech' | 'lead-tech' | 'dispatcher' | 'admin' | 'accountant';

interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: TeamRole;
  status: 'online' | 'offline' | 'busy' | 'away';
  activeJobs: number;
  completedToday: number;
  rating: number;
  specialties: string[];
  joinedAt: string;
}

/* ── Role config ── */

const roleConfig: Record<TeamRole, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-electric/15 text-blue-600' },
  dispatcher: { label: 'Dispatcher', color: 'bg-amber-500/15 text-amber-400' },
  'lead-tech': { label: 'Lead Tech', color: 'bg-green-500/15 text-green-600' },
  'senior-tech': { label: 'Senior Tech', color: 'bg-green-50 text-green-600' },
  tech: { label: 'Tech', color: 'bg-white/10 text-slate-400' },
  accountant: { label: 'Accountant', color: 'bg-blue-500/15 text-blue-400' },
};

const statusConfig: Record<string, { label: string; dotColor: string }> = {
  online: { label: 'Active', dotColor: 'bg-green-500' },
  offline: { label: 'Inactive', dotColor: 'bg-steel' },
  busy: { label: 'Busy', dotColor: 'bg-amber-500' },
  away: { label: 'Away', dotColor: 'bg-steel-light' },
};

/* ── Extended team data (adding accountant) ── */

const allTeamMembers: TeamMemberData[] = [
  ...teamMembers,
  {
    id: 'TECH-007',
    name: 'Lisa Chen',
    email: 'lchen@plumbcore.ai',
    phone: '(555) 200-1007',
    role: 'accountant',
    status: 'online',
    activeJobs: 0,
    completedToday: 0,
    rating: 0,
    specialties: ['Accounts Payable', 'Payroll', 'Tax Preparation'],
    joinedAt: '2024-03-01',
  },
  {
    id: 'TECH-008',
    name: 'Amer Moreau',
    email: 'amer@plumbcore.ai',
    phone: '(555) 200-1008',
    role: 'admin',
    status: 'online',
    activeJobs: 0,
    completedToday: 0,
    rating: 0,
    specialties: ['Operations', 'Management'],
    joinedAt: '2023-01-15',
  },
];

/* ── Skeleton Card ── */

function SkeletonTeamCard() {
  return (
    <div className="animate-pulse rounded-xl ring-1 ring-black/5 bg-white p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-white/5" />
        <div className="space-y-2 flex-1">
          <div className="h-3.5 w-24 rounded bg-white/5" />
          <div className="h-3 w-16 rounded bg-white/5" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-3/4 rounded bg-white/5" />
        <div className="h-3 w-1/2 rounded bg-white/5" />
      </div>
    </div>
  );
}

/* ── Main Page ── */

export default function TeamPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMemberData | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMemberData | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [editRole, setEditRole] = useState<TeamRole>('tech');
  const [editActive, setEditActive] = useState(true);
  const [members, setMembers] = useState<TeamMemberData[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'tech' });

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setMembers(allTeamMembers);
        setLoading(false);
      } catch {
        setError('Failed to load team data.');
        setLoading(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        setMembers(allTeamMembers);
        setLoading(false);
      } catch {
        setError('Failed to load team data.');
        setLoading(false);
      }
    }, 1000);
  };

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  }, [members, search]);

  const handleOpenDetail = (member: TeamMemberData) => {
    setSelectedMember(member);
  };

  const handleSendInvite = () => {
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) return;
    const newMember: TeamMemberData = {
      id: `TEMP-${Date.now()}`,
      name: inviteForm.name,
      email: inviteForm.email,
      phone: '',
      role: inviteForm.role as TeamRole,
      status: 'offline',
      activeJobs: 0,
      completedToday: 0,
      rating: 0,
      specialties: [],
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setMembers((prev) => [...prev, newMember]);
    setInviteOpen(false);
    setInviteForm({ name: '', email: '', role: 'tech' });

    const subject = encodeURIComponent(`You've been invited to join the team`);
    const body = encodeURIComponent(
      `Hi ${inviteForm.name},\n\n` +
      `You've been invited to join as a ${inviteForm.role.replace('-', ' ')}.\n\n` +
      `Click the link below to accept:\n\n` +
      `https://plumbcore-ai.vercel.app/signup\n\n` +
      `Welcome aboard!`
    );
    window.open(`mailto:${inviteForm.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleEditMember = (member: TeamMemberData) => {
    setEditingMember(member);
    setEditRole(member.role);
    setEditActive(member.status !== 'offline');
    setShowRemoveConfirm(false);
  };

  const handleSaveEdit = () => {
    if (!editingMember) return;
    setMembers(prev => prev.map(m =>
      m.id === editingMember.id
        ? {
            ...m,
            role: editRole,
            status: editActive ? 'online' : 'offline' as TeamMemberData['status'],
          }
        : m
    ));
    setSelectedMember(prev => prev && prev.id === editingMember.id
      ? { ...prev, role: editRole, status: editActive ? 'online' : 'offline' as TeamMemberData['status'] }
      : prev
    );
    setEditingMember(null);
  };

  const handleRemoveMember = () => {
    if (!selectedMember) return;
    setMembers(prev => prev.filter(m => m.id !== selectedMember.id));
    setSelectedMember(null);
    setShowRemoveConfirm(false);
  };

  const getAssignedJobsCount = (memberId: string): number => {
    return jobs.filter(j => j.assignedTo.includes(memberId)).length;
  };

  /* ── Error State ── */
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Team</h1>
        </div>
        <Card variant="bordered" padding="lg">
          <ErrorState title="Failed to load team" message={error} onRetry={handleRetry} />
        </Card>
      </div>
    );
  }

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Team</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonTeamCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Team</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <Button variant="primary" size="sm" onClick={() => setInviteOpen(true)}>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Invite Member
          </Button>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite Team Member"
        description="Send an invitation to join your organization."
        size="sm"
        footer={
          <div className="flex items-center gap-2 w-full justify-end">
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvite} disabled={!inviteForm.name.trim() || !inviteForm.email.trim()}>
              Send Invitation
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="Full name"
            value={inviteForm.name}
            onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="colleague@company.com"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              className="w-full rounded-xl ring-1 ring-black/5 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="tech">Technician</option>
              <option value="senior-tech">Senior Technician</option>
              <option value="lead-tech">Lead Technician</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <Card variant="bordered" padding="lg">
          <EmptyState
            title={search ? 'No team members match your search' : 'No team members yet'}
            description={search ? 'Try a different search term.' : 'Invite your first team member to get started.'}
            action={
              search ? undefined : (
                <Button variant="primary" size="md">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Invite First Member
                </Button>
              )
            }
          />
        </Card>
      )}

      {/* Team Grid */}
      {filteredMembers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const role = roleConfig[member.role];
            const status = statusConfig[member.status];
            return (
              <Card
                key={member.id}
                variant="default"
                padding="lg"
                hover
                onClick={() => handleOpenDetail(member)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={member.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{member.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`h-2 w-2 rounded-full ${status.dotColor}`} />
                      <span className="text-[10px] text-slate-500">{status.label}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${role.color}`}>
                      {role.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {member.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {member.phone}
                  </div>
                  {member.role !== 'admin' && member.role !== 'accountant' && member.role !== 'dispatcher' && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {member.activeJobs} active jobs
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        open={!!selectedMember}
        onClose={() => { setSelectedMember(null); setEditingMember(null); setShowRemoveConfirm(false); }}
        title={selectedMember?.name}
        size="md"
        footer={
          editingMember ? (
            <div className="flex gap-2 w-full justify-between">
              <Button variant="ghost" size="sm" onClick={() => setEditingMember(null)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          ) : selectedMember && (
            <div className="flex gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => handleEditMember(selectedMember)}>Edit Member</Button>
              {selectedMember.role !== 'admin' && (
                <Button variant="destructive" size="sm" onClick={() => setShowRemoveConfirm(true)}>Remove from Team</Button>
              )}
            </div>
          )
        }
      >
        {selectedMember && !editingMember && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={selectedMember.name} size="lg" />
              <div>
                <p className="text-lg font-semibold text-slate-900">{selectedMember.name}</p>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${roleConfig[selectedMember.role].color}`}>
                  {roleConfig[selectedMember.role].label}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="text-steel">Email</span>
                <span className="text-slate-900">{selectedMember.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="text-steel">Phone</span>
                <span className="text-slate-900">{selectedMember.phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="text-steel">Status</span>
                <span className="flex items-center gap-1.5 text-slate-900">
                  <span className={`h-2 w-2 rounded-full ${statusConfig[selectedMember.status].dotColor}`} />
                  {statusConfig[selectedMember.status].label}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="text-steel">Assigned Jobs</span>
                <span className="text-slate-900 font-medium">{getAssignedJobsCount(selectedMember.id)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="text-steel">Rating</span>
                <span className="text-slate-900">{selectedMember.rating > 0 ? `${selectedMember.rating}/5` : 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="text-steel">Joined</span>
                <span className="text-slate-900">{new Date(selectedMember.joinedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              {selectedMember.specialties.length > 0 && (
                <div className="flex justify-between pb-2">
                  <span className="text-steel">Specialties</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {selectedMember.specialties.map((s: any) => (
                      <span key={s} className="inline-flex rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {showRemoveConfirm && (
              <div className="rounded-xl bg-red-50 border border-status-error/30 px-4 py-3">
                <p className="text-sm text-red-600 font-medium mb-2">Remove this team member? This action cannot be undone.</p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowRemoveConfirm(false)}>Cancel</Button>
                  <Button variant="destructive" size="sm" onClick={handleRemoveMember}>Remove</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {editingMember && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={editingMember.name} size="lg" />
              <div>
                <p className="text-lg font-semibold text-slate-900">{editingMember.name}</p>
                <p className="text-xs text-slate-500">{editingMember.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as TeamRole)}
                className="w-full rounded-xl border border-white/10 bg-whiteer px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
              >
                <option value="admin">Admin</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="lead-tech">Lead Tech</option>
                <option value="senior-tech">Senior Tech</option>
                <option value="tech">Tech</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Active Status</p>
                <p className="text-xs text-slate-500">{editActive ? 'Member is active and receiving assignments' : 'Member is inactive and not receiving assignments'}</p>
              </div>
              <button
                onClick={() => setEditActive(!editActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editActive ? 'bg-green-500' : 'bg-white/10'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  editActive ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}