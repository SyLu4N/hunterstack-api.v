import { app } from '../api/index';
import { env } from './env';

const start = async () => {
  try {
    const port = process.env.PORT || 3333;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port: Number(port), host });

    if (env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server running on http://${host}:${port}`);
    } else {
      app.log.info(`🚀 Server ready at http://${host}:${port}`);
    }
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
