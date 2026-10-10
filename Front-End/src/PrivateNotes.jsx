import React, { useState } from 'react';

function PrivateNotes() {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [notes, setNotes] = useState([]);
    const [formData, setFormData] = useState({ id: null, title: '', content: '' });

    const handleLogin = () => {
        fetch('http://localhost:5000/api/private/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: passwordInput })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setIsUnlocked(true);
                fetchPrivateNotes();
            } else {
                alert("Sai mật khẩu, vui lòng thử lại!");
                setPasswordInput('');
            }
        })
        .catch(() => alert("Không thể xác thực!"));
    };

    const fetchPrivateNotes = () => {
        fetch('http://localhost:5000/api/private/notes')
            .then(res => res.json())
            .then(data => setNotes(Array.isArray(data) ? data : []))
            .catch(() => setNotes([]));
    };

    const handleSave = () => {
        const method = formData.id ? 'PUT' : 'POST';
        const url = formData.id 
            ? `http://localhost:5000/api/private/notes/${formData.id}` 
            : 'http://localhost:5000/api/private/notes';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: formData.title, content: formData.content })
        }).then(() => {
            fetchPrivateNotes();
            setFormData({ id: null, title: '', content: '' });
        });
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa ghi chú mật này?')) {
            fetch(`http://localhost:5000/api/private/notes/${id}`, { method: 'DELETE' })
                .then(() => fetchPrivateNotes());
        }
    };

    const handleEdit = (note) => setFormData({ id: note.id, title: note.title, content: note.content });

    if (!isUnlocked) {
        return (
            <div style={{ maxWidth: '400px', margin: '80px auto' }} className="card-form">
                <h2 style={{ textAlign: 'center', marginBottom: '16px', color: '#dc2626' }}>🔒 Vùng Bảo Mật</h2>
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px' }}>Vui lòng nhập mật khẩu riêng tư để mở khóa.</p>
                <input 
                    type="password"
                    className="input-field"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Mật khẩu bảo vệ..."
                />
                <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleLogin}>Mở khóa</button>
            </div>
        );
    }

    return (
        <div>
            <h2 style={{ color: '#dc2626', marginBottom: '24px' }}>🔒 Ghi chú Mật (Private Notes)</h2>
            
            <div className="card-form" style={{ borderTop: '4px solid #dc2626' }}>
                <h3>{formData.id ? '✏️ Sửa ghi chú kín' : '➕ Thêm ghi chú bí mật'}</h3>
                <input 
                    className="input-field"
                    placeholder="Tiêu đề bí mật..." 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                />
                <textarea 
                    className="textarea-field"
                    placeholder="Nội dung mật..." 
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    rows="3"
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-danger" onClick={handleSave}>{formData.id ? 'Cập nhật' : 'Lưu bí mật'}</button>
                    {formData.id && (
                        <button className="btn btn-secondary" onClick={() => setFormData({ id: null, title: '', content: '' })}>Hủy</button>
                    )}
                </div>
            </div>

            <div className="notes-grid">
                {notes.map(note => (
                    <div key={note.id} className="note-card" style={{ borderLeftColor: '#dc2626' }}>
                        <div>
                            <h4>{note.title}</h4>
                            <p>{note.content}</p>
                        </div>
                        <div className="note-actions">
                            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEdit(note)}>Sửa</button>
                            <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDelete(note.id)}>Xóa</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PrivateNotes;