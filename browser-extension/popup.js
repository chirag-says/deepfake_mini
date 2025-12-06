// DeFraudAI Browser Extension - Popup Script

document.addEventListener("DOMContentLoaded", () => {
    const statusDot = document.getElementById("statusDot");
    const statusText = document.getElementById("statusText");
    const geminiDot = document.getElementById("geminiDot");
    const geminiText = document.getElementById("geminiText");

    // Check backend status
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
});
