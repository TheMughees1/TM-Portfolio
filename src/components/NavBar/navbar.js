import React from "react";
import "./navbar.css";
import logo from "../../assests/logo.png.png";

export default function Navbar() {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <a className="navbar-brand" href="#header" aria-label="Mughees portfolio home">
        <img src={logo} alt="TM Studio" className="logo" />
        <span>TM<span className="brand-accent">.</span></span>
      </a>
      <div className="desktoMenu">
        <ul>
          <li><a href="#header">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#portfolio">Projects</a></li>
          <li><a href="https://github.com/TheMughees1" target="_blank" rel="noreferrer">GitHub</a></li>
        </ul>
      </div>
      <a className="desktopMenuBtn" href="mailto:bhattimughees195@gmail.com">Contact me <span aria-hidden="true">↗</span></a>
    </nav>
  );
}
