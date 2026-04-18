import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Called by a cron job or scheduled trigger to revoke post rights
// after 24 hours of inactivity
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({ can_post: false })
    .lt("last_trained_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .eq("can_post", true)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ revoked: data?.length ?? 0 });
}
