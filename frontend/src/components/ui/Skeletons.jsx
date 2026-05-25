export function LiteModeSuggestionModal({ performance, onSwitchLite, enabled = true }) {
  if (!enabled || !performance.shouldSuggestLiteMode) return null;
  return <div className="performance-modal-overlay" role="presentation"><section className="performance-modal glass" role="dialog" aria-modal="true" aria-labelledby="performance-modal-title"><p className="performance-kicker">Performance</p><h2 id="performance-modal-title">Animations may run slowly on this device</h2><p>Switch to Lite Mode for a smoother Zephyr experience. Layout and banking features stay the same.</p>{performance.devicePerformanceReason && <span>{performance.devicePerformanceReason}</span>}<div className="performance-modal-actions"><button className="btn btn-secondary" onClick={() => performance.dismissLiteSuggestion({ keepFull: true })} type="button">Keep Full UI</button><button className="btn btn-primary" onClick={onSwitchLite} type="button">Switch to Lite Mode</button></div></section></div>;
}

export function PremiumSkeleton({ className = '' }) {
  return <div className={`premium-skeleton ${className}`.trim()} aria-hidden="true" />;
}

function SkeletonCard({ className = '', children }) {
  return <div className={`skeleton-card ${className}`.trim()} aria-hidden="true">{children}</div>;
}

function SkeletonLine({ className = '' }) {
  return <span className={`skeleton-line ${className}`.trim()} aria-hidden="true" />;
}

export function DashboardSkeleton() {
  return <SkeletonCard className="dashboard-skeleton"><SkeletonLine className="wide" /><SkeletonLine className="hero-line" /><SkeletonLine /><SkeletonLine className="short" /></SkeletonCard>;
}

export function TransactionsSkeleton() {
  return <div className="transactions-skeleton" aria-hidden="true">{Array.from({ length: 4 }).map((_, index) => <SkeletonCard className="transaction-skeleton-row" key={index}><SkeletonLine className="avatar-line" /><div><SkeletonLine /><SkeletonLine className="short" /></div><SkeletonLine className="amount-line" /></SkeletonCard>)}</div>;
}

export function ProfileSkeleton() {
  return <ProfileViewFallback />;
}

export function AssistantBubbleSkeleton() {
  return <PremiumSkeleton className="assistant-bubble-skeleton" />;
}

export function PrismFallback() {
  return <div className="prism-static-fallback" aria-hidden="true" />;
}

export function AboutProfileFallback() {
  return <PremiumSkeleton className="about-profile-skeleton" />;
}

export function ChromaGridFallback() {
  return <div className="chroma-skeleton-grid" aria-hidden="true">{Array.from({ length: 7 }).map((_, index) => <PremiumSkeleton className="chroma-skeleton-card" key={index} />)}</div>;
}

export function ProfileViewFallback() {
  return <div className="profile-lazy-skeleton" aria-hidden="true"><PremiumSkeleton className="profile-card-skeleton" /><div className="profile-bento-skeleton">{Array.from({ length: 6 }).map((_, index) => <PremiumSkeleton key={index} />)}</div></div>;
}

