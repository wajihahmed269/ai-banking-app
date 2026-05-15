import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTransactions } from '../api/bankingApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import AlertMessage from '../components/AlertMessage.jsx';
import TransactionFilters from '../components/TransactionFilters.jsx';
import TransactionTable from '../components/TransactionTable.jsx';
import ScrollFloat from '../components/effects/ScrollFloat.jsx';

const defaultFilters = {
  type: 'all',
  from: '',
  to: '',
  search: '',
};

function normalizeTransactionType(type) {
  const normalized = String(type || '').toLowerCase().replace(/[_-]/g, ' ');

  if (normalized.includes('transfer')) {
    return 'transfer';
  }

  if (normalized.includes('withdraw')) {
    return 'withdrawal';
  }

  if (normalized.includes('deposit')) {
    return 'deposit';
  }

  return 'other';
}

function normalizeTransaction(transaction) {
  return {
    ...transaction,
    normalizedType: normalizeTransactionType(transaction.type),
  };
}

export default function TransactionsPage() {
  const navigate = useNavigate();
  const { username, signOut } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTransactions() {
      setIsLoading(true);
      setError('');

      try {
        const response = await getTransactions(username);
        setTransactions(response.map(normalizeTransaction));
      } catch (err) {
        setError(err.message || 'Unable to load transactions.');
      } finally {
        setIsLoading(false);
      }
    }

    loadTransactions();
  }, [username]);

  const filteredTransactions = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesType =
        filters.type === 'all' || transaction.normalizedType === filters.type;
      const txDate = transaction.timestamp ? new Date(transaction.timestamp) : null;
      const matchesFrom =
        !filters.from ||
        (txDate && !Number.isNaN(txDate.getTime()) && txDate >= new Date(filters.from));
      const matchesTo =
        !filters.to ||
        (txDate &&
          !Number.isNaN(txDate.getTime()) &&
          txDate <= new Date(`${filters.to}T23:59:59`));
      const matchesSearch =
        !search ||
        String(transaction.type || '').toLowerCase().includes(search) ||
        String(transaction.amount || '').toLowerCase().includes(search);

      return matchesType && matchesFrom && matchesTo && matchesSearch;
    });
  }, [filters, transactions]);

  function handleLogout() {
    signOut();
    navigate('/', { replace: true });
  }

  return (
    <main className="page transactions-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Account activity</p>
          <ScrollFloat>Transactions</ScrollFloat>
        </div>
        <div className="dashboard-actions">
          <Link className="secondary-button" to="/dashboard">
            Dashboard
          </Link>
          <button className="danger-button" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <AlertMessage message={error} type="error" />

      <TransactionFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      <div className="result-summary">
        {filteredTransactions.length} transaction
        {filteredTransactions.length === 1 ? '' : 's'}
      </div>

      <TransactionTable transactions={filteredTransactions} isLoading={isLoading} />
    </main>
  );
}
