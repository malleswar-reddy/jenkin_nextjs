module.exports = {
  apps: [
    {
      name: "hello-qa",
      script: "npm",
      args: "run start:qa",
      env: { NODE_ENV: "development" }
    },
    {
      name: "hello-prod",
      script: "npm",
      args: "run start:prod",
      env: { NODE_ENV: "production" }
    }
  ]
};