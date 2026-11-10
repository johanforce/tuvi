# Sao lưu niên — triển khai ứng viên v0.2.3

> **Ghi chú trạng thái:** Đây là bản ghi lịch sử trước khi người dùng xác nhận các công thức an sao đang triển khai. Không dùng nhãn “ứng viên” bên dưới làm trạng thái hiện hành; xem `SAO_LUU_NIEN_v0_2_4.md` để biết trạng thái mới.

**Ngày:** 05/11/2026  
**Phạm vi:** Lớp sao lưu theo Can Chi của năm xem, chưa bao gồm Đại Hạn, Tiểu Hạn hoặc Lưu Nguyệt.

## Nguyên tắc triển khai

- Dùng `viewedYear` (năm âm lịch người dùng chọn) để lấy Can Chi năm xem. Ví dụ 2026 → Bính Ngọ.
- Sao lưu có `scope: 'annual'`, không ghi đè sao bản mệnh.
- Những công thức dưới đây là **candidate** theo các cách an sao lưu niên phổ thông hoặc suy rộng bảng sao gốc theo Can/Chi năm xem; chưa xác minh đầy đủ với tuvicohoc.ai.studio.
- Tứ Hóa Lưu Niên không có cung vị độc lập. Bốn dấu Lưu Hóa gắn lên cung chứa sao gốc tương ứng theo Can năm xem.
- Sao chưa đủ căn cứ được đưa vào `annualPendingStars`, không gán cung giả.

## Bộ 21 sao lưu người dùng yêu cầu

| Sao | Triển khai v0.2.3 | Trạng thái |
|---|---|---|
| Lưu Thái Tuế | Cung có địa chi trùng chi năm xem | Candidate |
| Lưu Kình Dương | Một cung trước Lưu Lộc Tồn | Candidate |
| Lưu Đà La | Một cung sau Lưu Lộc Tồn | Candidate |
| Lưu Thiên Khốc | Dùng bảng Khốc theo chi năm xem | Candidate |
| Lưu Thiên Hư | Dùng bảng Hư theo chi năm xem | Candidate |
| Lưu Bạch Hổ | Vị trí Bạch Hổ trong vòng Thái Tuế lấy chi năm xem | Candidate |
| Lưu Tang Môn | Vị trí Tang Môn trong vòng Thái Tuế lấy chi năm xem | Candidate |
| Lưu Thiên Mã | Dùng bảng Thiên Mã theo chi năm xem | Candidate |
| Lưu Lộc Tồn | Dùng bảng Lộc Tồn theo Can năm xem | Candidate |
| Lưu Hóa Khoa | Can năm xem, gắn lên sao gốc được Hóa Khoa | Candidate |
| Lưu Hóa Quyền | Can năm xem, gắn lên sao gốc được Hóa Quyền | Candidate |
| Lưu Hóa Lộc | Can năm xem, gắn lên sao gốc được Hóa Lộc | Candidate |
| Lưu Hóa Kỵ | Can năm xem, gắn lên sao gốc được Hóa Kỵ | Candidate |
| Lưu Đào Hoa | Dùng bảng Đào Hoa theo chi năm xem | Candidate |
| Lưu Hồng Loan | Dùng bảng Hồng Loan theo chi năm xem | Candidate |
| Lưu Thiên Hỷ | Dùng bảng Thiên Hỷ theo chi năm xem | Candidate |
| Lưu Thiên Không | Chưa an | Missing rule |
| Lưu Thiên Trù | Tạm áp bảng Thiên Trù theo Can năm xem | Candidate yếu; cần fixture |
| Lưu Văn Tinh | Chưa an; chưa rõ identity với Văn Xương/Văn Khúc | Missing rule |
| Lưu Tuần Không | Chưa an | Missing rule |
| Lưu Triệt Không | Chưa an | Missing rule |

## Sao lưu bổ sung quan sát trên lá số mẫu

| Sao | Triển khai v0.2.3 | Trạng thái |
|---|---|---|
| Lưu Long Đức | Tạm lấy vị trí trong vòng Thái Tuế theo chi năm xem | Candidate yếu |
| Lưu Phúc Đức | Tạm lấy vị trí trong vòng Thái Tuế theo chi năm xem | Candidate yếu |
| Lưu Thiên Đức | Áp bảng Thiên Đức theo chi năm xem | Candidate |
| Lưu Nguyệt Đức | Áp bảng Nguyệt Đức theo chi năm xem | Candidate |
| Lưu Thiên Việt | Áp bảng Thiên Việt theo Can năm xem | Candidate; có thể hiện `CONFLICT` theo bảng Khôi/Việt gốc |
| Lưu Văn Xương | Chưa an | Missing rule |
| Lưu Văn Khúc | Chưa an | Missing rule |
| Lưu Kiếp Sát | Áp bảng Kiếp Sát theo chi năm xem | Candidate |

## Ghi chú công thức và nguồn tham khảo ngoài

Một số nguồn trực tuyến mô tả phép an sao lưu niên bằng cách lấy Can/Chi năm xem thay năm sinh; Lộc Tồn/Kình/Đà theo Can, Thái Tuế/Tang/Bạch/Khốc/Hư/Mã/Hồng Loan/Thiên Hỷ theo Chi, và Tứ Hóa theo Can. Đây chỉ là nguồn tạo giả thuyết, **không phải bằng chứng rằng tuvicohoc.ai.studio dùng đúng các quy tắc này**:

- https://thayungkhiem.vn/cac-sao-luu-nien
- https://nhatnguyet.org/kien-thuc/bai-viet/luu-nien-va-sao-luu-trong-tu-vi-eaa375
- https://www.mongvang.net/cach-an-sao/
- https://www.etuvicohoc.ai.studio/kien-thuc/van-han/luu-nien/

## Việc cần đối chiếu tiếp

1. Cùng một ngày/giờ/giới tính, so sánh 2–3 năm xem liên tiếp trên tuvicohoc.ai.studio; transcribe tất cả nhãn `L.` và cung chứa chúng.
2. Chọn các năm có Can khác nhau để phân biệt Lưu Lộc Tồn, Lưu Kình/Đà, Lưu Tứ Hóa, Lưu Thiên Việt/Trù.
3. Chọn các năm có chi cách xa để phân biệt Khốc/Hư/Mã/Đào Hoa/Hồng Loan/Thiên Hỷ, đồng thời xác nhận Lưu Long Đức/Phúc Đức.
4. Xác minh riêng Lưu Thiên Không, Lưu Văn Tinh, Lưu Tuần Không, Lưu Triệt Không, Lưu Văn Xương và Lưu Văn Khúc.
5. Chỉ đổi trạng thái sang `VERIFIED_TUVIVN` sau khi có fixture rõ đầu vào và vị trí sao.
