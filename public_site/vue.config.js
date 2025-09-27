// public_site/vue.config.js
module.exports = {
    devServer: {
      port: 8080, // Đảm bảo public_site chạy trên cổng 8080
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