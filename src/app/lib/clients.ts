declare global {
  var clients: Array<Client>;
}

type Client = {
  id: number;
  res: any;
};

var clients: Array<Client>;

//During development, need to bind to global this as Next.js will reinitialize module imports https://github.com/vercel/next.js/discussions/48427#discussioncomment-10550280
if (process.env.NODE_ENV === "production") {
  clients = [];
} else {
  if (!global.clients) {
    global.clients = [];
  }
  clients = global.clients;
}

export function addClient(id: number, res: any): void {
  clients.push({ id, res });
}

export function removeClient(id: number): void {
  const index = clients.findIndex((client) => client.id === id);
  if (index !== -1) {
    clients.splice(index, 1);
  }
}

export function sendMessageToClients(message: string): void {
  for (const client of clients) {
    client.res.write(`data: ${message}\n\n`);
  }
}

export function getClientsCount(): number {
  return clients.length;
}
