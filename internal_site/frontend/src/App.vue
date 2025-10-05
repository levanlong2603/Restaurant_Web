<!-- src/App.vue -->
<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<style>
/* Reset CSS */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #2a2a2a; 
  overflow-x: hidden; 
  font-family: Arial, sans-serif;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #2a2a2a;
}
</style>

<script>
export default {
  name: 'App'
};
</script>