# Nhập bài viết vào Tàng Thư

Quy trình tách **thu thập nội dung**, **rà soát** và **ghi Firestore**. Crawler mở Chrome có giao diện để bạn trực tiếp xử lý xác minh nếu website yêu cầu; nó không tự giải CAPTCHA hoặc né cơ chế kiểm soát truy cập.

## 1. Cài đặt

Tại thư mục gốc dự án:

\`\`\`bash
python -m pip install playwright
python -m playwright install chrome
\`\`\`

Nếu lệnh cài Chrome của Playwright không khả dụng trên máy, hãy dùng Chrome đã cài sẵn và kiểm tra Playwright tương thích với phiên bản hiện tại.

## 2. Thu thập bằng Chrome

Chạy:

\`\`\`bash
python scripts/crawl_tang_thu.py
\`\`\`

Một cửa sổ Chrome riêng sẽ mở với hồ sơ lưu tại \`.cache/tang-thu-chrome\`. Hồ sơ này độc lập với Chrome cá nhân, không sao chép cookie hay dữ liệu đăng nhập hiện có.

- Crawler tìm URL bài viết theo mẫu \`-nid-1234.html\`, tránh nhầm các link menu và link ngoài.
- Khi website hiển thị trang xác minh, hãy tự thao tác trong cửa sổ Chrome. Quay lại terminal và nhấn Enter để crawler kiểm tra lại trang.
- Crawler truy cập từng bài theo thứ tự, mặc định nghỉ 2 giây giữa các trang.
- File \`tang-thu-import.json\` được cập nhật sau mỗi bài, nên dữ liệu đã lấy được vẫn còn nếu quá trình bị gián đoạn.
- Có thể chỉnh số trang danh sách, độ trễ và nơi lưu:

\`\`\`bash
python scripts/crawl_tang_thu.py --max-pages 5 --delay 3 --output tang-thu-import.json
\`\`\`

Không chia sẻ cookie, mã xác minh hoặc thông tin đăng nhập. Nếu website tiếp tục từ chối truy cập sau khi bạn tự xác minh, dừng thu thập và xin chủ website cấp quyền hoặc bản export; không dùng proxy xoay vòng, giả mạo danh tính hay công cụ phá CAPTCHA.

## 3. Rà soát JSON trước khi nhập

Kiểm tra tiêu đề, toàn văn, tác giả, URL nguồn, trường phái và ghi chú bản quyền. Tác giả không rõ phải để trạng thái cần biên tập, không tự gán tên. Loại những bài trích xuất thiếu hoặc lẫn nội dung điều hướng.

Mỗi bài cần có \`title\`, \`content\`, \`sourceUrl\`, \`category\`, \`tags\`, \`author\`. Nội dung tối đa 500.000 ký tự theo Firestore Rules hiện tại.

## 4. Nhập vào Firestore

1. Đưa thay đổi của nhánh này lên môi trường chạy website.
2. Đăng nhập Tàng Thư bằng tài khoản quản trị đã xác minh email.
3. Chọn file JSON trong bảng nhập liệu quản trị.
4. Kiểm tra số bản ghi hợp lệ rồi mới nhấn **Nhập**.
5. Kiểm tra các bài mới và biên tập trước khi công khai.

Importer dùng URL nguồn làm khóa chống trùng; chạy lại cùng gói dữ liệu sẽ cập nhật bài theo URL thay vì tạo bản ghi mới. Crawler chỉ tạo JSON trên máy; không tự ghi Firestore.

## 5. Firestore Rules

Nếu Rules mới chưa được triển khai, xác nhận Firebase project trước khi chạy:

\`\`\`bash
firebase use
firebase deploy --only firestore:rules
\`\`\`

Không triển khai nhầm Firebase project.

## Giới hạn

- Cấu trúc HTML có thể thay đổi; một số bài cần điều chỉnh selector hoặc biên tập thủ công.
- Website có thể yêu cầu xác minh hoặc từ chối truy cập tự động. Việc xác minh phải do người dùng tự thực hiện trong Chrome.
- Tác giả, ngày đăng và tính đầy đủ của nội dung chưa được xác minh độc lập.
- Chưa chạy lint/build hoặc thử import dữ liệu thật lên Firebase.
