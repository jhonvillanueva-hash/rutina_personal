import type { Actividad } from '../types/actividad';

export const listarActividades = async (etiquetaId?: number): Promise<Actividad[]> => {
  let url = '/api/actividades';
  if (etiquetaId !== undefined) {
    url += `?etiqueta_id=${etiquetaId}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error al listar actividades');
  }
  return response.json();
};

export const crearActividad = async (actividad: Omit<Actividad, 'id' | 'created_at'>): Promise<Actividad> => {
  const response = await fetch('/api/actividades', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(actividad),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al crear actividad');
  }
  return response.json();
};

export const actualizarActividad = async (id: number, actividad: Partial<Omit<Actividad, 'id' | 'created_at'>>): Promise<Actividad> => {
  const response = await fetch(`/api/actividades/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(actividad),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al actualizar actividad');
  }
  return response.json();
};

export const eliminarActividad = async (id: number): Promise<void> => {
  const response = await fetch(`/api/actividades/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al eliminar actividad');
  }
};