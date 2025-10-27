export interface RutaEntrega {
  id: string;
  fecha: string; // ISO
  estado: 'pendiente' | 'en_curso' | 'completada';
  vehiculos: string[];
  conductor: string;
  pedidos: PedidoEntrega[];
}

export interface PedidoEntrega {
  id: string;
  destino: string;
  detalle: string;
  estado: 'pendiente' | 'en_ruta' | 'entregado';
}