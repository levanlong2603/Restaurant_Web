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
    
    <!-- Overlay với gradient tinh tế hơn -->
    <div class="hero-overlay"></div>
    
    <!-- Nội dung hero -->
    <div class="hero-content">
      <div class="content-wrapper">
        <transition name="fade-up" mode="out-in">
          <div :key="currentIndex" class="text-content">
            <h1 class="hero-title">{{ currentContent.title }}</h1>
            <h2 class="hero-subtitle">{{ currentContent.subtitle }}</h2>
            <div class="hero-divider"></div>
            <p class="hero-description">{{ currentContent.description }}</p>
          </div>
        </transition>
        
        <!-- Nút CTA với router-link -->
        <div class="hero-actions">
          <router-link to="/reservation" class="btn btn-primary">
            Đặt bàn ngay
          </router-link>
          <router-link to="/menu" class="btn btn-secondary">
            Xem thực đơn
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
        { 
          url: hero1, 
          title: 'LONG QUÂN AN', 
          subtitle: 'Tinh Hoa Ẩm Thực Việt',
          description: 'Trải nghiệm hương vị truyền thống trong không gian hiện đại'
        },
        { 
          url: hero2, 
          title: 'LONG QUÂN AN', 
          subtitle: 'Hương Vị Quê Hương',
          description: 'Nguyên liệu tươi ngon - Chế biến tận tâm - Phục vụ chu đáo'
        },
        { 
          url: hero3, 
          title: 'LONG QUÂN AN', 
          subtitle: 'Bữa Cơm Gia Đình',
          description: 'Nơi hương vị gia đình hòa quyện cùng không gian ấm cúng'
        }
      ],
      currentIndex: 0,
      autoPlayInterval: null
    };
  },
  computed: {
    currentContent() {
      return {
        title: this.images[this.currentIndex].title,
        subtitle: this.images[this.currentIndex].subtitle,
        description: this.images[this.currentIndex].description
      };
    }
  },
  methods: {
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
    }
  },
  mounted() {
    this.startAutoPlay();
  },
  beforeDestroy() {
    clearInterval(this.autoPlayInterval);
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
}

.content-wrapper {
  max-width: 800px;
  padding: 0 2rem;
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
}

.hero-subtitle {
  font-size: 2.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #F5E3B3;
  text-shadow: 2px 2px 4px rgba(107, 66, 38, 0.6);
  letter-spacing: 1px;
}

.hero-divider {
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #E7C27D, transparent);
  margin: 1.5rem auto;
  border-radius: 2px;
}

.hero-description {
  font-size: 1.3rem;
  font-weight: 400;
  line-height: 1.6;
  color: #FFF8E7;
  text-shadow: 1px 1px 2px rgba(107, 66, 38, 0.5);
  max-width: 600px;
  margin: 0 auto;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
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

/* Transition animations */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.8s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hero {
    height: 80vh;
  }
  
  .hero-title {
    font-size: 3.8rem;
  }
  
  .hero-subtitle {
    font-size: 1.8rem;
  }
  
  .hero-description {
    font-size: 1.2rem;
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
  }
  
  .hero-title {
    font-size: 3.2rem;
    letter-spacing: 2px;
  }
  
  .hero-subtitle {
    font-size: 1.5rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
    padding: 0 1rem;
  }
  
  .content-wrapper {
    padding: 0 1.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 200px;
  }
  
  .nav-btn {
    display: none;
  }
}

@media (max-width: 480px) {
  .hero {
    height: 70vh;
  }
  
  .hero-title {
    font-size: 2.5rem;
    letter-spacing: 1px;
  }
  
  .hero-subtitle {
    font-size: 1.3rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .content-wrapper {
    padding: 0 1rem;
  }
  
  .slide-nav {
    bottom: 1rem;
  }
}
</style>