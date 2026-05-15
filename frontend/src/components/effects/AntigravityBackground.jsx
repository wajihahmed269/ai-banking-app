import { useEffect, useRef } from 'react';

export default function AntigravityBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return undefined;
    }

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: 0.5, y: 0.5, active: false };
    let width = 0;
    let height = 0;
    let particles = [];
    let animationFrame = 0;

    function resize() {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const count = width < 720 ? 38 : 82;
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.7,
        speed: Math.random() * 0.22 + 0.08,
        phase: Math.random() * Math.PI * 2,
        hue: index % 3,
      }));
    }

    function handlePointerMove(event) {
      pointer.x = event.clientX / Math.max(width, 1);
      pointer.y = event.clientY / Math.max(height, 1);
      pointer.active = true;
    }

    function handlePointerLeave() {
      pointer.active = false;
    }

    function render() {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';

      particles.forEach((particle) => {
        if (!reducedMotion) {
          const pullX = pointer.active ? (pointer.x * width - particle.x) * 0.00045 : 0;
          const pullY = pointer.active ? (pointer.y * height - particle.y) * 0.00035 : 0;
          particle.phase += 0.006;
          particle.x += Math.cos(particle.phase) * 0.18 + pullX;
          particle.y -= particle.speed + Math.sin(particle.phase) * 0.08 - pullY;
        }

        if (particle.y < -12) {
          particle.y = height + 12;
          particle.x = Math.random() * width;
        }

        if (particle.x < -12) {
          particle.x = width + 12;
        } else if (particle.x > width + 12) {
          particle.x = -12;
        }

        const colors = [
          'rgba(56, 213, 255, 0.52)',
          'rgba(168, 85, 247, 0.42)',
          'rgba(201, 214, 234, 0.28)',
        ];
        const glow = context.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 9,
        );
        glow.addColorStop(0, colors[particle.hue]);
        glow.addColorStop(1, 'rgba(5, 8, 20, 0)');

        context.fillStyle = glow;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * 9, 0, Math.PI * 2);
        context.fill();
      });

      context.globalCompositeOperation = 'source-over';

      if (!reducedMotion) {
        animationFrame = requestAnimationFrame(render);
      }
    }

    resize();
    render();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return <canvas className="antigravity-canvas" ref={canvasRef} aria-hidden="true" />;
}
