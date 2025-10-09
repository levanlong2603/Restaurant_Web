<!-- Trang liên hệ -->
<template>
  <div class="contact-page">
    <Header />
    <main>
      <h1>Liên hệ</h1>
      <!-- <h3>Các chi nhánh</h3> -->
      <div class="branch">
        <p>Địa chỉ : Số 33, đường Đại Mỗ, phường Đại Mỗ, quận Nam Từ Liêm, TP. Hà Nội</p>
        <!-- Embedded Google Map for the exact address -->
        <div class="map-embed">
          <iframe
            title="Bản đồ - Số 33 Đại Mỗ"
            src="https://www.google.com/maps?q=S%E1%BB%91%2033,%20%C4%91%C6%B0%E1%BB%9Dng%20%C4%90%E1%BA%A1i%20M%E1%BB%93,%20ph%C6%B0%E1%BB%9Dng%20%C4%90%E1%BA%A1i%20M%E1%BB%93,%20Qu%E1%BA%ADn%20Nam%20T%E1%BB%AB%20Li%C3%AAm,%20H%C3%A0%20N%E1%BB%99i&output=embed"
            width="100%" height="450" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <div style="margin-top:12px;">
          <a class="open-map-btn" href="https://www.google.com/maps/search/?api=1&query=S%E1%BB%91%2033%2C%20%C4%91%C6%B0%E1%BB%9Dng%20%C4%90%E1%BA%A1i%20M%E1%BB%93%2C%20ph%C6%B0%E1%BB%9Dng%20%C4%90%E1%BA%A1i%20M%E1%BB%93%2C%20Qu%E1%BA%ADn%20Nam%20T%E1%BB%AB%20Li%C3%AAm%2C%20H%C3%A0%20N%E1%BB%99i" target="_blank" rel="noopener">Mở bản đồ</a>
        </div>
      </div>
      <p>Email: <a href="mailto:contact@tinhhoaViet.com">nhahangtinhhoaviet@gmail.com</a></p>
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
  background-color: #c2aa77;
  min-height: 100vh;
  color: #ffffff;
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
  color: #fbcf67;
  text-shadow: 0 0 5px #fbcf67, 0 0 30px #fbcf67;
}

h3 {
  font-size: 24px;
  color: #fbcf67;
  margin-bottom: 20px;
}


.branch {
  margin-bottom: 40px;
}

p {
  font-size: 16px;
  color: #fbcf67;
  margin: 10px 0;
}

a {
  color: #fbcf67;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.open-map-btn {
  display: inline-block;
  background: #fbcf67;
  color: #2b2b2b;
  padding: 8px 14px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
}
.open-map-btn:hover { opacity: 0.9; }

.map {
  width: 100%;
  height: 300px;
  margin-top: 20px;
  border-radius: 8px;
}
</style>