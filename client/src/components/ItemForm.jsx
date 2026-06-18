import { useRef, useState } from 'react';
import { CATEGORIES } from '../categories.js';

// Shared create/edit form. `initial` pre-fills fields (edit mode); when
// omitted the form starts empty (new mode). `onSubmit` receives a ready
// FormData and may throw to surface an error message.
export default function ItemForm({ initial, submitLabel, submittingLabel, onSubmit }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [category, setCategory] = useState(initial?.category || '');
  const [price, setPrice] = useState(initial?.price ?? '');
  const [description, setDescription] = useState(initial?.description || '');
  const [tradeType, setTradeType] = useState(initial?.trade_type || 'direct');
  const [tradeLocation, setTradeLocation] = useState(initial?.trade_location || '');
  const [previews, setPreviews] = useState(initial?.images || []);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  function handleFiles(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    Promise.all(
      files.map(
        (f) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.readAsDataURL(f);
          })
      )
    ).then(setPreviews);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.append('title', title);
    fd.append('category', category);
    fd.append('price', price);
    fd.append('description', description);
    fd.append('trade_type', tradeType);
    fd.append('trade_location', tradeType === 'direct' ? tradeLocation : '');
    Array.from(fileRef.current?.files || []).forEach((f) => fd.append('images', f));
    try {
      await onSubmit(fd);
    } catch (err) {
      alert(err.message || '실패했습니다.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>상품 사진 (최대 5장)</label>
        <div className="upload-area" onClick={() => fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} />
          {previews.length === 0 && (
            <div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
              <div style={{ fontSize: 14, color: 'var(--gray-400)' }}>클릭하여 사진 추가</div>
            </div>
          )}
          {previews.length > 0 && (
            <div className="upload-preview">
              {previews.map((src, i) => (
                <img key={i} src={src} alt="" />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="title">상품명 *</label>
        <input
          id="title"
          type="text"
          placeholder="상품명을 입력하세요"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">카테고리 *</label>
        <select id="category" required value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">카테고리 선택</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="price">가격 *</label>
        <input
          id="price"
          type="number"
          min="0"
          placeholder="0"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">상품 설명 *</label>
        <textarea
          id="description"
          placeholder="상품 상태, 구매 시기, 판매 이유 등을 자세히 적어주세요."
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>거래 방식 *</label>
        <div className="trade_rules">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400, cursor: 'pointer' }}>
            <input
              type="radio"
              name="trade_type"
              value="direct"
              checked={tradeType === 'direct'}
              onChange={() => setTradeType('direct')}
            />{' '}
            직거래
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400, cursor: 'pointer' }}>
            <input
              type="radio"
              name="trade_type"
              value="delivery"
              checked={tradeType === 'delivery'}
              onChange={() => setTradeType('delivery')}
            />{' '}
            택배거래
          </label>
        </div>
        {tradeType === 'direct' && (
          <input
            type="text"
            placeholder="거래 장소를 입력하세요 (예: 강남역 2번 출구)"
            value={tradeLocation}
            onChange={(e) => setTradeLocation(e.target.value)}
          />
        )}
      </div>

      <button type="submit" className="btn-submit" disabled={submitting}>
        {submitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
