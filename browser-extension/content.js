// DeFraudAI Browser Extension - Content Script
// Displays Ensemble Analysis Results

// Create overlay container
function createOverlay() {
    // Remove existing overlay if present
    const existing = document.getElementById("defraudai-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "defraudai-overlay";
    overlay.innerHTML = `
    <div class="defraudai-modal">
      <div class="defraudai-header">
        <span class="defraudai-logo">🛡️</span>
        <span class="defraudai-title">DeFraudAI Ensemble</span>
        <button class="defraudai-close" id="defraudai-close">×</button>
      </div>
      <div class="defraudai-content" id="defraudai-content">
        <div class="defraudai-loading">
          <div class="defraudai-spinner"></div>
          <p>Running Ensemble Analysis...</p>
          <p class="defraudai-subtext">Combining Local AI + Gemini Vision</p>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);

    // Close button handler
    document.getElementById("defraudai-close").addEventListener("click", () => {
        overlay.remove();
    });

    // Click outside to close
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
    });

    return overlay;
}

function showResult(result) {
    const content = document.getElementById("defraudai-content");
    if (!content) return;

    // Handle ensemble result format
    const ensemble = result.ensemble || {};
    const models = result.models || {};
    const isFake = ensemble.is_fake;
    const fakeProb = ensemble.fake_probability || 0;
    const realProb = ensemble.real_probability || 0;
    const consensus = ensemble.consensus;
    const modelsUsed = result.models_used || [];
    const reasons = models.gemini?.reasons || [];

    content.innerHTML = `
    <div class="defraudai-result ${isFake ? 'fake' : 'real'}">
      <div class="defraudai-verdict">
        <span class="defraudai-icon">${isFake ? '⚠️' : '✅'}</span>
        <span class="defraudai-verdict-text">${ensemble.verdict || (isFake ? 'LIKELY FAKE' : 'AUTHENTIC')}</span>
      </div>
      
      <div class="defraudai-ensemble-score">
        <div class="defraudai-score-label">Ensemble Confidence</div>
        <div class="defraudai-score-value ${isFake ? 'fake' : 'real'}">${ensemble.confidence || Math.max(fakeProb, realProb).toFixed(1)}%</div>
      </div>

      <div class="defraudai-consensus ${consensus === 'agreement' ? 'agree' : consensus === 'disagreement' ? 'disagree' : ''}">
        ${consensus === 'agreement' ? '✓ Both models agree' : consensus === 'disagreement' ? '⚡ Models disagree - needs review' : ''}
      </div>

      <div class="defraudai-models-section">
        <div class="defraudai-section-title">Model Breakdown</div>
        
        ${models.local?.available ? `
        <div class="defraudai-model-row">
          <span class="defraudai-model-name">🤖 Local ViT</span>
          <div class="defraudai-mini-bar">
            <div class="defraudai-mini-fill ${models.local.fake_probability > 50 ? 'fake' : 'real'}" 
                 style="width: ${models.local.fake_probability}%"></div>
          </div>
          <span class="defraudai-model-score">${models.local.fake_probability}% fake</span>
        </div>
        ` : ''}
        
        ${models.gemini?.available ? `
        <div class="defraudai-model-row">
          <span class="defraudai-model-name">✨ Gemini</span>
          <div class="defraudai-mini-bar">
            <div class="defraudai-mini-fill ${models.gemini.fake_probability > 50 ? 'fake' : 'real'}" 
                 style="width: ${models.gemini.fake_probability}%"></div>
          </div>
          <span class="defraudai-model-score">${models.gemini.fake_probability}% fake</span>
        </div>
        ` : '<div class="defraudai-model-row disabled">✨ Gemini: Not configured</div>'}
      </div>

      ${reasons.length > 0 ? `
      <div class="defraudai-reasons">
        <div class="defraudai-section-title">🔍 AI Analysis</div>
        <ul>
          ${reasons.slice(0, 3).map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <div class="defraudai-footer">
        <span class="defraudai-models-used">Models: ${modelsUsed.join(' + ') || 'Unknown'}</span>
      </div>
    </div>
  `;
}

function showError(message) {
    const content = document.getElementById("defraudai-content");
    if (!content) return;

    content.innerHTML = `
    <div class="defraudai-error">
      <span class="defraudai-icon">❌</span>
      <p>${message}</p>
      <p class="defraudai-hint">Make sure the local server is running and Gemini API key is set.</p>
    </div>
  `;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showOverlay") {
        if (request.status === "loading") {
            createOverlay();
        } else if (request.status === "complete") {
            showResult(request.result);
        } else if (request.status === "error") {
            showError(request.message);
        }
    }
});
