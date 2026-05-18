import { request } from './client';

const encodeUser = (username) => encodeURIComponent(username);

export function getBalance(username) {
  return request(`/balance/${encodeUser(username)}`);
}

export function getTransactions(username) {
  return request(`/transactions/${encodeUser(username)}`);
}

export function deposit(username, amount) {
  return request(`/deposit/${encodeUser(username)}`, {
    method: 'POST',
    body: { amount },
  });
}

export function withdraw(username, amount) {
  return request(`/withdraw/${encodeUser(username)}`, {
    method: 'POST',
    body: { amount },
  });
}

export function transfer(username, toUsername, amount) {
  return request(`/transfer/${encodeUser(username)}`, {
    method: 'POST',
    body: { toUsername, amount },
  });
}
