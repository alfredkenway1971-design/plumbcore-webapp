'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Button, Card, Input, TextArea, StatusBadge, Modal, EmptyState, ErrorState } from '@/pkg/ui-components';
import { clients, jobs } from '@/lib/mock-data';
import type { Client, Job } from '@/lib/mock-data';

/* ── Property type ── */
interface ClientProperty {
  address: string;
  type: 'residential' | 'commercial';
}

/* ── Tag colors ── */
const TAG_COLORS = [
  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'bg-green-500/10 text-green-400 border-green-500/20',
  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'bg-teal-500/10 text-teal-400 border-teal-500/20',
];

/* ── Skeleton states ── */
function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-whiteer ${className}`} />;
}

/* ── Status color ── */
const statusColor: Record<Job['status'], string> = {
  scheduled: 'bg-blue-50 text-blue-600',
  'in-progress': 'bg-accent-amber/10 text-amber-600',
  completed: 'bg-green-50 text-green-600',
  urgent: 'bg-red-50 text-red-600',
  cancelled: 'bg-steel-dark/20 text-gray-500',
};

function formatCurrency(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
}

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = String(params.id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Edit client modal ── */
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editZip, setEditZip] = useState('');
  const [editCompany, setEditCompany] = useState('');

  /* ── Notes ── */
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  /* ── Local client store for CRUD ── */
  const [clientList, setClientList] = useState<Client[]>([]);
  const [clientProperties, setClientProperties] = useState<Record<string, ClientProperty[]>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setClientList([...clients]);
        setLoading(false);
      } catch {
        setError('Failed to load client data');
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const client: Client | undefined = useMemo(
    () => clientList.find((c) => c.id === clientId),
    [clientId, clientList]
  );

  /* ── Initialize edit form when client loads ── */
  useEffect(() => {
    if (client) {
      setEditName(client.name);
      setEditEmail(client.email);
      setEditPhone(client.phone);
      setEditAddress(client.address);
      setEditCity(client.city);
      setEditState(client.state);
      setEditZip(client.zip);
      setEditCompany(client.company ?? '');
      setNotesText(client.notes ?? '');
    }
  }, [client]);

  const clientJobs: Job[] = useMemo(() => {
    if (!client) return [];
    return jobs
      .filter(
        (j) =>
          j.clientId === client.id ||
          j.clientName === client.name ||
          j.address === client.address
      )
      .sort(
        (a, b) =>
          new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
      );
  }, [client]);

  /* ── Compute stats ── */
  const stats = useMemo(() => {
    if (!clientJobs.length) {
      return { totalJobs: client?.totalJobs ?? 0, totalRevenue: client?.totalRevenue ?? 0, lastJobDate: '—' };
    }
    const totalRevenue = clientJobs
      .filter((j) => j.actualCost != null)
      .reduce((sum, j) => sum + (j.actualCost ?? 0), 0);
    const sorted = [...clientJobs].sort(
      (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );
    const last = sorted[0];
    return {
      totalJobs: clientJobs.length,
      totalRevenue,
      lastJobDate: last?.scheduledDate ?? '—',
    };
  }, [clientJobs, client]);

  /* ── Properties for this client ── */
  const properties = useMemo(() => clientProperties[clientId] ?? [], [clientProperties, clientId]);

  /* ── Handle edit client ── */
  const handleSaveEdit = () => {
    if (!editName.trim() || !editEmail.trim() || !editPhone.trim() || !editAddress.trim() || !editCity.trim() || !editState.trim() || !editZip.trim()) return;
    setSaving(true);
    setTimeout(() => {
      setClientList((prev) =>
        prev.map((c) =>
          c.id === clientId
            ? {
                ...c,
                name: editName.trim(),
                email: editEmail.trim(),
                phone: editPhone.trim(),
                address: editAddress.trim(),
                city: editCity.trim(),
                state: editState.trim(),
                zip: editZip.trim(),
                company: editCompany.trim() || undefined,
              }
            : c
        )
      );
      setSaving(false);
      setShowEditModal(false);
    }, 600);
  };

  /* ── Handle save notes ── */
  const handleSaveNotes = () => {
    setSavingNotes(true);
    setTimeout(() => {
      setClientList((prev) =>
        prev.map((c) =>
          c.id === clientId
            ? { ...c, notes: notesText.trim() || undefined }
            : c
        )
      );
      setSavingNotes(false);
    }, 400);
  };

  const editFormValid = editName.trim() && editEmail.trim() && editPhone.trim() && editAddress.trim() && editCity.trim() && editState.trim() && editZip.trim();

  /* ── Not found state ── */
  if (!loading && !error && !client) {
    return (
      <div className="space-y-5">
        <Card variant="bordered" padding="lg">
          <EmptyState
            title="Client not found"
            description={`No client with ID "${clientId}" exists.`}
          />
          <div className="mt-4">
            <a
              href="/clients"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-600-light transition-colors"
            >
              ← Back to Clients
            </a>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="bordered" padding="lg">
        <ErrorState title="Failed to load client" message={error} onRetry={() => window.location.reload()} />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <a
        href="/clients"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Clients
      </a>

      {/* ── Client Info Header ── */}
      <Card variant="default" padding="lg">
        {loading ? (
          <div className="space-y-3">
            <SkeletonBlock className="h-7 w-64" />
            <SkeletonBlock className="h-4 w-48" />
            <SkeletonBlock className="h-4 w-40" />
          </div>
        ) : client ? (
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
              {client.company && (
                <p className="text-sm text-gray-500">{client.company}</p>
              )}
              <div className="space-y-1 text-sm text-gray-400">
                <p>
                  <span className="text-steel">Email:</span> {client.email}
                </p>
                <p>
                  <span className="text-steel">Phone:</span> {client.phone}
                </p>
                <p>
                  <span className="text-steel">Address:</span> {client.address},{' '}
                  {client.city}, {client.state} {client.zip}
                </p>
                <p>
                  <span className="text-steel">Client since:</span>{' '}
                  {new Date(client.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                Edit Client
              </Button>
              <Button variant="primary" size="sm" onClick={() => window.location.href = `/jobs?newJobFor=${client.id}`}>
                New Job
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      {/* ── Properties Section ── */}
      {!loading && client && (
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Properties</h3>
          </div>
          {properties.length === 0 ? (
            <p className="text-sm text-gray-500">No properties saved for this client.</p>
          ) : (
            <div className="space-y-2">
              {properties.map((prop, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-gray-200/50 px-3 py-2.5 bg-whiteer/50"
                >
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-sm text-gray-900">{prop.address}</span>
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${prop.type === 'commercial' ? 'bg-accent-amber/10 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                      {prop.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-20" />
            ))
          : [
              { label: 'Total Jobs', value: String(stats.totalJobs) },
              { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue) },
              {
                label: 'Last Job Date',
                value: stats.lastJobDate !== '—'
                  ? new Date(stats.lastJobDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—',
              },
            ].map((s) => (
              <Card key={s.label} variant="default" padding="md">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="mt-1.5 text-2xl font-bold text-gray-900">{s.value}</p>
              </Card>
            ))}
      </div>

      {/* ── Job History Table ── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Job History</h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-12" />
            ))}
          </div>
        ) : clientJobs.length === 0 ? (
          <Card variant="bordered" padding="md">
            <EmptyState
              title="No job history"
              description="This client has no jobs yet. Create one to get started."
            />
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Job ID</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {clientJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-gray-200/50 transition-colors hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <a
                        href={`/jobs/${job.id}`}
                        className="font-medium text-blue-600 hover:text-blue-600-light transition-colors"
                      >
                        {job.id}
                      </a>
                    </td>
                    <td className="py-3 px-4 max-w-[260px]">
                      <p className="text-gray-900 truncate">{job.title}</p>
                      <p className="text-xs text-gray-500 truncate">{job.description}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                      {new Date(job.scheduledDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[11px] font-medium ${
                          statusColor[job.status]
                        }`}
                      >
                        {job.status === 'in-progress'
                          ? 'In Progress'
                          : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 font-medium whitespace-nowrap">
                      {job.actualCost != null
                        ? formatCurrency(job.actualCost)
                        : formatCurrency(job.estimatedCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Notes Section ── */}
      {!loading && client && (
        <Card variant="default" padding="md">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Notes</h3>
          <TextArea
            placeholder="Add notes about this client..."
            rows={4}
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
          />
          <div className="mt-3 flex justify-end">
            <Button
              variant="primary"
              size="sm"
              loading={savingNotes}
              disabled={!notesText.trim()}
              onClick={handleSaveNotes}
            >
              Save Notes
            </Button>
          </div>
        </Card>
      )}

      {/* ── Edit Client Modal ── */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Client"
        description={`Editing ${client?.name ?? ''}`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={saving} disabled={!editFormValid} onClick={handleSaveEdit}>
              Update Client
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Name *"
              placeholder="John Doe"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Input
              label="Email *"
              type="email"
              placeholder="john@example.com"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone *"
              placeholder="(555) 000-0000"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
            <Input
              label="Company Name"
              placeholder="Optional"
              value={editCompany}
              onChange={(e) => setEditCompany(e.target.value)}
            />
          </div>
          <Input
            label="Address *"
            placeholder="123 Main St"
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City *"
              placeholder="Austin"
              value={editCity}
              onChange={(e) => setEditCity(e.target.value)}
            />
            <Input
              label="State *"
              placeholder="TX"
              value={editState}
              onChange={(e) => setEditState(e.target.value)}
            />
            <Input
              label="ZIP *"
              placeholder="73301"
              value={editZip}
              onChange={(e) => setEditZip(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}