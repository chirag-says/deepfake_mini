import { useState, useEffect, useRef } from "react";
import { Search, AlertTriangle, Upload, Globe, ArrowRight, ExternalLink, CheckCircle, XCircle, Clock, Calendar, TrendingUp, Eye } from "lucide-react";
import AnalysisResult from "../components/AnalysisResult";
import ContentInput from "../components/ContentInput";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/web";

// Enhanced Neural Network Background Component
function NeuralNetworkBackground() {
  const groupRef = useRef();
  const linesRef = useRef();
  const particlesRef = useRef();
  
  // Create neural network nodes with more sophisticated positioning
  const [nodes] = useState(() => {
    const positions = [];
    const colors = [];
    const sizes = [];
    const nodeCount = 200;
    const layers = 5;
    const nodesPerLayer = Math.floor(nodeCount / layers);
    
    for (let i = 0; i < nodeCount; i++) {
      const layer = Math.floor(i / nodesPerLayer);
      const layerPosition = (i % nodesPerLayer) / (nodesPerLayer - 1) - 0.5; // -0.5 to 0.5
      
      // Create a more organic, curved layout
      const curveOffset = Math.sin(layerPosition * Math.PI) * 2;
      
      positions.push(
        layer * 4 - 8, // x position (layer)
        curveOffset + (Math.random() - 0.5) * 2, // y position with curve
        layerPosition * 10 // z position
      );
      
      // Color gradient from blue to purple to pink to green
      const layerColor = new THREE.Color();
      const colorProgress = layer / (layers - 1);
      layerColor.setHSL(0.6 - colorProgress * 0.3, 0.8, 0.6); // Hue from blue to green
      
      colors.push(layerColor.r, layerColor.g, layerColor.b);
      
      // Variable sizes based on layer importance
      const sizeMultiplier = layer === 0 || layer === layers - 1 ? 1.5 : 1;
      sizes.push((Math.random() * 0.15 + 0.1) * sizeMultiplier);
    }
    
    return { positions: new Float32Array(positions), colors: new Float32Array(colors), sizes: new Float32Array(sizes) };
  });
  
  // Create connections with more sophisticated patterns
  const [connections] = useState(() => {
    const connections = [];
    const nodeCount = 200;
    const layers = 5;
    const nodesPerLayer = Math.floor(nodeCount / layers);
    
    // Create connections between nodes in adjacent layers
    for (let i = 0; i < nodeCount - nodesPerLayer; i++) {
      const currentLayer = Math.floor(i / nodesPerLayer);
      const nextLayerStart = (currentLayer + 1) * nodesPerLayer;
      
      // Create more connections for middle layers
      const connectionsCount = currentLayer === 0 || currentLayer === layers - 2 ? 2 : 4;
      
      for (let j = 0; j < connectionsCount; j++) {
        const targetIndex = nextLayerStart + Math.floor(Math.random() * nodesPerLayer);
        connections.push([i, targetIndex]);
      }
    }
    
    // Add some cross-connections for complexity
    for (let i = 0; i < 20; i++) {
      const layer = Math.floor(Math.random() * (layers - 2)) + 1;
      const startIndex = layer * nodesPerLayer + Math.floor(Math.random() * nodesPerLayer);
      const endIndex = (layer + 1) * nodesPerLayer + Math.floor(Math.random() * nodesPerLayer);
      connections.push([startIndex, endIndex]);
    }
    
    return connections;
  });
  
  // Create flowing particles
  const [particles] = useState(() => {
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        position: Math.random(),
        speed: 0.001 + Math.random() * 0.003,
        connectionIndex: Math.floor(Math.random() * connections.length),
        size: Math.random() * 0.05 + 0.02,
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6)
      });
    }
    return particles;
  });
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Subtle rotation and scaling
      const time = state.clock.elapsedTime;
      groupRef.current.rotation.y = Math.sin(time * 0.05) * 0.1;
      groupRef.current.rotation.x = Math.cos(time * 0.03) * 0.05;
      
      // Breathing effect
      const scale = 1 + Math.sin(time * 1.5) * 0.02;
      groupRef.current.scale.set(scale, scale, scale);
    }
    
    // Animate line connections with wave effect
    if (linesRef.current) {
      const time = state.clock.elapsedTime;
      linesRef.current.children.forEach((line, i) => {
        const material = line.material;
        if (material) {
          // Create a wave effect through the network
          const wave = Math.sin(time * 3 + i * 0.05) * 0.5 + 0.5;
          material.opacity = wave * 0.4 + 0.1;
          
          // Pulse effect on lines
          const pulse = Math.sin(time * 5 + i * 0.1) * 0.2 + 0.8;
          material.opacity *= pulse;
        }
      });
    }
    
    // Animate flowing particles
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      particlesRef.current.children.forEach((particle, i) => {
        const particleData = particles[i];
        particleData.position += particleData.speed;
        
        if (particleData.position > 1) {
          particleData.position = 0;
          particleData.connectionIndex = Math.floor(Math.random() * connections.length);
        }
        
        // Update particle position along connection
        const connection = connections[particleData.connectionIndex];
        if (connection) {
          const startPos = new THREE.Vector3(
            nodes.positions[connection[0] * 3],
            nodes.positions[connection[0] * 3 + 1],
            nodes.positions[connection[0] * 3 + 2]
          );
          
          const endPos = new THREE.Vector3(
            nodes.positions[connection[1] * 3],
            nodes.positions[connection[1] * 3 + 1],
            nodes.positions[connection[1] * 3 + 2]
          );
          
          const currentPos = startPos.clone().lerp(endPos, particleData.position);
          particle.position.copy(currentPos);
          
          // Add some wobble to the particle movement
          const wobble = Math.sin(time * 10 + i) * 0.1;
          particle.position.y += wobble;
        }
        
        // Pulsing glow effect
        const pulse = Math.sin(time * 8 + i) * 0.5 + 0.5;
        particle.material.opacity = pulse * 0.8 + 0.2;
      });
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Neural network nodes with glow effect */}
      <Points positions={nodes.positions} colors={nodes.colors} sizes={nodes.sizes} stride={7} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.9}
        />
      </Points>
      
      {/* Connections between nodes */}
      <group ref={linesRef}>
        {connections.map(([start, end], i) => {
          const startPos = new THREE.Vector3(
            nodes.positions[start * 3],
            nodes.positions[start * 3 + 1],
            nodes.positions[start * 3 + 2]
          );
          
          const endPos = new THREE.Vector3(
            nodes.positions[end * 3],
            nodes.positions[end * 3 + 1],
            nodes.positions[end * 3 + 2]
          );
          
          return (
            <Line
              key={i}
              points={[startPos, endPos]}
              color="white"
              lineWidth={0.8}
              transparent
              opacity={0.3}
            />
          );
        })}
      </group>
      
      {/* Flowing particles */}
      <group ref={particlesRef}>
        {particles.map((particle, i) => (
          <mesh key={i} position={[0, 0, 0]}>
            <sphereGeometry args={[particle.size, 8, 8]} />
            <meshBasicMaterial
              color={particle.color}
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Floating Card Component with Physics
function FloatingCard({ children, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  
  const props = useSpring({
    transform: hovered 
      ? "translateY(-10px) scale(1.02)" 
      : "translateY(0px) scale(1)",
    config: { mass: 1, tension: 300, friction: 40 },
    delay: delay
  });

  return (
    <animated.div 
      style={props}
      className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </animated.div>
  );
}

// Enhanced Button Component
function Button({ children, variant = "primary", className = "", ...props }) {
  const baseClasses = "px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
    secondary: "bg-slate-700/80 text-blue-300 border border-slate-600 hover:bg-slate-700 shadow hover:shadow-md transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
    outline: "bg-transparent border-2 border-blue-500 text-blue-300 hover:bg-blue-500/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
    success: "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50",
    warning: "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50",
    danger: "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50",
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Source Card Component
function SourceCard({ source, index }) {
  const credibility = source.credibility || 50;
  const credibilityColor = credibility >= 80 ? "text-green-400" : credibility >= 60 ? "text-amber-400" : "text-red-400";
  const credibilityLabel = credibility >= 80 ? "High" : credibility >= 60 ? "Medium" : "Low";
  
  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-white truncate">{source.name || `Source ${index + 1}`}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${credibilityColor} bg-slate-700/50`}>
          {credibilityLabel} Credibility
        </span>
      </div>
      
      {source.url && (
        <a 
          href={source.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center mb-3 truncate"
        >
          {source.url}
          <ExternalLink className="ml-1 w-3 h-3" />
        </a>
      )}
      
      {source.description && (
        <p className="text-slate-300 text-sm mb-3">{source.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${credibility >= 80 ? 'bg-green-500' : credibility >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${credibility}%` }}
          ></div>
        </div>
        <span className="text-slate-400 text-sm ml-2">{credibility}%</span>
      </div>
    </div>
  );
}

// Enhanced Analysis Result Component
function EnhancedAnalysisResult({ result }) {
  const trustScore = result.trustScore || 0;
  const status = result.status;
  const message = result.message;
  const sources = result.sources || [];
  const analysis = result.analysis || {};
  
  const statusIcon = status === "success" ? 
    <CheckCircle className="w-6 h-6 text-green-500" /> : 
    <XCircle className="w-6 h-6 text-red-500" />;
    
  const statusColor = status === "success" ? "text-green-500" : "text-red-500";
  const statusBg = status === "success" ? "bg-green-500/20" : "bg-red-500/20";
  
  // Determine trust level
  let trustLevel, trustColor, trustBg;
  if (trustScore >= 80) {
    trustLevel = "High Trust";
    trustColor = "text-green-500";
    trustBg = "bg-green-500/20";
  } else if (trustScore >= 60) {
    trustLevel = "Medium Trust";
    trustColor = "text-amber-500";
    trustBg = "bg-amber-500/20";
  } else {
    trustLevel = "Low Trust";
    trustColor = "text-red-500";
    trustBg = "bg-red-500/20";
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Analysis Results</h3>
        <div className={`flex items-center px-3 py-1 rounded-full ${statusBg} ${statusColor}`}>
          {statusIcon}
          <span className="ml-2 text-sm font-medium capitalize">{status}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-white">Trust Score</h4>
            <div className={`px-3 py-1 rounded-full ${trustBg} ${trustColor}`}>
              <span className="text-sm font-medium">{trustLevel}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-slate-700 stroke-current"
                  strokeWidth="10"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                ></circle>
                <circle
                  className={`${trustColor.replace('text', 'stroke')} current`}
                  strokeWidth="10"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * trustScore) / 100}
                ></circle>
                <text
                  x="50"
                  y="50"
                  className="text-2xl font-bold fill-current text-white"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {trustScore}%
                </text>
              </svg>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-slate-300 text-sm">
              Our AI has evaluated this content and assigned a trust score based on multiple factors.
            </p>
          </div>
        </div>
        
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h4 className="font-semibold text-white mb-4">Analysis Summary</h4>
          <div className="space-y-3">
            <p className="text-slate-300">{message}</p>
            
            {analysis.flags && analysis.flags.length > 0 && (
              <div className="mt-4">
                <h5 className="text-slate-400 text-sm font-medium mb-2">Potential Issues Detected:</h5>
                <div className="space-y-2">
                  {analysis.flags.map((flag, index) => (
                    <div key={index} className="flex items-center text-red-400 text-sm">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      {flag}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {analysis.highlights && analysis.highlights.length > 0 && (
              <div className="mt-4">
                <h5 className="text-slate-400 text-sm font-medium mb-2">Key Highlights:</h5>
                <div className="space-y-2">
                  {analysis.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {sources.length > 0 && (
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-white">Sources & References</h4>
            <span className="text-slate-400 text-sm">{sources.length} sources found</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((source, index) => (
              <SourceCard key={index} source={source} index={index} />
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="flex items-center text-slate-400 text-sm">
              <Clock className="w-4 h-4 mr-2" />
              <span>Sources verified in real-time. Information may change over time.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// News Card Component
function NewsCard({ news, index }) {
  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center text-slate-400 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{news.date}</span>
        </div>
        <div className="flex items-center text-slate-400 text-sm">
          <Eye className="w-4 h-4 mr-1" />
          <span>{news.views}</span>
        </div>
      </div>
      <h4 className="font-semibold text-white mb-2 line-clamp-2">{news.title}</h4>
      <p className="text-slate-300 text-sm mb-4 line-clamp-3">{news.description}</p>
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          news.category === 'Breaking' ? 'bg-red-500/20 text-red-400' :
          news.category === 'Technology' ? 'bg-blue-500/20 text-blue-400' :
          news.category === 'Politics' ? 'bg-purple-500/20 text-purple-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {news.category}
        </span>
        {/* Updated Read More button to link to the news URL */}
        <a 
          href={news.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border border-blue-500 text-blue-300 hover:bg-blue-500/10 hover:text-white transition-colors"
        >
          Read More <ExternalLink className="ml-1 w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// Fact/Myth Card Component
function FactMythCard({ item, index }) {
  const isFact = item.type === 'fact';
  const statusColor = isFact ? 'text-green-400' : 'text-red-400';
  const statusBg = isFact ? 'bg-green-500/20' : 'bg-red-500/20';
  const statusIcon = isFact ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />;
  
  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center text-slate-400 text-sm">
          <Clock className="w-4 h-4 mr-2" />
          <span>{item.date}</span>
        </div>
        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBg} ${statusColor}`}>
          {statusIcon}
          <span className="ml-1 capitalize">{item.type}</span>
        </div>
      </div>
      <h4 className="font-semibold text-white mb-2 line-clamp-2">{item.claim}</h4>
      <p className="text-slate-300 text-sm mb-3 line-clamp-2">{item.verdict}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-16 bg-slate-700 rounded-full h-2 mr-2">
            <div 
              className={`h-2 rounded-full ${isFact ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${item.trustScore}%` }}
            ></div>
          </div>
          <span className="text-slate-400 text-xs">{item.trustScore}%</span>
        </div>
        <Button variant="outline" className="text-xs py-1 px-3">
          Details
        </Button>
      </div>
    </div>
  );
}

export default function Home() {
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const canvasRef = useRef();

  // Mock data for latest news with real URLs
  const [latestNews] = useState([
    {
      id: 1,
      title: "New Study Reveals Alarming Spread of AI-Generated Misinformation",
      description: "Researchers find that AI-generated fake news spreads 6 times faster than traditional misinformation on social media platforms.",
      date: "2 hours ago",
      category: "Breaking",
      views: "12.5K",
      url: "https://example.com/ai-misinformation-study"
    },
    {
      id: 2,
      title: "Tech Giants Collaborate to Combat Deepfake Technology",
      description: "Major technology companies announce joint initiative to develop detection tools for AI-generated media and deepfakes.",
      date: "5 hours ago",
      category: "Technology",
      views: "8.2K",
      url: "https://example.com/tech-giants-deepfake"
    },
    {
      id: 3,
      title: "Election Integrity Concerns Rise with Advanced AI Manipulation",
      description: "Security experts warn about sophisticated AI tools being used to create misleading political content ahead of upcoming elections.",
      date: "1 day ago",
      category: "Politics",
      views: "15.7K",
      url: "https://example.com/election-ai-concerns"
    },
    {
      id: 4,
      title: "Breakthrough in Detecting AI-Generated Text Achieves 98% Accuracy",
      description: "New algorithm can distinguish between human-written and AI-generated text with unprecedented accuracy, researchers claim.",
      date: "1 day ago",
      category: "Technology",
      views: "9.4K",
      url: "https://example.com/ai-text-detection"
    }
  ]);

  // Mock data for recently tested facts and myths
  const [testedFactsMyths] = useState([
    {
      id: 1,
      claim: "5G technology causes COVID-19",
      verdict: "Completely false. No scientific evidence links 5G technology to the coronavirus pandemic.",
      type: "myth",
      date: "3 hours ago",
      trustScore: 5
    },
    {
      id: 2,
      claim: "Climate change is primarily caused by human activities",
      verdict: "True. Over 97% of climate scientists agree that human activities are the dominant cause of global warming.",
      type: "fact",
      date: "5 hours ago",
      trustScore: 97
    },
    {
      id: 3,
      claim: "Vaccines contain microchips for government tracking",
      verdict: "False. Vaccines do not contain microchips or tracking technology. This is a baseless conspiracy theory.",
      type: "myth",
      date: "1 day ago",
      trustScore: 2
    },
    {
      id: 4,
      claim: "Regular exercise significantly reduces risk of heart disease",
      verdict: "True. Multiple studies confirm that regular physical activity can reduce the risk of heart disease by up to 35%.",
      type: "fact",
      date: "2 days ago",
      trustScore: 95
    }
  ]);

  // Animation for hero section
  const heroAnimation = useSpring({
    opacity: 1,
    transform: "translateY(0)",
    from: { opacity: 0, transform: "translateY(20px)" },
    config: { mass: 1, tension: 280, friction: 60 }
  });

  // Animation for stats
  const statsAnimation = useSpring({
    opacity: 1,
    transform: "translateY(0)",
    from: { opacity: 0, transform: "translateY(20px)" },
    delay: 300,
    config: { mass: 1, tension: 280, friction: 60 }
  });

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

  // Improved trust score calculation
  const calculateTrustScore = (analysis, sources) => {
    let score = 50; // Start with a neutral score
    
    // Adjust based on analysis flags
    if (analysis?.flags?.length) {
      // Deduct points for each flag
      score -= analysis.flags.length * 10;
    }
    
    // Add points for highlights
    if (analysis?.highlights?.length) {
      score += analysis.highlights.length * 5;
    }
    
    // Adjust based on sources
    if (sources?.length > 0) {
      const avgCredibility = sources.reduce((sum, src) => sum + (src.credibility || 50), 0) / sources.length;
      // Weight the average credibility heavily in the final score
      score = (score * 0.4) + (avgCredibility * 0.6);
    } else {
      // No sources found - reduce score significantly
      score -= 20;
    }
    
    // Check for common misinformation indicators in the analysis
    const lowerCaseMessage = (analysis.message || "").toLowerCase();
    if (lowerCaseMessage.includes("fake") || 
        lowerCaseMessage.includes("false") || 
        lowerCaseMessage.includes("misinformation") || 
        lowerCaseMessage.includes("unverified") ||
        lowerCaseMessage.includes("hoax")) {
      score -= 25;
    }
    
    // Check for positive indicators
    if (lowerCaseMessage.includes("verified") || 
        lowerCaseMessage.includes("credible") || 
        lowerCaseMessage.includes("reliable") || 
        lowerCaseMessage.includes("authentic")) {
      score += 15;
    }
    
    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const analyzeContent = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      console.log(
        "Starting analysis for content:",
        content.substring(0, 100) + "..."
      );
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 relative overflow-hidden">
      {/* Enhanced Neural Network Background */}
      <div className="fixed inset-0 z-0">
        <Canvas ref={canvasRef} camera={{ position: [0, 0, 20], fov: 60 }}>
          <NeuralNetworkBackground />
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Fixed Header */}
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Fixed Logo */}
                <img 
                  src="/DeFraudAI_Logo-removebg-preview.png" 
                  alt="DeFraudAI Logo" 
                  className="w-20 h-20 object-contain rounded-full border-2 border-blue-500 shadow-lg"
                />
                <div>
                  <h1 className="text-2xl font-bold text-white">DeFraudAI</h1>
                  <p className="text-sm text-slate-400">
                    Combat misinformation with AI
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <nav className="flex space-x-2">
                  <Button variant="outline" className="text-sm">Verify Content</Button>
                  <Button variant="outline" className="text-sm">Myth Buster</Button>
                  <Button variant="outline" className="text-sm">About</Button>
                </nav>
              </div>
            </div>
          </div>
        </header>

        {/* Spacer for fixed header */}
        <div className="h-32"></div>

        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <animated.div style={heroAnimation}>
              <div className="mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 text-blue-300 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-blue-500/20">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Fighting misinformation in the digital age
                </div>
                <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                  Verify News & Detect
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    {" "}
                    Deepfakes
                  </span>
                </h2>
                <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
                  Paste any news article, social media post, or suspicious content.
                  Our AI analyzes it against trusted sources to give you an instant
                  credibility assessment.
                </p>
                <Button onClick={scrollToAnalysis} className="text-lg px-8 py-4 mx-auto">
                  Start Verifying Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </animated.div>

            {/* Stats */}
            <animated.div style={statsAnimation}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <FloatingCard delay={100}>
                  <div className="text-3xl font-bold text-blue-400 mb-2">99.2%</div>
                  <div className="text-slate-400 text-sm font-medium">Accuracy Rate</div>
                </FloatingCard>
                <FloatingCard delay={200}>
                  <div className="text-3xl font-bold text-green-400 mb-2">50K+</div>
                  <div className="text-slate-400 text-sm font-medium">Sources Verified</div>
                </FloatingCard>
                <FloatingCard delay={300}>
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    Real-time
                  </div>
                  <div className="text-slate-400 text-sm font-medium">Analysis</div>
                </FloatingCard>
              </div>
            </animated.div>
          </div>
        </section>

        {/* Analysis Section */}
        <section id="analysis-section" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <FloatingCard>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Content Verification
                </h3>
                <p className="text-slate-400">
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
                  <EnhancedAnalysisResult result={result} />
                </div>
              )}
            </FloatingCard>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-white mb-4">
                Comprehensive Verification
              </h3>
              <p className="text-xl text-slate-400">
                Multiple layers of AI-powered analysis
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FloatingCard delay={100}>
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20">
                  <Search className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-4">
                  Fact Checking
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Cross-references claims against trusted databases and
                  fact-checking organizations worldwide.
                </p>
                <Button variant="secondary" className="mt-6 text-sm">
                  Learn More
                </Button>
              </FloatingCard>
              <FloatingCard delay={200}>
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 border border-green-500/20">
                  <Upload className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-4">
                  Media Analysis
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Detects deepfakes, manipulated images, and doctored videos using
                  advanced AI models.
                </p>
                <Button variant="secondary" className="mt-6 text-sm">
                  Learn More
                </Button>
              </FloatingCard>
              <FloatingCard delay={300}>
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20">
                  <Globe className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-4">
                  Source Tracking
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Traces information origins and evaluates source credibility and
                  reliability scores.
                </p>
                <Button variant="secondary" className="mt-6 text-sm">
                  Learn More
                </Button>
              </FloatingCard>
            </div>
          </div>
        </section>

        {/* Latest News Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">Latest News</h3>
                <p className="text-slate-400">Stay updated with the most recent developments</p>
              </div>
              <Button variant="outline" className="flex items-center">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestNews.map((news, index) => (
                <FloatingCard key={news.id} delay={index * 100}>
                  <NewsCard news={news} index={index} />
                </FloatingCard>
              ))}
            </div>
          </div>
        </section>

        {/* Recently Tested Facts & Myths Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">Recently Tested Facts & Myths</h3>
                <p className="text-slate-400">See what we've verified recently</p>
              </div>
              <Button variant="outline" className="flex items-center">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testedFactsMyths.map((item, index) => (
                <FloatingCard key={item.id} delay={index * 100}>
                  <FactMythCard item={item} index={index} />
                </FloatingCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <FloatingCard>
              <div className="text-center py-12">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Ready to verify content?
                </h3>
                <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                  Join thousands of users who trust DeFraudAI to combat misinformation and fake content.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button className="px-8 py-4 text-lg">
                    Start Free Verification
                  </Button>
                  <Button variant="secondary" className="px-8 py-4 text-lg">
                    View Demo
                  </Button>
                </div>
              </div>
            </FloatingCard>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900/80 backdrop-blur-md text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-6 md:mb-0">
                <img 
                  src="/DeFraudAI_Logo-removebg-preview.png" 
                  alt="DeFraudAI Logo" 
                  className="w-12 h-12 object-contain rounded-full border-2 border-blue-500 shadow-lg"
                />
                <span className="text-xl font-bold text-white">DeFraudAI</span>
              </div>
              <div className="flex space-x-6">
                <Button variant="outline" className="text-sm">Privacy</Button>
                <Button variant="outline" className="text-sm">Terms</Button>
                <Button variant="outline" className="text-sm">Contact</Button>
              </div>
            </div>
            <p className="text-slate-500 text-center mt-8 mb-4">
              Building a more trustworthy digital world through AI-powered
              verification.
            </p>
            <p className="text-slate-600 text-sm text-center">
              © 2024 DeFraudAI. Fighting misinformation with artificial
              intelligence.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}