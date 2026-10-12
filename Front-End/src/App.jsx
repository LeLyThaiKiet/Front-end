import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Notes from './Notes';
import PrivateNotes from './PrivateNotes';
import Settings from './Settings';

function App() {
  const [profile, setProfile] = useState(null);

  const applyGlobalTheme = (theme, primaryColor) => {
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary-color', primaryColor);
    }
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  const loadProfile = () => {
    fetch('http://localhost:5000/api/profile')
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        applyGlobalTheme(data.theme, data.primaryColor);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <h2>Quản lý ghi chú</h2>
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
                Ghi chú công khai
              </NavLink>
            </li>
            <li>
              <NavLink to="/private" className={({ isActive }) => isActive ? "active" : ""}>
                Vùng riêng tư
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={({ isActive }) => isActive ? "active" : ""}>
                Cài đặt hệ thống
              </NavLink>
            </li>
          </ul>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Notes globalProfile={profile} />} />
            <Route path="/private" element={<PrivateNotes />} />
            <Route 
              path="/settings" 
              element={
                <Settings 
                  onSettingsUpdated={(updatedProfile) => {
                    setProfile(updatedProfile);
                    applyGlobalTheme(updatedProfile.theme, updatedProfile.primaryColor);
                  }} 
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;