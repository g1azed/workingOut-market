import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import ItemCard from '../components/ItemCard.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { api } from '../api.js';
import { avatarUrl } from '../utils.js';

export default function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    api.profileItems().then(setItems).catch(() => setItems([]));
  }, [user, loading, navigate]);

  const right = (
    <>
      <Link to="/items/new" className="nav-btn nav-btn-primary">+ 판매하기</Link>
      <a href="/auth/logout" className="nav-btn nav-btn-outline">로그아웃</a>
    </>
  );

  return (
    <>
      <Nav user={user} right={right} />
      <div className="container">
        {user && (
          <div className="profile-header">
            {user.avatar ? (
              <img className="profile-avatar" src={avatarUrl(user.id, user.avatar)} alt={user.username} />
            ) : (
              <div className="profile-avatar" style={{ background: 'var(--gray-200)', borderRadius: '50%' }} />
            )}
            <div>
              <div className="profile-name">{user.username}</div>
              <div className="profile-sub">판매 상품 {items ? items.length : 0}개</div>
            </div>
          </div>
        )}

        <div className="section-title">내 판매 목록</div>

        <div className="items-grid">
          {items && items.length === 0 ? (
            <div className="empty" style={{ gridColumn: '1/-1' }}>
              <div className="empty-icon">📦</div>
              <p>등록한 상품이 없습니다.</p>
            </div>
          ) : (
            (items || []).map((item) => <ItemCard key={item.id} item={item} />)
          )}
        </div>
      </div>
    </>
  );
}
