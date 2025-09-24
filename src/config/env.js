require('dotenv').config();

const required = ['CENTRAL_MONGO_URI', 'MONGO_URI_TEMPLATE', 'JWT_SECRET'];

for (const k of required) {
  if (!process.env[k]) {
    console.warn(`Warning: environment variable ${k} is not set.`);
  }
}

module.exports = {
  PORT: process.env.PORT || 3000,
  CENTRAL_MONGO_URI: process.env.CENTRAL_MONGO_URI,
  MONGO_URI_TEMPLATE: process.env.MONGO_URI_TEMPLATE,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
};
