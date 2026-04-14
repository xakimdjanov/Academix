import React from "react";
import { Toaster } from "react-hot-toast";
import { Route, Routes, Navigate } from "react-router-dom";

// Auth pages
import JournalAdminSignIn from "./pages/Auth/JournalAdmin/SignIn";
import JournalAdminSignUp from "./pages/Auth/JournalAdmin/SignUp";
import ArticlesSignIn from "./pages/Auth/Articles/SignIn";
import ForgotPass from "./pages/JournalAdmin/ForgotPass/ForgotPass";
import ResetPassword from "./pages/JournalAdmin/ForgotPass/ResetPassword";

// Dashboard
import Dashboard from "./components/JournalAdmin/Dashboard/Dashboard";
import DashboardLayout from "./components/Layouts/DashboardLayout";
import JournalArticles from "./components/JournalAdmin/JournalArticles/JournalArticles";
import JournalDecisions from "./components/JournalAdmin/JournalDecisions/JournalDecisions";
import JournalEditors from "./components/JournalAdmin/JournalEditors/JournalEditors";
import JournalPayments from "./components/JournalAdmin/JournalPayments/JournalPayments";
import JournalReports from "./components/JournalAdmin/JournalReports/JournalReports";
import JournalSettings from "./components/JournalAdmin/JournalSettings/JournalSettings";
import AddJournal from "./components/JournalAdmin/AddJournal/AddJournal";
import JournalList from "./components/JournalAdmin/AddJournal/GetEditJournal";
import ArticlesDetails from "./pages/JournalAdmin/ArticlesDetails/ArticlesDetails";

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
        {/* ✅ Default Redirect */}
        <Route path="/" element={<Navigate to="/journal-signin" replace />} />

        {/* ✅ AUTH ROUTES (No Header/Footer) */}
        <Route path="/journal-signin" element={<JournalAdminSignIn />} />
        <Route path="/journal-signup" element={<JournalAdminSignUp />} />
        <Route path="/articles-signin" element={<ArticlesSignIn />} />
        <Route path="/journal-forgot-password" element={<ForgotPass />} />
        <Route path="/journal-reset-password" element={<ResetPassword />} />
        
        <Route element={<DashboardLayout />}>
          <Route path="/journal-dashboard" element={<Dashboard />} />
          <Route path="/journal-articles" element={<JournalArticles />} />
          <Route path="/journal-decisions" element={<JournalDecisions />} />
          <Route path="/journal-editors" element={<JournalEditors />} />
          <Route path="/journal-payments" element={<JournalPayments />} />
          <Route path="/journal-reports" element={<JournalReports />} />
          <Route path="/journal-settings" element={<JournalSettings />} />
          <Route path="/journal-list/addjournal" element={<AddJournal />} />
          <Route path="/journal-list" element={<JournalList />} />
          <Route path="/journal-list/editjournal/:id" element={<AddJournal />} />
          <Route path="/articledetails/:id" element={<ArticlesDetails />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
