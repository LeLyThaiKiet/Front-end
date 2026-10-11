const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const profilePath = path.join(__dirname, 'data', 'profile.json');
const notesDir = path.join(__dirname, 'data', 'notes');
const privateNotesFile = path.join(__dirname, 'data', 'private.json');

// Khởi tạo thư mục và file tự động nếu chưa có
if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir, { recursive: true });
}
if (!fs.existsSync(privateNotesFile)) {
    fs.writeFileSync(privateNotesFile, '[]', 'utf8');
}
if (!fs.existsSync(profilePath)) {
    fs.writeFileSync(profilePath, JSON.stringify({ displayName: "Sinh viên", theme: "light", password: "" }, null, 2), 'utf8');
}

const getFilePath = (topic) => path.join(notesDir, `${topic}.json`);

// ================= 1. API PROFILE (Đã bọc chống lỗi 500) =================
app.get('/api/profile', (req, res) => {
    try {
        if (!fs.existsSync(profilePath)) {
            return res.json({ displayName: "Sinh viên", theme: "light", password: "" });
        }
        const rawData = fs.readFileSync(profilePath, 'utf8');
        if (!rawData.trim()) {
            return res.json({ displayName: "Sinh viên", theme: "light", password: "" });
        }
        res.json(JSON.parse(rawData));
    } catch (error) {
        res.json({ displayName: "Sinh viên", theme: "light", password: "" });
    }
});

app.put('/api/profile', (req, res) => {
    try {
        const newProfile = req.body;
        fs.writeFileSync(profilePath, JSON.stringify(newProfile, null, 2), 'utf8');
        res.json({ success: true, message: "Đã cập nhật Profile" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi ghi file profile" });
    }
});

// ================= 2. API GHI CHÚ CÔNG KHAI (Đã bọc chống lỗi 500) =================
app.get('/api/notes/:topic', (req, res) => {
    const filePath = getFilePath(req.params.topic);
    try {
        if (!fs.existsSync(filePath)) return res.json([]);
        const data = fs.readFileSync(filePath, 'utf8');
        if (!data.trim()) return res.json([]);
        res.json(JSON.parse(data));
    } catch (error) {
        res.json([]); // Trả về mảng rỗng thay vì làm sập server
    }
});

app.post('/api/notes/:topic', (req, res) => {
    const filePath = getFilePath(req.params.topic);
    try {
        let notes = [];
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            if (fileData.trim()) {
                notes = JSON.parse(fileData);
            }
        }
        const newNote = {
            id: Date.now().toString(),
            title: req.body.title || "Không tiêu đề",
            content: req.body.content || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes.push(newNote);
        fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf8');
        res.json({ success: true, note: newNote });
    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm ghi chú" });
    }
});

app.put('/api/notes/:topic/:id', (req, res) => {
    const filePath = getFilePath(req.params.topic);
    try {
        let notes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const index = notes.findIndex(n => n.id === req.params.id);
        if (index !== -1) {
            notes[index].title = req.body.title;
            notes[index].content = req.body.content;
            notes[index].updatedAt = new Date().toISOString();
            fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf8');
            return res.json({ success: true, message: "Đã sửa thành công" });
        }
        res.status(404).json({ message: "Không tìm thấy ghi chú" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật ghi chú" });
    }
});

app.delete('/api/notes/:topic/:id', (req, res) => {
    const filePath = getFilePath(req.params.topic);
    try {
        let notes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const newNotes = notes.filter(n => n.id !== req.params.id);
        fs.writeFileSync(filePath, JSON.stringify(newNotes, null, 2), 'utf8');
        res.json({ success: true, message: "Đã xóa thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa ghi chú" });
    }
});

// ================= 3. API BẢO MẬT & GHI CHÚ RIÊNG TƯ =================
app.post('/api/private/auth', (req, res) => {
    try {
        if (!fs.existsSync(profilePath)) {
            return res.status(401).json({ success: false, message: "Chưa thiết lập mật khẩu!" });
        }
        const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
        if (profile.password === req.body.password) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: "Sai mật khẩu!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống xác thực" });
    }
});

app.get('/api/private/notes', (req, res) => {
    try {
        if (!fs.existsSync(privateNotesFile)) return res.json([]);
        const data = fs.readFileSync(privateNotesFile, 'utf8');
        if (!data.trim()) return res.json([]);
        res.json(JSON.parse(data));
    } catch (error) {
        res.json([]);
    }
});

app.post('/api/private/notes', (req, res) => {
    try {
        let notes = [];
        if (fs.existsSync(privateNotesFile)) {
            const fileData = fs.readFileSync(privateNotesFile, 'utf8');
            if (fileData.trim()) notes = JSON.parse(fileData);
        }
        const newNote = {
            id: Date.now().toString(),
            title: req.body.title || "Lưu bút mật",
            content: req.body.content || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes.push(newNote);
        fs.writeFileSync(privateNotesFile, JSON.stringify(notes, null, 2), 'utf8');
        res.json({ success: true, note: newNote });
    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm ghi chú kín" });
    }
});

app.put('/api/private/notes/:id', (req, res) => {
    try {
        let notes = JSON.parse(fs.readFileSync(privateNotesFile, 'utf8'));
        const index = notes.findIndex(n => n.id === req.params.id);
        if (index !== -1) {
            notes[index].title = req.body.title;
            notes[index].content = req.body.content;
            notes[index].updatedAt = new Date().toISOString();
            fs.writeFileSync(privateNotesFile, JSON.stringify(notes, null, 2), 'utf8');
            return res.json({ success: true, message: "Đã sửa thành công" });
        }
        res.status(404).json({ message: "Không tìm thấy ghi chú" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật ghi chú kín" });
    }
});

app.delete('/api/private/notes/:id', (req, res) => {
    try {
        let notes = JSON.parse(fs.readFileSync(privateNotesFile, 'utf8'));
        const newNotes = notes.filter(n => n.id !== req.params.id);
        fs.writeFileSync(privateNotesFile, JSON.stringify(newNotes, null, 2), 'utf8');
        res.json({ success: true, message: "Đã xóa thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa ghi chú kín" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend chạy tại http://localhost:${PORT}`));