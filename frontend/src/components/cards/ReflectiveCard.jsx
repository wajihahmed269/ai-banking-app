import { useRef } from 'react';
import './ReflectiveCard.css';

export default function ReflectiveCard({
  image,
  name,
  role,
  handle,
  status,
  project,
  github,
  className = '',
}) {
  const cardRef = useRef(null);

  const updatePointer = (event) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    card.style.setProperty('--reflect-x', `${x}px`);
    card.style.setProperty('--reflect-y', `${y}px`);
    card.style.setProperty('--reflect-rotate-x', `${((y / rect.height) - 0.5) * -7}deg`);
    card.style.setProperty('--reflect-rotate-y', `${((x / rect.width) - 0.5) * 7}deg`);
  };

  const resetPointer = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--reflect-rotate-x', '0deg');
    card.style.setProperty('--reflect-rotate-y', '0deg');
  };

  return (
    <article
      ref={cardRef}
      className={`reflective-card-container ${className}`.trim()}
      onPointerMove={updatePointer}
      onPointerLeave={resetPointer}
    >
      <div className="reflective-edge" />
      <div className="reflective-image-shell">
        <img src={image} alt={`${name} profile`} />
      </div>
      <div className="reflective-content">
        <div>
          <p className="reflective-kicker">PROFILE</p>
          <h2>{name}</h2>
          <span>{role}</span>
        </div>
        <div className="reflective-meta">
          <p>{handle}</p>
          <p>{status}</p>
          <p>{project}</p>
        </div>
        <a href={github} target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </article>
  );
}
