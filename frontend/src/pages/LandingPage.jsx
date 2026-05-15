import { Link } from 'react-router-dom';
import PixelTransition from '../components/effects/PixelTransition.jsx';
import PrismBackground from '../components/effects/PrismBackground.jsx';
import ScrollFloat from '../components/effects/ScrollFloat.jsx';

const featureCards = [
  {
    title: 'Phoenix-Ops',
    description: 'Self-healing remediation loops for banking infrastructure signals.',
  },
  {
    title: 'Zephyr Interface',
    description: 'A premium fintech control surface for accounts, transfers, and AI insight.',
  },
  {
    title: 'Secure Delivery',
    description: 'Container-ready React, Spring Boot services, and Kubernetes deployment paths.',
  },
];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <PrismBackground />

      <nav className="landing-nav" aria-label="Primary navigation">
        <Link className="landing-brand" to="/">
          Zephyr
        </Link>
        <div className="landing-nav-actions">
          <Link className="secondary-button" to="/about">
            Architecture
          </Link>
          <Link className="primary-button" to="/login">
            Sign In
          </Link>
        </div>
      </nav>

      <section className="landing-hero" aria-labelledby="landing-title">
        <p className="eyebrow">Phoenix-Ops x Zephyr</p>
        <ScrollFloat id="landing-title">
          AI-Powered Self-Healing Banking Platform
        </ScrollFloat>
        <p className="landing-subheadline">
          Phoenix-Ops monitors and remediates operational risk while Zephyr delivers
          a dark luxury fintech experience for banking workflows, account intelligence,
          and resilient cloud-native delivery.
        </p>
        <div className="landing-cta">
          <Link className="primary-button" to="/login">
            Sign In
          </Link>
          <Link className="secondary-button" to="/about">
            Explore Architecture
          </Link>
        </div>
      </section>

      <section className="landing-features" aria-label="Platform highlights">
        {featureCards.map((feature, index) => (
          <PixelTransition as="article" className="feature-card" key={feature.title}>
            <span className="feature-index">0{index + 1}</span>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </PixelTransition>
        ))}
      </section>
    </main>
  );
}
