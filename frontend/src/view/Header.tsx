import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";
import logo from "../assets/images/Logo.png";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = useCallback(() => setIsOpen(true), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, closeMenu]);

  return (
    <>
      <header className="header" aria-label="Header">
        <div className="header__inner">
          <Link to="/" className="header__logoLink" aria-label="Go to homepage">
            <img className="header__logoImg" src={logo} alt="KFursenko Candles" />
          </Link>

          <button
            type="button"
            className="header__link"
            onClick={openMenu}
            aria-label="Open menu"
            aria-expanded={isOpen}
            aria-controls="site-menu"
          >
            Menu
          </button>

          <Link to="/login-choice" className="header__link" aria-label="Go to my account">
            Go to my account
          </Link>
        </div>
      </header>

      {isOpen ? (
        <div
          className="menu"
          role="dialog"
          aria-modal="true"
          id="site-menu"
          aria-label="Site menu"
        >
          <button
            type="button"
            className="menu__overlay"
            onClick={closeMenu}
            aria-label="Close menu"
          />

          <div className="menu__content" role="document">
            <button
              type="button"
              className="menu__close"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              ×
            </button>

            <h2 className="menu__title">Menu</h2>

            <div className="menu__grid">
              <div className="menu__column">
                <h3 className="menu__department">Candles</h3>

                <Link to="/catalog" className="menu__link" onClick={closeMenu}>
                  All candles
                </Link>
                <Link to="/catalog" className="menu__link" onClick={closeMenu}>
                  Container candles
                </Link>
                <Link to="/catalog" className="menu__link" onClick={closeMenu}>
                  Molded candles
                </Link>
                <Link to="/catalog" className="menu__link" onClick={closeMenu}>
                  Spring–Summer collection
                </Link>
                <Link to="/catalog" className="menu__link" onClick={closeMenu}>
                  Autumn–Winter collection
                </Link>
                <Link to="/catalog" className="menu__link" onClick={closeMenu}>
                  Custom candle
                </Link>
                <Link to="/catalog" className="menu__link" onClick={closeMenu}>
                  Single-wick candles
                </Link>
                <Link to="/catalog" className="menu__link" onClick={closeMenu}>
                  Multiple-wick candles
                </Link>
                <Link to="/catalog" className="menu__link" onClick={closeMenu}>
                  Candle holders
                </Link>
              </div>

              <div className="menu__column">
                <h3 className="menu__department">Offers</h3>

                <Link to="/" className="menu__link" onClick={closeMenu}>
                  All offers
                </Link>
                <Link to="/" className="menu__link" onClick={closeMenu}>
                  New shopper
                </Link>
                <Link to="/" className="menu__link" onClick={closeMenu}>
                  Buy 1 get 2
                </Link>
                <Link to="/" className="menu__link" onClick={closeMenu}>
                  Holidays offers
                </Link>
                <Link to="/" className="menu__link" onClick={closeMenu}>
                  Wholesale
                </Link>
              </div>

              <div className="menu__column">
                <h3 className="menu__department">Orders</h3>

                <Link to="/orders" className="menu__link" onClick={closeMenu}>
                  Delivery
                </Link>
                <Link to="/orders" className="menu__link" onClick={closeMenu}>
                  Payments
                </Link>
                <Link to="/orders" className="menu__link" onClick={closeMenu}>
                  Policy
                </Link>
              </div>

              <div className="menu__column">
                <h3 className="menu__department">About</h3>

                <Link to="/" className="menu__link" onClick={closeMenu}>
                  Story &amp; mission
                </Link>
                <Link to="/" className="menu__link" onClick={closeMenu}>
                  Contacts
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Header;