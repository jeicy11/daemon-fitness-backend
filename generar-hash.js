// Uso: node generar-hash.js "TuClaveReal123!"
// Imprime el hash bcrypt correspondiente para pegarlo en la base de datos.
const bcrypt = require('bcrypt');

const clave = process.argv[2];
if (!clave) {
  console.error('Uso: node generar-hash.js "TuClaveReal123!"');
  process.exit(1);
}

bcrypt.hash(clave, 10).then((hash) => {
  console.log('Hash generado:');
  console.log(hash);
});