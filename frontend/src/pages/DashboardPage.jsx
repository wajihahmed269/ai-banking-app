import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  deposit,
  getBalance,
  transfer,
  withdraw,
} from '../api/bankingApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import AlertMessage from '../components/AlertMessage.jsx';
import BalanceCard from '../components/BalanceCard.jsx';
import ChatAssistant from '../components/ChatAssistant.jsx';
import MoneyActionForm from '../components/MoneyActionForm.jsx';
import TransferForm from '../components/TransferForm.jsx';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { username, signOut } = useAuth();
  const [balance, setBalance] = useState(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [activeAction, setActiveAction] = useState('');

  async function loadBalance() {
    setIsBalanceLoading(true);

    try {
      const nextBalance = await getBalance(username);
      setBalance(Number(nextBalance));
    } catch (err) {
      showMessage(err.message || 'Unable to load balance.', 'error');
    } finally {
      setIsBalanceLoading(false);
    }
  }

  useEffect(() => {
    loadBalance();
  }, [username]);

  function showMessage(nextMessage, type = 'info') {
    setMessage(nextMessage);
    setMessageType(type);
  }

  function validateAmount(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
      showMessage('Enter an amount greater than zero.', 'error');
      return false;
    }

    return true;
  }

  async function runMoneyAction(actionName, action) {
    setMessage('');
    setActiveAction(actionName);

    try {
      const responseMessage = await action();
      showMessage(responseMessage, 'success');
      await loadBalance();
      return true;
    } catch (err) {
      showMessage(err.message || 'Transaction failed.', 'error');
      return false;
    } finally {
      setActiveAction('');
    }
  }

  async function handleDeposit(amount) {
    if (!validateAmount(amount)) {
      return false;
    }

    return runMoneyAction('deposit', () => deposit(username, amount));
  }

  async function handleWithdraw(amount) {
    if (!validateAmount(amount)) {
      return false;
    }

    return runMoneyAction('withdraw', () => withdraw(username, amount));
  }

  async function handleTransfer(toUsername, amount) {
    if (!toUsername) {
      showMessage('Recipient username is required.', 'error');
      return false;
    }

    if (!validateAmount(amount)) {
      return false;
    }

    return runMoneyAction('transfer', () => transfer(username, toUsername, amount));
  }

  function handleLogout() {
    signOut();
    navigate('/', { replace: true });
  }

  return (
    <main className="page dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Signed in as</p>
          <h1>{username}</h1>
        </div>
        <div className="dashboard-actions">
          <Link className="secondary-button" to="/about">
            About
          </Link>
          <Link className="secondary-button" to="/transactions">
            Transactions
          </Link>
          <button className="danger-button" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <AlertMessage message={message} type={messageType} />

      <BalanceCard balance={balance} isLoading={isBalanceLoading} />

      <div className="dashboard-grid">
        <MoneyActionForm
          title="Deposit"
          buttonLabel="Deposit"
          onSubmit={handleDeposit}
          isSubmitting={activeAction === 'deposit'}
        />
        <MoneyActionForm
          title="Withdraw"
          buttonLabel="Withdraw"
          onSubmit={handleWithdraw}
          isSubmitting={activeAction === 'withdraw'}
        />
        <TransferForm
          onSubmit={handleTransfer}
          isSubmitting={activeAction === 'transfer'}
        />
      </div>

      <ChatAssistant username={username} />
    </main>
  );
}
