import "./style.css";
import { createApp } from "./app.ts";

const root = document.querySelector<HTMLDivElement>("#app");
if (root) {
  createApp(root);
}
