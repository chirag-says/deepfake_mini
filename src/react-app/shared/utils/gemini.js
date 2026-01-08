/**
 * Gemini API Utility - Secure Proxy Version
 * 
 * This module routes all Gemini API calls through the backend proxy
 * to keep the API key secure on the server side.
 * 
 * SECURITY: The VITE_GEMINI_API_KEY is NO LONGER used client-side.
 * All requests go through /api/gemini-proxy on our backend.
 */

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/**
 * Make a request to our backend Gemini proxy.
 * 
 * SECURITY: Uses HttpOnly cookies for authentication.
 * The cookie is automatically sent via credentials: 'include'.
 */
async function makeProxyRequest(endpoint, body) {
  const headers = {
    "Content-Type": "application/json",
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    credentials: "include", // Use HttpOnly cookie for auth
    body: JSON.stringify(body),
  });

  if (response.ok) {
    return response.json();
  }

  // Handle errors
  const errorText = await response.text().catch(() => "");
  let parsed;
  try {
    parsed = errorText ? JSON.parse(errorText) : undefined;
  } catch {
    parsed = undefined;
  }

  const detailedMessage =
    parsed?.detail ||
    parsed?.error?.message ||
    parsed?.message ||
    errorText ||
    `${response.status} ${response.statusText}`;

  const error = new Error(`Gemini request failed: ${detailedMessage}`);
  error.status = response.status;
  error.details = parsed;
  throw error;
}

/**
 * Call Gemini API through our secure backend proxy
 * 
 * @param {Object} options - Request options
 * @param {Array} options.contents - The content parts to send
 * @param {string} [options.model] - Model name (default: gemini-2.5-flash)
 * @param {Object} [options.generationConfig] - Generation configuration
 * @param {Array} [options.safetySettings] - Safety settings
 * @param {Object} [options.systemInstruction] - System instruction
 * @returns {Promise<Object>} - The Gemini API response
 * 
 * @example
 * const response = await callGemini({
 *   contents: [{ parts: [{ text: "Hello, how are you?" }] }],
 *   model: "gemini-2.5-flash"
 * });
 */
export async function callGemini({
  contents,
  model = "gemini-2.5-flash",
  generationConfig,
  safetySettings,
  systemInstruction,
  // These parameters are ignored - API key is now server-side only
  // eslint-disable-next-line no-unused-vars
  apiKey,
  // eslint-disable-next-line no-unused-vars
  fallbackModels,
  // eslint-disable-next-line no-unused-vars
  tools,
  // eslint-disable-next-line no-unused-vars
  toolConfig,
} = {}) {
  if (!contents?.length) {
    throw new Error("Gemini request requires at least one content part.");
  }

  const requestBody = {
    contents,
    model,
  };

  if (generationConfig) requestBody.generationConfig = generationConfig;
  if (safetySettings) requestBody.safetySettings = safetySettings;
  if (systemInstruction) requestBody.systemInstruction = systemInstruction;

  return makeProxyRequest("/api/gemini-proxy", requestBody);
}

/**
 * Analyze an image for deepfake detection using Gemini Vision
 * Routes through our secure backend proxy
 * 
 * @param {Object} options - Analysis options
 * @param {string} options.imageBase64 - Base64 encoded image data (without data URL prefix)
 * @param {string} [options.mimeType] - MIME type of the image (default: image/jpeg)
 * @param {string} [options.analysisType] - Type of analysis (default: deepfake)
 * @returns {Promise<Object>} - Analysis result with is_fake, confidence, reasons
 * 
 * @example
 * const result = await analyzeImageWithGemini({
 *   imageBase64: "base64EncodedImageData...",
 *   mimeType: "image/png"
 * });
 * console.log(result.is_fake, result.confidence);
 */
export async function analyzeImageWithGemini({
  imageBase64,
  mimeType = "image/jpeg",
  analysisType = "deepfake",
} = {}) {
  if (!imageBase64) {
    throw new Error("Image data is required for analysis.");
  }

  // Remove data URL prefix if present
  const base64Data = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;

  return makeProxyRequest("/api/gemini-proxy/analyze-image", {
    image_base64: base64Data,
    mime_type: mimeType,
    analysis_type: analysisType,
  });
}

/**
 * Helper to convert a File/Blob to base64
 * 
 * @param {File|Blob} file - The file to convert
 * @returns {Promise<{base64: string, mimeType: string}>}
 */
export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(",")[1];
      resolve({
        base64,
        mimeType: file.type || "image/jpeg",
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convenience function to analyze a File object
 * 
 * @param {File} file - Image file to analyze
 * @returns {Promise<Object>} - Analysis result
 */
export async function analyzeImageFile(file) {
  const { base64, mimeType } = await fileToBase64(file);
  return analyzeImageWithGemini({
    imageBase64: base64,
    mimeType,
  });
}
