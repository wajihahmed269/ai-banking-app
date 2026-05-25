function TechIcon({ type }) {
  const commonProps = {
    className: 'tech-svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
  };

  switch (type) {
    case 'leaf':
      return <svg {...commonProps}><path d="M5 13.2C5.8 7.8 10.3 5 19 5c-.3 8-3.4 12.4-9.2 12.4C7.4 17.4 5.7 15.8 5 13.2Z" /><path d="M5.5 18.5c2.4-4.2 5.7-7 10-8.5" /></svg>;
    case 'atom':
      return <svg {...commonProps}><circle cx="12" cy="12" r="1.8" /><ellipse cx="12" cy="12" rx="8.2" ry="3.2" /><ellipse cx="12" cy="12" rx="8.2" ry="3.2" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="8.2" ry="3.2" transform="rotate(120 12 12)" /></svg>;
    case 'database':
      return <svg {...commonProps}><ellipse cx="12" cy="6.5" rx="7" ry="3" /><path d="M5 6.5v7.8c0 1.7 3.1 3.2 7 3.2s7-1.5 7-3.2V6.5" /><path d="M5 10.5c0 1.7 3.1 3.1 7 3.1s7-1.4 7-3.1" /></svg>;
    case 'shield':
      return <svg {...commonProps}><path d="M12 4.5 18 7v4.8c0 3.5-2.3 6.2-6 7.7-3.7-1.5-6-4.2-6-7.7V7l6-2.5Z" /><path d="m9.5 12 1.7 1.7 3.7-4" /></svg>;
    case 'box':
      return <svg {...commonProps}><path d="M4.5 9.5h15v6.2l-3.2 3H7.7l-3.2-3V9.5Z" /><path d="M7 6.5h2.8v3H7v-3Zm4.1 0h2.8v3h-2.8v-3Zm4.1 0H18v3h-2.8v-3Z" /></svg>;
    case 'wheel':
      return <svg {...commonProps}><circle cx="12" cy="12" r="6.5" /><circle cx="12" cy="12" r="2" /><path d="M12 5.5v4.5m0 4v4.5M5.5 12h4.5m4 0h4.5M7.4 7.4l3.2 3.2m2.8 2.8 3.2 3.2m0-9.2-3.2 3.2m-2.8 2.8-3.2 3.2" /></svg>;
    case 'cloud':
      return <svg {...commonProps}><path d="M8.2 17.2h8.2c2 0 3.6-1.5 3.6-3.4s-1.6-3.4-3.6-3.4h-.4A5.2 5.2 0 0 0 6.1 12c-1.7.3-3 1.7-3 3.3 0 1.1.8 1.9 2.2 1.9" /></svg>;
    default:
      return <svg {...commonProps}><path d="M7 5.5h4.5V10H7V5.5Zm5.5 0H17V10h-4.5V5.5ZM7 11h4.5v7H7v-7Zm5.5 0H17v7h-4.5v-7Z" /></svg>;
  }
}

export function Brand() {
  return <div className="brand"><svg className="brand-mark" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 15.5c4.6-7.1 9-9.7 14-8.8-2.4 1.9-4.2 4-5.5 6.4 2.2-.3 4.1-.1 5.8.6-4.7 4.2-9.2 5.5-14.3 1.8Z" /></svg><span>ZEPHYR</span></div>;
}

export { TechIcon };
