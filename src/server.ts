import { app } from './app';
import { env } from './env';

app
  .listen({
    host: env.HOST,
    port: +env.PORT,
  })
  .then(() => {
    console.log('Server HTTP running! 🚀');
    console.log(`${env.HOST}:${env.PORT}`);
  });
