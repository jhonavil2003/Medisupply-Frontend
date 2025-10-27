export interface Producto {
  codigo: string;
  nombre: string;
  categoria: string;
  proveedor: string;
  estado: 'Disponible' | 'No disponible';
}
