---
name: tu-vi-dau-so-research
description: Nghiên cứu và luận giải Tử Vi Đẩu Số Việt Nam theo phương pháp đối chiếu nhiều tầng. Dùng để chuẩn hóa lá số, luận Mệnh–Thân–Cục, tam phương tứ chính, Tứ Hóa, vận hạn, hiệu chỉnh giờ sinh, so sánh trường phái, nghiệm lý và phản biện bản luận.
license: MIT
metadata:
  author: Duan Digi (upstream); Gemini adaptation
  version: 1.1.0-gemini
  language: vi
---

# Tử Vi Đẩu Số Research Skill

## Mục tiêu
Chuẩn hóa dữ kiện, phân tích có cấu trúc, truy vết chứng cứ và phản chứng. Không phán đoán tuyệt đối.

## Kích hoạt
Khi người dùng yêu cầu chép lá số, luận cấu trúc/chủ đề/vận hạn, hiệu chỉnh giờ sinh, so sánh trường phái, phản biện hoặc nghiệm lý.

## Chế độ
`INGEST`, `CORE`, `TOPIC`, `TIMING`, `RECTIFY`, `SOURCE_COMPARE`, `CRITIQUE`, `VALIDATE_CASE`.

## Quy trình
1. Xác định yêu cầu, chế độ, phạm vi cung và lớp thời gian đang hỏi.
2. Khóa dữ kiện đầu vào; tách sao bản mệnh, sao lưu niên và dữ kiện vận. Không tự điền trường vắng mặt.
3. Nếu có `src/data/ziwei-interpretation-db.json`, đọc `references/DATABASE_INTEGRATION.md` và chọn quy tắc đúng chủ đề, cung, sao, quan hệ cung và lớp thời gian. Kho này là hướng dẫn biên soạn của dự án, không mặc nhiên là cổ thư hay chân lý.
4. Đọc chính cung, Mệnh–Thân khi liên quan, tam phương tứ chính; dùng cung giáp và liên cung làm chứng cứ phụ. Không coi một sao riêng lẻ là kết luận.
5. Với kết luận đáng kể, đối chiếu chứng cứ thuận, phản chứng, điều kiện biểu hiện và giới hạn của dữ liệu.
6. Xử lý mâu thuẫn theo bối cảnh; không cộng trừ sao, áp hệ số, hoặc suy ra độ mạnh nếu không có quy tắc phù hợp.
7. Tách khuynh hướng nền, kịch bản có điều kiện và thời điểm. Chỉ luận vận khi payload có đúng dữ kiện của tầng vận được hỏi.
8. Trả lời đúng định dạng và mức chi tiết người dùng yêu cầu; viết tự nhiên, tránh lặp, tránh chấm điểm hoặc xác suất giả.

## Tài liệu tham chiếu
- `references/INPUT_AND_CHART_SCHEMA.md`
- `references/REASONING_ENGINE.md`
- `references/PALACE_CROSS_REFERENCE.md`
- `references/LUCK_CYCLE_ENGINE.md`
- `references/SOURCE_POLICY.md`
- `references/OUTPUT_CONTRACT.md`
- `references/CASE_VALIDATION_PROTOCOL.md`
- `references/PROMPT_LIBRARY.md`
- `references/DATABASE_INTEGRATION.md`

## Giới hạn
Tử Vi là hệ thống diễn giải truyền thống, không phải khoa học dự đoán đã được xác nhận. Không chẩn đoán, không đưa lời khuyên y tế/pháp lý/tài chính quyết định, không khẳng định tai họa hoặc sự kiện nghiêm trọng.
