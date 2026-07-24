import gsap from "gsap";

class ParticleEngine {
  constructor(container) {
    this.container = container;
    this.particles = [];
  }

  create(count = 80) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("span");

      particle.classList.add("particle");

      const size = gsap.utils.random(2, 8);

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;

      particle.style.opacity = Math.random();

      particle.style.background = Math.random() > 0.5 ? "#8b5cf6" : "#00d4ff";

      particle.style.boxShadow = `
        0 0 10px currentColor,
        0 0 20px currentColor,
        0 0 40px currentColor
      `;

      this.container.appendChild(particle);

      this.particles.push(particle);

      gsap.to(particle, {
        x: gsap.utils.random(-200, 200),
        y: gsap.utils.random(-200, 200),
        duration: gsap.utils.random(6, 12),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(particle, {
        opacity: gsap.utils.random(0.2, 1),
        duration: gsap.utils.random(2, 5),
        repeat: -1,
        yoyo: true,
      });

      gsap.to(particle, {
        scale: gsap.utils.random(0.4, 2),
        duration: gsap.utils.random(2, 5),
        repeat: -1,
        yoyo: true,
      });
    }
  }

  explode() {
    this.particles.forEach((particle) => {
      gsap.to(particle, {
        x: gsap.utils.random(-600, 600),
        y: gsap.utils.random(-600, 600),
        opacity: 0,
        duration: 1.5,
        ease: "power4.out",
      });
    });
  }

  destroy() {
    this.particles.forEach((particle) => particle.remove());
    this.particles = [];
  }
}

export default ParticleEngine;
