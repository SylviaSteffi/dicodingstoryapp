import RegisterPage from "../pages/auth/register/register-page";
import LoginPage from "../pages/auth/login/login-page";
import HomePage from "../pages/home/home-page";
import AddStoryPage from "../pages/add-story/add-story-page";
import {
  checkUnauthenticatedRouteOnly,
  checkAuthenticatedRoute,
} from "../utils/auth";
import BookmarkPage from "../pages/bookmark/bookmark-page";

const routes = {
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/new": () => checkAuthenticatedRoute(new AddStoryPage()),
  "/bookmark": () => checkAuthenticatedRoute(new BookmarkPage()),
};

export default routes;
