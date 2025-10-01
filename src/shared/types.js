import z from "zod";
export const AnalysisRequestSchema = z.object({
    content: z.string().min(1, "Content is required"),
});
export const SourceSchema = z.object({
    name: z.string(),
    url: z.string().url(),
    credibility: z.number().min(0).max(100),
    relevance: z.number().min(0).max(100),
});
export const AnalysisSchema = z.object({
    sentiment: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    flags: z.array(z.string()).optional(),
    checkedAt: z.string(),
});
export const AnalysisResultSchema = z.object({
    trustScore: z.number().min(0).max(100),
    status: z.enum(['verified', 'suspicious', 'false', 'error']),
    message: z.string(),
    sources: z.array(SourceSchema),
    analysis: AnalysisSchema.optional(),
});
