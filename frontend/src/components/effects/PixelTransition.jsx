import { useRef } from 'react';

export default function PixelTransition({
  as: Element = 'div',
  className = '',
  children,
  ...props
}) {
  const elementRef = useRef(null);

  function handlePointerMove(event) {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    element.style.setProperty('--pixel-x', `${x}%`);
    element.style.setProperty('--pixel-y', `${y}%`);
  }

  return (
    <Element
      {...props}
      ref={elementRef}
      className={`pixel-transition-card ${className}`.trim()}
      onPointerMove={handlePointerMove}
    >
      <span className="pixel-transition-layer" aria-hidden="true" />
      {children}
    </Element>
  );
}
