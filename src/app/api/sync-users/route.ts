import { query } from "@/app/lib/db";
import axios from "axios";

export async function GET() {
  const SLACK_API_URL = "https://slack.com/api/users.list";
  const { SLACK_USER_TOKEN } = process.env;

  try {
    const response = await axios.get(SLACK_API_URL, {
      headers: { Authorization: `Bearer ${SLACK_USER_TOKEN}` },
    });

    const users = response.data.members.filter(
      (user: Record<string, boolean | number | string>) =>
        user.id !== "USLACKBOT" && !user.is_bot && !user.deleted
    );

    for (const user of users) {
      await query(
        `INSERT INTO users (slack_id, name, email, phone, image, timezone)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slack_id) DO UPDATE
         SET name = $2, email = $3, phone = $4, image = $5, timezone = $6, updated_at = NOW()`,
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

    return new Response(
      JSON.stringify({ message: "Users synced successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to sync users" }), {
      status: 500,
    });
  }
}
