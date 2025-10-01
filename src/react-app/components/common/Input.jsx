import { useState } from "react";
import PropTypes from "prop-types";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  className = "",
  error = "",
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    if (type === "password") {
      setShowPassword((prev) => !prev);
    }
  };

  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-300 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all duration-300 ${
            focused
              ? "border-blue-500/50 shadow-lg shadow-blue-500/10"
              : "border-slate-700/50"
          } ${error ? "border-red-500/50" : ""}`}
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-400 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
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
