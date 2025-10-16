<template>
  <header :class="{ scrolled: isScrolled }">
    <div class="header-container">
      <!-- Logo -->
      <img
        src="@/assets/images/Logo.png"
        alt="Logo Nhà hàng Long Quân An"
        class="header-logo"
      />

      <!-- Menu -->
      <nav>
        <ul>
          <li><router-link to="/" active-class="active">{{ t('intro') }}</router-link></li>
          <li><router-link to="/menu" active-class="active">{{ t('menu') }}</router-link></li>
          <li><router-link to="/reservation" active-class="active">{{ t('reservation') }}</router-link></li>
          <li><router-link to="/contact" active-class="active">{{ t('contact') }}</router-link></li>
        </ul>
      </nav>

      <!-- Nút chuyển ngôn ngữ -->
      <button class="lang-switch" @click="toggleLanguage">
        {{ language === 'vi' ? 'EN' : 'VI' }}
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      language: localStorage.getItem('lang') || 'vi',
      isScrolled: false,
      translations: {
        vi: {
          intro: 'GIỚI THIỆU',
          menu: 'THỰC ĐƠN',
          reservation: 'ĐẶT BÀN',
          contact: 'LIÊN HỆ',
        },
        en: {
          intro: 'ABOUT',
          menu: 'MENU',
          reservation: 'RESERVATION',
          contact: 'CONTACT',
        },
      },
    };
  },
  methods: {
    toggleLanguage() {
      this.language = this.language === 'vi' ? 'en' : 'vi';
      localStorage.setItem('lang', this.language);

      // Phát sự kiện toàn cục để các trang khác có thể lắng nghe
      try {
        window.dispatchEvent(new CustomEvent('lang-changed', { detail: this.language }));
      } catch (e) {
        // fallback: tạo và phát event theo cách cũ nếu cần
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('lang-changed', true, true, this.language);
        window.dispatchEvent(evt);
      }
    },
    t(key) {
      return this.translations[this.language][key];
    },
    handleScroll() {
      this.isScrolled = window.scrollY > 20;
    },
    // mới: xử lý khi event lang-changed được phát từ bên ngoài
    onExternalLangChanged(e) {
      const newLang = e && e.detail ? e.detail : null;
      if (newLang && newLang !== this.language) {
        this.language = newLang;
        localStorage.setItem('lang', this.language);
      }
    },
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);

    // Lắng nghe thay đổi ngôn ngữ toàn cục
    window.addEventListener('lang-changed', this.onExternalLangChanged);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);

    // Hủy lắng nghe event ngôn ngữ
    window.removeEventListener('lang-changed', this.onExternalLangChanged);
  },
};
</script>

<style scoped>
/* ===== HEADER ===== */
header {
  background: linear-gradient(135deg, #6b4226 0%, #8b5e3c 100%);
  padding: 8px 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(107, 66, 38, 0.3);
  border-bottom: 2px solid #e7c27d;
  font-family: 'Arial', Tahoma, Geneva, Verdana, sans-serif;
  transition: all 0.3s ease;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

/* ===== LOGO ===== */
.header-logo {
  max-width: 50px;
  border: 2px solid #e7c27d;
  border-radius: 8px;
  padding: 2px;
  background: #fff8e7;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.header-logo:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(231, 194, 125, 0.3);
}

/* ===== NAVIGATION ===== */
nav {
  flex-grow: 1;
  display: flex;
  justify-content: center;
}

nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

nav ul li {
  margin: 0 15px;
  position: relative;
}

nav ul li a {
  color: #e7c27d;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.3px;
  display: block;
  border: 1px solid transparent;
}

nav ul li a:hover {
  color: #fff8e7;
  background-color: rgba(231, 194, 125, 0.2);
  border: 1px solid #e7c27d;
  transform: translateY(-2px);
}

nav ul li a.active {
  color: #fff8e7;
  background: linear-gradient(135deg, #e7c27d 0%, #8b5e3c 100%);
  font-weight: 700;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  box-shadow: 0 2px 8px rgba(107, 66, 38, 0.4);
  border: 1px solid #fff8e7;
}


/* ===== NÚT CHUYỂN NGÔN NGỮ ===== */
.lang-switch {
  background: rgba(231, 194, 125, 0.15);
  border: 1px solid #e7c27d;
  color: #e7c27d;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.lang-switch:hover {
  background: rgba(231, 194, 125, 0.3);
  color: #fff8e7;
  transform: translateY(-1px);
}

/* ===== SCROLL EFFECT ===== */
header.scrolled {
  padding: 5px 0;
  background: rgba(107, 66, 38, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 10px rgba(107, 66, 38, 0.4);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 8px;
    padding: 10px 20px;
  }

  .header-logo {
    max-width: 45px;
  }

  nav ul {
    flex-wrap: wrap;
    justify-content: center;
  }

  nav ul li {
    margin: 5px 10px;
  }

  nav ul li a {
    font-size: 14px;
    padding: 8px 12px;
  }

  .lang-switch {
    font-size: 13px;
    padding: 5px 10px;
  }
}

@media (max-width: 480px) {
  nav ul li a {
    font-size: 13px;
    padding: 6px 10px;
  }

  header {
    padding: 5px 0;
  }
}
</style>
