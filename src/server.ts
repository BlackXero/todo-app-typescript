import app from './app';
import { config } from './config';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Todo App server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`⚙️  Environment: ${config.nodeEnv}`);
  console.log(`===============================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
