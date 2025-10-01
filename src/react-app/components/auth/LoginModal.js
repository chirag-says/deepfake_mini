import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { User, Lock } from "lucide-react";
import FloatingCard from "../common/FloatingCard";
import Button from "../common/Button";
import Input from "../common/Input";
import { useAuth } from "../../shared/context/AuthContext";
export default function LoginModal() {
    const { isLoggedIn, login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    if (isLoggedIn) {
        return null;
    }
    const handleSubmit = (event) => {
        event.preventDefault();
        const result = login(username.trim(), password.trim());
        if (!result.success) {
            setLoginError(result.message ?? "Unable to login");
        }
        else {
            setLoginError("");
            setUsername("");
            setPassword("");
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex justify-center bg-slate-900/95 backdrop-blur-md pt-[7%]", children: _jsx("div", { className: "w-full max-w-md p-4", children: _jsxs(FloatingCard, { children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "mb-6", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-blue-500/20 rounded-full blur-xl" }), _jsx("img", { src: "/DeFraudAI_Logo.png", alt: "DeFraudAI Logo", className: "relative w-20 h-20 object-contain rounded-full border-2 border-blue-500/50 shadow-xl" })] }) }), _jsx("h1", { className: "text-2xl md:text-3xl font-bold text-white mb-2", children: "Welcome to DeFraudAI" }), _jsx("p", { className: "text-slate-400", children: "Please login to continue" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6 mt-6", children: [_jsx(Input, { label: "Username", type: "text", placeholder: "Enter your username", value: username, onChange: (e) => setUsername(e.target.value), icon: _jsx(User, { className: "w-4 h-4" }), required: true }), _jsx(Input, { label: "Password", type: "password", placeholder: "Enter your password", value: password, onChange: (e) => setPassword(e.target.value), icon: _jsx(Lock, { className: "w-4 h-4" }), required: true }), loginError && (_jsx("div", { className: "bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-300", children: loginError })), _jsx(Button, { type: "submit", size: "lg", className: "w-full", children: "Login" })] }), _jsx("div", { className: "mt-6 text-center text-sm text-slate-500", children: _jsx("p", { children: "Password Is Important" }) })] }) }) }));
}
