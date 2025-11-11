/**
 * Entidad de dominio: Meta de Venta (Salesperson Goal)
 * Representa una meta de ventas asignada a vendedores por producto
 * Basado en la tabla salesperson_goals del backend
 */
export interface MetaVentaEntity {
  readonly id?: number;
  readonly idVendedor: string;          // employee_id del vendedor
  readonly idProducto: string;          // SKU del producto
  readonly region: Region;
  readonly trimestre: Trimestre;
  readonly valorObjetivo: number;
  readonly tipo: TipoMeta;
  readonly fechaCreacion?: string;      // ISO 8601 string
  readonly fechaActualizacion?: string; // ISO 8601 string
  readonly vendedor?: VendedorInfo;     // Información del vendedor (eager loading)
  readonly producto?: ProductoInfo;     // Información del producto (desde catalog-service)
}

/**
 * Información del vendedor incluida en la meta
 */
export interface VendedorInfo {
  readonly employeeId: string;
  readonly nombreCompleto: string;
  readonly email: string;
}

/**
 * Información del producto incluida en la meta
 */
export interface ProductoInfo {
  readonly sku: string;
  readonly name: string | null;
  readonly description: string | null;
  readonly unitPrice: number | null;
  readonly isActive: boolean | null;
}

export enum TipoMeta {
  UNIDADES = 'unidades',
  MONETARIO = 'monetario'
}

export enum Trimestre {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4'
}

export enum Region {
  NORTE = 'Norte',
  SUR = 'Sur',
  OESTE = 'Oeste',
  ESTE = 'Este'
}

/**
 * DTO para creación de meta
 */
export interface CreateMetaVentaDto {
  idVendedor: string;
  idProducto: string;
  region: Region;
  trimestre: Trimestre;
  valorObjetivo: number;
  tipo: TipoMeta;
}

/**
 * DTO para actualización de meta
 */
export interface UpdateMetaVentaDto {
  id: number;
  idVendedor?: string;
  idProducto?: string;
  region?: Region;
  trimestre?: Trimestre;
  valorObjetivo?: number;
  tipo?: TipoMeta;
}
