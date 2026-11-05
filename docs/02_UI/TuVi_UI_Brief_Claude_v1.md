> **Trạng thái tài liệu (05/11/2026):** Đây là UI/UX brief tham chiếu, không phải mô tả trạng thái code hiện tại. Các câu trong brief yêu cầu “mock-only/chưa nối engine” thuộc giai đoạn thiết kế ban đầu và đã được thay thế: website hiện đã nối `buildChart()` với engine TypeScript. Stack thực tế hiện là HTML/CSS + TypeScript DOM + Vite; React/Tailwind/Lucide/Motion trong brief vẫn là định hướng chưa triển khai. Dùng tài liệu này để hoàn thiện bố cục, tương tác và responsive; xem `../../IMPLEMENTATION_STATUS.md` để biết phần còn thiếu.

---

# UI BRIEF — WEBSITE LẬP LÁ SỐ TỬ VI

**Tài liệu giao cho Claude để thiết kế và dựng giao diện Frontend trước khi triển khai thuật toán an sao.**  
Phiên bản: 1.0  
Ngôn ngữ giao diện: Tiếng Việt, kèm chữ Hán cho tên sao.  
Ảnh tham chiếu: `TuVi_UI_Reference_Chart.png` (đính kèm cùng tài liệu này).

---

# 0. YÊU CẦU QUAN TRỌNG GỬI CLAUDE

Hãy đọc toàn bộ tài liệu này và ảnh tham chiếu trước khi code.

Ở giai đoạn này, nhiệm vụ của bạn là **dựng UI/UX hoàn chỉnh bằng dữ liệu mock**, chưa triển khai thuật toán chuyển lịch âm, Can Chi, an sao hay luận giải thật.

Các nguyên tắc bắt buộc:

1. Không tự sáng tác hoặc tự suy đoán công thức an sao.
2. Không hard-code vị trí sao từ ảnh tham chiếu vào thuật toán. Ảnh chỉ là mẫu bố cục và dữ liệu minh họa.
3. Tạo các TypeScript interface/type rõ ràng để sau này có thể thay mock data bằng kết quả từ `chartEngine` mà không phải viết lại UI.
4. Dữ liệu mock phải được đánh dấu là **DỮ LIỆU DEMO**, không được mô tả như kết quả tính toán thực.
5. Không tạo đăng nhập, tài khoản, thanh toán, kho lá số, lưu hồ sơ, localStorage hoặc IndexedDB.
6. Không tạo chức năng gọi AI/API luận giải trong giai đoạn UI này. Có thể thiết kế vùng hiển thị nội dung để nối API ở giai đoạn sau.
7. Không thêm nhập ngày âm, nơi sinh, kinh độ, múi giờ tùy chỉnh hoặc hiệu chỉnh giờ mặt trời.
8. Không thay đổi bố cục lá số 4×4 thành danh sách 12 cung trên điện thoại.
9. Không dùng điểm số tốt/xấu, phần trăm vận may hay xếp hạng vận mệnh.
10. Ưu tiên UI đẹp, hoàn thiện, responsive, dễ đọc và dễ thay thế dữ liệu.

**Đầu ra mong muốn:** một project Frontend chạy được, có trang nhập thông tin, trang hiển thị lá số, hai chế độ luận giải, thao tác chọn năm, xem chi tiết cung/sao, và xuất PDF bằng trình duyệt.

---

# 1. MỤC TIÊU SẢN PHẨM

Xây dựng website lập và xem lá số Tử Vi theo phong cách cổ điển phương Đông, lấy bố cục lá số trong ảnh tham chiếu làm định hướng chính.

Người dùng có thể:

- Nhập thông tin sinh bằng ngày dương lịch và giờ sinh.
- Chọn giới tính Nam hoặc Nữ.
- Lập lá số và xem kết quả dưới dạng bàn cờ 4×4 truyền thống.
- Xem thông tin trung tâm, 12 cung và danh sách sao ở từng cung.
- Xem tên sao bằng tiếng Việt, có chữ Hán nhỏ bên cạnh nếu có dữ liệu.
- Nhận biết ngũ hành của sao qua màu sắc.
- Chọn một trong hai chế độ: **Tổng quan trọn đời** hoặc **Đại Hạn/Tiểu Hạn theo từng năm**.
- Chọn cung để xem chi tiết; xem các cung tam hợp và cung xung chiếu được làm nổi bật.
- Xuất lá số ra PDF.

