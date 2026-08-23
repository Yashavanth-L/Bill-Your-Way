import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import Admin from './views/Admin';
import User from './views/User';
import Kitchen from './views/Kitchen';
import Toast from './components/Toast';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Toast />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/user" element={<User />} />
          <Route path="/user/:tableNo" element={<User />} />
          <Route path="/kitchen" element={<Kitchen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
