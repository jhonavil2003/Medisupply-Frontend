/**
 * Entidad de dominio: Vendedor
 * Representa un vendedor en el sistema
 */
export interface VendedorEntity {
  readonly id?: string;
  readonly documento: string;
  readonly nombre: string;
  readonly correo: string;
  readonly telefono: string;
  readonly region: string;
  readonly activo?: boolean;
  readonly fechaIngreso?: Date;
  readonly fechaActualizacion?: Date;
}

/**
 * Objeto de valor para la creación de un vendedor
 */
export interface CreateVendedorDto {
  documento: string;
  nombre: string;
  correo: string;
  telefono: string;
  region: string;
  activo?: boolean;
}

/**
 * Objeto de valor para la actualización de un vendedor
 */
export interface UpdateVendedorDto extends Partial<CreateVendedorDto> {
  id: string;
}
