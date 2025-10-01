import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { cors } from "hono/cors";
import { AnalysisRequestSchema } from "../shared/types";
const app = new Hono();
// Enable CORS for all routes
app.use('*', cors());
// Analysis endpoint
app.post('/api/analyze', zValidator('json', AnalysisRequestSchema), async (c) => {
    try {
        const { content } = c.req.valid('json');
        // Generate content hash for caching
        const encoder = new TextEncoder();
        const data = encoder.encode(content.toLowerCase().trim());
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        // Check if we have a cached result
        const cached = await c.env.DB.prepare('SELECT * FROM analysis_results WHERE content_hash = ? ORDER BY created_at DESC LIMIT 1').bind(contentHash).first();
        if (cached) {
            const result = {
                trustScore: Number(cached.trust_score),
                status: String(cached.status),
                message: String(cached.analysis_message || ''),
                sources: JSON.parse(String(cached.sources || '[]')),
                analysis: {
                    keywords: JSON.parse(String(cached.keywords || '[]')),
                    flags: JSON.parse(String(cached.flags || '[]')),
                    checkedAt: String(cached.created_at),
                },
            };
            return c.json(result);
        }
        // Perform analysis
        const analysisResult = await analyzeContent(content);
        // Store result in database
        await c.env.DB.prepare(`INSERT INTO analysis_results 
       (content_hash, original_content, trust_score, status, analysis_message, keywords, flags, sources) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(contentHash, content, analysisResult.trustScore, analysisResult.status, analysisResult.message, JSON.stringify(analysisResult.analysis?.keywords || []), JSON.stringify(analysisResult.analysis?.flags || []), JSON.stringify(analysisResult.sources)).run();
        return c.json(analysisResult);
    }
    catch (error) {
        console.error('Analysis error:', error);
        return c.json({
            trustScore: 0,
            status: 'error',
            message: 'Analysis failed. Please try again.',
            sources: [],
        }, 500);
    }
});
// Health check endpoint
app.get('/api/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Mock analysis function
async function analyzeContent(content) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    const text = content.toLowerCase();
    const words = text.split(/\s+/);
    // Detect suspicious patterns
    const suspiciousPatterns = [
        /100% (success|cure|effective|guaranteed)/i,
        /doctors hate this/i,
        /miracle cure/i,
        /big pharma/i,
        /government cover.?up/i,
        /they don't want you to know/i,
        /shocking revelation/i,
        /breaking.*immediately/i,
        /urgent.*share/i,
        /forward to everyone/i,
    ];
    const healthMisinfoPatterns = [
        /cure.*cancer/i,
        /lose.*weight.*overnight/i,
        /never see doctor again/i,
        /natural remedy.*everything/i,
    ];
    const politicalMisinfoPatterns = [
        /new tax.*50%/i,
        /government announces.*immediately/i,
        /martial law/i,
        /election.*rigged/i,
    ];
    let trustScore = 70; // Start with neutral score
    const flags = [];
    const keywords = [];
    // Check for suspicious patterns
    let suspiciousCount = 0;
    suspiciousPatterns.forEach(pattern => {
        if (pattern.test(content)) {
            suspiciousCount++;
            trustScore -= 15;
        }
    });
    // Check for health misinformation
    healthMisinfoPatterns.forEach(pattern => {
        if (pattern.test(content)) {
            flags.push('Potential health misinformation detected');
            trustScore -= 20;
        }
    });
    // Check for political misinformation
    politicalMisinfoPatterns.forEach(pattern => {
        if (pattern.test(content)) {
            flags.push('Potential political misinformation detected');
            trustScore -= 25;
        }
    });
    // Check for excessive urgency
    const urgencyWords = ['urgent', 'immediately', 'breaking', 'emergency', 'alert'];
    const urgencyCount = urgencyWords.filter(word => text.includes(word)).length;
    if (urgencyCount >= 2) {
        flags.push('High urgency language detected');
        trustScore -= 10;
    }
    // Check for lack of sources
    if (!/https?:\/\/|source:|according to/i.test(content)) {
        flags.push('No sources or references found');
        trustScore -= 10;
    }
    // Extract keywords (simple approach)
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'this', 'that', 'these', 'those'];
    const significantWords = words
        .filter(word => word.length > 4 && !commonWords.includes(word))
        .filter((word, index, arr) => arr.indexOf(word) === index)
        .slice(0, 5);
    keywords.push(...significantWords);
    // Clamp trust score
    trustScore = Math.max(0, Math.min(100, trustScore));
    // Determine status
    let status;
    let message;
    if (trustScore >= 80) {
        status = 'verified';
        message = 'This content appears to be credible and trustworthy.';
    }
    else if (trustScore >= 60) {
        status = 'suspicious';
        message = 'This content has some credibility concerns. Verify with additional sources.';
    }
    else {
        status = 'false';
        message = 'This content shows strong indicators of misinformation. Exercise extreme caution.';
    }
    // Generate mock sources
    const sources = generateMockSources(content, trustScore);
    return {
        trustScore,
        status,
        message,
        sources,
        analysis: {
            keywords,
            flags,
            checkedAt: new Date().toISOString(),
        },
    };
}
function generateMockSources(_content, _trustScore) {
    const allSources = [
        { name: 'Reuters Fact Check', url: 'https://reuters.com/fact-check', credibility: 95 },
        { name: 'AP News Fact Check', url: 'https://apnews.com/hub/ap-fact-check', credibility: 94 },
        { name: 'Snopes', url: 'https://snopes.com', credibility: 88 },
        { name: 'PolitiFact', url: 'https://politifact.com', credibility: 87 },
        { name: 'FactCheck.org', url: 'https://factcheck.org', credibility: 89 },
        { name: 'BBC Reality Check', url: 'https://bbc.com/news/reality_check', credibility: 91 },
        { name: 'NPR Fact Check', url: 'https://npr.org/sections/politics-fact-check', credibility: 86 },
        { name: 'WHO Health Topics', url: 'https://who.int/health-topics', credibility: 97 },
        { name: 'CDC Health Information', url: 'https://cdc.gov', credibility: 96 },
        { name: 'National Geographic', url: 'https://nationalgeographic.com', credibility: 90 },
    ];
    // Select 2-4 relevant sources
    const numSources = Math.floor(Math.random() * 3) + 2;
    const selectedSources = allSources
        .sort(() => Math.random() - 0.5)
        .slice(0, numSources)
        .map(source => ({
        ...source,
        relevance: Math.floor(Math.random() * 30) + 70, // 70-100% relevance
    }));
    return selectedSources;
}
export default app;
