# TỬ VI TRỌN ĐỜI — ĐẶC TẢ DỰ ÁN (MVP)

**Phiên bản:** v1.3 — bổ sung sổ theo dõi công thức chưa tìm được/chưa xác minh và bàn giao thread mới  
**Ngày cập nhật:** 05/11/2026  
**Trạng thái:** Đặc tả công thức/backlog đang được dùng trong quá trình triển khai; engine v0.2.0 đã được code và đối chiếu một phần. Tài liệu này tiếp tục quản lý các mục `candidate`, `conflict`, `missing_rule` và `todo_fixture`.

> **Mục tiêu chuẩn đầu ra:** xây dựng website tạo lá số có kết quả hiển thị gần/đúng với **Tuvi.vn**. Các công thức trong MD cũ là ứng viên cần kiểm thử, không mặc nhiên được xem là đúng. Nguồn iztro/紫微研习社 được dùng để tìm công thức, phát hiện mục thiếu và tạo giả thuyết kiểm thử; không được tự động ghi đè kết quả Tuvi.vn. Vương Đình Chi là nguồn tham khảo lịch sử, không còn là chuẩn ưu tiên sau quyết định mới nhất của người dùng.

---

## 0. Quy ước đọc tài liệu và trạng thái kiểm chứng

Các nhãn sau được dùng xuyên suốt:

| Nhãn | Ý nghĩa |
|---|---|
| `MATCH_TV001` | Khớp dữ liệu/ảnh lá số mẫu Tuvi.vn #13405; chỉ xác nhận trên mẫu này, không chứng minh mọi trường hợp. |
| `CANDIDATE_IZTRO` | Có công thức rõ trong tài liệu hoặc mã nguồn iztro; cần kiểm tra với Tuvi.vn trước khi chốt. |
| `CONFLICT` | Tài liệu MD, iztro, bài viết Tuvi.vn hoặc kết quả lá số đang khác nhau. Không tự chọn một bên. |
| `MISSING_RULE` | Danh mục có sao nhưng MD chưa ghi công thức. |
| `MISSING_CATALOG` | Tuvi.vn/MD có hiển thị sao nhưng danh sách 117 + 21 của người dùng chưa có. |
| `TODO_FIXTURE` | Cần thêm lá số Tuvi.vn có Can/Chi/giờ/năm xem thích hợp để phân biệt các công thức. |
| `READY_FOR_TEST` | Có thể đưa vào bộ test, nhưng chưa phải đã xác minh với Tuvi.vn. |

**Nguyên tắc quan trọng:** một sao có tên trên trang không đồng nghĩa công thức an sao đã được xác minh. Một công thức trùng trên TV-001 cũng chưa đủ để xác nhận nếu hai chiều đếm cho cùng kết quả ở giờ Ngọ (sáu cung đối diện), hoặc nếu nhiều biến đầu vào cùng thay đổi.

## 0.1. SỔ THEO DÕI CÔNG THỨC CHƯA TÌM ĐƯỢC / CHƯA XÁC MINH — BACKLOG HIỆN HÀNH

> Yêu cầu của người dùng: phải giữ lại danh sách những sao chưa tìm được công thức để xử lý ở giai đoạn sau. **Không tự bịa công thức, không đánh dấu hoàn tất chỉ vì tìm thấy một công thức ở iztro hoặc một website khác.** Chuẩn đầu ra vẫn là Tuvi.vn.
>
> Phân biệt ba trạng thái:
> - **Chưa tìm được công thức riêng (`MISSING_RULE`)**: tài liệu hiện tại chưa có quy tắc đủ rõ cho sao đó.
> - **Có công thức ứng viên (`CANDIDATE`)**: tìm được quy tắc trong MD/iztro/tài liệu khác, nhưng chưa xác nhận khớp Tuvi.vn.
> - **Có mâu thuẫn (`CONFLICT`)**: có từ hai công thức hoặc nguồn cho kết quả khác nhau.

### A. Sao chưa tìm được công thức riêng đủ căn cứ

| Sao / hạng mục | Phạm vi | Trạng thái hiện tại | Ghi chú cần làm sau |
|---|---|---|---|
| **Đường Phù** | Nguyên cục | `MISSING_RULE` | TV-001 có hiển thị; MD chưa có bảng an đủ căn cứ. Cần tìm vị trí theo Can/Chi/tháng và ít nhất 2–3 fixture Tuvi.vn. Chữ Hán/tên chính xác cũng cần xác nhận. |
| **Không Vong (空亡)** | Nguyên cục / thần sát | `MISSING_RULE + IDENTITY_UNRESOLVED` | Chưa có công thức placement riêng và chưa xác định Tuvi.vn có xem đây là sao độc lập hay tên gọi liên quan Tuần/Triệt. Không tự tạo placement. |
| **Lưu Tuần Không** | Lưu niên | `CANDIDATE_SPEC/TODO_FIXTURE` | v0.2.4 đã code hóa theo Giáp tuần của năm xem và đặt hai Chi Tuần Không; cần fixture Tuvi.vn để xác nhận trường phái. |
| **Lưu Triệt Không** | Lưu niên | `CANDIDATE_SPEC/TODO_FIXTURE` | v0.2.4 đã code hóa bảng hai Chi theo Can năm xem; cần fixture Tuvi.vn để xác nhận. |
| **Lưu Thiên Không** | Lưu niên | `CANDIDATE_SPEC/TODO_FIXTURE` | v0.2.4 theo quy tắc người dùng cung cấp: từ Thái Tuế năm xem tiến thuận 1 cung, đồng cung Thiếu Dương; cách gọi khác nhau giữa trường phái. |
| **Lưu Thiên Trù** | Lưu niên | `CANDIDATE_SPEC/TODO_FIXTURE` | v0.2.3 tạm áp bảng Thiên Trù theo Can năm xem; chưa chứng minh Tuvi.vn dùng phép này. |
| **Lưu Văn Tinh** | Lưu niên | `CANDIDATE_SPEC/TODO_FIXTURE` | v0.2.4 code hóa Lưu Niên Văn Tinh theo Can năm sinh; vị trí cố định trên lá số gốc, không đổi theo năm xem. Cần fixture xác nhận identity với nhãn Tuvi.vn. |
| **Lưu Phúc Đức** | Lưu niên | `CANDIDATE_SPEC/TODO_FIXTURE` | v0.2.3 tạm lấy vị trí Phúc Đức trong vòng Thái Tuế theo chi năm xem; chưa xác minh. |
| **Lưu Long Đức** | Lưu niên | `CANDIDATE_SPEC/TODO_FIXTURE` | v0.2.3 tạm lấy vị trí Long Đức trong vòng Thái Tuế theo chi năm xem; cần xác định có phải vòng Tuế Tiền hay quy tắc khác. |
| **Lưu Thiên Đức** | Lưu niên | `CANDIDATE_SPEC/TODO_FIXTURE` | v0.2.3 tạm áp bảng Thiên Đức theo chi năm xem; chưa xác minh placement lưu. |
| **Lưu Nguyệt Đức** | Lưu niên | `CANDIDATE_SPEC/TODO_FIXTURE` | v0.2.3 tạm áp bảng Nguyệt Đức theo chi năm xem; chưa xác minh placement lưu. |
| **Lưu Kiếp Sát** | Lưu niên | `CANDIDATE_SPEC/TODO_FIXTURE` | v0.2.3 tạm áp bảng Kiếp Sát theo chi năm xem; chưa xác minh placement lưu. |
| **Lưu Thiên Khôi** | Lưu niên | `MISSING_RULE/TODO_FIXTURE` | Nhãn được quan sát trên trang; chưa chốt lấy Can năm xem, Can ngày hay quy tắc khác của Tuvi.vn. |
| **Lưu Thiên Việt** | Lưu niên | `CANDIDATE_SPEC/CONFLICT/TODO_FIXTURE` | v0.2.3 tạm áp bảng Thiên Việt theo Can năm xem; kế thừa trạng thái conflict ở các Can mà bảng sao gốc đang mâu thuẫn. |
| **Lưu Văn Xương** | Lưu niên | `CANDIDATE_SPEC/TODO_FIXTURE` | v0.2.4 theo bảng Trung Châu phái do người dùng cung cấp, khóa Can năm xem; cần fixture Tuvi.vn để kiểm chứng trường phái. |
| **Lưu Văn Khúc** | Lưu niên | `CANDIDATE_SPEC/TODO_FIXTURE` | v0.2.4 theo bảng Trung Châu phái do người dùng cung cấp, khóa Can năm xem; cần fixture Tuvi.vn để kiểm chứng trường phái. |
| **Cân Lượng** | Thông tin trung tâm | `MISSING_RULE` | TV-001 hiển thị 3 lượng 4 chỉ; MD chưa có bảng/công thức. Cần module Cân Xương Tính Số và test độc lập. |
| **Lai Nhân Cung** | Thông tin trung tâm | `MISSING_RULE` | TV-001 hiển thị Tử Tức; MD chưa có công thức. Cần xác minh thuật toán trên nhiều chart Tuvi.vn. |
| **Bảng độ sáng Miếu/Vượng/Đắc/Bình/Hãm** | Thuộc tính sao | `MISSING_TABLE` | Không phải công thức vị trí. Chưa có bảng đầy đủ theo sao × 12 cung; cần nguồn/bộ fixture riêng, tuyệt đối không tự suy ra. |

### B. Có công thức ứng viên nhưng CHƯA xác minh với Tuvi.vn

| Sao / nhóm | Công thức ứng viên đã tìm thấy | Vấn đề cần test |
|---|---|---|
| **Thiên Vu** | Bảng theo tháng âm: 1/5/9→Tỵ; 2/6/10→Thân; 3/7/11→Dần; 4/8/12→Hợi | Test đủ 12 tháng trên Tuvi.vn. `CANDIDATE_IZTRO`. |
| **Thiên Nguyệt** | Bảng theo tháng âm đang ghi tại mục 6.9 | Test đủ 12 tháng; xác nhận tên/chữ Hán và vị trí trên Tuvi.vn. `CANDIDATE_IZTRO`. |
| **Âm Sát** | Bảng theo tháng âm đang ghi tại mục 6.9 | Test đủ 12 tháng trên Tuvi.vn. `CANDIDATE_IZTRO`. |
| **Thiên Y** | Ứng viên đồng cung Thiên Diêu; là sao riêng, TV-001 hiển thị đồng thời cả hai | Xác nhận vị trí cùng cung trong nhiều chart; không gộp ID. |
| **Thiên Trù nguyên cục** | Bảng theo Can năm; ứng viên iztro sửa Can Quý từ Tuất sang Hợi | Cần chart có năm sinh Can Quý. |
| **Giải Thần / Nguyệt Giải / Niên Giải** | Các nguồn phân tách cách an theo Phượng Các, tháng sinh hoặc năm xem | Chưa biết Tuvi.vn dùng một sao, nhiều sao hay tên hiển thị khác nhau. |
| **Phong Cáo** | MD dùng Văn Khúc − 2; mã iztro tương đương Dần + G; khẩu quyết có nguồn ghi chiều ngược | TV-001 giờ Ngọ không phân biệt được hai chiều; cần giờ không đối xứng. |
| **Hỏa Tinh / Linh Tinh** | MD cũ đổi chiều theo Âm Dương/giới tính; iztro candidate cho cả hai đếm thuận từ cung khởi | Chưa sửa chính thức; cần giờ Dần/Thìn/Dậu và cả Nam/Nữ. |
| **Địa Không / Địa Kiếp** | Hợi khởi giờ Tý; Không nghịch, Kiếp thuận theo giờ | TV-001 giờ Ngọ không phân biệt được hai chiều. Bộ fixture đã có nhiều giờ ngoài Ngọ; cần transcribe vị trí từ ảnh hiện có trước, chỉ tạo fixture mới nếu ảnh không đủ rõ. |
| **Thiên Khôi / Thiên Việt** | Có các bảng theo Can năm ở MD/iztro và bảng khác ở nội dung Tuvi.vn | TV-001 không đủ để biết Tuvi.vn lấy Can năm hay Can ngày; cần fixture tách biệt hai Can. |
| **Tuần / Triệt / Tuần Không / Triệt Không** | Có cách an phổ thông và biến thể iztro/Trung Châu khác nhau | Chưa chọn engine mặc định; cần ảnh thấy rõ hai cung và nhiều Can năm. |
| **Vòng Tướng Tiền** | Có đủ chuỗi 12 sao và bảng cung khởi trong iztro | Chỉ là candidate; cần xác nhận Tuvi.vn có hiển thị vòng này ở layer lưu niên và đúng thứ tự. |
| **Vòng Tuế Tiền** | Khởi tại chi năm xem, đi thuận theo 12 tên trong tài liệu iztro | Chỉ là candidate; không đồng nhất với vòng Thái Tuế bản mệnh đang có trong MD. |
| **Toàn bộ 21 lưu diệu người dùng liệt kê** | Một số placement có thể suy ra từ sao gốc (ví dụ Lưu Kình/Lưu Đà quanh Lưu Lộc Tồn; Lưu Hóa theo Can năm xem) | Chưa có bộ công thức 21 sao được xác minh trọn vẹn trên Tuvi.vn. Giữ nguyên danh sách người dùng làm baseline, không đánh dấu đủ/đúng chỉ theo iztro. |
| **Lưu Thiên Hỷ** | Có thể là đối cung Lưu Hồng Loan trong một số bảng | Chưa xác minh trên Tuvi.vn; không tự chốt. |
| **Lưu Đà La** | Có thể suy ra từ Lưu Lộc Tồn − 1 theo công thức sao gốc | Chưa xác minh scope/naming trên Tuvi.vn. |
| **Mệnh Chủ** | TV-001 chỉ ra tra theo chi năm sinh (Canh Tuất → Lộc Tồn) thay vì chi cung Mệnh | Cần test đủ 12 chi năm sinh. |
| **Mệnh Chủ/Thân Chủ và các bảng sao theo Can/Chi** | Có bảng ứng viên trong MD và tài liệu nguồn | Mọi bảng phải test đa fixture; TV-001 chỉ xác nhận một trường hợp. |

