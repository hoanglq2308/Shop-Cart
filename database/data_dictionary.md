# Từ Điển Dữ Liệu (Data Dictionary) - ShopCart

Tài liệu này định nghĩa cấu trúc dữ liệu và các ràng buộc (Validation Rules) được thiết lập trực tiếp dưới database, phục vụ cho việc đối chiếu và viết Unit Test/Integration Test.

## 1. Bảng `users`
Lưu trữ thông tin khách hàng.
| Cột | Kiểu dữ liệu | Ràng buộc (Constraints) | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | Khóa chính tự tăng |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Dùng làm tài khoản đăng nhập |
| `full_name` | VARCHAR(255) | NOT NULL | Tên hiển thị của khách hàng |
| `phone` | VARCHAR(20) | NULL | Số điện thoại liên hệ |

## 2. Bảng `products`
Quản lý thông tin và số lượng tồn kho của sản phẩm.
| Cột | Kiểu dữ liệu | Ràng buộc (Constraints) | Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | |
| `name` | VARCHAR(255) | NOT NULL | |
| `price` | DECIMAL(10,2) | NOT NULL, `CHECK (price >= 0)` | Đơn giá không được âm |
| `stock_quantity`| INT | NOT NULL, `CHECK (stock_quantity >= 0)` | Tồn kho không được âm (Phục vụ Negative Test) |
| `status` | VARCHAR(20) | `CHECK (status IN ('ACTIVE', 'INACTIVE'))`| Mặc định là 'ACTIVE'. Chỉ bán SP 'ACTIVE' |

## 3. Bảng `coupons`
Quản lý các mã giảm giá áp dụng cho giỏ hàng/đơn hàng.
| Cột | Kiểu dữ liệu | Ràng buộc (Constraints) | Ghi chú |
| :--- | :--- | :--- | :--- |
| `code` | VARCHAR(50) | UNIQUE, NOT NULL | Mã người dùng nhập (VD: SALE10) |
| `discount_type` | VARCHAR(20) | `CHECK (IN ('PERCENTAGE', 'FIXED_AMOUNT'))`| Loại giảm giá |
| `discount_value`| DECIMAL(10,2) | NOT NULL, `CHECK (discount_value > 0)` | Số tiền hoặc % giảm |
| `min_order_value`| DECIMAL(10,2) | DEFAULT 0 | Điều kiện áp dụng |
| `usage_limit` | INT | DEFAULT 1 | Giới hạn số lần dùng mã |
| `used_count` | INT | DEFAULT 0 | Số lần đã sử dụng |
| `expiry_date` | TIMESTAMP | NOT NULL | Hạn sử dụng của mã |
| `is_active` | BOOLEAN | DEFAULT TRUE | Cờ bật/tắt mã thủ công |

## 4. Bảng `carts` & `cart_items`
Lưu trữ trạng thái giỏ hàng hiện tại của người dùng.
**Bảng `carts`:**
* `user_id`: BIGINT, UNIQUE. Ràng buộc khóa ngoại (ON DELETE CASCADE). Đảm bảo 1 user chỉ có 1 giỏ hàng active.

**Bảng `cart_items`:**
| Cột | Kiểu dữ liệu | Ràng buộc (Constraints) | Ghi chú |
| :--- | :--- | :--- | :--- |
| `quantity` | INT | NOT NULL, `CHECK (quantity >= 1)` | Số lượng tối thiểu khi thêm là 1 |
| `cart_id, product_id`| | `UNIQUE(cart_id, product_id)` | Tránh trùng lặp 1 SP nhiều dòng trong giỏ |

## 5. Bảng `orders` & `order_items`
Lưu trữ thông tin thanh toán và lịch sử giao dịch.
**Bảng `orders`:**
| Cột | Kiểu dữ liệu | Ràng buộc (Constraints) | Ghi chú |
| :--- | :--- | :--- | :--- |
| `subtotal` | DECIMAL(10,2) | NOT NULL, `CHECK (subtotal >= 0)` | Tiền hàng trước giảm giá |
| `shipping_fee` | DECIMAL(10,2) | `CHECK (shipping_fee >= 0)` | Phí vận chuyển |
| `discount_amount`| DECIMAL(10,2) | `CHECK (discount_amount >= 0)` | Số tiền được giảm |
| `total_price` | DECIMAL(10,2) | NOT NULL, `CHECK (total_price > 0)` | Validation: Đơn hàng phải > 0 đồng |
| `shipping_address`| TEXT | NOT NULL | Validation: Không được rỗng |
| `status` | VARCHAR(20) | `CHECK (IN ('PENDING', 'PAID', 'SHIPPED', 'CANCELLED'))` | Luồng trạng thái đơn hàng |

**Bảng `order_items`:**
| Cột | Kiểu dữ liệu | Ràng buộc (Constraints) | Ghi chú |
| :--- | :--- | :--- | :--- |
| `quantity` | INT | NOT NULL, `CHECK (quantity >= 1)` | |
| `unit_price` | DECIMAL(10,2) | NOT NULL, `CHECK (unit_price >= 0)` | **Lưu ý:** Đây là giá chốt tại thời điểm mua, không lấy trực tiếp từ bảng products |
