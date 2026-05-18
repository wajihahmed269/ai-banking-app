import { request } from './client';

export function chat(username, message) {
  return request(`/ai/chat/${encodeURIComponent(username)}`, {
    method: 'POST',
    body: { message },
  });
}
