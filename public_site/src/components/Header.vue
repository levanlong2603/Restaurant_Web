<template>
  <header>
    <div class="header-container">
      <img src="@/assets/images/Logo.png" alt="Logo Nhà hàng Tinh Hoa Việt" class="header-logo" />
      <nav>
        <ul>
          <li>
            <router-link to="/" active-class="active">GIỚI THIỆU</router-link>
          </li>
          <li>
            <router-link to="/menu" active-class="active">THỰC ĐƠN</router-link>
          </li>
          <li>
            <router-link to="/reservation" active-class="active">ĐẶT BÀN</router-link>
          </li>
          <li>
            <router-link to="/contact" active-class="active">LIÊN HỆ</router-link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
};
</script>

<style scoped>
header {
  background: linear-gradient(135deg, #ae8346 0%, #8a6632 100%);
  padding: 8px 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-bottom: 2px solid #7a5429;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-logo {
  max-width: 50px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

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
}

nav ul li a {
  color: #fff;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.3px;
  display: block;
  font-family: inherit;
}

nav ul li a:hover {
  color: #f8f8f8;
  background-color: rgba(255, 255, 255, 0.1);
}

nav ul li a.active {
  color: #ffeb3b; /* Màu vàng nổi bật */
  font-weight: 700;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  /* Không có background, không có border, không có gạch chân */
}

/* Responsive cho màn hình nhỏ */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    padding: 10px 20px;
  }
  
  .header-logo {
    margin-bottom: 10px;
  }
  
  nav ul li {
    margin: 0 8px;
  }
  
  nav ul li a {
    font-size: 14px;
    padding: 8px 12px;
  }
}

@media (max-width: 480px) {
  nav ul {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  nav ul li {
    margin: 5px;
  }
  
  nav ul li a {
    font-size: 13px;
    padding: 6px 10px;
  }
}
</style>