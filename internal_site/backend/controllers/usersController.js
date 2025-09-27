const bcrypt = require("bcryptjs");
const { sequelize, User } = require("../models");
const { Op } = require("sequelize");
const cloudinary = require("../config/cloudinary");

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
    const limit = parseInt(req.query.limit) || 10; // Số lượng người dùng mỗi trang, mặc định là 10
    const offset = (page - 1) * limit; // Tính vị trí bắt đầu

    const { count, rows: users } = await User.findAndCountAll({
      where: { deleted: false },
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit); // Tính tổng số trang

    const userData = users.map((user) => {
      const userValues = { ...user.dataValues };
      delete userValues.password;
      return userValues;
    });

    res.status(200).json({
      users: userData,
      currentPage: page,
      totalPages,
      totalItems: count,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách người dùng",
      error: error.message,
    });
  }
};

exports.getDeletedUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "manager") {
      console.error("Không có quyền truy cập:", req.user);
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
    const limit = parseInt(req.query.limit) || 10; // Số lượng người dùng mỗi trang, mặc định là 10
    const offset = (page - 1) * limit; // Tính vị trí bắt đầu

    const { count, rows: deletedUsers } = await User.findAndCountAll({
      where: { deleted: true },
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit); // Tính tổng số trang

    const userData = deletedUsers.map((user) => {
      const userValues = { ...user.dataValues };
      delete userValues.password;
      return userValues;
    });

    res.status(200).json({
      users: userData,
      currentPage: page,
      totalPages,
      totalItems: count,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng đã xóa mềm:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách người dùng đã xóa mềm",
      error: error.message,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await User.findByPk(userId);
    if (!user || user.deleted) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== "manager" && req.user.id !== userId) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const userData = { ...user.dataValues };
    delete userData.password;

    return res.status(200).json({
      message: "Lấy thông tin người dùng thành công",
      user: userData,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      email,
      address,
      password,
      role,
      lastActive,
      dateAdded,
      profilePhoto,
      profilePhotoPublicId,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      phoneNumber,
      email,
      address,
      password: hashedPassword,
      profilePhoto,
      profilePhotoPublicId,
      role: role || "staff",
      lastActive: null,
      dateAdded: dateAdded ? new Date(dateAdded) : new Date(),
      status: "pending",
      deleted: false,
    });

    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
    return res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phoneNumber,
      email,
      address,
      role,
      lastActive,
      profilePhoto,
      profilePhotoPublicId,
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      profilePhotoPublicId &&
      user.profilePhotoPublicId &&
      user.profilePhotoPublicId !== profilePhotoPublicId
    ) {
      await cloudinary.uploader.destroy(user.profilePhotoPublicId);
    }

    await user.update({
      name,
      phoneNumber,
      email,
      address,
      role,
      profilePhoto,
      profilePhotoPublicId,
      lastActive: lastActive ? new Date(lastActive) : user.lastActive,
    });

    return res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    return res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await User.findByPk(userId);

    if (!user || user.deleted) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    if (req.user.role !== "manager") {
      return res.status(403).json({
        message: "Quyền truy cập bị từ chối: Yêu cầu vai trò manager",
      });
    }

    if (user.profilePhotoPublicId) {
      await cloudinary.uploader.destroy(user.profilePhotoPublicId);
    }

    user.deleted = true;
    await user.save();

    res.status(200).json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi xóa người dùng", error: error.message });
  }
};

exports.restoreUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (!req.user || req.user.role !== "manager") {
      console.error("Không có quyền truy cập:", req.user);
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    if (!user.deleted) {
      return res.status(400).json({ message: "Người dùng chưa bị xóa mềm" });
    }

    user.deleted = false;
    await user.save();

    const restoredUser = { ...user.dataValues };
    delete restoredUser.password;

    res
      .status(200)
      .json({ message: "Khôi phục người dùng thành công", user: restoredUser });
  } catch (error) {
    console.error("Lỗi khi khôi phục người dùng:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi khôi phục người dùng", error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user || user.deleted) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (!req.user || req.user.role !== "manager") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const user = await User.findByPk(userId);
    if (!user || user.deleted) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    if (user.status === "approved") {
      return res.status(400).json({ message: "Người dùng đã được duyệt" });
    }

    user.status = "approved";
    await user.save();

    res.status(200).json({
      message: "Duyệt người dùng thành công",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Lỗi khi duyệt người dùng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (!req.user || req.user.role !== "manager") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const user = await User.findByPk(userId);
    if (!user || user.deleted) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    if (user.status === "rejected") {
      return res.status(400).json({ message: "Người dùng đã bị từ chối" });
    }

    user.status = "rejected";
    await user.save();

    res.status(200).json({
      message: "Từ chối người dùng thành công",
      user: { id: user.id, email: user.email, status: user.status },
    });
  } catch (error) {
    console.error("Lỗi khi từ chối người dùng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
