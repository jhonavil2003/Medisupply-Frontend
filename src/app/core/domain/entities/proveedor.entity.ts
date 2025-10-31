export interface ProveedorEntity {
  readonly id?: string;
  readonly razonSocial: string;
  readonly ruc: string;
  readonly telefono: string;
  readonly correoContacto: string;
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
  estado: EstadoProveedor;
  certificacionesVigentes: string[];
}

export interface UpdateProveedorDto extends Partial<CreateProveedorDto> {
  id: string;
}
