import { NextRequest } from "next/server";

import { addClient, removeClient } from "@/app/lib/clients";

export async function GET(req: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  writer.write(encoder.encode("data: \n\n"));

  const clientId = Math.floor(Math.random() * 10000000000);

  addClient(clientId, {
    write: (message: string) => writer.write(encoder.encode(message)),
    end: () => writer.close(),
  });

  req.signal.addEventListener("abort", () => {
    console.log("Client disconnected");
    removeClient(clientId);
    writer.close();
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
