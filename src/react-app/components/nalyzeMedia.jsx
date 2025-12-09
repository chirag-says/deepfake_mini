import { useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  FileImage,
  RefreshCw,
  Search,
  Upload,
  XCircle,
} from "lucide-react";
import { callGemini } from "../shared/utils/gemini";

const DEFAULT_TECH_INDICATORS = {
  inconsistencies: 50,
  artifacts: 50,
  metadata: 50,
};

const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

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

const buildResultPayload = (analysisData, fallbackMessage) => {
  const technicalIndicators = analysisData.technicalIndicators || {};
  const normalizedIndicators = {
    inconsistencies: normalizeScore(
      technicalIndicators.inconsistencies,
      DEFAULT_TECH_INDICATORS.inconsistencies
    ),
    artifacts: normalizeScore(
      technicalIndicators.artifacts,
      DEFAULT_TECH_INDICATORS.artifacts
    ),
    metadata: normalizeScore(
      technicalIndicators.metadata,
      DEFAULT_TECH_INDICATORS.metadata
    ),
  };

  const isOriginal = normalizeBoolean(analysisData.isOriginal, true);
  const confidence = normalizeScore(analysisData.confidence, 50);

  return {
    isOriginal,
    confidence,
    message: normalizeText(
      analysisData.message ?? fallbackMessage,
      "Analysis completed"
    ),
    flags: toStringArray(analysisData.flags),
    highlights: toStringArray(analysisData.highlights),
    technicalIndicators: normalizedIndicators,
    status: isOriginal ? "verified" : "false",
    trustScore: confidence,
    analysis: {
      checkedAt: new Date().toISOString(),
      keywords: Array.isArray(analysisData.keywords)
        ? analysisData.keywords
        : [],
    },
  };
};

export default function AnalyzeMedia({ onAnalysisComplete }) {
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
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
    setResult(null);

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
        fallbackModels: FALLBACK_MODELS,
      });

      const responseText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

      const jsonMatch =
        responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/```\n([\s\S]*?)\n```/) ||
        responseText.match(/{[\s\S]*}/);

      let parsed = null;
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (error) {
          console.error("Failed to parse media analysis response", error);
        }
      }

      const analysisResult = buildResultPayload(parsed || {}, responseText);
      setResult(analysisResult);
      onAnalysisComplete?.(analysisResult);
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
        FALLBACK_MODELS[FALLBACK_MODELS.length - 1];

      const fallbackResult = buildResultPayload(
        {
          isOriginal: false,
          confidence: 0,
          message: isConfigError
            ? "Gemini API key is missing. Update your .env with VITE_GEMINI_API_KEY."
            : isModelMissing
            ? `Gemini vision model not available for this API key. Enable access to a vision-capable model (e.g., ${suggestedModel}) in Google AI Studio or set VITE_GEMINI_MODEL_NAME accordingly.`
            : error instanceof Error
            ? error.message
            : "Analysis failed. Please try again.",
          flags: ["Analysis service unavailable"],
          highlights: [],
          technicalIndicators: {
            inconsistencies: 0,
            artifacts: 0,
            metadata: 0,
          },
        },
        "Analysis failed."
      );

      fallbackResult.status = "error";
      fallbackResult.trustScore = 0;
      setResult(fallbackResult);
      onAnalysisComplete?.(fallbackResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="text-center mb-6">
          <Camera className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Upload Image for Analysis
          </h3>
          <p className="text-slate-600 text-sm">
            Upload an image to check if it's original or AI-generated.
          </p>
        </div>

        <div className="flex flex-col items-center">
          {mediaPreview ? (
            <img
              src={mediaPreview}
              alt="Preview"
              className="mb-6 max-w-full max-h-64 rounded-xl border border-slate-200 object-contain"
            />
          ) : (
            <div className="mb-6 w-full h-48 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500">
              <FileImage className="w-10 h-10 mb-2" />
              <p className="text-sm">No image selected</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleMediaFileChange}
          />

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center"
              disabled={isAnalyzing}
            >
              <Upload className="w-4 h-4 mr-2" />
              {mediaPreview ? "Change Image" : "Select Image"}
            </button>
            <button
              type="button"
              onClick={analyzeMedia}
              disabled={!mediaFile || isAnalyzing}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
                {result.status === "verified" ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : result.status === "false" ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : result.status === "error" ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  Verification status
                </p>
                <h3 className="text-xl font-semibold">
                  {result.status === "error"
                    ? "Analysis failed"
                    : result.isOriginal
                    ? "Likely original"
                    : "Manipulation detected"}
                </h3>
                <p className="text-slate-600 text-sm">{result.message}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Confidence</p>
              <p className="text-3xl font-bold text-slate-900">
                {result.confidence}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: "Artifacts",
                value: result.technicalIndicators.artifacts,
                tone: "text-amber-500",
              },
              {
                label: "Metadata",
                value: result.technicalIndicators.metadata,
                tone: "text-blue-500",
              },
              {
                label: "Inconsistencies",
                value: result.technicalIndicators.inconsistencies,
                tone: "text-purple-500",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-slate-200 p-4 text-center"
              >
                <p className="text-sm text-slate-500 mb-1">{metric.label}</p>
                <p className={`text-2xl font-semibold ${metric.tone}`}>
                  {metric.value}%
                </p>
              </div>
            ))}
          </div>

          {result.flags.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <h4 className="flex items-center gap-2 text-red-600 font-semibold mb-3">
                <AlertTriangle className="w-4 h-4" /> Anomalies detected
              </h4>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {result.flags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {result.highlights.length > 0 && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
              <h4 className="flex items-center gap-2 text-green-600 font-semibold mb-3">
                <CheckCircle className="w-4 h-4" /> Authenticity signals
              </h4>
              <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                {result.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

AnalyzeMedia.propTypes = {
  onAnalysisComplete: PropTypes.func,
};
