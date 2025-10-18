import express, { Application } from 'express';
import Config from '../config';
import db from '../database';
import http from 'http';
import { ApiPaths } from '../routes';
import https from 'https';
import morgan from 'morgan';
import cors from 'cors';
import { optionCors } from '../config/corsConfig';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { typeDefs } from '../graphql/typeDefs';
import { resolvers } from '../graphql/resolvers';
import User from './user.model';
import jwt from 'jsonwebtoken';

class Server {
  private app: Application;
  private port: string | number;
  private server: http.Server;
  private apolloServer!: ApolloServer;

  constructor() {
    this.app = express();
    this.port = Config.port || 3000;
    this.server = http.createServer(this.app);

    this.dbConnection();
    this.middleware();
    this.routes(); // Añadir la configuración de sockets
    this.graphql();
  }

  async dbConnection(retries = 5, delay = 5000) {
    while (retries) {
      try {
        await db.authenticate();
        console.log('Database online');
        break;
      } catch (error) {
        console.error('Database connection error:', error);
        retries -= 1;
        console.log(`Retries left: ${retries}`);
        if (!retries)
          throw new Error(
            'Unable to connect to the database after multiple attempts.'
          );
        await new Promise((res) => setTimeout(res, delay)); // Espera antes de reintentar
      }
    }
  }

  async middleware() {
    this.app.use(cors(optionCors));
    this.app.use(express.json());
    this.app.use(morgan('dev'));
  }

  async routes() {
    for (const { url, router } of ApiPaths) {
      const route = await import(`../router/${router}`);
      this.app.use(`/api${url}`, route.default);
    }
  }

  async graphql() {
    this.apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
    });

    await this.apolloServer.start();
    this.app.use(
      '/graphql',
      express.json(),
      expressMiddleware(this.apolloServer, {
        context: async ({ req }) => {
          let authHeader =
            req.headers.authorization || req.headers.Authorization;

          if (Array.isArray(authHeader)) {
            authHeader = authHeader[0];
          }

          const token =
            typeof authHeader === 'string' &&
            authHeader.startsWith('Bearer ')
              ? authHeader.split(' ')[1]
              : null;

          if (!token) return { user: null };

          try {
            const decoded = jwt.verify(token, Config.jwtSecret) as {
              userId: number;
            };
            const user = await User.findByPk(decoded.userId);
            if (!user) return { user: null };

            return { user };
          } catch {
            return { user: null };
          }
        },
      })
    );

    console.log('🚀 GraphQL endpoint listo en /graphql');
  }

  async listen() {
    if (Config.dev) {
      this.server.listen(this.port, () => {
        console.log('Servidor corriendo en el puerto', this.port);
      });
    } else {
      const httpsServer = https.createServer(this.app);
      httpsServer.listen(Config.port, () => {
        console.log(`HTTPS Server running on port ${Config.port}`);
      });
    }
  }
}

export default Server;
