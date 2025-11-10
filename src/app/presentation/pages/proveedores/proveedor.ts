
export interface Proveedor {
  id?: string;
  razonSocial: string;
  ruc: string;
  telefono: string;
  correoContacto: string;
  country?: string;
  estado: 'Activo' | 'Inactivo';
  certificacionesVigentes: string[];
}
