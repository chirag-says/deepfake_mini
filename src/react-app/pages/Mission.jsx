import { ArrowRight, Compass, Globe, ShieldCheck, Users } from "lucide-react";
import ParticleBackground from "../components/common/ParticleBackground";
import FloatingCard from "../components/common/FloatingCard";
import Button from "../components/common/Button";
import SiteHeader from "../components/layout/SiteHeader";

const missionHighlights = [
  {
    icon: ShieldCheck,
    title: "Protect information integrity",
    description:
      "We harden organisations against coordinated misinformation by combining human oversight with transparent AI systems.",
  },
  {
    icon: Users,
    title: "Empower analysts and reporters",
    description:
      "Teams investigate faster with workflows designed for collaboration, auditability, and rapid handoffs.",
  },
  {
    icon: Globe,
    title: "Support public trust",
    description:
      "Verified storytelling and responsible distribution keep audiences informed while minimising exposure to deception.",
  },
];

const missionApproach = [
  {
    heading: "Collect signals responsibly",
    body: "We ingest multimodal evidence from text, audio, imagery, and metadata while respecting regional privacy regulations.",
  },
  {
    heading: "Analyse with explainable AI",
    body: "Every score references traceable model reasoning, provenance checks, and bias guardrails that experts can interrogate.",
  },
  {
    heading: "Escalate with context",
    body: "Playbooks, exports, and integrations route findings to the right decision makers without losing investigative nuance.",
  },
];

const impactMetrics = [
  { label: "Investigations accelerated", value: "6x" },
  { label: "False narratives intercepted", value: "82%" },
  { label: "Analyst satisfaction", value: "4.9/5" },
];

export default function MissionPage() {
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
          <section className="max-w-6xl mx-auto pt-12 md:pt-20 space-y-6 text-center">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-200 text-sm tracking-wide">
              <Compass className="w-4 h-4" /> Our mission
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Build a world resilient to misinformation
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
              DeFraudAI exists to restore confidence in the information supply chain. We guide organisations from the first hint of manipulation to a well-documented resolution, empowering stakeholders to make trustworthy decisions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button as="a" href="/register" size="lg" className="w-full sm:w-auto">
                Start verifying <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button as="a" variant="outline" href="/why-choose-us" size="lg" className="w-full sm:w-auto">
                Learn how we deliver
              </Button>
            </div>
          </section>

          <section className="max-w-6xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {missionHighlights.map(({ icon: Icon, title, description }) => (
              <FloatingCard
                key={title}
                className="h-full space-y-4 p-8 border border-blue-500/10 bg-slate-900/60"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-blue-300" />
                </div>
                <h3 className="text-2xl font-semibold text-white">{title}</h3>
                <p className="text-slate-400 leading-relaxed">{description}</p>
              </FloatingCard>
            ))}
          </section>

          <section className="max-w-6xl mx-auto mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <FloatingCard className="lg:col-span-2 p-10 space-y-6 border border-slate-700/40 bg-slate-900/70">
              <h2 className="text-3xl font-bold text-white">How we execute</h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Our methodology blends AI precision with analyst judgment so every action stands up to scrutiny. The loop repeats as new intelligence arrives, ensuring defenders stay ahead of emerging tactics.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {impactMetrics.map((metric) => (
                  <div key={metric.label} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-6 text-center">
                    <p className="text-3xl font-bold text-blue-200">{metric.value}</p>
                    <p className="text-sm text-slate-300 mt-2">{metric.label}</p>
                  </div>
                ))}
              </div>
            </FloatingCard>
            <FloatingCard className="p-10 space-y-5 border border-blue-500/20 bg-blue-950/30">
              <h3 className="text-2xl font-semibold text-white">Mission in practice</h3>
              <ul className="space-y-5 text-slate-200/90">
                {missionApproach.map((item) => (
                  <li key={item.heading}>
                    <p className="font-semibold text-white">{item.heading}</p>
                    <p className="text-sm leading-relaxed mt-2">{item.body}</p>
                  </li>
                ))}
              </ul>
            </FloatingCard>
          </section>
        </main>
      </div>
    </div>
  );
}
