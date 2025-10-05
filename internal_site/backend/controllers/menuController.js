const cloudinary = require("../config/cloudinary");
const { Menu } = require("../models");
const { Op } = require("sequelize");

// Lấy danh sách Menu
exports.getAllMenuItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      showDeleted = false,
    } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (showDeleted) {
      where.deleted = true;
    } else {
      where.deleted = false;
    }
    if (category) {
      where.category = category;
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const totalItems = await Menu.count({ where });
    const totalPages = Math.ceil(totalItems / limit);
    const menuItems = await Menu.findAll({
      where,
      order: [
        ["category", "ASC"],
        ["name", "ASC"],
      ],
      limit: parseInt(limit),
      offset: offset,
    });

    // Thêm ảnh mặc định từ Cloudinary nếu thiếu
    const defaultImage =
      "https://res.cloudinary.com/drem0ihib/image/upload/v1746546155/Logo_uujqeu.png";
    const updatedMenuItems = menuItems.map((item) => ({
      ...item.toJSON(),
      image: item.image || defaultImage,
      imagePublicId: item.imagePublicId || null,
    }));

    res.status(200).json({
      menuItems: updatedMenuItems,
      totalItems,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách menu", error: error.message });
  }
};

// Tạo món mới
exports.createMenuItem = async (req, res) => {
  try {
    const { name, price, description, category, image, imagePublicId } =
      req.body;

    if (!image && !imagePublicId) {
      return res
        .status(400)
        .json({ message: "Cần cung cấp ảnh hoặc imagePublicId" });
    }

    const newItem = await Menu.create({
      name,
      price,
      description,
      category,
      image: image || null,
      imagePublicId: imagePublicId || null,
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Create error:", error.message);
    res.status(500).json({ message: "Lỗi khi tạo món", error: error.message });
  }
};

// Cập nhật món
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, image, imagePublicId } =
      req.body;

    const item = await Menu.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: "Món không tồn tại" });
    }

    // Xóa ảnh cũ trên Cloudinary nếu có imagePublicId mới và khác với imagePublicId cũ
    if (
      imagePublicId &&
      item.imagePublicId &&
      item.imagePublicId !== imagePublicId
    ) {
      try {
        await cloudinary.uploader.destroy(item.imagePublicId);
        console.log("Old image deleted, publicId:", item.imagePublicId);
      } catch (cloudError) {
        console.error("Error deleting old image:", cloudError);
      }
    }

    item.name = name || item.name;
    item.price = price || item.price;
    item.description = description || item.description;
    item.category = category || item.category;
    item.image = image || item.image;
    item.imagePublicId = imagePublicId || item.imagePublicId;

    await item.save();
    res.status(200).json(item);
  } catch (error) {
    console.error("Update error:", error.message);
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật món", error: error.message });
  }
};

// Xóa món (soft delete)
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Menu.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: "Món không tồn tại" });
    }

    if (item.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(item.imagePublicId);
        console.log("Image deleted, publicId:", item.imagePublicId);
      } catch (cloudError) {
        console.error("Error deleting image:", cloudError);
      }
    }

    item.deleted = true;
    await item.save();
    res.status(200).json({ message: "Xóa món thành công" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Lỗi khi xóa món", error: error.message });
  }
};

// Khôi phục món đã xóa
exports.restoreMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Menu.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: "Món không tồn tại" });
    }
    if (!item.deleted) {
      return res.status(400).json({ message: "Món này chưa bị xóa" });
    }

    const existingItem = await Menu.findOne({
      where: {
        name: item.name,
        deleted: false,
      },
    });
    if (existingItem) {
      return res
        .status(400)
        .json({ message: "Tên món đã tồn tại. Vui lòng chọn tên khác." });
    }

    item.deleted = false;
    await item.save();

    res.status(200).json({ message: "Khôi phục món thành công", item });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi khôi phục món", error: error.message });
  }
};
