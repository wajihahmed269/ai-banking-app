import { useState } from 'react';

export default function TransferForm({ onSubmit, isSubmitting }) {
  const [toUsername, setToUsername] = useState('');
  const [amount, setAmount] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const parsedAmount = Number(amount);

    const wasSuccessful = await onSubmit(toUsername.trim(), parsedAmount);

    if (wasSuccessful) {
      setToUsername('');
      setAmount('');
    }
  }

  return (
    <section className="panel">
      <h2>Transfer Funds</h2>
      <form className="transfer-form" onSubmit={handleSubmit}>
        <label className="form-field" htmlFor="transfer-recipient">
          <span>Recipient Username</span>
          <input
            id="transfer-recipient"
            type="text"
            value={toUsername}
            onChange={(event) => setToUsername(event.target.value)}
            placeholder="Recipient username"
          />
        </label>
        <label className="form-field" htmlFor="transfer-amount">
          <span>Amount</span>
          <input
            id="transfer-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
          />
        </label>
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Working...' : 'Transfer'}
        </button>
      </form>
    </section>
  );
}
