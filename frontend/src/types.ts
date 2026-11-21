// Forma de los datos que responde el backend (ver specs/features/F03 y F05).

export type Rol = 'profesor' | 'alumno';

export type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
};

export type Clase = {
  id: number;
  codigo: string;
  materia: string;
  activa: boolean;
  fila_pausada: boolean;
  fecha_creacion: string;
  // Si ya se impartió alguna vez; entonces su materia ya no se edita (D35).
  tiene_sesiones: boolean;
};

// Lo que ve el alumno: nunca incluye nombres de otros alumnos (D08).
export type FilaAlumno = {
  clase: { id: number; materia: string; activa: boolean };
  mi_turno: { estado: 'en_espera' | 'hablando'; posicion: number | null } | null;
  en_espera: number;
  alguien_hablando: boolean;
};

// Lo que ve el docente dueño de la clase.
export type FilaDocente = {
  clase: { id: number; materia: string; codigo: string; activa: boolean };
  hablando: { turno_id: number; nombre: string; fecha_inicio: string } | null;
  en_espera: { turno_id: number; nombre: string; posicion: number }[];
};

// "Mis clases" del alumno (F08).
export type ClaseAlumno = {
  id: number;
  materia: string;
  activa: boolean;
  ultima_sesion: string | null;
  // Si ya entró hoy con el QR o el código (D32).
  entrada_hoy: boolean;
};

// Una sesión del historial del alumno (F08).
export type SesionHistorial = {
  id: number;
  numero: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  en_curso: boolean;
  participaciones: number;
};

export type PaginaSesiones = {
  sesiones: SesionHistorial[];
  hay_mas: boolean;
};
