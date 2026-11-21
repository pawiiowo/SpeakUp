import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Ejecuta "tarea" en cuanto la pantalla se ve y después cada "intervaloMs" (polling, D22).
// Se detiene cuando la pantalla deja de verse (otra pantalla encima, o la app en segundo plano
// al cambiar de pantalla), para no gastar datos ni batería.
// Si una consulta tarda más que el intervalo, no se manda otra encima.
export function usePolling(tarea: () => Promise<void>, intervaloMs = 3000) {
  const tareaActual = useRef(tarea);
  tareaActual.current = tarea;

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      let enCurso = false;

      const ejecutar = async () => {
        if (!activo || enCurso) return;
        enCurso = true;
        try {
          await tareaActual.current();
        } finally {
          enCurso = false;
        }
      };

      void ejecutar();
      const id = setInterval(ejecutar, intervaloMs);
      return () => {
        activo = false;
        clearInterval(id);
      };
    }, [intervaloMs])
  );
}
