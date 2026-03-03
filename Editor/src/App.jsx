import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import SignIn from "./pages/Login";
import Layout from "./Layout/Layout";

import Dashboard from "./components/Dashboard";
import AssignedArticles from "./components/AssignedArticles";
import Profile from "./components/Profile";
import ReviewHistory from "./components/ReviewHistory";
import ReviewDetail from "./pages/ReviewDetail";
import EditorChat from "./components/EditorChat";

const App = () => {
  return (
    <Router>
      <Toaster position="top-center" />

      <Routes>
        {/* Public */}
        <Route path="/signin" element={<SignIn />} />

          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assigned" element={<AssignedArticles />} />
            <Route path="/history" element={<ReviewHistory />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<EditorChat />} />
            <Route path="/review/:id" element={<ReviewDetail />} />
          </Route>

        {/* Default */}
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
};

export default App;