import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Button from "../common/Button";
import { useAuth } from "../../shared/context/AuthContext";
const navItems = [
    { label: "Home", to: "/" },
    { label: "Verify Content", to: "/analysis" },
    { label: "Media Authenticity", to: "/media-authenticity" },
    { label: "Source Intelligence", to: "/source-intelligence" },
    { label: "About", to: "/team" },
];
export default function SiteHeader() {
    const { isLoggedIn, logout } = useAuth();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const toggleMobileNav = () => setMobileNavOpen((prev) => !prev);
    const closeMobileNav = () => setMobileNavOpen(false);
    return (_jsxs(_Fragment, { children: [_jsx("header", { className: "bg-slate-900/80 backdrop-blur-2xl border-b border-slate-700/50 fixed top-0 left-0 right-0 z-40 shadow-2xl", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Link, { to: "/", className: "flex items-center space-x-4 group", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-blue-500/20 rounded-full blur-xl transition-opacity duration-300 group-hover:opacity-70" }), _jsx("img", { src: "/DeFraudAI_Logo.png", alt: "DeFraudAI Logo", className: "relative w-16 h-16 object-contain rounded-full border-2 border-blue-500/50 shadow-xl" })] }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: "DeFraudAI" }), _jsx("p", { className: "text-sm text-slate-400", children: "AI-Powered Truth Verification" })] })] }), _jsxs("div", { className: "hidden md:flex items-center space-x-6", children: [_jsx("nav", { className: "flex space-x-2", children: navItems.map((item) => (_jsx(NavLink, { to: item.to, onClick: closeMobileNav, className: ({ isActive }) => `text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-colors ${isActive ? "bg-blue-500/20 text-white" : ""}`, children: item.label }, item.to))) }), isLoggedIn && (_jsx(Button, { variant: "outline", size: "sm", onClick: logout, children: "Logout" }))] }), _jsx(Button, { variant: "ghost", size: "sm", className: "md:hidden", onClick: toggleMobileNav, children: mobileNavOpen ? _jsx(X, { className: "w-6 h-6" }) : _jsx(Menu, { className: "w-6 h-6" }) })] }) }) }), _jsx("div", { className: "h-24" }), mobileNavOpen && (_jsx("div", { className: "md:hidden fixed inset-0 z-30 bg-slate-900/95 backdrop-blur-xl", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6 py-8 space-y-6", children: [_jsx("nav", { className: "space-y-3", children: navItems.map((item) => (_jsx(NavLink, { to: item.to, onClick: closeMobileNav, className: ({ isActive }) => `block text-lg font-medium px-4 py-3 rounded-xl transition-colors ${isActive ? "bg-blue-500/20 text-white" : "text-slate-300 hover:text-white"}`, children: item.label }, item.to))) }), isLoggedIn && (_jsx(Button, { variant: "outline", className: "w-full", onClick: () => { logout(); closeMobileNav(); }, children: "Logout" }))] }) }))] }));
}
