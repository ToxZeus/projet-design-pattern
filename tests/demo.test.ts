import { describe, expect, it } from "vitest";
import { installMockApi, type Task } from "../src/demo/mockApi.ts";
import { visibleTasks, type AppState } from "../src/demo/store.ts";
import { startApp } from "../src/demo/app.ts";
import { HttpClient } from "../src/http/index.ts";
import { Success } from "../src/core/result.ts";

describe("demo app bootstrap", () => {
  it("mounts the nav and a card without throwing", () => {
    const root = document.createElement("div");
    startApp(root);
    expect(root.querySelector(".app-nav")).not.toBeNull();
    expect(root.querySelector(".component-card")).not.toBeNull();
  });
});

describe("demo mock API (through the real HttpClient)", () => {
  it("lists, creates and deletes tasks", async () => {
    installMockApi();
    const http = new HttpClient("/api");

    const before = (await http.get<Task[]>("/tasks")).withDefault([]);
    expect(before.length).toBeGreaterThan(0);

    const created = await http.post<Task>("/tasks", { title: "Nouvelle tâche" });
    expect(created).toBeInstanceOf(Success);

    const afterCreate = (await http.get<Task[]>("/tasks")).withDefault([]);
    expect(afterCreate.length).toBe(before.length + 1);

    const target = afterCreate[afterCreate.length - 1];
    await http.delete(`/tasks/${target?.id}`);

    const afterDelete = (await http.get<Task[]>("/tasks")).withDefault([]);
    expect(afterDelete.length).toBe(before.length);
  });
});

describe("visibleTasks", () => {
  const base: AppState = {
    filter: "all",
    tasks: [
      { id: 1, title: "a", done: false },
      { id: 2, title: "b", done: true },
    ],
  };

  it("keeps only the tasks matching the active filter", () => {
    expect(visibleTasks({ ...base, filter: "todo" }).map((task) => task.id)).toEqual([1]);
    expect(visibleTasks({ ...base, filter: "done" }).map((task) => task.id)).toEqual([2]);
    expect(visibleTasks({ ...base, filter: "all" })).toHaveLength(2);
  });
});
