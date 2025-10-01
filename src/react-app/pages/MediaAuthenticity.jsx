import { useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  FileImage,
  Search,
  Upload,
  XCircle,
} from "lucide-react";
import SiteHeader from "../components/layout/SiteHeader";
import ParticleBackground from "../components/common/ParticleBackground";
import FloatingCard from "../components/common/FloatingCard";
import Button from "../components/common/Button";
import { callGemini } from "../shared/utils/gemini";

const DEFAULT_RESULT = null;

export default function MediaAuthenticity() {
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(DEFAULT_RESULT);
  const fileInputRef = useRef(null);

  const handleMediaFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () =>
        setMediaPreview(reader.result?.toString() || null);
      reader.readAsDataURL(file);
    }
  };

  const analyzeMedia = async () => {
    if (!mediaFile) return;
    setIsAnalyzing(true);
    setResult(DEFAULT_RESULT);

    try {
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve(reader.result?.toString().split(",")[1] ?? "");
        reader.onerror = reject;
        reader.readAsDataURL(mediaFile);
      });

      const prompt = `Analyze this image for authenticity and determine if it's a deepfake or original. Provide a detailed analysis including: 1. Overall authenticity assessment (0-100%) 2. Potential signs of manipulation or AI generation 3. Technical indicators of authenticity 4. Confidence level in your assessment (0-100%). Respond with JSON using keys isOriginal, confidence, message, flags, highlights, technicalIndicators { inconsistencies, artifacts, metadata }`;

      const data = await callGemini({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mediaFile.type,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        fallbackModels: [
          "gemini-2.0-flash",
          "gemini-1.5-flash-002",
          "gemini-1.5-flash-001",
          "gemini-1.0-pro-vision-latest",
          "gemini-1.0-pro-vision",
          "gemini-pro-vision",
        ],
      });
      const responseText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

      const extractJson = () => {
        try {
          const jsonMatch =
            responseText.match(/```json\n([\s\S]*?)\n```/) ||
            responseText.match(/```\n([\s\S]*?)\n```/) ||
            responseText.match(/{[\s\S]*}/);
          return jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : null;
        } catch (error) {
          console.error("Failed to parse media analysis response", error);
          return null;
        }
      };

      const normalizeText = (value, fallback = "") => {
        if (value === null || value === undefined) return fallback;
        if (typeof value === "string") return value;
        if (typeof value === "number" || typeof value === "boolean") {
          return String(value);
        }
        try {
          return JSON.stringify(value);
        } catch (error) {
          console.warn("Unable to stringify value", value, error);
          return fallback;
        }
      };

      const normalizeScore = (value, fallback = 0) => {
        const num = Number.parseFloat(value);
        if (Number.isFinite(num)) {
          return Math.min(100, Math.max(0, Math.round(num)));
        }
        return fallback;
      };

      const normalizeBoolean = (value, fallback = true) => {
        if (typeof value === "boolean") return value;
        if (typeof value === "string") {
          const normalized = value.trim().toLowerCase();
          if (normalized === "true") return true;
          if (normalized === "false") return false;
        }
        return fallback;
      };

      const toStringArray = (value) => {
        if (!value) return [];
        const array = Array.isArray(value) ? value : [value];
        return array
          .map((item) => normalizeText(item, ""))
          .filter((item) => item.length > 0);
      };

      const analysisData = extractJson() || {};

      const technicalIndicators = analysisData.technicalIndicators || {};
      const normalizedIndicators = {
        inconsistencies: normalizeScore(
          technicalIndicators.inconsistencies,
          50
        ),
        artifacts: normalizeScore(technicalIndicators.artifacts, 50),
        metadata: normalizeScore(technicalIndicators.metadata, 50),
      };

      setResult({
        isOriginal: normalizeBoolean(analysisData.isOriginal, true),
        confidence: normalizeScore(analysisData.confidence, 50),
        message: normalizeText(
          analysisData.message ?? responseText,
          "Analysis completed"
        ),
        flags: toStringArray(analysisData.flags),
        highlights: toStringArray(analysisData.highlights),
        technicalIndicators: normalizedIndicators,
      });
    } catch (error) {
      console.error("Media analysis failed", error);
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
        attemptedModels.find((modelName) => modelName?.includes("vision")) ||
        attemptedModels.at(-1) ||
        "gemini-pro-vision";
      setResult({
        isOriginal: false,
        confidence: 0,
        message: isConfigError
          ? "Gemini API key is missing. Update your .env with VITE_GEMINI_API_KEY."
          : isModelMissing
          ? `Gemini vision model not available for this API key. Enable gemini-1.5-flash or vision access in Google AI Studio or set VITE_GEMINI_MODEL_NAME to a vision-capable model (e.g., ${suggestedModel}).`
          : (error instanceof Error && error.message) ||
            "Analysis failed. Please try again.",
        flags: ["Analysis service unavailable"],
        highlights: [],
        technicalIndicators: {
          inconsistencies: 0,
          artifacts: 0,
          metadata: 0,
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
          <section className="max-w-4xl mx-auto pt-10">
            <div className="text-center mb-14">
              <div className="inline-flex items-center px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm mb-6">
                <Camera className="w-4 h-4 mr-2" />
                Deepfake & Image Forensics
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Media Authenticity
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Upload imagery to detect manipulation artifacts, metadata
                anomalies, and AI generation signatures.
              </p>
            </div>

            <FloatingCard className="mb-10">
              <div className="flex flex-col items-center text-center">
                <div className="w-full border border-dashed border-slate-700/70 rounded-3xl bg-slate-900/50 p-6 mb-6">
                  {mediaPreview ? (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="max-h-72 mx-auto rounded-2xl border border-slate-800 object-contain"
                    />
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                      <FileImage className="w-12 h-12 mb-4" />
                      <p className="text-sm">
                        Drop an image or browse your files
                      </p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleMediaFileChange}
                />

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {mediaPreview ? "Change Image" : "Select Image"}
                  </Button>
                  <Button
                    className="w-full"
                    onClick={analyzeMedia}
                    disabled={!mediaFile || isAnalyzing}
                    loading={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      "Analyzing Media..."
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Verify Authenticity
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </FloatingCard>

            {result && (
              <FloatingCard className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Verification Summary
                    </h2>
                    <p className="text-slate-400">{result.message}</p>
                  </div>
                  <div
                    className={`flex items-center px-4 py-2 rounded-full text-sm ${
                      result.isOriginal
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {result.isOriginal ? (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 mr-2" />
                    )}
                    {result.isOriginal
                      ? "Likely Original"
                      : "Manipulation Detected"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Confidence",
                      value: result.confidence,
                      tone: "text-green-300",
                    },
                    {
                      label: "Artifacts",
                      value: result.technicalIndicators.artifacts,
                      tone: "text-amber-300",
                    },
                    {
                      label: "Metadata Integrity",
                      value: result.technicalIndicators.metadata,
                      tone: "text-blue-300",
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/40 text-center"
                    >
                      <div className="text-sm font-medium text-slate-400 mb-2">
                        {metric.label}
                      </div>
                      <div className={`text-3xl font-bold ${metric.tone}`}>
                        {metric.value}%
                      </div>
                    </div>
                  ))}
                </div>

                {result.flags?.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                    <h3 className="text-red-300 font-semibold mb-3 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" /> Anomalies
                      Detected
                    </h3>
                    <ul className="space-y-2 text-sm text-red-200">
                      {result.flags.map((flag) => (
                        <li key={flag} className="flex items-start">
                          <XCircle className="w-4 h-4 mr-2 mt-0.5" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.highlights?.length > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                    <h3 className="text-green-300 font-semibold mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" /> Authenticity
                      Signals
                    </h3>
                    <ul className="space-y-2 text-sm text-green-200">
                      {result.highlights.map((highlight) => (
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
