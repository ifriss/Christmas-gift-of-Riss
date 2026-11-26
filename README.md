# 🎄 Christmas gift of Riss

Ứng dụng web tương tác chủ đề Giáng Sinh với cây thông Noel 3D ASCII, máy đĩa than Hi-Fi, hộp thư lời chúc trực tuyến và trợ lý ông già Noel AI. Dự án chạy trực tiếp trên **GitHub Pages** kết hợp **Google Apps Script** làm backend API.

---

## ✨ Tính năng nổi bật

- **Cây thông Noel 3D ASCII:** Render thời gian thực trên Canvas với nhiều hiệu ứng xuất hiện (*Dâng lên, Xoắn ốc, Quét ngang, Nở hoa*), đèn nhấp nháy, quả châu, hộp quà, tuyết rơi, cực quang, pháo hoa và ông già Noel.
- **Máy đĩa than Hi-Fi:**
  - Tích hợp sẵn 3 bản nhạc hộp nhạc (dựng sóng âm WAV trực tiếp bằng Web Audio API) cùng danh sách nhạc MP3 tự host.
  - Đầy đủ tính năng: phát/tạm dừng, tua nhạc, chỉnh âm lượng, hẹn giờ tắt nhạc, tìm kiếm bài hát, lặp 1 bài / cả danh sách, phát ngẫu nhiên và gửi đề xuất bài hát mới.
- **Hộp thư Giáng Sinh & Tương tác xã hội:**
  - Hỗ trợ chế độ Khách truy cập hoặc Đăng ký / Đăng nhập tài khoản thành viên (tự động gợi ý nhận lại lời chúc cũ).
  - Gửi lời chúc theo chủ đề (*Lời chúc, Đòi quà Riss, Tâm sự*), phản hồi (reply), ghim lời chúc nổi bật và thả cảm xúc cộng dồn đa biểu cảm.
- **Ông già Noel & Hỏi đáp AI:** Bóng nói ngẫu nhiên từ ông già Noel và khung chat hỏi đáp trực tiếp tích hợp Groq AI.
- **Tiện ích & Đa ngôn ngữ:** Đồng hồ đếm ngược Giáng Sinh theo múi giờ Việt Nam (GMT+7), bảng thông báo từ DEV và hỗ trợ chuyển đổi nhanh 3 ngôn ngữ (**Tiếng Việt**, **English**, **中文**).

---

## 📂 Cấu trúc thư mục

```text
christmas-gift-of-riss/
├── index.html                  # Khung trang chính (nạp CSS và JS theo thứ tự)
├── add-song.html               # Trang công cụ DEV: tải lên, sắp xếp, thay thế và xóa nhạc MP3
├── npc1.html                   # Cổng quản trị DEV: chỉnh sửa câu thoại và dữ liệu Hỏi đáp của Santa
├── README.md                   # Tài liệu giới thiệu dự án
│
├── css/                        # Giao diện tách module theo từng thành phần
│   ├── base.css                # Biến màu, canvas, HUD thông số, chữ ký DEV
│   ├── top-tools.css           # Cụm nút chức năng góc trên và hộp đếm ngược
│   ├── mailbox.css             # Hộp thông báo DEV, hộp thư, lời chúc, reactions
│   ├── auth.css                # Modal Khách / Đăng nhập / Đăng ký / Hồ sơ
│   ├── turntable.css           # Giao diện máy đĩa than và bảng danh sách nhạc
│   ├── responsive.css          # Tối ưu bố cục cho thiết bị di động (≤ 640px)
│   ├── control-panel.css       # Nút và bảng điều khiển hiệu ứng cây thông
│   ├── spaces/space1.css       # Bóng nói ông già Noel và khung Hỏi đáp AI
│   ├── marquee.css             # Hiệu ứng chữ chạy cho tiêu đề dài
│   ├── turntable-controls.css  # Thanh tua nhạc, âm lượng, hẹn giờ tắt nhạc
│   └── touch-inputs.css        # Chống tự động zoom ô nhập liệu trên thiết bị cảm ứng
│
├── js/                         # Logic xử lý chia theo nhóm chức năng
│   ├── core/
│   │   ├── i18n-marquee.js     # Chuỗi đa ngôn ngữ bổ sung và xử lý chữ chạy
│   │   └── social.js           # Quản lý I18N, xác thực tài khoản, đếm ngược, thông báo, Bảng tin
│   ├── music/
│   │   ├── player.js           # Engine phát nhạc LofiXmas, dựng WAV hộp nhạc, Media Session
│   │   └── turntable.js        # Vẽ đĩa than xoay, quản lý danh sách phát và duyệt đề xuất nhạc
│   ├── scene/
│   │   └── scene.js            # Engine render cây thông 3D ASCII, tuyết, pháo hoa, Santa
│   └── ui/
│       ├── control-panel.js    # Bảng điều khiển hiệu ứng, tua/âm lượng/hẹn giờ, bóng nói Santa
│       └── mobile-viewport.js  # Khôi phục tỷ lệ hiển thị sau khi đóng bàn phím trên mobile
│
├── data/
│   └── songs.js                # Mảng dữ liệu danh sách bài hát (SONGS)
│
└── music/                      # Thư mục lưu trữ các tệp âm thanh .mp3
```

---

## 👨‍💻 Tác giả

- **DEV:** RISS — Trương Thành Thông
- Chúc mọi người một mùa Giáng Sinh an lành và ấm áp! 🎄