Website triển khai online, phục vụ nhiều người dùng nhưng không cần tài khoản. Mỗi lần lập lá số chỉ xử lý thông tin trong phiên hiện tại; không lưu hồ sơ lâu dài.

# 2. CÔNG NGHỆ BẮT BUỘC

Sử dụng đúng stack sau:

- React 19.
- TypeScript.
- Vite.
- Tailwind CSS v4.
- Lucide React cho icon.
- Motion (Framer Motion) cho animation.

Có thể sử dụng React Context hoặc state cục bộ. Chỉ thêm Zustand nếu thật sự có nhu cầu; không tạo kiến trúc state phức tạp.

Yêu cầu kỹ thuật:

- Component hóa rõ ràng.
- Ưu tiên dữ liệu truyền qua props và type/interface.
- Tách `mockData` khỏi component UI.
- Tách layout màn hình, lá số, ô cung, panel luận giải, form nhập và các control.
- Không đặt toàn bộ ứng dụng trong một component lớn.
- Tạo dữ liệu demo có cấu trúc, không rải nội dung giả trực tiếp trong JSX.
- Code dễ nối với module tính toán thật sau này.
- Chạy được bằng `npm install` và `npm run dev`.

Cấu trúc gợi ý (có thể điều chỉnh hợp lý):

```text
src/
├─ app/
│  ├─ App.tsx
│  └─ routes.tsx                 # nếu cần routing
├─ components/
│  ├─ layout/
│  │  ├─ AppHeader.tsx
│  │  └─ PageContainer.tsx
│  ├─ birth-form/
│  │  ├─ BirthForm.tsx
│  │  ├─ GenderSelector.tsx
│  │  └─ BirthTimeField.tsx
│  ├─ chart/
│  │  ├─ ChartPage.tsx
│  │  ├─ ChartGrid.tsx
│  │  ├─ PalaceCell.tsx
│  │  ├─ CenterInfo.tsx
│  │  ├─ StarLabel.tsx
│  │  ├─ ChartLegend.tsx
│  │  └─ ChartToolbar.tsx
│  ├─ reading/
│  │  ├─ ReadingModeTabs.tsx
│  │  ├─ OverallReading.tsx
│  │  ├─ AnnualReading.tsx
│  │  └─ PalaceDetailPanel.tsx
│  └─ ui/
├─ data/
│  ├─ demoChart.ts
│  └─ demoReadings.ts
├─ types/
│  ├─ birth.ts
│  ├─ chart.ts
│  └─ reading.ts
├─ styles/
│  └─ index.css
└─ main.tsx
```

---

# 3. THÔNG TIN ĐẦU VÀO — FORM LẬP LÁ SỐ

## 3.1. Các trường bắt buộc

| Trường | Kiểu nhập | Quy định |
|---|---|---|
| Họ tên | Text input | Không bắt buộc; có thể để trống |
| Giới tính | Segmented control hoặc radio | Bắt buộc chọn Nam hoặc Nữ |
| Ngày sinh dương lịch | Date picker | Bắt buộc; hỗ trợ năm 1900–2100 |
| Giờ sinh | Time input `HH:mm` | Bắt buộc nhập, trừ khi chọn “Không rõ giờ sinh” |
| Không rõ giờ sinh | Checkbox/toggle | Khi bật, disable trường giờ và phút; không tự gán giờ mặc định |

## 3.2. Quy tắc nhập liệu cần thể hiện trên UI

- Chỉ cho phép nhập **ngày dương lịch**. Không có tab nhập ngày âm.
- Website tự chuyển sang âm lịch ở bước tính toán thật; UI hiện tại sử dụng dữ liệu mock.
- Giờ nhập theo định dạng 24 giờ `HH:mm`, ví dụ `10:00`, `12:30`, `23:45`.
- Múi giờ cố định UTC+7. Hiển thị một dòng chú thích: “Thời gian sử dụng theo giờ Việt Nam (UTC+7)”. Không cho người dùng sửa múi giờ.
- Không hỏi nơi sinh, quốc gia, tỉnh thành, kinh độ.
- Không hiệu chỉnh giờ theo kinh độ, giờ Lạc Dương hoặc giờ mặt trời thật.
- Người sinh ở nước ngoài tự quy đổi giờ về giờ Việt Nam trước khi nhập.
- Khoảng giờ Tý là 23:00–00:59. Mốc đổi ngày là **00:00**: 23:00–23:59 vẫn thuộc ngày đang nhập; 00:00–00:59 thuộc ngày mới.
- UI có thể hiện nhãn địa chi giờ dưới ô giờ sau khi người dùng nhập (ví dụ `10:00 · Giờ Tỵ`). Trong giai đoạn mock, chỉ cần minh họa giao diện; không viết thuật toán thật nếu chưa được yêu cầu.

