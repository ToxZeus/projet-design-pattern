import { Success } from "../core/result.ts";
import type { HttpClient } from "../http/index.ts";
import { store } from "./store.ts";
import type { Task } from "./mockApi.ts";

/** Loads the task list from the API into the store. */
export async function loadTasks(http: HttpClient): Promise<void> {
  const result = await http.get<Task[]>("/tasks");
  result.map((tasks) => store.dispatch({ type: "setTasks", tasks }));
}

/** Creates a task, then refreshes the list. */
export async function createTask(http: HttpClient, title: string): Promise<void> {
  const result = await http.post<Task>("/tasks", { title });
  if (result instanceof Success) {
    await loadTasks(http);
  }
}

/** Saves an edited title, then refreshes the list. */
export async function updateTask(http: HttpClient, task: Task, title: string): Promise<void> {
  const result = await http.put<Task>(`/tasks/${task.id}`, { title, done: task.done });
  if (result instanceof Success) {
    await loadTasks(http);
  }
}

/** Flips a task's done flag, then refreshes the list. */
export async function toggleTask(http: HttpClient, task: Task): Promise<void> {
  const result = await http.put<Task>(`/tasks/${task.id}`, { title: task.title, done: !task.done });
  if (result instanceof Success) {
    await loadTasks(http);
  }
}

/** Deletes a task, then refreshes the list. */
export async function deleteTask(http: HttpClient, id: number): Promise<void> {
  const result = await http.delete(`/tasks/${id}`);
  if (result instanceof Success) {
    await loadTasks(http);
  }
}
