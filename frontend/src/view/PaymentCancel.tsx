import React from "react";
import { Link } from "react-router-dom";

const PaymentCancel: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <h1>Payment canceled</h1>
      <p>No worries — you can try again.</p>
      <Link to="/checkout">Back to checkout</Link>
    </div>
  );
};

export default PaymentCancel;