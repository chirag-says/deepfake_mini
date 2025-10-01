import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import DeepFactAnalysis from "./pages/DeepFactAnalysis";
import MediaAuthenticity from "./pages/MediaAuthenticity";
import SourceIntelligence from "./pages/SourceIntelligence";
import TeamDetails from "./pages/TeamDetails";
export default function App() {
    return (_jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/analysis", element: _jsx(DeepFactAnalysis, {}) }), _jsx(Route, { path: "/deep-fact-analysis", element: _jsx(DeepFactAnalysis, {}) }), _jsx(Route, { path: "/media-authenticity", element: _jsx(MediaAuthenticity, {}) }), _jsx(Route, { path: "/source-intelligence", element: _jsx(SourceIntelligence, {}) }), _jsx(Route, { path: "/team", element: _jsx(TeamDetails, {}) })] }) }));
}
