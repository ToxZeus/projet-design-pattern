import { Router } from "../router/index.ts";
import { HttpClient } from "../http/index.ts";
import { TagBuilder } from "../core/index.ts";
import { installMockApi } from "./mockApi.ts";
import { store } from "./store.ts";
import { loadTasks } from "./actions.ts";
import { renderDetail, renderHome, renderList, renderNotFound, type Deps } from "./pages.ts";

const routes = ["/", "/tasks", "/tasks/:id"];

/**
 * Boots the demo: mock API, router and store are wired so the page re-renders
 * on every navigation (Router → Observer) and every state change (Store → Observer).
 */
export function startApp(root: HTMLElement): void {
  installMockApi();
  const deps: Deps = { router: new Router(routes), http: new HttpClient("/api") };

  const content = new TagBuilder("main").withClass("content").build();
  root.replaceChildren(buildNav(deps), content);

  const render = () => content.replaceChildren(renderRoute(deps));
  deps.router.subscribe(render);
  store.subscribe(render);

  void loadTasks(deps.http);
}

function renderRoute(deps: Deps): HTMLElement {
  const match = deps.router.getMatch();
  switch (match.pattern) {
    case "/":
      return renderHome(deps);
    case "/tasks":
      return renderList(deps);
    case "/tasks/:id":
      return renderDetail(deps, Number(match.params.id));
    default:
      return renderNotFound(deps);
  }
}

function buildNav(deps: Deps): HTMLElement {
  const link = (label: string, path: string): HTMLElement =>
    new TagBuilder("button")
      .withClass("nav-link")
      .withText(label)
      .withEvent("click", () => deps.router.navigate(path))
      .build();

  return new TagBuilder("header")
    .withClass("app-nav")
    .withChild(new TagBuilder("strong").withClass("brand").withText("✓ TaskFlow").build())
    .withChild(link("Accueil", "/"))
    .withChild(link("Mes tâches", "/tasks"))
    .build();
}
