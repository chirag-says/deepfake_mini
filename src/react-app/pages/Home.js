import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowRight, CheckCircle, Globe, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/layout/SiteHeader";
import ParticleBackground from "../components/common/ParticleBackground";
import FloatingCard from "../components/common/FloatingCard";
import Button from "../components/common/Button";
import TechNewsSection from "../components/TechNewsSection";
const featureCards = [
    {
        title: "Deep Fact Analysis",
        description: "Run long-form articles and posts through our AI pipeline for instant credibility scoring and contextual fact checks.",
        href: "/analysis",
        icon: Zap,
    },
    {
        title: "Media Authenticity",
        description: "Upload images to detect deepfakes, compositing artifacts, and metadata anomalies in seconds.",
        href: "/media-authenticity",
        icon: Shield,
    },
    {
        title: "Source Intelligence",
        description: "Assess the history, footprint, and reputation of any publisher to understand their trust posture.",
        href: "/source-intelligence",
        icon: Globe,
    },
];
const stats = [
    { label: "Accuracy Rate", value: "99.2%", icon: CheckCircle },
    { label: "Content Verified", value: "2M+", icon: Shield },
    { label: "Sources Analyzed", value: "50K+", icon: Globe },
];
export default function Home() {
    return (_jsxs("div", { className: "min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden", children: [_jsxs("div", { className: "fixed inset-0 z-0", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-indigo-900/10" }), _jsx("div", { className: "absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" }), _jsx(ParticleBackground, {})] }), _jsxs("div", { className: "relative z-10", children: [_jsx(SiteHeader, {}), _jsxs("main", { children: [_jsx("section", { className: "relative py-28 px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "max-w-6xl mx-auto text-center", children: [_jsxs("div", { className: "inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-300 rounded-full text-sm font-medium mb-10 backdrop-blur-sm border border-blue-500/20 shadow-xl", children: [_jsx(Shield, { className: "w-4 h-4 mr-2" }), "Protecting truth in the age of AI deception"] }), _jsxs("h1", { className: "text-5xl md:text-7xl font-bold text-white leading-tight mb-8", children: ["Verify Truth.", " ", _jsx("span", { className: "bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent", children: "Defeat Deception." })] }), _jsx("p", { className: "text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-12", children: "DeFraudAI unifies deepfake detection, source intelligence, and content analysis into one workflow so you can make instant, informed decisions before misinformation spreads." }), _jsxs("div", { className: "flex flex-col sm:flex-row justify-center gap-6", children: [_jsxs(Button, { as: Link, to: "/analysis", size: "xl", className: "shadow-2xl shadow-blue-500/25", children: [_jsx(Zap, { className: "mr-3 w-6 h-6" }), "Start Verifying"] }), _jsxs(Button, { as: Link, to: "/team", variant: "glass", size: "xl", children: [_jsx(ArrowRight, { className: "mr-3 w-6 h-6" }), "Meet the Team"] })] })] }) }), _jsx("section", { className: "px-4 sm:px-6 lg:px-8 pb-16", children: _jsx("div", { className: "max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6", children: stats.map((stat, index) => {
                                        const Icon = stat.icon;
                                        return (_jsxs(FloatingCard, { delay: index * 120, className: "text-center", children: [_jsx("div", { className: "w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20", children: _jsx(Icon, { className: "w-8 h-8 text-blue-400" }) }), _jsx("div", { className: "text-3xl font-bold text-white mb-2", children: stat.value }), _jsx("div", { className: "text-slate-400 text-sm font-medium", children: stat.label })] }, stat.label));
                                    }) }) }), _jsx("section", { className: "px-4 sm:px-6 lg:px-8 pb-24", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h2", { className: "text-4xl font-bold text-white mb-4", children: "Pick the workflow that fits your investigation" }), _jsx("p", { className: "text-lg text-slate-400 max-w-2xl mx-auto", children: "Each module is tuned for a specific misinformation surface. Jump straight into the experience you need, no configuration required." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: featureCards.map((feature, index) => {
                                                const Icon = feature.icon;
                                                return (_jsxs(FloatingCard, { delay: index * 150, className: "h-full flex flex-col", children: [_jsx("div", { className: "w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20", children: _jsx(Icon, { className: "w-8 h-8 text-blue-400" }) }), _jsx("h3", { className: "text-2xl font-semibold text-white mb-3", children: feature.title }), _jsx("p", { className: "text-slate-300 leading-relaxed flex-1", children: feature.description }), _jsxs(Button, { as: Link, to: feature.href, variant: "outline", className: "mt-8", children: ["Explore ", feature.title, _jsx(ArrowRight, { className: "ml-2 w-4 h-4" })] })] }, feature.title));
                                            }) })] }) }), _jsx(TechNewsSection, {})] })] })] }));
}
