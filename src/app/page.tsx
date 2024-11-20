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
            <p>
              {user.name} ({user.email})
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
