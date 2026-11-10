# Nhập bài viết vào Tàng Thư

Quy trình này tách **thu thập nội dung** và **ghi Firestore** để có thể kiểm tra dữ liệu trước khi công khai.

## 1. Thu thập từ trang nguồn

Tại thư mục gốc dự án, chạy:

```bash
python scripts/crawl_tang_thu.py
```

Mặc định script đọc tối đa 5 trang danh sách từ `https://tuvi.cohoc.net/hoc-tu-vi.html`, mở các liên kết bài viết và tạo `tang-thu-import.json`.

Có thể tùy chỉnh:

```bash
python scripts/crawl_tang_thu.py --max-pages 5 --delay 1.5 --output tang-thu-import.json
```

Script sử dụng thư viện chuẩn Python, không cần cài package. Nếu website trả trang chống bot/challenge, script sẽ ghi nhận lỗi và không nhập trang chặn thành nội dung. Khi đó cần mở website bằng trình duyệt thông thường, xin bản export/cho phép truy cập từ chủ website hoặc bổ sung dữ liệu hợp lệ vào JSON; không tìm cách vượt cơ chế bảo vệ.

## 2. Rà soát JSON trước khi nhập

Mở file JSON và kiểm tra:
- Tiêu đề, nội dung, tác giả và URL nguồn.
- Tác giả chưa xác định được để nguyên trạng thái cần biên tập, không tự gán tên.
- Nội dung trích dẫn, ghi chú bản quyền và trường phái/tài liệu gốc.
- Những bài không có nội dung đầy đủ cần được loại khỏi danh sách nhập.

Mỗi phần tử trong `articles` cần có `title`, `content`, `sourceUrl`, `category`, `tags`, `author`. Nội dung tối đa 500.000 ký tự theo Firestore Rules hiện tại.

## 3. Nhập vào Firestore

1. Đưa các thay đổi của nhánh này lên môi trường chạy website.
2. Đăng nhập Tàng Thư bằng tài khoản quản trị `cthang429@gmail.com` đã xác minh email.
3. Ở phần đầu Tàng Thư, chọn **Chọn file JSON** và chọn `tang-thu-import.json`.
4. Kiểm tra số bản ghi hợp lệ, sau đó nhấn **Nhập**.
5. Kiểm tra bài viết mới trong Tàng Thư và rà soát nội dung trước khi công khai rộng rãi.

Importer dùng URL nguồn làm khóa chống trùng: chạy lại cùng gói dữ liệu sẽ cập nhật bài theo URL thay vì tạo bản ghi mới. Bài bị lỗi xác thực hoặc vượt giới hạn sẽ được đếm vào nhóm bỏ qua.

## 4. Triển khai Firestore Rules

Nếu dự án Firebase chưa được triển khai Rules mới từ repo, hãy kiểm tra project đang liên kết trước khi chạy:

```bash
firebase use
firebase deploy --only firestore:rules
```

Không triển khai nhầm Firebase project. Rules giới hạn quyền ghi vào tài khoản admin và cho phép metadata nguồn `sourceUrl`, `sourceType`.

## Giới hạn đã biết

- Trình thu thập dựa trên cấu trúc HTML phổ biến; nếu website đổi giao diện, cần hiệu chỉnh bộ nhận diện nội dung.
- Một số trang có thể chặn truy cập tự động. Không có cam kết script tải được toàn bộ 5 trang nếu server từ chối.
- Chưa tự động xác minh tác giả, ngày xuất bản hoặc tính đầy đủ của bài. Hãy biên tập và đối chiếu nguồn trước khi xuất bản.
- Việc chạy crawler chỉ tạo file JSON ở máy của bạn; Firestore chỉ thay đổi sau thao tác nhập từ giao diện admin.
