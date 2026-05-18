import './ChromaGrid.css';

export default function ChromaGrid({ items = [], className = '' }) {
  return (
    <div className={`chroma-grid ${className}`.trim()}>
      {items.map((item) => (
        <article
          className="chroma-card"
          key={item.title}
          style={{
            '--card-border': item.borderColor,
            '--card-gradient': item.gradient,
          }}
        >
          <div className="chroma-card-top">
            <span>{item.marker}</span>
            <small>{item.accent}</small>
          </div>
          <div className="chroma-info">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
          <div className="chroma-tools">
            {item.tools.map((tool) => <span key={tool}>{tool}</span>)}
          </div>
        </article>
      ))}
    </div>
  );
}
