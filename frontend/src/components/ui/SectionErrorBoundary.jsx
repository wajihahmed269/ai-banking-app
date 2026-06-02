import { Component } from 'react';

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
