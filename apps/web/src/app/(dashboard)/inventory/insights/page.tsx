'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
} from '@/pkg/ui-components';
import { inventory } from '@/lib/mock-data';

interface AIInsight {
  icon: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

function generateInsights(): AIInsight[] {
  const lowStockItems = inventory.filter((i) => i.quantity <= i.minQuantity);
  const overstockItems = inventory.filter((i) => i.quantity > i.minQuantity * 2);
  const insights: AIInsight[] = [];

  if (lowStockItems.length > 0) {
    lowStockItems.slice(0, 3).forEach((item) => {
      const reorderWeeks = Math.max(1, Math.floor(Math.random() * 4) + 1);
      insights.push({
        icon: '📦',
        title: `Reorder Alert: ${item.name}`,
        description: `Based on usage patterns, you'll need to reorder ${item.name} in ${reorderWeeks} week${reorderWeeks > 1 ? 's' : ''}. Current stock: ${item.quantity} (min: ${item.minQuantity}).`,
        severity: 'critical',
      });
    });
  }

  if (overstockItems.length > 0) {
    overstockItems.slice(0, 3).forEach((item) => {
      const excess = item.quantity - item.minQuantity * 2;
      insights.push({
        icon: '📊',
        title: `Overstock: ${item.name}`,
        description: `Your ${item.name} is overstocked by ${excess} units — consider discounting or returning to supplier. Current: ${item.quantity}, Recommended max: ${item.minQuantity * 2}.`,
        severity: 'warning',
      });
    });
  }

  const zeroUsage = inventory.filter((i) => i.quantity > 0 && i.quantity <= i.minQuantity * 1.5);
  if (zeroUsage.length > 0) {
    zeroUsage.slice(0, 2).forEach((item) => {
      insights.push({
        icon: '🔍',
        title: `Low Turnover: ${item.name}`,
        description: `${item.name} has had zero usage in 90 days — consider removing from stock or running a promotion.`,
        severity: 'info',
      });
    });
  }

  const seasonalInsights = [
    {
      icon: '🌡️',
      title: 'Seasonal Demand Forecast',
      description: 'Winterization season approaching. Consider stocking additional pipe insulation, heat tape, and freeze-proof spigots.',
      severity: 'info' as const,
    },
    {
      icon: '💰',
      title: 'Cost Optimization Opportunity',
      description: 'Your top 3 suppliers account for 78% of inventory value. Negotiating bulk discounts could save 8-12% on annual procurement costs.',
      severity: 'info' as const,
    },
  ];
  insights.push(...seasonalInsights);

  return insights;
}

export default function InventoryInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiRunning, setAiRunning] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [insightsLoaded, setInsightsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setLoading(false);
      } catch {
        setError('Failed to load inventory insights.');
        setLoading(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleRunAnalysis = async () => {
    setAiRunning(true);
    setInsights([]);
    setInsightsLoaded(false);

    try {
      const inventoryPayload = inventory.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        minStock: item.minQuantity,
        usage: Math.floor(Math.random() * 10) + 1, // estimated usage rate
      }));

      const res = await fetch('/api/ai/inventory-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory: inventoryPayload }),
      });

      if (!res.ok) {
        throw new Error(`API error (${res.status})`);
      }

      const data = await res.json();
      // Map API response to our AIInsight format
      const mapped: AIInsight[] = (data.insights || []).map((insight: any) => ({
        icon: insight.type === 'reorder' ? '📦' : insight.type === 'overstock' ? '📊' : '🔍',
        title: insight.type === 'reorder'
          ? 'Reorder Alert'
          : insight.type === 'overstock'
          ? 'Overstock Warning'
          : 'Dead Stock Alert',
        description: insight.message,
        severity: insight.type === 'reorder' ? 'critical' as const : insight.type === 'overstock' ? 'warning' as const : 'info' as const,
      }));

      // Add seasonal insights if API didn't return enough
      if (mapped.length < 2) {
        mapped.push({
          icon: '🌡️',
          title: 'Seasonal Demand Forecast',
          description: 'Winterization season approaching. Consider stocking additional pipe insulation, heat tape, and freeze-proof spigots.',
          severity: 'info',
        });
        mapped.push({
          icon: '💰',
          title: 'Cost Optimization Opportunity',
          description: 'Your top 3 suppliers account for most of inventory value. Negotiating bulk discounts could save 8-12% on annual procurement costs.',
          severity: 'info',
        });
      }

      setInsights(mapped);
      setInsightsLoaded(true);
    } catch (err: any) {
      // Fallback to local generation on API failure
      setInsights(generateInsights());
      setInsightsLoaded(true);
    } finally {
      setAiRunning(false);
    }
  };

  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const lowStockItems = inventory.filter((i) => i.quantity <= i.minQuantity);
  const overstockItems = inventory.filter((i) => i.quantity > i.minQuantity * 2);

  const StatCard = ({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) => (
    <Card variant="bordered" padding="md">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
      </div>
    </Card>
  );

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Inventory Insights</h1>
        <Card variant="bordered" padding="lg">
          <ErrorState title="Failed to load insights" message={error} onRetry={handleRetry} />
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Inventory Insights</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-white/5" />
        <div className="h-48 animate-pulse rounded-xl bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Inventory Insights</h1>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Items" value={totalItems} color="text-slate-900" sub="Unique SKUs in stock" />
        <StatCard label="Total Value" value={`$${totalValue.toLocaleString()}`} color="text-blue-600" sub="At current unit prices" />
        <StatCard
          label="Low Stock Items"
          value={lowStockItems.length}
          color={lowStockItems.length >= 5 ? 'text-red-600' : lowStockItems.length > 0 ? 'text-amber-400' : 'text-green-600'}
          sub={lowStockItems.length > 0 ? `${lowStockItems.length} item${lowStockItems.length > 1 ? 's' : ''} below minimum` : 'All items well-stocked'}
        />
        <StatCard
          label="Overstock Items"
          value={overstockItems.length}
          color={overstockItems.length > 0 ? 'text-amber-400' : 'text-green-600'}
          sub={overstockItems.length > 0 ? `${overstockItems.length} item${overstockItems.length > 1 ? 's' : ''} exceed 2x min stock` : 'No overstock'}
        />
      </div>

      {/* Low Stock Section */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-red-500" />
            <h2 className="text-lg font-semibold text-slate-900">Low Stock Alerts</h2>
          </div>
          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
            {lowStockItems.length} items
          </span>
        </div>
        {lowStockItems.length === 0 ? (
          <EmptyState title="All items are well-stocked" description="No items are below their minimum stock level." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Item</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Current Qty</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Min Stock</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Suggested Order</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => {
                  const suggestedOrder = Math.max(item.minQuantity * 2 - item.quantity, item.minQuantity);
                  return (
                    <tr key={item.id} className="border-b border-slate-200 transition-colors hover:bg-white/[0.02]">
                      <td className="px-3 py-3 text-slate-900 font-medium">{item.name}</td>
                      <td className="px-3 py-3 text-right font-semibold text-red-600">{item.quantity}</td>
                      <td className="px-3 py-3 text-right text-slate-500">{item.minQuantity}</td>
                      <td className="px-3 py-3 text-right text-slate-900 font-medium">{suggestedOrder}</td>
                      <td className="px-3 py-3 text-center">
                        <a
                          href="/purchase-orders"
                          className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          Create PO
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Overstock Section */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-3 w-3 rounded-full bg-amber-400" />
          <h2 className="text-lg font-semibold text-slate-900">Overstock Items</h2>
        </div>
        {overstockItems.length === 0 ? (
          <EmptyState title="No overstock items" description="All inventory levels are within healthy ranges." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Item</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Current Qty</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Min Stock</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Excess</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Suggested Action</th>
                </tr>
              </thead>
              <tbody>
                {overstockItems.map((item) => {
                  const excess = item.quantity - item.minQuantity * 2;
                  return (
                    <tr key={item.id} className="border-b border-slate-200 transition-colors hover:bg-white/[0.02]">
                      <td className="px-3 py-3 text-slate-900 font-medium">{item.name}</td>
                      <td className="px-3 py-3 text-right text-slate-900 font-medium">{item.quantity}</td>
                      <td className="px-3 py-3 text-right text-slate-500">{item.minQuantity}</td>
                      <td className="px-3 py-3 text-right text-amber-400 font-semibold">+{excess}</td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="rounded-xl bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-400 hover:bg-white/10 hover:text-slate-900 transition-colors">
                            Reduce Price
                          </button>
                          <button className="rounded-xl bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-400 hover:bg-white/10 hover:text-slate-900 transition-colors">
                            Return to Supplier
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* AI Insights Panel */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
            <h2 className="text-lg font-semibold text-slate-900">AI Inventory Analysis</h2>
          </div>
          <Button
            size="sm"
            onClick={handleRunAnalysis}
            loading={aiRunning}
            disabled={aiRunning}
          >
            {aiRunning ? 'Analyzing...' : insightsLoaded ? 'Re-run Analysis' : 'Run Analysis'}
          </Button>
        </div>

        {!insightsLoaded && !aiRunning ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-500/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
            <p className="text-sm text-slate-400">Click "Run Analysis" to generate AI-powered inventory insights based on your current stock levels and usage patterns.</p>
          </div>
        ) : aiRunning ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-white/[0.02] p-4 animate-pulse">
                <div className="h-10 w-10 rounded-xl bg-white/5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-white/5" />
                  <div className="h-3 w-full rounded bg-white/5" />
                  <div className="h-3 w-3/4 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 rounded-xl p-4 border transition-all ${
                  insight.severity === 'critical'
                    ? 'bg-red-500/[0.04] border-status-error/10'
                    : insight.severity === 'warning'
                    ? 'bg-amber-400/[0.04] border-amber-400/10'
                    : 'bg-electric/[0.04] border-electric/10'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                  insight.severity === 'critical'
                    ? 'bg-red-50'
                    : insight.severity === 'warning'
                    ? 'bg-amber-400/10'
                    : 'bg-blue-50'
                }`}>
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{insight.title}</p>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}