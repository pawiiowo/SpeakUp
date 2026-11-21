import { Clase } from '../types';

// Qué parámetros recibe cada pantalla. TypeScript avisa si una navegación manda datos incorrectos.
export type AuthStackParams = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParams = {
  Tabs: undefined;
  ClassForm: { clase?: Clase } | undefined;
  TeacherSession: { claseId: number; materia: string };
  StudentQueue: { claseId: number; materia: string };
  ClassHistory: { claseId: number; materia: string };
};

// Tabs del alumno (se usan para ir de "Mis clases" a "Unirse").
export type TabsAlumnoParams = {
  MisClasesAlumno: undefined;
  Unirse: undefined;
  Perfil: undefined;
};
