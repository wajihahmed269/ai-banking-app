import { apiRequest } from './client.js';

export function getBalance(username) {
  return apiRequest(`/api/balance/${encodeURIComponent(username)}`);
}

export function deposit(username, amount) {
  return apiRequest(`/api/deposit/${encodeURIComponent(username)}`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export function withdraw(username, amount) {
  return apiRequest(`/api/withdraw/${encodeURIComponent(username)}`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export function transfer(username, toUsername, amount) {
  return apiRequest(`/api/transfer/${encodeURIComponent(username)}`, {
    method: 'POST',
    body: JSON.stringify({ toUsername, amount }),
  });
}

export function getTransactions(username) {
  return apiRequest(`/api/transactions/${encodeURIComponent(username)}`);
}
