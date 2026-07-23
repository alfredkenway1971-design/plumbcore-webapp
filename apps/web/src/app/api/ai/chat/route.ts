import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/ai-client';
import { requireAuth, AuthenticatedRequest } from '@/lib/api-auth';

/* ── Gather business context for the AI ── */
async function gatherBusinessContext(): Promise<string> {
  try {
    const lines: string[] = [];
    const { jobs: allJobs, invoices: allInvoices, inventory: allInventory } = await import('@/lib/mock-data');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMock = allJobs.filter((j: any) => {
      const d = new Date(j.scheduledDate);
      return d >= today && d < tomorrow && (j.status === 'scheduled' || j.status === 'in-progress');
    });

    if (todayMock.length > 0) {
      lines.push(`Today's Jobs (${todayMock.length}):`);
      todayMock.forEach((j: any, i: number) => {
        const time = new Date(j.scheduledDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        lines.push(`  ${i + 1}. ${j.title} — ${j.status} at ${j.address}, ${j.city} (${time}) — ${j.clientName}`);
      });
    }

    const activeJobs = allJobs.filter((j: any) => j.status === 'in-progress').length;
    const urgentCount = allJobs.filter((j: any) => j.status === 'urgent').length;
    const completedCount = allJobs.filter((j: any) => j.status === 'completed').length;
    const overdueInvoices = allInvoices.filter((i: any) => i.status === 'overdue').length;
    const totalRevenue = allInvoices.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + (i.paidAmount || i.amount || 0), 0);
    const lowStock = allInventory.filter((i: any) => i.quantity <= i.minQuantity).length;

    lines.push(`\nStats: ${activeJobs} active · ${urgentCount} urgent · ${completedCount} completed · ${overdueInvoices} overdue · ${lowStock} low stock · Revenue: $${totalRevenue.toLocaleString()}`);
    return lines.join('\n');
  } catch {
    return '';
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    // Inject business context into user's message
    const context = await gatherBusinessContext();
    const enhancedMessages = [...messages];
    if (context && enhancedMessages.length > 0) {
      const last = enhancedMessages[enhancedMessages.length - 1];
      enhancedMessages[enhancedMessages.length - 1] = {
        ...last,
        content: `[Business data: ${context}]\n\nUser: ${last.content}\n\nAnswer using the business data above when relevant. Keep it brief.`,
      };
    }

    const reply = await chatWithAI(enhancedMessages);
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('AI chat error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Chat failed' },
      { status: 500 }
    );
  }
}