<template>
  <footer class="footer">
    <div class="footer-content">
      <!-- Thông tin nhà hàng -->
      <div class="restaurant-info">
        <h2 class="restaurant-name">{{ $t('footer.name') }}</h2>
        
        <div class="contact-info">
          <div class="location">
            <h3>{{ $t('contact.address') }}</h3>
            <p>{{ $t('footer.hotline') || 'Hotline: 0348 047 350' }}</p>
          </div>
        </div>
        
        <p class="email">Email: {{ $t('contact.email') }}</p>
      </div>

      <div class="divider"></div>

      <!-- Giờ mở cửa -->
      <div class="opening-hours">
        <h3>{{ $t('footer.openingHoursTitle') || 'Giờ mở cửa' }}</h3>
        <p>{{ $t('footer.openingMorning') || 'Sáng: 10h - 14h' }}</p>
        <p>{{ $t('footer.openingEvening') || 'Chiều: 18h - 22h' }}</p>
        <p>{{ $t('footer.openingEveryday') || 'Tất cả các ngày trong tuần' }}</p>
      </div>

      <div class="divider"></div>

      <!-- Mạng xã hội -->
      <div class="social-media">
        <h3>{{ $t('footer.social') || 'Mạng xã hội' }}</h3>
        <div class="social-icons">
          <a href="https://www.facebook.com/codai2004" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="social-icon">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a href="https://www.instagram.com/co3d_ok/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="social-icon">
            <i class="fab fa-instagram"></i>
          </a>
          <a href="https://www.tiktok.com/@red.chicken.ptit" target="_blank" rel="noopener noreferrer" aria-label="TikTok" class="social-icon">
            <i class="fab fa-tiktok"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- Bản quyền và liên kết -->
    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <p class="copyright">{{ $t('footer.copyright') }} <strong>{{ $t('footer.name') }}</strong> All rights reserved.</p>
        <div class="footer-links">
          <a href="/privacy">{{ $t('footer.privacy') }}</a>
          <span class="separator">|</span>
          <router-link to="/contact">{{ $t('footer.contact') }}</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: linear-gradient(135deg, #6B4226 0%, #8B5E3C 100%);
  color: #FFF8E7;
  padding: 40px 20px 20px;
  font-family: 'Arial', sans-serif;
  box-shadow: 0 -4px 15px rgba(107, 66, 38, 0.4);
  border-top: 2px solid #E7C27D;
  position: relative;
}

.footer-content {
  max-width: 1200px;
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
  color: #E7C27D;
  margin-bottom: 20px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
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
  color: #FFF8E7;
}

.location p, .email, .parking {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 5px;
  color: #F5E3B3;
}

/* Sửa lỗi divider - chỉ hiển thị trên desktop */
.divider {
  width: 1px;
  background: linear-gradient(to bottom, transparent, #E7C27D, transparent);
  margin: 0 20px;
  display: block;
}

.opening-hours {
  flex: 0 0 200px;
}

.opening-hours h3, .social-media h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #E7C27D;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.opening-hours p {
  font-size: 14px;
  margin-bottom: 8px;
  opacity: 0.9;
  color: #F5E3B3;
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
  background: linear-gradient(135deg, #E7C27D 0%, #8B5E3C 100%);
  border-radius: 50%;
  color: #FFF8E7;
  font-size: 18px;
  transition: all 0.3s ease;
  text-decoration: none;
  border: 1px solid #FFF8E7;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.social-icon:hover {
  background: linear-gradient(135deg, #FFF8E7 0%, #E7C27D 100%);
  color: #6B4226;
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 194, 125, 0.4);
}

.footer-bottom {
  max-width: 1200px;
  margin: 20px auto 0;
  padding-top: 20px;
  border-top: 1px solid rgba(231, 194, 125, 0.3);
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
  opacity: 0.9;
  margin: 0;
  color: #F5E3B3;
}

.copyright strong {
  color: #E7C27D;
  font-weight: 700;
}

.footer-links {
  display: flex;
  gap: 10px;
  align-items: center;
}

.footer-links a {
  color: #F5E3B3;
  text-decoration: none;
  font-size: 14px;
  opacity: 0.9;
  transition: all 0.3s ease;
  font-weight: 500;
}

.footer-links a:hover {
  opacity: 1;
  color: #E7C27D;
  transform: translateY(-1px);
}

.separator {
  opacity: 0.5;
  color: #E7C27D;
}

/* Hiệu ứng cho toàn bộ footer */
.footer-content > div {
  transition: transform 0.3s ease;
}

.footer-content > div:hover {
  transform: translateY(-5px);
}

/* ===== RESPONSIVE FIXES ===== */

/* Tablet */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 30px;
    padding-bottom: 20px;
  }
  
  /* Sửa lỗi divider trên mobile */
  .divider {
    width: 100%;
    height: 1px;
    margin: 10px 0;
    background: linear-gradient(to right, transparent, #E7C27D, transparent);
    display: block;
  }
  
  .restaurant-info,
  .opening-hours,
  .social-media {
    flex: 1;
    min-width: 100%;
    width: 100%;
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
  
  /* Ẩn divider thừa trên mobile */
  .footer-content .divider:last-child {
    display: none;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .footer {
    padding: 30px 15px 15px;
  }
  
  .footer-content {
    gap: 25px;
  }
  
  .restaurant-name {
    font-size: 18px;
    margin-bottom: 15px;
  }
  
  .social-icon {
    width: 35px;
    height: 35px;
    font-size: 16px;
  }
  
  .footer-bottom-content {
    gap: 10px;
  }
  
  .copyright {
    font-size: 13px;
  }
  
  .footer-links {
    gap: 8px;
  }
  
  .footer-links a {
    font-size: 13px;
  }
}

/* Small mobile */
@media (max-width: 360px) {
  .footer {
    padding: 25px 10px 10px;
  }
  
  .footer-content {
    gap: 20px;
  }
  
  .social-icons {
    gap: 10px;
  }
  
  .social-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}

/* Animation subtle */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.footer-content > div {
  animation: fadeInUp 0.6s ease forwards;
}

.footer-content > div:nth-child(1) { animation-delay: 0.1s; }
.footer-content > div:nth-child(2) { animation-delay: 0.2s; }
.footer-content > div:nth-child(3) { animation-delay: 0.3s; }

/* Fix for Font Awesome icons */
.social-icon i {
  line-height: 1;
}

/* Ensure proper spacing for all elements */
.restaurant-info > *,
.opening-hours > *,
.social-media > * {
  margin-bottom: 10px;
}

.restaurant-info > *:last-child,
.opening-hours > *:last-child,
.social-media > *:last-child {
  margin-bottom: 0;
}

/* Print styles */
@media print {
  .footer {
    background: #6B4226 !important;
    box-shadow: none !important;
    border-top: 2px solid #E7C27D !important;
  }
  
  .social-icons {
    display: none !important;
  }
}
</style>