import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import  SignalContext  from "./context/SignalContext.jsx";

createRoot(document.getElementById("root")).render(
  <SignalContext>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SignalContext>
);
