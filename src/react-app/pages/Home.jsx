import { useState, useEffect, useRef } from "react";
import { Search, AlertTriangle, Upload, Globe, ArrowRight, ExternalLink, CheckCircle, XCircle, Clock, Calendar, TrendingUp, Eye, RefreshCw, Star, Shield, Zap, Users, Award, Menu, X, Play, Pause } from "lucide-react";

// Enhanced Floating Card Component with Stagger Animation
function FloatingCard({ children, delay = 0, className = "" }) {
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const cardRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setInView(true), delay);
        }
      },
      { threshold: 0.1 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => observer.disconnect();
  }, [delay]);
  
  return (
    <div
      ref={cardRef}
      className={`
        bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 
        shadow-2xl transition-all duration-700 ease-out hover:shadow-blue-500/10
        ${inView 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
        }
        ${hovered 
          ? 'transform -translate-y-2 scale-[1.02] border-blue-500/30' 
          : 'transform translate-y-0 scale-100'
        }
        ${className}
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

// Enhanced Button Component with More Variants
function Button({ children, variant = "primary", size = "md", className = "", loading = false, disabled = false, ...props }) {
  const baseClasses = "font-semibold transition-all duration-300 flex items-center justify-center rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden";
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl"
  };
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 focus:ring-blue-500",
    secondary: "bg-slate-800/80 text-blue-300 border border-slate-600/50 hover:bg-slate-700/80 hover:border-blue-500/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:ring-blue-500",
    outline: "bg-transparent border-2 border-blue-500/50 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400 hover:text-white focus:ring-blue-500 backdrop-blur-sm",
    success: "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-xl hover:shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-1 focus:ring-green-500",
    warning: "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-xl hover:shadow-2xl hover:shadow-amber-500/25 transform hover:-translate-y-1 focus:ring-amber-500",
    danger: "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-xl hover:shadow-2xl hover:shadow-red-500/25 transform hover:-translate-y-1 focus:ring-red-500",
    ghost: "bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white",
    glass: "bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
  };
  
  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
      )}
      {children}
    </button>
  );
}

// Enhanced Content Input Component
function ContentInput({ content, onChange, onAnalyze, isAnalyzing }) {
  const [focused, setFocused] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  
  useEffect(() => {
    setWordCount(content.trim().split(/\s+/).filter(word => word.length > 0).length);
  }, [content]);
  
  return (
    <div className="space-y-6">
      <div className={`
        relative transition-all duration-300
        ${focused ? 'transform scale-[1.01]' : ''}
      `}>
        <div className={`
          absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl transition-opacity duration-300
          ${focused ? 'opacity-100' : 'opacity-0'}
        `}></div>
        
        <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-1">
            <div className={`
              bg-slate-900/50 rounded-xl border transition-all duration-300
              ${focused 
                ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' 
                : 'border-slate-700/50'
              }
            `}>
              <textarea
                value={content}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Paste news articles, social media posts, or any suspicious content here for instant verification..."
                className="w-full h-48 p-6 bg-transparent text-white placeholder-slate-400 resize-none focus:outline-none"
                disabled={isAnalyzing}
              />
              
              <div className="flex items-center justify-between p-4 border-t border-slate-700/50">
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <span>{wordCount} words</span>
                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                  <span>{content.length} characters</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  {content.trim() && (
                    <div className="flex items-center text-xs text-slate-500">
                      <Shield className="w-3 h-3 mr-1" />
                      <span>Secure analysis</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span>AI-powered verification</span>
          </div>
        </div>
        
        <Button
          onClick={onAnalyze}
          disabled={!content.trim() || isAnalyzing}
          loading={isAnalyzing}
          size="lg"
          className="min-w-[200px]"
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
  );
}

// Enhanced Trust Score Visualization
function TrustScoreVisualization({ score, size = "large" }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);
  
  const radius = size === "large" ? 90 : 60;
  const strokeWidth = size === "large" ? 12 : 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  
  const getColor = (score) => {
    if (score >= 80) return { stroke: "#10b981", bg: "from-green-500/20 to-emerald-500/20", text: "text-green-400" };
    if (score >= 60) return { stroke: "#f59e0b", bg: "from-amber-500/20 to-orange-500/20", text: "text-amber-400" };
    return { stroke: "#ef4444", bg: "from-red-500/20 to-rose-500/20", text: "text-red-400" };
  };
  
  const colors = getColor(animatedScore);
  
  return (
    <div className="relative flex items-center justify-center">
      <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} rounded-full blur-xl opacity-50`}></div>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="relative transform -rotate-90"
      >
        <circle
          stroke="#374151"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={colors.stroke}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          style={{
            strokeDashoffset,
            transition: 'stroke-dashoffset 2s ease-in-out'
          }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={`${size === "large" ? "text-4xl" : "text-2xl"} font-bold text-white`}>
            {Math.round(animatedScore)}%
          </div>
          {size === "large" && (
            <div className={`text-sm ${colors.text} font-medium`}>
              Trust Score
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced Analysis Result Component
function EnhancedAnalysisResult({ result }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!result) return null;
  
  const { trustScore, status, message, sources = [], analysis = {} } = result;
  
  const statusIcon = status === "success" ? 
    <CheckCircle className="w-6 h-6 text-green-500" /> : 
    <XCircle className="w-6 h-6 text-red-500" />;
    
  const statusColor = status === "success" ? "text-green-500" : "text-red-500";
  const statusBg = status === "success" ? "bg-green-500/20" : "bg-red-500/20";
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'sources', label: `Sources (${sources.length})`, icon: Globe },
    { id: 'analysis', label: 'Detailed Analysis', icon: Search }
  ];
  
  return (
    <FloatingCard className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Verification Results</h3>
        <div className={`flex items-center px-4 py-2 rounded-full ${statusBg} ${statusColor} backdrop-blur-sm`}>
          {statusIcon}
          <span className="ml-2 text-sm font-semibold capitalize">{status}</span>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                }
              `}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trust Score */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <div className="text-center">
                <TrustScoreVisualization score={trustScore} />
                <div className="mt-6">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Our AI analyzed this content against multiple factors including source credibility, 
                    factual accuracy, and potential misinformation indicators.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Summary */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h4 className="text-xl font-semibold text-white mb-4">Analysis Summary</h4>
              <p className="text-slate-300 leading-relaxed mb-6">{message}</p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{sources.length}</div>
                  <div className="text-xs text-slate-400">Sources Found</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {analysis.flags?.length || 0}
                  </div>
                  <div className="text-xs text-slate-400">Issues Detected</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'sources' && (
          <div className="space-y-6">
            {sources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sources.map((source, index) => (
                  <SourceCard key={index} source={source} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-slate-400 mb-2">No Sources Found</h4>
                <p className="text-slate-500">
                  Our analysis couldn't find reliable sources to verify this content.
                  This may indicate potential misinformation.
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {analysis.flags && analysis.flags.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                <h5 className="text-red-400 font-semibold mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Potential Issues Detected
                </h5>
                <div className="space-y-3">
                  {analysis.flags.map((flag, index) => (
                    <div key={index} className="flex items-start text-red-300 text-sm">
                      <XCircle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {analysis.highlights && analysis.highlights.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                <h5 className="text-green-400 font-semibold mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Positive Indicators
                </h5>
                <div className="space-y-3">
                  {analysis.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start text-green-300 text-sm">
                      <CheckCircle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {(!analysis.flags || analysis.flags.length === 0) && 
             (!analysis.highlights || analysis.highlights.length === 0) && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-slate-400 mb-2">Analysis Complete</h4>
                <p className="text-slate-500">
                  No specific issues or highlights were identified in this content.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </FloatingCard>
  );
}

// Enhanced Source Card
function SourceCard({ source, index }) {
  const credibility = source.credibility || 50;
  const credibilityColor = credibility >= 80 ? "text-green-400" : credibility >= 60 ? "text-amber-400" : "text-red-400";
  const credibilityBg = credibility >= 80 ? "bg-green-500/20" : credibility >= 60 ? "bg-amber-500/20" : "bg-red-500/20";
  const credibilityLabel = credibility >= 80 ? "High" : credibility >= 60 ? "Medium" : "Low";
  
  return (
    <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
          {source.name || `Source ${index + 1}`}
        </h4>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${credibilityColor} ${credibilityBg} backdrop-blur-sm`}>
          {credibilityLabel}
        </span>
      </div>
      
      {source.url && (
        <a 
          href={source.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center mb-4 truncate group/link"
        >
          <span className="truncate">{source.url}</span>
          <ExternalLink className="ml-2 w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </a>
      )}
      
      {source.description && (
        <p className="text-slate-300 text-sm mb-4 line-clamp-3">{source.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                credibility >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                credibility >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 
                'bg-gradient-to-r from-red-500 to-rose-500'
              }`}
              style={{ width: `${credibility}%` }}
            ></div>
          </div>
        </div>
        <span className="text-slate-400 text-sm font-medium">{credibility}%</span>
      </div>
    </div>
  );
}

// Mobile Navigation
function MobileNav({ isOpen, setIsOpen }) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/100 backdrop-blur-md md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <img 
                  src="/DeFraudAI_Logo-removebg-preview.png" 
                  alt="DeFraudAI Logo" 
                  className="w-10 h-10 object-contain rounded-full border-2 border-blue-500"
                />
                <span className="text-xl font-bold text-white">DeFraudAI</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>
            
            <nav className="flex-1 p-6 space-y-4">
              {['Verify Content', 'Myth Buster', 'About', 'Contact'].map((item) => (
                <Button key={item} variant="ghost" className="w-full justify-start text-lg">
                  {item}
                </Button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

// Particle Background Effect
function ParticleBackground() {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-30"
    />
  );
}

// Main Component
export default function Home() {
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  // Mock data remains the same but with enhanced structure
  const [latestNews] = useState([
    {
      id: 1,
      title: "New Study Reveals Alarming Spread of AI-Generated Misinformation",
      description: "Researchers find that AI-generated fake news spreads 6 times faster than traditional misinformation on social media platforms.",
      date: "2 hours ago",
      category: "Breaking",
      views: "12.5K",
      url: "https://example.com/ai-misinformation-study",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "Tech Giants Collaborate to Combat Deepfake Technology",
      description: "Major technology companies announce joint initiative to develop detection tools for AI-generated media and deepfakes.",
      date: "5 hours ago",
      category: "Technology",
      views: "8.2K",
      url: "https://example.com/tech-giants-deepfake",
      readTime: "3 min read"
    },
    {
      id: 3,
      title: "Election Integrity Concerns Rise with Advanced AI Manipulation",
      description: "Security experts warn about sophisticated AI tools being used to create misleading political content ahead of upcoming elections.",
      date: "1 day ago",
      category: "Politics",
      views: "15.7K",
      url: "https://example.com/election-ai-concerns",
      readTime: "7 min read"
    },
    {
      id: 4,
      title: "Breakthrough in Detecting AI-Generated Text Achieves 98% Accuracy",
      description: "New algorithm can distinguish between human-written and AI-generated text with unprecedented accuracy, researchers claim.",
      date: "1 day ago",
      category: "Technology",
      views: "9.4K",
      url: "https://example.com/ai-text-detection",
      readTime: "4 min read"
    }
  ]);
  
  const calculateTrustScore = (analysis, sources) => {
    let score = 50;
    if (analysis?.flags?.length) score -= analysis.flags.length * 10;
    if (analysis?.highlights?.length) score += analysis.highlights.length * 5;
    if (sources?.length > 0) {
      const avgCredibility = sources.reduce((sum, src) => sum + (src.credibility || 50), 0) / sources.length;
      score = (score * 0.4) + (avgCredibility * 0.6);
    } else {
      score -= 20;
    }
    return Math.max(0, Math.min(100, Math.round(score)));
  };
  
  const analyzeContent = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      console.log("Starting analysis for content:", content.substring(0, 100) + "...");
      
      // Enhanced prompt for better analysis
      const prompt = `
        Analyze the following content for misinformation, fake news, or deceptive content. 
        Provide a detailed analysis including:
        1. Overall credibility assessment (0-100%)
        2. Potential red flags or issues
        3. Positive aspects or verified facts
        4. Any relevant sources that could verify or debunk this information
        
        Content: "${content}"
        
        Please format your response as a JSON object with the following structure:
        {
          "trustScore": [number between 0-100],
          "status": "success" or "error",
          "message": "[summary of your analysis]",
          "flags": ["array of potential issues"],
          "highlights": ["array of positive aspects"],
          "sources": [
            {
              "name": "[source name]",
              "url": "[source URL if available]",
              "credibility": [number 0-100],
              "description": "[brief description]"
            }
          ]
        }
      `;
      
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
                parts: [{ text: prompt }],
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
      
      // Extract the response text
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      
      // Try to parse JSON from the response
      let analysisData;
      try {
        // Look for JSON in the response (it might be wrapped in markdown code blocks)
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                         responseText.match(/```\n([\s\S]*?)\n```/) ||
                         responseText.match(/{[\s\S]*}/);
        
        if (jsonMatch) {
          const jsonString = jsonMatch[1] || jsonMatch[0];
          analysisData = JSON.parse(jsonString);
        } else {
          // Fallback: create a basic analysis from the text
          analysisData = {
            trustScore: 50, // Default neutral score
            status: "success",
            message: responseText,
            flags: [],
            highlights: [],
            sources: []
          };
        }
      } catch (e) {
        console.error("Failed to parse analysis response:", e);
        // Fallback to basic analysis
        analysisData = {
          trustScore: 50,
          status: "success",
          message: responseText,
          flags: [],
          highlights: [],
          sources: []
        };
      }
      
      // Calculate trust score if not provided or if we want to adjust it
      const trustScore = analysisData.trustScore || 
                         calculateTrustScore(analysisData, analysisData.sources || []);
      
      setResult({
        trustScore,
        status: analysisData.status || "success",
        message: analysisData.message || "Analysis completed",
        sources: analysisData.sources || [],
        analysis: {
          flags: analysisData.flags || [],
          highlights: analysisData.highlights || []
        }
      });
      
    } catch (error) {
      console.error("Analysis failed:", error);
      setResult({
        trustScore: 0,
        status: "error",
        message: "Analysis failed. Please try again.",
        sources: [],
        analysis: {
          flags: ["Analysis service unavailable"],
          highlights: []
        }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const scrollToAnalysis = () => {
    document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-indigo-900/10"></div>
        <ParticleBackground />
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileNavOpen} setIsOpen={setMobileNavOpen} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Enhanced Header */}
        <header className="bg-slate-900/80 backdrop-blur-2xl border-b border-slate-700/50 fixed top-0 left-0 right-0 z-40 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
                  <img 
                    src="/DeFraudAI_Logo-removebg-preview.png" 
                    alt="DeFraudAI Logo" 
                    className="relative w-16 h-16 object-contain rounded-full border-2 border-blue-500/50 shadow-xl"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">DeFraudAI</h1>
                  <p className="text-sm text-slate-400">AI-Powered Truth Verification</p>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                <nav className="flex space-x-2">
                  {['Verify Content', 'Myth Buster', 'About'].map((item) => (
                    <Button key={item} variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                      {item}
                    </Button>
                  ))}
                </nav>
                <Button size="sm">Get Started</Button>
              </div>
              
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </header>
        
        {/* Spacer for fixed header */}
        <div className="h-24"></div>
        
        {/* Enhanced Hero Section */}
        <section className="relative py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-300 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-blue-500/20 shadow-xl">
                <Shield className="w-4 h-4 mr-2" />
                Protecting truth in the age of AI deception
              </div>
              
              <h2 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
                Verify Truth,
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Defeat Deception
                </span>
              </h2>
              
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-12">
                Advanced AI-powered verification system that analyzes content authenticity, 
                cross-references sources, and provides real-time credibility assessments to combat misinformation.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
                <Button onClick={scrollToAnalysis} size="xl" className="shadow-2xl shadow-blue-500/25">
                  <Zap className="mr-3 w-6 h-6" />
                  Start Verification
                </Button>
                <Button variant="glass" size="xl">
                  <Play className="mr-3 w-6 h-6" />
                  Watch Demo
                </Button>
              </div>
            </div>
            
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
              {[
                { value: "99.2%", label: "Accuracy Rate", icon: Award, color: "blue" },
                { value: "2M+", label: "Content Verified", icon: Shield, color: "green" },
                { value: "50K+", label: "Sources Analyzed", icon: Globe, color: "purple" },
                { value: "24/7", label: "Real-time Monitoring", icon: Clock, color: "amber" }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <FloatingCard key={index} delay={index * 100} className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center border border-${stat.color}-500/20`}>
                      <Icon className={`w-8 h-8 text-${stat.color}-400`} />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
                  </FloatingCard>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* Enhanced Analysis Section */}
        <section id="analysis-section" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-white mb-4">
                Instant Content Verification
              </h3>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Paste any content and get comprehensive analysis powered by advanced AI algorithms
              </p>
            </div>
            
            <FloatingCard className="mb-12">
              <ContentInput
                content={content}
                onChange={setContent}
                onAnalyze={analyzeContent}
                isAnalyzing={isAnalyzing}
              />
            </FloatingCard>
            
            {result && <EnhancedAnalysisResult result={result} />}
          </div>
        </section>
        
        {/* Enhanced Features Section */}
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
  {[
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
  ].map((feature, index) => {
    const Icon = feature.icon;
    return (
      <FloatingCard 
        key={index} 
        delay={index * 150} 
        className="h-full flex flex-col justify-between"
      >
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
        </div>

        {/* Button pinned at bottom for uniformity */}
        <Button variant="outline" className="w-full mt-auto">
          Experience Now <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </FloatingCard>
    );
  })}
</div>

          </div>
        </section>
        
        {/* Enhanced News Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-4xl font-bold text-white mb-4">Latest Verification News</h3>
                <p className="text-xl text-slate-400">Stay informed about misinformation trends and verification breakthroughs</p>
              </div>
              <Button variant="outline">
                View All News <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {latestNews.map((news, index) => (
                <FloatingCard key={news.id} delay={index * 100}>
                  <div className="flex items-start justify-between mb-6">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${news.category === 'Breaking' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        news.category === 'Technology' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        news.category === 'Politics' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        'bg-green-500/20 text-green-400 border border-green-500/30'
                      }
                    `}>
                      {news.category}
                    </span>
                    <div className="flex items-center text-slate-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {news.readTime}
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-bold text-white mb-4 leading-tight hover:text-blue-300 transition-colors">
                    {news.title}
                  </h4>
                  
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 line-clamp-3">
                    {news.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-slate-400 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {news.date}
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {news.views}
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      Read More <ExternalLink className="ml-2 w-3 h-3" />
                    </Button>
                  </div>
                </FloatingCard>
              ))}
            </div>
          </div>
        </section>
        
        {/* Trust Score Showcase */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-4xl font-bold text-white mb-8">
              See Our AI in Action
            </h3>
            <p className="text-xl text-slate-400 mb-16">
              Real examples of how our verification system analyzes content
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { score: 92, title: "Verified News Article", status: "High Trust" },
                { score: 45, title: "Suspicious Social Post", status: "Medium Trust" },
                { score: 12, title: "Confirmed Misinformation", status: "Low Trust" }
              ].map((example, index) => (
                <FloatingCard key={index} delay={index * 200}>
                  <div className="text-center py-8">
                    <TrustScoreVisualization score={example.score} size="small" />
                    <h4 className="text-lg font-bold text-white mt-6 mb-2">{example.title}</h4>
                    <p className="text-slate-400 text-sm">{example.status}</p>
                  </div>
                </FloatingCard>
              ))}
            </div>
          </div>
        </section>
        
        {/* Enhanced CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <FloatingCard className="text-center py-16 bg-gradient-to-r from-blue-900/20 to-indigo-900/20">
              <div className="mb-8">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                  <Shield className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-4xl font-bold text-white mb-6">
                  Ready to Fight Misinformation?
                </h3>
                <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of users who rely on DeFraudAI to verify content authenticity 
                  and protect themselves from deception in the digital age.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
                <Button size="xl" className="shadow-2xl shadow-blue-500/25">
                  <Zap className="mr-3 w-6 h-6" />
                  Start Free Verification
                </Button>
                <Button variant="glass" size="xl">
                  <Users className="mr-3 w-6 h-6" />
                  Join Community
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-8 text-slate-400 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  No signup required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  Instant results
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  Privacy protected
                </div>
              </div>
            </FloatingCard>
          </div>
        </section>
        
        {/* Enhanced Footer */}
        <footer className="bg-slate-900/90 backdrop-blur-2xl text-slate-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
                    <img 
                      src="/DeFraudAI_Logo-removebg-preview.png" 
                      alt="DeFraudAI Logo" 
                      className="relative w-14 h-14 object-contain rounded-full border-2 border-blue-500/50"
                    />
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-white">DeFraudAI</span>
                    <p className="text-slate-400 text-sm">AI-Powered Truth Verification</p>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed max-w-md mb-6">
                  Empowering users to identify misinformation and verify content authenticity 
                  through advanced artificial intelligence and machine learning technologies.
                </p>
                
              </div>
              <div>
                <h4 className="text-white font-semibold mb-6">Product</h4>
                <ul className="space-y-4">
                  {['Content Verification', 'Browser Extension', 'Mobile App'].map((item) => (
                    <li key={item}>
                      <Button variant="ghost" className="p-0 h-auto text-slate-400 hover:text-white">
                        {item}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-6">Company</h4>
                <ul className="space-y-4">
                  {['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'].map((item) => (
                    <li key={item}>
                      <Button variant="ghost" className="p-0 h-auto text-slate-400 hover:text-white">
                        {item}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-slate-500 text-sm mb-4 md:mb-0">
                  © 2025 DeFraudAI. All rights reserved. Fighting misinformation with AI.
                </p>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    System Status: Prototype
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}