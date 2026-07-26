/**
 * One-time migration: add photo_url column to leads table
 * Safe to run multiple times — uses IF NOT EXISTS
 */
import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'No DB' }, { status: 500 });
  }

  const sb = admin as any;

  try {
    // Try to add the column by doing a raw SQL query
    // We use a workaround: try to select photo_url, if it fails, the column doesn't exist
    const { error } = await sb.from('leads').select('photo_url').limit(1);

    if (error && error.message?.includes('column')) {
      // Column doesn't exist — create a Supabase function to add it
      const { error: fnError } = await sb.rpc('add_column_if_not_exists', {
        table_name: 'leads',
        column_name: 'photo_url',
        column_type: 'text'
      });

      if (fnError) {
        return NextResponse.json({
          status: 'column_missing',
          message: 'Column photo_url does not exist. Please add it via Supabase dashboard SQL editor:',
          sql: 'ALTER TABLE leads ADD COLUMN photo_url TEXT DEFAULT NULL;'
        });
      }

      return NextResponse.json({ status: 'column_added' });
    }

    return NextResponse.json({ status: 'column_exists', message: 'photo_url column already exists' });
  } catch (e: any) {
    return NextResponse.json({
      error: e.message,
      sql: 'ALTER TABLE leads ADD COLUMN photo_url TEXT DEFAULT NULL;'
    });
  }
}
