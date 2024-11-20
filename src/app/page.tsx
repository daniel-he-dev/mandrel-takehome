"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SlackUser } from "./types/types";

export default function UsersPage() {
  const [users, setUsers] = useState<SlackUser[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      await fetch("/api/sync-users");
      const response = await fetch("/api/get-users");
      const data = (await response.json()) as SlackUser[];
      setUsers(data);
    }

    fetchUsers();

    const eventSource = new EventSource("/api/event-stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        const newUser: SlackUser = {
          ...data.user,
          slack_id: data.user.id,
          email: data.user.profile.email,
          phone: data.user.profile.phone,
          name: data.user.real_name,
          image: data.user.profile.image_192,
          timezone: data.user.tz,
        };

        if (data.type === "team_join") {
          setUsers((users) => [...users, newUser]);
        }

        if (data.type === "user_change") {
          setUsers((users) =>
            users.map((oldUser) =>
              oldUser.slack_id === newUser.slack_id ? newUser : oldUser
            )
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h1>User List</h1>
      <ul>
        {users.map((user) => (
          <li key={user.slack_id}>
            {user.image && (
              <Image
                src={user.image}
                alt={user.name ?? "Unknown user"}
                width={50}
                height={50}
              />
            )}
            <strong>Name:</strong> {user.name} <br />
            <strong>Email:</strong> {user.email} <br />
            <strong>Phone:</strong> {user.phone} <br />
            <strong>Timezone:</strong> {user.timezone}
          </li>
        ))}
      </ul>
    </div>
  );
}
