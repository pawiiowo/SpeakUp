// Punto de entrada del servidor: carga la configuración, revisa que esté completa y abre el puerto.
require('dotenv').config();

// Sin JWT_SECRET los tokens se firmarían con una clave que cualquiera puede leer en el código.
// Es mejor no arrancar y avisar qué falta.
if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en backend/.env. Copia backend/.env.example y llénalo.');
  process.exit(1);
}

const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
