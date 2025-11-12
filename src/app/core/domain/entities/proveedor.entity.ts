export interface ProveedorEntity {
  readonly id?: string;
  readonly razonSocial: string;
  readonly ruc: string;
  readonly telefono: string;
  readonly correoContacto: string;
  readonly country?: string;
  readonly website?: string;
  readonly addressLine1?: string;
  readonly city?: string;
  readonly state?: string;
  readonly paymentTerms?: string;
  readonly creditLimit?: number;
  readonly currency?: string;
  readonly estado: EstadoProveedor;
  readonly certificacionesVigentes: string[];
  readonly fechaRegistro?: Date;
  readonly fechaActualizacion?: Date;
}

export enum EstadoProveedor {
  ACTIVO = 'Activo',
  INACTIVO = 'Inactivo',
  SUSPENDIDO = 'Suspendido'
}

export interface CreateProveedorDto {
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
  estado: EstadoProveedor;
  certificacionesVigentes: string[];
}

export interface UpdateProveedorDto extends Partial<CreateProveedorDto> {
  id: string;
}
