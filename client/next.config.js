module.exports = {
  env: {
    PORT: process.env.PORT,
    HOST: process.env.HOST,
    SECRET: process.env.SECRET
  },
  experimental: {
    trailingSlash: true
  }
};

