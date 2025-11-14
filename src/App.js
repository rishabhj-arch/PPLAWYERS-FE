import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "./pages/signin";
import InsightsNews from "./pages/insights_news";
import CreateInsight from "./pages/CreateInsight";
import EditInsight from "./pages/EditInsight";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/insights_news" element={<ProtectedRoute><InsightsNews /></ProtectedRoute>}/>
        <Route path="/insights_news/create" element={<ProtectedRoute><CreateInsight /></ProtectedRoute>}/>
        <Route path="/insights_news/edit" element={<ProtectedRoute><EditInsight /></ProtectedRoute>}/>
        <Route path="/edit_insight" element={<ProtectedRoute><EditInsight /></ProtectedRoute>}/>
      </Routes>
    </Router>
  );
}

export default App;
