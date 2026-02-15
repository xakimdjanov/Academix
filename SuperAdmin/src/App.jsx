import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import SignIn from "./pages/Auth/SignIn";

import Dashboard from "./components/Dashboard";
import Editor from "./components/Editor";
import Journals from "./components/Journals";
import Logs from "./components/Logs";
import Settings from "./components/Settings";
import Users from "./components/Users";

import AdminLayout from "./Layout/AdminLayout";

const App = () => {
  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#1F2937", color: "#FFFFFF" },
          success: { style: { background: "#10B981" } },
          error: { style: { background: "#EF4444" } },
        }}
      />

      <Routes>
        {/* Auth (layout siz) */}
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />

        {/* Admin (layout bilan) */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/journals" element={<Journals />} />
        </Route>

        {/* Not found */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </div>
  );
};

export default App;
