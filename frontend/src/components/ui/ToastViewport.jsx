export function ToastViewport({ toasts, onClose }) {
  return <div className="toast-viewport" aria-live="polite" aria-label="Notifications">{toasts.map((toast) => <article className={`toast-item ${toast.type}`} key={toast.id}><span className="toast-icon" aria-hidden="true">{toast.type === 'success' ? 'OK' : toast.type === 'error' ? '!' : toast.type === 'warning' ? '?' : 'i'}</span><div><strong>{toast.title}</strong>{toast.message && <p>{toast.message}</p>}</div><button onClick={() => onClose(toast.id)} type="button" aria-label="Dismiss notification">x</button></article>)}</div>;
}

