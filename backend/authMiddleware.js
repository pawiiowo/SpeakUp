const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto');
    req.usuario = verificado;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Devuelve un middleware que solo deja pasar a usuarios con el rol indicado.
// Debe usarse después de verificarToken, que es quien llena req.usuario.
function exigirRol(rol) {
  return (req, res, next) => {
    if (req.usuario.rol !== rol) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta acción.' });
    }
    next();
  };
}

module.exports = { verificarToken, exigirRol };