const DEFAULT_API_ROOTS = [
  import.meta.env.VITE_GEMINI_API_ROOT?.replace(/\/$/, ""),
  "https://generativelanguage.googleapis.com/v1beta",
].filter(Boolean);

function normalizeModelName(model) {
  return model?.trim() || undefined;
}

function addModelVariant(set, modelName) {
  const normalized = normalizeModelName(modelName);
  if (!normalized) return;
  set.add(normalized);
}

function buildModelFallbacks(requestedModel, additionalModels = []) {
  const baseModel =
    normalizeModelName(requestedModel) ||
    normalizeModelName(import.meta.env.VITE_GEMINI_MODEL_NAME) ||
    "gemini-2.5-flash";

  const fallbackSet = new Set();

  addModelVariant(fallbackSet, baseModel);
  // Use gemini-2.5-flash as the primary available model
  addModelVariant(fallbackSet, "gemini-2.5-flash");
  addModelVariant(fallbackSet, "gemini-2.5-flash-lite");

  additionalModels.forEach((modelName) =>
    addModelVariant(fallbackSet, modelName)
  );

  return Array.from(fallbackSet);
}

async function makeRequest({ endpoint, body, headers = {} }) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    return response.json();
  }

  const errorText = await response.text().catch(() => "");
  let parsed;
  try {
    parsed = errorText ? JSON.parse(errorText) : undefined;
  } catch (parseError) {
    parsed = undefined;
  }
  const detailedMessage =
    parsed?.error?.message ||
    parsed?.message ||
    errorText ||
    `${response.status} ${response.statusText}`;
  const enrichedMessage = `Gemini request failed (${response.status} ${response.statusText}): ${detailedMessage}`;
  const error = new Error(enrichedMessage);
  error.status = response.status;
  if (parsed?.error) {
    error.code = parsed.error.status;
    error.details = parsed.error;
  }
  throw error;
}

export async function callGemini({
  contents,
  model,
  fallbackModels = [],
  generationConfig,
  safetySettings,
  systemInstruction,
  tools,
  toolConfig,
  apiKey = import.meta.env.VITE_GEMINI_API_KEY,
} = {}) {
  if (!apiKey) {
    throw new Error(
      "Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your environment."
    );
  }

  if (!contents?.length) {
    throw new Error("Gemini request requires at least one content part.");
  }

  const requestBody = { contents };
  if (generationConfig) requestBody.generationConfig = generationConfig;
  if (safetySettings) requestBody.safetySettings = safetySettings;
  if (systemInstruction) requestBody.systemInstruction = systemInstruction;
  if (tools) requestBody.tools = tools;
  if (toolConfig) requestBody.toolConfig = toolConfig;

  const modelsToTry = buildModelFallbacks(
    model || import.meta.env.VITE_GEMINI_MODEL_NAME,
    fallbackModels
  );
  let lastError;
  const attempts = [];

  for (const apiRoot of DEFAULT_API_ROOTS) {
    for (const currentModel of modelsToTry) {
      const endpoint = `${apiRoot}/models/${currentModel}:generateContent`;
      try {
        return await makeRequest({
          endpoint,
          body: requestBody,
          headers: {
            "X-goog-api-key": apiKey,
          },
        });
      } catch (error) {
        lastError = error;
        attempts.push({
          apiRoot,
          model: currentModel,
          status: error.status,
          code: error.code,
          message: error.message,
        });
        if (error.status !== 404 && error.status !== 429) {
          error.attemptedModels = attempts;
          throw error;
        }
        // Continue trying fallbacks if we hit a 404 (model not found) or 429 (rate limit)
      }
    }
  }

  if (lastError) {
    lastError.attemptedModels = attempts;
    throw lastError;
  }

  const unknownError = new Error("Gemini request failed with unknown error.");
  unknownError.attemptedModels = attempts;
  throw unknownError;
}
