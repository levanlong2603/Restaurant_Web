<template>
  <header>
    <div class="header-container">
      <!-- Logo -->
      <div class="logo">TINH HOA VIỆT</div>

      <!-- Navigation -->
      <nav>
        <ul>
          <li v-for="item in navItems" :key="item.path">
            <router-link :to="item.path" active-class="active" exact>{{ item.label }}</router-link>
          </li>
        </ul>
      </nav>

      <!-- User Actions -->
      <div class="user-actions">
        <div class="user-menu">
          <span class="user-name">Grace Campbell123</span>
          <button @click="toggleDropdown" class="dropdown-toggle">▼</button>
          <div v-if="showDropdown" class="dropdown-menu">
            <div class="dropdown-item">User profile</div>
            <div class="dropdown-item" @click="signOut">Sign out</div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
  export default {
    name: 'Header',
    data() {
      return {
        showDropdown: false,
      };
    },
    computed: {
      navItems() {
        const currentRoute = this.$route.path;
        if (currentRoute.startsWith('/manager')) {
          return [
            { label: 'MENU', path: '/manager/menu' },
          ];
        } else if (currentRoute.startsWith('/staff')) {
          return [
            { label: 'MENU', path: '/staff/menu' },
          ];
        }
        return [
          { label: 'MENU', path: '/menu' },
          { label: 'CONTACT', path: '/contact' },
        ];
      },
    },
    methods: {
      toggleDropdown() {
        this.showDropdown = !this.showDropdown;
      },
      signOut() {
        localStorage.removeItem('token');
        this.$router.push('/login');
      },
    },
  }; 
</script>

<style scoped>
  header {
    background-color: #ae9a64; /* Màu vàng ánh kim */
    padding: 15px 0;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 100;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Logo */
  .logo {
    font-size: 20px;
    font-weight: bold;
    text-transform: uppercase;
    color: #fff;
  }

  /* Navigation */
  nav ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  nav ul li {
    margin-left: 30px;
  }

  nav ul li a {
    color: #2a2a2a;
    text-decoration: none;
    font-size: 18px;
    font-weight: bold;
    padding: 8px 16px;
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

  /* User Actions */
  .user-actions {
    position: relative;
    display: flex;
    align-items: center;
  }

  .user-menu {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .user-name {
    color: #fff;
    font-size: 18px;
  }

  .dropdown-toggle {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
  }

  .dropdown-menu {
    position: absolute;
    top: 40px;
    right: 0;
    background: #2a3435; /* Màu nền tối */
    color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    width: 200px;
    z-index: 101;
  }

  .dropdown-item {
    padding: 10px;
    cursor: pointer;
    font-size: 18px;
  }

  .dropdown-item:hover {
    background: #ae6489ff; 
  }

  .dropdown-item.active {
    background: #ae6464ff; 
  }
</style>