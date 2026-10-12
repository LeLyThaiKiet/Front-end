import React, { useState, useEffect, useRef } from 'react';

function Notes({ globalProfile }) {
    const [categories, setCategories] = useState(['hoc-tap', 'cong-viec', 'ca-nhan']);
    const [topic, setTopic] = useState('hoc-tap');
    const [notes, setNotes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ id: null, title: '', content: '' });

    const contentEditableRef = useRef(null);

    useEffect(() => {
        if (globalProfile && globalProfile.categories && globalProfile.categories.length > 0) {
            setCategories(globalProfile.categories);
            if (!globalProfile.categories.includes(topic)) {
                setTopic(globalProfile.categories[0]);
            }
        }
    }, [globalProfile]);

    const fetchNotes = () => {
        if (!topic) return;
        fetch(`http://localhost:5000/api/notes/${topic}`)
            .then(res => res.json())
            .then(data => setNotes(Array.isArray(data) ? data : []))
            .catch(() => setNotes([]));
    };

    useEffect(() => { 
        if (topic) {
            fetchNotes(); 
            setFormData({ id: null, title: '', content: '' });
            if (contentEditableRef.current) {
                contentEditableRef.current.innerHTML = '';
            }
        }
    }, [topic]);

    const applyFormat = (command) => {
        document.execCommand(command, false, null);
    };

    const handleSave = () => {
        if (!formData.title.trim()) {
            alert("Vui lòng nhập tiêu đề ghi chú!");
            return;
        }

        const content = contentEditableRef.current ? contentEditableRef.current.innerHTML : '';
        const method = formData.id ? 'PUT' : 'POST';
        const url = formData.id 
            ? `http://localhost:5000/api/notes/${topic}/${formData.id}` 
            : `http://localhost:5000/api/notes/${topic}`;

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: formData.title, content })
        })
        .then(res => res.json())
        .then(() => {
            fetchNotes();
            setFormData({ id: null, title: '', content: '' });
            if (contentEditableRef.current) {
                contentEditableRef.current.innerHTML = '';
            }
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
        if (contentEditableRef.current) {
            contentEditableRef.current.innerHTML = note.content || '';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setFormData({ id: null, title: '', content: '' });
        if (contentEditableRef.current) {
            contentEditableRef.current.innerHTML = '';
        }
    };

    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="page-header">
                <h2>Quản lý Ghi chú Công khai</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <input 
                        className="input-field" 
                        style={{ margin: 0, width: '220px' }} 
                        placeholder="Tìm kiếm ghi chú..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select 
                        className="select-field" 
                        style={{ margin: 0, width: '160px' }} 
                        value={topic} 
                        onChange={(e) => setTopic(e.target.value)}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="card-form">
                <h3 style={{ marginBottom: '16px', color: 'var(--text-color)' }}>
                    {formData.id ? 'Cập nhật ghi chú' : 'Thêm ghi chú mới'}
                </h3>
                <input 
                    className="input-field"
                    placeholder="Tiêu đề ghi chú..." 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
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
                    placeholder="Nhập nội dung chi tiết (có thể in đậm, in nghiêng...)..."
                />

                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button className="btn btn-primary" onClick={handleSave}>
                        {formData.id ? 'Lưu thay đổi' : 'Tạo ghi chú'}
                    </button>
                    {formData.id && (
                        <button className="btn btn-secondary" onClick={handleCancel}>Hủy bỏ</button>
                    )}
                </div>
            </div>

            <div className="notes-grid">
                {filteredNotes.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                        {notes.length === 0 ? 'Chưa có ghi chú nào trong danh mục này.' : 'Không tìm thấy ghi chú phù hợp.'}
                    </p>
                )}
                {filteredNotes.map(note => (
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

export default Notes;