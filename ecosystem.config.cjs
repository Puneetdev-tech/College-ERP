module.exports = {
  apps: [
    {
      name: "college-erp-backend",
      cwd: "./backend",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      },
      watch: false
    },
    {
      name: "college-erp-frontend",
      cwd: "./frontend",
      script: "node_modules/vite/bin/vite.js",
      args: "--host",
      watch: false
    }
  ]
};
