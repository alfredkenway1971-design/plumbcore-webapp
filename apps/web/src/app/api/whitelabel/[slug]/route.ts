/**
 * GET /api/whitelabel/[slug]
 * Returns white-label branding config for a plumber
 */

import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const admin = getAdminClient();

    if (!admin) {
      // Fallback mock data
      return NextResponse.json({
        brand: {
          name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
          slug,
          primary_color: '#3B82F6',
          phone: '(555) 123-4567',
          subdomain_enabled: true,
          embed_enabled: false,
        },
      });
    }

    const { data } = await (admin as any)
      .from('plumber_whitelabel')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!data) {
      return NextResponse.json({ brand: null, message: 'No white-label config found' }, { status: 404 });
    }

    return NextResponse.json({
      brand: {
        name: data.plumber_name || slug,
        slug: data.slug,
        logo_url: data.logo_url || null,
        primary_color: data.primary_color || '#3B82F6',
        phone: data.phone || null,
        subdomain_enabled: data.subdomain_enabled,
        embed_enabled: data.embed_enabled,
      },
    });
  } catch {
    return NextResponse.json({ brand: null }, { status: 500 });
  }
}
