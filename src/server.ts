import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';

const startServer = async () => {
  await connectDatabase();

  app.listen(
    env.PORT,
    () => {
      console.log(
        `Server running on http://localhost:${env.PORT}`
      );
    }
  );
};

startServer().catch(error => {
  console.error(
    'Failed to start server:',
    error
  );

  process.exit(1);
});