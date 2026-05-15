import { Link } from 'react-router-dom';
import AntigravityBackground from '../components/effects/AntigravityBackground.jsx';
import PixelTransition from '../components/effects/PixelTransition.jsx';
import ProfileCard from '../components/effects/ProfileCard.jsx';
import ScrollFloat from '../components/effects/ScrollFloat.jsx';

const techStack = [
  'Spring Boot',
  'Kubernetes',
  'AWS',
  'Azure',
  'Docker',
  'React',
];

const roadmapTeasers = [
  'Investing module',
  'GCP + Alibaba deployment',
  'Load tested for 50k users',
];

export default function AboutPage() {
  return (
    <main className="page about-page">
      <AntigravityBackground />
      <header className="dashboard-header about-nav">
        <div>
          <p className="eyebrow">Zephyr profile</p>
          <ScrollFloat>About</ScrollFloat>
        </div>
        <div className="dashboard-actions">
          <Link className="secondary-button" to="/dashboard">
            Dashboard
          </Link>
        </div>
      </header>

      <ProfileCard />

      <section className="about-section" aria-labelledby="stack-title">
        <div className="section-heading">
          <p className="eyebrow">Stack</p>
          <h2 id="stack-title">Systems behind the bank</h2>
        </div>
        <div className="tech-grid">
          {techStack.map((item) => (
            <PixelTransition as="article" className="tech-card" key={item}>
              <span>{item}</span>
            </PixelTransition>
          ))}
        </div>
      </section>

      <section className="teaser-strip" aria-label="Zephyr roadmap teasers">
        {roadmapTeasers.map((item) => (
          <div className="teaser-item" key={item}>
            {item}
          </div>
        ))}
      </section>
    </main>
  );
}
