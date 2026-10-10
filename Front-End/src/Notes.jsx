import React, { useState, useEffect } from 'react';

function Notes() {
    const [topic, setTopic] = useState('hoc-tap');
    const [notes, setNotes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ id: null, title: '', content: '' });

    const fetchNotes = () => {
        fetch(`http://localhost:5000/api/notes/${topic}`)
            .then(res => res.json())
            .then(data => setNotes(Array.isArray(data) ? data : []))
            .catch(() => setNotes([]));
    };

    useEffect(() => { 
        fetchNotes(); 
        setFormData({ id: null, title: '', content: '' });
    }, [topic]);

    const handleSave = () => {
        if (!formData.title.trim()) {
            alert("Vui lòng nhập tiêu đề ghi chú!");
            return;
        }

        const method = formData.id ? 'PUT' : 'POST';
        const url = formData.id 
            ? `http://localhost:5000/api/notes/${topic}/${formData.id}` 
            : `http://localhost:5000/api/notes/${topic}`;

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: formData.title, content: formData.content })
        })
        .then(res => res.json())
        .then(() => {
            fetchNotes();
            setFormData({ id: null, title: '', content: '' });
        });
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa ghi chú này không?')) {
            fetch(`http://localhost:5000/api/notes/${topic}/${id}`, { method: 'DELETE' })
                .then(() => fetchNotes());
        }
    };

    const handleEdit = (note) => {
        setFormData({ id: note.id, title: note.title, content: note.content });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Lọc ghi chú theo từ khóa tìm kiếm[cite: 34]
    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="page-header">
                <h2>📌 Quản lý Ghi chú Công khai</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {/* Thanh tìm kiếm */}
                    <input 
                        className="input-field" 
                        style={{ margin: 0, width: '220px' }} 
                        placeholder="🔍 Tìm kiếm ghi chú..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {/* Chọn chủ đề */}
                    <select 
                        className="select-field" 
                        style={{ margin: 0, width: '160px' }} 
                        value={topic} 
                        onChange={(e) => setTopic(e.target.value)}
                    >
                        <option value="hoc-tap">🎓 Học tập</option>
                        <option value="cong-viec">💼 Công việc</option>
                        <option value="ca-nhan">👤 Cá nhân</option>
                    </select>
                </div>
            </div>

            {/* Form Thêm / Sửa Ghi chú */}
            <div className="card-form">
                <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>
                    {formData.id ? '✏️ Cập nhật ghi chú' : '➕ Thêm ghi chú mới'}
                </h3>
                <input 
                    className="input-field"
                    placeholder="Tiêu đề ghi chú..." 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                />
                <textarea 
                    className="textarea-field"
                    placeholder="Nội dung chi tiết..." 
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    rows="3"
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={handleSave}>
                        {formData.id ? 'Lưu thay đổi' : 'Tạo ghi chú'}
                    </button>
                    {formData.id && (
                        <button className="btn btn-secondary" onClick={() => setFormData({ id: null, title: '', content: '' })}>
                            Hủy bỏ
                        </button>
                    )}
                </div>
            </div>

            {/* Danh sách Thẻ Ghi chú */}
            <div className="notes-grid">
                {filteredNotes.length === 0 && (
                    <p style={{ color: '#64748b', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                        {notes.length === 0 ? 'Chưa có ghi chú nào trong chủ đề này.' : 'Không tìm thấy ghi chú phù hợp.'}
                    </p>
                )}
                {filteredNotes.map(note => (
                    <div key={note.id} className="note-card">
                        <div>
                            <h4>{note.title}</h4>
                            <p>{note.content}</p>
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

export default Notes;