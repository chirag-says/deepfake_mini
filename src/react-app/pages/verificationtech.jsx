// src/react-app/pages/SourceIntelligencePage.jsx
import { useState } from "react";
import { Search, ArrowRight, CheckCircle as CheckIcon, XCircle as XIcon, Globe } from "lucide-react";
import Button from "../../shared/Button";
import FloatingCard from "../../shared/FloatingCard";
import ParticleBackground from "../../shared/ParticleBackground";

// Rest of the SourceIntelligencePage component remains the same...

export default function EnhancedFeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(null);
  const [expandedContent, setExpandedContent] = useState("");
  const [expandedResult, setExpandedResult] = useState(null);
  const [isExpandedAnalyzing, setIsExpandedAnalyzing] = useState(false);

  const features = [
    {
      icon: Search,
      title: "Deep Fact Analysis",
      description: "Advanced NLP algorithms cross-reference claims against verified databases and trusted sources worldwide.",
      features: ["Real-time fact checking", "Source credibility scoring", "Bias detection"],
      color: "blue"
    },
    {
      icon: Upload,
      title: "Media Authenticity",
      description: "Cutting-edge deepfake detection and image manipulation analysis using computer vision.",
      features: ["Deepfake detection", "Image forensics", "Video authenticity"],
      color: "green"
    },
    {
      icon: Globe,
      title: "Source Intelligence",
      description: "Comprehensive source tracking and reputation analysis with historical accuracy metrics.",
      features: ["Source reputation tracking", "Historical accuracy analysis", "Network mapping"],
      color: "purple"
    }
  ];

  const analyzeExpandedContent = () => {
    setIsExpandedAnalyzing(true);
    setTimeout(() => {
      setExpandedResult({ message: "Sample verification result." });
      setIsExpandedAnalyzing(false);
    }, 2000);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h3 className="text-4xl font-bold text-white mb-6">
            Advanced Verification Technology
          </h3>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Multi-layered AI analysis combining natural language processing, 
            source verification, and real-time fact-checking
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <FloatingCard key={index} delay={index * 150}>
                <div>
                  <div className={`w-16 h-16 bg-${feature.color}-500/10 rounded-2xl flex items-center justify-center mb-8 border border-${feature.color}-500/20`}>
                    <Icon className={`w-8 h-8 text-${feature.color}-400`} />
                  </div>

                  <h4 className="text-2xl font-bold text-white mb-4">{feature.title}</h4>
                  <p className="text-slate-300 leading-relaxed mb-8">{feature.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    {feature.features.map((item, i) => (
                      <div key={i} className="flex items-center text-sm text-slate-400">
                        <CheckCircle className={`w-4 h-4 mr-3 text-${feature.color}-400`} />
                        {item}
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => setActiveFeature(feature)}>
                    Experience Now <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </FloatingCard>
            );
          })}
        </div>
      </div>

      {/* Modal Overlay */}
      {activeFeature && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900/90 border border-slate-700/50 rounded-2xl max-w-3xl w-full shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-700/50 p-4">
              <h4 className="text-2xl font-bold text-white">{activeFeature.title}</h4>
              <Button variant="ghost" size="sm" onClick={() => setActiveFeature(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <textarea
                value={expandedContent}
                onChange={(e) => setExpandedContent(e.target.value)}
                placeholder="Paste news articles, social media posts, or any suspicious content here for instant verification..."
                className="w-full h-48 p-6 bg-slate-800/50 text-white placeholder-slate-400 rounded-xl border border-slate-700 resize-none focus:outline-none"
                disabled={isExpandedAnalyzing}
              />

              <Button
                variant="outline"
                className="w-full"
                onClick={analyzeExpandedContent}
                disabled={!expandedContent.trim() || isExpandedAnalyzing}
              >
                {isExpandedAnalyzing ? "Analyzing Content..." : (
                  <>
                    <Search className="mr-2 w-4 h-4" />
                    Verify Content
                  </>
                )}
              </Button>

              {expandedResult && (
                <EnhancedAnalysisResult 
                  result={expandedResult} 
                  showTrustScore={false} 
                  hideSourcesTab={true} 
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
