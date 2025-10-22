<template>
  <header :class="{ scrolled: isScrolled }">
    <div class="header-container">
      <!-- Logo -->
      <div class="logo-container">
        <img
          src="@/assets/images/Logo.png"
          alt="Logo Nhà hàng Long Quân An"
          class="header-logo"
        />
      </div>

      <!-- Menu cho desktop -->
      <nav class="desktop-nav">
        <ul>
          <li><router-link to="/" active-class="active">{{ $t('header.home') }}</router-link></li>
          <li><router-link to="/menu" active-class="active">{{ $t('header.menu') }}</router-link></li>
          <li><router-link to="/reservation" active-class="active">{{ $t('header.reservation') }}</router-link></li>
          <li><router-link to="/contact" active-class="active">{{ $t('header.contact') }}</router-link></li>
        </ul>
      </nav>

      <!-- Menu cho mobile -->
      <div class="mobile-nav">
        <button class="menu-toggle" @click="toggleMobileMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div class="mobile-menu" :class="{ 'active': isMobileMenuOpen }">
          <ul>
            <li><router-link to="/" active-class="active" @click="closeMobileMenu">{{ $t('header.home') }}</router-link></li>
            <li><router-link to="/menu" active-class="active" @click="closeMobileMenu">{{ $t('header.menu') }}</router-link></li>
            <li><router-link to="/reservation" active-class="active" @click="closeMobileMenu">{{ $t('header.reservation') }}</router-link></li>
            <li><router-link to="/contact" active-class="active" @click="closeMobileMenu">{{ $t('header.contact') }}</router-link></li>
          </ul>
        </div>
      </div>

      <!-- Nút chuyển ngôn ngữ -->
      <div class="header-actions">
        <button type="button" class="lang-switch" @click="toggleLanguage">
          {{ language === 'vi' ? 'EN' : 'VI' }}
        </button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      isScrolled: false,
      isMobileMenuOpen: false,
      currentLang: (localStorage.getItem('lang')) || ((this.$i18n && this.$i18n.locale) ? (this.$i18n.locale.value || this.$i18n.locale) : 'vi'),
    };
  },
  computed: {
    language() {
      return this.currentLang
    }
  },
  methods: {
    toggleLanguage() {
      // compute next language
      const current = localStorage.getItem('lang') || (this.currentLang || 'vi')
      const next = current === 'vi' ? 'en' : 'vi'

      // persist and update local reactive copy
      localStorage.setItem('lang', next)
      this.currentLang = next

      // Emit single source-of-truth event; main.js listener will update i18n.global.locale
      try {
        window.dispatchEvent(new CustomEvent('lang-changed', { detail: next }));
      } catch (e) {
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('lang-changed', true, true, next);
        window.dispatchEvent(evt);
      }
      // Reload the page so the whole site fully reflects the new language immediately
      try {
        window.location.reload()
      } catch (err) {
        // ignore if reload not permitted
        console.warn('Could not reload page after language change', err)
      }
    },
    handleScroll() {
      this.isScrolled = window.scrollY > 20;
    },
    // xử lý khi event lang-changed được phát từ bên ngoài
    onExternalLangChanged(e) {
      const newLang = e && e.detail ? e.detail : null;
      if (newLang) {
        try {
          if (this.$i18n && this.$i18n.locale && typeof this.$i18n.locale === 'object' && 'value' in this.$i18n.locale) {
            this.$i18n.locale.value = newLang
          } else if (this.$i18n) {
            this.$i18n.locale = newLang
          }
        } catch (err) {
          localStorage.setItem('lang', newLang)
        }
        // also update local reactive copy so template changes
        this.currentLang = newLang
      }
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    }
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
  position: relative;
}

/* ===== LOGO ===== */
.logo-container {
  flex-shrink: 0;
}

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

/* ===== NAVIGATION DESKTOP ===== */
.desktop-nav {
  display: flex;
  justify-content: center;
  flex-grow: 1;
}

.desktop-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.desktop-nav ul li {
  margin: 0 15px;
  position: relative;
}

.desktop-nav ul li a {
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

.desktop-nav ul li a:hover {
  color: #fff8e7;
  background-color: rgba(231, 194, 125, 0.2);
  border: 1px solid #e7c27d;
  transform: translateY(-2px);
}

.desktop-nav ul li a.active {
  color: #fff8e7;
  background: linear-gradient(135deg, #e7c27d 0%, #8b5e3c 100%);
  font-weight: 700;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  box-shadow: 0 2px 8px rgba(107, 66, 38, 0.4);
  border: 1px solid #fff8e7;
}

/* ===== NAVIGATION MOBILE ===== */
.mobile-nav {
  display: none;
}

.menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 24px;
  padding: 0;
}

.menu-toggle span {
  display: block;
  height: 3px;
  width: 100%;
  background-color: #e7c27d;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: rgba(107, 66, 38, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: translateY(-10px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1001;
}

.mobile-menu.active {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.mobile-menu ul {
  list-style: none;
  margin: 0;
  padding: 20px;
}

.mobile-menu ul li {
  margin-bottom: 15px;
}

.mobile-menu ul li:last-child {
  margin-bottom: 0;
}

.mobile-menu ul li a {
  color: #e7c27d;
  text-decoration: none;
  font-size: 18px;
  font-weight: 600;
  padding: 12px 16px;
  border-radius: 6px;
  display: block;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.mobile-menu ul li a:hover,
.mobile-menu ul li a.active {
  color: #fff8e7;
  background: rgba(231, 194, 125, 0.2);
  border: 1px solid #e7c27d;
}

/* ===== NÚT CHUYỂN NGÔN NGỮ ===== */
.header-actions {
  flex-shrink: 0;
}

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

/* ===== RESPONSIVE - CHỈ TRÊN MOBILE ===== */
@media (max-width: 992px) {
  .desktop-nav {
    display: none;
  }
  
  .mobile-nav {
    display: block;
  }
  
  /* Layout mobile: Logo giữa, Menu trái, Ngôn ngữ phải */
  .header-container {
    justify-content: space-between;
  }
  
  .logo-container {
    order: 2;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .mobile-nav {
    order: 1;
  }
  
  .header-actions {
    order: 3;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 15px;
  }
  
  .header-logo {
    max-width: 45px;
  }
  
  .lang-switch {
    font-size: 14px;
    padding: 5px 12px;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0 10px;
  }
  
  .header-logo {
    max-width: 40px;
  }
  
  .lang-switch {
    font-size: 13px;
    padding: 4px 10px;
  }
  
  .mobile-menu ul li a {
    font-size: 16px;
    padding: 10px 14px;
  }
}
</style>