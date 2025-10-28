/**
 * Entidad de dominio: Meta de Venta
 * Representa una meta de ventas asignada a productos, regiones o vendedores
 */
export interface MetaVentaEntity {
  readonly id?: number;
  readonly producto: string;
  readonly region: string;
  readonly trimestre: Trimestre;
  readonly valorObjetivo: number;
  readonly tipo: TipoMeta;
  readonly fechaCreacion?: Date;
  readonly usuarioResponsable: string;
  readonly editable: boolean;
  readonly vendedorId?: string;
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

/**
 * Objeto de valor para la creación de una meta
 */
export interface CreateMetaVentaDto {
  producto: string;
  region: string;
  trimestre: Trimestre;
  valorObjetivo: number;
  tipo: TipoMeta;
  usuarioResponsable: string;
  editable?: boolean;
  vendedorId?: string;
}

/**
 * Objeto de valor para la actualización de una meta
 */
export interface UpdateMetaVentaDto extends Partial<CreateMetaVentaDto> {
  id: number;
}

/**
 * Resultado de comparación de meta vs resultado real
 */
export interface ComparacionMetaResultado {
  meta: number;
  resultado: number;
  cumplido: boolean;
  porcentajeCumplimiento: number;
}
