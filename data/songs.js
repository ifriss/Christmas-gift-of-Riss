/* =====================================================================
   DỮ LIỆU NHẠC — Code.gs (songs_add / songs_remove / songs_reorder / songs_commit /
   songs_replace_commit) tự đọc & ghi file này bằng regex trên khai báo SONGS.
   => GIỮ NGUYÊN cú pháp khai báo bên dưới và dấu đóng mảng; không thêm mảng khác
      có dòng kết thúc giống vậy trong file này.
   - 3 bài đầu (type: 'bell') là hộp nhạc tích hợp, cố định, không bị sắp xếp lại.
   - Các bài mp3: { id: 'mp3_xxx', name, type: 'audio', src: 'music/....mp3' }
   ===================================================================== */
      const SONGS = [
        {
          id: 'jingle',
          name: 'Jingle Bells (Lofi)',
          type: 'bell',
          color: '#ffd36b',
          beatSec: 0.34,
          seq: [
            { chord: [174.61, 220.00, 261.63, 329.63], mel: [659.25, null, 659.25, 659.25] },
            { chord: [196.00, 246.94, 293.66, 349.23], mel: [659.25, null, 659.25, 659.25] },
            { chord: [164.81, 196.00, 246.94, 293.66], mel: [659.25, 783.99, 523.25, 587.33] },
            { chord: [220.00, 261.63, 329.63, 392.00], mel: [659.25, null, null, null] },
            { chord: [146.83, 174.61, 220.00, 261.63], mel: [698.46, 698.46, 698.46, 698.46] },
            { chord: [196.00, 246.94, 293.66, 349.23], mel: [698.46, 659.25, 659.25, 659.25] },
            { chord: [130.81, 196.00, 246.94, 293.66], mel: [587.33, 587.33, 659.25, 587.33] },
            { chord: [130.81, 196.00, 233.08, 293.66], mel: [783.99, null, 659.25, 523.25] }
          ]
        },
        {
          id: 'wewish',
          name: 'We Wish You (Lofi)',
          type: 'bell',
          color: '#ff5c7c',
          beatSec: 0.36,
          seq: [
            { chord: [130.81, 164.81, 196.00, 246.94], mel: [392.00, 523.25, 587.33, 523.25] },
            { chord: [174.61, 220.00, 261.63, 329.63], mel: [493.88, 440.00, 440.00, 440.00] },
            { chord: [146.83, 174.61, 220.00, 261.63], mel: [587.33, 659.25, 587.33, 523.25] },
            { chord: [196.00, 246.94, 293.66, 349.23], mel: [493.88, 392.00, 392.00, null] },
            { chord: [164.81, 196.00, 246.94, 293.66], mel: [659.25, 698.46, 659.25, 587.33] },
            { chord: [220.00, 261.63, 329.63, 392.00], mel: [523.25, 440.00, 392.00, 392.00] },
            { chord: [146.83, 174.61, 220.00, 261.63], mel: [440.00, 587.33, 493.88, 523.25] },
            { chord: [130.81, 164.81, 196.00, 246.94], mel: [523.25, null, null, null] }
          ]
        },
        {
          id: 'silent',
          name: 'Silent Night (Lofi)',
          type: 'bell',
          color: '#52f0ff',
          beatSec: 0.42,
          seq: [
            { chord: [130.81, 196.00, 246.94, 329.63], mel: [392.00, 440.00, 392.00, 329.63] },
            { chord: [130.81, 196.00, 246.94, 329.63], mel: [392.00, 440.00, 392.00, 329.63] },
            { chord: [196.00, 246.94, 293.66, 349.23], mel: [587.33, null, 587.33, 493.88] },
            { chord: [130.81, 164.81, 196.00, 246.94], mel: [523.25, null, 523.25, 392.00] },
            { chord: [174.61, 220.00, 261.63, 329.63], mel: [440.00, null, 440.00, 523.25] },
            { chord: [164.81, 196.00, 246.94, 293.66], mel: [493.88, 440.00, 392.00, 440.00] },
            { chord: [196.00, 246.94, 293.66, 349.23], mel: [587.33, 698.46, 587.33, 493.88] },
            { chord: [130.81, 164.81, 196.00, 246.94], mel: [523.25, 659.25, 523.25, null] }
          ]
        },
        {
          id: 'mp3_mwrsry23',
          name: 'Làm Sao Để Em Tựa Vào',
          type: 'audio',
          src: 'music/lam-sao-de-em-tua-vao-mwugbtmr.mp3'
        },
        {
          id: 'mp3_mwswjs6u',
          name: 'XE ĐẠP [Lofi Ver]',
          type: 'audio',
          src: 'music/xe-dap-lofi-ver-mwswjs6u.mp3'
        },
        {
          id: 'mp3_mwrt0f8l',
          name: 'ikigai',
          type: 'audio',
          src: 'music/ikigai-mwrt0f8l.mp3'
        },
        {
          id: 'mp3_mwvzxh41',
          name: "Em Là Ai Trong Đôi Mắt Anh",
          type: 'audio',
          src: 'music/em-la-ai-trong-doi-mat-anh-mwvzxh41.mp3'
        },
        {
          id: 'mp3_mwue1sbi',
          name: "TANCA",
          type: 'audio',
          src: 'music/tanca-mwue1sbi.mp3'
        },
        {
          id: 'mp3_mwrte90i',
          name: 'Time Machine',
          type: 'audio',
          src: 'music/time-machine-mwrte90i.mp3'
        },
        {
          id: 'mp3_mwrtnzvx',
          name: 'Heather',
          type: 'audio',
          src: 'music/heather-mwrtnzvx.mp3'
        },
        {
          id: 'mp3_mwrtyjd8',
          name: 'Em không thể',
          type: 'audio',
          src: 'music/em-khong-the-mwrtyjd8.mp3'
        },
        {
          id: 'mp3_mwru3smx',
          name: '12345 X TIMEM X XINLOIVIDAXUATHIEN',
          type: 'audio',
          src: 'music/12345-x-timem-x-xinloividaxuathien-mwru3smx.mp3'
        },
        {
          id: 'mp3_mwrubphh',
          name: '[DRILL] Thương nhau đến thế',
          type: 'audio',
          src: 'music/drill-thuong-nhau-den-the-mwrubphh.mp3'
        },
        {
          id: 'mp3_mwrum0un',
          name: 'Only',
          type: 'audio',
          src: 'music/only-mwrum0un.mp3'
        },
        {
          id: 'mp3_mwrv06n5',
          name: 'VẾT THƯƠNG',
          type: 'audio',
          src: 'music/vet-thuong-mwrv06n5.mp3'
        },
        {
          id: 'mp3_mwrv5rum',
          name: 'dự báo thời tiết hôm nay mưa',
          type: 'audio',
          src: 'music/du-bao-thoi-tiet-hom-nay-mua-mwrv5rum.mp3'
        },
        {
          id: 'mp3_mwrvkk4n',
          name: 'Tìm Em [Lời Trung]',
          type: 'audio',
          src: 'music/tim-em-loi-trung-mwrvkk4n.mp3'
        },
        {
          id: 'mp3_mwrxouwx',
          name: 'Tìm Em',
          type: 'audio',
          src: 'music/tim-em-mwrxouwx.mp3'
        },
        {
          id: 'mp3_mwrzen8m',
          name: 'Thêm Bao Nhiêu Lâu',
          type: 'audio',
          src: 'music/them-bao-nhieu-lau-mwrzen8m.mp3'
        },
        {
          id: 'mp3_mwrzxhcn',
          name: 'Sóng Gió',
          type: 'audio',
          src: 'music/song-gio-mwrzxhcn.mp3'
        },
        {
          id: 'mp3_mws086ty',
          name: 'Em Khác Gì Hoa',
          type: 'audio',
          src: 'music/em-khac-gi-hoa-mws086ty.mp3'
        },
        {
          id: 'mp3_mws0c462',
          name: 'Chạm Đáy Nỗi Đau',
          type: 'audio',
          src: 'music/cham-day-noi-dau-mws0c462.mp3'
        },
        {
          id: 'mp3_mws0k5ku',
          name: 'Một Bước Yêu, Vạn Dặm Đau',
          type: 'audio',
          src: 'music/mot-buoc-yeu-van-dam-dau-mws0k5ku.mp3'
        },
        {
          id: 'mp3_mws6edpz',
          name: 'Tình Cờ Yêu Em',
          type: 'audio',
          src: 'music/tinh-co-yeu-em-mws6edpz.mp3'
        },
        {
          id: 'mp3_mws6f9rx',
          name: 'TAY NẮM TAY \'DRILL\'',
          type: 'audio',
          src: 'music/tay-nam-tay-drill-mws6f9rx.mp3'
        },
        {
          id: 'mp3_mws6giy7',
          name: 'Trước Khi Em Tồn Tại [Piano]',
          type: 'audio',
          src: 'music/truoc-khi-em-ton-tai-piano-mws6giy7.mp3'
        },
        {
          id: 'mp3_mws6iwuh',
          name: 'Chàng Trai Bất Tử',
          type: 'audio',
          src: 'music/chang-trai-bat-tu-mws6iwuh.mp3'
        },
        {
          id: 'mp3_mwsvxirf',
          name: 'Ngày Em Đẹp Nhất',
          type: 'audio',
          src: 'music/ngay-em-dep-nhat-mwsvxirf.mp3'
        },
        {
          id: 'mp3_mwswbb5x',
          name: 'Người Dưng',
          type: 'audio',
          src: 'music/nguoi-dung-mwswbb5x.mp3'
        },
        {
          id: 'mp3_mwswdan2',
          name: 'Ngày Rời Chuyến Bay',
          type: 'audio',
          src: 'music/ngay-roi-chuyen-bay-mwswdan2.mp3'
        },
        {
          id: 'mp3_mwtkt9h1',
          name: "Than Thân",
          type: 'audio',
          src: 'music/than-than-mwtkt9h1.mp3'
        },
        {
          id: 'mp3_mwtkumnv',
          name: "Chúng Ta Rồi Sẽ Hạnh Phúc",
          type: 'audio',
          src: 'music/chung-ta-roi-se-hanh-phuc-mwtkumnv.mp3'
        },
        {
          id: 'mp3_mwtl5rd0',
          name: "Đóm Đóm",
          type: 'audio',
          src: 'music/dom-dom-mwtl5rd0.mp3'
        },
        {
          id: 'mp3_mwxdskyq',
          name: "Lựa Chọn Của Em",
          type: 'audio',
          src: 'music/lua-chon-cua-em-mwxdskyq.mp3'
        },
        {
          id: 'mp3_mwz3pq3m',
          name: "Dưới Tán Cây Khô Hoa Nở",
          type: 'audio',
          src: 'music/duoi-tan-cay-kho-hoa-no-mwz3pq3m.mp3'
        },
        {
          id: 'mp3_mwz3qvgq',
          name: "MRT",
          type: 'audio',
          src: 'music/mrt-mwz3qvgq.mp3'
        },
        {
          id: 'mp3_mwz44kzn',
          name: "Beautiful In White",
          type: 'audio',
          src: 'music/beautiful-in-white-mwz44kzn.mp3'
        }
      ];
