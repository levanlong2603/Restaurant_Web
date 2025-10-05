**Site nội bộ**

- Phân quyền:
    + Nhân viên: Gọi món, đặt bàn qua điện thoại.
    + Quản lý: Xem thống kê, chỉnh sửa menu, tạo tài khoản nhân viên.
- frontend/:
    + Pages:
        + Login.vue: Form đăng nhập.
        + StaffDashboard.vue: Giao diện cho nhân viên (gọi món, đặt bàn).
        + ManagerDashboard.vue: Giao diện cho quản lý (thống kê, quản lý menu, tài khoản).
    + Thành phần:
        + OrderForm.vue: Form chọn món cho khách tại nhà hàng.
        + ReservationForm.vue: Form đặt bàn qua điện thoại.
        + MenuEditor.vue: Form thêm/sửa/xóa món trong menu.
- backend/:
    + Models:
        + User.vue: Lưu thông tin nhân viên/quản lý (username, password, role).
        + Order.vue: Lưu đơn gọi món (món, số lượng, bàn).
        + Reservation.vue: Lưu thông tin đặt bàn (tên khách, thời gian).
        + MenuItem.vue: Lưu món ăn (tên, giá, mô tả).
    + Routes:
        + /api/auth: Đăng nhập, tạo tài khoản.
        + /api/orders: Gọi món (nhân viên).
        + /api/reservations: Đặt bàn (nhân viên + public).
        + /api/menu: Lấy danh sách món (public) + chỉnh sửa (quản lý).
        + /api/stats: Thống kê doanh thu, đơn hàng (quản lý).
    + Middleware:
        + authMiddleware.vue: Kiểm tra token đăng nhập.
        + roleMiddleware.vue: Kiểm tra role (staff/manager).
    + Dependencies (trong package.json):
        + express, jsonwebtoken, bcryptjs (mã hóa mật khẩu), database (ví dụ: mongoose nếu dùng MongoDB).
    + Cài đặt *multer* : ể xử lý upload ảnh và lưu vào thư mục uploads
        npm install multer
- shared/:
    + Mục đích: Chứa các hàm hoặc tài nguyên dùng chung giữa public-site và internal-site.
    + Ví dụ: api.js để gọi API với cấu hình chung (base URL, token).

- Sử dụng Cloudinary để lưu ảnh thay vì sử dụng thư mục local uploads/:
    + npm install cloudinary
    + Tạo file cấu hình cho Cloudinary: config/cloudinary.js
    <!-- + Giảm kích thước file ảnh trước khi upload: npm install compressorjs -->
    + Sử dụng Cloudinary upload preset để upload (unsigned) trực tiếp từ client (frontend) lên Cloudinary mà không cần thông qua backend.
    

