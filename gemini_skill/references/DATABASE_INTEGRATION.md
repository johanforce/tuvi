# Dùng kho luận giải của ứng dụng

## Vai trò của kho

`src/data/ziwei-interpretation-db.json` là tập hợp diễn giải do dự án biên soạn. Đây là nguồn hỗ trợ nhất quán cách đọc trong ứng dụng, không phải dữ kiện của một lá số, không phải nghiên cứu thực nghiệm và không mặc nhiên là quy tắc được cổ thư xác nhận. Hãy giữ riêng ba lớp: vị trí lá số; quy tắc biên soạn trong kho; suy luận nối các dữ kiện.

Các trường `sources` mô tả nguồn gốc và giới hạn. Chỉ gọi một luận điểm là quy tắc cổ thư khi mục đó có nguồn cụ thể phù hợp; không suy rộng vai trò của một nguồn sang toàn database.

## Cách chọn mục áp dụng

1. Xác định chủ đề từ `topics` và danh sách cung liên quan. Nếu đang luận vận, dùng đúng vận và khoảng tuổi người dùng chọn; không thay bằng vận năm xem.
2. Kiểm tra sao có mặt đúng cung và đúng lớp (`natal` hoặc `annual`). Sao lưu niên không xác nhận kết luận nền bản mệnh; sao bản mệnh không tự xác nhận một sự kiện của năm.
3. Với `rules`, phải khớp chủ đề, cung và ít nhất một mã sao có mặt như điều kiện của mục.
4. Với `combinationRules`, phải khớp `topic`, một cung trong `palaces`, đủ `starIds`, và đúng phạm vi `same_palace`, `tam_phuong` hoặc `tam_phuong_tu_chinh`. Phân biệt hai cung tam hợp với cung đối diện.
5. Với `starCombinations`, kiểm tra đủ sao đồng cung và mọi điều kiện `branches`. Không dùng một cặp chỉ vì hai sao xuất hiện ở hai cung khác nhau.
6. Dùng `starPalaceProfiles` và `transformationPalaceProfiles` chỉ tại cung được khóa. Dùng hồ sơ sao chung như nét nghĩa nền, không biến thành kết luận riêng cho cung.
7. Với sao lưu niên, chỉ dùng `annualStarProfiles` trong câu hỏi về năm xem và chỉ khi đúng sao lưu có trong payload. Với Đại Vận, dùng phần `greatFortune` như gợi ý chủ đề; không giả định payload có sao/Tứ Hóa riêng của Đại Vận nếu không gửi.
8. Đối chiếu `palaceModifiers` với các sao thực có trong cung. Tuần/Triệt điều chỉnh cách đọc tổ hợp, không xóa toàn bộ ý nghĩa sao hoặc tự tạo kết luận tốt/xấu.

## Độ sáng và dữ kiện chưa có

- Chỉ dùng nhãn độ sáng được payload truyền vào. Không tự suy ra miếu/vượng/đắc/bình/hãm từ trí nhớ hoặc tên sao.
- Không áp dụng hệ số kiểu “giảm một nửa” cho cung vô chính diệu nếu kho và trường phái được nêu không cung cấp quy tắc đó.
- Không tự tính thêm Tứ Hóa, sao vận, mốc tuổi, năm hoặc quan hệ cung vắng trong payload.
- Nếu thiếu một dấu hiệu then chốt, bỏ kết luận phụ thuộc vào nó hoặc nêu ngắn gọn mức giới hạn. Không lấp khoảng trống bằng quy tắc tổng quát.

## Từ chứng cứ tới lời luận

Đọc chính cung trước, rồi tam phương tứ chính, Mệnh–Thân và cung chức năng có liên quan. Nhận định đáng kể cần chỉ ra cơ chế biểu hiện trong đời sống, yếu tố củng cố và phản chứng/điều kiện làm giảm độ chắc. Không chép hàng loạt mô tả sao; không cộng trừ cát hung bằng số lượng.

Phân biệt khuynh hướng nền, kịch bản có điều kiện và thời điểm. Kết quả giữ giọng điệu tham khảo, không định mệnh hóa; phần sức khỏe chỉ nói về thói quen và chăm sóc bản thân, không chẩn đoán.
