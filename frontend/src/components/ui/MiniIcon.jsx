import { Component } from 'react';

export function MiniIcon({ type }) {
  return <svg className="mini-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {type === 'send' && <path d="M5 12h12m0 0-5-5m5 5-5 5" />}
    {type === 'plus' && <path d="M12 5v14M5 12h14" />}
    {type === 'bill' && <path d="M7 4h10v16l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V4Zm3 5h4m-4 4h5" />}
    {type === 'history' && <path d="M5 12a7 7 0 1 0 2-5M5 5v5h5m2-2v5l3 2" />}
    {type === 'more' && <path d="M6 12h.1M12 12h.1M18 12h.1" />}
    {type === 'box' && <path d="M5 8.5 12 5l7 3.5-7 3.5-7-3.5Zm0 0V16l7 3.5 7-3.5V8.5" />}
    {type === 'cloud' && <path d="M8.2 17.2h8.2c2 0 3.6-1.5 3.6-3.4s-1.6-3.4-3.6-3.4h-.4A5.2 5.2 0 0 0 6.1 12c-1.7.3-3 1.7-3 3.3 0 1.1.8 1.9 2.2 1.9" />}
    {type === 'shield' && <path d="M12 4.5 18 7v4.8c0 3.5-2.3 6.2-6 7.7-3.7-1.5-6-4.2-6-7.7V7l6-2.5Z" />}
    {type === 'bell' && <path d="M8 10a4 4 0 0 1 8 0v3.5l1.5 2.5h-11L8 13.5V10Zm2.5 8h3" />}
    {type === 'eye' && <path d="M3.8 12s3-5 8.2-5 8.2 5 8.2 5-3 5-8.2 5-8.2-5-8.2-5Zm8.2 2.5A2.5 2.5 0 1 0 12 9a2.5 2.5 0 0 0 0 5.5Z" />}
    {type === 'logout' && <path d="M10 6H6v12h4m3-9 3 3-3 3m-6-3h9" />}
    {type === 'settings' && <><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" /><path d="M19 12a7.1 7.1 0 0 0-.1-1.1l2-1.5-2-3.5-2.4 1a7.6 7.6 0 0 0-1.9-1.1L14.3 3h-4.6l-.3 2.8a7.6 7.6 0 0 0-1.9 1.1l-2.4-1-2 3.5 2 1.5A7.1 7.1 0 0 0 5 12c0 .4 0 .8.1 1.1l-2 1.5 2 3.5 2.4-1a7.6 7.6 0 0 0 1.9 1.1l.3 2.8h4.6l.3-2.8a7.6 7.6 0 0 0 1.9-1.1l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1.1Z" /></>}
  </svg>;
}

export class SectionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  retry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return <section className="section-error glass" role="alert"><h2>Something went wrong</h2><p>Reload this section</p><button className="btn btn-secondary" onClick={this.retry} type="button">Retry</button></section>;
    }
    return this.props.children;
  }
}

