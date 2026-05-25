import { memo } from 'react';
import { MiniIcon } from '../ui/MiniIcon';

export const QuickActions = memo(function QuickActions({ actions }) {
  return <section className="quick-card glass"><div className="panel-heading"><h2>Quick Actions</h2></div><div className="quick-grid">{actions.map((action) => <button className="quick-action" key={action.label} onClick={action.onClick} type="button"><span><MiniIcon type={action.icon} /></span>{action.label}</button>)}</div></section>;
});
