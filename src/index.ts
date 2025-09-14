import { app } from '../api/index';

const start = async () => {
  try {
    const port = process.env.PORT || 3333;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port: Number(port), host });

    console.log(`🚀 Server running on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
