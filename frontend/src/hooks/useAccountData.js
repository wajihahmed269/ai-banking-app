import { useCallback, useState } from 'react';
import { getBalance, getTransactions } from '../api/bankingApi';
import { initialBalance, transactions } from '../data/demoData';
import { DEMO_MODE } from '../config';
import { getSessionUsername, normalizeApiTransaction } from '../utils/transactions';

export function useAccountData(currentUser) {
  const [balance, setBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [balanceError, setBalanceError] = useState('');
  const [transactionsError, setTransactionsError] = useState('');
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  const resetAccountData = useCallback(() => {
    setBalance(0);
    setRecentTransactions([]);
    setBalanceError('');
    setTransactionsError('');
    setUsingFallbackData(false);
  }, []);

  const refreshAccountData = useCallback(async () => {
    const username = getSessionUsername(currentUser);
    if (!username) return;

    setBalanceLoading(true);
    setTransactionsLoading(true);
    setBalanceError('');
    setTransactionsError('');
    setUsingFallbackData(false);

    if (DEMO_MODE) {
      window.setTimeout(() => {
        setBalance(initialBalance);
        setRecentTransactions(transactions);
        setUsingFallbackData(true);
        setBalanceLoading(false);
        setTransactionsLoading(false);
      }, 120);
      return;
    }

    try {
      const nextBalance = await getBalance();
      setBalance(Number(nextBalance || 0));
    } catch (error) {
      setBalanceError(error instanceof Error ? error.message : 'Balance request failed.');
      setBalance(0);
    } finally {
      setBalanceLoading(false);
    }

    try {
      const nextTransactions = await getTransactions();
      setRecentTransactions(Array.isArray(nextTransactions) ? nextTransactions.map(normalizeApiTransaction) : []);
    } catch (error) {
      setTransactionsError(error instanceof Error ? error.message : 'Transactions request failed.');
      setRecentTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  }, [currentUser]);

  return {
    balance,
    setBalance,
    recentTransactions,
    setRecentTransactions,
    balanceLoading,
    transactionsLoading,
    balanceError,
    transactionsError,
    usingFallbackData,
    refreshAccountData,
    resetAccountData,
  };
}
