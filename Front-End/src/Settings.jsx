import React, { useState, useEffect } from 'react';

function Settings() {
    const [profile, setProfile] = useState({ displayName: '', theme: 'light', password: '' });

    useEffect(() => {
        fetch('http://localhost:5000/api/profile')
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                applyTheme(data.theme);
            });
    }, []);

    const applyTheme = (themeMode) => {
        if (themeMode === 'dark') {
            document.body.style.backgroundColor = '#0f172a';
            document.body.style.color = '#f8fafc';
        } else {
            document.body.style.backgroundColor = '#f4f6f9';
            document.body.style.color = '#333';
        }
    };

    const handleChange = (e) => {
        const updated = { ...profile, [e.target.name]: e.target.value };
        setProfile(updated);
        if (e.target.name === 'theme') {
            applyTheme(e.target.value);
        }
    };

    const handleSave = () => {
        fetch('http://localhost:5000/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
        })
        .then(res => res.json())
        .then(() => alert("Cập nhật cài đặt thành công!"));
    };

    return (
        <div style={{ maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '24px' }}>⚙️ Cài đặt hệ thống</h2>
            
            <div className="card-form">
                <label style={{ fontWeight: '600' }}>Tên hiển thị người dùng:</label>
                <input className="input-field" name="displayName" value={profile.displayName} onChange={handleChange} />

                <label style={{ fontWeight: '600' }}>Chế độ Giao diện (Theme):</label>
                <select className="select-field" name="theme" value={profile.theme} onChange={handleChange}>
                    <option value="light">☀️ Giao diện Sáng (Light)</option>
                    <option value="dark">🌙 Giao diện Tối (Dark)</option>
                </select>

                <label style={{ fontWeight: '600' }}>Mật khẩu Vùng kín:</label>
                <input className="input-field" type="password" name="password" value={profile.password} onChange={handleChange} placeholder="Chưa đặt mật khẩu..." />

                <button className="btn btn-primary" onClick={handleSave}>Lưu cài đặt</button>
            </div>
        </div>
    );
}

export default Settings;