// Entry point of the application.
// Starts the server and listens for incoming requests.

import { app } from './app.js';
import { createConnection } from './config/db.js';
import { PORT } from './config/config.js';
import logger from './config/logger.js';

// Connect to the database
(async () => await createConnection())();

app.listen(PORT, () => {
  logger.info(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
