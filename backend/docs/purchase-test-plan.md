# Kế Hoạch Test Purchase Backend

## Tóm tắt yêu cầu

Checkout phải validate dữ liệu đầu vào, kiểm tra sản phẩm còn bán và đủ tồn kho, tính tiền bằng `BigDecimal`, chỉ áp dụng coupon hợp lệ, tạo đơn ở trạng thái `PENDING`, trừ tồn kho, và hoàn tồn kho khi hủy đơn hợp lệ.

## 5 test case quan trọng

| ID | Scenario | Input | Expected result | Risk covered |
| --- | --- | --- | --- | --- |
| TC-PUR-01 | Tạo đơn thành công | User tồn tại, product `ACTIVE`, đủ tồn kho, địa chỉ hợp lệ, shipping fee không âm | `201 Created`, status `PENDING`, tổng tiền đúng, tồn kho bị trừ | Luồng checkout chính |
| TC-PUR-02 | Từ chối khi thiếu tồn kho | Quantity lớn hơn stock | Business exception / `400`, không lưu order, tồn kho không đổi | Chống bán quá tồn kho |
| TC-PUR-03 | Áp dụng coupon hợp lệ | Coupon active, chưa hết hạn, chưa vượt usage limit, subtotal đạt min order | Discount được tính đúng vào total | Rule coupon |
| TC-PUR-04 | Bỏ qua coupon không hợp lệ/hết hạn | Coupon hết hạn hoặc vượt lượt dùng | Discount `0`, total vẫn hợp lệ | An toàn khi mã giảm giá sai |
| TC-PUR-05 | Hủy đơn hoàn tồn kho | Order đang `PENDING` hoặc `PAID` có order items | Status thành `CANCELLED`, stock được cộng lại | Tính nhất quán khi cancel |

## Ghi chú bảo vệ

- Unit test cô lập `OrderService` để chứng minh business rules không phụ thuộc HTTP/database.
- Mock test dùng `ArgumentCaptor` để kiểm tra entity `Order` ngay trước khi persist.
- Integration test dùng MockMvc và H2 test profile để kiểm tra controller, service, repository, JPA và JSON cùng lúc.
- k6 test nhắm vào API Purchase quan trọng nhất và đo latency, throughput, error rate, stock-lock contention.
