# Bật bảng xếp hạng WordGlow bằng Google Sheets

Làm trên máy tính, khoảng 5 phút. Điểm của học sinh sẽ được lưu vào Google Sheet của chính bạn.

## 1. Tạo Google Sheet
1. Mở https://sheets.new (đăng nhập tài khoản Google của bạn).
2. Đặt tên bảng tính, ví dụ **WordGlow - Bảng xếp hạng**.

## 2. Dán mã
1. Trên thanh menu, chọn **Tiện ích mở rộng → Apps Script** (Extensions → Apps Script).
2. Xóa hết đoạn mã có sẵn, dán toàn bộ nội dung file **Code.gs** vào.
3. Bấm biểu tượng **Lưu** (hình đĩa mềm). Đặt tên dự án là **WordGlow**.

## 3. Triển khai thành Web app
1. Bấm nút xanh **Triển khai → Tùy chọn triển khai mới** (Deploy → New deployment).
2. Bấm biểu tượng bánh răng cạnh "Chọn loại", chọn **Ứng dụng web** (Web app).
3. Điền:
   - **Thực thi dưới dạng (Execute as):** Tôi (Me)
   - **Người có quyền truy cập (Who has access):** Bất kỳ ai (Anyone)
4. Bấm **Triển khai**, rồi **Ủy quyền truy cập** và chọn tài khoản Google của bạn.
5. Nếu thấy cảnh báo "Google chưa xác minh ứng dụng này": bấm **Nâng cao → Đi tới WordGlow (không an toàn) → Cho phép**. Cảnh báo này xuất hiện vì đây là mã bạn tự tạo, chỉ chạy trong tài khoản của bạn.
6. Sao chép **URL ứng dụng web** (link kết thúc bằng `/exec`) và gửi cho Claude. Claude sẽ gắn link vào app.

## 4. Xem và tổng kết điểm
- Tab **Điểm**: mỗi lần học sinh làm Kiểm tra hoặc chơi game xong sẽ thêm một dòng (tên, bài, trò chơi, điểm).
- Tải lại trang Google Sheet sẽ thấy menu **WordGlow** trên thanh menu:
  - **Cập nhật bảng xếp hạng**: ghi bảng tổng điểm hiện tại vào tab **Xếp hạng**.
  - **Tổng kết đợt này và bắt đầu đợt mới**: lưu bảng xếp hạng thành một tab riêng có ngày giờ (ví dụ "Tổng kết 30-11-2026 08.00"), chuyển điểm cũ sang tab **Lưu trữ**, và bảng xếp hạng trong app bắt đầu lại từ 0.
- Học sinh xem bảng xếp hạng trong app bằng nút **Bảng xếp hạng** ở trên cùng.

## Lưu ý
- Học sinh được cộng điểm theo **tên đã nhập**, nên dặn các bạn gõ tên giống nhau mỗi lần, ví dụ "Minh Anh - 7A". Viết hoa hay viết thường đều được tính là cùng một người.
- Đây là bảng điểm cho lớp học, không có mật khẩu. Một bạn rành máy tính có thể gửi điểm giả. Nếu thấy dòng lạ trong tab Điểm, bạn chỉ cần xóa dòng đó.
