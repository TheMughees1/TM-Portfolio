import React from "react";
import "./intro.css";
import profileImage from "../../assests/me.png.png";

export default function Intro() {
  return (
    <section id="header" className="intro-section">
      <div className="intro-copy">
        <p className="intro-kicker">BS ARTIFICIAL INTELLIGENCE STUDENT</p>
        <h1>Hi, I'm <span>Mughees.</span></h1>
        <p className="intro-description">
          I build thoughtful web experiences and explore how technology and AI can solve real problems.
        </p>
        <div className="intro-actions">
          <a className="intro-primary" href="https://github.com/TheMughees1" target="_blank" rel="noreferrer">Explore my GitHub</a>
          <a className="intro-secondary" href="mailto:bhattimughees195@gmail.com">Contact me</a>
        </div>
      </div>
      <div className="intro-visual">
        <div className="intro-glow" />
        <img src={profileImage} alt="Mughees ur Rehman" className="intro-profile-image" />
      </div>
    </section>
  );
}
