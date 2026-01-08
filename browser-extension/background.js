// DeFraudAI Browser Extension - Background Service Worker
// Uses Ensemble Analysis (Local Model + Gemini API)

// ============================================
// API Configuration
// ============================================

// Default to production Railway URL, fallback to localhost for dev
const DEFAULT_API_URL = "https://defraudai-api-production.up.railway.app";
const DEV_API_URL = "http://localhost:8000";

// Get current API base URL from storage, or use default
async function getApiBase() {
    try {
        const result = await chrome.storage.sync.get(["apiBaseUrl"]);
        return result.apiBaseUrl || DEFAULT_API_URL;
    } catch {
        return DEFAULT_API_URL;
    }
}

// Set API base URL (called from popup settings)
async function setApiBase(url) {
    await chrome.storage.sync.set({ apiBaseUrl: url });
}

// ============================================
// Context Menu Setup
// ============================================

// Create context menu on install
chrome.runtime.onInstalled.addListener(async () => {
    chrome.contextMenus.create({
        id: "defraudai-check-image",
        title: "🔍 Check with DeFraudAI (Ensemble AI)",
        contexts: ["image"]
    });

    // Initialize with default API URL if not set
    const result = await chrome.storage.sync.get(["apiBaseUrl"]);
    if (!result.apiBaseUrl) {
        await chrome.storage.sync.set({ apiBaseUrl: DEFAULT_API_URL });
    }

    console.log("DeFraudAI context menu installed");
});

// ============================================
// Image Analysis Handler
// ============================================

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "defraudai-check-image" && info.srcUrl) {
        console.log("Analyzing image with Ensemble:", info.srcUrl);

        // Send message to content script to show loading overlay
        chrome.tabs.sendMessage(tab.id, {
            action: "showOverlay",
            status: "loading",
            message: "Running Ensemble Analysis (Local + Gemini)..."
        });

        try {
            const API_BASE = await getApiBase();

            // Fetch the image
            const response = await fetch(info.srcUrl);
            const blob = await response.blob();

            // Create FormData
            const formData = new FormData();
            formData.append("file", blob, "image.jpg");

            // Send to ENSEMBLE endpoint (combines Local + Gemini)
            const analysisResponse = await fetch(`${API_BASE}/analyze-ensemble`, {
                method: "POST",
                credentials: "include", // Include auth cookies
                body: formData
            });

            if (!analysisResponse.ok) {
                throw new Error("Backend server not responding");
            }

            const result = await analysisResponse.json();

            // Send result to content script
            chrome.tabs.sendMessage(tab.id, {
                action: "showOverlay",
                status: "complete",
                result: result
            });

        } catch (error) {
            console.error("DeFraudAI analysis failed:", error);
            chrome.tabs.sendMessage(tab.id, {
                action: "showOverlay",
                status: "error",
                message: error.message.includes("fetch")
                    ? "Backend offline. Check your API URL in extension settings."
                    : error.message
            });
        }
    }
});

// ============================================
// Message Handlers (for popup communication)
// ============================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getStatus") {
        // Get current API status
        getApiBase().then(apiBase => {
            fetch(`${apiBase}/`)
                .then(res => res.json())
                .then(data => sendResponse({ online: true, data, apiBase }))
                .catch(() => sendResponse({ online: false, apiBase }));
        });
        return true; // Keep channel open for async response
    }

    if (request.action === "setApiUrl") {
        // Update API URL from popup settings
        setApiBase(request.url).then(() => {
            sendResponse({ success: true });
        });
        return true;
    }

    if (request.action === "getApiUrl") {
        // Get current API URL
        getApiBase().then(url => {
            sendResponse({ url, defaultUrl: DEFAULT_API_URL, devUrl: DEV_API_URL });
        });
        return true;
    }
});
