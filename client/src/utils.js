export function formatPrice(p) {
  return Number(p).toLocaleString('ko-KR') + '원';
}

export function statusLabel(s) {
  return { selling: '판매중', reserved: '예약중', sold: '판매완료' }[s] || s;
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}시 ${min}분`;
}

export function avatarUrl(id, avatar) {
  return avatar ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png` : null;
}
