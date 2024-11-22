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
          id: 0,
          slack_id: data.user.id,
          email: data.user.profile.email,
          phone: data.user.profile.phone,
          name: data.user.real_name,
          image: data.user.profile.image_192,
          timezone: data.user.tz,
          updated_at: new Date(),
          status_text: data.user.profile.status_text,
          title: data.user.profile.title,
          deleted: data.user.deleted,
        };

        if (data.type === "team_join") {
          setUsers((users) => [...users, newUser]);
        }

        if (data.type === "user_change") {
          if (data.user.deleted) {
            setUsers((users) =>
              users.filter((user) => user.slack_id !== newUser.slack_id)
            );
          } else {
            setUsers((users) =>
              users.map((oldUser) =>
                oldUser.slack_id === newUser.slack_id ? newUser : oldUser
              )
            );
          }
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User List</h1>
      <ul className="space-y-4">
        {users.map((user) => (
          <li
            key={user.slack_id}
            className="p-4 border rounded-lg shadow-md flex items-center space-x-4"
          >
            {user.image && (
              <Image
                src={user.image}
                alt={user.name ?? "Unknown user"}
                width={50}
                height={50}
                className="rounded-full"
              />
            )}
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-600">{user.phone}</p>
              <p className="text-sm text-gray-600">{user.status_text}</p>
              <p className="text-sm text-gray-600">{user.title}</p>
              <p className="text-sm text-gray-600">{user.timezone}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
