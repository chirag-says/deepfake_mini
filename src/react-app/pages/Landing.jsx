import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, Users, Workflow } from "lucide-react";
import ParticleBackground from "../components/common/ParticleBackground";
import FloatingCard from "../components/common/FloatingCard";
import Button from "../components/common/Button";
import SiteHeader from "../components/layout/SiteHeader";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Stand Guard Against Misinformation",
    description:
      "Every investigation starts with integrity. We combine AI verification, fact-checking heuristics, and expert playbooks to keep false narratives from spreading.",
  },
  {
    icon: Workflow,
    title: "Full Investigation Workflow",
    description:
      "Bring content analysis, media authenticity checks, and source intelligence into a single place so teams can move from suspicion to certainty in minutes.",
  },
  {
    icon: Users,
    title: "Built For Trust & Collaboration",
    description:
      "Designed for analysts, journalists, and risk teams who need transparency, audit trails, and context-rich reports they can stand behind.",
  },
];

const differentiators = [
  {
    title: "Cross-Modal Intelligence",
    body: "Text, imagery, and source reputation are processed together to surface corroborated facts and inconsistencies you would otherwise miss.",
  },
  {
    title: "Explainable AI Decisions",
    body: "Every score is backed by highlights, provenance insights, and suggested next steps so stakeholders understand why a decision was made.",
  },
  {
    title: "Operational Ready",
    body: "From newsroom alerts to enterprise escalation flows, DeFraudAI slots into your stack with exports, webhooks, and analyst-ready summaries.",
  },
];

const exclusives = [
  {
    label: "Real-Time Threat Feeds",
    detail: "Continuously updated signals on trending scams and synthetic campaigns to triage what deserves attention first.",
  },
  {
    label: "Adaptive Risk Playbooks",
    detail: "Preset remediation guides that flex to the severity, region, and content type you are investigating.",
  },
  {
    label: "Trust Ops Analytics",
    detail:
      "Dashboards that quantify misinformation exposure and response times so leadership can measure progress.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-indigo-900/20" />
        <ParticleBackground />
      </div>

      <div className="relative z-10">
        <SiteHeader />

        <main className="px-4 sm:px-6 lg:px-8 pb-24">
          <section
            id="mission"
            className="max-w-6xl mx-auto pt-16 md:pt-20 text-center space-y-10"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-200 text-sm tracking-wide">
              <Sparkles className="w-4 h-4" /> Mission First, AI Powered
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
              Decode misinformation. <span className="bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">Restore trust.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
              DeFraudAI gives your organisation a single lens to inspect stories, media, and sources before they impact your audience. Built by analysts, hardened for the speed of modern deception.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Create a Team Workspace
                </Button>
              </Link>
            </div>
          </section>

          <section className="max-w-6xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-8" id="why-us">
            {pillars.map(({ icon: Icon, title, description }) => (
              <FloatingCard key={title} className="h-full space-y-4 p-8 border border-blue-500/10 bg-slate-900/60">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-blue-300" />
                </div>
                <h3 className="text-2xl font-semibold text-white">{title}</h3>
                <p className="text-slate-400 leading-relaxed">{description}</p>
              </FloatingCard>
            ))}
          </section>

          <section className="max-w-6xl mx-auto mt-28 grid grid-cols-1 lg:grid-cols-5 gap-10 items-start" id="differentiators">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Why teams choose DeFraudAI
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                We don't just flag suspicious content—we expose the context behind it. Our analysts-in-the-loop approach means every AI insight is paired with transparent evidence, escalation guidance, and the operational tooling teams need to act.
              </p>
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {differentiators.map((item) => (
                <FloatingCard key={item.title} className="h-full p-6 space-y-3 border border-slate-700/40 bg-slate-900/70">
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.body}</p>
                </FloatingCard>
              ))}
            </div>
          </section>

          <section className="max-w-6xl mx-auto mt-28" id="exclusives">
            <FloatingCard className="p-10 border border-blue-500/20 bg-blue-950/30 backdrop-blur-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Exclusive capabilities you won't find elsewhere
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {exclusives.map((entry) => (
                  <div key={entry.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-white">{entry.label}</h4>
                    <p className="text-sm text-slate-200/80 leading-relaxed">{entry.detail}</p>
                  </div>
                ))}
              </div>
            </FloatingCard>
          </section>

          <section className="max-w-6xl mx-auto mt-28 grid grid-cols-1 lg:grid-cols-2 gap-10" id="cta">
            <FloatingCard className="p-10 border border-slate-700/40 bg-slate-900/70 space-y-6">
              <h2 className="text-3xl font-bold text-white">Ready to immunise your ecosystem?</h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Launch your secured workspace and invite analysts in minutes. Start by signing in to access the verification suite.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <Button size="lg" className="w-full sm:w-auto">
                    Sign in to Continue
                  </Button>
                </Link>
                <Button
                  as="a"
                  href="/mission"
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Explore our mission again
                </Button>
              </div>
            </FloatingCard>
            <FloatingCard className="p-10 border border-blue-500/20 bg-blue-950/30 space-y-5">
              <h3 className="text-2xl font-semibold text-white">
                What happens after you sign in
              </h3>
              <ol className="space-y-4 text-slate-200/90 text-base">
                <li>
                  <span className="font-semibold text-blue-300">1.</span> Personalised dashboard summarises risk exposure and current investigations.
                </li>
                <li>
                  <span className="font-semibold text-blue-300">2.</span> Launch specialised workflows—content analysis, media authenticity checks, or source intelligence.
                </li>
                <li>
                  <span className="font-semibold text-blue-300">3.</span> Collaborate with teammates, export reports, and trigger playbooks to keep stakeholders informed.
                </li>
              </ol>
            </FloatingCard>
          </section>
        </main>
      </div>
    </div>
  );
}
