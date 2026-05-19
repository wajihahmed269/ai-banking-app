import { Component, lazy, memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { chat as sendAiChat } from './api/aiApi';
import * as authApi from './api/authApi';
import * as bankingApi from './api/bankingApi';
import { clearSession, getCurrentUser } from './auth/session';

const Prism = lazy(() => import('./components/backgrounds/Prism'));
const GridScan = lazy(() => import('./components/backgrounds/GridScan').then((module) => ({ default: module.GridScan })));
const ChromaGrid = lazy(() => import('./components/cards/ChromaGrid'));
const MagicBento = lazy(() => import('./components/cards/MagicBento'));
const ProfileCard = lazy(() => import('./components/cards/ProfileCard'));
const ReflectiveCard = lazy(() => import('./components/cards/ReflectiveCard'));

const profileImage = '/assets/profile/wajih-profile.png';

const techStack = [
  { name: 'Spring Boot', icon: 'leaf' },
  { name: 'React', icon: 'atom' },
  { name: 'MySQL', icon: 'database' },
  { name: 'JWT', icon: 'shield' },
  { name: 'Docker', icon: 'box' },
  { name: 'Kubernetes', icon: 'wheel' },
  { name: 'AWS', icon: 'cloud' },
  { name: 'Terraform', icon: 'blocks' },
];

const transactions = [
  { name: 'Salary', amount: 2450, date: 'Yesterday', type: 'income' },
  { name: 'Amazon', amount: -128.5, date: 'Today', type: 'spending' },
  { name: 'Netflix', amount: -15.99, date: 'May 7', type: 'spending' },
  { name: 'Spotify', amount: -9.99, date: 'May 6', type: 'spending' },
  { name: 'Transfer to Alex', amount: -200, date: 'May 5', type: 'transfers' },
  { name: 'Deposit', amount: 500, date: 'May 4', type: 'income' },
  { name: 'AWS Cloud Bill', amount: -42.18, date: 'May 3', type: 'spending' },
  { name: 'Azure Cloud Bill', amount: -31.4, date: 'May 3', type: 'spending' },
  { name: 'Coinbase Transfer', amount: -150, date: 'May 2', type: 'transfers' },
  { name: 'Dividend Credit', amount: 18.22, date: 'May 1', type: 'income' },
];

const fundingSources = [
  ['Bank Account', 'Standard ACH transfer', 'database'],
  ['Debit Card', 'Instant card top-up', 'bill'],
  ['PayPal', 'Add from PayPal balance', 'plus'],
  ['Cash App', 'Link Cash App transfer', 'send'],
  ['Venmo', 'Social wallet transfer', 'more'],
  ['Zelle', 'Bank-to-bank transfer', 'history'],
];

const billers = [
  ['Spotify', 'Subscriptions', '$9.99', 'bill'],
  ['Netflix', 'Subscriptions', '$15.99', 'bill'],
  ['Apple', 'Subscriptions', '$6.99', 'bill'],
  ['Amazon', 'Shopping', '$128.50', 'box'],
  ['AWS', 'Cloud', '$42.18', 'cloud'],
  ['Azure', 'Cloud', '$31.40', 'cloud'],
  ['Google Cloud', 'Cloud', '$22.75', 'cloud'],
  ['Coinbase', 'Crypto', 'Crypto transfer', 'shield'],
  ['Binance', 'Crypto', 'Crypto transfer', 'shield'],
  ['Crypto Wallet', 'Crypto', 'Wallet transfer', 'shield'],
  ['Electricity', 'Utilities', '$86.20', 'bill'],
  ['Internet', 'Utilities', '$49.99', 'cloud'],
  ['Mobile', 'Utilities', '$18.00', 'send'],
];

const watchlist = [
  ['AAPL', '+1.2%'],
  ['TSLA', '-0.8%'],
  ['NVDA', '+3.4%'],
  ['BTC', '+2.1%'],
  ['ETH', '+1.6%'],
];

const dashboardNav = [
  { label: 'Home', view: 'dashboard' },
  { label: 'Transfer', view: 'transfer' },
  { label: 'Cards', view: 'dashboard' },
  { label: 'Analytics', view: 'analytics' },
  { label: 'More', view: 'profile' },
];

const toolGroups = [
  {
    category: 'Frontend',
    description: 'The local UI sandbox and premium landing experience.',
    tools: ['React', 'Vite', 'CSS', 'React Bits'],
  },
  {
    category: 'Backend',
    description: 'Core banking services, data, and authentication contracts.',
    tools: ['Spring Boot', 'Java', 'MySQL', 'JWT'],
  },
  {
    category: 'DevOps / Platform',
    description: 'Deployment, automation, and GitOps operating model.',
    tools: ['Docker', 'Kubernetes', 'K3s', 'Argo CD', 'Terraform', 'Ansible', 'GitHub Actions'],
  },
  {
    category: 'Observability',
    description: 'Signals for health, logs, alerting, and remediation triggers.',
    tools: ['Prometheus', 'Grafana', 'Loki', 'Alertmanager'],
  },
  {
    category: 'AI / Automation',
    description: 'Prototype intelligence layer and self-healing workflows.',
    tools: ['Ollama', 'Remediation Webhook', 'Bash Automation', 'Self-Healing Scripts'],
  },
  {
    category: 'Cloud / Security',
    description: 'Cloud infrastructure, secrets, scanning, and code quality.',
    tools: ['AWS', 'Vault', 'Trivy', 'Checkstyle'],
  },
  {
    category: 'Design System',
    description: 'The visual system shaping the Zephyr interface.',
    tools: ['Prism', 'Grid Scan', 'Glassmorphism', 'Premium Dark UI'],
  },
];

const chromaToolItems = toolGroups.map((group) => {
  const accents = {
    Frontend: ['FE', 'blue / cyan', 'rgba(34, 211, 238, 0.34)', 'linear-gradient(145deg, rgba(37, 99, 235, 0.18), rgba(6, 182, 212, 0.08), rgba(2, 2, 3, 0.82))'],
    Backend: ['BE', 'green / blue', 'rgba(34, 197, 94, 0.32)', 'linear-gradient(145deg, rgba(34, 197, 94, 0.15), rgba(37, 99, 235, 0.08), rgba(2, 2, 3, 0.84))'],
    'DevOps / Platform': ['OPS', 'purple / blue', 'rgba(139, 92, 246, 0.34)', 'linear-gradient(145deg, rgba(139, 92, 246, 0.17), rgba(37, 99, 235, 0.08), rgba(2, 2, 3, 0.84))'],
    Observability: ['OBS', 'orange / purple', 'rgba(251, 146, 60, 0.32)', 'linear-gradient(145deg, rgba(251, 146, 60, 0.15), rgba(139, 92, 246, 0.08), rgba(2, 2, 3, 0.84))'],
    'AI / Automation': ['AI', 'violet / cyan', 'rgba(168, 85, 247, 0.34)', 'linear-gradient(145deg, rgba(168, 85, 247, 0.16), rgba(34, 211, 238, 0.08), rgba(2, 2, 3, 0.84))'],
    'Cloud / Security': ['SEC', 'amber / blue', 'rgba(245, 158, 11, 0.32)', 'linear-gradient(145deg, rgba(245, 158, 11, 0.14), rgba(59, 130, 246, 0.08), rgba(2, 2, 3, 0.84))'],
    'Design System': ['DS', 'pink / violet', 'rgba(236, 72, 153, 0.3)', 'linear-gradient(145deg, rgba(236, 72, 153, 0.14), rgba(139, 92, 246, 0.1), rgba(2, 2, 3, 0.84))'],
  };
  const [marker, accent, borderColor, gradient] = accents[group.category];
  return { title: group.category, description: group.description, tools: group.tools, marker, accent, borderColor, gradient };
});

const profileSettings = [
  { label: 'Access', title: 'Security', description: 'MFA, JWT sessions, and secure banking flows.', icon: 'S' },
  { label: 'Signals', title: 'Notifications', description: 'Alerts for transactions, remediation, and account activity.', icon: 'N' },
  { label: 'Display', title: 'Theme', description: 'Premium dark interface with future light mode support.', icon: 'T' },
  { label: 'Platform', title: 'Connected Cloud', description: 'AWS, Kubernetes, and GitOps infrastructure.', icon: 'C' },
  { label: 'Assistant', title: 'AI Assistant', description: 'Zephyr assistant for account and platform intelligence.', icon: 'AI' },
  { label: 'Prototype', title: 'Developer Mode', description: 'Prototype controls for testing dashboard flows.', icon: 'D' },
];

const notifications = [
  { title: 'Banking app is healthy', description: 'Self-healing checks passed 2 min ago', status: 'success' },
  { title: 'Balance card interaction', description: 'Prototype reveal state is ready', status: 'info' },
  { title: 'Alertmanager connected', description: 'Remediation webhook is listening', status: 'warning' },
  { title: 'AWS/K3s environment', description: 'Cluster telemetry is being monitored', status: 'info' },
];

const initialBalance = 24580.9;
const TOAST_TIMEOUT = 3600;
const PERFORMANCE_MODE_KEY = 'zephyrPerformanceMode';
const LITE_SUGGESTION_KEY = 'zephyrLiteSuggestionDismissed';
const PERFORMANCE_MODES = ['auto', 'full', 'lite'];
const defaultAiMessages = [{ role: 'assistant', text: 'Sign in to ask Zephyr about your live account activity.' }];
const welcomeAiMessages = [{ role: 'assistant', text: 'Welcome back. I can now review your live Zephyr account activity.' }];
const initialNotificationItems = notifications.map((notification, index) => ({
  ...notification,
  id: `notification-${index + 1}`,
  read: index > 0,
}));

const formatUSD = (amount) => amount.toLocaleString('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const parseMoneyValue = (value) => {
  const amount = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(amount) ? amount : null;
};

const formatMoney = (amount) => {
  const absolute = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : '+'}$${absolute}`;
};

const getSessionUsername = (user) => user?.username || user?.email || '';

const getTransactionReference = (transaction) => {
  if (transaction?.reference) return transaction.reference;
  if (transaction?.id) return `TX-${transaction.id}`;
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ZEPH-${stamp}-${suffix}`;
};

