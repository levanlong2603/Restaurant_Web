create database restaurant_db;
drop database restaurant_db;
use restaurant_db;

select * from menu ;
select * from `table`; 
select * from customer;
select * from user;
select * from bill;
select * from reservation;
select * from reservation_detail;
select * from order_item;
select * from reservations;

DESCRIBE order_item;
DESCRIBE menu;
DESCRIBE reservation;

ALTER TABLE reservation ADD COLUMN checkout_time DATETIME;
ALTER TABLE reservation ADD COLUMN dwell_time INTEGER;

-- Tắt chế độ safe update mode
SET SQL_SAFE_UPDATES = 0;
-- Bật lại chế độ safe update mode (khuyến nghị)
SET SQL_SAFE_UPDATES = 1;

-- Xóa dữ liệu từ bảng bill
DELETE FROM bill;
-- Xóa dữ liệu từ bảng order_item
DELETE FROM order_item;
-- Xóa dữ liệu từ bảng reservation_detail
DELETE FROM reservation_detail;
-- Xóa dữ liệu từ bảng reservation
DELETE FROM reservation;
-- Xóa dữ liệu từ các bảng không phụ thuộc
DELETE FROM user;
DELETE FROM customer;
DELETE FROM `table`;
DELETE FROM menu;

ALTER TABLE reservation
MODIFY COLUMN status ENUM('pending', 'preparing', 'serving', 'completed', 'paid', 'cancelled');

-- Index cho bảng bills
CREATE INDEX idx_bill_time ON bill (time);
CREATE INDEX idx_bill_reservation_id ON bill (reservation_id);

-- Index cho bảng reservations
CREATE INDEX idx_reservations_reservation_time ON reservation (reservation_time);
CREATE INDEX idx_reservation_status ON reservation (status);

-- Index cho bảng order_items
CREATE INDEX idx_order_item_reservation_id ON order_item (reservation_id);
CREATE INDEX idx_order_item_menu_id ON order_item (menu_id);
CREATE INDEX idx_order_item_status ON order_item (status);
CREATE INDEX idx_order_item_updated_at ON order_item (updatedAt);

-- Index cho bảng reservation_details
CREATE INDEX idx_reservation_detail_reservation_id ON reservation_detail (reservation_id);

ALTER TABLE reservation
MODIFY COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE reservation
MODIFY COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE order_item
MODIFY COLUMN status ENUM('serving', 'cancelled') NOT NULL DEFAULT 'serving';
ALTER TABLE order_item
CHANGE COLUMN updatedAt updated_at DATETIME;
ALTER TABLE order_item
CHANGE COLUMN createdAt created_at DATETIME;

ALTER TABLE customer CHANGE COLUMN createdAt created_at DATETIME;
ALTER TABLE customer CHANGE COLUMN updatedAt updated_at DATETIME;

ALTER TABLE reservation CHANGE COLUMN createdAt created_at DATETIME;
ALTER TABLE reservation CHANGE COLUMN updatedAt updated_at DATETIME;

ALTER TABLE menu CHANGE COLUMN createdAt created_at DATETIME;
ALTER TABLE menu CHANGE COLUMN updatedAt updated_at DATETIME;
ALTER TABLE menu
ADD COLUMN created_at DATETIME;
ALTER TABLE menu
ADD COLUMN updated_at DATETIME;

UPDATE menu
SET updated_at = NOW()
WHERE updated_at IS NULL;
UPDATE menu
SET created_at = NOW()
WHERE created_at IS NULL;

ALTER TABLE menu
MODIFY COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE menu
MODIFY COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- insert dữ liệu mẫu 

INSERT INTO customer (name, phoneNumber) VALUES ('Nguyen Van A', '0123456789');
INSERT INTO reservation (customer_id, reservation_time, num_people, status) VALUES (4, '2025-04-20 10:00:00', 4, 'completed');
INSERT INTO order_item (reservation_id, menu_id, quantity, status, createdAt, updatedAt) 
VALUES (7, 1, 2, 'serving', '2025-04-20 10:00:00', '2025-04-20 10:15:00');

INSERT INTO menu (name, price, description, category, image, deleted) VALUES
-- Khai vị / Appetizers
('Gỏi cuốn tôm thịt', 45000.00, 'Gỏi cuốn tươi ngon với tôm, thịt heo, rau sống và bún, chấm nước mắm chua ngọt.', 'appetizer', NULL, 0),
('Chả giò rế', 50000.00, 'Chả giò rế giòn rụm, nhân tôm thịt đậm đà, ăn kèm rau sống và nước chấm.', 'appetizer', NULL, 0),

-- Món chính / Main Dishes
('Cơm tấm sườn nướng', 75000.00, 'Cơm tấm thơm ngon với sườn nướng ướp đậm đà, ăn kèm trứng ốp la và nước mắm.', 'main_dish', NULL, 0),
('Bún bò Huế', 80000.00, 'Bún bò Huế đậm đà với nước dùng cay nồng, thịt bò, giò heo và rau thơm.', 'main_dish', NULL, 0),

-- Món ăn kèm / Side Dishes
('Salad', 20000.00, 'rau củ tươi giòn, giải ngán.', 'side_dish', NULL, 0),
('Khoai tây chiên', 35000.00, 'Khoai tây chiên giòn rụm, ăn kèm với sốt cà chua hoặc mayonnaise.', 'side_dish', NULL, 0),

-- Đặc sản vùng miền / Regional Specialties
('Bánh xèo miền Tây', 65000.00, 'Bánh xèo giòn rụm với nhân tôm, thịt, giá đỗ, ăn kèm rau sống và nước chấm.', 'regional_specialty', NULL, 0),
('Cao lầu Hội An', 70000.00, 'Cao lầu đặc trưng với sợi mì dai, thịt heo, rau sống và nước dùng đậm đà.', 'regional_specialty', NULL, 0),

-- Món chay / Vegetarian Dishes
('Đậu hũ chiên sả ớt', 40000.00, 'Đậu hũ chiên giòn, ướp sả ớt thơm lừng, phù hợp cho người ăn chay.', 'vegetarian', NULL, 0),
('Nấm xào sả ớt', 45000.00, 'Nấm tươi xào với sả ớt, gia vị đậm đà, ăn kèm cơm trắng.', 'vegetarian', NULL, 0),

-- Tráng miệng / Desserts
('Chè ba màu', 30000.00, 'Chè ba màu ngọt mát với đậu đỏ, đậu xanh, nước cốt dừa và đá bào.', 'dessert', NULL, 0),
('Bánh flan caramel', 25000.00, 'Bánh flan mềm mịn, phủ lớp caramel ngọt ngào, thích hợp tráng miệng.', 'dessert', NULL, 0),

-- Đồ uống / Beverages
('Trà đào cam sả', 35000.00, 'Trà đào thơm mát kết hợp với cam và sả, giải nhiệt ngày hè.', 'beverage', NULL, 0),
('Trà lựu', 40000.00, 'Hương lựu thơm ngon', 'beverage', NULL, 0);


