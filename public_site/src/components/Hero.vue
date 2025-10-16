<template>
  <section class="hero">
    <!-- Các div slide cho ảnh nền -->
    <div
      v-for="(image, index) in images"
      :key="index"
      class="slide"
      :style="{ backgroundImage: `url(${image.url})`, animationDelay: `${index * 5}s` }"
    ></div>
    
    <!-- Nội dung hero -->
    <div class="hero-content">
      <div class="content-wrapper">
        <h1 class="hero-title">{{ currentContent.title }}</h1>
        <h2 class="hero-subtitle">{{ currentContent.subtitle }}</h2>
        <div class="hero-divider"></div>
        <p class="hero-description">{{ currentContent.description }}</p>
      </div>
    </div>
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
      currentIndex: 0
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
  mounted() {
    // Cập nhật currentIndex đồng bộ với animation
    setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }, 5000); // 5s mỗi ảnh
  }
};
</script>

<style scoped>
.hero {
  height: 85vh; /* Giảm từ 100vh xuống 85vh */
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background: no-repeat center center/cover;
  animation: slideLeft 15s infinite; /* 15s = 5s mỗi ảnh x 3 ảnh */
}

@keyframes slideLeft {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  6.67% {
    transform: translateX(0);
    opacity: 1;
  }
  33.33% {
    transform: translateX(0);
    opacity: 1;
  }
  40% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(-100%);
    opacity: 0;
  }
}

.hero-content {
  position: relative;
  text-align: center;
  color: #FFF8E7;
  height: 100%;
  width: 100%;
  background: rgba(107, 66, 38, 0.4); /* Nâu đất với độ trong suốt */
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.content-wrapper {
  max-width: 800px;
  padding: 0 2rem;
  animation: fadeInUp 1s ease-out;
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #E7C27D; /* Vàng nhạt */
  text-shadow: 2px 2px 4px rgba(107, 66, 38, 0.8);
  letter-spacing: 3px;
  transition: all 0.5s ease;
}

.hero-subtitle {
  font-size: 2.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #F5E3B3; /* Be sáng */
  text-shadow: 2px 2px 4px rgba(107, 66, 38, 0.6);
  letter-spacing: 1px;
  transition: all 0.5s ease;
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
  transition: all 0.5s ease;
}

/* Animation cho nội dung */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
}

/* Hiệu ứng hover cho các phần tử */
.hero-content:hover .hero-title {
  transform: scale(1.02);
}

.hero-content:hover .hero-subtitle {
  transform: scale(1.01);
}

.hero-content:hover .hero-description {
  transform: translateY(-2px);
}
</style>