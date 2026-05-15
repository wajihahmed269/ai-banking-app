function formatCurrency(amount) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return '$0.00';
  }

  return `$${numericAmount.toFixed(2)}`;
}

function formatDate(timestamp) {
  if (!timestamp) {
    return 'Unknown';
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return String(timestamp);
  }

  return date.toLocaleString();
}

export default function TransactionTable({ transactions, isLoading }) {
  if (isLoading) {
    return (
      <section className="panel">
        <p className="empty-state">Loading transactions...</p>
      </section>
    );
  }

  if (transactions.length === 0) {
    return (
      <section className="panel">
        <p className="empty-state">No transactions found.</p>
      </section>
    );
  }

  return (
    <section className="panel table-panel">
      <div className="table-wrap">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id ?? `${transaction.type}-${transaction.timestamp}`}>
                <td>
                  <span className={`type-pill type-${transaction.normalizedType}`}>
                    {transaction.type}
                  </span>
                </td>
                <td>{formatCurrency(transaction.amount)}</td>
                <td>{formatDate(transaction.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
