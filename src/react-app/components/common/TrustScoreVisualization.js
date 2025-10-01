import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
const LARGE_CONFIG = { radius: 90, strokeWidth: 12 };
const SMALL_CONFIG = { radius: 60, strokeWidth: 8 };
const getColorScheme = (score) => {
    if (score >= 80) {
        return { stroke: "#10b981", bg: "from-green-500/20 to-emerald-500/20", text: "text-green-400" };
    }
    if (score >= 60) {
        return { stroke: "#f59e0b", bg: "from-amber-500/20 to-orange-500/20", text: "text-amber-400" };
    }
    return { stroke: "#ef4444", bg: "from-red-500/20 to-rose-500/20", text: "text-red-400" };
};
export default function TrustScoreVisualization({ score, size = "large", showPercentage = true }) {
    const [animatedScore, setAnimatedScore] = useState(0);
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setAnimatedScore(score);
        }, 500);
        return () => window.clearTimeout(timer);
    }, [score]);
    const { radius, strokeWidth } = size === "large" ? LARGE_CONFIG : SMALL_CONFIG;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
    const colors = getColorScheme(animatedScore);
    return (_jsxs("div", { className: "relative flex items-center justify-center", children: [_jsx("div", { className: `absolute inset-0 bg-gradient-to-r ${colors.bg} rounded-full blur-xl opacity-50` }), _jsxs("svg", { height: radius * 2, width: radius * 2, className: "relative transform -rotate-90", children: [_jsx("circle", { stroke: "#374151", fill: "transparent", strokeWidth: strokeWidth, r: normalizedRadius, cx: radius, cy: radius }), _jsx("circle", { stroke: colors.stroke, fill: "transparent", strokeWidth: strokeWidth, strokeDasharray: strokeDasharray, style: { strokeDashoffset, transition: "stroke-dashoffset 2s ease-in-out" }, strokeLinecap: "round", r: normalizedRadius, cx: radius, cy: radius })] }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [showPercentage && (_jsxs("div", { className: `${size === "large" ? "text-4xl" : "text-2xl"} font-bold text-white`, children: [Math.round(animatedScore), "%"] })), size === "large" && showPercentage && (_jsx("div", { className: `text-sm ${colors.text} font-medium`, children: "Trust Score" }))] }) })] }));
}
TrustScoreVisualization.propTypes = {
    score: PropTypes.number.isRequired,
    size: PropTypes.oneOf(["large", "small"]),
    showPercentage: PropTypes.bool,
};
