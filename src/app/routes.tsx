import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { AssessmentPage } from "./pages/AssessmentPage";
import { ParametersPage } from "./pages/ParametersPage";
import { ResultsPage } from "./pages/ResultsPage";


import { HistoryPage } from "./pages/HistoryPage"; // baru

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/assessment",
    Component: AssessmentPage,
  },
  {
    path: "/parameters",
    Component: ParametersPage,
  },
  {
    path: "/results",
    Component: ResultsPage,
  },

  {
    path: "/history",       // route baru
    Component: HistoryPage,
  },
]);
