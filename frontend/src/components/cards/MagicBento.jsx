import './MagicBento.css';

export default function MagicBento({ items = [], className = '' }) {
  return (
    <div className={`magic-bento-grid ${className}`.trim()}>
      {items.map((item, index) => (
        <article className="magic-bento-card" key={item.title} style={{ '--bento-index': index }}>
          <div className="magic-bento-icon" aria-hidden="true">{item.icon}</div>
          <div>
            <p>{item.label}</p>
            <h3>{item.title}</h3>
            <span>{item.description}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
