import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import PropTypes from "prop-types";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
export default function Input({ label, type = "text", placeholder, value, onChange, icon, className = "", error = "", ...props }) {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const togglePassword = () => {
        if (type === "password") {
            setShowPassword((prev) => !prev);
        }
    };
    const inputType = type === "password" && showPassword ? "text" : type;
    return (_jsxs("div", { className: `space-y-2 ${className}`, children: [label && (_jsxs("label", { className: "text-sm font-medium text-slate-300 flex items-center", children: [icon && _jsx("span", { className: "mr-2", children: icon }), label] })), _jsxs("div", { className: "relative", children: [_jsx("input", { type: inputType, value: value, onChange: onChange, onFocus: () => setFocused(true), onBlur: () => setFocused(false), placeholder: placeholder, className: `w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all duration-300 ${focused ? "border-blue-500/50 shadow-lg shadow-blue-500/10" : "border-slate-700/50"} ${error ? "border-red-500/50" : ""}`, ...props }), type === "password" && (_jsx("button", { type: "button", onClick: togglePassword, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300", children: showPassword ? _jsx(EyeOff, { className: "w-5 h-5" }) : _jsx(Eye, { className: "w-5 h-5" }) }))] }), error && (_jsxs("p", { className: "text-sm text-red-400 flex items-center", children: [_jsx(AlertTriangle, { className: "w-4 h-4 mr-1" }), error] }))] }));
}
Input.propTypes = {
    label: PropTypes.string,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    icon: PropTypes.node,
    className: PropTypes.string,
    error: PropTypes.string,
};
