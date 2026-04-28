-- 1. Bảng Users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20)
);

-- 2. Bảng Products
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INT NOT NULL CHECK (stock_quantity >= 0), -- Chặn xuất kho quá mức (Negative test)
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 3. Bảng Coupons
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_value DECIMAL(10, 2) DEFAULT 0,
    usage_limit INT DEFAULT 1,
    used_count INT DEFAULT 0,
    expiry_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. Bảng Carts & Cart Items
CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT REFERENCES carts(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity >= 1), -- Validation rule: >= 1
    UNIQUE(cart_id, product_id) -- Edge case: Thêm cùng sản phẩm (cộng dồn chứ không tạo record mới)
);

-- 5. Bảng Orders & Order Items
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    coupon_id BIGINT REFERENCES coupons(id) NULL,
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    shipping_fee DECIMAL(10, 2) DEFAULT 0 CHECK (shipping_fee >= 0),
    discount_amount DECIMAL(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price > 0), -- Validation: Total Price > 0
    shipping_address TEXT NOT NULL, -- Validation: Địa chỉ không được rỗng
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'SHIPPED', 'CANCELLED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity >= 1),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0) -- Lưu giá tại thời điểm đặt
);
-- ==============================================================================
-- 1. Thêm dữ liệu Người dùng (Users)
-- ==============================================================================
INSERT INTO users (email, full_name, phone) VALUES 
('quanghoang@sgu.edu.vn', 'Quang Hoàng', '0901234567'),
('tester@gmail.com', 'Nguyen Van Test', '0987654321');


-- ==============================================================================
-- 2. Thêm dữ liệu Sản phẩm (Products)
-- Bao phủ các case: Đủ kho, Sát nút, Hết hàng, Ngừng kinh doanh
-- ==============================================================================
INSERT INTO products (name, price, stock_quantity, status) VALUES 
('Màn hình ASUS 24 inch', 2500000.00, 50, 'ACTIVE'),      -- ID 1: SP bình thường (Happy path)
('Bàn phím cơ', 1500000.00, 1, 'ACTIVE'),                 -- ID 2: Chỉ còn 1 cái (Boundary test: quantity = max tồn kho)
('Chuột Gaming', 500000.00, 0, 'ACTIVE'),                 -- ID 3: Hết hàng (Negative test: Add to cart khi stock = 0)
('Tai nghe cũ', 300000.00, 10, 'INACTIVE');               -- ID 4: Ngừng bán (Validation rule: Trạng thái không phải ACTIVE)


-- ==============================================================================
-- 3. Thêm dữ liệu Mã giảm giá (Coupons)
-- Bao phủ các case: Hợp lệ, Hết hạn, Hết lượt sử dụng, Chưa đủ điều kiện
-- ==============================================================================
INSERT INTO coupons (code, discount_type, discount_value, min_order_value, usage_limit, used_count, expiry_date, is_active) VALUES 
('GIAM10', 'PERCENTAGE', 10.00, 0.00, 100, 5, '2026-12-31 23:59:59', TRUE),             -- ID 1: Hợp lệ, giảm 10%
('TRU50K', 'FIXED_AMOUNT', 50000.00, 2000000.00, 50, 10, '2026-12-31 23:59:59', TRUE),  -- ID 2: Hợp lệ nhưng yêu cầu đơn tối thiểu 2 triệu
('HETHAN', 'PERCENTAGE', 20.00, 0.00, 100, 0, '2023-01-01 00:00:00', TRUE),             -- ID 3: Đã hết hạn (Edge case)
('HETLUOT', 'FIXED_AMOUNT', 100000.00, 0.00, 10, 10, '2026-12-31 23:59:59', TRUE);      -- ID 4: Đã đạt giới hạn sử dụng (used_count = usage_limit)


-- ==============================================================================
-- 4. Thêm dữ liệu Giỏ hàng (Carts & Cart Items)
-- Chuẩn bị sẵn một giỏ hàng để test tính tổng tiền và validate cập nhật số lượng
-- ==============================================================================
-- Tạo giỏ hàng cho user Quang Hoàng (ID: 1)
INSERT INTO carts (user_id) VALUES (1);

-- Thêm sản phẩm vào giỏ (Cart ID: 1)
INSERT INTO cart_items (cart_id, product_id, quantity) VALUES 
(1, 1, 2),   -- Thêm 2 Màn hình ASUS (Đủ tồn kho -> Happy Path)
(1, 2, 1);   -- Thêm 1 Bàn phím cơ (Chạm mốc tồn kho tối đa -> Boundary)
-- Playwright hoặc Vitest có thể gọi giỏ hàng ID 1 để test logic: Nếu tăng số lượng SP ID 2 lên 2 -> Báo lỗi ngay.


-- ==============================================================================
-- 5. Thêm dữ liệu Đơn hàng (Orders & Order Items)
-- Phục vụ cho Unit Test của OrderService (cancelOrder, getOrderById)
-- ==============================================================================
-- Tạo một đơn hàng đã hoàn tất cho user Tester (ID: 2)
INSERT INTO orders (user_id, coupon_id, subtotal, shipping_fee, discount_amount, total_price, shipping_address, payment_method, status) VALUES 
(2, 1, 5000000.00, 30000.00, 500000.00, 4530000.00, 'Đại học Sài Gòn, TP.HCM', 'COD', 'COMPLETED'), -- ID 1: Đơn hàng thành công
(2, NULL, 1500000.00, 0.00, 0.00, 1500000.00, 'Quận 1, TP.HCM', 'CREDIT_CARD', 'PENDING');          -- ID 2: Đơn hàng đang chờ xử lý (Có thể dùng test cancelOrder)

-- Chi tiết đơn hàng ID 1 (Mua 2 màn hình lúc giá còn 2,500,000)
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES 
(1, 1, 2, 2500000.00);

-- Chi tiết đơn hàng ID 2 (Mua 1 bàn phím)
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES 
(2, 2, 1, 1500000.00);