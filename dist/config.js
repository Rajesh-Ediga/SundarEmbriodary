window.SUNDAR_CONFIG = Object.freeze({
  mode: 'demo',
  apiBaseUrl: ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:5251/api'
    : 'https://REPLACE-WITH-PUBLIC-API-URL/api',
  whatsappNumber: '919849946388'
});
