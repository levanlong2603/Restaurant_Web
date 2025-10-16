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
        <h1>{{ currentContent.title }}</h1>
        <h2>{{ currentContent.subtitle }}</h2>
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
          { url: hero1, title: this.$t('heroSlides.slide1.title') || 'Tinh Hoa Việt', subtitle: this.$t('heroSlides.slide1.subtitle') || 'Dấu ấn Việt - Tròn vị quê hương' },
          { url: hero2, title: this.$t('heroSlides.slide2.title') || 'Hương Vị Quê', subtitle: this.$t('heroSlides.slide2.subtitle') || 'Hương vị truyền thống – Đậm đà bản sắc' },
          { url: hero3, title: this.$t('heroSlides.slide3.title') || 'Thực Đơn Đặc Sắc', subtitle: this.$t('heroSlides.slide3.subtitle') || 'Món ngon mỗi ngày – Phục vụ tận tâm' }
        ],
        currentIndex: 0
      };
    },
    computed: {
      currentContent() {
        return {
          title: this.images[this.currentIndex].title,
          subtitle: this.images[this.currentIndex].subtitle
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
    height: 100vh;
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
    color: #fbcf67;
    height: 100vh;
    width: 100vw;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .hero-content h1 {
    font-size: 8rem;
    font-weight: 1500px;
    margin-bottom: 1rem;
    transition: opacity 0.5s ease; /* Thêm transition cho nội dung */
  }
  
  .hero-content h2 {
    font-size: 1.5rem;
    font-weight: 3500px;
    transition: opacity 0.5s ease; /* Thêm transition cho nội dung */
  }

  
  </style>