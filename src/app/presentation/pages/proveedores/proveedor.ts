
export interface Proveedor {
  razonSocial: string;
  ruc: string;
  telefono: string;
  correoContacto: string;
  estado: 'Activo' | 'Inactivo';
  certificacionesVigentes: string[];
}
