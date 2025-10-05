<template>
  <footer class="footer">
    <div class="footer-content">
      <!-- Logo và bản quyền -->
      <div class="footer-brand">
        <img src="@/assets/images/Logo.png" alt="Logo Nhà hàng Tinh Hoa Việt" class="footer-logo" />
        <p class="copyright">&copy; 2025 Tinh Hoa Việt. Mọi quyền được bảo lưu.</p>
      </div>

      <!-- Liên kết mạng xã hội -->
      <div class="footer-social">
        <p class="social-title">Theo dõi chúng tôi:</p>
        <div class="social-links">
          <a href="https://www.facebook.com/codai2004" target="_blank" aria-label="Facebook" class="social-icon">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a href="" target="_blank" aria-label="Instagram" class="social-icon">
            <i class="fab fa-instagram"></i>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #2c2c2c; /* Màu nền tối sang trọng */
  color: #fff;
  padding: 40px 20px;
  text-align: center;
  font-family: 'Arial', sans-serif;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.3);
}

.footer-content {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
}

.footer-brand {
  text-align: center;
}

.footer-logo {
  max-width: 100px;
  margin-bottom: 10px;
}

.copyright {
  font-size: 14px;
  opacity: 0.7;
}

.footer-social {
  flex-grow: 1; /* Nav vẫn chiếm không gian chính giữa */
  /* display: flex; */
  text-align: center;
}

.social-title {
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: 600;
  text-align: center; /* Căn giữa */
}

.social-links {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.social-icon {
  color: #fff;
  font-size: 20px;
  transition: transform 0.3s ease, color 0.3s ease;
}

.social-icon:hover {
  color: #fbcf67; /* Màu vàng sang trọng */
  transform: scale(1.2);
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