### C. Các sao cần phân biệt ID / alias / tầng, không coi là thiếu công thức một cách máy móc

| Tên | Cách xử lý hiện tại |
|---|---|
| Thiên Riêu / Thiên Diêu | Một sao 天姚; một ID, lưu alias. |
| Thiên Y / Thiên Diêu | Hai sao riêng; có thể cùng một cung. TV-001 hiển thị đồng thời cả hai. |
| Đài Phụ / Thai Phụ | Ứng viên cùng sao 台輔; một ID và hai alias cho tới khi Tuvi.vn xác nhận tên hiển thị. |
| Phi Liêm 飛廉 / Phi Liêm 蜚廉 | Hai sao khác chữ Hán, hai ID, hai công thức. |
| Hàm Trì / Đào Hoa | Có nguồn coi là tên đồng nghĩa 咸池; Tuvi.vn hiển thị Đào Hoa. Cần giữ alias và phân biệt layer bản mệnh/lưu. |
| Hoa Cái, Kiếp Sát, Tang Môn, Quan Phù, Tiểu Hao, Đại Hao, Long Đức, Bạch Hổ, Điếu Khách, Bệnh Phù | Có thể xuất hiện ở nhiều vòng hoặc layer. Mỗi placement phải có `scope` riêng; không ghi đè vị trí nguyên cục. |
| Tuần Không / Triệt Không / Không Vong | Chưa gộp; cần ảnh/chữ Hán và rule của Tuvi.vn. |
| Văn Tinh / Lưu Niên Văn Tinh | Chưa xác định là cùng một ID hay khác; không tự hợp nhất. |

### D. Danh sách việc để sau — không triển khai mặc định trước khi có nguồn/fixture

1. Tìm công thức Đường Phù.
2. Xác định Không Vong có phải sao độc lập và tìm placement riêng.
3. Đã code hóa Lưu Tuần Không, Lưu Triệt Không, Lưu Thiên Không, Lưu Văn Tinh, Lưu Văn Xương và Lưu Văn Khúc theo bảng người dùng cung cấp ở v0.2.4; còn cần fixture Tuvi.vn để xác minh. Tiếp tục xác minh riêng Lưu Thiên Trù.
4. Tìm công thức Tuvi.vn cho Lưu Phúc Đức, Lưu Long Đức, Lưu Thiên Đức, Lưu Nguyệt Đức, Lưu Kiếp Sát và Lưu Thiên Việt; các quy tắc Lưu Văn Xương/Lưu Văn Khúc đã có bảng Trung Châu phái do người dùng cung cấp nhưng vẫn cần fixture đối chiếu.
5. Xác minh toàn bộ 21 lưu diệu bằng cách giữ nguyên ngày sinh và thay đổi năm xem (ví dụ 2026/2027).
6. Hoàn thiện bảng độ sáng sao.
7. Tìm công thức Cân Lượng và Lai Nhân Cung.
8. Chỉ nâng trạng thái từ `candidate`/`conflict`/`todo` lên `verified` khi kết quả khớp nhiều fixture Tuvi.vn có biến đầu vào phân biệt được.

---

---

## 1. Các quyết định đã chốt với người dùng

| # | Hạng mục | Quyết định cuối cùng |
|---|---|---|
| D1 | Nguồn chuẩn | **Tuvi.vn là chuẩn đầu ra chính.** Khi MD khác kết quả Tuvi.vn, phải rà soát và điều chỉnh để khớp Tuvi.vn. iztro dùng làm nguồn công thức tham khảo/giả thuyết; Vương Đình Chi chỉ tham khảo, không ghi đè Tuvi.vn. |
| D2 | Trường phái | Người dùng ban đầu gọi là Nam phái. Sau khi kiểm tra, không gán nhãn toàn bộ thuật toán của Tuvi.vn cho một phái cụ thể khi chưa có tài liệu chính thức. Có thể ghi “định hướng Nam phái/Tam Hợp” trong phần mô tả, nhưng **hệ quy tắc vận hành là bộ quy tắc tái tạo Tuvi.vn**. |
| D3 | Đối tượng | Website công khai, phục vụ nhiều người dùng; không cần đăng nhập/tài khoản. |
| D4 | Thiết bị | Máy tính và điện thoại. Trên điện thoại vẫn giữ lá số 4×4, cho phép phóng to/thu nhỏ; không chuyển thành danh sách 12 cung. |
| D5 | Triển khai | Online bằng URL. |
| D6 | Năm sinh | Hỗ trợ 1900–2100. |
| D7 | Ngày nhập | Chỉ nhập ngày dương lịch; website tự đổi sang âm lịch. |
| D8 | Giờ nhập | Nhập `HH:mm`; tự xác định địa chi giờ. Ví dụ 10:00 là giờ Tỵ. |
| D9 | Không rõ giờ | Cho phép chọn “Không rõ giờ sinh”. Không tự gán giờ; đánh dấu các thành phần phụ thuộc giờ là chưa xác định. |
| D10 | Giới tính | Bắt buộc chọn Nam hoặc Nữ. |
| D11 | Múi giờ | Dùng UTC+7 cố định cho tất cả trường hợp nhập. Không hỏi nơi sinh, không tra kinh độ, không hiệu chỉnh giờ Lạc Dương/giờ mặt trời thật, không xử lý lịch sử múi giờ hoặc DST. Nếu sinh ở nước ngoài, người dùng tự quy đổi giờ về giờ Việt Nam trước khi nhập. |
| D12 | Mốc đổi ngày | **00:00**. 23:00–23:59 vẫn thuộc ngày hiện tại, địa chi giờ Tý; 00:00–00:59 thuộc ngày mới, địa chi giờ Tý. Theo fixture Tuvi.vn HOUR-02, Can giờ trong 23:00–23:59 dùng Can của ngày kế tiếp, nhưng Can Chi ngày hiển thị vẫn giữ ngày hiện tại. |
| D13 | Tháng nhuận | **Đã cập nhật theo ảnh Tuvi.vn ngày 05/11/2026:** dùng đúng số tháng âm nhuận trong toàn bộ tháng, không chuyển sang tháng kế ở ngày 16. Quy tắc ban đầu ngày 1–15/16+ đã bị thay thế vì không khớp LEAP-03/04 và LEAP-08/09. |
| D14 | Danh mục sao | Dùng danh sách người dùng cung cấp: 14 chính tinh + 14 phụ tinh + 37 tạp diệu + 48 thần sát + 4 Tứ Hóa; danh sách lưu diệu ban đầu gồm 21 sao. Không ép danh mục phải có số lượng duy nhất nếu có sao lặp tên theo tầng vận hoặc khác chữ Hán. |
| D15 | Tràng Sinh Thổ Ngũ Cục | Khởi tại cung Thân. |
| D16 | Luận giải | Hai chế độ: (1) Tổng quan trọn đời; (2) Đại Hạn/Tiểu Hạn theo từng năm người dùng chọn. Người dùng tự chọn chế độ xem. |
| D17 | Chấm điểm | Không chấm điểm tốt/xấu theo thang số. Luận giải bằng sao, cung, cách cục và vận hạn. |
| D18 | Giao diện | Cổ điển phương Đông: giấy cổ, thư pháp, màu vàng nhạt/họa tiết truyền thống; bố cục lá số theo ảnh demo. |
| D19 | Màu sao | Theo ngũ hành của sao: Kim, Mộc, Thủy, Hỏa, Thổ; có chú giải. |
| D20 | Xuất | Xuất PDF. Không yêu cầu PNG/JPG trong MVP. |
| D21 | Công nghệ | React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide React + Motion (Framer Motion). |
| D22 | Lưu dữ liệu | Không có tài khoản; không lưu hồ sơ/lá số lâu dài trên máy chủ. Tính toán tại trình duyệt; không dùng localStorage/IndexedDB để lưu hồ sơ nếu người dùng chưa yêu cầu lại. |
| D23 | AI | Có thể tích hợp AI API ở giai đoạn sau. Không để API key trong frontend; khi triển khai AI cần backend/proxy bảo vệ khóa. |
| D24 | Quy trình | Ưu tiên đặc tả và rà soát công thức; engine đã được triển khai từng phần. Không tự chốt công thức candidate/conflict nếu chưa có bằng chứng Tuvi.vn. |

### Điều chỉnh lịch sử quan trọng

- D4 cũ trong MD v1.0 quy định 23:00 chuyển ngày. Quyết định đó đã bị thay thế. Quy tắc chính thức hiện tại là đổi ngày lúc **00:00**.
- Quyết định ban đầu “Vương Đình Chi làm chuẩn” cũng đã được thay thế. Hiện **Tuvi.vn là chuẩn đầu ra**.
- Hiệu chỉnh theo kinh độ/Lạc Dương đã bị người dùng yêu cầu bỏ hoàn toàn. Không đưa lại vào form hoặc logic.

---

## 2. Phạm vi sản phẩm

### 2.1 Làm trong MVP

1. Form nhập họ tên tùy chọn, giới tính bắt buộc, ngày dương lịch, giờ/phút hoặc “không rõ giờ”.
2. Đổi dương lịch sang âm lịch Việt Nam UTC+7; tính Can Chi năm/tháng/ngày/giờ.
3. An 12 cung, Mệnh/Thân, Cục, nạp âm, 14 chính tinh, phụ tinh, tạp diệu và các vòng sao theo danh mục đã chốt.
4. Hiển thị lớp bản mệnh, Đại Hạn, Tiểu Hạn/Lưu niên và các sao lưu theo năm xem.
5. Hai chế độ luận giải: Tổng quan; Đại Hạn/Tiểu Hạn từng năm.
6. Lá số 4×4 cổ điển, màu hành sao, độ sáng nếu đã có bảng nguồn, dấu hóa, Tuần/Triệt và chú giải.
7. Xuất PDF.
8. Bộ kiểm thử so khớp từng sao/từng cung với các lá số mẫu Tuvi.vn.

### 2.2 Không làm trong MVP

- Đăng nhập, tài khoản, thanh toán, lưu hồ sơ người dùng trên server.
- Đồng bộ lá số qua tài khoản hoặc lưu lịch sử lá số.
- AI luận giải real-time (để giai đoạn sau).
- Chấm điểm vận hạn.
- Hiệu chỉnh giờ theo nơi sinh/kinh độ/giờ mặt trời thật.
- Hỗ trợ nhập ngày âm; người dùng chỉ nhập ngày dương.

---

## 3. Kiến trúc và công nghệ

| Lớp | Công nghệ/đề xuất |
|---|---|
| Frontend | React 19, TypeScript |
| Build/dev | Vite |
| Styling | Tailwind CSS v4 |
| Icon | Lucide React |
| Motion | Motion (Framer Motion) |
| State | React state hoặc Zustand khi thật sự cần; không cần state toàn cục phức tạp ở MVP |
| Calendar | Module TypeScript riêng, tính dương → âm với timezone cố định UTC+7 |
| Engine Tử Vi | Pure functions, module theo nhóm sao và scope |
| Test | Vitest; fixture JSON từ Tuvi.vn |
| PDF | HTML print layout hoặc thư viện render PDF client-side; phải thử font tiếng Việt/chữ Hán và ngắt trang |
| Deploy | Static hosting phù hợp Vite; không cần backend cho chức năng lập lá số cơ bản |

**Nguyên tắc mã:** mọi hàm an sao là pure function; dữ liệu đầu vào rõ ràng; không gọi Date/locale ngầm trong engine. Truyền ngày giờ đã chuẩn hóa vào các hàm để test có tính lặp lại.

### Cấu trúc thư mục gợi ý

