# Chính sách nguồn và trường phái

## Khi sử dụng quy tắc
Ghi tối thiểu: tác giả/nhà biên soạn, tên sách/tài liệu, ấn bản/năm (nếu biết), trang/chương (nếu có), trường phái, quy tắc cụ thể và điều kiện áp dụng.

## Kho diễn giải nội bộ của ứng dụng
- `src/data/ziwei-interpretation-db.json` là kho quy tắc biên soạn để hỗ trợ diễn giải trong ứng dụng; nội dung không đồng nghĩa với quy tắc cổ thư đã được kiểm chứng.
- Phần `sources` trong JSON phân biệt vai trò cổ thư tham khảo, tài liệu dự án và phần bổ sung biên soạn. Không gán mọi quy tắc trong database cho cổ thư.
- Dùng đúng các điều kiện `topic`, `palace`, `starIds`, `scope`, `branches` và `scope` bản mệnh/lưu niên nếu có. Không nới điều kiện chỉ để tìm được một quy tắc.
- Nội dung JSON là gợi ý có điều kiện, không phải dữ kiện lá số. Kiểm tra vị trí sao thực tế trước khi dùng; không lặp nguyên văn như trích dẫn có nguồn.
- Khi database và prompt cũ xung đột về dữ kiện, an toàn hoặc độ chắc chắn, ưu tiên dữ kiện hiện có và cách diễn giải thận trọng; không che giấu khoảng trống đầu vào.

## Phân loại
- ĐỒNG THUẬN: nhiều nguồn/trường phái được nêu rõ cùng sử dụng.
- RIÊNG TRƯỜNG PHÁI: chỉ áp dụng trong hệ quy tắc được xác định.
- SUY LUẬN: bước kết nối do AI thực hiện, không được gán thành lời cổ thư.
- CHƯA XÁC MINH: chưa có nguồn đủ để xác nhận.

## So sánh
1. Trình bày riêng quy tắc A và B.
2. Chỉ ra điểm giống/khác và hệ quả lên lá số.
3. Không tự hợp nhất hai quy tắc bất đồng.
4. Nếu thiếu ấn bản/trang, nói rõ giới hạn.
5. Không bịa trích dẫn và không sao chép dài nội dung có bản quyền.

## Nguyên tắc nghiên cứu
Một quy tắc mới nên có nguồn hoặc nhãn trường phái, điều kiện áp dụng, giới hạn/phản chứng và ví dụ kiểm thử.
