export const getSessionUsername = (user) => user?.username || user?.email || '';

export const getTransactionReference = (transaction) => {
  if (transaction?.reference) return transaction.reference;
  if (transaction?.id) return `TX-${transaction.id}`;
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ZEPH-${stamp}-${suffix}`;
};

export const createPrototypeTransaction = ({ name, amount, type, category, recipient, biller, note, paymentMethod }) => ({
  id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name,
  amount,
  date: 'Today',
  type,
  timestamp: new Date().toISOString(),
  reference: getTransactionReference(),
  category,
  recipient,
  biller,
  note,
  paymentMethod,
});

export const buildReceipt = ({ transaction, type, amount, recipient, biller, note, category, paymentMethod }) => ({
  reference: getTransactionReference(transaction),
  type,
  amount,
  recipient: recipient || transaction?.recipient || '',
  biller: biller || transaction?.biller || '',
  note: note || transaction?.note || '',
  category: category || transaction?.category || '',
  paymentMethod: paymentMethod || transaction?.paymentMethod || '',
  status: 'Completed',
  date: transaction?.timestamp ? new Date(transaction.timestamp) : new Date(),
});

export const normalizeApiTransaction = (transaction) => {
  const rawType = String(transaction.type || '').toUpperCase();
  const amount = Number(transaction.amount || 0);
  const isDebit = ['WITHDRAWAL', 'PAYMENT'].includes(rawType) || (rawType === 'TRANSFER' && !transaction.source);
  return {
    ...transaction,
    amount: isDebit ? -Math.abs(amount) : amount,
    type: mapTransactionType(rawType),
    name: transactionName(transaction, rawType),
    date: transaction.timestamp ? new Date(transaction.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today',
  };
};

const mapTransactionType = (type) => {
  switch (type) {
    case 'DEPOSIT':
      return 'income';
    case 'WITHDRAWAL':
    case 'PAYMENT':
      return 'spending';
    case 'TRANSFER':
      return 'transfers';
    default:
      return String(type || 'spending').toLowerCase();
  }
};

const transactionName = (transaction, type) => {
  if (type === 'DEPOSIT') return transaction.source ? `Deposit from ${transaction.source}` : 'Deposit';
  if (type === 'WITHDRAWAL') return transaction.category ? `${transaction.category} withdrawal` : 'Withdrawal';
  if (type === 'PAYMENT') return transaction.biller ? `${transaction.biller} bill payment` : 'Bill payment';
  if (type === 'TRANSFER' && transaction.recipient) return `Transfer to ${transaction.recipient}`;
  if (type === 'TRANSFER' && transaction.source) return `Transfer from ${transaction.source}`;
  return transaction.name || 'Transaction';
};