Bảng giờ để hiển thị trợ giúp:

| Địa chi | Khoảng giờ |
|---|---|
| Tý | 23:00–00:59 |
| Sửu | 01:00–02:59 |
| Dần | 03:00–04:59 |
| Mão | 05:00–06:59 |
| Thìn | 07:00–08:59 |
| Tỵ | 09:00–10:59 |
| Ngọ | 11:00–12:59 |
| Mùi | 13:00–14:59 |
| Thân | 15:00–16:59 |
| Dậu | 17:00–18:59 |
| Tuất | 19:00–20:59 |
| Hợi | 21:00–22:59 |

## 3.3. Nút và hành vi form

- Nút chính: **LẬP LÁ SỐ**.
- Nút phụ: **XÓA THÔNG TIN**.
- Nút/checkbox: **Không rõ giờ sinh**.
- Validate trường bắt buộc, ngày hợp lệ và năm nằm trong 1900–2100.
- Nếu chưa chọn giới tính hoặc chưa có ngày sinh hợp lệ, hiển thị lỗi ngay dưới trường tương ứng.
- Khi submit thành công, chuyển sang trang lá số với thông tin vừa nhập.
- Không tự lưu form hoặc lá số vào trình duyệt.

## 3.4. Gợi ý bố cục form

Trang mở đầu có thể dùng bố cục 2 cột trên desktop:

- Bên trái: tiêu đề “LẬP LÁ SỐ TỬ VI”, đoạn giới thiệu ngắn, họa tiết phương Đông hoặc ảnh minh họa tinh tế.
- Bên phải: thẻ nhập thông tin sinh, trường rõ ràng, nút lập lá số nổi bật.

Trên điện thoại, xếp một cột, form nằm phía trên và nút submit rộng toàn bộ.

---

# 4. OUTPUT SAU KHI LẬP LÁ SỐ

Sau khi submit, hiển thị trang kết quả có các vùng sau.

## 4.1. Thanh công cụ phía trên

Các chức năng:

- Nút “Lập lá số mới” hoặc “Quay lại nhập thông tin”.
- Tiêu đề “LÁ SỐ TỬ VI”.
- Chế độ đang xem: Tổng quan hoặc Đại Hạn/Tiểu Hạn.
- Nút xuất PDF.
- Nút phóng to/thu nhỏ lá số trên màn hình nhỏ.

Không có nút “Lưu lá số”, “Hồ sơ của tôi”, “Đăng nhập” hoặc “Lịch sử lá số”.

## 4.2. Bố cục lá số 4×4

Đây là thành phần quan trọng nhất của toàn bộ website. Hãy bám sát hình tham chiếu `TuVi_UI_Reference_Chart.png`.

Lưới gồm 4 cột × 4 hàng:

```text
┌────────┬────────┬────────┬────────┐
│   Tỵ   │   Ngọ  │   Mùi  │  Thân  │
├────────┼────────┴────────┼────────┤
│  Thìn  │                  │  Dậu   │
├────────┤    Ô TRUNG TÂM   ├────────┤
│  Mão   │  (chiếm vùng 2×2)│  Tuất  │
├────────┼────────┬────────┼────────┤
│   Dần  │   Sửu  │   Tý   │  Hợi   │
└────────┴────────┴────────┴────────┘
```

- 12 cung nằm xung quanh.
- Ô thông tin trung tâm chiếm vùng 2 cột × 2 hàng.
- Địa bàn cố định theo hình, không tự xoay theo cung Mệnh.
- Mỗi ô cung có đường viền mảnh, rõ ràng.
- Tỷ lệ các ô đồng nhất; không để một cung quá rộng hoặc chữ tràn sang cung khác.
- Desktop ưu tiên hiển thị toàn bộ lá số trên một vùng nhìn rộng.
- Điện thoại vẫn giữ nguyên 4×4, không chuyển thành danh sách 12 cung.

