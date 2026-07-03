'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Avatar,
} from '@/pkg/ui-components';

/* ── Types ── */

type DateFilter = '7d' | '30d' | 'all';
type ActionFilter = 'all' | 'created' | 'updated' | 'deleted';

interface AuditEntry {
  id: string;
  timestamp: string;
  userName: string;
  userInitials: string;
  action: 'Created' | 'Updated' | 'Deleted';
  resourceType: string;
  resourceId: string;
  details: string;
  ipAddress: string;
}

/* ── Mock Data ── */

function generateAuditLog(): AuditEntry[] {
  const now = new Date();
  const d = (offsetDays: number, offsetHours = 0): string => {
    const date = new Date(now);
    date.setDate(date.getDate() - offsetDays);
    date.setHours(date.getHours() - offsetHours);
    return date.toISOString();
  };

  const users = [
    { name: 'Amer Moreau', initials: 'AM' },
    { name: 'Sarah Blake', initials: 'SB' },
    { name: 'James Wilson', initials: 'JW' },
    { name: 'Mike Torres', initials: 'MT' },
    { name: 'Derek Chen', initials: 'DC' },
  ];

  const ips = ['192.168.1.100', '192.168.1.101', '10.0.0.45', '10.0.0.22', '203.0.113.42'];

  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  return [
    { id: 'AUD-001', timestamp: d(0, 0.5), userName: 'Amer Moreau', userInitials: 'AM', action: 'Created', resourceType: 'Job', resourceId: 'JOB-004', details: 'Created emergency sewer line backup job for Carlos Garcia', ipAddress: '192.168.1.100' },
    { id: 'AUD-002', timestamp: d(0, 1), userName: 'Mike Torres', userInitials: 'MT', action: 'Updated', resourceType: 'Job', resourceId: 'JOB-004', details: 'Updated job status from scheduled to in-progress', ipAddress: '192.168.1.101' },
    { id: 'AUD-003', timestamp: d(0, 3), userName: 'James Wilson', userInitials: 'JW', action: 'Updated', resourceType: 'Job', resourceId: 'JOB-001', details: 'Marked job as completed. Final cost: $520', ipAddress: '10.0.0.45' },
    { id: 'AUD-004', timestamp: d(0, 5), userName: 'Amer Moreau', userInitials: 'AM', action: 'Created', resourceType: 'Invoice', resourceId: 'INV-015', details: 'Created invoice for Carlos Garcia sewer line backup: $650', ipAddress: '192.168.1.100' },
    { id: 'AUD-005', timestamp: d(0, 8), userName: 'Sarah Blake', userInitials: 'SB', action: 'Updated', resourceType: 'Inventory', resourceId: 'INV-ITM-016', details: 'Adjusted stock count for Bradford White 50-gal water heater: 5 to 4', ipAddress: '10.0.0.22' },
    { id: 'AUD-006', timestamp: d(1, 0), userName: 'Derek Chen', userInitials: 'DC', action: 'Created', resourceType: 'Job', resourceId: 'JOB-025', details: 'Created brewery floor drain maintenance job for Lone Star Brewery', ipAddress: '203.0.113.42' },
    { id: 'AUD-007', timestamp: d(1, 2), userName: 'Amer Moreau', userInitials: 'AM', action: 'Deleted', resourceType: 'Client', resourceId: 'CLT-023', details: 'Removed duplicate client entry for John Smith Properties', ipAddress: '192.168.1.100' },
    { id: 'AUD-008', timestamp: d(1, 5), userName: 'Mike Torres', userInitials: 'MT', action: 'Updated', resourceType: 'Invoice', resourceId: 'INV-013', details: 'Updated invoice status from sent to overdue', ipAddress: '192.168.1.101' },
    { id: 'AUD-009', timestamp: d(1, 8), userName: 'James Wilson', userInitials: 'JW', action: 'Created', resourceType: 'Job', resourceId: 'JOB-026', details: 'Created hot water recirculation pump replacement job for Lone Star Brewery', ipAddress: '10.0.0.45' },
    { id: 'AUD-010', timestamp: d(2, 0), userName: 'Sarah Blake', userInitials: 'SB', action: 'Updated', resourceType: 'Inventory', resourceId: 'INV-ITM-018', details: 'Checked out Zoeller sump pump for job JOB-010. Stock: 6 to 5', ipAddress: '10.0.0.22' },
    { id: 'AUD-011', timestamp: d(2, 3), userName: 'Amer Moreau', userInitials: 'AM', action: 'Created', resourceType: 'Estimate', resourceId: 'EST-005', details: 'Sent estimate to Riverside Church for restroom renovation: $8,500', ipAddress: '192.168.1.100' },
    { id: 'AUD-012', timestamp: d(2, 6), userName: 'Derek Chen', userInitials: 'DC', action: 'Updated', resourceType: 'Job', resourceId: 'JOB-011', details: 'Changed assigned tech from TECH-004 to TECH-002', ipAddress: '203.0.113.42' },
    { id: 'AUD-013', timestamp: d(3, 0), userName: 'Mike Torres', userInitials: 'MT', action: 'Deleted', resourceType: 'Invoice', resourceId: 'INV-018', details: 'Deleted draft invoice for cancelled job JOB-032', ipAddress: '192.168.1.101' },
    { id: 'AUD-014', timestamp: d(3, 4), userName: 'James Wilson', userInitials: 'JW', action: 'Created', resourceType: 'Job', resourceId: 'JOB-028', details: 'Created tankless water heater flush job for Maria Wilson', ipAddress: '10.0.0.45' },
    { id: 'AUD-015', timestamp: d(3, 8), userName: 'Amer Moreau', userInitials: 'AM', action: 'Updated', resourceType: 'Settings', resourceId: 'BILLING', details: 'Updated default hourly labor rate from $85 to $90/hr', ipAddress: '192.168.1.100' },
    { id: 'AUD-016', timestamp: d(4, 0), userName: 'Sarah Blake', userInitials: 'SB', action: 'Created', resourceType: 'Client', resourceId: 'CLT-023', details: 'Added new client: Maplewood Elementary School', ipAddress: '10.0.0.22' },
    { id: 'AUD-017', timestamp: d(4, 5), userName: 'Derek Chen', userInitials: 'DC', action: 'Updated', resourceType: 'Job', resourceId: 'JOB-021', details: 'Marked garbage disposal replacement as completed. Actual: $275', ipAddress: '203.0.113.42' },
    { id: 'AUD-018', timestamp: d(5, 0), userName: 'Mike Torres', userInitials: 'MT', action: 'Deleted', resourceType: 'Inventory', resourceId: 'INV-ITM-025', details: 'Removed discontinued item: Brass 1/2 inch tee fitting', ipAddress: '192.168.1.101' },
    { id: 'AUD-019', timestamp: d(5, 6), userName: 'James Wilson', userInitials: 'JW', action: 'Created', resourceType: 'Invoice', resourceId: 'INV-016', details: 'Created invoice for whole house repipe at Michael Brown: $6,500', ipAddress: '10.0.0.45' },
    { id: 'AUD-020', timestamp: d(6, 0), userName: 'Amer Moreau', userInitials: 'AM', action: 'Updated', resourceType: 'Team', resourceId: 'TECH-006', details: 'Changed Omar Hassan role from tech to senior-tech', ipAddress: '192.168.1.100' },
    { id: 'AUD-021', timestamp: d(6, 4), userName: 'Sarah Blake', userInitials: 'SB', action: 'Created', resourceType: 'Job', resourceId: 'JOB-031', details: 'Created water heater bank inspection job for Sunset Retirement Home', ipAddress: '10.0.0.22' },
    { id: 'AUD-022', timestamp: d(7, 0), userName: 'Derek Chen', userInitials: 'DC', action: 'Updated', resourceType: 'Client', resourceId: 'CLT-011', details: 'Updated contact phone number for Oak Springs Apartments', ipAddress: '203.0.113.42' },
    { id: 'AUD-023', timestamp: d(7, 6), userName: 'Charles White', userInitials: 'CW', action: 'Created', resourceType: 'Report', resourceId: 'RPT-2026-06', details: 'Generated monthly performance report for June 2026', ipAddress: '10.0.0.100' },
    { id: 'AUD-024', timestamp: d(8, 0), userName: 'James Wilson', userInitials: 'JW', action: 'Updated', resourceType: 'Job', resourceId: 'JOB-007', details: 'Added notes to job: "Customer requested additional shutoff valve at vanity"', ipAddress: '10.0.0.45' },
    { id: 'AUD-025', timestamp: d(9, 0), userName: 'Amer Moreau', userInitials: 'AM', action: 'Deleted', resourceType: 'Lead', resourceId: 'LEAD-009', details: 'Removed spam lead from 555-123-4567', ipAddress: '192.168.1.100' },
  ];
}

