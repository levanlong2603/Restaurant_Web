<template>
    <section class="about">
      <div class="about-item">
        <h3>01</h3>
        <h2>NHÀ HÀNG</h2>
        <p>Trải nghiệm không gian ấm cúng và tinh tế của nhà hàng Việt, nơi hội tụ tinh hoa ẩm thực truyền thống kết hợp cùng phong cách hiện đại. Chúng tôi tự hào mang đến cho thực khách những giây phút thư giãn và thưởng thức món ăn tuyệt vời.</p>
      </div>
      <div class="about-item">
        <h3>02</h3>
        <h2>NHỮNG MÓN ĂN TINH TÚY NHẤT</h2>
        <p>Đầu bếp của chúng tôi lựa chọn kỹ lưỡng những nguyên liệu tươi ngon nhất, chế biến theo công thức truyền thống để mang lại hương vị đậm đà, khó quên. Hãy thưởng thức những món ăn đặc trưng mà ai cũng yêu thích!</p>
      </div>
      <div class="about-item">
        <h3>03</h3>
        <h2>NẰM GIỮA LÒNG THÀNH PHỐ</h2>
        <p>Nhà hàng nằm ngay trung tâm sôi động, là điểm dừng chân lý tưởng để bạn tận hưởng một bữa ăn ngon sau những giờ làm việc hay khám phá thành phố. Chúng tôi luôn sẵn sàng phục vụ bạn!</p>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    name: 'About'
  };
  </script>
  
  <style scoped>
  .about {
    display: flex;
    justify-content: space-around;
    padding: 60px 20px;
    background-image: url('../assets/images/image1.png'); /* Đường dẫn đến ảnh nền */
    background-size: cover; /* Ảnh phủ toàn bộ section */
    background-position: center; /* Căn giữa ảnh */
    background-repeat: no-repeat; /* Không lặp lại ảnh */
    background-color: rgba(0, 0, 0, 0.7); /* Lớp mờ phủ lên ảnh */
    background-blend-mode: overlay; /* Trộn màu mờ với ảnh nền */
    color: white;
    text-align: center;
    height: 100vh;
    align-items: center;
  }
  
  .about-item {
    width: 30%;
  }
  
  .about-item h3 {
    font-size: 36px;
    color: #fbcf67;
    margin-bottom: 10px;
  }
  
  .about-item h2 {
    font-size: 24px;
    margin-bottom: 15px;
    color: #fbcf67;
  }
  
  .about-item p {
    font-size: 16px;
    color: #eeeaea;
  }
  </style>