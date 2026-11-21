import { NavigatorScreenParams } from '@react-navigation/native';
import { Clase } from '../types';

// Qué parámetros recibe cada pantalla. TypeScript avisa si una navegación manda datos incorrectos.
export type AuthStackParams = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParams = {
  // Las tabs pueden recibir a cuál ir (por ejemplo, "Mis clases" del alumno al terminar la clase).
  Tabs: NavigatorScreenParams<TabsAlumnoParams> | undefined;
  ClassForm: { clase?: Clase } | undefined;
  TeacherSession: { claseId: number; materia: string };
  StudentQueue: { claseId: number; materia: string };
  ClassHistory: { claseId: number; materia: string };
  QrScanner: undefined;
};

// Tabs del alumno (se usan para ir de "Mis clases" a "Unirse").
export type TabsAlumnoParams = {
  MisClasesAlumno: undefined;
  // materia: aviso de a qué clase en curso quiere entrar (D32).
  Unirse: { materia?: string } | undefined;
  Perfil: undefined;
};
