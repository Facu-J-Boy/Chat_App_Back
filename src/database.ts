import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import { Dialect } from 'sequelize';
import Config from './config';
// import {

// } from './models';

const { dev, nameDB, userDB, PasswordDB, hostDB, portDB, urlDB } =
  Config;

// Define el dialecto como tipo 'Dialect'
const dialect: Dialect = 'mysql';

// Configuración compartida
const commonConfig = {
  dialect: dialect,
  logging: false,
  timezone: '-05:00',
  models: [],
};

const dbConfig = dev
  ? {
      database: nameDB,
      username: userDB,
      password: PasswordDB,
      host: hostDB,
      port: +portDB,
      ...commonConfig,
    }
  : {
      ...commonConfig,
      url: urlDB,
    };

// Crear la instancia de Sequelize
const db = new Sequelize(dbConfig);

db.sync({ alter: true });

export default db;
