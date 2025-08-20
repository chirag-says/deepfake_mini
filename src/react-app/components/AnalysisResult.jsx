import { CheckCircle, AlertTriangle, XCircle, ExternalLink, Clock, Shield } from "lucide-react";
import PropTypes from "prop-types";

export default function AnalysisResult({ result }) {
  const getStatusIcon = () => {
    switch (result.status) {
      case "verified":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "suspicious":
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case "false":
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-600" />;
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
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrustLevel = (score) => {
    if (score >= 80) return "High Trust";
    if (score >= 60) return "Medium Trust";
    if (score >= 40) return "Low Trust";
    return "Very Low Trust";
  };

  return (
    <div className="space-y-6">
      {/* Main Result */}
      <div className={`rounded-2xl p-6 border-2 ${getStatusColor()}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 capitalize">
                {result.status === "error" ? "Analysis Error" : result.status}
              </h3>
              <p className="text-slate-600 text-sm">{result.message}</p>
            </div>
          </div>
          {result.status !== "error" && (
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(result.trustScore)}`}>
                {result.trustScore}%
              </div>
              <div className="text-sm text-slate-600">
                {getTrustLevel(result.trustScore)}
              </div>
            </div>
          )}
        </div>

        {/* Trust Score Bar */}
        {result.status !== "error" && (
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                result.trustScore >= 80
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : result.trustScore >= 60
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                  : "bg-gradient-to-r from-red-500 to-red-600"
              }`}
              style={{ width: `${Math.max(result.trustScore, 5)}%` }}
            ></div>
          </div>
        )}

        {/* Analysis Details */}
        {result.analysis && (
          <div className="bg-white/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center text-xs text-slate-500">
              <Clock className="w-3 h-3 mr-1" />
              Analyzed on {new Date(result.analysis.checkedAt).toLocaleString()}
            </div>

            {result.analysis.keywords?.length > 0 && (
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">Key Topics</div>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.analysis.flags?.length > 0 && (
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">Analysis Flags</div>
                <div className="space-y-1">
                  {result.analysis.flags.map((flag, index) => (
                    <div key={index} className="flex items-center text-xs text-slate-600">
                      <AlertTriangle className="w-3 h-3 mr-2 text-yellow-500" />
                      {flag}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sources */}
      {result.sources?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="text-lg font-semibold text-slate-900">Verification Sources</h4>
          </div>
          <div className="space-y-3">
            {result.sources.map((source, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <h5 className="font-medium text-slate-900 mr-2">{source.name}</h5>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        source.credibility >= 80
                          ? "bg-green-100 text-green-700"
                          : source.credibility >= 60
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {source.credibility}% credibility
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">Relevance: {source.relevance}%</div>
                </div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Source
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Correct PropTypes
AnalysisResult.propTypes = {
  result: PropTypes.shape({
    status: PropTypes.string.isRequired,
    message: PropTypes.string,
    trustScore: PropTypes.number,
    analysis: PropTypes.shape({
      checkedAt: PropTypes.string,
      keywords: PropTypes.arrayOf(PropTypes.string),
      flags: PropTypes.arrayOf(PropTypes.string),
    }),
    sources: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        url: PropTypes.string,
        credibility: PropTypes.number,
        relevance: PropTypes.number,
      })
    ),
  }).isRequired,
};
