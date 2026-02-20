import React from "react";
import { Link } from "react-router-dom";

import backgroundVideo from "../assets/images/background.mov";
import logoImage from "../assets/images/Logo.png";

import "../styles/Home.css";

const Home: React.FC = () => {
  return (
    <main className="home" aria-label="Home page">
      <div className="home__media" aria-hidden="true">
        <video
          className="home__video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="home__overlay" />
      </div>

      <section className="home__content" aria-label="Brand section">
        <Link
          to="/story-mission"
          className="home__logoLink"
          aria-label="Go to Story and Mission"
        >
          <img
            className="home__logo"
            src={logoImage}
            alt="KFursenko Candles logo"
          />
        </Link>
      </section>
    </main>
  );
};

export default Home;