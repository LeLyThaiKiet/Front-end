# HỆ THỐNG QUẢN LÝ GHI CHÚ VÀ THÔNG TIN RIÊNG TƯ

Ứng dụng web quản lý ghi chú hiện đại được xây dựng theo mô hình Full-stack sử dụng ReactJS cho phía giao diện (Frontend) và Node.js/Express cho phía máy chủ (Backend). Hệ thống hỗ trợ lưu trữ cục bộ qua file JSON, quản lý danh mục linh hoạt, tùy chỉnh giao diện (Sáng/Tối, Màu chủ đạo) và phân tách độc lập giữa kho ghi chú công khai và Vùng riêng tư (Private Notes) được bảo mật bằng tài khoản mật khẩu.

---
**Giảng viên hướng dẫn:** Nguyễn Hoàng Việt  
  

### 👥 Thành viên thực hiện:
1. **Lê Minh Tài** - MSSV: 0306241145
   - **Vai trò:** Project Manager (PM), Frontend Lead & QA/Tester
   - **Mức độ đóng góp:** 100%
2. **Lê Lý Thái Kiệt** - MSSV: 0306241122
   - **Vai trò:** Backend Architect & Data Engineer
   - **Mức độ đóng góp:** 100
---
## 💻 Yêu Cầu Hệ Thống
- Cần cài đặt **Node.js** phiên bản 16+ trở lên.

---

## 🚀 Các Tính Năng Nổi Bật

1. **Quản lý Ghi chú Công khai (Public Notes):**
   - Phân loại ghi chú theo các danh mục động (Học tập, Công việc, Cá nhân,...).
   - Thêm, sửa, xóa và tìm kiếm ghi chú trực quan, nhanh chóng.

2. **Vùng Riêng Tư Bảo Mật (Private Notes):**
   - Đăng nhập bảo mật thông qua hệ thống tài khoản riêng biệt.
   - Kho lưu trữ ghi chú mã hóa/tách biệt riêng cho từng tài khoản (`/backend/data/private_notes/`).
   - Tự động chuẩn hóa tài khoản (không phân biệt chữ hoa/thường) giúp thao tác đăng nhập luôn mượt mà.

3. **Trình Soạn Thảo Văn Bản Phong Phú (Rich-Text Editor):**
   - Hỗ trợ định dạng văn bản trực tiếp (In đậm **B**, In nghiêng *I*, Gạch chân <u>U</u>, Tạo danh sách chấm).

4. **Trang Cài Đặt Hệ Thống (Settings):**
   - Đổi giao diện linh hoạt giữa chế độ **Sáng (Light)** và **Tối (Dark)**.
   - Tùy chỉnh màu sắc chủ đạo (`Primary Color`) của ứng dụng bằng bộ chọn màu.
   - Đăng ký tài khoản Vùng riêng tư mới trực tiếp qua giao diện cài đặt.
   - Thêm mới hoặc xóa các danh mục ghi chú theo nhu cầu.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:**
  - ReactJS, React Router
  - CSS Variables & Dynamic Themes (Hỗ trợ thay đổi màu sắc và chế độ sáng/tối linh hoạt)
- **Backend:**
  - Node.js, ExpressJS
  - CORS middleware xử lý kết nối API
- **Lưu trữ dữ liệu:**
  - Local File System Persistence thông qua các file `.json` tại thư mục `/backend/data/`.

---

## ⚙️ Hướng Dẫn Cài Đặt và Chạy Ứng Dụng

### 1. Cài đặt và chạy Backend
Mở Terminal tại thư mục gốc của dự án và chạy các lệnh sau:
```bash
cd backend
npm install
npm start
```
*(Nếu chưa cấu hình script `start` trong `package.json`, bạn có thể chạy bằng lệnh `node server.js`)*
- **Địa chỉ kết nối Backend:** `http://localhost:5000`

### 2. Cài đặt và chạy Frontend
Mở một cửa sổ Terminal mới tại thư mục gốc của dự án và chạy các lệnh sau:
```bash
cd frontend
npm install
npm run dev
```
*(Hoặc dùng lệnh `npm start` tùy thuộc theo thiết lập dự án)*
- **Địa chỉ truy cập Frontend:** `http://localhost:5173` (hoặc `http://localhost:3000`)

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
project-root/
│
├── backend/
│   ├── data/
│   │   ├── notes/             # Lưu trữ file JSON ghi chú công khai theo danh mục
│   │   ├── private_notes/     # Lưu trữ file JSON ghi chú riêng tư theo tài khoản
│   │   └── profile.json       # Lưu cấu hình hệ thống (theme, color, categories, accounts)
│   ├── server.js              # File cấu hình chính của Express Server & API endpoints
│   └── package.json           # Các thư viện dependencies của backend
│
└── frontend/
    ├── src/
    │   ├── App.jsx            # Component điều hướng chính và quản lý state toàn cục
    │   ├── Settings.jsx       # Trang cài đặt hệ thống & đăng ký tài khoản vùng riêng tư
    │   ├── PrivateNotes.jsx   # Trang đăng nhập và quản lý kho ghi chú cá nhân bảo mật
    │   ├── main.jsx           # Điểm khởi chạy ứng dụng React
    │   └── index.css          # Định nghĩa các biến CSS, giao diện sáng/tối và class chung
    └── package.json           # Các thư viện dependencies của frontend
```

---

## 📝 Thông Tin API Backend Chính

- **`GET /api/profile`**: Lấy thông tin cài đặt chung (theme, màu sắc, danh mục, danh sách tài khoản).
- **`PUT /api/profile`**: Cập nhật thông tin cấu hình profile hoặc đăng ký tài khoản mới.
- **`GET /api/notes/:topic`**: Lấy danh sách ghi chú công khai theo danh mục.
- **`POST /api/notes/:topic`**: Tạo ghi chú công khai mới.
- **`PUT /api/notes/:topic/:id`**: Cập nhật ghi chú công khai.
- **`DELETE /api/notes/:topic/:id`**: Xóa ghi chú công khai.
- **`POST /api/private/auth`**: Xác thực đăng nhập tài khoản Vùng riêng tư.
- **`GET /api/private/notes/:username`**: Lấy danh sách ghi chú riêng tư của tài khoản.
- **`POST /api/private/notes/:username`**: Thêm ghi chú riêng tư mới.
- **`PUT /api/private/notes/:username/:id`**: Cập nhật ghi chú riêng tư.
- **`DELETE /api/private/notes/:username/:id`**: Xóa ghi chú riêng tư.

---

## 📌 Ghi Chú Thêm
> **Hệ thống sử dụng file JSON để lưu dữ liệu tại thư mục `backend/data`, vui lòng không xóa thư mục này.**