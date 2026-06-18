import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import ItemForm from '../components/ItemForm.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { api } from '../api.js';

export default function NewItem() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true });
  }, [loading, user, navigate]);

  async function handleSubmit(fd) {
    const data = await api.createItem(fd);
    navigate('/items/' + data.id);
  }

  return (
    <>
      <Nav user={user} right={<Link to="/" className="nav-btn nav-btn-outline">← 목록으로</Link>} />
      <div className="container">
        <div className="form-card">
          <h2>상품 등록</h2>
          <ItemForm submitLabel="등록하기" submittingLabel="등록 중..." onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  );
}
