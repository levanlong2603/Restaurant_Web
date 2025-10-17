const { Reservation, OrderItem, Menu } = require('../models');


// API Thêm món ăn
exports.addOrderItem = async (req, res) => {
    try {
        const { reservation_id, items } = req.body;

        if (!reservation_id || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Thiếu thông tin đặt món!" });
        }

        const reservation = await Reservation.findByPk(reservation_id);
        if (!reservation) {
            return res.status(404).json({ message: "Không tìm thấy đặt bàn!" });
        }
        if (reservation.status !== "serving") {
            return res.status(400).json({ message: "Trạng thái đặt bàn không hợp lệ!" });
        }

        let orderItems = [];
        
        for (const item of items){
            const {menu_id, quantity, note} = item;
            
            if(!menu_id || !quantity) {
                return res.status(400).json({ message: "Thiếu thông tin món ăn!" });
            }
            
            const menu = await Menu.findByPk(menu_id);
            if (!menu) {
                return res.status(404).json({ message: "Không tìm thấy món ăn!" });
            }

            const newOrderItem = await OrderItem.create({
                reservation_id,
                menu_id,
                quantity,
                note: note || "",
                status: "serving" 
            });

            orderItems.push(newOrderItem);
        }

        const menu = await Menu.findAll();

        res.status(201).json({
            message: "Món ăn đã được thêm vào danh sách gọi món!",
            order: orderItems.map(item => ({
                order_item_id: item.order_item_id,
                reservation_id: item.reservation_id,
                menu_id: item.menu_id,
                menu: menu.find(m => m.menu_id === item.menu_id),
                quantity: item.quantity,
                note: item.note,
                status: item.status,
            }))
        });
    } catch (error) {
        console.error("Lỗi khi thêm món ăn:", error.message);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// API Cập nhật món ăn
exports.updateOrderItem = async (req, res) => {
    try {
        const { order_item_id } = req.params; // Lấy ID từ URL
        const { quantity, note } = req.body; 

        if (!order_item_id) {
            return res.status(400).json({ message: "Thiếu ID đặt món!" });
        }
        const orderItem = await OrderItem.findByPk(order_item_id);
        if (!orderItem) {
            return res.status(404).json({ message: "Không tìm thấy món đã đặt này!" });
        }

        if (orderItem.status == "cancelled") {
            return res.status(400).json({ message: "Món ăn này đã được hủy trước đó" });
        }

        if (quantity !== undefined) orderItem.quantity = quantity;
        if (note !== undefined) orderItem.note = note || "";

        await orderItem.save();

        res.status(200).json({
            message: "Cập nhật món ăn thành công!",
            order: orderItem
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật món ăn:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// API Xóa món ăn
exports.deleteOrderItem = async (req, res) => {
    try {
        const { order_item_id } = req.params; // Lấy ID từ URL

        if (!order_item_id) {
            return res.status(400).json({ message: "Thiếu ID đặt món!" });
        }

        const orderItem = await OrderItem.findByPk(order_item_id);
        if (!orderItem) {
            return res.status(404).json({ message: "Không tìm thấy đặt món này!" });
        }

        if (orderItem.status !== "serving") {
            return res.status(400).json({ message: "Món ăn này đã được hủy trước đó" });
        }

        await orderItem.update({
            status: 'cancelled' 
        })

        res.status(200).json({
            message: "Xóa món ăn thành công!"
        });
    } catch (error) {
        console.error("Lỗi khi xóa món ăn:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};


exports.getOrderItems = async (req, res) => {
    try {
        const reservation_id = req.params.reservation_id || req.params.id; // Lấy reservation_id từ URL

        if (!reservation_id) {
            return res.status(400).json({ message: "Thiếu reservation_id!" });
        }

        const menu = await Menu.findAll();

        // Tìm tất cả OrderItem thuộc reservation_id
        const orderItems = await OrderItem.findAll({
            where: {
              reservation_id: reservation_id,
              status: "serving",
            },
        });

        const mappedOrderItems = orderItems.map(item => ({
            order_item_id: item.order_item_id,
            reservation_id: item.reservation_id,
            menu_id: item.menu_id,
            menu: menu.find(m => m.menu_id === item.menu_id),
            quantity: item.quantity,
            note: item.note,
            status: item.status,
        }));

        res.status(200).json({
            message: "Danh sách món ăn cho đặt bàn này:",
            orderItems: mappedOrderItems
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách món ăn:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
}

