<template>
  <footer class="footer">
    <div class="footer-content">
      <!-- Thông tin nhà hàng -->
      <div class="restaurant-info">
  <h2 class="restaurant-name">LONG QUÂN AN - ẨM THỰC TINH TÚY</h2>
        
        <div class="contact-info">
          <div class="location">
            <h3>Địa chỉ : Số 33, đường Đại Mỗ, phường Đại Mỗ, quận Nam Từ Liêm, TP. Hà Nội</h3>
            <p>Hotline: 0348 047 350</p>
          </div>
        </div>
        
        <p class="email">Email: nhahanglongquanan@gmail.com</p>
      </div>

      <div class="divider"></div>

      <!-- Giờ mở cửa -->
      <div class="opening-hours">
        <h3>Giờ mở cửa</h3>
        <p>Sáng: 10h - 14h</p>
        <p>Chiều: 18h - 22h</p>
        <p>Tất cả các ngày trong tuần</p>
      </div>

      <div class="divider"></div>

      <!-- Mạng xã hội -->
      <div class="social-media">
        <h3>Mạng xã hội</h3>
        <div class="social-icons">
          <a href="https://www.facebook.com/codai2004" target="_blank" aria-label="Facebook" class="social-icon">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a href="https://www.instagram.com/co3d_ok/" target="_blank" aria-label="Instagram" class="social-icon">
            <i class="fab fa-instagram"></i>
          </a>
          <!-- TikTok: placeholder URL — change to your TikTok profile if available -->
          <a href="https://www.tiktok.com/@red.chicken.ptit" target="_blank" aria-label="TikTok" class="social-icon">
            <i class="fab fa-tiktok"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- Bản quyền và liên kết - ĐÃ ĐƯA VÀO GIỮA -->
    <div class="footer-bottom">
      <div class="footer-bottom-content">
  <p class="copyright">Copyright © 2025 <strong>LONG QUÂN AN - Ẩm thực tinh túy</strong> All rights reserved.</p>
        <div class="footer-links">
          <a href="#">Bảo mật thông tin</a>
          <span class="separator">|</span>
          <router-link to="/contact">Liên hệ</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #ae8346;
  color: #fff;
  padding: 40px 20px 20px;
  font-family: 'Arial', sans-serif;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.3);
}

.footer-content {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
  padding-bottom: 30px;
}

.restaurant-info {
  flex: 1;
  min-width: 300px;
}

.restaurant-name {
  font-size: 24px;
  color: #fbcf67;
  margin-bottom: 20px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.contact-info {
  margin-bottom: 15px;
}

.location {
  margin-bottom: 15px;
}

.location h3 {
  font-size: 16px;
  margin-bottom: 5px;
  font-weight: 600;
}

.location p, .email, .parking {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 5px;
}

.divider {
  width: 1px;
  background: #444;
  margin: 0 20px;
}

.opening-hours {
  flex: 0 0 200px;
}

.opening-hours h3, .social-media h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #fbcf67;
  font-weight: 600;
}

.opening-hours p {
  font-size: 14px;
  margin-bottom: 8px;
  opacity: 0.8;
}

.social-media {
  flex: 0 0 200px;
}

.social-icons {
  display: flex;
  gap: 15px;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #fbcf67;
  border-radius: 50%;
  color: #2c2c2c;
  font-size: 18px;
  transition: all 0.3s ease;
  text-decoration: none; /* Bỏ gạch chân */
}

.social-icon:hover {
  background: #fff;
  color: #2c2c2c;
  transform: scale(1.1);
}

.footer-bottom {
  max-width: 1100px;
  margin: 20px auto 0;
  padding-top: 20px;
  border-top: 1px solid #444;
}

.footer-bottom-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  text-align: center;
}

.copyright {
  font-size: 14px;
  opacity: 0.7;
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 10px;
  align-items: center;
}

.footer-links a {
  color: #fff;
  text-decoration: none; /* Bỏ gạch chân */
  font-size: 14px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.footer-links a:hover {
  opacity: 1;
  color: #fbcf67;
}

.separator {
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 30px;
  }
  
  .divider {
    width: 100%;
    height: 1px;
    margin: 10px 0;
  }
  
  .restaurant-name {
    font-size: 20px;
  }
  
  .social-icons {
    justify-content: center;
  }
  
  .footer-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>