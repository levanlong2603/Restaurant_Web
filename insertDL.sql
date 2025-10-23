-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 23, 2025 at 07:05 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `restaurant_db`
--
CREATE DATABASE IF NOT EXISTS `restaurant_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `restaurant_db`;
-- --------------------------------------------------------

--
-- Table structure for table `bill`
--

CREATE TABLE `bill` (
  `bill_id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `payment_method` enum('cash','credit_card','bank_transfer') NOT NULL DEFAULT 'cash',
  `total_amount` float NOT NULL,
  `time` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bill`
--

INSERT INTO `bill` (`bill_id`, `reservation_id`, `staff_id`, `payment_method`, `total_amount`, `time`, `createdAt`, `updatedAt`) VALUES
(1, 1, 3, 'cash', 220000, '2025-10-06 20:43:34', '2025-10-06 20:43:34', '2025-10-06 20:43:34'),
(2, 2, 3, 'cash', 760000, '2025-10-07 22:24:05', '2025-10-07 22:24:05', '2025-10-07 22:24:05'),
(3, 4, 3, 'bank_transfer', 335000, '2025-10-17 12:20:52', '2025-10-17 12:20:52', '2025-10-17 12:20:52'),
(4, 3, 3, 'cash', 440000, '2025-10-17 12:24:16', '2025-10-17 12:24:16', '2025-10-17 12:24:16'),
(5, 5, 3, 'credit_card', 220000, '2025-10-17 12:39:24', '2025-10-17 12:39:24', '2025-10-17 12:39:24'),
(6, 6, 3, 'cash', 845000, '2025-10-17 12:48:03', '2025-10-17 12:48:03', '2025-10-17 12:48:03'),
(7, 9, 3, 'cash', 860000, '2025-10-17 13:03:12', '2025-10-17 13:03:12', '2025-10-17 13:03:12');

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `customer_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phoneNumber` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`customer_id`, `name`, `phoneNumber`, `createdAt`, `updatedAt`) VALUES
(1, 'abc', '1111111111', '2025-10-06 19:12:21', '2025-10-06 19:12:21'),
(2, 'ânnana', '1212121212', '2025-10-06 20:42:24', '2025-10-06 20:42:24'),
(3, 'Long', '0348047350', '2025-10-17 11:43:37', '2025-10-17 11:43:37'),
(4, 'quân', '0333054438', '2025-10-17 12:38:03', '2025-10-17 12:38:03'),
(5, 'abc', '1234567890', '2025-10-17 12:46:24', '2025-10-17 12:46:24'),
(6, '123', '1234512345', '2025-10-17 13:01:02', '2025-10-17 13:01:02'),
(7, '123', '1234512346', '2025-10-17 13:02:05', '2025-10-17 13:02:05');

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `menu_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `imagePublicId` varchar(255) DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menu`
--

INSERT INTO `menu` (`menu_id`, `name`, `price`, `description`, `category`, `image`, `imagePublicId`, `deleted`) VALUES
(1, 'Gỏi tôm cuốn thịt', 115000.00, 'Món cuốn thanh mát gồm tôm sú, thịt luộc, bún tươi và rau thơm, được gói trong bánh tráng mỏng dẻo. Ăn kèm nước chấm đậu phộng đặc trưng, mang đến hương vị nhẹ nhàng và tinh tế.', 'appetizer', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759754435/menu/appetizer/m6blq1tbnj9nk2wceew7.jpg', 'menu/appetizer/m6blq1tbnj9nk2wceew7', 0),
(2, 'Nộm tai heo hoa chuối', 80000.00, 'Món gỏi giòn sần sật với tai heo thái mỏng, hoa chuối bào và rau thơm, trộn cùng nước mắm chua cay, rắc đậu phộng rang thơm. Hài hòa giữa vị béo, chua và giòn mát.', 'appetizer', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759754646/menu/appetizer/ayjy7tj6vbplgomtnz2e.jpg', 'menu/appetizer/ayjy7tj6vbplgomtnz2e', 0),
(3, 'Nộm rau má', 105000.00, 'Rau má tươi trộn cùng hành tím, cà rốt và đậu phộng rang, tạo nên món gỏi thanh mát, giải nhiệt, rất thích hợp mở đầu bữa ăn.', 'appetizer', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759754844/menu/appetizer/mlrypjbgwm6s0ajyw182.webp', 'menu/appetizer/mlrypjbgwm6s0ajyw182', 0),
(4, 'Nộm tôm bưởi', 105000.00, 'hịt tôm tươi giòn hòa quyện cùng tép bưởi mọng nước, rau thơm và nước trộn chua ngọt đặc trưng. Món gỏi thanh mát, vị chua ngọt tự nhiên, kích thích vị giác.', 'appetizer', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759755039/menu/appetizer/igfa1f8hhf72lelc0jkz.jpg', 'menu/appetizer/igfa1f8hhf72lelc0jkz', 0),
(5, 'Nộm rau muống thịt bò', 105000.00, 'au muống chẻ trụng sơ giữ độ giòn, trộn cùng thịt bò xào mềm, hành phi và nước mắm tỏi ớt. Món ăn đậm đà nhưng vẫn thanh nhẹ.', 'appetizer', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759755211/menu/appetizer/psmcmnilo8kzrdnmfjua.jpg', 'menu/appetizer/psmcmnilo8kzrdnmfjua', 0),
(6, 'Đậu tắm hành', 45000.00, 'Món đậu hũ chiên vàng, rưới hành phi và mỡ hành thơm phức, ăn cùng nước mắm chua ngọt. Món ăn dân dã nhưng đậm đà hương vị quê nhà.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759759463/menu/side_dish/upk6hokvmen7lpk3it9t.jpg', 'menu/side_dish/upk6hokvmen7lpk3it9t', 0),
(7, 'Trứng đúc thịt', 85000.00, 'Món trứng hấp cùng thịt băm, hành lá và gia vị truyền thống, tạo nên hương vị mềm mịn, béo ngậy và đậm đà.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759759640/menu/main_dish/tstgr9xospnx5uy9ewvc.png', 'menu/main_dish/tstgr9xospnx5uy9ewvc', 0),
(8, 'Chả lá lốt', 100000.00, 'Thịt băm được ướp thơm, gói trong lá lốt rồi nướng trên than hồng, tỏa mùi thơm đặc trưng. Ăn kèm bún, rau sống và nước chấm.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759759719/menu/main_dish/qfbuuirudzm05v4nioew.jpg', 'menu/main_dish/qfbuuirudzm05v4nioew', 0),
(9, 'Rau củ luộc chấm kho quẹt', 100000.00, 'Đĩa rau củ luộc tươi xanh (đậu bắp, cà rốt, bắp cải…) ăn kèm kho quẹt mặn ngọt, cay nhẹ, béo bùi từ tôm khô và tóp mỡ.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759759775/menu/main_dish/jrliajbovks83ziri2z0.jpg', 'menu/main_dish/jrliajbovks83ziri2z0', 0),
(10, 'Rau muống xào tóp mỡ', 85000.00, 'Rau muống giòn xanh xào nhanh trên lửa lớn với tóp mỡ vàng giòn, mang vị béo thơm và đậm đà dân dã.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759759885/menu/main_dish/vpijofsvvva6sbtyei0y.webp', 'menu/main_dish/vpijofsvvva6sbtyei0y', 0),
(11, 'Súp lơ xào tỏi', 75000.00, 'Hoa súp lơ tươi giòn, xào thơm cùng tỏi băm, giữ nguyên màu xanh và độ giòn tự nhiên. Món ăn thanh vị, tốt cho sức khỏe.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759759987/menu/side_dish/itexightilnwg0oocdci.jpg', 'menu/side_dish/itexightilnwg0oocdci', 0),
(12, 'Đậu nhồi thịt sốt cà chua', 95000.00, 'Đậu hũ được khoét ruột, nhồi thịt băm ướp gia vị, chiên vàng rồi nấu cùng nước sốt cà chua chua ngọt hấp dẫn.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759760161/menu/main_dish/jiex7huxdlpqbstk2uyg.jpg', 'menu/main_dish/jiex7huxdlpqbstk2uyg', 0),
(13, 'Thịt rang cháy cạnh', 100000.00, 'Thịt ba chỉ thái lát, rim vàng cạnh, đậm vị mặn ngọt, ăn cùng cơm trắng rất đưa cơm.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759760292/menu/main_dish/wwgwyfvpplopopsmezr1.webp', 'menu/main_dish/wwgwyfvpplopopsmezr1', 0),
(14, 'Thịt kho trứng cút', 115000.00, 'Thịt ba chỉ kho mềm cùng trứng cút trong nước dừa, hương vị béo ngậy, ngọt nhẹ.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759760358/menu/main_dish/xmyde70mfmsgxew5rj6d.jpg', 'menu/main_dish/xmyde70mfmsgxew5rj6d', 0),
(15, 'Thịt quay', 145000.00, 'Thịt ba rọi quay giòn da, lớp mỡ thơm béo, thịt mềm ngọt tự nhiên.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759760417/menu/main_dish/bmvlqagpeub8xqqpqazj.webp', 'menu/main_dish/bmvlqagpeub8xqqpqazj', 0),
(16, 'Thịt kho dừa non', 115000.00, 'Thịt kho mềm, thấm vị nước dừa non, tạo hương thơm ngọt tự nhiên, béo nhẹ và đậm đà.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759760804/menu/main_dish/w7zqfn6dqr7nrta1zb25.jpg', 'menu/main_dish/w7zqfn6dqr7nrta1zb25', 0),
(17, 'Sườn xào chua ngọt', 115000.00, 'Sườn non chiên vàng, áo đều lớp sốt chua ngọt sánh quyện, kích thích vị giác.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759760910/menu/main_dish/nbix5wfbh0w9gx2e0vby.webp', 'menu/main_dish/nbix5wfbh0w9gx2e0vby', 0),
(18, 'Thịt băm rang', 95000.00, 'Thịt heo băm xào săn, thấm vị nước mắm, hành tỏi, ớt, rất bắt cơm.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759761030/menu/main_dish/yqsvj7qoxpkovyiw9e9m.jpg', 'menu/main_dish/yqsvj7qoxpkovyiw9e9m', 0),
(19, 'Thịt chưng mắm tép', 95000.00, 'Thịt băm trộn mắm tép, hấp chín tạo hương vị đậm đà đặc trưng của miền Bắc.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759761099/menu/main_dish/jfutnwfwuncimeo0iedw.webp', 'menu/main_dish/jfutnwfwuncimeo0iedw', 0),
(20, 'Rau muống luộc', 55000.00, 'Rau muống tươi luộc chín vừa, giữ màu xanh và độ giòn, chấm cùng nước mắm tỏi ớt hoặc trứng luộc.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759844030/menu/side_dish/yv7ec0fu9f0xzfkqb1tz.jpg', 'menu/side_dish/yv7ec0fu9f0xzfkqb1tz', 0),
(21, 'Bắp cải xào', 65000.00, 'Bắp cải xào nhanh tay trên lửa lớn với tỏi và gia vị, giữ vị ngọt và độ giòn.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759844272/menu/side_dish/y1uofvd1zy6r4nutyeda.jpg', 'menu/side_dish/y1uofvd1zy6r4nutyeda', 0),
(22, 'Cải ngồng luộc (chấm trứng)', 65000.00, 'Cải ngồng luộc tươi xanh, chấm với lòng đỏ trứng muối hoặc trứng luộc nghiền mịn.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759844345/menu/side_dish/reip3dd8tcepwuotkceu.jpg', 'menu/side_dish/reip3dd8tcepwuotkceu', 0),
(23, 'Cải chíp xào nấm', 65000.00, 'Cải chíp non xào cùng nấm hương, giữ độ giòn và vị ngọt tự nhiên.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759844401/menu/side_dish/eptylvp4u2fghwjxu22k.jpg', 'menu/side_dish/eptylvp4u2fghwjxu22k', 0),
(24, 'Ngọn su xào tỏi', 75000.00, 'Ngọn su non xào thơm cùng tỏi, giữ nguyên độ giòn và vị thanh mát.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759844520/menu/side_dish/fvatvd05ocoknqgbvqns.jpg', 'menu/side_dish/fvatvd05ocoknqgbvqns', 0),
(25, 'Súp lơ xào bò', 155000.00, 'Bò mềm xào nhanh tay với súp lơ xanh giòn ngọt, thấm vị tỏi và dầu hào, thơm nhẹ và thanh mát.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759844706/menu/main_dish/curvqvo6vgaos9ffa26d.webp', 'menu/main_dish/curvqvo6vgaos9ffa26d', 0),
(26, 'Gà xào gừng', 235000.00, 'Thịt gà ta xào cùng gừng tươi, vị cay nhẹ và thơm nồng, kích thích vị giác và ấm bụng', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759845187/menu/main_dish/e7dt1vmane72lc7hz8j0.avif', 'menu/main_dish/e7dt1vmane72lc7hz8j0', 0),
(27, 'Bún cá Châu Đốc', 80000.00, 'Hương vị đậm đà, tươi ngọt và cay nhẹ của bún cá Châu Đốc khiến thực khách như đang thưởng thức trọn vẹn tinh túy miền Tây trong một bát bún nóng hổi.', 'regional_specialty', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759845710/menu/regional_specialty/czo27ecvc7b9ogxruqnv.jpg', 'menu/regional_specialty/czo27ecvc7b9ogxruqnv', 0),
(28, 'Gỏi gà măng cụt', 95000.00, 'Gỏi gà măng cụt không chỉ là món ăn giải nhiệt ngày hè mà còn là đặc sản trứ danh của miệt vườn Lái Thiêu (Bình Dương), nơi trái cây và ẩm thực giao hòa tinh tế.', 'regional_specialty', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759845816/menu/regional_specialty/hzjrdjkzsyuzg1biorju.jpg', 'menu/regional_specialty/hzjrdjkzsyuzg1biorju', 0),
(29, 'Vịt quay 7 vị', 250000.00, 'Vịt quay 7 vị không chỉ là món ngon hấp dẫn mà còn là biểu tượng của sự cầu kỳ và tinh tế trong ẩm thực Việt – Hoa, thường xuất hiện trong các bữa tiệc sang trọng và dịp lễ đặc biệt.', 'regional_specialty', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846043/menu/regional_specialty/xaccnpdedojswb6it834.webp', 'menu/regional_specialty/xaccnpdedojswb6it834', 0),
(30, 'Cá kho làng Vũ Đại', 150000.00, 'Cá kho làng Vũ Đại không chỉ là món ăn mà còn là niềm tự hào văn hóa, minh chứng cho sự tỉ mỉ và khéo léo của người dân Bắc Bộ qua từng niêu cá được kho bằng cả tâm hồn.', 'regional_specialty', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846108/menu/regional_specialty/z5kpj1rvlrdv4fdj8rms.webp', 'menu/regional_specialty/z5kpj1rvlrdv4fdj8rms', 0),
(31, 'Canh cua mồng tơi', 95000.00, 'Canh cua đồng nấu cùng mồng tơi và mướp hương, vị ngọt thanh tự nhiên, đậm đà hương quê Bắc Bộ.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846421/menu/dessert/hz8sl0eswvvpsp51pjp6.jpg', 'menu/dessert/hz8sl0eswvvpsp51pjp6', 0),
(32, 'Canh ngao hến nấu chua', 95000.00, 'Ngao và hến tươi nấu với cà chua, dứa và me chua, tạo vị thanh dịu, thơm mát và rất bắt cơm.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846528/menu/dessert/hjxmud5gqp9mbfixrsio.jpg', 'menu/dessert/hjxmud5gqp9mbfixrsio', 0),
(33, 'Canh tôm bầu', 105000.00, 'Tôm tươi bóc vỏ nấu cùng bầu non, nước dùng ngọt nhẹ, thanh mát, thích hợp cho bữa cơm gia đình.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846587/menu/dessert/lp4tgp2vfgcd74unwuvh.webp', 'menu/dessert/lp4tgp2vfgcd74unwuvh', 0),
(34, 'Canh rau ngót thịt băm', 85000.00, 'Rau ngót tươi nấu cùng thịt băm, nước dùng ngọt tự nhiên, thơm mùi lá rau, món canh truyền thống của mọi gia đình Việt.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846807/menu/dessert/fuhmpqytdvwj6f0jecyb.jpg', 'menu/dessert/fuhmpqytdvwj6f0jecyb', 0),
(35, 'Nước chanh tươi', 30000.00, 'Giải khát nhanh chóng với vị chua thanh mát, giúp cơ thể sảng khoái, tỉnh táo.', 'beverage', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846864/menu/beverage/qrwlmgjg1nras4aovyux.webp', 'menu/beverage/qrwlmgjg1nras4aovyux', 0),
(36, 'Nước cam ép', 45000.00, 'Cam tươi nguyên chất, ép lạnh giữ trọn vitamin C và hương vị tự nhiên, tốt cho sức khỏe.Cam tươi nguyên chất, ép lạnh giữ trọn vitamin C và hương vị tự nhiên, tốt cho sức khỏe.', 'beverage', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846906/menu/beverage/qpyuxaiqax9vdg9lpzrj.jpg', 'menu/beverage/qpyuxaiqax9vdg9lpzrj', 0),
(37, 'Nước khoáng Lavie', 15000.00, 'Nước khoáng thiên nhiên tinh khiết, bổ sung khoáng chất thiết yếu cho cơ thể.', 'beverage', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846966/menu/beverage/ne7ampca4fqwkn44xwx1.webp', 'menu/beverage/ne7ampca4fqwkn44xwx1', 0),
(38, 'Coca-Cola', 25000.00, 'Thức uống có gas sảng khoái, mang hương vị truyền thống, phù hợp mọi bữa ăn.', 'beverage', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759847009/menu/beverage/gmnavpntubr0syn6pq0i.webp', 'menu/beverage/gmnavpntubr0syn6pq0i', 0),
(39, 'Bia Sài Gòn', 35000.00, 'Vị bia đậm đà, đặc trưng của thương hiệu Việt, kết hợp hoàn hảo cùng các món nướng hoặc hải sản.', 'beverage', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759847060/menu/beverage/olt8cmbd7jjsadaxitzk.jpg', 'menu/beverage/olt8cmbd7jjsadaxitzk', 0),
(40, 'Gỏi ngó sen chay', 120000.00, 'Ngó sen tươi trộn cùng cà rốt, dưa leo và đậu phộng rang giòn, thấm vị chua ngọt thanh nhẹ – món khai vị thanh mát, kích thích vị giác.', 'vegetarian', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759847161/menu/vegetarian/de6f1ewk2pkpi5xwgahn.jpg', 'menu/vegetarian/de6f1ewk2pkpi5xwgahn', 0),
(41, 'Cơm chiên ngũ sắc chay', 150000.00, 'Cơm được chiên cùng đậu hũ, nấm hương, cà rốt, đậu que và bắp non, mang màu sắc bắt mắt, hương vị đậm đà mà không cần thịt.', 'vegetarian', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759847220/menu/vegetarian/dyj4ofjtjfbc9df4pnfd.jpg', 'menu/vegetarian/dyj4ofjtjfbc9df4pnfd', 0),
(42, 'Bún Huế chay', 175000.00, 'Nước dùng từ rau củ và sả ớt tạo vị cay nồng đặc trưng, ăn cùng chả chay, nấm và đậu hũ – món chay mang đậm hồn ẩm thực miền Trung.', 'vegetarian', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759847276/menu/vegetarian/ogjgr4lgxep13s5s3x63.jpg', 'menu/vegetarian/ogjgr4lgxep13s5s3x63', 0),
(43, 'Chả giò chay', 10000.00, 'Cuốn giòn rụm với nhân gồm miến, mộc nhĩ, cà rốt và củ sắn; chiên vàng thơm lừng – thích hợp làm món khai vị hoặc ăn kèm bún.', 'vegetarian', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759847315/menu/vegetarian/jsv5e0urhqmyzfztu0wx.jpg', 'menu/vegetarian/jsv5e0urhqmyzfztu0wx', 0),
(44, 'Bánh flan caramel', 30000.00, 'Trứng và sữa hòa quyện tạo nên bánh flan mềm mịn, phủ lớp caramel đắng nhẹ, mang lại vị ngọt dịu và cảm giác tan chảy nơi đầu lưỡi.', 'dessert', 'https://res.cloudinary.com/drem0ihib/image/upload/v1760679081/menu/dessert/skqapdgc8w4qg67prvv3.jpg', 'menu/dessert/skqapdgc8w4qg67prvv3', 0),
(45, 'Cam sành', 30000.00, 'Loại cam đặc sản Việt Nam với vỏ sần xanh thẫm, ruột vàng cam mọng nước. Vị ngọt đậm xen chút chua nhẹ tự nhiên, mang hương thơm dịu mát, giàu vitamin C, giúp thanh lọc cơ thể và giải khát tuyệt vời sau bữa ăn.', 'dessert', 'https://res.cloudinary.com/drem0ihib/image/upload/v1760679257/menu/dessert/e7u1o9z0bqxc7swrdheq.webp', 'menu/dessert/e7u1o9z0bqxc7swrdheq', 0),
(46, 'Sương sáo hạt é', 45000.00, 'Thức uống – tráng miệng kết hợp giữa sương sáo thanh mát, hạt é giòn nhẹ và nước đường thốt nốt – giải nhiệt tuyệt vời cho ngày nóng.', 'dessert', 'https://res.cloudinary.com/drem0ihib/image/upload/v1761237675/menu/dessert/mfwmzcaz6hvref6zfdsy.jpg', 'menu/dessert/mfwmzcaz6hvref6zfdsy', 0),
(47, 'Dưa hấu', 45000.00, 'Loại trái cây thanh mát, có phần ruột đỏ tươi, mọng nước và vị ngọt tự nhiên. Dưa hấu không chỉ giúp giải khát hiệu quả trong những ngày nắng nóng mà còn cung cấp nhiều vitamin A, C và chất chống oxy hóa, mang lại cảm giác tươi mới và sảng khoái sau bữa ăn.', 'dessert', 'https://res.cloudinary.com/drem0ihib/image/upload/v1761237743/menu/dessert/brxzt70bacmpjmgmmpzh.jpg', 'menu/dessert/brxzt70bacmpjmgmmpzh', 0),
(48, 'Chè khúc bạch', 55000.00, 'Món tráng miệng thanh mát gồm khối khúc bạch béo nhẹ, nhãn tươi và nước đường hạnh nhân, mang hương vị dịu ngọt, mát lạnh.', 'dessert', 'https://res.cloudinary.com/drem0ihib/image/upload/v1761237788/menu/dessert/idcbcnnxqund0spuxvsb.jpg', 'menu/dessert/idcbcnnxqund0spuxvsb', 0),
(49, 'Cải muối', 20000.00, 'Là món truyền thống quen thuộc, được muối từ cải bẹ xanh chọn kỹ, phơi héo nhẹ rồi ngâm với nước muối, tỏi và ớt. Sau vài ngày lên men tự nhiên, dưa cải đạt độ chua vừa, giòn, thơm nhẹ, dùng ăn với cơm trắng, thịt kho hay cá rán đều hợp vị.', 'side_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1761237934/menu/side_dish/mkgtb709elp9zlakcma4.webp', 'menu/side_dish/mkgtb709elp9zlakcma4', 0),
(50, 'Dư chuột góp', 20000.00, 'Món ăn thanh mát, giòn rụm, kết hợp giữa dưa chuột tươi, cà rốt, hành tím và ớt. Tất cả được trộn trong hỗn hợp giấm, đường, muối pha vừa miệng, tạo vị chua ngọt hài hòa. Thích hợp dùng kèm các món chiên, nướng giúp cân bằng vị béo.', 'side_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1761238012/menu/side_dish/ykld8kpgbzju7lu6qqcr.jpg', 'menu/side_dish/ykld8kpgbzju7lu6qqcr', 0),
(51, 'Caà muối', 20000.00, 'Món dân dã đặc trưng của Việt Nam, làm từ cà pháo non, ngâm muối cho đến khi giòn và có vị mặn nhẹ pha chua thanh. Cà muối giòn tan, trắng đẹp, thường ăn kèm canh cua, thịt kho hoặc cá kho, mang hương vị truyền thống khó quên.', 'side_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1761238076/menu/side_dish/xpdbyjcuj4vhwx2kx7ap.jpg', 'menu/side_dish/xpdbyjcuj4vhwx2kx7ap', 0),
(52, 'Kim chi', 20000.00, 'Món muối lên men nổi tiếng xứ Hàn, được làm từ cải thảo, củ cải, hành lá, ớt bột Hàn Quốc, tỏi và gừng. Hương vị cay nồng, chua dịu, đậm đà kích thích vị giác, giúp bữa ăn thêm phần hấp dẫn. Kim chi còn chứa nhiều lợi khuẩn tốt cho tiêu hóa.', 'side_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1761238139/menu/side_dish/dp8obzezgyvwsdmqtvoq.jpg', 'menu/side_dish/dp8obzezgyvwsdmqtvoq', 0),
(53, 'Củ cải muối', 20000.00, 'Món ăn dân dã, đậm đà hương vị truyền thống. Củ cải tươi được phơi se mặt cho ráo nước, sau đó ngâm trong nước muối, đường, tỏi và ớt cho đến khi lên men tự nhiên. Thành phẩm có màu vàng óng, vị chua mặn nhẹ, giòn sần sật và mùi thơm đặc trưng. Món củ cải muối thường được dùng kèm cơm trắng, thịt kho hoặc các món nướng, giúp giảm ngấy và kích thích vị giác rất hiệu quả.', 'side_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1761238202/menu/side_dish/gvthav5wi31jizqfzpnq.jpg', 'menu/side_dish/gvthav5wi31jizqfzpnq', 0);

-- --------------------------------------------------------

--
-- Table structure for table `order_item`
--

CREATE TABLE `order_item` (
  `order_item_id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `note` text DEFAULT NULL,
  `status` enum('serving','cancelled') NOT NULL DEFAULT 'serving',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_item`
--

INSERT INTO `order_item` (`order_item_id`, `reservation_id`, `menu_id`, `quantity`, `note`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 1, '', 'serving', '2025-10-06 20:43:19', '2025-10-06 20:43:19'),
(2, 1, 3, 1, '', 'serving', '2025-10-06 20:43:19', '2025-10-06 20:43:19'),
(3, 2, 8, 1, '', 'serving', '2025-10-07 22:22:29', '2025-10-07 22:22:29'),
(4, 2, 26, 1, '', 'serving', '2025-10-07 22:22:29', '2025-10-07 22:22:29'),
(5, 2, 9, 1, '', 'serving', '2025-10-07 22:22:29', '2025-10-07 22:22:29'),
(6, 2, 25, 1, '', 'serving', '2025-10-07 22:22:29', '2025-10-07 22:22:29'),
(7, 2, 18, 1, '', 'serving', '2025-10-07 22:22:29', '2025-10-07 22:22:29'),
(8, 2, 36, 1, '', 'serving', '2025-10-07 22:22:29', '2025-10-07 22:22:29'),
(9, 2, 35, 1, '', 'serving', '2025-10-07 22:22:29', '2025-10-07 22:22:29'),
(10, 4, 1, 1, '', 'cancelled', '2025-10-17 11:53:43', '2025-10-17 11:59:04'),
(11, 4, 3, 1, '', 'cancelled', '2025-10-17 11:53:43', '2025-10-17 11:59:05'),
(12, 4, 5, 1, '', 'cancelled', '2025-10-17 11:53:43', '2025-10-17 11:59:05'),
(13, 4, 24, 1, '', 'cancelled', '2025-10-17 11:53:43', '2025-10-17 11:59:06'),
(14, 4, 22, 1, '', 'cancelled', '2025-10-17 11:53:43', '2025-10-17 11:59:06'),
(15, 4, 36, 1, '', 'cancelled', '2025-10-17 11:53:43', '2025-10-17 11:59:07'),
(16, 4, 39, 1, '', 'cancelled', '2025-10-17 11:54:09', '2025-10-17 11:59:07'),
(17, 4, 38, 2, '', 'cancelled', '2025-10-17 11:54:09', '2025-10-17 11:59:08'),
(18, 4, 1, 1, '', 'cancelled', '2025-10-17 11:58:49', '2025-10-17 11:59:08'),
(19, 4, 3, 1, '', 'cancelled', '2025-10-17 11:58:49', '2025-10-17 11:59:08'),
(20, 4, 1, 1, '', 'serving', '2025-10-17 11:59:16', '2025-10-17 11:59:16'),
(21, 4, 3, 1, '', 'serving', '2025-10-17 11:59:16', '2025-10-17 11:59:16'),
(22, 4, 1, 1, '', 'serving', '2025-10-17 12:05:44', '2025-10-17 12:05:44'),
(23, 3, 1, 1, '', 'serving', '2025-10-17 12:21:50', '2025-10-17 12:21:50'),
(24, 3, 3, 1, '', 'serving', '2025-10-17 12:21:50', '2025-10-17 12:21:50'),
(25, 3, 1, 1, '', 'serving', '2025-10-17 12:23:59', '2025-10-17 12:23:59'),
(26, 3, 3, 1, '', 'serving', '2025-10-17 12:23:59', '2025-10-17 12:23:59'),
(27, 5, 1, 1, '', 'serving', '2025-10-17 12:39:19', '2025-10-17 12:39:19'),
(28, 5, 3, 1, '', 'serving', '2025-10-17 12:39:19', '2025-10-17 12:39:19'),
(29, 6, 10, 1, '', 'serving', '2025-10-17 12:47:53', '2025-10-17 12:47:53'),
(30, 6, 26, 1, '', 'serving', '2025-10-17 12:47:53', '2025-10-17 12:47:53'),
(31, 6, 8, 3, '', 'serving', '2025-10-17 12:47:53', '2025-10-17 12:47:53'),
(32, 6, 30, 1, '', 'serving', '2025-10-17 12:47:53', '2025-10-17 12:47:53'),
(33, 6, 39, 6, '', 'serving', '2025-10-17 12:47:53', '2025-10-17 12:47:53'),
(34, 9, 1, 2, '', 'serving', '2025-10-17 13:03:02', '2025-10-17 13:03:02'),
(35, 9, 31, 2, '', 'serving', '2025-10-17 13:03:02', '2025-10-17 13:03:02'),
(36, 9, 21, 2, '', 'serving', '2025-10-17 13:03:02', '2025-10-17 13:03:02'),
(37, 9, 32, 2, '', 'serving', '2025-10-17 13:03:02', '2025-10-17 13:03:02'),
(38, 9, 39, 2, '', 'serving', '2025-10-17 13:03:02', '2025-10-17 13:03:02'),
(39, 9, 38, 2, '', 'serving', '2025-10-17 13:03:02', '2025-10-17 13:03:02');

-- --------------------------------------------------------

--
-- Table structure for table `reservation`
--

CREATE TABLE `reservation` (
  `reservation_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `reservation_time` datetime NOT NULL,
  `checkin_time` datetime DEFAULT NULL,
  `checkout_time` datetime DEFAULT NULL,
  `num_people` int(11) NOT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `status` enum('pending','preparing','serving','completed','paid','cancelled') NOT NULL DEFAULT 'pending',
  `dwell_time` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservation`
--

INSERT INTO `reservation` (`reservation_id`, `customer_id`, `reservation_time`, `checkin_time`, `checkout_time`, `num_people`, `staff_id`, `status`, `dwell_time`, `createdAt`, `updatedAt`) VALUES
(1, 1, '2025-10-06 20:00:00', '2025-10-06 19:13:30', '2025-10-06 20:43:34', 2, 3, 'completed', NULL, '2025-10-06 19:12:21', '2025-10-06 20:43:34'),
(2, 2, '2025-10-07 21:00:00', NULL, '2025-10-07 22:24:05', 2, 3, 'completed', NULL, '2025-10-06 20:42:24', '2025-10-07 22:24:05'),
(3, 3, '2025-10-17 20:00:00', '2025-10-17 12:21:37', '2025-10-17 12:24:16', 2, 3, 'completed', NULL, '2025-10-17 11:43:37', '2025-10-17 12:24:16'),
(4, 3, '2025-10-17 20:00:00', NULL, '2025-10-17 12:20:52', 2, 3, 'completed', NULL, '2025-10-17 11:48:59', '2025-10-17 12:20:52'),
(5, 4, '2025-10-17 19:00:00', '2025-10-17 12:39:05', '2025-10-17 12:39:24', 2, 3, 'completed', NULL, '2025-10-17 12:38:03', '2025-10-17 12:39:24'),
(6, 5, '2025-10-21 18:00:00', '2025-10-17 12:47:20', '2025-10-17 12:48:03', 7, 3, 'completed', NULL, '2025-10-17 12:46:24', '2025-10-17 12:48:03'),
(7, 5, '2025-10-21 18:00:00', NULL, NULL, 7, NULL, 'cancelled', NULL, '2025-10-17 12:55:23', '2025-10-17 13:00:08'),
(8, 6, '2025-10-19 12:30:00', NULL, NULL, 4, NULL, 'cancelled', NULL, '2025-10-17 13:01:02', '2025-10-17 13:01:21'),
(9, 7, '2025-10-19 11:00:00', NULL, '2025-10-17 13:03:12', 5, 3, 'completed', NULL, '2025-10-17 13:02:05', '2025-10-17 13:03:12');

-- --------------------------------------------------------

--
-- Table structure for table `reservation_detail`
--

CREATE TABLE `reservation_detail` (
  `reservation_detail_id` int(11) NOT NULL,
  `table_id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservation_detail`
--

INSERT INTO `reservation_detail` (`reservation_detail_id`, `table_id`, `reservation_id`, `createdAt`, `updatedAt`) VALUES
(1, 5, 1, '2025-10-06 19:13:04', '2025-10-06 19:13:04'),
(2, 5, 2, '2025-10-07 22:20:26', '2025-10-07 22:20:26'),
(3, 1, 3, '2025-10-17 11:52:51', '2025-10-17 11:52:51'),
(4, 5, 4, '2025-10-17 11:53:07', '2025-10-17 11:53:07'),
(5, 7, 5, '2025-10-17 12:38:54', '2025-10-17 12:38:54'),
(6, 12, 6, '2025-10-17 12:47:00', '2025-10-17 12:47:00'),
(7, 16, 9, '2025-10-17 13:02:22', '2025-10-17 13:02:22');

-- --------------------------------------------------------

--
-- Table structure for table `table`
--

CREATE TABLE `table` (
  `table_id` int(11) NOT NULL,
  `capacity` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `table`
--

INSERT INTO `table` (`table_id`, `capacity`, `createdAt`, `updatedAt`) VALUES
(1, 2, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(2, 4, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(3, 2, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(4, 4, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(5, 2, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(6, 4, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(7, 2, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(8, 4, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(9, 2, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(10, 4, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(11, 2, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(12, 4, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(13, 2, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(14, 4, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(15, 2, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(16, 4, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(17, 2, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(18, 4, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(19, 2, '2025-10-06 12:52:57', '2025-10-06 12:52:57'),
(20, 4, '2025-10-06 12:52:57', '2025-10-06 12:52:57');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phoneNumber` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profilePhoto` varchar(255) DEFAULT NULL,
  `profilePhotoPublicId` varchar(255) DEFAULT NULL,
  `role` enum('manager','staff') DEFAULT NULL,
  `lastActive` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT 0,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `dateAdded` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `name`, `phoneNumber`, `email`, `address`, `password`, `profilePhoto`, `profilePhotoPublicId`, `role`, `lastActive`, `deleted`, `status`, `dateAdded`, `updatedAt`) VALUES
(1, 'Lê Văn Long', '0333054438', 'long2k4fahu@gmail.com', 'HN', '$2b$10$ikDEszAEJuGlfjKKVbrDR.20lO.kPwAmbbJQWlK3UyfvVnRMJAbm6', NULL, NULL, 'manager', '2025-10-06 12:55:08', 1, 'approved', '2025-10-06 12:54:18', '2025-10-17 12:24:56'),
(2, 'Đàm Trung Quân', '1234567890', 'quan123@gmail.com', 'HN', '$2b$10$FptQg6ucCqQBKJOyi.75ZeNlTGZ/lHWWDiDBjS9TeVYC9kkC1V8mO', NULL, NULL, 'manager', '2025-10-23 23:35:58', 0, 'approved', '2025-10-06 12:55:12', '2025-10-23 23:35:58'),
(3, 'an', '123456', 'andan@gmail.com', 'mo than', '$2b$10$6qO.m7l3t9.CiYF33JBIW.JvWmEpI7FFoyAVvbjztaeyBHijeIHr.', NULL, NULL, 'staff', '2025-10-22 12:44:18', 0, 'approved', '2025-10-06 19:10:34', '2025-10-22 12:44:18'),
(4, 'Long', '0333054438', 'long123@gmail.com', 'HN', '$2b$10$PRdF6E3/HDGFnOZp.UQJcejG.U84y7OijCYummhbDgdzzohKHM8V2', 'https://res.cloudinary.com/drem0ihib/image/upload/v1760678801/users/nk57hnomhn7wfwrdvidv.jpg', 'users/nk57hnomhn7wfwrdvidv', 'staff', '2025-10-17 13:03:36', 0, 'approved', '2025-10-17 12:25:09', '2025-10-17 13:03:36');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bill`
--
ALTER TABLE `bill`
  ADD PRIMARY KEY (`bill_id`),
  ADD KEY `reservation_id` (`reservation_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`customer_id`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`menu_id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `order_item`
--
ALTER TABLE `order_item`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `reservation_id` (`reservation_id`),
  ADD KEY `menu_id` (`menu_id`);

--
-- Indexes for table `reservation`
--
ALTER TABLE `reservation`
  ADD PRIMARY KEY (`reservation_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `reservation_detail`
--
ALTER TABLE `reservation_detail`
  ADD PRIMARY KEY (`reservation_detail_id`),
  ADD KEY `table_id` (`table_id`),
  ADD KEY `reservation_id` (`reservation_id`);

--
-- Indexes for table `table`
--
ALTER TABLE `table`
  ADD PRIMARY KEY (`table_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bill`
--
ALTER TABLE `bill`
  MODIFY `bill_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `menu_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `order_item`
--
ALTER TABLE `order_item`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `reservation`
--
ALTER TABLE `reservation`
  MODIFY `reservation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `reservation_detail`
--
ALTER TABLE `reservation_detail`
  MODIFY `reservation_detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `table`
--
ALTER TABLE `table`
  MODIFY `table_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bill`
--
ALTER TABLE `bill`
  ADD CONSTRAINT `bill_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservation` (`reservation_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bill_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `order_item`
--
ALTER TABLE `order_item`
  ADD CONSTRAINT `order_item_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservation` (`reservation_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_item_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`menu_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `reservation`
--
ALTER TABLE `reservation`
  ADD CONSTRAINT `reservation_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reservation_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `reservation_detail`
--
ALTER TABLE `reservation_detail`
  ADD CONSTRAINT `reservation_detail_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `table` (`table_id`),
  ADD CONSTRAINT `reservation_detail_ibfk_2` FOREIGN KEY (`reservation_id`) REFERENCES `reservation` (`reservation_id`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
