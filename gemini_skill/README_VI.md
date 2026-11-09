# Tử Vi Đẩu Số Research — Gemini Edition

Bộ hướng dẫn đã được tinh gọn để đưa vào một **Gem / trợ lý Gemini** chuyên nghiên cứu và luận giải Tử Vi Đẩu Số Việt Nam.

## 1. Bộ này gồm gì?
- `GEMINI_INSTRUCTIONS.md`: nội dung chính để dán vào ô Instructions của Gem.
- `SKILL.md`: quy trình vận hành dạng Agent Skill.
- `references/`: tài liệu tham chiếu theo từng tác vụ, không cần nạp tất cả vào mọi lượt.
- `templates/`: mẫu chuẩn hóa lá số, ma trận chứng cứ và báo cáo.
- `examples/`: ví dụ yêu cầu mẫu.
- `LICENSE`: giấy phép MIT của dự án nguồn và ghi nhận tác giả.

## 2. Cách dùng với Gemini (khuyến nghị)
1. Giải nén file ZIP.
2. Mở Gemini và tạo một Gem mới (hoặc mở Gem đang dùng).
3. Đặt tên, ví dụ: **Tử Vi Đẩu Số — Research Assistant**.
4. Mở `GEMINI_INSTRUCTIONS.md`, sao chép toàn bộ nội dung vào phần hướng dẫn (Instructions) của Gem.
5. Tải các file trong `references/` và `templates/` vào phần Knowledge/Files của Gem nếu giao diện tài khoản hỗ trợ tải tệp.
6. Bắt đầu bằng yêu cầu `INGEST` để chép và khóa dữ liệu lá số trước khi luận.

> Lưu ý: Gemini không tự động cài một thư mục Agent Skill theo chuẩn Claude Code. Với Gemini Gem, cách tương thích nhất là dùng `GEMINI_INSTRUCTIONS.md` làm chỉ dẫn hệ thống của Gem và đưa các tài liệu tham chiếu vào Knowledge. Tên nút/giao diện có thể thay đổi theo phiên bản Gemini.

## 3. Cách gọi nhanh
- `INGEST`: Chép dữ liệu 12 cung từ ảnh/PDF, chưa luận.
- `CORE`: Luận cấu trúc Mệnh–Thân–Cục.
- `TOPIC`: Luận một chủ đề như công việc, tài chính, hôn nhân.
- `TIMING`: Luận đại vận, tiểu hạn, lưu niên.
- `RECTIFY`: So sánh các giả thuyết giờ sinh.
- `SOURCE_COMPARE`: So sánh sách/trường phái.
- `CRITIQUE`: Phản biện bản luận.
- `VALIDATE_CASE`: Nghiệm lý ca đã khóa dự đoán.

Ví dụ: `Dùng chế độ INGEST. Hãy chép đủ 12 cung từ ảnh lá số, đánh dấu chỗ không chắc và tuyệt đối chưa luận.`

## 4. Quy trình khuyến nghị cho dự án Tử Vi của bạn
- Bước 1: dùng công cụ lập lá số / dữ liệu đầu vào làm nguồn dữ kiện gốc.
- Bước 2: Gemini chỉ chuẩn hóa, kiểm tra và diễn giải; không tự ý thay đổi dữ kiện an sao.
- Bước 3: lưu bản JSON đã xác nhận làm hồ sơ chuẩn.
- Bước 4: mỗi lần luận, chỉ đưa vào phạm vi dữ liệu và tài liệu tham chiếu liên quan.
- Bước 5: lưu cả kết luận sai/không khớp khi nghiệm lý, không sửa ngược dự đoán cũ.

## 5. Phạm vi và giới hạn
Đây là công cụ nghiên cứu một hệ thống diễn giải truyền thống, không phải công cụ khoa học dự đoán tương lai đã được xác nhận. Không dùng kết quả thay thế tư vấn y tế, pháp lý, tài chính hoặc quyết định quan trọng. Không khẳng định chắc chắn tai họa, bệnh nặng, ngày chết, ly hôn, ngoại tình, phá sản hay phạm pháp.

## 6. Nguồn và ghi nhận
Bản đóng gói này được biên soạn/tinh gọn để tương thích cách dùng Gemini từ repository:
https://github.com/duandigi/tu-vi-dau-so-research

Tác giả dự án nguồn: Duan Digi. Repository công bố giấy phép MIT. Đây là bản chuyển thể hướng dẫn sử dụng; không phải bản phát hành chính thức của tác giả repository.
