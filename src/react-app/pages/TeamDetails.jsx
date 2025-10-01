import SiteHeader from "../components/layout/SiteHeader";
import ParticleBackground from "../components/common/ParticleBackground";
import FloatingCard from "../components/common/FloatingCard";
import Button from "../components/common/Button";
import {
  Brain,
  Github,
  GraduationCap,
  Linkedin,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

const teamMembers = [
  {
    name: "Chirag",
    role: "Deepfake Research Lead",
    bio: "Specializes in generative model detection and adversarial robustness for visual misinformation.",
    focus: "Computer Vision & ML Security",
    socials: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
    },
  },
  {
    name: "Hari Kishan K R",
    role: "OSINT Intelligence Analyst",
    bio: "Builds cross-platform signal aggregation pipelines to detect emerging misinformation campaigns.",
    focus: "Narrative Intelligence & OSINT",
    socials: {
      linkedin: "https://linkedin.com",
    },
  },
  {
    name: "Abhishek Kumar",
    role: "Applied ML Engineer",
    bio: "Leads model deployment, evaluation, and safety guardrails for hybrid AI-human verification workflows.",
    focus: "ML Systems & Safety",
    socials: {
      github: "https://github.com",
    },
  },
];

const values = [
  {
    icon: Shield,
    title: "Safety-first",
    description:
      "We champion responsible AI usage with human oversight and transparent guardrails.",
  },
  {
    icon: Brain,
    title: "Research-grade",
    description:
      "Our detectors combine academic-grade rigor with enterprise readiness.",
  },
  {
    icon: Users,
    title: "Collaborative",
    description:
      "We partner with journalists, investigators, and civic organizations worldwide.",
  },
];

const advisors = [
  {
    name: "Jitin Raju",
    expertise: "Neural Media Forensics",
    affiliation: "Artia Institute Of Technology",
  },
  {
    name: "Mayank Kumar",
    expertise: "Disinformation Response",
    affiliation: "Atria Institute Of Technology",
  },
  {
    name: "Chirag",
    expertise: "Responsible AI Governance",
    affiliation: "Atria Institute Of Technology",
  },
];

export default function TeamDetails() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/10 via-transparent to-indigo-900/20" />
        <ParticleBackground />
      </div>

      <div className="relative z-10">
        <SiteHeader />

        <main className="px-4 sm:px-6 lg:px-8 pb-24">
          <section className="max-w-6xl mx-auto pt-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Humans behind DeFraudAI
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Meet the Verification Crew
              </h1>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto">
                An interdisciplinary team of researchers, analysts, and
                engineers uniting to combat synthetic misinformation at scale.
              </p>
            </div>

            <FloatingCard className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="bg-slate-900/60 border border-slate-700/40 rounded-3xl p-6 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {member.name}
                      </h2>
                      <p className="text-sm text-emerald-300/90">
                        {member.role}
                      </p>
                    </div>
                    <GraduationCap className="w-6 h-6 text-emerald-300/70" />
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {member.bio}
                  </p>
                  <div className="text-xs uppercase tracking-widest text-slate-500 mb-4">
                    Focus
                  </div>
                  <p className="text-sm text-slate-200 mb-4">{member.focus}</p>
                  <div className="mt-auto flex gap-3">
                    {member.socials.linkedin && (
                      <Button
                        as="a"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        href={member.socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                      </Button>
                    )}
                    {member.socials.github && (
                      <Button
                        as="a"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        href={member.socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-4 h-4 mr-2" /> GitHub
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </FloatingCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <FloatingCard>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Our Mission
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  We build practical AI-driven defenses against deepfakes and
                  synthetic propaganda. DeFraudAI combines advanced detection
                  models with human-trusted workflows, empowering investigative
                  teams to expose manipulation, confirm source integrity, and
                  share ground-truth faster.
                </p>
              </FloatingCard>
              <FloatingCard>
                <h2 className="text-2xl font-bold text-white mb-6">
                  How We Operate
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Our research squad deploys continuous model evaluations while
                  the intelligence unit tracks disinformation campaigns across
                  networks. Engineering weaves findings into resilient tooling,
                  ensuring our partners can act on high-confidence signals with
                  clear provenance.
                </p>
              </FloatingCard>
            </div>

            <FloatingCard className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">
                Principles We Live By
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {values.map((value) => (
                  <div
                    key={value.title}
                    className="bg-slate-900/60 border border-slate-700/40 rounded-3xl p-6"
                  >
                    <value.icon className="w-6 h-6 text-emerald-300 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </FloatingCard>

            <FloatingCard>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Sparkles className="w-6 h-6 text-emerald-300 mr-3" />{" "}
                    Advisory Network
                  </h2>
                  <div className="space-y-4">
                    {advisors.map((advisor) => (
                      <div
                        key={advisor.name}
                        className="bg-slate-900/60 border border-slate-700/30 rounded-3xl p-5"
                      >
                        <div className="text-sm text-emerald-300/80 uppercase tracking-wide mb-1">
                          {advisor.expertise}
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {advisor.name}
                        </div>
                        <div className="text-sm text-slate-400">
                          {advisor.affiliation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/30 rounded-3xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Join Our Coalition
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    We collaborate with newsrooms, digital forensic labs, civic
                    watchdogs, and platform trust teams. Interested in
                    partnering or contributing research? Reach out and
                    let&apos;s align on impact.
                  </p>
                  <Button as="a" href="mailto:hello@defraud.ai">
                    <Users className="w-4 h-4 mr-2" /> Partner with Us
                  </Button>
                </div>
              </div>
            </FloatingCard>
          </section>
        </main>
      </div>
    </div>
  );
}
