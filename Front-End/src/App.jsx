import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Notes from './Notes';
import PrivateNotes from './PrivateNotes';
import Settings from './Settings';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2>📝 Smart Notes</h2>
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
                📌 Ghi chú công khai
              </NavLink>
            </li>
            <li>
              <NavLink to="/private" className={({ isActive }) => isActive ? "active" : ""}>
                🔒 Vùng riêng tư
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={({ isActive }) => isActive ? "active" : ""}>
                ⚙️ Cài đặt hệ thống
              </NavLink>
            </li>
          </ul>
        </aside>

        {/* Nội dung chính */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Notes />} />
            <Route path="/private" element={<PrivateNotes />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;