const buildReceipt = ({ transaction, type, amount, recipient, biller, note, category, paymentMethod }) => ({
  reference: getTransactionReference(transaction),
  type,
  amount,
  recipient: recipient || transaction?.recipient || '',
  biller: biller || transaction?.biller || '',
  note: note || transaction?.note || '',
  category: category || transaction?.category || '',
  paymentMethod: paymentMethod || transaction?.paymentMethod || '',
  status: 'Completed',
  date: transaction?.timestamp ? new Date(transaction.timestamp) : new Date(),
});

const schedulePrefetch = (loader) => {
  if (typeof window === 'undefined') return;
  const run = () => {
    try {
      loader().catch(() => {});
    } catch {
      // Prefetching is opportunistic and should never affect the visible UI.
    }
  };
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 1400 });
    return;
  }
  window.setTimeout(run, 220);
};

const prefetchAboutChunks = (includeHeavyVisuals = true) => schedulePrefetch(() => Promise.all([
  includeHeavyVisuals ? import('./components/backgrounds/GridScan') : Promise.resolve(),
  import('./components/cards/ProfileCard'),
  import('./components/cards/ChromaGrid'),
]));

const prefetchProfileChunks = () => schedulePrefetch(() => Promise.all([
  import('./components/cards/ReflectiveCard'),
  import('./components/cards/MagicBento'),
]));

const prefetchDashboardChunks = () => {
  prefetchProfileChunks();
};

