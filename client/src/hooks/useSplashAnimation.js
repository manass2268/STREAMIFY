import { useLayoutEffect } from "react";
import gsap from "gsap";

const useSplashAnimation = ({
  splashRef,
  logoRef,
  glow1Ref,
  glow2Ref,
  particles,
  onFinish,
}) => {
  useLayoutEffect(() => {
    if (!splashRef.current) return;

    const tl = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    });

    // --------------------------
    // Initial State
    // --------------------------

    gsap.set(logoRef.current, {
      opacity: 0,
      scale: 0.55,
      rotate: -8,
      filter: "blur(25px)",
    });

    gsap.set([glow1Ref.current, glow2Ref.current], {
      opacity: 0,
      scale: 0,
    });

    gsap.set(particles.current.children, {
      opacity: 0,
      scale: 0,
    });

    // --------------------------
    // Background Glow
    // --------------------------

    tl.to(glow1Ref.current, {
      opacity: 0.6,
      scale: 1,
      duration: 1,
    });

    tl.to(
      glow2Ref.current,
      {
        opacity: 0.5,
        scale: 1,
        duration: 1,
      },
      "-=0.8",
    );

    // --------------------------
    // Particles Reveal
    // --------------------------

    tl.to(
      particles.current.children,
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.01,
      },
      "-=0.5",
    );

    // --------------------------
    // Logo Reveal
    // --------------------------

    tl.to(
      logoRef.current,
      {
        opacity: 1,
        scale: 1,
        rotate: 0,
        filter: "blur(0px)",
        duration: 1.3,
      },
      "-=0.6",
    );

    // --------------------------
    // Floating Effect
    // --------------------------

    gsap.to(logoRef.current, {
      y: -8,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // --------------------------
    // Pulse Effect
    // --------------------------

    gsap.to(logoRef.current, {
      filter: "drop-shadow(0 0 35px #8b5cf6)",
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // --------------------------
    // Glow Rotation
    // --------------------------

    gsap.to(glow1Ref.current, {
      rotate: 360,
      duration: 20,
      repeat: -1,
      ease: "none",
    });

    gsap.to(glow2Ref.current, {
      rotate: -360,
      duration: 18,
      repeat: -1,
      ease: "none",
    });

    // --------------------------
    // Exit Animation
    // --------------------------

    tl.to(
      logoRef.current,
      {
        opacity: 0,
        scale: 1.25,
        filter: "blur(20px)",
        duration: 1,
      },
      "+=2.5",
    );

    tl.to(
      particles.current.children,
      {
        opacity: 0,
        scale: 0,
        duration: 0.6,
        stagger: 0.005,
      },
      "-=0.7",
    );

    tl.to(
      [glow1Ref.current, glow2Ref.current],
      {
        opacity: 0,
        scale: 1.8,
        duration: 0.8,
      },
      "-=0.5",
    );

    tl.to(
      splashRef.current,
      {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          if (onFinish) onFinish();
        },
      },
      "-=0.4",
    );

    return () => {
      tl.kill();
    };
  }, []);
};

export default useSplashAnimation;
