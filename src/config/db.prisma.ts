// Handles database connection and configuration.
// This file is responsible for setting up and exporting the Prisma client instance.

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const createConnection = async () => {
  try {
    await prisma.$connect();
    console.log('INFO Connected to the DB');
  } catch (error) {
    console.log('ERROR Cannot connect to the DB: ', error);
  }
};

process.on('SIGINT', async () => {
  console.log('INFO Closing the DB connection');
  await prisma.$disconnect();
  process.exit(0);
});
