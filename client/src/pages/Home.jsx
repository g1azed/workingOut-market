import { useEffect, useRef, useState } from 'react';
import Nav from '../components/Nav.jsx';
import ItemCard from '../components/ItemCard.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { api } from '../api.js';
import { CATEGORIES } from '../categories.js';

const ALL_CATEGORIES = ['all', ...CATEGORIES];

export default function Home() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [cat, setCat] = useState('all');
  const [search, setSearch] = useState('');
  const debounce = useRef(null);

  useEffect(() => {
    const params = { page };
    if (cat !== 'all') params.category = cat;
    if (search) params.search = search;
    api
      .items(params)
      .then((data) => {
        setItems(data.items);
        setPages(data.pages);
      })
      .catch(() => {
        setItems([]);
        setPages(1);
      });
  }, [page, cat, search]);

  function onSearchChange(e) {
    const value = e.target.value;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setPage(1);
      setSearch(value);
    }, 400);
  }

  function selectCat(c) {
    setCat(c);
    setPage(1);
  }

  function goPage(p) {
    setPage(p);
    window.scrollTo(0, 0);
  }

  return (
    <>
      <Nav user={user} />
      <div className="container">
        <div className="hero">
          <h1>퇴근 중고 거래</h1>
          <p>퇴근 중고거래 규칙</p>
        </div>

        <div className="filters">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="상품명을 검색하세요..." onChange={onSearchChange} />
          </div>
          <div>
            {ALL_CATEGORIES.map((c) => (
              <button
                key={c}
                className={`cat-btn${c === cat ? ' active' : ''}`}
                onClick={() => selectCat(c)}
              >
                {c === 'all' ? '전체' : c}
              </button>
            ))}
          </div>
        </div>

        <div className="items-grid">
          {items.length === 0 ? (
            <div className="empty" style={{ gridColumn: '1/-1' }}>
              <div className="empty-icon">📦</div>
              <p>상품이 없습니다.</p>
            </div>
          ) : (
            items.map((item) => <ItemCard key={item.id} item={item} />)
          )}
        </div>

        {pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-btn${p === page ? ' active' : ''}`}
                onClick={() => goPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
