// DeFraudAI Browser Extension - Popup Script

document.addEventListener("DOMContentLoaded", () => {
    const statusDot = document.getElementById("statusDot");
    const statusText = document.getElementById("statusText");
    const geminiDot = document.getElementById("geminiDot");
    const geminiText = document.getElementById("geminiText");
    const apiUrlInput = document.getElementById("apiUrl");
    const saveApiBtn = document.getElementById("saveApiBtn");
    const apiStatus = document.getElementById("apiStatus");

    // Load current API URL
    chrome.runtime.sendMessage({ action: "getApiUrl" }, (response) => {
        if (response && response.url) {
            apiUrlInput.value = response.url;
        }
    });

    // Save API URL
    saveApiBtn.addEventListener("click", () => {
        const newUrl = apiUrlInput.value.trim();
        if (!newUrl) {
            apiStatus.textContent = "Please enter a valid URL";
            apiStatus.style.color = "#ef4444";
            return;
        }

        chrome.runtime.sendMessage({ action: "setApiUrl", url: newUrl }, (response) => {
            if (response && response.success) {
                apiStatus.textContent = "Saved! Refreshing status...";
                apiStatus.style.color = "#22c55e";
                // Refresh status after saving
                setTimeout(checkStatus, 500);
            }
        });
    });

    // Check backend status
    function checkStatus() {
        statusDot.className = "status-dot";
        geminiDot.className = "status-dot";
        statusText.textContent = "Checking...";
        geminiText.textContent = "Checking...";

        chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
            if (response && response.online) {
                statusDot.classList.add("online");
                statusText.textContent = "Online ✓";

                // Check Gemini configuration
                if (response.data && response.data.gemini_configured) {
                    geminiDot.classList.add("online");
                    geminiText.textContent = "Configured ✓";
                } else {
                    geminiDot.classList.add("warning");
                    geminiText.textContent = "Not configured";
                }
            } else {
                statusDot.classList.add("offline");
                statusText.textContent = "Offline";
                geminiDot.classList.add("offline");
                geminiText.textContent = "Unavailable";
            }
        });
    }

    // Initial status check
    checkStatus();
});
