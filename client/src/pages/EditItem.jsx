import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import ItemForm from '../components/ItemForm.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { api } from '../api.js';

export default function EditItem() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    api
      .item(id)
      .then((it) => {
        if (it.seller_id !== user.id) {
          alert('권한이 없습니다.');
          navigate('/');
          return;
        }
        setItem(it);
      })
      .catch(() => navigate('/'));
  }, [id, user, loading, navigate]);

  async function handleSubmit(fd) {
    await api.updateItem(id, fd);
    navigate('/items/' + id);
  }

  return (
    <>
      <Nav
        user={user}
        right={<Link to={`/items/${id}`} className="nav-btn nav-btn-outline">← 돌아가기</Link>}
      />
      <div className="container">
        <div className="form-card">
          <h2>상품 수정</h2>
          {item && (
            <ItemForm
              initial={item}
              submitLabel="수정 완료"
              submittingLabel="수정 중..."
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </>
  );
}
