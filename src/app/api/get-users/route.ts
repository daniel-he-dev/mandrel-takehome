import { query } from "@/app/lib/db";

export async function GET() {
  const { rows } = await query("SELECT * FROM users");
  return new Response(JSON.stringify(rows), { status: 200 });
}
