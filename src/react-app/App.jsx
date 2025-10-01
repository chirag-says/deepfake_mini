import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import DeepFactAnalysis from "./pages/DeepFactAnalysis";
import MediaAuthenticity from "./pages/MediaAuthenticity";
import SourceIntelligence from "./pages/SourceIntelligence";
import TeamDetails from "./pages/TeamDetails";
import { AuthProvider } from "./shared/context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analysis" element={<DeepFactAnalysis />} />
          <Route path="/deep-fact-analysis" element={<DeepFactAnalysis />} />
          <Route path="/media-authenticity" element={<MediaAuthenticity />} />
          <Route path="/source-intelligence" element={<SourceIntelligence />} />
          <Route path="/team" element={<TeamDetails />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
