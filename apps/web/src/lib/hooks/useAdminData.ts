'use client';

import { useState, useEffect } from 'react';
import {
  platformKPIs as mockKPIs,
  companies as mockCompanies,
  trialPipeline as mockTrials,
  atRiskAccounts as mockAtRisk,
  featureAdoption as mockFeatures,
  revenueBreakdown as mockRevenue,
  recentActivity as mockFeed,
} from '@/lib/admin-data';

export function useAdminData() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/data?endpoint=summary');
        if (!res.ok) throw new Error('API unavailable');
        const data = await res.json();
        if (mounted) {
          setSummary(data);
          setLoading(false);
          return;
        }
      } catch {}
      // Fall back to mock data
      if (mounted) {
        setSummary({
          mrr: mockKPIs.totalMRR,
          activePlumbers: mockKPIs.activePlumbers,
          freeTrials: mockKPIs.activeTrials,
          churnRate: String(mockKPIs.churnRate),
        });
        setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, []);

  return {
    loading,
    summary: summary || {
      mrr: mockKPIs.totalMRR,
      activePlumbers: mockKPIs.activePlumbers,
      freeTrials: mockKPIs.activeTrials,
      churnRate: String(mockKPIs.churnRate),
    },
    companies: mockCompanies,
    trials: mockTrials,
    atRisk: mockAtRisk,
    feed: mockFeed,
    features: mockFeatures,
    revenue: mockRevenue,
  };
}
