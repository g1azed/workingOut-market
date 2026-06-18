import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import NewItem from './pages/NewItem.jsx';
import EditItem from './pages/EditItem.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/items/new" element={<NewItem />} />
      <Route path="/items/:id/edit" element={<EditItem />} />
      <Route path="/items/:id" element={<ItemDetail />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}
