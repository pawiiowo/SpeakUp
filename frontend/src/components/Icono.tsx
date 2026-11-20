import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

export type NombreIcono = 'clases' | 'perfil' | 'unirse' | 'mas' | 'cerrar';

type Props = { nombre: NombreIcono; color: string; tamano?: number };

// Íconos de línea dibujados con SVG (estilo Feather, licencia MIT), para no usar emojis
// ni agregar otra librería de íconos.
export default function Icono({ nombre, color, tamano = 24 }: Props) {
  const trazo = { stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24">
      {nombre === 'clases' && (
        <>
          <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" {...trazo} />
          <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" {...trazo} />
        </>
      )}
      {nombre === 'perfil' && (
        <>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" {...trazo} />
          <Circle cx="12" cy="7" r="4" {...trazo} />
        </>
      )}
      {nombre === 'unirse' && (
        <>
          <Path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" {...trazo} />
          <Polyline points="10 17 15 12 10 7" {...trazo} />
          <Line x1="15" y1="12" x2="3" y2="12" {...trazo} />
        </>
      )}
      {nombre === 'mas' && (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" {...trazo} />
          <Line x1="5" y1="12" x2="19" y2="12" {...trazo} />
        </>
      )}
      {nombre === 'cerrar' && (
        <>
          <Line x1="18" y1="6" x2="6" y2="18" {...trazo} />
          <Line x1="6" y1="6" x2="18" y2="18" {...trazo} />
        </>
      )}
    </Svg>
  );
}
