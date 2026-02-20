import React from "react";
import { useLocation } from "react-router-dom";

const RecommendationResult: React.FC = () => {
  const location = useLocation();
  const data = location.state as any;

  return (
    <div style={{ padding: "120px 24px", minHeight: "100vh" }}>
      <h1>Your AI Recommendation</h1>

      {data ? (
        <>
          <p>
            {data.name}, based on your mood "{data.mood}" and space "
            {data.space}", we recommend a warm, cozy vanilla-wood scent.
          </p>
        </>
      ) : (
        <p>No data found. Please take the quiz first.</p>
      )}
    </div>
  );
};

export default RecommendationResult;