// src/view/Contacts.tsx

import React from "react";
import "../styles/Contacts.css";

const SUPPORT_EMAIL = "k.fursenko.hc@gmail.com";

const Contacts: React.FC = () => {
  return (
    <section className="contacts" aria-label="Contact page">
      <div className="contacts__container">

        <h1 className="contacts__title">
          CONTACT
        </h1>

        <p className="contacts__subtitle">
          We are always happy to hear from you.
          <br />
          Whether it’s a custom candle request, a question about your order,
          or simply a warm hello.
        </p>

        <div className="contacts__card">
          <div className="contacts__block">
            <span className="contacts__label">Support Email</span>

            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="contacts__email"
            >
              {SUPPORT_EMAIL}
            </a>

            <p className="contacts__note">
              We usually respond within 24 hours.
            </p>
          </div>

          <div className="contacts__divider" />

          <div className="contacts__block">
            <span className="contacts__label">Made with care</span>

            <p className="contacts__text">
              Every candle is handcrafted with attention to detail,
              warmth, and intention.
            </p>

            <p className="contacts__text">
              Thank you for supporting handmade.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Contacts;