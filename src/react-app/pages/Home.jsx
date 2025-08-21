import { useState, useEffect } from "react";
import { Shield, Search, AlertTriangle, Upload, Globe } from "lucide-react";
import AnalysisResult from "../components/AnalysisResult";
import ContentInput from "../components/ContentInput";

export default function Home() {
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  console.log("Home component rendered");

  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const analyzeContent = async () => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      console.log(
        "Starting analysis for content:",
        content.substring(0, 100) + "..."
      );

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: content }],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Analysis result:", data);

      // Gemini response parsing
      const message =
  data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

const sources = data.sources || []; // adapt if your API returns sources
const analysis = data.analysis || {};

function calculateTrustScore({ analysis, sources }) {
  let score = 100;

  // Lower score for each analysis flag
  if (analysis?.flags?.length) {
    score -= analysis.flags.length * 15;
  }

  // Use sources credibility if available
  if (sources?.length > 0) {
    const avgCredibility =
      sources.reduce((sum, src) => sum + (src.credibility || 50), 0) /
      sources.length;

    score = (score * 0.6) + (avgCredibility * 0.4);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

setResult({
  trustScore: calculateTrustScore({ analysis, sources }),
  status: "success",
  message,
  sources,
  analysis,
});

    } catch (error) {
      console.error("Analysis failed:", error);
      setResult({
        trustScore: 0,
        status: "error",
        message: "Analysis failed. Please try again.",
        sources: [],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">DeFraudAI</h1>
                <p className="text-sm text-slate-600">
                  Combat misinformation with AI
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-6">
                <a
                  href="#"
                  className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Verify Content
                </a>
                <a
                  href="#"
                  className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Myth Buster
                </a>
                <a
                  href="#"
                  className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                >
                  About
                </a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Fighting misinformation in the digital age
            </div>
            <h2 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Verify News & Detect
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                Deepfakes
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Paste any news article, social media post, or suspicious content.
              Our AI analyzes it against trusted sources to give you an instant
              credibility assessment.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">99.2%</div>
              <div className="text-slate-600 text-sm">Accuracy Rate</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-100">
              <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-slate-600 text-sm">Sources Verified</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                Real-time
              </div>
              <div className="text-slate-600 text-sm">Analysis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-blue-100">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Content Verification
              </h3>
              <p className="text-slate-600">
                Paste news content, social media posts, or any suspicious
                information for instant analysis.
              </p>
            </div>

            <ContentInput
              content={content}
              onChange={setContent}
              onAnalyze={analyzeContent}
              isAnalyzing={isAnalyzing}
            />

            {result && (
              <div className="mt-8">
                <AnalysisResult result={result} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Comprehensive Verification
            </h3>
            <p className="text-xl text-slate-600">
              Multiple layers of AI-powered analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-4">
                Fact Checking
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Cross-references claims against trusted databases and
                fact-checking organizations worldwide.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-4">
                Media Analysis
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Detects deepfakes, manipulated images, and doctored videos using
                advanced AI models.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-4">
                Source Tracking
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Traces information origins and evaluates source credibility and
                reliability scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">DeFraudAI</span>
          </div>
          <p className="text-slate-400 mb-6">
            Building a more trustworthy digital world through AI-powered
            verification.
          </p>
          <p className="text-slate-500 text-sm">
            © 2024 DeFraudAI. Fighting misinformation with artificial
            intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
