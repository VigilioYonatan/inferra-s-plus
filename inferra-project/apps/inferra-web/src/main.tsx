import { render } from "preact";
import { App } from "./app/app";
import "./styles/global.css";

const root = document.getElementById("app");
if (!root) throw new Error("App root missing");
render(<App />, root);
