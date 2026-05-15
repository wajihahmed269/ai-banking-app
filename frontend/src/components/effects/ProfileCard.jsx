import { useRef } from 'react';

export default function ProfileCard() {
  const cardRef = useRef(null);

  function handlePointerMove(event) {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 14;
    const rotateX = ((0.5 - y / rect.height)) * 12;

    card.style.setProperty('--tilt-x', `${rotateX}deg`);
    card.style.setProperty('--tilt-y', `${rotateY}deg`);
    card.style.setProperty('--shine-x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--shine-y', `${(y / rect.height) * 100}%`);
  }

  function handlePointerLeave() {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.style.setProperty('--shine-x', '50%');
    card.style.setProperty('--shine-y', '28%');
  }

  return (
    <section
      className="profile-card-premium"
      aria-labelledby="about-title"
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="profile-card-glow" aria-hidden="true" />
      <div className="profile-card-shine" aria-hidden="true" />
      <div className="profile-orbit">
        <div className="profile-image-shell">
          <img src="/wajih-profile.png" alt="Wajih Ahmed" />
        </div>
      </div>

      <div className="profile-copy">
        <p className="eyebrow">The Builder</p>
        <h2 id="about-title">Wajih Ahmed</h2>
        <p className="profile-title">DevSecOps Engineer</p>
        <div className="profile-meta">
          <span>@wajihahmed269</span>
          <span>Building Zephyr</span>
        </div>
        <a
          className="primary-button profile-github"
          href="https://github.com/wajihahmed269"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </div>
    </section>
  );
}
