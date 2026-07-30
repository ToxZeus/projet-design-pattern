import "./style.css";
import { startApp } from "./demo/app.ts";

const root = document.querySelector<HTMLDivElement>("#app");
if (root) {
  startApp(root);
}
