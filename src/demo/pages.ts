import { TagBuilder } from "../core/index.ts";
import { Card } from "../components/index.ts";
import { Field, MinLength, Required, bindError, bindInput } from "../forms/index.ts";
import type { Router } from "../router/index.ts";
import type { HttpClient } from "../http/index.ts";
import { store, visibleTasks, type TaskFilter } from "./store.ts";
import type { Task } from "./mockApi.ts";
import { createTask, deleteTask, toggleTask, updateTask } from "./actions.ts";

/** What every page needs to navigate and talk to the API. */
export interface Deps {
  router: Router;
  http: HttpClient;
}

/** Home page: a quick summary plus a shortcut to the list. */
export function renderHome(deps: Deps): HTMLElement {
  const { tasks } = store.getState();
  const done = tasks.filter((task) => task.done).length;

  const stats = new TagBuilder("p")
    .withClass("stats")
    .withText(`${tasks.length} tâches · ${done} faites · ${tasks.length - done} à faire`)
    .build();

  const goToList = new TagBuilder("button")
    .withClass("btn-primary")
    .withText("Voir mes tâches")
    .withEvent("click", () => deps.router.navigate("/tasks"))
    .build();

  const body = new TagBuilder("div").withChild(stats).withChild(goToList).build();
  return new Card({ title: "Gestionnaire de tâches", children: [body] }).render();
}

/** List page: create, filter, toggle, open or delete tasks. */
export function renderList(deps: Deps): HTMLElement {
  const tasks = visibleTasks(store.getState());

  const list = new TagBuilder("ul").withClass("task-list").build();
  if (tasks.length === 0) {
    list.appendChild(new TagBuilder("li").withClass("empty").withText("Aucune tâche.").build());
  } else {
    for (const task of tasks) {
      list.appendChild(taskRow(deps, task));
    }
  }

  const body = new TagBuilder("div")
    .withChild(newTaskForm(deps))
    .withChild(filterBar())
    .withChild(list)
    .build();
  return new Card({ title: "Mes tâches", children: [body] }).render();
}

/** Detail page: edit the title (validated), toggle done or delete. */
export function renderDetail(deps: Deps, id: number): HTMLElement {
  const task = store.getState().tasks.find((item) => item.id === id);
  if (!task) {
    const body = new TagBuilder("div")
      .withChild(new TagBuilder("p").withText("Tâche introuvable.").build())
      .withChild(backButton(deps))
      .build();
    return new Card({ title: "Détail", children: [body] }).render();
  }

  const field = new Field(task.title, [new Required(), new MinLength(3)]);
  const input = new TagBuilder("input").withClass("edit-input").build() as HTMLInputElement;
  bindInput(field, input);

  const error = new TagBuilder("small").withClass("field-error").build();
  bindError(field, error);

  const save = new TagBuilder("button")
    .withClass("btn-primary")
    .withText("Enregistrer")
    .withEvent("click", () => {
      if (field.validate()) {
        void updateTask(deps.http, task, field.value.getValue()).then(() =>
          deps.router.navigate("/tasks"),
        );
      }
    })
    .build();

  const remove = new TagBuilder("button")
    .withClass("btn-danger")
    .withText("Supprimer")
    .withEvent("click", () => {
      void deleteTask(deps.http, task.id).then(() => deps.router.navigate("/tasks"));
    })
    .build();

  const actions = new TagBuilder("div")
    .withClass("actions")
    .withChild(save)
    .withChild(remove)
    .withChild(backButton(deps))
    .build();

  const body = new TagBuilder("div").withChild(input).withChild(error).withChild(actions).build();
  return new Card({ title: `Tâche #${task.id}`, children: [body] }).render();
}

/** Fallback page for an unknown route. */
export function renderNotFound(deps: Deps): HTMLElement {
  const body = new TagBuilder("div")
    .withChild(new TagBuilder("p").withText("Page introuvable.").build())
    .withChild(backButton(deps))
    .build();
  return new Card({ title: "404", children: [body] }).render();
}

function newTaskForm(deps: Deps): HTMLElement {
  const field = new Field("", [new Required(), new MinLength(3)]);
  const input = new TagBuilder("input").withClass("new-input").build() as HTMLInputElement;
  input.placeholder = "Nouvelle tâche…";
  bindInput(field, input);

  const error = new TagBuilder("small").withClass("field-error").build();
  bindError(field, error);

  const add = new TagBuilder("button")
    .withClass("btn-primary")
    .withText("Ajouter")
    .withEvent("click", () => {
      if (field.validate()) {
        void createTask(deps.http, field.value.getValue());
      }
    })
    .build();

  return new TagBuilder("div")
    .withClass("task-form")
    .withChild(new TagBuilder("div").withClass("row").withChild(input).withChild(add).build())
    .withChild(error)
    .build();
}

function filterBar(): HTMLElement {
  const current = store.getState().filter;
  const button = (label: string, value: TaskFilter): HTMLElement => {
    const element = new TagBuilder("button")
      .withClass("filter")
      .withText(label)
      .withEvent("click", () => store.dispatch({ type: "setFilter", filter: value }))
      .build();
    if (value === current) {
      element.classList.add("filter--active");
    }
    return element;
  };

  return new TagBuilder("div")
    .withClass("filter-bar")
    .withChild(button("Toutes", "all"))
    .withChild(button("À faire", "todo"))
    .withChild(button("Faites", "done"))
    .build();
}

function taskRow(deps: Deps, task: Task): HTMLElement {
  const checkbox = new TagBuilder("input").build() as HTMLInputElement;
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.addEventListener("change", () => void toggleTask(deps.http, task));

  const title = new TagBuilder("span")
    .withClass("task-title")
    .withText(task.title)
    .withEvent("click", () => deps.router.navigate(`/tasks/${task.id}`))
    .build();
  if (task.done) {
    title.classList.add("task-title--done");
  }

  const remove = new TagBuilder("button")
    .withClass("btn-icon")
    .withText("✕")
    .withEvent("click", () => void deleteTask(deps.http, task.id))
    .build();

  return new TagBuilder("li")
    .withClass("task-row")
    .withChild(checkbox)
    .withChild(title)
    .withChild(remove)
    .build();
}

function backButton(deps: Deps): HTMLElement {
  return new TagBuilder("button")
    .withClass("btn-link")
    .withText("← Retour")
    .withEvent("click", () => deps.router.navigate("/tasks"))
    .build();
}
