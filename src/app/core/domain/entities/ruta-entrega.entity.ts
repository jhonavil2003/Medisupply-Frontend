/**
 * Entidad de dominio: Ruta de Entrega
 * Representa una ruta de entrega de productos
 */
export interface RutaEntregaEntity {
  readonly id: string;
  readonly fecha: string;
  readonly estado: EstadoRuta;
  readonly vehiculos: string[];
  readonly conductor: string;
  readonly pedidos: PedidoEntrega[];
}

export enum EstadoRuta {
  PENDIENTE = 'pendiente',
  EN_CURSO = 'en_curso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada'
}

export interface PedidoEntrega {
  readonly id: string;
  readonly destino: string;
  readonly detalle: string;
  readonly estado: EstadoPedido;
  readonly fechaEntrega?: string;
  readonly observaciones?: string;
}

export enum EstadoPedido {
  PENDIENTE = 'pendiente',
  EN_RUTA = 'en_ruta',
  ENTREGADO = 'entregado',
  FALLIDO = 'fallido'
}

/**
 * Objeto de valor para la creación de una ruta
 */
export interface CreateRutaEntregaDto {
  fecha: string;
  vehiculos: string[];
  conductor: string;
  pedidos: CreatePedidoDto[];
}

export interface CreatePedidoDto {
  destino: string;
  detalle: string;
}

/**
 * Objeto de valor para la actualización de una ruta
 */
export interface UpdateRutaEntregaDto {
  id: string;
  estado?: EstadoRuta;
  pedidos?: PedidoEntrega[];
}
