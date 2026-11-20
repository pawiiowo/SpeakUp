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
