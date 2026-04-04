
import { createBrowserRouter } from "react-router";
import { HomePage } from "./app/pages/HomePage";
import { AssessmentPage } from "./app/pages/AssessmentPage";
import { ParametersPage } from "./app/pages/ParametersPage";
import { ResultsPage } from "./app/pages/ResultsPage";
import { HistoryPage } from "./app/pages/HistoryPage"; // Tambahan

export const router = createBrowserRouter([
  { path: "/", Component: HomePage },
  { path: "/assessment", Component: AssessmentPage },
  { path: "/parameters", Component: ParametersPage },
  { path: "/results", Component: ResultsPage },
  { path: "/history", Component: HistoryPage }, // Tambahkan sini
]);