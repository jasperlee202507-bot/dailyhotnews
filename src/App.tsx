import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home, Detail, Favorites } from '@/pages';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </Router>
  );
}
