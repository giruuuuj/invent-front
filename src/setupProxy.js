// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/invent',
    createProxyMiddleware({
      target: 'http://localhost:9191',
      changeOrigin: true,
      secure: false,
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('Access-Control-Allow-Origin', 'http://localhost:3131');
        proxyReq.setHeader('Access-Control-Allow-Credentials', 'true');
      },
      onProxyRes: (proxyRes, req, res) => {
        proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:3131';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      }
    })
  );
};