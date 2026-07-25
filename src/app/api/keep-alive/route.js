import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const { data, error } = await supabase
    .from("game_scores")
    .select("count")
    .limit(1);
  return Response.json({
    status: error ? "error" : "alive",
    time: new Date().toISOString(),
  });
}
