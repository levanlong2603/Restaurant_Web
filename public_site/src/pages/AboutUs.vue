<!-- Trang giới thiệu -->
<template>
  <div class="about-page">
    <Header />
    <Hero />
    <About />
    
    <!-- Image gallery -->
    <section class="about-gallery">
      <div class="gallery-container">
        <img 
          v-for="(img, idx) in galleryImages" 
          :key="idx" 
          :src="require(`@/assets/images/${img}`)" 
          :alt="`Gallery ${idx+1}`" 
          class="gallery-image"
          @click="openLightbox(idx)"
        />
      </div>
    </section>

    <!-- Lightbox -->
    <div v-if="lightboxVisible" class="lightbox-overlay" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <button class="lightbox-close" @click="closeLightbox">×</button>
        <button class="lightbox-nav lightbox-prev" @click="prevImage">‹</button>
        <img :src="require(`@/assets/images/${galleryImages[currentImageIndex]}`)" :alt="`Gallery ${currentImageIndex + 1}`" class="lightbox-image" />
        <button class="lightbox-nav lightbox-next" @click="nextImage">›</button>
        <div class="lightbox-counter">{{ currentImageIndex + 1 }} / {{ galleryImages.length }}</div>
      </div>
    </div>

    <Chatbot />
    <Footer />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Hero from '@/components/Hero.vue';
import About from '@/components/AboutUs.vue';
import Footer from '@/components/Footer.vue';
import Chatbot from '@/components/Chatbot.vue';

export default {
  name: 'AboutUs',
  components: {
    Header,
    Hero,
    About,
    Footer,
    Chatbot,
  },
  data() {
    return {
      galleryImages: [
        'image1.png',
        'image2.png',
        'image3.png',
        'image4.png',
        'image5.png',
      ],
      lightboxVisible: false,
      currentImageIndex: 0
    };
  },
  methods: {
    openLightbox(index) {
      this.currentImageIndex = index;
      this.lightboxVisible = true;
      document.body.style.overflow = 'hidden'; // Ngăn scroll khi lightbox mở
    },
    closeLightbox() {
      this.lightboxVisible = false;
      document.body.style.overflow = 'auto';
    },
    nextImage() {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.galleryImages.length;
    },
    prevImage() {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
    },
    handleKeydown(event) {
      if (!this.lightboxVisible) return;
      
      switch(event.key) {
        case 'Escape':
          this.closeLightbox();
          break;
        case 'ArrowLeft':
          this.prevImage();
          break;
        case 'ArrowRight':
          this.nextImage();
          break;
      }
    }
  },
  mounted() {
    document.addEventListener('keydown', this.handleKeydown);
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.body.style.overflow = 'auto';
  }
};
</script>

<style scoped>
.about-page {
  background-color: #FFF8E7;
  min-height: 100vh;
  color: #3B2F2F;
}

/* Gallery styles - Mobile First */
.about-gallery {
  padding: 20px 15px 40px;
}

.gallery-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.gallery-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.2);
  border: 2px solid #E7C27D;
  transition: all 0.3s ease;
  cursor: pointer;
}

.gallery-image:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(107, 66, 38, 0.3);
  border-color: #8B5E3C;
}

/* Lightbox Styles */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  padding: 20px;
  box-sizing: border-box;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.lightbox-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 32px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 28px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.1);
}

.lightbox-prev {
  left: 10px;
}

.lightbox-next {
  right: 10px;
}

.lightbox-counter {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

/* Main content styles */
main {
  max-width: 800px;
  margin: 0 auto;
  padding: 80px 20px;
  text-align: center;
}

h1 {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #6B4226;
  text-shadow: 0 0 5px #E7C27D, 0 0 30px #E7C27D;
  font-family: 'Playfair Display', serif;
  line-height: 1.2;
}

p {
  font-size: 15px;
  color: #3B2F2F;
  margin-bottom: 30px;
  line-height: 1.6;
  font-weight: 500;
}

.dish-image {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  border: 3px solid #8B5E3C;
  box-shadow: 0 8px 25px rgba(107, 66, 38, 0.3);
  margin: 20px 0;
}

/* Section styling */
.about-section {
  background: rgba(231, 194, 125, 0.1);
  padding: 30px 20px;
  border-radius: 12px;
  margin: 25px 0;
  border: 1px solid rgba(231, 194, 125, 0.3);
  backdrop-filter: blur(5px);
}

.about-section h2 {
  color: #6B4226;
  font-size: 24px;
  margin-bottom: 16px;
  font-weight: 700;
  line-height: 1.3;
}

.about-section p {
  color: #3B2F2F;
  font-size: 15px;
  opacity: 0.9;
  margin-bottom: 0;
}

/* Team section */
.team-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-top: 30px;
}

