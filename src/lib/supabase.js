import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Set them in .env.local — see .env.local.example.'
  );
}

// ponytail: placeholder URL so createClient doesn't throw; API calls will fail with clear warning above
export const supabase = createClient(
  supabaseUrl || 'http://placeholder.local',
  supabaseAnonKey || 'placeholder-anon-key'
);
