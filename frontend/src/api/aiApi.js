import { apiRequest } from './client.js';

export function sendChatMessage(username, message) {
  return apiRequest(`/api/ai/chat/${encodeURIComponent(username)}`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}
