import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "./view/Header";
import Footer from "./view/Footer";

import Home from "./view/Home";
import Catalog from "./view/Catalog";
import Product from "./view/Product";
import Cart from "./view/Cart";
import Checkout from "./view/Checkout";
import PaymentSuccess from "./view/PaymentSuccess";
import PaymentCancel from "./view/PaymentCancel";
import Orders from "./view/Orders";
import LoginChoice from "./view/LoginChoice";
import Login from "./view/Login";
import Register from "./view/Register";
import StoryMission from "./view/StoryMission";
import Contacts from "./view/Contacts";

// 🔥 НОВЫЕ СТРАНИЦЫ AI QUIZ
import RecommendationQuiz from "./view/RecommendationQuiz";
import RecommendationResult from "./view/RecommendationResult";

const App: React.FC = () => {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/orders" element={<Orders />} />

        <Route path="/login-choice" element={<LoginChoice />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/contacts" element={<Contacts />} />
        <Route path="/story-mission" element={<StoryMission />} />

        {/* 🔥 AI Recommendation Quiz */}
        <Route path="/recommendation-quiz" element={<RecommendationQuiz />} />
        <Route path="/recommendation-result" element={<RecommendationResult />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </>
  );
};

export default App;