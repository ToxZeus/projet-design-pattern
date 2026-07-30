/** A task, as stored by the demo app. */
export interface Task {
  id: number;
  title: string;
  done: boolean;
}

const seed: Task[] = [
  { id: 1, title: "Lire le cours sur les design patterns", done: true },
  { id: 2, title: "Implémenter le routeur et le store", done: true },
  { id: 3, title: "Brancher l'application de démo", done: false },
];

/**
 * Replaces the global `fetch` with a tiny in-memory REST API under `/api/tasks`.
 * Lets the real `HttpClient` run end to end without a backend.
 */
export function installMockApi(): void {
  let tasks: Task[] = seed.map((task) => ({ ...task }));
  let nextId = tasks.length + 1;

  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const method = init?.method ?? "GET";
    const path = new URL(url, globalThis.location.origin).pathname;
    const idMatch = /^\/api\/tasks\/(\d+)$/.exec(path);

    if (path === "/api/tasks") {
      if (method === "GET") return json(tasks);
      if (method === "POST") {
        const body = parseBody(init) as { title: string };
        const task: Task = { id: nextId++, title: body.title, done: false };
        tasks.push(task);
        return json(task, 201);
      }
    }

    if (idMatch) {
      const id = Number(idMatch[1]);
      const task = tasks.find((item) => item.id === id);
      if (!task) return json({ message: "Not found" }, 404);
      if (method === "GET") return json(task);
      if (method === "PUT") {
        const body = parseBody(init) as Partial<Task>;
        task.title = body.title ?? task.title;
        task.done = body.done ?? task.done;
        return json(task);
      }
      if (method === "DELETE") {
        tasks = tasks.filter((item) => item.id !== id);
        return Promise.resolve(new Response(null, { status: 204 }));
      }
    }

    return json({ message: "Unknown route" }, 404);
  };
}

function json(data: unknown, status = 200): Promise<Response> {
  return Promise.resolve(
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

function parseBody(init?: RequestInit): unknown {
  return init?.body ? JSON.parse(init.body as string) : {};
}
