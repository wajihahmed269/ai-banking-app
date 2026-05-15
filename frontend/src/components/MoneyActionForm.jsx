import { useState } from 'react';

export default function MoneyActionForm({
  title,
  buttonLabel,
  onSubmit,
  isSubmitting,
}) {
  const [amount, setAmount] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const parsedAmount = Number(amount);

    const wasSuccessful = await onSubmit(parsedAmount);

    if (wasSuccessful) {
      setAmount('');
    }
  }

  return (
    <section className="panel">
      <h2>{title}</h2>
      <form className="inline-form" onSubmit={handleSubmit}>
        <label className="form-field compact-field" htmlFor={`${buttonLabel}-amount`}>
          <span>Amount</span>
          <input
            id={`${buttonLabel}-amount`}
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
          />
        </label>
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Working...' : buttonLabel}
        </button>
      </form>
    </section>
  );
}