## 4.3. Nội dung từng ô cung

Mỗi ô cung phải có các vùng thông tin sau, theo thứ tự ưu tiên:

**A. Phần đầu ô**

- Tên cung: Mệnh, Phụ Mẫu, Phúc Đức, Điền Trạch, Quan Lộc, Nô Bộc, Thiên Di, Tật Ách, Tài Bạch, Tử Tức, Phu Thê, Huynh Đệ.
- Can Chi của cung.
- Dấu hiệu “THÂN” nếu là cung Thân cư.
- Số tuổi Đại Hạn hoặc thông tin vận hạn nếu có.

**B. Khu vực sao**

- Chính tinh được ưu tiên nổi bật: chữ đậm, dễ nhìn, có màu theo ngũ hành.
- Phụ tinh và tạp diệu hiển thị theo từng dòng, gọn gàng.
- Tên sao tiếng Việt là chính; chữ Hán nhỏ hơn bên cạnh hoặc trong tooltip.
- Nếu có độ sáng, hiển thị ký hiệu M/V/Đ/B/H cạnh tên sao.
- Nếu có Tứ Hóa, hiển thị nhãn Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ hoặc ký hiệu L/Q/K/Kỵ.
- Sao lưu phải có dấu nhận biết riêng, ví dụ tiền tố `L.` hoặc kiểu chữ/viền khác để phân biệt với sao nguyên cục.
- Không gộp các sao trùng tên nhưng khác chữ Hán hoặc khác tầng vận thành cùng một record.

**C. Phần chân ô**

- Tên sao vòng Tràng Sinh.
- Khoảng tuổi Đại Hạn.
- Thông tin Tiểu Hạn/Lưu niên ở chế độ vận hạn.
- Dấu Tuần/Triệt thể hiện bằng dải/đường đánh dấu dễ nhận ra.

Các trường chưa có dữ liệu phải hiển thị trạng thái “Chưa xác định” hoặc ẩn có chủ đích; không tự điền giá trị giả.

## 4.4. Ô thông tin trung tâm

Ô trung tâm phải có phong cách giống mẫu Tuvi.vn trong ảnh. Các trường mong muốn:

1. Tiêu đề: “LÁ SỐ TỬ VI”.
2. Họ tên.
3. Giới tính.
4. Năm sinh dương lịch.
5. Tháng sinh dương lịch và âm lịch.
6. Ngày sinh dương lịch và âm lịch.
7. Giờ sinh (HH:mm) và Can Chi giờ.
8. Can Chi năm, tháng, ngày, giờ.
9. Năm đang xem và tuổi mụ tương ứng.
10. Âm dương: Dương Nam / Âm Nam / Dương Nữ / Âm Nữ.
11. Bản mệnh (nạp âm).
12. Ngũ hành Cục.
13. Cân lượng.
14. Chủ Mệnh.
15. Chủ Thân.
16. Lai Nhân Cung.

Không phải tất cả trường này đều đã có công thức chốt. Trong UI prototype, hiển thị bằng mock data có nhãn DEMO. Nếu không rõ giờ sinh, các thông tin phụ thuộc giờ phải hiện “Chưa xác định”.

## 4.5. Chú giải dưới lá số

Có một dải chú giải ngắn, rõ:

- M: Miếu.
- V: Vượng.
- Đ: Đắc.
- B: Bình.
- H: Hãm.
- Kim, Mộc, Thủy, Hỏa, Thổ theo màu ngũ hành.
- Các ký hiệu L/Q/K/Kỵ cho Tứ Hóa.
- Ký hiệu `L.` cho sao lưu.
- Ký hiệu Tuần/Triệt.

Không dùng màu cát/hung thay cho màu ngũ hành.

---

# 5. MÀU SẮC VÀ PHONG CÁCH THỊ GIÁC

## 5.1. Phong cách tổng thể

- Cổ điển phương Đông.
- Nền giấy cổ, ngà hoặc vàng nhạt.
- Họa tiết truyền thống rất nhẹ, không gây nhiễu nội dung.
- Viền cung màu nâu/đen mảnh.
- Tiêu đề có thể dùng font serif hoặc phong cách thư pháp tiết chế.
- Nội dung sao dùng font dễ đọc, không dùng thư pháp cho phần thông tin dày đặc.
- Giữ cảm giác giống một lá số Tử Vi truyền thống nhưng sản phẩm phải sạch, cân đối, hiện đại và rõ chữ.

