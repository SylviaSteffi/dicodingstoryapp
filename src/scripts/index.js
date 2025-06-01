import "../styles/styles.css";
import App from "./pages/app";
import { registerServiceWorker } from "./utils";

document.addEventListener("DOMContentLoaded", async () => {
  await registerServiceWorker();

  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
    skipLinkButton: document.getElementById("skip-link"),
  });
  app._setupNavigationList();
  await app.renderPage();

  await registerServiceWorker();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});
