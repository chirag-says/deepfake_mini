import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Link as LinkIcon,
  ListChecks,
  Search,
  Shield,
  TrendingUp,
} from "lucide-react";
import SiteHeader from "../components/layout/SiteHeader";
import ParticleBackground from "../components/common/ParticleBackground";
import FloatingCard from "../components/common/FloatingCard";
import Button from "../components/common/Button";
import { callGemini } from "../shared/utils/gemini";

const normalizeList = (value) => {
  if (!value) return [];
  const arrayValue = Array.isArray(value) ? value : [value];

  return arrayValue
    .filter((item) => item !== null && item !== undefined)
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (typeof item === "number" || typeof item === "boolean") {
        return String(item);
      }

      if (typeof item === "object") {
        if (
          Array.isArray(item) &&
          item.length === 1 &&
          typeof item[0] === "string"
        ) {
          return item[0];
        }

        if (item?.text) {
          return String(item.text);
        }

        try {
          return JSON.stringify(item);
        } catch (error) {
          console.warn("Failed to stringify value", error);
          return "[unreadable entry]";
        }
      }

      return "[unknown entry]";
    })
    .filter(Boolean);
};

const formatText = (value, fallback = "Unknown") => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);

  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    console.warn("Failed to stringify summary", error);
    return fallback;
  }
};

export default function SourceIntelligence() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeSource = async () => {
    if (!sourceUrl) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const prompt = `Evaluate the credibility of the following online source. Provide:
1. An overall credibility score (0-100)
2. Key trust signals (e.g., references, authorship, reputation)
3. Potential risk factors or red flags
4. Summary of publishing timeline and update recency
5. Recommended verification steps

Return JSON with keys score, trustSignals[], risks[], summary, recency, recommendations[]. Source URL: ${sourceUrl}`;

      const data = await callGemini({
        contents: [{ parts: [{ text: prompt }] }],
        fallbackModels: [
          "gemini-2.5-flash",
          "gemini-2.5-flash-lite",
        ],
      });
      const responseText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

      let parsed;
      try {
        const jsonMatch =
          responseText.match(/```json\n([\s\S]*?)\n```/) ||
          responseText.match(/```\n([\s\S]*?)\n```/) ||
          responseText.match(/{[\s\S]*}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : null;
      } catch (error) {
        console.error("Failed to parse source intelligence response", error);
      }

      setResult(
        parsed || {
          score: 60,
          trustSignals: ["No structured response"],
          risks: [],
          summary: responseText,
          recency: "Unknown",
          recommendations: [],
        }
      );
    } catch (error) {
      console.error("Source analysis failed", error);
      const messageText =
        error instanceof Error ? error.message.toLowerCase() : "";
      const isConfigError = messageText.includes("api key");
      const isModelMissing =
        (error?.status === 404 || messageText.includes("404")) &&
        (messageText.includes("model") || messageText.includes("not found"));
      const attemptedModels =
        error?.attemptedModels
          ?.map((attempt) => attempt.model)
          .filter(Boolean) ?? [];
      const suggestedModel =
        attemptedModels.find((modelName) =>
          modelName?.startsWith("gemini-1.0")
        ) ||
        attemptedModels.at(-1) ||
        "gemini-1.0-pro";
      setResult({
        score: 0,
        trustSignals: [],
        risks: ["Unable to evaluate source"],
        summary: isConfigError
          ? "Gemini API key is missing. Update your .env with VITE_GEMINI_API_KEY."
          : isModelMissing
          ? `Gemini model not available for this API key. Enable gemini-1.5-flash in Google AI Studio or set VITE_GEMINI_MODEL_NAME to a model you can access (e.g., ${suggestedModel}).`
          : (error instanceof Error && error.message) ||
            "Analysis failed. Please try again.",
        recency: "Unknown",
        recommendations: ["Retry the analysis later"],
      });
    } finally {
      setIsAnalyzing(false);
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
          <section className="max-w-4xl mx-auto pt-10">
            <div className="text-center mb-14">
              <div className="inline-flex items-center px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm mb-6">
                <Globe className="w-4 h-4 mr-2" />
                OSINT Verification
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Source Intelligence
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Evaluate digital content sources for credibility, recency, and
                potential risk factors using automated OSINT heuristics.
              </p>
            </div>

            <FloatingCard className="mb-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-700/60 rounded-2xl px-4 py-3">
                  <LinkIcon className="w-5 h-5 text-slate-400" />
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(event) => setSourceUrl(event.target.value)}
                    placeholder="Enter article, video, or social link"
                    className="flex-1 bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={analyzeSource}
                  disabled={!sourceUrl || isAnalyzing}
                  loading={isAnalyzing}
                >
                  {isAnalyzing ? (
                    "Analyzing Source..."
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Assess Credibility
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      icon: Database,
                      title: "Reputation",
                      description:
                        "Cross-reference footprint & historical reliability",
                    },
                    {
                      icon: TrendingUp,
                      title: "Sentiment Drift",
                      description:
                        "Detect rapid narrative shifts across channels",
                    },
                    {
                      icon: ListChecks,
                      title: "Verification",
                      description: "Surface recommended fact-checking actions",
                    },
                  ].map((feature) => (
                    <div
                      key={feature.title}
                      className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/40"
                    >
                      <feature.icon className="w-6 h-6 text-blue-300 mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FloatingCard>

            {result && (
              <FloatingCard className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1 bg-blue-900/20 border border-blue-500/20 rounded-2xl p-6 text-center">
                    <div className="text-sm font-medium text-blue-200/80 mb-2">
                      Credibility Score
                    </div>
                    <div className="text-4xl font-bold text-blue-300">
                      {result.score ?? 0}
                    </div>
                  </div>
                  <div className="md:col-span-3 bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6">
                    <div className="flex items-center text-sm text-slate-400 mb-2">
                      <Clock className="w-4 h-4 mr-2" /> Last indexed:{" "}
                      {formatText(result.recency)}
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed">
                      {formatText(result.summary, "No summary available")}
                    </p>
                  </div>
                </div>

                {normalizeList(result.trustSignals).length > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                    <h3 className="text-green-300 font-semibold mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" /> Trust Signals
                    </h3>
                    <ul className="space-y-2 text-sm text-green-200">
                      {normalizeList(result.trustSignals).map((signal) => (
                        <li
                          key={signal}
                          className="flex items-start break-words"
                        >
                          <CheckCircle className="w-4 h-4 mr-2 mt-0.5" />
                          <span>{signal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {normalizeList(result.risks).length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                    <h3 className="text-amber-300 font-semibold mb-3 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" /> Risk Factors
                    </h3>
                    <ul className="space-y-2 text-sm text-amber-200">
                      {normalizeList(result.risks).map((risk) => (
                        <li key={risk} className="flex items-start break-words">
                          <AlertTriangle className="w-4 h-4 mr-2 mt-0.5" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {normalizeList(result.recommendations).length > 0 && (
                  <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6">
                    <h3 className="text-slate-200 font-semibold mb-3 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-slate-400" />
                      Recommended Verification Steps
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {normalizeList(result.recommendations).map((item) => (
                        <li key={item} className="flex items-start break-words">
                          <Shield className="w-4 h-4 mr-2 mt-0.5 text-slate-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </FloatingCard>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
