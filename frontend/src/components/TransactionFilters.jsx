export default function TransactionFilters({ filters, onChange, onReset }) {
  function updateFilter(name, value) {
    onChange({
      ...filters,
      [name]: value,
    });
  }

  return (
    <section className="panel transaction-filters" aria-label="Transaction filters">
      <label className="form-field" htmlFor="transaction-type">
        <span>Type</span>
        <select
          id="transaction-type"
          value={filters.type}
          onChange={(event) => updateFilter('type', event.target.value)}
        >
          <option value="all">All</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="transfer">Transfer</option>
        </select>
      </label>

      <label className="form-field" htmlFor="transaction-from">
        <span>From</span>
        <input
          id="transaction-from"
          type="date"
          value={filters.from}
          onChange={(event) => updateFilter('from', event.target.value)}
        />
      </label>

      <label className="form-field" htmlFor="transaction-to">
        <span>To</span>
        <input
          id="transaction-to"
          type="date"
          value={filters.to}
          onChange={(event) => updateFilter('to', event.target.value)}
        />
      </label>

      <label className="form-field" htmlFor="transaction-search">
        <span>Search</span>
        <input
          id="transaction-search"
          type="search"
          value={filters.search}
          onChange={(event) => updateFilter('search', event.target.value)}
          placeholder="Type or amount"
        />
      </label>

      <button className="secondary-button" type="button" onClick={onReset}>
        Reset
      </button>
    </section>
  );
}
