import * as readline from 'readline';
import { hashPassword } from '../src/lib/auth/password';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔐 Generator hash hasła administratora\n');
console.log('Wprowadź hasło (min. 8 znaków, zalecane: 12+ znaków z mix liter/cyfr/symboli)\n');

rl.question('Hasło: ', async (password: string) => {
  try {
    if (!password || password.length < 8) {
      console.error('\n❌ Hasło musi mieć co najmniej 8 znaków!\n');
      rl.close();
      process.exit(1);
    }
    
    console.log('\n🔐 Generowanie hash...\n');
    
    const hash = await hashPassword(password);
    
    console.log('✅ Hash wygenerowany pomyślnie!\n');
    console.log('📋 Skopiuj poniższą linię do pliku .env:\n');
    console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
    console.log('⚠️  WAŻNE: Usuń starą zmienną ADMIN_PASSWORD z .env!');
    console.log('⚠️  WAŻNE: Nie commituj tego hash do repozytorium!\n');
    
    rl.close();
  } catch (error) {
    console.error('\n❌ Błąd:', error instanceof Error ? error.message : String(error), '\n');
    rl.close();
    process.exit(1);
  }
});
