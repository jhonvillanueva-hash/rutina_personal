import type { CrearHistorialRutina, HistorialRutina } from '../types/historial';

export const crearRegistroHistorial = async (payload: CrearHistorialRutina): Promise<HistorialRutina> => {
  const response = await fetch('/api/historial', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al guardar registro de historial');
  }
  return response.json();
};
