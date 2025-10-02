const SUSPICIOUS_PATTERNS = [
  /100%\s+(success|cure|effective|guaranteed)/i,
  /doctors\s+hate\s+this/i,
  /miracle\s+cure/i,
  /big\s+pharma/i,
  /government\s+cover.?up/i,
  /they\s+don't\s+want\s+you\s+to\s+know/i,
  /shocking\s+revelation/i,
  /breaking.*immediately/i,
  /urgent.*share/i,
  /forward\s+to\s+everyone/i,
];

const HEALTH_MISINFO_PATTERNS = [
  /cure.*cancer/i,
  /lose.*weight.*overnight/i,
  /never\s+see\s+doctor\s+again/i,
  /natural\s+remedy.*everything/i,
];

const POLITICAL_MISINFO_PATTERNS = [
  /new\s+tax.*50%/i,
  /government\s+announces.*immediately/i,
  /martial\s+law/i,
  /election.*rigged/i,
];

const BIAS_INDICATORS = [
  /always/i,
  /never/i,
  /everyone/i,
  /no\s+one/i,
  /clearly/i,
  /obviously/i,
  /undeniably/i,
];

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function createSeed(content) {
  let hash = 0;
  for (let index = 0; index < content.length; index += 1) {
    hash = (hash << 5) - hash + content.charCodeAt(index);
    hash |= 0; // Convert to 32bit integer
  }
  return hash >>> 0;
}

function createRandom(seed) {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function extractSources(content) {
  const urlRegex = /(https?:\/\/[^\s)\]]+)/gi;
  const urls = Array.from(new Set(content.match(urlRegex) || []));
  if (urls.length === 0) {
    return [];
  }

  const seed = createSeed(content);
  const random = createRandom(seed);
  return urls.map((url) => {
    let hostname;
    try {
      hostname = new URL(url).hostname.replace(/^www\./, "");
    } catch (error) {
      hostname = url;
    }

    const baseCredibility = 60 + random() * 35; // 60 - 95
    const baseRelevance = 50 + random() * 45; // 50 - 95

    return {
      name: hostname || "Referenced Source",
      url,
      credibility: clamp(baseCredibility),
      relevance: clamp(baseRelevance),
    };
  });
}

function getKeywords(content) {
  const words = content
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((word) => word.length > 5);

  const unique = Array.from(new Set(words));
  return unique.slice(0, 6);
}

export function generateFallbackFactAnalysis(content) {
  const lowerContent = content.toLowerCase();
  const flags = [];
  const highlights = [];

  let trustScore = 82;

  const suspiciousMatches = SUSPICIOUS_PATTERNS.filter((pattern) =>
    pattern.test(content)
  );
  trustScore -= suspiciousMatches.length * 8;
  if (suspiciousMatches.length > 0) {
    flags.push("Sensational language detected");
  }

  const healthMatches = HEALTH_MISINFO_PATTERNS.filter((pattern) =>
    pattern.test(content)
  );
  trustScore -= healthMatches.length * 10;
  if (healthMatches.length > 0) {
    flags.push("Potential health misinformation cues");
  }

  const politicalMatches = POLITICAL_MISINFO_PATTERNS.filter((pattern) =>
    pattern.test(content)
  );
  trustScore -= politicalMatches.length * 10;
  if (politicalMatches.length > 0) {
    flags.push("Possible political misinformation");
  }

  const urgencyWords = (lowerContent.match(/urgent|immediately|breaking|emergency|alert/g) || []).length;
  if (urgencyWords >= 2) {
    flags.push("High urgency language detected");
    trustScore -= 6;
  }

  const hasSources = /https?:\/\//i.test(content) || /according to/i.test(content);
  if (!hasSources) {
    flags.push("No explicit sources referenced");
    trustScore -= 8;
  } else {
    highlights.push("External references detected");
  }

  const uppercaseRatio = (content.match(/[A-Z]{3,}/g) || []).length;
  if (uppercaseRatio > 4) {
    flags.push("Consistent emphasis (all-caps) detected");
    trustScore -= 5;
  }

  const biasTriggers = BIAS_INDICATORS.filter((pattern) => pattern.test(content));
  if (biasTriggers.length > 2) {
    flags.push("Potential bias reinforcing language");
    trustScore -= 5;
  }

  const sources = extractSources(content);
  if (sources.length > 0) {
    highlights.push("Citations included for verification");
  }

  const factualAccuracy = clamp(trustScore + (sources.length > 0 ? 5 : -5));
  const biasScore = clamp(100 - biasTriggers.length * 12 + (hasSources ? 5 : 0));
  const sourceQuality = clamp(sources.length > 0 ? 65 + sources.length * 5 : 45 - flags.length * 2);

  const status = trustScore >= 78 ? "verified" : trustScore >= 58 ? "suspicious" : "false";
  const message =
    status === "verified"
      ? "Heuristic analysis indicates credible language patterns."
      : status === "suspicious"
      ? "Mixed indicators present; manually confirm with cited sources."
      : "Multiple high-risk signals detected. Treat this content with caution.";

  const keywords = getKeywords(content);
  if (keywords.length > 0) {
    highlights.push(`Key topics identified: ${keywords.slice(0, 3).join(", ")}`);
  }

  return {
    trustScore: clamp(trustScore),
    status,
    message,
    sources,
    analysis: {
      factualAccuracy,
      bias: biasScore,
      sourceQuality,
      flags,
      highlights,
      keywords,
      checkedAt: new Date().toISOString(),
    },
  };
}