Tránh:

- Nền quá tối.
- Họa tiết rồng/phượng dày đặc sau chữ.
- Hiệu ứng lấp lánh hoặc chuyển động quá nhiều.
- Font khó đọc ở các ô cung nhỏ.
- Dùng quá nhiều màu không có quy tắc.

## 5.2. Màu ngũ hành sao

| Ngũ hành | Hướng màu |
|---|---|
| Kim | Xám sáng/trắng ngà, nhưng phải đủ tương phản với nền |
| Mộc | Xanh lá |
| Thủy | Đen hoặc xanh dương đậm |
| Hỏa | Đỏ |
| Thổ | Vàng đất/nâu vàng |

Màu dùng thống nhất trong toàn ứng dụng và trong PDF. Không tự suy đoán hành của sao nếu mock data không cung cấp `element`; khi đó dùng màu trung tính.

## 5.3. Typography

- Tiếng Việt phải hiển thị dấu đầy đủ.
- Tên sao có chữ Hán bên cạnh khi có dữ liệu.
- Font cần hỗ trợ Latin/Vietnamese và CJK/Hán tự. Có thể dùng cặp font serif và sans-serif tương thích; không cần tự đóng gói font nếu chưa cần.
- Phân cấp rõ giữa tên cung, chính tinh, phụ tinh, metadata và chú giải.

---

# 6. HAI CHẾ ĐỘ LUẬN GIẢI

Người dùng chỉ chọn một trong hai chế độ sau. Không thêm chế độ chấm điểm.

## 6.1. Chế độ 1 — Tổng quan trọn đời

Hiển thị tab hoặc nút chọn **TỔNG QUAN**.

Nội dung đầu ra dự kiến:

- Tổng quan lá số.
- Tính cách và khuynh hướng.
- Công danh/sự nghiệp.
- Tài lộc/tài chính.
- Tình duyên và hôn nhân.
- Gia đạo và quan hệ.
- Sức khỏe.
- Con cái.
- Nhận định theo 12 cung khi người dùng chọn từng cung.

Bố cục nên có:

- Phần tổng quan nổi bật ở đầu panel.
- Các mục nội dung dạng accordion/card để dễ đọc.
- Chọn cung trên lá số sẽ cập nhật panel chi tiết cung tương ứng.
- Không chấm điểm, không dùng thanh % tốt/xấu.

Vì nội dung luận giải thật và AI chưa triển khai trong giai đoạn này, dùng text demo có ghi rõ “Nội dung minh họa — chưa phải luận giải thật”. Không tự tạo kết luận tử vi như kết quả chính thức.

## 6.2. Chế độ 2 — Đại Hạn/Tiểu Hạn theo từng năm

Hiển thị tab hoặc nút chọn **VẬN HẠN THEO NĂM**.

Các control:

- Chọn năm muốn xem bằng dropdown hoặc bộ chọn năm.
- Nút “Năm hiện tại”.
- Có thể dùng nút năm trước/năm sau.
- Không cho chọn năm nhỏ hơn năm sinh theo lịch phù hợp; các giới hạn cụ thể sẽ do engine cung cấp sau này.

Khi chọn năm, panel phải hiển thị:

1. Năm đang xem và tuổi mụ.
2. Đại Hạn đang đi qua: khoảng tuổi và cung Đại Hạn.
3. Tiểu Hạn của năm đó: cung tương ứng.
4. Lưu niên: thông tin cung Lưu Thái Tuế và các sao lưu có dữ liệu.
5. Các sao lưu hiển thị trực tiếp trên 12 cung và được phân biệt với sao nguyên cục.
6. Phần luận giải theo năm: tổng quan, công việc, tài lộc, tình cảm, sức khỏe và các cung liên quan.

Không chấm điểm năm tốt/xấu. Không tạo biểu đồ điểm vận hạn.

---

# 7. TƯƠNG TÁC TRÊN LÁ SỐ

