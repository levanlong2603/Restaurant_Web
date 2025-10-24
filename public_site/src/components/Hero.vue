<template>
  <section class="hero">
    <!-- Các div slide cho ảnh nền -->
    <div
      v-for="(image, index) in images"
      :key="index"
      class="slide"
      :class="{ active: currentIndex === index }"
      :style="{ backgroundImage: `url(${image.url})` }"
    ></div>
    
    <!-- Overlay với gradient tinh tế -->
    <div class="hero-overlay"></div>
    
    <!-- Nội dung hero -->
    <div class="hero-content">
      <!-- Language toggle -->
      <div class="lang-toggle">
        <button @click="setLanguage('en')" :aria-pressed="currentLang === 'en'">EN</button>
        <button @click="setLanguage('vi')" :aria-pressed="currentLang === 'vi'">VI</button>
      </div>

      <div class="content-wrapper">
        <div class="text-content">
          <h1 class="hero-title">{{ $t('hero.title') }}</h1>
          <h2 class="hero-subtitle">{{ $t(`heroSlides.slide${currentIndex + 1}.subtitle`) || $t('hero.subtitle') }}</h2>
        </div>
        
        <!-- Nút CTA với router-link -->
        <div class="hero-actions">
          <router-link to="/reservation" class="btn btn-primary">
            {{ $t('hero.cta.reserve') }}
          </router-link>
          <router-link to="/menu" class="btn btn-secondary">
            {{ $t('hero.cta.menu') }}
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- Điều hướng slide -->
    <div class="slide-nav">
      <button 
        v-for="(image, index) in images" 
        :key="index"
        :class="{ active: currentIndex === index }"
        @click="setCurrentIndex(index)"
        class="nav-dot"
      >
        <span class="sr-only">Chuyển tới slide {{ index + 1 }}</span>
      </button>
    </div>
    
    <!-- Nút điều hướng trước/sau -->
    <button class="nav-btn prev" @click="prevSlide">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button class="nav-btn next" @click="nextSlide">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </section>
</template>

<script>
import hero1 from '../assets/images/hero1.jpeg';
import hero2 from '../assets/images/hero2.jpg';
import hero3 from '../assets/images/hero3.jpg';

export default {
  name: 'Hero',
  data() {
    return {
      images: [
        { url: hero1 },
        { url: hero2 },
        { url: hero3 }
      ],
      currentIndex: 0,
      autoPlayInterval: null,
      touchStartX: 0,
      touchEndX: 0,
      currentLang: localStorage.getItem('lang') || 'vi'
    };
  },
  computed: {
    // nothing here for now - translations are used directly in the template
  },
  methods: {
    setLanguage(lang) {
      this.currentLang = lang;
      // Dispatch the global event main.js listens for to change i18n locale and persist
      try {
        window.dispatchEvent(new CustomEvent('lang-changed', { detail: lang }));
      } catch (err) {
        // fallback for older browsers
        const ev = document.createEvent('CustomEvent');
        ev.initCustomEvent('lang-changed', true, true, lang);
        window.dispatchEvent(ev);
      }
    },
    nextSlide() {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.resetAutoPlay();
    },
    prevSlide() {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
      this.resetAutoPlay();
    },
    setCurrentIndex(index) {
      this.currentIndex = index;
      this.resetAutoPlay();
    },
    resetAutoPlay() {
      clearInterval(this.autoPlayInterval);
      this.startAutoPlay();
    },
    startAutoPlay() {
      this.autoPlayInterval = setInterval(() => {
        this.nextSlide();
      }, 5000);
    },
    handleTouchStart(e) {
      this.touchStartX = e.changedTouches[0].screenX;
    },
    handleTouchEnd(e) {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    },
    handleSwipe() {
      const minSwipeDistance = 50;
      const distance = this.touchStartX - this.touchEndX;
      
      if (Math.abs(distance) < minSwipeDistance) return;
      
      if (distance > 0) {
        // Swipe left - next slide
        this.nextSlide();
      } else {
        // Swipe right - previous slide
        this.prevSlide();
      }
    }
  },
  mounted() {
    this.startAutoPlay();
    // Thêm sự kiện touch cho mobile
    this.$el.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    this.$el.addEventListener('touchend', this.handleTouchEnd, { passive: true });
  },
  beforeUnmount() {
    clearInterval(this.autoPlayInterval);
    // Xóa sự kiện touch khi component bị hủy
    this.$el.removeEventListener('touchstart', this.handleTouchStart);
    this.$el.removeEventListener('touchend', this.handleTouchEnd);
  }
};
</script>

<style scoped>
.hero {
  height: 85vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: pan-y; /* Cho phép swipe dọc nhưng không can thiệp vào swipe ngang */
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: no-repeat center center/cover;
  opacity: 0;
  transition: opacity 1s ease-in-out, transform 8s ease;
  transform: scale(1);
}

