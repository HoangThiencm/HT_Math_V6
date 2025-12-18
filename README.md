# HT_MATH_WEB V6 - Frontend

🌐 **Live Demo:** [https://ht-math-v6.vercel.app](https://ht-math-v6.vercel.app)

Frontend web application cho HT_MATH_WEB - Chuyển đổi PDF/Ảnh sang Markdown với LaTeX.

**Tác giả:** Hoàng Tấn Thiên

## ✨ Tính năng

- ✅ Chuyển đổi PDF/ảnh sang Markdown với LaTeX
- ✅ Hỗ trợ nhiều model Gemini (gemini-1.5-flash, gemini-1.5-pro)
- ✅ User registration và authentication
- ✅ Upload file, dán ảnh từ clipboard
- ✅ Export Word, copy text
- ✅ Giao diện đẹp, responsive

## 🚀 Sử dụng

1. Truy cập [https://ht-math-v6.vercel.app](https://ht-math-v6.vercel.app)
2. Đăng ký tài khoản mới hoặc đăng nhập
3. Chọn file PDF hoặc ảnh
4. Chọn model và chế độ chuyển đổi (LaTeX hoặc văn bản thuần)
5. Nhấn "Thực hiện" để bắt đầu chuyển đổi

## ⚙️ Cấu hình

### API Endpoint

Backend API mặc định: `https://hoangthiencm-ht-math-web-backend.hf.space`

Bạn có thể thay đổi API endpoint:
- **Trong giao diện web:** Nhấn nút "⚙️ Cấu hình"
- **Trong code:** Chỉnh sửa `app.js`:
  ```javascript
  const DEFAULT_API_ENDPOINT = 'https://your-backend.hf.space';
  ```

## 📁 Cấu trúc

```
.
├── index.html      # Main HTML file
├── styles.css      # CSS styles
├── app.js          # JavaScript logic
├── package.json    # Package configuration
└── vercel.json     # Vercel deployment config
```

## 📦 Deploy

### Vercel (Khuyên dùng)

1. Fork hoặc clone repository này
2. Import vào [Vercel](https://vercel.com)
3. Deploy tự động

Hoặc dùng Vercel CLI:
```bash
npm i -g vercel
vercel
```

## 🔗 Liên kết

- **Backend API:** [Hugging Face Spaces](https://huggingface.co/spaces/hoangthiencm/ht-math-web-backend)
- **Frontend:** [Vercel](https://ht-math-v6.vercel.app)

## 📋 Yêu cầu

- Backend API đang chạy trên Hugging Face Spaces
- Supabase database đã được setup (cho authentication)

## 📝 License

Copyright © Hoàng Tấn Thiên

## 💬 Liên hệ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub.
