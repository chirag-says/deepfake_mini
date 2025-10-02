function toNumber(value, fallback = 0) {
  if (value === null || value === undefined) return fallback;
  const num = Number(value);
  if (Number.isFinite(num)) {
    return Math.max(0, Math.min(100, num));
  }
  return fallback;
}

function toStringValue(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn("Unable to serialise value", value, error);
    return fallback;
  }
}

function toStringArray(value) {
  if (!value) return [];
  const array = Array.isArray(value) ? value : [value];
  return array
    .map((item) => toStringValue(item, ""))
    .filter((item) => item.length > 0);
}

function normaliseSources(sourceValue) {
  if (!sourceValue) return [];
  const array = Array.isArray(sourceValue) ? sourceValue : [sourceValue];

  return array
    .map((raw) => {
      if (typeof raw === "string") {
        return {
          name: raw,
          url: "",
          credibility: 60,
          relevance: 60,
        };
      }

      if (typeof raw === "object" && raw !== null) {
        const name = toStringValue(raw.name || raw.title, "Referenced Source");
        const url = toStringValue(raw.url || raw.link || raw.href, "");
        return {
          name,
          url,
          credibility: toNumber(raw.credibility ?? raw.score ?? raw.confidence ?? 60, 60),
          relevance: toNumber(raw.relevance ?? raw.weight ?? raw.support ?? 60, 60),
        };
      }

      return null;
    })
    .filter(Boolean);
}

export function parseAnalysisResponse(responseText) {
  try {
    const jsonMatch =
      responseText.match(/```json\n([\s\S]*?)\n```/) ||
      responseText.match(/```\n([\s\S]*?)\n```/) ||
      responseText.match(/{[\s\S]*}/);

    if (!jsonMatch) {
      throw new Error("No JSON found");
    }

    const jsonString = jsonMatch[1] || jsonMatch[0];
    const analysisData = JSON.parse(jsonString);

    return {
      factualAccuracy: toNumber(analysisData.factualAccuracy, 50),
      bias: toNumber(analysisData.bias, 50),
      sourceQuality: toNumber(analysisData.sourceQuality, 50),
      trustScore: toNumber(analysisData.trustScore, 50),
      status: toStringValue(analysisData.status, "success"),
      message: toStringValue(analysisData.message, ""),
      flags: toStringArray(analysisData.flags),
      highlights: toStringArray(analysisData.highlights),
      sources: normaliseSources(analysisData.sources),
    };
  } catch (error) {
    console.error("Failed to parse analysis response:", error);
    return {
      factualAccuracy: 50,
      bias: 50,
      sourceQuality: 50,
      trustScore: 50,
      status: "success",
      message: toStringValue(responseText, ""),
      flags: [],
      highlights: [],
      sources: [],
    };
  }
}

export function calculateTrustScore(
  factualAccuracy,
  bias,
  sourceQuality,
  flags,
  highlights,
  aiTrustScore
) {
  const baseScore =
    aiTrustScore !== undefined
      ? aiTrustScore
      : factualAccuracy * 0.5 + bias * 0.3 + sourceQuality * 0.2;

  const flagDeduction = Math.min(30, (flags?.length ?? 0) * 5);
  const highlightAddition = Math.min(15, (highlights?.length ?? 0) * 3);

  const score = Math.max(
    0,
    Math.min(100, baseScore - flagDeduction + highlightAddition)
  );
  return Math.round(score);
}
