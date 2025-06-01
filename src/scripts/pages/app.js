import { getAccessToken, getLogout } from "../utils/auth";
import {
  generateAuthenticatedNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
} from "../template";
import {
  isServiceWorkerAvailable,
  setupSkipToContent,
  transitionHelper,
} from "../utils";
import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from "../utils/notification-helper";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #skipLinkButton = null;

  constructor({ navigationDrawer, drawerButton, content, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#skipLinkButton = skipLinkButton;

    this._init();
  }

  _init() {
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  _setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navList = this.#navigationDrawer.children.namedItem("nav-list");

    if (!isLogin) {
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();

      if (confirm("Apakah Anda yakin ingin keluar?")) {
        getLogout();

        location.hash = "/login";
      }
    });
  }

  async _setupPushNotification() {
    const pushNotificationTools = document.getElementById(
      "push-notification-tools",
    );
    if (!pushNotificationTools) return;

    try {
      const isSubscribed = await isCurrentPushSubscriptionAvailable();

      if (isSubscribed) {
        pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
        document
          .getElementById("unsubscribe-button")
          .addEventListener("click", () => {
            unsubscribe().finally(() => {
              this._setupPushNotification();
            });
          });

        return;
      }

      pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
      document
        .getElementById("subscribe-button")
        .addEventListener("click", () => {
          subscribe().finally(() => {
            this._setupPushNotification();
          });
        });
    } catch (error) {
      console.error("setupPushNotification:", error);
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url];

    if (!route || typeof route != "function") {
      this.#content.innerHTML = "<p>Halaman tidak ditemukan.</p>";
      return;
    }

    const page = route();

    if (!page || typeof page.render !== "function") return;

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        page.afterRender();
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: "instant" });
      this._setupNavigationList();

      if (isServiceWorkerAvailable()) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            this._setupPushNotification();
          }, 100);
        });
      }
    });
  }
}

export default App;
