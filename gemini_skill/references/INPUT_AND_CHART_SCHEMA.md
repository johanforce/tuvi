# Chuẩn đầu vào và khóa dữ kiện lá số

## Thông tin sinh cần thu thập
- Ngày sinh: ghi rõ DƯƠNG LỊCH hay ÂM LỊCH.
- Nếu âm lịch: tháng nhuận hay không, nguồn chuyển đổi lịch.
- Giờ sinh: giờ cụ thể, khoảng sai số, nguồn xác nhận; chú ý giờ sát ranh hai chi.
- Nơi sinh và múi giờ tại thời điểm sinh.
- Giới tính dùng theo quy tắc an vận của hệ phái đang áp dụng.
- Nguồn/phần mềm lập lá số và trường phái nếu biết.
- Ảnh/PDF: độ rõ, có đủ 12 cung, có nhìn được sao và trạng thái không.

## Xếp hạng chất lượng đầu vào
- A — Cao: dữ kiện rõ, không sát ranh giờ, lá số đọc được.
- B — Khá: có sai số nhỏ nhưng không làm đổi chi giờ/cấu trúc đang xét.
- C — Thấp: gần ranh giờ, nhớ theo khoảng, hoặc ảnh có vùng khó đọc.
- D — Chưa dùng được: thiếu dữ kiện cốt lõi hoặc không đọc được lá số.

## Nguyên tắc chép lá số
1. Chép đủ 12 cung, địa chi và vị trí cung.
2. Ghi Mệnh, Thân, Cục, âm/dương, chiều vận nếu có.
3. Ghi chính tinh, phụ tinh, sát tinh, Tứ Hóa, Tuần/Triệt, vòng Tràng Sinh.
4. Ghi trạng thái miếu/vượng/đắc/bình/hãm đúng như nguồn thể hiện; không tự suy ra khi chưa có quy tắc/nguồn xác nhận.
5. Đánh dấu `UNCERTAIN` với chữ mờ hoặc dữ kiện không chắc.
6. Không thay đổi dữ kiện gốc để làm cho phần luận “khớp”.
7. Lưu riêng dữ liệu nguyên bản và dữ liệu chuẩn hóa.

## JSON gợi ý
```json
{
  "case_id": "TV-YYYY-NNN",
  "birth": {
    "date": "YYYY-MM-DD",
    "calendar": "solar_or_lunar",
    "leap_month": null,
    "time": "HH:MM",
    "time_uncertainty_minutes": null,
    "birthplace": null,
    "timezone": null,
    "sex_for_chart_rules": null
  },
  "chart_source": {
    "name": null,
    "school": null,
    "version": null
  },
  "chart": {
    "menh": null,
    "than": null,
    "cuc": null,
    "yin_yang": null,
    "palaces": []
  },
  "uncertainties": [],
  "ingest_status": "unverified"
}
```

Mỗi phần tử `palaces` nên có `name`, `branch`, `stem`, `major_stars`, `minor_stars`, `transformations`, `tuan_triet`, `changsheng`, `star_states`, `notes`.
