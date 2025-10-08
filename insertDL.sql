-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 07, 2025 at 08:37 PM
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

DROP TABLE IF EXISTS `bill`;
CREATE TABLE `bill` (
  `id` int(11) NOT NULL,
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

INSERT INTO `bill` (`id`, `reservation_id`, `staff_id`, `payment_method`, `total_amount`, `time`, `createdAt`, `updatedAt`) VALUES
(1, 1, 3, 'cash', 220000, '2025-10-06 20:43:34', '2025-10-06 20:43:34', '2025-10-06 20:43:34'),
(2, 2, 3, 'cash', 760000, '2025-10-07 22:24:05', '2025-10-07 22:24:05', '2025-10-07 22:24:05');

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
CREATE TABLE `customer` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phoneNumber` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`id`, `name`, `phoneNumber`, `createdAt`, `updatedAt`) VALUES
(1, 'abc', '1111111111', '2025-10-06 19:12:21', '2025-10-06 19:12:21'),
(2, 'ânnana', '1212121212', '2025-10-06 20:42:24', '2025-10-06 20:42:24');

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu` (
  `id` int(11) NOT NULL,
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

INSERT INTO `menu` (`id`, `name`, `price`, `description`, `category`, `image`, `imagePublicId`, `deleted`) VALUES
(1, 'Gỏi tôm cuốn thịt', 115000.00, 'Món cuốn thanh mát gồm tôm sú, thịt luộc, bún tươi và rau thơm, được gói trong bánh tráng mỏng dẻo. Ăn kèm nước chấm đậu phộng đặc trưng, mang đến hương vị nhẹ nhàng và tinh tế.', 'appetizer', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759754435/menu/appetizer/m6blq1tbnj9nk2wceew7.jpg', 'menu/appetizer/m6blq1tbnj9nk2wceew7', 0),
(2, 'Nộm tai heo hoa chuối', 30000.00, 'Món gỏi giòn sần sật với tai heo thái mỏng, hoa chuối bào và rau thơm, trộn cùng nước mắm chua cay, rắc đậu phộng rang thơm. Hài hòa giữa vị béo, chua và giòn mát.', 'appetizer', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759754646/menu/appetizer/ayjy7tj6vbplgomtnz2e.jpg', 'menu/appetizer/ayjy7tj6vbplgomtnz2e', 0),
(3, 'Nộm rau má', 105000.00, 'Rau má tươi trộn cùng hành tím, cà rốt và đậu phộng rang, tạo nên món gỏi thanh mát, giải nhiệt, rất thích hợp mở đầu bữa ăn.', 'appetizer', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759754844/menu/appetizer/mlrypjbgwm6s0ajyw182.webp', 'menu/appetizer/mlrypjbgwm6s0ajyw182', 0),
(4, 'Nộm tôm bưởi', 105000.00, 'hịt tôm tươi giòn hòa quyện cùng tép bưởi mọng nước, rau thơm và nước trộn chua ngọt đặc trưng. Món gỏi thanh mát, vị chua ngọt tự nhiên, kích thích vị giác.', 'appetizer', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759755039/menu/appetizer/igfa1f8hhf72lelc0jkz.jpg', 'menu/appetizer/igfa1f8hhf72lelc0jkz', 0),
(5, 'Nộm rau muống thịt bò', 105000.00, 'au muống chẻ trụng sơ giữ độ giòn, trộn cùng thịt bò xào mềm, hành phi và nước mắm tỏi ớt. Món ăn đậm đà nhưng vẫn thanh nhẹ.', 'appetizer', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759755211/menu/appetizer/psmcmnilo8kzrdnmfjua.jpg', 'menu/appetizer/psmcmnilo8kzrdnmfjua', 0),
(6, 'Đậu tắm hành', 45000.00, 'Món đậu hũ chiên vàng, rưới hành phi và mỡ hành thơm phức, ăn cùng nước mắm chua ngọt. Món ăn dân dã nhưng đậm đà hương vị quê nhà.', 'side_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759759463/menu/side_dish/upk6hokvmen7lpk3it9t.jpg', 'menu/side_dish/upk6hokvmen7lpk3it9t', 0),
(7, 'Trứng đúc thịt', 85000.00, 'Món trứng hấp cùng thịt băm, hành lá và gia vị truyền thống, tạo nên hương vị mềm mịn, béo ngậy và đậm đà.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759759640/menu/main_dish/tstgr9xospnx5uy9ewvc.png', 'menu/main_dish/tstgr9xospnx5uy9ewvc', 0),
(8, 'Chả lá lốt', 100000.00, 'Thịt băm được ướp thơm, gói trong lá lốt rồi nướng trên than hồng, tỏa mùi thơm đặc trưng. Ăn kèm bún, rau sống và nước chấm.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759759719/menu/main_dish/qfbuuirudzm05v4nioew.jpg', 'menu/main_dish/qfbuuirudzm05v4nioew', 0),
(9, 'Rau củ luộc chấm kho quẹt', 100000.00, 'Đĩa rau củ luộc tươi xanh (đậu bắp, cà rốt, bắp cải…) ăn kèm kho quẹt mặn ngọt, cay nhẹ, béo bùi từ tôm khô và tóp mỡ.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759759775/menu/main_dish/jrliajbovks83ziri2z0.jpg', 'menu/main_dish/jrliajbovks83ziri2z0', 0),
(10, 'Rau muống xào tóp mỡ', 85000.00, 'Rau muống giòn xanh xào nhanh trên lửa lớn với tóp mỡ vàng giòn, mang vị béo thơm và đậm đà dân dã.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759759885/menu/main_dish/vpijofsvvva6sbtyei0y.webp', 'menu/main_dish/vpijofsvvva6sbtyei0y', 0),
(11, 'Súp lơ xào tỏi', 75000.00, 'Hoa súp lơ tươi giòn, xào thơm cùng tỏi băm, giữ nguyên màu xanh và độ giòn tự nhiên. Món ăn thanh vị, tốt cho sức khỏe.', 'side_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759759987/menu/side_dish/itexightilnwg0oocdci.jpg', 'menu/side_dish/itexightilnwg0oocdci', 0),
(12, 'Đậu nhồi thịt sốt cà chua', 95000.00, 'Đậu hũ được khoét ruột, nhồi thịt băm ướp gia vị, chiên vàng rồi nấu cùng nước sốt cà chua chua ngọt hấp dẫn.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759760161/menu/main_dish/jiex7huxdlpqbstk2uyg.jpg', 'menu/main_dish/jiex7huxdlpqbstk2uyg', 0),
(13, 'Thịt rang cháy cạnh', 100000.00, 'Thịt ba chỉ thái lát, rim vàng cạnh, đậm vị mặn ngọt, ăn cùng cơm trắng rất đưa cơm.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759760292/menu/main_dish/wwgwyfvpplopopsmezr1.webp', 'menu/main_dish/wwgwyfvpplopopsmezr1', 0),
(14, 'Thịt kho trứng cút', 115000.00, 'Thịt ba chỉ kho mềm cùng trứng cút trong nước dừa, hương vị béo ngậy, ngọt nhẹ.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759760358/menu/main_dish/xmyde70mfmsgxew5rj6d.jpg', 'menu/main_dish/xmyde70mfmsgxew5rj6d', 0),
(15, 'Thịt quay', 145000.00, 'Thịt ba rọi quay giòn da, lớp mỡ thơm béo, thịt mềm ngọt tự nhiên.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759760417/menu/main_dish/bmvlqagpeub8xqqpqazj.webp', 'menu/main_dish/bmvlqagpeub8xqqpqazj', 0),
(16, 'Thịt kho dừa non', 115000.00, 'Thịt kho mềm, thấm vị nước dừa non, tạo hương thơm ngọt tự nhiên, béo nhẹ và đậm đà.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759760804/menu/main_dish/w7zqfn6dqr7nrta1zb25.jpg', 'menu/main_dish/w7zqfn6dqr7nrta1zb25', 0),
(17, 'Sườn xào chua ngọt', 115000.00, 'Sườn non chiên vàng, áo đều lớp sốt chua ngọt sánh quyện, kích thích vị giác.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759760910/menu/main_dish/nbix5wfbh0w9gx2e0vby.webp', 'menu/main_dish/nbix5wfbh0w9gx2e0vby', 0),
(18, 'Thịt băm rang', 95000.00, 'Thịt heo băm xào săn, thấm vị nước mắm, hành tỏi, ớt, rất bắt cơm.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759761030/menu/main_dish/yqsvj7qoxpkovyiw9e9m.jpg', 'menu/main_dish/yqsvj7qoxpkovyiw9e9m', 0),
(19, 'Thịt chưng mắm tép', 95000.00, 'Thịt băm trộn mắm tép, hấp chín tạo hương vị đậm đà đặc trưng của miền Bắc.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759761099/menu/main_dish/jfutnwfwuncimeo0iedw.webp', 'menu/main_dish/jfutnwfwuncimeo0iedw', 0),
(20, 'Rau muống luộc', 55000.00, 'Rau muống tươi luộc chín vừa, giữ màu xanh và độ giòn, chấm cùng nước mắm tỏi ớt hoặc trứng luộc.', 'side_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759844030/menu/side_dish/yv7ec0fu9f0xzfkqb1tz.jpg', 'menu/side_dish/yv7ec0fu9f0xzfkqb1tz', 0),
(21, 'Bắp cải xào', 65000.00, 'Bắp cải xào nhanh tay trên lửa lớn với tỏi và gia vị, giữ vị ngọt và độ giòn.', 'side_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759844272/menu/side_dish/y1uofvd1zy6r4nutyeda.jpg', 'menu/side_dish/y1uofvd1zy6r4nutyeda', 0),
(22, 'Cải ngồng luộc (chấm trứng)', 65000.00, 'Cải ngồng luộc tươi xanh, chấm với lòng đỏ trứng muối hoặc trứng luộc nghiền mịn.', 'side_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759844345/menu/side_dish/reip3dd8tcepwuotkceu.jpg', 'menu/side_dish/reip3dd8tcepwuotkceu', 0),
(23, 'Cải chíp xào nấm', 65000.00, 'Cải chíp non xào cùng nấm hương, giữ độ giòn và vị ngọt tự nhiên.', 'side_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759844401/menu/side_dish/eptylvp4u2fghwjxu22k.jpg', 'menu/side_dish/eptylvp4u2fghwjxu22k', 0),
(24, 'Ngọn su xào tỏi', 75000.00, 'Ngọn su non xào thơm cùng tỏi, giữ nguyên độ giòn và vị thanh mát.', 'side_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759844520/menu/side_dish/fvatvd05ocoknqgbvqns.jpg', 'menu/side_dish/fvatvd05ocoknqgbvqns', 0),
(25, 'Súp lơ xào bò', 155000.00, 'Bò mềm xào nhanh tay với súp lơ xanh giòn ngọt, thấm vị tỏi và dầu hào, thơm nhẹ và thanh mát.', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759844706/menu/main_dish/curvqvo6vgaos9ffa26d.webp', 'menu/main_dish/curvqvo6vgaos9ffa26d', 0),
(26, 'Gà xào gừng', 235000.00, 'Thịt gà ta xào cùng gừng tươi, vị cay nhẹ và thơm nồng, kích thích vị giác và ấm bụng', 'main_dish', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759845187/menu/main_dish/e7dt1vmane72lc7hz8j0.avif', 'menu/main_dish/e7dt1vmane72lc7hz8j0', 0),
(27, 'Bún cá Châu Đốc', 80000.00, 'Hương vị đậm đà, tươi ngọt và cay nhẹ của bún cá Châu Đốc khiến thực khách như đang thưởng thức trọn vẹn tinh túy miền Tây trong một bát bún nóng hổi.', 'regional_specialty', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759845710/menu/regional_specialty/czo27ecvc7b9ogxruqnv.jpg', 'menu/regional_specialty/czo27ecvc7b9ogxruqnv', 0),
(28, 'Gỏi gà măng cụt', 95000.00, 'Gỏi gà măng cụt không chỉ là món ăn giải nhiệt ngày hè mà còn là đặc sản trứ danh của miệt vườn Lái Thiêu (Bình Dương), nơi trái cây và ẩm thực giao hòa tinh tế.', 'regional_specialty', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759845816/menu/regional_specialty/hzjrdjkzsyuzg1biorju.jpg', 'menu/regional_specialty/hzjrdjkzsyuzg1biorju', 0),
(29, 'Vịt quay 7 vị', 25000.00, 'Vịt quay 7 vị không chỉ là món ngon hấp dẫn mà còn là biểu tượng của sự cầu kỳ và tinh tế trong ẩm thực Việt – Hoa, thường xuất hiện trong các bữa tiệc sang trọng và dịp lễ đặc biệt.', 'regional_specialty', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846043/menu/regional_specialty/xaccnpdedojswb6it834.webp', 'menu/regional_specialty/xaccnpdedojswb6it834', 0),
(30, 'Cá kho làng Vũ Đại', 15000.00, 'Cá kho làng Vũ Đại không chỉ là món ăn mà còn là niềm tự hào văn hóa, minh chứng cho sự tỉ mỉ và khéo léo của người dân Bắc Bộ qua từng niêu cá được kho bằng cả tâm hồn.', 'regional_specialty', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846108/menu/regional_specialty/z5kpj1rvlrdv4fdj8rms.webp', 'menu/regional_specialty/z5kpj1rvlrdv4fdj8rms', 0),
(31, 'Canh cua mồng tơi', 95000.00, 'Canh cua đồng nấu cùng mồng tơi và mướp hương, vị ngọt thanh tự nhiên, đậm đà hương quê Bắc Bộ.', 'dessert', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846421/menu/dessert/hz8sl0eswvvpsp51pjp6.jpg', 'menu/dessert/hz8sl0eswvvpsp51pjp6', 0),
(32, 'Canh ngao hến nấu chua', 95000.00, 'Ngao và hến tươi nấu với cà chua, dứa và me chua, tạo vị thanh dịu, thơm mát và rất bắt cơm.', 'dessert', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846528/menu/dessert/hjxmud5gqp9mbfixrsio.jpg', 'menu/dessert/hjxmud5gqp9mbfixrsio', 0),
(33, 'Canh tôm bầu', 105000.00, 'Tôm tươi bóc vỏ nấu cùng bầu non, nước dùng ngọt nhẹ, thanh mát, thích hợp cho bữa cơm gia đình.', 'dessert', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846587/menu/dessert/lp4tgp2vfgcd74unwuvh.webp', 'menu/dessert/lp4tgp2vfgcd74unwuvh', 0),
(34, 'Canh rau ngót thịt băm', 85000.00, 'Rau ngót tươi nấu cùng thịt băm, nước dùng ngọt tự nhiên, thơm mùi lá rau, món canh truyền thống của mọi gia đình Việt.', 'dessert', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846807/menu/dessert/fuhmpqytdvwj6f0jecyb.jpg', 'menu/dessert/fuhmpqytdvwj6f0jecyb', 0),
(35, 'Nước chanh tươi', 30000.00, 'Giải khát nhanh chóng với vị chua thanh mát, giúp cơ thể sảng khoái, tỉnh táo.', 'beverage', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846864/menu/beverage/qrwlmgjg1nras4aovyux.webp', 'menu/beverage/qrwlmgjg1nras4aovyux', 0),
(36, 'Nước cam ép', 45000.00, 'Cam tươi nguyên chất, ép lạnh giữ trọn vitamin C và hương vị tự nhiên, tốt cho sức khỏe.Cam tươi nguyên chất, ép lạnh giữ trọn vitamin C và hương vị tự nhiên, tốt cho sức khỏe.', 'beverage', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846906/menu/beverage/qpyuxaiqax9vdg9lpzrj.jpg', 'menu/beverage/qpyuxaiqax9vdg9lpzrj', 0),
(37, 'Nước khoáng Lavie', 15000.00, 'Nước khoáng thiên nhiên tinh khiết, bổ sung khoáng chất thiết yếu cho cơ thể.', 'beverage', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759846966/menu/beverage/ne7ampca4fqwkn44xwx1.webp', 'menu/beverage/ne7ampca4fqwkn44xwx1', 0),
(38, 'Coca-Cola', 25000.00, 'Thức uống có gas sảng khoái, mang hương vị truyền thống, phù hợp mọi bữa ăn.', 'beverage', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759847009/menu/beverage/gmnavpntubr0syn6pq0i.webp', 'menu/beverage/gmnavpntubr0syn6pq0i', 0),
(39, 'Bia Sài Gòn', 35000.00, 'Vị bia đậm đà, đặc trưng của thương hiệu Việt, kết hợp hoàn hảo cùng các món nướng hoặc hải sản.', 'beverage', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759847060/menu/beverage/olt8cmbd7jjsadaxitzk.jpg', 'menu/beverage/olt8cmbd7jjsadaxitzk', 0),
(40, 'Gỏi ngó sen chay', 120000.00, 'Ngó sen tươi trộn cùng cà rốt, dưa leo và đậu phộng rang giòn, thấm vị chua ngọt thanh nhẹ – món khai vị thanh mát, kích thích vị giác.', 'vegetarian', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759847161/menu/vegetarian/de6f1ewk2pkpi5xwgahn.jpg', 'menu/vegetarian/de6f1ewk2pkpi5xwgahn', 0),
(41, 'Cơm chiên ngũ sắc chay', 15000.00, 'Cơm được chiên cùng đậu hũ, nấm hương, cà rốt, đậu que và bắp non, mang màu sắc bắt mắt, hương vị đậm đà mà không cần thịt.', 'vegetarian', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759847220/menu/vegetarian/dyj4ofjtjfbc9df4pnfd.jpg', 'menu/vegetarian/dyj4ofjtjfbc9df4pnfd', 0),
(42, 'Bún Huế chay', 175000.00, 'Nước dùng từ rau củ và sả ớt tạo vị cay nồng đặc trưng, ăn cùng chả chay, nấm và đậu hũ – món chay mang đậm hồn ẩm thực miền Trung.', 'vegetarian', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759847276/menu/vegetarian/ogjgr4lgxep13s5s3x63.jpg', 'menu/vegetarian/ogjgr4lgxep13s5s3x63', 0),
(43, 'Chả giò chay', 10000.00, 'Cuốn giòn rụm với nhân gồm miến, mộc nhĩ, cà rốt và củ sắn; chiên vàng thơm lừng – thích hợp làm món khai vị hoặc ăn kèm bún.', 'vegetarian', 'https://res.cloudinary.com/drem0ihib/image/upload/v1759847315/menu/vegetarian/jsv5e0urhqmyzfztu0wx.jpg', 'menu/vegetarian/jsv5e0urhqmyzfztu0wx', 0);

-- --------------------------------------------------------

--
-- Table structure for table `order_item`
--

DROP TABLE IF EXISTS `order_item`;
CREATE TABLE `order_item` (
  `id` int(11) NOT NULL,
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

INSERT INTO `order_item` (`id`, `reservation_id`, `menu_id`, `quantity`, `note`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 1, '', 'serving', '2025-10-06 20:43:19', '2025-10-06 20:43:19'),
(2, 1, 3, 1, '', 'serving', '2025-10-06 20:43:19', '2025-10-06 20:43:19'),
(3, 2, 8, 1, '', 'serving', '2025-10-07 22:22:29', '2025-10-07 22:22:29'),
(4, 2, 26, 1, '', 'serving', '2025-10-07 22:22:29', '2025-10-07 22:22:29'),
(5, 2, 9, 1, '', 'serving', '2025-10-07 22:22:29', '2025-10-07 22:22:29'),
(6, 2, 25, 1, '', 'serving', '2025-10-07 22:22:29', '2025-10-07 22:22:29'),
(7, 2, 18, 1, '', 'serving', '2025-10-07 22:22:29', '2025-10-07 22:22:29'),
(8, 2, 36, 1, '', 'serving', '2025-10-07 22:22:29', '2025-10-07 22:22:29'),
(9, 2, 35, 1, '', 'serving', '2025-10-07 22:22:29', '2025-10-07 22:22:29');

-- --------------------------------------------------------

--
-- Table structure for table `reservation`
--

DROP TABLE IF EXISTS `reservation`;
CREATE TABLE `reservation` (
  `id` int(11) NOT NULL,
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

INSERT INTO `reservation` (`id`, `customer_id`, `reservation_time`, `checkin_time`, `checkout_time`, `num_people`, `staff_id`, `status`, `dwell_time`, `createdAt`, `updatedAt`) VALUES
(1, 1, '2025-10-06 20:00:00', '2025-10-06 19:13:30', '2025-10-06 20:43:34', 2, 3, 'completed', NULL, '2025-10-06 19:12:21', '2025-10-06 20:43:34'),
(2, 2, '2025-10-07 21:00:00', NULL, '2025-10-07 22:24:05', 2, 3, 'completed', NULL, '2025-10-06 20:42:24', '2025-10-07 22:24:05');

-- --------------------------------------------------------

--
-- Table structure for table `reservation_detail`
--

DROP TABLE IF EXISTS `reservation_detail`;
CREATE TABLE `reservation_detail` (
  `id` int(11) NOT NULL,
  `table_id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservation_detail`
--

INSERT INTO `reservation_detail` (`id`, `table_id`, `reservation_id`, `createdAt`, `updatedAt`) VALUES
(1, 5, 1, '2025-10-06 19:13:04', '2025-10-06 19:13:04'),
(2, 5, 2, '2025-10-07 22:20:26', '2025-10-07 22:20:26');

-- --------------------------------------------------------

--
-- Table structure for table `table`
--

DROP TABLE IF EXISTS `table`;
CREATE TABLE `table` (
  `id` int(11) NOT NULL,
  `capacity` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `table`
--

INSERT INTO `table` (`id`, `capacity`, `createdAt`, `updatedAt`) VALUES
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

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL,
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

INSERT INTO `user` (`id`, `name`, `phoneNumber`, `email`, `address`, `password`, `profilePhoto`, `profilePhotoPublicId`, `role`, `lastActive`, `deleted`, `status`, `dateAdded`, `updatedAt`) VALUES
(1, 'Lê Văn Long', '0333054438', 'long2k4fahu@gmail.com', 'HN', '$2b$10$ikDEszAEJuGlfjKKVbrDR.20lO.kPwAmbbJQWlK3UyfvVnRMJAbm6', NULL, NULL, 'manager', '2025-10-06 12:55:08', 0, 'approved', '2025-10-06 12:54:18', '2025-10-06 12:55:08'),
(2, 'Đàm Trung Quân', '1234567890', 'quan123@gmail.com', 'HN', '$2b$10$FptQg6ucCqQBKJOyi.75ZeNlTGZ/lHWWDiDBjS9TeVYC9kkC1V8mO', NULL, NULL, 'manager', '2025-10-07 22:32:26', 0, 'approved', '2025-10-06 12:55:12', '2025-10-07 22:32:26'),
(3, 'an', '123456', 'andan@gmail.com', 'mo than', '$2b$10$6qO.m7l3t9.CiYF33JBIW.JvWmEpI7FFoyAVvbjztaeyBHijeIHr.', NULL, NULL, 'staff', '2025-10-07 22:33:03', 0, 'approved', '2025-10-06 19:10:34', '2025-10-07 22:33:03');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bill`
--
ALTER TABLE `bill`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservation_id` (`reservation_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `order_item`
--
ALTER TABLE `order_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservation_id` (`reservation_id`),
  ADD KEY `menu_id` (`menu_id`);

--
-- Indexes for table `reservation`
--
ALTER TABLE `reservation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `reservation_detail`
--
ALTER TABLE `reservation_detail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `table_id` (`table_id`),
  ADD KEY `reservation_id` (`reservation_id`);

--
-- Indexes for table `table`
--
ALTER TABLE `table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bill`
--
ALTER TABLE `bill`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `order_item`
--
ALTER TABLE `order_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `reservation`
--
ALTER TABLE `reservation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `reservation_detail`
--
ALTER TABLE `reservation_detail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `table`
--
ALTER TABLE `table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bill`
--
ALTER TABLE `bill`
  ADD CONSTRAINT `bill_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bill_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `order_item`
--
ALTER TABLE `order_item`
  ADD CONSTRAINT `order_item_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_item_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `reservation`
--
ALTER TABLE `reservation`
  ADD CONSTRAINT `reservation_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reservation_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `reservation_detail`
--
ALTER TABLE `reservation_detail`
  ADD CONSTRAINT `reservation_detail_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `table` (`id`),
  ADD CONSTRAINT `reservation_detail_ibfk_2` FOREIGN KEY (`reservation_id`) REFERENCES `reservation` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
