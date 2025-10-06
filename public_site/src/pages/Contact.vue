<!-- Trang liên hệ -->
<template>
  <div class="contact-page">
    <Header />
    <main>
      <h1>Liên hệ</h1>
      <!-- <h3>Các chi nhánh</h3> -->
      <div class="branch">
        <p>Địa chỉ : 8386 Đường Trần phú, Hà Đông, Hà Nội - 0928 892 424</p>
        <!-- <div id="map1" class="map"></div> -->
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10536.785171582975!2d105.79011425679107!3d20.979961545318396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135accdd8a1ad71%3A0xa2f9b16036648187!2sPosts%20and%20Telecommunications%20Institute%20of%20Technology%20(PTIT)!5e0!3m2!1sen!2s!4v1743467363037!5m2!1sen!2s"
          width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
      <p>Email: <a href="mailto:contact@tinhhoaViet.com">contact@tinhhoaViet.com</a></p>
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
  mounted() {
    // Tải Google Maps API
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap'; // Thay YOUR_API_KEY
    script.async = true;
    document.head.appendChild(script);

    // Định nghĩa hàm initMap toàn cục
    window.initMap = this.initMap;
  },
  methods: {
    initMap() {
      // Chi nhánh 1: TP.HCM
      const branch1 = { lat: 10.7769, lng: 106.7009 }; // Tọa độ TP.HCM
      const map1 = new google.maps.Map(document.getElementById('map1'), {
        zoom: 15,
        center: branch1,
      });
      new google.maps.Marker({
        position: branch1,
        map: map1,
        title: 'Chi nhánh 1 - TP.HCM',
      });

      // Chi nhánh 2: Hà Nội
      const branch2 = { lat: 21.0278, lng: 105.8342 }; // Tọa độ Hà Nội
      const map2 = new google.maps.Map(document.getElementById('map2'), {
        zoom: 15,
        center: branch2,
      });
      new google.maps.Marker({
        position: branch2,
        map: map2,
        title: 'Chi nhánh 2 - Hà Nội',
      });
    },
  },
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

.map {
  width: 100%;
  height: 300px;
  margin-top: 20px;
  border-radius: 8px;
}
</style>