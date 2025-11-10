
export interface Proveedor {
  id?: string;
  razonSocial: string;
  ruc: string;
  telefono: string;
  correoContacto: string;
  country?: string;
  website?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  paymentTerms?: string;
  creditLimit?: number;
  currency?: string;
  estado: 'Activo' | 'Inactivo';
  certificacionesVigentes: string[];
}
