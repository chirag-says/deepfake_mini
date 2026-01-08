import { useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  FileImage,
  FileVideo,
  Search,
  Upload,
  XCircle,
  ScanEye,
  Info,
  Shield,
} from "lucide-react";
import SiteHeader from "../components/layout/SiteHeader";
import ParticleBackground from "../components/common/ParticleBackground";
import FloatingCard from "../components/common/FloatingCard";
import Button from "../components/common/Button";
import { callGemini } from "../shared/utils/gemini";
import { extractVideoFrames } from "../shared/utils/videoProcessing";
import { generateELA } from "../shared/utils/elaProcessing";
import { saveAnalysisToHistory } from "../shared/utils/historyStorage";

// API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const DEFAULT_RESULT = null;

export default function MediaAuthenticity() {
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' | 'video' | 'audio'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(DEFAULT_RESULT);
  const [localResult, setLocalResult] = useState(null);
  const [elaResult, setElaResult] = useState(null);
  const [isElaProcessing, setIsElaProcessing] = useState(false);

  const fileInputRef = useRef(null);
  const resultsCache = useRef(new Map());

  const handleMediaFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMediaFile(file);
    setElaResult(null); // Reset ELA on new file

    // Check cache immediately
    const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
    if (resultsCache.current.has(cacheKey)) {
      setResult(resultsCache.current.get(cacheKey));
    } else {
      setResult(DEFAULT_RESULT);
    }

    if (file.type.startsWith("image/")) {
      setMediaType("image");
      const reader = new FileReader();
      reader.onloadend = () =>
        setMediaPreview(reader.result?.toString() || null);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      setMediaType("video");
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    } else if (file.type.startsWith("audio/")) {
      setMediaType("audio");
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    }
  };

  const handleRunEla = async () => {
    if (!mediaFile || mediaType !== 'image') return;
    setIsElaProcessing(true);
    try {
      const elaDataUrl = await generateELA(mediaFile);
      setElaResult(elaDataUrl);
    } catch (err) {
      console.error("ELA Failed", err);
    } finally {
      setIsElaProcessing(false);
    }
  };

  const analyzeLocalImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE_URL}/analyze-image`, {
        method: "POST",
        credentials: "include", // Use HttpOnly cookie for auth
        body: formData,
      });
      if (!res.ok) throw new Error("Server error");
      return await res.json();
    } catch (e) {
      console.warn("Local backend offline", e);
      return { status: "offline", error: e.message };
    }
  };

  const analyzeMedia = async () => {
    if (!mediaFile) return;

    // Cache check just in case
    const cacheKey = `${mediaFile.name}-${mediaFile.size}-${mediaFile.lastModified}`;
    if (resultsCache.current.has(cacheKey)) {
      setResult(resultsCache.current.get(cacheKey));
      return;
    }

    setIsAnalyzing(true);
    setResult(DEFAULT_RESULT);
    setLocalResult(null);

    try {
      if (mediaType === "image") {
        console.log("Starting Local Multi-Factor Analysis...");

        // Call the new backend endpoint (ViT + ELA + Metadata)
        const localData = await analyzeLocalImage(mediaFile);

        if (localData.status === "offline") {
          throw new Error("Backend is offline. Please ensure the server is running.");
        }

        let finalResult;
        // Handle enhanced response
        if (localData.method === "ensemble_local_v2") {
          finalResult = {
            isOriginal: !localData.is_fake,
            confidence: localData.confidence,
            message: localData.is_fake
              ? `Deepfake detected with ${localData.confidence}% confidence.`
              : `Content appears authentic (${localData.confidence}% confidence).`,
            flags: localData.reasons || [],
            highlights: !localData.is_fake ? ["No digital artifacts found", "Consistent noise patterns"] : [],
            technicalIndicators: {
              inconsistencies: localData.factors?.ela_score || 0,
              artifacts: localData.factors?.model_score || 0,
              metadata: localData.factors?.metadata_traces > 0 ? 80 : 0
            }
          };
        } else {
          // Fallback for unexpected format
          finalResult = {
            isOriginal: !localData.is_fake,
            confidence: localData.confidence,
            message: localData.is_fake ? "Potential manipulation detected." : "No obvious manipulation detected.",
            flags: localData.is_fake ? ["Visual anomalies detected"] : [],
            highlights: [],
            technicalIndicators: { inconsistencies: 0, artifacts: 0, metadata: 0 }
          };
        }

        setResult(finalResult);
        setLocalResult(localData);
        resultsCache.current.set(cacheKey, finalResult);

        saveAnalysisToHistory({
          type: 'media',
          fileName: mediaFile.name,
          mediaType: 'image',
          result: finalResult
        });
      } else {
        // Graceful fallback for non-images without Gemini
        setResult({
          isOriginal: true,
          confidence: 0,
          message: "Video/Audio analysis requires Cloud API key. Local analysis currently supports Images only.",
          flags: ["Cloud specific features disabled"],
          highlights: [],
          technicalIndicators: { inconsistencies: 0, artifacts: 0, metadata: 0 }
        });
      }

    } catch (error) {
      console.error("Analysis failed", error);
      setResult({
        isOriginal: false,
        confidence: 0,
        message: "Analysis failed. Ensure backend is running.",
        flags: [error.message],
        highlights: [],
        technicalIndicators: { inconsistencies: 0, artifacts: 0, metadata: 0 }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Stub for Deprecated Gemini
  const runGeminiAnalysis = async () => { };

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
                Deepfake & Media Forensics
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Media Authenticity
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Upload images, videos, or audio to detect manipulation artifacts, deepfake signatures, and AI generation anomalies.
              </p>
            </div>

            <FloatingCard className="mb-10">
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-full border-2 border-dashed border-slate-700/70 rounded-3xl bg-slate-900/50 p-6 mb-6 transition-colors hover:border-purple-500/50"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      const event = { target: { files: e.dataTransfer.files } };
                      handleMediaFileChange(event);
                    }
                  }}
                >
                  {mediaPreview ? (
                    mediaType === "video" ? (
                      <video
                        src={mediaPreview}
                        controls
                        className="max-h-80 mx-auto rounded-2xl border border-slate-800"
                      />
                    ) : mediaType === "audio" ? (
                      <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                          <FileVideo className="w-8 h-8 text-purple-400" />
                        </div>
                        <audio src={mediaPreview} controls className="w-full max-w-md" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className={`grid ${elaResult ? 'grid-cols-2 gap-4' : 'grid-cols-1'}`}>
                          <div className="relative">
                            {elaResult && <span className="absolute top-2 left-2 bg-black/50 text-xs px-2 py-1 rounded text-white">Original</span>}
                            <img
                              src={mediaPreview}
                              alt="Preview"
                              className="max-h-80 mx-auto rounded-2xl border border-slate-800 object-contain w-full"
                            />
                          </div>
                          {elaResult && (
                            <div className="relative">
                              <span className="absolute top-2 left-2 bg-black/50 text-xs px-2 py-1 rounded text-white">ELA Heatmap</span>
                              <img
                                src={elaResult}
                                alt="ELA Analysis"
                                className="max-h-80 mx-auto rounded-2xl border border-slate-800 object-contain w-full"
                              />
                            </div>
                          )}
                        </div>

                        {elaResult && (
                          <div className="bg-slate-800/50 p-3 rounded-xl text-xs text-slate-400 text-left flex items-start">
                            <Info className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-blue-400" />
                            <p>
                              <strong className="text-blue-300">How to read ELA:</strong> This heatmap shows compression noise.
                              The entire image should have roughly the same "noise" level (brightness).
                              <span className="text-white font-medium"> Bright white/rainbow patches</span> often indicate
                              areas that were recently pasted or modified.
                            </p>
                          </div>
                        )}

                        {mediaType === 'image' && !elaResult && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRunEla();
                            }}
                            disabled={isElaProcessing}
                            className="text-xs flex items-center justify-center mx-auto text-purple-300 hover:text-purple-200 hover:underline disabled:opacity-50"
                          >
                            {isElaProcessing ? (
                              "Generating Heatmap..."
                            ) : (
                              <>
                                <ScanEye className="w-3 h-3 mr-1" />
                                Run Forensic ELA Scan
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-500 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="flex gap-4 mb-4">
                        <FileImage className="w-12 h-12" />
                        <FileVideo className="w-12 h-12" />
                      </div>
                      <p className="text-lg font-medium text-slate-400 mb-2">
                        Drop media here or click to browse
                      </p>
                      <p className="text-sm">
                        Supports JPG, PNG, WEBP, MP4, MP3, WAV
                      </p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*"
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
                    {mediaPreview ? "Replace Media" : "Select Media"}
                  </Button>
                  <Button
                    className="w-full"
                    onClick={analyzeMedia}
                    disabled={!mediaFile || isAnalyzing}
                    loading={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      "Analyzing..."
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Verify {mediaType === "video" ? "Video" : mediaType === "audio" ? "Audio" : "Image"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </FloatingCard>

            {result && (
              <FloatingCard className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Verification Summary
                    </h2>
                    <p className="text-slate-400 max-w-xl">{result.message}</p>
                  </div>
                  <div
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium border ${result.isOriginal
                      ? "bg-green-500/10 border-green-500/20 text-green-300"
                      : "bg-red-500/10 border-red-500/20 text-red-300"
                      }`}
                  >
                    {result.isOriginal ? (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 mr-2" />
                    )}
                    {result.isOriginal
                      ? "Likely Authentic"
                      : "Manipulation Detected"}
                  </div>
                </div>

                {localResult && (
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold flex items-center">
                        <ScanEye className="w-5 h-5 mr-2 text-cyan-400" />
                        Local Model Analysis (Hugging Face ViT)
                      </h3>
                      {localResult.status === 'offline' ? (
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">Backend Offline</span>
                      ) : (
                        <span className={`text-xs px-2 py-1 rounded font-bold ${localResult.is_fake ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}`}>
                          {localResult.is_fake ? "FAKE DETECTED" : "REAL"}
                        </span>
                      )}
                    </div>

                    {localResult.status === 'offline' ? (
                      <p className="text-sm text-slate-400">
                        The local Python backend is not reachable. To enable this feature, run: <br />
                        <code className="text-xs bg-black/30 p-1 rounded mt-1 block w-fit">python src/backend/main.py</code>
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-green-300">Real Probability</span>
                            <span className="text-white">{localResult.probabilities.real}%</span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: `${localResult.probabilities.real}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-red-300">Deepfake Probability</span>
                            <span className="text-white">{localResult.probabilities.fake}%</span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                            <div className="bg-red-500 h-full rounded-full" style={{ width: `${localResult.probabilities.fake}%` }} />
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-right">Running on: {localResult.device_used}</p>

                        {localResult.metadata_flags && localResult.metadata_flags.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-700/50">
                            <p className="text-xs font-semibold text-amber-400 mb-1">Metadata Alerts:</p>
                            <ul className="space-y-1">
                              {localResult.metadata_flags.map((flag, idx) => (
                                <li key={idx} className="text-xs text-amber-200/80 flex items-start">
                                  <AlertTriangle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                                  {flag}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Ensemble Block - Re-added correctly */}
                {result && localResult && localResult.status !== 'offline' && (
                  <div className="bg-slate-800/60 border border-slate-600 rounded-2xl p-5 mb-6">
                    <h3 className="text-white font-bold flex items-center mb-4">
                      <Shield className="w-5 h-5 mr-2 text-blue-400" />
                      Ensemble Consensus
                    </h3>
                    <div className="w-full">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Combined Manipulation Probability</span>
                        <span className="text-white font-bold">
                          {Math.round(((result.isOriginal ? (100 - result.confidence) : result.confidence) + (localResult.probabilities?.fake || 0)) / 2)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${Math.round(((result.isOriginal ? (100 - result.confidence) : result.confidence) + (localResult.probabilities?.fake || 0)) / 2)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      label: "AI Confidence",
                      value: result.confidence,
                      color: "text-blue-300",
                      barColor: "bg-blue-500",
                    },
                    {
                      label: "Artifact Level",
                      value: result.technicalIndicators.artifacts,
                      color: "text-amber-300",
                      barColor: "bg-amber-500",
                    },
                    {
                      label: "Inconsistency",
                      value: result.technicalIndicators.inconsistencies,
                      color: "text-red-300",
                      barColor: "bg-red-500",
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/40"
                    >
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-slate-400">{metric.label}</span>
                        <span className={`text-2xl font-bold ${metric.color}`}>{metric.value}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${metric.barColor} transition-all duration-1000`}
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {result.flags?.length > 0 && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                    <h3 className="text-red-300 font-semibold mb-3 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Detected Anomalies
                    </h3>
                    <ul className="space-y-2 text-sm text-red-200/80">
                      {result.flags.map((flag, i) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.highlights?.length > 0 && (
                  <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                    <h3 className="text-green-300 font-semibold mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Authenticity Signals
                    </h3>
                    <ul className="space-y-2 text-sm text-green-200/80">
                      {result.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
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
