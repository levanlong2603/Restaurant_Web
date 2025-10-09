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
  background-color:  #c2aa77;
  min-height: 100vh;
  color: #444;
}

/* Gallery styles */
.about-gallery {
  max-width: 1100px;
  margin: 30px auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  padding: 0 20px 40px;
}
.about-gallery img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

/* main {
  max-width: 800px;
  margin: 0 auto;
  padding: 100px 20px;
  text-align: center;
}

h1 {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #666 ;
}

p {
  font-size: 16px;
  color: #666;
  margin-bottom: 40px;
}

.dish-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
} */
</style>