const transactionDate = (timestamp) => {
  if (!timestamp) return 'Recent';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const mapBackendTransaction = (transaction) => {
  const rawType = transaction.type || 'Transaction';
  const normalizedType = rawType.toLowerCase();
  const isDebit = normalizedType.includes('withdraw')
    || normalizedType.includes('payment')
    || normalizedType.includes('out')
    || (normalizedType.includes('transfer') && transaction.recipient);
  const amount = Math.abs(Number(transaction.amount) || 0) * (isDebit ? -1 : 1);
  const type = normalizedType.includes('deposit') || normalizedType.includes('in')
    ? 'income'
    : normalizedType.includes('transfer')
      ? 'transfers'
      : 'spending';

  return {
    id: transaction.id,
    name: transaction.biller || transaction.recipient || transaction.source || rawType,
    amount,
    date: transactionDate(transaction.timestamp),
    type,
    timestamp: transaction.timestamp,
  };
};

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

function Brand() {
  return <div className="brand"><svg className="brand-mark" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 15.5c4.6-7.1 9-9.7 14-8.8-2.4 1.9-4.2 4-5.5 6.4 2.2-.3 4.1-.1 5.8.6-4.7 4.2-9.2 5.5-14.3 1.8Z" /></svg><span>ZEPHYR</span></div>;
}

function getStoredPerformanceMode() {
  if (typeof window === 'undefined') return 'auto';
  const storedMode = window.localStorage.getItem(PERFORMANCE_MODE_KEY);
  return PERFORMANCE_MODES.includes(storedMode) ? storedMode : 'auto';
}

function readDevicePerformance() {
  if (typeof window === 'undefined') {
    return { reducedMotion: false, lowMemory: false, lowCpu: false, smallViewport: false };
  }
  return {
    reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    lowMemory: Boolean(navigator.deviceMemory && navigator.deviceMemory <= 4),
    lowCpu: Boolean(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4),
    smallViewport: window.innerWidth < 768,
  };
}

function getDevicePerformanceReason(device, lagDetected) {
  if (device.reducedMotion) return 'Reduced motion is enabled.';
  if (lagDetected) return 'Repeated frame delays were detected.';
  if (device.lowMemory) return 'This device reports limited memory.';
  if (device.lowCpu) return 'This device reports limited CPU cores.';
  if (device.smallViewport) return 'Small viewports use lighter visuals by default.';
  return '';
}

function usePerformanceMode() {
  const [performanceMode, setPerformanceModeState] = useState(getStoredPerformanceMode);
  const [device, setDevice] = useState(readDevicePerformance);
  const [lagDetected, setLagDetected] = useState(false);
  const [suggestionDismissed, setSuggestionDismissed] = useState(() => (
    typeof window !== 'undefined' && window.localStorage.getItem(LITE_SUGGESTION_KEY) === 'true'
  ));

  const setPerformanceMode = useCallback((nextMode) => {
    const safeMode = PERFORMANCE_MODES.includes(nextMode) ? nextMode : 'auto';
    setPerformanceModeState(safeMode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PERFORMANCE_MODE_KEY, safeMode);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const updateDevice = () => setDevice(readDevicePerformance());
    window.addEventListener('resize', updateDevice, { passive: true });
    motionQuery?.addEventListener?.('change', updateDevice);
    return () => {
      window.removeEventListener('resize', updateDevice);
      motionQuery?.removeEventListener?.('change', updateDevice);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || device.reducedMotion || performanceMode !== 'auto') return undefined;
    let frame = 0;
    let slowFrames = 0;
    let last = performance.now();
    const stopAt = last + 3200;
    const sample = (now) => {
      if (now - last > 80) slowFrames += 1;
      last = now;
      if (slowFrames >= 3) {
        setLagDetected(true);
        return;
      }
      if (now < stopAt) frame = window.requestAnimationFrame(sample);
    };
    frame = window.requestAnimationFrame(sample);
    return () => window.cancelAnimationFrame(frame);
  }, [device.reducedMotion, performanceMode]);

  const autoLite = device.reducedMotion || device.lowMemory || device.lowCpu || device.smallViewport || lagDetected;
  const effectivePerformanceMode = device.reducedMotion ? 'lite' : performanceMode === 'auto' ? (autoLite ? 'lite' : 'full') : performanceMode;
  const devicePerformanceReason = getDevicePerformanceReason(device, lagDetected);
  const shouldSuggestLiteMode = !device.reducedMotion && !suggestionDismissed && performanceMode === 'auto' && autoLite;

  const dismissLiteSuggestion = useCallback(({ keepFull = false } = {}) => {
    setSuggestionDismissed(true);
    if (typeof window !== 'undefined') window.localStorage.setItem(LITE_SUGGESTION_KEY, 'true');
    if (keepFull) setPerformanceMode('full');
  }, [setPerformanceMode]);

  return {
    performanceMode,
    setPerformanceMode,
    effectivePerformanceMode,
    isLiteMode: effectivePerformanceMode === 'lite',
    reducedMotion: device.reducedMotion,
    lowDevice: device.lowMemory || device.lowCpu || device.smallViewport || lagDetected,
    devicePerformanceReason,
    shouldSuggestLiteMode,
    dismissLiteSuggestion,
  };
}

function LiteModeSuggestionModal({ performance, onSwitchLite, enabled = true }) {
  if (!enabled || !performance.shouldSuggestLiteMode) return null;
  return <div className="performance-modal-overlay" role="presentation"><section className="performance-modal glass" role="dialog" aria-modal="true" aria-labelledby="performance-modal-title"><p className="performance-kicker">Performance</p><h2 id="performance-modal-title">Animations may run slowly on this device</h2><p>Switch to Lite Mode for a smoother Zephyr experience. Layout and banking features stay the same.</p>{performance.devicePerformanceReason && <span>{performance.devicePerformanceReason}</span>}<div className="performance-modal-actions"><button className="btn btn-secondary" onClick={() => performance.dismissLiteSuggestion({ keepFull: true })} type="button">Keep Full UI</button><button className="btn btn-primary" onClick={onSwitchLite} type="button">Switch to Lite Mode</button></div></section></div>;
}

function PremiumSkeleton({ className = '' }) {
  return <div className={`premium-skeleton ${className}`.trim()} aria-hidden="true" />;
}

function SkeletonCard({ className = '', children }) {
  return <div className={`skeleton-card ${className}`.trim()} aria-hidden="true">{children}</div>;
}

function SkeletonLine({ className = '' }) {
  return <span className={`skeleton-line ${className}`.trim()} aria-hidden="true" />;
}

function DashboardSkeleton() {
  return <SkeletonCard className="dashboard-skeleton"><SkeletonLine className="wide" /><SkeletonLine className="hero-line" /><SkeletonLine /><SkeletonLine className="short" /></SkeletonCard>;
}

function TransactionsSkeleton() {
  return <div className="transactions-skeleton" aria-hidden="true">{Array.from({ length: 4 }).map((_, index) => <SkeletonCard className="transaction-skeleton-row" key={index}><SkeletonLine className="avatar-line" /><div><SkeletonLine /><SkeletonLine className="short" /></div><SkeletonLine className="amount-line" /></SkeletonCard>)}</div>;
}

function ProfileSkeleton() {
  return <ProfileViewFallback />;
}

function AnalyticsSkeleton() {
  return <div className="analytics-skeleton" aria-hidden="true">{Array.from({ length: 5 }).map((_, index) => <SkeletonCard key={index}><SkeletonLine className="short" /><SkeletonLine className="metric-line" /></SkeletonCard>)}</div>;
}

function AssistantBubbleSkeleton() {
  return <PremiumSkeleton className="assistant-bubble-skeleton" />;
}

function PrismFallback() {
  return <div className="prism-static-fallback prism-skeleton" aria-hidden="true" />;
}

function AboutProfileFallback() {
  return <PremiumSkeleton className="about-profile-skeleton" />;
}

function ChromaGridFallback() {
  return <div className="chroma-skeleton-grid" aria-hidden="true">{Array.from({ length: 7 }).map((_, index) => <PremiumSkeleton className="chroma-skeleton-card" key={index} />)}</div>;
}

function ProfileViewFallback() {
  return <div className="profile-lazy-skeleton" aria-hidden="true"><PremiumSkeleton className="profile-card-skeleton" /><div className="profile-bento-skeleton">{Array.from({ length: 6 }).map((_, index) => <PremiumSkeleton key={index} />)}</div></div>;
}

function MiniIcon({ type }) {
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
  </svg>;
}

class SectionErrorBoundary extends Component {
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

function EmptyState({ title, message, actionLabel, onAction }) {
  return <div className="empty-state"><span className="empty-mark" aria-hidden="true">Z</span><h3>{title}</h3><p>{message}</p>{actionLabel && onAction && <button className="btn btn-secondary" onClick={onAction} type="button">{actionLabel}</button>}</div>;
}

function ToastViewport({ toasts, onClose }) {
  return <div className="toast-viewport" aria-live="polite" aria-label="Notifications">{toasts.map((toast) => <article className={`toast-item ${toast.type}`} key={toast.id}><span className="toast-icon" aria-hidden="true">{toast.type === 'success' ? 'OK' : toast.type === 'error' ? '!' : toast.type === 'warning' ? '?' : 'i'}</span><div><strong>{toast.title}</strong>{toast.message && <p>{toast.message}</p>}</div><button onClick={() => onClose(toast.id)} type="button" aria-label="Dismiss notification">x</button></article>)}</div>;
}

function ReceiptModal({ receipt, onClose, onCopy }) {
  if (!receipt) return null;
  const target = receipt.type === 'Payment' ? receipt.biller : receipt.recipient;
  const date = receipt.date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  return <div className="receipt-overlay" role="presentation"><section className="receipt-modal glass" role="dialog" aria-modal="true" aria-labelledby="receipt-title"><button className="auth-close" onClick={onClose} type="button" aria-label="Close receipt">x</button><p className="receipt-kicker">Receipt</p><h2 id="receipt-title">{receipt.type} completed</h2><div className="receipt-amount">{formatUSD(receipt.amount)}</div><div className="receipt-grid"><span>Reference</span><strong>{receipt.reference}</strong><span>Type</span><strong>{receipt.type}</strong><span>{receipt.type === 'Payment' ? 'Biller' : 'Recipient'}</span><strong>{target || 'Recorded'}</strong><span>Date</span><strong>{date}</strong><span>Status</span><strong>{receipt.status}</strong>{receipt.category && <><span>Category</span><strong>{receipt.category}</strong></>}{receipt.paymentMethod && <><span>Payment method</span><strong>{receipt.paymentMethod}</strong></>}{receipt.note && <><span>Note</span><strong>{receipt.note}</strong></>}</div><div className="receipt-actions"><button className="btn btn-secondary" onClick={() => onCopy(receipt.reference)} type="button">Copy reference</button><button className="btn btn-primary" onClick={onClose} type="button">Close</button></div></section></div>;
}

export default function App() {
  const [view, setView] = useState('landing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [showBalance, setShowBalance] = useState(false);
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());
  const [transactionSearch, setTransactionSearch] = useState('');
  const [debouncedTransactionSearch, setDebouncedTransactionSearch] = useState('');
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [transferForm, setTransferForm] = useState({ recipient: '', amount: '', note: '' });
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState(defaultAiMessages);
  const [aiLoading, setAiLoading] = useState(false);
  const [quickPanel, setQuickPanel] = useState(null);
  const [selectedFundingSource, setSelectedFundingSource] = useState('');
  const [fundingMessage, setFundingMessage] = useState('');
  const [billCategory, setBillCategory] = useState('All');
  const [selectedBiller, setSelectedBiller] = useState('');
  const [billMessage, setBillMessage] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [balanceError, setBalanceError] = useState('');
  const [transactionsError, setTransactionsError] = useState('');
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [paymentConfirmOpen, setPaymentConfirmOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [notificationItems, setNotificationItems] = useState(initialNotificationItems);
  const [addMoneyStep, setAddMoneyStep] = useState('source');
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [addMoneyNote, setAddMoneyNote] = useState('');
  const [addMoneyError, setAddMoneyError] = useState('');
  const performance = usePerformanceMode();

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((current) => [...current, { id, type, title, message }].slice(-5));
    window.setTimeout(() => removeToast(id), TOAST_TIMEOUT);
  }, [removeToast]);

  const updatePerformanceMode = useCallback((nextMode) => {
    performance.setPerformanceMode(nextMode);
    addToast({ type: 'success', title: 'Performance mode updated' });
  }, [addToast, performance]);

  const switchToLiteMode = useCallback(() => {
    performance.setPerformanceMode('lite');
    performance.dismissLiteSuggestion();
    addToast({ type: 'success', title: 'Performance mode updated' });
  }, [addToast, performance]);

  const copyReceiptReference = useCallback(async (reference) => {
    try {
      await navigator.clipboard.writeText(reference);
      addToast({ type: 'success', title: 'Reference copied', message: reference });
    } catch {
      addToast({ type: 'error', title: 'Copy failed', message: 'Clipboard access was not available.' });
    }
  }, [addToast]);

  const openAuth = useCallback((mode = 'signin') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }, []);
  const closeAuth = useCallback(() => setIsAuthOpen(false), []);
  const enterDashboard = useCallback((user = currentUser) => {
    closeAuth();
    if (user) {
      setCurrentUserState(user);
      setAiMessages(welcomeAiMessages);
    }
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [closeAuth, currentUser]);
  const goLanding = useCallback(() => {
    clearSession();
    setCurrentUserState(null);
    setView('landing');
    setIsAuthOpen(false);
    setNotificationOpen(false);
    setBalance(0);
    setRecentTransactions([]);
    setUsingFallbackData(false);
    setAiMessages(defaultAiMessages);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  }, []);

  const resetAddMoneyFlow = useCallback(() => {
    setSelectedFundingSource('');
    setFundingMessage('');
    setAddMoneyStep('source');
    setAddMoneyAmount('');
    setAddMoneyNote('');
    setAddMoneyError('');
  }, []);

  const openQuickPanel = useCallback((panel) => {
    if (panel === 'addMoney') resetAddMoneyFlow();
    if (panel === 'payBills') {
      setSelectedBiller('');
      setBillCategory('All');
      setBillMessage('');
      setPaymentConfirmOpen(false);
    }
    setQuickPanel(panel);
  }, [resetAddMoneyFlow]);

  const closeQuickPanel = useCallback(() => {
    setQuickPanel(null);
    setPaymentConfirmOpen(false);
    resetAddMoneyFlow();
  }, [resetAddMoneyFlow]);

  const refreshAccountData = useCallback(async ({ allowFallback = true } = {}) => {
    const username = getSessionUsername(currentUser);
    if (!username) return;

    setBalanceLoading(true);
    setTransactionsLoading(true);
    setBalanceError('');
    setTransactionsError('');
    setUsingFallbackData(false);

    try {
      const [nextBalance, nextTransactions] = await Promise.all([
        bankingApi.getBalance(username),
        bankingApi.getTransactions(username),
      ]);
      setBalance(Number(nextBalance) || 0);
      setRecentTransactions(Array.isArray(nextTransactions) ? nextTransactions.map(mapBackendTransaction) : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load account data.';
      setBalanceError(message);
      setTransactionsError(message);
      if (allowFallback) {
        setBalance(initialBalance);
        setRecentTransactions(transactions);
        setUsingFallbackData(true);
      }
    } finally {
      setBalanceLoading(false);
      setTransactionsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedTransactionSearch(transactionSearch), 300);
    return () => window.clearTimeout(timer);
  }, [transactionSearch]);

  const filteredTransactions = useMemo(() => {
    const query = debouncedTransactionSearch.trim().toLowerCase();
    return recentTransactions.filter((transaction) => {
      const matchesSearch = transaction.name.toLowerCase().includes(query);
      const matchesFilter = transactionFilter === 'all' || transaction.type === transactionFilter;
      return matchesSearch && matchesFilter;
    });
  }, [debouncedTransactionSearch, recentTransactions, transactionFilter]);

  useEffect(() => {
    if (view === 'landing' || !currentUser) return;
    refreshAccountData();
  }, [currentUser, refreshAccountData, view]);

  useEffect(() => {
    if (view === 'landing') return;
    prefetchDashboardChunks();
  }, [view]);

  const sendAiMessage = useCallback(async (event) => {
    event.preventDefault();
    const text = aiInput.trim();
    if (!text) return;
    const username = getSessionUsername(currentUser);
    if (!username) {
      setAiMessages((current) => [...current, { role: 'user', text }, { role: 'assistant', text: 'Sign in before using the live AI assistant.', error: true }]);
      setAiInput('');
      return;
    }
    setAiMessages((current) => [...current, { role: 'user', text }]);
    setAiInput('');
    setAiLoading(true);
    try {
      const result = await sendAiChat(username, text);
      setAiMessages((current) => [...current, { role: 'assistant', text: result.response || 'No response from AI.' }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI failed. Please try again.';
      setAiMessages((current) => [...current, { role: 'assistant', text: message, error: true }]);
      addToast({ type: 'error', title: 'AI assistant failed', message });
    } finally {
      setAiLoading(false);
    }
  }, [addToast, aiInput, currentUser]);

  const submitTransfer = useCallback(async (event) => {
    event.preventDefault();
    const username = getSessionUsername(currentUser);
    const amount = Number(transferForm.amount);
    if (!username) {
      setTransferError('Sign in before sending money.');
      setTransferSuccess('');
      return;
    }
    if (!transferForm.recipient.trim()) {
      setTransferError('Recipient is required.');
      setTransferSuccess('');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setTransferError('Amount must be a positive number.');
      setTransferSuccess('');
      return;
    }
    setTransferError('');
    setTransferSuccess('');
    setTransferLoading(true);
    try {
      const result = await bankingApi.transfer(username, transferForm.recipient.trim(), amount, transferForm.note.trim());
      await refreshAccountData({ allowFallback: false });
      const nextReceipt = buildReceipt({ transaction: result, type: 'Transfer', amount, recipient: transferForm.recipient.trim(), note: transferForm.note.trim() });
      setReceipt(nextReceipt);
      setTransferSuccess(`Transfer successful. Reference ${nextReceipt.reference}`);
      addToast({ type: 'success', title: 'Transfer completed', message: `${formatUSD(amount)} sent to ${transferForm.recipient.trim()}.` });
      setTransferForm({ recipient: '', amount: '', note: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transfer failed.';
      setTransferError(message);
      addToast({ type: 'error', title: 'Transfer failed', message });
    } finally {
      setTransferLoading(false);
    }
  }, [addToast, currentUser, refreshAccountData, setTransferForm, transferForm.amount, transferForm.note, transferForm.recipient]);

  const resetDemoView = useCallback(() => {
    setAiMessages(currentUser ? welcomeAiMessages : defaultAiMessages);
    setNotificationItems(initialNotificationItems);
    setTransactionSearch('');
    setDebouncedTransactionSearch('');
    setTransactionFilter('all');
    setReceipt(null);
    setQuickPanel(null);
    setPaymentConfirmOpen(false);
    setTransferError('');
    setTransferSuccess('');
    setBillMessage('');
    resetAddMoneyFlow();
    if (currentUser) refreshAccountData({ allowFallback: false });
    addToast({ type: 'info', title: 'Demo view reset', message: 'Presentation-only UI state was restored.' });
  }, [addToast, currentUser, refreshAccountData, resetAddMoneyFlow]);

  const markAllNotificationsRead = useCallback(() => {
    setNotificationItems((current) => current.map((item) => ({ ...item, read: true })));
    addToast({ type: 'success', title: 'Notifications updated', message: 'All notifications marked as read.' });
  }, [addToast]);

  const clearReadNotifications = useCallback(() => {
    setNotificationItems((current) => current.filter((item) => !item.read));
    addToast({ type: 'info', title: 'Notifications cleared', message: 'Read notifications were removed.' });
  }, [addToast]);

  const toggleNotificationRead = useCallback((id) => {
    setNotificationItems((current) => current.map((item) => (item.id === id ? { ...item, read: !item.read } : item)));
    addToast({ type: 'info', title: 'Notification updated', message: 'Read state changed.' });
  }, [addToast]);

  useEffect(() => {
    if (!isAuthOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeAuth();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthOpen]);

  useEffect(() => {
    if (!quickPanel) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (paymentConfirmOpen) {
          setPaymentConfirmOpen(false);
          return;
        }
        closeQuickPanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paymentConfirmOpen, quickPanel]);

  useEffect(() => {
    if (!notificationOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setNotificationOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notificationOpen]);

  return <div className={`app-root ${performance.isLiteMode ? 'performance-lite' : 'performance-full'}`} data-performance-mode={performance.effectivePerformanceMode}>
    {view === 'landing' ? <LandingView openAuth={openAuth} performance={performance} updatePerformanceMode={updatePerformanceMode} /> : <DashboardView view={view} setView={setView} goLanding={goLanding} showBalance={showBalance} setShowBalance={setShowBalance} balance={balance} balanceLoading={balanceLoading} balanceError={balanceError} recentTransactions={recentTransactions} transactionsLoading={transactionsLoading} transactionsError={transactionsError} usingFallbackData={usingFallbackData} transactionSearch={transactionSearch} setTransactionSearch={setTransactionSearch} transactionFilter={transactionFilter} setTransactionFilter={setTransactionFilter} filteredTransactions={filteredTransactions} transferForm={transferForm} setTransferForm={setTransferForm} transferError={transferError} transferSuccess={transferSuccess} transferLoading={transferLoading} submitTransfer={submitTransfer} aiInput={aiInput} setAiInput={setAiInput} aiMessages={aiMessages} aiLoading={aiLoading} sendAiMessage={sendAiMessage} setQuickPanel={openQuickPanel} notificationOpen={notificationOpen} setNotificationOpen={setNotificationOpen} notificationItems={notificationItems} markAllNotificationsRead={markAllNotificationsRead} clearReadNotifications={clearReadNotifications} toggleNotificationRead={toggleNotificationRead} resetDemoView={resetDemoView} addToast={addToast} performance={performance} updatePerformanceMode={updatePerformanceMode} />}
    {isAuthOpen && <AuthModal authMode={authMode} setAuthMode={setAuthMode} closeAuth={closeAuth} enterDashboard={enterDashboard} addToast={addToast} />}
    {quickPanel && <QuickPanel type={quickPanel} closePanel={closeQuickPanel} currentUser={currentUser} refreshAccountData={refreshAccountData} selectedFundingSource={selectedFundingSource} setSelectedFundingSource={setSelectedFundingSource} fundingMessage={fundingMessage} setFundingMessage={setFundingMessage} addMoneyStep={addMoneyStep} setAddMoneyStep={setAddMoneyStep} addMoneyAmount={addMoneyAmount} setAddMoneyAmount={setAddMoneyAmount} addMoneyNote={addMoneyNote} setAddMoneyNote={setAddMoneyNote} addMoneyError={addMoneyError} setAddMoneyError={setAddMoneyError} billCategory={billCategory} setBillCategory={setBillCategory} selectedBiller={selectedBiller} setSelectedBiller={setSelectedBiller} billMessage={billMessage} setBillMessage={setBillMessage} paymentConfirmOpen={paymentConfirmOpen} setPaymentConfirmOpen={setPaymentConfirmOpen} addToast={addToast} setReceipt={setReceipt} />}
    <LiteModeSuggestionModal performance={performance} onSwitchLite={switchToLiteMode} enabled={view === 'landing'} />
    <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} onCopy={copyReceiptReference} />
    <ToastViewport toasts={toasts} onClose={removeToast} />
  </div>;
}

function LandingView({ openAuth, performance, updatePerformanceMode }) {
  const { isLiteMode } = performance;
  const enablePrism = performance.effectivePerformanceMode === 'full';

  useEffect(() => {
    prefetchDashboardChunks();
  }, []);

  return <div className="landing-page">
    <div className="background"><SectionErrorBoundary>{enablePrism ? <Suspense fallback={<PrismFallback />}><Prism animationType="rotate" height={3.5} baseWidth={5.5} scale={4} glow={0.95} noise={0.03} bloom={0.85} hueShift={-0.32} colorFrequency={0.92} timeScale={0.34} offset={{ x: 330, y: 12 }} transparent suspendWhenOffscreen /></Suspense> : <PrismFallback />}</SectionErrorBoundary></div>
    <div className="overlay" />
    <header className="navbar glass"><Brand /><nav className="nav-links"><a href="#intro">Intro</a><a href="#about" onFocus={() => prefetchAboutChunks(!isLiteMode)} onMouseEnter={() => prefetchAboutChunks(!isLiteMode)}>About</a><a href="#features">Features</a><LandingPerformanceControl performance={performance} updatePerformanceMode={updatePerformanceMode} /><button className="nav-sign-in" onClick={() => openAuth('signin')} type="button">Sign In</button></nav></header>
    <main className="hero"><section className="hero-content"><div className="announcement-pill"><svg className="pill-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6-5.5-1.7L10.3 9 12 3.5Z" /></svg>Autonomous banking, quietly overengineered</div><h1>Just a Normal <span className="headline-gradient">Banking App</span></h1><p>Absolutely nothing overengineered behind the scenes.</p><div className="hero-actions"><button className="btn btn-primary" onClick={() => openAuth('signin')} type="button"><span>Sign In</span><span className="cta-arrow" aria-hidden="true">&gt;</span></button><a className="btn btn-secondary" href="#intro"><span>Explore Architecture</span><span className="cta-arrow" aria-hidden="true">&gt;</span></a></div></section><TechStrip /></main>
    <LandingSections performance={performance} />
  </div>;
}

function LandingSections({ performance }) {
  const aboutRef = useRef(null);
  const [aboutActive, setAboutActive] = useState(false);
  const { isLiteMode } = performance;
  const enableGridScan = aboutActive && !isLiteMode;
  const enableAboutCards = aboutActive;

  useEffect(() => {
    const node = aboutRef.current;
    if (!node) return undefined;
    if (!('IntersectionObserver' in window)) {
      setAboutActive(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setAboutActive(entry.isIntersecting);
    }, { rootMargin: '260px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <>
    <section className="content-section" id="intro"><div className="section-heading"><p>Intro</p><h2>Banking infrastructure that feels quiet on the surface.</h2></div><div className="section-grid three"><article className="section-card"><span>01</span><h3>AI banking interface</h3><p>Zephyr brings a conversational layer to account activity, operational insight, and user workflows.</p></article><article className="section-card"><span>02</span><h3>Self-healing infrastructure</h3><p>Behind the interface, the platform is shaped around automated recovery and resilient service patterns.</p></article><article className="section-card"><span>03</span><h3>Cloud-native reliability</h3><p>Designed for modern deployment pipelines, observable systems, and durable financial experiences.</p></article></div></section>
    <section className="about-section about-grid-scan-ready" id="about" ref={aboutRef}>
      <div className="about-grid-bg" aria-hidden="true">
        <SectionErrorBoundary>{enableGridScan ? <Suspense fallback={<PremiumSkeleton className="gridscan-skeleton" />}><GridScan
          enableWebcam={false}
          showPreview={false}
          lineThickness={1}
          linesColor="#273045"
          scanColor="#b7c4ff"
          scanOpacity={0.36}
          gridScale={0.115}
          lineStyle="solid"
          lineJitter={0.055}
          enablePost={false}
          bloomIntensity={0}
          chromaticAberration={0}
          noiseIntensity={0.006}
          scanGlow={0.78}
          scanSoftness={2.1}
          scanPhaseTaper={0.86}
          scanDuration={2.8}
          scanDelay={2.2}
          scanDirection="pingpong"
          className="zephyr-grid-scan"
        /></Suspense> : <div className="static-grid-fallback" />}</SectionErrorBoundary>
      </div>
      <div className="about-section-inner">
        <div className="about-copy">
          <p className="about-eyebrow">THE BUILDER</p>
          <h2>Wajih Ahmed</h2>
          <p>DevOps Engineer building Phoenix-Ops and Zephyr — a self-healing banking platform powered by Kubernetes, observability, and AI-assisted remediation.</p>
        </div>
        <div className="about-profile-wrap">
          <SectionErrorBoundary>{enableAboutCards ? <Suspense fallback={<AboutProfileFallback />}><ProfileCard
            avatarUrl={profileImage}
            miniAvatarUrl={profileImage}
            iconUrl=""
            grainUrl=""
            name="Wajih Ahmed"
            title="DevOps Engineer"
            handle="wajihahmed269"
            status="Building Zephyr"
            contactText="GitHub"
            showUserInfo
            enableTilt={!isLiteMode}
            behindGlowEnabled={!isLiteMode}
            behindGlowColor="rgba(96, 165, 250, 0.36)"
            innerGradient="linear-gradient(145deg, rgba(99, 102, 241, 0.34) 0%, rgba(14, 165, 233, 0.18) 58%, rgba(2, 2, 3, 0.18) 100%)"
            onContactClick={() => window.open('https://github.com/wajihahmed269', '_blank', 'noopener,noreferrer')}
          /></Suspense> : <AboutProfileFallback />}</SectionErrorBoundary>
        </div>
        <div className="built-with">
          <div className="built-with-heading">
            <p>Built With</p>
            <h3>The stack behind Zephyr and Phoenix-Ops.</h3>
          </div>
          <div className="tool-grid">
            <SectionErrorBoundary>{enableAboutCards ? <Suspense fallback={<ChromaGridFallback />}><ChromaGrid items={chromaToolItems} /></Suspense> : <ChromaGridFallback />}</SectionErrorBoundary>
          </div>
        </div>
      </div>
    </section>
    <section className="content-section" id="features"><div className="section-heading"><p>Features</p><h2>Designed for secure, observable, automated banking workflows.</h2></div><div className="section-grid four"><article className="section-card"><span>AI</span><h3>AI Assistant</h3><p>Context-aware support for financial actions, summaries, and operational questions.</p></article><article className="section-card"><span>SEC</span><h3>Secure Transactions</h3><p>Authentication-first flows prepared for policy controls and protected banking actions.</p></article><article className="section-card"><span>OBS</span><h3>Observability</h3><p>Interfaces and infrastructure planned around service health, logs, metrics, and traceability.</p></article><article className="section-card"><span>AUTO</span><h3>Automated Remediation</h3><p>Operational patterns for detecting issues and initiating recovery without noisy manual intervention.</p></article></div></section>
  </>;
}

function TechStrip() {
  return <section className="tech-strip glass" aria-label="Technology stack">{techStack.map((tech) => <span className="tech-item" key={tech.name}><span className="tech-icon"><TechIcon type={tech.icon} /></span>{tech.name}</span>)}</section>;
}

function AuthModal({ authMode, setAuthMode, closeAuth, enterDashboard, addToast }) {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const updateField = useCallback((field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setAuthError('');
    setAuthSuccess('');
  }, []);

  const switchMode = useCallback((mode) => {
    setAuthMode(mode);
    setAuthError('');
    setAuthSuccess('');
  }, [setAuthMode]);

  const submitAuth = useCallback(async (event) => {
    event.preventDefault();
    const username = form.username.trim();
    if (!username || !form.password) {
      setAuthError('Username and password are required.');
      return;
    }
    if (authMode === 'signup' && form.password !== form.confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      if (authMode === 'signin') {
        const result = await authApi.login({ username, password: form.password });
        addToast({ type: 'success', title: 'Signed in', message: 'Live banking data is ready.' });
        enterDashboard(result.user || { username });
        return;
      }

      const result = await authApi.register({ username, password: form.password });
      if (result.token || result.user) {
        addToast({ type: 'success', title: 'Account created', message: 'You are signed in to Zephyr.' });
        enterDashboard(result.user || { username });
        return;
      }
      setAuthSuccess('Account created. Sign in with your new username.');
      addToast({ type: 'success', title: 'Account created', message: 'Sign in with your new username.' });
      setAuthMode('signin');
      setForm((current) => ({ ...current, password: '', confirmPassword: '' }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed.';
      setAuthError(message);
      addToast({ type: 'error', title: authMode === 'signin' ? 'Sign in failed' : 'Register failed', message });
    } finally {
      setAuthLoading(false);
    }
  }, [addToast, authMode, enterDashboard, form.confirmPassword, form.password, form.username, setAuthMode]);

  return <div className="auth-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAuth(); }}><section className="auth-modal glass" aria-modal="true" role="dialog"><button className="auth-close" onClick={closeAuth} type="button" aria-label="Close authentication modal">x</button><div className="auth-header"><div><h2>Welcome Back</h2><p>Sign in to continue to Zephyr.</p></div><div className="auth-tabs" role="tablist" aria-label="Authentication mode"><button className={authMode === 'signin' ? 'active' : ''} onClick={() => switchMode('signin')} type="button" role="tab" aria-selected={authMode === 'signin'}>Sign In</button><button className={authMode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')} type="button" role="tab" aria-selected={authMode === 'signup'}>Sign Up</button></div></div><div className="auth-panel" data-mode={authMode}><form className="auth-form" onSubmit={submitAuth}>{authMode === 'signup' && <label>Username<input type="text" value={form.username} onChange={(event) => updateField('username', event.target.value)} placeholder="wajih" autoComplete="username" /></label>}{authMode === 'signin' && <label>Username<input type="text" value={form.username} onChange={(event) => updateField('username', event.target.value)} placeholder="wajih" autoComplete="username" /></label>}<label>Password<input type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="Password" autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'} /></label>{authMode === 'signup' && <label>Confirm Password<input type="password" value={form.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} placeholder="Confirm password" autoComplete="new-password" /></label>}{authMode === 'signin' && <div className="auth-row"><label className="check-row"><input type="checkbox" /> Remember me</label><span>Spring API session</span></div>}{authError && <p className="auth-message error">{authError}</p>}{authSuccess && <p className="auth-message success">{authSuccess}</p>}<button className="btn btn-primary btn-auth-primary full-width" disabled={authLoading} type="submit"><span>{authLoading ? 'Working...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}</span><span className="btn-arrow" aria-hidden="true">&gt;</span></button><button className="btn btn-auth-secondary full-width" disabled type="button"><span className="google-icon" aria-hidden="true">G</span><span>Backend auth only</span></button><p className="auth-switch">{authMode === 'signin' ? 'New to Zephyr?' : 'Already have an account?'} <button onClick={() => switchMode(authMode === 'signin' ? 'signup' : 'signin')} type="button">{authMode === 'signin' ? 'Create an account' : 'Sign in'}</button></p></form></div></section></div>;
}

function DashboardView(props) {
  return <div className="dashboard-page"><DashboardNav view={props.view} setView={props.setView} goLanding={props.goLanding} notificationOpen={props.notificationOpen} setNotificationOpen={props.setNotificationOpen} notificationItems={props.notificationItems} markAllNotificationsRead={props.markAllNotificationsRead} clearReadNotifications={props.clearReadNotifications} toggleNotificationRead={props.toggleNotificationRead} />{props.view === 'dashboard' && <DashboardHome {...props} />}{props.view === 'transactions' && <TransactionsView {...props} />}{props.view === 'transfer' && <TransferView {...props} />}{props.view === 'analytics' && <AnalyticsView />}{props.view === 'profile' && <ProfileView resetDemoView={props.resetDemoView} performance={props.performance} updatePerformanceMode={props.updatePerformanceMode} />}</div>;
}

function DashboardNav({ view, setView, goLanding, notificationOpen, setNotificationOpen, notificationItems, markAllNotificationsRead, clearReadNotifications, toggleNotificationRead }) {
  const toggleNotifications = useCallback(() => setNotificationOpen((current) => !current), [setNotificationOpen]);
  const closeNotifications = useCallback(() => setNotificationOpen(false), [setNotificationOpen]);
  const openProfile = useCallback(() => setView('profile'), [setView]);
  const unreadCount = notificationItems.filter((item) => !item.read).length;

  return <header className="dash-nav glass"><Brand /><nav className="dash-nav-links">{dashboardNav.map((item) => <button className={view === item.view ? 'active' : ''} key={item.label} onClick={() => setView(item.view)} onFocus={item.view === 'profile' ? prefetchProfileChunks : undefined} onMouseEnter={item.view === 'profile' ? prefetchProfileChunks : undefined} type="button">{item.label}</button>)}</nav><div className="dash-user"><button className={notificationOpen ? 'icon-button notification-button active' : 'icon-button notification-button'} onClick={toggleNotifications} type="button" aria-label="Notifications" aria-expanded={notificationOpen}><MiniIcon type="bell" />{unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</button><button className="dash-profile-trigger" onClick={openProfile} onFocus={prefetchProfileChunks} onMouseEnter={prefetchProfileChunks} type="button" aria-label="Open profile view"><div className="avatar">WA</div><span>Wajih</span></button><button className="icon-button" onClick={goLanding} type="button" aria-label="Back to landing"><MiniIcon type="logout" /></button></div>{notificationOpen && <><button className="notification-scrim" onClick={closeNotifications} type="button" aria-label="Close notifications" /><NotificationPanel items={notificationItems} setView={setView} closePanel={closeNotifications} markAllRead={markAllNotificationsRead} clearRead={clearReadNotifications} toggleRead={toggleNotificationRead} /></>}</header>;
}

function NotificationPanel({ items, setView, closePanel, markAllRead, clearRead, toggleRead }) {
  const unreadCount = items.filter((item) => !item.read).length;
  return <aside className="notification-panel glass" aria-label="Notifications"><div className="notification-panel-head"><div><p>Dashboard</p><h2>Notifications</h2></div><span>{unreadCount}</span></div><div className="notification-actions"><button onClick={markAllRead} disabled={unreadCount === 0} type="button">Mark all read</button><button onClick={clearRead} disabled={!items.some((item) => item.read)} type="button">Clear read</button></div>{items.length === 0 ? <EmptyState title="No notifications" message="System and account alerts will appear here." /> : <div className="notification-list">{items.map((item) => <article className={`notification-item ${item.status} ${item.read ? 'read' : 'unread'}`} key={item.id}><span className="notification-dot" /><div><div className="notification-meta"><h3>{item.title}</h3><button onClick={() => toggleRead(item.id)} type="button">{item.read ? 'Unread' : 'Read'}</button></div><p>{item.description}</p><small>{item.status}</small></div></article>)}</div>}<button className="notification-footer" onClick={() => { setView('analytics'); closePanel(); }} type="button">View system events</button></aside>;
}

function DashboardHome({ setView, showBalance, setShowBalance, balance, balanceLoading, balanceError, recentTransactions, transactionsLoading, transactionsError, usingFallbackData, aiInput, setAiInput, aiMessages, aiLoading, sendAiMessage, setQuickPanel }) {
  const openTransfer = useCallback(() => setView('transfer'), [setView]);
  const openTransactions = useCallback(() => setView('transactions'), [setView]);
  const openProfile = useCallback(() => setView('profile'), [setView]);
  const openAddMoney = useCallback(() => setQuickPanel('addMoney'), [setQuickPanel]);
  const openPayBills = useCallback(() => setQuickPanel('payBills'), [setQuickPanel]);
  const openInvestment = useCallback(() => setQuickPanel('investment'), [setQuickPanel]);
  const quickActions = useMemo(() => [{ label: 'Transfer', icon: 'send', onClick: openTransfer }, { label: 'Add Money', icon: 'plus', onClick: openAddMoney }, { label: 'Pay Bills', icon: 'bill', onClick: openPayBills }, { label: 'History', icon: 'history', onClick: openTransactions }, { label: 'More', icon: 'more', onClick: openProfile }], [openAddMoney, openPayBills, openProfile, openTransactions, openTransfer]);
  return <main className="dashboard-shell"><section className="dash-main"><SectionErrorBoundary><BalanceCard showBalance={showBalance} setShowBalance={setShowBalance} balance={balance} loading={balanceLoading} error={balanceError} usingFallbackData={usingFallbackData} /></SectionErrorBoundary><SectionErrorBoundary><QuickActions actions={quickActions} /></SectionErrorBoundary><SectionErrorBoundary><AiAssistant aiInput={aiInput} setAiInput={setAiInput} aiMessages={aiMessages} aiLoading={aiLoading} sendAiMessage={sendAiMessage} /></SectionErrorBoundary></section><aside className="dash-side"><SectionErrorBoundary><RecentTransactions transactions={recentTransactions} loading={transactionsLoading} error={transactionsError} usingFallbackData={usingFallbackData} onViewAll={openTransactions} /></SectionErrorBoundary><SectionErrorBoundary><InvestmentsCard openPanel={openInvestment} /></SectionErrorBoundary></aside><DashboardTechStrip /></main>;
}

const BalanceCard = memo(function BalanceCard({ showBalance, setShowBalance, balance, loading, error, usingFallbackData }) {
  const toggleBalance = useCallback(() => setShowBalance((current) => !current), [setShowBalance]);
  return <div className="balance-card glass" onClick={toggleBalance} role="button" tabIndex={0}><div className="balance-copy"><div className="card-title-row"><p>Total Balance</p><button className="icon-button" onClick={(event) => { event.stopPropagation(); toggleBalance(); }} type="button" aria-label="Toggle balance"><MiniIcon type="eye" /></button></div>{loading ? <DashboardSkeleton /> : <><h1>{showBalance ? formatUSD(balance) : '••••••'}</h1><span>{error ? `API error: ${error}` : usingFallbackData ? 'Fallback demo balance shown' : showBalance ? 'Balance revealed' : 'Tap the card to reveal'}</span></>} </div><div className="cat-stage"><img className={showBalance ? 'cat-image visible' : 'cat-image'} src="/assets/cats/cat-shocked.png" alt="Shocked cat face" loading="lazy" decoding="async" width="230" height="230" /><img className={showBalance ? 'cat-image' : 'cat-image visible'} src="/assets/cats/cat-normal.png" alt="Cute standing cat" loading="lazy" decoding="async" width="230" height="230" /></div></div>;
});

const QuickActions = memo(function QuickActions({ actions }) {
  return <section className="quick-card glass"><div className="panel-heading"><h2>Quick Actions</h2></div><div className="quick-grid">{actions.map((action) => <button className="quick-action" key={action.label} onClick={action.onClick} type="button"><span><MiniIcon type={action.icon} /></span>{action.label}</button>)}</div></section>;
});

const RecentTransactions = memo(function RecentTransactions({ transactions: recentItems, loading, error, usingFallbackData, onViewAll }) {
  const visibleItems = recentItems.slice(0, 4);
  return <section className="recent-card glass"><div className="panel-heading row"><h2>Recent Transactions</h2><button onClick={onViewAll} type="button">View All</button></div>{error && <p className="data-status error">API error: {error}</p>}{usingFallbackData && <p className="data-status">Fallback demo transactions shown</p>}{loading ? <TransactionsSkeleton /> : visibleItems.length === 0 ? <EmptyState title="No transactions" message="Completed deposits, transfers, and payments will appear here." actionLabel="Open history" onAction={onViewAll} /> : <div className="transaction-list">{visibleItems.map((transaction, index) => <TransactionItem key={`${transaction.id || transaction.name}-${transaction.date}-${index}`} transaction={transaction} />)}</div>}</section>;
});

function TransactionItem({ transaction }) {
  const positive = transaction.amount > 0;
  const name = transaction.name || 'Transaction';
  return <div className="transaction-item"><span className="merchant-icon">{name.slice(0, 1)}</span><div><strong>{name}</strong><small>{transaction.date}</small></div><b className={positive ? 'amount positive' : 'amount negative'}>{formatMoney(transaction.amount)}</b></div>;
}

const AiAssistant = memo(function AiAssistant({ aiInput, setAiInput, aiMessages, aiLoading, sendAiMessage }) {
  const setBalancePrompt = useCallback(() => setAiInput('Why did my balance change?'), [setAiInput]);
  const setSpendingPrompt = useCallback(() => setAiInput('Summarize recent spending'), [setAiInput]);
  const setActivityPrompt = useCallback(() => setAiInput('Any unusual activity?'), [setAiInput]);
  return <section className="ai-panel glass"><div className="panel-heading"><h2>AI Assistant</h2><p>Ask Zephyr about your account activity.</p></div><div className="suggestions"><button type="button" onClick={setBalancePrompt}>Why did my balance change?</button><button type="button" onClick={setSpendingPrompt}>Summarize recent spending</button><button type="button" onClick={setActivityPrompt}>Any unusual activity?</button></div><div className="chat-window">{aiMessages.length === 0 && !aiLoading ? <EmptyState title="No AI messages" message="Ask Zephyr for account summaries or activity insight." /> : aiMessages.map((message, index) => <p className={message.role === 'user' ? 'chat-bubble user' : message.error ? 'chat-bubble error' : 'chat-bubble'} key={`${message.role}-${index}`}>{message.text}</p>)}{aiLoading && <AssistantBubbleSkeleton />}</div><form className="ai-form" onSubmit={sendAiMessage}><input value={aiInput} onChange={(event) => setAiInput(event.target.value)} placeholder="Ask Zephyr anything..." disabled={aiLoading} /><button className="btn btn-primary" type="submit" disabled={aiLoading}>{aiLoading ? 'Sending' : 'Send'}</button></form></section>;
});

const InvestmentsCard = memo(function InvestmentsCard({ openPanel }) {
  return <section className="investment-card glass"><div className="panel-heading row"><div><h2>Investments</h2><p>Track market ideas in prototype mode.</p></div><button onClick={openPanel} type="button">View Markets</button></div><div className="portfolio-line"><strong>$12,840.22</strong><span>+2.4%</span></div><MiniChart /><div className="watchlist-mini">{watchlist.map(([symbol, change]) => <span key={symbol}>{symbol} <b className={change.startsWith('+') ? 'positive' : 'negative'}>{change}</b></span>)}</div></section>;
});

function MiniChart({ large = false }) {
  return <svg className={large ? 'market-chart large' : 'market-chart'} viewBox="0 0 320 120" fill="none" aria-hidden="true"><path d="M8 92 C48 72 64 88 96 54 C124 24 142 60 170 42 C202 20 218 78 250 50 C276 28 292 35 312 18" /><path d="M8 92 C48 72 64 88 96 54 C124 24 142 60 170 42 C202 20 218 78 250 50 C276 28 292 35 312 18 L312 116 L8 116 Z" /></svg>;
}

function QuickPanel({ type, closePanel, currentUser, refreshAccountData, selectedFundingSource, setSelectedFundingSource, fundingMessage, setFundingMessage, addMoneyStep, setAddMoneyStep, addMoneyAmount, setAddMoneyAmount, addMoneyNote, setAddMoneyNote, addMoneyError, setAddMoneyError, billCategory, setBillCategory, selectedBiller, setSelectedBiller, billMessage, setBillMessage, paymentConfirmOpen, setPaymentConfirmOpen, addToast, setReceipt }) {
  const visibleBillers = useMemo(() => billers.filter((biller) => billCategory === 'All' || biller[1] === billCategory), [billCategory]);
  const selectedBill = useMemo(() => billers.find(([name]) => name === selectedBiller), [selectedBiller]);
  const selectedBillAmount = selectedBill ? parseMoneyValue(selectedBill[2]) : null;
  const title = type === 'addMoney' ? 'Add Money' : type === 'payBills' ? 'Pay Bills' : 'Investments';
  const subtitle = type === 'addMoney' ? 'Choose how you want to fund your Zephyr balance.' : type === 'payBills' ? 'Choose a biller or service to pay from your Zephyr account.' : 'Market data is mocked in this UI sandbox.';
  const [panelLoading, setPanelLoading] = useState(false);

  const continueAddMoney = useCallback(() => {
    if (!selectedFundingSource) return;
    setFundingMessage('');
    setAddMoneyError('');
    setAddMoneyStep('details');
  }, [selectedFundingSource, setAddMoneyError, setAddMoneyStep, setFundingMessage]);

  const confirmAddMoney = useCallback(async () => {
    const username = getSessionUsername(currentUser);
    const amount = Number(addMoneyAmount);
    if (!username) {
      setAddMoneyError('Sign in before adding money.');
      setFundingMessage('');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setAddMoneyError('Enter a valid amount.');
      setFundingMessage('');
      return;
    }
    setAddMoneyError('');
    setFundingMessage('');
    setPanelLoading(true);
    try {
      const result = await bankingApi.deposit(username, amount, selectedFundingSource, addMoneyNote.trim());
      await refreshAccountData({ allowFallback: false });
      setFundingMessage(`Deposit successful from ${selectedFundingSource}.`);
      addToast({ type: 'success', title: 'Deposit successful', message: `${formatUSD(amount)} added to your balance.${result?.reference ? ` Ref ${result.reference}.` : ''}` });
      closePanel();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Deposit failed.';
      setAddMoneyError(message);
      addToast({ type: 'error', title: 'Deposit failed', message });
    } finally {
      setPanelLoading(false);
    }
  }, [addMoneyAmount, addMoneyNote, addToast, closePanel, currentUser, refreshAccountData, selectedFundingSource, setAddMoneyError, setFundingMessage]);

  const openPaymentConfirmation = useCallback(() => {
    if (!selectedBill) {
      setBillMessage('Select a biller before continuing.');
      return;
    }
    if (selectedBillAmount === null) {
      setBillMessage('This prototype biller needs a dollar amount before payment.');
      return;
    }
    setBillMessage('');
    setPaymentConfirmOpen(true);
  }, [selectedBill, selectedBillAmount, setBillMessage, setPaymentConfirmOpen]);

  const confirmPayment = useCallback(async () => {
    const username = getSessionUsername(currentUser);
    if (!selectedBill || selectedBillAmount === null) return;
    if (!username) {
      setBillMessage('Sign in before paying bills.');
      return;
    }
    setPanelLoading(true);
    setBillMessage('');
    try {
      const result = await bankingApi.payBill(username, {
        biller: selectedBill[0],
        amount: selectedBillAmount,
        category: selectedBill[1],
        paymentMethod: 'Bank Balance',
        note: `${selectedBill[0]} bill payment`,
      });
      await refreshAccountData({ allowFallback: false });
      const nextReceipt = buildReceipt({ transaction: result, type: 'Payment', amount: selectedBillAmount, biller: selectedBill[0], category: selectedBill[1], paymentMethod: 'Bank Balance', note: `${selectedBill[0]} bill payment` });
      setReceipt(nextReceipt);
      addToast({ type: 'success', title: 'Payment completed', message: `${selectedBill[0]} paid successfully.` });
      setPaymentConfirmOpen(false);
      closePanel();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed.';
      setBillMessage(message);
      addToast({ type: 'error', title: 'Payment failed', message });
      setPaymentConfirmOpen(false);
    } finally {
      setPanelLoading(false);
    }
  }, [addToast, closePanel, currentUser, refreshAccountData, selectedBill, selectedBillAmount, setBillMessage, setPaymentConfirmOpen, setReceipt]);

  return <div className="quick-panel-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !panelLoading) closePanel(); }}><section className="quick-panel glass"><button className="auth-close" onClick={closePanel} disabled={panelLoading} type="button" aria-label="Close panel">x</button><div className="panel-hero"><p>{type === 'investment' ? 'Prototype panel' : 'Connected to Spring API'}</p><h2>{title}</h2><span>{subtitle}</span></div>{type === 'addMoney' && <><div className="step-indicator"><span className={addMoneyStep === 'source' ? 'active' : ''}>1 Source</span><span className={addMoneyStep === 'details' ? 'active' : ''}>2 Amount</span></div>{addMoneyStep === 'source' ? <><div className="option-grid">{fundingSources.map(([name, description, icon]) => <button className={selectedFundingSource === name ? 'option-card selected' : 'option-card'} key={name} onClick={() => { setSelectedFundingSource(name); setFundingMessage(''); setAddMoneyError(''); }} type="button"><span><MiniIcon type={icon} /></span><strong>{name}</strong><small>{description}</small></button>)}</div><button className="btn btn-primary full-width panel-action" disabled={!selectedFundingSource} onClick={continueAddMoney} type="button">Continue</button></> : <><div className="add-money-details"><h3>Add from {selectedFundingSource}</h3><p>Enter the amount you want to add to your Zephyr balance.</p><label>Amount<input value={addMoneyAmount} onChange={(event) => { setAddMoneyAmount(event.target.value); setAddMoneyError(''); }} inputMode="decimal" placeholder="0.00" disabled={panelLoading} /></label><label>Optional note/reference<textarea value={addMoneyNote} onChange={(event) => setAddMoneyNote(event.target.value)} placeholder="Reference note" disabled={panelLoading} /></label></div>{addMoneyError && <p className="panel-message error">{addMoneyError}</p>}{fundingMessage && <p className="panel-message">{fundingMessage}</p>}<div className="panel-actions split"><button className="btn btn-secondary" disabled={panelLoading} onClick={() => { setAddMoneyStep('source'); setAddMoneyError(''); setFundingMessage(''); }} type="button">Back</button><button className="btn btn-primary" disabled={panelLoading} onClick={confirmAddMoney} type="button">{panelLoading ? 'Depositing...' : 'Confirm Add Money'}</button></div></>}</>}{type === 'payBills' && <><div className="filter-tabs panel-filters">{['All', 'Subscriptions', 'Shopping', 'Cloud', 'Crypto', 'Utilities'].map((category) => <button className={billCategory === category ? 'active' : ''} key={category} onClick={() => { setBillCategory(category); setSelectedBiller(''); setBillMessage(''); setPaymentConfirmOpen(false); }} type="button">{category}</button>)}</div><div className="biller-grid">{visibleBillers.map(([name, category, amount, icon]) => <button className={selectedBiller === name ? 'biller-card selected' : 'biller-card'} key={name} onClick={() => { setSelectedBiller(name); setBillMessage(''); }} type="button"><span><MiniIcon type={icon} /></span><strong>{name}</strong><small>{category}</small><b>{amount}</b></button>)}</div>{billMessage && <p className="panel-message error">{billMessage}</p>}<button className="btn btn-primary full-width panel-action" disabled={panelLoading} onClick={openPaymentConfirmation} type="button">{panelLoading ? 'Paying...' : 'Pay Selected'}</button>{paymentConfirmOpen && selectedBill && <PaymentConfirmModal billerName={selectedBill[0]} amount={selectedBillAmount} loading={panelLoading} onCancel={() => setPaymentConfirmOpen(false)} onConfirm={confirmPayment} />}</>}{type === 'investment' && <><div className="investment-panel-summary"><strong>$12,840.22</strong><span>+2.4% today</span></div><MiniChart large /><div className="watchlist-rows">{watchlist.map(([symbol, change]) => <div key={symbol}><span>{symbol}</span><b className={change.startsWith('+') ? 'positive' : 'negative'}>{change}</b><button disabled type="button">Prototype</button></div>)}</div><p className="panel-message">Market data is mocked in this UI sandbox.</p></>}</section></div>;
}

function PaymentConfirmModal({ billerName, amount, loading, onCancel, onConfirm }) {
  return <div className="payment-confirm-layer" role="presentation"><section className="payment-confirm-modal glass" role="dialog" aria-modal="true" aria-labelledby="payment-confirm-title"><h2 id="payment-confirm-title">Confirm payment</h2><p>You are about to pay {billerName}.</p><strong>{formatUSD(amount)}</strong><span>Backend payment endpoint will record biller details.</span><div className="panel-actions"><button className="btn btn-secondary" disabled={loading} onClick={onCancel} type="button">Cancel</button><button className="btn btn-primary" disabled={loading} onClick={onConfirm} type="button">{loading ? 'Confirming...' : 'Confirm Payment'}</button></div></section></div>;
}

function TransactionsView({ transactionSearch, setTransactionSearch, transactionFilter, setTransactionFilter, filteredTransactions, transactionsLoading, transactionsError, usingFallbackData }) {
  return <main className="dashboard-shell single"><PageHeader title="Transactions" /><section className="data-card glass"><div className="transaction-tools"><input value={transactionSearch} onChange={(event) => setTransactionSearch(event.target.value)} placeholder="Search transactions..." /><div className="filter-tabs">{['all', 'income', 'spending', 'transfers'].map((filter) => <button className={transactionFilter === filter ? 'active' : ''} key={filter} onClick={() => setTransactionFilter(filter)} type="button">{filter === 'all' ? 'All' : filter[0].toUpperCase() + filter.slice(1)}</button>)}</div></div>{transactionsError && <p className="data-status error">API error: {transactionsError}</p>}{usingFallbackData && <p className="data-status">Fallback demo transactions shown</p>}{transactionsLoading ? <TransactionsSkeleton /> : filteredTransactions.length === 0 ? <EmptyState title="No transactions found" message="Try a different search or filter once account activity is available." /> : <div className="transaction-list expanded">{filteredTransactions.map((transaction, index) => <TransactionItem key={`${transaction.id || transaction.name}-${index}`} transaction={transaction} />)}</div>}</section></main>;
}

function TransferView({ transferForm, setTransferForm, transferError, transferSuccess, transferLoading, submitTransfer }) {
  const updateField = (field, value) => setTransferForm((current) => ({ ...current, [field]: value }));
  return <main className="dashboard-shell single"><PageHeader title="Send Money" /><form className="transfer-card glass" onSubmit={submitTransfer}><label>Recipient<input value={transferForm.recipient} onChange={(event) => updateField('recipient', event.target.value)} disabled={transferLoading} /></label><label>Amount<input value={transferForm.amount} onChange={(event) => updateField('amount', event.target.value)} inputMode="decimal" disabled={transferLoading} /></label><label>Note<textarea value={transferForm.note} onChange={(event) => updateField('note', event.target.value)} placeholder="Reference note" disabled={transferLoading} /></label>{transferError && <p className="form-message error">{transferError}</p>}{transferSuccess && <p className="form-message success">{transferSuccess}</p>}<button className="btn btn-primary full-width" disabled={transferLoading} type="submit">{transferLoading ? 'Sending...' : 'Review Transfer'}</button></form></main>;
}

function AnalyticsView() {
  const stats = [['Monthly Income', '$2,950'], ['Monthly Spending', '$654'], ['Savings Rate', '72%'], ['Risk Score', 'Low'], ['Portfolio Growth', '+2.4%']];
  const bars = [['Shopping', 58], ['Subscriptions', 32], ['Transfer', 44], ['Food', 26]];
  return <main className="dashboard-shell single"><PageHeader title="Analytics" />{false && <AnalyticsSkeleton />}{stats.length === 0 && bars.length === 0 ? <section className="chart-card glass"><EmptyState title="No analytics yet" message="Spending insights will appear after transactions are available." /></section> : <><div className="analytics-grid">{stats.map(([label, value]) => <section className="stat-card glass" key={label}><span>{label}</span><strong>{value}</strong></section>)}</div><section className="chart-card glass"><h2>Spending Categories</h2>{bars.length === 0 ? <EmptyState title="No spending data" message="Category breakdowns will appear after payments or transfers post." /> : bars.map(([label, width]) => <div className="bar-row" key={label}><span>{label}</span><div><b style={{ width: `${width}%` }} /></div></div>)}</section></>}</main>;
}

function LandingPerformanceControl({ performance, updatePerformanceMode }) {
  const options = [
    ['auto', 'Auto'],
    ['full', 'Full'],
    ['lite', 'Lite'],
  ];
  return <div className="landing-performance-control" role="group" aria-label="Performance Mode">{options.map(([mode, label]) => <button className={performance.performanceMode === mode ? 'active' : ''} key={mode} onClick={() => updatePerformanceMode(mode)} type="button" aria-pressed={performance.performanceMode === mode}>{label}</button>)}</div>;
}

function PerformanceModeControl({ performance, updatePerformanceMode }) {
  const options = [
    ['auto', 'Auto', 'Adapts visuals to your device.'],
    ['full', 'Full Visuals', 'Enables Prism, GridScan, and motion effects.'],
    ['lite', 'Lite Mode', 'Uses static premium visuals for smoother performance.'],
  ];
  return <section className="performance-settings glass"><div className="performance-settings-copy"><h2>Performance Mode</h2><p>{options.find(([mode]) => mode === performance.performanceMode)?.[2]}</p>{performance.devicePerformanceReason && <span>{performance.devicePerformanceReason}</span>}</div><div className="performance-segments" role="group" aria-label="Performance Mode">{options.map(([mode, label]) => <button className={performance.performanceMode === mode ? 'active' : ''} key={mode} onClick={() => updatePerformanceMode(mode)} type="button">{label}</button>)}</div></section>;
}

function ProfileView({ resetDemoView, performance, updatePerformanceMode }) {
  return <main className="dashboard-shell single profile-shell"><PageHeader title="Profile & Settings" /><PerformanceModeControl performance={performance} updatePerformanceMode={updatePerformanceMode} /><section className="profile-actions glass"><div><h2>Demo controls</h2><p>Reset local presentation state without changing backend account data.</p></div><button className="btn btn-secondary" onClick={resetDemoView} type="button">Reset demo view</button></section><SectionErrorBoundary><Suspense fallback={<ProfileSkeleton />}><section className="profile-layout"><ReflectiveCard image={profileImage} name="Wajih Ahmed" role="DevOps Engineer" handle="@wajihahmed269" status="Building Zephyr" project="Phoenix-Ops / Zephyr" github="https://github.com/wajihahmed269" /><MagicBento items={profileSettings} className="profile-bento" /></section></Suspense></SectionErrorBoundary></main>;
}

function PageHeader({ title }) {
  return <div className="page-header"><h1>{title}</h1></div>;
}

function DashboardTechStrip() {
  return <section className="dash-tech-strip glass" aria-label="Dashboard technology stack">{techStack.map((tech) => <span key={tech.name}>{tech.name}</span>)}</section>;
}
