import { Store, type Reducer } from "../store/index.ts";
import type { Task } from "./mockApi.ts";

export type TaskFilter = "all" | "todo" | "done";

/** Shape of the demo app's global state. */
export interface AppState {
  tasks: Task[];
  filter: TaskFilter;
}

/** Everything that can change the state. */
export type AppAction =
  | { type: "setTasks"; tasks: Task[] }
  | { type: "setFilter"; filter: TaskFilter };

const reducer: Reducer<AppState, AppAction> = (state, action) => {
  switch (action.type) {
    case "setTasks":
      return { ...state, tasks: action.tasks };
    case "setFilter":
      return { ...state, filter: action.filter };
    default:
      return state;
  }
};

/** Single shared store instance for the whole demo app. */
export const store = new Store<AppState, AppAction>(reducer, { tasks: [], filter: "all" });

/** Tasks kept by the active filter. */
export function visibleTasks(state: AppState): Task[] {
  if (state.filter === "todo") return state.tasks.filter((task) => !task.done);
  if (state.filter === "done") return state.tasks.filter((task) => task.done);
  return state.tasks;
}
