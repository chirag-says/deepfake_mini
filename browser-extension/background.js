// DeFraudAI Browser Extension - Background Service Worker
// Uses Ensemble Analysis (Local Model + Gemini API)

const API_BASE = "http://localhost:8000";

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "defraudai-check-image",
        title: "🔍 Check with DeFraudAI (Ensemble AI)",
        contexts: ["image"]
    });
    console.log("DeFraudAI context menu installed");
});

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
            // Fetch the image
            const response = await fetch(info.srcUrl);
            const blob = await response.blob();

            // Create FormData
            const formData = new FormData();
            formData.append("file", blob, "image.jpg");

            // Send to ENSEMBLE endpoint (combines Local + Gemini)
            const analysisResponse = await fetch(`${API_BASE}/analyze-ensemble`, {
                method: "POST",
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
                    ? "Backend offline. Start: python src/backend/main.py"
                    : error.message
            });
        }
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getStatus") {
        fetch(`${API_BASE}/`)
            .then(res => res.json())
            .then(data => sendResponse({ online: true, data }))
            .catch(() => sendResponse({ online: false }));
        return true; // Keep channel open for async response
    }
});
