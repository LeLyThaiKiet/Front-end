const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const profilePath = path.join(__dirname, 'data', 'profile.json');
const notesDir = path.join(__dirname, 'data', 'notes');
const privateDir = path.join(__dirname, 'data', 'private_notes');

if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir, { recursive: true });
}
if (!fs.existsSync(privateDir)) {
    fs.mkdirSync(privateDir, { recursive: true });
}

const defaultProfile = {
    theme: "light",
    primaryColor: "#2563eb",
    categories: ["hoc-tap", "cong-viec", "ca-nhan"],
    accounts: {
        "admin": "123456",
        "sinhvien1": "123"
    }
};

if (!fs.existsSync(profilePath)) {
    fs.writeFileSync(profilePath, JSON.stringify(defaultProfile, null, 2), 'utf8');
}

const getFilePath = (topic) => path.join(notesDir, `${topic}.json`);
const getPrivateFilePath = (username) => {
    const safeName = (username || 'admin').replace(/[^a-zA-Z0-9-_]/g, '_');
    return path.join(privateDir, `${safeName}.json`);
};

// ================= 1. API PROFILE =================
app.get('/api/profile', (req, res) => {
    try {
        if (!fs.existsSync(profilePath)) return res.json(defaultProfile);
        const rawData = fs.readFileSync(profilePath, 'utf8');
        if (!rawData.trim()) return res.json(defaultProfile);
        res.json(JSON.parse(rawData));
    } catch (error) {
        res.json(defaultProfile);
    }
});

app.put('/api/profile', (req, res) => {
    try {
        const newProfile = req.body;
        fs.writeFileSync(profilePath, JSON.stringify(newProfile, null, 2), 'utf8');
        res.json({ success: true, message: "Đã cập nhật Profile thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi ghi file profile" });
    }
});

// ================= 2. API GHI CHÚ CÔNG KHAI (CRUD) =================
app.get('/api/notes/:topic', (req, res) => {
    const filePath = getFilePath(req.params.topic);
    try {
        if (!fs.existsSync(filePath)) return res.json([]);
        const data = fs.readFileSync(filePath, 'utf8');
        if (!data.trim()) return res.json([]);
        res.json(JSON.parse(data));
    } catch (error) {
        res.json([]);
    }
});

app.post('/api/notes/:topic', (req, res) => {
    const filePath = getFilePath(req.params.topic);
    try {
        let notes = [];
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            if (fileData.trim()) notes = JSON.parse(fileData);
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

// ================= 3. API XÁC THỰC VÙNG RIÊNG TƯ =================
app.post('/api/private/auth', (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập tài khoản và mật khẩu!" });
        }

        const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
        const accounts = profile.accounts || {};

        const cleanInputUser = String(username).trim().toLowerCase();
        const cleanInputPass = String(password).trim();

        // Tìm kiếm tài khoản không phân biệt chữ hoa/thường
        const foundKey = Object.keys(accounts).find(
            acc => acc.trim().toLowerCase() === cleanInputUser
        );

        if (foundKey && String(accounts[foundKey]).trim() === cleanInputPass) {
            return res.json({ success: true, username: foundKey });
        } else {
            return res.status(401).json({ success: false, message: "Sai mật khẩu hoặc tài khoản không tồn tại!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống xác thực" });
    }
});

app.get('/api/private/notes/:username', (req, res) => {
    const filePath = getPrivateFilePath(req.params.username);
    try {
        if (!fs.existsSync(filePath)) return res.json([]);
        const data = fs.readFileSync(filePath, 'utf8');
        if (!data.trim()) return res.json([]);
        res.json(JSON.parse(data));
    } catch (error) {
        res.json([]);
    }
});

app.post('/api/private/notes/:username', (req, res) => {
    const filePath = getPrivateFilePath(req.params.username);
    try {
        let notes = [];
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
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
        fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf8');
        res.json({ success: true, note: newNote });
    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm ghi chú kín" });
    }
});

app.put('/api/private/notes/:username/:id', (req, res) => {
    const filePath = getPrivateFilePath(req.params.username);
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
        res.status(500).json({ message: "Lỗi cập nhật ghi chú kín" });
    }
});

app.delete('/api/private/notes/:username/:id', (req, res) => {
    const filePath = getPrivateFilePath(req.params.username);
    try {
        let notes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const newNotes = notes.filter(n => n.id !== req.params.id);
        fs.writeFileSync(filePath, JSON.stringify(newNotes, null, 2), 'utf8');
        res.json({ success: true, message: "Đã xóa thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa ghi chú kín" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend chạy tại http://localhost:${PORT}`));