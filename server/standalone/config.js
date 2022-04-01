// env vars
// VITE_SOCKET_HOST (the host the front end uses to connect to the socket server e.g. localhost:8888 or 500.legit.nz
export default {
  serverPort: process.env.SERVER_PORT || 80,
  sslKeyPath: process.env.HTTPS_KEY_PATH || null,
  sslCertPath: process.env.HTTPS_CERT_PATH || null,
};