import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/ai-client';
import { requireAuth, AuthenticatedRequest } from '@/lib/api-auth';
import { supabase } from '@/lib/supabase';

/* ── Gather business context for the AI ── */
async function gatherBusinessContext(companyId?: string): Promise<string> {
  const lines: string[] = [];

  // Company info
  if (companyId) {
    const { data: company } = await supabase
      .from('companies')
      .select('name, address, city, state, zip, phone, website')
      .eq('id', companyId)
      .maybeSingle();
    if (company) {
      lines.push(`Company: ${company.name}`);
      if (company.address) lines.push(`Address: ${company.address}, ${company.city || ''} ${company.state || ''} ${company.zip || ''}`);
      if (company.phone) lines.push(`Phone: ${company.phone}`);
    }
  }

  // Today's jobs
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayJobs = (await supabase
    .from('jobs')
    .select('title, status, scheduled_date, address, city, client_name, assigned_tech_id')
    .gte('scheduled_date', today.toISOString())
    .lt('scheduled_date', tomorrow.toISOString())
    .order('scheduled_date', { ascending: true })
  ).data || [];

  if (todayJobs.length > 0) {
    lines.push(`\nToday's Jobs (${todayJobs.length}):`);
    todayJobs.forEach((j: any, i: number) => {
      const time = j.scheduled_date ? new Date(j.scheduled_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'unscheduled';
      lines.push(`  ${i + 1}. ${j.title || 'Job'} — ${j.status} at ${j.address || ''} ${j.city || ''} (${time})${j.client_name ? ` — ${j.client_name}` : ''}`);
    });
  } else {
    // Fallback to mock data
    const { jobs } = await import('@/lib/mock-data');
    const todayMock = jobs.filter((j: any) => {
      const d = new Date(j.scheduledDate);
      return d >= today && d < tomorrow && (j.status === 'scheduled' || j.status === 'in-progress');
    });
    if (todayMock.length > 0) {
      lines.push(`\nToday's Jobs (${todayMock.length}):`);
      todayMock.forEach((j: any, i: number) => {
        const time = new Date(j.scheduledDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        lines.push(`  ${i + 1}. ${j.title} — ${j.status} at ${j.address}, ${j.city} (${time}) — ${j.clientName}`);
      });
    }
  }

  // Upcoming jobs (next 7 days)
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const upcoming = (await supabase
    .from('jobs')
    .select('title, status, scheduled_date, address, city, client_name')
    .gte('scheduled_date', today.toISOString())
    .lt('scheduled_date', weekFromNow.toISOString())
    .order('scheduled_date', { ascending: true })
    .limit(10)
  ).data || [];

  if (upcoming.length > 0) {
    lines.push(`\nUpcoming This Week (${upcoming.length} jobs):`);
    upcoming.slice(0, 5).forEach((j: any) => {
      const date = new Date(j.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      lines.push(`  ${date}: ${j.title || 'Job'} (${j.status})${j.client_name ? ` — ${j.client_name}` : ''}`);
    });
  }

  // Stats
  const { jobs: allJobs, invoices: allInvoices, inventory: allInventory } = await import('@/lib/mock-data');
  const activeJobs = allJobs.filter((j: any) => j.status === 'in-progress').length;
  const scheduledCount = allJobs.filter((j: any) => j.status === 'scheduled').length;
  const urgentCount = allJobs.filter((j: any) => j.status === 'urgent').length;
  const completedCount = allJobs.filter((j: any) => j.status === 'completed').length;
  const overdueInvoices = allInvoices.filter((i: any) => i.status === 'overdue').length;
  const totalRevenue = allInvoices.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + (i.paidAmount || i.amount || 0), 0);
  const lowStock = allInventory.filter((i: any) => i.quantity <= i.minQuantity).length;
  const totalClients = allJobs.filter((j: any, i: number, arr: any[]) => arr.findIndex((a: any) => a.clientId === j.clientId) === i).length;

  lines.push(`\nBusiness Stats:`);
  lines.push(`  Active Jobs: ${activeJobs} | Scheduled: ${scheduledCount} | Urgent: ${urgentCount} | Completed: ${completedCount}`);
  lines.push(`  Total Clients: ${totalClients} | Overdue Invoices: ${overdueInvoices} | Low Stock Items: ${lowStock}`);
  lines.push(`  Total Revenue (paid): $${totalRevenue.toLocaleString()}`);

  return lines.join('\n');
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const authedReq = auth as AuthenticatedRequest;

  try {
    const body = await req.json();
    const { messages, companyId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    // Gather business context and inject into the latest message
    const businessContext = await gatherBusinessContext(companyId || authedReq.companyId);
    const enhancedMessages = [...messages];
    if (enhancedMessages.length > 0) {
      const lastMsg = enhancedMessages[enhancedMessages.length - 1];
      enhancedMessages[enhancedMessages.length - 1] = {
        ...lastMsg,
        content: `[BUSINESS CONTEXT]\n${businessContext}\n\n[/BUSINESS CONTEXT]\n\nUser question: ${lastMsg.content}\n\nAnswer using the business context above. If the user asks about their business, use this data. If you don't know something, say so.`,
      };
    }

    const reply = await chatWithAI(enhancedMessages as any);
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Chat failed' },
      { status: 500 }
    );
  }
}