1. **Click một ô cung:** cung được chọn có viền/highlight; các cung tam hợp và xung chiếu được làm nổi bật; các cung khác giảm độ nhấn nhưng vẫn đọc được.
2. **Panel chi tiết cung:** cập nhật tên cung, Can Chi cung, chính tinh, phụ tinh, tạp diệu, thần sát, Tứ Hóa, sao lưu, độ sáng và nội dung luận giải tương ứng.
3. **Hover/focus tên sao:** mở tooltip gồm tên Việt, chữ Hán, ngũ hành, nhóm sao và chú giải ngắn nếu có dữ liệu.
4. **Click tên sao:** có thể mở popover/panel chi tiết sao. Nếu chưa có nội dung thì báo “Chưa có nội dung giải nghĩa”.
5. **Bật/tắt nhóm sao:** cho phép ẩn/hiện nhóm để giảm mật độ chữ, tối thiểu gồm chính tinh, phụ tinh, tạp diệu, thần sát, Tứ Hóa, sao lưu.
6. **Zoom lá số:** nút `+`, `−`, `Fit`; không làm thay đổi bố cục 4×4.
7. **Đổi chế độ:** Tổng quan ↔ Vận hạn theo năm, giữ nguyên dữ liệu lá số.
8. **Đổi năm xem:** cập nhật vùng vận hạn và lớp sao lưu.
9. **Lập lá số mới:** quay lại form, không lưu lá số trước đó.

Mọi thao tác phải thực sự hoạt động trong prototype; không tạo nút trang trí không có hành vi.

---

# 8. RESPONSIVE — DESKTOP VÀ ĐIỆN THOẠI

## 8.1. Desktop

- Form có thể nằm giữa trang hoặc bố cục 2 cột.
- Trang lá số ưu tiên chart ở trung tâm.
- Panel luận giải đặt bên phải nếu đủ chiều rộng; nếu không, đặt dưới chart.
- Lá số 4×4 cần đủ rộng để đọc các sao.
- Thanh công cụ luôn dễ truy cập.

## 8.2. Mobile

- Giữ nguyên lưới 4×4 và tỷ lệ hình học.
- Không chuyển 12 cung thành danh sách dọc.
- Đặt lá số trong vùng có thể cuộn ngang nếu không đủ chiều rộng.
- Có nút zoom `+`, `−`, `Fit` để phóng to/thu nhỏ.
- Có thể dùng thao tác pinch-to-zoom nếu triển khai ổn định.
- Sau khi zoom, người dùng vẫn có thể kéo để xem đủ 12 cung và ô trung tâm.
- Các tab Tổng quan/Vận hạn và nút PDF phải dễ thao tác bằng ngón tay.
- Panel chi tiết cung có thể mở dạng bottom sheet trên mobile; đây chỉ là panel phụ, **không thay thế bố cục 4×4 của lá số**.

---

# 9. XUẤT PDF

Có nút **XUẤT PDF** ở trang lá số.

Yêu cầu:

- Xuất được toàn bộ lá số 4×4, 12 cung và ô trung tâm.
- Giữ màu ngũ hành, chú giải và ký hiệu.
- Font hỗ trợ tiếng Việt và chữ Hán.
- Không cắt mất sao, không tràn chữ, không tách ô cung giữa trang.
- Ưu tiên bố cục in ngang (landscape); chọn khổ giấy phù hợp để chữ không quá nhỏ.
- Có thể dùng CSS `@media print` và trình duyệt “Save as PDF” ở giai đoạn prototype.
- Không upload PDF hoặc dữ liệu lá số lên server.

---

# 10. TRẠNG THÁI VÀ TRƯỜNG HỢP ĐẶC BIỆT

Claude phải dựng UI cho các trạng thái sau, ít nhất bằng mock/demo:

1. **Chưa nhập dữ liệu:** trang form ban đầu.
2. **Form không hợp lệ:** thiếu giới tính, thiếu ngày hoặc ngày ngoài khoảng.
3. **Đang lập lá số:** loading state ngắn, không giả vờ gọi API.
4. **Lá số đã tạo:** hiển thị đầy đủ chart demo.
5. **Không rõ giờ sinh:** vẫn có trang lá số; các trường phụ thuộc giờ hiển thị “Chưa xác định”; không tự dùng giờ Tý.
6. **Thiếu dữ liệu sao/độ sáng:** không hiện giá trị giả; có thể ẩn hoặc ghi “Chưa có dữ liệu”.
7. **Không có nội dung luận giải:** hiển thị empty state lịch sự; nói rõ nội dung đang chờ tích hợp.
8. **Chế độ vận hạn:** nếu năm xem chưa có dữ liệu mock, hiển thị trạng thái phù hợp, không bịa sao lưu.

