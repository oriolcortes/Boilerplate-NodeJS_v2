// Entry point of the application.
// Starts the server and listens for incoming requests.

import { app } from './app.js';
import { PORT } from './config/config.js';
import logger from './config/logger.js';

app.listen(PORT, () => {
  logger.info(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
