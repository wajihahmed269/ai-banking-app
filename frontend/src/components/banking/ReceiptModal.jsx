import { formatUSD } from '../../utils/money';

export function ReceiptModal({ receipt, onClose, onCopy }) {
  if (!receipt) return null;
  const target = receipt.type === 'Payment' ? receipt.biller : receipt.recipient;
  const date = receipt.date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  return <div className="receipt-overlay" role="presentation"><section className="receipt-modal glass" role="dialog" aria-modal="true" aria-labelledby="receipt-title"><button className="auth-close" onClick={onClose} type="button" aria-label="Close receipt">x</button><p className="receipt-kicker">Receipt</p><h2 id="receipt-title">{receipt.type} completed</h2><div className="receipt-amount">{formatUSD(receipt.amount)}</div><div className="receipt-grid"><span>Reference</span><strong>{receipt.reference}</strong><span>Type</span><strong>{receipt.type}</strong><span>{receipt.type === 'Payment' ? 'Biller' : 'Recipient'}</span><strong>{target || 'Recorded'}</strong><span>Date</span><strong>{date}</strong><span>Status</span><strong>{receipt.status}</strong>{receipt.category && <><span>Category</span><strong>{receipt.category}</strong></>}{receipt.paymentMethod && <><span>Payment method</span><strong>{receipt.paymentMethod}</strong></>}{receipt.note && <><span>Note</span><strong>{receipt.note}</strong></>}</div><div className="receipt-actions"><button className="btn btn-secondary" onClick={() => onCopy(receipt.reference)} type="button">Copy reference</button><button className="btn btn-primary" onClick={onClose} type="button">Close</button></div></section></div>;
}
