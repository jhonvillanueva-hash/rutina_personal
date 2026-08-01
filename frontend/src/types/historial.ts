export interface HistorialRutina {
  id: number;
  etiqueta_nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_total_segundos: number;
  estado: 'Completada' | 'Cancelada';
  created_at: string;
}

export type CrearHistorialRutina = Omit<HistorialRutina, 'id' | 'created_at'>;
