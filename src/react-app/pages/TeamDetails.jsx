import SiteHeader from "../components/layout/SiteHeader";
import ParticleBackground from "../components/common/ParticleBackground";
import FloatingCard from "../components/common/FloatingCard";
import Button from "../components/common/Button";
import {
  Brain,
  Github,
  Globe,
  Linkedin,
  Shield,
  Sparkles,
  Users,
  Code,
  Rocket,
} from "lucide-react";

const teamMembers = [
  {
    name: "Chirag",
    role: "Founder & Lead Developer",
    bio: "Full-stack engineer and AI enthusiast building cutting-edge solutions at OpScores. Specializes in deepfake detection, computer vision, and scalable web applications.",
    focus: "AI/ML • Full Stack • Computer Vision",
    socials: {
      linkedin: "https://linkedin.com/in/chirag-says",
      github: "https://github.com/chirag-says",
      website: "https://opscores.in",
    },
  },
];

const values = [
  {
    icon: Shield,
    title: "Safety-First AI",
    description:
      "We champion responsible AI usage with human oversight and transparent guardrails to combat misinformation.",
  },
  {
    icon: Brain,
    title: "Research-Grade Tech",
    description:
      "Our detectors combine academic-grade rigor with enterprise readiness for real-world deployment.",
  },
  {
    icon: Code,
    title: "Engineering Excellence",
    description:
      "Every line of code is crafted for performance, security, and maintainability at scale.",
  },
];

const companyHighlights = [
  {
    icon: Rocket,
    title: "Built by OpScores",
    description:
      "DeFraudAI is developed and maintained by OpScores, a premium software engineering studio building the internet's future.",
  },
  {
    icon: Globe,
    title: "Global Impact",
    description:
      "Serving users worldwide with AI-powered tools to detect deepfakes, synthetic media, and misinformation.",
  },
  {
    icon: Users,
    title: "Open Collaboration",
    description:
      "We partner with journalists, researchers, and organizations committed to truth and transparency.",
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
                A Product by OpScores
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                About DeFraudAI
              </h1>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto">
                AI-powered deepfake detection and misinformation analysis platform,
                built by OpScores to protect truth in the digital age.
              </p>
            </div>

            {/* Founder Section */}
            <FloatingCard className="mb-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">C</span>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {teamMembers[0].name}
                  </h2>
                  <p className="text-emerald-300 mb-4">{teamMembers[0].role}</p>
                  <p className="text-slate-300 mb-4">{teamMembers[0].bio}</p>
                  <p className="text-sm text-slate-400 mb-6">{teamMembers[0].focus}</p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Button
                      as="a"
                      variant="outline"
                      size="sm"
                      href={teamMembers[0].socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                    </Button>
                    <Button
                      as="a"
                      variant="outline"
                      size="sm"
                      href={teamMembers[0].socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="w-4 h-4 mr-2" /> GitHub
                    </Button>
                    <Button
                      as="a"
                      size="sm"
                      href={teamMembers[0].socials.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="w-4 h-4 mr-2" /> OpScores
                    </Button>
                  </div>
                </div>
              </div>
            </FloatingCard>

            {/* Company Highlights */}
            <FloatingCard className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Why DeFraudAI?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {companyHighlights.map((highlight) => (
                  <div
                    key={highlight.title}
                    className="bg-slate-900/60 border border-slate-700/40 rounded-3xl p-6"
                  >
                    <highlight.icon className="w-6 h-6 text-emerald-300 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {highlight.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {highlight.description}
                    </p>
                  </div>
                ))}
              </div>
            </FloatingCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <FloatingCard>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Our Mission
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  We build practical AI-driven defenses against deepfakes and
                  synthetic propaganda. DeFraudAI combines advanced detection
                  models with intuitive interfaces, empowering everyone from
                  journalists to everyday users to verify content authenticity
                  and fight misinformation.
                </p>
              </FloatingCard>
              <FloatingCard>
                <h2 className="text-2xl font-bold text-white mb-6">
                  About OpScores
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  OpScores is a premium software engineering studio that builds
                  the impossible. From full-stack applications to AI/ML systems,
                  cloud infrastructure, and IoT solutions — we engineer products
                  that shape tomorrow. DeFraudAI is one of our flagship projects
                  in the AI safety space.
                </p>
              </FloatingCard>
            </div>

            <FloatingCard className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">
                Our Principles
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
              <div className="text-center py-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Get In Touch
                </h2>
                <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                  Interested in partnering, contributing research, or learning more
                  about our AI detection capabilities? We'd love to hear from you.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button as="a" href="mailto:hello@opscores.in">
                    <Users className="w-4 h-4 mr-2" /> Contact Us
                  </Button>
                  <Button as="a" variant="outline" href="https://opscores.in" target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" /> Visit OpScores
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
