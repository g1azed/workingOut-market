import { Link } from 'react-router-dom';
import { avatarUrl } from '../utils.js';

// Shared top navigation. Pass `right` to override the right-hand area
// (e.g. a "back to list" link); otherwise it renders the auth state.
export default function Nav({ user, right }) {
  return (
    <nav>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">👾 WorkingOut Market</Link>
        <div className="nav-spacer"></div>
        {right !== undefined ? right : <AuthArea user={user} />}
      </div>
    </nav>
  );
}

function AuthArea({ user }) {
  if (!user) {
    return (
      <Link to="/login" className="nav-btn nav-btn-primary">로그인</Link>
    );
  }
  return (
    <div className="nav-user">
      {user.avatar ? (
        <img className="nav-avatar" src={avatarUrl(user.id, user.avatar)} alt="" />
      ) : (
        <div className="nav-avatar"></div>
      )}
      <span>{user.username}</span>
      <Link to="/profile" className="nav-btn nav-btn-outline">내 상품</Link>
      <Link to="/items/new" className="nav-btn nav-btn-primary">+ 판매하기</Link>
      <a href="/auth/logout" className="nav-btn nav-btn-outline">로그아웃</a>
    </div>
  );
}
