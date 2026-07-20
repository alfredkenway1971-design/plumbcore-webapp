'use client';

import { useState } from 'react';
import { Card, Button, Input, Modal, ErrorState } from '@/pkg/ui-components';

interface Plan {
  id: string;
  name: string;
  price: number;
  techLimit: number;
  hoursLimit: number;
  features: string[];
  active: boolean;
}

const defaultPlans: Plan[] = [
  { id: 'solo', name: 'Solo', price: 349, techLimit: 1, hoursLimit: 15, features: ['Unlimited AI Estimates', 'Scheduling & Invoicing', 'Email Support'], active: true },
  { id: 'pro', name: 'Pro', price: 799, techLimit: 10, hoursLimit: 60, features: ['Unlimited AI Estimates', 'Route Optimization', 'Inventory Tracking', 'Maintenance Plans', 'Review Automation'], active: true },
  { id: 'business', name: 'Business', price: 1499, techLimit: 25, hoursLimit: 150, features: ['Everything in Pro', 'Customer Financing', 'Truck GPS', 'Priority Support'], active: true },
];

export default function PricingPlansPage() {
  const [plans, setPlans] = useState(defaultPlans);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price: 0, techLimit: 1, hoursLimit: 15, features: '' });
  const [error, setError] = useState<string | null>(null);

  const startEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setEditForm({ name: plan.name, price: plan.price, techLimit: plan.techLimit, hoursLimit: plan.hoursLimit, features: plan.features.join('\n') });
  };

  const savePlan = () => {
    if (!editingPlan) return;
    setPlans(prev => prev.map(p => p.id === editingPlan.id ? {
      ...p, name: editForm.name, price: editForm.price, techLimit: editForm.techLimit,
      hoursLimit: editForm.hoursLimit, features: editForm.features.split('\n').filter(f => f.trim()),
    } : p));
    setEditingPlan(null);
  };

  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div><h1 className="text-xl sm:text-2xl font-bold text-foreground">Pricing Plans</h1><p className="text-sm text-muted-foreground mt-0.5">Manage subscription plans, features, and pricing</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.filter(p => p.active).map(plan => (
          <Card key={plan.id} variant="bordered" padding="lg" className="flex flex-col">
            <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
            <p className="text-2xl font-bold text-foreground mt-2">${plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
            <p className="text-xs text-muted-foreground mt-1">{plan.techLimit} techs • {plan.hoursLimit}hrs AI</p>
            <ul className="mt-4 space-y-1.5 flex-1">
              {plan.features.map((f, i) => <li key={i} className="text-xs text-muted-foreground/80 flex items-start gap-1.5"><span className="text-green-600">✓</span>{f}</li>)}
            </ul>
            <Button size="sm" variant="ghost" onClick={() => startEdit(plan)} className="mt-4">Edit Plan</Button>
          </Card>
        ))}
      </div>

      {editingPlan && (
        <Modal open={true} onClose={() => setEditingPlan(null)} title={`Edit ${editingPlan.name} Plan`}>
          <div className="space-y-4 p-4">
            <div><label className="text-xs font-medium text-muted-foreground">Plan Name</label><Input value={editForm.name} onChange={(e: any) => setEditForm(f => ({...f, name: e.target.value}))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-muted-foreground">Price ($/mo)</label><Input type="number" value={editForm.price} onChange={(e: any) => setEditForm(f => ({...f, price: Number(e.target.value)}))} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Tech Limit</label><Input type="number" value={editForm.techLimit} onChange={(e: any) => setEditForm(f => ({...f, techLimit: Number(e.target.value)}))} /></div>
            </div>
            <div><label className="text-xs font-medium text-muted-foreground">AI Hours Limit</label><Input type="number" value={editForm.hoursLimit} onChange={(e: any) => setEditForm(f => ({...f, hoursLimit: Number(e.target.value)}))} /></div>
            <div><label className="text-xs font-medium text-muted-foreground">Features (one per line)</label><textarea value={editForm.features} onChange={(e: any) => setEditForm(f => ({...f, features: e.target.value}))} rows={6} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-blue-400" /></div>
            <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={() => setEditingPlan(null)}>Cancel</Button><Button onClick={savePlan}>Save Plan</Button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
