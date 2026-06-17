import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initTelegram } from "./telegram.ts";
import App from "./App.tsx";
import "./styles.css";

initTelegram();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
