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
  background-color: #f3f2f2; 
  overflow-x: hidden; 
  font-family: Arial, sans-serif;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #f3efef;
}
</style>

<script>
export default {
  name: 'App'
};
</script>