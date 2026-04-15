// src/app/api/health/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Query ringan untuk keep Supabase tetap aktif
    const { error } = await supabase.from('_dummy_ping').select('*').limit(1).maybeSingle();

    return NextResponse.json({
      status: 'ok',
      supabase: error ? 'pinged' : 'alive',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }
}