import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./shared/context/AuthContext";
import ErrorBoundary from "./shared/components/ErrorBoundary";
import "./index.css";
import App from "./App.jsx";

const rootElement = document.getElementById("root");
console.log("Root element found:", rootElement);

if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
