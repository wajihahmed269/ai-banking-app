import { memo } from 'react';
import { TransactionsSkeleton } from '../ui/Skeletons';
import { EmptyState } from '../ui/EmptyState';
import { formatMoney } from '../../utils/money';

export const RecentTransactions = memo(function RecentTransactions({ transactions: recentItems, loading, error, usingFallbackData, onViewAll }) {
  const visibleItems = recentItems.slice(0, 4);
  return <section className="recent-card glass"><div className="panel-heading row"><h2>Recent Transactions</h2><button onClick={onViewAll} type="button">View All</button></div>{error && <p className="data-status error">Data error: {error}</p>}{usingFallbackData && <p className="data-status">Prototype demo transactions shown</p>}{loading ? <TransactionsSkeleton /> : visibleItems.length === 0 ? <EmptyState title="No transactions" message="Completed deposits, transfers, and payments will appear here." actionLabel="Open history" onAction={onViewAll} /> : <div className="transaction-list">{visibleItems.map((transaction, index) => <TransactionItem key={`${transaction.id || transaction.name}-${transaction.date}-${index}`} transaction={transaction} />)}</div>}</section>;
});

export function TransactionItem({ transaction }) {
  const positive = transaction.amount > 0;
  const name = transaction.name || 'Transaction';
  return <div className="transaction-item"><span className="merchant-icon">{name.slice(0, 1)}</span><div><strong>{name}</strong><small>{transaction.date}</small></div><b className={positive ? 'amount positive' : 'amount negative'}>{formatMoney(transaction.amount)}</b></div>;
}