---

# 11. DỮ LIỆU DEMO GỢI Ý — TV-001

Dùng lá số Tuvi.vn #13405 làm fixture để dựng UI. Đây chỉ là dữ liệu minh họa cho frontend, không phải yêu cầu Claude viết thuật toán để tính ra các giá trị này.

## 11.1. Input demo

```ts
const demoBirthInput = {
  name: 'Lá số tuvi.vn',
  gender: 'nam',
  solarDate: '1911-01-01',
  birthTime: {
    kind: 'exact',
    hour: 12,
    minute: 30,
  },
  timezoneOffset: 7,
};
```

## 11.2. Thông tin trung tâm demo

| Trường | Giá trị |
|---|---|
| Ngày dương | 01/01/1911 |
| Giờ sinh | 12:30 – Giờ Ngọ |
| Âm lịch | 02/12 năm Canh Tuất |
| Can Chi năm | Canh Tuất |
| Can Chi tháng | Kỷ Sửu |
| Can Chi ngày | Tân Mùi |
| Can Chi giờ | Giáp Ngọ |
| Năm xem | Bính Ngọ (2026) |
| Tuổi mụ | 117 |
| Âm dương | Dương Nam |
| Bản mệnh | Thoa Xuyến Kim |
| Cục | Mộc Tam Cục |
| Mệnh/Thân | Đồng cung Mùi |
| Cân lượng | 3 lượng 4 chỉ |
| Chủ Mệnh | Lộc Tồn |
| Chủ Thân | Văn Xương |
| Lai Nhân Cung | Tử Tức |

Nguồn fixture: lá số Tuvi.vn #13405 do người dùng cung cấp. Không dùng nội dung này để hard-code thuật toán.

## 11.3. Vị trí 14 chính tinh dùng để minh họa bố cục

| Địa chi cung | Chính tinh hiển thị trong fixture |
|---|---|
| Tỵ | Tham Lang, Liêm Trinh |
| Ngọ | Cự Môn |
| Mùi | Thiên Tướng |
| Thân | Thiên Đồng, Thiên Lương |
| Dậu | Thất Sát, Vũ Khúc |
| Tuất | Thái Dương |
| Hợi | Vô chính diệu |
| Tý | Thiên Cơ |
| Sửu | Phá Quân, Tử Vi |
| Dần | Vô chính diệu |
| Mão | Thiên Phủ |
| Thìn | Thái Âm |

Các sao phụ/tạp/Thần sát khác có thể lấy từ ảnh tham chiếu để lấp đầy UI demo nếu đọc rõ. Nếu không đọc rõ thì dùng mock label có ghi demo; không tự tuyên bố đó là dữ liệu chuẩn.

---

# 12. TYPESCRIPT DATA CONTRACT ĐỂ SAU NÀY NỐI ENGINE

Tạo type tương đương dưới đây hoặc cải thiện nhưng không làm mất ý nghĩa các trường:

```ts
type Gender = 'nam' | 'nu';

type BirthTime =
  | { kind: 'exact'; hour: number; minute: number }
  | { kind: 'unknown' };

interface BirthInput {
  name?: string;
  gender: Gender;
  solarDate: string; // YYYY-MM-DD
  birthTime: BirthTime;
  timezoneOffset: 7;
}

type Element = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';
type Brightness = 'M' | 'V' | 'D' | 'B' | 'H';
type ChartLayer = 'nguyen-cuc' | 'dai-han' | 'tieu-han' | 'luu-nien';
type StarGroup =
  | 'chinh-tinh'
  | 'phu-tinh'
  | 'tap-dieu'
  | 'than-sat'
  | 'tu-hoa'
  | 'luu-dieu'
  | 'other';

interface StarViewModel {
  id: string;
  displayName: string;
  chineseName?: string;
  aliases?: string[];
  group: StarGroup;
  layer: ChartLayer;
  element?: Element;
  brightness?: Brightness;
  transformation?: 'loc' | 'quyen' | 'khoa' | 'ky';
  prefix?: string; // ví dụ "L." cho sao lưu
  tooltip?: string;
}

interface PalaceViewModel {
  id: string;
  earthlyBranch: string;
  heavenlyStem?: string;
  palaceName: string;
  isBodyPalace: boolean;
  mainStars: StarViewModel[];
  otherStars: StarViewModel[];
  growthStage?: string;
  majorFortuneLabel?: string;
  minorFortuneLabel?: string;
  annualLabel?: string;
  hasTuan?: boolean;
  hasTriet?: boolean;
  isUnknown?: boolean;
}

interface ChartSummaryViewModel {
  name?: string;
  gender: Gender;
  solarDate: string;
  lunarDate?: string;
  birthTimeLabel: string;
  hourPillar?: string;
  yearPillar?: string;
  monthPillar?: string;
  dayPillar?: string;
  viewedYear?: number;
  lunarAge?: number;
  yinYangLabel?: string;
  natalElement?: string;
  bureau?: string;
  weight?: string;
  lifeMaster?: string;
  bodyMaster?: string;
  laiRenPalace?: string;
  isDemo?: boolean;
  warnings?: string[];
}

interface ChartViewModel {
  summary: ChartSummaryViewModel;
  palaces: PalaceViewModel[]; // đúng 12 cung; vị trí theo địa bàn cố định
}
```

