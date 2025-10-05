<template>
  <header>
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
  </header>
</template>

<script>
export default {
  name: 'Header',
};
</script>

<style scoped>
header {
  background-color: #ae9a64;
  padding: 10px 15px; /* Giảm padding để header nhỏ hơn */
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-logo {
  max-width: 40px; /* Giảm kích thước logo */
}

nav {
  flex-grow: 1; /* Nav vẫn chiếm không gian chính giữa */
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
  margin: 0 12px; /* Giảm khoảng cách giữa các mục */
}

nav ul li a {
  color: #2a2a2a;
  text-decoration: none;
  font-size: 13px; /* Giảm kích thước chữ */
  font-weight: bold;
  padding: 6px 12px; /* Giảm padding của link */
  border-radius: 5px;
  transition: all 0.3s ease;
}

nav ul li a:hover {
  color: #fff;
}

nav ul li a.active {
  background-color: #fff;
  color: #ae9a64;
}
</style>