# Sao lưu niên — tích hợp bảng quy tắc do người dùng cung cấp v0.2.4

**Ngày:** 05/11/2026  
**Phạm vi:** Hoàn thiện 6 mục còn chờ trong lớp sao lưu v0.2.3. Đây là bản triển khai theo bảng quy tắc người dùng cung cấp; chưa phải xác minh độc lập với tuvidauso.ai.studio.

## Các quy tắc mới được tích hợp

| Sao | Khóa an | Quy tắc / vị trí | Ghi chú triển khai |
|---|---|---|---|
| Lưu Thiên Không | Chi năm xem | Từ cung Thái Tuế năm xem tiến thuận 1 cung; đồng cung Thiếu Dương | Tên gọi có khác biệt giữa các trường phái. |
| Lưu Văn Tinh (Lưu Niên Văn Tinh) | Can năm sinh | Giáp Tỵ, Ất Ngọ, Bính Thân, Đinh Dậu, Mậu Thân, Kỷ Dậu, Canh Hợi, Tân Tý, Nhâm Dần, Quý Mão | `scope: annual` để hiển thị như lớp lưu, nhưng vị trí cố định theo Can năm sinh, không đổi theo năm xem. |
| Lưu Tuần Không | Giáp tuần của năm xem | Tính năm Can Chi thuộc Giáp tuần nào; lấy hai Chi Tuần Không theo bảng 6 Giáp tuần | Mỗi địa chi là một placement riêng, cùng tên sao. |
| Lưu Triệt Không | Can năm xem | Giáp/Kỷ Thân-Dậu; Ất/Canh Ngọ-Mùi; Bính/Tân Thìn-Tỵ; Đinh/Nhâm Dần-Mão; Mậu/Quý Tý-Sửu | Mỗi địa chi là một placement riêng, cùng tên sao. |
| Lưu Văn Xương | Can năm xem | Trung Châu phái; bảng: Tỵ, Ngọ, Thân, Dậu, Thân, Dậu, Hợi, Tý, Dần, Mão theo 10 Can | Dùng như bảng sao lưu riêng, không lấy vị trí Văn Xương bản mệnh theo giờ sinh. |
| Lưu Văn Khúc | Can năm xem | Trung Châu phái; bảng: Dậu, Thân, Ngọ, Tỵ, Ngọ, Tỵ, Mão, Dần, Tý, Hợi theo 10 Can | Dùng như bảng sao lưu riêng, không lấy vị trí Văn Khúc bản mệnh theo giờ sinh. |

## Kiểm tra ví dụ năm xem 2026

Năm xem 2026 có Can Chi Bính Ngọ. Engine phải cho:

| Sao | Kết quả |
|---|---|
| Lưu Thiên Không | Mùi |
| Lưu Tuần Không | Dần, Mão (Giáp Thìn tuần) |
| Lưu Triệt Không | Thìn, Tỵ (Can Bính) |
| Lưu Văn Xương | Thân |
| Lưu Văn Khúc | Ngọ |
| Lưu Văn Tinh | Theo Can năm sinh; ví dụ Can Kỷ thì ở Dậu, Can Giáp thì ở Tỵ |

## Kỹ thuật và trạng thái xác minh

- `placeAnnualStars(viewedYear, birthYearStem)` nhận riêng Can năm sinh để không nhầm quy tắc của Lưu Niên Văn Tinh.
- Lưu Tuần Không và Lưu Triệt Không được biểu diễn bằng hai `StarPlacement` cho hai cung, cùng tên nhưng ID khác nhau (`...-1`, `...-2`).
- Sáu nhóm sao đã chuyển khỏi `annualPendingStars`; danh sách chờ hiện trống đối với đúng các mục này.
- Các sao mới vẫn mang `CANDIDATE_SPEC`. Bảng do người dùng cung cấp đã được code hóa và kiểm thử logic, nhưng chưa có fixture đầu ra độc lập từ tuvidauso.ai.studio nên không đánh dấu `VERIFIED_TUVIVN`.
- Lưu Tứ Hóa vẫn được đặt ở pipeline riêng và chỉ định vị được khi lá số có giờ sinh/đã có vị trí sao gốc.

## Test mới

- Ví dụ 2026 Bính Ngọ khớp Mùi / Dần-Mão / Thìn-Tỵ / Thân / Ngọ.
- Lưu Niên Văn Tinh giữ nguyên vị trí khi chỉ đổi năm xem, nhưng đổi theo Can năm sinh.
- Lưu Tuần Không kiểm tra đủ 6 Giáp tuần.
- Lưu Triệt Không kiểm tra đủ 10 Can.

**Cảnh báo:** Cách gọi Lưu Thiên Không và lựa chọn trường phái có thể không đồng nhất. Vị trí đã triển khai đúng theo bảng bạn cung cấp; khi so sánh tuvidauso.ai.studio nếu kết quả khác thì cần giữ lại ảnh và năm xem để xác định đây là khác trường phái hay lỗi công thức.
