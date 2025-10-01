import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// AnalysisResult.jsx
import { CheckCircle, AlertTriangle, XCircle, ExternalLink, Clock, Shield } from "lucide-react";
import PropTypes from "prop-types";
export default function AnalysisResult({ result }) {
    const getStatusIcon = () => {
        switch (result.status) {
            case "verified":
                return _jsx(CheckCircle, { className: "w-6 h-6 text-green-600" });
            case "suspicious":
                return _jsx(AlertTriangle, { className: "w-6 h-6 text-yellow-600" });
            case "false":
                return _jsx(XCircle, { className: "w-6 h-6 text-red-600" });
            default:
                return _jsx(AlertTriangle, { className: "w-6 h-6 text-gray-600" });
        }
    };
    const getStatusColor = () => {
        switch (result.status) {
            case "verified":
                return "bg-green-50 border-green-200";
            case "suspicious":
                return "bg-yellow-50 border-yellow-200";
            case "false":
                return "bg-red-50 border-red-200";
            default:
                return "bg-gray-50 border-gray-200";
        }
    };
    const getScoreColor = (score) => {
        if (score >= 80)
            return "text-green-600";
        if (score >= 60)
            return "text-yellow-600";
        return "text-red-600";
    };
    const getTrustLevel = (score) => {
        if (score >= 80)
            return "High Trust";
        if (score >= 60)
            return "Medium Trust";
        if (score >= 40)
            return "Low Trust";
        return "Very Low Trust";
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: `rounded-2xl p-6 border-2 ${getStatusColor()}`, children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [getStatusIcon(), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 capitalize", children: result.status === "error" ? "Analysis Error" :
                                                    result.status === "verified" ? "Verified" :
                                                        result.status === "false" ? "False Information" : result.status }), _jsx("p", { className: "text-slate-600 text-sm", children: result.message })] })] }), result.status !== "error" && (_jsxs("div", { className: "text-right", children: [_jsxs("div", { className: `text-3xl font-bold ${getScoreColor(result.trustScore)}`, children: [result.trustScore, "%"] }), _jsx("div", { className: "text-sm text-slate-600", children: getTrustLevel(result.trustScore) })] }))] }), result.status !== "error" && (_jsx("div", { className: "w-full bg-gray-200 rounded-full h-3 mb-6", children: _jsx("div", { className: `h-3 rounded-full transition-all duration-500 ${result.trustScore >= 80
                                ? "bg-gradient-to-r from-green-500 to-green-600"
                                : result.trustScore >= 60
                                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                                    : "bg-gradient-to-r from-red-500 to-red-600"}`, style: { width: `${Math.max(result.trustScore, 5)}%` } }) })), result.technicalIndicators && (_jsxs("div", { className: "mb-6", children: [_jsx("h4", { className: "text-md font-medium text-slate-800 mb-3", children: "Technical Analysis" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { className: "text-slate-600", children: "Inconsistencies" }), _jsxs("span", { className: "font-medium", children: [result.technicalIndicators.inconsistencies, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "h-2 rounded-full bg-gradient-to-r from-red-500 to-red-600", style: { width: `${result.technicalIndicators.inconsistencies}%` } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { className: "text-slate-600", children: "Artifacts" }), _jsxs("span", { className: "font-medium", children: [result.technicalIndicators.artifacts, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "h-2 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600", style: { width: `${result.technicalIndicators.artifacts}%` } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { className: "text-slate-600", children: "Metadata" }), _jsxs("span", { className: "font-medium", children: [result.technicalIndicators.metadata, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600", style: { width: `${result.technicalIndicators.metadata}%` } }) })] })] })] })), result.analysis && (_jsxs("div", { className: "bg-white/60 rounded-xl p-4 space-y-3", children: [_jsxs("div", { className: "flex items-center text-xs text-slate-500", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), "Analyzed on ", new Date(result.analysis.checkedAt).toLocaleString()] }), result.analysis.keywords?.length > 0 && (_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-700 mb-2", children: "Key Topics" }), _jsx("div", { className: "flex flex-wrap gap-2", children: result.analysis.keywords.map((keyword, index) => (_jsx("span", { className: "px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full", children: keyword }, index))) })] })), result.flags?.length > 0 && (_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-700 mb-2", children: "Analysis Flags" }), _jsx("div", { className: "space-y-1", children: result.flags.map((flag, index) => (_jsxs("div", { className: "flex items-center text-xs text-slate-600", children: [_jsx(AlertTriangle, { className: "w-3 h-3 mr-2 text-yellow-500" }), flag] }, index))) })] })), result.highlights?.length > 0 && (_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-700 mb-2", children: "Positive Indicators" }), _jsx("div", { className: "space-y-1", children: result.highlights.map((highlight, index) => (_jsxs("div", { className: "flex items-center text-xs text-slate-600", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-2 text-green-500" }), highlight] }, index))) })] }))] }))] }), result.sources?.length > 0 && (_jsxs("div", { className: "bg-white rounded-2xl p-6 border border-slate-200", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx(Shield, { className: "w-5 h-5 text-blue-600 mr-2" }), _jsx("h4", { className: "text-lg font-semibold text-slate-900", children: "Verification Sources" })] }), _jsx("div", { className: "space-y-3", children: result.sources.map((source, index) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center mb-1", children: [_jsx("h5", { className: "font-medium text-slate-900 mr-2", children: source.name }), _jsxs("span", { className: `text-xs px-2 py-1 rounded-full ${source.credibility >= 80
                                                        ? "bg-green-100 text-green-700"
                                                        : source.credibility >= 60
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-red-100 text-red-700"}`, children: [source.credibility, "% credibility"] })] }), _jsxs("div", { className: "text-sm text-slate-600", children: ["Relevance: ", source.relevance, "%"] })] }), _jsxs("a", { href: source.url, target: "_blank", rel: "noopener noreferrer", className: "flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium", children: ["View Source", _jsx(ExternalLink, { className: "w-3 h-3 ml-1" })] })] }, index))) })] }))] }));
}
// ✅ Correct PropTypes
AnalysisResult.propTypes = {
    result: PropTypes.shape({
        status: PropTypes.string.isRequired,
        message: PropTypes.string,
        trustScore: PropTypes.number,
        confidence: PropTypes.number,
        isOriginal: PropTypes.bool,
        technicalIndicators: PropTypes.shape({
            inconsistencies: PropTypes.number,
            artifacts: PropTypes.number,
            metadata: PropTypes.number
        }),
        flags: PropTypes.arrayOf(PropTypes.string),
        highlights: PropTypes.arrayOf(PropTypes.string),
        analysis: PropTypes.shape({
            checkedAt: PropTypes.string,
            keywords: PropTypes.arrayOf(PropTypes.string),
            flags: PropTypes.arrayOf(PropTypes.string),
        }),
        sources: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            url: PropTypes.string,
            credibility: PropTypes.number,
            relevance: PropTypes.number,
        })),
    }).isRequired,
};
