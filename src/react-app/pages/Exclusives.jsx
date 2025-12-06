import { AlarmClock, Cpu, Fingerprint, Link2, Rocket } from "lucide-react";
import ParticleBackground from "../components/common/ParticleBackground";
import FloatingCard from "../components/common/FloatingCard";
import Button from "../components/common/Button";
import SiteHeader from "../components/layout/SiteHeader";

const exclusives = [
  {
    icon: Fingerprint,
    title: "Adaptive risk playbooks",
    description:
      "Scenario-ready workflows adapt to regional regulations and severity so escalation paths remain clear and defensible.",
  },
  {
    icon: Cpu,
    title: "Signal fusion engine",
    description:
      "Custom models blend OSINT signals, proprietary datasets, and analyst labels to surface the highest-fidelity alerts first.",
  },
  {
    icon: Link2,
    title: "Source reputation graph",
    description:
      "Dynamic mapping of accounts, domains, and distributors traces how narratives spread across channels in real time.",
  },
];

const deliveryOptions = [
  {
    heading: "API and webhooks",
    detail: "Integrate live findings into your case management and collaboration tools without leaving your workspace.",
  },
  {
    heading: "Analyst services",
    detail: "Tap into DeFraudAI specialists for red-teaming, workflow design, and training tailored to your organisation.",
  },
  {
    heading: "Executive dashboards",
    detail: "Give leadership an at-a-glance view of misinformation exposure, response velocity, and remediation progress.",
  },
];

const quickStats = [
  { label: "Incidents triaged automatically", value: "68%" },
  { label: "Integrations available", value: "30+" },
  { label: "Response time reduction", value: "45%" },
];

export default function ExclusivesPage() {
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
              Exclusive capabilities
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Go beyond point solutions with DeFraudAI exclusives
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
              The misinformation landscape evolves daily. Our premium features compress detection, adjudication, and reporting into a single mission control—built for teams that cannot afford guesswork.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button as="a" href="/register" size="lg" className="w-full sm:w-auto">
                Request a walkthrough
              </Button>
              <Button as="a" variant="outline" href="/mission" size="lg" className="w-full sm:w-auto">
                Revisit our mission
              </Button>
            </div>
          </section>

          <section className="max-w-6xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {exclusives.map(({ icon: Icon, title, description }) => (
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
              <h2 className="text-3xl font-bold text-white">How exclusives ship value</h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Each capability is crafted with frontline teams so you can scale truth verification across regions, languages, and crisis scenarios without stitching together tools yourself.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickStats.map((stat) => (
                  <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-6 text-center">
                    <p className="text-3xl font-bold text-blue-200">{stat.value}</p>
                    <p className="text-sm text-slate-300 mt-2">{stat.label}</p>
                  </div>
                ))}
              </div>
            </FloatingCard>
            <FloatingCard className="p-10 space-y-5 border border-blue-500/20 bg-blue-950/30">
              <h3 className="text-2xl font-semibold text-white">Engagement options</h3>
              <ul className="space-y-5 text-slate-200/90">
                {deliveryOptions.map((option) => (
                  <li key={option.heading}>
                    <p className="font-semibold text-white">{option.heading}</p>
                    <p className="text-sm leading-relaxed mt-2">{option.detail}</p>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3 text-blue-200 pt-2">
                <AlarmClock className="w-5 h-5" />
                <span className="text-sm">Deployment timelines measured in weeks, not quarters.</span>
              </div>
              <div className="flex items-center gap-3 text-blue-200">
                <Rocket className="w-5 h-5" />
                <span className="text-sm">Customer success partners keep your playbooks evolving with the threat landscape.</span>
              </div>
            </FloatingCard>
          </section>
        </main>
      </div>
    </div>
  );
}
