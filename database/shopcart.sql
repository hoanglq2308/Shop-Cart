-- ShopCart database schema for PostgreSQL

-- =====================================================================
-- 1. USERS
-- =====================================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 2. PRODUCTS
-- =====================================================================
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(512),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INT NOT NULL CHECK (stock_quantity >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- =====================================================================
-- 3. COUPONS
-- =====================================================================
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_value NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (min_order_value >= 0),
    usage_limit INT NOT NULL DEFAULT 1 CHECK (usage_limit >= 1),
    used_count INT NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    expiry_date TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- =====================================================================
-- 4. CARTS & CART ITEMS
-- =====================================================================
CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity >= 1),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, product_id)
);

-- =====================================================================
-- 5. ORDERS & ORDER ITEMS
-- =====================================================================
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    coupon_id BIGINT REFERENCES coupons(id) ON DELETE SET NULL,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price > 0),
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity >= 1),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0)
);

-- =====================================================================
-- 6. INDEXES
-- =====================================================================
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_coupon_id ON orders(coupon_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- =====================================================================
-- 7. SAMPLE DATA
-- =====================================================================
INSERT INTO users (email, full_name, phone, password, role) VALUES 
('quanghoang@sgu.edu.vn', 'Quang Hoàng', '0901234567', '123456', 'CUSTOMER'),
('tester@gmail.com', 'Nguyen Van Test', '0987654321', '123456', 'CUSTOMER');

INSERT INTO products (name, image_url, price, stock_quantity, status) VALUES 
('Màn hình ASUS 24 inch', 'http://localhost:8081/product/manhinh.webp', 2500000.00, 50, 'ACTIVE'),
('Bàn phím cơ', 'http://localhost:8081/product/phimco.webp', 1500000.00, 1, 'ACTIVE'),
('Chuột Gaming', 'http://localhost:8081/product/chuot.webp', 500000.00, 0, 'ACTIVE'),
('Tai nghe cũ', 'http://localhost:8081/product/tainghe.png', 300000.00, 10, 'INACTIVE');

INSERT INTO coupons (code, discount_type, discount_value, min_order_value, usage_limit, used_count, expiry_date, is_active) VALUES 
('GIAM10', 'PERCENTAGE', 10.00, 0.00, 100, 5, '2026-12-31 23:59:59', TRUE),
('TRU50K', 'FIXED_AMOUNT', 50000.00, 2000000.00, 50, 10, '2026-12-31 23:59:59', TRUE),
('HETHAN', 'PERCENTAGE', 20.00, 0.00, 100, 0, '2023-01-01 00:00:00', TRUE),
('HETLUOT', 'FIXED_AMOUNT', 100000.00, 0.00, 10, 10, '2026-12-31 23:59:59', TRUE);

INSERT INTO carts (user_id) VALUES (1);

INSERT INTO cart_items (cart_id, product_id, quantity) VALUES 
(1, 1, 2),
(1, 2, 1);

INSERT INTO orders (user_id, coupon_id, subtotal, shipping_fee, discount_amount, total_price, shipping_address, payment_method, status) VALUES 
(2, 1, 5000000.00, 30000.00, 500000.00, 4530000.00, 'Đại học Sài Gòn, TP.HCM', 'COD', 'COMPLETED'),
(2, NULL, 1500000.00, 0.00, 0.00, 1500000.00, 'Quận 1, TP.HCM', 'CREDIT_CARD', 'PENDING');

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES 
(1, 1, 2, 2500000.00),
(2, 2, 1, 1500000.00);