Phần luận giải có thể tách type riêng để dễ tích hợp AI/content API sau này. Không cần gọi AI ở giai đoạn này.

---

# 13. YÊU CẦU VỀ CHẤT LƯỢNG HOÀN THIỆN

Trước khi bàn giao project, tự kiểm tra:

- Form nhập hoạt động thật, có validate.
- Chọn “Không rõ giờ sinh” sẽ disable giờ và thể hiện rõ trạng thái.
- Submit form mở được trang lá số demo.
- Lá số đúng bố cục 4×4, 12 cung xung quanh, ô trung tâm 2×2.
- Không có cung nào mất hoặc đảo địa bàn.
- Trên mobile vẫn giữ 4×4 và có zoom/pan.
- Click cung cập nhật panel chi tiết.
- Hai chế độ luận giải chuyển đổi được.
- Chọn năm cập nhật phần vận hạn mock.
- Bật/tắt nhóm sao hoạt động.
- Tooltip sao hoạt động bằng hover và keyboard focus.
- Xuất PDF/print hoạt động, không cắt lá số.
- Không có dữ liệu tài khoản hoặc lưu trữ lâu dài.
- Không có công thức an sao giả được gọi là đã hoàn tất.
- Không có nút giả hoặc nút không có tác dụng.
- Không còn lỗi TypeScript, lỗi console và lỗi responsive rõ ràng.

---

# 14. HƯỚNG DẪN BÀN GIAO CHO NGƯỜI DÙNG

Khi hoàn tất, hãy trả về:

1. Cây thư mục project.
2. Danh sách component chính và vai trò.
3. Cách cài và chạy project.
4. Những chức năng UI đã hoàn thiện.
5. Những nội dung đang dùng mock data.
6. Những phần chưa triển khai vì đang chờ thuật toán thật.
7. Ảnh chụp màn hình desktop và mobile nếu môi trường của bạn hỗ trợ.

**Không tự chuyển sang viết engine an sao hoặc luận giải thật.** Hãy dừng ở bản UI hoàn chỉnh để người dùng duyệt trước.

---

# 15. TÓM TẮT NGẮN GỌN ĐỂ KHÔNG LỆCH YÊU CẦU

- Website Tử Vi tiếng Việt, có chữ Hán cho tên sao.
- Cổ điển phương Đông, giấy cổ, vàng nhạt.
- React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide React + Motion.
- Input: họ tên tùy chọn, giới tính Nam/Nữ bắt buộc, ngày dương lịch 1900–2100, giờ `HH:mm` hoặc không rõ giờ.
- UTC+7 cố định; không có nơi sinh, không kinh độ, không hiệu chỉnh giờ mặt trời.
- Output: lá số 4×4 truyền thống theo ảnh tham chiếu, 12 cung xung quanh, thông tin ở giữa, sao màu theo ngũ hành, chữ Hán, độ sáng, Tứ Hóa, Tuần/Triệt và lớp sao lưu.
- Hai chế độ xem: Tổng quan trọn đời và Đại Hạn/Tiểu Hạn theo từng năm.
- Không chấm điểm tốt/xấu.
- Điện thoại vẫn 4×4, có zoom/pan.
- Xuất PDF.
- Không login, không lưu hồ sơ, không backend cho MVP, không AI API trong giai đoạn UI.
- Hiện chỉ làm UI với mock data; không tự viết công thức an sao.
