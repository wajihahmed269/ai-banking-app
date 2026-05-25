import { useCallback, useState } from 'react';

const TOAST_TIMEOUT = 3600;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);
  const addToast = useCallback(({ type = 'info', title, message }) => {
    const id = Date.now() + '-' + Math.random().toString(36).slice(2);
    setToasts((current) => [...current, { id, type, title, message }].slice(-5));
    window.setTimeout(() => removeToast(id), TOAST_TIMEOUT);
  }, [removeToast]);
  return { toasts, addToast, removeToast };
}
