import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { api } from '../api.js';
import { avatarUrl, formatDate, formatPrice, statusLabel } from '../utils.js';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState(false);
  const [mainImg, setMainImg] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(() => {
    api
      .item(id)
      .then((it) => {
        setItem(it);
        setStatus(it.status);
      })
      .catch(() => setError(true));
  }, [id]);

  useEffect(() => {
    if (item) document.title = item.title + ' - WorkingOut Market';
  }, [item]);

  const backRight = (
    <Link to="/" className="nav-btn nav-btn-outline">← 목록으로</Link>
  );

  if (error) {
    return (
      <>
        <Nav user={user} right={backRight} />
        <div className="container">
          <div className="detail-wrap">
            <div className="empty">
              <div className="empty-icon">😥</div>
              <p>상품을 찾을 수 없습니다.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <Nav user={user} right={backRight} />
        <div className="container">
          <div className="detail-wrap" />
        </div>
      </>
    );
  }

  const isOwner = user && user.id === item.seller_id;
  const sellerAvatar = avatarUrl(item.seller_id, item.avatar);

  async function updateStatus(s) {
    setStatus(s);
    try {
      await api.updateStatus(id, s);
    } catch {
      alert('상태 변경에 실패했습니다.');
    }
  }

  async function handleDelete() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.deleteItem(id);
      navigate('/');
    } catch {
      alert('삭제에 실패했습니다.');
    }
  }

  return (
    <>
      <Nav user={user} right={backRight} />
      <div className="container">
        <div className="detail-wrap">
          <div className="detail-imgs">
            {item.images.length ? (
              <img src={item.images[mainImg]} alt={item.title} />
            ) : (
              <span style={{ fontSize: 80 }}>📦</span>
            )}
          </div>

          {item.images.length > 1 && (
            <div className="img-thumbs">
              {item.images.map((src, i) => (
                <img
                  key={i}
                  className={`img-thumb${i === mainImg ? ' active' : ''}`}
                  src={src}
                  alt=""
                  onClick={() => setMainImg(i)}
                />
              ))}
            </div>
          )}

          <div className="detail-body">
            <div className="detail-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span className={`status-badge status-${status}`}>{statusLabel(status)}</span>
                <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>{item.category}</span>
              </div>
              <h1>{item.title}</h1>
              <div className="detail-price">{formatPrice(item.price)}</div>
              <div className="detail-desc">{item.description}</div>
              <div className="detail-meta">
                <span>📅 {formatDate(item.created_at)}</span>
              </div>
              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  background: 'var(--gray-50)',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 6 }}>거래 방식</div>
                {item.trade_type === 'delivery' ? (
                  <span>📦 택배거래 · 개인메세지로 문의하세요</span>
                ) : (
                  <span>🤝 직거래 · {item.trade_location ? item.trade_location : '장소 미정'}</span>
                )}
              </div>
            </div>

            <div>
              <div className="seller-card">
                <h3>판매자 정보</h3>
                <div className="seller-info">
                  {sellerAvatar ? (
                    <img className="seller-avatar" src={sellerAvatar} alt={item.username} />
                  ) : (
                    <div className="seller-avatar" />
                  )}
                  <div className="seller-name">{item.username}</div>
                </div>

                {isOwner && (
                  <div className="owner-actions">
                    <select value={status} onChange={(e) => updateStatus(e.target.value)}>
                      <option value="selling">판매중</option>
                      <option value="reserved">예약중</option>
                      <option value="sold">판매완료</option>
                    </select>
                    <Link
                      to={`/items/${item.id}/edit`}
                      className="nav-btn nav-btn-outline"
                      style={{ textAlign: 'center' }}
                    >
                      수정하기
                    </Link>
                    <button className="btn-danger" onClick={handleDelete}>삭제하기</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
