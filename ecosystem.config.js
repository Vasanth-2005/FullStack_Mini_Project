module.exports = {
  apps: [
    {
      name: "lifecare-hospital",
      script: "./server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 80,
      }
    }
  ]
};