/* ── Skeleton ── */

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex gap-4 border-b border-gray-200 px-4 py-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-3 w-16 rounded bg-white/5" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-b border-gray-200/50 px-4 py-3">
          {Array.from({ length: 7 }).map((_, c) => (
            <div key={c} className={`h-3 rounded bg-white/5 ${c === 0 ? 'w-20' : c === 1 ? 'w-16' : c === 2 ? 'w-14' : c === 3 ? 'w-16' : c === 4 ? 'w-12' : c === 5 ? 'w-32' : 'w-20'}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Main Page ── */

export default function AuditLogPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>('30d');
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all');
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setEntries(generateAuditLog());
        setLoading(false);
      } catch {
        setError('Failed to load audit log.');
        setLoading(false);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        setEntries(generateAuditLog());
        setLoading(false);
      } catch {
        setError('Failed to load audit log.');
        setLoading(false);
      }
    }, 1200);
  };

  const uniqueUsers = useMemo(() => {
    const names = new Set(entries.map(e => e.userName));
    return Array.from(names).sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const now = new Date();
    let filtered = [...entries];

    // Date filter
    const cutoff = new Date(now);
    if (dateFilter === '7d') cutoff.setDate(cutoff.getDate() - 7);
    else if (dateFilter === '30d') cutoff.setDate(cutoff.getDate() - 30);

    if (dateFilter !== 'all') {
      filtered = filtered.filter(e => new Date(e.timestamp) >= cutoff);
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(e => e.action.toLowerCase() === actionFilter);
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(e => e.userName === userFilter);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [entries, dateFilter, actionFilter, userFilter]);

  /* ── Error State ── */
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <Card variant="bordered" padding="lg">
          <ErrorState title="Failed to load audit log" message={error} onRetry={handleRetry} />
        </Card>
      </div>
    );
  }

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <SkeletonTable rows={7} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-xs text-gray-500">{entries.length} total entries</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Date Range */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {([['7d', 'Last 7 Days'], ['30d', 'Last 30 Days'], ['all', 'All']] as [DateFilter, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDateFilter(key)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                dateFilter === key
                  ? 'bg-electric text-[#0a0e2a]'
                  : 'text-gray-400 hover:text-gray-900 hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Action Type */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {([['all', 'All'], ['created', 'Created'], ['updated', 'Updated'], ['deleted', 'Deleted']] as [ActionFilter, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActionFilter(key)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                actionFilter === key
                  ? 'bg-electric text-[#0a0e2a]'
                  : 'text-gray-400 hover:text-gray-900 hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* User Filter */}
        <div className="relative">
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="appearance-none rounded-lg border border-gray-200 bg-whiteer px-3 py-1.5 pr-8 text-xs text-gray-400 focus:outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20 cursor-pointer"
          >
            <option value="all">All Users</option>
            {uniqueUsers.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <Card variant="bordered" padding="lg">
          <EmptyState
            title="No audit entries for this period"
            description="Try adjusting your filters to see more results. Audit entries track changes to jobs, invoices, clients, and system settings."
          />
        </Card>
      )}

      {/* Table */}
      {filteredEntries.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Resource Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Resource ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => {
                const actionColors: Record<string, string> = {
                  Created: 'bg-green-50 text-green-600',
                  Updated: 'bg-blue-50 text-blue-600',
                  Deleted: 'bg-red-50 text-red-600',
                };
                return (
                  <tr key={entry.id} className="border-b border-gray-200/50 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-900">{new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="text-[10px] text-gray-500">{new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar name={entry.userName} size="sm" />
                        <span className="text-sm text-gray-900">{entry.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${actionColors[entry.action] || 'bg-white/5 text-gray-400'}`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{entry.resourceType}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-mono text-blue-600">{entry.resourceId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-400 line-clamp-2 max-w-xs">{entry.details}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-500">{entry.ipAddress}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Result count */}
      {filteredEntries.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          Showing {filteredEntries.length} of {entries.length} entries
        </p>
      )}
    </div>
  );
}