.slide.active {
  opacity: 1;
  transform: scale(1.05);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(107, 66, 38, 0.3) 0%,
    rgba(107, 66, 38, 0.5) 50%,
    rgba(107, 66, 38, 0.7) 100%
  );
  z-index: 1;
}

.hero-content {
  position: relative;
  text-align: center;
  color: #FFF8E7;
  height: 100%;
  width: 100%;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 1rem; /* Thêm padding để tránh nội dung sát viền */
  box-sizing: border-box;
}

.content-wrapper {
  max-width: 800px;
  width: 100%;
}

.text-content {
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #E7C27D;
  text-shadow: 2px 2px 4px rgba(107, 66, 38, 0.8);
  letter-spacing: 3px;
  line-height: 1.1; /* Cải thiện khả năng đọc trên mobile */
}

/* Language toggle */
.lang-toggle {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 4;
  display: flex;
  gap: 0.5rem;
}
.lang-toggle button {
  background: rgba(231, 194, 125, 0.12);
  color: #FFF8E7;
  border: 1px solid rgba(231, 194, 125, 0.25);
  padding: 0.35rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
}
.lang-toggle button[aria-pressed="true"] {
  background: #E7C27D;
  color: #6B4226;
}

.hero-subtitle {
  font-size: 2.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #F5E3B3;
  text-shadow: 2px 2px 4px rgba(107, 66, 38, 0.6);
  letter-spacing: 1px;
  line-height: 1.3; /* Cải thiện khả năng đọc trên mobile */
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap; /* Cho phép các nút xuống dòng nếu cần */
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  min-width: 140px; /* Đảm bảo nút có kích thước tối thiểu dễ chạm */
}

.btn-primary {
  background-color: #E7C27D;
  color: #6B4226;
}

.btn-primary:hover {
  background-color: #F5E3B3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background-color: transparent;
  color: #FFF8E7;
  border: 2px solid #E7C27D;
}

.btn-secondary:hover {
  background-color: rgba(231, 194, 125, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.slide-nav {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.75rem;
  z-index: 3;
}

.nav-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background-color: rgba(255, 248, 231, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  /* Tăng kích thước chạm trên mobile */
  min-width: 16px;
  min-height: 16px;
}

.nav-dot.active {
  background-color: #E7C27D;
  transform: scale(1.2);
}

.nav-dot:hover {
  background-color: #F5E3B3;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(107, 66, 38, 0.5);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFF8E7;
  cursor: pointer;
  z-index: 3;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(107, 66, 38, 0.8);
  transform: translateY(-50%) scale(1.1);
}

.nav-btn.prev {
  left: 2rem;
}

.nav-btn.next {
  right: 2rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hero-title {
    font-size: 3.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.8rem;
  }
  
  .nav-btn {
    width: 40px;
    height: 40px;
  }
  
  .nav-btn.prev {
    left: 1rem;
  }
  
  .nav-btn.next {
    right: 1rem;
  }
}

@media (max-width: 768px) {
  .hero {
    height: 75vh;
    min-height: 500px; /* Đảm bảo chiều cao tối thiểu */
  }
  
  .hero-title {
    font-size: 2.5rem;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }
  
  .content-wrapper {
    padding: 0 1.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  
  .btn {
    width: 200px;
    padding: 0.85rem 1.5rem; /* Tăng padding để dễ chạm hơn */
    font-size: 0.95rem;
  }
  
  .nav-btn {
    display: none; /* Ẩn nút điều hướng trên mobile để tiết kiệm không gian */
  }
  
  .slide-nav {
    bottom: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero {
    height: 70vh;
    min-height: 450px;
  }
  
  .hero-title {
    font-size: 2rem;
    letter-spacing: 0.5px;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .content-wrapper {
    padding: 0 1rem;
  }
  
  .slide-nav {
    bottom: 1rem;
  }
  
  .nav-dot {
    min-width: 14px;
    min-height: 14px;
  }
  
  .text-content {
    margin-bottom: 1.5rem;
  }
  
  .hero-actions {
    margin-top: 1.5rem;
  }
}

/* Điều chỉnh cho màn hình rất nhỏ */
@media (max-width: 360px) {
  .hero-title {
    font-size: 1.8rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .btn {
    width: 180px;
    padding: 0.8rem 1.2rem;
    font-size: 0.9rem;
  }
}

/* Tối ưu hóa cho thiết bị di động ở chế độ ngang */
@media (max-height: 500px) and (orientation: landscape) {
  .hero {
    height: 100vh;
    min-height: 300px;
  }
  
  .hero-content {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
  
  .text-content {
    margin-bottom: 1rem;
  }
  
  .hero-title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }
  
  .hero-actions {
    margin-top: 1rem;
    flex-direction: row;
  }
  
  .btn {
    width: auto;
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}
</style>