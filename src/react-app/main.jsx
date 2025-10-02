import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider, ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";
import "./index.css";
import App from "./App.jsx"; // ✅ fixed import

const rootElement = document.getElementById("root");
console.log("Root element found:", rootElement);

if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.error("Missing Clerk publishable key. Please set VITE_CLERK_PUBLISHABLE_KEY in your environment.");

  root.render(
    <StrictMode>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        <div className="max-w-xl space-y-4 text-center">
          <h1 className="text-3xl font-semibold">Clerk configuration required</h1>
          <p className="text-slate-300">
            Add your Clerk publishable key to a <code>.env.local</code> file at the project root:
          </p>
          <pre className="bg-slate-900/80 border border-slate-800 rounded-xl px-5 py-4 text-left overflow-x-auto">
            <code>VITE_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXX</code>
          </pre>
          <p className="text-sm text-slate-400">
            You can find this value in your Clerk dashboard under <strong>API Keys → Publishable key</strong>.
            Restart the dev server after updating the file.
          </p>
        </div>
      </div>
    </StrictMode>
  );

  if (import.meta.env.DEV) {
    console.info("Running in dev mode without Clerk – showing configuration instructions.");
  }
} else {
  root.render(
    <StrictMode>
      <ClerkProvider
        publishableKey={publishableKey}
        signInUrl="/login"
        signUpUrl="/register"
        afterSignInUrl="/app"
        afterSignUpUrl="/app"
        afterSignOutUrl="/"
        clerkJSUrl="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
      >
        <ClerkLoading>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
            <div className="space-y-3 text-center">
              <p className="text-lg font-semibold">Preparing secure auth...</p>
              <p className="text-sm text-slate-400">
                If this takes more than a few seconds, check your internet connection or allow cdn.jsdelivr.net.
              </p>
            </div>
          </div>
        </ClerkLoading>
        <ClerkLoaded>
          <App />
        </ClerkLoaded>
      </ClerkProvider>
    </StrictMode>
  );
}
