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
    background: linear-gradient(135deg, #c2aa77 0%, #b29a67 100%);
    padding: 15px 0;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-bottom: 2px solid #fbcf67;
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
    color: #2b2b2b;
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
    color: #2b2b2b;
    text-decoration: none;
    font-size: 18px;
    font-weight: bold;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  nav ul li a:hover {
    color: #2b2b2b;
    background-color: rgba(251, 207, 103, 0.3);
    transform: translateY(-2px);
  }

  nav ul li a.active {
    background-color: #fbcf67;
    color: #2b2b2b;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
    color: #2b2b2b;
    font-size: 18px;
    font-weight: 500;
  }

  .dropdown-toggle {
    background: none;
    border: none;
    color: #2b2b2b;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
  }

  .dropdown-toggle:hover {
    color: #2b2b2b;
    transform: translateY(-1px);
  }

  .dropdown-menu {
    position: absolute;
    top: 40px;
    right: 0;
    background: linear-gradient(135deg, #c2aa77, #b29a67);
    color: #2b2b2b;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    width: 200px;
    z-index: 101;
    border: 1px solid rgba(251, 207, 103, 0.3);
  }

  .dropdown-item {
    padding: 12px 15px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease;
    border-bottom: 1px solid rgba(251, 207, 103, 0.3);
  }

  .dropdown-item:last-child {
    border-bottom: none;
  }

  .dropdown-item:hover {
    background: rgba(251, 207, 103, 0.4);
    color: #2b2b2b;
  }

  .dropdown-item.active {
    background: rgba(251, 207, 103, 0.5);
    color: #2b2b2b;
  }
</style>