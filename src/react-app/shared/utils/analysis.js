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
      factualAccuracy: analysisData.factualAccuracy ?? 50,
      bias: analysisData.bias ?? 50,
      sourceQuality: analysisData.sourceQuality ?? 50,
      trustScore: analysisData.trustScore ?? 50,
      status: analysisData.status ?? "success",
      message: analysisData.message ?? "",
      flags: analysisData.flags ?? [],
      highlights: analysisData.highlights ?? [],
      sources: analysisData.sources ?? [],
    };
  } catch (error) {
    console.error("Failed to parse analysis response:", error);
    return {
      factualAccuracy: 50,
      bias: 50,
      sourceQuality: 50,
      trustScore: 50,
      status: "success",
      message: responseText,
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
