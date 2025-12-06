/**
 * Analysis History Storage Utility
 * Stores and retrieves analysis history from localStorage
 */

const HISTORY_KEY = 'defraudai_analysis_history';
const MAX_HISTORY_ITEMS = 50;

export function getAnalysisHistory() {
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to read history:', error);
        return [];
    }
}

export function saveAnalysisToHistory(analysis) {
    try {
        const history = getAnalysisHistory();

        const newEntry = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            ...analysis,
        };

        // Add to beginning (most recent first)
        history.unshift(newEntry);

        // Keep only the last MAX_HISTORY_ITEMS
        const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

        localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));

        return newEntry;
    } catch (error) {
        console.error('Failed to save to history:', error);
        return null;
    }
}

export function clearAnalysisHistory() {
    try {
        localStorage.removeItem(HISTORY_KEY);
        return true;
    } catch (error) {
        console.error('Failed to clear history:', error);
        return false;
    }
}

export function deleteAnalysisById(id) {
    try {
        const history = getAnalysisHistory();
        const filtered = history.filter(item => item.id !== id);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Failed to delete item:', error);
        return false;
    }
}

export function getAnalysisStats() {
    const history = getAnalysisHistory();

    const stats = {
        totalAnalyses: history.length,
        deepfakesDetected: 0,
        authenticMedia: 0,
        suspiciousContent: 0,
        mediaAnalyses: 0,
        textAnalyses: 0,
        thisMonth: 0,
        thisWeek: 0,
    };

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    history.forEach(item => {
        const itemDate = new Date(item.timestamp);

        // Time-based stats
        if (itemDate >= weekAgo) stats.thisWeek++;
        if (itemDate >= monthAgo) stats.thisMonth++;

        // Type-based stats
        if (item.type === 'media') {
            stats.mediaAnalyses++;
            if (item.result?.is_fake || item.result?.isOriginal === false) {
                stats.deepfakesDetected++;
            } else {
                stats.authenticMedia++;
            }
        } else if (item.type === 'text') {
            stats.textAnalyses++;
            if (item.result?.trustScore < 50) {
                stats.suspiciousContent++;
            }
        }
    });

    return stats;
}
