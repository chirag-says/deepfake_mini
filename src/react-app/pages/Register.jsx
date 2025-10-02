import { Navigate } from "react-router-dom";
import { SignUp, SignedIn, SignedOut } from "@clerk/clerk-react";
import ParticleBackground from "../components/common/ParticleBackground";
import FloatingCard from "../components/common/FloatingCard";
import SiteHeader from "../components/layout/SiteHeader";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-indigo-900/20" />
        <ParticleBackground />
      </div>

      <div className="relative z-10">
        <SiteHeader />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
          <SignedIn>
            <Navigate to="/app" replace />
          </SignedIn>

          <SignedOut>
            <FloatingCard className="p-10 border border-blue-500/20 bg-slate-900/70 backdrop-blur-xl">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
                Create your DeFraudAI account
              </h1>
              <p className="text-slate-300 text-base leading-relaxed mb-8 text-center">
                Securely onboard your team and start verifying with confidence.
              </p>
              <div className="rounded-2xl bg-slate-950/70 border border-slate-700/40 p-6">
                <SignUp
                  routing="path"
                  path="/register"
                  signInUrl="/login"
                  afterSignUpUrl="/app"
                  afterSignInUrl="/app"
                  appearance={{
                    elements: {
                      formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                      card: "shadow-2xl border border-slate-700/60 bg-slate-900/70",
                    },
                  }}
                />
              </div>
            </FloatingCard>
          </SignedOut>
        </main>
      </div>
    </div>
  );
}
