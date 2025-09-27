const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { body, validationResult } = require("express-validator");

const JWT_SECRET = process.env.JWT_SECRET;

// Đăng ký người dùng
exports.register = async (req, res) => {
  await Promise.all([
    body("name").notEmpty().withMessage("Tên không được để trống").run(req),
    body("email").isEmail().withMessage("Email không hợp lệ").run(req),
    body("password")
      .notEmpty()
      .withMessage("Mật khẩu không được để trống")
      .run(req),
    body("phoneNumber")
      .isMobilePhone()
      .withMessage("Số điện thoại không hợp lệ")
      .run(req),
    body("address")
      .notEmpty()
      .withMessage("Địa chỉ không được để trống")
      .run(req),
  ]);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, phoneNumber, address } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      address,
      status: "pending",
      role: "staff",
    });

    console.log(`Yêu cầu đăng ký từ ${email} đang chờ duyệt từ quản lý.`);

    res.status(201).json({
      message: "Đăng ký thành công. Yêu cầu của bạn đang chờ quản lý duyệt.",
      user: { id: newUser.id, email: newUser.email, status: newUser.status },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};


// Đăng nhập người dùng (chỉ cho phép nếu status là approved)
exports.login = async (req, res) => {
  await Promise.all([
    body("email").isEmail().withMessage("Email không hợp lệ").run(req),
    body("password")
      .notEmpty()
      .withMessage("Mật khẩu không được để trống")
      .run(req),
  ]);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email, deleted: false } });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    if (user.status !== "approved") {
      return res
        .status(403)
        .json({ message: "Tài khoản của bạn chưa được duyệt." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Cập nhật lastActive
    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "4h",
    });

    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
