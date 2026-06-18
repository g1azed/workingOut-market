import { useEffect, useState } from 'react';
import { api } from '../api.js';

// Loads the current user from /api/me once. `user` is null when logged out,
// `loading` is true until the first request resolves.
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .me()
      .then((u) => active && setUser(u))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { user, loading };
}
