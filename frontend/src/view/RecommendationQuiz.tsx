import React from "react";
import { useNavigate } from "react-router-dom";

const RecommendationQuiz: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/recommendation-result", {
      state: {
        name: "Guest",
        mood: "Cozy evening",
        space: "Living room",
      },
    });
  };

  return (
    <div style={{ padding: "120px 24px", minHeight: "100vh" }}>
      <h1>Find Your Perfect Candle</h1>
      <p>Let AI help you choose your ideal scent.</p>

      <button
        onClick={handleStart}
        style={{
          marginTop: "24px",
          padding: "12px 24px",
          border: "1px solid #111",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        Start Quiz
      </button>
    </div>
  );
};

export default RecommendationQuiz;