```text
tuvi/
├─ src/
│  ├─ app/
│  ├─ components/
│  │  ├─ BirthForm.tsx
│  │  ├─ ChartGrid.tsx
│  │  ├─ PalaceCell.tsx
│  │  ├─ CenterInfo.tsx
│  │  ├─ ReadingModeSelector.tsx
│  │  ├─ AnnualSelector.tsx
│  │  └─ PdfExport.tsx
│  ├─ lib/
│  │  ├─ calendar/
│  │  │  ├─ solar-to-lunar.ts
│  │  │  ├─ julian-day.ts
│  │  │  └─ can-chi.ts
│  │  ├─ tuvi/
│  │  │  ├─ constants.ts
│  │  │  ├─ palaces.ts
│  │  │  ├─ five-elements.ts
│  │  │  ├─ main-stars.ts
│  │  │  ├─ secondary-stars.ts
│  │  │  ├─ miscellaneous-stars.ts
│  │  │  ├─ annual-circles.ts
│  │  │  ├─ transformations.ts
│  │  │  ├─ emptiness-stars.ts
│  │  │  ├─ brightness.ts
│  │  │  ├─ fortunes.ts
│  │  │  └─ build-chart.ts
│  │  └─ catalog/
│  │     ├─ stars.catalog.json
│  │     └─ formulas.sources.json
│  └─ styles/
├─ tests/
│  ├─ calendar.test.ts
│  ├─ palaces.test.ts
│  ├─ stars.test.ts
│  ├─ fortunes.test.ts
│  └─ fixtures/
│     ├─ tuvi-tv001.json
│     └─ tuvi-fixtures.index.json
└─ README.md
```

---

## 4. Dữ liệu đầu vào, lịch âm và Can Chi

### 4.1 Mô hình đầu vào

```ts
type Gender = 'nam' | 'nu';
type BirthTime =
  | { kind: 'exact'; hour: number; minute: number }
  | { kind: 'unknown' };

interface BirthInput {
  name?: string;
  gender: Gender;              // bắt buộc
  solarDate: string;           // YYYY-MM-DD; chỉ nhập dương lịch
  birthTime: BirthTime;
  timezoneOffset: 7;           // cố định UTC+7, không cho nhập
}

interface LunarDate {
  year: number;
  month: number;                // tháng âm thực tế
  day: number;
  isLeapMonth: boolean;
}

interface CalendarContext {
  solarDate: string;
  localMinutes: number;
  timeBranch?: number;          // 0..11 nếu biết giờ
  lunar: LunarDate;
  placementLunarMonth?: number; // tháng dùng để an sao sau quy tắc tháng nhuận
  placementLunarYear?: number;  // dự phòng nếu sau này có quy tắc nguồn yêu cầu đổi năm bố trí
  yearCanChi: CanChi;
  monthCanChi: CanChi;
  dayCanChi: CanChi;
  hourCanChi?: CanChi;
  warnings: string[];
}
```

### 4.2 Quy ước địa chi giờ theo HH:mm

Index chi thống nhất trong engine:

| Index | Chi | Khoảng giờ |
|---:|---|---|
| 0 | Tý | 23:00–00:59 |
| 1 | Sửu | 01:00–02:59 |
| 2 | Dần | 03:00–04:59 |
| 3 | Mão | 05:00–06:59 |
| 4 | Thìn | 07:00–08:59 |
| 5 | Tỵ | 09:00–10:59 |
| 6 | Ngọ | 11:00–12:59 |
| 7 | Mùi | 13:00–14:59 |
| 8 | Thân | 15:00–16:59 |
| 9 | Dậu | 17:00–18:59 |
| 10 | Tuất | 19:00–20:59 |
| 11 | Hợi | 21:00–22:59 |

Công thức phút chính xác, với `minutes = hour * 60 + minute`:

```ts
const timeBranch = Math.floor((minutes + 60) / 120) % 12;
```

Kiểm thử bắt buộc:
- 10:00 → Tỵ.
- 10:59 → Tỵ.
- 11:00 → Ngọ.
- 22:59 → Hợi.
- 23:00 và 23:59 → Tý, vẫn cùng ngày dương hiện tại.
- 00:00 và 00:59 → Tý của ngày dương mới.
- 01:00 → Sửu.

### 4.3 Mốc đổi ngày

Ngày mới bắt đầu **00:00**. Không tăng ngày cho giờ 23:00–23:59. Khi nhập 00:00–00:59, ngày dương do người dùng nhập đã là ngày mới; không cộng/ngắt thêm ngày lần nữa.

Can Chi giờ phải dùng Can ngày của ngày lịch hiện tại:
- 23:00–23:59: Can ngày vẫn là ngày đang nhập; chi giờ Tý.
- 00:00–00:59: Can ngày là ngày dương mới; chi giờ Tý.

Không áp dụng “Tý sớm/Tý muộn” kiểu chuyển ngày lúc 23h trong MVP.

### 4.4 Đổi dương lịch sang âm lịch

- Dùng lịch âm Việt Nam theo UTC+7.
- Dải năm sinh 1900–2100.
- Lưu `isLeapMonth` trong kết quả đổi lịch, dù form không cho người dùng nhập trực tiếp tháng âm.
- Tách `actualLunarMonth` khỏi `placementLunarMonth` để xử lý tháng nhuận.
- Thuật toán phải test ít nhất 50 mốc: Tết, ngày sóc, ngày cuối tháng, tháng nhuận, ranh giới năm âm.

### 4.5 Quy tắc tháng nhuận — đã cập nhật theo fixture Tuvi.vn

**Kết luận hiện hành:** khi sinh trong tháng nhuận, tháng dùng để an Can Chi tháng, an Mệnh/Thân và các sao phụ thuộc tháng là chính số tháng âm được lịch trả về trong toàn bộ tháng nhuận. Không tự chuyển sang tháng kế tiếp từ ngày 16.

Bằng chứng Tuvi.vn:
- LEAP-03 (15/2 nhuận 2023) và LEAP-04 (16/2 nhuận 2023) đều ghi Can Chi tháng Ất Mão, Thủy Nhị Cục.
- LEAP-08 (15/6 nhuận 2025) và LEAP-09 (16/6 nhuận 2025) đều ghi Can Chi tháng Quý Mùi, Thổ Ngũ Cục.
- Các ảnh LEAP-02/05 và LEAP-07/10 bổ sung mốc đầu/cuối tháng nhuận. Ảnh nguồn và map 14 sao đã chép nằm ở `tests/fixtures/tuvi-vn-captured-20261105.json`.

Quy tắc cũ “ngày 1–15 giữ tháng, ngày 16+ chuyển tháng kế” là quyết định dự kiến trước khi có ảnh; **đã bị supersede** do không khớp đầu ra Tuvi.vn. Engine giữ riêng ngày/tháng âm thực tế (để hiển thị) và `placementMonth` (hiện bằng đúng số tháng âm trong toàn tháng nhuận).

### 4.6 Can Chi

Quy ước index: Can Giáp=0…Quý=9; Chi Tý=0…Hợi=11.

| Thành phần | Công thức đề xuất |
|---|---|
| Can năm | `mod(lunarYear + 6, 10)` |
| Chi năm | `mod(lunarYear + 8, 12)` |
| Chi tháng | `mod(lunarMonth + 1, 12)` (tháng 1 = Dần = 2) |
| Can tháng | `mod(2 * yearCan + lunarMonth + 1, 10)` |
| Can ngày | `mod(JDN + 9, 10)` |
| Chi ngày | `mod(JDN + 1, 12)` |
| Chi giờ | Công thức phút ở mục 4.2 |
| Can giờ | `mod(2 * dayCan + hourBranch, 10)` |

