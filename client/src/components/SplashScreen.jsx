import React, { useEffect, useRef } from "react";
import "./SplashScreen.css";

import ParticleEngine from "../engine/ParticleEngine";
import useSplashAnimation from "../hooks/useSplashAnimation";

import logo from "../assets/logo1.png";

const SplashScreen = ({ onFinish }) => {
  const splashRef = useRef(null);
  const logoRef = useRef(null);

  const glow1Ref = useRef(null);
  const glow2Ref = useRef(null);

  const particlesRef = useRef(null);

  // -----------------------
  // Create Particles
  // -----------------------

  useEffect(() => {
    const engine = new ParticleEngine(particlesRef.current);

    engine.create(80);

    return () => {
      engine.destroy();
    };
  }, []);

  // -----------------------
  // GSAP Animation
  // -----------------------

  useSplashAnimation({
    splashRef,
    logoRef,
    glow1Ref,
    glow2Ref,
    particles: particlesRef,
    onFinish,
  });

  return (
    <div
      className="splash-screen"
      ref={splashRef}
    >
      {/* Background */}

      <div className="background-grid"></div>

      <div
        className="glow glow-purple"
        ref={glow1Ref}
      />

      <div
        className="glow glow-cyan"
        ref={glow2Ref}
      />

      {/* Floating Particles */}

      <div
        className="particle-container"
        ref={particlesRef}
      />

      {/* Logo */}

      <div className="logo-wrapper">
        <img
          src={logo}
          ref={logoRef}
          alt="Streamify Logo"
          className="logo"
          draggable={false}
        />
      </div>

      {/* Bottom Text */}

      <div className="bottom-text">
        <span>STREAMIFY</span>

        <p>Premium OTT Experience</p>
      </div>
    </div>
  );
};

export default SplashScreen;