import { EmptyState } from '../ui/EmptyState';
import { TransactionsSkeleton } from '../ui/Skeletons';
import { TransactionItem } from '../dashboard/RecentTransactions';

export function TransferView({ transferForm, setTransferForm, transferError, transferSuccess, transferLoading, submitTransfer }) {
  const updateField = (field, value) => setTransferForm((current) => ({ ...current, [field]: value }));
  return <main className="dashboard-shell single"><PageHeader title="Send Money" /><form className="transfer-card glass" onSubmit={submitTransfer}><label>Recipient<input value={transferForm.recipient} onChange={(event) => updateField('recipient', event.target.value)} disabled={transferLoading} /></label><label>Amount<input value={transferForm.amount} onChange={(event) => updateField('amount', event.target.value)} inputMode="decimal" disabled={transferLoading} /></label><label>Note<textarea value={transferForm.note} onChange={(event) => updateField('note', event.target.value)} placeholder="Reference note" disabled={transferLoading} /></label>{transferError && <p className="form-message error">{transferError}</p>}{transferSuccess && <p className="form-message success">{transferSuccess}</p>}<button className="btn btn-primary full-width" disabled={transferLoading} type="submit">{transferLoading ? 'Sending...' : 'Review Transfer'}</button></form></main>;
}

export function TransactionsView({ transactionSearch, setTransactionSearch, transactionFilter, setTransactionFilter, filteredTransactions, transactionsLoading, transactionsError, usingFallbackData }) {
  return <main className="dashboard-shell single"><PageHeader title="Transactions" /><section className="data-card glass"><div className="transaction-tools"><input value={transactionSearch} onChange={(event) => setTransactionSearch(event.target.value)} placeholder="Search transactions..." /><div className="filter-tabs">{['all', 'income', 'spending', 'transfers'].map((filter) => <button className={transactionFilter === filter ? 'active' : ''} key={filter} onClick={() => setTransactionFilter(filter)} type="button">{filter === 'all' ? 'All' : filter[0].toUpperCase() + filter.slice(1)}</button>)}</div></div>{transactionsError && <p className="data-status error">Data error: {transactionsError}</p>}{usingFallbackData && <p className="data-status">Prototype demo transactions shown</p>}{transactionsLoading ? <TransactionsSkeleton /> : filteredTransactions.length === 0 ? <EmptyState title="No transactions found" message="Try a different search or filter once account activity is available." /> : <div className="transaction-list expanded">{filteredTransactions.map((transaction, index) => <TransactionItem key={`${transaction.id || transaction.name}-${index}`} transaction={transaction} />)}</div>}</section></main>;
}

function PageHeader({ title }) {
  return <div className="page-header"><h1>{title}</h1></div>;
}
