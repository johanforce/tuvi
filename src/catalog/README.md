# Star metadata catalogue

`star-metadata.ts` là nơi duy nhất quản lý ngũ hành, chữ Hán và độ sáng của sao.

## Quy ước
- `element`: dùng để tô màu tên sao theo ngũ hành.
- `han`: chữ Hán để hiển thị phụ.
- `brightness`: chỉ điền khi có bảng độ sáng có nguồn và đã kiểm chứng.
- `brightnessStatus`: `VERIFIED`, `UNVERIFIED` hoặc `NOT_APPLICABLE`.

Không điền ngũ hành/độ sáng theo phỏng đoán. Sao chưa có metadata hiển thị trung tính và tooltip ghi rõ chưa có dữ liệu. Các vòng Bác Sĩ, Tràng Sinh, Thái Tuế và các sao mới phát sinh chưa được phủ đầy đủ ngũ hành; cần đối chiếu tài liệu chuẩn/ảnh tuvidauso.ai.studio trước khi bổ sung.

## Độ sáng
Hiện chưa có bảng Miếu/Vượng/Đắc/Bình/Hãm hoàn chỉnh đã xác minh. UI có chỗ hiển thị trạng thái và `?`; không tái sử dụng ký hiệu trong HTML demo gốc vì người dùng xác nhận các sao trong đó là dữ liệu minh họa.
