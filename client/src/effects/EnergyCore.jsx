import React, { forwardRef, useEffect, useRef } from "react";

import { gsap } from "gsap";

const EnergyCore = forwardRef((props, ref) => {
  const ring1 = useRef(null);
  const ring2 = useRef(null);
  const ring3 = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      repeat: -1,
      defaults: {
        ease: "sine.inOut",
      },
    });

    tl.to(
      ring1.current,
      {
        scale: 1.25,
        opacity: 0.25,
        duration: 2,
      },
      0,
    );

    tl.to(
      ring2.current,
      {
        scale: 1.4,
        opacity: 0.18,
        duration: 2.3,
      },
      0,
    );

    tl.to(
      ring3.current,
      {
        scale: 1.6,
        opacity: 0.12,
        duration: 2.6,
      },
      0,
    );

    gsap.to(ring1.current, {
      rotate: 360,
      duration: 18,
      ease: "none",
      repeat: -1,
    });

    gsap.to(ring2.current, {
      rotate: -360,
      duration: 24,
      ease: "none",
      repeat: -1,
    });

    gsap.to(ring3.current, {
      rotate: 360,
      duration: 30,
      ease: "none",
      repeat: -1,
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={ref} className="energy-core">
      <div ref={ring1} className="energy-ring ring-one" />

      <div ref={ring2} className="energy-ring ring-two" />

      <div ref={ring3} className="energy-ring ring-three" />

      <div className="energy-center" />
    </div>
  );
});

export default EnergyCore;
