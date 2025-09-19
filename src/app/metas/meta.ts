export interface MetaVenta {
  id: number;
  producto: string; // o string[] si es selección múltiple
  region: string;   // o string[] si es selección múltiple
  trimestre: string;
  valorObjetivo: number;
  tipo: 'unidades' | 'monetario';
  fechaCreacion: Date;
  usuarioResponsable: string;
  editable: boolean;
}
