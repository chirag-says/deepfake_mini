import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Search,
  Shield,
  XCircle,
} from "lucide-react";
import SiteHeader from "../components/layout/SiteHeader";
import ParticleBackground from "../components/common/ParticleBackground";
import FloatingCard from "../components/common/FloatingCard";
import Button from "../components/common/Button";
import TrustScoreVisualization from "../components/common/TrustScoreVisualization";
import {
  parseAnalysisResponse,
  calculateTrustScore,
} from "../shared/utils/analysis";
import { generateFallbackFactAnalysis } from "../shared/utils/localContentAnalysis";
import { callGemini } from "../shared/utils/gemini";

const INITIAL_RESULT = {
  trustScore: 0,
  status: "pending",
  message: "Paste content to begin",
  sources: [],
  analysis: {
    flags: [],
    highlights: [],
    factualAccuracy: 0,
    bias: 0,
    sourceQuality: 0,
    keywords: [],
    checkedAt: new Date().toISOString(),
  },
};

export default function DeepFactAnalysis() {
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(INITIAL_RESULT);

  const analyzeContent = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);

    try {
      const prompt = `Analyze the following content for misinformation, fake news, or deceptive content. Provide a detailed analysis including: 1. Overall credibility assessment (0-100%) 2. Potential red flags or issues (e.g., emotional language, lack of sources, logical fallacies, bias) 3. Positive aspects or verified facts (e.g., citations, balanced reporting, expert opinions) 4. Any relevant sources that could verify or debunk this information, along with their credibility (0-100%). Additionally, rate the content on factual accuracy, bias (100 means no bias), and source quality. Content: "${content}". Respond with JSON using keys factualAccuracy, bias, sourceQuality, trustScore, status, message, flags, highlights, sources`;

      const data = await callGemini({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        fallbackModels: [
          "gemini-1.5-flash-002",
          "gemini-1.5-flash-001",
          "gemini-1.0-pro",
          "gemini-pro",
        ],
      });
      const responseText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      const analysisData = parseAnalysisResponse(responseText);
      const trustScore = calculateTrustScore(
        analysisData.factualAccuracy,
        analysisData.bias,
        analysisData.sourceQuality,
        analysisData.flags,
        analysisData.highlights,
        analysisData.trustScore
      );

      setResult({
        trustScore,
        status: analysisData.status ?? "success",
        message: analysisData.message || "Analysis completed",
        sources: analysisData.sources,
        analysis: {
          flags: analysisData.flags,
          highlights: analysisData.highlights,
          factualAccuracy: analysisData.factualAccuracy,
          bias: analysisData.bias,
          sourceQuality: analysisData.sourceQuality,
        },
      });
    } catch (error) {
      console.error("Analysis failed", error);
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

      const fallback = generateFallbackFactAnalysis(content);
      const serviceHints = [];
      if (isConfigError) {
        serviceHints.push(
          "Gemini API key missing – update your .env with VITE_GEMINI_API_KEY"
        );
      } else if (isModelMissing) {
        serviceHints.push(
          `Gemini model unavailable for this key. Enable gemini-1.5 access or set VITE_GEMINI_MODEL_NAME to ${suggestedModel}.`
        );
      } else if (error instanceof Error) {
        serviceHints.push(`Remote analysis error: ${error.message}`);
      } else {
        serviceHints.push("Remote analysis error: Unknown issue");
      }

      const mergedFlags = [
        ...(fallback.analysis.flags || []),
        ...serviceHints,
      ];

      setResult({
        trustScore: fallback.trustScore,
        status: fallback.status,
        message: `${fallback.message} (AI fallback active)`,
        sources: fallback.sources,
        analysis: {
          flags: mergedFlags,
          highlights: fallback.analysis.highlights,
          factualAccuracy: fallback.analysis.factualAccuracy,
          bias: fallback.analysis.bias,
          sourceQuality: fallback.analysis.sourceQuality,
          keywords: fallback.analysis.keywords,
          checkedAt: fallback.analysis.checkedAt,
        },
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
          <section className="max-w-5xl mx-auto pt-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm mb-6">
                <Shield className="w-4 h-4 mr-2" />
                AI-Powered Content Intelligence
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Deep Fact Analysis
              </h1>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto">
                Paste long-form content, press verify, and receive a structured
                risk assessment with supporting evidence in under a minute.
              </p>
            </div>

            <FloatingCard className="mb-12">
              <div className="space-y-6">
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Paste news articles, social media posts, or any suspicious content here for instant verification..."
                  className="w-full h-48 p-6 bg-slate-900/60 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500/50"
                  disabled={isAnalyzing}
                />

                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>
                    {content.trim().split(/\s+/).filter(Boolean).length} words •{" "}
                    {content.length} characters
                  </span>
                  <Button
                    onClick={analyzeContent}
                    disabled={!content.trim() || isAnalyzing}
                    loading={isAnalyzing}
                    size="lg"
                  >
                    {isAnalyzing ? (
                      "Analyzing Content..."
                    ) : (
                      <>
                        <Search className="mr-2 w-5 h-5" />
                        Verify Content
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </FloatingCard>

            {result && (
              <FloatingCard className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Verification Results
                    </h2>
                    <p className="text-slate-400">{result.message}</p>
                  </div>
                  <div
                    className={`flex items-center px-4 py-2 rounded-full backdrop-blur-sm text-sm ${
                      result.status === "error"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-green-500/20 text-green-300"
                    }`}
                  >
                    {result.status === "error" ? (
                      <XCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    )}
                    <span className="capitalize">{result.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      label: "Factual Accuracy",
                      value: result.analysis.factualAccuracy,
                      className: "from-blue-500 to-indigo-500",
                    },
                    {
                      label: "Bias Score",
                      value: result.analysis.bias,
                      className: "from-purple-500 to-indigo-500",
                    },
                    {
                      label: "Source Quality",
                      value: result.analysis.sourceQuality,
                      className: "from-green-500 to-emerald-500",
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/40 text-center"
                    >
                      <div className="text-sm font-medium text-slate-400 mb-2">
                        {metric.label}
                      </div>
                      <div className="text-3xl font-bold text-white mb-2">
                        {metric.value}%
                      </div>
                      <div className="w-full bg-slate-800/70 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${metric.className}`}
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <TrustScoreVisualization
                    score={result.trustScore}
                    size="large"
                  />
                </div>

                {result.analysis.flags?.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                    <h3 className="text-red-300 font-semibold mb-3 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" /> Potential
                      Issues
                    </h3>
                    <ul className="space-y-2 text-sm text-red-200">
                      {result.analysis.flags.map((flag) => (
                        <li key={flag} className="flex items-start">
                          <XCircle className="w-4 h-4 mr-2 mt-0.5" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.analysis.highlights?.length > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                    <h3 className="text-green-300 font-semibold mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" /> Positive
                      Indicators
                    </h3>
                    <ul className="space-y-2 text-sm text-green-200">
                      {result.analysis.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start">
                          <CheckCircle className="w-4 h-4 mr-2 mt-0.5" />
                          {highlight}
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
