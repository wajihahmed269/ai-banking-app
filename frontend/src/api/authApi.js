import { request } from './client';
import { setCurrentUser, setToken } from '../auth/session';

export async function login({ username, password }) {
  const result = await request('/auth/login', {
    method: 'POST',
    body: { username, password },
  });
  const token = result.token || result.jwt || result.accessToken;
  if (token) setToken(token);
  const user = result.user || { username };
  setCurrentUser(user);
  return { ...result, user, token };
}

export async function register({ username, password }) {
  const result = await request('/auth/register', {
    method: 'POST',
    body: { username, password },
  });
  const token = result.token || result.jwt || result.accessToken;
  if (token) setToken(token);
  if (token || result.user) setCurrentUser(result.user || { username });
  return { ...result, user: result.user || (token ? { username } : null), token };
}
