import React, { forwardRef, useEffect, useRef } from "react";

import { gsap } from "gsap";

const NoiseLayer = forwardRef((props, ref) => {
  const noiseRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      repeat: -1,
      defaults: {
        ease: "none",
      },
    });

    tl.to(noiseRef.current, {
      backgroundPosition: "256px 256px",
      duration: 0.35,
    });

    tl.to(noiseRef.current, {
      backgroundPosition: "-256px -256px",
      duration: 0.35,
    });

    gsap.to(noiseRef.current, {
      opacity: 0.08,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={ref} className="noise-layer">
      <div ref={noiseRef} className="noise-texture" />
    </div>
  );
});

export default NoiseLayer;
