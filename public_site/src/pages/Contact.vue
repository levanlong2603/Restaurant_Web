<!-- Trang liên hệ -->
<template>
  <div class="contact-page">
    <Header />
    <main>
  <h1>{{ $t('contact.title') }}</h1>
      <!-- <h3>Các chi nhánh</h3> -->
      <div class="branch">
  <p>{{ $t('contact.address') }}</p>
        <!-- Embedded Google Map for the exact address -->
        <div class="map-embed">
          <iframe
            title="Bản đồ - Số 33 Đại Mỗ"
            src="https://www.google.com/maps?q=S%E1%BB%91%2033,%20%C4%91%C6%B0%E1%BB%9Dng%20%C4%90%E1%BA%A1i%20M%E1%BB%93,%20ph%C6%B0%E1%BB%9Dng%20%C4%90%E1%BA%A1i%20M%E1%BB%93,%20Qu%E1%BA%ADn%20Nam%20T%E1%BB%AB%20Li%C3%AAm,%20H%C3%A0%20N%E1%BB%99i&output=embed"
            width="100%" height="450" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <div style="margin-top:12px;">
          <a class="open-map-btn" href="https://www.google.com/maps/search/?api=1&query=S%E1%BB%91%2033%2C%20%C4%91%C6%B0%E1%BB%9Dng%20%C4%90%E1%BA%A1i%20M%E1%BB%93%2C%20ph%C6%B0%E1%BB%9Dng%20%C4%90%E1%BA%A1i%20M%E1%BB%93%2C%20Qu%E1%BA%ADn%20Nam%20T%E1%BB%AB%20Li%C3%AAm%2C%20H%C3%A0%20N%E1%BB%99i" target="_blank" rel="noopener">{{ $t('contact.openMap') }}</a>
        </div>
      </div>
  <p>Email: <a :href="`mailto:${$t('contact.email')}`">{{ $t('contact.email') }}</a></p>
    </main>
    <Footer />
    <Chatbot />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import Chatbot from '@/components/Chatbot.vue'; 

export default {
  name: 'Contact',
  components: { 
    Header, 
    Footer,
    Chatbot,
  },
  // No mounted/initMap needed because we use an embedded iframe for the map
  methods: {},
};
</script>

<style scoped>
.contact-page {
  background-color: #FFF8E7; /* Trắng kem */
  min-height: 100vh;
  color: #3B2F2F; /* Đen nâu */
}

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
  text-shadow: 0 0 5px #E7C27D, 0 0 30px #E7C27D; /* Hiệu ứng vàng nhạt */
  font-family: 'Arial', serif;
}

h3 {
  font-size: 24px;
  color: #8B5E3C; /* Nâu gỗ */
  margin-bottom: 20px;
  font-weight: 600;
}

.branch {
  margin-bottom: 40px;
  padding: 30px;
  background: rgba(231, 194, 125, 0.1); /* Nền vàng nhạt trong suốt */
  border-radius: 12px;
  border: 1px solid rgba(231, 194, 125, 0.3);
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.1);
  transition: all 0.3s ease;
}

.branch:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(107, 66, 38, 0.2);
  background: rgba(231, 194, 125, 0.15);
}

p {
  font-size: 16px;
  color: #3B2F2F; /* Đen nâu */
  margin: 10px 0;
  font-weight: 500;
}

.contact-info {
  margin: 20px 0;
}

.contact-info p {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 15px 0;
}

.contact-info i {
  color: #8B5E3C; /* Nâu gỗ */
  font-size: 18px;
  width: 20px;
}

a {
  color: #8B5E3C; /* Nâu gỗ */
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

a:hover {
  color: #6B4226; /* Nâu đất */
  text-decoration: underline;
  transform: translateY(-1px);
}

.open-map-btn {
  display: inline-block;
  background: linear-gradient(135deg, #E7C27D 0%, #8B5E3C 100%); /* Gradient vàng đến nâu */
  color: #FFF8E7; /* Trắng kem */
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  border: 2px solid #FFF8E7;
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.3);
  transition: all 0.3s ease;
  margin-top: 15px;
}

.open-map-btn:hover {
  background: linear-gradient(135deg, #FFF8E7 0%, #E7C27D 100%); /* Gradient trắng đến vàng */
  color: #6B4226; /* Nâu đất */
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(231, 194, 125, 0.4);
  text-decoration: none;
}

.map {
  width: 100%;
  height: 300px;
  margin-top: 20px;
  border-radius: 12px;
  border: 2px solid #E7C27D; /* Viền vàng nhạt */
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.2);
}

/* Contact form section */
.contact-form-section {
  background: rgba(139, 94, 60, 0.1); /* Nâu gỗ trong suốt */
  padding: 40px;
  border-radius: 12px;
  margin: 40px 0;
  border: 1px solid rgba(139, 94, 60, 0.3);
}

.contact-form-section h3 {
  color: #6B4226; /* Nâu đất */
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  color: #3B2F2F; /* Đen nâu */
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #8B5E3C; /* Nâu gỗ */
  border-radius: 8px;
  background: rgba(255, 248, 231, 0.8); /* Trắng kem trong suốt */
  color: #3B2F2F; /* Đen nâu */
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #E7C27D; /* Vàng nhạt */
  box-shadow: 0 0 0 3px rgba(231, 194, 125, 0.3);
  background: #FFF8E7; /* Trắng kem */
}

.submit-btn {
  background: linear-gradient(135deg, #8B5E3C 0%, #6B4226 100%); /* Gradient nâu */
  color: #FFF8E7; /* Trắng kem */
  padding: 15px 40px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.3);
}

.submit-btn:hover {
  background: linear-gradient(135deg, #6B4226 0%, #8B5E3C 100%); /* Gradient nâu đảo ngược */
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 66, 38, 0.4);
}

/* Social media links */
.social-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #E7C27D 0%, #8B5E3C 100%);
  border-radius: 50%;
  color: #FFF8E7;
  font-size: 20px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 2px solid #FFF8E7;
}

.social-link:hover {
  transform: translateY(-3px) scale(1.1);
  background: linear-gradient(135deg, #FFF8E7 0%, #E7C27D 100%);
  color: #6B4226;
  text-decoration: none;
}

/* Responsive */
@media (max-width: 768px) {
  main {
    padding: 80px 20px;
  }
  
  h1 {
    font-size: 36px;
  }
  
  h3 {
    font-size: 20px;
  }
  
  .branch {
    padding: 20px;
  }
  
  .contact-form-section {
    padding: 25px;
  }
  
  .social-links {
    gap: 15px;
  }
  
  .social-link {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 28px;
  }
  
  h3 {
    font-size: 18px;
  }
  
  .branch {
    padding: 15px;
  }
  
  .contact-form-section {
    padding: 20px;
  }
  
  .open-map-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
}

/* Animation */
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

.branch,
.contact-form-section {
  animation: fadeInUp 0.6s ease forwards;
}

.branch:nth-child(1) { animation-delay: 0.2s; }
.branch:nth-child(2) { animation-delay: 0.4s; }
.contact-form-section { animation-delay: 0.6s; }
</style>