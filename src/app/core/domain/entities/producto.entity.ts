/**
 * Entidad de dominio: Producto
 * Representa un producto médico en el sistema
 */
export interface ProductoEntity {
  readonly id?: string;
  readonly codigo: string;
  readonly nombre: string;
  readonly categoria: string;
  readonly proveedorId: string;
  readonly proveedor?: string; // Nombre del proveedor (desnormalizado)
  readonly estado: EstadoProducto;
  readonly precio?: number;
  readonly stock?: number;
  readonly fechaRegistro?: Date;
  readonly fechaActualizacion?: Date;
}

export enum EstadoProducto {
  DISPONIBLE = 'Disponible',
  NO_DISPONIBLE = 'No disponible',
  AGOTADO = 'Agotado',
  DESCONTINUADO = 'Descontinuado'
}

/**
 * Objeto de valor para la creación de un producto
 */
export interface CreateProductoDto {
  codigo: string;
  nombre: string;
  categoria: string;
  proveedorId: string;
  estado: EstadoProducto;
  precio?: number;
  stock?: number;
}

/**
 * Objeto de valor para la actualización de un producto
 */
export interface UpdateProductoDto extends Partial<CreateProductoDto> {
  id: string;
}
