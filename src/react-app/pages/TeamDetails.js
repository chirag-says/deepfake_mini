import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
      linkedin: "https://www.linkedin.com/in/chirag-baldia",
      github: "https://github.com/chirag-says",
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
    affiliation: "MIT Media Lab",
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
  return _jsxs("div", {
    className:
      "min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden",
    children: [
      _jsxs("div", {
        className: "fixed inset-0 z-0",
        children: [
          _jsx("div", {
            className:
              "absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          }),
          _jsx("div", {
            className:
              "absolute inset-0 bg-gradient-to-tr from-purple-900/10 via-transparent to-indigo-900/20",
          }),
          _jsx(ParticleBackground, {}),
        ],
      }),
      _jsxs("div", {
        className: "relative z-10",
        children: [
          _jsx(SiteHeader, {}),
          _jsx("main", {
            className: "px-4 sm:px-6 lg:px-8 pb-24",
            children: _jsxs("section", {
              className: "max-w-6xl mx-auto pt-10",
              children: [
                _jsxs("div", {
                  className: "text-center mb-16",
                  children: [
                    _jsxs("div", {
                      className:
                        "inline-flex items-center px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm mb-6",
                      children: [
                        _jsx(Sparkles, { className: "w-4 h-4 mr-2" }),
                        "Humans behind DeFraudAI",
                      ],
                    }),
                    _jsx("h1", {
                      className:
                        "text-4xl md:text-5xl font-bold text-white mb-4",
                      children: "Meet the Verification Crew",
                    }),
                    _jsx("p", {
                      className: "text-lg text-slate-300 max-w-3xl mx-auto",
                      children:
                        "An interdisciplinary team of researchers, analysts, and engineers uniting to combat synthetic misinformation at scale.",
                    }),
                  ],
                }),
                _jsx(FloatingCard, {
                  className: "mb-12 grid grid-cols-1 md:grid-cols-3 gap-6",
                  children: teamMembers.map((member) =>
                    _jsxs(
                      "div",
                      {
                        className:
                          "bg-slate-900/60 border border-slate-700/40 rounded-3xl p-6 flex flex-col",
                        children: [
                          _jsxs("div", {
                            className: "flex items-center justify-between mb-4",
                            children: [
                              _jsxs("div", {
                                children: [
                                  _jsx("h2", {
                                    className:
                                      "text-xl font-semibold text-white",
                                    children: member.name,
                                  }),
                                  _jsx("p", {
                                    className: "text-sm text-emerald-300/90",
                                    children: member.role,
                                  }),
                                ],
                              }),
                              _jsx(GraduationCap, {
                                className: "w-6 h-6 text-emerald-300/70",
                              }),
                            ],
                          }),
                          _jsx("p", {
                            className:
                              "text-sm text-slate-300 leading-relaxed mb-4",
                            children: member.bio,
                          }),
                          _jsx("div", {
                            className:
                              "text-xs uppercase tracking-widest text-slate-500 mb-4",
                            children: "Focus",
                          }),
                          _jsx("p", {
                            className: "text-sm text-slate-200 mb-4",
                            children: member.focus,
                          }),
                          _jsxs("div", {
                            className: "mt-auto flex gap-3",
                            children: [
                              member.socials.linkedin &&
                                _jsxs(Button, {
                                  as: "a",
                                  variant: "outline",
                                  size: "sm",
                                  className: "flex-1",
                                  href: member.socials.linkedin,
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                  children: [
                                    _jsx(Linkedin, {
                                      className: "w-4 h-4 mr-2",
                                    }),
                                    " LinkedIn",
                                  ],
                                }),
                              member.socials.github &&
                                _jsxs(Button, {
                                  as: "a",
                                  variant: "outline",
                                  size: "sm",
                                  className: "flex-1",
                                  href: member.socials.github,
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                  children: [
                                    _jsx(Github, { className: "w-4 h-4 mr-2" }),
                                    " GitHub",
                                  ],
                                }),
                            ],
                          }),
                        ],
                      },
                      member.name
                    )
                  ),
                }),
                _jsxs("div", {
                  className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-12",
                  children: [
                    _jsxs(FloatingCard, {
                      children: [
                        _jsx("h2", {
                          className: "text-2xl font-bold text-white mb-6",
                          children: "Our Mission",
                        }),
                        _jsx("p", {
                          className: "text-slate-300 text-sm leading-relaxed",
                          children:
                            "We build practical AI-driven defenses against deepfakes and synthetic propaganda. DeFraudAI combines advanced detection models with human-trusted workflows, empowering investigative teams to expose manipulation, confirm source integrity, and share ground-truth faster.",
                        }),
                      ],
                    }),
                    _jsxs(FloatingCard, {
                      children: [
                        _jsx("h2", {
                          className: "text-2xl font-bold text-white mb-6",
                          children: "How We Operate",
                        }),
                        _jsx("p", {
                          className: "text-slate-300 text-sm leading-relaxed",
                          children:
                            "Our research squad deploys continuous model evaluations while the intelligence unit tracks disinformation campaigns across networks. Engineering weaves findings into resilient tooling, ensuring our partners can act on high-confidence signals with clear provenance.",
                        }),
                      ],
                    }),
                  ],
                }),
                _jsxs(FloatingCard, {
                  className: "mb-12",
                  children: [
                    _jsx("h2", {
                      className: "text-2xl font-bold text-white mb-6",
                      children: "Principles We Live By",
                    }),
                    _jsx("div", {
                      className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                      children: values.map((value) =>
                        _jsxs(
                          "div",
                          {
                            className:
                              "bg-slate-900/60 border border-slate-700/40 rounded-3xl p-6",
                            children: [
                              _jsx(value.icon, {
                                className: "w-6 h-6 text-emerald-300 mb-4",
                              }),
                              _jsx("h3", {
                                className:
                                  "text-lg font-semibold text-white mb-2",
                                children: value.title,
                              }),
                              _jsx("p", {
                                className: "text-sm text-slate-400",
                                children: value.description,
                              }),
                            ],
                          },
                          value.title
                        )
                      ),
                    }),
                  ],
                }),
                _jsx(FloatingCard, {
                  children: _jsxs("div", {
                    className: "grid grid-cols-1 md:grid-cols-2 gap-10",
                    children: [
                      _jsxs("div", {
                        children: [
                          _jsxs("h2", {
                            className:
                              "text-2xl font-bold text-white mb-6 flex items-center",
                            children: [
                              _jsx(Sparkles, {
                                className: "w-6 h-6 text-emerald-300 mr-3",
                              }),
                              " Advisory Network",
                            ],
                          }),
                          _jsx("div", {
                            className: "space-y-4",
                            children: advisors.map((advisor) =>
                              _jsxs(
                                "div",
                                {
                                  className:
                                    "bg-slate-900/60 border border-slate-700/30 rounded-3xl p-5",
                                  children: [
                                    _jsx("div", {
                                      className:
                                        "text-sm text-emerald-300/80 uppercase tracking-wide mb-1",
                                      children: advisor.expertise,
                                    }),
                                    _jsx("div", {
                                      className:
                                        "text-lg font-semibold text-white",
                                      children: advisor.name,
                                    }),
                                    _jsx("div", {
                                      className: "text-sm text-slate-400",
                                      children: advisor.affiliation,
                                    }),
                                  ],
                                },
                                advisor.name
                              )
                            ),
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        className:
                          "bg-slate-900/50 border border-slate-700/30 rounded-3xl p-6",
                        children: [
                          _jsx("h3", {
                            className: "text-lg font-semibold text-white mb-4",
                            children: "Join Our Coalition",
                          }),
                          _jsx("p", {
                            className:
                              "text-sm text-slate-300 leading-relaxed mb-6",
                            children:
                              "We collaborate with newsrooms, digital forensic labs, civic watchdogs, and platform trust teams. Interested in partnering or contributing research? Reach out and let's align on impact.",
                          }),
                          _jsxs(Button, {
                            as: "a",
                            href: "mailto:hello@defraud.ai",
                            children: [
                              _jsx(Users, { className: "w-4 h-4 mr-2" }),
                              " Partner with Us",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              ],
            }),
          }),
        ],
      }),
    ],
  });
}
