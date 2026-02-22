import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Layout from "./Layout/Layout";

import Dashboard from "./components/Dashboard";
import MyArticles from "./components/MyArticles";
import MyProfile from "./components/MyProfile";
import Notifications from "./components/Notifications";
import Payments from "./components/Payments";
import SubmitArticle from "./components/SubmitArticle";

import SignUp from "./pages/Auth/SignUp";
import SignIn from "./pages/Auth/SignIn";
import ForgotPass from "./pages/ForgotPass";
import ResetPass from "./pages/ResetPass";
import ArticleDetails from "./pages/ArticleDetails";
import Chat from "./components/Chat";

// ✅ optional: simple private route wrapper
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/signin" replace />;
  return children;
};

const App = () => {
  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        {/* ✅ Auth routes (Layoutsiz) */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPass />} />
        <Route path="/reset-password" element={<ResetPass />} />

        {/* ✅ Protected routes (Layout bilan) */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* default redirect */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="my-profile" element={<MyProfile />} />
          <Route path="my-articles" element={<MyArticles />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="payments" element={<Payments />} />
          <Route path="submit-article" element={<SubmitArticle />} />
          <Route path="chat" element={<Chat />} />
          <Route path="/articles/:id" element={<ArticleDetails />} />
        </Route>

        {/* ✅ Not found */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </>
  );
};

export default App;
