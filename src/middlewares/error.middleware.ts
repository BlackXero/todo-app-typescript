import { Request, Response, NextFunction } from 'express';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).render('error', {
    title: '404 - Page Not Found',
    statusCode: 404,
    message: `The requested page '${req.originalUrl}' could not be found.`,
  });
}

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('Unhandled Server Error:', err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).render('error', {
    title: `${statusCode} - Server Error`,
    statusCode,
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected internal error occurred. Please try again later.'
      : err.message || 'Internal Server Error',
  });
}
