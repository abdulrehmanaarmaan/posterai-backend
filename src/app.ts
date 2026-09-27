import express, { RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { env } from './config/env.js';

import authRoutes
  from './modules/auth/auth.route.js';

import templateRoutes
  from './modules/template/template.route.js';

import uploadRoutes
  from './modules/upload/upload.route.js';

import posterRoutes
  from './modules/poster/poster.route.js';

import {
  notFoundMiddleware
} from './middleware/not-found.middleware.js';

import {
  errorMiddleware
} from './middleware/error.middleware.js';
import { databaseMiddleware } from './middleware/database.middleware.js';

const app = express();

// helmet's NodeNext type declarations are broken (see helmetjs/helmet#414, #438, #441)
// — this is a documented upstream issue, not a config problem.
const helmetMiddleware = helmet as unknown as () => RequestHandler;

app.use(helmetMiddleware());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);

app.use(
  express.json({
    limit: '1mb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb'
  })
);

app.get(
  '/',
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'AI Political Poster Maker API is healthy.',
      data: {
        environment: env.NODE_ENV
      }
    });
  }
);

app.use(databaseMiddleware);

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/templates',
  templateRoutes
);

app.use(
  '/api/upload',
  uploadRoutes
);

app.use(
  '/api/posters',
  posterRoutes
);

app.use(
  notFoundMiddleware
);

app.use(
  errorMiddleware
);

export default app;