import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const MOUNT_ID = "grepobot-modern-root";
const LAUNCHER_ID = "grepobot-modern-launcher";
const CONTAINER_ID = "grepobot-modern-container";
const ROOT_BASE_CLASSES =
  "gb:fixed gb:top-1/2 gb:left-1/2 gb:-translate-x-1/2 gb:-translate-y-1/2 gb:z-[100000]";
const ROOT_HIDDEN_CLASS = "gb:hidden";
const ROOT_VISIBLE_CLASS = "gb:block";
const LAUNCHER_CLASSES =
  "gb:fixed gb:left-5 gb:bottom-5 gb:z-[99999] gb:px-4 gb:py-2.5 gb:rounded-full gb:border gb:border-[rgba(242,183,80,0.55)] gb:bg-[rgba(20,24,30,0.9)] gb:text-[#f2f4f7] gb:text-[13px] gb:font-bold gb:tracking-[0.04em] gb:uppercase gb:cursor-pointer gb:shadow-[0_12px_35px_rgba(0,0,0,0.3)] gb:hover:border-[rgba(242,183,80,0.9)]";

function ensureContainer() {
  const host = document.body || document.documentElement;
  if (!host) {
    return null;
  }

  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = CONTAINER_ID;
    host.appendChild(container);
  }

  return container;
}

function ensureMountTarget() {
  const container = ensureContainer();
  if (!container) {
    return null;
  }

  let target = document.getElementById(MOUNT_ID);
  if (!target) {
    target = document.createElement("div");
    target.id = MOUNT_ID;
    target.className = `${ROOT_BASE_CLASSES} ${ROOT_HIDDEN_CLASS}`;
    container.appendChild(target);
  }

  return target;
}

function ensureLauncher() {
  const container = ensureContainer();
  if (!container) {
    return null;
  }

  let button = document.getElementById(LAUNCHER_ID);
  if (!button) {
    button = document.createElement("button");
    button.id = LAUNCHER_ID;
    button.type = "button";
    button.className = LAUNCHER_CLASSES;
    button.textContent = "GrepoBot";
    container.appendChild(button);
  }
  return button;
}

function mountApp() {
  if (window.__grepobot_modern_mounted) {
    return true;
  }
  const target = ensureMountTarget();
  if (!target) {
    return false;
  }
  window.__grepobot_modern_mounted = true;
  createRoot(target).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  return true;
}

function initLauncher() {
  const button = ensureLauncher();
  const target = ensureMountTarget();
  if (!button || !target) {
    return false;
  }
  if (!window.__grepobot_modern_launcher_bound) {
    window.__grepobot_modern_launcher_bound = true;
    button.addEventListener("click", () => {
      const isHidden = target.classList.contains(ROOT_HIDDEN_CLASS);
      if (isHidden) {
        target.classList.remove(ROOT_HIDDEN_CLASS);
        target.classList.add(ROOT_VISIBLE_CLASS);
      } else {
        target.classList.add(ROOT_HIDDEN_CLASS);
        target.classList.remove(ROOT_VISIBLE_CLASS);
      }
    });
  }
  return true;
}

let attempts = 0;
const timer = window.setInterval(() => {
  attempts += 1;
  const ready = mountApp() && initLauncher();
  if (ready || attempts >= 240) {
    window.clearInterval(timer);
  }
}, 250);
