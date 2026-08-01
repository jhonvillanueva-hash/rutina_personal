import type { CrearHistorialRutina, HistorialRutina } from '../types/historial';

export const listarHistorial = async (): Promise<HistorialRutina[]> => {
  const response = await fetch('/api/historial');
  if (!response.ok) {
    throw new Error('Error al listar el historial');
  }
  return response.json();
};

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
