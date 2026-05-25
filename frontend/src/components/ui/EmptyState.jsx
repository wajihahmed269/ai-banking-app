export function EmptyState({ title, message, actionLabel, onAction }) {
  return <div className="empty-state"><span className="empty-mark" aria-hidden="true">Z</span><h3>{title}</h3><p>{message}</p>{actionLabel && onAction && <button className="btn btn-secondary" onClick={onAction} type="button">{actionLabel}</button>}</div>;
}
