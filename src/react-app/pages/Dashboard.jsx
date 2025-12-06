import { useState, useEffect } from "react";
import {
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    FileImage,
    FileText,
    History,
    Shield,
    Trash2,
    XCircle,
    AlertTriangle,
    TrendingUp,
} from "lucide-react";
import SiteHeader from "../components/layout/SiteHeader";
import ParticleBackground from "../components/common/ParticleBackground";
import FloatingCard from "../components/common/FloatingCard";
import Button from "../components/common/Button";
import {
    getAnalysisHistory,
    getAnalysisStats,
    clearAnalysisHistory,
    deleteAnalysisById,
} from "../shared/utils/historyStorage";

export default function Dashboard() {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [filter, setFilter] = useState("all"); // 'all' | 'media' | 'text'

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        setHistory(getAnalysisHistory());
        setStats(getAnalysisStats());
    };

    const handleClearAll = () => {
        if (window.confirm("Are you sure you want to clear all analysis history?")) {
            clearAnalysisHistory();
            refreshData();
        }
    };

    const handleDelete = (id) => {
        deleteAnalysisById(id);
        refreshData();
    };

    const filteredHistory = history.filter((item) => {
        if (filter === "all") return true;
        return item.type === filter;
    });

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getResultBadge = (item) => {
        if (item.type === "media") {
            const isFake = item.result?.is_fake || item.result?.isOriginal === false;
            return isFake ? (
                <span className="flex items-center text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                    <XCircle className="w-3 h-3 mr-1" /> Fake Detected
                </span>
            ) : (
                <span className="flex items-center text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3 mr-1" /> Authentic
                </span>
            );
        } else {
            const score = item.result?.trustScore || 0;
            if (score >= 70) {
                return (
                    <span className="flex items-center text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3 mr-1" /> Credible ({score}%)
                    </span>
                );
            } else if (score >= 40) {
                return (
                    <span className="flex items-center text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Suspicious ({score}%)
                    </span>
                );
            } else {
                return (
                    <span className="flex items-center text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3 mr-1" /> Low Trust ({score}%)
                    </span>
                );
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-indigo-900/10" />
                <ParticleBackground />
            </div>

            <div className="relative z-10">
                <SiteHeader />

                <main className="px-4 sm:px-6 lg:px-8 pb-24">
                    <section className="max-w-6xl mx-auto pt-10">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm mb-6">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analysis Dashboard
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Your Analysis History
                            </h1>
                            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                                Track your verification activity and review past analyses.
                            </p>
                        </div>

                        {/* Stats Grid */}
                        {stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                                {[
                                    {
                                        label: "Total Analyses",
                                        value: stats.totalAnalyses,
                                        icon: History,
                                        color: "text-blue-400",
                                        bgColor: "bg-blue-500/10",
                                    },
                                    {
                                        label: "Deepfakes Found",
                                        value: stats.deepfakesDetected,
                                        icon: XCircle,
                                        color: "text-red-400",
                                        bgColor: "bg-red-500/10",
                                    },
                                    {
                                        label: "Authentic Media",
                                        value: stats.authenticMedia,
                                        icon: CheckCircle,
                                        color: "text-green-400",
                                        bgColor: "bg-green-500/10",
                                    },
                                    {
                                        label: "This Week",
                                        value: stats.thisWeek,
                                        icon: TrendingUp,
                                        color: "text-purple-400",
                                        bgColor: "bg-purple-500/10",
                                    },
                                ].map((stat) => (
                                    <FloatingCard key={stat.label} className="text-center p-4">
                                        <div
                                            className={`w-10 h-10 mx-auto mb-2 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                                        >
                                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {stat.value}
                                        </div>
                                        <div className="text-xs text-slate-400">{stat.label}</div>
                                    </FloatingCard>
                                ))}
                            </div>
                        )}

                        {/* Filters and Actions */}
                        <FloatingCard className="mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex gap-2">
                                    {["all", "media", "text"].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-slate-800/60 text-slate-300 hover:bg-slate-700/60"
                                                }`}
                                        >
                                            {f === "all" && "All"}
                                            {f === "media" && (
                                                <>
                                                    <FileImage className="w-4 h-4 inline mr-1" /> Media
                                                </>
                                            )}
                                            {f === "text" && (
                                                <>
                                                    <FileText className="w-4 h-4 inline mr-1" /> Text
                                                </>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {history.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClearAll}
                                        className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" /> Clear All
                                    </Button>
                                )}
                            </div>
                        </FloatingCard>

                        {/* History List */}
                        {filteredHistory.length === 0 ? (
                            <FloatingCard className="text-center py-16">
                                <Shield className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                                <h3 className="text-xl font-semibold text-slate-400 mb-2">
                                    No analyses yet
                                </h3>
                                <p className="text-slate-500">
                                    Start verifying content to build your history.
                                </p>
                            </FloatingCard>
                        ) : (
                            <div className="space-y-3">
                                {filteredHistory.map((item) => (
                                    <FloatingCard
                                        key={item.id}
                                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === "media"
                                                        ? "bg-purple-500/10"
                                                        : "bg-blue-500/10"
                                                    }`}
                                            >
                                                {item.type === "media" ? (
                                                    <FileImage className="w-5 h-5 text-purple-400" />
                                                ) : (
                                                    <FileText className="w-5 h-5 text-blue-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm truncate max-w-[200px] sm:max-w-[300px]">
                                                    {item.fileName || item.contentPreview || "Analysis"}
                                                </p>
                                                <p className="text-xs text-slate-500 flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {formatDate(item.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getResultBadge(item)}
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </FloatingCard>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
