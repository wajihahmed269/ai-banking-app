export default function BalanceCard({ balance, isLoading }) {
  const displayBalance =
    typeof balance === 'number' ? `$${balance.toFixed(2)}` : '$0.00';

  return (
    <section className="panel balance-card" aria-label="Current balance">
      <p className="eyebrow">Current Balance</p>
      <div className="balance-value">{isLoading ? 'Loading...' : displayBalance}</div>
    </section>
  );
}
