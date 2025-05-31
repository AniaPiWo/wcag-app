import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function testDatabaseConnection() {
  try {

    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Połączenie z bazą danych udane!');
    console.log('Wynik:', result);
    return true;
  } catch (error) {
    console.error('Błąd połączenia z bazą danych:', error);
    return false;
  }
}


testDatabaseConnection().catch(console.error);
