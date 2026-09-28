const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function crearTablas() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Tablas creadas exitosamente en Supabase');
  } catch (error) {
    console.error('Error al crear tablas:', error);
  } finally {
    pool.end();
  }
}

crearTablas();