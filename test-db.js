// Prosty skrypt do testowania połączenia z bazą danych
const { PrismaClient } = require('@prisma/client');

// Tworzymy instancję Prisma
const prisma = new PrismaClient();

// Testujemy połączenie
async function testConnection() {
  try {
    console.log('Sprawdzanie połączenia z bazą danych...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Połączenie z bazą danych udane!');
    console.log('Wynik:', result);
  } catch (error) {
    console.error('Błąd połączenia z bazą danych:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Uruchom test
testConnection();
