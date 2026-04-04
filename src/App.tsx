
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { PatientProvider } from "./app/pages/PatientContext";

function App() {
  return (
    <PatientProvider>
      <RouterProvider router={router} />
    </PatientProvider>
  );
}

export default App;