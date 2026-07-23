import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/ai-client';
import { requireAuth, AuthenticatedRequest } from '@/lib/api-auth';

/* ── Gather business context for the AI ── */
async function gatherBusinessContext(companyId?: string): Promise<string> {
  try {
    const lines: string[] = [];

    // Try Supabase first (company info)
    if (companyId) {
      try {
        const { supabase } = await import('@/lib/supabase');
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

        // Today's jobs from Supabase
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data: todayJobs } = await supabase
          .from('jobs')
          .select('title, status, scheduled_date, address, city, client_name')
          .gte('scheduled_date', today.toISOString())
          .lt('scheduled_date', tomorrow.toISOString())
          .order('scheduled_date', { ascending: true });

        if (todayJobs && todayJobs.length > 0) {
          lines.push(`\nToday's Jobs (${todayJobs.length}):`);
          todayJobs.forEach((j: any, i: number) => {
            const time = j.scheduled_date ? new Date(j.scheduled_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'unscheduled';
            lines.push(`  ${i + 1}. ${j.title || 'Job'} — ${j.status} at ${j.address || ''} ${j.city || ''} (${time})${j.client_name ? ` — ${j.client_name}` : ''}`);
          });
        }
      } catch {
        // Supabase queries failed — fall through to mock data below
      }
    }

    // Stats from mock data (always works, no DB needed)
    const { jobs: allJobs, invoices: allInvoices, inventory: allInventory } = await import('@/lib/mock-data');

    // Today's jobs from mock data (if Supabase didn't return any)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayMock = allJobs.filter((j: any) => {
      const d = new Date(j.scheduledDate);
      return d >= today && d < tomorrow && (j.status === 'scheduled' || j.status === 'in-progress');
    });
    if (todayMock.length > 0 && !lines.some(l => l.includes("Today's Jobs"))) {
      lines.push(`\nToday's Jobs (${todayMock.length}):`);
      todayMock.forEach((j: any, i: number) => {
        const time = new Date(j.scheduledDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        lines.push(`  ${i + 1}. ${j.title} — ${j.status} at ${j.address}, ${j.city} (${time}) — ${j.clientName}`);
      });
    }

    // Stats
    const activeJobs = allJobs.filter((j: any) => j.status === 'in-progress').length;
    const scheduledCount = allJobs.filter((j: any) => j.status === 'scheduled').length;
    const urgentCount = allJobs.filter((j: any) => j.status === 'urgent').length;
    const completedCount = allJobs.filter((j: any) => j.status === 'completed').length;
    const overdueInvoices = allInvoices.filter((i: any) => i.status === 'overdue').length;
    const totalRevenue = allInvoices.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + (i.paidAmount || i.amount || 0), 0);
    const lowStock = allInventory.filter((i: any) => i.quantity <= i.minQuantity).length;
    const totalClients = new Set(allJobs.map((j: any) => j.clientId)).size;

    lines.push(`\nBusiness Stats:`);
    lines.push(`  Jobs: ${activeJobs} active · ${scheduledCount} scheduled · ${urgentCount} urgent · ${completedCount} completed`);
    lines.push(`  Overdue Invoices: ${overdueInvoices} · Low Stock Items: ${lowStock} · Clients: ${totalClients}`);
    lines.push(`  Revenue (paid): $${totalRevenue.toLocaleString()}`);

    return lines.join('\n');
  } catch {
    return 'Business data temporarily unavailable. Answer based on general knowledge.';
  }
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