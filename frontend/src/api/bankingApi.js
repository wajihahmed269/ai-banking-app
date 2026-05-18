import { request } from './client';

const encodeUser = (username) => encodeURIComponent(username);

export function getBalance(username) {
  return request(`/balance/${encodeUser(username)}`);
}

export function getTransactions(username) {
  return request(`/transactions/${encodeUser(username)}`);
}

export function deposit(username, amount, source, note) {
  return request(`/deposit/${encodeUser(username)}`, {
    method: 'POST',
    body: { amount, source, note },
  });
}

export function withdraw(username, amount, category, note) {
  return request(`/withdraw/${encodeUser(username)}`, {
    method: 'POST',
    body: { amount, category, note },
  });
}

export function transfer(username, toUsername, amount, note) {
  return request(`/transfer/${encodeUser(username)}`, {
    method: 'POST',
    body: { toUsername, amount, note },
  });
}

export function payBill(username, payment) {
  return request(`/payments/${encodeUser(username)}`, {
    method: 'POST',
    body: payment,
  });
}
