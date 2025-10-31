export interface ProductoLocalizacion {
  codigoInterno: string;
  sku: string;
  nombre: string;
  codigoBarrasQR: string;
  ubicacion: {
    pasillo: string;
    estanteria: string;
    nivel: string;
    posicion: string;
    zona: 'refrigerado' | 'ambiente';
    camara?: string;
    estadoCamara?: string;
  };
  cantidad: number;
  lote: string;
  fechaVencimiento: string; // ISO
  temperatura: string; // ej: '2-8°C'
  estadoCamara?: string;
  historialUbicaciones?: Array<{
    fecha: string;
    ubicacion: string;
    cantidad: number;
  }>;
}