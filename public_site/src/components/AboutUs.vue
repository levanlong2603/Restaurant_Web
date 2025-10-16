<template>
  <section class="about">
    <!-- Tiêu đề chính ở giữa trang -->
    <div class="main-title-section">
      <h1 class="about-title">{{ $t('aboutUs.title') }}</h1>
    </div>

    <div class="about-container">
      <!-- Nửa trái: Nội dung về nhà hàng -->
      <div class="about-content">
        <div class="about-description">
          <p class="intro-text"><strong>{{ $t('aboutUs.intro1') }}</strong></p>
          <p class="intro-text"><strong>{{ $t('aboutUs.intro2') }}</strong></p>
          
          <p>{{ $t('aboutUs.p1') }}</p>
          
          <p>{{ $t('aboutUs.p2') }}</p>
          
          <p>{{ $t('aboutUs.p3') }}</p>
        </div>
      </div>

      <!-- Nửa phải: Hero hình chữ nhật -->
      <div class="about-hero">
        <div class="hero-slides">
          <div 
            v-for="(image, index) in heroImages" 
            :key="index"
            class="hero-slide"
            :class="{ active: currentSlide === index }"
            :style="{ backgroundImage: `url(${image})` }"
          ></div>
        </div>
        
        <!-- Navigation dots -->
        <div class="slide-nav">
          <button 
            v-for="(image, index) in heroImages" 
            :key="index"
            class="nav-dot"
            :class="{ active: currentSlide === index }"
            @click="setSlide(index)"
          ></button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {
      currentSlide: 0,
      heroImages: [
        require('@/assets/images/image1.png'),
        require('@/assets/images/image2.png'),
        require('@/assets/images/image3.png'),
        require('@/assets/images/image4.png'),
      ],
      slideInterval: null
    };
  },
  mounted() {
    this.startSlideShow();
  },
  beforeUnmount() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  },
  methods: {
    startSlideShow() {
      this.slideInterval = setInterval(() => {
        this.currentSlide = (this.currentSlide + 1) % this.heroImages.length;
      }, 4000);
    },
    setSlide(index) {
      this.currentSlide = index;
      if (this.slideInterval) {
        clearInterval(this.slideInterval);
        this.startSlideShow();
      }
    }
  }
};
</script>

<style scoped>
.about {
  padding: 80px 0;
  background: linear-gradient(135deg, #FFF8E7 0%, #F5E3B3 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

/* Phần tiêu đề chính ở giữa trang */
.main-title-section {
  text-align: center;
  margin-bottom: 60px;
  width: 100%;
  padding: 0 20px;
}

.about-title {
  font-size: 3rem;
  font-weight: 700;
  color: #6B4226;
  margin-bottom: 15px;
  letter-spacing: 3px;
  line-height: 1.1;
  text-transform: uppercase;
}

.about-subtitle {
  font-size: 1.8rem;
  color: #8B5E3C;
  font-weight: 600;
  margin-top: 10px;
  line-height: 1.3;
  letter-spacing: 1px;
}

.about-container {
  max-width: 100%;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  padding: 0 40px;
  width: 100%;
  box-sizing: border-box;
}

/* Nửa trái: Nội dung */
.about-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.about-description {
  margin-bottom: 0;
}

.about-description p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #3B2F2F;
  margin-bottom: 20px;
  text-align: justify;
}

.about-description strong {
  color: #6B4226;
  font-weight: 600;
}

.intro-text {
  font-size: 1.2rem !important;
  line-height: 1.6 !important;
  margin-bottom: 15px !important;
  text-align: left !important;
}

.intro-text:first-child {
  font-size: 1.4rem !important;
  color: #8B5E3C !important;
  margin-bottom: 10px !important;
}

.signature {
  margin-top: 30px;
  text-align: right;
  padding-top: 20px;
  border-top: 2px solid #E7C27D;
}

.signature p {
  font-size: 1.3rem;
  font-style: italic;
  margin-bottom: 0 !important;
}

/* Nửa phải: Hero slides */
.about-hero {
  position: relative;
  height: 400px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(107, 66, 38, 0.2);
}

.hero-slides {
  position: relative;
  width: 100%;
  height: 100%;
}

.hero-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

.hero-slide.active {
  opacity: 1;
}

/* Navigation dots */
.slide-nav {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.nav-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #FFF8E7;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-dot.active {
  background: #E7C27D;
  border-color: #E7C27D;
  transform: scale(1.2);
}

.nav-dot:hover {
  background: #F5E3B3;
  border-color: #F5E3B3;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .about-container {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 0 30px;
  }
  
  .about-hero {
    height: 350px;
    order: -1;
  }
  
  .main-title-section {
    margin-bottom: 40px;
  }
}

@media (max-width: 768px) {
  .about {
    padding: 60px 0;
  }
  
  .about-title {
    font-size: 2.5rem;
  }
  
  .about-subtitle {
    font-size: 1.5rem;
  }
  
  .about-container {
    padding: 0 20px;
  }
  
  .about-hero {
    height: 300px;
  }
  
  .main-title-section {
    margin-bottom: 30px;
  }
}

@media (max-width: 480px) {
  .about {
    padding: 50px 0;
  }
  
  .about-container {
    padding: 0 15px;
  }
  
  .about-title {
    font-size: 2.2rem;
    letter-spacing: 2px;
  }
  
  .about-subtitle {
    font-size: 1.3rem;
  }
  
  .about-hero {
    height: 250px;
  }
  
  .about-description p {
    font-size: 1rem;
  }
  
  .intro-text {
    font-size: 1.1rem !important;
  }
  
  .intro-text:first-child {
    font-size: 1.3rem !important;
  }
  
  .main-title-section {
    margin-bottom: 25px;
  }
}
</style>