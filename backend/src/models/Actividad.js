class Actividad {
  constructor(id, nombre, etiqueta_id, created_at) {
    this.id = id;
    this.nombre = nombre;
    this.etiqueta_id = etiqueta_id;
    this.created_at = created_at;
  }

  static fromRow(row) {
    return new Actividad(row.id, row.nombre, row.etiqueta_id, row.created_at);
  }
}

module.exports = Actividad;