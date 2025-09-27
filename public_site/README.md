**Site công khai**

- Mục đích: Hiển thị thông tin khách hàng. 
- Các trang:
    + AboutUs.vue: Giới thiệu nhà hàng (lịch sử, giá trị, đội ngũ).
    + Menu.vue: Danh sách món ăn (lấy từ API do quản lý chỉnh sửa).
    + Reservation.vue: Form đặt bàn trước (gửi dữ liệu tới server).
    + Contact.vue: Địa chỉ các chi nhánh và thông tin liên hệ (số điện thoại, email, bản đồ).
- Thành phần:
    + Header.vue: Thanh điều hướng (liên kết tới các trang).
    + Footer.vue: Thông tin bản quyền, liên kết mạng xã hội.
    + ReservationForm.vue: Form nhập thông tin đặt bàn (tên, số điện thoại, ngày, giờ).
- Router:
    + Điều hướng giữa các trang bằng vue-router
- Dependencies (trong package.json):
    + vue, vue-router, axios
    
**Cách triển khai**

- Cài đặt môi trường:
    + Chạy trong thư mục public-site:
        npm init 
- Kết nối API:
    + Trang Menu.vue và ReservationForm.vue cần gọi API từ internal-site/server (ví dụ: /api/menu, /api/reservations).
- Build và deploy:
    + Để tạo bản production, sau đó đẩy lên Netlify hoặc Vercel:
        npm run build 
    + Để phát triển:
        npm run serve