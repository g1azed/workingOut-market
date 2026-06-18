import { Link } from 'react-router-dom';
import { formatPrice, statusLabel } from '../utils.js';

export default function ItemCard({ item }) {
  return (
    <Link to={`/items/${item.id}`} className="item-card">
      <div className="item-img">
        {item.images?.length ? (
          <img src={item.images[0]} alt={item.title} loading="lazy" />
        ) : (
          '📦'
        )}
      </div>
      <div className="item-info">
        <div className="item-title">{item.title}</div>
        <div className="item-price">{formatPrice(item.price)}</div>
        <div className="item-meta">
          <span className={`status-badge status-${item.status}`}>{statusLabel(item.status)}</span>
          <span>{item.category}</span>
        </div>
      </div>
    </Link>
  );
}
