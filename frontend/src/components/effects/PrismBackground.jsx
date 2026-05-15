import { useEffect, useRef } from 'react';

function getMotionPreference() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export default function PrismBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return undefined;
    }

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let time = 0;
    const reducedMotion = getMotionPreference();

    function resize() {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function drawBeam(y, color, alpha, offset) {
      const beam = context.createLinearGradient(0, y, width, y + 24);
      beam.addColorStop(0, 'rgba(56, 213, 255, 0)');
      beam.addColorStop(0.34, color);
      beam.addColorStop(0.58, `rgba(255, 255, 255, ${alpha})`);
      beam.addColorStop(1, 'rgba(168, 85, 247, 0)');

      context.save();
      context.translate(Math.sin(time * 0.002 + offset) * 18, 0);
      context.filter = 'blur(10px)';
      context.fillStyle = beam;
      context.fillRect(-80, y - 8, width + 160, 34);
      context.restore();
    }

    function drawPrism(cx, cy, size, phase) {
      const drift = Math.sin(time * 0.001 + phase) * 18;
      const gradient = context.createLinearGradient(cx - size, cy - size, cx + size, cy + size);
      gradient.addColorStop(0, 'rgba(56, 213, 255, 0.24)');
      gradient.addColorStop(0.42, 'rgba(255, 255, 255, 0.06)');
      gradient.addColorStop(0.72, 'rgba(168, 85, 247, 0.2)');
      gradient.addColorStop(1, 'rgba(247, 215, 116, 0.08)');

      context.save();
      context.translate(cx + drift, cy - drift * 0.4);
      context.rotate(Math.sin(time * 0.0006 + phase) * 0.16);
      context.beginPath();
      context.moveTo(0, -size);
      context.lineTo(size * 0.94, size * 0.68);
      context.lineTo(-size * 0.94, size * 0.68);
      context.closePath();
      context.filter = 'blur(0.4px)';
      context.fillStyle = gradient;
      context.fill();
      context.strokeStyle = 'rgba(170, 201, 255, 0.16)';
      context.lineWidth = 1;
      context.stroke();
      context.restore();
    }

    function render() {
      time += reducedMotion ? 0 : 16;
      context.clearRect(0, 0, width, height);

      const base = context.createRadialGradient(width * 0.52, height * 0.38, 0, width * 0.52, height * 0.38, width * 0.78);
      base.addColorStop(0, 'rgba(56, 213, 255, 0.12)');
      base.addColorStop(0.42, 'rgba(168, 85, 247, 0.08)');
      base.addColorStop(1, 'rgba(5, 8, 20, 0)');
      context.fillStyle = base;
      context.fillRect(0, 0, width, height);

      drawBeam(height * 0.38, 'rgba(56, 213, 255, 0.24)', 0.18, 0);
      drawBeam(height * 0.46, 'rgba(168, 85, 247, 0.18)', 0.12, 2.4);
      drawPrism(width * 0.12, height * 0.22, width * 0.24, 0.2);
      drawPrism(width * 0.84, height * 0.68, width * 0.18, 1.8);
      drawPrism(width * 0.64, height * 0.22, width * 0.09, 3.2);

      if (!reducedMotion) {
        animationFrame = requestAnimationFrame(render);
      }
    }

    resize();
    render();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas className="prism-canvas" ref={canvasRef} aria-hidden="true" />;
}
