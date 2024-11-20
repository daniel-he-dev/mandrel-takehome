import { sendMessageToClients } from "@/app/lib/clients";
import { query } from "@/app/lib/db";
import crypto from "crypto";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { SLACK_SIGNING_SECRET } = process.env;

  const signature = req.headers.get("x-slack-signature") ?? "";
  const timestamp = req.headers.get("x-slack-request-timestamp");
  const body = await req.text();

  const [version, hash] = signature.split("=");
  const hmac = crypto.createHmac("sha256", SLACK_SIGNING_SECRET!);
  hmac.update(`${version}:${timestamp}:${body}`);

  if (hmac.digest("hex") !== hash) {
    return new Response("Invalid signature", { status: 400 });
  }

  const payload = JSON.parse(body);
  const { challenge, event } = payload;
  if (challenge)
    return new Response(JSON.stringify({ challenge }), {
      status: 200,
    });

  //send data to client side first
  if (event) {
    sendMessageToClients(JSON.stringify(event));
  }

  if (event.type === "team_join") {
    const user = event.user;

    await query(
      `INSERT INTO users (slack_id, name, email, phone, image, timezone)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        user.real_name,
        user.profile.email,
        user.profile.phone,
        user.profile.image_192,
        user.tz,
      ]
    );
  }

  if (event.type === "user_change") {
    const user = event.user;
    await query(
      `UPDATE users
       SET name = $1, email = $2, phone = $3, image = $4, timezone = $5, updated_at = NOW()
       WHERE slack_id = $6`,
      [
        user.real_name,
        user.profile.email,
        user.profile.phone,
        user.profile.image_192,
        user.tz,
        user.id,
      ]
    );
  }

  return new Response("Event processed", { status: 200 });
}
