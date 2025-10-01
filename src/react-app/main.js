import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx"; // ✅ fixed import
const root = document.getElementById("root");
console.log("Root element found:", root);
if (!root)
    throw new Error("Root element not found");
createRoot(root).render(_jsx(StrictMode, { children: _jsx(App, {}) }));
