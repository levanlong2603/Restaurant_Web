<!-- Trang giới thiệu -->
<template>
  <div class="about-page">
    <Header />
    <Hero />
    <About/>
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
};
</script>

<style scoped>
.about-page {
  background-color:  #1a1a1a;
  min-height: 100vh;
  color: #444;
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