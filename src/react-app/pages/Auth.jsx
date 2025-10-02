import { Navigate } from "react-router-dom";
import {
  SignIn,
  SignedIn,
  SignedOut,
  SignUpButton,
} from "@clerk/clerk-react";
import ParticleBackground from "../components/common/ParticleBackground";
import FloatingCard from "../components/common/FloatingCard";
import Button from "../components/common/Button";
import SiteHeader from "../components/layout/SiteHeader";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-indigo-900/20" />
        <ParticleBackground />
      </div>

      <div className="relative z-10">
        <SiteHeader />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
          <SignedIn>
            <Navigate to="/app" replace />
          </SignedIn>

          <SignedOut>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
              <FloatingCard className="lg:col-span-3 p-10 border border-blue-500/20 bg-slate-900/70 backdrop-blur-xl">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Sign in to your DeFraudAI workspace
                </h1>
                <p className="text-slate-300 text-base leading-relaxed mb-8">
                  Continue where you left off, resume investigations, and collaborate with your team in real time.
                </p>
                <div className="rounded-2xl bg-slate-950/70 border border-slate-700/40 p-6">
                  <SignIn
                    routing="path"
                    signUpUrl="/register"
                    path="/login"
                    afterSignInUrl="/app"
                    afterSignUpUrl="/app"
                    appearance={{
                      elements: {
                        formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                        card: "shadow-2xl border border-slate-700/60 bg-slate-900/70",
                      },
                    }}
                  />
                </div>
                <div className="mt-6 text-sm text-slate-400">
                  No account yet?
                  <span className="inline-flex ml-2">
                    <SignUpButton mode="modal" afterSignUpUrl="/app" afterSignInUrl="/app">
                      <Button variant="outline" size="sm">
                        Create an account
                      </Button>
                    </SignUpButton>
                  </span>
                </div>
              </FloatingCard>

              <FloatingCard className="lg:col-span-2 p-10 border border-slate-700/40 bg-slate-900/60 space-y-6">
                <h2 className="text-2xl font-semibold text-white">
                  What you unlock after signing in
                </h2>
                <ul className="space-y-4 text-slate-300 text-base">
                  <li>
                    <span className="font-semibold text-blue-300">•</span> Unified workspace for long-form content checks, media analysis, and source credibility.
                  </li>
                  <li>
                    <span className="font-semibold text-blue-300">•</span> Saved investigations and evidence packs that keep your team aligned.
                  </li>
                  <li>
                    <span className="font-semibold text-blue-300">•</span> Risk dashboards showing momentum, exposure, and recommended next steps.
                  </li>
                </ul>
              </FloatingCard>
            </div>
          </SignedOut>
        </main>
      </div>
    </div>
  );
}
