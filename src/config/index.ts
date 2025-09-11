import { config } from 'dotenv';

config();

const Config = {
  //config app express and jwt secret
  port: process.env.PORT,
  secret: process.env.AUTH_JWT_SECRET || '',
  dev: process.env.NODE_ENV !== 'production',
  //DB
  hostDB: process.env.HOST_DB || '',
  userDB: process.env.USER_DB || '',
  portDB: process.env.PORT_DB || '',
  nameDB: process.env.NAME_DB || '',
  PasswordDB: process.env.PASSWORD_DB || '',
  urlDB: process.env.URL_DB || '',
  //JWT
  jwtSecret: process.env.JWT_SECRET || 'default_secret',
  jwtExpires: process.env.JWT_EXPIRES_IN,
  //Urls
  urlFront: process.env.URL_FRONT || '*',
  urlBack: process.env.URL_BACK,
};

export default Config;
