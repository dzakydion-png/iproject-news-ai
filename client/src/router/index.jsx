import { createBrowserRouter, redirect } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Profile from "../pages/Profile";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
    loader: () => {
      // Kalau sudah punya token, tendang ke Home
      if (localStorage.getItem("access_token")) {
        return redirect("/");
      }
      return null;
    },
  },
  {
    path: "/",
    element: <Home />,
    loader: () => {
      // Kalau belum punya token, tendang ke Login
      if (!localStorage.getItem("access_token")) {
        return redirect("/login");
      }
      return null;
    },
  },
  {
    path: "/profile",
    element: <Profile />,
    loader: () =>
      !localStorage.getItem("access_token") ? redirect("/login") : null,
  },
]);

export default router;
