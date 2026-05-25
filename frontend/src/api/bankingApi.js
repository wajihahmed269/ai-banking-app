import { request } from './client';

function idempotencyHeaders() {
  const key = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { 'Idempotency-Key': key };
}

export function getBalance() {
  return request('/me/balance');
}

export function getTransactions() {
  return request('/me/transactions');
}

export function deposit(amount, source, note) {
  return request('/me/deposit', {
    method: 'POST',
    headers: idempotencyHeaders(),
    body: { amount, source, note },
  });
}

export function withdraw(amount, category, note) {
  return request('/me/withdraw', {
    method: 'POST',
    headers: idempotencyHeaders(),
    body: { amount, category, note },
  });
}

export function transfer(toUsername, amount, note) {
  return request('/me/transfer', {
    method: 'POST',
    headers: idempotencyHeaders(),
    body: { toUsername, amount, note },
  });
}

export function payBill(payment) {
  return request('/me/payments', {
    method: 'POST',
    headers: idempotencyHeaders(),
    body: payment,
  });
}
