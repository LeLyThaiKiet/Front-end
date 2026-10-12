import React, { useState, useEffect, useRef } from 'react';

function PrivateNotes() {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [username, setUsername] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [accountsList, setAccountsList] = useState([]);
    const [notes, setNotes] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [title, setTitle] = useState('');
    
    const contentEditableRef = useRef(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/profile')
            .then(res => res.json())
            .then(data => {
                if (data && data.accounts) {
                    const keys = Object.keys(data.accounts);
                    setAccountsList(keys);
                    if (keys.length > 0) {
                        setUsername(keys[0]);
                    }
                }
            })
            .catch(err => console.error("Lỗi lấy profile:", err));
    }, []);

    const handleLogin = () => {
        if (!username || !passwordInput.trim()) {
            alert("Vui lòng chọn tài khoản và nhập mật khẩu!");
            return;
        }

        fetch('http://localhost:5000/api/private/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: username, 
                password: passwordInput.trim() 
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setIsUnlocked(true);
                fetchPrivateNotes(data.username);
            } else {
                alert(data.message || "Sai mật khẩu!");
                setPasswordInput('');
            }
        })
        .catch(() => alert("Không thể kết nối đến máy chủ!"));
    };

    const fetchPrivateNotes = (user) => {
        fetch(`http://localhost:5000/api/private/notes/${user}`)
            .then(res => res.json())
            .then(data => setNotes(Array.isArray(data) ? data : []))
            .catch(() => setNotes([]));
    };

    const applyFormat = (command) => {
        document.execCommand(command, false, null);
    };

    const handleSave = () => {
        if (!title.trim()) {
            alert("Vui lòng nhập tiêu đề ghi chú!");
            return;
        }

        const content = contentEditableRef.current ? contentEditableRef.current.innerHTML : '';
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId 
            ? `http://localhost:5000/api/private/notes/${username}/${editingId}` 
            : `http://localhost:5000/api/private/notes/${username}`;

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        })
        .then(res => res.json())
        .then(() => {
            fetchPrivateNotes(username);
            setTitle('');
            setEditingId(null);
            if (contentEditableRef.current) {
                contentEditableRef.current.innerHTML = '';
            }
        });
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa ghi chú này không?')) {
            fetch(`http://localhost:5000/api/private/notes/${username}/${id}`, { method: 'DELETE' })
                .then(() => fetchPrivateNotes(username));
        }
    };

    const handleEdit = (note) => {
        setEditingId(note.id);
        setTitle(note.title);
        if (contentEditableRef.current) {
            contentEditableRef.current.innerHTML = note.content || '';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingId(null);
        setTitle('');
        if (contentEditableRef.current) {
            contentEditableRef.current.innerHTML = '';
        }
    };

    const handleLogout = () => {
        setIsUnlocked(false);
        setPasswordInput('');
        setNotes([]);
        handleCancel();
    };

    if (!isUnlocked) {
        return (
            <div style={{ maxWidth: '400px', margin: '80px auto' }} className="card-form">
                <h2 style={{ textAlign: 'center', marginBottom: '16px', color: 'var(--primary-color)' }}>Đăng nhập Vùng riêng tư</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>Chọn tài khoản để mở khóa kho ghi chú.</p>
                
                <label style={{ fontWeight: '600', fontSize: '13px' }}>Chọn tài khoản:</label>
                <select 
                    className="select-field"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                >
                    {accountsList.map(acc => (
                        <option key={acc} value={acc}>{acc}</option>
                    ))}
                </select>

                <label style={{ fontWeight: '600', fontSize: '13px', marginTop: '12px' }}>Mật khẩu:</label>
                <input 
                    type="password"
                    className="input-field"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} onClick={handleLogin}>
                    Mở khóa
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h2>Kho Ghi chú Riêng tư ({username})</h2>
                <button className="btn btn-secondary" onClick={handleLogout}>Đăng xuất</button>
            </div>
            
            <div className="card-form">
                <h3 style={{ marginBottom: '16px', color: 'var(--text-color)' }}>
                    {editingId ? 'Cập nhật ghi chú cá nhân' : 'Thêm ghi chú mật mới'}
                </h3>
                <input 
                    className="input-field"
                    placeholder="Tiêu đề bí mật..." 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />

                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', background: 'var(--input-bg)', padding: '6px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontWeight: 'bold' }} onClick={() => applyFormat('bold')} title="In đậm">B</button>
                    <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontStyle: 'italic' }} onClick={() => applyFormat('italic')} title="In nghiêng">I</button>
                    <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', textDecoration: 'underline' }} onClick={() => applyFormat('underline')} title="Gạch chân">U</button>
                    <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => applyFormat('insertUnorderedList')} title="Danh sách chấm">Danh sách</button>
                </div>

                <div 
                    ref={contentEditableRef}
                    contentEditable={true}
                    className="textarea-field"
                    style={{ minHeight: '120px', maxHeight: '250px', overflowY: 'auto', cursor: 'text' }}
                    placeholder="Nhập nội dung riêng tư..."
                />

                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button className="btn btn-primary" onClick={handleSave}>
                        {editingId ? 'Lưu thay đổi' : 'Tạo ghi chú mật'}
                    </button>
                    {editingId && (
                        <button className="btn btn-secondary" onClick={handleCancel}>Hủy</button>
                    )}
                </div>
            </div>

            <div className="notes-grid">
                {notes.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                        Tài khoản này chưa có ghi chú riêng tư nào.
                    </p>
                )}
                {notes.map(note => (
                    <div key={note.id} className="note-card">
                        <div>
                            <h4>{note.title}</h4>
                            <div 
                                style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', wordBreak: 'break-word', margin: '10px 0' }}
                                dangerouslySetInnerHTML={{ __html: note.content }} 
                            />
                            <div className="note-date">
                                Cập nhật: {new Date(note.updatedAt || note.createdAt).toLocaleString('vi-VN')}
                            </div>
                        </div>
                        <div className="note-actions">
                            <button className="btn btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '13px' }} onClick={() => handleEdit(note)}>Sửa</button>
                            <button className="btn btn-danger" style={{ flex: 1, padding: '8px', fontSize: '13px' }} onClick={() => handleDelete(note.id)}>Xóa</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PrivateNotes;