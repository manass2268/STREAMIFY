import React, { forwardRef, useEffect, useRef } from "react";

import { gsap } from "gsap";

const LightSweep = forwardRef((props, ref) => {
  const sweepRef = useRef(null);

  useEffect(() => {
    gsap.set(sweepRef.current, {
      x: "-180%",
      opacity: 0,
      rotate: -18,
    });

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 2,
    });

    tl.to(sweepRef.current, {
      opacity: 1,
      duration: 0.15,
    });

    tl.to(
      sweepRef.current,
      {
        x: "220%",
        duration: 1.4,
        ease: "power2.inOut",
      },
      "<",
    );

    tl.to(
      sweepRef.current,
      {
        opacity: 0,
        duration: 0.25,
      },
      "-=0.25",
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={ref} className="light-sweep-container">
      <div ref={sweepRef} className="light-sweep" />
    </div>
  );
});

export default LightSweep;
