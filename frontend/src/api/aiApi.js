import { request } from './client';

const AI_REQUEST_TIMEOUT_MS = 45000;
const AI_FALLBACK_MESSAGE = 'AI response was empty. Please try one of the demo finance questions again.';

function normalizeAiResponse(result) {
  if (typeof result === 'string') {
    return result.trim() || AI_FALLBACK_MESSAGE;
  }

  if (result && typeof result.response === 'string') {
    return result.response.trim() || AI_FALLBACK_MESSAGE;
  }

  return AI_FALLBACK_MESSAGE;
}

export async function chat(username, message, timeoutMs = AI_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await request(`/ai/chat/${encodeURIComponent(username)}`, {
      method: 'POST',
      body: { message },
      signal: controller.signal,
    });

    return normalizeAiResponse(result);
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('AI is taking too long to respond. Please try again.');
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
