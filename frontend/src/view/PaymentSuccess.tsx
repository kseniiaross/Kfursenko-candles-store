import React from "react";
import { Link } from "react-router-dom";

const PaymentSuccess: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <h1>Payment successful</h1>
      <p>Thank you! Your order is confirmed.</p>
      <Link to="/catalog">Back to catalog</Link>
    </div>
  );
};

export default PaymentSuccess;