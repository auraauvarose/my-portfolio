import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  // Cek koneksi ringan — cukup akses auth session agar database tetap aktif
  const { error } = await supabase.auth.getSession();
  return Response.json({
    status: error ? "error" : "alive",
    time: new Date().toISOString(),
  });
}
