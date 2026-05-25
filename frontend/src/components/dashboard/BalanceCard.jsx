import { memo, useCallback } from 'react';
import { DashboardSkeleton } from '../ui/Skeletons';
import { MiniIcon } from '../ui/MiniIcon';
import { formatUSD } from '../../utils/money';

export const BalanceCard = memo(function BalanceCard({ showBalance, setShowBalance, balance, loading, error, usingFallbackData }) {
  const toggleBalance = useCallback(() => setShowBalance((current) => !current), [setShowBalance]);
  return <div className="balance-card glass" onClick={toggleBalance} role="button" tabIndex={0}><div className="balance-copy"><div className="card-title-row"><p>Total Balance</p><button className="icon-button" onClick={(event) => { event.stopPropagation(); toggleBalance(); }} type="button" aria-label="Toggle balance"><MiniIcon type="eye" /></button></div>{loading ? <DashboardSkeleton /> : <><h1>{showBalance ? formatUSD(balance) : '••••••'}</h1><span>{error ? `Data error: ${error}` : usingFallbackData ? 'Prototype demo balance shown' : showBalance ? 'Balance revealed' : 'Tap the card to reveal'}</span></>} </div><div className="cat-stage"><img className={showBalance ? 'cat-image visible' : 'cat-image'} src="/assets/cats/cat-shocked.png" alt="Shocked cat face" loading="lazy" decoding="async" width="230" height="230" /><img className={showBalance ? 'cat-image' : 'cat-image visible'} src="/assets/cats/cat-normal.png" alt="Cute standing cat" loading="lazy" decoding="async" width="230" height="230" /></div></div>;
});
