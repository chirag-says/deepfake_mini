import { useState, useRef } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Search,
  Shield,
  XCircle,
  FileText,
  Image as ImageIcon,
  Upload,
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
  message: "Paste content or upload an image to begin",
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
  const [analysisMode, setAnalysisMode] = useState("text"); // 'text' | 'image'
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(INITIAL_RESULT);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result);
      reader.readAsDataURL(file);
      setResult(INITIAL_RESULT);
    }
  };

  const analyzeContent = async () => {
    if (analysisMode === "text" && !content.trim()) return;
    if (analysisMode === "image" && !mediaFile) return;

    setIsAnalyzing(true);

    try {
      let prompt = "";
      let contentParts = [];

      if (analysisMode === "text") {
        prompt = `Analyze the following content for misinformation, fake news, or deceptive content. 
        
        Act as a professional Fact Checker.
        1. Rate factual accuracy (0-100%).
        2. Detect bias (0-100%, where 0 is neutral).
        3. identify verified facts vs unverified claims.
        4. Provide a Trust Score (0-100).
        
        Content: "${content}". 
        
        Respond with JSON using keys: factualAccuracy, bias, sourceQuality, trustScore, status, message, flags, highlights, sources.`;

        contentParts = [{ text: prompt }];

      } else {
        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.readAsDataURL(mediaFile);
        });

        prompt = `Analyze this image (likely a social media screenshot, news clipping, or meme) for factual accuracy.
        
        1. Extract the main claims made in the text within the image.
        2. Verify these claims against your knowledge base.
        3. Check if the image context supports the text (e.g., is the image of a real event matching the text description?).
        4. Detect if it's a known fake news template or altered headline.

        Respond with JSON using keys: factualAccuracy, bias, sourceQuality, trustScore, status, message, flags, highlights, sources.`;

        contentParts = [
          { text: prompt },
          {
            inlineData: {
              mimeType: mediaFile.type,
              data: base64Image,
            },
          },
        ];
      }

      const data = await callGemini({
        contents: [{ parts: contentParts }],
        fallbackModels: ["gemini-1.5-pro", "gemini-1.5-flash"],
      });

      const responseText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      const analysisData = parseAnalysisResponse(responseText);

      // Calculate trust score if not provided directly
      const trustScore = analysisData.trustScore || calculateTrustScore(
        analysisData.factualAccuracy,
        analysisData.bias,
        analysisData.sourceQuality,
        analysisData.flags,
        analysisData.highlights
      );

      setResult({
        trustScore,
        status: analysisData.status ?? "success",
        message: analysisData.message || "Analysis completed",
        sources: analysisData.sources || [],
        analysis: {
          flags: analysisData.flags || [],
          highlights: analysisData.highlights || [],
          factualAccuracy: analysisData.factualAccuracy || 0,
          bias: analysisData.bias || 0,
          sourceQuality: analysisData.sourceQuality || 0,
        },
      });
    } catch (error) {
      console.error("Analysis failed", error);
      // Fallback logic remains similar but simplified for brevity
      setResult({
        ...INITIAL_RESULT,
        status: "error",
        message: "Analysis failed. Please check your API key or connection.",
        analysis: { ...INITIAL_RESULT.analysis, flags: [error.message] }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderListItem = (item) => {
    if (!item) return null;
    if (typeof item === 'string') {
      // Clean up if the model returned a JSON string by mistake
      if (item.trim().startsWith('{') && item.trim().includes('}')) {
        try {
          const parsed = JSON.parse(item);
          return parsed.message || parsed.reason || parsed.text || item;
        } catch (e) {
          return item.replace(/["{}]/g, '');
        }
      }
      return item;
    }
    if (typeof item === 'object') {
      return item.message || item.reason || item.text || JSON.stringify(item);
    }
    return String(item);
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
                Verify news articles, social media posts, and screenshots for misinformation and bias.
              </p>
            </div>

            <FloatingCard className="mb-12">
              <div className="flex border-b border-slate-700/50 mb-6">
                <button
                  onClick={() => setAnalysisMode("text")}
                  className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${analysisMode === "text"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-slate-400 hover:text-slate-300"
                    }`}
                >
                  <div className="flex items-center justify-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Text Verification
                  </div>
                </button>
                <button
                  onClick={() => setAnalysisMode("image")}
                  className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${analysisMode === "image"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-slate-400 hover:text-slate-300"
                    }`}
                >
                  <div className="flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Screenshot/Image Analysis
                  </div>
                </button>
              </div>

              <div className="space-y-6">
                {analysisMode === "text" ? (
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        analyzeContent();
                      }
                    }}
                    placeholder="Paste news articles, social media posts, or any suspicious content here..."
                    className="w-full h-48 p-6 bg-slate-900/60 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500/50"
                    disabled={isAnalyzing}
                  />
                ) : (
                  <div
                    className="w-full border-2 border-dashed border-slate-700/70 rounded-2xl bg-slate-900/50 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {mediaPreview ? (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="max-h-64 rounded-lg object-contain mb-4 border border-slate-700"
                      />
                    ) : (
                      <div className="mb-4 p-4 bg-slate-800/50 rounded-full">
                        <Upload className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    <p className="text-slate-300 font-medium">
                      {mediaPreview ? "Click to change image" : "Drop a screenshot or click to upload"}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">Supports JPG, PNG, WEBP</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <Button
                    onClick={analyzeContent}
                    disabled={
                      isAnalyzing ||
                      (analysisMode === "text" && !content.trim()) ||
                      (analysisMode === "image" && !mediaFile)
                    }
                    loading={isAnalyzing}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {isAnalyzing ? (
                      "Analyzing..."
                    ) : (
                      <>
                        <Search className="mr-2 w-5 h-5" />
                        Verify {analysisMode === "text" ? "Content" : "Image"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </FloatingCard>

            {result.trustScore > 0 && (
              <FloatingCard className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Verification Results
                    </h2>
                    <p className="text-slate-400">{result.message}</p>
                  </div>
                  <div
                    className={`flex items-center px-4 py-2 rounded-full backdrop-blur-sm text-sm ${result.trustScore < 50
                      ? "bg-red-500/20 text-red-300"
                      : result.trustScore < 80
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-green-500/20 text-green-300"
                      }`}
                  >
                    {result.trustScore < 50 ? (
                      <XCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    )}
                    <span className="capitalize">
                      {result.trustScore > 80 ? "High Credibility" : result.trustScore > 50 ? "Mixed Reliability" : "Low Credibility"}
                    </span>
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
                      {result.analysis.flags.map((flag, idx) => (
                        <li key={idx} className="flex items-start">
                          <XCircle className="w-4 h-4 mr-2 mt-0.5" />
                          {renderListItem(flag)}
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
                      {result.analysis.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="w-4 h-4 mr-2 mt-0.5" />
                          {renderListItem(highlight)}
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