.team-member {
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.1);
  border: 1px solid #E7C27D;
  transition: all 0.3s ease;
}

.team-member:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(107, 66, 38, 0.2);
}

.team-member h3 {
  color: #6B4226;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 18px;
}

.team-member p {
  color: #3B2F2F;
  opacity: 0.8;
  margin-bottom: 0;
  font-size: 14px;
}

/* Values section */
.values-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-top: 30px;
}

.value-item {
  padding: 20px;
  background: linear-gradient(135deg, #8B5E3C, #6B4226);
  color: #FFF8E7;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
}

.value-item:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(107, 66, 38, 0.4);
}

.value-item h3 {
  color: #E7C27D;
  margin-bottom: 10px;
  font-size: 18px;
}

.value-item p {
  color: #F5E3B3;
  margin-bottom: 0;
  opacity: 0.9;
  font-size: 14px;
}

/* Tablet Styles */
@media (min-width: 768px) {
  .about-gallery {
    padding: 30px 25px 50px;
  }
  
  .gallery-container {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  .gallery-image {
    height: 180px;
  }
  
  main {
    padding: 100px 30px;
  }
  
  h1 {
    font-size: 42px;
    margin-bottom: 20px;
  }
  
  p {
    font-size: 16px;
    margin-bottom: 40px;
  }
  
  .about-section {
    padding: 35px 30px;
    margin: 30px 0;
  }
  
  .about-section h2 {
    font-size: 26px;
  }
  
  .team-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
    margin-top: 35px;
  }
  
  .values-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
    margin-top: 35px;
  }
  
  .lightbox-nav {
    width: 50px;
    height: 50px;
    font-size: 32px;
  }
  
  .lightbox-prev {
    left: -60px;
  }
  
  .lightbox-next {
    right: -60px;
  }
}

/* Desktop Styles */
@media (min-width: 1024px) {
  .gallery-container {
    grid-template-columns: repeat(5, 1fr);
    gap: 25px;
  }
  
  .gallery-image {
    height: 200px;
  }
  
  h1 {
    font-size: 48px;
  }
  
  .team-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .values-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .lightbox-nav {
    width: 60px;
    height: 60px;
    font-size: 36px;
  }
}

/* Small Mobile Optimization */
@media (max-width: 360px) {
  .about-gallery {
    padding: 15px 10px 30px;
  }
  
  .gallery-container {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .gallery-image {
    height: 140px;
    border-radius: 8px;
  }
  
  main {
    padding: 60px 15px;
  }
  
  h1 {
    font-size: 32px;
  }
  
  .about-section {
    padding: 20px 15px;
    margin: 20px 0;
  }
  
  .about-section h2 {
    font-size: 22px;
  }
  
  .lightbox-close {
    top: -40px;
    font-size: 28px;
    width: 36px;
    height: 36px;
  }
  
  .lightbox-nav {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }
  
  .lightbox-counter {
    font-size: 14px;
    bottom: -40px;
  }
}

/* Landscape Mode for Mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .about-gallery {
    padding: 15px 20px 30px;
  }
  
  .gallery-container {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .gallery-image {
    height: 120px;
  }
  
  .lightbox-content {
    max-height: 85vh;
  }
  
  .lightbox-image {
    max-height: 70vh;
  }
}

/* Touch Device Optimizations */
@media (hover: none) and (pointer: coarse) {
  .gallery-image:hover {
    transform: none;
  }
  
  .team-member:hover {
    transform: none;
  }
  
  .value-item:hover {
    transform: none;
  }
  
  .gallery-image:active {
    transform: scale(0.95);
  }
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.about-section,
.team-member,
.value-item,
.gallery-image {
  animation: fadeIn 0.6s ease forwards;
}

/* Stagger animation for gallery */
.gallery-image:nth-child(1) { animation-delay: 0.1s; }
.gallery-image:nth-child(2) { animation-delay: 0.2s; }
.gallery-image:nth-child(3) { animation-delay: 0.3s; }
.gallery-image:nth-child(4) { animation-delay: 0.4s; }
.gallery-image:nth-child(5) { animation-delay: 0.5s; }
</style>