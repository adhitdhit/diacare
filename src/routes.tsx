import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "./app/pages/HomePage";
import { AssessmentPage } from "./app/pages/AssessmentPage";
import { ParametersPage } from "./app/pages/ParametersPage";
import { ResultsPage } from "./app/pages/ResultsPage";
import { HistoryPage } from "./app/pages/HistoryPage";


import { HospitalsPage } from "./app/pages/HospitalsPage";
import { EducationPage } from "./app/pages/EducationPage";
import { AboutPage } from "./app/pages/AboutPage";

export const router = createBrowserRouter([
  { path: "/", Component: HomePage },
  { path: "/assessment", Component: AssessmentPage },
  { path: "/parameters", Component: ParametersPage },
  { path: "/results", Component: ResultsPage },
  { path: "/history", Component: HistoryPage },
  

  { path: "/hospitals", Component: HospitalsPage },
  { path: "/education", Component: EducationPage },
  { path: "/about", Component: AboutPage },
]);