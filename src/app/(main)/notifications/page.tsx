import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*, actor:actor_id(id,username,avatar_url), post:post_id(id,content)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);

  return <NotificationsClient initialNotifications={(notifications ?? []) as never} />;
}
