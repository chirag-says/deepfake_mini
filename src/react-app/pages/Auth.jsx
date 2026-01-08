import { useState } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../shared/context/AuthContext";
import ParticleBackground from "../components/common/ParticleBackground";
import FloatingCard from "../components/common/FloatingCard";
import Button from "../components/common/Button";
import SiteHeader from "../components/layout/SiteHeader";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

export default function AuthPage() {
  const { isLoggedIn, login, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const from = location.state?.from || "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  if (isLoggedIn) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
    }
    // If successful, the auth state will update and redirect will happen
  };

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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
            <FloatingCard className="lg:col-span-3 p-10 border border-blue-500/20 bg-slate-900/70 backdrop-blur-xl">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Sign in to your DeFraudAI workspace
              </h1>
              <p className="text-slate-300 text-base leading-relaxed mb-8">
                Continue where you left off, resume investigations, and collaborate with your team in real time.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/70 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/70 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting || authLoading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-sm text-slate-400 text-center">
                No account yet?{" "}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                  Create an account
                </Link>
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
        </main>
      </div>
    </div>
  );
}