**Lỗi đã phát hiện trong MD v1.0/v1.1:** công thức Can tháng cũ ghi `mod(yearCan * 12 + lunarMonth + 3, 10)`. Công thức đó không khớp Ngũ Hổ Độn và cho kết quả sai ở TV-001. Công thức mới `mod(2*yearCan + lunarMonth + 1,10)` trả Kỷ Sửu cho tháng 12, năm Canh; Tuvi.vn TV-001 cũng hiển thị **Kỷ Sửu**. [Nguồn công thức Ngũ Hổ Độn](https://docs.iztro.com/learn/setup#1-%E5%AE%9A%E5%AF%85%E9%A6%96%E8%AF%80) · [Lá số TV-001](https://tuvi.vn/la-so-duong-nam-am-duong-nghich-ly-2-12-1910-ngo-13405?thang-xem=9&nam-xem=2026&day=1&hour=12&min=30&month=1&name=&year=1911&option=1).

**Ranh giới Can Chi năm:** dùng năm âm lịch theo kết quả chuyển lịch, không mặc định Lập Xuân. Đây là cấu hình dự án; phải giữ test giao thừa và ngày đầu năm. Tài liệu iztro có tuỳ chọn ranh giới vận hạn và từng bản phát hành đã sửa ranh giới ngày/tháng; không lấy mặc định thư viện làm chuẩn thay cho Tuvi.vn.

---

## 5. Quy ước chỉ số và các công thức lõi

### 5.1 Index địa bàn

| Chi | Tý | Sửu | Dần | Mão | Thìn | Tỵ | Ngọ | Mùi | Thân | Dậu | Tuất | Hợi |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |

```ts
function mod(n: number, m = 12): number {
  return ((n % m) + m) % m;
}
```

### 5.2 Âm dương và chiều thuận nghịch

- Can Dương: Giáp, Bính, Mậu, Canh, Nhâm.
- Can Âm: Ất, Đinh, Kỷ, Tân, Quý.
- Dương Nam / Âm Nữ: thuận (`dir = +1`).
- Âm Nam / Dương Nữ: nghịch (`dir = -1`).

```ts
const dir = (isYangYear && gender === 'nam') || (!isYangYear && gender === 'nu') ? 1 : -1;
```

### 5.3 An Mệnh và Thân

Từ Dần (index 2) coi là tháng Giêng, đếm thuận theo tháng âm; từ đó giờ Tý làm mốc, đếm nghịch đến giờ sinh để an Mệnh, đếm thuận để an Thân.

```ts
menh = mod(2 + (placementMonth - 1) - timeBranch);
than = mod(2 + (placementMonth - 1) + timeBranch);
```

Nếu giờ sinh không rõ thì Mệnh, Thân và mọi yếu tố phụ thuộc hai cung này phải là `unknown`; không gán giờ Tý mặc định.

### 5.4 An 12 cung chức

Từ Mệnh đi thuận theo địa bàn:

**Mệnh → Phụ Mẫu → Phúc Đức → Điền Trạch → Quan Lộc → Nô Bộc → Thiên Di → Tật Ách → Tài Bạch → Tử Tức → Phu Thê → Huynh Đệ.**

Có thể tính tên cung theo `mod(palaceIndex - menhIndex, 12)` nếu danh sách thứ tự được giữ theo chiều trên.

### 5.5 Can cung – Ngũ Hổ Độn

Can cung Dần theo Can năm:

| Can năm | Can cung Dần |
|---|---|
| Giáp, Kỷ | Bính |
| Ất, Canh | Mậu |
| Bính, Tân | Canh |
| Đinh, Nhâm | Nhâm |
| Mậu, Quý | Giáp |

Từ Dần đi thuận từng cung, Can tăng từng bậc.

### 5.6 Ngũ hành Cục

Cục tra từ Can Chi cung Mệnh. MD hiện có công thức rút gọn:

- Giá trị Can: Giáp/Ất=1; Bính/Đinh=2; Mậu/Kỷ=3; Canh/Tân=4; Nhâm/Quý=5.
- Giá trị Chi: Tý/Sửu/Ngọ/Mùi=0; Dần/Mão/Thân/Dậu=1; Thìn/Tỵ/Tuất/Hợi=2.
- `s = canValue + branchValue`; nếu `s > 5` thì trừ 5.
- Hành: 1=Kim, 2=Thủy, 3=Hỏa, 4=Thổ, 5=Mộc.
- Cục: Thủy nhị (2), Mộc tam (3), Kim tứ (4), Thổ ngũ (5), Hỏa lục (6).

**Trạng thái:** công thức phải được test đủ 60 Can Chi cung Mệnh và so sánh với nạp âm/cục mà Tuvi.vn trả về; TV-001 cho **Mộc Tam Cục**.

### 5.7 Nạp âm bản mệnh

Tra bảng 60 Hoa Giáp đầy đủ; không suy ra bằng bảng Ngũ Hành Cục. TV-001: **Thoa Xuyến Kim**.

### 5.8 Mệnh Chủ và Thân Chủ

**Mệnh Chủ:** MD cũ ghi tra theo chi cung Mệnh. Điều này không khớp TV-001: năm sinh Canh Tuất, cung Mệnh Mùi, nhưng Tuvi.vn ghi **Lộc Tồn**. Bảng lookup hiện có cho chi Tuất = Lộc Tồn. Tài liệu iztro cũng ghi rõ thuật toán Trung Châu có thể tra Mệnh Chủ theo **chi năm sinh**, thay vì chi cung Mệnh. Vì vậy, cấu hình tái tạo Tuvi.vn dùng **birthYear.branch** làm khóa tra Mệnh Chủ. `MATCH_TV001`, cần test thêm các chi năm khác.

Bảng tra theo chi dùng cho cấu hình này (giữ dữ liệu MD, đổi khóa tra):

| Chi năm sinh | Mệnh Chủ |
|---|---|
| Tý | Tham Lang |
| Sửu | Cự Môn |
| Dần | Lộc Tồn |
| Mão | Văn Khúc |
| Thìn | Liêm Trinh |
| Tỵ | Vũ Khúc |
| Ngọ | Phá Quân |
| Mùi | Vũ Khúc |
| Thân | Liêm Trinh |
| Dậu | Văn Khúc |
| Tuất | Lộc Tồn |
| Hợi | Cự Môn |

**Thân Chủ:** tra theo chi năm sinh, giữ bảng MD hiện tại:

| Chi năm sinh | Thân Chủ |
|---|---|
| Tý | Linh Tinh |
| Sửu | Thiên Tướng |
| Dần | Thiên Lương |
| Mão | Thiên Đồng |
| Thìn | Văn Xương |
| Tỵ | Thiên Cơ |
| Ngọ | Hỏa Tinh |
| Mùi | Thiên Tướng |
| Thân | Thiên Lương |
| Dậu | Thiên Đồng |
| Tuất | Văn Xương |
| Hợi | Thiên Cơ |

TV-001: **Chủ Mệnh Lộc Tồn; Chủ Thân Văn Xương**.

### 5.9 An Tử Vi và Thiên Phủ

Với Cục `C` (2–6) và ngày âm dùng để an sao `D`:

1. Tìm số nhỏ nhất `x >= 0` sao cho `(D + x)` chia hết cho `C`.
2. `q = (D + x) / C`.
3. Từ Dần đếm thuận `q` cung đến `base`.
4. Nếu `x` chẵn: Tử Vi đi thuận thêm `x`; nếu `x` lẻ: Tử Vi đi nghịch `x`.
5. Thiên Phủ đối xứng Tử Vi theo công thức địa bàn tương ứng.

Với index Tý=0…Hợi=11, MD sử dụng:

```ts
const q = (day + x) / cuc;
const base = mod(2 + q - 1);
const tuVi = x % 2 === 1 ? mod(base - x) : mod(base + x);
const thienPhu = mod(4 - tuVi);
```

Công thức này khớp mô tả và ví dụ trong mã nguồn iztro. TV-001 là ngày âm 2, Mộc Tam Cục; vị trí 14 chính tinh trong trang Tuvi.vn là fixture để kiểm tra. `READY_FOR_TEST`.

### 5.10 14 chính tinh

**Tử Vi hệ – đi nghịch từ Tử Vi:**

| Sao | Vị trí |
|---|---|
| Tử Vi | `TV` |
| Thiên Cơ | `TV - 1` |
| (trống) | `TV - 2` |
| Thái Dương | `TV - 3` |
| Vũ Khúc | `TV - 4` |
| Thiên Đồng | `TV - 5` |
| (trống) | `TV - 6`, `TV - 7` |
| Liêm Trinh | `TV - 8` |

**Thiên Phủ hệ – đi thuận từ Thiên Phủ:**

| Sao | Vị trí |
|---|---|
| Thiên Phủ | `TP` |
| Thái Âm | `TP + 1` |
| Tham Lang | `TP + 2` |
| Cự Môn | `TP + 3` |
| Thiên Tướng | `TP + 4` |
| Thiên Lương | `TP + 5` |
| Thất Sát | `TP + 6` |
| (trống) | `TP + 7`, `+8`, `+9` |
| Phá Quân | `TP + 10` |

Không tự an 14 sao bằng 14 bảng độc lập; chúng được suy ra từ vị trí Tử Vi và Thiên Phủ.

---

## 6. Rà soát công thức phụ tinh và tạp diệu

### 6.1 Lục Cát: Tả Phù, Hữu Bật, Văn Xương, Văn Khúc, Thiên Khôi, Thiên Việt

| Sao | Công thức/khẩu quyết ứng viên | Trạng thái |
|---|---|---|
| Tả Phù | Từ Thìn đếm thuận theo tháng âm: `mod(4 + M - 1)` | `CANDIDATE_IZTRO`; MD có |
| Hữu Bật | Từ Tuất đếm nghịch theo tháng âm: `mod(10 - (M - 1))` | `CANDIDATE_IZTRO`; MD có |
| Văn Xương | Từ Tuất đếm nghịch theo giờ: `mod(10 - G)` | `CANDIDATE_IZTRO`; MD có |
| Văn Khúc | Từ Thìn đếm thuận theo giờ: `mod(4 + G)` | `CANDIDATE_IZTRO`; MD có |
| Thiên Khôi | Bảng tra theo Can, đang có dị bản | `CONFLICT`; xem dưới |
| Thiên Việt | Bảng tra theo Can, đang có dị bản | `CONFLICT`; xem dưới |

**Thiên Khôi/Thiên Việt là điểm xung đột rõ:** MD cũ và iztro dùng bảng Can năm, trong đó Canh → Sửu/Mùi. Nhưng TV-001 là Canh Tuất và trang Tuvi.vn hiển thị Thiên Khôi ở Ngọ, Thiên Việt ở Dần; bảng nội dung SEO riêng của Tuvi.vn lại ghi Thiên Khôi Canh/Tân ở Thân, cũng không khớp trực tiếp với chart. Không được tự kết luận đây là Can ngày Tân chỉ từ một lá số. **Cần thêm fixture có Can năm và Can ngày khác nhau**, rồi xem vị trí Khôi/Việt trên Tuvi.vn.

### 6.2 Lộc Tồn, Kình Dương, Đà La, Thiên Mã

**Lộc Tồn theo Can năm:**

| Can năm | Lộc Tồn |
|---|---|
| Giáp | Dần |
| Ất | Mão |
| Bính, Mậu | Tỵ |
| Đinh, Kỷ | Ngọ |
| Canh | Thân |
| Tân | Dậu |
| Nhâm | Hợi |
| Quý | Tý |

- Kình Dương: cung kế tiếp theo chiều thuận từ Lộc Tồn (`Lộc + 1`).
- Đà La: cung trước Lộc Tồn (`Lộc - 1`).
- Thiên Mã theo chi năm: Dần/Ngọ/Tuất→Thân; Thân/Tý/Thìn→Dần; Tỵ/Dậu/Sửu→Hợi; Hợi/Mão/Mùi→Tỵ.

MD và công thức iztro cơ bản thống nhất. TV-001: Lộc Tồn ở Thân, Kình/Đà cần so với đúng tầng bản mệnh/lưu hạn.

### 6.3 Địa Không và Địa Kiếp

- Khởi từ Hợi ở giờ Tý.
- Địa Kiếp đếm thuận theo giờ: `mod(11 + G)`.
- Địa Không đếm nghịch theo giờ: `mod(11 - G)`.

MD hiện tại đúng với khẩu quyết và mã nguồn iztro. Tuy nhiên TV-001 sinh giờ Ngọ (G=6), hai phép thuận/nghịch cách nhau sáu cung và có thể trùng vị trí đối diện; không dùng riêng fixture này để xác nhận chiều. Cần thêm lá số giờ Dần/Thìn/Dậu.

### 6.4 Hỏa Tinh và Linh Tinh — công thức MD đang có khả năng sai

Bảng cung khởi tại giờ Tý theo chi năm:

| Nhóm chi năm | Hỏa Tinh khởi | Linh Tinh khởi |
|---|---|---|
| Dần, Ngọ, Tuất | Sửu | Mão |
| Thân, Tý, Thìn | Dần | Tuất |
| Tỵ, Dậu, Sửu | Mão | Tuất |
| Hợi, Mão, Mùi | Dậu | Tuất |

Mã nguồn và khẩu quyết iztro mô tả **cả Hỏa Tinh và Linh Tinh cùng đếm thuận** từ hai cung khởi theo giờ Tý:

```ts
hoaTinh = mod(hoaStart + G);
linhTinh = mod(linhStart + G);
```

MD cũ lại cho Hỏa/Linh đổi chiều theo Âm Dương và giới tính. Đây là một khác biệt có khả năng là lỗi nếu mục tiêu là iztro, nhưng **chưa được phép sửa chính thức theo iztro** vì Tuvi.vn là chuẩn chính. TV-001 sinh giờ Ngọ (6 cung), thuận và nghịch đều có thể đến cùng cung đối diện, không phân biệt được. Trạng thái `CONFLICT/TODO_FIXTURE`.

### 6.5 Vòng Thái Tuế bản mệnh (12 sao)

MD v1.0 có chuỗi theo chi năm, đi thuận:

**Thái Tuế → Thiếu Dương → Tang Môn → Thiếu Âm → Quan Phù → Tử Phù → Tuế Phá → Long Đức → Bạch Hổ → Phúc Đức → Điếu Khách → Trực Phù.**

Đây là chuỗi thấy được trong lá số Tuvi.vn TV-001 và cần giữ độc lập. **Không thay chuỗi này bằng vòng Tuế Tiền (Tuế Kiện, Hối Khí, Quán Tác...)** của tài liệu 48 thần sát iztro; hai danh sách có tên gần nhau nhưng không phải một chuỗi đồng nhất.

### 6.6 Vòng Bác Sĩ (12 sao)

Bác Sĩ cùng cung Lộc Tồn, sau đó an 12 sao theo chiều `dir`:

**Bác Sĩ → Lực Sĩ → Thanh Long → Tiểu Hao → Tướng Quân → Tấu Thư → Phi Liêm (飛廉) → Hỷ Thần → Bệnh Phù → Đại Hao → Phục Binh → Quan Phủ.**

Giữ riêng Phi Liêm `飛廉` của vòng này với Phi Liêm `蜚廉` trong 37 tạp diệu; khác chữ Hán, khác công thức.

### 6.7 Vòng Tràng Sinh (12 sao)

| Cục | Cung khởi Tràng Sinh |
|---|---|
| Thủy nhị cục | Thân |
| Mộc tam cục | Hợi |
| Kim tứ cục | Tỵ |
| Thổ ngũ cục | Thân |
| Hỏa lục cục | Dần |

An theo `dir`:

**Tràng Sinh → Mộc Dục → Quan Đới → Lâm Quan → Đế Vượng → Suy → Bệnh → Tử → Mộ → Tuyệt → Thai → Dưỡng.**

Cách gọi “Trường Sinh” trong một số nguồn là biến thể tên; tên hiển thị chính trong dự án dùng **Tràng Sinh**, alias `Trường Sinh`. Thổ Ngũ Cục tại Thân là lựa chọn người dùng đã chốt.

### 6.8 Phụ tinh/tạp diệu theo chi năm

| Sao | Công thức hiện có/ứng viên |
|---|---|
| Thiên Mã | Bảng nhóm tam hợp chi năm ở mục 6.2 |
| Hàm Trì / Đào Hoa (咸池) | Tý/Thìn/Thân→Dậu; Sửu/Tỵ/Dậu→Ngọ; Dần/Ngọ/Tuất→Mão; Mão/Mùi/Hợi→Tý. Tuvi.vn hiển thị “Đào Hoa”; danh sách người dùng ghi “Hàm Trì”. Tạm giữ một bản ghi sao có alias, nhưng tách scope bản mệnh và lưu niên. |
| Hoa Cái | Tý/Thìn/Thân→Thìn; Sửu/Tỵ/Dậu→Sửu; Dần/Ngọ/Tuất→Tuất; Mão/Mùi/Hợi→Mùi |
| Kiếp Sát | Thân/Tý/Thìn→Tỵ; Hợi/Mão/Mùi→Thân; Dần/Ngọ/Tuất→Hợi; Tỵ/Dậu/Sửu→Dần |
| Hồng Loan | Từ Mão đếm nghịch đến chi năm: `mod(3 - Z)` |
| Thiên Hỷ | Đối cung Hồng Loan: `mod(HongLoan + 6)` |
| Long Trì | Từ Thìn đếm thuận đến chi năm: `mod(4 + Z)` |
| Phượng Các | Từ Tuất đếm nghịch đến chi năm: `mod(10 - Z)` |
| Thiên Khốc | Từ Ngọ đếm nghịch đến chi năm: `mod(6 - Z)` |
| Thiên Hư | Từ Ngọ đếm thuận đến chi năm: `mod(6 + Z)` |
| Thiên Đức | Từ Dậu đếm thuận đến chi năm: `mod(9 + Z)` |
| Nguyệt Đức | Từ Tỵ đếm thuận đến chi năm: `mod(5 + Z)` |
| Thiên Không | Cung kế tiếp Thái Tuế: `mod(Z + 1)` |
| Thiên Tài | Từ Mệnh đếm thuận đến chi năm: `mod(Menh + Z)` |
| Thiên Thọ | Từ Thân đếm thuận đến chi năm: `mod(Than + Z)` |
| Cô Thần/Quả Tú | Hợi/Tý/Sửu→Cô Dần, Quả Tuất; Dần/Mão/Thìn→Cô Tỵ, Quả Sửu; Tỵ/Ngọ/Mùi→Cô Thân, Quả Thìn; Thân/Dậu/Tuất→Cô Hợi, Quả Mùi |
| Phá Toái | Tý/Ngọ/Mão/Dậu→Tỵ; Dần/Thân/Tỵ/Hợi→Dậu; Thìn/Tuất/Sửu/Mùi→Sửu |
| Phi Liêm (蜚廉) | Tý/Sửu/Dần→Thân/Dậu/Tuất tương ứng; Mão/Thìn/Tỵ→Tỵ/Ngọ/Mùi; Ngọ/Mùi/Thân→Dần/Mão/Thìn; Dậu/Tuất/Hợi→Hợi/Tý/Sửu. Đây là sao khác Phi Liêm 飛廉 của vòng Bác Sĩ. |

### 6.9 Phụ tinh theo tháng âm

| Sao | Công thức/tra bảng |
|---|---|
| Thiên Hình | Từ Dậu khởi tháng 1, đi thuận đến tháng sinh: `mod(9 + M - 1)` |
| Thiên Diêu (天姚) | Từ Sửu khởi tháng 1, đi thuận: `mod(1 + M - 1)`; MD cũ dùng tên “Thiên Riêu”, chuyển thành alias. |
| Thiên Y | Cùng cung với Thiên Diêu theo các nguồn an sao phổ biến; **là sao riêng, không phải bí danh của Thiên Diêu**. TV-001 Tuvi.vn hiển thị đồng thời Thiên Y và Thiên Diêu. MD có công thức nhưng catalog người dùng chưa liệt kê; bổ sung thành mục phụ tinh ngoài 117 cho tới khi chốt cách đếm. |
| Thiên Giải / Nguyệt Giải | Tháng 1–2 tại Thân; 3–4 tại Tuất; 5–6 tại Tý; 7–8 tại Dần; 9–10 tại Thìn; 11–12 tại Ngọ. Cần lưu đúng tên sao theo Tuvi.vn; không gộp với Niên Giải. |
| Địa Giải | MD: từ Mùi đếm thuận theo tháng: `mod(7 + M - 1)`. TV-001 hiển thị Địa Giải; cần test thêm. |
| Thiên Nguyệt | Bảng theo tháng 1→Tuất, 2→Tỵ, 3→Thìn, 4→Dần, 5→Mùi, 6→Mão, 7→Hợi, 8→Mùi, 9→Dần, 10→Ngọ, 11→Tuất, 12→Dần. `CANDIDATE_IZTRO`. |
| Thiên Vu | Tháng 1/5/9→Tỵ; 2/6/10→Thân; 3/7/11→Dần; 4/8/12→Hợi. `CANDIDATE_IZTRO`. |
| Âm Sát | Tháng 1/7→Dần; 2/8→Tý; 3/9→Tuất; 4/10→Thân; 5/11→Ngọ; 6/12→Thìn. `CANDIDATE_IZTRO`. |

### 6.10 Phụ tinh theo ngày

| Sao | Cách an |
|---|---|
| Tam Thai | Từ cung Tả Phù làm ngày 1, đếm thuận `D - 1` cung |
| Bát Tọa | Từ cung Hữu Bật làm ngày 1, đếm nghịch `D - 1` cung |
| Ân Quang | Từ Văn Xương làm ngày 1, đếm thuận `D - 1`, sau đó lùi 1 cung |
| Thiên Quý | Từ Văn Khúc làm ngày 1, đếm thuận `D - 1`, sau đó lùi 1 cung |

### 6.11 Phụ tinh theo giờ

| Sao | Cách an | Trạng thái |
|---|---|---|
| Đài Phụ (台輔) / Thai Phụ | Khẩu quyết: Ngọ khởi giờ Tý, đếm thuận đến giờ sinh. MD dùng Văn Khúc `+2`, tương đương cách tính này trong index đang dùng. Dùng tên hiển thị Tuvi.vn “Thai Phụ” hoặc tên người dùng “Đài Phụ” theo quyết định thống nhất; một ID, hai alias. | `CANDIDATE_IZTRO` |
| Phong Cáo (封誥) | Tài liệu khẩu quyết iztro ghi “Dần khởi giờ Tý, đếm nghịch”; nhưng mã nguồn iztro 2.6.4 tính `Dần + G` (thuận). MD cũ dùng `Văn Khúc - 2`, tương đương `Dần + G`. TV-001 sinh giờ Ngọ nên thuận/nghịch sáu cung có thể trùng. | `CONFLICT/TODO_FIXTURE` |
| Đẩu Quân | Từ Thái Tuế (chi năm xem) đếm nghịch tháng sinh, sau đó thuận đến giờ sinh; cung dừng là tháng Giêng của lưu nguyệt. MD công thức: `mod(Z_yearViewed - (M-1) + G)`. Cần test qua nhiều năm xem. | `CANDIDATE_IZTRO` |

### 6.12 Phụ tinh theo Can năm

| Sao | Bảng vị trí theo Can |
|---|---|
| Thiên Quan | Giáp–Mùi; Ất–Thìn; Bính–Tỵ; Đinh–Dần; Mậu–Mão; Kỷ–Dậu; Canh–Hợi; Tân–Dậu; Nhâm–Tuất; Quý–Ngọ |
| Thiên Phúc (天福) | Giáp–Dậu; Ất–Thân; Bính–Tý; Đinh–Hợi; Mậu–Mão; Kỷ–Dần; Canh–Ngọ; Tân–Tỵ; Nhâm–Ngọ; Quý–Tỵ |
| Thiên Trù | Giáp–Tỵ; Ất–Ngọ; Bính–Tý; Đinh–Tỵ; Mậu–Ngọ; Kỷ–Thân; Canh–Dần; Tân–Ngọ; Nhâm–Dậu; **Quý–Hợi** |
| Lưu Hà | Giáp–Dậu; Ất–Tuất; Bính–Mùi; Đinh–Thìn; Mậu–Tỵ; Kỷ–Ngọ; Canh–Thân; Tân–Mão; Nhâm–Hợi; Quý–Dần |
| Quốc Ấn | `Lộc Tồn + 8` theo index địa bàn; cần kiểm tra vị trí trên nhiều lá số Tuvi.vn |
| Lưu Niên Văn Tinh / Văn Tinh | MD có bảng ứng viên: Giáp–Tỵ; Ất–Ngọ; Bính–Thân; Đinh–Dậu; Mậu–Thân; Kỷ–Dậu; Canh–Hợi; Tân–Tý; Nhâm–Dần; Quý–Mão. Tuvi.vn có lúc hiển thị “Văn Tinh”, cần xác minh cùng ID với Lưu Niên Văn Tinh hay không. |
| Đường Phù | MD chưa có công thức. TV-001 có hiển thị Đường Phù; cần tìm bảng an riêng. `MISSING_RULE`. |

**Lỗi cụ thể cần sửa trong MD:** bảng Thiên Trù cũ ghi Can Quý tại Tuất; iztro docs/source code ghi Quý tại Hợi. Cập nhật giá trị ứng viên thành Hợi nhưng giữ trạng thái `CANDIDATE_IZTRO/TODO_FIXTURE` cho tới khi có lá số năm Quý trên Tuvi.vn.

### 6.13 Thiên Thương và Thiên Sứ

MD cũ cố định Thiên Thương ở Nô Bộc và Thiên Sứ ở Tật Ách. Mã nguồn iztro có nhánh Trung Châu: Dương Nam/Âm Nữ giữ bố cục đó; Âm Nam/Dương Nữ đổi hai sao cho nhau. Bộ fixture hiện đã có đủ bốn tổ hợp âm/dương năm × Nam/Nữ; cần trích riêng vị trí Thiên Thương/Thiên Sứ từ các ảnh phù hợp để kiểm tra trường hợp đổi vị trí.

**Thiết kế đề xuất:** cho phép `placementRule` nhận giới tính + âm dương năm; chưa gắn trạng thái verified với Tuvi.vn. Cần fixture Âm Nam và Dương Nữ.

### 6.14 Tuần, Triệt, Thiên Không, Không Vong

Không được gộp các tên sau chỉ vì đều có chữ “Không”:

- Thiên Không 天空.
- Địa Không 地空.
- Địa Kiếp 地劫.
- Tuần Không 旬空.
- Triệt Không / Triệt Lộ Không Vong 截空 / 截路空亡 (cần xác định cách viết Tuvi.vn).
- Không Vong 空亡 (tên trong danh mục 37 tạp diệu người dùng cung cấp).

**Khác biệt trong nguồn công thức:**
- MD phổ thông đang an Tuần phủ hai địa chi theo tuần Giáp và Triệt ở hai địa chi theo Can năm.
- iztro tài liệu Trung Châu hiện có logic riêng: tính một index Tuần Không có hiệu chỉnh theo âm dương; mã nguồn có biến `jieluIndex`, `kongwangIndex` và `jiekongIndex`, trong comment ghi Trung Châu không dùng `截路空亡` mà dùng một sao `截空` được chọn theo âm dương năm.
- Tài liệu tổng quát Tuvi.vn không công khai thuật toán Tuần/Triệt; TV-001 hiển thị nhãn Triệt và Tuần, nhưng chỉ một mẫu không đủ để phân biệt hai cách an.

**Quyết định:** không xóa công thức Tuần/Triệt hiện tại, nhưng hạ trạng thái về `CONFLICT`. Tạo hai engine candidate (phổ thông và biến thể iztro) trong test harness; chỉ một bộ sẽ trở thành mặc định sau khi khớp nhiều lá số Tuvi.vn. Không tự thêm Không Vong như một vị trí riêng nếu chưa quan sát thấy Tuvi.vn hiển thị tách biệt.

### 6.15 Vòng sao còn thiếu trong MD

**Vòng Thái Tuế bản mệnh** ở mục 6.5 phải được giữ độc lập.

**Vòng Tuế Tiền (岁前十二神) theo năm xem** – candidate iztro:

Tuế Kiện (Tuế Kiến) → Hối Khí → Tang Môn → Quán Tác → Quan Phù → Tiểu Hao → Đại Hao → Long Đức → Bạch Hổ → Thiên Đức → Điếu Khách → Bệnh Phù.

Khởi tại chi của năm đang xem, sau đó đi thuận theo thứ tự. Đây là vòng lưu niên, không đồng nhất với chuỗi Thái Tuế bản mệnh trong MD.

**Vòng Tướng Tiền (将前十二神) theo năm xem** – candidate iztro:

| Nhóm chi năm xem | Tướng Tinh khởi |
|---|---|
| Dần, Ngọ, Tuất | Ngọ |
| Thân, Tý, Thìn | Tý |
| Tỵ, Dậu, Sửu | Dậu |
| Hợi, Mão, Mùi | Mão |

Từ Tướng Tinh đi thuận:

**Tướng Tinh → Phan Án (攀鞍) → Tuế Dịch (岁驿) → Tức Thần (息神) → Hoa Cái → Kiếp Sát → Tai Sát (灾煞) → Thiên Sát → Chỉ Bối → Hàm Trì → Nguyệt Sát → Vong Thần.**

Tài liệu 48 thần sát iztro xác định hai vòng Tướng Tiền và Tuế Tiền chạy theo lưu niên, trong khi Tràng Sinh và Bác Sĩ cố định từ lúc sinh. Đây là quy tắc ứng viên; chỉ đưa vào giao diện mặc định khi Tuvi.vn xác nhận.

### 6.16 Bảng độ sáng

MD có mục Miếu/Vượng/Đắc/Bình/Hãm nhưng chưa có bảng dữ liệu hoàn chỉnh. Không thể suy ra độ sáng bằng công thức vị trí sao. Phải có bảng nguồn cho từng sao và 12 địa chi.

TV-001 hiển thị trạng thái riêng cho nhiều chính tinh/phụ tinh (ví dụ Thiên Tướng Đắc, Cự Môn Vượng, Thất Sát Hãm…). Đây là nguồn fixture, không phải một bảng đầy đủ. Cần chụp/thu thập ít nhất 20 lá số để suy ra/đối chiếu bảng.

---

## 7. Danh mục sao và chuẩn hóa tên

### 7.1 Nguyên tắc catalog

Danh mục người dùng gửi được giữ nguyên làm danh sách mong muốn. Nhưng database **không nên ép mỗi tên Việt là một ID**; phải có chữ Hán, alias, nhóm, layer và rule.

```ts
interface StarDefinition {
  id: string;                   // ID ổn định, không phụ thuộc tên hiển thị
  hanzi?: string;               // chữ Hán để phân biệt sao đồng âm
  displayName: string;          // tên hiển thị mặc định theo Tuvi.vn
  aliases: string[];             // Thiên Riêu/Thiên Diêu, Thai Phụ/Đài Phụ...
  group: string;
  defaultScope: 'natal' | 'annual' | 'decadal' | 'monthly';
  element?: 'kim'|'moc'|'thuy'|'hoa'|'tho';
  ruleId?: string;
  sourceRefs: string[];
  status: 'verified'|'candidate'|'conflict'|'todo';
}

interface StarPlacement {
  starId: string;
  palaceIndex: number;
  scope: 'natal'|'decadal'|'annual'|'monthly';
  referenceYear?: number;
  referenceMonth?: number;
  transformations?: Array<{
    type: 'loc'|'quyen'|'khoa'|'ky';
    stem: string;
    scope: 'natal'|'decadal'|'annual'|'monthly'|'daily'|'hourly'|'palace';
  }>;
  brightness?: 'M'|'V'|'D'|'B'|'H';
  sourceStatus: 'verified'|'candidate'|'conflict'|'todo';
}
```

### 7.2 14 chính tinh

1. Tử Vi（紫微）
2. Thiên Cơ（天機）
3. Thái Dương（太陽）
4. Vũ Khúc（武曲）
5. Thiên Đồng（天同）
6. Liêm Trinh（廉貞）
7. Thiên Phủ（天府）
8. Thái Âm（太陰）
9. Tham Lang（貪狼）
10. Cự Môn（巨門）
11. Thiên Tướng（天相）
12. Thiên Lương（天梁）
13. Thất Sát（七殺）
14. Phá Quân（破軍）

### 7.3 14 phụ tinh

**Lục Cát:** Tả Phù（左輔）, Hữu Bật（右弼）, Thiên Khôi（天魁）, Thiên Việt（天鉞）, Văn Xương（文昌）, Văn Khúc（文曲）.

**Lục Sát:** Địa Không（地空）, Địa Kiếp（地劫）, Hỏa Tinh（火星）, Linh Tinh（鈴星）, Đà La（陀羅）, Kình Dương（擎羊）.

**Hai trợ tinh:** Thiên Mã（天馬）, Lộc Tồn（祿存）.

### 7.4 37 tạp diệu theo nhóm người dùng gửi

**Giao tiếp – 4:** Hồng Loan（紅鸞）, Thiên Hỷ（天喜）, Thiên Diêu（天姚）, Hàm Trì（咸池）.

**Cô độc/kiêu hãnh – 3:** Cô Thần（孤辰）, Quả Tú（寡宿）, Thiên Hình（天刑）.

**Nghệ thuật/tài năng – 4:** Long Trì（龍池）, Phượng Các（鳳閣）, Thiên Tài（天才）, Thiên Trù（天廚）.

**Phẩm cách/địa vị – 5:** Tam Thai（三台）, Bát Tọa（八座）, Ân Quang（恩光）, Thiên Quý（天貴）, Thiên Quan（天官）.

**Đời sống tinh thần – 6:** Thiên Khốc（天哭）, Thiên Hư（天虛）, Phá Toái（破碎）, Phi Liêm（蜚廉）, Hoa Cái（華蓋）, Âm Sát（陰煞）.

**May mắn – 4:** Giải Thần（解神）, Thiên Đức（天德）, Nguyệt Đức（月德）, Thiên Phúc（天福）.

**Sức khỏe – 4:** Thiên Thọ（天壽）, Thiên Thương（天傷）, Thiên Sứ（天使）, Thiên Nguyệt（天月）.

**Ban thưởng – 3:** Thiên Vu（天巫）, Đài Phụ（台輔）, Phong Cáo（封誥）.

**Tư duy/không – 4:** Thiên Không（天空）, Tuần Không（旬空）, Triệt Không（截空/截路空亡）, Không Vong（空亡）.

### 7.5 48 thần sát theo danh sách người dùng

**A. Vòng Tràng Sinh – 12:** Tràng Sinh（長生）, Mộc Dục（沐浴）, Quan Đới（冠帶）, Lâm Quan（臨官）, Đế Vượng（帝旺）, Suy（衰）, Bệnh（病）, Tử（死）, Mộ（墓）, Tuyệt（絕）, Thai（胎）, Dưỡng（養）.

**B. Vòng Bác Sĩ – 12:** Bác Sĩ（博士）, Lực Sĩ（力士）, Thanh Long（青龍）, Tiểu Hao（小耗）, Tướng Quân（將軍）, Tấu Thư（奏書）, Phi Liêm（飛廉）, Hỷ Thần（喜神）, Bệnh Phù（病符）, Đại Hao（大耗）, Phục Binh（伏兵）, Quan Phủ（官府）.

**C. Vòng Tướng Tiền – 12:** Tướng Tinh（將星）, Phan Án（攀鞍）, Tuế Dịch（歲驛）, Tức Thần（息神）, Hoa Cái（華蓋）, Kiếp Sát（劫煞）, Tai Sát（災煞）, Thiên Sát（天煞）, Chỉ Bối（指背）, Hàm Trì（咸池）, Nguyệt Sát（月煞）, Vong Thần（亡神）.

**D. Vòng Tuế Tiền – 12:** Tuế Kiện/ Tuế Kiến（歲建）, Hối Khí（晦氣）, Tang Môn（喪門）, Quán Tác（貫索）, Quan Phù（官符）, Tiểu Hao（小耗）, Đại Hao（大耗）, Long Đức（龍德）, Bạch Hổ（白虎）, Thiên Đức（天德）, Điếu Khách（吊客）, Bệnh Phù（病符）.

### 7.6 Tứ Hóa – 4 dạng biến hóa

Hóa Lộc（化祿）, Hóa Quyền（化權）, Hóa Khoa（化科）, Hóa Kỵ（化忌）. Đây là thuộc tính biến hóa gắn lên sao gốc theo Can của từng tầng, không phải bốn sao có một vị trí cố định độc lập.

### 7.7 21 lưu diệu người dùng cung cấp

1. Lưu Thái Tuế
2. Lưu Kình Dương
3. Lưu Đà La
4. Lưu Thiên Khốc
5. Lưu Thiên Hư
6. Lưu Bạch Hổ
7. Lưu Tang Môn
8. Lưu Thiên Mã
9. Lưu Lộc Tồn
10. Lưu Hóa Khoa
11. Lưu Hóa Quyền
12. Lưu Hóa Lộc
13. Lưu Hóa Kỵ
14. Lưu Đào Hoa
15. Lưu Hồng Loan
16. Lưu Thiên Hỷ
17. Lưu Thiên Không
18. Lưu Thiên Trù
19. Lưu Văn Tinh
20. Lưu Tuần Không
21. Lưu Triệt Không

**Danh sách 21 là baseline người dùng yêu cầu, chưa phải danh mục đã xác nhận đầy đủ trên Tuvi.vn.** TV-001 hiển thị thêm một số nhãn `L.` như Lưu Long Đức, Lưu Phúc Đức, Lưu Thiên Đức, Lưu Nguyệt Đức, Lưu Thiên Việt, Lưu Văn Xương, Lưu Văn Khúc và Lưu Kiếp Sát. Cần giữ chúng trong `observedExtras` để so sánh, không tự động xóa hoặc gộp vào 21 khi chưa tìm ra công thức.

### 7.8 Các sao bổ sung cần có để tái tạo Tuvi.vn

Các tên sau có trong MD cũ hoặc hiển thị trên TV-001 nhưng không được xếp rõ trong bộ 117/21 người dùng gửi. Cần thêm catalog kỹ thuật riêng, chưa ép vào con số 117:

- **Thiên Y（天醫）:** sao riêng, đi cùng vị trí Thiên Diêu theo các nguồn công thức phổ biến; TV-001 hiển thị đồng thời Thiên Y và Thiên Diêu.
- **Địa Giải（地解）**.
- **Quốc Ấn（國印）**.
- **Đường Phù（唐符/ đường phù; cần xác minh đúng chữ Hán theo nguồn Tuvi.vn）**.
- **Lưu Hà（流霞）**.
- **Đẩu Quân（斗君）**.
- **Thiên La（天羅） và Địa Võng（地網）**.
- Các sao trong vòng Thái Tuế bản mệnh: Thiếu Dương, Thiếu Âm, Tử Phù, Tuế Phá, Trực Phù, v.v. (không thay bằng Tuế Tiền).

### 7.9 Chuẩn hóa tên trùng/đồng âm

| Tên | Chuẩn hóa |
|---|---|
| Thiên Riêu / Thiên Diêu | Cùng sao Thiên Diêu 天姚; một ID, alias `Thiên Riêu`. Dùng tên theo cách hiển thị Tuvi.vn khi có xác nhận. |
| Đài Phụ / Thai Phụ | Cùng sao 台輔; một ID, alias cả hai cách ghi. |
| Phi Liêm 飛廉 / Phi Liêm 蜚廉 | **Hai ID khác nhau**: một sao vòng Bác Sĩ, một sao trong 37 tạp diệu. |
| Hàm Trì 咸池 / Đào Hoa | Có thể là cùng sao/tên gọi tùy nguồn; Tuvi.vn hiển thị “Đào Hoa”. Giữ một ID dự kiến, alias khác; tách scope bản mệnh/lưu niên. |
| Hoa Cái, Kiếp Sát | Có thể xuất hiện ở sao nguyên cục và vòng Tướng Tiền lưu niên; cùng gốc tên nhưng cần hai placement theo scope, không ghi đè vị trí. |
| Thiên Y / Thiên Diêu | Hai sao khác ID dù theo một số bảng cùng an một cung. TV-001 hiển thị cả hai cùng lúc. |
| Tuần Không / Triệt Không / Không Vong | Không gộp. Phải xác minh chữ Hán và cách hiển thị/vùng án ngữ. |

---

## 8. Tứ Hóa và các tầng vận

### 8.1 Bảng Tứ Hóa Can năm trong MD – candidate

Thứ tự cột: Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ.

| Can | Hóa Lộc | Hóa Quyền | Hóa Khoa | Hóa Kỵ |
|---|---|---|---|---|
| Giáp | Liêm Trinh | Phá Quân | Vũ Khúc | Thái Dương |
| Ất | Thiên Cơ | Thiên Lương | Tử Vi | Thái Âm |
| Bính | Thiên Đồng | Thiên Cơ | Văn Xương | Liêm Trinh |
| Đinh | Thái Âm | Thiên Đồng | Thiên Cơ | Cự Môn |
| Mậu | Tham Lang | Thái Âm | Hữu Bật | Thiên Cơ |
| Kỷ | Vũ Khúc | Tham Lang | Thiên Lương | Văn Khúc |
| Canh | Thái Dương | Vũ Khúc | Thái Âm | Thiên Đồng |
| Tân | Cự Môn | Thái Dương | Văn Khúc | Văn Xương |
| Nhâm | Thiên Lương | Tử Vi | Tả Phù | Vũ Khúc |
| Quý | Phá Quân | Cự Môn | Thái Âm | Tham Lang |

Bảng này là khẩu quyết Nam phái được iztro công bố; không mặc định là đã xác nhận toàn bộ Tuvi.vn. TV-001 sinh Canh Tuất và Tuvi.vn hiển thị các dấu Hóa trong lá số, nhưng cần phân biệt Hóa bản mệnh với Hóa phi cung/đại hạn/lưu niên trước khi kết luận từng vị trí.

### 8.2 Tách tầng Tứ Hóa

Phải lưu riêng:
- `natal`: Tứ Hóa bản mệnh theo Can năm sinh.
- `decadal`: Tứ Hóa Đại Hạn theo Can của tầng Đại Hạn.
- `annual`: Tứ Hóa Lưu Niên theo Can năm xem.
- `monthly`: Tứ Hóa Lưu Nguyệt theo Can tháng xem, sau khi có công thức được xác nhận.
- `palace`: Phi Hóa theo Can cung, nếu Tuvi.vn hiển thị; không gộp với Tứ Hóa vận hạn.

Một sao có thể đồng thời có Hóa bản mệnh, Hóa Đại Hạn và Hóa Lưu Niên khác nhau. Vì vậy `Star.hoa` dạng một trường duy nhất trong MD cũ là chưa đủ; dùng mảng `transformations[]` theo scope.

---

## 9. Vận hạn

### 9.1 Đại Hạn

- Mỗi cung 10 năm.
- Khởi tại cung Mệnh, tuổi bắt đầu bằng số Cục: Thủy 2, Mộc 3, Kim 4, Thổ 5, Hỏa 6.
- Dương Nam/Âm Nữ đi thuận; Âm Nam/Dương Nữ đi nghịch.
- Tuổi hiển thị là tuổi mụ; `age = viewingLunarYear - birthLunarYear + 1` theo quy ước tuổi mụ đang dùng, nhưng phải xử lý trước/sau Tết khi đổi năm xem.

### 9.2 Tiểu Hạn

Theo chi năm sinh:
- Dần/Ngọ/Tuất: khởi Thìn.
- Thân/Tý/Thìn: khởi Tuất.
- Tỵ/Dậu/Sửu: khởi Mùi.
- Hợi/Mão/Mùi: khởi Sửu.

Tuổi 1 ở cung khởi; Nam đi thuận, Nữ đi nghịch. Đây là quy tắc trong MD và cũng được khẩu quyết iztro mô tả. Cần kiểm thử đối với các tuổi sát ranh giới năm xem.

### 9.3 Lưu Niên

- Lấy Can Chi năm xem theo quy ước năm âm lịch của dự án.
- Cung có chi năm xem được dùng làm vị trí Lưu Thái Tuế trong bản triển khai ứng viên.
- Engine v0.2.3 đã thêm lớp `scope='annual'`; v0.2.4 bổ sung các quy tắc Lưu Thiên Không, Lưu Niên Văn Tinh, Lưu Tuần Không, Lưu Triệt Không, Lưu Văn Xương và Lưu Văn Khúc theo bảng người dùng cung cấp. Các mục này hiện là `CANDIDATE_SPEC`, chưa xác minh với fixture Tuvi.vn.
- Không đặt Lưu sao chồng lên bản mệnh như cùng một bản ghi; giữ `scope='annual'` và năm xem riêng.
- Các công thức lưu vẫn chưa được xác minh bằng cặp fixture Tuvi.vn nhiều năm; không nâng trạng thái candidate thành verified chỉ vì áp dụng được quy tắc sao gốc.

### 9.4 Lưu Nguyệt

- Đẩu Quân là mốc tháng Giêng lưu niên; tính từ cung Thái Tuế của năm xem, nghịch theo tháng sinh rồi thuận đến giờ sinh.
- Sau khi tìm được cung tháng Giêng, xếp tháng tiếp theo theo chiều thuận.
- Người dùng chọn năm xem và tháng xem; cần tách tháng âm thực tế, tháng nhuận và tháng dùng trong công thức.
- Lưu nguyệt Tứ Hóa cần căn cứ rõ: có hệ dùng Can tháng, có hệ dùng Can cung; chưa mặc định chọn một cách khi chưa so khớp Tuvi.vn.

---

## 10. Bố cục và UI

### 10.1 Lá số 4×4

- 12 cung nằm xung quanh, địa bàn cố định; không xoay theo cung Mệnh.
- Ô trung tâm gồm: họ tên, giới tính, ngày dương, ngày âm, giờ sinh, Can Chi năm/tháng/ngày/giờ, năm xem/tuổi mụ, âm dương, bản mệnh, Cục, cân lượng, Chủ Mệnh, Chủ Thân, Lai Nhân Cung.
- Mỗi ô cung hiển thị: Can Chi cung, tên cung, dấu Thân cư, chính tinh, phụ tinh, tạp diệu, thần sát, sao lưu, độ sáng, Tứ Hóa, Đại Hạn/Tiểu Hạn/Lưu niên.
- Chú giải màu ngũ hành bên dưới lá số.

### 10.2 Mobile

Giữ 4×4. Không tự dàn thành 12 dòng. Cung cấp nút zoom +/- hoặc thao tác phóng to/thu nhỏ; cho phép cuộn ngang vùng chart nếu màn hình nhỏ, nhưng mặc định giữ nguyên bố cục. Không làm vỡ thứ tự địa bàn.

### 10.3 Màu hành sao

Mỗi sao có `element` riêng và màu nhất quán:
- Kim: trắng/xám sáng.
- Mộc: xanh lá.
- Thủy: đen/xanh dương đậm.
- Hỏa: đỏ.
- Thổ: vàng/nâu.

Chữ cần đủ tương phản trên nền giấy cổ. Các sao không có hành xác định không tự suy luận; dùng màu trung tính cho đến khi có nguồn.

### 10.4 Hai chế độ luận giải

- **Tổng quan:** các nội dung tính cách, công danh, tài lộc, tình duyên, gia đạo, sức khỏe, con cái và các cung liên quan.
- **Đại Hạn/Tiểu Hạn:** người dùng chọn năm; hiển thị Đại Hạn đang đi qua, Tiểu Hạn và Lưu Niên; không chấm điểm tốt/xấu.

### 10.5 PDF

Xuất PDF toàn bộ lá số, gồm 12 cung và phần thông tin trung tâm. Phải nhúng hoặc chọn font hỗ trợ tiếng Việt và chữ Hán. Có chế độ giấy ngang và lề in; không cắt mất sao nhỏ. Không xuất hồ sơ lên máy chủ.

---

## 11. Fixture chuẩn ban đầu – Tuvi.vn #13405 (TV-001)

**Nguồn:** [Lá số Tuvi.vn #13405](https://tuvi.vn/la-so-duong-nam-am-duong-nghich-ly-2-12-1910-ngo-13405?thang-xem=9&nam-xem=2026&day=1&hour=12&min=30&month=1&name=&year=1911&option=1)

| Trường | Giá trị trên trang |
|---|---|
| Giới tính | Nam |
| Ngày dương | 01/01/1911 |
| Giờ sinh | 12:30 |
| Chi giờ | Ngọ |
| Năm âm | Canh Tuất 1910 |
| Ngày âm | 02/12 |
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

### 11.1 Kết quả kiểm thử được xác nhận từ TV-001

- Ngày âm và Can Chi năm/tháng/ngày/giờ ở bảng trên phải được engine trả về đúng.
- Can tháng cũ của MD sai; công thức mới phải trả **Kỷ Sửu**.
- Mệnh và Thân phải đồng cung Mùi.
- Cục phải là Mộc Tam Cục.
- Mệnh Chủ phải là Lộc Tồn; đây là bằng chứng để tra theo chi năm sinh Tuất, không phải chi cung Mệnh Mùi.
- Thân Chủ phải là Văn Xương.
- Trang đang hiển thị năm xem Bính Ngọ 2026, tuổi 117; không ghi nhầm thành 2027.

### 11.2 Vị trí 14 chính tinh đọc được từ trang

| Cung địa chi | Sao chính trên trang |
|---|---|
| Tỵ | Tham Lang, Liêm Trinh |
| Ngọ | Cự Môn |
| Mùi (Mệnh/Thân) | Thiên Tướng |
| Thân | Thiên Đồng, Thiên Lương |
| Dậu | Thất Sát, Vũ Khúc |
| Tuất | Thái Dương |
| Hợi | Không có chính tinh |
| Tý | Thiên Cơ |
| Sửu | Phá Quân, Tử Vi |
| Dần | Không có chính tinh |
| Mão | Thiên Phủ |
| Thìn | Thái Âm |

Đây là fixture so vị trí chính tinh. Không lấy vị trí sao trong ảnh làm công thức; engine phải tự tính rồi so.

### 11.3 Các nhãn Lưu sao quan sát được trên TV-001

Trang hiển thị nhiều sao có tiền tố `L.`; nhóm quan sát được gồm: Lưu Lộc Tồn, Lưu Long Đức, Lưu Hóa Kỵ, Lưu Văn Khúc, Lưu Thiên Mã, Lưu Hóa Lộc, Lưu Tang Môn, Lưu Văn Xương, Lưu Hóa Khoa, Lưu Hồng Loan, Lưu Thiên Việt, Lưu Đào Hoa, Lưu Thiên Đức, Lưu Bạch Hổ, Lưu Hóa Quyền, Lưu Nguyệt Đức, Lưu Thiên Khốc, Lưu Thiên Hư, Lưu Kình Dương, Lưu Phúc Đức, Lưu Thái Tuế và Lưu Kiếp Sát.

Danh sách này **không đồng nghĩa** toàn bộ đều thuộc đúng bộ 21 lưu diệu ban đầu. Nó là danh sách `observedExtras` để kiểm tra cách Tuvi.vn tách lớp. Các sao trong 21 list không thấy ở TV-001 không bị xóa; có thể chỉ không hiển thị trong mẫu này.

### 11.4 Mục hiển thị có nhưng cần công thức riêng

- Cân Lượng: 3 lượng 4 chỉ.
- Lai Nhân Cung: Tử Tức.
- Đường Phù, Lưu Hà, Địa Giải, Quốc Ấn, Thiên Y, Đẩu Quân.
- Lớp Đại Hạn (các nhãn `ĐV.`), Lưu Niên (nhãn `L.`), Hóa theo cung.

Các mục trên phải có module/field riêng; không giả định tự phát sinh từ 14 chính tinh.

---

## 12. Ma trận lỗi, thiếu và việc phải sửa trong MD

| Ưu tiên | Mục MD | Kết luận nghiên cứu | Hành động trong v1.3 |
|---|---|---|---|
| P0 | 5.2 Can Chi tháng | Công thức cũ cho sai TV-001; Ngũ Hổ Độn cho Kỷ Sửu | Sửa công thức thành `mod(2*yearCan + lunarMonth + 1,10)` |
| P0 | 6.4 Mệnh Chủ | TV-001: năm Tuất, Mệnh Mùi, kết quả Lộc Tồn; tra theo chi Mệnh cho ra sai | Lookup theo chi năm sinh; test 12 chi |
| P0 | 6.19 Tuần/Triệt | MD hai cung; iztro Trung Châu có logic khác; Tuvi.vn chưa đủ mẫu phân biệt | Giữ candidate song song, chờ fixtures |
| P0 | 6.9 Khôi/Việt | MD/iztro và TV-001 cho kết quả khác. Bộ fixture hiện đã bao phủ 10/10 Can năm và 10/10 Can ngày; cần đọc/transcribe vị trí Khôi/Việt trên các ảnh có Can phân biệt, chưa cần chụp lại chỉ để tăng độ phủ input | Chưa tự sửa; xác minh placement trước khi chốt |
| P0 | 6.10 Hỏa/Linh | MD phụ thuộc giới tính/âm dương; iztro là candidate khác. Bộ fixture hiện đã phủ 12/12 giờ chi và đủ bốn tổ hợp âm/dương × giới tính; cần trích vị trí sao từ ảnh hiện có để so sánh, chỉ chụp thêm nếu ảnh không đọc được | Chưa chốt công thức |
| P0 | 6.18 Thiên Trù | MD ghi Quý–Tuất; iztro ghi Quý–Hợi | Cập nhật candidate Quý–Hợi; fixture Can Quý đã có, cần transcribe vị trí Thiên Trù từ ảnh tương ứng |
| P0 | Catalog 117 | Có lặp tên theo vòng và thiếu một số sao Tuvi.vn hiển thị | Dùng ID + Hán tự + scope; không đếm tên thuần |
| P1 | 6.15 Thiên Y | MD có “Thiên Y cùng cung Thiên Riêu”; list 37 không có nhưng Tuvi.vn hiển thị riêng Thiên Y và Thiên Diêu | Thêm ID Thiên Y, cùng vị trí Thiên Diêu theo candidate |
| P1 | 6.15 Thiên Vu/Thiên Nguyệt/Âm Sát | MD thiếu công thức | Bổ sung bảng tháng từ iztro với trạng thái candidate |
| P1 | 6.14 Hàm Trì | User list có Hàm Trì; MD ghi Đào Hoa, Tuvi.vn cũng hiển thị Đào Hoa | Chuẩn alias 咸池/Đào Hoa, kiểm tra khác biệt với lưu niên |
| P1 | 6.14 Thiên Trù | Bảng Can Quý khác nguồn | Như trên |
| P1 | 6.17 Đài Phụ/Thai Phụ | Hai tên có thể cùng 台輔 | Chuẩn một ID, hai alias |
| P1 | 6.17 Phong Cáo | Lời khẩu quyết và code iztro mâu thuẫn về chiều; giờ Ngọ không phân biệt | Chờ giờ không đối xứng |
| P1 | Giải Thần | MD đồng cung Phượng Các; iztro phân biệt Nguyệt Giải và Niên Giải | Bổ sung hai scope/nhãn riêng, đối chiếu Tuvi.vn |
| P1 | Vòng Bác Sĩ/Phi Liêm tạp | Phi Liêm hai chữ Hán khác nhau | Tách `fei-lian-boshi` và `fei-lian-misc` |
| P1 | 48 thần sát | 24 sao cố định, 24 sao lưu niên trong iztro; Tuvi.vn còn có vòng Thái Tuế bản mệnh riêng | Tách natal/annual; không thay Thái Tuế bằng Tuế Tiền |
| P1 | 21 lưu diệu | TV-001 cho thấy thêm Lưu Long Đức, Lưu Phúc Đức, Lưu Đức, Lưu Văn Xương/Khúc, Lưu Thiên Việt, Lưu Kiếp Sát... | Giữ 21 list baseline, thêm `observedExtras`, chờ thêm năm xem |
| P1 | Tứ Hóa | MD biểu diễn một `hoa` duy nhất, không đủ tầng | Mảng transformation theo natal/decadal/annual/monthly/palace |
| P2 | Cân Lượng | TV-001 có 3 lượng 4 chỉ; MD chưa có thuật toán | Tách module Cân Xương Tính Số; tra bảng riêng và test |
| P2 | Lai Nhân Cung | TV-001 ghi Tử Tức; MD chưa có công thức | Tách module; phải tìm phương pháp Tuvi.vn và fixture |
| P2 | Đường Phù, Địa Giải, Quốc Ấn, Lưu Hà, Đẩu Quân | Hiển thị trong TV-001, MD có phần thiếu | Thêm catalog + công thức/fixture riêng |
| P2 | Độ sáng | MD chưa có bảng đủ 12 cung | Chỉ nhập từ bảng nguồn đã xác minh, không suy ra bằng vị trí |

---

## 13. Bộ kiểm thử bắt buộc

### 13.1 Lịch và giờ

- 50 ngày dương lịch trong 1900–2100: Tết, giao thừa, ngày đầu/cuối tháng, tháng nhuận.
- 23:00 / 23:59 / 00:00 / 00:59 / 01:00.
- 10:00 → Tỵ; 11:00 → Ngọ.
- Đối chiếu ngày âm và Can Chi với Tuvi.vn trên nhiều vùng thời gian trong năm.

### 13.2 Can Chi

- 10 Can năm × đủ tháng âm.
- 60 ngày Can Chi.
- 12 giờ chi × ít nhất 10 Can ngày.
- TV-001 bắt buộc trả Kỷ Sửu (tháng), Tân Mùi (ngày), Giáp Ngọ (giờ).

### 13.3 Bộ fixture Tuvi.vn hiện có và khoảng trống

**Mốc tối thiểu 20 fixture đã đạt.** Bộ hiện tại gồm:
- `tests/fixtures/tuvi-vn-fixtures.json`: 20 fixture nền.
- `tests/fixtures/tuvi-vn-captured-20261105.json`: 28 testcase capture (CORE 8, LEAP 10, CAL 4, HOUR 6); cả 28 ảnh hiện hành đã khớp input kế hoạch.
- Tổng: 48 fixture records; 23 bản đồ có expected đầy đủ 14 chính tinh (9 fixture nền + 14 capture).
- Tập hợp 48 records hiện bao phủ cả Nam/Nữ, 10/10 Can năm, 10/10 Can ngày và 12/12 giờ địa chi. Bộ capture có các ca tháng nhuận năm 2023 và 2025.

**Phần chưa đạt:** expected chi tiết của 14 chính tinh đã có trên 23 bản đồ, nhưng expected của phần lớn phụ tinh/tạp diệu/thần sát/Tuần-Triệt/Tứ Hóa chưa được transcribe đầy đủ. Do đó, độ phủ input không đồng nghĩa độ phủ công thức an sao.

Các test tiếp theo cần tập trung vào từng công thức tranh chấp ở mục 0.1 và mục 12; không cần thu thập lại một bộ 20 lá số chung chỉ để đủ số lượng. Cần fixture cặp cùng input sinh nhưng khác `viewedYear` để kiểm tra lớp lưu.

### 13.4 Test riêng các công thức còn tranh chấp

1. Can Chi tháng – đã có fixture TV-001.
2. Mệnh Chủ theo 12 chi năm.
3. Thiên Khôi/Thiên Việt: tập input đã có đủ Can năm/Can ngày; cần chép expected sao từ ảnh để phân biệt khóa tra.
4. Hỏa/Linh, Địa Không/Địa Kiếp và Phong Cáo: tập input đã có 12 giờ; cần chép expected sao trên các chart giờ không đối xứng.
5. Thiên Trù Can Quý: Can Quý đã có trong bộ nền; cần chép vị trí từ ảnh.
6. Thiên Thương/Thiên Sứ: bốn tổ hợp âm/dương × Nam/Nữ đã có; cần chép expected từ các ảnh phù hợp.
7. Tuần/Triệt và Không Vong: kiểm tra nhãn/vị trí trên các ảnh hiện có; bổ sung ảnh zoom nếu không đọc rõ.
8. Tướng Tiền/Tuế Tiền và 21 lưu diệu: cần cặp chart cùng input sinh nhưng khác năm xem.
9. Đại Hạn/Tiểu Hạn và Tứ Hóa theo từng tầng: cần fixture theo từng lớp vận và năm xem.

### 13.5 Quy tắc pass/fail

- `verified`: fixture khớp toàn bộ các trường của nguồn Tuvi.vn; nếu có thay đổi phiên bản trang thì lưu snapshot ngày truy cập.
- `candidate`: có công thức tham khảo, chưa đủ Tuvi fixtures.
- `conflict`: có từ hai nguồn hoặc hai mô hình kết quả khác nhau.
- `todo`: chưa có công thức hoặc chưa có fixture.
- Test fail cứng cho `verified`; test candidate/conflict hiển thị cảnh báo, không được âm thầm bỏ qua.

---

## 14. Dữ liệu còn cần để khóa các công thức tranh chấp

Không yêu cầu người dùng chụp lại 20 fixture chung: đã có 20 fixture nền và 28 ảnh capture (48 records). Tập hiện tại bao phủ Nam/Nữ, đủ 10 Can năm, 10 Can ngày và 12 giờ địa chi. Trước tiên phải khai thác/transcribe các ảnh đang có trong `docs/03_Fixture_TuviVN/captures/` để bổ sung expected cho sao phụ, tạp diệu, thần sát, Tuần/Triệt và Tứ Hóa.

Chỉ yêu cầu ảnh bổ sung khi dữ liệu hiện có không phân biệt được công thức. Các mẫu có giá trị nhất còn lại:

1. **Cùng một người, hai năm xem khác nhau** (ví dụ 2030 và 2031), giữ nguyên ngày/giờ/giới tính; chụp toàn lá số và đọc đủ các nhãn `L.` để kiểm tra sao lưu, vòng lưu niên và Tứ Hóa theo tầng.
2. **Tuần/Triệt/Không Vong:** ảnh rõ phần hai cung bị án ngữ và nhãn sao; chọn năm sinh/Can phù hợp để phân biệt bảng an phổ thông với biến thể candidate.
3. **Hỏa Tinh/Linh Tinh, Địa Không/Địa Kiếp, Phong Cáo:** nếu ảnh capture hiện có không nhìn rõ tên sao hoặc không cho đủ expected, cần chart có giờ không đối xứng (ưu tiên Dần/Thìn/Dậu), không chỉ dùng giờ Ngọ.
4. **Thiên Thương/Thiên Sứ:** ưu tiên tổ hợp Âm Nam và Dương Nữ; trích vị trí cả hai sao để xác định có đổi chỗ hay không.
5. **Thiên Khôi/Thiên Việt và Thiên Trù:** chọn chart có Can năm/Can ngày phân biệt rõ; tập fixture đã có đủ các Can đầu vào nhưng cần expected sao được đọc từ ảnh.

Không cần chụp thêm chỉ để tăng số lượng fixture. Mỗi ảnh mới phải giải quyết một công thức/biến số cụ thể và phải ghi input, năm xem, nguồn, expected và phạm vi sao đọc được.

---

## 15. Các điểm chưa được phép tự chốt

- Công thức Thiên Khôi/Thiên Việt theo Can năm, Can ngày hay quy tắc khác của Tuvi.vn.
- Chiều Hỏa Tinh/Linh Tinh theo Tuvi.vn.
- Triệt của Tuvi.vn là hai cung theo bảng phổ thông hay biến thể một vị trí như một số source code Central Zhou.
- Tuần Không/Không Vong có một hay hai placement và có phải hai tên riêng không.
- Công thức Đường Phù.
- Công thức Cân Lượng và Lai Nhân Cung.
- Danh mục đầy đủ của 21 lưu diệu trên Tuvi.vn và những sao lưu bổ sung.
- Có đưa cả Tướng Tiền và Tuế Tiền vào giao diện mặc định hay chỉ bật theo lớp Lưu Niên.
- Bảng độ sáng đầy đủ cho các sao.

---

## 16. Lộ trình sau khi người dùng duyệt

| Giai đoạn | Nội dung | Điều kiện hoàn tất |
|---|---|---|
| S0 | Chốt phạm vi và quyết định kiến trúc | Đã có baseline; chỉ cập nhật khi người dùng đổi yêu cầu |
| S1 | Calendar + Can Chi | Đã có engine và fixture đối chiếu; còn thiếu stress-test 50 mốc lịch 1900–2100 |
| S2 | Mệnh/Thân, 12 cung, Cục, 14 chính tinh | Đã có 48 fixture records và 23 bản đồ đủ 14 chính tinh; nạp âm còn cần xác minh |
| S3 | Phụ tinh và tạp diệu | Đang triển khai; mỗi sao cần source/status/expected fixture |
| S4 | Thần sát, vòng Thái Tuế và các vòng lưu | Còn thiếu expected và tách scope nguyên cục/lưu niên |
| S5 | Tứ Hóa, Đại Hạn, Tiểu Hạn, Lưu niên, Lưu nguyệt | Chưa hoàn thiện; phải test theo từng tầng |
| S6 | UI 4×4 và form | Prototype đã có; còn responsive, zoom/pan, tam hợp và PDF/browser test |
| S7 | Luận giải hai chế độ và PDF | Nội dung đúng tầng, xuất PDF không vỡ |
| S8 | Kiểm thử trình duyệt, deploy online | Checklist cuối pass |

**Dự án đã ở giai đoạn triển khai; bảng trên là backlog cập nhật, không phải yêu cầu dừng code. Không nâng công thức `candidate`/`conflict` lên `verified` nếu chưa có expected fixture tương ứng.**

---

## 17. Nguồn đã tra cứu trực tuyến

> Các nguồn dưới đây được dùng để tìm công thức và phát hiện khác biệt. Trừ trang lá số Tuvi.vn, chúng không phải “nguồn chuẩn đầu ra” của dự án. Trang tài liệu iztro hiện hiển thị phiên bản 2.6.4 tại thời điểm rà soát; code `main` có thể thay đổi theo thời gian. Cần ghi phiên bản/commit trong hồ sơ kiểm thử nếu tham chiếu sâu vào mã nguồn.

1. **Tuvi.vn – TV-001, lá số 01/01/1911, 12:30, Nam, năm xem Bính Ngọ 2026:**  
   https://tuvi.vn/la-so-duong-nam-am-duong-nghich-ly-2-12-1910-ngo-13405?thang-xem=9&nam-xem=2026&day=1&hour=12&min=30&month=1&name=&year=1911&option=1
2. **iztro – An tinh quyết, cung vị, 14 chính tinh, phụ tinh và vòng sao:**  
   https://docs.iztro.com/learn/setup
3. **iztro – 37 tạp diệu:**  
   https://docs.iztro.com/learn/adj-star
4. **iztro – 48 thần sát:**  
   https://docs.iztro.com/learn/dec-star
5. **iztro – Tứ Hóa và sự khác nhau giữa Tứ Hóa vận hạn/Tứ Hóa cung:**  
   https://docs.iztro.com/learn/mutagen
6. **Mã nguồn iztro – vị trí sao:**  
   https://github.com/SylarLong/iztro/blob/main/src/star/location.ts
7. **Lịch sử thay đổi iztro:**  
   https://github.com/SylarLong/iztro/blob/main/CHANGELOG.md
8. **Bài Tuvi.vn về Thiên Khôi:**  
   https://tuvi.vn/sao-thien-khoi-la-gi-y-nghia-chi-tiet-and-ung-dung-trong-tu-vi-hien-dai-a2560
9. **Bài Tuvi.vn về Thiên Việt:**  
   https://tuvi.vn/sao-thien-viet-la-gi-y-nghia-dac-diem-and-ung-dung-trong-tu-vi-a2561
10. **Tài liệu tham khảo về Tuần/Triệt và các cách gọi Không Vong:**  
    https://nhatnguyet.org/kien-thuc/bai-viet/tuan-triet-tren-la-so-tu-vi-e2d1b4
11. **Bảng an sao tham khảo – Thiên Cơ Các:**  
    https://thiencocac.com/sao-va-cung/huong-dan/cach-an-sao.html
12. **Bảng an sao phụ tinh – Phong Thủy Thanh Hóa:**  
    https://phongthuythanhhoa.vn/vi/huong-dan-sao-chi-tiet-trong-tu-vi/

### Lưu ý về chất lượng nguồn

- Tuvi.vn là mục tiêu tái tạo; trang tạo lá số có cấu trúc dữ liệu trực tiếp, nhưng không công bố đầy đủ mã nguồn/công thức an tất cả sao.
- Các bài viết SEO của Tuvi.vn có thể không nhất quán với lá số máy tính. Ví dụ bài Thiên Khôi nêu một bảng theo Can khác với vị trí trên TV-001. Vì vậy ưu tiên **kết quả lá số trực tiếp**, không lấy bài giải nghĩa chung làm ground truth cho công thức.
- iztro cung cấp công thức rõ, code và changelog; nhưng 48 thần sát phân rõ 24 sao cố định và 24 sao theo lưu niên, có các tùy chọn trường phái. Đây là nguồn kỹ thuật hữu ích, không phải chuẩn Tuvi.vn.
- Nguồn cộng đồng/ebook có thể khác nhau về tên Hán, cách đếm và scope; không gộp dị bản vào engine chính khi chưa có fixture.

---

**Kết thúc đặc tả v1.3.** Đây là tài liệu đã hợp nhất quyết định của người dùng, dữ liệu TV-001, danh mục sao người dùng gửi và kết quả tra cứu công thức. Các mục `CONFLICT`, `TODO_FIXTURE` và `MISSING_RULE` vẫn phải được giữ nguyên trạng thái cho đến khi có thêm dữ liệu Tuvi.vn; không được coi là đã hoàn tất chỉ vì đã tìm thấy một công thức trên internet.
