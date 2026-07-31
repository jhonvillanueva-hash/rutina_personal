import type { Etiqueta } from '../types/etiqueta';

export const listarEtiquetas = async (): Promise<Etiqueta[]> => {
  const response = await fetch('/api/etiquetas');
  if (!response.ok) {
    throw new Error('Error al listar etiquetas');
  }
  return response.json();
};

export const crearEtiqueta = async (etiqueta: Omit<Etiqueta, 'id' | 'created_at'>): Promise<Etiqueta> => {
  const response = await fetch('/api/etiquetas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(etiqueta),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al crear etiqueta');
  }
  return response.json();
};

export const actualizarEtiqueta = async (id: number, etiqueta: Partial<Omit<Etiqueta, 'id' | 'created_at'>>): Promise<Etiqueta> => {
  const response = await fetch(`/api/etiquetas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(etiqueta),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al actualizar etiqueta');
  }
  return response.json();
};

export const eliminarEtiqueta = async (id: number): Promise<void> => {
  const response = await fetch(`/api/etiquetas/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al eliminar etiqueta');
  }
};