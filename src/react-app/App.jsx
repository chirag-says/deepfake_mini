import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import DeepFactAnalysis from "./pages/DeepFactAnalysis";
import MediaAuthenticity from "./pages/MediaAuthenticity";
import SourceIntelligence from "./pages/SourceIntelligence";
import TeamDetails from "./pages/TeamDetails";
import LandingPage from "./pages/Landing";
import AuthPage from "./pages/Auth";
import RegisterPage from "./pages/Register";
import ProtectedRoute from "./shared/components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/app"
          element={(
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/analysis"
          element={(
            <ProtectedRoute>
              <DeepFactAnalysis />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/deep-fact-analysis"
          element={(
            <ProtectedRoute>
              <DeepFactAnalysis />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/media-authenticity"
          element={(
            <ProtectedRoute>
              <MediaAuthenticity />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/source-intelligence"
          element={(
            <ProtectedRoute>
              <SourceIntelligence />
            </ProtectedRoute>
          )}
        />
        <Route path="/team" element={<TeamDetails />} />
      </Routes>
    </Router>
  );
}
