// src/view/Footer.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

const INSTAGRAM_URL =
  "https://www.instagram.com/kfursenko_hc?igsh=MTV0ZHA2dmxlbnZ1eA==";

const ETSY_URL = "https://kfursenko.etsy.com";

const LOGIN_CHOICE_PATH = "/login-choice";

function InstagramIcon() {
  return (
    <svg className="footer__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Z" />
      <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
      <path d="M17.6 6.4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
    </svg>
  );
}

function EtsyIcon() {
  return (
    <svg className="footer__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.6 13.9c-.3 1.7-1.7 2.9-3.4 2.9H8V6h5.2c1.6 0 3 1.2 3.2 2.8l-1.7.3c-.1-.8-.7-1.3-1.5-1.3H10v3.2h4.5v1.6H10v3.8h3.3c.9 0 1.6-.6 1.7-1.5l1.6.3Z" />
    </svg>
  );
}

const Footer: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const lastYRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const visibleRef = useRef<boolean>(false);

  useEffect(() => {
    lastYRef.current = window.scrollY;
    visibleRef.current = visible;

    const THRESHOLD = 10;

    const updateVisibility = (nextVisible: boolean) => {
      if (visibleRef.current === nextVisible) return;
      visibleRef.current = nextVisible;
      setVisible(nextVisible);
    };

    const handleScroll = () => {
      if (rafRef.current) return;

      rafRef.current = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastYRef.current;

        if (y <= 0) {
          updateVisibility(false);
        } else if (delta > THRESHOLD) {
          updateVisibility(true);
        } else if (delta < -THRESHOLD) {
          updateVisibility(false);
        }

        lastYRef.current = y;
        rafRef.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    if (window.scrollY > 0) updateVisibility(true);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const loginChoiceWithNext = (next: string) =>
    `${LOGIN_CHOICE_PATH}?next=${encodeURIComponent(next)}`;

  return (
    <footer className={`footer ${visible ? "footer--visible" : ""}`}>
      <div className="footer__overlay" />

      <div className="footer__panel">
        <div className="footer__inner">

          <div className="footer__top">
            <div className="footer__brandBlock">
              <div className="footer__brand">KFursenko Candles</div>
              <div className="footer__tagline">Handmade. Minimal. Cozy.</div>
            </div>

            <nav className="footer__social">
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                <InstagramIcon />
              </a>
              <a href={ETSY_URL} target="_blank" rel="noreferrer">
                <EtsyIcon />
              </a>
            </nav>
          </div>

          <div className="footer__grid">

            <div className="footer__col">
              <h3 className="footer__title">Candles</h3>
              <Link className="footer__link" to="/catalog">All candles</Link>
              <Link className="footer__link" to="/catalog">Container candles</Link>
              <Link className="footer__link" to="/catalog">Molded candles</Link>
              <Link className="footer__link" to="/catalog">Collections</Link>
              <Link className="footer__link" to="/catalog">Custom candle</Link>
            </div>

            <div className="footer__col">
              <h3 className="footer__title">Customer care</h3>
              <Link className="footer__link" to="/orders">Delivery</Link>
              <Link className="footer__link" to="/orders">Payments</Link>
              <Link className="footer__link" to="/orders">Policy</Link>
              <Link className="footer__link" to="/orders">Support</Link>
            </div>

            <div className="footer__col">
              <h3 className="footer__title">About</h3>
              <Link className="footer__link" to="/story-mission">
                Story & mission
              </Link>
              <Link className="footer__link" to="/contacts">
                Contacts
              </Link>
            </div>

            <div className="footer__col">
              <h3 className="footer__title">Quick</h3>
              <Link className="footer__link" to="/cart">Cart</Link>
              <Link className="footer__link" to={loginChoiceWithNext("/orders")}>
                Orders
              </Link>
              <Link className="footer__link" to="/login">Login</Link>
              <Link className="footer__link" to="/register">Register</Link>
            </div>

          </div>

          <div className="footer__bottom">
            © {new Date().getFullYear()} — KFursenko Candles
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;