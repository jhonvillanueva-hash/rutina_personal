class HistorialRutina {
  constructor(id, etiqueta_nombre, fecha, hora_inicio, hora_fin, duracion_total_segundos, estado, created_at) {
    this.id = id;
    this.etiqueta_nombre = etiqueta_nombre;
    this.fecha = fecha;
    this.hora_inicio = hora_inicio;
    this.hora_fin = hora_fin;
    this.duracion_total_segundos = duracion_total_segundos;
    this.estado = estado;
    this.created_at = created_at;
  }

  static fromRow(row) {
    return new HistorialRutina(
      row.id,
      row.etiqueta_nombre,
      row.fecha,
      row.hora_inicio,
      row.hora_fin,
      row.duracion_total_segundos,
      row.estado,
      row.created_at
    );
  }
}

module.exports = HistorialRutina;
