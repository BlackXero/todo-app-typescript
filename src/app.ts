/// <reference path="./@types/express-session.d.ts" />
import express, { Application } from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import path from 'path';
import fs from 'fs';
import methodOverride from 'method-override';
import routes from './routes';
import { populateLocals } from './middlewares/auth.middleware';
import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware';
import { config } from './config';

const app: Application = express();

// Determine views and public directory paths (works seamlessly in both ts-node and compiled dist)
const viewsPath = fs.existsSync(path.join(__dirname, 'views'))
  ? path.join(__dirname, 'views')
  : path.join(__dirname, '../src/views');

const publicPath = fs.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : path.join(__dirname, '../src/public');

// View engine configuration (EJS)
app.set('view engine', 'ejs');
app.set('views', viewsPath);

// Static assets
app.use(express.static(publicPath));

// Request parsing middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session middleware
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// Flash messages middleware
app.use(flash());

// Custom locals middleware for template rendering
app.use(populateLocals);

// Mount main routes
app.use(routes);

// Error handling middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
