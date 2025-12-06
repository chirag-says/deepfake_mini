import { CheckCircle2, RadioTower, Shield, Workflow } from "lucide-react";
import ParticleBackground from "../components/common/ParticleBackground";
import FloatingCard from "../components/common/FloatingCard";
import Button from "../components/common/Button";
import SiteHeader from "../components/layout/SiteHeader";

const differentiators = [
  {
    title: "Cross-modal analysis",
    description:
      "Video, imagery, transcripts, and source metadata are examined together so investigators see the full context behind every claim.",
  },
  {
    title: "Explainable outcomes",
    description:
      "Every trust score includes evidence snippets, provenance traces, and recommended next steps that stakeholders can audit.",
  },
  {
    title: "Operational fit",
    description:
      "API access, exports, and collaboration tools connect DeFraudAI with newsroom, compliance, and crisis response workflows.",
  },
];

const assurancePillars = [
  {
    icon: Shield,
    heading: "Security at the core",
    body: "Role-based access controls, audit logging, and regional data residency keep your investigations compliant by design.",
  },
  {
    icon: RadioTower,
    heading: "Threat intelligence",
    body: "Live feeds on emerging campaigns help you prioritise attention on escalating narratives before they crest.",
  },
  {
    icon: Workflow,
    heading: "Process acceleration",
    body: "Guided workflows reduce handoffs and manual steps so analysts focus on judgment instead of busywork.",
  },
];

const trustChecklist = [
  "Analyst-ready reporting with full provenance",
  "Configurable playbooks for crisis response",
  "Continuous model evaluation against new threats",
  "Secure collaboration spaces for internal and external teams",
];

export default function WhyChooseUsPage() {
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
              Why DeFraudAI
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Built for teams who need evidence-backed answers
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
              We designed DeFraudAI with investigative reporters, trust and safety analysts, and risk operatives. The platform couples explainable AI with automation so you can spot complex manipulation without losing transparency.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button as="a" href="/exclusives" size="lg" className="w-full sm:w-auto">
                Explore exclusives
              </Button>
              <Button as="a" variant="outline" href="/register" size="lg" className="w-full sm:w-auto">
                Talk with our team
              </Button>
            </div>
          </section>

          <section className="max-w-6xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {differentiators.map((item) => (
              <FloatingCard
                key={item.title}
                className="h-full space-y-4 p-8 border border-blue-500/10 bg-slate-900/60"
              >
                <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.description}</p>
              </FloatingCard>
            ))}
          </section>

          <section className="max-w-6xl mx-auto mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {assurancePillars.map(({ icon: Icon, heading, body }) => (
              <FloatingCard
                key={heading}
                className="h-full space-y-4 p-8 border border-slate-700/40 bg-slate-900/70"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">{heading}</h3>
                <p className="text-slate-400 leading-relaxed">{body}</p>
              </FloatingCard>
            ))}
          </section>

          <section className="max-w-4xl mx-auto mt-24">
            <FloatingCard className="p-10 border border-blue-500/20 bg-blue-950/30">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                Trust checklist
              </h2>
              <ul className="space-y-4 text-slate-200/90">
                {trustChecklist.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-300 flex-shrink-0 mt-1" />
                    <span className="text-base leading-relaxed">{item}</span>
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
