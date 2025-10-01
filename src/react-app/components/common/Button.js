import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PropTypes from "prop-types";
import { RefreshCw } from "lucide-react";
export default function Button({ children, variant = "primary", size = "md", className = "", loading = false, disabled = false, as = "button", ...props }) {
    const baseClasses = "font-semibold transition-all duration-300 flex items-center justify-center rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden";
    const sizeClasses = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
        xl: "px-10 py-5 text-xl",
    };
    const variantClasses = {
        primary: "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 focus:ring-blue-500",
        secondary: "bg-slate-800/80 text-blue-300 border border-slate-600/50 hover:bg-slate-700/80 hover:border-blue-500/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:ring-blue-500",
        outline: "bg-transparent border-2 border-blue-500/50 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400 hover:text-white focus:ring-blue-500 backdrop-blur-sm",
        success: "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-xl hover:shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-1 focus:ring-green-500",
        warning: "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-xl hover:shadow-2xl hover:shadow-amber-500/25 transform hover:-translate-y-1 focus:ring-amber-500",
        danger: "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-xl hover:shadow-2xl hover:shadow-red-500/25 transform hover:-translate-y-1 focus:ring-red-500",
        ghost: "bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white",
        glass: "bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 hover:border-white/20",
        social: "bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white",
    };
    const Component = as;
    const isButtonElement = Component === "button";
    const sharedProps = isButtonElement
        ? { disabled: disabled || loading }
        : { "aria-disabled": disabled || loading, tabIndex: disabled || loading ? -1 : undefined };
    return (_jsxs(Component, { className: `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`, ...sharedProps, ...props, children: [loading && _jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), children] }));
}
Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf([
        "primary",
        "secondary",
        "outline",
        "success",
        "warning",
        "danger",
        "ghost",
        "glass",
        "social",
    ]),
    size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
    className: PropTypes.string,
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    as: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
};
