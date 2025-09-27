// internal_site/admin/vue.config.js
module.exports = {
  devServer: {
    port: 8081, // Đảm bảo admin chạy trên cổng 8081
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
};