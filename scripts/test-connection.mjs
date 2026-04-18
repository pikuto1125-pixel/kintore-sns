import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load .env.local manually
const env = readFileSync(".env.local", "utf-8");
const vars = Object.fromEntries(
  env.split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => l.split("=").map(s => s.trim()))
);

const url = vars["NEXT_PUBLIC_SUPABASE_URL"];
const key = vars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

if (!url || !key || url.includes("your_")) {
  console.error("❌ .env.local に SUPABASE_URL と ANON_KEY を設定してください");
  process.exit(1);
}

console.log("🔗 接続先:", url);

const supabase = createClient(url, key);

const tables = ["profiles", "posts", "workout_sessions", "likes"];
let allOk = true;

for (const table of tables) {
  const { error } = await supabase.from(table).select("*").limit(1);
  if (error) {
    console.error(`❌ ${table}: ${error.message}`);
    allOk = false;
  } else {
    console.log(`✅ ${table}: OK`);
  }
}

if (allOk) {
  console.log("\n✨ Supabase接続・テーブル確認: 全て正常！");
} else {
  console.log("\n⚠️  スキーマが未適用の可能性があります。supabase/schema.sql を実行してください。");
}
