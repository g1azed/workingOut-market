async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '요청에 실패했습니다.');
  return data;
}

export const api = {
  me: () => fetch('/api/me').then((r) => r.json()),
  items: (params) => fetch('/api/items?' + new URLSearchParams(params)).then(handle),
  item: (id) => fetch('/api/items/' + id).then(handle),
  profileItems: () => fetch('/api/profile/items').then(handle),
  createItem: (fd) => fetch('/api/items', { method: 'POST', body: fd }).then(handle),
  updateItem: (id, fd) => fetch('/api/items/' + id, { method: 'PUT', body: fd }).then(handle),
  updateStatus: (id, status) =>
    fetch('/api/items/' + id + '/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(handle),
  deleteItem: (id) => fetch('/api/items/' + id, { method: 'DELETE' }).then(handle),
};
