const fs = require('fs');
const path = require('path');

// Ścieżka do pliku
const filePath = path.join(__dirname, 'src', 'app', 'admin', 'manual-audits', 'edit', '[id]', 'page.tsx');

// Odczytaj zawartość pliku
let content = fs.readFileSync(filePath, 'utf8');

// Popraw handler dla poziomu zaawansowanego
content = content.replace(
  "onChange={(e) => updateAuditItem('intermediate', item.id, 'notes', e.target.value)}",
  "onChange={(e) => updateAuditItem('advanced', item.id, 'notes', e.target.value)}"
);

// Zapisz zmiany
fs.writeFileSync(filePath, content, 'utf8');

console.log('Poprawiono handlery w pliku page.tsx');
