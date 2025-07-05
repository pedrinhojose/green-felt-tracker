
import { BrowserRouter } from "react-router-dom";
import AppProviders from "@/components/providers/AppProviders";
import AppRoutes from "@/components/routing/AppRoutes";

const App = () => {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
};

export default App;
