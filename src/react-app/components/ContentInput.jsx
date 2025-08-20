import { useState } from "react";
import PropTypes from "prop-types";
import { Send, FileText, Link, MessageSquare } from "lucide-react";

export default function ContentInput({ content, onChange, onAnalyze, isAnalyzing }) {
  const [inputType, setInputType] = useState("text");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <div className="space-y-6">
      {/* Input Type Selector */}
      <div className="flex bg-slate-100 rounded-xl p-1">
        <button
          type="button"
          onClick={() => setInputType("text")}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            inputType === "text"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Text Content
        </button>
        <button
          type="button"
          onClick={() => setInputType("url")}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            inputType === "url"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Link className="w-4 h-4 mr-2" />
          Article URL
        </button>
        <button
          type="button"
          onClick={() => setInputType("whatsapp")}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            inputType === "whatsapp"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          WhatsApp Forward
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              inputType === "text"
                ? "Paste your news article, social media post, or any suspicious content here..."
                : inputType === "url"
                ? "Enter the URL of the article you want to verify..."
                : "Paste the WhatsApp forward message you want to verify..."
            }
            rows={8}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-900 placeholder-slate-500 bg-white"
            disabled={isAnalyzing}
          />
          <div className="absolute bottom-4 right-4">
            <button
              type="submit"
              disabled={!content.trim() || isAnalyzing}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 mr-2">
                    <div className="w-full h-full border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Verify Content
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Quick Examples */}
      <div className="bg-slate-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Try these examples:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              onChange(
                "BREAKING: Scientists discover cure for cancer using AI technology. Clinical trials show 100% success rate."
              )
            }
            className="text-left p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm text-slate-600"
          >
            <div className="font-medium text-slate-900 mb-1">Suspicious Health Claim</div>
            <div className="text-xs">Click to test with medical misinformation</div>
          </button>
          <button
            type="button"
            onClick={() =>
              onChange(
                "Government announces new tax policy effective immediately. All citizens must pay additional 50% income tax starting next month."
              )
            }
            className="text-left p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm text-slate-600"
          >
            <div className="font-medium text-slate-900 mb-1">Political Misinformation</div>
            <div className="text-xs">Click to test with government claim</div>
          </button>
        </div>
      </div>
    </div>
  );
}

ContentInput.propTypes = {
  content: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onAnalyze: PropTypes.func.isRequired,
  isAnalyzing: PropTypes.bool.isRequired,
};
