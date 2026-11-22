const { Pool, types } = require('pg');
require('dotenv').config();

// Las fechas se guardan como TIMESTAMP (sin zona horaria) con NOW() de Supabase, que trabaja en UTC (D37).
// Por defecto, pg las leería como hora local de la computadora del servidor (Tijuana, UTC-8) y todas
// quedarían 8 horas adelantadas. Aquí se indica que esas fechas están en UTC.
const TIMESTAMP_SIN_ZONA = 1114;
types.setTypeParser(TIMESTAMP_SIN_ZONA, (texto) => new Date(texto.replace(' ', 'T') + 'Z'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;