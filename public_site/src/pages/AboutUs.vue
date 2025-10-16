<!-- Trang giới thiệu -->
<template>
  <div class="about-page">
    <Header />
    <Hero />
    <About/>
    <!-- Image gallery -->
    <section class="about-gallery">
      <img v-for="(img, idx) in galleryImages" :key="idx" :src="require(`@/assets/images/${img}`)" :alt="`Gallery ${idx+1}`" />
    </section>
    <Chatbot />
    <Footer />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Hero from '@/components/Hero.vue';
import About from '@/components/AboutUs.vue';
import ReservationForm from '@/components/ReservationForm.vue';
import Footer from '@/components/Footer.vue';
import Chatbot from '@/components/Chatbot.vue'; 


// import dishImage from '@/assets/images/hero2.jpg'; // Đảm bảo ảnh tồn tại trong assets/images

export default {
  name: 'AboutUs', // Đổi tên thành AboutUs để khớp với nội dung
  components: {
    Header,
    Hero,
    About,
    ReservationForm,
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
    };
  },
};
</script>

<style scoped>
.about-page {
  background-color: #FFF8E7; /* Trắng kem */
  min-height: 100vh;
  color: #3B2F2F; /* Đen nâu */
}

/* Gallery styles */
.about-gallery {
  max-width: 1100px;
  margin: 30px auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  padding: 0 20px 40px;
}

.about-gallery img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.2); /* Bóng nâu */
  border: 2px solid #E7C27D; /* Viền vàng nhạt */
  transition: all 0.3s ease;
}

.about-gallery img:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(107, 66, 38, 0.3);
  border-color: #8B5E3C; /* Viền nâu gỗ khi hover */
}

/* Main content styles */
main {
  max-width: 800px;
  margin: 0 auto;
  padding: 100px 20px;
  text-align: center;
}

h1 {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #6B4226; /* Nâu đất */
  text-shadow: 0 0 5px #E7C27D, 0 0 30px #E7C27D; /* Hiệu ứng vàng */
  font-family: 'Playfair Display', serif;
}

p {
  font-size: 16px;
  color: #3B2F2F; /* Đen nâu */
  margin-bottom: 40px;
  line-height: 1.6;
  font-weight: 500;
}

.dish-image {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  border: 3px solid #8B5E3C; /* Viền nâu gỗ */
  box-shadow: 0 8px 25px rgba(107, 66, 38, 0.3);
  margin: 20px 0;
}

/* Section styling */
.about-section {
  background: rgba(231, 194, 125, 0.1); /* Nền vàng nhạt trong suốt */
  padding: 40px;
  border-radius: 12px;
  margin: 30px 0;
  border: 1px solid rgba(231, 194, 125, 0.3);
  backdrop-filter: blur(5px);
}

.about-section h2 {
  color: #6B4226; /* Nâu đất */
  font-size: 28px;
  margin-bottom: 20px;
  font-weight: 700;
}

.about-section p {
  color: #3B2F2F; /* Đen nâu */
  font-size: 16px;
  opacity: 0.9;
}

/* Team section */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.team-member {
  background: rgba(255, 255, 255, 0.9);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.1);
  border: 1px solid #E7C27D;
  transition: all 0.3s ease;
}

.team-member:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(107, 66, 38, 0.2);
}

.team-member h3 {
  color: #6B4226;
  margin-bottom: 10px;
  font-weight: 600;
}

.team-member p {
  color: #3B2F2F;
  opacity: 0.8;
  margin-bottom: 0;
}

/* Values section */
.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 25px;
  margin-top: 40px;
}

.value-item {
  padding: 25px;
  background: linear-gradient(135deg, #8B5E3C, #6B4226);
  color: #FFF8E7;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
}

.value-item:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(107, 66, 38, 0.4);
}

.value-item h3 {
  color: #E7C27D;
  margin-bottom: 10px;
  font-size: 20px;
}

.value-item p {
  color: #F5E3B3; /* Be nhạt */
  margin-bottom: 0;
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  main {
    padding: 80px 20px;
  }
  
  h1 {
    font-size: 36px;
  }
  
  .about-gallery {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
  }
  
  .about-gallery img {
    height: 140px;
  }
  
  .about-section {
    padding: 25px;
  }
  
  .team-grid,
  .values-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 28px;
  }
  
  .about-gallery {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .about-gallery img {
    height: 120px;
  }
  
  .about-section {
    padding: 20px;
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
.value-item {
  animation: fadeIn 0.6s ease forwards;
}

.about-section:nth-child(1) { animation-delay: 0.2s; }
.about-section:nth-child(2) { animation-delay: 0.4s; }
.about-section:nth-child(3) { animation-delay: 0.6s; }
</style>