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
  background-color: #c2aa77; 
  overflow-x: hidden; 
  font-family: Arial, sans-serif;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #c2aa77;
}
</style>
<script>
export default {
  name: 'App'
};
</script>