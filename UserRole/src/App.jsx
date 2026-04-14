import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Layout from "./Layout/Layout";
import MainLayout from "./Layout/MainLayout";

import Home from "./pages/Home";
import Journals from "./pages/Journals";
import Articles from "./pages/Articles";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import JournalDetail from "./pages/JournalDetail";

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
import MyArticleDetail from "./pages/MyArticleDetail";
import Chat from "./components/Chat";
import MyArticleComments from "./components/MyArticleComments";
import MyComments from "./components/MyComments";

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
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/journals" element={<Journals />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:id" element={<ArticleDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/journals/:slug" element={<JournalDetail />} />
          
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
          <Route path="/reset-password" element={<ResetPass />} />
        </Route>

        {/* ✅ Auth routes (Layoutsiz olib tashlandi, MainLayout ga ko'chirildi) */}

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
          <Route path="my-articles/:id" element={<MyArticleDetail />} />
          <Route path="article-comments" element={<MyArticleComments />} />
          <Route path="my-comments" element={<MyComments />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="payments" element={<Payments />} />
          <Route path="submit-article" element={<SubmitArticle />} />
          <Route path="edit-article/:id" element={<SubmitArticle />} />
          <Route path="chat" element={<Chat />} />
        </Route>

        {/* ✅ Not found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
