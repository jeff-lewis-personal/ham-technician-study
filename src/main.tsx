import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import { initSync } from "./lib/sync";
import HomePage from "./routes/HomePage";
import StudyPage from "./routes/StudyPage";
import PracticePage from "./routes/PracticePage";
import ProgressPage from "./routes/ProgressPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "study", element: <StudyPage /> },
      { path: "study/:group", element: <StudyPage /> },
      { path: "practice", element: <PracticePage /> },
      { path: "progress", element: <ProgressPage /> },
    ],
  },
]);

initSync();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
