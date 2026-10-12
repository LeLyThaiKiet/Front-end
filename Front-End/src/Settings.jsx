import React, { useState, useEffect } from 'react';

function Settings({ onSettingsUpdated }) {
    const [profile, setProfile] = useState({ 
        theme: 'light', 
        primaryColor: '#2563eb', 
        categories: ['hoc-tap', 'cong-viec', 'ca-nhan'], 
        accounts: { "admin": "123456", "sinhvien1": "123" }
    });
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/api/profile')
            .then(res => res.json())
            .then(data => {
                const { displayName, password, ...cleanProfile } = data;
                if (!cleanProfile.accounts) cleanProfile.accounts = { "admin": "123456", "sinhvien1": "123" };
                setProfile(cleanProfile);
            });
    }, []);

    const handleChange = (e) => {
        const updated = { ...profile, [e.target.name]: e.target.value };
        setProfile(updated);
        if (e.target.name === 'theme' || e.target.name === 'primaryColor') {
            if (onSettingsUpdated) onSettingsUpdated(updated);
        }
    };

    const handleAddCategory = () => {
        if (!newCategory.trim()) return;
        const formattedCat = newCategory.trim().toLowerCase().replace(/\s+/g, '-');
        if (profile.categories.includes(formattedCat)) {
            alert("Danh mục này đã tồn tại!");
            return;
        }
        const updatedCategories = [...profile.categories, formattedCat];
        const updatedProfile = { ...profile, categories: updatedCategories };
        setProfile(updatedProfile);
        setNewCategory('');
        if (onSettingsUpdated) onSettingsUpdated(updatedProfile);
    };

    const handleDeleteCategory = (catToDelete) => {
        if (profile.categories.length <= 1) {
            alert("Phải giữ lại ít nhất một danh mục!");
            return;
        }
        if (window.confirm(`Bạn có chắc muốn xóa danh mục [${catToDelete}] không?`)) {
            const updatedCategories = profile.categories.filter(c => c !== catToDelete);
            const updatedProfile = { ...profile, categories: updatedCategories };
            setProfile(updatedProfile);
            if (onSettingsUpdated) onSettingsUpdated(updatedProfile);
        }
    };

    const handleRegister = () => {
        if (!newUsername.trim() || !newPassword.trim()) {
            alert("Vui lòng nhập Tên tài khoản và Mật khẩu!");
            return;
        }

        const updatedAccounts = { 
            ...(profile.accounts || {}), 
            [newUsername.trim().toLowerCase()]: newPassword.trim() 
        };

        const updatedProfile = { ...profile, accounts: updatedAccounts };

        fetch('http://localhost:5000/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProfile)
        })
        .then(res => res.json())
        .then(() => {
            setProfile(updatedProfile);
            setNewUsername('');
            setNewPassword('');
            if (onSettingsUpdated) onSettingsUpdated(updatedProfile);
            alert(`Đã đăng ký thành công tài khoản [${newUsername.trim().toLowerCase()}]!`);
        });
    };

    const handleSave = () => {
        fetch('http://localhost:5000/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
        })
        .then(res => res.json())
        .then(() => {
            if (onSettingsUpdated) onSettingsUpdated(profile);
            alert("Cập nhật cài đặt thành công!");
        });
    };

    return (
        <div style={{ maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '24px' }}>Cài đặt hệ thống</h2>
            
            <div className="card-form">
                <label style={{ fontWeight: '600' }}>Tên tài khoản mới (Username):</label>
                <input 
                    className="input-field" 
                    value={newUsername} 
                    onChange={(e) => setNewUsername(e.target.value)} 
                    placeholder="Nhập tên tài khoản..."
                />

                <label style={{ fontWeight: '600' }}>Mật khẩu tài khoản:</label>
                <input 
                    className="input-field" 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Nhập mật khẩu..."
                />

                <label style={{ fontWeight: '600' }}>Chế độ Giao diện (Theme):</label>
                <select className="select-field" name="theme" value={profile.theme} onChange={handleChange}>
                    <option value="light">Sáng</option>
                    <option value="dark">Tối</option>
                </select>

                <label style={{ fontWeight: '600' }}>Màu sắc chủ đạo (Primary Color):</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', marginTop: '6px' }}>
                    <input 
                        type="color" 
                        name="primaryColor" 
                        value={profile.primaryColor || '#2563eb'} 
                        onChange={handleChange}
                        style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
                    />
                    <span>{profile.primaryColor}</span>
                </div>

                <label style={{ fontWeight: '600' }}>Quản lý Danh mục Ghi chú:</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', marginBottom: '12px' }}>
                    <input 
                        className="input-field" 
                        style={{ margin: 0 }}
                        placeholder="Thêm danh mục mới..." 
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleAddCategory} type="button">Thêm</button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                    {profile.categories && profile.categories.map(cat => (
                        <span key={cat} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {cat}
                            <button onClick={() => handleDeleteCategory(cat)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>x</button>
                        </span>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button className="btn btn-secondary" onClick={handleRegister} type="button" style={{ flex: 1 }}>
                        Đăng ký tài khoản
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} type="button" style={{ flex: 1 }}>
                        Lưu cài đặt
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Settings;