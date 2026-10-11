import React, { useState, useEffect } from 'react';

function Settings() {
    const [profile, setProfile] = useState({ 
        displayName: '', 
        theme: 'light', 
        primaryColor: '#2563eb', 
        categories: ['hoc-tap', 'cong-viec', 'ca-nhan'], 
        password: '' 
    });
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/api/profile')
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                applySettings(data);
            });
    }, []);

    const applySettings = (data) => {
        // Đổi màu chủ đạo toàn cục
        document.documentElement.style.setProperty('--primary-color', data.primaryColor || '#2563eb');
        
        // Đổi theme sáng/tối
        if (data.theme === 'dark') {
            document.body.style.backgroundColor = '#0f172a';
            document.body.style.color = '#f8fafc';
        } else {
            document.body.style.backgroundColor = '#f8fafc';
            document.body.style.color = '#0f172a';
        }
    };

    const handleChange = (e) => {
        const updated = { ...profile, [e.target.name]: e.target.value };
        setProfile(updated);
        if (e.target.name === 'theme' || e.target.name === 'primaryColor') {
            applySettings(updated);
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
        setProfile({ ...profile, categories: updatedCategories });
        setNewCategory('');
    };

    const handleDeleteCategory = (catToDelete) => {
        if (profile.categories.length <= 1) {
            alert("Phải giữ lại ít nhất một danh mục!");
            return;
        }
        if (window.confirm(`Bạn có chắc muốn xóa danh mục [${catToDelete}] không?`)) {
            const updatedCategories = profile.categories.filter(c => c !== catToDelete);
            setProfile({ ...profile, categories: updatedCategories });
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
            <h2 style={{ marginBottom: '24px' }}>Cài đặt hệ thống</h2>
            
            <div className="card-form">
                <label style={{ fontWeight: '600' }}>Tên hiển thị người dùng:</label>
                <input className="input-field" name="displayName" value={profile.displayName} onChange={handleChange} />

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
                        placeholder="Thêm danh mục mới (VD: du-an)..." 
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleAddCategory} type="button">Thêm</button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                    {profile.categories && profile.categories.map(cat => (
                        <span key={cat} style={{ background: '#e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {cat}
                            <button onClick={() => handleDeleteCategory(cat)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>x</button>
                        </span>
                    ))}
                </div>

                <label style={{ fontWeight: '600' }}>Mật khẩu Vùng kín:</label>
                <input className="input-field" type="password" name="password" value={profile.password} onChange={handleChange} placeholder="Chưa đặt mật khẩu..." />

                <button className="btn btn-primary" onClick={handleSave} style={{ width: '100%', marginTop: '10px' }}>Lưu thay đổi</button>
            </div>
        </div>
    );
}

export default Settings;