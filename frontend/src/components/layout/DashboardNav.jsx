import { useCallback } from 'react';
import { dashboardNav } from '../../data/demoData';
import { MiniIcon } from '../ui/MiniIcon';
import { Brand } from './Brand';
import { prefetchProfileChunks } from '../../utils/prefetch';

export function DashboardNav({ view, setView, goLanding, notificationOpen, setNotificationOpen, notificationItems }) {
  const toggleNotifications = useCallback(() => setNotificationOpen((current) => !current), [setNotificationOpen]);
  const openProfile = useCallback(() => setView('profile'), [setView]);
  const unreadCount = notificationItems.filter((item) => !item.read).length;

  return <header className="dash-nav glass"><Brand /><nav className="dash-nav-links">{dashboardNav.map((item) => <button className={view === item.view ? 'active' : ''} key={item.label} onClick={() => setView(item.view)} onFocus={item.view === 'profile' ? prefetchProfileChunks : undefined} onMouseEnter={item.view === 'profile' ? prefetchProfileChunks : undefined} type="button">{item.label}</button>)}</nav><div className="dash-user"><button className={notificationOpen ? 'icon-button notification-button active' : 'icon-button notification-button'} onClick={toggleNotifications} type="button" aria-label="Notifications" aria-expanded={notificationOpen}><MiniIcon type="bell" />{unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</button><button className="dash-profile-trigger" onClick={openProfile} onFocus={prefetchProfileChunks} onMouseEnter={prefetchProfileChunks} type="button" aria-label="Open profile view"><div className="avatar">WA</div><span>Wajih</span></button><button className="icon-button" onClick={goLanding} type="button" aria-label="Back to landing"><MiniIcon type="logout" /></button></div></header>;
}
