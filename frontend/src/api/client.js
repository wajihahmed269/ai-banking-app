const defaultHeaders = {
  'Content-Type': 'application/json',
};

export async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof body === 'string' ? body : body.message;
    throw new Error(message || 'Request failed');
  }

  return body;
}
