import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import PropTypes from "prop-types";
import { Send, FileText, Link, MessageSquare } from "lucide-react";
export default function ContentInput({ content, onChange, onAnalyze, isAnalyzing }) {
    const [inputType, setInputType] = useState("text");
    const handleSubmit = (e) => {
        e.preventDefault();
        onAnalyze();
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex bg-slate-100 rounded-xl p-1", children: [_jsxs("button", { type: "button", onClick: () => setInputType("text"), className: `flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${inputType === "text"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"}`, children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "Text Content"] }), _jsxs("button", { type: "button", onClick: () => setInputType("url"), className: `flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${inputType === "url"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"}`, children: [_jsx(Link, { className: "w-4 h-4 mr-2" }), "Article URL"] }), _jsxs("button", { type: "button", onClick: () => setInputType("whatsapp"), className: `flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${inputType === "whatsapp"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"}`, children: [_jsx(MessageSquare, { className: "w-4 h-4 mr-2" }), "WhatsApp Forward"] })] }), _jsx("form", { onSubmit: handleSubmit, className: "space-y-4", children: _jsxs("div", { className: "relative", children: [_jsx("textarea", { value: content, onChange: (e) => onChange(e.target.value), placeholder: inputType === "text"
                                ? "Paste your news article, social media post, or any suspicious content here..."
                                : inputType === "url"
                                    ? "Enter the URL of the article you want to verify..."
                                    : "Paste the WhatsApp forward message you want to verify...", rows: 8, className: "w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-900 placeholder-slate-500 bg-white", disabled: isAnalyzing }), _jsx("div", { className: "absolute bottom-4 right-4", children: _jsx("button", { type: "submit", disabled: !content.trim() || isAnalyzing, className: "flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200", children: isAnalyzing ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 mr-2", children: _jsx("div", { className: "w-full h-full border-2 border-white/30 border-t-white rounded-full animate-spin" }) }), "Analyzing..."] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), "Verify Content"] })) }) })] }) }), _jsxs("div", { className: "bg-slate-50 rounded-xl p-4", children: [_jsx("h4", { className: "text-sm font-medium text-slate-700 mb-3", children: "Try these examples:" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [_jsxs("button", { type: "button", onClick: () => onChange("BREAKING: Scientists discover cure for cancer using AI technology. Clinical trials show 100% success rate."), className: "text-left p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm text-slate-600", children: [_jsx("div", { className: "font-medium text-slate-900 mb-1", children: "Suspicious Health Claim" }), _jsx("div", { className: "text-xs", children: "Click to test with medical misinformation" })] }), _jsxs("button", { type: "button", onClick: () => onChange("Government announces new tax policy effective immediately. All citizens must pay additional 50% income tax starting next month."), className: "text-left p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm text-slate-600", children: [_jsx("div", { className: "font-medium text-slate-900 mb-1", children: "Political Misinformation" }), _jsx("div", { className: "text-xs", children: "Click to test with government claim" })] })] })] })] }));
}
ContentInput.propTypes = {
    content: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onAnalyze: PropTypes.func.isRequired,
    isAnalyzing: PropTypes.bool.isRequired,
};
