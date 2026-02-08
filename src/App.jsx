import React from "react";
import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layouts/Loyout";

// Public pages
import Home from "./components/Home/Home";
import Journals from "./components/Journals/Journals";
import Articles from "./components/Articles/Articles";
import Contact from "./components/Contact/Contact";

// Auth pages
import JournalAdminSignIn from "./pages/Auth/JournalAdmin/SignIn";
import JournalAdminSignUp from "./pages/Auth/JournalAdmin/SignUp";
import ArticlesSignIn from "./pages/Auth/Articles/SignIn";
import ArticlesSignUp from "./pages/Auth/Articles/SignUp";
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
        {/* ✅ PUBLIC ROUTES (Header + Footer) */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/journals" element={<Journals />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth */}
          <Route path="/journal-signin" element={<JournalAdminSignIn />} />
          <Route path="/journal-signup" element={<JournalAdminSignUp />} />
          <Route path="/articles-signin" element={<ArticlesSignIn />} />
          <Route path="/articles-signup" element={<ArticlesSignUp />} />
          <Route path="/journal-forgot-password" element={<ForgotPass />} />
          <Route path="/journal-reset-password" element={<ResetPassword />} />
        </Route>
        
        <Route element={<DashboardLayout />}>
          <Route path="/journal-dashboard" element={<Dashboard />} />
          <Route path="/journal-articles" element={<JournalArticles />} />
          <Route path="/journal-decisions" element={<JournalDecisions />} />
          <Route path="/journal-editors" element={<JournalEditors />} />
          <Route path="/journal-payments" element={<JournalPayments />} />
          <Route path="/journal-reports" element={<JournalReports />} />
          <Route path="/journal-settings" element={<JournalSettings />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
