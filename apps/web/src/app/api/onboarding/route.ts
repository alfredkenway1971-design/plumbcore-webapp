import { NextRequest, NextResponse } from 'next/server';
import { decodeSessionToken } from '@/lib/custom-auth';

export async function POST(request: NextRequest) {
  try {
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE || '';

    // Auth check
    const authHdr = request.headers.get('Authorization');
    const token = authHdr?.startsWith('Bearer ')
      ? authHdr.slice(7)
      : request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = decodeSessionToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { company, hours, pricing } = body;

    if (!company || !company.companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    if (sbUrl && svcKey) {
      const updates = {
        name: company.companyName,
        email: company.email || '',
        phone: company.phone || '',
        website: company.website || '',
        address: company.street || '',
        city: company.city || '',
        state: company.state || '',
        zip: company.zip || '',
        business_hours: hours || {},
        hourly_rate: pricing?.hourlyRate ? parseFloat(pricing.hourlyRate) : 85,
        service_fee_percent: pricing?.serviceFee ? parseFloat(pricing.serviceFee) : 15,
        tax_rate: pricing?.taxRate ? parseFloat(pricing.taxRate) : 8.25,
        onboarding_complete: true,
      };

      const keyHeader = 'Bearer ' + svcKey;
      const url = sbUrl + '/rest/v1/companies?id=eq.' + session.company.id;

      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': svcKey,
          'Authorization': keyHeader,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        console.error('Supabase update failed:', await res.text());
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Onboarding error:', err);
    return NextResponse.json({ error: 'Failed to save onboarding data' }, { status: 500 });
  }
}
