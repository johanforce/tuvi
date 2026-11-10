# Phân hệ Thần số học — thống kê XSMB

## Mục đích

Phân hệ cấp cao trong ứng dụng Tử Vi Cổ Học, cung cấp thống kê từ kết quả Xổ số Miền Bắc đã công bố. Không sử dụng số liệu mẫu hoặc số tự tạo.

## Nguồn dữ liệu

- Dự án: https://github.com/khiemdoan/vietnam-lottery-xsmb-analysis
- CSV: https://raw.githubusercontent.com/khiemdoan/vietnam-lottery-xsmb-analysis/main/data/xsmb-2-digits.csv
- Giấy phép: MIT; xem data/xsmb/NOTICE.md.
- Dữ liệu dự phòng đã kiểm tra: 100 kỳ từ 2026-08-02 đến 2026-11-09.

Server cố tải CSV nguồn và giữ cache trong bộ nhớ 30 phút. Nút Làm mới gửi refresh=1 để bỏ qua cache. Khi nguồn không truy cập được, server trả về bản chụp 100 kỳ có trong repo và gắn source=snapshot để giao diện phân biệt rõ. Tuyệt đối không thay dữ liệu thật bằng giá trị mẫu.

## API

GET /api/xsmb/results?days=100

Tham số days được giới hạn trong 1–100. Response gồm nguồn dữ liệu, thời điểm kiểm tra, khoảng ngày và danh sách kỳ quay. Mỗi kỳ có ngày ISO, đuôi giải đặc biệt và 27 đuôi hai chữ số từ các giải. Chuỗi hai chữ số luôn giữ số 0 ở đầu.

## Định nghĩa thống kê

- Lượt lô: đếm mọi lần một cặp hai chữ số xuất hiện trong 27 kết quả của mỗi kỳ, cho phép đếm lặp trong cùng kỳ.
- Số kỳ có mặt: một cặp chỉ được tính tối đa một lần trong mỗi ngày.
- Tỷ lệ lô lịch sử: số kỳ có mặt / tổng kỳ trong khoảng chọn.
- Lượt đề: đếm đuôi hai chữ số của giải đặc biệt.
- Tỷ lệ đề lịch sử: lượt về / tổng kỳ.
- Bạch thủ: tra cứu một số lô cụ thể; điều kiện trúng là số xuất hiện ít nhất một lần trong 27 đuôi của kỳ đó.
- Backtest: đi lần lượt qua dữ liệu; mỗi ngày chỉ dùng các kỳ trước đó để chọn số có tần suất cao nhất, rồi đối chiếu với kỳ tiếp theo. Kết quả phụ thuộc hoàn toàn vào quy tắc, cửa sổ và tập dữ liệu.

## Giới hạn

Tần suất quá khứ không phải xác suất dự báo tương lai. Backtest không chứng minh ưu thế thống kê và không phải lời khuyên đánh bạc. Không được mô tả kết quả thống kê là bảo đảm trúng.

## Thanh Long

Không giả định Thanh Long là song thủ hoặc một phương pháp khác. Chỉ triển khai sau khi người dùng xác nhận công thức chính xác và định nghĩa điều kiện trúng.