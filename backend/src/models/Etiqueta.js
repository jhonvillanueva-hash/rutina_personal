class Etiqueta {
  constructor(id, nombre, duracion_segundos, created_at) {
    this.id = id;
    this.nombre = nombre;
    this.duracion_segundos = duracion_segundos;
    this.created_at = created_at;
  }

  static fromRow(row) {
    return new Etiqueta(row.id, row.nombre, row.duracion_segundos, row.created_at);
  }
}

module.exports = Etiqueta;