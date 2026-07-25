import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { error } = await supabase
      .from('settings')
      .select('key')
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      status: 'ok',
      supabase: error ? 'error' : 'alive',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({
      status: 'degraded',
      error: err?.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
